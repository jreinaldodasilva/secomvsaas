import { ReactNode } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { hasAnyPermission } from '../../../config/permissions';

interface PermissionGateProps {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ permissions, children, fallback = null }: PermissionGateProps) {
  const { user } = useAuth();
  if (!user || !hasAnyPermission(user.role, permissions)) return <>{fallback}</>;
  return <>{children}</>;
}
