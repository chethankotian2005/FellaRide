export type ReferralOutcome = "registered" | "firstRide" | "repeatRider";

export interface ReferralEvent {
  id: string;
  referrerId: string;
  refereeId: string;
  timestamp: string;
  outcome: ReferralOutcome;
}
