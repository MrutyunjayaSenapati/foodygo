import { z } from "zod";

export const createReviewSchema = z.object({
  restaurantId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  restaurantId: z.string().uuid().optional(),
});
