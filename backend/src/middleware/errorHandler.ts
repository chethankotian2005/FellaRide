import { NextFunction, Request, Response } from "express";

export interface HttpError extends Error {
  status?: number;
  details?: unknown;
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: HttpError, req: Request, res: Response, _next: NextFunction) {
  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({
    error: err.message ?? "Internal server error",
    ...(err.details ? { details: err.details } : {}),
  });
}
