import { db } from "../../../lib/db";
import { deliveryPartners } from "../../../db/schema/delivery-partners";
import { deliveryAssignments } from "../../../db/schema/delivery-assignments";
import { eq } from "drizzle-orm";

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
