import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Tenant } from '@vsaas/types';
import { http } from '../services/http';
import { useAuth, AuthContext } from './AuthContext';

interface TenantContextValue {
  tenant: Tenant | null;
  isLoading: boolean;
  refreshTenant: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  if (import.meta.env.DEV && !useContext(AuthContext)) {
    throw new Error(
      '[TenantProvider] Must be rendered inside <AuthProvider>. ' +
      'Check AppProviders — TenantProvider must be nested within AuthProvider. ' +
      'See docs/frontend/02-Secom-Frontend-Architecture-Overview-Part2.md §5.1',
    );
  }

  const { isAuthenticated, user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshTenant = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await http.get<{ success: true; data: Tenant }>('/api/v1/tenants/me');
      setTenant(res.data);
    } catch {
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.tenantId) {
      refreshTenant();
    } else {
      setTenant(null);
    }
  }, [isAuthenticated, user?.tenantId, refreshTenant]);

  const hasFeature = useCallback(
    (feature: string) => !!tenant?.settings?.features?.[feature],
    [tenant],
  );

  return (
    <TenantContext.Provider value={{ tenant, isLoading, refreshTenant, hasFeature }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}
