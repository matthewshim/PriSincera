/**
 * Admin API 라우터 — PriSignal 관리 대시보드 백엔드
 *
 * 엔드포인트:
 *   GET  /admin/api/auth/verify     — Firebase ID 토큰 검증 + 역할 반환
 *   GET  /admin/api/stats           — 구독자 통계
 *   GET  /admin/api/subscribers     — 구독자 목록 (페이지네이션)
 *   POST /admin/api/subscribers/export — CSV 내보내기
 *   POST /admin/api/email/send-test — 테스트 이메일 발송
 *   GET  /admin/api/pipeline/status — 파이프라인 상태
 *   GET  /admin/api/email/logs      — 이메일 발송 이력
 *
 *   === Profile (본인) ===
 *   GET  /admin/api/profile         — 본인 프로필 조회
 *   PUT  /admin/api/profile         — 본인 프로필 수정 (이름/비밀번호)
 *
 *   === Admin CRUD (super_admin 전용) ===
 *   GET    /admin/api/admins        — 관리자 목록 조회
 *   POST   /admin/api/admins        — 관리자 생성
 *   PUT    /admin/api/admins/:uid   — 관리자 수정
 *   DELETE /admin/api/admins/:uid   — 관리자 삭제
 *
 * 역할: super_admin (모든 권한) / admin (대시보드 조회만)
 */
import { Router } from 'express';

const router = Router();

// ─── Admin 데이터 레이어 (Firestore) ──────────────

let _adminCache = null;
let _adminCacheTime = 0;
const CACHE_TTL = 60_000;

/** Firestore에서 관리자 맵 조회 { email: { role, addedAt } } */
async function getAdminMap() {
  const now = Date.now();
  if (_adminCache && (now - _adminCacheTime) < CACHE_TTL) return _adminCache;
  try {
    const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
    const doc = await db.collection(COLLECTIONS.ADMIN_CONFIG).doc('settings').get();
    if (doc.exists && doc.data().admins) {
      const adminsObj = doc.data().admins;
      // key→email 맵 변환
      const map = {};
      for (const val of Object.values(adminsObj)) {
        map[val.email] = { role: val.role || 'admin', addedAt: val.addedAt };
      }
      _adminCache = map;
      _adminCacheTime = now;
      return map;
    }
  } catch (e) {
    console.warn('[Admin] Firestore admin map unavailable, using fallback');
  }
  return { 'matthew.shim@prisincera.com': { role: 'super_admin' } };
}

function invalidateAdminCache() { _adminCache = null; _adminCacheTime = 0; }

/** 이메일 → Firestore 키 변환 */
function emailToKey(email) {
  if (typeof email !== 'string') return '';
  return email.replace(/\./g, '_DOT_').replace(/@/g, '_AT_');
}

/** Firestore에 관리자 추가/수정 */
async function upsertAdmin(email, role) {
  const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
  const key = emailToKey(email);
  const adminMap = await getAdminMap();
  const allEmails = Object.keys(adminMap);
  if (!allEmails.includes(email)) allEmails.push(email);
  await db.collection(COLLECTIONS.ADMIN_CONFIG).doc('settings').set({
    admins: { [key]: { email, role, addedAt: new Date() } },
    adminEmails: allEmails,
    updatedAt: new Date(),
  }, { merge: true });
  invalidateAdminCache();
}

/** Firestore에서 관리자 제거 */
async function removeAdmin(email) {
  const { db, COLLECTIONS, } = await import('./pipeline/src/lib/firestore.mjs');
  const { FieldValue } = await import('firebase-admin/firestore');
  const key = emailToKey(email);
  await db.collection(COLLECTIONS.ADMIN_CONFIG).doc('settings').update({
    [`admins.${key}`]: FieldValue.delete(),
    adminEmails: FieldValue.arrayRemove(email),
    updatedAt: new Date(),
  });
  invalidateAdminCache();
}

// ─── 미들웨어 ────────────────────────────────────

