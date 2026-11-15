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
    if (b.locale !== undefined && ['ko', 'en', 'ja'].includes(b.locale)) patch.locale = b.locale;
    if (b.onboarded === true) patch.onboardedAt = FieldValue.serverTimestamp();
    await db.collection(COLLECTIONS.users).doc(req.uid).set(patch, { merge: true });
    res.json({ ok: true });
  } catch (err) {
    console.error('[Waymark] patch me:', err.message);
    res.status(500).json({ code: 'server_error', error: '설정 저장 중 오류가 발생했습니다.' });
  }
});

// ── GET /notifications — 알림 센터(최신순) + 미읽음 수
router.get("/notifications", requireAuth, async (req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.notifications).where("uid", "==", req.uid).get();
    const ms = (ts) => (ts && ts.toMillis ? ts.toMillis() : 0);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((x, y) => ms(y.createdAt) - ms(x.createdAt));
    res.json({ notifications: rows.slice(0, 50), unread: rows.filter((r) => !r.read).length });
  } catch (err) {
    console.error("[Waymark] list notifications:", err.message);
    res.status(500).json({ code: "server_error", error: "알림을 불러오지 못했습니다." });
  }
});

// ── POST /notifications/:id/read — 읽음(또는 id=all 전체 읽음)
router.post("/notifications/:id/read", requireAuth, async (req, res) => {
  try {
    if (req.params.id === "all") {
      const snap = await db.collection(COLLECTIONS.notifications).where("uid", "==", req.uid).get();
      const batch = db.batch(); let n = 0;
      snap.forEach((d) => { if (!d.data().read) { batch.update(d.ref, { read: true }); n++; } });
      if (n) await batch.commit();
      return res.json({ ok: true, updated: n });
    }
    const ref = db.collection(COLLECTIONS.notifications).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists || doc.data().uid !== req.uid) return res.status(404).json({ code: "not_found" });
    await ref.update({ read: true });
    res.json({ ok: true });
  } catch (err) {
    console.error("[Waymark] read notification:", err.message);
    res.status(500).json({ code: "server_error", error: "처리 중 오류가 발생했습니다." });
  }
});

// ── 체험 AI (Groq 프록시 · per-user 캡 · 가드레일) — M1-C.1 ──
const AI_CAP = 20;
const AI_PERIOD_MS = 30 * 24 * 60 * 60 * 1000; // 체험 캡 롤링 창(30일)
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const CRISIS_RE = /(자살|목숨을|죽고\s*싶|죽어버리|자해|해치고\s*싶|suicide|kill myself)/i;
const CRISIS_MSG = '지금 많이 힘드신 것 같아요. 혼자 감당하지 마세요. 자살예방상담전화 109(24시간)로 연락하면 도움을 받을 수 있어요. 당신은 혼자가 아니에요.';
const AI_TONE_GUIDE = {
  comfort: '마음을 다독인다. 공감하고 안심시킨다.',
  counsel: '갈래를 짚는 질문을 던진다. 놓친 관점을 함께 본다.',
  cheer: '밀고 갈 힘을 준다. 응원한다.',
  clarify: '생각을 선택지/기준/마음으로 구조화하도록 돕는다.',
};
function buildAiSystem(tone) {
  return [
    '너는 Waymark, 결정의 갈림길에서 곁을 지키는 동반자다.',
    '규칙: (1) 절대 대신 결정하지 않는다 — 선택은 사용자 몫으로 돌려준다. (2) 3~4문장으로 짧고 담백하게. 과장/클리셰 금지. (3) 한국어로 따뜻하게. (4) 강요하지 않는다.',
    '이번 결: ' + (AI_TONE_GUIDE[tone] || AI_TONE_GUIDE.comfort),
    '마지막 문장은 결정을 사용자에게 돌려주는 말로 닫는다.',
  ].join('\n');
}

