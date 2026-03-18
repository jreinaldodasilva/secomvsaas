// Security policy constants

/**
 * Paths that are exempt from CSRF token enforcement.
 *
 * These routes are excluded because the client cannot possess a CSRF token
 * at the time of the request:
 *   - /auth/login, /auth/register, /auth/accept-invite — unauthenticated flows
 *     that establish the session; no prior token exchange has occurred.
 *   - /auth/refresh, /auth/logout — use the httpOnly refresh-token cookie as
 *     the credential; CSRF protection is provided by the SameSite=Strict cookie
 *     attribute instead.
 *   - /csrf-token — the endpoint that issues the token itself.
 *
 * ⚠️  Do NOT add state-changing routes to this list. Every route added here
 *     removes a layer of CSRF protection for that endpoint.
 */
export const CSRF_SKIP_PATHS = [
  '/api/v1/auth/refresh',
  '/api/v1/auth/logout',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/accept-invite',
  '/api/v1/citizen-auth/register',
  '/api/v1/citizen-auth/login',
  '/api/v1/citizen-auth/refresh',
  '/api/v1/citizen-auth/logout',
  '/api/csrf-token',
] as const;

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
