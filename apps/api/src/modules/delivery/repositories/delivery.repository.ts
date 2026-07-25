import { db } from "../../../lib/db";
import { deliveryPartners } from "../../../db/schema/delivery-partners";
import { deliveryAssignments } from "../../../db/schema/delivery-assignments";
import { users } from "../../../db/schema/users";
import { orders } from "../../../db/schema/orders";
import { restaurants } from "../../../db/schema/restaurants";
import { orderItems } from "../../../db/schema/order-items";
import { foods } from "../../../db/schema/foods";
import { addresses } from "../../../db/schema/addresses";
import { orderStatusHistory } from "../../../db/schema/order-status-history";
import { eq, and, desc, sql, count, sum, gte } from "drizzle-orm";

export async function findPartnerByUserId(userId: string) {
  const result = await db
    .select()
    .from(deliveryPartners)
    .where(eq(deliveryPartners.userId, userId))
    .limit(1);
  return result[0] ?? null;
}

export async function createPartner(
  userId: string,
  data: { vehicleType: string; licenseNumber: string },
) {
  const result = await db
    .insert(deliveryPartners)
    .values({
      userId,
      vehicleType: data.vehicleType as "BIKE" | "SCOOTER" | "CAR",
      licenseNumber: data.licenseNumber,
    })
    .returning();
  return result[0]!;
}

export async function updatePartner(
  id: string,
  data: { vehicleType?: string; licenseNumber?: string },
) {
  const updateData: Record<string, unknown> = {};
  if (data.vehicleType !== undefined)
    updateData.vehicleType = data.vehicleType as "BIKE" | "SCOOTER" | "CAR";
  if (data.licenseNumber !== undefined) updateData.licenseNumber = data.licenseNumber;
  const result = await db
    .update(deliveryPartners)
    .set(updateData)
    .where(eq(deliveryPartners.id, id))
    .returning();
  return result[0] ?? null;
}

export async function getAvailableDeliveries() {
  return db
    .select()
    .from(deliveryAssignments)
    .where(eq(deliveryAssignments.status, "ASSIGNED"));
}

export async function getAvailableDeliveriesEnriched() {
  return db
    .select({
      id: deliveryAssignments.id,
      orderId: deliveryAssignments.orderId,
      status: deliveryAssignments.status,
      assignedAt: deliveryAssignments.assignedAt,
      restaurantId: restaurants.id,
      restaurantName: restaurants.name,
      restaurantAddress: restaurants.address,
      restaurantLogoUrl: restaurants.logoUrl,
      restaurantLatitude: restaurants.latitude,
      restaurantLongitude: restaurants.longitude,
      grandTotal: orders.grandTotal,
      deliveryFee: orders.deliveryFee,
      itemCount: sql<number>`(SELECT COUNT(*) FROM ${orderItems} WHERE ${orderItems.orderId} = ${deliveryAssignments.orderId})`,
    })
    .from(deliveryAssignments)
    .innerJoin(orders, eq(deliveryAssignments.orderId, orders.id))
    .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
    .where(eq(deliveryAssignments.status, "ASSIGNED"));
}

export async function acceptAssignment(id: string, partnerId: string) {
  const result = await db
    .update(deliveryAssignments)
    .set({
      deliveryPartnerId: partnerId,
      status: "ACCEPTED",
      acceptedAt: new Date(),
    })
    .where(eq(deliveryAssignments.id, id))
    .returning();
  return result[0] ?? null;
}

export async function markPickedUp(id: string) {
  const result = await db
    .update(deliveryAssignments)
    .set({ status: "PICKED_UP", pickedUpAt: new Date() })
    .where(eq(deliveryAssignments.id, id))
    .returning();
  return result[0] ?? null;
}

export async function markCompleted(id: string) {
  const result = await db
    .update(deliveryAssignments)
    .set({ status: "COMPLETED", completedAt: new Date() })
    .where(eq(deliveryAssignments.id, id))
    .returning();
  return result[0] ?? null;
}

export async function getAssignmentsByPartner(partnerId: string) {
  return db
    .select()
    .from(deliveryAssignments)
    .where(eq(deliveryAssignments.deliveryPartnerId, partnerId));
}

