import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { healthRouter } from "./routes/health.routes";
import { usersRouter } from "./routes/users.routes";
import { ridesRouter } from "./routes/rides.routes";
import { matchesRouter } from "./routes/matches.routes";
import { referralsRouter } from "./routes/referrals.routes";
import { discoveryRouter } from "./routes/discovery.routes";
import { waitlistRouter } from "./routes/waitlist.routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/users", usersRouter);
  app.use("/rides", ridesRouter);
  app.use("/matches", matchesRouter);
  app.use("/referrals", referralsRouter);
  app.use("/discovery", discoveryRouter);
  app.use("/waitlist", waitlistRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
