import React, { createContext, useContext, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Tenant } from '@vsaas/types';
import { tenantService } from '../services/api/tenantService';
import { useAuth, AuthContext } from './AuthContext';

export const TENANT_QUERY_KEY = ['tenant', 'me'] as const;

interface TenantContextValue {
  tenant: Tenant | null;
  isLoading: boolean;
  refreshTenant: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  if (import.meta.env.DEV && !useContext(AuthContext)) { // eslint-disable-line react-hooks/rules-of-hooks
    throw new Error(
      '[TenantProvider] Must be rendered inside <AuthProvider>. ' +
      'Check AppProviders — TenantProvider must be nested within AuthProvider. ' +
      'See docs/frontend/02-Secom-Frontend-Architecture-Overview-Part2.md §5.1',
    );
  }

  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: TENANT_QUERY_KEY,
    queryFn: () => tenantService.getMe(),
    enabled: isAuthenticated && !!user?.tenantId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const tenant = data?.data ?? null;

  const refreshTenant = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEY });
  }, [queryClient]);

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
