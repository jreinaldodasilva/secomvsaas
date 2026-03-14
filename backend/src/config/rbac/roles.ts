export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  // Add roles for your vertical here after scaffolding.
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]: 80,
  [ROLES.MANAGER]: 60,
  [ROLES.STAFF]: 20,
};

export const hasRoleLevel = (userRole: UserRole, requiredRole: UserRole): boolean =>
  ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
