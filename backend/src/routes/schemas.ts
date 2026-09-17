import { z } from "zod";

export const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  label: z.string().optional(),
});

export const commuteScheduleSchema = z.object({
  days: z.array(z.string()).min(1),
  departureTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "departureTime must be HH:mm"),
});

export const createUserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  role: z.enum(["driver", "passenger", "both"]),
  homeLocation: geoPointSchema,
  workLocation: geoPointSchema,
  commuteSchedule: commuteScheduleSchema,
  referredBy: z.string().optional(),
});

export const createRideSchema = z.object({
  driverId: z.string().min(1),
  route: z.object({
    origin: geoPointSchema,
    destination: geoPointSchema,
  }),
  // `local: true` also accepts a timestamp with no trailing "Z"/offset — see
  // the comment on isoToTimeOfDay() in services/geo.util.ts for why the
  // departure time is treated as a wall-clock string, not a timezone-aware
  // instant.
  departureTime: z.string().datetime({ offset: true, local: true }),
  seatsAvailable: z.number().int().min(1),
});

export const rideMatchesQuerySchema = z.object({
  userId: z.string().min(1),
});

export const createReferralSchema = z.object({
  referrerId: z.string().min(1),
  refereeId: z.string().min(1),
  outcome: z.enum(["registered", "firstRide", "repeatRider"]),
});

export const createInterventionSchema = z.object({
  memberId: z.string().min(1),
  message: z.string().min(1),
  channel: z.string().min(1).default("email"),
});

export const createWaitlistEntrySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  affiliation: z.string().optional(),
});
