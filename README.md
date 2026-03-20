# ♟ Chess Game — Backend Setup

## What this adds
- **Login / Register** — accounts saved in a local SQLite database
- **Persistent ratings** — your Elo rating is remembered forever, across devices
- **Leaderboard** — see all players ranked by rating
- **Game history** — review your last 20 games

---

## Quick Start

### 1. Requirements
- **Node.js 18+** — download from https://nodejs.org

### 2. Install dependencies

Place all files in this structure:
```
chess-game/
  chess.html      ← updated frontend
  chess.js        ← updated game logic
  auth.js         ← new auth module
  backend/
    server.js
    package.json
```

Open a terminal in the `backend/` folder:

```bash
npm install
```

### 3. Start the server

```bash
npm start
```

You should see:
```
✅ Database ready: .../chess.db
♟  Chess backend running at http://localhost:3001
   Game: http://localhost:3001/chess.html
```

### 4. Open the game

Visit **http://localhost:3001/chess.html** in your browser.

> ⚠️ Do NOT open chess.html as a local file (file://). Open it via the server URL above so login works correctly.

---

## How It Works

| File | Purpose |
|------|---------|
| `server.js` | Express API server — handles login, ratings, leaderboard |
| `chess.db` | Auto-created SQLite database (created on first run) |
| `auth.js` | Frontend login UI — injects sign-in bar + modals |
| `chess.js` | Game logic — now calls server after each game to save rating |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login (username or email) |
| GET  | `/api/me` | Get your profile + rating |
| GET  | `/api/me/history` | Your last 20 games |
| POST | `/api/game/result` | Save a game result |
| GET  | `/api/leaderboard` | Top 50 players |

---

## Production Deployment

For real deployment (e.g. on a VPS or Railway):

1. Set environment variables:
   ```bash
   export JWT_SECRET=your-very-long-random-secret-here
   export PORT=3001
   ```

2. Use a process manager:
   ```bash
   npm install -g pm2
   pm2 start server.js --name chess
   ```

3. Put behind Nginx for HTTPS (optional but recommended for public hosting).

---

## Notes
- Ratings are saved automatically after every AI game (not 2-player or puzzle mode)
- Without an account, ratings are still tracked locally in the browser as before
- The database file `chess.db` is created automatically in the backend folder
