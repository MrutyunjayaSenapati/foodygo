import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";
import { AppError } from "../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";

declare module "express" {
  interface Request {
    user?: {
      userId: string;
      roles: string[];
    };
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Missing or invalid authorization header");
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; roles: string[] };
    req.user = payload;
    next();
  } catch {
    throw new AppError(ErrorCode.TOKEN_EXPIRED, "Token is invalid or expired");
  }
}
