# FellaRide

A cold-start engine for community carpooling: discover a target community's structure
from public signals, rank the people most likely to become connectors, drivers, or
early adopters, activate them with contextual (not generic) outreach, and track the
whole growth loop — discovery → outreach → registration → first ride → referral →
repeat usage — end to end.

## Live

| | |
|---|---|
| 📱 Mobile app | [**Download APK**](https://github.com/chethankotian2005/FellaRide/releases/latest/download/FellaRide.apk) |
| 📊 Growth dashboard | https://fellaride-dashboard.vercel.app |
| 🔌 Backend API | https://fellaride-backend.onrender.com/health |

The backend is on Render's free tier and spins down when idle — the first request
after a quiet period can take ~30s to wake up. See
[`docs/DEMO_WALKTHROUGH.md`](docs/DEMO_WALKTHROUGH.md) for a guided tour.

## How it works

- **Discover** — a signal-scoring service ranks community members as likely
  connectors, drivers, or early adopters from public-style signals (group
  memberships, post frequency, stated commute info, connection count), with every
  score broken down into the signals behind it — no black box.
- **Activate** — the growth dashboard lets an operator log a contextual outreach
  message to a ranked member and tracks what was sent.
- **Match** — drivers post rides, passengers get ranked matches from a real
  geo-distance + time-window algorithm, and can request to join.
- **Grow** — referrals are tracked end to end (who invited whom, multi-level chains),
  feeding a funnel: Discovered → Contacted → Registered → First ride → Referred →
  Repeat rider.

## Architecture

```
/backend    Node.js + Express + TypeScript — matching, referrals, signal scoring
/dashboard  Next.js — growth/ops dashboard + public waitlist landing page
/mobile     Flutter — driver/passenger carpooling app (Riverpod)
/docs       Demo walkthrough
```

All three share one Firebase project (Firestore + Auth). `/backend` is the only thing
that talks to Firestore directly; `/dashboard` and `/mobile` both go through its REST
API. See [`backend/README.md`](backend/README.md) for the full endpoint reference.

**Stack**: Express, Next.js (App Router, Tailwind, recharts), Flutter (Riverpod,
Firebase Auth), Firebase Admin SDK, Firestore. Deployed on Render (backend) and Vercel
(dashboard); CI runs on GitHub Actions.

## Running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your Firebase service account credentials
npm run dev             # http://localhost:4000
npm run seed             # populate Firestore with demo data
```

### Dashboard

```bash
cd dashboard
npm install
npm run dev              # http://localhost:3000, reads NEXT_PUBLIC_API_BASE_URL
```

### Mobile

```bash
cd mobile
flutter pub get
flutter run               # pick a device/simulator, or `-d chrome`
```

Connects to a Firebase project via `flutter pub add`-installed Firebase Core/Auth/
Firestore and `lib/firebase_options.dart` (generated with the
[FlutterFire CLI](https://firebase.google.com/docs/flutter/setup): `flutterfire
configure`). Point it at a different backend with
`flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000` (Android emulator) or
any reachable URL.