async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  try {
    const { auth } = await import('./pipeline/src/lib/firestore.mjs');
    const decoded = await auth.verifyIdToken(authHeader.split('Bearer ')[1]);
    const adminMap = await getAdminMap();
    const adminInfo = adminMap[decoded.email];
    if (!adminInfo) return res.status(403).json({ error: 'Admin access required' });
    req.adminUser = decoded;
    req.adminRole = adminInfo.role; // 'super_admin' | 'admin'
    next();
  } catch (err) {
    console.error('[Admin Auth]', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireSuperAdmin(req, res, next) {
  if (req.adminRole !== 'super_admin') {
    return res.status(403).json({ error: '슈퍼 관리자 권한이 필요합니다' });
  }
  next();
}

router.use(requireAdmin);

// ─── 인증 확인 (역할 포함) ────────────────────────

router.get('/auth/verify', (req, res) => {
  res.json({
    authenticated: true,
    email: req.adminUser.email,
    uid: req.adminUser.uid,
    role: req.adminRole,
  });
});

// ─── 프로필 (본인) ───────────────────────────────

router.get('/profile', async (req, res) => {
  try {
    const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
    const doc = await db.collection(COLLECTIONS.ADMIN_CONFIG).doc('settings').get();
    const key = emailToKey(req.adminUser.email);
    const adminData = doc.exists ? doc.data()?.admins?.[key] : null;
    res.json({
      uid: req.adminUser.uid,
      email: req.adminUser.email,
      displayName: adminData?.displayName || '',
      role: req.adminRole,
      createdAt: null,
      lastSignIn: null,
    });
  } catch (err) {
    console.error('[Admin Profile GET]', err.message);
    res.json({
      uid: req.adminUser.uid,
      email: req.adminUser.email,
      displayName: '',
      role: req.adminRole,
      createdAt: null,
      lastSignIn: null,
    });
  }
});

router.put('/profile', async (req, res) => {
  const { displayName, password } = req.body;
  if ((displayName !== undefined && typeof displayName !== 'string') || 
      (password !== undefined && typeof password !== 'string')) {
    return res.status(400).json({ error: 'Invalid input types' });
  }

  try {
    // 비밀번호 변경은 클라이언트 사이드에서 Firebase REST API로 처리
    // 서버에서는 displayName만 Firestore에 저장
    if (displayName === undefined) {
      return res.status(400).json({ error: '변경할 내용이 없습니다' });
    }
    const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
    const key = emailToKey(req.adminUser.email);
    await db.collection(COLLECTIONS.ADMIN_CONFIG).doc('settings').set({
      admins: { [key]: { displayName, updatedAt: new Date() } },
      updatedAt: new Date(),
    }, { merge: true });
    console.log(`[Admin Profile] Updated displayName for: ${req.adminUser.email}`);
    res.json({
      success: true,
      displayName: displayName || '',
    });
  } catch (err) {
    console.error('[Admin Profile]', err.message);
    res.status(500).json({ error: `프로필 수정 실패: ${err.message}` });
  }
});

// ─── 통계 ─────────────────────────────────────────

router.get('/stats', async (req, res) => {
  try {
    let subscribers = [];
    try {
      const { getAllSubscribers } = await import('./pipeline/src/lib/subscribers.mjs');
      const result = await getAllSubscribers();
      subscribers = result?.subscribers || (Array.isArray(result) ? result : []);
    } catch (subErr) {
      console.warn('[Admin Stats] Subscriber fetch failed:', subErr.message);
    }
    const active = subscribers.filter(s => s.status === 'active').length;
    let totalSent = 0, lastSentDate = null;
    try {
      const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
      const logSnap = await db.collection(COLLECTIONS.EMAIL_LOGS)
        .orderBy('sentAt', 'desc').limit(1).get();
      if (!logSnap.empty) {
        lastSentDate = logSnap.docs[0].data().date;
      }
      const countSnap = await db.collection(COLLECTIONS.EMAIL_LOGS).get();
      totalSent = countSnap.size;
    } catch (_) {}
    res.json({
      subscribers: { total: subscribers.length, active, unsubscribed: subscribers.length - active },
      emails: { totalSent, lastSentDate },
    });
  } catch (err) {
    console.error('[Admin Stats]', err.message);
    // 에러 시에도 빈 데이터로 정상 응답 (대시보드 로딩이 실패하지 않게)
    res.json({
      subscribers: { total: 0, active: 0, unsubscribed: 0 },
      emails: { totalSent: 0, lastSentDate: null },
    });
  }
});

// ─── 구독자 ───────────────────────────────────────

router.get('/subscribers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const { getAllSubscribers } = await import('./pipeline/src/lib/subscribers.mjs');
    const result = await getAllSubscribers();
    const all = result.subscribers || [];
    res.json({ subscribers: all.slice(0, limit), total: all.length });
  } catch (err) {
    console.error('[Admin Subscribers]', err.message);
    res.status(500).json({ error: '구독자 목록 조회 실패' });
  }
});

router.post('/subscribers/export', async (req, res) => {
  try {
    const { getAllSubscribers } = await import('./pipeline/src/lib/subscribers.mjs');
    const result = await getAllSubscribers();
    const all = result.subscribers || [];
    const header = 'email,status,subscribedAt,source\n';
    const rows = all.map(s =>
      `${s.email},${s.status},${s.subscribedAt || ''},${s.source || ''}`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="subscribers_${new Date().toISOString().slice(0,10)}.csv"`);
    res.send('\uFEFF' + header + rows);
  } catch (err) {
    console.error('[Admin Export]', err.message);
    res.status(500).json({ error: 'CSV 내보내기 실패' });
  }
});

// ─── 이메일 ───────────────────────────────────────

router.post('/email/send-test', async (req, res) => {
  try {
    const { to } = req.body || {};
    if (!to) return res.status(400).json({ error: '수신 이메일 필요' });

    // 오늘 날짜 구하기 (KST)
    const { getTodayKST } = await import('./pipeline/src/lib/storage.mjs');
    const todayStr = getTodayKST();

    // 오늘의 PriSignal 아티클 가져오기
    const { getDailySignal } = await import('./pipeline/src/repositories/DailyRepository.mjs');
    const dailyData = await getDailySignal(todayStr);
    const articles = dailyData?.articles || [];

    // 오늘의 PriStudy 문장 가져오기
    const { getStudyContent } = await import('./pipeline/src/repositories/StudyRepository.mjs');
    const studyData = await getStudyContent(todayStr);

    // 오늘의 Pace Note 가져오기 (무작위 3종)
    let paceNotes = [];
    try {
      const { db } = await import('./pipeline/src/lib/firestore.mjs');
      const poolRef = db.collection('config').doc('pacenote_daily_pool');
      const doc = await poolRef.get();
      if (doc.exists && doc.data().pool) {
        const activePool = doc.data().pool.filter(item => item.isActive !== false);
        if (activePool.length > 0) {
          const shuffled = [...activePool].sort(() => 0.5 - Math.random());
          paceNotes = shuffled.slice(0, 3);
        }
      }
    } catch (err) {
      console.error('[Admin Email Test] Pace Note 로딩 실패:', err.message);
    }

    // 최신 빌더스 로그 가져오기
    let latestBuilderLog = null;
    try {
      const buildersLogPath = path.join(__dirname, 'src', 'data', 'buildersLogMeta.json');
      if (fs.existsSync(buildersLogPath)) {
        const logs = JSON.parse(fs.readFileSync(buildersLogPath, 'utf8'));
        if (logs && logs.length > 0) {
          latestBuilderLog = logs[0];
        }
      }
    } catch (err) {
      console.error('[Admin Email Test] 빌더스 로그 로딩 실패:', err.message);
    }

    // 템플릿 렌더링
    const { renderDailyEmail } = await import('./pipeline/src/lib/email-template.mjs');
    const htmlContent = renderDailyEmail({
      date: todayStr,
      articles: articles,
      totalCount: articles.length,
      dailyPageUrl: `https://www.prisincera.com/daily/${todayStr}`,
      unsubscribeUrl: `https://www.prisincera.com/unsubscribe?email=${encodeURIComponent(to)}`,
      studyData: studyData,
      paceNotes: paceNotes,
      latestBuilderLog: latestBuilderLog,
    });

    const { sendEmail } = await import('./pipeline/src/lib/mailer.mjs');
    const result = await sendEmail(
      to,
      `[PriSincera 테스트 발송] 오늘의 템플릿 미리보기`,
      htmlContent,
    );
    res.json({ success: true, messageId: result.messageId });
  } catch (err) {
    console.error('[Admin Email]', err.message);
    res.status(500).json({ error: `이메일 발송 실패: ${err.message}` });
  }
});

