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
import pacenoteRouter from './pacenote-api.mjs';

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
app.use('/admin/api', adminLimiter, express.json({ limit: '1mb' }), adminRouter);

// --- PriStudy API ---
app.use('/api/study', apiLimiter, express.json({ limit: '5kb' }), studyRouter);
// 구버전 프론트엔드 캐시 하위 호환 (pristudy -> study)
app.use('/api/pristudy', apiLimiter, express.json({ limit: '5kb' }), studyRouter);

// --- Pace Note API ---
app.use('/api/pacenote', apiLimiter, express.json({ limit: '5kb' }), pacenoteRouter);

// --- BuildersLog API ---
app.post('/api/builderslog/:slug/view', apiLimiter, express.json(), async (req, res) => {
  try {
    const slug = req.params.slug;
    if (!slug) return res.status(400).json({ error: 'Slug required' });
    const { db } = await import('./pipeline/src/lib/firestore.mjs');
    const { FieldValue } = await import('firebase-admin/firestore');
    
    const kstDate = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
    const docRef = db.collection('builderslog_stats').doc(slug);
    await docRef.set({ 
      totalViews: FieldValue.increment(1),
      [`dailyViews.${kstDate}`]: FieldValue.increment(1)
    }, { merge: true });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'View record failed' });
  }
});

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

