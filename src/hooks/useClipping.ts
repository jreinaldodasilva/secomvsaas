import { useApiQuery, useApiMutation } from './useApi';
import type { PaginatedData, ApiResult } from '@vsaas/types';

const KEYS = { all: ['clippings'] as const, detail: (id: string) => ['clippings', id] as const };

export function useClippingList(params?: Record<string, string | number | boolean | undefined>) {
  return useApiQuery<ApiResult<PaginatedData<any>>>(KEYS.all as unknown as string[], '/api/v1/clippings', params);
}

export function useClippingDetail(id: string) {
  return useApiQuery<ApiResult<any>>(KEYS.detail(id) as unknown as string[], `/api/v1/clippings/${id}`, undefined, { enabled: !!id });
}

export function useCreateClipping() {
  return useApiMutation<ApiResult<any>, Record<string, unknown>>('post', '/api/v1/clippings', {
    invalidateKeys: [KEYS.all as unknown as string[]],
  });
}

export function useUpdateClipping() {
  return useApiMutation<ApiResult<any>, { id: string } & Record<string, unknown>>(
    'patch',
    (vars) => `/api/v1/clippings/${vars.id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]] },
  );
}

export function useDeleteClipping() {
  return useApiMutation<void, string>(
    'delete',
    (id) => `/api/v1/clippings/${id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]] },
  );
}
