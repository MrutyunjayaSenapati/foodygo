import type { Request, Response } from "express";
import * as reviewService from "../services/reviews.service";
import { sendSuccess } from "../../../utils/response";

export const create = async (req: Request, res: Response) => {
  const result = await reviewService.createReview(req.user!.userId, req.body);
  sendSuccess(res, result, 201);
};

export const deleteReview = async (req: Request, res: Response) => {
  const result = await reviewService.deleteReview(String(req.params.id), req.user!.userId);
  sendSuccess(res, result);
};

export const listByRestaurant = async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const { page, pageSize } = req.query as { page?: string; pageSize?: string };
  const result = await reviewService.listByRestaurant(
    String(restaurantId),
    Number(page) || 1,
    Number(pageSize) || 10,
  );
  sendSuccess(res, result);
};
