import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { AuthStore } from './storage';

export interface CreateApiOptions {
  baseUrl: string;
  authStore: AuthStore;
}

export interface StocktraceApi {
  axios: AxiosInstance;
  onUnauthorized: (fn: () => void) => () => void;
}

/**
 * Creates a configured axios instance that:
 *   - prefixes requests with `baseUrl`
 *   - injects `Authorization: Bearer <token>` from the auth store
 *   - clears the auth store and notifies listeners on 401 responses
 */
export function createApi({ baseUrl, authStore }: CreateApiOptions): StocktraceApi {
  const instance = axios.create({ baseURL: baseUrl, withCredentials: false });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = authStore.getToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  });

  const listeners = new Set<() => void>();

  instance.interceptors.response.use(
    (r) => r,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        void authStore.clear();
        listeners.forEach((fn) => fn());
      }
      return Promise.reject(error);
    },
  );

  return {
    axios: instance,
    onUnauthorized(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  errors?: Record<string, string>;
}

export function extractErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.message) return body.message;
    if (body?.error) return body.error;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
