import { db } from "../../../lib/db";
import { orders } from "../../../db/schema/orders";
import { orderItems } from "../../../db/schema/order-items";
import { restaurants } from "../../../db/schema/restaurants";
import { users } from "../../../db/schema/users";
import { deliveryPartners } from "../../../db/schema/delivery-partners";
import { eq, and, sql, gte, lte, isNull, desc, count } from "drizzle-orm";

export async function getRestaurantAnalytics(restaurantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayOrders] = await db
    .select({ count: count() })
    .from(orders)
    .where(and(eq(orders.restaurantId, restaurantId), gte(orders.createdAt, today)));

  const [todayRevenue] = await db
    .select({ total: sql<string>`COALESCE(SUM(grand_total), 0)` })
    .from(orders)
    .where(and(eq(orders.restaurantId, restaurantId), gte(orders.createdAt, today)));

  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [monthRevenue] = await db
    .select({ total: sql<string>`COALESCE(SUM(grand_total), 0)` })
    .from(orders)
    .where(and(eq(orders.restaurantId, restaurantId), gte(orders.createdAt, firstOfMonth)));

  const popularFoods = await db
    .select({
      foodId: orderItems.foodId,
      totalOrdered: sql<number>`COUNT(*)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(eq(orders.restaurantId, restaurantId))
    .groupBy(orderItems.foodId)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(10);

  return {
    ordersToday: Number(todayOrders?.count ?? 0),
    revenueToday: Number(todayRevenue?.total ?? 0),
    revenueThisMonth: Number(monthRevenue?.total ?? 0),
    popularFoods,
  };
}

export async function getAdminAnalytics() {
  const [totalUsers] = await db
    .select({ count: count() })
    .from(users);

  const [totalOrders] = await db
    .select({ count: count() })
    .from(orders);

  const [totalRevenue] = await db
    .select({ total: sql<string>`COALESCE(SUM(grand_total), 0)` })
    .from(orders);

  const [activeRestaurants] = await db
    .select({ count: count() })
    .from(restaurants)
    .where(and(isNull(restaurants.deletedAt), eq(restaurants.status, "APPROVED")));

  const [activeDeliveryPartners] = await db
    .select({ count: count() })
    .from(deliveryPartners);

  return {
    totalUsers: Number(totalUsers?.count ?? 0),
    totalOrders: Number(totalOrders?.count ?? 0),
    totalRevenue: Number(totalRevenue?.total ?? 0),
    activeRestaurants: Number(activeRestaurants?.count ?? 0),
    activeDeliveryPartners: Number(activeDeliveryPartners?.count ?? 0),
  };
}

export async function getRevenueTrend(days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const result = await db
    .select({
      date: sql<string>`DATE(created_at)`,
      revenue: sql<string>`COALESCE(SUM(grand_total), 0)`,
    })
    .from(orders)
    .where(gte(orders.createdAt, startDate))
    .groupBy(sql`DATE(created_at)`)
    .orderBy(sql`DATE(created_at)`);

  return result.map((r) => ({
    date: r.date,
    revenue: Number(r.revenue),
  }));
}

export async function getOrderTrend(days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const result = await db
    .select({
      date: sql<string>`DATE(created_at)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(orders)
    .where(gte(orders.createdAt, startDate))
    .groupBy(sql`DATE(created_at)`)
    .orderBy(sql`DATE(created_at)`);

  return result.map((r) => ({
    date: r.date,
    count: Number(r.count),
  }));
}

export async function getTopRestaurants(limit: number) {
  return db
    .select({
      restaurantId: orders.restaurantId,
      name: restaurants.name,
      logoUrl: restaurants.logoUrl,
      totalOrders: sql<number>`COUNT(*)`,
      totalRevenue: sql<string>`COALESCE(SUM(grand_total), 0)`,
    })
    .from(orders)
    .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
    .where(isNull(restaurants.deletedAt))
    .groupBy(orders.restaurantId, restaurants.name, restaurants.logoUrl)
    .orderBy(desc(sql`COALESCE(SUM(grand_total), 0)`))
    .limit(limit)
    .then((rows) =>
      rows.map((r) => ({
        restaurantId: r.restaurantId,
        name: r.name,
        logoUrl: r.logoUrl,
        totalOrders: Number(r.totalOrders),
        totalRevenue: Number(r.totalRevenue),
      })),
    );
}
