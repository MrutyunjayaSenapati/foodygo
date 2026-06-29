import * as notificationRepository from "../repositories/notifications.repository";
import { AppError } from "../../../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";
import { sendPushNotificationToUser } from "../../../lib/fcm";

export async function list(
  userId: string,
  params: { page: number; pageSize: number },
) {
  const [data, total] = await Promise.all([
    notificationRepository.findByUserId(userId, params.page, params.pageSize),
    notificationRepository.countByUserId(userId),
  ]);
  return { data, total, page: params.page, pageSize: params.pageSize };
}

export async function markAsRead(id: string, userId: string) {
  const notification = await notificationRepository.markAsRead(id, userId);
  if (!notification) {
    throw new AppError(ErrorCode.NOT_FOUND, "Notification not found");
  }
  return notification;
}

export async function markAllAsRead(userId: string) {
  return notificationRepository.markAllAsRead(userId);
}

export async function deleteNotification(id: string, userId: string) {
  const notification = await notificationRepository.deleteNotification(id, userId);
  if (!notification) {
    throw new AppError(ErrorCode.NOT_FOUND, "Notification not found");
  }
  return notification;
}

export async function create(userId: string, title: string, body?: string) {
  const notification = await notificationRepository.create(userId, title, body);
  sendPushNotificationToUser(userId, title, body).catch(() => {});
  return notification;
}

export async function countUnread(userId: string) {
  const count = await notificationRepository.countUnreadByUserId(userId);
  return { count };
}
