// @secom/types — Shared types for the Secom platform

// ─── API envelope ────────────────────────────────────────────────────────────

export type ApiResult<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: { code?: string; message: string; details?: any };
  meta?: { timestamp: string; requestId: string; version: string };
};

// ─── Pagination ──────────────────────────────────────────────────────────────

export type PaginatedData<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  companyName: string;
};

export type AcceptInviteRequest = {
  token: string;
  name: string;
  password: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

// ─── Core entities ───────────────────────────────────────────────────────────

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  tenantId?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  status: 'active' | 'suspended' | 'trial' | 'cancelled' | 'deleted';
  plan: 'trial' | 'starter' | 'professional' | 'enterprise';
  settings: {
    timezone: string;
    locale: string;
    currency: string;
    features: Record<string, boolean>;
  };
  owner: string;
  trialEndsAt?: string;
  maxUsers: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AuditLog = {
  id: string;
  user?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  ipAddress: string;
  userAgent?: string;
  statusCode?: number;
  changes?: { before?: any; after?: any };
  metadata?: Record<string, any>;
  tenantId?: string;
  createdAt?: string;
};

// ─── Health ──────────────────────────────────────────────────────────────────

export type HealthStatus = {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptime: number;
  checks: {
    database: { status: string; responseTime: number };
    redis: { status: string; responseTime: number };
  };
};

// ─── Roles ───────────────────────────────────────────────────────────────────

export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  ASSESSOR: 'assessor',
  SOCIAL_MEDIA: 'social_media',
  ATENDENTE: 'atendente',
  CITIZEN: 'citizen',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

/** Alias used by frontend consumers and backend rbac/roles.ts */
export const ROLES = UserRole;
export type Role = UserRoleType;

/** All roles that can access the staff dashboard (excludes citizen) */
export const STAFF_ROLES: Role[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.ASSESSOR,
  UserRole.SOCIAL_MEDIA,
  UserRole.ATENDENTE,
];

// ─── Permissions ─────────────────────────────────────────────────────────────

export const PERMISSIONS = {
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
  AUDIT_READ: 'audit:read',
  REPORTS_READ: 'reports:read',
  REPORTS_WRITE: 'reports:write',
  TENANTS_READ: 'tenants:read',
  TENANTS_WRITE: 'tenants:write',
  TENANTS_DELETE: 'tenants:delete',
  PRESS_RELEASES_READ: 'press-releases:read',
  PRESS_RELEASES_WRITE: 'press-releases:write',
  PRESS_RELEASES_DELETE: 'press-releases:delete',
  MEDIA_CONTACTS_READ: 'media-contacts:read',
  MEDIA_CONTACTS_WRITE: 'media-contacts:write',
  MEDIA_CONTACTS_DELETE: 'media-contacts:delete',
  CLIPPINGS_READ: 'clippings:read',
  CLIPPINGS_WRITE: 'clippings:write',
  CLIPPINGS_DELETE: 'clippings:delete',
  EVENTS_READ: 'events:read',
  EVENTS_WRITE: 'events:write',
  EVENTS_DELETE: 'events:delete',
  APPOINTMENTS_READ: 'appointments:read',
  APPOINTMENTS_WRITE: 'appointments:write',
  APPOINTMENTS_DELETE: 'appointments:delete',
  CITIZEN_PORTAL_READ: 'citizen-portal:read',
  CITIZEN_PORTAL_WRITE: 'citizen-portal:write',
  CITIZEN_PORTAL_DELETE: 'citizen-portal:delete',
  SOCIAL_MEDIA_READ: 'social-media:read',
  SOCIAL_MEDIA_WRITE: 'social-media:write',
  SOCIAL_MEDIA_DELETE: 'social-media:delete',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

const P = PERMISSIONS;

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: Object.values(PERMISSIONS) as Permission[],
  admin: [
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
  assessor: [
    P.PRESS_RELEASES_READ, P.PRESS_RELEASES_WRITE,
    P.MEDIA_CONTACTS_READ, P.MEDIA_CONTACTS_WRITE,
    P.CLIPPINGS_READ, P.CLIPPINGS_WRITE,
    P.EVENTS_READ, P.EVENTS_WRITE,
    P.REPORTS_READ,
  ],
  social_media: [
    P.SOCIAL_MEDIA_READ, P.SOCIAL_MEDIA_WRITE,
    P.PRESS_RELEASES_READ,
    P.EVENTS_READ,
    P.CLIPPINGS_READ,
  ],
  atendente: [
    P.APPOINTMENTS_READ, P.APPOINTMENTS_WRITE,
    P.CITIZEN_PORTAL_READ, P.CITIZEN_PORTAL_WRITE,
    P.EVENTS_READ,
  ],
  citizen: [
    P.APPOINTMENTS_READ, P.APPOINTMENTS_WRITE,
    P.CITIZEN_PORTAL_READ,
    P.EVENTS_READ,
  ],
};

export function hasPermission(role: string, permission: string): boolean {
  if (role === ROLES.SUPER_ADMIN) return true;
  const perms = ROLE_PERMISSIONS[role as Role];
  if (!perms) return false;
  return perms.includes(permission as Permission);
}

export function hasAnyPermission(role: string, permissions: string[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

export function rolesWithPermission(permission: string): Role[] {
  return (Object.keys(ROLE_PERMISSIONS) as Role[]).filter(r => hasPermission(r, permission));
}

// ─── Citizen auth ────────────────────────────────────────────────────────────

export type CitizenUser = {
  id: string;
  name: string;
  email: string;
  role: 'citizen';
  tenantId?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
};

// ─── Domain entities ─────────────────────────────────────────────────────────

export type PressRelease = {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  summary?: string;
  category: 'nota_oficial' | 'comunicado' | 'convite' | 'esclarecimento' | 'outro';
  tags: string[];
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  publishedAt?: string;
  approvedBy?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MediaContact = {
  id: string;
  name: string;
  outlet: string;
  email?: string;
  phone?: string;
  beat?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
};

export type Clipping = {
  id: string;
  title: string;
  source: string;
  sourceUrl?: string;
  publishedAt?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary?: string;
  tags: string[];
  createdAt?: string;
};

export type Event = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt?: string;
  isPublic: boolean;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt?: string;
};

export type Appointment = {
  id: string;
  citizenName: string;
  citizenCpf?: string;
  citizenPhone?: string;
  service: string;
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt?: string;
};

export type CitizenProfile = {
  id: string;
  userId: string;
  fullName: string;
  cpf?: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
};

export type SocialMediaPost = {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok';
  content: string;
  mediaUrl?: string;
  scheduledAt?: string;
  publishedAt?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  createdBy?: string;
  createdAt?: string;
};

// ─── Utility types ───────────────────────────────────────────────────────────

export type ID = string;
export type DateString = string;
