import { db } from "../../../lib/db";
import { globalCategories } from "../../../db/schema/global-categories";
import { globalFoods } from "../../../db/schema/global-foods";
import { eq, and, isNull } from "drizzle-orm";
import type {
  CreateGlobalCategoryDTO,
  UpdateGlobalCategoryDTO,
  CreateGlobalFoodDTO,
  UpdateGlobalFoodDTO,
} from "@foodygo/shared-types";

export async function findCategoryById(id: string) {
  const result = await db
    .select()
    .from(globalCategories)
    .where(eq(globalCategories.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function listCategories() {
  return db
    .select()
    .from(globalCategories)
    .where(isNull(globalCategories.deletedAt));
}

export async function createCategory(data: CreateGlobalCategoryDTO) {
  const result = await db
    .insert(globalCategories)
    .values({
      name: data.name,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
    })
    .returning();
  return result[0]!;
}

export async function updateCategory(id: string, data: UpdateGlobalCategoryDTO) {
  const result = await db
    .update(globalCategories)
    .set(data)
    .where(eq(globalCategories.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deleteCategory(id: string) {
  const result = await db
    .update(globalCategories)
    .set({ deletedAt: new Date() })
    .where(and(eq(globalCategories.id, id), isNull(globalCategories.deletedAt)))
    .returning();
  return result[0] ?? null;
}

export async function findFoodById(id: string) {
  const result = await db
    .select()
    .from(globalFoods)
    .where(eq(globalFoods.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function listFoods(categoryId?: string) {
  const conditions = [isNull(globalFoods.deletedAt)];
  if (categoryId) {
    conditions.push(eq(globalFoods.categoryId, categoryId));
  }
  return db
    .select()
    .from(globalFoods)
    .where(and(...conditions));
}

export async function createFood(data: CreateGlobalFoodDTO) {
  const result = await db
    .insert(globalFoods)
    .values({
      categoryId: data.categoryId ?? null,
      name: data.name,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
    })
    .returning();
  return result[0]!;
}

export async function updateFood(id: string, data: UpdateGlobalFoodDTO) {
  const result = await db
    .update(globalFoods)
    .set(data)
    .where(eq(globalFoods.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deleteFood(id: string) {
  const result = await db
    .update(globalFoods)
    .set({ deletedAt: new Date() })
    .where(and(eq(globalFoods.id, id), isNull(globalFoods.deletedAt)))
    .returning();
  return result[0] ?? null;
}
