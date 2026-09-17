/**
 * Discovery / signal-scoring service.
 *
 * WHAT THIS IS: a prototype approximation of the "Discover -> Prioritize"
 * stages of the growth pipeline, running against a mock dataset (see
 * discoveryMockData.ts) that stands in for a real pilot community, since
 * scraping live social platforms (and the vetted legal-use ToS review each
 * platform would need) is out of scope for this prototype.
 *
 * HOW THIS WOULD BE EXTENDED, with real public signals:
 *   - Public group/forum membership counts -> scraped counts from public
 *     Facebook/LinkedIn/WhatsApp-community group member lists (where public
 *     and ToS-permitting), or Discord/Telegram public group member APIs.
 *   - Post frequency / engagement -> public post APIs (e.g. LinkedIn public
 *     posts, X/Twitter API v2 for public accounts, public forum RSS/JSON
 *     feeds) aggregated per person over a trailing 30/90-day window.
 *   - Connection count / centrality -> public follower/connection counts
 *     where exposed, or a graph built from co-membership across multiple
 *     public groups (people who appear in N+ of the same groups get an edge),
 *     then a real centrality measure (degree or PageRank) instead of a raw
 *     count.
 *   - Stated commute info / vehicle ownership -> NLP keyword/entity
 *     extraction (e.g. an LLM classifier) over public posts/bios mentioning
 *     commute routes, "carpool", vehicle types, parking passes, etc.
 *   - All of the above would be normalized against the *actual* community's
 *     observed ranges (not a hardcoded mock range) and re-scored on a
 *     schedule as new public signals appear.
 *
 * The scoring formulas below are intentionally simple (linear, min-max
 * normalized) rather than a black-box model, so the "why is this person
 * ranked #3" explanation stays legible to a judge or a growth operator.
 */

import { randomUUID } from "crypto";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getDb } from "../config/firebase";
import { Collections } from "../models/collections";
import { CommunityMember, ComputedScores, PublicSignals } from "../models/communityMember.model";
import { Intervention } from "../models/intervention.model";
import { MOCK_COMMUNITY_MEMBERS, PILOT_COMMUNITY_NAME } from "./discoveryMockData";

const VEHICLE_KEYWORDS = ["drive", "car", "bike", "scooter", "vehicle", "fuel", "highway"];

function minMaxNormalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5; // no variance in the dataset — treat as neutral
  return (value - min) / (max - min);
}

interface ScoreBreakdown {
  scores: ComputedScores;
  reasons: string[];
}

/**
 * Computes the three component scores (0-100 each) plus a weighted
 * priorityScore, given one member's signals and the min/max ranges observed
 * across the whole community (so scores are relative to this pilot group,
 * not an arbitrary absolute scale).
 *
 * connectorScore   = 70% connectionCount (normalized) + 30% groupMemberships (normalized)
 *                    Rationale: raw connections matter most for network reach,
 *                    but showing up across many public groups also signals
 *                    someone who bridges sub-communities.
 *
 * likelyDriverScore = 50 pts if publicSignals.mentionsVehicle is true
 *                    + up to 50 pts for vehicle/commute keyword mentions in
 *                      statedCommuteInfo (25 pts per distinct keyword hit, capped)
 *                    Rationale: an explicit vehicle mention is the strongest
 *                    signal; keyword-matched commute text adds corroborating
 *                    evidence without requiring a structured "I own a car" field.
 *
 * earlyAdopterScore = 100% postFrequency (normalized)
 *                    Rationale: people already posting/engaging often in
 *                    public community spaces are the ones most likely to
 *                    notice and act on a contextual invite quickly.
 *
 * priorityScore = 0.40 * connectorScore + 0.35 * likelyDriverScore + 0.25 * earlyAdopterScore
 *                    Rationale: for a cold-start carpooling launch, network
 *                    reach (connectors) and ride supply (drivers) matter most
 *                    for getting to a working double-sided market; early
 *                    adopters matter but are the easiest signal to find later.
 */
