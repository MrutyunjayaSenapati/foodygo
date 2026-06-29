import type { Request, Response } from "express";
import * as orderService from "../services/orders.service";
import { sendSuccess } from "../../../utils/response";

export const createOrder = async (req: Request, res: Response) => {
  const result = await orderService.createOrder(req.user!.userId, req.body);
  sendSuccess(res, result, 201);
};

export const getOrder = async (req: Request, res: Response) => {
  const result = await orderService.getOrder(req.user!.userId, String(req.params.id));
  sendSuccess(res, result);
};

export const listOrders = async (req: Request, res: Response) => {
  const result = await orderService.listOrders(req.user!.userId, {
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
  });
  sendSuccess(res, result.data);
};

export const listRestaurantOrders = async (req: Request, res: Response) => {
  const result = await orderService.listRestaurantOrders(String(req.params.restaurantId), {
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    status: req.query.status as string | undefined,
  });
  sendSuccess(res, result.data);
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const result = await orderService.updateOrderStatus(
    String(req.params.id),
    req.body.status,
    req.user!.userId,
    req.user!.roles,
  );
  sendSuccess(res, result);
};

export const cancelOrder = async (req: Request, res: Response) => {
  const result = await orderService.cancelOrder(req.user!.userId, String(req.params.id));
  sendSuccess(res, result);
};
