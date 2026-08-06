import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { tokenStorage } from "./tokenStorage";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
});

// --- Attach the access token to every outgoing request ---
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// --- On a 401, refresh the access token once and retry queued requests ---
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isUnauthorized = error.response?.status === 401;
    // Only these endpoints should be excluded from refresh-retry (calling
    // refresh again on a failed refresh, or on login, would loop/make no sense).
    // Don't blanket-match "/auth/" — /auth/my-profile needs refresh-retry too.
    const NO_RETRY_ENDPOINTS = ["/auth/login", "/auth/token-refresh", "/auth/logout"];
    const isNoRetryEndpoint = NO_RETRY_ENDPOINTS.some((path) =>
      originalRequest?.url?.includes(path),
    );

    if (!isUnauthorized || !originalRequest || originalRequest._retry || isNoRetryEndpoint) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) {
      tokenStorage.clear();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If a refresh is already in flight, wait for it instead of firing a second one
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((newToken) => {
          if (!newToken) return reject(error);
          originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post<{ access: string }>(
        `${apiClient.defaults.baseURL}/auth/token-refresh`,
        { refresh: refreshToken },
      );
      tokenStorage.setAccess(data.access);
      resolveQueue(data.access);
      originalRequest.headers.set("Authorization", `Bearer ${data.access}`);
      return apiClient(originalRequest as AxiosRequestConfig);
    } catch (refreshError) {
      tokenStorage.clear();
      resolveQueue(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);