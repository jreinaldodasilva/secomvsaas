# Secom – Backend Architecture Quick Wins

> **Source:** `docs/backend/01-Secom-Backend-Architecture-Overview-Part1.md` (Part1),
> `docs/backend/01-Secom-Backend-Architecture-Overview-Part2.md` (Part2),
> `docs/backend/01-Secom-Backend-Architecture-Overview-Part3.md` (Part3)
>
> **Scope:** Architecture-only quick wins. Low effort, high impact. No cross-document inference.

---

## Overview

| # | Title | Effort | Impact | Risk Level |
|---|-------|--------|--------|------------|
| QW-1 | ~~Remove hardcoded fallback secrets from `env.ts`~~ | 0.5 d | Critical | ✅ Completed |
| QW-2 | ~~Remove hardcoded default admin password from seed~~ | 0.5 d | Critical | ✅ Completed |
| QW-3 | ~~Move event listener registration before `app.listen()`~~ | 0.5 d | Low | ✅ Completed |
| QW-4 | ~~Fix error handler / 404 handler ordering in `app.ts`~~ | 1 d | Medium | ✅ Completed |
| QW-5 | ~~Remove unused Stripe and Twilio dependencies~~ | 0.5 d | Medium | ✅ Completed |
| QW-6 | ~~Consolidate duplicate token expiry config variables~~ | 0.5 d | Low | ✅ Completed |
| QW-7 | ~~Replace imperative `validateEnv()` with Zod schema~~ | 1 d | Medium | ✅ Completed |
| QW-8 | ~~Limit audit logger to write operations only~~ | 1 d | Medium | ✅ Completed |

**Total estimated effort: ~5.5 developer-days**

---

## ✅ Quick Win #1: Remove Hardcoded Fallback Secrets from `env.ts` — COMPLETED

**Architecture Problem**

`src/config/env.ts` contains hardcoded fallback values for security-critical configuration: `'development-jwt-secret'`, `'development-csrf-secret'`, and similar. If `validateEnv()` is bypassed or if a code path reads `env.jwt.secret` before validation runs, the application starts with publicly known weak secrets. *(Part3 §6.5, Part3 §8.1 Finding 1)*

**Impact**

- Eliminates the risk of auth tokens being signed with a known secret
- Closes the path to CSRF bypass via known CSRF secret
- Forces explicit secret configuration in all environments, including CI

**Effort:** 0.5 developer-days

**Implementation Steps**

1. In `src/config/env.ts`, remove all fallback string values from security-sensitive fields:
   - `jwt.secret`, `jwt.refreshSecret`, `jwt.portalSecret`
   - `security.csrfSecret`
2. Replace fallbacks with `undefined` or throw immediately if the variable is absent
3. Update `.env.example` to document that these variables are required in all environments (not just production)
4. Verify `validateEnv()` is called as the first operation in `server.ts` before any config object is read

**Risk Level:** Low — isolated to `env.ts` and startup sequence; no runtime behavior changes if secrets are already set correctly.

---

## ✅ Quick Win #2: Remove Hardcoded Default Admin Password from Seed — COMPLETED

**Architecture Problem**

`src/seeds/defaultTenant.ts` contains `'Admin@Secom2024'` as a fallback password for the default admin user in non-production environments. This credential is in source control and is documented in the README, making it a known credential for any exposed database. *(Part3 §6.5, Part3 §8.1 Finding 2)*

**Impact**

- Eliminates a known credential from the codebase
- Forces operators to explicitly set `DEFAULT_ADMIN_PASSWORD` before first run
- Reduces risk of development/staging database compromise

**Effort:** 0.5 developer-days

**Implementation Steps**

1. In `src/seeds/defaultTenant.ts`, remove the hardcoded fallback password
2. Read `DEFAULT_ADMIN_PASSWORD` exclusively from `process.env` (or the typed `env` config object)
3. If the variable is absent, throw a startup error with a clear message: `"DEFAULT_ADMIN_PASSWORD is required for seeding"`
4. Update `.env.example` to mark `DEFAULT_ADMIN_PASSWORD` as required
5. Update the README Quick Start section to reflect that the password must be set before first run

