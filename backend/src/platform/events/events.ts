// ─── Auth Events ──────────────────────────────────────────
export const AUTH_EVENTS = {
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.logged_in',
  USER_LOGGED_OUT: 'user.logged_out',
  PASSWORD_CHANGED: 'user.password_changed',
  PASSWORD_RESET_REQUESTED: 'user.password_reset_requested',
  MFA_ENABLED: 'user.mfa_enabled',
  SUSPICIOUS_LOGIN: 'user.suspicious_login',
  ACCOUNT_LOCKED: 'user.account_locked',
} as const;

// ─── Tenant Events ────────────────────────────────────────
export const TENANT_EVENTS = {
  TENANT_CREATED: 'tenant.created',
  TENANT_UPDATED: 'tenant.updated',
  TENANT_SUSPENDED: 'tenant.suspended',
  TENANT_REACTIVATED: 'tenant.reactivated',
  TENANT_DELETED: 'tenant.deleted',
  MEMBER_INVITED: 'tenant.member_invited',
  MEMBER_JOINED: 'tenant.member_joined',
  MEMBER_REMOVED: 'tenant.member_removed',
} as const;

// ─── Billing Events ──────────────────────────────────────
export const BILLING_EVENTS = {
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_EXPIRED: 'subscription.expired',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  INVOICE_GENERATED: 'invoice.generated',
  TRIAL_ENDING: 'subscription.trial_ending',
} as const;

// ─── Notification Events ─────────────────────────────────
export const NOTIFICATION_EVENTS = {
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_DELIVERED: 'notification.delivered',
  NOTIFICATION_FAILED: 'notification.failed',
  NOTIFICATION_READ: 'notification.read',
} as const;

// ─── Audit Events ────────────────────────────────────────
export const AUDIT_EVENTS = {
  AUDIT_LOG_CREATED: 'audit.log_created',
  CROSS_TENANT_ATTEMPT: 'audit.cross_tenant_attempt',
} as const;

// Aggregate all event types for type safety
export type AuthEventType = typeof AUTH_EVENTS[keyof typeof AUTH_EVENTS];
export type TenantEventType = typeof TENANT_EVENTS[keyof typeof TENANT_EVENTS];
export type BillingEventType = typeof BILLING_EVENTS[keyof typeof BILLING_EVENTS];
export type NotificationEventType = typeof NOTIFICATION_EVENTS[keyof typeof NOTIFICATION_EVENTS];
export type AuditEventType = typeof AUDIT_EVENTS[keyof typeof AUDIT_EVENTS];

export type PlatformEventType =
  | AuthEventType
  | TenantEventType
  | BillingEventType
  | NotificationEventType
  | AuditEventType;
