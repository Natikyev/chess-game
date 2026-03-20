// ============================================================
//  CHESS.JS  — Stockfish 17 + time-based search + rating
//  Enhanced: Animations | 2-Player | Sound | Opening Hints
// ============================================================

// ── SVG Pieces ───────────────────────────────────────────────
const SVG = {
  wK:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-6.5-6-13 2c-3 4.5 3 10.5 3 10.5v7" fill="#fff"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g></svg>`,
  wQ:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/><path d="M9 26c8.5-8.5 15.5-9 22.5-.5" stroke-linecap="butt"/><path d="M9 26c1 2.5 3 2 4.5 4 1.5 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1.5-2 3.5-1.5 4.5-4-8-8-14-8.5-22.5-.5z"/><path d="M11.5 30c3.5-6 10.5-6 14 0" fill="none" stroke-linecap="butt"/><path d="M11.5 33.5h22M12 36.5h21M9.5 38h26" fill="none"/></g></svg>`,
  wR:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zm3-3V12h21v24H12zm-4-21V9h5v2h5V9h4v2h5V9h5v6H8z" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" fill="#fff" stroke-linecap="butt"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" stroke-linejoin="miter"/></g></svg>`,
  wB:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#fff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><circle cx="22.5" cy="8" r="2.5"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke-linejoin="miter"/></g></svg>`,
  wN:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff"/><path d="M24 18c.38 5.12-4.12 6.51-6.5 3.5" fill="#fff"/><path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" fill="#000" stroke="#000"/><path d="M14.933 15.75a5 5 0 0 1-6.183 6.433" stroke-linecap="butt"/><path d="M12.5 36.5v-1.5c2 .5 6 .5 8 0v1.5" fill="#fff"/></g></svg>`,
  wP:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  bK:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#1a1a1a" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-6.5-6-13 2c-3 4.5 3 10.5 3 10.5v7" fill="#1a1a1a"/><path d="M20 8h5" stroke-linejoin="miter"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#ccc"/></g></svg>`,
  bQ:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#1a1a1a" stroke="#000" stroke-width="1.5" stroke-linejoin="round"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/><path d="M9 26c8.5-8.5 15.5-9 22.5-.5" stroke-linecap="butt"/><path d="M9 26c1 2.5 3 2 4.5 4 1.5 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1.5-2 3.5-1.5 4.5-4-8-8-14-8.5-22.5-.5z"/><path d="M11.5 30c3.5-6 10.5-6 14 0" fill="none" stroke="#ccc" stroke-linecap="butt"/><path d="M11.5 33.5h22M12 36.5h21M9.5 38h26" fill="none" stroke="#ccc"/></g></svg>`,
  bR:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#1a1a1a" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zm3-3V12h21v24H12zm-4-21V9h5v2h5V9h4v2h5V9h5v6H8z" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke-linecap="butt"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" stroke="#ccc" stroke-linejoin="miter"/><path d="M9 39h27M12 36h21" fill="none" stroke="#ccc"/></g></svg>`,
  bB:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#1a1a1a" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><circle cx="22.5" cy="8" r="2.5"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#ccc" stroke-linejoin="miter"/></g></svg>`,
  bN:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#1a1a1a"/><path d="M24 18c.38 5.12-4.12 6.51-6.5 3.5" fill="#1a1a1a"/><path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" fill="#ccc" stroke="#ccc"/><path d="M14.933 15.75a5 5 0 0 1-6.183 6.433" stroke-linecap="butt"/><path d="M12.5 36.5v-1.5c2 .5 6 .5 8 0v1.5" fill="#1a1a1a"/></g></svg>`,
  bP:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#1a1a1a" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></svg>`
};

function makePieceImg(key) {
  const svg = SVG[key];
  if (!svg) return null;
  const img = document.createElement('img');
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  img.draggable = false;
  return img;
}

// ── Sound Engine ──────────────────────────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let soundEnabled = true;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

// ── Chess.com-style sound engine ─────────────────────────────
// Uses white noise bursts shaped through bandpass filters to mimic
// the real woody "clack" of a piece hitting a board.

function makeNoiseBurst(ctx, startTime, duration, vol) {
  const bufLen = Math.ceil(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);
  const src = ctx.createBufferSource();
  src.buffer = buf;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  src.connect(gain);
  gain.connect(ctx.destination);
  src.start(startTime);
  src.stop(startTime + duration);
  return { src, gain };
}

function makeWoodClack(ctx, startTime, freq, vol, dur) {
  // Tonal body — short decaying tone for wood resonance
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  const bpf = ctx.createBiquadFilter();

  bpf.type = 'bandpass';
  bpf.frequency.setValueAtTime(freq, startTime);
  bpf.Q.value = 8;

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, startTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.6, startTime + dur);

  oscGain.gain.setValueAtTime(vol, startTime);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

  osc.connect(bpf);
  bpf.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + dur);

  // High-freq click attack (noise transient)
  const clickBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.012), ctx.sampleRate);
  const cd = clickBuf.getChannelData(0);
  for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1) * (1 - i / cd.length);
  const clickSrc = ctx.createBufferSource();
  clickSrc.buffer = clickBuf;
  const hpf = ctx.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.value = 2000;
  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(vol * 1.4, startTime);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.012);
  clickSrc.connect(hpf);
  hpf.connect(clickGain);
  clickGain.connect(ctx.destination);
  clickSrc.start(startTime);
  clickSrc.stop(startTime + 0.015);
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    if (type === 'move') {
      // Chess.com move: crisp wood clack, ~400Hz resonance, short decay
      makeWoodClack(ctx, now, 420, 0.28, 0.09);

    } else if (type === 'capture') {
      // Heavier double-impact: low thud + high crack
      makeWoodClack(ctx, now,        220, 0.35, 0.13);  // low body
      makeWoodClack(ctx, now + 0.01, 680, 0.20, 0.07);  // high crack
      makeNoiseBurst(ctx, now, 0.05, 0.12);

    } else if (type === 'castle') {
      // Two pieces landing in quick succession
      makeWoodClack(ctx, now,       400, 0.25, 0.09);
      makeWoodClack(ctx, now + 0.1, 380, 0.22, 0.09);

    } else if (type === 'check') {
      // Chess.com check: move sound + sharp high ding
      makeWoodClack(ctx, now, 420, 0.25, 0.09);
      // Bell-like ding
      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(1320, now + 0.05);
      bell.frequency.exponentialRampToValueAtTime(1100, now + 0.3);
      bellGain.gain.setValueAtTime(0.18, now + 0.05);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      bell.connect(bellGain); bellGain.connect(ctx.destination);
      bell.start(now + 0.05); bell.stop(now + 0.38);

    } else if (type === 'win') {
      // Chess.com victory: rising bright arpeggio
      const notes = [523, 659, 784, 1047, 1319];
      notes.forEach((f, i) => {
        const t = now + i * 0.1;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.38);
        // add harmonic
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.value = f * 2;
        g2.gain.setValueAtTime(0.06, t);
        g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        osc2.connect(g2); g2.connect(ctx.destination);
        osc2.start(t); osc2.stop(t + 0.22);
      });

    } else if (type === 'lose') {
      // Descending somber tones
      const notes = [392, 370, 330, 294, 262];
      notes.forEach((f, i) => {
        const t = now + i * 0.13;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        g.gain.setValueAtTime(0.14, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.4);
      });

    } else if (type === 'draw') {
      // Two neutral tones
      [440, 466].forEach((f, i) => {
        const t = now + i * 0.18;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        g.gain.setValueAtTime(0.13, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.35);
      });

    } else if (type === 'hint') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.08);
      g.gain.setValueAtTime(0.09, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.15);
    }
  } catch(e) {}
}

// ── Opening Book ──────────────────────────────────────────────
// Key = moves played so far (space-separated UCI), value = {move, name, desc}
const OPENINGS = {
  '': [
    {move:'e2e4', name:'King\'s Pawn', desc:'Controls the center immediately. Most popular opening move.'},
    {move:'d2d4', name:'Queen\'s Pawn', desc:'Controls the center with the queen\'s pawn. Leads to solid positions.'},
    {move:'g1f3', name:'Réti Opening', desc:'Hypermodern — controls center from a distance with pieces, not pawns.'},
    {move:'c2c4', name:'English Opening', desc:'Flexible flank opening that can transpose to many structures.'}
  ],
  'e2e4': [
    {move:'e7e5', name:'Open Game', desc:'Mirror response — fight for the center immediately.'},
    {move:'c7c5', name:'Sicilian Defense', desc:'Most popular reply. Fights for d4 without mirroring White.'},
    {move:'e7e6', name:'French Defense', desc:'Solid but slightly passive. Aims to challenge e4 with d5 later.'},
    {move:'c7c6', name:'Caro-Kann', desc:'Solid defense — d5 next, avoiding the locked French bishop.'}
  ],
  'd2d4': [
    {move:'d7d5', name:'Closed Game', desc:'Symmetric — both sides fight for the center.'},
    {move:'g8f6', name:'Indian Defense', desc:'Hypermodern — lets White take the center, then attack it.'},
    {move:'f7f5', name:'Dutch Defense', desc:'Aggressive — controls e4 at the cost of weakening the kingside.'}
  ],
  'e2e4 e7e5': [
    {move:'g1f3', name:'King\'s Knight', desc:'Develops a piece and attacks e5 — most natural continuation.'},
    {move:'f2f4', name:'King\'s Gambit', desc:'Aggressive — offers a pawn to seize the center.'},
    {move:'d2d4', name:'Center Game', desc:'Immediate central pawn tension.'}
  ],
  'e2e4 c7c5': [
    {move:'g1f3', name:'Sicilian — Open', desc:'Most common. White prepares d4 to blow open the center.'},
    {move:'b1c3', name:'Sicilian — Closed', desc:'Slower approach, avoiding Sicilian theory.'},
    {move:'c2c3', name:'Alapin Variation', desc:'Solid — prepares d4 with a pawn.'}
  ],
  'e2e4 e7e5 g1f3': [
    {move:'b8c6', name:'Three Knights / Ruy Lopez setup', desc:'Most natural — defends e5 and develops a piece.'},
    {move:'g8f6', name:'Petroff Defense', desc:'Counter-attacking — immediately fights back in the center.'},
    {move:'d7d6', name:'Philidor Defense', desc:'Solid but passive — defends e5 with a pawn.'}
  ],
  'e2e4 e7e5 g1f3 b8c6': [
    {move:'f1b5', name:'Ruy Lopez', desc:'The most classical opening. Pin the knight to pressure e5.'},
    {move:'f1c4', name:'Italian Game', desc:'Target f7 immediately. Leads to sharp play.'},
    {move:'d2d4', name:'Scotch Game', desc:'Open the center at once for active piece play.'}
  ],
  'd2d4 d7d5': [
    {move:'c2c4', name:'Queen\'s Gambit', desc:'Offer the c-pawn to gain strong center control.'},
    {move:'g1f3', name:'London System', desc:'Solid setup — bishop to f4, then develop quietly.'},
    {move:'e2e3', name:'Colle System', desc:'Quiet but potent — e3, Bd3, Nf3 setup.'}
  ],
  'd2d4 g8f6': [
    {move:'c2c4', name:'Queen\'s Indian / Nimzo', desc:'Most flexible — can lead to many Indian defenses.'},
    {move:'g1f3', name:'Torre Attack', desc:'Solid — develop naturally and keep options open.'}
  ]
};

function getMoveKey(moves) {
  return moves.slice(0, 6).join(' '); // use up to 6 half-moves for lookup
}

function getOpeningHint(moves) {
  // Try longest match first
  for (let len = Math.min(moves.length, 6); len >= 0; len--) {
    const key = moves.slice(0, len).join(' ');
    if (OPENINGS[key]) {
      const hints = OPENINGS[key];
      return hints;
    }
  }
  return null;
}

