# Demo Walkthrough

A guided tour of the full growth loop — discovery → outreach → signup → ride match →
funnel — using the live deployment or a local setup.

## Try it live

- Dashboard: https://fellaride-dashboard.vercel.app
- Backend API: https://fellaride-backend.onrender.com/health
- Mobile app: see the [download link](../README.md#download-the-app) in the root README

The Render free tier spins down when idle — the first request after a quiet period can
take ~30s to wake up.

## Local setup (optional)

```bash
cd backend && npm run seed   # populate Firestore with demo data
cd backend && npm run dev    # http://localhost:4000
cd dashboard && npm run dev  # http://localhost:3000/dashboard
```

Run the mobile app on an emulator/device/Chrome and point it at your local backend with
`flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000` (Android emulator) or
`http://localhost:4000` (web/iOS/desktop).

## Walkthrough

### 1. Discovery & ranking

Open the dashboard's **Ranked seed users** table. Each row is a candidate connector,
likely driver, or early adopter for the pilot community, ranked by a combined priority
score. Click a row to expand **"Why this score"** — every score is backed by the raw
signals behind it (connection count, group memberships, stated commute info), not a
black box.

### 2. Log a contextual outreach

Click **Log outreach** on a ranked member. The pre-filled message references their
actual affiliation rather than a generic blast. Sending it appears immediately in the
**Campaign / intervention tracker** below.

### 3. Sign up via referral, in the mobile app

In the mobile app, sign up with any email/password and enter a seeded user's id (e.g.
`seed-user-aanya`) as the **referral code**. Complete profile setup — role, home/work
location, commute schedule. That referral attribution flows straight into
`POST /referrals`.

### 4. A ride match happens

Land on the passenger's home screen — a matching ride (real geo + time-window matching,
not a mock) appears in the list. Open it and tap **Request to join**.

### 5. The growth funnel updates

Back on the dashboard, click **Refresh**. The funnel — Discovered → Contacted →
Registered → First ride → Referred → Repeat rider — reflects everything that just
happened: a ranked seed user got a contextual message, a real signup got attributed to
them, and it flowed into a ride match.

## Troubleshooting

- **Referral code doesn't work**: any of the 18 seeded user ids work (see
  `backend/scripts/seed.ts` — `seed-user-<firstname>`), not just Aanya's.
- **No match appears on the passenger's home screen**: pull to refresh again — the first
  `GET /rides/matches` call is also what creates the `Match` document server-side.
- **Dashboard shows stale numbers**: click **Refresh** — it's a manual pull, not
  auto-polling, by design.
- **Signup fails immediately**: confirm the Firebase project's Email/Password sign-in
  provider is enabled (Authentication → Sign-in method in the Firebase console).
