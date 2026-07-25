import type { Request, Response } from "express";
import * as globalFoodService from "../services/global-foods.service";
import { sendSuccess } from "../../../utils/response";

export const listCategories = async (_req: Request, res: Response) => {
  const result = await globalFoodService.listCategories();
  sendSuccess(res, result);
};

export const createCategory = async (req: Request, res: Response) => {
  const result = await globalFoodService.createCategory(req.body);
  sendSuccess(res, result, 201);
};

export const updateCategory = async (req: Request, res: Response) => {
  const result = await globalFoodService.updateCategory(String(req.params.id), req.body);
  sendSuccess(res, result);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const result = await globalFoodService.deleteCategory(String(req.params.id));
  sendSuccess(res, result);
};

export const listFoods = async (req: Request, res: Response) => {
  const result = await globalFoodService.listFoods(req.query.categoryId as string | undefined);
  sendSuccess(res, result);
};

export const createFood = async (req: Request, res: Response) => {
  const result = await globalFoodService.createFood(req.body);
  sendSuccess(res, result, 201);
};

export const updateFood = async (req: Request, res: Response) => {
  const result = await globalFoodService.updateFood(String(req.params.id), req.body);
  sendSuccess(res, result);
};

export const deleteFood = async (req: Request, res: Response) => {
  const result = await globalFoodService.deleteFood(String(req.params.id));
  sendSuccess(res, result);
};
