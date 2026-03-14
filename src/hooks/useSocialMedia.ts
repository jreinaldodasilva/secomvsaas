import { useApiQuery, useApiMutation } from './useApi';
import type { PaginatedData, ApiResult } from '@vsaas/types';

const KEYS = { all: ['social-media'] as const, detail: (id: string) => ['social-media', id] as const };

export function useSocialMediaList(params?: Record<string, string | number | boolean | undefined>) {
  return useApiQuery<ApiResult<PaginatedData<any>>>(KEYS.all as unknown as string[], '/api/v1/social-media', params);
}

export function useSocialMediaDetail(id: string) {
  return useApiQuery<ApiResult<any>>(KEYS.detail(id) as unknown as string[], `/api/v1/social-media/${id}`, undefined, { enabled: !!id });
}

export function useCreateSocialMedia() {
  return useApiMutation<ApiResult<any>, Record<string, unknown>>('post', '/api/v1/social-media', {
    invalidateKeys: [KEYS.all as unknown as string[]],
  });
}

export function useUpdateSocialMedia() {
  return useApiMutation<ApiResult<any>, { id: string } & Record<string, unknown>>(
    'patch',
    (vars) => `/api/v1/social-media/${vars.id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]] },
  );
}

export function useDeleteSocialMedia() {
  return useApiMutation<void, string>(
    'delete',
    (id) => `/api/v1/social-media/${id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]] },
  );
}
