import { db } from "../../../lib/db";
import { orders } from "../../../db/schema/orders";
import { restaurants } from "../../../db/schema/restaurants";
import { reviews } from "../../../db/schema/reviews";
import { eq, and, sql } from "drizzle-orm";
import * as reviewRepository from "../repositories/reviews.repository";
import { AppError } from "../../../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";
import type { CreateReviewDTO } from "@foodygo/shared-types";

async function recalculateRating(restaurantId: string) {
  const [result] = await db
    .select({ avg: sql<string>`COALESCE(AVG(rating), 0)::numeric(3,2)` })
    .from(reviews)
    .where(eq(reviews.restaurantId, restaurantId));
  const newRating = result?.avg ?? "0";
  await db
    .update(restaurants)
    .set({ rating: newRating })
    .where(eq(restaurants.id, restaurantId));
}

export async function createReview(userId: string, dto: CreateReviewDTO) {
  const existing = await reviewRepository.findByUserAndRestaurant(userId, dto.restaurantId);
  if (existing) {
    throw new AppError(ErrorCode.CONFLICT, "You have already reviewed this restaurant");
  }

  const [deliveredOrder] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.restaurantId, dto.restaurantId), eq(orders.status, "DELIVERED")))
    .limit(1);
  if (!deliveredOrder) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "You can only review after a delivered order");
  }

  const review = await reviewRepository.create(userId, dto);
  await recalculateRating(dto.restaurantId);
  return review;
}

export async function deleteReview(id: string, userId: string) {
  const review = await reviewRepository.findById(id);
  if (!review) {
    throw new AppError(ErrorCode.NOT_FOUND, "Review not found");
  }
  const deleted = await reviewRepository.deleteReview(id, userId);
  if (!deleted) {
    throw new AppError(ErrorCode.NOT_FOUND, "Review not found or not owned by you");
  }
  await recalculateRating(review.restaurantId);
  return deleted;
}

export async function listByRestaurant(restaurantId: string, page: number, pageSize: number) {
  const [data, total] = await Promise.all([
    reviewRepository.findByRestaurant(restaurantId, page, pageSize),
    reviewRepository.countByRestaurant(restaurantId),
  ]);
  return { data, total, page, pageSize };
}
