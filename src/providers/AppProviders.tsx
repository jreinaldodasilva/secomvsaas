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
 * Both auth contexts are always active. The cold-load /me skip optimisation
 * (P1-4) was removed because the module-level isCitizenPortal flag was
 * computed once at initial page load and did not update on client-side
 * navigation, causing CitizenAuthProvider to be permanently skipped when
 * the user navigated to /portal/* from the landing page within the same
 * session.
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
