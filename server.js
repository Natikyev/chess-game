
Copy

// ============================================================
//  Chess Backend — server.js
//  Express + PostgreSQL + Socket.io + JWT + bcryptjs
// ============================================================
 
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const { Pool }   = require('pg');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const cors       = require('cors');
const path       = require('path');
const { v4: uuidv4 } = require('uuid');
 
const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });
 
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'chess-super-secret-change-in-production-2024';
 
// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));
 
// ── Database ──────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});
 
const dbQuery = (text, params) => pool.query(text, params);
 
async function initDB() {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    username   TEXT NOT NULL UNIQUE,
    email      TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS ratings (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    rating     INTEGER NOT NULL DEFAULT 800,
    wins       INTEGER NOT NULL DEFAULT 0,
    losses     INTEGER NOT NULL DEFAULT 0,
    draws      INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS game_history (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    result        TEXT NOT NULL CHECK(result IN ('win','loss','draw')),
    rating_before INTEGER NOT NULL,
    rating_after  INTEGER NOT NULL,
    rating_change INTEGER NOT NULL,
    ai_level      INTEGER,
    game_mode     TEXT,
    played_at     TIMESTAMP NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_ratings_rating ON ratings(rating DESC)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS offline_challenges (
    id         SERIAL PRIMARY KEY,
    from_user  TEXT NOT NULL,
    to_user    TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    seen       BOOLEAN NOT NULL DEFAULT FALSE
  )`);
  console.log('✅ Database ready');
}
 
initDB().catch(err => { console.error('DB init error:', err); process.exit(1); });
 
// ── Auth Middleware ───────────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    req.userId = jwt.verify(auth.slice(7), JWT_SECRET).userId;
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
}
 
function makeToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}
 
function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}
 
// ── Validation ────────────────────────────────────────────────
function validateUsername(u) {
  if (!u || u.length < 3 || u.length > 20) return 'Username must be 3–20 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(u)) return 'Letters, numbers and underscores only';
  return null;
}
function validatePassword(p) {
  if (!p || p.length < 6) return 'Password must be at least 6 characters';
  return null;
}
function validateEmail(e) {
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Invalid email';
  if (!/^[^\s@]+@gmail\.com$/i.test(e.trim())) return 'Only @gmail.com addresses allowed';
  return null;
}
 
// ── Online Players Store ──────────────────────────────────────
// Map: username → { socketId, rating, username }
const onlinePlayers = new Map();
// Map: roomId → { white, black, started }
const gameRooms = new Map();
// Map: challengeId → { from, to, roomId }
const pendingChallenges = new Map();
 
// ── REST API ──────────────────────────────────────────────────
 
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
 
// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const errU = validateUsername(username); if (errU) return res.status(400).json({ error: errU });
    const errE = validateEmail(email);       if (errE) return res.status(400).json({ error: errE });
    const errP = validatePassword(password); if (errP) return res.status(400).json({ error: errP });
 
    if ((await dbQuery('SELECT id FROM users WHERE LOWER(username)=LOWER($1)', [username])).rows.length)
      return res.status(409).json({ error: 'Username already taken' });
    if ((await dbQuery('SELECT id FROM users WHERE LOWER(email)=LOWER($1)', [email])).rows.length)
      return res.status(409).json({ error: 'Email already registered' });
 
    const hash = await bcrypt.hash(password, 12);
    const ins  = await dbQuery('INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING id',
      [username.trim(), email.toLowerCase().trim(), hash]);
    const userId = ins.rows[0].id;
    await dbQuery('INSERT INTO ratings (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [userId]);
    await dbQuery('UPDATE users SET last_login=NOW() WHERE id=$1', [userId]);
 
    const token  = makeToken(userId);
    const user   = (await dbQuery('SELECT id,username,email,created_at,last_login FROM users WHERE id=$1', [userId])).rows[0];
    const rating = (await dbQuery('SELECT * FROM ratings WHERE user_id=$1', [userId])).rows[0];
    res.status(201).json({ token, user, rating });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Registration failed' }); }
});
 
// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
 
    const row = (await dbQuery('SELECT * FROM users WHERE LOWER(username)=LOWER($1) OR LOWER(email)=LOWER($1)', [username])).rows[0];
    if (!row) return res.status(401).json({ error: 'Invalid username or password' });
 
    if (!await bcrypt.compare(password, row.password)) return res.status(401).json({ error: 'Invalid username or password' });
 
    await dbQuery('UPDATE users SET last_login=NOW() WHERE id=$1', [row.id]);
    const token  = makeToken(row.id);
    const user   = (await dbQuery('SELECT id,username,email,created_at,last_login FROM users WHERE id=$1', [row.id])).rows[0];
    const rating = (await dbQuery('SELECT * FROM ratings WHERE user_id=$1', [row.id])).rows[0];
    res.json({ token, user, rating });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Login failed' }); }
});
 
// GET me
app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const user   = (await dbQuery('SELECT id,username,email,created_at,last_login FROM users WHERE id=$1', [req.userId])).rows[0];
    const rating = (await dbQuery('SELECT * FROM ratings WHERE user_id=$1', [req.userId])).rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user, rating });
  } catch { res.status(500).json({ error: 'Failed' }); }
});
 
// GET history
app.get('/api/me/history', requireAuth, async (req, res) => {
  try {
    const history = (await dbQuery('SELECT * FROM game_history WHERE user_id=$1 ORDER BY played_at DESC LIMIT 20', [req.userId])).rows;
    res.json({ history });
  } catch { res.status(500).json({ error: 'Failed' }); }
});
 
// POST game result
app.post('/api/game/result', requireAuth, async (req, res) => {
  try {
    const { result, ratingBefore, ratingAfter, ratingChange, aiLevel, gameMode } = req.body;
    if (!['win','loss','draw'].includes(result)) return res.status(400).json({ error: 'Invalid result' });
    if (typeof ratingAfter !== 'number') return res.status(400).json({ error: 'Invalid rating' });
 
    const w = result==='win'?1:0, l = result==='loss'?1:0, d = result==='draw'?1:0;
    await dbQuery(`UPDATE ratings SET rating=$1,wins=wins+$2,losses=losses+$3,draws=draws+$4,updated_at=NOW() WHERE user_id=$5`,
      [ratingAfter, w, l, d, req.userId]);
    await dbQuery(`INSERT INTO game_history (user_id,result,rating_before,rating_after,rating_change,ai_level,game_mode) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [req.userId, result, ratingBefore, ratingAfter, ratingChange, aiLevel||null, gameMode||'ai']);
 
    const updated = (await dbQuery('SELECT * FROM ratings WHERE user_id=$1', [req.userId])).rows[0];
    res.json({ rating: updated });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed' }); }
});
 
