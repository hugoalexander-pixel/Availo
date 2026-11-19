import { getApiBaseUrl } from "../config/api";
import { getAuthToken, clearAuthSession } from "./AuthStorage";
import { logger, generateRequestId } from "../utils/logger";

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message = "Server tidak terjangkau. Pastikan backend aktif dan URL API benar.") {
    super(message);
    this.name = "NetworkError";
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const method = (options.method || "GET").toUpperCase();
  const requestId = generateRequestId();

  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Request-Id": requestId,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const timeoutMs = options.timeoutMs ?? 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  logger.debug("API", `-> ${method} ${endpoint}`, { requestId, method, endpoint });

  const startTime = Date.now();

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;

    logger.info("API", `<- ${method} ${endpoint} [${res.status}] ${durationMs}ms`, {
      requestId,
      method,
      endpoint,
      status: res.status,
      durationMs,
    });

    if (res.status === 401) {
      logger.warn("API", `Sesi kedaluwarsa pada ${endpoint} (401)`, { requestId });
      await clearAuthSession();
      throw new ApiError(
        "Sesi Anda telah berakhir. Silakan login kembali.",
        401
      );
    }

    if (res.status === 204) {
      return {} as T;
    }

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        json?.Message ||
        json?.message ||
        `Permintaan gagal dengan status ${res.status}`;
      logger.warn("API", `API Error ${method} ${endpoint} [${res.status}]: ${message}`, {
        requestId,
        status: res.status,
        message,
      });
      throw new ApiError(message, res.status, json);
    }

    return json as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;

    if (err instanceof ApiError) {
      throw err;
    }

    if (err.name === "AbortError") {
      logger.error("API", `Koneksi timeout pada ${method} ${endpoint} (${durationMs}ms)`, err, {
        requestId,
      });
      throw new NetworkError("Koneksi timeout. Server tidak merespons dalam waktu 10 detik.");
    }

    logger.error("API", `Kegagalan jaringan pada ${method} ${endpoint}: ${err.message}`, err, {
      requestId,
      baseUrl,
    });

    throw new NetworkError(
      "Server tidak dapat dihubungi. Pastikan server backend sedang berjalan di " + baseUrl
    );
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
