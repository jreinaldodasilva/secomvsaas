export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  ASSESSOR: 'assessor',
  SOCIAL_MEDIA: 'social_media',
  ATENDENTE: 'atendente',
  CITIZEN: 'citizen',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]: 80,
  [ROLES.ASSESSOR]: 60,
  [ROLES.SOCIAL_MEDIA]: 50,
  [ROLES.ATENDENTE]: 40,
  [ROLES.CITIZEN]: 10,
};

export const hasRoleLevel = (userRole: UserRole, requiredRole: UserRole): boolean =>
  ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
