import { z } from "zod";

export const createPaymentOrderSchema = z.object({
  orderId: z.string().uuid(),
});

export const verifyPaymentSchema = z.object({
  razorpayPaymentId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
