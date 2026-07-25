import { db } from "../../../lib/db";
import { orders } from "../../../db/schema/orders";
import { orderItems } from "../../../db/schema/order-items";
import { orderStatusHistory } from "../../../db/schema/order-status-history";
import { restaurants } from "../../../db/schema/restaurants";
import { eq, and, sql, desc } from "drizzle-orm";


export async function createOrder(data: {
  userId: string;
  restaurantId: string;
  addressId: string;
  subtotal: string;
  discount: string;
  packingFee: string;
  platformFee: string;
  deliveryFee: string;
  tax: string;
  tip: string;
  grandTotal: string;
  status: string;
  paymentStatus: string;
}) {
  const result = await db
    .insert(orders)
    .values(data as any)
    .returning();
  return result[0]!;
}

export async function getOrderById(id: string) {
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getOrderItems(orderId: string) {
  return db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
}

export async function getOrdersByUser(userId: string, page: number, pageSize: number) {
  const data = await db
    .select({
      order: orders,
      restaurantName: restaurants.name,
      restaurantLogo: restaurants.logoUrl,
    })
    .from(orders)
    .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(eq(orders.userId, userId));

  return {
    data: data.map((row) => ({
      ...row.order,
      restaurantName: row.restaurantName,
      restaurantLogo: row.restaurantLogo,
    })),
    total: Number(countResult[0]?.count ?? 0),
    page,
    pageSize,
  };
}

export async function getOrdersByRestaurant(
  restaurantId: string,
  page: number,
  pageSize: number,
  status?: string,
) {
  const conditions = [eq(orders.restaurantId, restaurantId)];
  if (status) {
    conditions.push(eq(orders.status, status as any));
  }
  const where = and(...conditions);

  const data = await db
    .select()
    .from(orders)
    .where(where)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(where);

  return {
    data,
    total: Number(countResult[0]?.count ?? 0),
    page,
    pageSize,
  };
}

export async function updateOrderStatus(id: string, status: string) {
  const result = await db
    .update(orders)
    .set({ status: status as any })
    .where(eq(orders.id, id))
    .returning();
  return result[0] ?? null;
}

export async function addStatusHistory(orderId: string, status: string) {
  const result = await db
    .insert(orderStatusHistory)
    .values({ orderId, status: status as any })
    .returning();
  return result[0]!;
}

export async function countByUser(userId: string) {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(eq(orders.userId, userId));
  return Number(result[0]?.count ?? 0);
}

export async function countByRestaurant(restaurantId: string, status?: string) {
  const conditions = [eq(orders.restaurantId, restaurantId)];
  if (status) {
    conditions.push(eq(orders.status, status as any));
  }
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(and(...conditions));
  return Number(result[0]?.count ?? 0);
}

export async function updateOrderPaymentStatus(id: string, paymentStatus: string) {
  const result = await db
    .update(orders)
    .set({ paymentStatus: paymentStatus as any })
    .where(eq(orders.id, id))
    .returning();
  return result[0] ?? null;
}

export async function getOrderStatusHistory(orderId: string) {
  return db
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, orderId))
    .orderBy(orderStatusHistory.createdAt);
}

export async function cancelOrder(id: string) {
  const result = await db
    .update(orders)
    .set({ status: "CANCELLED" as any })
    .where(eq(orders.id, id))
    .returning();
  return result[0] ?? null;
}

export async function createOrderItems(items: { orderId: string; foodId: string; quantity: number; price: string }[]) {
  if (items.length === 0) return [];
  return db.insert(orderItems).values(items).returning();
}
