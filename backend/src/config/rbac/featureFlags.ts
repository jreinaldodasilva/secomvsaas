import type { Permission } from './permissions';

/**
 * Canonical feature flag registry.
 *
 * Each entry maps a flag name (stored in `tenant.settings.features`) to the
 * set of permissions that require the flag to be enabled.  When a flag is
 * absent from the tenant document it defaults to `true` (opt-out model),
 * so existing tenants are unaffected until a flag is explicitly set to false.
 *
 * To gate a new capability:
 *   1. Add a key here with the permissions it controls.
 *   2. Set the flag to `false` on tenants that should not have access.
 */
export const FEATURE_FLAGS = {
  press_releases:  ['press-releases:read',  'press-releases:write',  'press-releases:delete'],
  media_contacts:  ['media-contacts:read',  'media-contacts:write',  'media-contacts:delete'],
  clippings:       ['clippings:read',       'clippings:write',       'clippings:delete'],
  events:          ['events:read',          'events:write',          'events:delete'],
  appointments:    ['appointments:read',    'appointments:write',    'appointments:delete'],
  citizen_portal:  ['citizen-portal:read',  'citizen-portal:write',  'citizen-portal:delete'],
  social_media:    ['social-media:read',    'social-media:write',    'social-media:delete'],
  webhooks:        ['settings:write'],
  reports:         ['reports:read',         'reports:write'],
} as const satisfies Record<string, readonly Permission[]>;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Returns the feature flag (if any) that gates the given permission.
 * Returns `null` when the permission is not gated by any flag.
 */
export function flagForPermission(permission: Permission): FeatureFlag | null {
  for (const [flag, perms] of Object.entries(FEATURE_FLAGS) as [FeatureFlag, readonly Permission[]][]) {
    if ((perms as readonly string[]).includes(permission)) return flag;
  }
  return null;
}
