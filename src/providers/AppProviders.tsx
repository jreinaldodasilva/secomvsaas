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
 * Cold-load optimisation (P1-4):
 *   On cold load, only the portal-appropriate /me call is fired.
 *   - Citizen portal paths (/portal/*) skip AuthProvider's /me.
 *   - All other paths skip CitizenAuthProvider's /me.
 *   Both contexts remain fully functional after their initial load.
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

const isCitizenPortal = window.location.pathname.startsWith('/portal');

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AuthProvider skip={isCitizenPortal}>
          <CitizenAuthProvider skip={!isCitizenPortal}>
            <TenantProvider>
              {children}
            </TenantProvider>
          </CitizenAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryProvider>
  );
}
