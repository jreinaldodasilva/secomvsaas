/**
 * Centralised status → colour-variant maps consumed by StatusBadge's `colorMap` prop.
 * Each map covers only the statuses that differ from StatusBadge's built-in STATUS_VARIANT,
 * plus any domain-specific values not present in the shared map.
 */

export const PRESS_RELEASE_STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  review: 'yellow',
  approved: 'blue',
  published: 'green',
  archived: 'red',
};

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'yellow',
  confirmed: 'blue',
  completed: 'green',
  cancelled: 'red',
  no_show: 'gray',
};

export const EVENT_STATUS_COLORS: Record<string, string> = {
  scheduled: 'blue',
  ongoing: 'yellow',
  completed: 'green',
  cancelled: 'red',
};

export const SOCIAL_MEDIA_STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  scheduled: 'blue',
  published: 'green',
  failed: 'red',
};
