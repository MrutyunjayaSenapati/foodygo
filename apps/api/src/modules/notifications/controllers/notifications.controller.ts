import type { Request, Response } from "express";
import * as notificationService from "../services/notifications.service";
import { sendSuccess } from "../../../utils/response";
import { sendPaginated } from "../../../utils/response";

export const listNotifications = async (req: Request, res: Response) => {
  const result = await notificationService.list(req.user!.userId, {
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
  });
  sendPaginated(res, result.data, result);
};

export const markAsRead = async (req: Request, res: Response) => {
  const result = await notificationService.markAsRead(
    String(req.params.id),
    req.user!.userId,
  );
  sendSuccess(res, result);
};

export const markAllAsRead = async (req: Request, res: Response) => {
  const result = await notificationService.markAllAsRead(req.user!.userId);
  sendSuccess(res, result);
};

export const deleteNotification = async (req: Request, res: Response) => {
  const result = await notificationService.deleteNotification(
    String(req.params.id),
    req.user!.userId,
  );
  sendSuccess(res, result);
};

export const getUnreadCount = async (req: Request, res: Response) => {
  const result = await notificationService.countUnread(req.user!.userId);
  sendSuccess(res, result);
};
