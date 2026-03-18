import { ENV } from '../../config/env';

const BASE_URL = ENV.API_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isUnauthorized() { return this.status === 401; }
  get isForbidden() { return this.status === 403; }
  get isNotFound() { return this.status === 404; }
  get isValidation() { return this.status === 422; }
  get isRateLimit() { return this.status === 429; }
  get isServer() { return this.status >= 500; }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  _retry?: boolean;
}

export function buildUrl(path: string, params?: RequestOptions['params']): string {
  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    if (qs) url += `?${qs}`;
  }
  return url;
}

export async function baseRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, _retry, ...init } = options;

  const url = buildUrl(path, params);

  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(
      body?.error?.message || body?.message || 'Request failed',
      res.status,
      body?.error?.code,
      body?.error?.details,
    );
  }

  return res.json();
}
