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

  // Press Releases
  PRESS_RELEASES_READ: 'press-releases:read',
  PRESS_RELEASES_WRITE: 'press-releases:write',
  PRESS_RELEASES_DELETE: 'press-releases:delete',

  // Media Contacts
  MEDIA_CONTACTS_READ: 'media-contacts:read',
  MEDIA_CONTACTS_WRITE: 'media-contacts:write',
  MEDIA_CONTACTS_DELETE: 'media-contacts:delete',

  // Clippings
  CLIPPINGS_READ: 'clippings:read',
  CLIPPINGS_WRITE: 'clippings:write',
  CLIPPINGS_DELETE: 'clippings:delete',

  // Events
  EVENTS_READ: 'events:read',
  EVENTS_WRITE: 'events:write',
  EVENTS_DELETE: 'events:delete',

  // Appointments
  APPOINTMENTS_READ: 'appointments:read',
  APPOINTMENTS_WRITE: 'appointments:write',
  APPOINTMENTS_DELETE: 'appointments:delete',

  // Citizen Portal
  CITIZEN_PORTAL_READ: 'citizen-portal:read',
  CITIZEN_PORTAL_WRITE: 'citizen-portal:write',
  CITIZEN_PORTAL_DELETE: 'citizen-portal:delete',

  // Social Media
  SOCIAL_MEDIA_READ: 'social-media:read',
  SOCIAL_MEDIA_WRITE: 'social-media:write',
  SOCIAL_MEDIA_DELETE: 'social-media:delete',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
