import type { Request, Response } from "express";
import * as userService from "../services/users.service";
import { sendSuccess } from "../../../utils/response";

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.params.id ? String(req.params.id) : req.user!.userId;
  const result = await userService.getProfile(userId);
  sendSuccess(res, result);
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.params.id ? String(req.params.id) : req.user!.userId;
  const result = await userService.updateProfile(userId, req.body);
  sendSuccess(res, result);
};

export const updateStatus = async (req: Request, res: Response) => {
  const result = await userService.updateUserStatus(String(req.params.id), req.body.status);
  sendSuccess(res, result);
};

export const updateFcmToken = async (req: Request, res: Response) => {
  const result = await userService.updateFcmToken(req.user!.userId, req.body.fcmToken);
  sendSuccess(res, result);
};

export const listUsers = async (req: Request, res: Response) => {
  const params = req.query as { page?: string; pageSize?: string; search?: string; status?: string };
  const result = await userService.listUsers({
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 10,
    search: params.search,
    status: params.status,
  });
  sendSuccess(res, result.data);
};