router.get('/email/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
    const snap = await db.collection(COLLECTIONS.EMAIL_LOGS)
      .orderBy('sentAt', 'desc').limit(limit).get();
    const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ logs });
  } catch (err) {
    console.error('[Admin EmailLogs]', err.message);
    res.json({ logs: [] });
  }
});

// ─── 파이프라인 ───────────────────────────────────

router.get('/pipeline/status', async (req, res) => {
  try {
    const { getStorage } = await import('firebase-admin/storage');
    const bucketName = process.env.GCS_BUCKET || 'prisincera-prisignal-data';
    let dates = [];
    
    // GCS에서 index.json 시도
    try {
      const bucket = getStorage().bucket(bucketName);
      const [content] = await bucket.file('daily/index.json').download();
      const index = JSON.parse(content.toString('utf-8'));
      dates = index.dates || [];
    } catch (gcsErr) {
      console.warn('[Admin Pipeline] GCS 조회 실패, Firestore email_logs 대체 시도:', gcsErr.message);
      // Fallback: Firestore에서 email_logs를 최근순으로 가져와서 날짜 추출
      const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
      const snap = await db.collection(COLLECTIONS.EMAIL_LOGS)
        .where('date', '>=', '2000-01-01') // date 필드가 있는 문서만
        .orderBy('date', 'desc')
        .limit(30)
        .get();
      dates = snap.docs.map(d => d.data().date);
      // 중복 제거
      dates = [...new Set(dates)];
    }

    const latestDate = dates.length > 0 ? dates[0] : null;

    // KST 기준으로 오늘 날짜 구하기
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const todayStr = kst.toISOString().split('T')[0];

    res.json({
      collector: { status: latestDate === todayStr ? 'success' : 'pending', lastRun: latestDate },
      totalDates: dates.length, // Fallback의 경우 최대 30일 수 있지만 정상 작동 시 전체 수 표시
      recentDates: dates.slice(0, 7),
    });
  } catch (err) {
    console.error('[Admin Pipeline] 상태 조회 완전 실패:', err.message);
    res.json({
      collector: { status: 'pending', lastRun: null },
      totalDates: 0,
      recentDates: [],
      error: err.message
    });
  }
});

// ─── PriStudy 관리 ────────────────────────────────

router.get('/pristudy/stats', async (req, res) => {
  try {
    const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
    const contentSnap = await db.collection(COLLECTIONS.STUDY_CONTENT).count().get();
    const progressSnap = await db.collection('pacenotes').count().get();
    res.json({ 
      totalContent: contentSnap.data().count, 
      totalLearners: progressSnap.data().count 
    });
  } catch (err) {
    console.error('[Admin PriStudy Stats]', err.message);
    res.json({ totalContent: 0, totalLearners: 0 });
  }
});

// ─── 통합 콘텐츠 관리 (Signal + Study) ────────────────────────────────

router.get('/daily/content', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
    
    const [studySnap, signalSnap] = await Promise.all([
      db.collection(COLLECTIONS.STUDY_CONTENT).orderBy('date', 'desc').limit(limit).get(),
      db.collection(COLLECTIONS.DAILY_SIGNALS).orderBy('date', 'desc').limit(limit).get()
    ]);

    const dataMap = {};
    
    studySnap.docs.forEach(doc => {
      dataMap[doc.id] = { date: doc.id, study: doc.data(), signal: { articles: [] } };
    });
    
    signalSnap.docs.forEach(doc => {
      if (!dataMap[doc.id]) {
        dataMap[doc.id] = { date: doc.id, study: {}, signal: doc.data() };
      } else {
        dataMap[doc.id].signal = doc.data();
      }
    });

    const contents = Object.values(dataMap).sort((a, b) => b.date.localeCompare(a.date));
    res.json({ contents });
  } catch (err) {
    res.status(500).json({ error: '콘텐츠 조회 실패' });
  }
});

router.put('/daily/content/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { study, signal } = req.body; // 분리해서 받음
    const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
    
    const batch = db.batch();
    
    if (study && Object.keys(study).length > 0) {
      const studyRef = db.collection(COLLECTIONS.STUDY_CONTENT).doc(date);
      batch.set(studyRef, { ...study, date, updatedAt: new Date() }, { merge: true });
    }
    
    if (signal && Object.keys(signal).length > 0) {
      const signalRef = db.collection(COLLECTIONS.DAILY_SIGNALS).doc(date);
      batch.set(signalRef, { ...signal, date, updatedAt: new Date() }, { merge: true });
    }
    
    await batch.commit();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '수정 실패' });
  }
});

router.post('/daily/content', async (req, res) => {
  try {
    const { date, study, signal } = req.body;
    if (!date) return res.status(400).json({ error: '날짜(date)가 필요합니다' });
    const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
    
    const batch = db.batch();
    
    if (study && Object.keys(study).length > 0) {
      const studyRef = db.collection(COLLECTIONS.STUDY_CONTENT).doc(date);
      batch.set(studyRef, { ...study, date, createdAt: new Date(), updatedAt: new Date() });
    }
    
    if (signal && Object.keys(signal).length > 0) {
      const signalRef = db.collection(COLLECTIONS.DAILY_SIGNALS).doc(date);
      batch.set(signalRef, { ...signal, date, createdAt: new Date(), updatedAt: new Date() });
    }

    await batch.commit();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '등록 실패' });
  }
});

