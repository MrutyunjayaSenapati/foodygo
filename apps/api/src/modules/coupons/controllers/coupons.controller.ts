import type { Request, Response } from "express";
import * as couponService from "../services/coupons.service";
import { sendSuccess, sendPaginated } from "../../../utils/response";

export const listCoupons = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const result = await couponService.list({ page, pageSize });
  sendPaginated(res, result.data, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
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
