# Italy QR Quest (10 QR Scavenger Hunt) — Vite + React + CSS

Mobile-first QR scavenger hunt for a live event:
- 10 Italy locations
- Progress tracker (1–10)
- One mini-game per location (scored once)
- Italy Explorer certificate
- Shared leaderboard (Firebase free tier)

## 1) Install + run locally
```bash
npm install
npm run dev
```

## 2) Build for production
```bash
npm run build
npm run preview
```

Deploy to Netlify/Vercel/GitHub Pages.

## 3) Leaderboard (Firebase free tier)
This app supports a shared leaderboard via Firebase:
- **Anonymous Auth** (device identity)
- **Firestore** collection: `italyQuestLeaderboard`

### Firebase setup steps
1. Create a Firebase project
2. Build → Authentication → Sign-in method → enable **Anonymous**
3. Build → Firestore Database → create database (production mode is fine if you add rules below)
4. Copy Firebase web config into `.env` (see `.env.example`)
5. Redeploy

### Recommended Firestore Security Rules
These rules allow:
- write **only** to your own UID doc
- read for everyone (leaderboard)
- prevents overwriting someone else

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /italyQuestLeaderboard/{userId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update, delete: if false;
    }
  }
}
```

## 4) QR codes
After deploy, generate QR codes that link to:
- `/loc/1` … `/loc/10`

Open:
- `/admin/links` to see the full URL list on your deployed domain.

## 5) Fairness note (real-world)
No $0 web-only system can perfectly stop cheating (people can clear app data).
This build prevents **re-scoring** using:
- local storage lock
- Firebase UID doc lock (anonymous auth)

It’s practical for live events and department competitions.

## 6) Customization
- Edit locations: `src/data/locations.js`
- Departments: `src/utils/departments.js`
- Colors/themes: `src/styles/theme.css`
