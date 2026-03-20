# Architecture Quick Wins

> **Scope:** Strictly derived from `docs/architecture/backend/overview-part-1.md`, `overview-part-2.md`, and `overview-part-3.md`.
> **Definition:** Low-effort improvements (≤2 days) with direct architectural impact.

---

## Quick Win #1: Remove or Stub the `aws-secrets` Deployment Trap

**Architecture Problem**
`SECRETS_BACKEND=aws-secrets` is listed in `.env.example` as a valid production option, but `secretsLoader.ts` throws a runtime `Error` when this value is selected. `@aws-sdk/client-secrets-manager` is not installed. Any operator following the documentation for a production AWS deployment will crash the server at startup.
*(Source: Part 1 §3.3, Part 2 §5.4, Part 3 §8.1)*

**Impact**
Eliminates a P0 deployment trap. Prevents a production outage caused by following the project's own documentation.

**Effort:** 0.5–1 day

**Implementation Steps**
1. In `src/config/env.ts`, remove `'aws-secrets'` from the `SECRETS_BACKEND` Zod enum until the backend is implemented.
2. In `.env.example` and `.env.staging`, remove or comment out `SECRETS_BACKEND=aws-secrets` with a note that it is not yet available.
3. If implementation is preferred over removal: install `@aws-sdk/client-secrets-manager`, implement the `loadFromAwsSecrets()` function in `secretsLoader.ts`, and add an integration test.

**Risk Level:** Low — removing an enum value is a non-breaking change for any deployment not using this option. Any deployment attempting to use it is already broken.

---

## Quick Win #2: Add `DEFAULT_ADMIN_PASSWORD` Strength Validation to Zod Schema

**Architecture Problem**
`DEFAULT_ADMIN_PASSWORD` is required on first run but has no minimum length or complexity check in `env.ts`. A weak password (e.g., `admin123`) can be set without any warning or rejection, creating a security risk at the system's highest-privilege entry point.
*(Source: Part 2 §5.5, Part 3 §8.1)*

**Impact**
Closes a P0 configuration security gap. Consistent with the existing pattern of production-specific Zod validations already present in `env.ts` (JWT secret ≥64 chars, CSRF secret ≥32 chars).

**Effort:** 0.5 days

**Implementation Steps**
1. In `src/config/env.ts`, add a `.min(12)` constraint to the `DEFAULT_ADMIN_PASSWORD` field in the Zod schema.
2. Optionally add a `.regex()` check for at least one uppercase, one digit, and one special character.
3. Update `.env.example` to document the minimum requirement.

**Risk Level:** Low — only affects first-run seeding. Existing deployments with a valid password are unaffected.

---

## Quick Win #3: Add Production Guard for `VERIFY_USER_ON_REQUEST=false`

**Architecture Problem**
`VERIFY_USER_ON_REQUEST=false` disables per-request user status validation. The architecture document notes this is unsafe for production, but the Zod schema does not emit a warning or error when it is set to `false` alongside `NODE_ENV=production`.
*(Source: Part 2 §5.5, Part 3 §8.3)*

**Impact**
Prevents a misconfigured production instance from silently bypassing user validation. Consistent with the existing `COOKIE_SECURE` production warning pattern already in `env.ts`.

**Effort:** 0.5 days

**Implementation Steps**
1. In `src/config/env.ts`, after the Zod parse succeeds, add a production warning check:
   ```typescript
   if (env.nodeEnv === 'production' && !env.auth.verifyUserOnRequest) {
     logger.warn('VERIFY_USER_ON_REQUEST=false is unsafe in production');
   }
   ```
2. Follow the same pattern used for the existing `COOKIE_SECURE` warning.

**Risk Level:** Low — warning only; no behavior change.

---

## Quick Win #4: Add Production Warning for Static AWS Credentials

