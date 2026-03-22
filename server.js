// ============================================================
//  Chess Backend — server.js  (PostgreSQL version)
//  Express + pg + JWT + bcryptjs
// ============================================================

const express  = require('express');
const { Pool } = require('pg');
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
app.use(express.static(path.join(__dirname, '.')));

// ── Database Setup (PostgreSQL) ───────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const dbQuery = (text, params) => pool.query(text, params);

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      username    TEXT    NOT NULL UNIQUE,
      email       TEXT    NOT NULL UNIQUE,
      password    TEXT    NOT NULL,
      created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
      last_login  TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ratings (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      rating      INTEGER NOT NULL DEFAULT 800,
      wins        INTEGER NOT NULL DEFAULT 0,
      losses      INTEGER NOT NULL DEFAULT 0,
      draws       INTEGER NOT NULL DEFAULT 0,
      updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS game_history (
      id            SERIAL PRIMARY KEY,
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      result        TEXT    NOT NULL CHECK(result IN ('win','loss','draw')),
      rating_before INTEGER NOT NULL,
      rating_after  INTEGER NOT NULL,
      rating_change INTEGER NOT NULL,
      ai_level      INTEGER,
      game_mode     TEXT,
      played_at     TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_ratings_rating ON ratings(rating DESC)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_game_history_user ON game_history(user_id, played_at DESC)`);
  console.log('✅ Database tables ready');
}

initDB().catch(err => {
  console.error('DB init error:', err);
  process.exit(1);
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

    const existName = await dbQuery('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    if (existName.rows.length) return res.status(409).json({ error: 'Username already taken' });

    const existEmail = await dbQuery('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existEmail.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const insert = await dbQuery(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username.trim(), email.toLowerCase().trim(), hash]
    );
    const userId = insert.rows[0].id;
    await dbQuery('INSERT INTO ratings (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [userId]);
    await dbQuery('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);

    const token  = makeToken(userId);
    const user   = (await dbQuery('SELECT id, username, email, created_at, last_login FROM users WHERE id = $1', [userId])).rows[0];
    const rating = (await dbQuery('SELECT * FROM ratings WHERE user_id = $1', [userId])).rows[0];

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

    const result = await dbQuery(
      'SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)',
      [username]
    );
    const row = result.rows[0];
    if (!row) return res.status(401).json({ error: 'Invalid username or password' });

    const match = await bcrypt.compare(password, row.password);
    if (!match) return res.status(401).json({ error: 'Invalid username or password' });

    await dbQuery('UPDATE users SET last_login = NOW() WHERE id = $1', [row.id]);

    const token  = makeToken(row.id);
    const user   = (await dbQuery('SELECT id, username, email, created_at, last_login FROM users WHERE id = $1', [row.id])).rows[0];
    const rating = (await dbQuery('SELECT * FROM ratings WHERE user_id = $1', [row.id])).rows[0];

    res.json({ token, user, rating });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET profile
app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const user   = (await dbQuery('SELECT id, username, email, created_at, last_login FROM users WHERE id = $1', [req.userId])).rows[0];
    const rating = (await dbQuery('SELECT * FROM ratings WHERE user_id = $1', [req.userId])).rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user, rating });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET history
app.get('/api/me/history', requireAuth, async (req, res) => {
  try {
    const history = (await dbQuery(
      'SELECT * FROM game_history WHERE user_id = $1 ORDER BY played_at DESC LIMIT 20',
      [req.userId]
    )).rows;
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

    await dbQuery(
      `UPDATE ratings SET rating = $1, wins = wins + $2, losses = losses + $3, draws = draws + $4, updated_at = NOW()
       WHERE user_id = $5`,
      [ratingAfter, wins, losses, draws, req.userId]
    );
    await dbQuery(
      `INSERT INTO game_history (user_id, result, rating_before, rating_after, rating_change, ai_level, game_mode)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [req.userId, result, ratingBefore, ratingAfter, ratingChange, aiLevel || null, gameMode || 'ai']
    );

    const updated = (await dbQuery('SELECT * FROM ratings WHERE user_id = $1', [req.userId])).rows[0];
    res.json({ rating: updated });
  } catch (err) {
    console.error('Save result error:', err);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

// GET leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const rows = (await dbQuery(`
      SELECT u.username, r.rating, r.wins, r.losses, r.draws,
             (r.wins + r.losses + r.draws) AS games
      FROM ratings r JOIN users u ON u.id = r.user_id
      ORDER BY r.rating DESC LIMIT 50
    `)).rows;
    res.json({ leaderboard: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ── Catch-all ─────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`♟  Chess backend running at http://localhost:${PORT}`);
  console.log(`   Game: http://localhost:${PORT}/index.html`);
  console.log(`   API:  http://localhost:${PORT}/api/health`);
});