router.get('/pacenotes/users', async (req, res) => {
  try {
    const { db, auth } = await import('./pipeline/src/lib/firestore.mjs');
    
    // Pace Note를 한 번이라도 사용한 유저의 전체 컬렉션 데이터 가져오기
    const userDocsSnap = await db.collection('pacenotes').get();
    const userDocs = userDocsSnap.docs;
    const debugErrors = [];
    
    // 각 유저별 최신 주차 데이터를 Chunk 단위로 병렬 조회
    const CHUNK_SIZE = 50;
    const pacersRaw = [];
    
    for (let i = 0; i < userDocs.length; i += CHUNK_SIZE) {
      const chunk = userDocs.slice(i, i + CHUNK_SIZE);
      const chunkResults = await Promise.all(
        chunk.map(async (docSnap) => {
          try {
            const uid = docSnap.id;
            const userData = docSnap.data() || {};
            const docRef = docSnap.ref;
            
            const weeksSnap = await docRef.collection('weeks')
              .orderBy('weekId', 'desc')
              .limit(1)
              .get();
              
            if (!weeksSnap.empty) {
              const latestWeek = weeksSnap.docs[0].data();
              const currentTasks = latestWeek.currentPace ? latestWeek.currentPace.length : 0;
              const completedTasks = latestWeek.currentPace ? latestWeek.currentPace.filter(t => t.completed).length : 0;
              
              let email = userData.email;
              if (!email) {
                try {
                  const userRec = await auth.getUser(uid);
                  email = userRec.email || '이메일 정보 없음';
                } catch (e) {
                  email = `DB 기록 없음 (에러: ${e.code || e.message})`;
                }
              }
              
              return {
                uid,
                email,
                lastWeekId: latestWeek.weekId,
                currentTasks,
                completedTasks
              };
            }
          } catch (e) {
            console.error(`Error fetching for uid ${docRef.id}:`, e);
            debugErrors.push({ uid: docRef.id, error: e.message });
          }
          return null;
        })
      );
      pacersRaw.push(...chunkResults);
    }
    

    
    const pacers = pacersRaw.filter(p => p !== null);
    
    // 접속 주차 최신순 정렬, 주차가 같으면 이메일 오름차순
    pacers.sort((a, b) => {
      if (b.lastWeekId !== a.lastWeekId) {
        return b.lastWeekId.localeCompare(a.lastWeekId);
      }
      return a.email.localeCompare(b.email);
    });
    
    res.json({ pacers, debug: { totalDocs: userDocs.length, innerErrors: debugErrors } });
  } catch (err) {
    console.error('[Admin API] Pacers Fetch Error:', err);
    res.status(500).json({ error: `Pace Note 사용자 조회 실패: ${err.message}` });
  }
});

router.get('/pacenotes/insights', async (req, res) => {
  try {
    const { db } = await import('./pipeline/src/lib/firestore.mjs');
    
    // Pace Note를 한 번이라도 사용한 유저의 문서 참조 가져오기
    const userDocs = await db.collection('pacenotes').listDocuments();
    
    const CHUNK_SIZE = 50;
    const insightsNested = [];
    const debugErrors = [];
    
    for (let i = 0; i < userDocs.length; i += CHUNK_SIZE) {
      const chunk = userDocs.slice(i, i + CHUNK_SIZE);
      const chunkResults = await Promise.all(
        chunk.map(async (docRef) => {
          let userTasks = [];
          let poolPicks = [];
          try {
            const weeksSnap = await docRef.collection('weeks')
              .orderBy('weekId', 'desc')
              .limit(10)
              .get();
              
            weeksSnap.docs.forEach(doc => {
              const data = doc.data();
              if (data.currentPace) {
                data.currentPace.forEach(task => {
                  if (task.id.startsWith('custom-')) {
                    userTasks.push({
                      weekId: data.weekId,
                      title: task.title,
                      completed: task.completed,
                      createdAt: data.createdAt || doc.createTime?.toDate()?.toISOString() || new Date().toISOString()
                    });
                  } else {
                    poolPicks.push({
                      id: task.id,
                      completed: task.completed
                    });
                  }
                });
              }
            });
          } catch (e) {
            console.error(`Error fetching insights for uid ${docRef.id}:`, e);
            debugErrors.push({ uid: docRef.id, error: e.message });
          }
          return { userTasks, poolPicks };
        })
      );
      insightsNested.push(...chunkResults);
    }
    
    let customTasks = insightsNested.flatMap(r => r.userTasks);
    let allPoolPicks = insightsNested.flatMap(r => r.poolPicks);
    
    // 생성일 기준 최신순 정렬
    customTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // 추천 풀 통계 집계
    const poolStats = {};
    allPoolPicks.forEach(p => {
      if (!poolStats[p.id]) poolStats[p.id] = { picks: 0, clears: 0 };
      poolStats[p.id].picks += 1;
      if (p.completed) poolStats[p.id].clears += 1;
    });
    
    // 최신 100개만 반환
    res.json({ 
      insights: customTasks.slice(0, 100), 
      poolStats,
      debug: { totalDocs: userDocs.length, innerErrors: debugErrors } 
    });
  } catch (err) {
    console.error('[Admin API] Insights Fetch Error:', err);
    res.status(500).json({ error: '인사이트 조회 실패' });
  }
});

// ─── AI 추천 풀 (Pace Note Pool) 관리 ──────────────────────────────

