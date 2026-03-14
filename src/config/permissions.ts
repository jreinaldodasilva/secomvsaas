export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  ASSESSOR: 'assessor',
  SOCIAL_MEDIA: 'social_media',
  ATENDENTE: 'atendente',
  CITIZEN: 'citizen',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  super_admin: ['*'],
  admin: [
    'users:read', 'users:write', 'users:delete',
    'press-releases:read', 'press-releases:write', 'press-releases:delete',
    'media-contacts:read', 'media-contacts:write', 'media-contacts:delete',
    'clippings:read', 'clippings:write', 'clippings:delete',
    'events:read', 'events:write', 'events:delete',
    'appointments:read', 'appointments:write', 'appointments:delete',
    'citizen-portal:read', 'citizen-portal:write', 'citizen-portal:delete',
    'social-media:read', 'social-media:write', 'social-media:delete',
  ],
  assessor: [
    'press-releases:read', 'press-releases:write',
    'media-contacts:read', 'media-contacts:write',
    'clippings:read', 'clippings:write',
    'events:read', 'events:write',
  ],
  social_media: [
    'social-media:read', 'social-media:write',
    'press-releases:read',
    'events:read',
    'clippings:read',
  ],
  atendente: [
    'appointments:read', 'appointments:write',
    'citizen-portal:read', 'citizen-portal:write',
    'events:read',
  ],
  citizen: [
    'appointments:read', 'appointments:write',
    'citizen-portal:read',
    'events:read',
  ],
};

export function hasPermission(role: string, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role as Role];
  if (!perms) return false;
  if (perms.includes('*')) return true;
  return perms.includes(permission);
}

export function hasAnyPermission(role: string, permissions: string[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

/** Roles that can access a given read permission */
export function rolesWithPermission(permission: string): Role[] {
  return (Object.keys(ROLE_PERMISSIONS) as Role[]).filter(r => hasPermission(r, permission));
}
