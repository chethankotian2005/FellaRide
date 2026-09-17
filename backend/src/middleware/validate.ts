import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

type RequestPart = "body" | "query" | "params";

/**
 * Validated `query`/`params` land in `res.locals.validated[part]` rather
 * than being written back onto `req.query`/`req.params` — Express 5 made
 * both getter-only (no setter), so reassigning them throws at runtime.
 * `req.body` stays a plain writable property and is reassigned directly.
 */
export function validate(schema: ZodSchema, part: RequestPart = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[part]);
      if (part === "body") {
        req.body = parsed;
      } else {
        res.locals.validated ??= {};
        res.locals.validated[part] = parsed;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(Object.assign(new Error("Validation failed"), { status: 400, details: err.issues }));
        return;
      }
      next(err);
    }
  };
}
