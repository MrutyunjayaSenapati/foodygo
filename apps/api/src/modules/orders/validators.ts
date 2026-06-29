import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  couponCode: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.string(),
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  status: z.string().optional(),
});
