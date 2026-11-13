// Waymark 서버 API (/api/waymark) — M1-A 결정 코어
// 패턴: 클라이언트 Auth(Bearer) → 이 라우터(requireAuth) → firebase-admin Firestore.
// firestore.rules가 waymark_* 클라이언트 직접 접근을 차단하므로 모든 쓰기는 여기로만.
// 정본: docs/waymark/mvp_build_plan.md §3 · system_architecture.md §3
import express from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { db, auth } from './pipeline/src/lib/firestore.mjs';
import {
  COLLECTIONS, DOMAINS, EMOTIONS, OUTCOMES, DECISION_STATUS, TONES,
  CADENCE_FACTORS, BASE_SCHEDULE_DAYS, LIMITS,
  isDomain, isEmotion, isImportance,
} from './src/data/waymarkModel.mjs';

const router = express.Router();

// ── 인증: Bearer → uid
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ code: 'unauthorized', error: 'Unauthorized' });
  }
  try {
    const decoded = await auth.verifyIdToken(header.slice('Bearer '.length));
    req.uid = decoded.uid;
    req.email = decoded.email || null;
    next();
  } catch {
    res.status(401).json({ code: 'unauthorized', error: 'Invalid or expired token' });
  }
}

// ── 검증
const asArray = (v, max = 20) => (Array.isArray(v) ? v.slice(0, max).map((x) => String(x).trim()).filter(Boolean) : []);
const clampStr = (v, max) => String(v ?? '').trim().slice(0, max);

function validateDecision(body) {
  const errors = [];
  const title = clampStr(body.title, LIMITS.title);
  const context = clampStr(body.context, LIMITS.context);
  const chosen = clampStr(body.chosen, LIMITS.title);
  if (!title) errors.push('title');
  if (!context) errors.push('context');
  if (!chosen) errors.push('chosen');
  if (!isDomain(body.domain)) errors.push('domain');
  if (!isImportance(body.importance)) errors.push('importance');
  const emotionTags = asArray(body.emotionTags, 6).filter(isEmotion);
  if (emotionTags.length === 0) errors.push('emotionTags');
  const clean = {
    title, context, chosen,
    options: asArray(body.options, 10),
    emotionTags,
    domain: body.domain,
    importance: Number(body.importance),
    reversible: Boolean(body.reversible),
    tagsKeywords: asArray(body.tagsKeywords, 20),
  };
  return { ok: errors.length === 0, errors, clean };
}

// 감정 → 기본 동반 톤 (M1-A 규칙; 전체 4톤 라이브러리는 M1-C)
function defaultTone(emotionTags = []) {
  const s = new Set(emotionTags);
  if (s.has('anxiety') || s.has('fear')) return 'comfort';
  if (s.has('confusion')) return 'clarify';
  if (s.has('confidence') || s.has('excitement')) return 'cheer';
  return 'comfort';
}

