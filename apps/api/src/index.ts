import "dotenv/config";
import { env } from "./lib/env";
import { logger } from "./lib/logger";
import app from "./app";
import { initSocket } from "./lib/socket";
import { closeDb } from "./lib/db";
import { closeRedis } from "./lib/redis";

const httpServer = initSocket(app);

httpServer.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});

async function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down gracefully");

  await new Promise<void>((resolve) => {
    httpServer.close((err) => {
      if (err) {
        logger.error(err, "HTTP server close error");
      }
      resolve();
    });
  });

  await closeDb();
  await closeRedis();

  logger.info("Shutdown complete");
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
