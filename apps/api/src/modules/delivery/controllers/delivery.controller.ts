import type { Request, Response } from "express";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../../../lib/env";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY_SECONDS } from "@foodygo/shared-constants";
import * as deliveryService from "../services/delivery.service";
import * as refreshTokenRepository from "../../auth/repositories/refresh-token.repository";
import { sendSuccess, sendPaginated } from "../../../utils/response";

export const registerPartner = async (req: Request, res: Response) => {
  const { partner, user, roleNames } = await deliveryService.registerPartner(req.user!.userId, req.body);

  const accessToken = jwt.sign({ userId: user.id, roles: roleNames }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
  const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRY_SECONDS}s`,
  });

  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  await refreshTokenRepository.createToken(user.id, tokenHash);

  sendSuccess(res, {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl ?? null,
      roles: roleNames,
    },
    tokens: { accessToken, refreshToken },
  }, 201);
};

export const updatePartner = async (req: Request, res: Response) => {
  const result = await deliveryService.updatePartner(String(req.params.id), req.body);
  sendSuccess(res, result);
};

export const getMyProfile = async (req: Request, res: Response) => {
  const result = await deliveryService.getMyProfile(req.user!.userId);
  sendSuccess(res, result);
};

export const getAvailableDeliveries = async (_req: Request, res: Response) => {
  const result = await deliveryService.getAvailableDeliveries();
  sendSuccess(res, result);
};

export const getAssignmentById = async (req: Request, res: Response) => {
  const result = await deliveryService.getAssignmentById(String(req.params.id), req.user!.userId);
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

export const getMyStats = async (req: Request, res: Response) => {
  const result = await deliveryService.getMyStats(req.user!.userId);
  sendSuccess(res, result);
};

export const getMyAssignments = async (req: Request, res: Response) => {
  const result = await deliveryService.getMyAssignments(req.user!.userId);
  sendSuccess(res, result);
};

export const getDeliveryByOrder = async (req: Request, res: Response) => {
  const result = await deliveryService.getDeliveryByOrder(String(req.params.orderId));
  sendSuccess(res, result);
};

export const listPartners = async (req: Request, res: Response) => {
  const result = await deliveryService.listPartners({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
  });
  sendPaginated(res, result.data, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
};

export const listAssignments = async (req: Request, res: Response) => {
  const result = await deliveryService.listAssignments({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
  });
  sendPaginated(res, result.data, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
};
