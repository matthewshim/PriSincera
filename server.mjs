/**
 * PriSincera Web Server — Express + GCS/Firestore
 * 
 * Cloud Run deployment.
 * - Serves static files from dist/
 * - Subscriber management via Firestore (GCS fallback)
 * - GCS daily JSON proxy (authenticated)
 * - Admin API (Firebase Auth protected)
 * - SPA fallback for client-side routing
 */
import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import adminRouter from './admin-api.mjs';
import studyRouter from './study-api.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;
const DIST_DIR = join(__dirname, 'dist');

// --- Buttondown API key (deprecated — 마이그레이션 완료 후 환경변수에서 제거) ---
// const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY || '';

// --- GCS config ---
const GCS_BUCKET = process.env.GCS_BUCKET || 'prisincera-prisignal-data';
let storage;
try {
  const { Storage } = await import('@google-cloud/storage');
  storage = new Storage();
} catch (e) {
  console.warn('[Server] @google-cloud/storage not available, GCS proxy disabled');
}

// --- Compression ---
import compression from 'compression';
app.use(compression());

// --- Security headers via Helmet (replaces manual headers) ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://apis.google.com", "https://www.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com"],
      frameSrc: ["'self'", "https://*.firebaseapp.com", "https://prisincera.firebaseapp.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  xXssProtection: false, // deprecated header — CSP replaces it
}));

// --- CORS — restrict to specific origin ---
app.use('/api/', cors({ origin: 'https://www.prisincera.com' }));

