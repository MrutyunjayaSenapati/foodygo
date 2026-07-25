import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";

interface ValidationSchemas {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) throw result.error;
        req.body = result.data;
      }
      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) throw result.error;
        req.query = result.data as typeof req.query;
      }
      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) throw result.error;
        req.params = result.data as typeof req.params;
      }
      next();
    } catch (err: unknown) {
      const error = err as { issues?: Array<{ message: string; path: (string | number)[] }> };
      if (error.issues) {
        const message = error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
        const details = error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        throw new AppError(ErrorCode.VALIDATION_ERROR, message, details);
      }
      throw new AppError(ErrorCode.VALIDATION_ERROR, "Validation failed");
    }
  };
}
