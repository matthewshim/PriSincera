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
import { resolveMeta, PAGE_META, hreflangLinks, ogLocaleTags } from './src/data/seoMeta.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;
const DIST_DIR = join(__dirname, 'dist');

// --- Load Builders Log Metadata for Sitemap & SEO Proxy ---
const buildersLogMetaPath = join(__dirname, 'src', 'data', 'buildersLogMeta.json');
let buildersLog = [];
if (existsSync(buildersLogMetaPath)) {
  try {
    buildersLog = JSON.parse(readFileSync(buildersLogMetaPath, 'utf-8'));
    console.log(`[Server] Loaded ${buildersLog.length} Builders Log articles for Sitemap & SEO`);
  } catch (err) {
    console.error('[Server] Failed to load buildersLogMeta.json', err);
  }
}

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

// --- Locale parsing middleware ---
app.use(['/api', '/admin'], (req, res, next) => {
  const queryLang = req.query.lang;
  const headerLang = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const allowed = ['ko', 'en', 'ja'];
  req.locale = allowed.includes(queryLang) ? queryLang : (allowed.includes(headerLang) ? headerLang : 'ko');
  next();
});

// --- Recursive Object Localizer for Dynamic DB Content ---
const isLocalizationMap = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  const keys = Object.keys(obj);
  if (keys.length === 0) return false;
  const allowedLocales = ['ko', 'en', 'ja'];
  return keys.every(key => allowedLocales.includes(key));
};

const localizeObject = (obj, locale) => {
  if (!obj) return obj;
  if (isLocalizationMap(obj)) {
    return obj[locale] || obj['ko'] || '';
  }
  if (Array.isArray(obj)) {
    return obj.map(item => localizeObject(item, locale));
  }
  if (typeof obj === 'object') {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = localizeObject(obj[key], locale);
    }
    return newObj;
  }
  return obj;
};



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
    if (!slug || !/^[a-zA-Z0-9-_]+$/.test(slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }
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
  <title>ReLearn — 구독 해지</title>
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
    <a href="https://www.prisincera.com/relearn" class="link">← ReLearn으로 돌아가기</a>
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

    // 클라이언트의 로케일에 맞춰 동적으로 모든 다국어 맵 데이터 평탄화(Flatten)
    const localizedData = localizeObject(aggregatedData, req.locale);

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Content-Type', 'application/json');
    res.json(localizedData);
  } catch (err) {
    console.error(`[API] /api/daily/${dateStr} Error:`, err);
    res.status(500).json({ error: 'Failed to fetch daily signal' });
  }
});

