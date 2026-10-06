import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';

const PORT = Number(process.env.PORT || 3001);

// --- Database -------------------------------------------------------------
// MySQL rather than a file-based store: Plesk Windows hosting does not grant
// write access to the site directory, and mysql2 is pure JS so there is no
// native module to compile on the server.

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  waitForConnections: true,
  connectionLimit: 5,
});

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(200) NOT NULL,
    organization VARCHAR(200) NOT NULL,
    interest VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    ip VARCHAR(45) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`;

let dbReady = false;

async function initDb() {
  try {
    await pool.query(CREATE_TABLE);
    dbReady = true;
    console.log('Database ready (contact_submissions).');
  } catch (err) {
    // Keep serving the site: only the contact endpoint depends on the database.
    dbReady = false;
    console.error('Database init failed. The site will still serve; /api/contact will return 503.');
    console.error(err instanceof Error ? err.message : err);
  }
}

// --- App ------------------------------------------------------------------

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(express.json({ limit: '32kb' }));

// Simple fixed-window rate limit per IP: 5 submissions per hour
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanField(value: unknown, maxLen: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLen) return null;
  return trimmed;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: dbReady ? 'connected' : 'unavailable' });
});

app.post('/api/contact', async (req, res) => {
  const ip = req.ip || 'unknown';

  // Honeypot: bots fill the hidden "website" field. Pretend success, store nothing.
  if (typeof req.body?.website === 'string' && req.body.website.trim() !== '') {
    return res.json({ ok: true });
  }

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
  }

  const fullName = cleanField(req.body?.fullName, 120);
  const email = cleanField(req.body?.email, 200);
  const organization = cleanField(req.body?.organization, 200);
  const interest = cleanField(req.body?.interest, 200);
  const message = cleanField(req.body?.message, 5000);

  if (!fullName || !email || !organization || !interest || !message) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    // Parameterised query: values are never interpolated into the SQL.
    await pool.execute(
      `INSERT INTO contact_submissions
         (full_name, email, organization, interest, message, ip)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, email, organization, interest, message, ip.slice(0, 45)]
    );
    dbReady = true;
    res.json({ ok: true });
  } catch (err) {
    console.error('Contact insert failed:', err instanceof Error ? err.message : err);
    res.status(503).json({
      error: 'We could not save your message right now. Please email info@matrixgambia.com.',
    });
  }
});

// --- Static frontend ------------------------------------------------------

const distDir = fs.existsSync(path.resolve(process.cwd(), 'dist'))
  ? path.resolve(process.cwd(), 'dist')
  : path.resolve(__dirname, 'dist');

if (fs.existsSync(distDir)) {
  app.use(
    express.static(distDir, {
      setHeaders: (res, filePath) => {
        // Hashed asset filenames can be cached hard; index.html must not be.
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    })
  );
  // SPA fallback: let React Router handle all non-API routes
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  console.warn(`No frontend build found at ${distDir}. Serving API only.`);
}

app.listen(PORT, () => {
  console.log(`Matrix Solutions site listening on port ${PORT}`);
  void initDb();
});