// Check Subscription Status
app.get('/api/subscribe/check', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.json({ subscribed: false });
    const { db, COLLECTIONS } = await import('./pipeline/src/lib/firestore.mjs');
    const { createHash } = await import('crypto');
    const hash = createHash('sha256').update(email.toLowerCase().trim()).digest('hex').slice(0, 16);
    const doc = await db.collection(COLLECTIONS.SUBSCRIBERS).doc(hash).get();
    res.json({ subscribed: doc.exists && doc.data().status === 'active' });
  } catch (err) {
    res.json({ subscribed: false });
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

// Unsubscribe — Frontend (POST without Token)
app.post('/api/unsubscribe', subscribeLimiter, express.json({ limit: '1kb' }), async (req, res) => {
  try {
    const { email_address } = req.body || {};
    if (typeof email_address !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_address)) {
      return res.status(400).json({ code: 'invalid_email', error: 'Invalid email address' });
    }
    const { removeSubscriber } = await import('./pipeline/src/lib/subscribers.mjs');
    const result = await removeSubscriber(email_address);
    if (result.code === 'unsubscribed') {
      return res.status(200).json({ code: 'unsubscribed' });
    }
    return res.status(200).json({ code: 'not_found' });
  } catch (err) {
    console.error('[Unsubscribe POST] Error:', err.message);
    res.status(500).json({ code: 'server_error', error: 'Server error' });
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
  <title>Daily Digest — 구독 해지</title>
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
    <a href="https://www.prisincera.com/daily" class="link">← Daily Digest로 돌아가기</a>
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

// --- Dynamic Sitemap for Google/Naver SEO ---
app.get('/sitemap.xml', async (req, res) => {
  try {
    const { getDailyIndex } = await import('./pipeline/src/repositories/DailyRepository.mjs');
    const fsIndex = await getDailyIndex();
    
    let gcsDates = [];
    if (storage) {
      try {
        const [content] = await storage.bucket(GCS_BUCKET).file('daily/index.json').download();
        const gcsIndex = JSON.parse(content.toString('utf-8'));
        gcsDates = gcsIndex.dates || [];
      } catch (err) {}
    }
    
    const allDates = Array.from(new Set([...fsIndex.dates, ...gcsDates])).sort((a, b) => b.localeCompare(a));
    
    const baseUrl = 'https://www.prisincera.com';
    const staticPages = [
      { url: '/', changefreq: 'weekly', priority: 1.0 },
      { url: '/daily', changefreq: 'daily', priority: 0.9 },
      { url: '/builders-log', changefreq: 'weekly', priority: 0.8 },
      { url: '/pacenote', changefreq: 'weekly', priority: 0.8 },
      { url: '/connect', changefreq: 'monthly', priority: 0.5 }
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>\n    <loc>${baseUrl}${page.url}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
    }

    // Add daily digest issues
    for (const date of allDates) {
      xml += `  <url>\n    <loc>${baseUrl}/daily/${date}</loc>\n    <changefreq>never</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }
    
    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('[Sitemap] Error generating sitemap:', err);
    res.status(500).end();
  }
});

// --- SPA fallback & Dynamic SEO Proxy ---
let cachedIndexHtml = null;

app.use(async (req, res) => {
  const indexPath = join(DIST_DIR, 'index.html');
  if (!existsSync(indexPath)) {
    return res.status(404).send('Not Found');
  }

  // Cache index.html in memory
  if (!cachedIndexHtml) {
    cachedIndexHtml = readFileSync(indexPath, 'utf-8');
  }
  let html = cachedIndexHtml;

  const baseUrl = 'https://www.prisincera.com';
  const currentUrl = baseUrl + req.originalUrl;
  
  let title = 'PriSincera — Sincerity, Prioritized.';
  let description = 'PriSincera 공식 홈페이지. 복잡한 비즈니스에 진심을 담아 우선순위를 설계합니다.';
  let image = `${baseUrl}/daily-og.png`; // Premium fallback image

  try {
    const dailyMatch = req.originalUrl.match(/^\/daily\/(\d{4}-\d{2}-\d{2})/);
    if (dailyMatch) {
      const dateStr = dailyMatch[1];
      const { getDailySignal } = await import('./pipeline/src/repositories/DailyRepository.mjs');
      let signalData = await getDailySignal(dateStr);
      
      if (!signalData && storage) {
        try {
          const [content] = await storage.bucket(GCS_BUCKET).file(`daily/${dateStr}.json`).download();
          signalData = JSON.parse(content.toString('utf-8'));
        } catch(e) {}
      }
      
      if (signalData && signalData.articles && signalData.articles.length > 0) {
        // Find top article for SEO representation
        const topArticle = signalData.articles.sort((a,b) => (b.weightedScore||0) - (a.weightedScore||0))[0];
        title = `${topArticle.title} | Daily Digest — PriSincera`;
        description = topArticle.summary ? topArticle.summary.substring(0, 150) + '...' : description;
        image = topArticle.ogImage || image;
      } else {
        title = `${dateStr} Daily Digest | PriSincera`;
      }
    } else if (req.originalUrl.startsWith('/daily')) {
      title = 'Daily Digest — 노이즈 속의 시그널과 실무 지식 | PriSincera';
      description = '매일 아침, 전 세계 비즈니스/테크 동향 중 가장 중요한 시그널과 핵심 실무 지식(Study)을 선별해 전해드립니다.';
    } else if (req.originalUrl.startsWith('/pacenote')) {
      title = 'Pace Note — 목표와 회고 | PriSincera';
      description = '스스로의 우선순위를 지키기 위한 주간 목표 달성률과 투명한 성찰을 기록하는 페이스 노트입니다.';
    } else if (req.originalUrl.startsWith('/builders-log')) {
      title = 'Builders Log — 서비스 구축의 기록 | PriSincera';
      description = 'PriSincera 프로덕트가 만들어지는 과정과 디자인, 기술적 의사결정을 날것 그대로 기록합니다.';
    }
  } catch(err) {
    console.error('[SEO Proxy] Error generating meta tags:', err.message);
  }

  // Escape quotes
  const safeDesc = description.replace(/"/g, '&quot;');
  
  const metaTags = `
    <title>${title}</title>
    <meta name="description" content="${safeDesc}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${safeDesc}">
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="${currentUrl}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${safeDesc}">
    <meta name="twitter:image" content="${image}">
  `;

  // Inject meta tags by replacing the static ones
  html = html.replace(/<title>.*<\/title>/is, '');
  html = html.replace(/<meta name="description" content="[^"]*">/is, '');
  html = html.replace('</head>', `${metaTags}\n</head>`);

  res.send(html);
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`[PriSincera] Server running on port ${PORT}`);
  console.log(`[PriSincera] GCS bucket: ${GCS_BUCKET}`);
  console.log(`[PriSincera] Subscriber management: Firestore (GCS fallback)`);
  console.log(`[PriSincera] Admin API: /admin/api/*`);
  console.log(`[PriSincera] Unsubscribe secret: ${process.env.UNSUBSCRIBE_SECRET ? 'configured' : 'NOT SET'}`);
});