// POST /ai/companion — 체험 AI(Groq)
router.post('/ai/companion', requireAuth, async (req, res) => {
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ code: 'ai_unavailable' });
  const tone = TONES.includes(req.body && req.body.tone) ? req.body.tone : 'comfort';
  try {
    const owned = await ownDecision(req.uid, req.body && req.body.decisionId);
    if (!owned) return res.status(404).json({ code: 'not_found' });
    const dec = owned.doc.data();

    const usageRef = db.collection(COLLECTIONS.aiUsage).doc(req.uid);
    const uSnap = await usageRef.get();
    const uData = uSnap.exists ? uSnap.data() : null;
    const psMs = uData && uData.periodStart && uData.periodStart.toMillis ? uData.periodStart.toMillis() : null;
    const windowActive = psMs !== null && (Date.now() - psMs) < AI_PERIOD_MS;
    const used = windowActive ? (uData.trialCallsUsed || 0) : 0;
    if (used >= AI_CAP) return res.status(402).json({ code: 'cap_exceeded', remaining: 0 });

    const ctx = String(dec.context || '').slice(0, 1500);
    if (CRISIS_RE.test(dec.title + ' ' + ctx)) {
      const cRef = owned.ref.collection(COLLECTIONS.decisionMessages).doc();
      await cRef.set({ type: 'ai', tone, source: 'trial_ai', text: CRISIS_MSG, crisis: true, createdAt: FieldValue.serverTimestamp() });
      return res.json({ id: cRef.id, text: CRISIS_MSG, tone, remaining: AI_CAP - used, crisis: true });
    }

    const userMsg = '결정: ' + dec.title + '\n상황: ' + ctx + '\n지금 감정: ' + (dec.emotionTags || []).join(', ');
    let gr;
    try {
      gr = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.GROQ_API_KEY },
        body: JSON.stringify({ model: GROQ_MODEL, reasoning_effort: 'low', temperature: 0.7, max_tokens: 500, messages: [{ role: 'system', content: buildAiSystem(tone) }, { role: 'user', content: userMsg }] }),
      });
    } catch (e) { console.error('[Waymark] groq fetch:', e.message); return res.status(502).json({ code: 'ai_error' }); }
    if (!gr.ok) { console.error('[Waymark] groq status ' + gr.status); return res.status(502).json({ code: 'ai_error' }); }
    const data = await gr.json();
    let text = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim();
    if (!text) return res.status(502).json({ code: 'ai_empty' });
    if (CRISIS_RE.test(text)) text = CRISIS_MSG;

    const msgRef = owned.ref.collection(COLLECTIONS.decisionMessages).doc();
    await msgRef.set({ type: 'ai', tone, source: 'trial_ai', text, createdAt: FieldValue.serverTimestamp() });
    const usageWrite = { trialCallsUsed: used + 1, lastCallAt: FieldValue.serverTimestamp() };
    if (!windowActive) usageWrite.periodStart = FieldValue.serverTimestamp();
    await usageRef.set(usageWrite, { merge: true });
    res.json({ id: msgRef.id, text, tone, remaining: AI_CAP - (used + 1) });
  } catch (err) {
    console.error('[Waymark] ai companion:', err.message);
    res.status(500).json({ code: 'server_error', error: 'AI 응답 중 오류가 발생했습니다.' });
  }
});

// GET /ai/usage — 체험 남은 횟수
router.get('/ai/usage', requireAuth, async (req, res) => {
  try {
    const uSnap = await db.collection(COLLECTIONS.aiUsage).doc(req.uid).get();
    const uData = uSnap.exists ? uSnap.data() : null;
    const psMs = uData && uData.periodStart && uData.periodStart.toMillis ? uData.periodStart.toMillis() : null;
    const windowActive = psMs !== null && (Date.now() - psMs) < AI_PERIOD_MS;
    const used = windowActive ? (uData.trialCallsUsed || 0) : 0;
    res.json({ remaining: Math.max(0, AI_CAP - used), cap: AI_CAP, resetAt: windowActive ? psMs + AI_PERIOD_MS : null, available: !!process.env.GROQ_API_KEY });
  } catch (err) {
    res.status(500).json({ code: 'server_error' });
  }
});

// POST /decisions/:id/ai-message — BYOK로 클라가 생성한 AI 텍스트 저장(서버는 AI 미호출)
router.post("/decisions/:id/ai-message", requireAuth, async (req, res) => {
  const text = clampStr(req.body && req.body.text, 4000);
  const tone = TONES.includes(req.body && req.body.tone) ? req.body.tone : "comfort";
  if (!text) return res.status(400).json({ code: "invalid", errors: ["text"] });
  try {
    const owned = await ownDecision(req.uid, req.params.id);
    if (!owned) return res.status(404).json({ code: "not_found" });
    const provider = ["anthropic", "gemini"].includes(req.body && req.body.provider) ? req.body.provider : null;
    const ref = await owned.ref.collection(COLLECTIONS.decisionMessages).add({ type: "ai", tone, source: "byok", provider, text, createdAt: FieldValue.serverTimestamp() });
    res.status(201).json({ id: ref.id });
  } catch (err) {
    console.error("[Waymark] byok message:", err.message);
    res.status(500).json({ code: "server_error", error: "저장 중 오류가 발생했습니다." });
  }
});

// GET /home — 사이드바 통합(결정+도래이벤트+미읽음) 1콜 (요청 수 절감)
router.get('/home', requireAuth, async (req, res) => {
  try {
    const [decSnap, evSnap, notiSnap] = await Promise.all([
      db.collection(COLLECTIONS.decisions).where('uid', '==', req.uid).get(),
      db.collection(COLLECTIONS.events).where('uid', '==', req.uid).get(),
      db.collection(COLLECTIONS.notifications).where('uid', '==', req.uid).get(),
    ]);
    const ms = (ts) => (ts && ts.toMillis ? ts.toMillis() : 0);
    const decisions = decSnap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => ms(b.createdAt) - ms(a.createdAt)).slice(0, 100);
    const now = Date.now();
    const titles = {};
    decisions.forEach((d) => { titles[d.id] = d.title; });
    const due = evSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .filter((e) => e.status === 'scheduled' && e.scheduledAt && e.scheduledAt.toMillis && e.scheduledAt.toMillis() <= now)
      .sort((a, b) => a.scheduledAt.toMillis() - b.scheduledAt.toMillis()).slice(0, 20)
      .map((e) => ({ ...e, decisionTitle: titles[e.decisionId] || null }));
    const unread = notiSnap.docs.filter((n) => !n.data().read).length;
    res.json({ decisions, events: due, unread });
  } catch (err) {
    console.error('[Waymark] home:', err.message);
    res.status(500).json({ code: 'server_error', error: '불러오지 못했습니다.' });
  }
});

export default router;
