import { ErrorCode, ERROR_MESSAGES } from "@foodygo/shared-constants";

const HTTP_STATUS_MAP: Record<string, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 409,
  [ErrorCode.ORDER_NOT_CANCELLABLE]: 400,
  [ErrorCode.INVALID_STATUS_TRANSITION]: 400,
  [ErrorCode.PAYMENT_FAILED]: 402,
};

export class AppError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly details?: Array<{ field: string; message: string }>;

  constructor(code: ErrorCode, message?: string, details?: Array<{ field: string; message: string }>) {
    super(message ?? ERROR_MESSAGES[code]);
    this.name = "AppError";
    this.code = code;
    this.httpStatus = HTTP_STATUS_MAP[code] ?? 500;
    this.details = details;
  }
}
