import axios from "axios";
import { router } from "expo-router";
import { useAuthStore } from "../store/auth-store";
import type { ApiEnvelope } from "../types";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  pendingRequests.forEach((req) => {
    if (error) {
      req.reject(error);
    } else {
      req.resolve(token!);
    }
  });
  pendingRequests = [];
}

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      const status = error.response?.status ?? "NETWORK_ERROR";
      const msg = error.response?.data?.error?.message ?? error.message ?? "Unknown error";
      console.warn(`[API] Error ${status} ${originalRequest.url}: ${msg}`);
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      useAuthStore.getState().clearAuth();
      router.replace("/(auth)/login");
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) throw new Error("No refresh token");

      const res = await apiClient.post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
        "/auth/refresh",
        { refreshToken },
      );

      const { accessToken, refreshToken: newRefreshToken } = res.data.data;
      useAuthStore.getState().setTokens(accessToken, newRefreshToken);

      processQueue(null, accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      router.replace("/(auth)/login");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>) {
  const res = await apiClient.get<ApiEnvelope<T>>(path, { params });
  return res.data.data;
}

export async function apiPost<T>(path: string, body?: unknown) {
  const res = await apiClient.post<ApiEnvelope<T>>(path, body);
  return res.data.data;
}

export async function apiPatch<T>(path: string, body?: unknown) {
  const res = await apiClient.patch<ApiEnvelope<T>>(path, body);
  return res.data.data;
}

export async function apiDelete<T = void>(path: string) {
  const res = await apiClient.delete<ApiEnvelope<T>>(path);
  return res.data.data;
}

export async function apiGetPaginated<T>(
  path: string,
  params?: Record<string, string | number | undefined> & { page?: number; pageSize?: number },
) {
  const res = await apiClient.get<ApiEnvelope<T[]>>(path, { params });
  return {
    items: res.data.data,
    page: res.data.meta?.page ?? 1,
    pageSize: res.data.meta?.pageSize ?? 10,
    total: res.data.meta?.total ?? 0,
    totalPages: res.data.meta?.totalPages ?? 0,
  };
}
