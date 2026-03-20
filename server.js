// ============================================================
//  Chess Backend — server.js  (Production-ready for Render)
//  Express + sqlite3 + JWT + bcryptjs
// ============================================================

const express  = require('express');
const sqlite3  = require('sqlite3').verbose();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const cors     = require('cors');
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'chess-super-secret-change-in-production-2024';

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Serve all frontend HTML/JS files from the same folder
app.use(express.static(path.join(__dirname, '.')));

// ── Database Setup ────────────────────────────────────────────
// On Render free tier, use /tmp for writable storage (note: resets on redeploy)
const DB_PATH = process.env.NODE_ENV === 'production'
  ? '/tmp/chess.db'
  : path.join(__dirname, 'chess.db');

const db = new sqlite3.Database(DB_PATH, err => {
  if (err) { console.error('DB open error:', err); process.exit(1); }
  console.log('✅ Database ready:', DB_PATH);
});

const dbRun = (sql, params = []) => new Promise((res, rej) =>
  db.run(sql, params, function(err) { err ? rej(err) : res(this); })
);
const dbGet = (sql, params = []) => new Promise((res, rej) =>
  db.get(sql, params, (err, row) => err ? rej(err) : res(row))
);
const dbAll = (sql, params = []) => new Promise((res, rej) =>
  db.all(sql, params, (err, rows) => err ? rej(err) : res(rows))
);

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    email       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password    TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    last_login  TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS ratings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL DEFAULT 800,
    wins        INTEGER NOT NULL DEFAULT 0,
    losses      INTEGER NOT NULL DEFAULT 0,
    draws       INTEGER NOT NULL DEFAULT 0,
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS game_history (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    result        TEXT    NOT NULL CHECK(result IN ('win','loss','draw')),
    rating_before INTEGER NOT NULL,
    rating_after  INTEGER NOT NULL,
    rating_change INTEGER NOT NULL,
    ai_level      INTEGER,
    game_mode     TEXT,
    played_at     TEXT    NOT NULL DEFAULT (datetime('now'))
  )`);
  db.run('CREATE INDEX IF NOT EXISTS idx_ratings_rating ON ratings(rating DESC)');
  db.run('CREATE INDEX IF NOT EXISTS idx_game_history_user ON game_history(user_id, played_at DESC)');
});

// ── Auth Middleware ───────────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function makeToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

// ── Validation ────────────────────────────────────────────────
function validateUsername(u) {
  if (!u || u.length < 3 || u.length > 20) return 'Username must be 3–20 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(u)) return 'Username may only contain letters, numbers and underscores';
  return null;
}
function validatePassword(p) {
  if (!p || p.length < 6) return 'Password must be at least 6 characters';
  return null;
}
function validateEmail(e) {
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Invalid email address';
  if (!/^[^\s@]+@gmail\.com$/i.test(e.trim())) return 'Only @gmail.com addresses are allowed';
  return null;
}

// ── Routes ────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const errU = validateUsername(username);  if (errU) return res.status(400).json({ error: errU });
    const errE = validateEmail(email);        if (errE) return res.status(400).json({ error: errE });
    const errP = validatePassword(password);  if (errP) return res.status(400).json({ error: errP });

    const existName  = await dbGet('SELECT id FROM users WHERE username = ? COLLATE NOCASE', [username]);
    if (existName)  return res.status(409).json({ error: 'Username already taken' });
    const existEmail = await dbGet('SELECT id FROM users WHERE email = ? COLLATE NOCASE', [email.toLowerCase().trim()]);
    if (existEmail) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const insert = await dbRun(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username.trim(), email.toLowerCase().trim(), hash]
    );
    const userId = insert.lastID;
    await dbRun('INSERT OR IGNORE INTO ratings (user_id) VALUES (?)', [userId]);
    await dbRun("UPDATE users SET last_login = datetime('now') WHERE id = ?", [userId]);

    const token  = makeToken(userId);
    const user   = await dbGet('SELECT id, username, email, created_at, last_login FROM users WHERE id = ?', [userId]);
    const rating = await dbGet('SELECT * FROM ratings WHERE user_id = ?', [userId]);

    res.status(201).json({ token, user, rating });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const row = await dbGet('SELECT * FROM users WHERE username = ? COLLATE NOCASE', [username])
             || await dbGet('SELECT * FROM users WHERE email = ? COLLATE NOCASE',    [username.toLowerCase()]);
    if (!row) return res.status(401).json({ error: 'Invalid username or password' });

    const match = await bcrypt.compare(password, row.password);
    if (!match)  return res.status(401).json({ error: 'Invalid username or password' });

    await dbRun("UPDATE users SET last_login = datetime('now') WHERE id = ?", [row.id]);

    const token  = makeToken(row.id);
    const user   = await dbGet('SELECT id, username, email, created_at, last_login FROM users WHERE id = ?', [row.id]);
    const rating = await dbGet('SELECT * FROM ratings WHERE user_id = ?', [row.id]);

    res.json({ token, user, rating });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET profile
app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const user   = await dbGet('SELECT id, username, email, created_at, last_login FROM users WHERE id = ?', [req.userId]);
    const rating = await dbGet('SELECT * FROM ratings WHERE user_id = ?', [req.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user, rating });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET history
app.get('/api/me/history', requireAuth, async (req, res) => {
  try {
    const history = await dbAll(
      'SELECT * FROM game_history WHERE user_id = ? ORDER BY played_at DESC LIMIT 20',
      [req.userId]
    );
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// SAVE game result
app.post('/api/game/result', requireAuth, async (req, res) => {
  try {
    const { result, ratingBefore, ratingAfter, ratingChange, aiLevel, gameMode } = req.body;
    if (!['win','loss','draw'].includes(result)) return res.status(400).json({ error: 'Invalid result' });
    if (typeof ratingAfter !== 'number')         return res.status(400).json({ error: 'Invalid rating' });

    const wins   = result === 'win'  ? 1 : 0;
    const losses = result === 'loss' ? 1 : 0;
    const draws  = result === 'draw' ? 1 : 0;

    await dbRun(
      `UPDATE ratings SET rating = ?, wins = wins + ?, losses = losses + ?, draws = draws + ?,
       updated_at = datetime('now') WHERE user_id = ?`,
      [ratingAfter, wins, losses, draws, req.userId]
    );
    await dbRun(
      `INSERT INTO game_history (user_id, result, rating_before, rating_after, rating_change, ai_level, game_mode)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, result, ratingBefore, ratingAfter, ratingChange, aiLevel || null, gameMode || 'ai']
    );

    const updated = await dbGet('SELECT * FROM ratings WHERE user_id = ?', [req.userId]);
    res.json({ rating: updated });
  } catch (err) {
    console.error('Save result error:', err);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

// GET leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT u.username, r.rating, r.wins, r.losses, r.draws,
             (r.wins + r.losses + r.draws) AS games
      FROM ratings r JOIN users u ON u.id = r.user_id
      ORDER BY r.rating DESC LIMIT 50
    `);
    res.json({ leaderboard: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ── Catch-all: serve index.html for any unknown route ─────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`♟  Chess backend running at http://localhost:${PORT}`);
  console.log(`   Game: http://localhost:${PORT}/index.html`);
  console.log(`   API:  http://localhost:${PORT}/api/health`);
});
