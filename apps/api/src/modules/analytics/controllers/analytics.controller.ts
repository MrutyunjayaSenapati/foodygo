import type { Request, Response } from "express";
import * as analyticsService from "../services/analytics.service";
import { sendSuccess } from "../../../utils/response";

export const restaurantAnalytics = async (req: Request, res: Response) => {
  const result = await analyticsService.getRestaurantAnalytics(String(req.params.id));
  sendSuccess(res, result);
};

export const adminAnalytics = async (req: Request, res: Response) => {
  const result = await analyticsService.getAdminAnalytics();
  sendSuccess(res, result);
};
