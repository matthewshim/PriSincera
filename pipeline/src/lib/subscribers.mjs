/**
 * PriSignal 구독자 관리 — Firestore 기반 (v2)
 *
 * v1: GCS JSON + ETag 잠금
 * v2: Firestore 네이티브 (트랜잭션, 쿼리, 실시간 지원)
 *     GCS는 Firestore 미활성 시 폴백으로 유지
 *
 * Firestore 컬렉션: subscribers/{emailHash}
 *   - email, status, subscribedAt, source, unsubscribedAt
 *
 * 기능:
 * - getActiveSubscribers()      — 활성 구독자 이메일 목록
 * - addSubscriber(email)        — 구독 추가 (중복 확인)
 * - removeSubscriber(email)     — 구독 해지
 * - getSubscriberStats()        — 통계 (Admin 용)
 * - getSubscribersPaginated()   — 페이지네이션 조회 (Admin 용)
 * - generateUnsubToken(email)   — HMAC 해지 토큰 생성
 * - verifyUnsubToken(email, t)  — 토큰 검증
 */
import { createHmac, createHash } from 'crypto';

// ─── Firestore 초기화 (실패 시 GCS 폴백) ─────────

let db = null;
let COLLECTIONS = null;
let useFirestore = false;

try {
  const mod = await import('./firestore.mjs');
  db = mod.db;
  COLLECTIONS = mod.COLLECTIONS;
  useFirestore = true;
} catch (e) {
  console.warn('[Subscribers] Firestore 미사용 — GCS JSON 폴백 모드');
}

// ─── GCS 폴백 (기존 v1 로직) ─────────────────────

let storage = null;
try {
  const { Storage } = await import('@google-cloud/storage');
  storage = new Storage();
} catch (e) { /* 로컬에서는 무시 */ }

const BUCKET = process.env.GCS_BUCKET || 'prisincera-prisignal-data';
const SUBSCRIBERS_PATH = 'subscribers/active.json';

function getUnsubSecret() {
  return process.env.UNSUBSCRIBE_SECRET || '';
}

// ─── 유틸리티 ────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_RE.test(email.trim().toLowerCase());
}

function emailHash(email) {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex').slice(0, 16);
}

// ─── Firestore 구현 ──────────────────────────────

async function fsGetActiveSubscribers() {
  const snap = await db.collection(COLLECTIONS.SUBSCRIBERS)
    .where('status', '==', 'active')
    .get();
  return snap.docs.map(d => d.data().email);
}

async function fsAddSubscriber(email, source = 'website') {
  email = email.trim().toLowerCase();
  const docRef = db.collection(COLLECTIONS.SUBSCRIBERS).doc(emailHash(email));
  const doc = await docRef.get();

  if (doc.exists) {
    const data = doc.data();
    if (data.status === 'active') {
      return { code: 'already_subscribed', email };
    }
    // 해지된 구독자 재활성화
    await docRef.update({
      status: 'active',
      subscribedAt: new Date(),
      unsubscribedAt: null,
    });
    console.log(`[Subscribers] 재구독: ${email}`);
    return { code: 'resubscribed', email };
  }

  await docRef.set({
    email,
    status: 'active',
    subscribedAt: new Date(),
    source,
  });
  console.log(`[Subscribers] 구독 추가: ${email} (${source})`);
  return { code: 'subscribed', email };
}

async function fsRemoveSubscriber(email) {
  email = email.trim().toLowerCase();
  const docRef = db.collection(COLLECTIONS.SUBSCRIBERS).doc(emailHash(email));
  const doc = await docRef.get();

  if (!doc.exists || doc.data().status === 'unsubscribed') {
    return { code: 'not_found', email };
  }

  await docRef.update({
    status: 'unsubscribed',
    unsubscribedAt: new Date(),
  });
  console.log(`[Subscribers] 구독 해지: ${email}`);
  return { code: 'unsubscribed', email };
}

async function fsGetSubscriberStats() {
  const col = db.collection(COLLECTIONS.SUBSCRIBERS);
  const activeSnap = await col.where('status', '==', 'active').count().get();
  const totalSnap = await col.count().get();
  const unsubSnap = await col.where('status', '==', 'unsubscribed').count().get();

  return {
    active: activeSnap.data().count,
    total: totalSnap.data().count,
    unsubscribed: unsubSnap.data().count,
  };
}

