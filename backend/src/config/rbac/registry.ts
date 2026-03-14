import { PERMISSIONS, Permission } from './permissions';
import { ROLES, UserRole } from './roles';

const P = PERMISSIONS;

// Adjust permission assignments when adding new roles or generated modules.
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS) as Permission[],

  [ROLES.ADMIN]: [
    P.USERS_READ, P.USERS_WRITE,
    P.SETTINGS_READ, P.SETTINGS_WRITE,
    P.REPORTS_READ, P.REPORTS_WRITE,
    P.AUDIT_READ,
    P.TENANTS_READ, P.TENANTS_WRITE,
    // Add domain permissions here after generating modules
  ],

  [ROLES.MANAGER]: [
    P.USERS_READ,
    P.SETTINGS_READ,
    P.REPORTS_READ,
    P.TENANTS_READ,
  ],

  [ROLES.STAFF]: [
    P.REPORTS_READ,
  ],
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  if (role === ROLES.SUPER_ADMIN) return true;
  return (ROLE_PERMISSIONS[role] || []).includes(permission);
};

export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  if (role === ROLES.SUPER_ADMIN) return true;
  return permissions.some(p => hasPermission(role, p));
};

export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  if (role === ROLES.SUPER_ADMIN) return true;
  return permissions.every(p => hasPermission(role, p));
};

export const getRolePermissions = (role: UserRole): Permission[] => {
  if (role === ROLES.SUPER_ADMIN) return Object.values(PERMISSIONS) as Permission[];
  return ROLE_PERMISSIONS[role] || [];
};
