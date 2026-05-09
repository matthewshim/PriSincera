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

    // 템플릿 렌더링
    const { renderDailyEmail } = await import('./pipeline/src/lib/email-template.mjs');
    const htmlContent = renderDailyEmail({
      date: todayStr,
      articles: articles,
      totalCount: articles.length,
      dailyPageUrl: `https://www.prisincera.com/prisignal/${todayStr}`,
      unsubscribeUrl: `https://www.prisincera.com/unsubscribe?email=${encodeURIComponent(to)}`,
      studyData: studyData,
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
    const progressSnap = await db.collection(COLLECTIONS.STUDY_PROGRESS).count().get();
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

router.get('/pristudy/learners', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { db, COLLECTIONS, auth } = await import('./pipeline/src/lib/firestore.mjs');
    const snap = await db.collection(COLLECTIONS.STUDY_PROGRESS)
      .orderBy('longest_streak', 'desc').limit(limit).get();
      
    const learners = await Promise.all(snap.docs.map(async (doc) => {
      const data = doc.data();
      let email = data.email;
      if (!email || email === 'unknown') {
        try {
          const user = await auth.getUser(doc.id);
          email = user.email;
        } catch (e) {
          console.error(`[Admin API] Failed to get user ${doc.id}:`, e.message);
          email = '알 수 없음';
        }
      }
      return {
        uid: doc.id, email,
        current_streak: data.current_streak || 0,
        longest_streak: data.longest_streak || 0,
        last_study_date: data.last_study_date || '-',
        total_completed: data.completed_dates?.length || 0,
      };
    }));
    res.json({ learners });
  } catch (err) {
    res.status(500).json({ error: '학습자 현황 조회 실패' });
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

export default router;