// GET leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const rows = (await dbQuery(`
      SELECT u.username, r.rating, r.wins, r.losses, r.draws, (r.wins+r.losses+r.draws) AS games
      FROM ratings r JOIN users u ON u.id=r.user_id ORDER BY r.rating DESC LIMIT 50
    `)).rows;
    res.json({ leaderboard: rows });
  } catch { res.status(500).json({ error: 'Failed' }); }
});
 
// POST offline challenge
app.post('/api/challenge/offline', requireAuth, async (req, res) => {
  try {
    const { to } = req.body;
    const fromUser = (await dbQuery('SELECT username FROM users WHERE id=$1', [req.userId])).rows[0];
    if (!fromUser) return res.status(404).json({ error: 'User not found' });
 
    const toUser = (await dbQuery('SELECT id FROM users WHERE LOWER(username)=LOWER($1)', [to])).rows[0];
    if (!toUser) return res.status(404).json({ error: 'Player not found' });
 
    // Check if already sent
    const existing = (await dbQuery(
      'SELECT id FROM offline_challenges WHERE from_user=$1 AND to_user=$2 AND seen=FALSE',
      [fromUser.username, to]
    )).rows[0];
    if (existing) return res.status(409).json({ error: 'Challenge already sent' });
 
    await dbQuery('INSERT INTO offline_challenges (from_user, to_user) VALUES ($1, $2)',
      [fromUser.username, to]);
 
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed' }); }
});
 
// GET my offline challenges (called on login)
app.get('/api/challenge/pending', requireAuth, async (req, res) => {
  try {
    const user = (await dbQuery('SELECT username FROM users WHERE id=$1', [req.userId])).rows[0];
    if (!user) return res.json({ challenges: [] });
 
    const challenges = (await dbQuery(
      `SELECT oc.id, oc.from_user, oc.created_at,
              r.rating as from_rating
       FROM offline_challenges oc
       LEFT JOIN users u ON LOWER(u.username)=LOWER(oc.from_user)
       LEFT JOIN ratings r ON r.user_id=u.id
       WHERE LOWER(oc.to_user)=LOWER($1) AND oc.seen=FALSE
       ORDER BY oc.created_at DESC`,
      [user.username]
    )).rows;
 
    // Mark as seen
    if (challenges.length) {
      await dbQuery('UPDATE offline_challenges SET seen=TRUE WHERE LOWER(to_user)=LOWER($1)', [user.username]);
    }
 
    res.json({ challenges });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed' }); }
});
 
// SEARCH players
app.get('/api/players/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ players: [] });
 
    const rows = (await dbQuery(`
      SELECT u.username, r.rating, r.wins, r.losses, r.draws
      FROM users u JOIN ratings r ON r.user_id=u.id
      WHERE u.username ILIKE $1 LIMIT 10
    `, [`%${q}%`])).rows;
 
    const players = rows.map(p => ({
      ...p,
      online: onlinePlayers.has(p.username)
    }));
    res.json({ players });
  } catch { res.status(500).json({ error: 'Search failed' }); }
});
 
// GET online count
app.get('/api/online', (req, res) => {
  res.json({ count: onlinePlayers.size });
});
 
// ── Socket.io ─────────────────────────────────────────────────
io.on('connection', (socket) => {
  let currentUsername = null;
 
  // Verify token on connect
  const token = socket.handshake.auth?.token;
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      // Will be set when go_online is emitted
    }
  }
 
  // Player comes online
  socket.on('go_online', ({ username, rating }) => {
    currentUsername = username;
    onlinePlayers.set(username, { socketId: socket.id, rating, username });
    io.emit('online_count', onlinePlayers.size);
    console.log(`✅ ${username} online. Total: ${onlinePlayers.size}`);
  });
 
  // Send challenge
  socket.on('send_challenge', ({ to }) => {
    const target = onlinePlayers.get(to);
    if (!target) {
      socket.emit('challenge_declined', { opponent: to });
      return;
    }
    const roomId = uuidv4();
    pendingChallenges.set(roomId, { from: currentUsername, to, roomId });
 
    const fromData = onlinePlayers.get(currentUsername);
    io.to(target.socketId).emit('challenge_received', {
      from: currentUsername,
      rating: fromData?.rating || 800,
      roomId
    });
  });
 
  // Accept challenge
  socket.on('accept_challenge', ({ from, roomId }) => {
    const challenge = pendingChallenges.get(roomId);
    if (!challenge) return;
    pendingChallenges.delete(roomId);
 
    const challenger = onlinePlayers.get(from);
    if (!challenger) return;
 
    // Create game room
    gameRooms.set(roomId, {
      white: from,
      black: currentUsername,
      started: false
    });
 
    // Tell challenger they're white
    io.to(challenger.socketId).emit('challenge_accepted', {
      opponent: currentUsername,
      roomId,
      color: 'white'
    });
 
    // Tell accepter they're black
    socket.emit('challenge_accepted', {
      opponent: from,
      roomId,
      color: 'black'
    });
  });
 
  // Decline challenge
  socket.on('decline_challenge', ({ from }) => {
    const challenger = onlinePlayers.get(from);
    if (challenger) {
      io.to(challenger.socketId).emit('challenge_declined', { opponent: currentUsername });
    }
  });
 
  // Join room
  socket.on('join_room', ({ roomId, username, color }) => {
    socket.join(roomId);
    let room = gameRooms.get(roomId);
    if (!room) {
      // First player arrived — create placeholder
      room = { white: null, black: null, started: false, joinedSockets: new Set() };
      gameRooms.set(roomId, room);
    }
    if (!room.joinedSockets) room.joinedSockets = new Set();
    room.joinedSockets.add(socket.id);
 
    if (room.joinedSockets.size >= 2 && !room.started) {
      room.started = true;
      io.to(roomId).emit('game_start', { roomId });
    }
  });
 
  // Make move
  socket.on('make_move', ({ roomId, from, to, promotion }) => {
    // Broadcast to opponent in room
    socket.to(roomId).emit('opponent_move', { from, to, promotion });
  });
 
  // Chat message
  socket.on('chat_message', ({ roomId, text }) => {
    if (!text || !currentUsername) return;
    const clean = text.slice(0, 200);
    socket.to(roomId).emit('chat_message', { from: currentUsername, text: clean });
  });
 
  // Resign
  socket.on('resign', ({ roomId }) => {
    const room = gameRooms.get(roomId);
    if (!room) return;
    const winner = room.white === currentUsername ? room.black : room.white;
    io.to(roomId).emit('game_over', { reason: 'resign', winner });
    gameRooms.delete(roomId);
  });
 
  // Time out
  socket.on('time_out', ({ roomId }) => {
    const room = gameRooms.get(roomId);
    if (!room) return;
    const winner = room.white === currentUsername ? room.black : room.white;
    io.to(roomId).emit('game_over', { reason: 'timeout', winner });
    gameRooms.delete(roomId);
  });
 
  // Draw offer
  socket.on('offer_draw', ({ roomId }) => {
    socket.to(roomId).emit('draw_offered');
  });
 
  socket.on('accept_draw', ({ roomId }) => {
    io.to(roomId).emit('game_over', { reason: 'draw', winner: null });
    gameRooms.delete(roomId);
  });
 
  socket.on('decline_draw', ({ roomId }) => {
    socket.to(roomId).emit('draw_declined');
  });
 
  // Disconnect
  socket.on('disconnect', () => {
    if (currentUsername) {
      onlinePlayers.delete(currentUsername);
      io.emit('online_count', onlinePlayers.size);
      console.log(`❌ ${currentUsername} offline. Total: ${onlinePlayers.size}`);
 
      // Notify any active game rooms
      for (const [roomId, room] of gameRooms.entries()) {
        if (room.white === currentUsername || room.black === currentUsername) {
          io.to(roomId).emit('opponent_disconnected');
          gameRooms.delete(roomId);
        }
      }
 
      // Cancel pending challenges
      for (const [id, ch] of pendingChallenges.entries()) {
        if (ch.from === currentUsername) {
          const target = onlinePlayers.get(ch.to);
          if (target) io.to(target.socketId).emit('challenge_cancelled', { from: currentUsername });
          pendingChallenges.delete(id);
        }
      }
    }
  });
});
 
// ── Catch-all ─────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.redirect('/home.html');
});
 
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
 
// ── Start ─────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`♟  Chess backend running at http://localhost:${PORT}`);
});