// --- Track Signal Feed (Data Contract v2 §1.2) — junior/senior 트랙 피드 GCS 프록시 ---
// 트랙 피드는 tech-composer가 daily/${track}_${date}.json 로 가산 배포한다(ko 단일, 평탄화 불필요).
app.get('/api/daily/:date/track/:track', async (req, res) => {
  const { date: dateStr, track } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ error: 'Invalid date format' });
  }
  if (track !== 'junior' && track !== 'senior') {
    return res.status(400).json({ error: 'Invalid track' });
  }
  if (!storage) {
    return res.status(503).json({ error: 'Track feed storage unavailable' });
  }
  try {
    const [content] = await storage.bucket(GCS_BUCKET).file(`daily/${track}_${dateStr}.json`).download();
    const feed = JSON.parse(content.toString('utf-8'));
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Content-Type', 'application/json');
    res.json(feed);
  } catch (err) {
    return res.status(404).json({ error: 'Track feed not found' });
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
      { url: '/relearn', changefreq: 'daily', priority: 0.9 },
      { url: '/builders-log', changefreq: 'weekly', priority: 0.8 },
      { url: '/sylphio', changefreq: 'weekly', priority: 0.9 },
      { url: '/sylphio/guide', changefreq: 'weekly', priority: 0.8 },
      { url: '/sylphio/privacy', changefreq: 'monthly', priority: 0.5 },
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
      xml += `  <url>\n    <loc>${baseUrl}/relearn/daily/${date}</loc>\n    <changefreq>never</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    // Add builders log chapters
    for (const chapter of buildersLog) {
      if (chapter.slug) {
        xml += `  <url>\n    <loc>${baseUrl}/builders-log/${chapter.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }
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

// ── ReLearn 통합: 구 독립 서비스 경로 301 (SEO 자산·과거 발송 메일 링크 보전) ──
app.get(/^\/daily\/(\d{4}-\d{2}-\d{2})$/, (req, res) => res.redirect(301, `/relearn/daily/${req.params[0]}`));
app.get(/^\/daily(\/.*)?$/, (req, res) => res.redirect(301, '/relearn'));
app.get(/^\/pacenote(\/.*)?$/, (req, res) => res.redirect(301, '/relearn'));

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
  
  let override = null;   // 동적 페이지(글 상세/날짜)용 메타

  try {
    const dailyMatch = req.originalUrl.match(/^\/relearn\/daily\/(\d{4}-\d{2}-\d{2})/);
    if (dailyMatch) {
      const dateStr = dailyMatch[1];
      // 날짜 메타는 데이터 조회 성패와 무관하게 항상 보장 (조회 실패 시 이 폴백이 그대로 나감)
      override = {
        pageTitle: `${dateStr} Daily Digest — ReLearn`,
        description: `${dateStr} 데일리 다이제스트 아카이브 — IT 시그널·테크 트랙·AI 프롬프트·비즈니스 일본어 전체 기록.`,
        keywords: PAGE_META['/relearn'].keywords,
      };
      // 대표글 OG 승격은 별도 격리 — 실패해도 위 폴백 메타는 유지된다
      try {
        const { getDailySignal } = await import('./pipeline/src/repositories/DailyRepository.mjs');
        let signalData = await getDailySignal(dateStr);

        if (!signalData && storage) {
          try {
            const [content] = await storage.bucket(GCS_BUCKET).file(`daily/${dateStr}.json`).download();
            signalData = JSON.parse(content.toString('utf-8'));
          } catch(e) {}
        }

        if (signalData && signalData.articles && signalData.articles.length > 0) {
          const topArticle = signalData.articles.sort((a,b) => (b.weightedScore||0) - (a.weightedScore||0))[0];
          override = {
            pageTitle: `${topArticle.title} — Daily Digest`,
            description: topArticle.summary ? topArticle.summary.substring(0, 150) + '...' : override.description,
            keywords: override.keywords,
            ogImage: topArticle.ogImage || undefined,
          };
        }
      } catch (e) {
        console.error('[SEO Proxy] 아카이브 상세 대표글 조회 실패 — 날짜 폴백 메타 사용:', e.message);
      }
    } else if (req.originalUrl.startsWith('/builders-log')) {
      const logMatch = req.originalUrl.match(/^\/builders-log\/([a-zA-Z0-9-_]+)/);
      if (logMatch) {
        const slug = logMatch[1];
        const article = buildersLog.find(a => a.slug === slug);
        if (article) {
          const getLocaleVal = (obj) => {
            if (!obj) return '';
            if (typeof obj === 'object') {
              return obj[req.locale] || obj['ko'] || '';
            }
            return obj;
          };
          override = {
            pageTitle: `${getLocaleVal(article.title)} — Builder's Log`,
            description: getLocaleVal(article.description).substring(0, 150) + '...',
            keywords: PAGE_META['/builders-log'].keywords,
          };
        }
      }
    }
  } catch(err) {
    console.error('[SEO Proxy] Error generating meta tags:', err.message);
  }

  const meta = resolveMeta(req.originalUrl, { override });
  const title = meta.title;
  const description = meta.description;
  const keywords = meta.keywords;
  const image = meta.ogImage;

  // Escape quotes
  const safeDesc = description.replace(/"/g, '&quot;');
  const safeKeywords = (keywords || '').replace(/"/g, '&quot;');
  const canonicalUrl = meta.canonical;
  
  const metaTags = `
    <title>${title}</title>
    <meta name="description" content="${safeDesc}">
    <meta name="keywords" content="${safeKeywords}">
    <link rel="canonical" href="${canonicalUrl}">
    ${hreflangLinks(canonicalUrl)}
    ${ogLocaleTags(req.locale)}
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${safeDesc}">
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${safeDesc}">
    <meta name="twitter:image" content="${image}">
  `;

  // Inject meta tags by replacing the static ones
  html = html.replace(/<title>.*<\/title>/is, '');
  html = html.replace(/<meta name="description"[^>]*>/is, '');
  html = html.replace(/<meta name="keywords"[^>]*>/is, '');
  html = html.replace(/<meta property="og:(title|description|image|url)"[^>]*>/gis, '');
  html = html.replace(/<meta name="twitter:(title|description|image)"[^>]*>/gis, '');
  html = html.replace('</head>', `${metaTags}\n</head>`);

  // SPA HTML은 절대 캐시 금지 — 헤더 부재 시 브라우저/CDN 휴리스틱 캐시로
  // 경로별(예: /relearn) 옛 번들 HTML이 고착되는 문제 방지 (express.static의
  // index.html no-cache 설정은 이 fallback 경로에는 적용되지 않음)
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
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
