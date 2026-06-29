import type { Request, Response } from "express";
import * as cartService from "../services/cart.service";
import { sendSuccess } from "../../../utils/response";

export const getCart = async (req: Request, res: Response) => {
  const result = await cartService.getCart(req.user!.userId);
  sendSuccess(res, result);
};

export const addItem = async (req: Request, res: Response) => {
  const result = await cartService.addItem(req.user!.userId, req.body);
  sendSuccess(res, result, 201);
};

export const updateItem = async (req: Request, res: Response) => {
  const result = await cartService.updateItem(req.user!.userId, String(req.params.itemId), req.body);
  sendSuccess(res, result);
};

export const removeItem = async (req: Request, res: Response) => {
  const result = await cartService.removeItem(req.user!.userId, String(req.params.itemId));
  sendSuccess(res, result);
};

export const clearCart = async (req: Request, res: Response) => {
  const result = await cartService.clearCart(req.user!.userId);
  sendSuccess(res, result);
};