// --- Rate limiting ---
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,                  // 60 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 requests per IP per 15 min
  message: { error: '요청이 너무 많습니다. 15분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per IP per 15 min
  message: { error: 'Too many requests to admin API' },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Redirect non-www to www ---
app.use((req, res, next) => {
  if (req.hostname === 'prisincera.com') {
    return res.redirect(301, `https://www.prisincera.com${req.originalUrl}`);
  }
  next();
});

// --- Static files with caching ---
app.use(express.static(DIST_DIR, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// --- Admin API (Firebase Auth protected) ---
app.use('/admin/api', adminLimiter, express.json({ limit: '10kb' }), adminRouter);

// --- PriStudy API ---
app.use('/api/study', apiLimiter, express.json({ limit: '5kb' }), studyRouter);
// 구버전 프론트엔드 캐시 하위 호환 (pristudy -> study)
app.use('/api/pristudy', apiLimiter, express.json({ limit: '5kb' }), studyRouter);

// --- Subscriber Management (GCS JSON / Firestore) ---

// Subscribe — GCS 직접 저장
app.post('/api/subscribe', subscribeLimiter, express.json({ limit: '1kb' }), async (req, res) => {
  try {
    const { email_address } = req.body || {};

    // Server-side email validation (Type check against NoSQL Injection)
    if (typeof email_address !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_address)) {
      return res.status(400).json({ code: 'invalid_email', error: 'Invalid email address' });
    }

    // GCS 구독자 관리 모듈 dynamic import (서버 시작 시 로드 실패 방지)
    const { addSubscriber } = await import('./pipeline/src/lib/subscribers.mjs');
    const result = await addSubscriber(email_address, 'website');

    switch (result.code) {
      case 'subscribed':
      case 'resubscribed':
        return res.status(201).json({ code: 'subscribed', email: result.email });
      case 'already_subscribed':
        return res.status(200).json({ code: 'already_subscribed' });
      case 'invalid_email':
        return res.status(400).json({ code: 'invalid_email', error: 'Invalid email address' });
      default:
        return res.status(500).json({ code: 'error', error: 'Unknown result' });
    }
  } catch (err) {
    console.error('[Subscribe] Error:', err.message);
    res.status(500).json({ code: 'server_error', error: '구독 처리 중 오류가 발생했습니다.' });
  }
});

// Unsubscribe — HMAC 토큰 검증 후 해지
app.get('/api/unsubscribe', async (req, res) => {
  try {
    const { email, token } = req.query;

    if (typeof email !== 'string' || typeof token !== 'string' || !email || !token) {
      return res.status(400).send(renderUnsubPage('잘못된 요청입니다.', false));
    }

    const { verifyUnsubToken, removeSubscriber } = await import('./pipeline/src/lib/subscribers.mjs');

    if (!verifyUnsubToken(email, token)) {
      return res.status(403).send(renderUnsubPage('유효하지 않은 요청입니다.', false));
    }

    const result = await removeSubscriber(email);

    if (result.code === 'unsubscribed') {
      return res.status(200).send(renderUnsubPage('구독이 성공적으로 해지되었습니다.', true));
    }

    return res.status(200).send(renderUnsubPage('이미 해지된 이메일이거나 존재하지 않는 이메일입니다.', true));
  } catch (err) {
    console.error('[Unsubscribe] Error:', err.message);
    res.status(500).send(renderUnsubPage('처리 중 오류가 발생했습니다.', false));
  }
});

/** 구독 해지 결과 페이지 HTML */
function renderUnsubPage(message, success) {
  const icon = success ? '✅' : '❌';
  const color = success ? '#22D3EE' : '#EF4444';
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PriSignal — 구독 해지</title>
  <style>
    body { margin:0; padding:0; background:#0A0714; display:flex; justify-content:center; align-items:center; min-height:100vh; font-family:'Noto Sans KR',-apple-system,sans-serif; }
    .card { background:#1A1035; border:1px solid rgba(196,181,253,0.08); border-radius:16px; padding:48px; text-align:center; max-width:400px; }
    .icon { font-size:48px; margin-bottom:16px; }
    .msg { color:#E9D5FF; font-size:16px; line-height:1.6; margin-bottom:24px; }
    .link { color:#C084FC; text-decoration:none; font-size:14px; }
    .link:hover { text-decoration:underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <p class="msg" style="color:${color};">${message}</p>
    <a href="https://www.prisincera.com/prisignal" class="link">← PriSignal로 돌아가기</a>
  </div>
</body>
</html>`;
}

// --- Archive redirect (기존 /api/archive → /api/daily/index 사용 안내) ---
// Buttondown 아카이브 프록시 제거 — 기존 /api/daily/index, /api/daily/:date 사용
app.get('/api/archive', (req, res) => {
  res.redirect(301, '/api/daily/index');
});
app.get('/api/archive/:id', (req, res) => {
  // 기존 UUID 기반 → 날짜 기반으로 전환됨
  res.status(410).json({ error: 'Archive endpoint deprecated. Use /api/daily/:date instead.' });
});

// --- Daily Signal API (Firestore + GCS Fallback) ---
app.get('/api/daily/index', async (req, res) => {
  try {
    const { getDailyIndex } = await import('./pipeline/src/repositories/DailyRepository.mjs');
    const fsIndex = await getDailyIndex();
    
    // GCS 폴백 병합 (기존 과거 데이터 유지)
    let gcsDates = [];
    if (storage) {
      try {
        const [content] = await storage.bucket(GCS_BUCKET).file('daily/index.json').download();
        const gcsIndex = JSON.parse(content.toString('utf-8'));
        gcsDates = gcsIndex.dates || [];
      } catch (err) {
        // 무시
      }
    }
    
    // 중복 제거 및 최신순 정렬
    const allDates = Array.from(new Set([...fsIndex.dates, ...gcsDates]));
    allDates.sort((a, b) => b.localeCompare(a));

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Content-Type', 'application/json');
    res.json({ dates: allDates });
  } catch (err) {
    console.error('[API] /api/daily/index Error:', err);
    res.status(500).json({ error: 'Failed to fetch index' });
  }
});

app.get('/api/daily/:date', async (req, res) => {
  const dateStr = req.params.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ error: 'Invalid date format' });
  }
  try {
    const { getDailySignal } = await import('./pipeline/src/repositories/DailyRepository.mjs');
    const { getStudyContent } = await import('./pipeline/src/repositories/StudyRepository.mjs');
    
    let [signalData, studyData] = await Promise.all([
      getDailySignal(dateStr),
      getStudyContent(dateStr)
    ]);
    
    // Firestore에 signal이 없으면 GCS에서 폴백 시도
    if (!signalData && storage) {
      try {
        const [content] = await storage.bucket(GCS_BUCKET).file(`daily/${dateStr}.json`).download();
        signalData = JSON.parse(content.toString('utf-8'));
      } catch (err) {
        // 무시
      }
    }

    if (!signalData && !studyData) {
      return res.status(404).json({ error: 'Daily digest not found' });
    }
    
    const aggregatedData = {
      date: dateStr,
      signal: signalData || null,
      study: studyData || null
    };

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Content-Type', 'application/json');
    res.json(aggregatedData);
  } catch (err) {
    console.error(`[API] /api/daily/${dateStr} Error:`, err);
    res.status(500).json({ error: 'Failed to fetch daily signal' });
  }
});

app.get('/api/env-check', (req, res) => {
  res.json({
    smtpUser: process.env.SMTP_USER || 'missing',
    smtpPass: process.env.SMTP_PASS ? 'exists' : 'missing',
    fromName: process.env.SMTP_FROM_NAME || 'missing'
  });
});

app.get('/api/temp-check-subs', async (req, res) => {
  try {
    const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
    const snap = await db.collection(COLLECTIONS.SUBSCRIBERS).where('status', '==', 'active').get();
    res.json({ activeCount: snap.docs.length, emails: snap.docs.map(d => d.data().email) });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/api/temp-logs', async (req, res) => {
  try {
    const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
    const snap = await db.collection(COLLECTIONS.EMAIL_LOGS).orderBy('sentAt', 'desc').limit(5).get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SPA fallback (Express 5 compatible) ---
app.use((req, res) => {
  const indexPath = join(DIST_DIR, 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not Found');
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`[PriSincera] Server running on port ${PORT}`);
  console.log(`[PriSincera] GCS bucket: ${GCS_BUCKET}`);
  console.log(`[PriSincera] Subscriber management: Firestore (GCS fallback)`);
  console.log(`[PriSincera] Admin API: /admin/api/*`);
  console.log(`[PriSincera] Unsubscribe secret: ${process.env.UNSUBSCRIBE_SECRET ? 'configured' : 'NOT SET'}`);
});
