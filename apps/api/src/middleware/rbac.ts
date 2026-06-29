import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";

export function allowRoles(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(ErrorCode.UNAUTHORIZED, "Authentication required");
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      throw new AppError(ErrorCode.FORBIDDEN, "Insufficient permissions");
    }

    next();
  };
}
