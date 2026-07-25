import { db } from "../../../lib/db";
import { foods } from "../../../db/schema/foods";
import { foodCategories } from "../../../db/schema/food-categories";
import { globalFoods } from "../../../db/schema/global-foods";
import { eq, like, and, isNull, sql, notInArray } from "drizzle-orm";
import type { UpdateFoodDTO, CreateFoodCategoryDTO, AddFromCatalogDTO } from "@foodygo/shared-types";

export async function findFoodById(id: string) {
  const result = await db
    .select()
    .from(foods)
    .where(and(eq(foods.id, id), isNull(foods.deletedAt)))
    .limit(1);
  return result[0] ?? null;
}

export async function findCategoryById(id: string) {
  const result = await db
    .select()
    .from(foodCategories)
    .where(eq(foodCategories.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function findCategoryByName(restaurantId: string, name: string) {
  const result = await db
    .select()
    .from(foodCategories)
    .where(and(eq(foodCategories.restaurantId, restaurantId), eq(foodCategories.name, name)))
    .limit(1);
  return result[0] ?? null;
}

export async function updateFood(id: string, restaurantId: string, data: UpdateFoodDTO) {
  const result = await db
    .update(foods)
    .set({
      ...data,
      price: data.price?.toString(),
    })
    .where(and(eq(foods.id, id), eq(foods.restaurantId, restaurantId), isNull(foods.deletedAt)))
    .returning();
  return result[0] ?? null;
}

export async function softDeleteFood(id: string, restaurantId: string) {
  const result = await db
    .update(foods)
    .set({ deletedAt: new Date() })
    .where(and(eq(foods.id, id), eq(foods.restaurantId, restaurantId), isNull(foods.deletedAt)))
    .returning();
  return result[0] ?? null;
}

export async function listFoods(params: {
  page: number;
  pageSize: number;
  search?: string;
  restaurantId?: string;
  categoryId?: string;
}) {
  const conditions = [isNull(foods.deletedAt), eq(foods.isAvailable, true)];

  if (params.search) {
    conditions.push(like(foods.name, `%${params.search}%`));
  }
  if (params.restaurantId) {
    conditions.push(eq(foods.restaurantId, params.restaurantId));
  }
  if (params.categoryId) {
    conditions.push(eq(foods.categoryId, params.categoryId));
  }

  const where = and(...conditions);

  const data = await db
    .select()
    .from(foods)
    .where(where)
    .limit(params.pageSize)
    .offset((params.page - 1) * params.pageSize);

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(foods)
    .where(where);

  return {
    data,
    total: Number(countResult[0]?.count ?? 0),
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function getFoodsByRestaurant(restaurantId: string) {
  return db
    .select()
    .from(foods)
    .where(and(eq(foods.restaurantId, restaurantId), isNull(foods.deletedAt)));
}

export async function getAddedGlobalFoodIds(restaurantId: string) {
  const result = await db
    .select({ id: foods.globalFoodId })
    .from(foods)
    .where(and(eq(foods.restaurantId, restaurantId), isNull(foods.deletedAt), sql`${foods.globalFoodId} IS NOT NULL`));
  return result.map(r => r.id).filter(Boolean) as string[];
}

export async function getGlobalCatalog(excludeIds: string[]) {
  const conditions: any[] = [isNull(globalFoods.deletedAt), eq(globalFoods.isAvailable, true)];
  if (excludeIds.length > 0) {
    conditions.push(notInArray(globalFoods.id, excludeIds));
  }
  return db.select().from(globalFoods).where(and(...conditions));
}

export async function createFromCatalogFood(restaurantId: string, categoryId: string, dto: AddFromCatalogDTO & { catalogSnapshot: Record<string, any> }) {
  const result = await db
    .insert(foods)
    .values({
      restaurantId,
      categoryId,
      name: dto.name!,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl ?? null,
      price: dto.price.toString(),
      globalFoodId: dto.globalFoodId,
      catalogSnapshot: dto.catalogSnapshot,
    })
    .returning();
  return result[0]!;
}

export async function getCategoriesByRestaurant(restaurantId: string) {
  return db
    .select()
    .from(foodCategories)
    .where(eq(foodCategories.restaurantId, restaurantId));
}

export async function createCategory(restaurantId: string, data: CreateFoodCategoryDTO) {
  const result = await db
    .insert(foodCategories)
    .values({ restaurantId, name: data.name })
    .returning();
  return result[0]!;
}

export async function updateCategory(id: string, restaurantId: string, data: CreateFoodCategoryDTO) {
  const result = await db
    .update(foodCategories)
    .set({ name: data.name })
    .where(and(eq(foodCategories.id, id), eq(foodCategories.restaurantId, restaurantId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteCategory(id: string, restaurantId: string) {
  const result = await db
    .delete(foodCategories)
    .where(and(eq(foodCategories.id, id), eq(foodCategories.restaurantId, restaurantId)))
    .returning();
  return result[0] ?? null;
}
