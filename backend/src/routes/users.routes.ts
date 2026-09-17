import { Router } from "express";
import { randomUUID } from "crypto";
import { getDb } from "../config/firebase";
import { Collections } from "../models/collections";
import { User } from "../models/user.model";
import { validate } from "../middleware/validate";
import { createUserSchema } from "./schemas";

export const usersRouter = Router();

// POST /users — create or update (upsert by id) a user profile.
usersRouter.post("/", validate(createUserSchema), async (req, res, next) => {
  try {
    const body = req.body as import("zod").infer<typeof createUserSchema>;
    const db = getDb();
    const id = body.id ?? randomUUID();
    const now = new Date().toISOString();

    const ref = db.collection(Collections.users).doc(id);
    const existing = await ref.get();

    const user: User = {
      id,
      name: body.name,
      role: body.role,
      homeLocation: body.homeLocation,
      workLocation: body.workLocation,
      commuteSchedule: body.commuteSchedule,
      // Firestore rejects `undefined` field values, so only set this when present.
      ...(body.referredBy ? { referredBy: body.referredBy } : {}),
      createdAt: existing.exists ? (existing.data() as User).createdAt : now,
      updatedAt: now,
    };

    await ref.set(user, { merge: true });
    res.status(existing.exists ? 200 : 201).json(user);
  } catch (err) {
    next(err);
  }
});
