import { getRedis, isRedisConnected } from "./redis";
import { logger } from "./logger";

const KEY_PREFIX = "foodygo:";

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!isRedisConnected()) return null;
  try {
    const redis = await getRedis();
    const raw = await redis.get(`${KEY_PREFIX}${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    logger.warn({ err, key }, "Cache get failed");
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!isRedisConnected()) return;
  try {
    const redis = await getRedis();
    await redis.setex(`${KEY_PREFIX}${key}`, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    logger.warn({ err, key }, "Cache set failed");
  }
}

export async function cacheDel(key: string): Promise<void> {
  if (!isRedisConnected()) return;
  try {
    const redis = await getRedis();
    await redis.del(`${KEY_PREFIX}${key}`);
  } catch (err) {
    logger.warn({ err, key }, "Cache del failed");
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  if (!isRedisConnected()) return;
  try {
    const redis = await getRedis();
    const keys = await redis.keys(`${KEY_PREFIX}${pattern}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    logger.warn({ err, pattern }, "Cache delPattern failed");
  }
}
