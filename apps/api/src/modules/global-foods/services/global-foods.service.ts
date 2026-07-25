import * as globalFoodRepository from "../repositories/global-foods.repository";
import { AppError } from "../../../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";
import type {
  CreateGlobalCategoryDTO,
  UpdateGlobalCategoryDTO,
  CreateGlobalFoodDTO,
  UpdateGlobalFoodDTO,
} from "@foodygo/shared-types";

export async function listCategories() {
  return globalFoodRepository.listCategories();
}

export async function createCategory(dto: CreateGlobalCategoryDTO) {
  return globalFoodRepository.createCategory(dto);
}

export async function updateCategory(id: string, dto: UpdateGlobalCategoryDTO) {
  const category = await globalFoodRepository.findCategoryById(id);
  if (!category) {
    throw new AppError(ErrorCode.NOT_FOUND, "Global category not found");
  }
  return globalFoodRepository.updateCategory(id, dto);
}

export async function deleteCategory(id: string) {
  const category = await globalFoodRepository.findCategoryById(id);
  if (!category) {
    throw new AppError(ErrorCode.NOT_FOUND, "Global category not found");
  }
  const deleted = await globalFoodRepository.deleteCategory(id);
  if (!deleted) {
    throw new AppError(ErrorCode.NOT_FOUND, "Global category not found");
  }
  return deleted;
}

export async function listFoods(categoryId?: string) {
  return globalFoodRepository.listFoods(categoryId);
}

export async function createFood(dto: CreateGlobalFoodDTO) {
  if (dto.categoryId) {
    const category = await globalFoodRepository.findCategoryById(dto.categoryId);
    if (!category) {
      throw new AppError(ErrorCode.NOT_FOUND, "Global category not found");
    }
  }
  return globalFoodRepository.createFood(dto);
}

export async function updateFood(id: string, dto: UpdateGlobalFoodDTO) {
  const food = await globalFoodRepository.findFoodById(id);
  if (!food) {
    throw new AppError(ErrorCode.NOT_FOUND, "Global food not found");
  }
  if (dto.categoryId) {
    const category = await globalFoodRepository.findCategoryById(dto.categoryId);
    if (!category) {
      throw new AppError(ErrorCode.NOT_FOUND, "Global category not found");
    }
  }
  return globalFoodRepository.updateFood(id, dto);
}

export async function deleteFood(id: string) {
  const food = await globalFoodRepository.findFoodById(id);
  if (!food) {
    throw new AppError(ErrorCode.NOT_FOUND, "Global food not found");
  }
  const deleted = await globalFoodRepository.deleteFood(id);
  if (!deleted) {
    throw new AppError(ErrorCode.NOT_FOUND, "Global food not found");
  }
  return deleted;
}
