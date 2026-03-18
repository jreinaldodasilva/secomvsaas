/**
 * AppProviders — load-bearing provider composition.
 *
 * Ordering constraints (enforced structurally by this component):
 *   1. QueryProvider must wrap AuthProvider and TenantProvider
 *      (both use TanStack Query internally).
 *   2. BrowserRouter must wrap AuthProvider
 *      (AuthProvider calls useNavigate() on logout).
 *   3. AuthProvider must wrap TenantProvider
 *      (TenantProvider calls useAuth() on mount).
 *   4. CitizenAuthProvider is independent of TenantProvider;
 *      its position between AuthProvider and TenantProvider is arbitrary.
 *
 * See: docs/frontend/02-Secom-Frontend-Architecture-Overview-Part2.md §5.1
 */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from '@/contexts';
import { CitizenAuthProvider } from '@/contexts';
import { TenantProvider } from '@/contexts';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AuthProvider>
          <CitizenAuthProvider>
            <TenantProvider>
              {children}
            </TenantProvider>
          </CitizenAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryProvider>
  );
}
