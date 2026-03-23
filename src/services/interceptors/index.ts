import { ENV } from '@/config/env';
import { baseRequest } from '@/services/base';
import type { RequestOptions } from '@/services/base';

const BASE_URL = ENV.API_URL;

let refreshPromise: Promise<void> | null = null;
let csrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/csrf-token`, { credentials: 'include' });
  const data = await res.json();
  csrfToken = data.csrfToken;
  return csrfToken!;
}

async function getCsrfToken(): Promise<string> {
  return csrfToken ?? fetchCsrfToken();
}

const CSRF_SKIP = ['/api/v1/auth/', '/api/v1/citizen-auth/login', '/api/v1/citizen-auth/register',
  '/api/v1/citizen-auth/refresh', '/api/v1/citizen-auth/logout', '/api/csrf-token'];

function needsCsrf(path: string, method?: string): boolean {
  if (!method || method === 'GET' || method === 'HEAD') return false;
  return !CSRF_SKIP.some(skip => path.includes(skip));
}

async function refreshToken(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Refresh failed');
}

export async function withRefreshInterceptor<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  if (needsCsrf(path, options.method)) {
    const token = await getCsrfToken();
    options = { ...options, headers: { 'X-CSRF-Token': token, ...options.headers } };
  }

  try {
    return await baseRequest<T>(path, options);
  } catch (err: any) {
    if (err?.status === 403 && (err?.code === 'INVALID_CSRF_TOKEN' || err?.message?.includes('CSRF'))) {
      csrfToken = null;
      const token = await fetchCsrfToken();
      options = { ...options, headers: { 'X-CSRF-Token': token, ...options.headers } };
      return baseRequest<T>(path, options);
    }
    if (err?.status === 401 && !options._retry && !path.includes('/auth/')) {
      if (!refreshPromise) {
        refreshPromise = refreshToken().finally(() => { refreshPromise = null; });
      }
      try {
        await refreshPromise;
        return baseRequest<T>(path, { ...options, _retry: true });
      } catch {
        // Refresh failed — session is unrecoverable; signal auth contexts to logout
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
    }
    throw err;
  }
}