// ── ChessGame Logic ──────────────────────────────────────────
function ChessGame() {
  let board = [], turn = 'w';
  let castling = { wK:true, wQ:true, bK:true, bQ:true };
  let enPassant = null, halfMoves = 0, history = [];
  let positionCounts = {};

  // Compact position key for threefold repetition
  function posKey() {
    let k = turn;
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
      const p=board[r][c];
      k += p ? p.color+p.type : '.';
    }
    k += (castling.wK?'K':'')+(castling.wQ?'Q':'')+(castling.bK?'k':'')+(castling.bQ?'q':'');
    if(enPassant) k += String(enPassant.col);
    return k;
  }

  function init() {
    board = Array.from({length:8}, () => Array(8).fill(null));
    const back = ['r','n','b','q','k','b','n','r'];
    for (let c = 0; c < 8; c++) {
      board[0][c] = {type:back[c], color:'b'};
      board[1][c] = {type:'p', color:'b'};
      board[6][c] = {type:'p', color:'w'};
      board[7][c] = {type:back[c], color:'w'};
    }
    turn='w'; castling={wK:true,wQ:true,bK:true,bQ:true};
    enPassant=null; halfMoves=0; history=[];
    positionCounts={}; positionCounts[posKey()]=1;
  }

  const inB = (r,c) => r>=0&&r<8&&c>=0&&c<8;
  const opp = c => c==='w'?'b':'w';

  function findKing(color) {
    for (let r=0;r<8;r++) for (let c=0;c<8;c++)
      if (board[r][c]?.type==='k' && board[r][c].color===color) return {row:r,col:c};
    return null;
  }

  function rawMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];
    const {type, color} = piece, moves = [], en = opp(color);

    const add = (r, c, extra={}) => {
      if (!inB(r,c)) return false;
      const t = board[r][c];
      if (t?.color === color) return false;
      moves.push({from:{row,col}, to:{row:r,col:c}, ...extra});
      return !t;
    };

    if (type==='p') {
      const d = color==='w'?-1:1, sRow = color==='w'?6:1, pRow = color==='w'?0:7;
      const r1 = row+d;
      if (inB(r1,col) && !board[r1][col]) {
        if (r1===pRow) ['q','r','b','n'].forEach(p=>moves.push({from:{row,col},to:{row:r1,col},promo:p}));
        else {
          moves.push({from:{row,col},to:{row:r1,col}});
          const r2=row+d*2;
          if (row===sRow && !board[r2][col]) moves.push({from:{row,col},to:{row:r2,col},doublePush:true});
        }
      }
      for (const dc of [-1,1]) {
        const cr=row+d, cc=col+dc;
        if (!inB(cr,cc)) continue;
        if (board[cr][cc]?.color===en) {
          if (cr===pRow) ['q','r','b','n'].forEach(p=>moves.push({from:{row,col},to:{row:cr,col:cc},promo:p,capture:true}));
          else moves.push({from:{row,col},to:{row:cr,col:cc},capture:true});
        }
        if (enPassant && cr===enPassant.row && cc===enPassant.col)
          moves.push({from:{row,col},to:{row:cr,col:cc},enPassant:true,capture:true});
      }
    }
    if (type==='n') {
      for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])
        add(row+dr,col+dc, {capture:!!board[row+dr]?.[col+dc]});
    }
    if (type==='k') {
      for (const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]])
        add(row+dr,col+dc, {capture:!!board[row+dr]?.[col+dc]});
      const cr=color==='w'?7:0;
      if (color==='w'&&row===7&&col===4||color==='b'&&row===0&&col===4) {
        const ck = color==='w'?castling.wK:castling.bK;
        const cq = color==='w'?castling.wQ:castling.bQ;
        const enemy = opp(color);
        const notAttacked = (r,c) => !isSquareAttackedSimple(r, c, enemy);
        if (!notAttacked(row,col)) {} // king in check, skip castling
        else {
          if (ck && !board[cr][5] && !board[cr][6] &&
              notAttacked(cr,5) && notAttacked(cr,6))
            moves.push({from:{row,col},to:{row:cr,col:6},castle:'K'});
          if (cq && !board[cr][3] && !board[cr][2] && !board[cr][1] &&
              notAttacked(cr,3) && notAttacked(cr,2))
            moves.push({from:{row,col},to:{row:cr,col:2},castle:'Q'});
        }
      }
    }
    const dirs = {b:[[-1,-1],[-1,1],[1,-1],[1,1]],r:[[-1,0],[1,0],[0,-1],[0,1]],q:[[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]};
    if (dirs[type]) {
      for (const [dr,dc] of dirs[type]) {
        let r=row+dr,c=col+dc;
        while(inB(r,c)) { if(!add(r,c,{capture:!!board[r][c]})) break; r+=dr;c+=dc; }
      }
    }
    return moves;
  }

  // Direct attack check that never calls rawMoves - no recursion risk
  function isSquareAttackedSimple(row, col, byColor) {
    const en = opp(byColor);
    // Check pawn attacks
    const pd = byColor==='w' ? 1 : -1; // white pawns attack upward (negative row dir from target)
    for (const dc of [-1,1]) {
      const pr = row+pd, pc = col+dc;
      if (inB(pr,pc) && board[pr][pc]?.color===byColor && board[pr][pc]?.type==='p') return true;
    }
    // Check knight attacks
    for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const nr=row+dr, nc=col+dc;
      if (inB(nr,nc) && board[nr][nc]?.color===byColor && board[nr][nc]?.type==='n') return true;
    }
    // Check king attacks
    for (const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
      const kr=row+dr, kc=col+dc;
      if (inB(kr,kc) && board[kr][kc]?.color===byColor && board[kr][kc]?.type==='k') return true;
    }
    // Check sliding pieces (bishop/queen diagonals, rook/queen straights)
    for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
      let r=row+dr, c=col+dc;
      while(inB(r,c)) {
        if (board[r][c]) { if (board[r][c].color===byColor && (board[r][c].type==='b'||board[r][c].type==='q')) return true; break; }
        r+=dr; c+=dc;
      }
    }
    for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      let r=row+dr, c=col+dc;
      while(inB(r,c)) {
        if (board[r][c]) { if (board[r][c].color===byColor && (board[r][c].type==='r'||board[r][c].type==='q')) return true; break; }
        r+=dr; c+=dc;
      }
    }
    return false;
  }

  function isAttacked(row, col, byColor) {
    return isSquareAttackedSimple(row, col, byColor);
  }

  function inCheck(color) {
    const k = findKing(color);
    return k ? isAttacked(k.row, k.col, opp(color)) : false;
  }

  function tryMove(move) {
    const from = board[move.from.row][move.from.col];
    const to   = board[move.to.row][move.to.col];
    const sepEP = enPassant;
    let epCap = null;

    board[move.to.row][move.to.col] = move.promo ? {type:move.promo,color:from.color} : from;
    board[move.from.row][move.from.col] = null;
    if (move.enPassant) { epCap=board[move.from.row][move.to.col]; board[move.from.row][move.to.col]=null; }
    if (move.castle) {
      const rr=from.color==='w'?7:0;
      if (move.castle==='K') { board[rr][5]=board[rr][7]; board[rr][7]=null; }
      else { board[rr][3]=board[rr][0]; board[rr][0]=null; }
    }
    const safe = !inCheck(from.color);

    board[move.from.row][move.from.col]=from;
    board[move.to.row][move.to.col]=to;
    if (move.promo) board[move.to.row][move.to.col]=to;
    if (move.enPassant) board[move.from.row][move.to.col]=epCap;
    if (move.castle) {
      const rr=from.color==='w'?7:0;
      if (move.castle==='K') { board[rr][7]=board[rr][5]; board[rr][5]=null; }
      else { board[rr][0]=board[rr][3]; board[rr][3]=null; }
    }
    enPassant=sepEP;
    return safe;
  }

  function legalMovesFor(row, col) { return rawMoves(row,col).filter(m=>tryMove(m)); }

  function allLegalMoves() {
    const m=[];
    for (let r=0;r<8;r++) for (let c=0;c<8;c++)
      if (board[r][c]?.color===turn) m.push(...legalMovesFor(r,c));
    return m;
  }

  function doMove(move) {
    const piece = board[move.from.row][move.from.col];
    const captured = board[move.to.row][move.to.col];
    let epCaptured = null;

    history.push({move, piece, captured, epCaptured:null, castling:{...castling}, enPassant, halfMoves});

    board[move.to.row][move.to.col] = move.promo ? {type:move.promo,color:piece.color} : piece;
    board[move.from.row][move.from.col] = null;

    if (move.enPassant) { epCaptured=board[move.from.row][move.to.col]; board[move.from.row][move.to.col]=null; history[history.length-1].epCaptured=epCaptured; }
    if (move.castle) {
      const rr=piece.color==='w'?7:0;
      if (move.castle==='K') { board[rr][5]=board[rr][7]; board[rr][7]=null; }
      else { board[rr][3]=board[rr][0]; board[rr][0]=null; }
    }
    if (piece.type==='k') { if(piece.color==='w'){castling.wK=false;castling.wQ=false;}else{castling.bK=false;castling.bQ=false;} }
    if (piece.type==='r') {
      if(move.from.row===7&&move.from.col===7) castling.wK=false;
      if(move.from.row===7&&move.from.col===0) castling.wQ=false;
      if(move.from.row===0&&move.from.col===7) castling.bK=false;
      if(move.from.row===0&&move.from.col===0) castling.bQ=false;
    }
    enPassant = move.doublePush ? {row:move.from.row+(piece.color==='w'?-1:1),col:move.from.col} : null;
    halfMoves = (piece.type==='p'||move.capture) ? 0 : halfMoves+1;
    turn = opp(turn);
    // Threefold repetition tracking
    const pk = posKey();
    positionCounts[pk] = (positionCounts[pk] || 0) + 1;
  }

  function undoMove() {
    if (!history.length) return;
    const h = history.pop();
    turn = h.piece.color;
    board[h.move.from.row][h.move.from.col] = h.piece;
    board[h.move.to.row][h.move.to.col] = h.captured;
    if (h.move.enPassant) board[h.move.from.row][h.move.to.col] = h.epCaptured;
    if (h.move.castle) {
      const rr=h.piece.color==='w'?7:0;
      if(h.move.castle==='K'){board[rr][7]=board[rr][5];board[rr][5]=null;}
      else{board[rr][0]=board[rr][3];board[rr][3]=null;}
    }
    castling={...h.castling}; enPassant=h.enPassant; halfMoves=h.halfMoves;
    // Undo position count
    const pk = posKey();
    if(positionCounts[pk]) positionCounts[pk]--;
  }

  function toFEN() {
    let fen = '';
    for (let r=0;r<8;r++) {
      let empty=0;
      for (let c=0;c<8;c++) {
        const p=board[r][c];
        if (!p) { empty++; }
        else {
          if(empty){fen+=empty;empty=0;}
          fen += p.color==='w' ? p.type.toUpperCase() : p.type;
        }
      }
      if(empty) fen+=empty;
      if(r<7) fen+='/';
    }
    fen += ' '+(turn);
    let cas='';
    if(castling.wK)cas+='K'; if(castling.wQ)cas+='Q';
    if(castling.bK)cas+='k'; if(castling.bQ)cas+='q';
    fen += ' '+(cas||'-');
    if(enPassant) {
      const file=String.fromCharCode(97+enPassant.col);
      const rank=8-enPassant.row;
      fen+=' '+file+rank;
    } else fen+=' -';
    fen+=' '+halfMoves+' '+(Math.floor(history.length/2)+1);
    return fen;
  }

  function loadFEN(fen) {
    board = Array.from({length:8}, () => Array(8).fill(null));
    const parts = fen.split(' ');
    const rows = parts[0].split('/');
    const typeMap = {P:'p',N:'n',B:'b',R:'r',Q:'q',K:'k'};
    for (let r=0; r<8; r++) {
      let c=0;
      for (const ch of rows[r]) {
        if (ch>='1'&&ch<='8') c+=parseInt(ch);
        else {
          const color = ch===ch.toUpperCase()?'w':'b';
          const type  = ch.toLowerCase();
          board[r][c] = {type, color};
          c++;
        }
      }
    }
    turn = parts[1] || 'w';
    const cas = parts[2] || '-';
    castling = { wK:cas.includes('K'), wQ:cas.includes('Q'), bK:cas.includes('k'), bQ:cas.includes('q') };
    const ep = parts[3] || '-';
    if (ep!=='-') { const col=ep.charCodeAt(0)-97, row=8-parseInt(ep[1]); enPassant={row,col}; }
    else enPassant=null;
    halfMoves = parseInt(parts[4])||0;
    history=[]; positionCounts={}; positionCounts[posKey()]=1;
  }

  const isCheckmate   = () => inCheck(turn) && allLegalMoves().length===0;
  const isStalemate   = () => !inCheck(turn) && allLegalMoves().length===0;
  const isThreefold   = () => (positionCounts[posKey()] || 0) >= 3;
  const isDraw        = () => halfMoves>=100 || isThreefold();
  const getRepCount   = () => positionCounts[posKey()] || 0;
  const getTurn       = () => turn;
  const getBoard      = () => board;
  const getHistory    = () => history;
  const isInCheck     = () => inCheck(turn);

  init();
  return {init,loadFEN,legalMovesFor,allLegalMoves,doMove,undoMove,toFEN,isCheckmate,isStalemate,isDraw,isThreefold,getRepCount,getTurn,getBoard,getHistory,isInCheck,findKing};
}

