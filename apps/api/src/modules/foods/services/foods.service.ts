import * as foodRepository from "../repositories/foods.repository";
import * as globalFoodRepository from "../../global-foods/repositories/global-foods.repository";
import * as restaurantRepository from "../../restaurants/repositories/restaurants.repository";
import { AppError } from "../../../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";
import type { UpdateFoodDTO, CreateFoodCategoryDTO, AddFromCatalogDTO } from "@foodygo/shared-types";

async function verifyRestaurantOwnership(restaurantId: string, userId: string) {
  const restaurant = await restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new AppError(ErrorCode.NOT_FOUND, "Restaurant not found");
  }
  if (restaurant.ownerUserId !== userId) {
    throw new AppError(ErrorCode.FORBIDDEN, "You do not own this restaurant");
  }
}

export async function getFood(id: string) {
  const food = await foodRepository.findFoodById(id);
  if (!food) {
    throw new AppError(ErrorCode.NOT_FOUND, "Food not found");
  }
  return food;
}

export async function updateFood(id: string, restaurantId: string, userId: string, dto: UpdateFoodDTO) {
  await verifyRestaurantOwnership(restaurantId, userId);

  const food = await foodRepository.updateFood(id, restaurantId, dto);
  if (!food) {
    throw new AppError(ErrorCode.NOT_FOUND, "Food not found or not owned by you");
  }
  return food;
}

export async function deleteFood(id: string, restaurantId: string, userId: string) {
  await verifyRestaurantOwnership(restaurantId, userId);

  const food = await foodRepository.softDeleteFood(id, restaurantId);
  if (!food) {
    throw new AppError(ErrorCode.NOT_FOUND, "Food not found or not owned by you");
  }
  return food;
}

export async function listFoods(params: {
  page: number;
  pageSize: number;
  search?: string;
  restaurantId?: string;
  categoryId?: string;
}) {
  return foodRepository.listFoods(params);
}

async function syncCatalogFood(food: any) {
  if (!food.globalFoodId || !food.catalogSnapshot) return food;

  const globalFood = await globalFoodRepository.findFoodById(food.globalFoodId);
  if (!globalFood) return food;

  const snapshot = food.catalogSnapshot as Record<string, any>;
  const updates: Record<string, any> = {};
  const newSnapshot: Record<string, any> = {};

  if (food.name === snapshot.name && globalFood.name !== snapshot.name) {
    updates.name = globalFood.name;
  }
  if (food.description === snapshot.description && globalFood.description !== snapshot.description) {
    updates.description = globalFood.description;
  }
  if (food.imageUrl === snapshot.imageUrl && globalFood.imageUrl !== snapshot.imageUrl) {
    updates.imageUrl = globalFood.imageUrl;
  }

  newSnapshot.name = updates.name ?? snapshot.name;
  newSnapshot.description = updates.description ?? snapshot.description;
  newSnapshot.imageUrl = updates.imageUrl ?? snapshot.imageUrl;

  if (Object.keys(updates).length > 0) {
    updates.catalogSnapshot = newSnapshot;
    await foodRepository.updateFood(food.id, food.restaurantId, updates as any);
    return { ...food, ...updates };
  }
  return food;
}

export async function getRestaurantFoods(restaurantId: string) {
  const [foods, categories] = await Promise.all([
    foodRepository.getFoodsByRestaurant(restaurantId),
    foodRepository.getCategoriesByRestaurant(restaurantId),
  ]);
  const syncedFoods = await Promise.all(foods.map(syncCatalogFood));
  return { foods: syncedFoods, categories };
}

export async function getGlobalCatalog(restaurantId: string) {
  const addedIds = await foodRepository.getAddedGlobalFoodIds(restaurantId);
  const catalog = await foodRepository.getGlobalCatalog(addedIds);
  return catalog;
}

export async function addFromCatalog(restaurantId: string, userId: string, dto: AddFromCatalogDTO) {
  await verifyRestaurantOwnership(restaurantId, userId);

  const globalFood = await globalFoodRepository.findFoodById(dto.globalFoodId);
  if (!globalFood) {
    throw new AppError(ErrorCode.NOT_FOUND, "Global food not found");
  }

  let restaurantCategoryId = dto.categoryId;

  const existingCategory = await foodRepository.findCategoryById(dto.categoryId);
  if (!existingCategory) {
    const globalCategory = await globalFoodRepository.findCategoryById(dto.categoryId);
    if (!globalCategory) {
      throw new AppError(ErrorCode.NOT_FOUND, "Category not found");
    }
    const existing = await foodRepository.findCategoryByName(restaurantId, globalCategory.name);
    if (existing) {
      restaurantCategoryId = existing.id;
    } else {
      const created = await foodRepository.createCategory(restaurantId, { name: globalCategory.name });
      restaurantCategoryId = created.id;
    }
  }

  const catalogSnapshot = {
    name: globalFood.name,
    description: globalFood.description,
    imageUrl: globalFood.imageUrl,
  };

  return foodRepository.createFromCatalogFood(restaurantId, restaurantCategoryId, {
    globalFoodId: dto.globalFoodId,
    price: dto.price,
    categoryId: restaurantCategoryId,
    name: dto.name ?? globalFood.name,
    description: dto.description ?? globalFood.description ?? undefined,
    imageUrl: dto.imageUrl ?? globalFood.imageUrl ?? undefined,
    catalogSnapshot,
  });
}

export async function createCategory(restaurantId: string, userId: string, dto: CreateFoodCategoryDTO) {
  await verifyRestaurantOwnership(restaurantId, userId);
  return foodRepository.createCategory(restaurantId, dto);
}

export async function updateCategory(id: string, restaurantId: string, userId: string, dto: CreateFoodCategoryDTO) {
  await verifyRestaurantOwnership(restaurantId, userId);

  const category = await foodRepository.updateCategory(id, restaurantId, dto);
  if (!category) {
    throw new AppError(ErrorCode.NOT_FOUND, "Category not found");
  }
  return category;
}

export async function deleteCategory(id: string, restaurantId: string, userId: string) {
  await verifyRestaurantOwnership(restaurantId, userId);

  const category = await foodRepository.deleteCategory(id, restaurantId);
  if (!category) {
    throw new AppError(ErrorCode.NOT_FOUND, "Category not found");
  }
  return category;
}
