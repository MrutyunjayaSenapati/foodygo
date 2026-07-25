import * as userRepository from "../repositories/users.repository";
import { AppError } from "../../../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";
import type { UpdateUserDTO } from "@foodygo/shared-types";

export async function getProfile(userId: string) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(ErrorCode.NOT_FOUND, "User not found");
  }
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl ?? null,
    status: user.status,
    createdAt: user.createdAt,
  };
}

export async function updateProfile(userId: string, dto: UpdateUserDTO) {
  const user = await userRepository.update(userId, dto);
  if (!user) {
    throw new AppError(ErrorCode.NOT_FOUND, "User not found");
  }
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl ?? null,
    status: user.status,
  };
}

export async function updateFcmToken(userId: string, fcmToken: string) {
  const user = await userRepository.updateFcmToken(userId, fcmToken);
  if (!user) {
    throw new AppError(ErrorCode.NOT_FOUND, "User not found");
  }
  return { success: true };
}

export async function updateUserStatus(userId: string, status: string) {
  const user = await userRepository.updateStatus(userId, status);
  if (!user) {
    throw new AppError(ErrorCode.NOT_FOUND, "User not found");
  }
  return user;
}

export async function listUsers(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  role?: string;
}) {
  return userRepository.list(params);
}