function computeScores(
  signals: PublicSignals,
  ranges: { connectionCount: [number, number]; groupMemberships: [number, number]; postFrequency: [number, number] },
): ScoreBreakdown {
  const reasons: string[] = [];

  const connCountNorm = minMaxNormalize(signals.connectionCount, ...ranges.connectionCount);
  const groupMembershipsNorm = minMaxNormalize(signals.groupMemberships, ...ranges.groupMemberships);
  const connectorScore = Math.round(70 * connCountNorm + 30 * groupMembershipsNorm);
  reasons.push(
    `Connector: connectionCount=${signals.connectionCount} (community range ${ranges.connectionCount[0]}-${ranges.connectionCount[1]}), ` +
      `groupMemberships=${signals.groupMemberships} (${signals.affiliation} and others)`,
  );

  const keywordHits = signals.statedCommuteInfo.filter((text) =>
    VEHICLE_KEYWORDS.some((kw) => text.toLowerCase().includes(kw)),
  ).length;
  const likelyDriverScore = Math.min(
    (signals.mentionsVehicle ? 50 : 0) + Math.min(keywordHits * 25, 50),
    100,
  );
  reasons.push(
    `Driver: mentionsVehicle=${signals.mentionsVehicle}, vehicle/commute keyword mentions=${keywordHits}` +
      (signals.statedCommuteInfo.length ? ` (e.g. "${signals.statedCommuteInfo[0]}")` : ""),
  );

  const postFreqNorm = minMaxNormalize(signals.postFrequency, ...ranges.postFrequency);
  const earlyAdopterScore = Math.round(100 * postFreqNorm);
  reasons.push(
    `Early adopter: postFrequency=${signals.postFrequency}/mo (community range ${ranges.postFrequency[0]}-${ranges.postFrequency[1]})`,
  );

  const priorityScore = Math.round(
    0.4 * connectorScore + 0.35 * likelyDriverScore + 0.25 * earlyAdopterScore,
  );

  return {
    scores: { connectorScore, likelyDriverScore, earlyAdopterScore, priorityScore },
    reasons,
  };
}

function computeRanges(signalsList: PublicSignals[]) {
  const range = (values: number[]): [number, number] => [Math.min(...values), Math.max(...values)];
  return {
    connectionCount: range(signalsList.map((s) => s.connectionCount)),
    groupMemberships: range(signalsList.map((s) => s.groupMemberships)),
    postFrequency: range(signalsList.map((s) => s.postFrequency)),
  };
}

export interface RankedMember extends CommunityMember {
  reasons: string[];
}

/**
 * Scores the full mock community, persists the current scores to Firestore
 * (so /referrals/funnel's "discovered" count and the dashboard stay in sync),
 * and returns members sorted by priorityScore descending with the signals
 * that drove each score attached for explainability.
 */
export async function getRankedMembers(): Promise<RankedMember[]> {
  const ranges = computeRanges(MOCK_COMMUNITY_MEMBERS.map((m) => m.publicSignals));
  const now = new Date().toISOString();
  const db = getDb();
  const batch = db.batch();

  const ranked: RankedMember[] = MOCK_COMMUNITY_MEMBERS.map((seed) => {
    const { scores, reasons } = computeScores(seed.publicSignals, ranges);
    const member: CommunityMember = {
      id: seed.id,
      name: seed.name,
      publicSignals: seed.publicSignals,
      computedScores: scores,
      createdAt: now,
      updatedAt: now,
    };

    const ref = db.collection(Collections.communityMembers).doc(seed.id);
    batch.set(ref, member, { merge: true });

    return { ...member, reasons };
  });

  await batch.commit();

  ranked.sort((a, b) => b.computedScores.priorityScore - a.computedScores.priorityScore);
  return ranked;
}

export async function logIntervention(
  memberId: string,
  message: string,
  channel: string,
): Promise<Intervention> {
  const db = getDb();
  const id = randomUUID();
  const intervention: Intervention = {
    id,
    memberId,
    message,
    channel,
    sentAt: new Date().toISOString(),
  };
  await db.collection(Collections.interventions).doc(id).set(intervention);
  return intervention;
}

export interface InterventionWithMember extends Intervention {
  memberName: string | null;
}

/**
 * Lists logged interventions newest-first, joined with the member's name for
 * display in the dashboard's campaign tracker. "Outcome" isn't tracked as a
 * separate field yet — a real version would link this to whether the member
 * subsequently registered (via ReferralEvent) — so the dashboard currently
 * shows every logged intervention as "Sent".
 */
export async function listInterventions(): Promise<InterventionWithMember[]> {
  const db = getDb();
  const [interventionsSnap, membersSnap] = await Promise.all([
    db.collection(Collections.interventions).orderBy("sentAt", "desc").get(),
    db.collection(Collections.communityMembers).get(),
  ]);

  const namesById = new Map(
    membersSnap.docs.map((d: QueryDocumentSnapshot) => [d.id, (d.data() as CommunityMember).name]),
  );

  return interventionsSnap.docs.map((d: QueryDocumentSnapshot) => {
    const intervention = d.data() as Intervention;
    return { ...intervention, memberName: namesById.get(intervention.memberId) ?? null };
  });
}

export { PILOT_COMMUNITY_NAME };
