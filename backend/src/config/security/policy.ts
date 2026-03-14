// Security policy constants
export const SECURITY_POLICY = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    HISTORY_LIMIT: 5,
    EXPIRY_DAYS: 90,
    REQUIRE_UPPERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,
  },
  ACCOUNT_LOCKOUT: {
    MAX_ATTEMPTS: 10,
    SOFT_LOCK_ATTEMPTS: 5,
    SOFT_LOCK_DURATION_MS: 60 * 60 * 1000,   // 1 hour
    HARD_LOCK_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours
  },
  SESSION: {
    MAX_CONCURRENT_SESSIONS: 5,
    IDLE_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  },
} as const;