router.get('/pacenotes/pool', async (req, res) => {
  try {
    const { db } = await import('./pipeline/src/lib/firestore.mjs');
    const doc = await db.collection('config').doc('pacenote_daily_pool').get();
    let pool = doc.exists ? (doc.data().pool || []) : [];
    let meta = doc.exists ? { lastRunLog: doc.data().lastRunLog, lastRunTime: doc.data().lastRunTime } : {};
    
    // 최초 진입 시 데이터베이스가 비어있다면, 기존 하드코딩된 15개 추천 항목으로 자동 시딩(마이그레이션)
    if (pool.length === 0) {
      const AI_RECOMMENDATION_POOL = [
        { id: 'rec-1', title: '아침 출근 전 30분 동안 온전히 나를 위한 명상하기', category: 'Mindset', color: '#34D399', isActive: true },
        { id: 'rec-2', title: '이번 주 배운 내용을 바탕으로 링크드인에 인사이트 짧게 공유하기', category: 'Branding', color: '#60A5FA', isActive: true },
        { id: 'rec-3', title: '스마트폰을 끄고 1시간 동안 종이책이나 긴 호흡의 아티클 읽기', category: 'Deep Work', color: '#FBBF24', isActive: true },
        { id: 'rec-4', title: '관심 있는 분야의 오프라인 네트워킹 모임 찾아보기', category: 'Networking', color: '#A78BFA', isActive: true },
        { id: 'rec-5', title: '평소 쓰지 않던 새로운 AI 툴 1가지 테스트해보고 후기 남기기', category: 'AI & Future', color: '#22D3EE', isActive: true },
        { id: 'rec-6', title: '이번 주 나의 업무 프로세스 중 비효율적인 부분 1개 개선하기', category: 'Productivity', color: '#F472B6', isActive: true },
        { id: 'rec-7', title: '10년 뒤 나의 커리어 모습을 상상하며 한 페이지 에세이 작성하기', category: 'Vision', color: '#818CF8', isActive: true },
        { id: 'rec-8', title: '업무와 무관한 완전히 새로운 주제의 다큐멘터리 시청하기', category: 'Inspiration', color: '#FCD34D', isActive: true },
        { id: 'rec-9', title: '이번 주 감사했던 일 3가지를 적고 주변 사람에게 표현하기', category: 'Mindset', color: '#34D399', isActive: true },
        { id: 'rec-10', title: '책상과 작업 환경을 완전히 새롭게 정리정돈하기', category: 'Environment', color: '#9CA3AF', isActive: true },
        { id: 'rec-11', title: '이번 주 가장 어려웠던 문제에 대해 왜?를 3번 반복하며 회고하기', category: 'Problem Solving', color: '#FB923C', isActive: true },
        { id: 'rec-12', title: '평소 연락하지 않던 동료나 멘토에게 먼저 커피챗 제안하기', category: 'Networking', color: '#A78BFA', isActive: true },
        { id: 'rec-13', title: '이번 주 알게 된 새로운 영단어나 비즈니스 용어 5개 완벽히 암기하기', category: 'Learning', color: '#60A5FA', isActive: true },
        { id: 'rec-14', title: '잠들기 전 내일 가장 먼저 처리할 핵심 목표 1가지 적어두기', category: 'Productivity', color: '#F472B6', isActive: true },
        { id: 'rec-15', title: '가벼운 산책을 하며 팟캐스트나 오디오북 청취하기', category: 'Health', color: '#4ADE80', isActive: true }
      ];
      pool = AI_RECOMMENDATION_POOL;
      await db.collection('config').doc('pacenote_daily_pool').set({
        pool,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    res.json({ pool, meta });
  } catch (err) {
    console.error('[Admin API] Pool Fetch Error:', err);
    res.status(500).json({ error: '추천 풀 조회 실패' });
  }
});

router.put('/pacenotes/pool', async (req, res) => {
  try {
    const { pool } = req.body;
    if (!Array.isArray(pool)) {
      return res.status(400).json({ error: 'pool 배열이 필요합니다.' });
    }
    const { db } = await import('./pipeline/src/lib/firestore.mjs');
    await db.collection('config').doc('pacenote_daily_pool').set({
      pool,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    res.json({ success: true, pool });
  } catch (err) {
    console.error('[Admin API] Pool Update Error:', err);
    res.status(500).json({ error: '추천 풀 업데이트 실패' });
  }
});

// ─── 관리자 CRUD (super_admin 전용) ──────────────

router.get('/admins', requireSuperAdmin, async (req, res) => {
  try {
    const { auth } = await import('./pipeline/src/lib/firestore.mjs');
    const adminMap = await getAdminMap();
    const admins = await Promise.all(
      Object.entries(adminMap).map(async ([email, info]) => {
        try {
          const user = await auth.getUserByEmail(email);
          return {
            uid: user.uid, email, displayName: user.displayName || '',
            role: info.role, createdAt: user.metadata.creationTime,
            lastSignIn: user.metadata.lastSignInTime, disabled: user.disabled,
          };
        } catch {
          return { uid: null, email, displayName: '', role: info.role,
            createdAt: null, lastSignIn: null, disabled: false, orphan: true };
        }
      })
    );
    res.json({ admins, total: admins.length });
  } catch (err) {
    console.error('[Admin CRUD] List:', err.message);
    res.status(500).json({ error: '관리자 목록 조회 실패' });
  }
});

router.post('/admins', requireSuperAdmin, async (req, res) => {
  const { email, password, displayName, role } = req.body;
  
  if (typeof email !== 'string' || typeof password !== 'string' || 
      typeof displayName !== 'string' || typeof role !== 'string') {
    return res.status(400).json({ error: 'Invalid input types' });
  }

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    if (password.length < 8) return res.status(400).json({ error: '비밀번호는 8자 이상이어야 합니다' });
    const assignedRole = role === 'super_admin' ? 'super_admin' : 'admin';
    const { auth } = await import('./pipeline/src/lib/firestore.mjs');
    const userRecord = await auth.createUser({
      email, password, displayName: displayName || '', emailVerified: true,
    });
    await upsertAdmin(email, assignedRole);
    console.log(`[Admin CRUD] Created: ${email} (${assignedRole})`);
    res.json({
      success: true,
      admin: { uid: userRecord.uid, email, displayName: userRecord.displayName || '',
        role: assignedRole, createdAt: userRecord.metadata.creationTime },
    });
  } catch (err) {
    console.error('[Admin CRUD] Create:', err.message);
    if (err.code === 'auth/email-already-exists') return res.status(409).json({ error: '이미 존재하는 이메일입니다' });
    if (err.code === 'auth/invalid-email') return res.status(400).json({ error: '유효하지 않은 이메일 형식입니다' });
    res.status(500).json({ error: `관리자 생성 실패: ${err.message}` });
  }
});

router.put('/admins/:uid', requireSuperAdmin, async (req, res) => {
  const { uid } = req.params;
  const { role, displayName, password, email } = req.body;

  if ((role !== undefined && typeof role !== 'string') || 
      (displayName !== undefined && typeof displayName !== 'string') || 
      (password !== undefined && typeof password !== 'string') ||
      (email !== undefined && typeof email !== 'string')) {
    return res.status(400).json({ error: 'Invalid input types' });
  }

  try {
    const { auth } = await import('./pipeline/src/lib/firestore.mjs');
    const existing = await auth.getUser(uid);
    const oldEmail = existing.email;
    const updateData = {};
    if (email && email !== oldEmail) updateData.email = email;
    if (password) updateData.password = password;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (Object.keys(updateData).length === 0 && !role) {
      return res.status(400).json({ error: '변경할 내용이 없습니다' });
    }
    if (Object.keys(updateData).length > 0) await auth.updateUser(uid, updateData);
    if (email && email !== oldEmail) {
      await removeAdmin(oldEmail);
      await upsertAdmin(email, role || 'admin');
    } else if (role) {
      await upsertAdmin(oldEmail, role);
    }
    const updated = await auth.getUser(uid);
    console.log(`[Admin CRUD] Updated: ${updated.email}`);
    res.json({ success: true, admin: { uid, email: updated.email, displayName: updated.displayName || '' } });
  } catch (err) {
    console.error('[Admin CRUD] Update:', err.message);
    if (err.code === 'auth/user-not-found') return res.status(404).json({ error: '관리자를 찾을 수 없습니다' });
    if (err.code === 'auth/email-already-exists') return res.status(409).json({ error: '이미 사용 중인 이메일입니다' });
    res.status(500).json({ error: `관리자 수정 실패: ${err.message}` });
  }
});

router.delete('/admins/:uid', requireSuperAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { auth } = await import('./pipeline/src/lib/firestore.mjs');
    const target = await auth.getUser(uid);
    if (target.email === req.adminUser.email) {
      return res.status(403).json({ error: '본인 계정은 삭제할 수 없습니다' });
    }
    const adminMap = await getAdminMap();
    if (Object.keys(adminMap).length <= 1) {
      return res.status(403).json({ error: '마지막 관리자는 삭제할 수 없습니다' });
    }
    await auth.deleteUser(uid);
    await removeAdmin(target.email);
    console.log(`[Admin CRUD] Deleted: ${target.email}`);
    res.json({ success: true, deleted: target.email });
  } catch (err) {
    console.error('[Admin CRUD] Delete:', err.message);
    if (err.code === 'auth/user-not-found') return res.status(404).json({ error: '관리자를 찾을 수 없습니다' });
    res.status(500).json({ error: `관리자 삭제 실패: ${err.message}` });
  }
});

// ─── Builder's Log (AI & Security Pipeline) ──────────────
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/builderslog/meta', async (req, res) => {
  try {
    const metaPath = path.join(__dirname, 'src', 'data', 'buildersLogMeta.json');
    if (!fs.existsSync(metaPath)) return res.json({ meta: [] });
    const data = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    res.json({ meta: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '메타데이터 조회 실패' });
  }
});

