# ♟ Chess — Railway Deploy Təlimatı

## Lazım olan fayllar

Bütün fayllarını bir qovluqda topla:

```
chess-game/
├── server.js
├── package.json
├── railway.json        ← YENİ (bu faylı əlavə et)
├── index.html
├── chess.html
├── chess.js
├── auth.js
├── online-game.html
├── multiplayer.html
├── leaderboard.html
├── profile.html
├── play.html
├── home.html
├── learn.html
└── puzzle.html
```

---

## Addım 1 — GitHub-da repo yarat

1. https://github.com saytına gir (hesab yoxdursa qeydiyyatdan keç)
2. Sağ yuxarıda **"New repository"** düyməsinə bas
3. Ad yaz: `chess-game`
4. **Public** seç
5. **"Create repository"** düyməsinə bas
6. **"uploading an existing file"** linkini tap, bütün faylları sürüklə-burax
7. **"Commit changes"** düyməsinə bas

---

## Addım 2 — Railway-də qeydiyyat

1. https://railway.app saytına gir
2. **"Start a New Project"** və ya **"Login"** düyməsinə bas
3. **"Login with GitHub"** seç — GitHub hesabınla giriş et
4. Railway GitHub hesabına icazə istəyəcək → **"Authorize"** düyməsinə bas

---

## Addım 3 — Verilənlər bazası yarat (PostgreSQL)

1. Railway dashboard-da **"New Project"** düyməsinə bas
2. **"Provision PostgreSQL"** seç
3. Bir neçə saniyə gözlə — verilənlər bazası hazır olacaq
4. PostgreSQL servisinə tıkla → **"Variables"** tabına keç
5. `DATABASE_URL` dəyərini kopyala (sonra lazım olacaq)

---

## Addım 4 — Node.js layihəni əlavə et

1. Eyni proyektdə **"New"** → **"GitHub Repo"** düyməsinə bas
2. `chess-game` reposunu seç
3. Railway avtomatik `package.json`-u tanıyacaq və deploy edəcək

---

## Addım 5 — Environment dəyişənlərini əlavə et

Node.js servisinə tıkla → **"Variables"** tabına keç → aşağıdakıları əlavə et:

| Dəyişən | Dəyər |
|---------|-------|
| `DATABASE_URL` | PostgreSQL servisindən kopyaladığın URL |
| `JWT_SECRET` | İstənilən uzun random mətn (məs: `chess-railway-secret-2024-xyzabc`) |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |

> **DATABASE_URL üçün qısa yol:** Variables tabında **"Add Reference"** düyməsi var,
> oradan PostgreSQL servisini seç — avtomatik əlavə olunacaq.

---

## Addım 6 — Domain al

1. Node.js servisinə tıkla → **"Settings"** tabına keç
2. **"Networking"** bölməsində **"Generate Domain"** düyməsinə bas
3. Sənə belə bir URL veriləcək: `chess-game-production-xxxx.up.railway.app`

---

## Addım 7 — API URL-ni yenilə

Terminal aç, layihə qovluğuna keç:

```bash
node patch-api-url.js https://chess-game-production-xxxx.up.railway.app
```

Sonra yenilənmiş faylları GitHub-a yükləyib commit et.
Railway avtomatik yenidən deploy edəcək.

---

## Yoxlama siyahısı

- [ ] `railway.json` faylı layihəyə əlavə edilib
- [ ] GitHub-a bütün fayllar yüklənib
- [ ] Railway-də PostgreSQL əlavə edilib
- [ ] `DATABASE_URL` environment variable əlavə edilib
- [ ] `JWT_SECRET` environment variable əlavə edilib
- [ ] Domain alınıb
- [ ] `patch-api-url.js` işlədilib və fayllar yenidən GitHub-a yüklənib

---

## Qiymət

Railway-nin **Hobby planı** aylıq **$5**-dır.
İlk qeydiyyatda **$5 kredit** verir — yəni **ilk ay pulsuzdur**.
Render-dən fərqli olaraq server **yatmır**, həmişə aktiv olur.
