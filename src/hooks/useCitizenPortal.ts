import { useApiQuery, useApiMutation } from './useApi';
import type { PaginatedData, ApiResult } from '@vsaas/types';

const KEYS = { all: ['citizen-portal'] as const, detail: (id: string) => ['citizen-portal', id] as const };

export function useCitizenPortalList(params?: Record<string, string | number | boolean | undefined>) {
  return useApiQuery<ApiResult<PaginatedData<any>>>(KEYS.all as unknown as string[], '/api/v1/citizen-portal', params);
}

export function useCitizenPortalDetail(id: string) {
  return useApiQuery<ApiResult<any>>(KEYS.detail(id) as unknown as string[], `/api/v1/citizen-portal/${id}`, undefined, { enabled: !!id });
}

export function useCreateCitizenPortal() {
  return useApiMutation<ApiResult<any>, Record<string, unknown>>('post', '/api/v1/citizen-portal', {
    invalidateKeys: [KEYS.all as unknown as string[]],
  });
}

export function useUpdateCitizenPortal() {
  return useApiMutation<ApiResult<any>, { id: string } & Record<string, unknown>>(
    'patch',
    (vars) => `/api/v1/citizen-portal/${vars.id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]] },
  );
}

export function useDeleteCitizenPortal() {
  return useApiMutation<void, string>(
    'delete',
    (id) => `/api/v1/citizen-portal/${id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]] },
  );
}
