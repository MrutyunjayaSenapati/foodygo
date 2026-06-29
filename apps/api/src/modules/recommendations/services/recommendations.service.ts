import { db } from "../../../lib/db";
import { orders } from "../../../db/schema/orders";
import { restaurants } from "../../../db/schema/restaurants";
import { eq, and, isNull, count } from "drizzle-orm";

interface ScoredRestaurant {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  rating: string;
  score: number;
}

export async function getRecommendations(userId: string): Promise<ScoredRestaurant[]> {
  const allRestaurants = await db
    .select()
    .from(restaurants)
    .where(and(isNull(restaurants.deletedAt), eq(restaurants.status, "APPROVED")));

  const scores = new Map<string, number>();
  const initialScore = 0;

  for (const r of allRestaurants) {
    scores.set(r.id, initialScore);
  }

  const pastOrderRestaurants = await db
    .selectDistinct({ restaurantId: orders.restaurantId })
    .from(orders)
    .where(eq(orders.userId, userId));

  const pastRestaurantIds = new Set(pastOrderRestaurants.map((o) => o.restaurantId));

  for (const r of allRestaurants) {
    const current = scores.get(r.id) ?? 0;

    if (pastRestaurantIds.has(r.id)) {
      scores.set(r.id, current + 4);
    }

    if (Number(r.rating) >= 4.5) {
      scores.set(r.id, (scores.get(r.id) ?? 0) + 3);
    }
  }

  const orderVolume = await db
    .select({
      restaurantId: orders.restaurantId,
      count: count(),
    })
    .from(orders)
    .groupBy(orders.restaurantId);

  const volumeMap = new Map(orderVolume.map((o) => [o.restaurantId, o.count]));

  const maxVolume = Math.max(...volumeMap.values(), 1);

  for (const [restaurantId, count] of volumeMap) {
    const normalized = count / maxVolume;
    const bonus = Math.round(normalized * 2);
    scores.set(restaurantId, (scores.get(restaurantId) ?? 0) + bonus);
  }

  return allRestaurants
    .map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      logoUrl: r.logoUrl,
      coverUrl: r.coverUrl,
      rating: r.rating,
      score: scores.get(r.id) ?? 0,
    }))
    .sort((a, b) => b.score - a.score);
}
