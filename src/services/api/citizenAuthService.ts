import { http } from '@/services/http';

export interface CitizenUser {
  id: string;
  name: string;
  email: string;
  role: 'citizen';
  tenantId?: string;
}

export const citizenAuthService = {
  register: (data: { name: string; email: string; password: string }) =>
    http.post<{ success: true; data: { user: CitizenUser; expiresIn: string } }>('/api/v1/citizen-auth/register', data),

  login: (data: { email: string; password: string }) =>
    http.post<{ success: true; data: { user: CitizenUser; expiresIn: string } }>('/api/v1/citizen-auth/login', data),

  logout: () => http.post('/api/v1/citizen-auth/logout'),

  me: () => http.get<{ success: true; data: CitizenUser }>('/api/v1/citizen-auth/me'),

  refresh: () => http.post<{ success: true; data: { expiresIn: string } }>('/api/v1/citizen-auth/refresh'),
};
