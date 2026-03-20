// ============================================================
//  auth.js — Chess Auth Module (Gmail-only, multi-page)
//  Include BEFORE chess.js in chess.html
// ============================================================

const API_BASE = 'https://chess-game-xxxx.onrender.com/api';

// ── Gmail-only enforcement ────────────────────────────────────
function isGmailAddress(email) {
  return /^[^\s@]+@gmail\.com$/i.test(email.trim());
}

// ── Auth State ────────────────────────────────────────────────
window.authState = {
  token:  localStorage.getItem('chess_token')  || null,
  user:   JSON.parse(localStorage.getItem('chess_user')   || 'null'),
  rating: JSON.parse(localStorage.getItem('chess_rating') || 'null'),
  loggedIn() { return !!this.token && !!this.user; }
};

function saveAuth(token, user, rating) {
  authState.token  = token;
  authState.user   = user;
  authState.rating = rating;
  localStorage.setItem('chess_token',  token);
  localStorage.setItem('chess_user',   JSON.stringify(user));
  localStorage.setItem('chess_rating', JSON.stringify(rating));
}

function clearAuth() {
  authState.token = authState.user = authState.rating = null;
  localStorage.removeItem('chess_token');
  localStorage.removeItem('chess_user');
  localStorage.removeItem('chess_rating');
}

// ── Gmail Validation ──────────────────────────────────────────
function isGmail(email) {
  return /^[^\s@]+@gmail\.com$/i.test((email || '').trim());
}