// ── Stockfish 17 Engine ──────────────────────────────────────
// Move time in ms — levels 8-10 get serious think time
const MOVE_TIME = {1:50,2:100,3:200,4:350,5:600,6:1000,7:2000,8:4000,9:7000,10:12000};
// Skill Level 0-20: level 10 = full strength (20), no errors
const SKILL_LEVEL = {1:0,2:2,3:4,4:7,5:10,6:13,7:16,8:18,9:19,10:20};

let sf = null;
let sfReady = false;
let sfCallback = null;

function initStockfish() {
  const sfUrl = 'https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish.js';
  fetch(sfUrl)
    .then(r => r.text())
    .then(code => {
      const blob = new Blob([code], {type:'application/javascript'});
      const url  = URL.createObjectURL(blob);
      sf = new Worker(url);
      sf.onmessage = handleSFMessage;
      sf.postMessage('uci');
      sf.postMessage('setoption name Threads value 2');
      sf.postMessage('setoption name Hash value 128');
      sf.postMessage('isready');
    })
    .catch(() => { sf = null; sfReady = false; });
}

function handleSFMessage(e) {
  const msg = e.data;
  if (msg === 'readyok') { sfReady = true; return; }
  if (msg.startsWith('bestmove') && sfCallback) {
    const parts = msg.split(' ');
    const best  = parts[1];
    if (best && best !== '(none)') sfCallback(best);
    sfCallback = null;
  }
}

function askStockfish(fen, level, callback) {
  if (!sf || !sfReady) { fallbackAI(callback); return; }
  sfCallback = callback;
  const movetime = MOVE_TIME[level];
  const skill    = SKILL_LEVEL[level];
  // Pass full move history so Stockfish tracks repetitions and avoids threefold draws
  const posCmd = uciMoveLog.length > 0
    ? 'position startpos moves ' + uciMoveLog.join(' ')
    : 'position fen ' + fen;
  // At level 10: full strength, no skill limiting, deep search
  if (level === 10) {
    sf.postMessage('setoption name Skill Level value 20');
    sf.postMessage('setoption name UCI_LimitStrength value false');
    sf.postMessage(posCmd);
    sf.postMessage('go movetime ' + movetime + ' depth 20');
  } else if (level >= 8) {
    sf.postMessage('setoption name Skill Level value ' + skill);
    sf.postMessage('setoption name UCI_LimitStrength value false');
    sf.postMessage(posCmd);
    sf.postMessage('go movetime ' + movetime + ' depth ' + (level === 9 ? 16 : 12));
  } else {
    sf.postMessage('setoption name Skill Level value ' + skill);
    sf.postMessage('setoption name UCI_LimitStrength value true');
    sf.postMessage('setoption name UCI_Elo value ' + AI_RATINGS[level]);
    sf.postMessage(posCmd);
    sf.postMessage('go movetime ' + movetime);
  }
}

// ── Built-in Fallback AI (minimax) ───────────────────────────
const PIECE_VAL = {p:100,n:320,b:330,r:500,q:900,k:20000};
const PST = {
  p:[0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0],
  n:[-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50],
  b:[-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,10,10,5,0,-10,-10,5,5,10,10,5,5,-10,-10,0,10,10,10,10,0,-10,-10,10,10,10,10,10,10,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20],
  r:[0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,5,5,0,0,0],
  q:[-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,5,5,5,0,-10,-5,0,5,5,5,5,0,-5,0,0,5,5,5,5,0,-5,-10,5,5,5,5,5,0,-10,-10,0,5,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20],
  k:[-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20]
};

function evalBoard(g) {
  let s=0; const bd=g.getBoard();
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
    const p=bd[r][c]; if(!p) continue;
    const idx=p.color==='w'?r*8+c:(7-r)*8+c;
    const v=PIECE_VAL[p.type]+(PST[p.type]?PST[p.type][idx]:0);
    s+=p.color==='w'?v:-v;
  }
  return s;
}

function minimax(g,d,a,b,mx) {
  if(g.isCheckmate()) return mx?-50000:50000;
  if(g.isStalemate()||g.isDraw()) return 0;
  if(d===0) return evalBoard(g);
  const moves=g.allLegalMoves();
  if(mx) {
    let best=-Infinity;
    for(const m of moves){g.doMove(m);best=Math.max(best,minimax(g,d-1,a,b,false));g.undoMove();a=Math.max(a,best);if(b<=a)break;}
    return best;
  } else {
    let best=Infinity;
    for(const m of moves){g.doMove(m);best=Math.min(best,minimax(g,d-1,a,b,true));g.undoMove();b=Math.min(b,best);if(b<=a)break;}
    return best;
  }
}

function fallbackAI(callback) {
  const moves = game.allLegalMoves();
  if (!moves.length) return;
  for(let i=moves.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[moves[i],moves[j]]=[moves[j],moves[i]];}
  const depth = currentLevel<=3?1:currentLevel<=6?2:3;
  const isMax = game.getTurn()==='w';
  let best=moves[0], bestVal=isMax?-Infinity:Infinity;
  for(const mv of moves){
    game.doMove(mv);
    const val=minimax(game,depth-1,-Infinity,Infinity,!isMax);
    game.undoMove();
    if(isMax?val>bestVal:val<bestVal){bestVal=val;best=mv;}
  }
  const from = rcToSq(best.from.row, best.from.col);
  const to   = rcToSq(best.to.row,   best.to.col);
  const promo = best.promo || '';
  callback(from + to + promo);
}

// ── Rating System ────────────────────────────────────────────
const AI_RATINGS = {1:600,2:800,3:1000,4:1200,5:1400,6:1650,7:1900,8:2200,9:2500,10:3200};
let playerRating=800, stats={wins:0,losses:0,draws:0};

function getK(r){return r<1000?40:r<1500?32:r<2000?24:16;}
function applyElo(result) {
  const aiR=AI_RATINGS[currentLevel], sc=result==='win'?1:result==='draw'?0.5:0;
  const exp=1/(1+Math.pow(10,(aiR-playerRating)/400));
  const ch=Math.round(getK(playerRating)*(sc-exp));
  const ratingBefore = playerRating;
  playerRating=Math.max(100,playerRating+ch);
  if(result==='win')stats.wins++; if(result==='lose')stats.losses++; if(result==='draw')stats.draws++;
  updateRatingBar();
  // Save to server if logged in
  const serverResult = result === 'lose' ? 'loss' : result;
  if (typeof saveResultToServer === 'function') {
    saveResultToServer(serverResult, ratingBefore, playerRating, ch, currentLevel, gameMode);
  }
  return ch;
}
function updateRatingBar() {
  const rd = document.getElementById('ratingDisplay');       if(rd) rd.textContent = playerRating;
  const sw = document.getElementById('statWins');            if(sw) sw.textContent = stats.wins;
  const sl = document.getElementById('statLosses');          if(sl) sl.textContent = stats.losses;
  const sd = document.getElementById('statDraws');           if(sd) sd.textContent = stats.draws;
  const ar = document.getElementById('aiRatingDisplay');     if(ar) ar.textContent = AI_RATINGS[currentLevel];
  const al = document.getElementById('aiRatingLabel');       if(al) al.textContent = 'Level '+currentLevel;
}
function flashRating(ch) {
  const el=document.getElementById('ratingChange'), bar=document.getElementById('ratingBar');
  el.textContent=(ch>=0?'+':'')+ch;
  el.className='rating-change '+(ch>0?'pos':ch<0?'neg':'neu');
  bar.style.animation='none'; bar.offsetHeight;
  bar.style.animation=ch>0?'flashG 1s ease':ch<0?'flashR 1s ease':'';
  setTimeout(()=>{el.textContent='';el.className='rating-change';},3500);
}

// ── Game State ────────────────────────────────────────────────
let game         = ChessGame();
let playerColor  = 'w';
let currentLevel = 5;
let selectedRC   = null;
let legalDests   = [];
let lastMove     = null;
let moveLog      = [];
let uciMoveLog   = []; // UCI format for opening book lookup
let gameOver     = false;
let aiWorking    = false;
let gameMode     = 'ai'; // 'ai' or '2p'
let showHints    = true;
let currentHints = [];
let moveTimers   = [];   // seconds each move took
let moveStartTime = Date.now(); // when current turn started

// ── Helpers ───────────────────────────────────────────────────
function rcToSq(row, col) { return String.fromCharCode(97+col)+(8-row); }
function sqToRC(sq) { return {col:sq.charCodeAt(0)-97, row:8-parseInt(sq[1])}; }
// Safe element setter — silently skips if element doesn't exist (e.g. in puzzle.html)
function setEl(id, prop, val) { const e=document.getElementById(id); if(e) e[prop]=val; }
function setElClass(id, method, ...args) { const e=document.getElementById(id); if(e) e.classList[method](...args); }

// ── Piece Animation ───────────────────────────────────────────
function animatePieceMove(fromRow, fromCol, toRow, toCol, pieceKey, callback) {
  const boardEl = document.getElementById('board');
  const boardRect = boardEl.getBoundingClientRect();
  const sqSize = boardRect.width / 8;

  // Create flying piece overlay
  const flyPiece = document.createElement('img');
  flyPiece.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SVG[pieceKey]);
  flyPiece.style.cssText = `
    position: fixed;
    width: ${sqSize - 6}px;
    height: ${sqSize - 6}px;
    pointer-events: none;
    z-index: 999;
    transition: left 0.18s cubic-bezier(0.25,0.46,0.45,0.94),
                top  0.18s cubic-bezier(0.25,0.46,0.45,0.94);
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
  `;

  const startX = boardRect.left + fromCol * sqSize + 3;
  const startY = boardRect.top  + fromRow * sqSize + 3;
  const endX   = boardRect.left + toCol   * sqSize + 3;
  const endY   = boardRect.top  + toRow   * sqSize + 3;

  flyPiece.style.left = startX + 'px';
  flyPiece.style.top  = startY + 'px';
  document.body.appendChild(flyPiece);

  // Start animation next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      flyPiece.style.left = endX + 'px';
      flyPiece.style.top  = endY + 'px';
    });
  });

  setTimeout(() => {
    flyPiece.remove();
    callback();
  }, 200);
}

