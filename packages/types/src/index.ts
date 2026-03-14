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
  ASSESSOR: 'assessor',
  SOCIAL_MEDIA: 'social_media',
  ATENDENTE: 'atendente',
  CITIZEN: 'citizen',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

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
  publishedAt?: string | Date;
  approvedBy?: string;
  createdBy?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
  createdAt?: string | Date;
};

export type Clipping = {
  id: string;
  title: string;
  source: string;
  sourceUrl?: string;
  publishedAt?: string | Date;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary?: string;
  tags: string[];
  createdAt?: string | Date;
};

export type Event = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string | Date;
  endsAt?: string | Date;
  isPublic: boolean;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt?: string | Date;
};

export type Appointment = {
  id: string;
  citizenName: string;
  citizenCpf?: string;
  citizenPhone?: string;
  service: string;
  scheduledAt: string | Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt?: string | Date;
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
  createdAt?: string | Date;
};

export type SocialMediaPost = {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok';
  content: string;
  mediaUrl?: string;
  scheduledAt?: string | Date;
  publishedAt?: string | Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  createdBy?: string;
  createdAt?: string | Date;
};

// ─── Utility types ───────────────────────────────────────────────────────────

export type ID = string;
export type DateString = string;
