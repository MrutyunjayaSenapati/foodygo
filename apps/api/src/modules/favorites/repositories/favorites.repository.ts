import { db } from "../../../lib/db";
import { favorites } from "../../../db/schema/favorites";
import { restaurants } from "../../../db/schema/restaurants";
import { eq, and } from "drizzle-orm";

export async function findFavorite(userId: string, restaurantId: string) {
  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.restaurantId, restaurantId)))
    .limit(1);
  return result[0] ?? null;
}

export async function addFavorite(userId: string, restaurantId: string) {
  const result = await db
    .insert(favorites)
    .values({ userId, restaurantId })
    .returning();
  return result[0]!;
}

export async function removeFavorite(userId: string, restaurantId: string) {
  const result = await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.restaurantId, restaurantId)))
    .returning();
  return result[0] ?? null;
}

export async function getUserFavorites(userId: string) {
  return db
    .select()
    .from(favorites)
    .innerJoin(restaurants, eq(favorites.restaurantId, restaurants.id))
    .where(eq(favorites.userId, userId));
}
