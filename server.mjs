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

// --- Security headers ---
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
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
app.post('/api/subscribe', async (req, res) => {
  try {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const resp = await fetch('https://api.buttondown.email/v1/subscribers', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${BUTTONDOWN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body
      });
      const data = await resp.json();
      res.status(resp.status).json(data);
    });
  } catch (err) {
    res.status(500).json({ error: 'Proxy error' });
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

app.get('/api/archive/:id', async (req, res) => {
  try {
    const resp = await fetch(`https://api.buttondown.email/v1/emails/${req.params.id}`, {
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
    res.status(404).json({ error: 'Daily signal not found', date: dateStr });
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
