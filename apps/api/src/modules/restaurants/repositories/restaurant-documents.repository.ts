import { db } from "../../../lib/db";
import { restaurantDocuments } from "../../../db/schema/restaurant-documents";
import { eq } from "drizzle-orm";

export async function findByRestaurant(restaurantId: string) {
  return db
    .select()
    .from(restaurantDocuments)
    .where(eq(restaurantDocuments.restaurantId, restaurantId));
}

export async function create(
  restaurantId: string,
  data: { documentType: string; documentUrl: string },
) {
  const result = await db
    .insert(restaurantDocuments)
    .values({
      restaurantId,
      documentType: data.documentType,
      documentUrl: data.documentUrl,
    })
    .returning();
  return result[0]!;
}

export async function updateVerificationStatus(
  id: string,
  status: string,
  verifiedBy: string,
  remarks?: string,
) {
  const result = await db
    .update(restaurantDocuments)
    .set({
      verificationStatus: status as never,
      verifiedBy,
      verifiedAt: new Date(),
      remarks: remarks ?? null,
    })
    .where(eq(restaurantDocuments.id, id))
    .returning();
  return result[0] ?? null;
}

export async function findById(id: string) {
  const result = await db
    .select()
    .from(restaurantDocuments)
    .where(eq(restaurantDocuments.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function remove(id: string) {
  const result = await db
    .delete(restaurantDocuments)
    .where(eq(restaurantDocuments.id, id))
    .returning();
  return result[0] ?? null;
}
