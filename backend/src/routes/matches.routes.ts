import { Router } from "express";
import { getDb } from "../config/firebase";
import { Collections } from "../models/collections";
import { Match } from "../models/match.model";

export const matchesRouter = Router();

// POST /matches/:id/accept — passenger (or driver) accepts a pending match.
matchesRouter.post("/:id/accept", async (req, res, next) => {
  try {
    const db = getDb();
    const ref = db.collection(Collections.matches).doc(req.params.id);
    const snap = await ref.get();

    if (!snap.exists) {
      res.status(404).json({ error: `Match ${req.params.id} not found` });
      return;
    }

    const match = snap.data() as Match;
    const updated: Match = { ...match, status: "accepted", updatedAt: new Date().toISOString() };
    await ref.set(updated, { merge: true });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});
