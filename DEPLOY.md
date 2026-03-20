# ♟ Chess Site — Deployment Guide (Render + GitHub)

## Your file structure

Put everything in ONE folder like this:

```
chess-game/
├── server.js          ← (use the patched version provided)
├── package.json
├── render.yaml
├── .gitignore
├── patch-api-url.js
├── index.html
├── chess.html
├── chess.js
├── auth.js
├── leaderboard.html
├── profile.html
├── play.html
├── home.html
├── learn.html
└── puzzle.html
```

> ⚠️ Do NOT include chess.db, node_modules/, or start.bat

---

## Step 1 — Create a GitHub repository

1. Go to https://github.com and sign in (create a free account if needed)
2. Click **"New repository"** (green button, top right)
3. Name it: `chess-game`
4. Set it to **Public**
5. Click **"Create repository"**

---

## Step 2 — Upload your files to GitHub

On the repository page, click **"uploading an existing file"** link:

1. Drag and drop ALL your chess files into the upload area
2. Add a commit message like `initial upload`
3. Click **"Commit changes"**

---

## Step 3 — Deploy on Render (free hosting)

1. Go to https://render.com and sign up with your GitHub account
2. Click **"New +"** → **"Web Service"**
3. Select your `chess-game` repository
4. Fill in the settings:
   - **Name:** chess-game (or anything you like)
   - **Region:** closest to you
   - **Branch:** main
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
5. Click **"Create Web Service"**
6. Wait 2–3 minutes for deployment

You will get a URL like: `https://chess-game-xxxx.onrender.com`

---

## Step 4 — Patch the API URL in your frontend files

Your frontend files currently say `http://localhost:3001/api`.
You need to change them to your real Render URL.

Open a terminal in your chess-game folder and run:

```bash
node patch-api-url.js https://chess-game-xxxx.onrender.com
```

Replace `chess-game-xxxx.onrender.com` with your actual Render URL.

Then go back to GitHub, upload the updated files again (commit them).
Render will automatically redeploy.

---

## Step 5 — Submit to Google Search Console

1. Go to https://search.google.com/search-console
2. Click **"Add property"**
3. Enter your Render URL
4. Verify ownership (Google gives you a meta tag — add it to the `<head>` of index.html)
5. Click **"Request Indexing"**

Google will index your site within a few days.

---

## Important notes

- **Free Render plan:** The server "sleeps" after 15 minutes of inactivity.
  The first visit after sleep takes ~30 seconds to wake up. This is normal.
- **Database resets:** On the free plan, the SQLite database in `/tmp` resets
  when Render redeploys. For permanent data, upgrade to a paid plan or use
  a free external database like Supabase (https://supabase.com).
- **Custom domain:** In Render settings you can add your own domain (e.g. mychess.com)
  for free once you own the domain.

---

## Quick checklist

- [ ] All files in one folder (no chess.db, no node_modules)
- [ ] Pushed to GitHub
- [ ] Deployed on Render
- [ ] Got Render URL
- [ ] Ran `node patch-api-url.js <url>` and re-uploaded files
- [ ] Submitted to Google Search Console
