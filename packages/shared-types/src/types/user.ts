import { UserStatus } from "../enums";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  avatarUrl: string | null;
  status: UserStatus;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  fullName: string;
}

export interface UpdateUserDTO {
  fullName?: string;
  avatarUrl?: string | null;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  status: UserStatus;
  createdAt: Date;
}
