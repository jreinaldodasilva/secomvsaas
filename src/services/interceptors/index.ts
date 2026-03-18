import { ENV } from '@/config/env';
import { baseRequest } from '@/services/base';
import type { RequestOptions } from '@/services/base';

const BASE_URL = ENV.API_URL;

let refreshPromise: Promise<void> | null = null;

async function refreshToken(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Refresh failed');
}

/**
 * Wraps baseRequest with a 401 → token-refresh → retry interceptor.
 * Auth routes (/auth/) are excluded from the retry cycle to prevent loops.
 * Concurrent 401s share a single refresh attempt via refreshPromise deduplication.
 */
export async function withRefreshInterceptor<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  try {
    return await baseRequest<T>(path, options);
  } catch (err: any) {
    if (err?.status === 401 && !options._retry && !path.includes('/auth/')) {
      if (!refreshPromise) {
        refreshPromise = refreshToken().finally(() => { refreshPromise = null; });
      }
      try {
        await refreshPromise;
        return baseRequest<T>(path, { ...options, _retry: true });
      } catch {
        // Refresh failed — re-throw the original 401
      }
    }
    throw err;
  }
}
