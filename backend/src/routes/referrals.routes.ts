import { Router } from "express";
import { randomUUID } from "crypto";
import { getDb } from "../config/firebase";
import { Collections } from "../models/collections";
import { ReferralEvent } from "../models/referral.model";
import { validate } from "../middleware/validate";
import { createReferralSchema } from "./schemas";
import { getFunnelCounts } from "../services/referral.service";

export const referralsRouter = Router();

// POST /referrals — record a referral event (registered / firstRide / repeatRider).
referralsRouter.post("/", validate(createReferralSchema), async (req, res, next) => {
  try {
    const body = req.body as import("zod").infer<typeof createReferralSchema>;
    const db = getDb();
    const id = randomUUID();

    const event: ReferralEvent = {
      id,
      referrerId: body.referrerId,
      refereeId: body.refereeId,
      outcome: body.outcome,
      timestamp: new Date().toISOString(),
    };

    await db.collection(Collections.referralEvents).doc(id).set(event);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});

// GET /referrals/funnel — aggregate growth-loop funnel counts for the dashboard.
referralsRouter.get("/funnel", async (_req, res, next) => {
  try {
    const funnel = await getFunnelCounts();
    res.json(funnel);
  } catch (err) {
    next(err);
  }
});