**Risk Level:** Low — only affects first-run seeding; no impact on existing tenants or users.

---

## ✅ Quick Win #3: Move Event Listener Registration Before `app.listen()` — COMPLETED

**Architecture Problem**

`registerAuthEventListeners()` is called after `app.listen()` in `src/server.ts`. There is a narrow window between when the HTTP server starts accepting connections and when the `ACCOUNT_LOCKED` event listener is registered. An event emitted in that window is silently dropped. *(Part2 §5.8 Concern, Part3 §8.1 Finding 16)*

**Impact**

- Closes the race condition window
- Ensures no domain events are ever emitted without a registered handler
- Establishes the correct bootstrap ordering pattern for future listener registrations

**Effort:** 0.5 developer-days

**Implementation Steps**

1. In `src/server.ts`, move the `registerAuthEventListeners()` call to before `app.listen(PORT, ...)`
2. Verify the updated startup sequence:
   ```
   connectToDatabase()
   ensureDefaultTenant()
   registerAuthEventListeners()   ← moved here
   app.listen(PORT)
   scheduleAuditCleanup()
   ```
3. Confirm no listener registration depends on the HTTP server being live

**Risk Level:** Minimal — reordering two lines; no logic changes.

---

## ✅ Quick Win #4: Fix Error Handler / 404 Handler Ordering in `app.ts` — COMPLETED

**Architecture Problem**

In `src/app.ts`, the 404 catch-all handler (`app.use('*', ...)`) is placed after `app.use(errorHandler)`. In Express 4, `app.use('*', ...)` matches all methods and paths, which can intercept requests that should have been handled by the error handler if they fall through the route stack. The current ordering works in the common case but is fragile and will produce subtle bugs as routes are added. *(Part2 §5.8 Concern)*

**Impact**

- Eliminates a class of subtle routing bugs
- Makes the middleware ordering explicit and correct by Express 4 conventions
- Reduces risk of future route additions causing unexpected 404 responses

**Effort:** 1 developer-day (includes testing edge cases)

**Implementation Steps**

1. In `src/app.ts`, reorder the final middleware to:
   ```
   app.use(errorHandler)    // catches errors from all routes
   app.use('*', notFound)   // catches unmatched routes (no error)
   ```
   Note: The 404 handler should call `next(new NotFoundError(...))` so it flows through `errorHandler`, not respond directly.
2. Refactor the 404 handler to emit a `NotFoundError` (from the existing `AppError` hierarchy) and call `next(error)` rather than responding directly
3. Verify that error responses and 404 responses both use the standard `{ success, data, error, meta }` envelope from `responseWrapper`
4. Add a smoke test for an unknown route to confirm 404 response shape

**Risk Level:** Low — behavior is correct in the common case today; this hardens edge cases.

---

## ✅ Quick Win #5: Remove Unused Stripe and Twilio Dependencies — COMPLETED

**Architecture Problem**

`stripe` (~15 MB) and `twilio` are listed as production dependencies with corresponding env vars in `.env.example`, but neither has a service implementation, route handler, or webhook handler. They add install size and attack surface without providing any functionality. *(Part2 §4.3, Part3 §8.1 Finding 8)*

**Impact**

- Reduces `node_modules` install size
- Removes two packages from the production attack surface
- Makes the dependency graph accurate — declared dependencies reflect actual usage
- Eliminates misleading env vars from `.env.example`

**Effort:** 0.5 developer-days

**Implementation Steps**

1. Run `npm uninstall stripe twilio` in the backend package
2. Remove `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` from `.env.example`
3. Remove `MOCK_SMS_SERVICE` feature flag from `env.ts` and `.env.example` (no SMS service exists to mock)
4. Search for any remaining references to `stripe` or `twilio` in source and remove them
5. Re-run `npm install` and confirm the build passes

**Risk Level:** Minimal — packages have no active code paths; removal cannot break runtime behavior.

---

## ✅ Quick Win #6: Consolidate Duplicate Token Expiry Configuration — COMPLETED

