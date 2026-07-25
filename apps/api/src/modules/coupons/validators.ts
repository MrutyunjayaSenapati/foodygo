import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().min(1).max(50),
  discountType: z.string(),
  discountValue: z.number().positive(),
  expiryDate: z.coerce.date(),
});

export const updateCouponSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  discountType: z.string().optional(),
  discountValue: z.number().positive().optional(),
  expiryDate: z.coerce.date().optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1),
});

export const listCouponsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});
