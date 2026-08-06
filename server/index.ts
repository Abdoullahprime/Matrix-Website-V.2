import 'dotenv/config';
import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const PORT = Number(process.env.PORT || 3001);

// --- Database -------------------------------------------------------------

const dataDir = path.resolve(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'contacts.db'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    organization TEXT NOT NULL,
    interest TEXT NOT NULL,
    message TEXT NOT NULL,
    ip TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const insertSubmission = db.prepare(`
  INSERT INTO contact_submissions (full_name, email, organization, interest, message, ip)
  VALUES (@fullName, @email, @organization, @interest, @message, @ip)
`);

// --- App ------------------------------------------------------------------

const app = express();
app.disable('x-powered-by');
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
  res.json({ ok: true });
});

app.post('/api/contact', (req, res) => {
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

  insertSubmission.run({ fullName, email, organization, interest, message, ip });
  res.json({ ok: true });
});

// --- Static frontend (production) ----------------------------------------

const distDir = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  // SPA fallback: let React Router handle all non-API routes
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Matrix Solutions API listening on http://localhost:${PORT}`);
});
