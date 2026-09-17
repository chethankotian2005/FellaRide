import { PublicSignals } from "../models/communityMember.model";

/**
 * PILOT COMMUNITY (placeholder — swap freely):
 * "Crestwood Institute of Technology — Computer Science & Engineering Dept"
 * (fictional name, deliberately not a real institution — see Round 1 checklist
 * rule against using an institute's real name/logo in the submission).
 *
 * This models a day-scholar CS department: ~50 students who commute daily
 * rather than living in hostel, spread across a few public-ish sub-groups
 * (class WhatsApp groups, a coding club, a car-pooling gripe thread, etc).
 * Swap this file's CANDIDATE_POOL / archetype mix for whatever real pilot
 * community the team lands on — nothing downstream depends on these specifics.
 */

export const PILOT_COMMUNITY_NAME =
  "Crestwood Institute of Technology — Computer Science & Engineering Dept (day-scholars)";

interface MockMemberSeed {
  id: string;
  name: string;
  publicSignals: PublicSignals;
}

// Deterministic PRNG (mulberry32) so the mock dataset is stable across runs —
// important for a demo where judges might refresh the dashboard mid-pitch.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260917);
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

const FIRST_NAMES = [
  "Aanya", "Rohan", "Priya", "Karthik", "Meera", "Aditya", "Sanya", "Vikram",
  "Ishaan", "Diya", "Arjun", "Neha", "Kabir", "Tara", "Rahul", "Ananya",
  "Dev", "Isha", "Nikhil", "Riya", "Varun", "Pooja", "Siddharth", "Kavya",
  "Aryan", "Simran", "Manav", "Lakshmi", "Yash", "Anjali",
];
const LAST_NAMES = [
  "Shetty", "Rao", "Kamath", "Pai", "Shenoy", "Hegde", "Nair", "Bhat",
  "Kulkarni", "Menon", "Shah", "Reddy", "Iyer", "Gowda", "Prabhu",
];

const AFFILIATIONS = [
  "3rd Year CSE - Section A",
  "3rd Year CSE - Section B",
  "4th Year CSE - Section A",
  "4th Year CSE - Section B",
  "Coding Club",
  "Robotics Club",
  "Dept Commute & Carpool Chat (public group)",
  "Cultural Fest Organizing Committee",
];

const VEHICLE_PHRASES = [
  "drives in from the east side of town daily",
  "posted asking for fuel-split partners for the highway commute",
  "mentioned owning a car in the dept carpool chat",
  "rides a scooter in from the old town area every morning",
  "offered a free seat on their daily commute last semester",
];
const NON_VEHICLE_COMMUTE_PHRASES = [
  "takes the campus shuttle most days",
  "usually walks in with hostel friends",
  "mentioned relying on the city bus route 12",
  "carpools occasionally with a senior, no vehicle of their own",
];
const NO_COMMUTE_INFO: string[] = [];

/**
 * Archetypes bias the random ranges so the mock set contains clear examples
 * of each seed-user type (useful for demoing the ranking's explainability),
 * plus a long tail of low-signal / ambiguous profiles like a real dataset.
 */
type Archetype = "connector" | "driver" | "earlyAdopter" | "blend" | "lowSignal";

const ARCHETYPE_WEIGHTS: [Archetype, number][] = [
  ["connector", 10],
  ["driver", 10],
  ["earlyAdopter", 8],
  ["blend", 8],
  ["lowSignal", 14],
];

function pickArchetype(): Archetype {
  const total = ARCHETYPE_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
  let roll = rand() * total;
  for (const [type, weight] of ARCHETYPE_WEIGHTS) {
    if (roll < weight) return type;
    roll -= weight;
  }
  return "lowSignal";
}

function buildSignals(archetype: Archetype): PublicSignals {
  const affiliation = pick(AFFILIATIONS);

  switch (archetype) {
    case "connector":
      return {
        groupMemberships: randInt(4, 7),
        postFrequency: randInt(3, 10),
        statedCommuteInfo: rand() > 0.5 ? [pick(NON_VEHICLE_COMMUTE_PHRASES)] : NO_COMMUTE_INFO,
        connectionCount: randInt(120, 250),
        mentionsVehicle: rand() > 0.7,
        affiliation,
      };
    case "driver":
      return {
        groupMemberships: randInt(1, 3),
        postFrequency: randInt(1, 6),
        statedCommuteInfo: [pick(VEHICLE_PHRASES), ...(rand() > 0.5 ? [pick(VEHICLE_PHRASES)] : [])],
        connectionCount: randInt(20, 80),
        mentionsVehicle: true,
        affiliation,
      };
    case "earlyAdopter":
      return {
        groupMemberships: randInt(2, 4),
        postFrequency: randInt(12, 25),
        statedCommuteInfo: rand() > 0.6 ? [pick(NON_VEHICLE_COMMUTE_PHRASES)] : NO_COMMUTE_INFO,
        connectionCount: randInt(30, 90),
        mentionsVehicle: rand() > 0.8,
        affiliation,
      };
    case "blend":
      return {
        groupMemberships: randInt(3, 5),
        postFrequency: randInt(6, 14),
        statedCommuteInfo: [pick(VEHICLE_PHRASES)],
        connectionCount: randInt(80, 150),
        mentionsVehicle: true,
        affiliation,
      };
    case "lowSignal":
    default:
      return {
        groupMemberships: randInt(0, 2),
        postFrequency: randInt(0, 2),
        statedCommuteInfo: rand() > 0.85 ? [pick(NON_VEHICLE_COMMUTE_PHRASES)] : NO_COMMUTE_INFO,
        connectionCount: randInt(0, 25),
        mentionsVehicle: false,
        affiliation,
      };
  }
}

function generateMockCommunity(count: number): MockMemberSeed[] {
  const used = new Set<string>();
  const members: MockMemberSeed[] = [];

  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    } while (used.has(name));
    used.add(name);

    members.push({
      id: `member-${String(i + 1).padStart(3, "0")}`,
      name,
      publicSignals: buildSignals(pickArchetype()),
    });
  }

  return members;
}

// ~50 members, generated once at module load (deterministic seed above).
export const MOCK_COMMUNITY_MEMBERS: MockMemberSeed[] = generateMockCommunity(50);
