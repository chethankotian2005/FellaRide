# FellaRide

Prototype for Manipal Hackathon 2026 (M#26), Problem Statement P06 — "Build a
Community from Zero: The FellaRide Butterfly Effect". Full context in
[`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md).

A cold-start engine for carpooling communities: discover a target community's
structure from public signals, prioritize likely connectors/drivers/early
adopters, and activate them through a growth loop (registration → first ride
→ referral → repeat usage).

## Monorepo layout

```
/backend    Node.js + Express API (TypeScript) — matching, referrals, signal scoring
/dashboard  Next.js app — growth/ops dashboard + public landing page
/mobile     Flutter app — driver/passenger carpooling experience
/docs       Project brief and other planning docs
```

Each part is independently runnable; `/backend` is the shared data layer both
`/dashboard` and `/mobile` talk to.

## Prerequisites

- Node.js 20+ and npm
- Flutter SDK (stable channel) and a configured platform toolchain (Android
  Studio / Xcode) if you want to run on a device or simulator — running on
  Chrome (`flutter run -d chrome`) needs neither
- A Firebase project, if you want `/backend` to actually read/write data
  (see below) — everything else runs without one

## Running locally

### 1. Backend (`/backend`)

```bash
cd backend
npm install
cp .env.example .env   # fill in your Firebase service account credentials
npm run dev             # http://localhost:4000
```

The server boots and serves `GET /health` even without Firebase credentials
configured; routes that touch Firestore return a clear `500` until `.env` is
filled in. See [`backend/README.md`](backend/README.md) for the full API
reference.

### 2. Dashboard (`/dashboard`)

```bash
cd dashboard
npm install
npm run dev              # http://localhost:3000
```

Set `NEXT_PUBLIC_API_BASE_URL` (e.g. in `dashboard/.env.local`) once the
dashboard starts calling the backend API.

### 3. Mobile (`/mobile`)

```bash
cd mobile
flutter pub get
flutter run               # pick a connected device/simulator, or `-d chrome`
```

Firebase Core/Auth/Firestore are already added as dependencies
(`mobile/pubspec.yaml`). To actually connect to a Firebase project, run
`flutterfire configure` from the `mobile/` directory (requires the
[FlutterFire CLI](https://firebase.google.com/docs/flutter/setup)) — this
generates `lib/firebase_options.dart` and the platform config files
(`google-services.json`, `GoogleService-Info.plist`), which are gitignored
since they're per-environment.

## Status

Scaffolding only — see each package's own code for what's implemented so far.
