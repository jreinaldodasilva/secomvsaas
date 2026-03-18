import { http } from '@/services/http';
import type { Tenant } from '@vsaas/types';

export interface TenantResponse {
  success: true;
  data: Tenant;
}

export const tenantService = {
  getMe: () => http.get<TenantResponse>('/api/v1/tenants/me'),
};
