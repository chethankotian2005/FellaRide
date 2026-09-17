# FellaRide Backend

TypeScript + Express API for the FellaRide carpooling prototype: ride matching, referral
tracking, and the community discovery/signal-scoring service that powers the growth
dashboard's "who to activate first" ranking.

## Setup

```bash
npm install
cp .env.example .env   # then fill in your Firebase service account credentials
npm run dev             # http://localhost:4000, auto-reloads on change
```

Other scripts: `npm run build` (compile to `dist/`), `npm start` (run compiled build),
`npm run typecheck`.

The server boots fine without Firebase credentials configured (useful for hitting
`/health` early), but every route that touches Firestore will return a `500` with a
clear message until `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and
`FIREBASE_PRIVATE_KEY` are set in `.env` — see `.env.example`.

## Folder structure

```
src/
  config/     env loading, Firebase Admin SDK initialization
  middleware/ request validation (zod), error handling
  models/     TypeScript interfaces + Firestore collection names
  routes/     Express routers (one per resource) + zod request schemas
  services/   business logic (matching, referrals, discovery/scoring)
```

## Endpoints

### `GET /health`

Liveness check.

**Response `200`**
```json
{ "status": "ok", "service": "fellaride-backend", "timestamp": "2026-09-17T12:00:00.000Z" }
```

---

### `POST /users`

Create or update (upsert by `id`) a user profile. Omit `id` to create a new user.

**Request**
```json
{
  "name": "Aanya Shetty",
  "role": "passenger",
  "homeLocation": { "lat": 13.0108, "lng": 74.7942, "label": "Kadri" },
  "workLocation": { "lat": 12.9950, "lng": 74.8000, "label": "Campus" },
  "commuteSchedule": { "days": ["mon", "tue", "wed", "thu", "fri"], "departureTime": "08:30" },
  "referredBy": "member-014"
}
```

**Response `201` (or `200` on update)** — the stored `User` document, including generated
`id`, `createdAt`, `updatedAt`.

---

### `POST /rides`

A driver offers a ride.

**Request**
```json
{
  "driverId": "user-123",
  "route": {
    "origin": { "lat": 13.0108, "lng": 74.7942, "label": "Kadri" },
    "destination": { "lat": 12.9950, "lng": 74.8000, "label": "Campus" }
  },
  "departureTime": "2026-09-18T08:30:00.000Z",
  "seatsAvailable": 3
}
```

**Response `201`** — the stored `Ride` document (`status: "open"`).

---

### `GET /rides/matches?userId=...`

Returns ranked ride matches for a passenger. See "Matching algorithm" below.
Also upserts a `pending` `Match` document per candidate (keyed by `${rideId}_${userId}`),
so each returned match can subsequently be accepted via its `id`.

**Response `200`**
```json
{
  "userId": "user-123",
  "count": 1,
  "matches": [
    {
      "id": "ride-abc_user-123",
      "rideId": "ride-abc",
      "passengerId": "user-123",
      "status": "pending",
      "distanceKm": 1.2,
      "timeOffsetMinutes": 10,
      "createdAt": "...",
      "updatedAt": "...",
      "ride": { "id": "ride-abc", "driverId": "user-456", "route": { ... }, "...": "..." }
    }
  ]
}
```

**Matching algorithm** (see `src/services/matching.service.ts`): a ride is a candidate
match if the ride's route origin is within 3km (straight-line/Haversine) of the
passenger's home AND the destination is within 3km of the passenger's work, AND the
ride's departure time-of-day is within 30 minutes of the passenger's stated
`commuteSchedule.departureTime`. Candidates are ranked by
`distanceKm + timeOffsetMinutes / 10` ascending (lower is better) — a simple, explainable
score rather than a black-box model, intentionally.

**A note on `departureTime`**: it's compared as a wall-clock `"HH:mm"` string (the ISO
timestamp's characters at index 11-16), not as a timezone-aware instant — see the
comment on `isoToTimeOfDay()` in `src/services/geo.util.ts`. A pilot community lives in
one timezone, so a ride created for "8:15am" and a passenger's `commuteSchedule` of
"8:20am" should compare as 5 minutes apart regardless of what timezone the server
happens to run in. **Don't call `.toUTC()`/similar before sending `departureTime`** —
send the local wall-clock ISO string as typed (see `mobile`'s `ApiClient.createRide`
for the client-side half of this).

---

### `POST /matches/:id/accept`

Accepts a pending match.

**Response `200`** — the updated `Match` document (`status: "accepted"`).
**Response `404`** if no match with that id exists.

---

### `POST /referrals`

Records a referral event.

**Request**
```json
{ "referrerId": "user-123", "refereeId": "user-789", "outcome": "registered" }
```
`outcome` is one of `"registered" | "firstRide" | "repeatRider"`.

**Response `201`** — the stored `ReferralEvent`.

---

### `GET /referrals/funnel`

Aggregate growth-loop funnel counts for the dashboard.

**Response `200`**
```json
{
  "discovered": 50,
  "contacted": 12,
  "registered": 8,
  "firstRide": 5,
  "referred": 3,
  "repeatRider": 1
}
```
- `discovered` = size of the `communityMembers` collection (seeded by `GET /discovery/ranked-members`)
- `contacted` = distinct members with at least one logged intervention
- `registered` = max of referral-attributed registrations and total `users` documents
- `firstRide` / `repeatRider` = distinct referees with that referral outcome
- `referred` = distinct referrers with at least one successful referral

---

### `GET /discovery/ranked-members`

Returns the pilot community's members ranked by combined priority score, with the
signals behind each score for dashboard explainability. Runs against a deterministic
**mock dataset** (see "Discovery & signal scoring" below) — not live scraped data.

**Response `200`**
```json
{
  "pilotCommunity": "Crestwood Institute of Technology — Computer Science & Engineering Dept (day-scholars)",
  "count": 50,
  "members": [
    {
      "id": "member-001",
      "name": "Varun Kamath",
      "publicSignals": { "groupMemberships": 7, "postFrequency": 5, "connectionCount": 224, "mentionsVehicle": true, "statedCommuteInfo": [], "affiliation": "4th Year CSE - Section B" },
      "computedScores": { "connectorScore": 91, "likelyDriverScore": 50, "earlyAdopterScore": 22, "priorityScore": 60 },
      "reasons": [
        "Connector: connectionCount=224 (community range 0-250), groupMemberships=7 (4th Year CSE - Section B and others)",
        "Driver: mentionsVehicle=true, vehicle/commute keyword mentions=0",
        "Early adopter: postFrequency=5/mo (community range 0-25)"
      ],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### `POST /discovery/intervention`

Logs a contextual outreach message sent to a community member, for the campaign tracker.

**Request**
```json
{ "memberId": "member-001", "message": "Hey Varun — saw you're in the CSE dept carpool chat...", "channel": "email" }
```

**Response `201`** — the stored `Intervention` document.

---

### `GET /discovery/interventions`

Logged outreach messages, newest first, joined with the member's name — feeds the dashboard's
campaign/intervention tracker table.

**Response `200`**
```json
{
  "count": 1,
  "interventions": [
    {
      "id": "...",
      "memberId": "member-001",
      "memberName": "Varun Kamath",
      "message": "Hey Varun — saw you're in the CSE dept carpool chat...",
      "channel": "email",
      "sentAt": "2026-09-17T12:00:00.000Z"
    }
  ]
}
```
"Outcome" isn't tracked as a separate field yet — a real version would link this to whether the
member subsequently registered — so every entry is effectively "Sent" for now.

---

### `POST /waitlist`

Public landing-page signup for the pilot community (no auth).

**Request**
```json
{ "name": "Aanya Shetty", "email": "aanya@example.com", "affiliation": "3rd Year CSE" }
```

**Response `201`** — the stored `WaitlistEntry`.

## Discovery & signal scoring

`src/services/discovery.service.ts` computes three 0-100 component scores per community
member (`connectorScore`, `likelyDriverScore`, `earlyAdopterScore`) plus a weighted
`priorityScore`, from a mock dataset in `src/services/discoveryMockData.ts` standing in
for a real pilot community (currently a placeholder fictional "Crestwood Institute of
Technology — CSE Dept" — swap freely, nothing downstream depends on the specifics).
The scoring formulas are simple and linear on purpose — see the doc comment atop
`discovery.service.ts` for the exact weights/rationale and for notes on how this would
be extended to real public data sources post-hackathon.
