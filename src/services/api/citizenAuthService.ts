import { http } from '@/services/http';
import type { CitizenUser } from '@vsaas/types';
import type { ApiResult, PaginatedData } from '@vsaas/types';

export const citizenAuthService = {
  register: (data: { name: string; email: string; password: string }) =>
    http.post<{ success: true; data: { user: CitizenUser; expiresIn: string } }>('/api/v1/citizen-auth/register', data),

  login: (data: { email: string; password: string }) =>
    http.post<{ success: true; data: { user: CitizenUser; expiresIn: string } }>('/api/v1/citizen-auth/login', data),

  logout: () => http.post('/api/v1/citizen-auth/logout'),

  me: () => http.get<{ success: true; data: CitizenUser }>('/api/v1/citizen-auth/me'),

  refresh: () => http.post<{ success: true; data: { expiresIn: string } }>('/api/v1/citizen-auth/refresh'),

  updateProfile: (data: { name?: string; email?: string }) =>
    http.patch<{ success: true; data: CitizenUser }>('/api/v1/citizen-auth/profile', data),

  myAppointments: (params?: Record<string, string | number | undefined>) =>
    http.get<ApiResult<PaginatedData<any>>>('/api/v1/citizen-auth/appointments', params),
};
