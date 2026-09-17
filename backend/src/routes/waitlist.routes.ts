import { Router } from "express";
import { randomUUID } from "crypto";
import { getDb } from "../config/firebase";
import { Collections } from "../models/collections";
import { WaitlistEntry } from "../models/waitlist.model";
import { validate } from "../middleware/validate";
import { createWaitlistEntrySchema } from "./schemas";

export const waitlistRouter = Router();

// POST /waitlist — public landing page signup for the pilot community.
waitlistRouter.post("/", validate(createWaitlistEntrySchema), async (req, res, next) => {
  try {
    const body = req.body as import("zod").infer<typeof createWaitlistEntrySchema>;
    const db = getDb();
    const id = randomUUID();

    const entry: WaitlistEntry = {
      id,
      name: body.name,
      email: body.email,
      ...(body.affiliation ? { affiliation: body.affiliation } : {}),
      createdAt: new Date().toISOString(),
    };

    await db.collection(Collections.waitlist).doc(id).set(entry);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});
