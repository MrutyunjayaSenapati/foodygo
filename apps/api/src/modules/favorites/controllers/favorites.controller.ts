import type { Request, Response } from "express";
import * as favoritesService from "../services/favorites.service";
import { sendSuccess } from "../../../utils/response";

export const toggleFavorite = async (req: Request, res: Response) => {
  const result = await favoritesService.toggleFavorite(req.user!.userId, req.body.restaurantId);
  sendSuccess(res, result);
};

export const getFavorites = async (req: Request, res: Response) => {
  const result = await favoritesService.getFavorites(req.user!.userId);
  sendSuccess(res, result);
};
