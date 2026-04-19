import Constants from 'expo-constants';
import { AuthStore, createApi, createEndpoints } from '@stocktrace/core';
import { asyncStorage } from './storage';

const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };
export const baseUrl = extra.apiBaseUrl ?? 'http://localhost:8080';

export const authStore = new AuthStore(asyncStorage);
const { axios, onUnauthorized } = createApi({ baseUrl, authStore });

export const endpoints = createEndpoints(axios);
export { onUnauthorized };