// ── Rendering ─────────────────────────────────────────────────
function renderBoard() {
  const el = document.getElementById('board');
  el.innerHTML = '';
  const bd=game.getBoard(), chk=game.isInCheck(), kRC=chk?game.findKing(game.getTurn()):null;

  for(let ri=0;ri<8;ri++) {
    for(let ci=0;ci<8;ci++) {
      const row = boardFlipped ? 7-ri : ri;
      const col = boardFlipped ? 7-ci : ci;
      const sq=document.createElement('div');
      sq.className='sq '+((row+col)%2===0?'light':'dark');
      sq.dataset.row=row; sq.dataset.col=col;

      if(selectedRC?.row===row&&selectedRC?.col===col) sq.classList.add('selected');
      if(lastMove&&((lastMove.from.row===row&&lastMove.from.col===col)||(lastMove.to.row===row&&lastMove.to.col===col))) sq.classList.add('last-move');
      if(kRC?.row===row&&kRC?.col===col) sq.classList.add('in-check');

      if(showHints && gameMode==='ai' && currentHints.length) {
        const hintMove = currentHints.find(h => {
          const rc = sqToRC(h.move.slice(0,2));
          return rc.row===row && rc.col===col;
        });
        if(hintMove) sq.classList.add('hint-opening');
      }

      const p=bd[row][col];
      if(p) {
        const img=makePieceImg(p.color+p.type.toUpperCase());
        if(img) { img.style.transition='transform 0.15s ease'; sq.appendChild(img); }

      }

      const destMove=legalDests.find(m=>m.to.row===row&&m.to.col===col);
      if(destMove) { const h=document.createElement('div'); h.className=p?'hint-ring':'hint-dot'; sq.appendChild(h); }

      sq.addEventListener('click', gameMode === 'puzzle' ? onPuzzleSquareClick : onSquareClick);
      el.appendChild(sq);
    }
  }
  updateStatus();
  updateOpeningHints();
  if(clockEnabled) renderClocks();
}

// ── Opening Hint Panel ────────────────────────────────────────
function updateOpeningHints() {
  const panel = document.getElementById('opening-panel');
  if (!panel) return;

  if (!showHints || gameMode !== 'ai') {
    panel.style.display = 'none';
    currentHints = [];
    return;
  }

  // Only show hints in first 10 moves
  if (uciMoveLog.length > 10) {
    panel.style.display = 'none';
    currentHints = [];
    return;
  }

  const hints = getOpeningHint(uciMoveLog);
  if (!hints || hints.length === 0) {
    panel.style.display = 'none';
    currentHints = [];
    return;
  }

  // Filter to legal moves only
  const legalUCI = new Set();
  game.allLegalMoves().forEach(m => {
    legalUCI.add(rcToSq(m.from.row,m.from.col)+rcToSq(m.to.row,m.to.col)+(m.promo||''));
  });

  currentHints = hints.filter(h => legalUCI.has(h.move));
  if (!currentHints.length) {
    panel.style.display = 'none';
    return;
  }

  panel.style.display = 'block';
  const list = document.getElementById('opening-list');
  list.innerHTML = '';
  currentHints.forEach(h => {
    const item = document.createElement('div');
    item.className = 'opening-item';
    item.innerHTML = `<span class="opening-name">${h.name}</span><span class="opening-move">${h.move}</span><div class="opening-desc">${h.desc}</div>`;
    item.addEventListener('click', () => {
      playSound('hint');
      const rc_from = sqToRC(h.move.slice(0,2));
      const rc_to   = sqToRC(h.move.slice(2,4));
      const moves = game.legalMovesFor(rc_from.row, rc_from.col);
      const mv = moves.find(m => m.to.row===rc_to.row && m.to.col===rc_to.col);
      if (mv) {
        selectedRC = rc_from;
        legalDests = [mv];
        renderBoard();
      }
    });
    list.appendChild(item);
  });
}

// ── Click Handler ─────────────────────────────────────────────
function onSquareClick() {
  if(gameOver || aiWorking) return;

  // In 2P mode, both colors can move
  const turn = game.getTurn();
  if(gameMode === 'ai' && turn !== playerColor) return;

  const row=parseInt(this.dataset.row), col=parseInt(this.dataset.col);
  const p=game.getBoard()[row][col];

  if(selectedRC) {
    // Find all legal moves to this square (may be multiple for promotions)
    const movesHere = legalDests.filter(m=>m.to.row===row&&m.to.col===col);
    if(movesHere.length > 0) {
      // Check if these are promotion moves
      const promoMoves = movesHere.filter(m=>m.promo);
      if(promoMoves.length > 1) {
        // Show promotion dialog
        showPromoDialog(promoMoves);
        return;
      }
      executePlayerMove(movesHere[0]); return;
    }
    selectedRC=null; legalDests=[];
    if(p?.color===turn) { selectedRC={row,col}; legalDests=game.legalMovesFor(row,col); }
    renderBoard(); return;
  }
  if(p?.color===turn) {
    selectedRC={row,col}; legalDests=game.legalMovesFor(row,col); renderBoard();
  }
}

// ── Promotion Dialog ──────────────────────────────────────────
function showPromoDialog(promoMoves) {
  const color = game.getTurn();
  const pieces = ['q','r','b','n'];
  const labels = {q:'Queen', r:'Rook', b:'Bishop', n:'Knight'};
  const container = document.getElementById('promoChoices');
  container.innerHTML = '';
  pieces.forEach(p => {
    const move = promoMoves.find(m => m.promo === p);
    if (!move) return;
    const btn = document.createElement('button');
    btn.className = 'promo-btn';
    btn.title = labels[p];
    const img = makePieceImg(color + p.toUpperCase());
    if (img) btn.appendChild(img);
    btn.addEventListener('click', () => {
      document.getElementById('promo-modal').classList.remove('show');
      executePlayerMove(move);
    });
    container.appendChild(btn);
  });
  document.getElementById('promo-modal').classList.add('show');
}

function executePlayerMove(move) {
  const fromRow=move.from.row, fromCol=move.from.col;
  const toRow=move.to.row, toCol=move.to.col;
  const bd = game.getBoard();
  const movingPiece = bd[fromRow][fromCol];
  const pieceKey = movingPiece ? (movingPiece.color + movingPiece.type.toUpperCase()) : null;
  const isCapture = !!bd[toRow][toCol] || move.enPassant;
  const isCastle  = !!move.castle;

  // Record UCI move for opening book
  const uci = rcToSq(fromRow,fromCol)+rcToSq(toRow,toCol)+(move.promo||'');
  uciMoveLog.push(uci);

  // Animate piece
  if(pieceKey && SVG[pieceKey]) {
    // Hide source square piece immediately
    const srcSq = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
    if(srcSq) { const img = srcSq.querySelector('img'); if(img) img.style.opacity='0'; }

    animatePieceMove(fromRow, fromCol, toRow, toCol, pieceKey, () => {
      game.doMove(move);
      lastMove={from:move.from,to:move.to};
      selectedRC=null; legalDests=[];

      // Play sound after move
      if(isCastle) playSound('castle');
      else if(isCapture) playSound('capture');
      else playSound('move');

      if(game.isInCheck()) { playSound('check'); triggerCheckFlash(); }

      recordMove(); renderBoard(); updateCapturedPieces(); switchClock(); checkEnd();
      if(!gameOver && gameMode==='ai') setTimeout(doAIMove, 200);
    });
  } else {
    game.doMove(move);
    lastMove={from:move.from,to:move.to};
    selectedRC=null; legalDests=[];
    if(isCastle) playSound('castle');
    else if(isCapture) playSound('capture');
    else playSound('move');
    if(game.isInCheck()) { playSound('check'); triggerCheckFlash(); }
    recordMove(); renderBoard(); updateCapturedPieces(); switchClock(); checkEnd();
    if(!gameOver && gameMode==='ai') setTimeout(doAIMove, 200);
  }
}

// ── AI Move ───────────────────────────────────────────────────
function doAIMove() {
  if(gameOver||game.getTurn()===playerColor) return;
  aiWorking=true; setThinking(true);

  const fen = game.toFEN();

  askStockfish(fen, currentLevel, (uciMove) => {
    const from = sqToRC(uciMove.slice(0,2));
    const to   = sqToRC(uciMove.slice(2,4));
    const promo = uciMove[4] || null;

    const moves = game.allLegalMoves();
    const move  = moves.find(m =>
      m.from.row===from.row && m.from.col===from.col &&
      m.to.row===to.row     && m.to.col===to.col &&
      (!promo || m.promo===promo)
    );

    if(move) {
      const bd = game.getBoard();
      const movingPiece = bd[move.from.row][move.from.col];
      const pieceKey = movingPiece ? (movingPiece.color + movingPiece.type.toUpperCase()) : null;
      const isCapture = !!bd[move.to.row][move.to.col] || move.enPassant;
      const isCastle  = !!move.castle;

      uciMoveLog.push(uciMove);

      if(pieceKey && SVG[pieceKey]) {
        const srcSq = document.querySelector(`[data-row="${move.from.row}"][data-col="${move.from.col}"]`);
        if(srcSq) { const img = srcSq.querySelector('img'); if(img) img.style.opacity='0'; }

        animatePieceMove(move.from.row, move.from.col, move.to.row, move.to.col, pieceKey, () => {
          game.doMove(move);
          lastMove={from:move.from, to:move.to};

          if(isCastle) playSound('castle');
          else if(isCapture) playSound('capture');
          else playSound('move');
          if(game.isInCheck()) { playSound('check'); triggerCheckFlash(); }

          recordMove();
          aiWorking=false; setThinking(false);
          renderBoard(); updateCapturedPieces(); switchClock(); checkEnd();
        });
      } else {
        game.doMove(move);
        lastMove={from:move.from, to:move.to};
        if(isCastle) playSound('castle');
        else if(isCapture) playSound('capture');
        else playSound('move');
        if(game.isInCheck()) { playSound('check'); triggerCheckFlash(); }
        recordMove();
        aiWorking=false; setThinking(false);
        renderBoard(); updateCapturedPieces(); switchClock(); checkEnd();
      }
    } else {
      aiWorking=false; setThinking(false);
      renderBoard(); checkEnd();
    }
  });
}

// ── End Check ─────────────────────────────────────────────────
function checkEnd() {
  if(game.isCheckmate()) {
    if(gameMode === 'ai') {
      const won=game.getTurn()!==playerColor;
      const ch=applyElo(won?'win':'lose'); flashRating(ch);
      playSound(won?'win':'lose');
      showOverlay(won?'🏆':'💀',won?'Victory!':'Defeated',won?'You defeated the AI!':'The AI won.',ch,won?'pos':'neg');
    } else {
      const winner = game.getTurn()==='w'?'Black':'White';
      playSound('win');
      showOverlay2P('🏆', `${winner} Wins!`, `${winner} delivered checkmate!`);
    }
    gameOver=true;
  } else if(game.isStalemate() || game.isDraw()) {
    let drawReason = 'Draw!';
    if(game.isStalemate()) drawReason = 'Stalemate — no legal moves.';
    else if(game.isThreefold()) drawReason = 'Draw by threefold repetition.';
    else drawReason = 'Draw by 50-move rule.';
    if(gameMode === 'ai') {
      const ch=applyElo('draw'); flashRating(ch);
      playSound('draw');
      showOverlay('⚖️','Draw', drawReason, ch,'neu');
    } else {
      playSound('draw');
      showOverlay2P('⚖️','Draw!', drawReason);
    }
    gameOver=true;
  }
}

// ── Move Log ──────────────────────────────────────────────────
function recordMove() {
  const h=game.getHistory(); if(!h.length) return;
  const last=h[h.length-1];
  const from=rcToSq(last.move.from.row,last.move.from.col);
  const to  =rcToSq(last.move.to.row,  last.move.to.col);
  moveLog.push(from+'-'+to+(last.move.promo?'='+last.move.promo.toUpperCase():''));

  // Record move time
  const elapsed = Math.round((Date.now() - moveStartTime) / 1000);
  moveTimers.push(elapsed);
  moveStartTime = Date.now();

  updateMoveLog();
}

