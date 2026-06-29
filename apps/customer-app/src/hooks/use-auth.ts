import { useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import * as Google from "expo-auth-session/providers/google";
import { useAuthStore } from "../store/auth-store";
import { apiPost, apiGet } from "../lib/api-client";
import type { AuthResponse, LoginDTO, RegisterDTO, GoogleLoginDTO, UserResponse } from "../types";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: LoginDTO) => apiPost<AuthResponse>("/auth/login", data),
    onSuccess: (response) => {
      setAuth(response.user, response.tokens.accessToken, response.tokens.refreshToken);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: RegisterDTO) => apiPost<AuthResponse>("/auth/register", data),
    onSuccess: (response) => {
      setAuth(response.user, response.tokens.accessToken, response.tokens.refreshToken);
    },
  });
}

export function useGoogleLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: GoogleLoginDTO) => apiPost<AuthResponse>("/auth/google", data),
    onSuccess: (response) => {
      setAuth(response.user, response.tokens.accessToken, response.tokens.refreshToken);
    },
  });
}

export function useGoogleSignIn() {
  const googleLogin = useGoogleLogin();

  const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: clientId ?? "",
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = (response.params as Record<string, string>).id_token;
      if (idToken) {
        googleLogin.mutate({ idToken });
      }
    }
  }, [response, googleLogin]);

  const signIn = useCallback(async () => {
    if (!clientId) {
      throw new Error("Google sign-in is not configured");
    }
    if (!request) {
      throw new Error("Failed to initialize Google sign-in");
    }
    await promptAsync();
  }, [clientId, request, promptAsync]);

  return {
    signIn,
    isLoading: googleLogin.isPending,
    isConfigured: !!clientId,
  };
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: () => apiPost("/auth/logout"),
    onSuccess: () => clearAuth(),
    onError: () => clearAuth(),
  });
}

export function useMe() {
  return apiGet<UserResponse>("/auth/me");
}
