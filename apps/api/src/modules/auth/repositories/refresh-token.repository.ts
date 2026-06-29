import { db, type TxClient } from "../../../lib/db";
import { refreshTokens } from "../../../db/schema/refresh-tokens";
import { eq, and, isNull, sql } from "drizzle-orm";
import { REFRESH_TOKEN_EXPIRY_SECONDS } from "@foodygo/shared-constants";

export async function createToken(
  userId: string,
  tokenHash: string,
  options?: { deviceName?: string; ipAddress?: string; userAgent?: string },
  txClient?: TxClient,
) {
  const client = txClient ?? db;
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000);
  const result = await client.insert(refreshTokens).values({
    userId,
    tokenHash,
    deviceName: options?.deviceName ?? null,
    ipAddress: options?.ipAddress ?? null,
    userAgent: options?.userAgent ?? null,
    expiresAt,
    lastUsedAt: new Date(),
  }).returning();
  return result[0]!;
}

export async function findByHash(tokenHash: string) {
  const result = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.tokenHash, tokenHash),
        isNull(refreshTokens.revokedAt),
        sql`${refreshTokens.expiresAt} > NOW()`,
      ),
    )
    .limit(1);
  return result[0] ?? null;
}

export async function revokeAllUserTokens(
  userId: string,
  txClient?: TxClient,
) {
  const client = txClient ?? db;
  await client
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
    );
}

export async function revokeToken(
  tokenHash: string,
  txClient?: TxClient,
) {
  const client = txClient ?? db;
  await client
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.tokenHash, tokenHash));
}

export async function revokeOtherTokens(
  userId: string,
  currentTokenHash: string,
  txClient?: TxClient,
) {
  const client = txClient ?? db;
  await client
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(refreshTokens.userId, userId),
        sql`${refreshTokens.tokenHash} != ${currentTokenHash}`,
        isNull(refreshTokens.revokedAt),
      ),
    );
}

export async function cleanupExpiredTokens(userId: string) {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(refreshTokens.userId, userId),
        sql`${refreshTokens.expiresAt} <= NOW()`,
        isNull(refreshTokens.revokedAt),
      ),
    );
}

export async function getUserTokenCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(refreshTokens)
    .where(
      and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
    );
  return Number(result[0]?.count ?? 0);
}
