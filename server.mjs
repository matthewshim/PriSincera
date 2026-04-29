/**
 * PriSincera Web Server — Express + GCS authenticated proxy
 * 
 * Replaces Nginx for Cloud Run deployment.
 * - Serves static files from dist/
 * - Proxies Buttondown API requests
 * - Reads GCS daily JSON using Cloud Run service account (auto-auth)
 * - SPA fallback for client-side routing
 */
import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;
const DIST_DIR = join(__dirname, 'dist');

// --- Buttondown API key ---
const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY || '';

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
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
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
    if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    if (filePath.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// --- Buttondown API Proxies ---

// Subscribe — with rate limiting + body validation
app.post('/api/subscribe', subscribeLimiter, express.json({ limit: '1kb' }), async (req, res) => {
  try {
    const { email_address } = req.body || {};

    // Server-side email validation
    if (!email_address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_address)) {
      return res.status(400).json({ code: 'invalid_email', error: 'Invalid email address' });
    }

    // Only forward allowed fields to Buttondown
    const safeBody = JSON.stringify({ email_address, type: 'regular' });

    const resp = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: safeBody
    });
    const data = await resp.json();

    // Classify Buttondown responses for the client
    if (resp.ok || resp.status === 201) {
      // New subscriber created
      return res.status(201).json({ code: 'subscribed', ...data });
    }

    if (data?.code === 'subscriber_blocked') {
      // Firewall blocked — return 403 so client shows error
      return res.status(403).json({ code: 'blocked', error: '구독이 차단되었습니다. 관리자에게 문의해주세요.' });
    }

    if (data?.code === 'email_already_exists' || data?.detail?.includes?.('already')) {
      // Already subscribed — treat as success
      return res.status(200).json({ code: 'already_subscribed' });
    }

    // Other errors — forward as-is
    res.status(resp.status).json(data);
  } catch (err) {
    res.status(500).json({ code: 'proxy_error', error: 'Proxy error' });
  }
});

app.get('/api/archive', async (req, res) => {
  try {
    const resp = await fetch('https://api.buttondown.email/v1/emails', {
      headers: { 'Authorization': `Token ${BUTTONDOWN_API_KEY}` }
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error' });
  }
});

// Archive by ID — with UUID validation
app.get('/api/archive/:id', async (req, res) => {
  const id = req.params.id;

  // Validate UUID v4 format to prevent path manipulation
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'Invalid archive ID format' });
  }

  try {
    const resp = await fetch(`https://api.buttondown.email/v1/emails/${id}`, {
      headers: { 'Authorization': `Token ${BUTTONDOWN_API_KEY}` }
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error' });
  }
});

// --- GCS Daily Signal Proxy (authenticated via Cloud Run SA) ---
app.get('/api/daily/index', async (req, res) => {
  if (!storage) return res.status(503).json({ error: 'GCS not available' });
  try {
    const [content] = await storage.bucket(GCS_BUCKET).file('daily/index.json').download();
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Content-Type', 'application/json');
    res.send(content);
  } catch (err) {
    res.status(404).json({ error: 'Index not found' });
  }
});

app.get('/api/daily/:date', async (req, res) => {
  if (!storage) return res.status(503).json({ error: 'GCS not available' });
  const dateStr = req.params.date;
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ error: 'Invalid date format' });
  }
  try {
    const [content] = await storage.bucket(GCS_BUCKET).file(`daily/${dateStr}.json`).download();
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Content-Type', 'application/json');
    res.send(content);
  } catch (err) {
    // Do not expose user input in error response
    res.status(404).json({ error: 'Daily signal not found' });
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
  console.log(`[PriSincera] Buttondown API: ${BUTTONDOWN_API_KEY ? 'configured' : 'NOT SET'}`);
});
