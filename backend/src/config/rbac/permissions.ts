export const PERMISSIONS = {
  // Users
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',

  // Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',

  // Audit
  AUDIT_READ: 'audit:read',

  // Reports
  REPORTS_READ: 'reports:read',
  REPORTS_WRITE: 'reports:write',

  // Tenants
  TENANTS_READ: 'tenants:read',
  TENANTS_WRITE: 'tenants:write',
  TENANTS_DELETE: 'tenants:delete',

  // Add permissions for generated modules here.
  // After running: npm run generate:module -- <name>
  // Add: <NAME>_READ, <NAME>_WRITE, <NAME>_DELETE
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
