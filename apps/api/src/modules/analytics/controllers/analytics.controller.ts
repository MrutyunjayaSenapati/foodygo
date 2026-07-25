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

export const revenueTrend = async (req: Request, res: Response) => {
  const days = Number(req.query.days) || 7;
  const result = await analyticsService.getRevenueTrend(days);
  sendSuccess(res, result);
};

export const orderTrend = async (req: Request, res: Response) => {
  const days = Number(req.query.days) || 7;
  const result = await analyticsService.getOrderTrend(days);
  sendSuccess(res, result);
};

export const topRestaurants = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const result = await analyticsService.getTopRestaurants(limit);
  sendSuccess(res, result);
};
