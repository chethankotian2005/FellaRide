import { Router } from "express";
import { validate } from "../middleware/validate";
import { createInterventionSchema } from "./schemas";
import {
  getRankedMembers,
  listInterventions,
  logIntervention,
  PILOT_COMMUNITY_NAME,
} from "../services/discovery.service";

export const discoveryRouter = Router();

// GET /discovery/ranked-members — pilot-community members ranked by combined
// priority score (connector + likely-driver + early-adopter), with the raw
// signals behind each score for dashboard explainability.
discoveryRouter.get("/ranked-members", async (_req, res, next) => {
  try {
    const members = await getRankedMembers();
    res.json({ pilotCommunity: PILOT_COMMUNITY_NAME, count: members.length, members });
  } catch (err) {
    next(err);
  }
});

// POST /discovery/intervention — log a contextual outreach message sent to a
// community member, for the campaign tracker.
discoveryRouter.post("/intervention", validate(createInterventionSchema), async (req, res, next) => {
  try {
    const body = req.body as import("zod").infer<typeof createInterventionSchema>;
    const intervention = await logIntervention(body.memberId, body.message, body.channel);
    res.status(201).json(intervention);
  } catch (err) {
    next(err);
  }
});

// GET /discovery/interventions — logged outreach messages, newest first, for
// the dashboard's campaign/intervention tracker.
discoveryRouter.get("/interventions", async (_req, res, next) => {
  try {
    const interventions = await listInterventions();
    res.json({ count: interventions.length, interventions });
  } catch (err) {
    next(err);
  }
});
