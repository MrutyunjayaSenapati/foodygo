import rateLimit from "express-rate-limit";
import type { Request } from "express";
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, API_PREFIX } from "@foodygo/shared-constants";

const HEALTH_PATHS = ["/health", `${API_PREFIX}/health`];

export const rateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => HEALTH_PATHS.includes(req.path),
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests, please try again later",
    },
  },
});
