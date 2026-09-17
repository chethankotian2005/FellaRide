import { GeoPoint } from "../models/geo";

const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle (Haversine) distance between two points, in kilometers. */
export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_RADIUS_KM * c;
}

/** Absolute difference, in minutes, between two "HH:mm" times of day. */
export function timeOfDayDiffMinutes(a: string, b: string): number {
  const [aH, aM] = a.split(":").map(Number);
  const [bH, bM] = b.split(":").map(Number);
  return Math.abs(aH * 60 + aM - (bH * 60 + bM));
}

/**
 * Extracts "HH:mm" directly from an ISO 8601 timestamp's characters (always
 * at index 11-16, regardless of a trailing "Z"/offset). Deliberately not
 * `new Date(iso).getUTCHours()` / `.getHours()`: both reinterpret the
 * timestamp through a timezone (UTC, or the runtime's local zone), which
 * would silently shift the "wall clock" departure time a passenger and
 * driver actually agreed on. A pilot community lives in one timezone, so
 * this compares the digits as typed, not an absolute instant.
 */
export function isoToTimeOfDay(iso: string): string {
  return iso.slice(11, 16);
}
