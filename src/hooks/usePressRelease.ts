import { useApiQuery, useApiMutation } from './useApi';
import type { PaginatedData, ApiResult } from '@vsaas/types';

const KEYS = { all: ['press-releases'] as const, detail: (id: string) => ['press-releases', id] as const };

export function usePressReleaseList(params?: Record<string, string | number | boolean | undefined>) {
  return useApiQuery<ApiResult<PaginatedData<any>>>(KEYS.all as unknown as string[], '/api/v1/press-releases', params);
}

export function usePressReleaseDetail(id: string) {
  return useApiQuery<ApiResult<any>>(KEYS.detail(id) as unknown as string[], `/api/v1/press-releases/${id}`, undefined, { enabled: !!id });
}

export function useCreatePressRelease() {
  return useApiMutation<ApiResult<any>, Record<string, unknown>>('post', '/api/v1/press-releases', {
    invalidateKeys: [KEYS.all as unknown as string[]],
  });
}

export function useUpdatePressRelease() {
  return useApiMutation<ApiResult<any>, { id: string } & Record<string, unknown>>(
    'patch',
    (vars) => `/api/v1/press-releases/${vars.id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]] },
  );
}

export function useDeletePressRelease() {
  return useApiMutation<void, string>(
    'delete',
    (id) => `/api/v1/press-releases/${id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]] },
  );
}
