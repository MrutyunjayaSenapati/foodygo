import type { Request, Response } from "express";
import * as addressService from "../services/addresses.service";
import { sendSuccess } from "../../../utils/response";

export const create = async (req: Request, res: Response) => {
  const result = await addressService.create(req.user!.userId, req.body);
  sendSuccess(res, result, 201);
};

export const update = async (req: Request, res: Response) => {
  const result = await addressService.update(String(req.params.id), req.user!.userId, req.body);
  sendSuccess(res, result);
};

export const deleteAddress = async (req: Request, res: Response) => {
  const result = await addressService.deleteAddress(String(req.params.id), req.user!.userId);
  sendSuccess(res, result);
};

export const getById = async (req: Request, res: Response) => {
  const result = await addressService.getById(String(req.params.id), req.user!.userId);
  sendSuccess(res, result);
};

export const getAll = async (req: Request, res: Response) => {
  const result = await addressService.getByUser(req.user!.userId);
  sendSuccess(res, result);
};
