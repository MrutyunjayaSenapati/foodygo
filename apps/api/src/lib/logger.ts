import pino, { type Logger } from "pino";
import { env } from "./env";

export const logger: Logger<string, boolean> = pino<string, boolean>({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  transport:
    env.NODE_ENV === "development" && !process.env.VERCEL
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
