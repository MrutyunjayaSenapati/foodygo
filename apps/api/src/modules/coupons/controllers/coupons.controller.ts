import type { Request, Response } from "express";
import * as couponService from "../services/coupons.service";
import { sendSuccess } from "../../../utils/response";

export const listCoupons = async (_req: Request, res: Response) => {
  const result = await couponService.list();
  sendSuccess(res, result);
};

export const createCoupon = async (req: Request, res: Response) => {
  const result = await couponService.create(req.body);
  sendSuccess(res, result, 201);
};

export const updateCoupon = async (req: Request, res: Response) => {
  const result = await couponService.update(String(req.params.id), req.body);
  sendSuccess(res, result);
};

export const deleteCoupon = async (req: Request, res: Response) => {
  const result = await couponService.deleteCoupon(String(req.params.id));
  sendSuccess(res, result);
};

export const validateCoupon = async (req: Request, res: Response) => {
  const result = await couponService.validate(req.body.code);
  sendSuccess(res, result);
};