async function fsGetSubscribersPaginated({ limit = 20, startAfter = null, status = null } = {}) {
  let query = db.collection(COLLECTIONS.SUBSCRIBERS).orderBy('subscribedAt', 'desc');

  if (status) {
    query = query.where('status', '==', status);
  }
  if (startAfter) {
    query = query.startAfter(startAfter);
  }
  query = query.limit(limit);

  const snap = await query.get();
  return {
    subscribers: snap.docs.map(d => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
    hasMore: snap.docs.length === limit,
  };
}

// ─── GCS 폴백 구현 (v1 호환) ─────────────────────

async function gcsReadSubscribersWithGen() {
  if (!storage) throw new Error('GCS not available');
  const file = storage.bucket(BUCKET).file(SUBSCRIBERS_PATH);
  try {
    const [metadata] = await file.getMetadata();
    const [content] = await file.download();
    return { data: JSON.parse(content.toString('utf-8')), generation: Number(metadata.generation) };
  } catch (err) {
    if (err.code === 404) {
      return { data: { version: 1, updatedAt: new Date().toISOString(), subscribers: [] }, generation: 0 };
    }
    throw err;
  }
}

async function gcsWriteSubscribers(data, expectedGeneration) {
  data.updatedAt = new Date().toISOString();
  const file = storage.bucket(BUCKET).file(SUBSCRIBERS_PATH);
  const options = { contentType: 'application/json', metadata: { cacheControl: 'no-cache' } };
  if (expectedGeneration > 0) {
    options.preconditionOpts = { ifGenerationMatch: expectedGeneration };
  }
  try {
    await file.save(JSON.stringify(data, null, 2), options);
  } catch (err) {
    if (err.code === 412) throw new Error('CONCURRENT_MODIFICATION');
    throw err;
  }
}

async function gcsGetActiveSubscribers() {
  const { data } = await gcsReadSubscribersWithGen();
  return (data.subscribers || []).filter(s => s.status === 'active').map(s => s.email);
}

async function gcsAddSubscriber(email, source = 'website') {
  email = email.trim().toLowerCase();
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, generation } = await gcsReadSubscribersWithGen();
    const existing = data.subscribers.find(s => s.email === email);
    if (existing) {
      if (existing.status === 'active') return { code: 'already_subscribed', email };
      existing.status = 'active';
      existing.subscribedAt = new Date().toISOString();
      existing.unsubscribedAt = null;
    } else {
      data.subscribers.push({ email, status: 'active', subscribedAt: new Date().toISOString(), source });
    }
    try {
      await gcsWriteSubscribers(data, generation);
      return { code: existing ? 'resubscribed' : 'subscribed', email };
    } catch (err) {
      if (err.message.startsWith('CONCURRENT_MODIFICATION') && attempt < 2) continue;
      throw err;
    }
  }
}

async function gcsRemoveSubscriber(email) {
  email = email.trim().toLowerCase();
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, generation } = await gcsReadSubscribersWithGen();
    const existing = data.subscribers.find(s => s.email === email);
    if (!existing || existing.status === 'unsubscribed') return { code: 'not_found', email };
    existing.status = 'unsubscribed';
    existing.unsubscribedAt = new Date().toISOString();
    try {
      await gcsWriteSubscribers(data, generation);
      return { code: 'unsubscribed', email };
    } catch (err) {
      if (err.message.startsWith('CONCURRENT_MODIFICATION') && attempt < 2) continue;
      throw err;
    }
  }
}

// ─── 공개 API (Firestore 우선, GCS 폴백) ─────────

export async function getActiveSubscribers() {
  return useFirestore ? fsGetActiveSubscribers() : gcsGetActiveSubscribers();
}

export async function addSubscriber(email, source = 'website') {
  email = (email || '').trim().toLowerCase();
  if (!validateEmail(email)) return { code: 'invalid_email', email };
  return useFirestore ? fsAddSubscriber(email, source) : gcsAddSubscriber(email, source);
}

export async function removeSubscriber(email) {
  email = (email || '').trim().toLowerCase();
  return useFirestore ? fsRemoveSubscriber(email) : gcsRemoveSubscriber(email);
}

export async function getAllSubscribers() {
  if (useFirestore) {
    const snap = await db.collection(COLLECTIONS.SUBSCRIBERS).get();
    return { subscribers: snap.docs.map(d => d.data()) };
  }
  const { data } = await gcsReadSubscribersWithGen();
  return data;
}

/** Admin 전용 — 구독자 통계 */
export async function getSubscriberStats() {
  if (!useFirestore) {
    const { data } = await gcsReadSubscribersWithGen();
    const subs = data.subscribers || [];
    return {
      active: subs.filter(s => s.status === 'active').length,
      total: subs.length,
      unsubscribed: subs.filter(s => s.status === 'unsubscribed').length,
    };
  }
  return fsGetSubscriberStats();
}

/** Admin 전용 — 페이지네이션 조회 */
export async function getSubscribersPaginated(options) {
  if (!useFirestore) throw new Error('Firestore 미활성: 페이지네이션 미지원');
  return fsGetSubscribersPaginated(options);
}

// ─── 구독 해지 토큰 (변경 없음) ──────────────────

export function generateUnsubToken(email) {
  let secret = getUnsubSecret();
  if (!secret) {
    // 환경변수 미설정 시 폴백: 앱이 중단되지 않도록 경고만 출력
    console.warn('[Subscribers] ⚠️ UNSUBSCRIBE_SECRET 미설정 — 기본 폴백 시크릿 사용');
    secret = 'prisincera-default-unsub-secret-fallback';
  }
  email = (email || '').trim().toLowerCase();
  return createHmac('sha256', secret).update(email).digest('hex');
}

export function verifyUnsubToken(email, token) {
  if (!getUnsubSecret() || !email || !token) return false;
  const expected = generateUnsubToken(email);
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

export function buildUnsubscribeUrl(email) {
  email = (email || '').trim().toLowerCase();
  try {
    const token = generateUnsubToken(email);
    return `https://www.prisincera.com/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
  } catch (err) {
    console.error('[Subscribers] buildUnsubscribeUrl 실패:', err.message);
    return `https://www.prisincera.com/prisignal`;
  }
}

export { BUCKET, SUBSCRIBERS_PATH, validateEmail, useFirestore };
