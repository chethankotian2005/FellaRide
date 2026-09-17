import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getDb } from "../config/firebase";
import { Collections } from "../models/collections";
import { ReferralEvent } from "../models/referral.model";

/**
 * Growth-loop funnel stages, in order. "discovered" and "contacted" come from
 * the discovery/intervention pipeline (communityMembers + interventions
 * collections); "registered" / "firstRide" / "repeatRider" come from
 * referralEvents recorded as users move through the product.
 */
export interface FunnelCounts {
  discovered: number;
  contacted: number;
  registered: number;
  firstRide: number;
  referred: number;
  repeatRider: number;
}

export async function getFunnelCounts(): Promise<FunnelCounts> {
  const db = getDb();

  const [membersSnap, interventionsSnap, referralEventsSnap, usersSnap] = await Promise.all([
    db.collection(Collections.communityMembers).get(),
    db.collection(Collections.interventions).get(),
    db.collection(Collections.referralEvents).get(),
    db.collection(Collections.users).get(),
  ]);

  const referralEvents = referralEventsSnap.docs.map(
    (d: QueryDocumentSnapshot) => d.data() as ReferralEvent,
  );

  // Unique referees credited with each outcome (a referee may appear multiple
  // times across events, e.g. registered then later firstRide).
  const byOutcome = (outcome: ReferralEvent["outcome"]) =>
    new Set(
      referralEvents
        .filter((e: ReferralEvent) => e.outcome === outcome)
        .map((e: ReferralEvent) => e.refereeId),
    );
  const registered = byOutcome("registered");
  const firstRide = byOutcome("firstRide");
  const repeatRider = byOutcome("repeatRider");
  // "referred" = distinct referrers who have successfully referred at least one person.
  const referred = new Set(referralEvents.map((e: ReferralEvent) => e.referrerId));

  return {
    discovered: membersSnap.size,
    contacted: new Set(
      interventionsSnap.docs.map((d: QueryDocumentSnapshot) => d.data().memberId),
    ).size,
    // Total registered users is a reasonable proxy alongside referral-attributed registrations.
    registered: Math.max(registered.size, usersSnap.size),
    firstRide: firstRide.size,
    referred: referred.size,
    repeatRider: repeatRider.size,
  };
}
