import type { Request, Response } from "express";
import * as foodService from "../services/foods.service";
import { sendSuccess } from "../../../utils/response";

export const getFood = async (req: Request, res: Response) => {
  const result = await foodService.getFood(String(req.params.id));
  sendSuccess(res, result);
};

export const createFood = async (req: Request, res: Response) => {
  const restaurantId = String(req.params.restaurantId);
  const result = await foodService.createFood(restaurantId, req.user!.userId, req.body);
  sendSuccess(res, result, 201);
};

export const updateFood = async (req: Request, res: Response) => {
  const restaurantId = String(req.params.restaurantId);
  const result = await foodService.updateFood(String(req.params.id), restaurantId, req.user!.userId, req.body);
  sendSuccess(res, result);
};

export const deleteFood = async (req: Request, res: Response) => {
  const restaurantId = String(req.params.restaurantId);
  const result = await foodService.deleteFood(String(req.params.id), restaurantId, req.user!.userId);
  sendSuccess(res, result);
};

export const listFoods = async (req: Request, res: Response) => {
  const result = await foodService.listFoods({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    search: req.query.search as string,
    restaurantId: req.query.restaurantId as string,
    categoryId: req.query.categoryId as string,
  });
  sendSuccess(res, result.data);
};

export const getRestaurantFoods = async (req: Request, res: Response) => {
  const result = await foodService.getRestaurantFoods(String(req.params.restaurantId));
  sendSuccess(res, result);
};

export const createCategory = async (req: Request, res: Response) => {
  const restaurantId = String(req.params.restaurantId);
  const result = await foodService.createCategory(restaurantId, req.user!.userId, req.body);
  sendSuccess(res, result, 201);
};

export const updateCategory = async (req: Request, res: Response) => {
  const restaurantId = String(req.params.restaurantId);
  const result = await foodService.updateCategory(String(req.params.id), restaurantId, req.user!.userId, req.body);
  sendSuccess(res, result);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const restaurantId = String(req.params.restaurantId);
  const result = await foodService.deleteCategory(String(req.params.id), restaurantId, req.user!.userId);
  sendSuccess(res, result);
};