router.get('/builderslog/recent-commits', async (req, res) => {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const { Octokit } = await import('@octokit/rest');
    // Token is optional for public repos, but increases rate limit
    const octokit = githubToken ? new Octokit({ auth: githubToken }) : new Octokit();
    
    const owner = 'matthewshim';
    const repo = 'PriSincera';
    const branch = 'main';

    const response = await octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: branch,
      per_page: 100
    });

    const commits = response.data.map(commit => {
      const fullMsg = commit.commit.message.split('\n')[0]; // Get first line
      const hash = commit.sha.substring(0, 7);
      
      // Try to parse conventional commit type
      let type = 'chore';
      let msg = fullMsg;
      const match = fullMsg.match(/^([a-z]+)(\([^)]+\))?:\s*(.+)$/);
      if (match) {
        type = match[1];
        msg = match[3];
      }

      return { type, hash, msg };
    });

    res.json({ commits });
  } catch (err) {
    console.error('[BuildersLog] Fetch commits error:', err);
    res.status(500).json({ error: '최근 커밋을 불러오는데 실패했습니다.' });
  }
});

router.get('/builderslog/content/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const lang = req.locale || 'ko';
    const suffix = lang && lang !== 'ko' ? `_${lang}` : '';
    const contentPath = path.join(__dirname, 'public', 'content', 'logs', `${slug}${suffix}.md`);
    if (!fs.existsSync(contentPath)) return res.json({ content: '' });
    const content = fs.readFileSync(contentPath, 'utf8');
    res.json({ content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '본문 내용 조회 실패' });
  }
});

/**
 * JSON 문자열 내의 유효하지 않은 백슬래시 이스케이프 시퀀스를 감지하여 이중 이스케이프 처리 (자가 치유)
 */
function repairJSONBackslashes(str) {
  let result = '';
  let i = 0;
  while (i < str.length) {
    if (str[i] === '\\') {
      const next = str[i + 1];
      if (next === undefined) {
        result += '\\\\';
        i++;
      } else if (next === '\\') {
        result += '\\\\';
        i += 2;
      } else if (['"', '/', 'b', 'f', 'n', 'r', 't'].includes(next)) {
        result += '\\' + next;
        i += 2;
      } else if (next === 'u') {
        const hex = str.slice(i + 2, i + 6);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          result += '\\u' + hex;
          i += 6;
        } else {
          result += '\\\\u';
          i += 2;
        }
      } else {
        result += '\\\\' + next;
        i += 2;
      }
    } else {
      result += str[i];
      i++;
    }
  }
  return result;
}

