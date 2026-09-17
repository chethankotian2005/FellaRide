import { Router } from "express";
import { randomUUID } from "crypto";
import { getDb } from "../config/firebase";
import { Collections } from "../models/collections";
import { Ride } from "../models/ride.model";
import { validate } from "../middleware/validate";
import { createRideSchema, rideMatchesQuerySchema } from "./schemas";
import { getOrCreateMatchesForPassenger } from "../services/matching.service";

export const ridesRouter = Router();

// POST /rides — a driver offers a ride.
ridesRouter.post("/", validate(createRideSchema), async (req, res, next) => {
  try {
    const body = req.body as import("zod").infer<typeof createRideSchema>;
    const db = getDb();
    const id = randomUUID();
    const now = new Date().toISOString();

    const ride: Ride = {
      id,
      driverId: body.driverId,
      route: body.route,
      departureTime: body.departureTime,
      seatsAvailable: body.seatsAvailable,
      status: "open",
      createdAt: now,
      updatedAt: now,
    };

    await db.collection(Collections.rides).doc(id).set(ride);
    res.status(201).json(ride);
  } catch (err) {
    next(err);
  }
});

// GET /rides/matches?userId=... — ranked ride matches for a passenger.
// See src/services/matching.service.ts for the algorithm.
ridesRouter.get("/matches", validate(rideMatchesQuerySchema, "query"), async (req, res, next) => {
  try {
    const { userId } = res.locals.validated.query as import("zod").infer<
      typeof rideMatchesQuerySchema
    >;
    const matches = await getOrCreateMatchesForPassenger(userId);
    res.json({ userId, count: matches.length, matches });
  } catch (err) {
    next(err);
  }
});
