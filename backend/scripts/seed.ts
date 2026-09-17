/**
 * Idempotent demo seed script. Safe to re-run before every rehearsal/take —
 * it clears the collections it owns and rewrites fixed-id records, so the
 * demo state is identical every time (no accumulating duplicates, no drift
 * across takes).
 *
 * Usage:  npm run seed   (from backend/)
 *
 * What it seeds:
 *   - ~18 realistic user profiles for the pilot community (mix of
 *     drivers/passengers/both)
 *   - A handful of ride offers and matches in varied states
 *   - A two-level referral chain: Aanya -> Rohan -> Priya
 *   - The ~50-member discovery mock dataset with computed scores (reuses
 *     the real scoring service — see src/services/discovery.service.ts —
 *     rather than duplicating the scoring logic here)
 *
 * What it deliberately leaves EMPTY: `interventions` and `waitlist`.
 * DEMO_SCRIPT.md's "log an outreach intervention" step is meant to happen
 * live, starting from zero, so the campaign tracker visibly goes from empty
 * to populated in front of judges.
 */
import { getDb, initializeFirebase } from "../src/config/firebase";
import { Collections } from "../src/models/collections";
import { User } from "../src/models/user.model";
import { Ride } from "../src/models/ride.model";
import { Match } from "../src/models/match.model";
import { ReferralEvent } from "../src/models/referral.model";
import { getRankedMembers } from "../src/services/discovery.service";

// Shared with mobile/lib/core/config/pilot_locations.dart — keep in sync if
// you change the pilot community's landmarks.
const LOCATIONS = {
  kadri: { lat: 13.0108, lng: 74.7942, label: "Kadri" },
  campus: { lat: 12.995, lng: 74.8, label: "Campus Main Gate" },
  oldTown: { lat: 13.021, lng: 74.81, label: "Old Town" },
  busStand: { lat: 12.98, lng: 74.785, label: "Bus Stand" },
  techPark: { lat: 13.005, lng: 74.825, label: "Tech Park Road" },
  riverside: { lat: 12.97, lng: 74.77, label: "Riverside Layout" },
  hillview: { lat: 13.03, lng: 74.79, label: "Hillview Hostel Block" },
  eastMarket: { lat: 12.99, lng: 74.84, label: "East Market" },
};

const now = () => new Date().toISOString();

async function clearCollection(name: string) {
  const db = getDb();
  const snap = await db.collection(name).get();
  if (snap.empty) return;

  // Firestore batches cap at 500 writes — our demo collections are small,
  // but chunk anyway so this doesn't silently break if that changes.
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 500) {
    const batch = db.batch();
    for (const doc of docs.slice(i, i + 500)) batch.delete(doc.ref);
    await batch.commit();
  }
}

interface SeedUserInput {
  id: string;
  name: string;
  role: User["role"];
  home: typeof LOCATIONS.kadri;
  work: typeof LOCATIONS.kadri;
  days: string[];
  departureTime: string;
  referredBy?: string;
}

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri"];

