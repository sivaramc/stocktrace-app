import Constants from 'expo-constants';
import { AuthStore, createApi, createEndpoints } from '@stocktrace/core';
import { asyncStorage } from './storage';

// Base URL resolution order:
//   1. EXPO_PUBLIC_API_BASE_URL env var (inlined at build time by Expo/Metro).
//   2. expoConfig.extra.apiBaseUrl (overridable from eas.json per-profile).
//   3. localhost fallback for `expo start` on a dev machine.
const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };
export const baseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  extra.apiBaseUrl ??
  'http://localhost:8080';

export const authStore = new AuthStore(asyncStorage);
const { axios, onUnauthorized } = createApi({ baseUrl, authStore });

export const endpoints = createEndpoints(axios);
export { onUnauthorized };
