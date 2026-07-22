/**
 * Daily Digest 구독자 관리 — Firestore 기반 (v2)
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
import { db, COLLECTIONS } from './firestore.mjs';

function getUnsubSecret() {
  return process.env.UNSUBSCRIBE_SECRET || '';
}

// ─── 유틸리티 ────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_RE.test(email.trim().toLowerCase());
}

function emailHash(email) {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex').slice(0, 16);
}

// ─── 공개 API ──────────────────────────────

export async function getActiveSubscribers() {
  const snap = await db.collection(COLLECTIONS.SUBSCRIBERS)
    .where('status', '==', 'active')
    .get();

  if (snap.empty) {
    console.log('[Subscribers] Firestore에 활성 구독자가 없습니다.');
    return [];
  }

  return snap.docs.map(d => d.data().email);
}

export async function addSubscriber(email, source = 'website') {
  email = (email || '').trim().toLowerCase();
  if (!validateEmail(email)) return { code: 'invalid_email', email };

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

export async function removeSubscriber(email) {
  email = (email || '').trim().toLowerCase();
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

export async function getAllSubscribers() {
  const snap = await db.collection(COLLECTIONS.SUBSCRIBERS).get();
  return { subscribers: snap.docs.map(d => {
    const data = d.data();
    // Firestore Timestamp → ISO string 변환
    if (data.subscribedAt && typeof data.subscribedAt.toDate === 'function') {
      data.subscribedAt = data.subscribedAt.toDate().toISOString();
    }
    if (data.unsubscribedAt && typeof data.unsubscribedAt.toDate === 'function') {
      data.unsubscribedAt = data.unsubscribedAt.toDate().toISOString();
    }
    return data;
  }) };
}

/** Admin 전용 — 구독자 통계 */
export async function getSubscriberStats() {
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

/** Admin 전용 — 페이지네이션 조회 */
export async function getSubscribersPaginated({ limit = 20, startAfter = null, status = null } = {}) {
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

// ─── 구독 해지 토큰 ───────────────────────────────

export function generateUnsubToken(email) {
  let secret = getUnsubSecret();
  if (!secret) {
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
    return `https://www.prisincera.com/relearn`;
  }
}
