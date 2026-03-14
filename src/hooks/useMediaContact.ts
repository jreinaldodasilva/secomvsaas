import { useApiQuery, useApiMutation } from './useApi';
import type { PaginatedData, ApiResult, MediaContact } from '@vsaas/types';

const KEYS = { all: ['media-contacts'] as const, detail: (id: string) => ['media-contacts', id] as const };

export function useMediaContactList(params?: Record<string, string | number | boolean | undefined>) {
  return useApiQuery<ApiResult<PaginatedData<MediaContact>>>(KEYS.all as unknown as string[], '/api/v1/media-contacts', params);
}

export function useMediaContactDetail(id: string) {
  return useApiQuery<ApiResult<MediaContact>>(KEYS.detail(id) as unknown as string[], `/api/v1/media-contacts/${id}`, undefined, { enabled: !!id });
}

export function useCreateMediaContact() {
  return useApiMutation<ApiResult<MediaContact>, Record<string, unknown>>('post', '/api/v1/media-contacts', {
    invalidateKeys: [KEYS.all as unknown as string[]],
  });
}

export function useUpdateMediaContact() {
  return useApiMutation<ApiResult<MediaContact>, { id: string } & Record<string, unknown>>(
    'patch',
    (vars) => `/api/v1/media-contacts/${vars.id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]] },
  );
}

export function useDeleteMediaContact() {
  return useApiMutation<void, string>(
    'delete',
    (id) => `/api/v1/media-contacts/${id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]] },
  );
}