export async function getAssignmentByOrderId(orderId: string) {
  const result = await db
    .select()
    .from(deliveryAssignments)
    .where(eq(deliveryAssignments.orderId, orderId))
    .limit(1);
  return result[0] ?? null;
}

export async function getPartnerByUserId(userId: string) {
  const result = await db
    .select({
      id: deliveryPartners.id,
      userId: deliveryPartners.userId,
      vehicleType: deliveryPartners.vehicleType,
      licenseNumber: deliveryPartners.licenseNumber,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
      email: users.email,
    })
    .from(deliveryPartners)
    .innerJoin(users, eq(deliveryPartners.userId, users.id))
    .where(eq(deliveryPartners.userId, userId))
    .limit(1);
  return result[0] ?? null;
}

export async function getAssignmentByIdSimple(id: string) {
  const result = await db
    .select()
    .from(deliveryAssignments)
    .where(eq(deliveryAssignments.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getAssignmentById(id: string) {
  const rows = await db
    .select({
      id: deliveryAssignments.id,
      orderId: deliveryAssignments.orderId,
      status: deliveryAssignments.status,
      assignedAt: deliveryAssignments.assignedAt,
      acceptedAt: deliveryAssignments.acceptedAt,
      pickedUpAt: deliveryAssignments.pickedUpAt,
      completedAt: deliveryAssignments.completedAt,
      restaurantId: restaurants.id,
      restaurantName: restaurants.name,
      restaurantAddress: restaurants.address,
      restaurantPhone: restaurants.phone,
      restaurantLogoUrl: restaurants.logoUrl,
      restaurantLatitude: restaurants.latitude,
      restaurantLongitude: restaurants.longitude,
      grandTotal: orders.grandTotal,
      deliveryFee: orders.deliveryFee,
      tip: orders.tip,
      customerId: users.id,
      customerName: users.fullName,
      customerPhone: users.fcmToken,
      addressLine1: addresses.addressLine1,
      addressLine2: addresses.addressLine2,
      city: addresses.city,
      state: addresses.state,
      postalCode: addresses.postalCode,
      addressLatitude: addresses.latitude,
      addressLongitude: addresses.longitude,
    })
    .from(deliveryAssignments)
    .innerJoin(orders, eq(deliveryAssignments.orderId, orders.id))
    .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
    .innerJoin(users, eq(orders.userId, users.id))
    .innerJoin(addresses, eq(orders.addressId, addresses.id))
    .where(eq(deliveryAssignments.id, id))
    .limit(1);

  if (!rows[0]) return null;

  const row = rows[0];

  const [items, statusHistory, countResult] = await Promise.all([
    db
      .select({
        id: orderItems.id,
        foodId: orderItems.foodId,
        name: foods.name,
        quantity: orderItems.quantity,
        price: orderItems.price,
        imageUrl: foods.imageUrl,
      })
      .from(orderItems)
      .innerJoin(foods, eq(orderItems.foodId, foods.id))
      .where(eq(orderItems.orderId, row.orderId)),
    db
      .select({
        status: orderStatusHistory.status,
        createdAt: orderStatusHistory.createdAt,
      })
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, row.orderId))
      .orderBy(orderStatusHistory.createdAt),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orderItems)
      .where(eq(orderItems.orderId, row.orderId)),
  ]);

  return {
    id: row.id,
    orderId: row.orderId,
    status: row.status,
    assignedAt: row.assignedAt,
    acceptedAt: row.acceptedAt,
    pickedUpAt: row.pickedUpAt,
    completedAt: row.completedAt,
    restaurant: {
      id: row.restaurantId,
      name: row.restaurantName,
      address: row.restaurantAddress,
      phone: row.restaurantPhone,
      logoUrl: row.restaurantLogoUrl,
      latitude: Number(row.restaurantLatitude),
      longitude: Number(row.restaurantLongitude),
    },
    order: {
      grandTotal: Number(row.grandTotal),
      itemCount: Number(countResult[0]?.count ?? 0),
      deliveryFee: Number(row.deliveryFee),
      tip: Number(row.tip),
    },
    customer: {
      id: row.customerId,
      fullName: row.customerName,
      phone: row.customerPhone,
    },
    deliveryAddress: {
      addressLine1: row.addressLine1,
      addressLine2: row.addressLine2,
      city: row.city,
      state: row.state,
      postalCode: row.postalCode,
      latitude: row.addressLatitude ? Number(row.addressLatitude) : null,
      longitude: row.addressLongitude ? Number(row.addressLongitude) : null,
    },
    items,
    statusHistory,
  };
}

