import { GeoPoint } from "./geo";

export type UserRole = "driver" | "passenger" | "both";

export interface CommuteSchedule {
  /** e.g. ["mon", "tue", "wed", "thu", "fri"] */
  days: string[];
  /** 24h "HH:mm", local to the user's home timezone */
  departureTime: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  homeLocation: GeoPoint;
  workLocation: GeoPoint;
  commuteSchedule: CommuteSchedule;
  /** userId of the referrer, if this user was invited via the referral flow */
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
}
