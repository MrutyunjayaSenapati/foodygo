import { db } from "../../../lib/db";
import { payments } from "../../../db/schema/payments";
import { eq } from "drizzle-orm";

export async function createPayment(data: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  amount: string;
  status: string;
}) {
  const result = await db
    .insert(payments)
    .values(data as any)
    .returning();
  return result[0]!;
}

export async function findPaymentByOrderId(orderId: string) {
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .limit(1);
  return result[0] ?? null;
}

export async function findPaymentByRazorpayOrderId(razorpayOrderId: string) {
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.razorpayOrderId, razorpayOrderId))
    .limit(1);
  return result[0] ?? null;
}

export async function updatePaymentStatus(
  id: string,
  status: string,
  razorpayPaymentId?: string | null,
) {
  const values: Record<string, any> = { status: status as any };
  if (razorpayPaymentId !== undefined) {
    values.razorpayPaymentId = razorpayPaymentId;
  }
  const result = await db
    .update(payments)
    .set(values)
    .where(eq(payments.id, id))
    .returning();
  return result[0] ?? null;
}
