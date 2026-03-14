import { PERMISSIONS, Permission } from './permissions';
import { ROLES, UserRole } from './roles';

const P = PERMISSIONS;

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS) as Permission[],

  [ROLES.ADMIN]: [
    P.USERS_READ, P.USERS_WRITE, P.USERS_DELETE,
    P.SETTINGS_READ, P.SETTINGS_WRITE,
    P.REPORTS_READ, P.REPORTS_WRITE,
    P.AUDIT_READ,
    P.TENANTS_READ, P.TENANTS_WRITE,
    P.PRESS_RELEASES_READ, P.PRESS_RELEASES_WRITE, P.PRESS_RELEASES_DELETE,
    P.MEDIA_CONTACTS_READ, P.MEDIA_CONTACTS_WRITE, P.MEDIA_CONTACTS_DELETE,
    P.CLIPPINGS_READ, P.CLIPPINGS_WRITE, P.CLIPPINGS_DELETE,
    P.EVENTS_READ, P.EVENTS_WRITE, P.EVENTS_DELETE,
    P.APPOINTMENTS_READ, P.APPOINTMENTS_WRITE, P.APPOINTMENTS_DELETE,
    P.CITIZEN_PORTAL_READ, P.CITIZEN_PORTAL_WRITE, P.CITIZEN_PORTAL_DELETE,
    P.SOCIAL_MEDIA_READ, P.SOCIAL_MEDIA_WRITE, P.SOCIAL_MEDIA_DELETE,
  ],

  [ROLES.ASSESSOR]: [
    P.PRESS_RELEASES_READ, P.PRESS_RELEASES_WRITE,
    P.MEDIA_CONTACTS_READ, P.MEDIA_CONTACTS_WRITE,
    P.CLIPPINGS_READ, P.CLIPPINGS_WRITE,
    P.EVENTS_READ, P.EVENTS_WRITE,
    P.REPORTS_READ,
  ],

  [ROLES.SOCIAL_MEDIA]: [
    P.SOCIAL_MEDIA_READ, P.SOCIAL_MEDIA_WRITE,
    P.PRESS_RELEASES_READ,
    P.EVENTS_READ,
    P.CLIPPINGS_READ,
  ],

  [ROLES.ATENDENTE]: [
    P.APPOINTMENTS_READ, P.APPOINTMENTS_WRITE,
    P.CITIZEN_PORTAL_READ, P.CITIZEN_PORTAL_WRITE,
    P.EVENTS_READ,
  ],

  [ROLES.CITIZEN]: [
    P.APPOINTMENTS_READ, P.APPOINTMENTS_WRITE,
    P.CITIZEN_PORTAL_READ,
    P.EVENTS_READ,
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