router.post('/builderslog/analyze', async (req, res) => {
  try {
    const { markdown } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback
      return res.json({
        title: '',
        subtitle: '',
        slug: '',
        tags: [],
        refinedMarkdown: markdown,
        _warning: 'GEMINI_API_KEY가 설정되지 않아 AI 윤문 및 메타데이터 자동 추출이 생략되었습니다.'
      });
    }


    
    // Fetch recent commits to let AI choose relevant ones
    let recentCommitsText = "최근 커밋 내역 없음";
    try {
      const githubToken = process.env.GITHUB_TOKEN;
      const { Octokit } = await import('@octokit/rest');
      const octokit = githubToken ? new Octokit({ auth: githubToken }) : new Octokit();
      const response = await octokit.rest.repos.listCommits({
        owner: 'matthewshim', repo: 'PriSincera', sha: 'main', per_page: 100
      });
      const commitsList = response.data.map(c => {
        const fullMsg = c.commit.message.split('\n')[0];
        const hash = c.sha.substring(0, 7);
        let type = 'chore';
        let msg = fullMsg;
        const match = fullMsg.match(/^([a-z]+)(\([^)]+\))?:\s*(.+)$/);
        if (match) { type = match[1]; msg = match[3]; }
        return { type, hash, msg };
      });
      recentCommitsText = JSON.stringify(commitsList, null, 2);
    } catch (e) {
      console.error('[BuildersLog] Failed to fetch commits for AI analysis:', e.message);
    }

    const prompt = `
너는 PriSincera의 수석 테크니컬 라이터야. 전달된 초안 마크다운 문서를 분석해서 다음 작업을 수행해:
1. 이 아티클에 가장 어울리는 Title, Subtitle, 영문 Slug(소문자와 하이픈만), Tags(최대 4개)를 추출해.
2. 이 아티클을 150~200자 내외로 명확하게 요약한 SEO용 한국어 설명문(description)을 작성해.
3. 아래 제공된 [최근 커밋 리스트]를 분석하여, 이 아티클의 내용과 실제로 관련된 커밋들만 선별(최대 5개)하여 JSON 배열로 반환해. 연관된 것이 없다면 빈 배열 []을 반환해.

반드시 아래 JSON 형식으로만 응답해 (Markdown code block 표시 없이 순수 JSON 문자열만 출력):
{
  "title": "추출한 제목",
  "subtitle": "추출한 부제목",
  "slug": "extracted-english-slug",
  "description": "추출한 SEO용 설명문",
  "tags": ["Tag1", "Tag2"],
  "commits": [
    { "type": "feat", "hash": "abc1234", "msg": "커밋 메시지" }
  ]
}

[원본 초안]
${markdown}

[최근 커밋 리스트]
${recentCommitsText}
`;

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-2.5-flash'];
    let resultText = null;
    let errors = [];

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });
        const response = await model.generateContent(prompt);
        resultText = response.response.text();
        if (resultText) break; // Success!
      } catch (err) {
        console.warn(`[BuildersLog] Model ${modelName} failed:`, err.message);
        errors.push(`[${modelName}]: ${err.message}`);
      }
    }

    if (!resultText) {
      console.error(`[BuildersLog] 모든 AI 모델 호출 실패.\n${errors.join('\n')}`);
      return res.json({
        title: '',
        subtitle: '',
        slug: '',
        tags: [],
        refinedMarkdown: markdown,
        _warning: 'AI API 호출에 실패했습니다 (할당량 부족 또는 API 키 문제). 초안이 그대로 반환되었습니다. 제목과 메타데이터를 수동으로 입력해주세요.'
      });
    }

    // Strip markdown formatting if Gemini hallucinated it
    resultText = resultText.replace(/^```(json)?\n?/i, '').replace(/```$/i, '').trim();

    try {
      const parsed = JSON.parse(resultText);
      // 원본 본문은 AI 윤문 없이 그대로 유지하여 품질 저하 및 코드 훼손을 원천 차단
      parsed.refinedMarkdown = markdown;
      res.json(parsed);
    } catch (parseError) {
      console.warn('[BuildersLog] AI JSON Parse failed, initiating self-healing recovery...');
      try {
        // Automatically escape invalid backslashes (like in Windows paths d:\... or markdown escapes \*,\#)
        const recoveredText = repairJSONBackslashes(resultText);
        const parsed = JSON.parse(recoveredText);
        parsed.refinedMarkdown = markdown;
        console.log('[BuildersLog] AI JSON Parse successfully recovered and parsed via self-healing!');
        res.json(parsed);
      } catch (recoveryError) {
        console.error('[BuildersLog] AI JSON Parse recovery also failed:', recoveryError.message);
        console.error('[BuildersLog] Raw result text:', resultText);
        throw new Error(`JSON 파싱 오류: ${parseError.message}`);
      }
    }
  } catch (err) {
    console.error('[BuildersLog] AI Analyze error:', err.message);
    res.status(500).json({ error: `서버 에러가 발생했습니다: ${err.message}` });
  }
});