// ── API Helpers ───────────────────────────────────────────────
async function apiRequest(method, endpoint, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (authState.token) headers['Authorization'] = 'Bearer ' + authState.token;
  const res = await fetch(API_BASE + endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Inject Nav + History modal into chess.html ────────────────
function injectAuthUI() {
  const navStyle = document.createElement('style');
  navStyle.textContent = `
    #chess-nav {
      width: 100%; max-width: 820px;
      display: flex; align-items: center; justify-content: space-between;
      background: #1e1b18; border: 1px solid #4a443f; border-radius: 10px;
      padding: 10px 18px; margin-bottom: 12px;
      font-family: 'DM Mono', monospace;
    }
    .cn-brand { font-family:'Playfair Display',serif; font-size:1.1rem; color:#d4a843; text-decoration:none; }
    .cn-links  { display:flex; align-items:center; gap:8px; }
    .cn-btn {
      padding:5px 12px; border:1px solid #4a443f; border-radius:5px;
      background:transparent; color:#9e9187;
      font-family:'DM Mono',monospace; font-size:.6rem;
      cursor:pointer; text-decoration:none; transition:all .15s; display:inline-block;
    }
    .cn-btn:hover { border-color:#d4a843; color:#d4a843; }
    .cn-btn.primary { border-color:#d4a843; color:#d4a843; }
    .cn-btn.primary:hover { background:rgba(212,168,67,.1); }
    .cn-user   { font-size:.6rem; color:#d4a843; font-weight:600; }
    .cn-rating { font-size:.6rem; color:#f0ead6; margin-left:2px; }

    #history-modal {
      display:none; position:fixed; inset:0; z-index:10000;
      align-items:center; justify-content:center;
    }
    #history-modal.show { display:flex; }
    .auth-backdrop { position:absolute; inset:0; background:rgba(0,0,0,.72); backdrop-filter:blur(4px); }
    .auth-box {
      position:relative; background:#1e1b18; border:1px solid #4a443f;
      border-radius:12px; padding:32px 30px 28px; width:380px; max-width:94vw;
      box-shadow:0 24px 80px rgba(0,0,0,.8); animation:authPop .22s ease;
    }
    @keyframes authPop { from{transform:scale(.93);opacity:0} to{transform:scale(1);opacity:1} }
    .auth-close { position:absolute; top:14px; right:16px; background:none; border:none; color:#9e9187; font-size:1rem; cursor:pointer; line-height:1; }
    .auth-close:hover { color:#f0ead6; }
    .lb-title { font-family:'Playfair Display',serif; color:#d4a843; text-align:center; margin-bottom:16px; font-size:1.1rem; }
    .lb-loading { text-align:center; color:#9e9187; padding:20px; font-size:.68rem; }
    .lb-list { max-height:360px; overflow-y:auto; scrollbar-width:thin; }
    .hist-row { display:flex; gap:10px; align-items:center; padding:7px 10px; border-radius:5px; font-size:.63rem; }
    .hist-row:hover { background:rgba(255,255,255,.04); }
    .hist-result { width:36px; text-align:center; font-weight:600; }
    .hist-result.win  { color:#5dba60; }
    .hist-result.loss { color:#e05050; }
    .hist-result.draw { color:#d4a843; }
    .hist-change { min-width:42px; text-align:right; }
    .hist-change.pos { color:#5dba60; }
    .hist-change.neg { color:#e05050; }
    .hist-change.neu { color:#d4a843; }
    .hist-date { color:#9e9187; font-size:.58rem; margin-left:auto; }
  `;
  document.head.appendChild(navStyle);

  // Nav bar — injected before <header>
  const nav = document.createElement('div');
  nav.id = 'chess-nav';
  const header = document.querySelector('header');
  if (header) header.before(nav);
  else document.body.prepend(nav);

  // History modal
  const hm = document.createElement('div');
  hm.id = 'history-modal';
  hm.innerHTML = `
    <div class="auth-backdrop" onclick="closeHistory()"></div>
    <div class="auth-box">
      <button class="auth-close" onclick="closeHistory()">✕</button>
      <h2 class="lb-title">📜 My Games &nbsp;<a href="history.html" style="font-size:.62rem;font-family:'DM Mono',monospace;color:#d4a843;text-decoration:none">↗ Full page</a></h2>
      <div class="lb-list" id="hist-list"><div class="lb-loading">Loading…</div></div>
    </div>
  `;
  document.body.appendChild(hm);

  updateNav();
}

// ── Nav rendering ─────────────────────────────────────────────
function updateNav() {
  const nav = document.getElementById('chess-nav');
  if (!nav) return;
  if (authState.loggedIn()) {
    const r = authState.rating;
    nav.innerHTML = `
      <a class="cn-brand" href="chess.html">♟ Chess</a>
      <div class="cn-links">
        <span class="cn-user">👤 ${authState.user.username}</span>
        <span class="cn-rating">⚡${r ? r.rating : '—'}</span>
        <a class="cn-btn" href="leaderboard.html">🏆 Leaderboard</a>
        <a class="cn-btn" onclick="showHistory()" style="cursor:pointer">📜 History</a>
        <a class="cn-btn" onclick="doLogout()" style="cursor:pointer">Sign Out</a>
      </div>
    `;
  } else {
    nav.innerHTML = `
      <a class="cn-brand" href="chess.html">♟ Chess</a>
      <div class="cn-links">
        <span style="font-size:.6rem;color:#9e9187">Playing as guest</span>
        <a class="cn-btn" href="leaderboard.html">🏆 Leaderboard</a>
        <a class="cn-btn primary" href="index.html">Sign In</a>
      </div>
    `;
  }
}

// ── History modal ─────────────────────────────────────────────
function showHistory() {
  document.getElementById('history-modal').classList.add('show');
  loadHistory();
}
function closeHistory() {
  document.getElementById('history-modal').classList.remove('show');
}

// ── Logout ────────────────────────────────────────────────────
function doLogout() {
  clearAuth();
  updateNav();
  showToast('Signed out. Your rating was saved. ♟');
}

// ── Sync rating from server → game ───────────────────────────
function syncRatingFromServer() {
  if (!authState.loggedIn() || !authState.rating) return;
  if (typeof playerRating !== 'undefined') playerRating = authState.rating.rating;
  if (typeof stats !== 'undefined' && authState.rating) {
    stats.wins   = authState.rating.wins;
    stats.losses = authState.rating.losses;
    stats.draws  = authState.rating.draws;
  }
  if (typeof updateRatingBar === 'function') updateRatingBar();
}

// ── Save game result to server ────────────────────────────────
window.saveResultToServer = async function(result, ratingBefore, ratingAfter, ratingChange, aiLevel, gameMode) {
  if (!authState.loggedIn()) return;
  try {
    const data = await apiRequest('POST', '/game/result', {
      result, ratingBefore, ratingAfter, ratingChange,
      aiLevel: aiLevel || null,
      gameMode: gameMode || 'ai'
    });
    authState.rating = data.rating;
    localStorage.setItem('chess_rating', JSON.stringify(data.rating));
    updateNav();
  } catch (err) {
    console.warn('Could not save result to server:', err.message);
  }
};

// ── Load history (inline modal) ───────────────────────────────
async function loadHistory() {
  const el = document.getElementById('hist-list');
  el.innerHTML = '<div class="lb-loading">Loading…</div>';
  try {
    const data = await apiRequest('GET', '/me/history');
    if (!data.history.length) {
      el.innerHTML = '<div class="lb-loading">No games yet — play some!</div>';
      return;
    }
    el.innerHTML = data.history.map(g => {
      const ch      = g.rating_change;
      const chClass = ch > 0 ? 'pos' : ch < 0 ? 'neg' : 'neu';
      const chStr   = (ch >= 0 ? '+' : '') + ch;
      const date    = new Date(g.played_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return `
        <div class="hist-row">
          <span class="hist-result ${g.result}">${g.result.toUpperCase()}</span>
          <span style="color:#9e9187;font-size:.6rem">vs AI Lvl ${g.ai_level || '?'}</span>
          <span>${g.rating_before} → ${g.rating_after}</span>
          <span class="hist-change ${chClass}">${chStr}</span>
          <span class="hist-date">${date}</span>
        </div>
      `;
    }).join('');
  } catch {
    el.innerHTML = '<div class="lb-loading">Could not load history.</div>';
  }
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById('auth-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'auth-toast';
    toast.style.cssText = `
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
      background:#d4a843; color:#1a1815; padding:10px 22px; border-radius:8px;
      font-family:'DM Mono',monospace; font-size:.68rem; font-weight:600;
      box-shadow:0 4px 20px rgba(0,0,0,.5); z-index:99999;
      transition:opacity .3s; pointer-events:none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectAuthUI();
  if (authState.token) {
    apiRequest('GET', '/me')
      .then(data => {
        authState.user   = data.user;
        authState.rating = data.rating;
        localStorage.setItem('chess_user',   JSON.stringify(data.user));
        localStorage.setItem('chess_rating', JSON.stringify(data.rating));
        updateNav();
        syncRatingFromServer();
      })
      .catch(() => {
        clearAuth();
        updateNav();
      });
  }
});