export async function getPartnerById(partnerId: string) {
  const result = await db
    .select({
      id: deliveryPartners.id,
      userId: deliveryPartners.userId,
      vehicleType: deliveryPartners.vehicleType,
      licenseNumber: deliveryPartners.licenseNumber,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
    })
    .from(deliveryPartners)
    .innerJoin(users, eq(deliveryPartners.userId, users.id))
    .where(eq(deliveryPartners.id, partnerId))
    .limit(1);
  return result[0] ?? null;
}

export async function getMyStats(partnerId: string) {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const allRows = await db
    .select({
      count: count(),
      deliveryFee: sum(orders.deliveryFee),
      tip: sum(orders.tip),
    })
    .from(deliveryAssignments)
    .innerJoin(orders, eq(deliveryAssignments.orderId, orders.id))
    .where(
      and(
        eq(deliveryAssignments.deliveryPartnerId, partnerId),
        eq(deliveryAssignments.status, "COMPLETED"),
      ),
    );

  const weekRows = await db
    .select({
      count: count(),
      deliveryFee: sum(orders.deliveryFee),
      tip: sum(orders.tip),
    })
    .from(deliveryAssignments)
    .innerJoin(orders, eq(deliveryAssignments.orderId, orders.id))
    .where(
      and(
        eq(deliveryAssignments.deliveryPartnerId, partnerId),
        eq(deliveryAssignments.status, "COMPLETED"),
        gte(deliveryAssignments.completedAt, startOfWeek),
      ),
    );

  const all = allRows[0]!;
  const week = weekRows[0]!;

  return {
    totalDeliveries: Number(all.count),
    totalEarnings: Number(all.deliveryFee ?? 0) + Number(all.tip ?? 0),
    thisWeekDeliveries: Number(week.count),
    thisWeekEarnings: Number(week.deliveryFee ?? 0) + Number(week.tip ?? 0),
  };
}

export async function listPartners(params: { page: number; pageSize: number }) {
  const data = await db
    .select({
      id: deliveryPartners.id,
      userId: deliveryPartners.userId,
      vehicleType: deliveryPartners.vehicleType,
      licenseNumber: deliveryPartners.licenseNumber,
      fullName: users.fullName,
      email: users.email,
      avatarUrl: users.avatarUrl,
      userStatus: users.status,
    })
    .from(deliveryPartners)
    .innerJoin(users, eq(deliveryPartners.userId, users.id))
    .limit(params.pageSize)
    .offset((params.page - 1) * params.pageSize)
    .orderBy(desc(users.createdAt));

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(deliveryPartners);

  return {
    data,
    total: Number(countResult[0]?.count ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function listAssignments(params: { page: number; pageSize: number }) {
  const data = await db
    .select({
      id: deliveryAssignments.id,
      orderId: deliveryAssignments.orderId,
      deliveryPartnerId: deliveryAssignments.deliveryPartnerId,
      status: deliveryAssignments.status,
      assignedAt: deliveryAssignments.assignedAt,
      acceptedAt: deliveryAssignments.acceptedAt,
      pickedUpAt: deliveryAssignments.pickedUpAt,
      completedAt: deliveryAssignments.completedAt,
      partnerName: users.fullName,
      partnerVehicle: deliveryPartners.vehicleType,
      restaurantName: restaurants.name,
    })
    .from(deliveryAssignments)
    .innerJoin(deliveryPartners, eq(deliveryAssignments.deliveryPartnerId, deliveryPartners.id))
    .innerJoin(users, eq(deliveryPartners.userId, users.id))
    .innerJoin(orders, eq(deliveryAssignments.orderId, orders.id))
    .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
    .limit(params.pageSize)
    .offset((params.page - 1) * params.pageSize)
    .orderBy(desc(deliveryAssignments.assignedAt));

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(deliveryAssignments);

  return {
    data,
    total: Number(countResult[0]?.count ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  };
}
