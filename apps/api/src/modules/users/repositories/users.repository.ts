import { db } from "../../../lib/db";
import { users } from "../../../db/schema/users";
import { eq, like, and, isNull, sql } from "drizzle-orm";
import type { UpdateUserDTO } from "@foodygo/shared-types";

export async function findById(id: string) {
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1);
  return result[0] ?? null;
}

export async function update(id: string, data: UpdateUserDTO) {
  const result = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning();
  return result[0] ?? null;
}

export async function updateFcmToken(id: string, fcmToken: string) {
  const result = await db
    .update(users)
    .set({ fcmToken, updatedAt: new Date() })
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning();
  return result[0] ?? null;
}

export async function updateStatus(id: string, status: string) {
  const result = await db
    .update(users)
    .set({ status: status as never, updatedAt: new Date() })
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning();
  return result[0] ?? null;
}

export async function list(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}) {
  const conditions = [isNull(users.deletedAt)];

  if (params.search) {
    conditions.push(
      sql`(${like(users.fullName, `%${params.search}%`)} OR ${like(users.email, `%${params.search}%`)})`,
    );
  }

  if (params.status) {
    conditions.push(eq(users.status, params.status as never));
  }

  const where = and(...conditions);

  const data = await db
    .select()
    .from(users)
    .where(where)
    .limit(params.pageSize)
    .offset((params.page - 1) * params.pageSize)
    .orderBy(users.createdAt);

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(where);

  return {
    data,
    total: Number(countResult[0]?.count ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  };
}
