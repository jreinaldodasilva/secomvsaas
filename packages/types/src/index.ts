// @vsaas/types — Shared types for the vertical SaaS platform

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
  lastLogin?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
  trialEndsAt?: string | Date;
  maxUsers: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
  createdAt?: string | Date;
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
  MANAGER: 'manager',
  STAFF: 'staff',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// ─── Utility types ───────────────────────────────────────────────────────────

export type ID = string;
export type DateString = string;

// Add types for generated modules below.