const SEED_USERS: SeedUserInput[] = [
  { id: "seed-user-aanya", name: "Aanya Shetty", role: "driver", home: LOCATIONS.kadri, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:15" },
  { id: "seed-user-rohan", name: "Rohan Rao", role: "passenger", home: LOCATIONS.kadri, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:20", referredBy: "seed-user-aanya" },
  { id: "seed-user-priya", name: "Priya Kamath", role: "passenger", home: LOCATIONS.oldTown, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:10", referredBy: "seed-user-rohan" },
  { id: "seed-user-karthik", name: "Karthik Pai", role: "driver", home: LOCATIONS.techPark, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:30" },
  { id: "seed-user-meera", name: "Meera Shenoy", role: "both", home: LOCATIONS.busStand, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:00" },
  { id: "seed-user-aditya", name: "Aditya Hegde", role: "passenger", home: LOCATIONS.oldTown, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:25" },
  { id: "seed-user-sanya", name: "Sanya Nair", role: "driver", home: LOCATIONS.riverside, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:05" },
  { id: "seed-user-vikram", name: "Vikram Bhat", role: "passenger", home: LOCATIONS.riverside, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:05" },
  { id: "seed-user-ishaan", name: "Ishaan Kulkarni", role: "passenger", home: LOCATIONS.techPark, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:35" },
  { id: "seed-user-diya", name: "Diya Menon", role: "driver", home: LOCATIONS.hillview, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "07:55" },
  { id: "seed-user-arjun", name: "Arjun Shah", role: "passenger", home: LOCATIONS.hillview, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:00" },
  { id: "seed-user-neha", name: "Neha Reddy", role: "passenger", home: LOCATIONS.eastMarket, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:15" },
  { id: "seed-user-kabir", name: "Kabir Iyer", role: "driver", home: LOCATIONS.eastMarket, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:10" },
  { id: "seed-user-tara", name: "Tara Gowda", role: "both", home: LOCATIONS.kadri, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:20" },
  { id: "seed-user-rahul", name: "Rahul Prabhu", role: "passenger", home: LOCATIONS.busStand, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:05" },
  { id: "seed-user-ananya", name: "Ananya Kulkarni", role: "passenger", home: LOCATIONS.oldTown, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:12" },
  { id: "seed-user-dev", name: "Dev Shetty", role: "driver", home: LOCATIONS.oldTown, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:10" },
  { id: "seed-user-isha", name: "Isha Rao", role: "passenger", home: LOCATIONS.techPark, work: LOCATIONS.campus, days: WEEKDAYS, departureTime: "08:32" },
];

function isoAt(hour: number, minute: number, daysFromNow = 1): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

async function seedUsers() {
  const db = getDb();
  const batch = db.batch();
  for (const u of SEED_USERS) {
    const user: User = {
      id: u.id,
      name: u.name,
      role: u.role,
      homeLocation: u.home,
      workLocation: u.work,
      commuteSchedule: { days: u.days, departureTime: u.departureTime },
      ...(u.referredBy ? { referredBy: u.referredBy } : {}),
      createdAt: now(),
      updatedAt: now(),
    };
    batch.set(db.collection(Collections.users).doc(u.id), user);
  }
  await batch.commit();
  console.log(`Seeded ${SEED_USERS.length} users`);
}

interface SeedRideInput {
  id: string;
  driverId: string;
  origin: typeof LOCATIONS.kadri;
  destination: typeof LOCATIONS.kadri;
  departureTime: string;
  seatsAvailable: number;
  status: Ride["status"];
}

const SEED_RIDES: SeedRideInput[] = [
  { id: "seed-ride-aanya", driverId: "seed-user-aanya", origin: LOCATIONS.kadri, destination: LOCATIONS.campus, departureTime: isoAt(8, 15), seatsAvailable: 3, status: "open" },
  { id: "seed-ride-karthik", driverId: "seed-user-karthik", origin: LOCATIONS.techPark, destination: LOCATIONS.campus, departureTime: isoAt(8, 30), seatsAvailable: 2, status: "open" },
  { id: "seed-ride-sanya", driverId: "seed-user-sanya", origin: LOCATIONS.riverside, destination: LOCATIONS.campus, departureTime: isoAt(8, 5), seatsAvailable: 1, status: "open" },
  { id: "seed-ride-diya", driverId: "seed-user-diya", origin: LOCATIONS.hillview, destination: LOCATIONS.campus, departureTime: isoAt(7, 55), seatsAvailable: 0, status: "full" },
  { id: "seed-ride-kabir", driverId: "seed-user-kabir", origin: LOCATIONS.eastMarket, destination: LOCATIONS.campus, departureTime: isoAt(8, 10, -1), seatsAvailable: 1, status: "completed" },
  { id: "seed-ride-dev", driverId: "seed-user-dev", origin: LOCATIONS.oldTown, destination: LOCATIONS.campus, departureTime: isoAt(8, 10), seatsAvailable: 2, status: "open" },
];

async function seedRides() {
  const db = getDb();
  const batch = db.batch();
  for (const r of SEED_RIDES) {
    const ride: Ride = {
      id: r.id,
      driverId: r.driverId,
      route: { origin: r.origin, destination: r.destination },
      departureTime: r.departureTime,
      seatsAvailable: r.seatsAvailable,
      status: r.status,
      createdAt: now(),
      updatedAt: now(),
    };
    batch.set(db.collection(Collections.rides).doc(r.id), ride);
  }
  await batch.commit();
  console.log(`Seeded ${SEED_RIDES.length} rides`);
}

interface SeedMatchInput {
  id: string;
  rideId: string;
  passengerId: string;
  status: Match["status"];
  distanceKm: number;
  timeOffsetMinutes: number;
}

const SEED_MATCHES: SeedMatchInput[] = [
  { id: "seed-match-rohan-aanya", rideId: "seed-ride-aanya", passengerId: "seed-user-rohan", status: "accepted", distanceKm: 0.4, timeOffsetMinutes: 5 },
  { id: "seed-match-priya-dev", rideId: "seed-ride-dev", passengerId: "seed-user-priya", status: "pending", distanceKm: 0.6, timeOffsetMinutes: 8 },
  { id: "seed-match-ishaan-karthik", rideId: "seed-ride-karthik", passengerId: "seed-user-ishaan", status: "pending", distanceKm: 0.3, timeOffsetMinutes: 5 },
  { id: "seed-match-vikram-sanya", rideId: "seed-ride-sanya", passengerId: "seed-user-vikram", status: "completed", distanceKm: 0.2, timeOffsetMinutes: 0 },
  { id: "seed-match-arjun-diya", rideId: "seed-ride-diya", passengerId: "seed-user-arjun", status: "accepted", distanceKm: 0.1, timeOffsetMinutes: 5 },
];

async function seedMatches() {
  const db = getDb();
  const batch = db.batch();
  for (const m of SEED_MATCHES) {
    const match: Match = {
      id: m.id,
      rideId: m.rideId,
      passengerId: m.passengerId,
      status: m.status,
      distanceKm: m.distanceKm,
      timeOffsetMinutes: m.timeOffsetMinutes,
      createdAt: now(),
      updatedAt: now(),
    };
    batch.set(db.collection(Collections.matches).doc(m.id), match);
  }
  await batch.commit();
  console.log(`Seeded ${SEED_MATCHES.length} matches`);
}

// Two-level referral chain: Aanya -> Rohan -> Priya. Rohan has progressed all
// the way to repeatRider; Priya has only just registered — gives the funnel
// chart visibly different counts at each stage instead of one flat number.
const SEED_REFERRAL_EVENTS: Array<Omit<ReferralEvent, "id" | "timestamp">> = [
  { referrerId: "seed-user-aanya", refereeId: "seed-user-rohan", outcome: "registered" },
  { referrerId: "seed-user-aanya", refereeId: "seed-user-rohan", outcome: "firstRide" },
  { referrerId: "seed-user-aanya", refereeId: "seed-user-rohan", outcome: "repeatRider" },
  { referrerId: "seed-user-rohan", refereeId: "seed-user-priya", outcome: "registered" },
];

async function seedReferralEvents() {
  const db = getDb();
  const batch = db.batch();
  SEED_REFERRAL_EVENTS.forEach((event, i) => {
    const id = `seed-referral-${i}`;
    const full: ReferralEvent = { id, timestamp: now(), ...event };
    batch.set(db.collection(Collections.referralEvents).doc(id), full);
  });
  await batch.commit();
  console.log(`Seeded ${SEED_REFERRAL_EVENTS.length} referral events`);
}

async function main() {
  initializeFirebase();

  console.log("Clearing existing demo data...");
  await Promise.all(
    [
      Collections.users,
      Collections.rides,
      Collections.matches,
      Collections.referralEvents,
      Collections.communityMembers,
      Collections.interventions,
      Collections.waitlist,
    ].map(clearCollection),
  );

  await seedUsers();
  await seedRides();
  await seedMatches();
  await seedReferralEvents();

  console.log("Seeding discovery mock community (~50 members with computed scores)...");
  const ranked = await getRankedMembers();
  console.log(`Seeded ${ranked.length} community members`);

  console.log("\nDone. interventions and waitlist were cleared but left empty on purpose — see DEMO_SCRIPT.md.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