function updateMoveLog() {
  const el=document.getElementById('move-log');
  if(!moveLog.length){el.innerHTML='—';return;}
  let html='';
  for(let i=0;i<moveLog.length;i+=2) {
    const t1 = moveTimers[i]   != null ? `<span class="mn-time">(${moveTimers[i]}s)</span>` : '';
    const t2 = moveTimers[i+1] != null ? `<span class="mn-time">(${moveTimers[i+1]}s)</span>` : '';
    html+=`<span class="mn">${Math.floor(i/2)+1}.</span>${moveLog[i]||''}${t1} ${moveLog[i+1]||''}${t2}<br>`;
  }
  el.innerHTML=html; el.scrollTop=el.scrollHeight;
}

// ── New Game / Undo ───────────────────────────────────────────
function newGame() {
  game.init(); selectedRC=null; legalDests=[]; lastMove=null;
  moveLog=[]; uciMoveLog=[]; currentHints=[]; gameOver=false; aiWorking=false;
  moveTimers=[]; moveStartTime=Date.now();
  setEl('move-log','innerHTML','—');
  setElClass('overlay','remove','show');
  setElClass('overlay2p','remove','show');
  setElClass('pgn-modal','remove','show');
  setElClass('resign-modal','remove','show');
  setElClass('draw-offer-modal','remove','show');
  setElClass('promo-modal','remove','show');
  setElClass('analysis-modal','remove','show');
  setThinking(false);
  resetClock();
  updatePlayerLabels();
  renderBoard();
  updateCapturedPieces();
  if(gameMode==='ai' && playerColor==='b') setTimeout(doAIMove,600);
}

function undoMove() {
  if(aiWorking) return;
  if(gameOver){gameOver=false;document.getElementById('overlay').classList.remove('show');document.getElementById('overlay2p').classList.remove('show');}
  game.undoMove();
  uciMoveLog = uciMoveLog.slice(0,-1);
  moveLog=moveLog.slice(0,-1);
  if(gameMode==='ai') { game.undoMove(); uciMoveLog=uciMoveLog.slice(0,-1); moveLog=moveLog.slice(0,-1); }
  selectedRC=null; legalDests=[];
  const h=game.getHistory();
  lastMove=h.length?{from:h[h.length-1].move.from,to:h[h.length-1].move.to}:null;
  renderBoard(); updateMoveLog();
}

function chooseColor(color) {
  playerColor=color;
  document.getElementById('btnWhite').classList.toggle('active',color==='w');
  document.getElementById('btnBlack').classList.toggle('active',color==='b');
  newGame();
}

function setGameMode(mode) {
  gameMode = mode;
  const btnAI     = document.getElementById('btnModeAI');
  const btn2P     = document.getElementById('btnMode2P');
  const btnPuzzle = document.getElementById('btnModePuzzle');
  if (btnAI)     btnAI.classList.toggle('active',     mode==='ai');
  if (btn2P)     btn2P.classList.toggle('active',     mode==='2p');
  if (btnPuzzle) btnPuzzle.classList.toggle('active', mode==='puzzle');
  // Show/hide AI-only controls
  const aiControls = document.getElementById('ai-controls');
  if (aiControls) aiControls.style.display = mode==='ai' ? '' : 'none';
  // Show/hide rating bar
  const ratingBar = document.getElementById('ratingBar');
  if (ratingBar) ratingBar.style.display = mode==='ai' ? '' : 'none';
  // Show/hide puzzle panel
  const pp = document.getElementById('puzzle-panel');
  if (pp) pp.classList.toggle('show', mode==='puzzle');
  if (mode==='puzzle') { loadPuzzle(currentPuzzleIdx); return; }
  newGame();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('btnSound');
  btn.textContent = soundEnabled ? '🔊 On' : '🔇 Off';
  btn.classList.toggle('active', soundEnabled);
}

function toggleHints() {
  showHints = !showHints;
  const btn = document.getElementById('btnHints');
  btn.textContent = showHints ? '💡 Hints' : '💡 Off';
  btn.classList.toggle('active', showHints);
  renderBoard();
}

// ── Board Themes ──────────────────────────────────────────────
const THEMES = {
  green:    { light:'#eeeed2', dark:'#769656' },
  classic:  { light:'#f0d9b5', dark:'#b58863' },
  ocean:    { light:'#dee3e6', dark:'#788a9b' },
  midnight: { light:'#c8c8c8', dark:'#404875' },
  walnut:   { light:'#f0cfa0', dark:'#7c4f2b' },
  purple:   { light:'#f0e0ff', dark:'#8860a0' }
};
let currentTheme = 'green';

function setTheme(name) {
  const t = THEMES[name]; if (!t) return;
  currentTheme = name;
  const root = document.documentElement;
  root.style.setProperty('--light-sq', t.light);
  root.style.setProperty('--dark-sq',  t.dark);
  document.querySelectorAll('.theme-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.theme === name);
  });
}

// ── Check Flash ───────────────────────────────────────────────
function triggerCheckFlash() {
  const el = document.getElementById('check-flash');
  el.classList.remove('flash');
  void el.offsetWidth; // reflow to restart animation
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 600);
}

// ── UI Helpers ────────────────────────────────────────────────
function updateStatus() {
  const el=document.getElementById('status'); if(!el||gameOver) return;
  const t=game.getTurn(), name=t==='w'?'White':'Black';
  const chk=game.isInCheck()?'<span style="color:#e05050"> — Check!</span>':'';
  const rep = game.getRepCount();
  const repWarn = rep >= 2 ? `<div style="color:#d4a843;font-size:.6rem;margin-top:4px">⚠️ Position repeated ${rep}x — one more = draw!</div>` : '';

  if(gameMode === '2p') {
    el.innerHTML=`<span class="tag" style="background:${t==='w'?'rgba(212,168,67,.2)':'rgba(80,80,80,.3)'}; color:${t==='w'?'var(--accent)':'#aaa'}">${name.toUpperCase()}</span> ${name} to move${chk}${repWarn}`;
  } else {
    const isPlayer=t===playerColor;
    el.innerHTML=(isPlayer
      ?`<span class="tag">YOUR TURN</span> ${name} to move${chk}`
      :`<span class="tag ai">AI TURN</span> ${name} to move${chk}`) + repWarn;
  }
}
function setThinking(on){setElClass('thinking','toggle','on',on);}

function showOverlay(icon,title,msg,ch,cls){
  document.getElementById('oIcon').textContent=icon;
  document.getElementById('oTitle').textContent=title;
  document.getElementById('oMsg').textContent=msg;
  const rc=document.getElementById('oRating');
  rc.textContent='Rating '+(ch>=0?'+':'')+ch+'  →  '+playerRating;
  rc.className='rch '+cls;
  document.getElementById('overlay').classList.add('show');
}
function showOverlay2P(icon,title,msg){
  document.getElementById('o2Icon').textContent=icon;
  document.getElementById('o2Title').textContent=title;
  document.getElementById('o2Msg').textContent=msg;
  document.getElementById('overlay2p').classList.add('show');
}

// ── Board Flip ────────────────────────────────────────────────
let boardFlipped = false;
function flipBoard() {
  boardFlipped = !boardFlipped;
  const btn = document.getElementById('btnFlip');
  btn.classList.toggle('active', boardFlipped);
  buildCoords();
  updatePlayerLabels();
  renderBoard();
  updateCapturedPieces();
}

// ── Captured Pieces ───────────────────────────────────────────
const PIECE_VALUES = {p:1, n:3, b:3, r:5, q:9};
const PIECE_UNICODE = {
  wp:'♙', wn:'♘', wb:'♗', wr:'♖', wq:'♕',
  bp:'♟', bn:'♞', bb:'♝', br:'♜', bq:'♛'
};
function updateCapturedPieces() {
  const board = game.getBoard ? game.getBoard() : null;
  if (!board) return;

  // Count pieces on board
  const onBoard = {wp:0,wn:0,wb:0,wr:0,wq:0,bp:0,bn:0,bb:0,br:0,bq:0};
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
    const pc = board[r][c];
    if(pc && pc.type!=='k') {
      const key = pc.color+pc.type;
      if(key in onBoard) onBoard[key]++;
    }
  }

  // Starting counts
  const start = {wp:8,wn:2,wb:2,wr:2,wq:1,bp:8,bn:2,bb:2,br:2,bq:1};
  // Captured = start - onBoard
  const capW = {}; // captured white pieces (taken by black)
  const capB = {}; // captured black pieces (taken by white)
  let matW=0, matB=0;
  ['p','n','b','r','q'].forEach(t=>{
    const cw = start['w'+t] - onBoard['w'+t];
    const cb = start['b'+t] - onBoard['b'+t];
    if(cw>0){capW['w'+t]=cw; matW+=cw*PIECE_VALUES[t];}
    if(cb>0){capB['b'+t]=cb; matB+=cb*PIECE_VALUES[t];}
  });

  // Determine which bar is top/bottom based on flip + playerColor
  // "bottom" bar = current player's captured pieces (pieces they took)
  // "top" bar = opponent's captured pieces (pieces they took)
  const playerIsWhite = gameMode==='2p' ? true : playerColor==='w';
  const bottomCaptures = playerIsWhite ? capB : capW;  // pieces player took (opponent's pieces)
  const topCaptures    = playerIsWhite ? capW : capB;
  const bottomAdv = playerIsWhite ? matB - matW : matW - matB;
  const topAdv    = -bottomAdv;

  function renderBar(el, matEl, captures) {
    [...el.querySelectorAll('.cp')].forEach(x=>x.remove());
    const frag = document.createDocumentFragment();
    const order = ['q','r','b','n','p'];
    order.forEach(t=>{
      Object.keys(captures).filter(k=>k[1]===t).forEach(k=>{
        for(let i=0;i<captures[k];i++){
          const sp=document.createElement('span');
          sp.className='cp'; sp.textContent=PIECE_UNICODE[k];
          frag.appendChild(sp);
        }
      });
    });
    el.insertBefore(frag, matEl);
  }

  const topEl    = document.getElementById('capTop');
  const bottomEl = document.getElementById('capBottom');
  const topMatEl    = document.getElementById('matTop');
  const bottomMatEl = document.getElementById('matBottom');

  renderBar(topEl,    topMatEl,    boardFlipped ? bottomCaptures : topCaptures);
  renderBar(bottomEl, bottomMatEl, boardFlipped ? topCaptures    : bottomCaptures);

  const tAdv = boardFlipped ? bottomAdv : topAdv;
  const bAdv = boardFlipped ? topAdv    : bottomAdv;
  topMatEl.textContent    = tAdv > 0 ? '+'+tAdv : '';
  bottomMatEl.textContent = bAdv > 0 ? '+'+bAdv : '';
}

// ── Game Clock ────────────────────────────────────────────────
let clockEnabled  = false;
let clockMinutes  = 10;
let clockWhite    = 0; // ms remaining
let clockBlack    = 0;
let clockInterval = null;
let clockLastTick = 0;

function updateClockSetting() {
  const val = parseInt(document.getElementById('clockSelect').value);
  clockMinutes = val;
  clockEnabled = val > 0;
  resetClock();
}

function resetClock() {
  clearInterval(clockInterval);
  clockInterval = null;
  clockWhite = clockMinutes * 60 * 1000;
  clockBlack = clockMinutes * 60 * 1000;
  // Clock boxes are always visible — just show "—" when clock is off
  renderClocks();
  updatePlayerLabels();
}

function updatePlayerLabels() {
  const pIsW = gameMode==='2p' ? true : playerColor==='w';
  const flipped = boardFlipped;
  const bottomName = gameMode==='2p' ? 'White' : (pIsW ? 'You (White)' : 'You (Black)');
  const topName    = gameMode==='2p' ? 'Black' : (pIsW ? 'Stockfish'   : 'Stockfish');
  const bottomAvatar = pIsW ? '👤' : '👤';
  const topAvatar    = gameMode==='2p' ? '♟' : '🤖';
  if (!flipped) {
    setEl('playerNameTop',    'textContent', topName);
    setEl('playerNameBottom', 'textContent', bottomName);
    setEl('avatarTop',    'textContent', topAvatar);
    setEl('avatarBottom', 'textContent', bottomAvatar);
  } else {
    setEl('playerNameTop',    'textContent', bottomName);
    setEl('playerNameBottom', 'textContent', topName);
    setEl('avatarTop',    'textContent', bottomAvatar);
    setEl('avatarBottom', 'textContent', topAvatar);
  }
}

