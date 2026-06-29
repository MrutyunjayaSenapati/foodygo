import { API_PREFIX } from "@foodygo/shared-constants";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta?: { page: number; pageSize: number; total: number };
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
  cache?: RequestCache;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

function buildUrl(base: string, path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${base}${API_PREFIX}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

async function request<T>(
  baseUrl: string,
  path: string,
  method: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const url = buildUrl(baseUrl, path, options?.params);
  const res = await fetch(url, {
    method,
    headers: { ...DEFAULT_HEADERS, ...options?.headers },
    body: body ? JSON.stringify(body) : undefined,
    signal: options?.signal,
    cache: options?.cache,
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.success) {
    throw new ApiError(
      res.status,
      json.error?.code ?? "UNKNOWN",
      json.error?.message ?? `Request failed with status ${res.status}`,
    );
  }

  return json.data as T;
}

export function createApiClient(baseUrl: string) {
  return {
    get<T>(path: string, options?: RequestOptions) {
      return request<T>(baseUrl, path, "GET", undefined, options);
    },
    post<T>(path: string, body?: unknown, options?: RequestOptions) {
      return request<T>(baseUrl, path, "POST", body, options);
    },
    put<T>(path: string, body?: unknown, options?: RequestOptions) {
      return request<T>(baseUrl, path, "PUT", body, options);
    },
    patch<T>(path: string, body?: unknown, options?: RequestOptions) {
      return request<T>(baseUrl, path, "PATCH", body, options);
    },
    delete<T>(path: string, options?: RequestOptions) {
      return request<T>(baseUrl, path, "DELETE", undefined, options);
    },
  };
}
