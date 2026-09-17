import { GeoPoint } from "./geo";

export type RideStatus = "open" | "full" | "completed" | "cancelled";

export interface RideRoute {
  origin: GeoPoint;
  destination: GeoPoint;
}

export interface Ride {
  id: string;
  driverId: string;
  route: RideRoute;
  /** ISO 8601 timestamp */
  departureTime: string;
  seatsAvailable: number;
  status: RideStatus;
  createdAt: string;
  updatedAt: string;
}