function startClock() {
  if (!clockEnabled || clockInterval) return;
  clockLastTick = Date.now();
  clockInterval = setInterval(tickClock, 100);
}

function tickClock() {
  if (gameOver) { clearInterval(clockInterval); clockInterval=null; return; }
  const now = Date.now();
  const elapsed = now - clockLastTick;
  clockLastTick = now;
  const turn = game.getTurn();
  if (turn==='w') clockWhite = Math.max(0, clockWhite - elapsed);
  else             clockBlack = Math.max(0, clockBlack - elapsed);
  renderClocks();
  if (clockWhite===0 || clockBlack===0) {
    clearInterval(clockInterval); clockInterval=null;
    const loser = clockWhite===0 ? 'w' : 'b';
    gameOver = true;
    playSound('lose');
    if (gameMode==='ai') {
      const won = loser !== playerColor;
      if(won) { const ch=applyElo('win'); flashRating(ch); showOverlay('⏱','Time!','You won on time!',ch,'pos'); }
      else     { const ch=applyElo('loss'); flashRating(ch); showOverlay('⏱','Time!','You lost on time.',ch,'neg'); }
    } else {
      const winner = loser==='w' ? 'Black' : 'White';
      showOverlay2P('⏱','Time!', winner+' wins on time!');
    }
  }
}

function switchClock() {
  if (!clockEnabled || gameOver) return;
  // Reset the tick reference so elapsed time is measured fresh from this moment
  clockLastTick = Date.now();
  if (!clockInterval) {
    clockInterval = setInterval(tickClock, 100);
  }
  renderClocks();
}

function renderClocks() {
  const pIsW = gameMode==='2p' ? true : playerColor==='w';
  const turn = game.getTurn();

  // Which color is at bottom?
  const bottomIsWhite = boardFlipped ? !pIsW : pIsW;
  const bottomTime = bottomIsWhite ? clockWhite : clockBlack;
  const topTime    = bottomIsWhite ? clockBlack : clockWhite;
  const bottomActive = bottomIsWhite ? turn==='w' : turn==='b';
  const topActive    = !bottomActive;

  const topBox    = document.getElementById('clockBoxTop');
  const bottomBox = document.getElementById('clockBoxBottom');

  if (!clockEnabled) {
    topBox.className    = 'clock-box';
    bottomBox.className = 'clock-box';
    document.getElementById('clockTimeTop').textContent    = '—';
    document.getElementById('clockTimeBottom').textContent = '—';
    return;
  }

  topBox.className    = 'clock-box' + (topActive    ? ' active' : '') + (topTime    < 30000 && topActive    ? ' low' : '');
  bottomBox.className = 'clock-box' + (bottomActive ? ' active' : '') + (bottomTime < 30000 && bottomActive ? ' low' : '');
  document.getElementById('clockTimeTop').textContent    = formatTime(topTime);
  document.getElementById('clockTimeBottom').textContent = formatTime(bottomTime);
}

function formatTime(ms) {
  const total = Math.ceil(ms/1000);
  const m = Math.floor(total/60);
  const s = total%60;
  return m+':'+(s<10?'0':'')+s;
}

// ── Resign ────────────────────────────────────────────────────
function showResign() {
  if (gameOver) return;
  document.getElementById('resign-modal').classList.add('show');
}
function confirmResign() {
  document.getElementById('resign-modal').classList.remove('show');
  gameOver = true;
  clearInterval(clockInterval); clockInterval=null;
  playSound('lose');
  if (gameMode==='ai') {
    const ch = applyElo('loss'); flashRating(ch);
    showOverlay('🏳','Resigned','You resigned the game.',ch,'neg');
  } else {
    const winner = game.getTurn()==='w' ? 'Black' : 'White';
    showOverlay2P('🏳','Resigned!', winner+' wins by resignation.');
  }
}

// ── Rematch ───────────────────────────────────────────────────
function rematch() {
  // Swap colors for AI mode, keep same settings for 2P
  if (gameMode === 'ai') {
    playerColor = playerColor === 'w' ? 'b' : 'w';
    document.getElementById('btnWhite').classList.toggle('active', playerColor==='w');
    document.getElementById('btnBlack').classList.toggle('active', playerColor==='b');
  }
  newGame();
}

// ── Game Analysis ─────────────────────────────────────────────
function showAnalysis() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('overlay2p').classList.remove('show');

  if (!uciMoveLog.length) return;

  // Show modal immediately with a loading state
  document.getElementById('analysisSubtitle').textContent = 'Analysing game…';
  document.getElementById('analysisSummary').innerHTML =
    '<div style="color:var(--text-dim);font-size:.65rem;text-align:center;padding:8px">⏳ Running engine analysis…</div>';
  document.getElementById('analysisList').innerHTML = '';
  document.getElementById('analysis-modal').classList.add('show');

  // Run analysis asynchronously so the modal renders first
  setTimeout(() => _runAnalysis(), 30);
}

function _runAnalysis() {
  // ── Evaluation depth: use depth 2 for speed, position tables for accuracy
  const ANALYSIS_DEPTH = 2;

  // ── Replay all moves on a fresh board and collect evaluations ──────────────
  const tempGame = ChessGame();
  tempGame.init();

  // evals[i] = best-play eval BEFORE move i was made (from White's perspective, centipawns/10)
  const evals = [];

  // Eval position before any moves
  evals.push(_analysisEval(tempGame, ANALYSIS_DEPTH));

  for (let i = 0; i < uciMoveLog.length; i++) {
    const uci   = uciMoveLog[i];
    const from  = sqToRC(uci.slice(0, 2));
    const to    = sqToRC(uci.slice(2, 4));
    const promo = uci[4] || null;

    const legalMoves = tempGame.allLegalMoves();
    const mv = legalMoves.find(m =>
      m.from.row === from.row && m.from.col === from.col &&
      m.to.row   === to.row   && m.to.col   === to.col   &&
      (!promo || m.promo === promo)
    );

    if (mv) {
      tempGame.doMove(mv);
      evals.push(_analysisEval(tempGame, ANALYSIS_DEPTH));
    } else {
      // Move not found (shouldn't happen) — keep last eval
      evals.push(evals[evals.length - 1]);
    }
  }

  // ── Compare each played move against what the engine preferred ────────────
  // For each position BEFORE a move, we also know the best available eval:
  // bestEvalBefore[i] = the eval the engine would get from position i
  // We recompute best-move eval at each position for comparison.

  const tempGame2 = ChessGame();
  tempGame2.init();
  const bestEvals = []; // best possible eval from each position (engine's choice)

  bestEvals.push(_bestMoveEval(tempGame2, ANALYSIS_DEPTH));

  for (let i = 0; i < uciMoveLog.length; i++) {
    const uci   = uciMoveLog[i];
    const from  = sqToRC(uci.slice(0, 2));
    const to    = sqToRC(uci.slice(2, 4));
    const promo = uci[4] || null;
    const legalMoves = tempGame2.allLegalMoves();
    const mv = legalMoves.find(m =>
      m.from.row === from.row && m.from.col === from.col &&
      m.to.row   === to.row   && m.to.col   === to.col   &&
      (!promo || m.promo === promo)
    );
    if (mv) {
      tempGame2.doMove(mv);
      if (i < uciMoveLog.length - 1) bestEvals.push(_bestMoveEval(tempGame2, ANALYSIS_DEPTH));
    }
  }

  // ── Classify moves ─────────────────────────────────────────────────────────
  const items = [];
  let blunders = 0, mistakes = 0, inaccuracies = 0;

  for (let i = 0; i < uciMoveLog.length; i++) {
    const color     = i % 2 === 0 ? 'w' : 'b';
    const evalBefore = evals[i];     // eval before this move (White's POV)
    const evalAfter  = evals[i + 1]; // eval after this move (White's POV)

    // Best possible eval from this position (what engine would play)
    const bestPossible = bestEvals[i] !== undefined ? bestEvals[i] : evalBefore;

    // Loss = difference between best possible result and what was played
    // For white: bestPossible is high, evalAfter should be high too
    // For black: bestPossible is low, evalAfter should be low too
    let loss;
    if (color === 'w') {
      loss = bestPossible - evalAfter;   // positive = white played worse than best
    } else {
      loss = evalAfter - bestPossible;   // positive = black played worse than best (let white do better)
    }

    // Convert from centipawn units (our eval is in PST points ~10x centipawns)
    const lossCp = loss / 10;

    let grade, label, comment;
    if (lossCp >= 300) {
      grade = 'blunder';    label = 'Blunder ??'; blunders++;
      comment = `Lost ${lossCp.toFixed(0)} cp vs best move`;
    } else if (lossCp >= 100) {
      grade = 'mistake';    label = 'Mistake ?';  mistakes++;
      comment = `Lost ${lossCp.toFixed(0)} cp vs best move`;
    } else if (lossCp >= 40) {
      grade = 'inaccuracy'; label = 'Inaccuracy !?'; inaccuracies++;
      comment = `Lost ${lossCp.toFixed(0)} cp vs best move`;
    } else {
      grade = 'good'; label = 'Good';
      comment = '';
    }

    if (grade !== 'good') {
      const moveNum = Math.floor(i / 2) + 1;
      const moveSuffix = color === 'w' ? '.' : '…';
      const moveName = moveLog[i] || uciMoveLog[i];
      items.push({ idx: i, move: moveName, color, grade, label, comment, moveNum, moveSuffix });
    }
  }

  // ── Render results ─────────────────────────────────────────────────────────
  const totalMoves = uciMoveLog.length;
  const accuracy = totalMoves > 0
    ? Math.max(0, Math.round(100 - (blunders * 15 + mistakes * 8 + inaccuracies * 3) / totalMoves * 10))
    : 100;

  document.getElementById('analysisSubtitle').textContent =
    `${totalMoves} moves · Accuracy ~${accuracy}%`;

  document.getElementById('analysisSummary').innerHTML = `
    <div class="a-stat blunder">   <div class="as-val">${blunders}</div>      <div class="as-label">Blunders</div></div>
    <div class="a-stat mistake">   <div class="as-val">${mistakes}</div>      <div class="as-label">Mistakes</div></div>
    <div class="a-stat inaccuracy"><div class="as-val">${inaccuracies}</div>  <div class="as-label">Inaccuracies</div></div>
  `;

  const list = document.getElementById('analysisList');
  if (!items.length) {
    list.innerHTML = '<div style="text-align:center;color:var(--win);font-size:.68rem;padding:14px">✅ Excellent game — no major errors found!</div>';
  } else {
    list.innerHTML = items.map(it => `
      <div class="analysis-item ${it.grade}">
        <span class="a-num">${it.moveNum}${it.moveSuffix}</span>
        <span class="a-move">${it.move}</span>
        <span class="a-badge ${it.grade}">${it.label}</span>
        <span class="a-comment">${it.comment}</span>
      </div>
    `).join('');
  }
}

// Evaluate position using minimax to depth d — returns score from White's perspective
function _analysisEval(g, depth) {
  if (g.isCheckmate()) return g.getTurn() === 'w' ? -999999 : 999999;
  if (g.isStalemate() || g.isDraw()) return 0;
  if (depth === 0) return evalBoard(g);
  const isMax = g.getTurn() === 'w';
  const moves = g.allLegalMoves();
  let best = isMax ? -Infinity : Infinity;
  for (const m of moves) {
    g.doMove(m);
    const val = _analysisEval(g, depth - 1);
    g.undoMove();
    if (isMax ? val > best : val < best) best = val;
  }
  return best;
}

