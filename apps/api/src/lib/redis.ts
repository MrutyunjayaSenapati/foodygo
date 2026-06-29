import { Redis } from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

let client: Redis;
let isConnected = false;

function createClient(): Redis {
  const c = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 10) {
        logger.error("Redis max retries reached, giving up");
        return null;
      }
      return Math.min(times * 200, 5000);
    },
    lazyConnect: true,
    enableReadyCheck: true,
    keepAlive: 10000,
    reconnectOnError(err) {
      logger.error(err, "Redis reconnecting on error");
      return true;
    },
  });

  c.on("connect", () => {
    logger.info("Redis connecting...");
  });

  c.on("ready", () => {
    isConnected = true;
    logger.info("Redis connected");
  });

  c.on("error", (err) => {
    isConnected = false;
    logger.error(err, "Redis error");
  });

  c.on("end", () => {
    isConnected = false;
    logger.warn("Redis connection ended");
  });

  return c;
}

export async function getRedis(): Promise<Redis> {
  if (!client) {
    client = createClient();
  }
  if (!isConnected) {
    try {
      await client.connect();
    } catch {
      logger.warn("Redis connection failed, operations will fall back");
    }
  }
  return client;
}

export function isRedisConnected(): boolean {
  return isConnected;
}

// Eager init on first import
client = createClient();

export async function closeRedis(): Promise<void> {
  if (client && isConnected) {
    await client.quit();
    isConnected = false;
    logger.info("Redis connection closed");
  }
}
