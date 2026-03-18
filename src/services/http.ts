/// <reference types="vite/client" />

export { ApiError } from './base';
import { withRefreshInterceptor } from './interceptors';
import type { RequestOptions } from './base';

export const http = {
  get:    <T>(path: string, params?: RequestOptions['params']) =>
    withRefreshInterceptor<T>(path, { method: 'GET', params }),
  post:   <T>(path: string, body?: unknown) =>
    withRefreshInterceptor<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put:    <T>(path: string, body?: unknown) =>
    withRefreshInterceptor<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch:  <T>(path: string, body?: unknown) =>
    withRefreshInterceptor<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    withRefreshInterceptor<T>(path, { method: 'DELETE' }),
};
