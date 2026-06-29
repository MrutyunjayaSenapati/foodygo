import type { Request, Response } from "express";
import * as deliveryService from "../services/delivery.service";
import { sendSuccess } from "../../../utils/response";

export const registerPartner = async (req: Request, res: Response) => {
  const result = await deliveryService.registerPartner(req.user!.userId, req.body);
  sendSuccess(res, result, 201);
};

export const updatePartner = async (req: Request, res: Response) => {
  const result = await deliveryService.updatePartner(String(req.params.id), req.body);
  sendSuccess(res, result);
};

export const getAvailableDeliveries = async (_req: Request, res: Response) => {
  const result = await deliveryService.getAvailableDeliveries();
  sendSuccess(res, result);
};

export const acceptDelivery = async (req: Request, res: Response) => {
  const result = await deliveryService.acceptDelivery(
    String(req.params.id),
    req.user!.userId,
    req.body,
  );
  sendSuccess(res, result);
};

export const markPickedUp = async (req: Request, res: Response) => {
  const result = await deliveryService.markPickedUp(String(req.params.id), req.user!.userId);
  sendSuccess(res, result);
};

export const markCompleted = async (req: Request, res: Response) => {
  const result = await deliveryService.markCompleted(String(req.params.id), req.user!.userId);
  sendSuccess(res, result);
};

export const getMyAssignments = async (req: Request, res: Response) => {
  const result = await deliveryService.getMyAssignments(req.user!.userId);
  sendSuccess(res, result);
};
