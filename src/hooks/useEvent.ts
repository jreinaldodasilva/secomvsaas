import { useApiQuery, useApiMutation } from './useApi';
import type { PaginatedData, ApiResult, Event } from '@vsaas/types';

const KEYS = { all: ['events'] as const, detail: (id: string) => ['events', id] as const };

export function useEventList(params?: Record<string, string | number | boolean | undefined>) {
  return useApiQuery<ApiResult<PaginatedData<Event>>>(KEYS.all as unknown as string[], '/api/v1/events', params);
}

export function useEventDetail(id: string) {
  return useApiQuery<ApiResult<Event>>(KEYS.detail(id) as unknown as string[], `/api/v1/events/${id}`, undefined, { enabled: !!id });
}

export function useCreateEvent() {
  return useApiMutation<ApiResult<Event>, Record<string, unknown>>('post', '/api/v1/events', {
    invalidateKeys: [KEYS.all as unknown as string[]],
  });
}

export function useUpdateEvent() {
  return useApiMutation<ApiResult<Event>, { id: string } & Record<string, unknown>>(
    'patch',
    (vars) => `/api/v1/events/${vars.id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]], invalidateKeysFn: (vars) => [KEYS.detail(vars.id) as unknown as string[]] },
  );
}

export function useDeleteEvent() {
  return useApiMutation<void, string>(
    'delete',
    (id) => `/api/v1/events/${id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]], invalidateKeysFn: (id) => [KEYS.detail(id) as unknown as string[]] },
  );
}
