import { db } from "../../../lib/db";
import { coupons } from "../../../db/schema/coupons";
import { eq, and, gt } from "drizzle-orm";

export async function findAll() {
  return db.select().from(coupons);
}

export async function findById(id: string) {
  const result = await db
    .select()
    .from(coupons)
    .where(eq(coupons.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function findByCode(code: string) {
  const result = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code))
    .limit(1);
  return result[0] ?? null;
}

export async function create(data: {
  code: string;
  discountType: string;
  discountValue: string;
  expiryDate: Date;
}) {
  const result = await db
    .insert(coupons)
    .values({
      ...data,
      discountType: data.discountType as "PERCENTAGE" | "FIXED",
    })
    .returning();
  return result[0]!;
}

export async function update(id: string, data: Record<string, unknown>) {
  const result = await db
    .update(coupons)
    .set(data)
    .where(eq(coupons.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deleteCoupon(id: string) {
  const result = await db
    .delete(coupons)
    .where(eq(coupons.id, id))
    .returning();
  return result[0] ?? null;
}

export async function validateCode(code: string) {
  const result = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.code, code), gt(coupons.expiryDate, new Date())))
    .limit(1);
  return result[0] ?? null;
}
