import jwt from "jsonwebtoken";
import argon2 from "argon2";
import crypto from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../../lib/env";
import { db } from "../../../lib/db";
import { users } from "../../../db/schema/users";
import { userRoles } from "../../../db/schema/user-roles";
import { eq } from "drizzle-orm";
import { AppError } from "../../../utils/errors";
import { ErrorCode, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY_SECONDS } from "@foodygo/shared-constants";
import { Role } from "@foodygo/shared-types";
import * as authRepository from "../repositories/auth.repository";
import * as roleRepository from "../repositories/role.repository";
import * as refreshTokenRepository from "../repositories/refresh-token.repository";
import type { RegisterDTO, LoginDTO, TokenPair, GoogleLoginDTO } from "../types";

function generateTokens(userId: string, roleNames: string[]): TokenPair {
  const accessToken = jwt.sign({ userId, roles: roleNames }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRY_SECONDS}s`,
  });

  return { accessToken, refreshToken };
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export { hashToken };

export async function register(dto: RegisterDTO) {
  const existing = await authRepository.findByEmail(dto.email);
  if (existing) {
    throw new AppError(ErrorCode.EMAIL_ALREADY_EXISTS);
  }

  const passwordHash = await argon2.hash(dto.password);

  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
      })
      .returning();

    if (!user) {
      throw new AppError(ErrorCode.INTERNAL_ERROR, "Failed to create user");
    }

    const customerRole = await roleRepository.findRoleIdByName(Role.CUSTOMER, tx);
    if (customerRole) {
      await tx.insert(userRoles).values({ userId: user.id, roleId: customerRole.id });
    }

    const roleNames = await roleRepository.getRoleNames(user.id, tx);
    const tokens = generateTokens(user.id, roleNames);
    const tokenHash = hashToken(tokens.refreshToken);
    await refreshTokenRepository.createToken(user.id, tokenHash, undefined, tx);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl ?? null,
        roles: roleNames,
      },
      tokens,
    };
  });
}

export async function login(dto: LoginDTO) {
  const user = await authRepository.findByEmail(dto.email);
  if (!user) {
    throw new AppError(ErrorCode.INVALID_CREDENTIALS);
  }

  const valid = await argon2.verify(user.passwordHash, dto.password);
  if (!valid) {
    throw new AppError(ErrorCode.INVALID_CREDENTIALS);
  }

  const roleNames = await roleRepository.getRoleNames(user.id);
  const tokens = generateTokens(user.id, roleNames);
  const tokenHash = hashToken(tokens.refreshToken);
  await refreshTokenRepository.revokeAllUserTokens(user.id);
  await refreshTokenRepository.createToken(user.id, tokenHash);

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl ?? null,
      roles: roleNames,
    },
    tokens,
  };
}

export async function refresh(refreshToken: string) {
  let payload: { userId: string };
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
  } catch {
    throw new AppError(ErrorCode.TOKEN_EXPIRED);
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await refreshTokenRepository.findByHash(tokenHash);
  if (!storedToken) {
    throw new AppError(ErrorCode.TOKEN_EXPIRED);
  }

  const user = await authRepository.findById(payload.userId);
  if (!user) {
    throw new AppError(ErrorCode.UNAUTHORIZED);
  }

  const roleNames = await roleRepository.getRoleNames(user.id);
  const tokens = generateTokens(user.id, roleNames);
  const newTokenHash = hashToken(tokens.refreshToken);

  await refreshTokenRepository.revokeToken(tokenHash);
  await refreshTokenRepository.createToken(user.id, newTokenHash);

  return { tokens };
}

export async function logout(userId: string) {
  await refreshTokenRepository.revokeAllUserTokens(userId);
}

export async function googleLogin(dto: GoogleLoginDTO) {
  const CLIENT_ID = env.GOOGLE_CLIENT_ID ?? "";
  if (!CLIENT_ID) {
    throw new AppError(ErrorCode.INTERNAL_ERROR, "Google OAuth not configured");
  }
  const client = new OAuth2Client(CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken: dto.idToken,
    audience: CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Invalid Google token");
  }

  let user = await authRepository.findByEmail(payload.email);

  if (!user) {
    const passwordHash = await argon2.hash(crypto.randomUUID());

    const [createdUser] = await db.transaction(async (tx) => {
      const [insertedUser] = await tx
        .insert(users)
        .values({
          email: payload.email!,
          passwordHash,
          fullName: payload.name ?? payload.email!,
        })
        .returning();

      if (!insertedUser) {
        throw new AppError(ErrorCode.INTERNAL_ERROR, "Failed to create user");
      }

      const customerRole = await roleRepository.findRoleIdByName(Role.CUSTOMER, tx);
      if (customerRole) {
        await tx.insert(userRoles).values({ userId: insertedUser.id, roleId: customerRole.id });
      }

      if (payload.picture) {
        await tx
          .update(users)
          .set({ avatarUrl: payload.picture })
          .where(eq(users.id, insertedUser.id));
      }

      return [insertedUser];
    });

    if (!createdUser) {
      throw new AppError(ErrorCode.INTERNAL_ERROR, "Failed to create user");
    }
    user = createdUser;
  }

  const roleNames = await roleRepository.getRoleNames(user.id);
  const tokens = generateTokens(user.id, roleNames);
  const tokenHash = hashToken(tokens.refreshToken);
  await refreshTokenRepository.revokeAllUserTokens(user.id);
  await refreshTokenRepository.createToken(user.id, tokenHash);

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl ?? null,
      roles: roleNames,
    },
    tokens,
  };
}
