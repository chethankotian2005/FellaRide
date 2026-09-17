import { getDb } from "../config/firebase";
import { Collections } from "../models/collections";
import { Match } from "../models/match.model";
import { Ride } from "../models/ride.model";
import { User } from "../models/user.model";
import { haversineDistanceKm, isoToTimeOfDay, timeOfDayDiffMinutes } from "./geo.util";

/**
 * Matching algorithm (v1 — simple & explainable, intentionally not ML-based
 * so it's easy to demo and reason about):
 *
 * For a passenger, a ride is a candidate match if BOTH hold:
 *   1. Geographic proximity: the ride's origin is within MAX_DISTANCE_KM of the
 *      passenger's home, AND the ride's destination is within MAX_DISTANCE_KM of
 *      the passenger's work. Distance is straight-line (Haversine), not real
 *      road distance — good enough for a pilot-community-scale prototype.
 *   2. Time window: the ride's departure time (time-of-day) is within
 *      MAX_TIME_OFFSET_MINUTES of the passenger's stated commuteSchedule.departureTime.
 *
 * Candidates are ranked by a combined score = distance component + time component,
 * both normalized to comparable weight, ascending (lower score = better match).
 */

const MAX_DISTANCE_KM = 3;
const MAX_TIME_OFFSET_MINUTES = 30;

// Weights let us trade off "closer route" vs "closer departure time" in the
// combined ranking score without changing the hard filter thresholds above.
const DISTANCE_WEIGHT = 1; // score points per km
const TIME_WEIGHT = 1 / 10; // score points per minute (10 min ~= 1 km of "cost")

export interface RideMatchCandidate {
  ride: Ride;
  distanceKm: number;
  timeOffsetMinutes: number;
  score: number;
}

export async function findMatchesForPassenger(userId: string): Promise<RideMatchCandidate[]> {
  const db = getDb();

  const userSnap = await db.collection(Collections.users).doc(userId).get();
  if (!userSnap.exists) {
    throw Object.assign(new Error(`User ${userId} not found`), { status: 404 });
  }
  const user = userSnap.data() as User;

  const ridesSnap = await db.collection(Collections.rides).where("status", "==", "open").get();

  const candidates: RideMatchCandidate[] = [];

  for (const doc of ridesSnap.docs) {
    const ride = doc.data() as Ride;
    if (ride.seatsAvailable <= 0) continue;

    const originDistanceKm = haversineDistanceKm(user.homeLocation, ride.route.origin);
    const destinationDistanceKm = haversineDistanceKm(user.workLocation, ride.route.destination);
    const distanceKm = originDistanceKm + destinationDistanceKm;

    const rideTimeOfDay = isoToTimeOfDay(ride.departureTime);
    const timeOffsetMinutes = timeOfDayDiffMinutes(
      user.commuteSchedule.departureTime,
      rideTimeOfDay,
    );

    const withinDistance = originDistanceKm <= MAX_DISTANCE_KM && destinationDistanceKm <= MAX_DISTANCE_KM;
    const withinTimeWindow = timeOffsetMinutes <= MAX_TIME_OFFSET_MINUTES;

    if (!withinDistance || !withinTimeWindow) continue;

    const score = distanceKm * DISTANCE_WEIGHT + timeOffsetMinutes * TIME_WEIGHT;

    candidates.push({ ride, distanceKm, timeOffsetMinutes, score });
  }

  candidates.sort((a, b) => a.score - b.score);

  return candidates;
}

export interface MatchWithRide extends Match {
  ride: Ride;
}

/**
 * Computes ride candidates for a passenger and upserts a `pending` Match
 * document for each one (keyed deterministically by ride+passenger so
 * repeated lookups don't create duplicates). This is what lets the client
 * later call POST /matches/:id/accept on a match returned here.
 */
export async function getOrCreateMatchesForPassenger(userId: string): Promise<MatchWithRide[]> {
  const db = getDb();
  const candidates = await findMatchesForPassenger(userId);
  const now = new Date().toISOString();

  const results: MatchWithRide[] = [];

  for (const candidate of candidates) {
    const matchId = `${candidate.ride.id}_${userId}`;
    const ref = db.collection(Collections.matches).doc(matchId);
    const existing = await ref.get();

    const match: Match = existing.exists
      ? (existing.data() as Match)
      : {
          id: matchId,
          rideId: candidate.ride.id,
          passengerId: userId,
          status: "pending",
          distanceKm: candidate.distanceKm,
          timeOffsetMinutes: candidate.timeOffsetMinutes,
          createdAt: now,
          updatedAt: now,
        };

    if (!existing.exists) {
      await ref.set(match);
    }

    results.push({ ...match, ride: candidate.ride });
  }

  return results;
}
