import { http } from '../http';
import type { User, LoginRequest, Tenant, RegisterRequest } from '@vsaas/types';

export const authService = {
  register: (data: RegisterRequest) =>
    http.post<{ success: true; data: { user: User; tenant: Tenant; expiresIn: string } }>('/api/v1/auth/register', data),

  login: (data: LoginRequest) =>
    http.post<{ success: true; data: { user: User; expiresIn: string } }>('/api/v1/auth/login', data),

  logout: () => http.post('/api/v1/auth/logout'),

  logoutAll: () => http.post('/api/v1/auth/logout-all'),

  me: () => http.get<{ success: true; data: User }>('/api/v1/auth/me'),

  refresh: () => http.post<{ success: true; data: { expiresIn: string } }>('/api/v1/auth/refresh'),

  forgotPassword: (email: string) =>
    http.post('/api/v1/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    http.post('/api/v1/auth/reset-password', { token, newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    http.patch('/api/v1/auth/change-password', { currentPassword, newPassword }),
};