router.post('/builderslog/publish', async (req, res) => {
  try {
    const { metaArray, currentSlug, markdown, skipAiReview, locale } = req.body;
    let finalMarkdown = markdown;

    // 1. AI 윤문 및 문맥 필터링을 생략하고 원본 마크다운 품질 그대로 유지하여 발행 (불필요한 인젝션 제거)

    // 2. 정규식 기반 시크릿 스캐너
    const secretPatterns = [
      /AIza[0-9A-Za-z-_]{35}/, // Firebase API Key (Though sometimes public, best to warn, but let's just use strict regex for other things if needed)
      /ghp_[a-zA-Z0-9]{36}/, // GitHub PAT
      /xox[baprs]-[a-zA-Z0-9]{10,48}/ // Slack Token
    ];
    for (const pattern of secretPatterns) {
      if (pattern.test(finalMarkdown)) {
        return res.status(400).json({ error: '보안 위반: 민감 정보(Secret) 패턴이 발견되어 퍼블리싱이 차단되었습니다.' });
      }
    }

    const suffix = locale && locale !== 'ko' ? `_${locale}` : '';

    // 3. GitHub API를 통한 커밋 푸시
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      // 로컬 테스트용: 직접 파일 쓰기
      const metaPath = path.join(__dirname, 'src', 'data', 'buildersLogMeta.json');
      fs.writeFileSync(metaPath, JSON.stringify(metaArray, null, 2));
      const contentDir = path.join(__dirname, 'public', 'content', 'logs');
      if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });
      const contentPath = path.join(contentDir, `${currentSlug}${suffix}.md`);
      fs.writeFileSync(contentPath, finalMarkdown);
      return res.json({ success: true, message: '로컬 환경에 성공적으로 저장되었습니다 (GITHUB_TOKEN 없음).' });
    }

    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: githubToken });
    const owner = 'matthewshim';
    const repo = 'PriSincera';
    const branch = 'main';

    const ref = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
    const commitSha = ref.data.object.sha;
    const commit = await octokit.rest.git.getCommit({ owner, repo, commit_sha: commitSha });
    const treeSha = commit.data.tree.sha;

    const metaBlob = await octokit.rest.git.createBlob({
      owner, repo, content: JSON.stringify(metaArray, null, 2), encoding: 'utf-8'
    });
    const markdownBlob = await octokit.rest.git.createBlob({
      owner, repo, content: finalMarkdown, encoding: 'utf-8'
    });

    const newTree = await octokit.rest.git.createTree({
      owner, repo, base_tree: treeSha,
      tree: [
        { path: 'src/data/buildersLogMeta.json', mode: '100644', type: 'blob', sha: metaBlob.data.sha },
        { path: `public/content/logs/${currentSlug}${suffix}.md`, mode: '100644', type: 'blob', sha: markdownBlob.data.sha }
      ]
    });

    const newCommit = await octokit.rest.git.createCommit({
      owner, repo, message: `feat(builders-log): publish ${currentSlug}${suffix} via Admin`,
      tree: newTree.data.sha, parents: [commitSha]
    });

    await octokit.rest.git.updateRef({
      owner, repo, ref: `heads/${branch}`, sha: newCommit.data.sha
    });

    res.json({ success: true, message: 'GitHub main 브랜치에 성공적으로 커밋되었습니다.' });
  } catch (err) {
    console.error('[BuildersLog] Final Publish error:', err);
    res.status(500).json({ error: `아티클 저장 중 서버 에러가 발생했습니다: ${err.message}` });
  }
});

router.post('/builderslog/translate', async (req, res) => {
  try {
    const { title, subtitle, description, markdown } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: 'GEMINI_API_KEY가 설정되지 않아 완역을 기동할 수 없습니다.' });
    }

    const prompt = `
너는 PriSincera의 다국어 번역 전문가이자 전문 테크니컬 라이터야.
전달된 한국어 원문 텍스트들(Title, Subtitle, Description, Markdown 본문)을 분석하여, 다음을 수행해:
1. 의미를 정확하게 유지하면서 전문적이고 세련된 영어(en) 및 일본어(ja)로 완역해.
2. 마크다운 본문의 경우, 마크다운 서식(H2, H3, Blockquote, bold, code 등)을 그대로 완벽하게 보존해야 해.

반드시 아래 JSON 형식으로만 응답해 (Markdown code block 표시 없이 순수 JSON 문자열만 출력):
{
  "en": {
    "title": "translated title in English",
    "subtitle": "translated subtitle in English",
    "description": "translated description in English",
    "markdown": "translated markdown body in English with all format preserved"
  },
  "ja": {
    "title": "日本語に翻訳されたタイトル",
    "subtitle": "日本語に翻訳されたサブタイトル",
    "description": "日本語に翻訳された説明文",
    "markdown": "日本語に翻訳されたマークダウン本文（すべてのフォーマットを維持）"
  }
}

[번역 대상 한국어 원문]
- Title: ${title || ''}
- Subtitle: ${subtitle || ''}
- Description: ${description || ''}
${markdown ? `- Markdown:\n${markdown}` : ''}
`;

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-2.5-flash'];
    let resultText = null;
    let errors = [];

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });
        const response = await model.generateContent(prompt);
        resultText = response.response.text();
        if (resultText) break;
      } catch (err) {
        console.warn(`[BuildersLog Translate] Model ${modelName} failed:`, err.message);
        errors.push(`[${modelName}]: ${err.message}`);
      }
    }

    if (!resultText) {
      return res.status(500).json({ error: `AI 완역 호출에 실패했습니다: ${errors.join(', ')}` });
    }

    resultText = resultText.replace(/^```(json)?\n?/i, '').replace(/```$/i, '').trim();

    try {
      const parsed = JSON.parse(resultText);
      res.json(parsed);
    } catch (parseError) {
      try {
        const recoveredText = repairJSONBackslashes(resultText);
        const parsed = JSON.parse(recoveredText);
        res.json(parsed);
      } catch (recoveryError) {
        console.error('[BuildersLog Translate] JSON parse failed:', resultText);
        res.status(500).json({ error: `JSON 파싱에 실패했습니다: ${parseError.message}` });
      }
    }
  } catch (err) {
    console.error('[BuildersLog Translate] Error:', err);
    res.status(500).json({ error: `서버 내부 에러: ${err.message}` });
  }
});

router.get('/builderslog/stats', async (req, res) => {
  try {
    const { db } = await import('./pipeline/src/lib/firestore.mjs');
    const snapshot = await db.collection('builderslog_stats').get();
    const stats = {};
    const kstDate = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
    snapshot.forEach(doc => {
      const data = doc.data();
      stats[doc.id] = {
        total: data.totalViews || data.views || 0,
        daily: data.dailyViews ? (data.dailyViews[kstDate] || 0) : 0
      };
    });
    res.json(stats);
  } catch (err) {
    console.error('[Admin API] BuildersLog stats fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch BuildersLog stats' });
  }
});

export default router;
