/**
 * Admin API 라우터 — PriSignal 관리 대시보드 백엔드
 *
 * 엔드포인트:
 *   GET  /admin/api/auth/verify     — Firebase ID 토큰 검증
 *   GET  /admin/api/stats           — 구독자 통계
 *   GET  /admin/api/subscribers     — 구독자 목록 (페이지네이션)
 *   POST /admin/api/subscribers/export — CSV 내보내기
 *   POST /admin/api/email/send-test — 테스트 이메일 발송
 *   GET  /admin/api/pipeline/status — 파이프라인 상태
 *   GET  /admin/api/email/logs      — 이메일 발송 이력
 *
 * 모든 /admin/api/* 요청은 Firebase Auth ID 토큰 검증을 거칩니다.
 */
import { Router } from 'express';

const router = Router();

// ─── Firebase Auth 미들웨어 ──────────────────────

async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  try {
    const { auth } = await import('./pipeline/src/lib/firestore.mjs');
    const token = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(token);

    // Admin 이메일 화이트리스트
    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'matthew.shim@prisincera.com').split(',');
    if (!ADMIN_EMAILS.includes(decoded.email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.adminUser = decoded;
    next();
  } catch (err) {
    console.error('[Admin Auth] Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// 모든 admin API에 인증 적용
router.use(requireAdmin);

// ─── 인증 확인 ───────────────────────────────────

router.get('/auth/verify', (req, res) => {
  res.json({
    authenticated: true,
    email: req.adminUser.email,
    uid: req.adminUser.uid,
  });
});

// ─── 구독자 통계 ─────────────────────────────────

router.get('/stats', async (req, res) => {
  try {
    const { getSubscriberStats } = await import('./pipeline/src/lib/subscribers.mjs');
    const stats = await getSubscriberStats();

    // 이메일 발송 이력 통계
    let emailStats = { totalSent: 0, lastSentDate: null };
    try {
      const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
      const logsSnap = await db.collection(COLLECTIONS.EMAIL_LOGS)
        .orderBy('sentAt', 'desc')
        .limit(1)
        .get();
      if (!logsSnap.empty) {
        const allLogs = await db.collection(COLLECTIONS.EMAIL_LOGS).count().get();
        emailStats.totalSent = allLogs.data().count;
        emailStats.lastSentDate = logsSnap.docs[0].data().date;
      }
    } catch (e) { /* Firestore 미활성 시 무시 */ }

    res.json({ subscribers: stats, emails: emailStats });
  } catch (err) {
    console.error('[Admin Stats]', err.message);
    res.status(500).json({ error: '통계 조회 실패' });
  }
});

// ─── 구독자 목록 (페이지네이션) ──────────────────

router.get('/subscribers', async (req, res) => {
  try {
    const { getAllSubscribers, getSubscribersPaginated, useFirestore } = await import('./pipeline/src/lib/subscribers.mjs');
    const status = req.query.status || null;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    if (useFirestore) {
      const result = await getSubscribersPaginated({ limit, status });
      // Firestore Timestamp → ISO 변환
      result.subscribers = result.subscribers.map(s => ({
        ...s,
        subscribedAt: s.subscribedAt?.toDate?.() ? s.subscribedAt.toDate().toISOString() : s.subscribedAt,
        unsubscribedAt: s.unsubscribedAt?.toDate?.() ? s.unsubscribedAt.toDate().toISOString() : s.unsubscribedAt,
      }));
      return res.json(result);
    }

    // GCS 폴백
    const data = await getAllSubscribers();
    let subs = data.subscribers || [];
    if (status) subs = subs.filter(s => s.status === status);
    res.json({ subscribers: subs.slice(0, limit), hasMore: subs.length > limit });
  } catch (err) {
    console.error('[Admin Subscribers]', err.message);
    res.status(500).json({ error: '구독자 조회 실패' });
  }
});

// ─── 구독자 CSV 내보내기 ─────────────────────────

router.post('/subscribers/export', async (req, res) => {
  try {
    const { getAllSubscribers } = await import('./pipeline/src/lib/subscribers.mjs');
    const data = await getAllSubscribers();
    const subs = data.subscribers || [];

    const csv = [
      'email,status,subscribedAt,source,unsubscribedAt',
      ...subs.map(s => {
        const subscribedAt = s.subscribedAt?.toDate?.() ? s.subscribedAt.toDate().toISOString() : (s.subscribedAt || '');
        const unsubscribedAt = s.unsubscribedAt?.toDate?.() ? s.unsubscribedAt.toDate().toISOString() : (s.unsubscribedAt || '');
        return `${s.email},${s.status},${subscribedAt},${s.source || ''},${unsubscribedAt}`;
      })
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=subscribers_${new Date().toISOString().slice(0,10)}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('[Admin Export]', err.message);
    res.status(500).json({ error: '내보내기 실패' });
  }
});

// ─── 테스트 이메일 발송 ──────────────────────────

router.post('/email/send-test', async (req, res) => {
  try {
    const { to, date } = req.body || {};
    if (!to) return res.status(400).json({ error: '수신 이메일 필요' });

    const targetDate = date || new Date().toISOString().slice(0, 10);
    console.log(`[Admin] 테스트 이메일 발송 요청: ${to} (${targetDate})`);

    // composer에서 사용하는 동일한 파이프라인으로 테스트 발송
    const { Storage } = await import('@google-cloud/storage');
    const gcs = new Storage();
    const bucket = process.env.GCS_BUCKET || 'prisincera-prisignal-data';

    const [content] = await gcs.bucket(bucket).file(`daily/${targetDate}.json`).download();
    const dailyData = JSON.parse(content.toString('utf-8'));

    const { renderDailyEmail } = await import('./pipeline/src/lib/email-template.mjs');
    const { sendSingle } = await import('./pipeline/src/lib/mailer.mjs');
    const { buildUnsubscribeUrl } = await import('./pipeline/src/lib/subscribers.mjs');

    const unsubUrl = buildUnsubscribeUrl(to);
    const html = renderDailyEmail(dailyData, unsubUrl);
    const subject = `📡 [TEST] PriSignal Daily — ${targetDate}`;

    const result = await sendSingle(to, subject, html);
    res.json({ success: true, messageId: result.messageId });
  } catch (err) {
    console.error('[Admin SendTest]', err.message);
    res.status(500).json({ error: `발송 실패: ${err.message}` });
  }
});

// ─── 이메일 발송 이력 ────────────────────────────

router.get('/email/logs', async (req, res) => {
  try {
    const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    const snap = await db.collection(COLLECTIONS.EMAIL_LOGS)
      .orderBy('sentAt', 'desc')
      .limit(limit)
      .get();

    const logs = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        sentAt: data.sentAt?.toDate?.() ? data.sentAt.toDate().toISOString() : data.sentAt,
      };
    });

    res.json({ logs });
  } catch (err) {
    console.error('[Admin EmailLogs]', err.message);
    res.status(500).json({ error: '발송 이력 조회 실패' });
  }
});

// ─── 파이프라인 상태 ─────────────────────────────

router.get('/pipeline/status', async (req, res) => {
  try {
    const { Storage } = await import('@google-cloud/storage');
    const gcs = new Storage();
    const bucket = process.env.GCS_BUCKET || 'prisincera-prisignal-data';

    // 최근 데일리 인덱스에서 파이프라인 상태 추론
    const [content] = await gcs.bucket(bucket).file('daily/index.json').download();
    const index = JSON.parse(content.toString('utf-8'));
    const dates = index.dates || [];
    const latestDate = dates.length > 0 ? dates[0] : null;

    const today = new Date().toISOString().slice(0, 10);
    const collectorStatus = latestDate === today ? 'success' : 'pending';

    res.json({
      collector: { status: collectorStatus, lastRun: latestDate },
      totalDates: dates.length,
      recentDates: dates.slice(0, 7),
    });
  } catch (err) {
    // index.json 없으면 빈 상태 반환 (파이프라인 미실행)
    if (err.code === 404 || err.message?.includes('No such object')) {
      return res.json({
        collector: { status: 'pending', lastRun: null },
        totalDates: 0,
        recentDates: [],
      });
    }
    console.error('[Admin Pipeline]', err.message);
    res.status(500).json({ error: '파이프라인 상태 조회 실패' });
  }
});

export default router;