// 먼저 찾아옴 이벤트 스케줄 생성 (functional_spec §6) — 데이터만. 발송 Job은 M1-B.
function buildEvents(uid, decisionId, importance, cadence) {
  const base = BASE_SCHEDULE_DAYS[importance] || BASE_SCHEDULE_DAYS[2];
  const factor = CADENCE_FACTORS[cadence] ?? CADENCE_FACTORS.normal;
  const now = Date.now();
  const toneByType = { checkin: 'comfort', midterm: 'clarify', retro: 'clarify' };
  const out = [];
  for (const type of ['checkin', 'midterm', 'retro']) {
    const days = base[type];
    if (days == null) continue;
    out.push({
      uid, decisionId, type,
      tone: toneByType[type],
      scheduledAt: new Date(now + Math.round(days * factor) * 86400000),
      status: 'scheduled',
      channels: ['email', 'push'],
      sentAt: null, respondedAt: null,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  return out;
}

// ── POST /decisions — 생성 + T+0 지지 메시지 + 이벤트 스케줄
router.post('/decisions', requireAuth, async (req, res) => {
  const { ok, errors, clean } = validateDecision(req.body || {});
  if (!ok) return res.status(400).json({ code: 'invalid', errors });
  try {
    // cadence는 사용자 설정(waymark_users)에서. 없으면 normal.
    let cadence = 'normal';
    const prof = await db.collection(COLLECTIONS.users).doc(req.uid).get();
    if (prof.exists && prof.data().cadence) cadence = prof.data().cadence;

    const batch = db.batch();
    const ref = db.collection(COLLECTIONS.decisions).doc();
    batch.set(ref, {
      uid: req.uid,
      ...clean,
      status: 'open',
      outcome: null, outcomeNote: null, emotionNow: [],
      decidedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    // T+0 동반 메시지: 텍스트는 저장하지 않고 templateId+vars로 — 클라가 i18n 렌더(LLM 0)
    const tone = defaultTone(clean.emotionTags);
    const msgRef = ref.collection(COLLECTIONS.decisionMessages).doc();
    batch.set(msgRef, {
      type: 'nudge', tone, templateId: `nudge.${tone}`, source: 'template',
      vars: { title: clean.title }, createdAt: FieldValue.serverTimestamp(),
    });
    // 먼저 찾아옴 이벤트
    for (const ev of buildEvents(req.uid, ref.id, clean.importance, cadence)) {
      batch.set(db.collection(COLLECTIONS.events).doc(), ev);
    }
    await batch.commit();
    res.status(201).json({ id: ref.id });
  } catch (err) {
    console.error('[Waymark] create decision:', err.message);
    res.status(500).json({ code: 'server_error', error: '결정 저장 중 오류가 발생했습니다.' });
  }
});

// ── GET /decisions — 타임라인 (최신순, status/domain 필터)
router.get('/decisions', requireAuth, async (req, res) => {
  try {
    // 복합 인덱스 회피: uid 단일 필터로 가져와 JS에서 필터·정렬(dogfooding 규모). 프로덕션은 인덱스.
    const snap = await db.collection(COLLECTIONS.decisions).where('uid', '==', req.uid).get();
    let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (DECISION_STATUS.includes(req.query.status)) rows = rows.filter((r) => r.status === req.query.status);
    if (isDomain(req.query.domain)) rows = rows.filter((r) => r.domain === req.query.domain);
    const ms = (ts) => (ts && ts.toMillis ? ts.toMillis() : 0);
    rows.sort((a, b) => ms(b.createdAt) - ms(a.createdAt));
    res.json({ decisions: rows.slice(0, Math.min(Number(req.query.limit) || 30, 100)) });
  } catch (err) {
    console.error('[Waymark] list decisions:', err.message);
    res.status(500).json({ code: 'server_error', error: '목록을 불러오지 못했습니다.' });
  }
});

// 소유 검증 공통
async function ownDecision(uid, id) {
  const ref = db.collection(COLLECTIONS.decisions).doc(id);
  const doc = await ref.get();
  if (!doc.exists || doc.data().uid !== uid) return null;
  return { ref, doc };
}

// ── GET /decisions/:id — 상세 + 동반 메시지 타임라인
router.get('/decisions/:id', requireAuth, async (req, res) => {
  try {
    const owned = await ownDecision(req.uid, req.params.id);
    if (!owned) return res.status(404).json({ code: 'not_found' });
    const msgs = await owned.ref.collection(COLLECTIONS.decisionMessages).orderBy('createdAt', 'asc').get();
    res.json({
      decision: { id: owned.doc.id, ...owned.doc.data() },
      messages: msgs.docs.map((m) => ({ id: m.id, ...m.data() })),
    });
  } catch (err) {
    console.error('[Waymark] get decision:', err.message);
    res.status(500).json({ code: 'server_error', error: '결정을 불러오지 못했습니다.' });
  }
});

// ── PATCH /decisions/:id — 회고/결과·상태 전이
router.patch('/decisions/:id', requireAuth, async (req, res) => {
  try {
    const owned = await ownDecision(req.uid, req.params.id);
    if (!owned) return res.status(404).json({ code: 'not_found' });
    const patch = { updatedAt: FieldValue.serverTimestamp() };
    if (req.body.outcome !== undefined) {
      if (!OUTCOMES.includes(req.body.outcome)) return res.status(400).json({ code: 'invalid', errors: ['outcome'] });
      patch.outcome = req.body.outcome;
    }
    if (req.body.outcomeNote !== undefined) patch.outcomeNote = clampStr(req.body.outcomeNote, LIMITS.context);
    if (req.body.emotionNow !== undefined) patch.emotionNow = asArray(req.body.emotionNow, 6).filter(isEmotion);
    if (req.body.status !== undefined) {
      if (!['revisited', 'closed'].includes(req.body.status)) return res.status(400).json({ code: 'invalid', errors: ['status'] });
      patch.status = req.body.status;
    }
    const batch = db.batch();
    batch.update(owned.ref, patch);
    // closed → 잔여 scheduled 이벤트 취소
    if (patch.status === 'closed') {
      const pend = await db.collection(COLLECTIONS.events)
        .where('decisionId', '==', req.params.id).where('status', '==', 'scheduled').get();
      pend.forEach((e) => batch.update(e.ref, { status: 'canceled' }));
    }
    await batch.commit();
    res.json({ ok: true });
  } catch (err) {
    console.error('[Waymark] patch decision:', err.message);
    res.status(500).json({ code: 'server_error', error: '저장 중 오류가 발생했습니다.' });
  }
});

// ── POST /decisions/:id/messages — 사용자 메모
router.post('/decisions/:id/messages', requireAuth, async (req, res) => {
  const text = clampStr(req.body?.text, LIMITS.context);
  if (!text) return res.status(400).json({ code: 'invalid', errors: ['text'] });
  try {
    const owned = await ownDecision(req.uid, req.params.id);
    if (!owned) return res.status(404).json({ code: 'not_found' });
    const ref = await owned.ref.collection(COLLECTIONS.decisionMessages).add({
      type: 'user_note', text, createdAt: FieldValue.serverTimestamp(),
    });
    res.status(201).json({ id: ref.id });
  } catch (err) {
    console.error('[Waymark] add message:', err.message);
    res.status(500).json({ code: 'server_error', error: '메모 저장 중 오류가 발생했습니다.' });
  }
});

// ── GET /events/upcoming — 홈 '다가온 먼저찾아옴'(도래분)
router.get('/events/upcoming', requireAuth, async (req, res) => {
  try {
    // 복합 인덱스 회피: uid 단일 필터 후 JS에서 status·도래 필터·정렬.
    const snap = await db.collection(COLLECTIONS.events).where('uid', '==', req.uid).get();
    const now = Date.now();
    const due = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((e) => e.status === 'scheduled' && e.scheduledAt && e.scheduledAt.toMillis && e.scheduledAt.toMillis() <= now)
      .sort((a, b) => a.scheduledAt.toMillis() - b.scheduledAt.toMillis())
      .slice(0, 20);
    // 결정 제목 조인
    const titles = {};
    await Promise.all([...new Set(due.map((e) => e.decisionId))].map(async (did) => {
      const d = await db.collection(COLLECTIONS.decisions).doc(did).get();
      if (d.exists && d.data().uid === req.uid) titles[did] = d.data().title;
    }));
    res.json({ events: due.map((e) => ({ ...e, decisionTitle: titles[e.decisionId] || null })) });
  } catch (err) {
    console.error('[Waymark] upcoming events:', err.message);
    res.status(500).json({ code: 'server_error', error: '알림을 불러오지 못했습니다.' });
  }
});

// ── POST /events/:id/respond — 응답 처리
router.post('/events/:id/respond', requireAuth, async (req, res) => {
  try {
    const ref = db.collection(COLLECTIONS.events).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists || doc.data().uid !== req.uid) return res.status(404).json({ code: 'not_found' });
    await ref.update({ status: 'responded', respondedAt: FieldValue.serverTimestamp() });
    res.json({ ok: true });
  } catch (err) {
    console.error('[Waymark] respond event:', err.message);
    res.status(500).json({ code: 'server_error', error: '처리 중 오류가 발생했습니다.' });
  }
});

// ── GET /me — Waymark 설정(제품 전용). 정체성은 공통 프로필(별도).
router.get('/me', requireAuth, async (req, res) => {
  try {
    const doc = await db.collection(COLLECTIONS.users).doc(req.uid).get();
    const defaults = { quietStart: '22:00', quietEnd: '08:00', cadence: 'normal', pushEnabled: false, emailOptIn: true };
    res.json({ settings: doc.exists ? { ...defaults, ...doc.data() } : defaults });
  } catch (err) {
    console.error('[Waymark] get me:', err.message);
    res.status(500).json({ code: 'server_error', error: '설정을 불러오지 못했습니다.' });
  }
});

// ── PATCH /me — 설정 저장
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const patch = { updatedAt: FieldValue.serverTimestamp() };
    const b = req.body || {};
    const hhmm = (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(v));
    if (b.quietStart !== undefined && hhmm(b.quietStart)) patch.quietStart = b.quietStart;
    if (b.quietEnd !== undefined && hhmm(b.quietEnd)) patch.quietEnd = b.quietEnd;
    if (b.cadence !== undefined && Object.keys(CADENCE_FACTORS).includes(b.cadence)) patch.cadence = b.cadence;
    if (b.pushEnabled !== undefined) patch.pushEnabled = Boolean(b.pushEnabled);
    if (b.emailOptIn !== undefined) patch.emailOptIn = Boolean(b.emailOptIn);
    await db.collection(COLLECTIONS.users).doc(req.uid).set(patch, { merge: true });
    res.json({ ok: true });
  } catch (err) {
    console.error('[Waymark] patch me:', err.message);
    res.status(500).json({ code: 'server_error', error: '설정 저장 중 오류가 발생했습니다.' });
  }
});

export default router;
