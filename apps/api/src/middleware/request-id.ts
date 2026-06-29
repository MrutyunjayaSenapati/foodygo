import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

export function requestId(req: Request, _res: Response, next: NextFunction): void {
  req.id = req.headers["x-request-id"] as string || crypto.randomUUID();
  next();
}
