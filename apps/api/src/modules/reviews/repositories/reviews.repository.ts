import { db } from "../../../lib/db";
import { reviews } from "../../../db/schema/reviews";
import { users } from "../../../db/schema/users";
import { eq, and, sql } from "drizzle-orm";
import type { CreateReviewDTO } from "@foodygo/shared-types";

export async function findById(id: string) {
  const result = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function findByUserAndRestaurant(userId: string, restaurantId: string) {
  const result = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.restaurantId, restaurantId)))
    .limit(1);
  return result[0] ?? null;
}

export async function create(userId: string, data: CreateReviewDTO) {
  const result = await db
    .insert(reviews)
    .values({
      userId,
      restaurantId: data.restaurantId,
      rating: data.rating,
      comment: data.comment ?? null,
    })
    .returning();
  return result[0]!;
}

export async function findByRestaurant(restaurantId: string, page: number, pageSize: number) {
  return db
    .select({
      id: reviews.id,
      userId: reviews.userId,
      restaurantId: reviews.restaurantId,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      userName: users.fullName,
      userAvatar: users.avatarUrl,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.restaurantId, restaurantId))
    .orderBy(sql`${reviews.createdAt} desc`)
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}

export async function countByRestaurant(restaurantId: string) {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(reviews)
    .where(eq(reviews.restaurantId, restaurantId));
  return Number(result[0]?.count ?? 0);
}

export async function deleteReview(id: string, userId: string) {
  const result = await db
    .delete(reviews)
    .where(and(eq(reviews.id, id), eq(reviews.userId, userId)))
    .returning();
  return result[0] ?? null;
}
