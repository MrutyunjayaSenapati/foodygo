import { z } from "zod";

export const updateFoodSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().positive().optional(),
  isAvailable: z.boolean().optional(),
  categoryId: z.string().uuid().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
});

export const addFromCatalogSchema = z.object({
  globalFoodId: z.string().uuid(),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export const listFoodsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  restaurantId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
});
