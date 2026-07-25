import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/auth-store";
import apiClient from "../lib/api-client";

interface LoginDTO {
  email: string;
  password: string;
}

interface RegisterDTO {
  email: string;
  password: string;
  fullName: string;
}

interface PartnerRegisterDTO {
  vehicleType: "BIKE" | "SCOOTER" | "CAR";
  licenseNumber: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    roles: string[];
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async (dto: LoginDTO) => {
      const res = await apiClient.post("/auth/login", dto);
      return res.data.data as AuthResponse;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      router.replace("/(tabs)/available");
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async (dto: RegisterDTO) => {
      const res = await apiClient.post("/auth/register", dto);
      return res.data.data as AuthResponse;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      router.replace("/(auth)/partner-register");
    },
  });
}

export function usePartnerRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (dto: PartnerRegisterDTO) => {
      const res = await apiClient.post("/delivery/partners/register", dto);
      return res.data.data as AuthResponse;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      router.replace("/(tabs)/available");
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSuccess: () => {
      clearAuth();
      router.replace("/(auth)/login");
    },
    onError: () => {
      clearAuth();
      router.replace("/(auth)/login");
    },
  });
}
