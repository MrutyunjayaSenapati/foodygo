import { db } from "../../../lib/db";
import { restaurants } from "../../../db/schema/restaurants";
import { eq, like, and, isNull, sql, desc } from "drizzle-orm";
import type { CreateRestaurantDTO, UpdateRestaurantDTO } from "@foodygo/shared-types";

export async function findById(id: string) {
  const result = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.id, id), isNull(restaurants.deletedAt)))
    .limit(1);
  return result[0] ?? null;
}

export async function findByOwnerId(ownerId: string) {
  return db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.ownerUserId, ownerId), isNull(restaurants.deletedAt)));
}

export async function create(ownerUserId: string, data: CreateRestaurantDTO) {
  const result = await db
    .insert(restaurants)
    .values({
      ownerUserId,
      name: data.name,
      description: data.description ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      address: data.address ?? "",
      latitude: (data.latitude ?? 0).toString(),
      longitude: (data.longitude ?? 0).toString(),
    })
    .returning();
  return result[0]!;
}

export async function update(id: string, ownerUserId: string, data: UpdateRestaurantDTO) {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
  if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.latitude !== undefined) updateData.latitude = data.latitude.toString();
  if (data.longitude !== undefined) updateData.longitude = data.longitude.toString();

  const result = await db
    .update(restaurants)
    .set(updateData)
    .where(and(eq(restaurants.id, id), eq(restaurants.ownerUserId, ownerUserId), isNull(restaurants.deletedAt)))
    .returning();
  return result[0] ?? null;
}

export async function updateStatus(id: string, status: string) {
  const result = await db
    .update(restaurants)
    .set({ status: status as never })
    .where(and(eq(restaurants.id, id), isNull(restaurants.deletedAt)))
    .returning();
  return result[0] ?? null;
}

export async function softDelete(id: string, ownerUserId: string) {
  const result = await db
    .update(restaurants)
    .set({ deletedAt: new Date() })
    .where(and(eq(restaurants.id, id), eq(restaurants.ownerUserId, ownerUserId), isNull(restaurants.deletedAt)))
    .returning();
  return result[0] ?? null;
}

export async function adminDelete(id: string) {
  const result = await db
    .update(restaurants)
    .set({ deletedAt: new Date() })
    .where(and(eq(restaurants.id, id), isNull(restaurants.deletedAt)))
    .returning();
  return result[0] ?? null;
}

export async function list(params: {
  page: number;
  pageSize: number;
  search?: string;
  ratingMin?: number;
  ratingMax?: number;
  priceMin?: number;
  priceMax?: number;
}) {
  const conditions: ReturnType<typeof sql>[] = [isNull(restaurants.deletedAt), eq(restaurants.status, "APPROVED" as never)];

  if (params.search) {
    conditions.push(like(restaurants.name, `%${params.search}%`));
  }
  if (params.ratingMin !== undefined) {
    conditions.push(sql`${restaurants.rating}::numeric >= ${params.ratingMin}`);
  }
  if (params.ratingMax !== undefined) {
    conditions.push(sql`${restaurants.rating}::numeric <= ${params.ratingMax}`);
  }
  if (params.priceMin !== undefined) {
    conditions.push(sql`${params.priceMin} <= (SELECT COALESCE(MIN(price::numeric), 0) FROM foods WHERE restaurant_id = ${restaurants.id} AND deleted_at IS NULL)`);
  }
  if (params.priceMax !== undefined) {
    conditions.push(sql`${params.priceMax} >= (SELECT COALESCE(MIN(price::numeric), 0) FROM foods WHERE restaurant_id = ${restaurants.id} AND deleted_at IS NULL)`);
  }

  const where = and(...conditions);

  const data = await db
    .select()
    .from(restaurants)
    .where(where)
    .limit(params.pageSize)
    .offset((params.page - 1) * params.pageSize)
    .orderBy(desc(restaurants.rating));

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(restaurants)
    .where(where);

  return {
    data,
    total: Number(countResult[0]?.count ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function adminList(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}) {
  const conditions: ReturnType<typeof sql>[] = [isNull(restaurants.deletedAt)];

  if (params.search) {
    conditions.push(like(restaurants.name, `%${params.search}%`));
  }
  if (params.status) {
    conditions.push(eq(restaurants.status, params.status as never));
  }

  const where = and(...conditions);

  const data = await db
    .select()
    .from(restaurants)
    .where(where)
    .limit(params.pageSize)
    .offset((params.page - 1) * params.pageSize)
    .orderBy(desc(restaurants.rating));

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(restaurants)
    .where(where);

  return {
    data,
    total: Number(countResult[0]?.count ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  };
}
