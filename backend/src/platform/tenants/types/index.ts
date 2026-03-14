export interface CreateTenantDto {
  name: string;
  slug: string;
  domain?: string;
  plan?: 'trial' | 'starter' | 'professional' | 'enterprise';
  ownerEmail: string;
  ownerName: string;
  ownerPassword: string;
}

export interface UpdateTenantDto {
  name?: string;
  domain?: string;
  plan?: 'trial' | 'starter' | 'professional' | 'enterprise';
  settings?: {
    timezone?: string;
    locale?: string;
    currency?: string;
    features?: Record<string, boolean>;
  };
  maxUsers?: number;
}

export interface TenantFilters {
  status?: string;
  plan?: string;
  search?: string;
  page?: number;
  limit?: number;
}
