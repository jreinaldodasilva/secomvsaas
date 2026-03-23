import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCitizenAuth } from '@/contexts';
import { Spinner } from '@/components/UI';

export function ProtectedCitizenRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useCitizenAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading-screen"><Spinner size="lg" /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
