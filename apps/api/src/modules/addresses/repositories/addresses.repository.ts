import { db } from "../../../lib/db";
import { addresses } from "../../../db/schema/addresses";
import { eq, and } from "drizzle-orm";
import type { CreateAddressDTO } from "@foodygo/shared-types";

export async function findById(id: string, userId: string) {
  const result = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId), eq(addresses.isDeleted, false)))
    .limit(1);
  return result[0] ?? null;
}

export async function findByUserId(userId: string) {
  return db
    .select()
    .from(addresses)
    .where(and(eq(addresses.userId, userId), eq(addresses.isDeleted, false)));
}

export async function create(userId: string, data: CreateAddressDTO) {
  const result = await db
    .insert(addresses)
    .values({
      userId,
      label: data.label ?? null,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 ?? null,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      latitude: data.latitude?.toString() ?? null,
      longitude: data.longitude?.toString() ?? null,
    })
    .returning();
  return result[0]!;
}

export async function update(id: string, userId: string, data: Partial<CreateAddressDTO>) {
  const result = await db
    .update(addresses)
    .set({
      ...data,
      latitude: data.latitude?.toString(),
      longitude: data.longitude?.toString(),
    })
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId), eq(addresses.isDeleted, false)))
    .returning();
  return result[0] ?? null;
}

export async function softDelete(id: string, userId: string) {
  const result = await db
    .update(addresses)
    .set({ isDeleted: true })
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function setDefaultAddress(id: string, userId: string) {
  const result = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}