// Find the eval of the BEST move from this position (engine's preferred continuation)
function _bestMoveEval(g, depth) {
  if (g.isCheckmate() || g.isStalemate() || g.isDraw()) return evalBoard(g);
  const isMax = g.getTurn() === 'w';
  const moves = g.allLegalMoves();
  if (!moves.length) return evalBoard(g);
  let best = isMax ? -Infinity : Infinity;
  for (const m of moves) {
    g.doMove(m);
    const val = _analysisEval(g, depth - 1);
    g.undoMove();
    if (isMax ? val > best : val < best) best = val;
  }
  return best;
}

// ── Draw Offer ────────────────────────────────────────────────
function offerDraw() {
  if (gameOver || aiWorking) return;
  if (gameMode === '2p') {
    // In 2P mode: show modal for the other player to accept/decline
    const offerer = game.getTurn() === 'w' ? 'White' : 'Black';
    const receiver = game.getTurn() === 'w' ? 'Black' : 'White';
    document.getElementById('drawOfferMsg').textContent = `${offerer} offers a draw. ${receiver}, do you accept?`;
    document.getElementById('draw-offer-modal').classList.add('show');
  } else {
    // vs AI: AI decides based on position evaluation
    const aiAccepts = aiConsidersDraw();
    if (aiAccepts) {
      gameOver = true;
      clearInterval(clockInterval); clockInterval = null;
      playSound('draw');
      const ch = applyElo('draw'); flashRating(ch);
      showOverlay('🤝', 'Draw Agreed', 'The AI accepted your draw offer.', ch, 'neu');
    } else {
      document.getElementById('drawOfferMsg').textContent = 'The AI declined your draw offer.';
      document.getElementById('draw-offer-modal').classList.add('show');
      // Auto-close after 2 seconds since there's no real choice here
      setTimeout(() => {
        document.getElementById('draw-offer-modal').classList.remove('show');
      }, 2000);
    }
  }
}

function aiConsidersDraw() {
  // AI accepts a draw if it's losing or game is roughly equal at higher levels
  // Simple heuristic: count material difference
  const board = game.getBoard();
  const VALS = {p:1, n:3, b:3, r:5, q:9};
  let wMat = 0, bMat = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c];
    if (p && p.type !== 'k') {
      if (p.color === 'w') wMat += VALS[p.type] || 0;
      else bMat += VALS[p.type] || 0;
    }
  }
  const playerIsWhite = playerColor === 'w';
  const playerAdv = playerIsWhite ? wMat - bMat : bMat - wMat;
  // AI accepts if player is ahead (AI is losing) or if it's roughly equal and level is low
  return playerAdv >= 2 || (Math.abs(playerAdv) <= 1 && currentLevel <= 4);
}

function acceptDraw() {
  document.getElementById('draw-offer-modal').classList.remove('show');
  gameOver = true;
  clearInterval(clockInterval); clockInterval = null;
  playSound('draw');
  if (gameMode === 'ai') {
    const ch = applyElo('draw'); flashRating(ch);
    showOverlay('🤝', 'Draw Agreed', 'Draw by mutual agreement.', ch, 'neu');
  } else {
    showOverlay2P('🤝', 'Draw Agreed', 'Draw by mutual agreement.');
  }
}

function declineDraw() {
  document.getElementById('draw-offer-modal').classList.remove('show');
}


function buildPGN() {
  const h = game.getHistory ? game.getHistory() : [];
  const pieceLetters = {k:'K',q:'Q',r:'R',b:'B',n:'N',p:''};
  let pgn = '';
  const date = new Date();
  const dateStr = date.getFullYear()+'.'+(date.getMonth()+1).toString().padStart(2,'0')+'.'+date.getDate().toString().padStart(2,'0');
  pgn += `[Date "${dateStr}"]\n`;
  pgn += `[White "${gameMode==='ai'?(playerColor==='w'?'Player':'Stockfish'):'Player 1'}"]\n`;
  pgn += `[Black "${gameMode==='ai'?(playerColor==='b'?'Player':'Stockfish'):'Player 2'}"]\n`;
  pgn += '\n';

  // Use stored uciMoveLog to build SAN-like notation
  for(let i=0;i<moveLog.length;i++){
    if(i%2===0) pgn += Math.floor(i/2+1)+'. ';
    pgn += moveLog[i]+' ';
    if(i%2===1) pgn += '\n';
  }
  return pgn.trim();
}

function showPGN() {
  const pgn = buildPGN();
  document.getElementById('pgn-area').value = pgn || '(No moves yet)';
  document.getElementById('pgn-modal').classList.add('show');
}

function copyPGN() {
  const ta = document.getElementById('pgn-area');
  ta.select();
  document.execCommand('copy');
  const btn = document.getElementById('copyBtn');
  btn.textContent = '✓ Copied!';
  setTimeout(()=>{ btn.textContent='Copy'; }, 2000);
}

// ── Puzzle Mode ───────────────────────────────────────────────
// Solution arrays alternate: player_move, ai_reply, player_move, ai_reply … player_move(#)
const PUZZLES = [

  // ── PUZZLE 1 ─ Knight zugzwang & rook checkmate ────────────────────────
  {id:1, diff:'medium', rating:1200, theme:'Mate', color:'w',
   title:'Knight Zugzwang',
   desc:'White to move. Force the black king into a mating net with a knight check, then close the cage.',
   fen:'8/8/8/p1p5/pkp5/N1N5/1B6/R2K4 w - - 0 1',
   // Na3-c2+ Kb4-b3, Kd1-c1 a4-a3, Ra1xa3#
   solution:['a3c2','b4b3','d1c1','a4a3','a1a3']},

  // ── PUZZLE 2 ─ Queen 1-move checkmate ─────────────────────────────────
  {id:2, diff:'easy', rating:1100, theme:'Mate', color:'w',
   title:'Queen Smothers the King',
   desc:'White to move. The queen swoops in for an instant checkmate — all escape squares are sealed.',
   fen:'8/p5Qp/2p1p3/4B1pk/2P2Pq1/P6P/7K/3r4 w - - 0 1',
   // Qg7xh7# (1-move checkmate; h6 is the only interpose square, nothing can reach it)
   solution:['g7h7']},

  // ── PUZZLE 3 ─ Queen sacrifice + rook battery ──────────────────────────
  {id:3, diff:'hard', rating:1600, theme:'Mate', color:'w',
   title:'Queen Sacrifice Mate',
   desc:'White to move. Sacrifice the queen to lure the king out, then deliver checkmate with the rook.',
   fen:'6rk/pp1b1Q2/2b2p1p/2P5/3pR3/6Pq/P1B2P1P/6K1 w - - 0 1',
   // Qf7-h7+ Kh8xh7, Re4-e7+ Kh7-h8, Re7-h7#
   solution:['f7h7','h8h7','e4e7','h7h8','e7h7']},

  // ── PUZZLE 4 ─ Pawn avalanche smothered king ───────────────────────────
  {id:4, diff:'medium', rating:1300, theme:'Mate', color:'w',
   title:'Pawn Avalanche',
   desc:'White to move. Drive the rook into position — the enemy pawns will seal their own king\'s fate.',
   fen:'8/8/6pr/6p1/5pPk/5P1p/5P1K/R7 w - - 0 1',
   // Ra1-g1 Rh6-h7, Rg1-g3 f4xg3, f2xg3#
   solution:['a1g1','h6h7','g1g3','f4g3','f2g3']},

  // ── PUZZLE 5 ─ Pawn march + bishop cover ───────────────────────────────
  {id:5, diff:'easy', rating:900, theme:'Mate', color:'w',
   title:'Pawn March',
   desc:'White to move. Advance the h-pawn, let black reply, then the g-pawn delivers checkmate.',
   fen:'8/8/7P/5KBk/7p/8/6P1/8 w - - 0 1',
   // h6-h7 h4-h3, g2-g4#
   solution:['h6h7','h4h3','g2g4']},

  // ── PUZZLE 6 ─ Bishop lure + rook sweep ────────────────────────────────
  {id:6, diff:'medium', rating:1400, theme:'Mate', color:'w',
   title:'Bishop Lure',
   desc:'White to move. Sacrifice the bishop to drive the king to the back rank, then the rook delivers the fatal blow.',
   fen:'8/4KBpk/R5Np/7P/7P/1p6/1P6/8 w - - 0 1',
   // Bf7-g8+ Kh7xg8, Ra6-a8+ Kg8-h7, Ra8-h8# (Ph5 defends g6, sealing the mate)
   solution:['f7g8','h7g8','a6a8','g8h7','a8h8']},

  // ── PUZZLE 7 ─ Queen manoeuvre + underpromotion trap ───────────────────
  {id:7, diff:'hard', rating:1700, theme:'Mate', color:'w',
   title:'Underpromotion Trap',
   desc:'White to move. Reposition the queen, let black promote to a knight — then trap the king.',
   fen:'8/8/8/7B/4KQ2/8/2p5/4k3 w - - 0 1',
   // Qf4-h2 c2-c1=N, Ke4-e3 Ke1-f1, Qh2-h1#
   solution:['f4h2','c2c1n','e4e3','e1f1','h2h1']},

  // ── PUZZLE 8 ─ Multi-piece coordination ────────────────────────────────
  {id:8, diff:'hard', rating:1800, theme:'Mate', color:'w',
   title:'Opera of Rooks',
   desc:'White to move. Orchestrate a 4-move combination — queen sacrifice, two rook checks — for checkmate.',
   fen:'4rk2/1Q3p1r/1p2bB2/p5Rp/P5pP/6P1/1Pq5/3R3K w - - 0 1',
   // Qb7-e7+ Re8xe7, Rd1-d8+ Re7-e8, Rg5-g8+ Kf8xg8, Rd8xe8#
   solution:['b7e7','e8e7','d1d8','e7e8','g5g8','f8g8','d8e8']},
];
// ── Puzzle State ──────────────────────────────────────────────
let currentPuzzleIdx  = 0;
let puzzleSolved      = false;
let puzzleMoveIdx     = 0;
let puzzleStartTime   = 0;
let puzzleStreak      = 0;
let puzzleHintUsed    = false;
let puzzleFailedOnce  = false;
let puzzleTimerInterval = null;
let puzzleFilter      = 'all';

const puzzleProgress = {};
PUZZLES.forEach(p => { puzzleProgress[p.id] = {solved:false, stars:0, bestTime:Infinity, attempts:0}; });

// ── Helpers ───────────────────────────────────────────────────
function setPuzzleStatus(msg, cls) {
  const el = document.getElementById('puzzleStatus');
  if (!el) return;
  el.innerHTML = msg;
  el.className = 'puzzle-status' + (cls ? ' ' + cls : '');
}
function updatePuzzleTimer() {
  const el = document.getElementById('puzzleTimer');
  if (el && puzzleStartTime) el.textContent = '\u23f1 ' + Math.floor((Date.now()-puzzleStartTime)/1000) + 's';
}
function updatePuzzleProgress() {
  const solved = PUZZLES.filter(p => puzzleProgress[p.id].solved).length;
  const el = document.getElementById('puzzleProgressText');
  if (el) el.textContent = solved + ' / ' + PUZZLES.length + ' solved';
  const bar = document.getElementById('puzzleProgressBar');
  if (bar) bar.style.width = (solved/PUZZLES.length*100) + '%';
}
function updateStreakDisplay() {
  const el = document.getElementById('puzzleStreak');
  if (el) el.textContent = puzzleStreak > 1 ? '\ud83d\udd25 ' + puzzleStreak : '';
}
function renderStars(n) {
  return [1,2,3].map(i => '<span class="pstar' + (i<=n?' lit':'') + '">\u2605</span>').join('');
}
function calcStars(failed, hint) {
  if (failed) return 1;
  if (hint)   return 2;
  return 3;
}
function getFilteredPuzzles() {
  return puzzleFilter === 'all' ? PUZZLES : PUZZLES.filter(p => p.diff === puzzleFilter);
}
function renderPuzzleList() {
  const list = document.getElementById('puzzleList');
  if (!list) return;
  const DIFF_COLOR = {easy:'#5dba60', medium:'#d4a843', hard:'#e05050'};
  const current = PUZZLES[currentPuzzleIdx].id;
  list.innerHTML = getFilteredPuzzles().map(pz => {
    const pr = puzzleProgress[pz.id];
    const dc = DIFF_COLOR[pz.diff];
    const stars = pr.solved ? renderStars(pr.stars) : '<span style="color:var(--text-dim);font-size:.5rem">unsolved</span>';
    const active = pz.id === current ? ' pli-active' : '';
    return '<div class="pli' + active + '" onclick="loadPuzzleById(' + pz.id + ')">'
      + '<span class="pli-diff" style="color:' + dc + '">' + pz.diff.toUpperCase() + '</span>'
      + '<span class="pli-title">' + pz.title + '</span>'
      + '<span class="pli-theme">' + pz.theme + '</span>'
      + '<span class="pli-stars">' + stars + '</span>'
      + (pr.solved && pr.bestTime < Infinity ? '<span class="pli-time">' + pr.bestTime + 's</span>' : '')
      + '</div>';
  }).join('');
}
function setPuzzleFilter(f) {
  puzzleFilter = f;
  document.querySelectorAll('.pz-filter').forEach(b => b.classList.toggle('active', b.dataset.f === f));
  renderPuzzleList();
}