**Architecture Problem**

Both `JWT_EXPIRES_IN` and `ACCESS_TOKEN_EXPIRES` exist in `.env.example` and map to separate fields in the typed `EnvConfig` object (`env.jwt.expiresIn` and `env.auth.accessTokenExpires`). They serve the same purpose and can silently diverge if one is updated without the other. *(Part3 §6.5 Concern, Part3 §8.1 Finding 10)*

**Impact**

- Eliminates a silent misconfiguration risk
- Reduces the env var surface area
- Makes token expiry configuration unambiguous

**Effort:** 0.5 developer-days

**Implementation Steps**

1. Decide on the canonical variable name (recommend `ACCESS_TOKEN_EXPIRES` for clarity)
2. In `src/config/env.ts`, remove the duplicate field and update all references to use the single canonical field
3. Remove the deprecated variable from `.env.example` with a comment pointing to the canonical one
4. Search all usages of `env.jwt.expiresIn` and `env.auth.accessTokenExpires` and consolidate to the single field
5. Update `.env.test` if it references the removed variable

**Risk Level:** Low — internal config consolidation; no external API or behavior change.

---

## ✅ Quick Win #7: Replace Imperative `validateEnv()` with Zod Schema — COMPLETED

**Architecture Problem**

`src/config/env.ts` uses imperative if/else chains for environment validation. This approach is harder to maintain, does not self-document required variables, and does not provide exhaustive type inference. A Zod schema would validate, coerce, and type the entire config object in one declaration. *(Part3 §6.5 Concern)*

**Impact**

- Validation becomes self-documenting — the schema is the specification
- Missing or malformed variables produce structured Zod errors at startup
- Eliminates the risk of a new variable being added without validation
- Consistent with the Zod usage already present in domain module validators

**Effort:** 1 developer-day

**Implementation Steps**

1. Define a Zod schema in `src/config/env.ts` covering all variables in `.env.example`, with appropriate types, defaults, and refinements (e.g., `.min(64)` for JWT secrets)
2. Replace the `getEnvConfig()` function body with `envSchema.parse(process.env)`
3. Replace the `validateEnv()` imperative checks with the Zod parse (Zod throws on invalid input by default)
4. Ensure production-only fields use `.optional()` with a `.superRefine()` that enforces them when `NODE_ENV === 'production'`
5. Remove the now-redundant if/else validation chains

**Risk Level:** Low — behavior-equivalent refactor; Zod parse throws the same class of startup errors as the current imperative checks.

---

## ✅ Quick Win #8: Limit Audit Logger to Write Operations Only — COMPLETED

**Architecture Problem**

The `auditLogger` middleware in `src/app.ts` monkey-patches `res.send` on every authenticated request to write an `AuditLog` document to MongoDB. This means every `GET` request — including high-frequency reads like dashboard polling or list endpoints — triggers a synchronous MongoDB write. Under load, this becomes a performance bottleneck and a single point of failure. *(Part2 §5.8 Concern, Part3 §8.1 Finding 9)*

**Impact**

- Eliminates MongoDB write overhead from all read requests
- Reduces audit collection growth rate significantly
- Improves p99 latency for read-heavy endpoints
- Audit log remains complete for all state-changing operations

**Effort:** 1 developer-day

**Implementation Steps**

1. In the `auditLogger` middleware, add a guard at the top:
   ```typescript
   const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
   if (!WRITE_METHODS.includes(req.method)) return next();
   ```
2. Verify that the audit log still captures all state-changing operations across domain modules and platform routes
3. Optionally, move the audit write to an async fire-and-forget pattern (using `setImmediate` or a BullMQ queue) to remove it from the synchronous response path entirely
4. Update any audit log queries or dashboards that may have relied on read-operation entries

**Risk Level:** Low — read operations are not auditable state changes; removing them from the audit log is architecturally correct and does not reduce compliance coverage for write operations.

---

*Quick wins derived exclusively from `docs/backend/01-Secom-Backend-Architecture-Overview-Part1/2/3.md`.*
