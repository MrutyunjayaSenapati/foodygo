import { db } from "../../../lib/db";
import { users } from "../../../db/schema/users";
import { userRoles } from "../../../db/schema/user-roles";
import { roles } from "../../../db/schema/roles";
import { eq, and, or, ilike, isNull, inArray, sql, desc, count } from "drizzle-orm";
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
  role?: string;
}) {
  const conditions = [isNull(users.deletedAt)];

  if (params.search) {
    conditions.push(
      or(
        ilike(users.fullName, `%${params.search}%`),
        ilike(users.email, `%${params.search}%`),
      )!,
    );
  }

  if (params.status) {
    conditions.push(eq(users.status, params.status as never));
  }

  if (params.role) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${userRoles}
        INNER JOIN ${roles} ON ${userRoles.roleId} = ${roles.id}
        WHERE ${userRoles.userId} = ${users.id}
        AND ${roles.name} = ${params.role}
      )`,
    );
  }

  const where = and(...conditions);

  const [usersList, [countResult]] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        status: users.status,
        deletedAt: users.deletedAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(where)
      .limit(params.pageSize)
      .offset((params.page - 1) * params.pageSize)
      .orderBy(desc(users.createdAt)),
    db
      .select({ total: count() })
      .from(users)
      .where(where),
  ]);

  if (usersList.length === 0) {
    return {
      data: [],
      total: Number(countResult?.total ?? 0),
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  const userIds = usersList.map((u) => u.id);
  const rolesList = await db
    .select({
      userId: userRoles.userId,
      roleName: roles.name,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(inArray(userRoles.userId, userIds));

  const rolesByUserId = new Map<string, string[]>();
  for (const r of rolesList) {
    const existing = rolesByUserId.get(r.userId) ?? [];
    existing.push(r.roleName);
    rolesByUserId.set(r.userId, existing);
  }

  const data = usersList.map((u) => ({
    ...u,
    roles: rolesByUserId.get(u.id) ?? [],
  }));

  return {
    data,
    total: Number(countResult?.total ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  };
}