// ── Load Puzzle ───────────────────────────────────────────────
function loadPuzzle(idx) {
  currentPuzzleIdx = idx;
  const pz = PUZZLES[idx];
  puzzleSolved = false; puzzleMoveIdx = 0;
  puzzleHintUsed = false; puzzleFailedOnce = false;

  game = ChessGame(); game.loadFEN(pz.fen);
  playerColor = pz.color;
  selectedRC = null; legalDests = []; lastMove = null;
  moveLog = []; uciMoveLog = []; moveTimers = []; moveStartTime = Date.now();
  gameOver = false; aiWorking = false;

  const DIFF_COLOR = {easy:'#5dba60', medium:'#d4a843', hard:'#e05050'};
  const dc = DIFF_COLOR[pz.diff];
  const pr = puzzleProgress[pz.id];

  document.getElementById('puzzleTitle').textContent = pz.title;
  document.getElementById('puzzleDesc').textContent  = pz.desc;
  document.getElementById('puzzleTurn').textContent  = pz.color === 'w' ? '\u25ab\ufe0f White to move' : '\u25aa\ufe0f Black to move';

  const meta = document.getElementById('puzzleMeta');
  if (meta) meta.innerHTML =
    '<span class="pz-diff-badge" style="color:' + dc + ';border-color:' + dc + '44;background:' + dc + '18">' + pz.diff.toUpperCase() + '</span>'
    + '<span class="pz-theme-badge">' + pz.theme + '</span>'
    + '<span class="pz-rating-badge">\u26a1 ' + pz.rating + '</span>'
    + '<span style="margin-left:auto;font-size:.52rem;color:var(--text-dim)">#' + pz.id + '</span>';

  const starsEl = document.getElementById('puzzleStars');
  if (starsEl) starsEl.innerHTML = pr.solved ? renderStars(pr.stars) : '<span style="font-size:.6rem;color:var(--text-dim)">Not solved yet</span>';
  const attEl = document.getElementById('puzzleAttempts');
  if (attEl) attEl.textContent = pr.attempts > 0 ? 'Attempts: ' + pr.attempts : '';

  setPuzzleStatus('Find the best move!', '');
  boardFlipped = pz.color === 'b';
  buildCoords(); renderBoard(); updateCapturedPieces();
  clearInterval(clockInterval); clockInterval = null;
  clearInterval(puzzleTimerInterval); puzzleTimerInterval = null;
  puzzleStartTime = Date.now();
  puzzleTimerInterval = setInterval(updatePuzzleTimer, 1000);
  updatePuzzleTimer(); updateStreakDisplay(); updatePuzzleProgress(); renderPuzzleList();
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('overlay2p').classList.remove('show');
  const pso = document.getElementById('puzzleSolvedOverlay');
  if (pso) pso.classList.remove('show');
}
function loadPuzzleById(id) {
  const idx = PUZZLES.findIndex(p => p.id === id);
  if (idx >= 0) loadPuzzle(idx);
}
function prevPuzzle() {
  const f = getFilteredPuzzles();
  const i = f.findIndex(p => p.id === PUZZLES[currentPuzzleIdx].id);
  loadPuzzleById(f[(i - 1 + f.length) % f.length].id);
}
function nextPuzzle() {
  const f = getFilteredPuzzles();
  const i = f.findIndex(p => p.id === PUZZLES[currentPuzzleIdx].id);
  loadPuzzleById(f[(i + 1) % f.length].id);
}
function retryPuzzle() { loadPuzzle(currentPuzzleIdx); }
function showPuzzleSolution() {
  puzzleHintUsed = true;
  const pz = PUZZLES[currentPuzzleIdx];
  const mv = pz.solution[puzzleMoveIdx] || pz.solution[0];
  const from = sqToRC(mv.slice(0,2));
  selectedRC = from; legalDests = game.legalMovesFor(from.row, from.col);
  setPuzzleStatus('\ud83d\udca1 Hint: ' + mv.slice(0,2) + ' \u2192 ' + mv.slice(2,4), 'hint');
  renderBoard();
}

// ── AI plays opponent reply ───────────────────────────────────
function puzzlePlayOpponentMove() {
  const pz = PUZZLES[currentPuzzleIdx];
  if (puzzleMoveIdx >= pz.solution.length) return;
  const uci  = pz.solution[puzzleMoveIdx];
  const from = sqToRC(uci.slice(0,2));
  const to   = sqToRC(uci.slice(2,4));
  const promo= uci[4] || null;
  const mv   = game.allLegalMoves().find(m =>
    m.from.row===from.row && m.from.col===from.col &&
    m.to.row===to.row     && m.to.col===to.col &&
    (!promo || m.promo===promo));
  if (!mv) {
    // AI move not found — position may already be checkmate; check and finish
    if (game.isCheckmate()) { puzzleFinish(true); }
    else { console.warn('Puzzle AI move not found:', uci); puzzleFinish(false); }
    return;
  }
  setTimeout(() => {
    game.doMove(mv); lastMove = {from:mv.from, to:mv.to};
    playSound(game.isInCheck() ? 'check' : mv.capture ? 'capture' : 'move');
    if (game.isInCheck()) triggerCheckFlash();
    puzzleMoveIdx++;
    selectedRC = null; legalDests = [];
    renderBoard();
    if (puzzleMoveIdx >= pz.solution.length) puzzleFinish(true);
    else setPuzzleStatus('Your turn!', 'correct');
  }, 550);
}

// ── Puzzle finish ─────────────────────────────────────────────
function puzzleFinish(success) {
  clearInterval(puzzleTimerInterval); puzzleTimerInterval = null;
  const elapsed = Math.round((Date.now() - puzzleStartTime) / 1000);
  const pz = PUZZLES[currentPuzzleIdx];
  const pr = puzzleProgress[pz.id];
  pr.attempts++;
  if (success) {
    puzzleSolved = true;
    const stars = calcStars(puzzleFailedOnce, puzzleHintUsed);
    if (!pr.solved || stars > pr.stars) pr.stars = stars;
    if (elapsed < pr.bestTime) pr.bestTime = elapsed;
    pr.solved = true;
    puzzleStreak++;
    updateStreakDisplay(); updatePuzzleProgress(); renderPuzzleList();
    const starsEl = document.getElementById('puzzleStars');
    if (starsEl) starsEl.innerHTML = renderStars(stars);
    const msg = stars===3 ? '\ud83c\udf1f Perfect! ' + elapsed + 's'
              : stars===2 ? '\u2705 Solved! ' + elapsed + 's'
                          : '\u2713 Correct! ' + elapsed + 's';
    setPuzzleStatus(msg, 'correct');
    playSound('win');
    setTimeout(() => {
      const ov = document.getElementById('puzzleSolvedOverlay');
      if (!ov) return;
      document.getElementById('psoStars').innerHTML   = renderStars(stars);
      document.getElementById('psoTime').textContent  = elapsed + 's';
      document.getElementById('psoStreak').textContent = puzzleStreak > 1 ? '\ud83d\udd25 ' + puzzleStreak + ' streak!' : '';
      ov.classList.add('show');
    }, 700);
  } else {
    puzzleStreak = 0; updateStreakDisplay();
    setPuzzleStatus('\u2717 Wrong \u2014 try again!', 'wrong');
    playSound('move');
  }
}

// ── Click handler ─────────────────────────────────────────────
function onPuzzleSquareClick() {
  if (puzzleSolved || gameOver) return;
  const pz   = PUZZLES[currentPuzzleIdx];
  const turn = game.getTurn();
  if (turn !== playerColor) return;

  const row = parseInt(this.dataset.row), col = parseInt(this.dataset.col);
  const p   = game.getBoard()[row][col];

  if (selectedRC) {
    const movesHere = legalDests.filter(m => m.to.row===row && m.to.col===col);
    if (movesHere.length > 0) {
      const promoMoves = movesHere.filter(m => m.promo);
      const expected = pz.solution[puzzleMoveIdx];
      const expectedPromo = expected && expected.length === 5 ? expected[4] : null;
      const move = promoMoves.length > 1
        ? (promoMoves.find(m => m.promo === expectedPromo) || promoMoves.find(m=>m.promo==='q') || promoMoves[0])
        : movesHere[0];
      const played   = rcToSq(move.from.row,move.from.col) + rcToSq(move.to.row,move.to.col) + (move.promo||'');

      if (played === expected) {
        game.doMove(move); lastMove = {from:move.from, to:move.to};
        playSound(game.isInCheck() ? 'check' : move.capture ? 'capture' : 'move');
        if (game.isInCheck()) triggerCheckFlash();
        puzzleMoveIdx++;
        selectedRC = null; legalDests = [];
        renderBoard();
        if (puzzleMoveIdx >= pz.solution.length) {
          puzzleFinish(true);
        } else if (game.getTurn() !== playerColor) {
          setPuzzleStatus('Good! Watch the reply\u2026', 'correct');
          puzzlePlayOpponentMove();
        } else {
          setPuzzleStatus('\u2713 Good move! Keep going\u2026', 'correct');
        }
      } else {
        puzzleFailedOnce = true; puzzleStreak = 0; updateStreakDisplay();
        setPuzzleStatus('\u2717 Wrong move \u2014 try again!', 'wrong');
        selectedRC = null; legalDests = []; renderBoard();
      }
      return;
    }
    selectedRC = null; legalDests = [];
    if (p?.color === turn) { selectedRC = {row,col}; legalDests = game.legalMovesFor(row,col); }
    renderBoard(); return;
  }
  if (p?.color === turn) {
    selectedRC = {row,col}; legalDests = game.legalMovesFor(row,col); renderBoard();
  }
}
// ── Coordinates ───────────────────────────────────────────────
function buildCoords() {
  const ranks=document.getElementById('rankLabels'), files=document.getElementById('fileLabels');
  ranks.innerHTML=''; files.innerHTML='';
  for(let r=1;r<=8;r++){
    const d=document.createElement('div');
    d.textContent = boardFlipped ? r : 9-r;
    ranks.appendChild(d);
  }
  const fileCols = boardFlipped ? 'hgfedcba'.split('') : 'abcdefgh'.split('');
  fileCols.forEach(f=>{const d=document.createElement('div');d.textContent=f;files.appendChild(d);});
}

// ── Level Slider ──────────────────────────────────────────────
document.getElementById('levelSlider').addEventListener('input',function(){
  currentLevel=parseInt(this.value);
  document.getElementById('levelNum').textContent=currentLevel;
  document.getElementById('aiRatingHint').textContent='~'+AI_RATINGS[currentLevel];
  updateRatingBar();
});

// ── Init ──────────────────────────────────────────────────────
buildCoords();
updateRatingBar();
initStockfish();
setTheme('green'); // Chess.com default
newGame();
