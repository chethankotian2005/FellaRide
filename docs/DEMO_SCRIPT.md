# Round 1 Demo Script (≤3 minutes, prototype segment)

Target run time: **2:45**, leaving buffer inside the 3-minute prototype-demo limit.

## Before you record — pre-flight checklist

Do all of this *before* hitting record. Nothing below should happen live.

1. **Firebase Auth must be enabled** — open
   https://console.firebase.google.com/project/fellaride-hackathon/authentication/providers
   and turn on the **Email/Password** sign-in provider if it isn't already (one-time
   setup; as of this writing it still needs a manual click in the console — the REST
   activation path is gated behind a billing-enabled "Identity Platform" upgrade we're
   not using). Skipping this makes step 3 below fail.
2. Re-seed so every take starts from identical state:
   ```bash
   cd backend && npm run seed
   ```
3. Start the backend: `cd backend && npm run dev` (http://localhost:4000)
4. Start the dashboard: `cd dashboard && npm run dev` (http://localhost:3000/dashboard)
5. Have the mobile app running on an emulator/device/Chrome, **signed out** (fresh
   install, or log out from any previous test account).
6. Have `dashboard/` open at `/dashboard` in one window and the mobile app visible in
   another (screen-record both, or switch between them quickly).
7. Know the referral code you'll type into the mobile app: **`seed-user-aanya`**
   (Aanya Shetty — a seeded driver whose ride matches the location/time you'll enter
   in step 3). Using a different seeded id is fine as long as its ride still overlaps
   with what you enter at signup.

---

## Script

### 1. Discovery & ranking (0:00 – 0:35)

- On the dashboard (`/dashboard`), point at the **funnel bar chart** at the top: "This
  is our growth loop — discovery through repeat rides, live."
- Scroll to **Ranked seed users**. Say: "We don't just find an audience — we rank who
  to talk to first, and show our work." Click a top-ranked row (e.g. Aanya Shetty) to
  expand it.
- Read one of the **"Why this score"** reasons aloud — e.g. connection count vs.
  community range — to land the explainability point.

### 2. Log a contextual outreach (0:35 – 0:55)

- Click **Log outreach** on that same row. The modal pre-fills a message referencing
  their affiliation — say: "Contextual, not a blast — it references their actual
  group." Click **Log outreach** to send.
- Point at the **Campaign / intervention tracker** below as the new row appears.

### 3. Sign up via referral, in the mobile app (0:55 – 1:40)

- Switch to the mobile app. Tap **Get started** → enter any email/password → in
  **Referral code**, type `seed-user-aanya` → Sign up.
- Profile setup: name, role = **Passenger**, home = **Kadri**, work = **Campus Main
  Gate**, leave the default weekday commute days, set departure time to **08:20**
  (close enough to Aanya's 08:15 ride to guarantee a match). Tap **Finish setup**.
- Say: "That referral code just attributed this signup back to Aanya — we'll see it
  on the funnel in a moment."

### 4. Ride match happens (1:40 – 2:15)

- Land on **Home** — the passenger's matched-rides list already shows Aanya's ride
  (pull down to refresh if it's not instant). Tap it.
- On the match detail screen, point at the **distance / time-offset** numbers — "This
  is a real geo + time-window match against the driver's route, not a mock." Tap
  **Request to join**.

### 5. Growth funnel updates (2:15 – 2:45)

- Switch back to the dashboard, click **Refresh** in the header.
- Point at the funnel: **Discovered → Contacted → Registered** counts have moved —
  "That's the loop closing: a ranked seed user got a contextual message, and a real
  signup — attributed to them — just flowed through to a ride match."
- Closing line: "Same loop, any community — point it at a new pilot group and it
  starts from zero again."

---

## If something goes wrong live

- **Referral code typo / signup fails**: any of the 18 seeded user ids work as a
  referral code (see `backend/scripts/seed.ts` — `seed-user-<firstname>`), not just
  Aanya's. Pick another and keep going.
- **No match appears on the passenger's home screen**: pull to refresh once more: the
  first `GET /rides/matches` call is also what creates the `Match` document
  server-side, so a second pull after a `Match` write has settled a beat cleared any
  race in rehearsals.
- **Dashboard shows stale numbers**: click **Refresh** — it's a manual pull, not
  auto-polling, by design (predictable during a live demo).
- **Firebase Auth signup fails immediately**: you skipped pre-flight step 1 — the
  Email/Password provider isn't enabled for the project.
