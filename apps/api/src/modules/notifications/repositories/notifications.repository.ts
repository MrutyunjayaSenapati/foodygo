import { db } from "../../../lib/db";
import { notifications } from "../../../db/schema/notifications";
import { eq, and, desc, sql } from "drizzle-orm";

export async function findByUserId(userId: string, page: number, pageSize: number) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}

export async function countByUserId(userId: string) {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(notifications)
    .where(eq(notifications.userId, userId));
  return Number(result[0]?.count ?? 0);
}

export async function countUnreadByUserId(userId: string) {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return Number(result[0]?.count ?? 0);
}

export async function markAsRead(id: string, userId: string) {
  const result = await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function markAllAsRead(userId: string) {
  return db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId))
    .returning();
}

export async function deleteNotification(id: string, userId: string) {
  const result = await db
    .delete(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function create(userId: string, title: string, body?: string) {
  const result = await db
    .insert(notifications)
    .values({ userId, title, body: body ?? null })
    .returning();
  return result[0]!;
}
