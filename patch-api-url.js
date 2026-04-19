#!/usr/bin/env node
// patch-api-url.js
// Run this ONCE after you get your Render URL:
//   node patch-api-url.js https://your-app-name.onrender.com

const fs   = require('fs');
const path = require('path');

const newUrl = process.argv[2];
if (!newUrl) {
  console.error('Usage: node patch-api-url.js https://your-app.onrender.com');
  process.exit(1);
}

const files = [
  'index.html', 'chess.html', 'leaderboard.html',
  'profile.html', 'auth.js', 'play.html', 'home.html',
  'learn.html', 'puzzle.html'
];

let patched = 0;
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const original = fs.readFileSync(file, 'utf8');
  const updated  = original.replace(/http:\/\/localhost:3001\/api/g, newUrl + '/api');
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log('✅ Patched:', file);
    patched++;
  }
}
console.log(`\nDone — patched ${patched} file(s). API now points to: ${newUrl}/api`);
