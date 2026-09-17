export type MatchStatus = "pending" | "accepted" | "completed";

export interface Match {
  id: string;
  rideId: string;
  passengerId: string;
  status: MatchStatus;
  /** straight-line km between passenger and ride route at match time */
  distanceKm: number;
  /** minutes between passenger's preferred departure and ride's departureTime */
  timeOffsetMinutes: number;
  createdAt: string;
  updatedAt: string;
}
