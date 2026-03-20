import { useApiQuery, useApiMutation } from './useApi';
import type { PaginatedData, ApiResult, Clipping } from '@vsaas/types';

const KEYS = { all: ['clippings'] as const, detail: (id: string) => ['clippings', id] as const };

export function useClippingList(params?: Record<string, string | number | boolean | undefined>) {
  return useApiQuery<ApiResult<PaginatedData<Clipping>>>(KEYS.all as unknown as string[], '/api/v1/clippings', params);
}

export function useClippingDetail(id: string) {
  return useApiQuery<ApiResult<Clipping>>(KEYS.detail(id) as unknown as string[], `/api/v1/clippings/${id}`, undefined, { enabled: !!id });
}

export function useCreateClipping() {
  return useApiMutation<ApiResult<Clipping>, Record<string, unknown>>('post', '/api/v1/clippings', {
    invalidateKeys: [KEYS.all as unknown as string[]],
  });
}

export function useUpdateClipping() {
  return useApiMutation<ApiResult<Clipping>, { id: string } & Record<string, unknown>>(
    'patch',
    (vars) => `/api/v1/clippings/${vars.id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]], invalidateKeysFn: (vars) => [KEYS.detail(vars.id) as unknown as string[]] },
  );
}

export function useDeleteClipping() {
  return useApiMutation<void, string>(
    'delete',
    (id) => `/api/v1/clippings/${id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]], invalidateKeysFn: (id) => [KEYS.detail(id) as unknown as string[]] },
  );
}
