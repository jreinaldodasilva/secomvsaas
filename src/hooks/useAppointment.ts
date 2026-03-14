import { useApiQuery, useApiMutation } from './useApi';
import type { PaginatedData, ApiResult, Appointment } from '@vsaas/types';

const KEYS = { all: ['appointments'] as const, detail: (id: string) => ['appointments', id] as const };

export function useAppointmentList(params?: Record<string, string | number | boolean | undefined>) {
  return useApiQuery<ApiResult<PaginatedData<Appointment>>>(KEYS.all as unknown as string[], '/api/v1/appointments', params);
}

export function useAppointmentDetail(id: string) {
  return useApiQuery<ApiResult<Appointment>>(KEYS.detail(id) as unknown as string[], `/api/v1/appointments/${id}`, undefined, { enabled: !!id });
}

export function useCreateAppointment() {
  return useApiMutation<ApiResult<Appointment>, Record<string, unknown>>('post', '/api/v1/appointments', {
    invalidateKeys: [KEYS.all as unknown as string[]],
  });
}

export function useUpdateAppointment() {
  return useApiMutation<ApiResult<Appointment>, { id: string } & Record<string, unknown>>(
    'patch',
    (vars) => `/api/v1/appointments/${vars.id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]] },
  );
}

export function useDeleteAppointment() {
  return useApiMutation<void, string>(
    'delete',
    (id) => `/api/v1/appointments/${id}`,
    { invalidateKeys: [KEYS.all as unknown as string[]] },
  );
}