**Architecture Problem**
`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are loaded from environment variables with no guard against their use in production on AWS. On ECS/EC2, the SDK should use the instance/task IAM role; static credentials in environment variables are a security anti-pattern and an audit finding.
*(Source: Part 2 §5.5, Part 3 §8.2)*

**Impact**
Surfaces a credential hygiene issue at startup rather than during a security audit. Guides operators toward IAM role-based access without breaking existing deployments.

**Effort:** 0.5 days

**Implementation Steps**
1. In `src/config/env.ts`, add a production warning:
   ```typescript
   if (env.nodeEnv === 'production' && env.aws.accessKeyId && env.aws.secretAccessKey) {
     logger.warn('Static AWS credentials detected in production. Use IAM instance/task roles instead.');
   }
   ```

**Risk Level:** Low — warning only; no behavior change.

---

## Quick Win #5: Standardize Rate Limiter Configuration

**Architecture Problem**
`authLimiter` and `refreshLimiter` use hardcoded constants from `src/constants/validation.ts` while `apiLimiter` and `contactLimiter` use env-configured values. This creates inconsistent behavior: operators can tune the API rate limit via environment variables but cannot tune the auth rate limit without a code change.
*(Source: Part 2 §5.5, Part 3 §8.3)*

**Impact**
Consistent, operator-configurable rate limiting across all limiters. Eliminates a configuration inconsistency that can cause unexpected behavior in staging vs. production.

**Effort:** 0.5 days

**Implementation Steps**
1. Add `AUTH_RATE_LIMIT_MAX` and `REFRESH_RATE_LIMIT_MAX` environment variables to `src/config/env.ts` with defaults matching the current hardcoded values.
2. Update `src/middleware/rateLimiter.ts` to read from `env.rateLimits.auth` and `env.rateLimits.refresh`.
3. Update `.env.example` with the new variables.

**Risk Level:** Low — defaults preserve existing behavior.

---

## Quick Win #6: Resolve `tenantScopedMixin.ts` Re-export Shim

**Architecture Problem**
`src/models/mixins/tenantScopedMixin.ts` is a re-export shim that points to `platform/database/tenantAware`. It is an artifact of an incomplete refactoring. Consumers importing from the shim are coupled to an intermediate file that adds no value and signals an unfinished migration.
*(Source: Part 1 §2.6, Part 3 §8.3, §8.4)*

**Impact**
Removes a dead abstraction layer. Clarifies the canonical import path for tenant-aware schema helpers. Reduces confusion for new contributors.

**Effort:** 1 day

**Implementation Steps**
1. Search all files importing from `src/models/mixins/tenantScopedMixin` (or its alias).
2. Update each import to point directly to `platform/database/tenantAware`.
3. Delete `src/models/mixins/tenantScopedMixin.ts`.
4. Verify no TypeScript compilation errors.

**Risk Level:** Low — pure import path change; no logic change.

---

## Quick Win #7: Relocate Platform Controllers to Eliminate Naming Ambiguity

**Architecture Problem**
`src/controllers/auth.controller.ts` and `src/controllers/citizen-auth.controller.ts` sit in a root-level `controllers/` directory that mirrors the module-level `controllers/` directories inside each domain module. This creates ambiguity about where platform vs. domain controllers belong and where new code should be placed.
*(Source: Part 1 §2.6, Part 3 §8.4)*

**Impact**
Eliminates a structural ambiguity that causes onboarding confusion and risks misplaced code. Reduces the number of top-level directories.

**Effort:** 1 day

**Implementation Steps**
1. Move `src/controllers/auth.controller.ts` to `src/routes/auth/auth.controller.ts`.
2. Move `src/controllers/citizen-auth.controller.ts` to `src/routes/citizen-auth/citizen-auth.controller.ts`.
3. Update all import references in the corresponding route files.
4. Delete the now-empty `src/controllers/` directory.

**Risk Level:** Low — file relocation only; no logic change.

---

## Quick Win #8: Add `$text` Index for Press Release and Clipping Search

**Architecture Problem**
`PressReleaseRepository.findWithFilters()` and the equivalent in `ClippingRepository` use `$regex` for text search. `$regex` does not use indexes and performs a full collection scan, degrading linearly with collection size.
*(Source: Part 1 §1.2, §3.4, Part 3 §8.3)*

**Impact**
Indexed text search for the two highest-volume search operations. Prevents query degradation as press release and clipping collections grow.

**Effort:** 1–2 days

**Implementation Steps**
1. Add a MongoDB `$text` index to the `press-releases` collection on `title`, `content`, and `summary` fields in the migration file (or `add-database-indexes.ts`).
2. Add a `$text` index to the `clippings` collection on `title`, `summary`, and `outlet`.
3. Update `findWithFilters()` in both repositories to use `{ $text: { $search: query } }` instead of `$regex`.
4. Add a migration file documenting the index addition.

**Risk Level:** Low-Medium — index creation on existing collections is online in MongoDB but adds write overhead. Schedule during low-traffic window if collections are large.

---

## Quick Win #9: Document and Enforce Worker Startup Dependency

**Architecture Problem**
A developer running only `npm run dev` (server only) gets a server without background job processing. Email delivery, webhook dispatch, and domain event fan-out fail silently. The `npm run dev:all` script at the workspace root handles this, but it is not enforced and not prominently documented.
*(Source: Part 2 §4.7, Part 3 §8.2)*

**Impact**
Prevents silent job processing failures in development from being mistaken for application bugs. Reduces developer confusion during onboarding.

**Effort:** 0.5–1 day

**Implementation Steps**
1. Add a prominent warning to `src/server.ts` startup logs when `NODE_ENV=development` and no worker health signal is detected (e.g., a Redis key set by `worker.ts` on startup).
2. Alternatively, add a `README` callout in the backend `README` or `CONTRIBUTING.md` that `npm run dev` alone is insufficient.
3. Update Docker Compose `depends_on` or the workspace `dev:all` script to make the dependency explicit.

**Risk Level:** Low — documentation and optional startup warning; no behavior change to production.

---

## Quick Win Summary

| # | Title | Effort | Priority | Source |
|---|---|---|---|---|
| QW-1 | Remove `aws-secrets` deployment trap | 0.5–1 day | P0 | Part 1 §3.3, Part 2 §5.4 |
| QW-2 | `DEFAULT_ADMIN_PASSWORD` strength validation | 0.5 days | P0 | Part 2 §5.5, Part 3 §8.1 |
| QW-3 | Production guard for `VERIFY_USER_ON_REQUEST=false` | 0.5 days | P2 | Part 2 §5.5 |
| QW-4 | Production warning for static AWS credentials | 0.5 days | P1 | Part 2 §5.5 |
| QW-5 | Standardize rate limiter configuration | 0.5 days | P2 | Part 2 §5.5 |
| QW-6 | Resolve `tenantScopedMixin.ts` shim | 1 day | P2 | Part 1 §2.6 |
| QW-7 | Relocate platform controllers | 1 day | P2 | Part 1 §2.6 |
| QW-8 | Add `$text` index for press release and clipping search | 1–2 days | P2 | Part 1 §1.2, Part 3 §8.3 |
| QW-9 | Document and enforce worker startup dependency | 0.5–1 day | P1 | Part 2 §4.7 |

**Total estimated effort: 6–8 days**
**Recommended execution order:** QW-1 → QW-2 → QW-4 → QW-9 → QW-3 → QW-5 → QW-6 → QW-7 → QW-8
