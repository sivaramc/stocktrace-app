import { AuthStore, createApi, createEndpoints } from '@stocktrace/core';
import { webStorage } from './webStorage';

const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export const authStore = new AuthStore(webStorage);
const { axios, onUnauthorized } = createApi({ baseUrl, authStore });

export const endpoints = createEndpoints(axios);
export { onUnauthorized, baseUrl };
