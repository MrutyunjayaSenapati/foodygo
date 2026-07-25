import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { ErrorCode, ERROR_MESSAGES } from "@foodygo/shared-constants";
import { logger } from "../lib/logger";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };
    if (err.details) {
      body.error = { ...body.error as object, details: err.details };
    }
    res.status(err.httpStatus).json(body);
    return;
  }

  logger.error(err, "Unhandled error");

  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: ERROR_MESSAGES[ErrorCode.INTERNAL_ERROR],
    },
  });
}
