import type { Request, Response } from "express";
import * as authService from "../services/auth.service";
import * as authRepository from "../repositories/auth.repository";
import * as roleRepository from "../repositories/role.repository";
import { sendSuccess } from "../../../utils/response";
import { AppError } from "../../../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";

export const register = async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  sendSuccess(res, result, 201);
};

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  sendSuccess(res, result);
};

export const googleLogin = async (req: Request, res: Response) => {
  const result = await authService.googleLogin(req.body);
  sendSuccess(res, result);
};

export const refresh = async (req: Request, res: Response) => {
  const result = await authService.refresh(req.body.refreshToken);
  sendSuccess(res, result);
};

export const logout = async (req: Request, res: Response) => {
  await authService.logout(req.user!.userId);
  sendSuccess(res, null);
};

export const registerRestaurant = async (req: Request, res: Response) => {
  const result = await authService.registerRestaurant(req.body);
  sendSuccess(res, result, 201);
};

export const me = async (req: Request, res: Response) => {
  const user = await authRepository.findById(req.user!.userId);
  if (!user) {
    throw new AppError(ErrorCode.NOT_FOUND, "User not found");
  }
  const roleNames = await roleRepository.getRoleNames(user.id);
  sendSuccess(res, {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl ?? null,
    roles: roleNames,
  });
};
