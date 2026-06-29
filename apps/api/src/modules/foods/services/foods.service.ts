import * as foodRepository from "../repositories/foods.repository";
import * as restaurantRepository from "../../restaurants/repositories/restaurants.repository";
import { AppError } from "../../../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";
import type { CreateFoodDTO, UpdateFoodDTO, CreateFoodCategoryDTO } from "@foodygo/shared-types";

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

export async function createFood(restaurantId: string, userId: string, dto: CreateFoodDTO) {
  await verifyRestaurantOwnership(restaurantId, userId);

  const category = await foodRepository.findCategoryById(dto.categoryId);
  if (!category) {
    throw new AppError(ErrorCode.NOT_FOUND, "Category not found");
  }
  return foodRepository.createFood(restaurantId, dto);
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

export async function getRestaurantFoods(restaurantId: string) {
  const [foods, categories] = await Promise.all([
    foodRepository.getFoodsByRestaurant(restaurantId),
    foodRepository.getCategoriesByRestaurant(restaurantId),
  ]);
  return { foods, categories };
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
