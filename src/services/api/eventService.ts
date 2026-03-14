import { http } from '../http';
import type { ApiResult, PaginatedData } from '@vsaas/types';

const BASE = '/api/v1/events';

export const eventService = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    http.get<ApiResult<PaginatedData<any>>>(BASE, params),

  getById: (id: string) =>
    http.get<ApiResult<any>>(`${BASE}/${id}`),

  create: (data: Record<string, unknown>) =>
    http.post<ApiResult<any>>(BASE, data),

  update: (id: string, data: Record<string, unknown>) =>
    http.patch<ApiResult<any>>(`${BASE}/${id}`, data),

  remove: (id: string) =>
    http.delete<void>(`${BASE}/${id}`),
};
