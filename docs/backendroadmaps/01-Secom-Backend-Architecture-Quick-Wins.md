# Secom Backend — Architecture Quick Wins

> Source: `docs/backend/01-Secom-Backend-Architecture-Overview-Part1.md`,
> `docs/backend/01-Secom-Backend-Architecture-Overview-Part2.md`,
> `docs/backend/01-Secom-Backend-Architecture-Overview-Part3.md`
>
> Scope: Architecture-only quick wins. All items are directly traceable to findings in the overview documents.
> A "quick win" is defined as: low effort (≤ 1.5 days), no new infrastructure required, and no breaking changes to the public API.

---

## Quick Win #1 — Fix `VERIFY_USER_ON_REQUEST=false` in `.env.example`

**Architecture Problem**
`config/env.ts` defaults `VERIFY_USER_ON_REQUEST` to `true`, but `.env.example` explicitly sets it to `false`. Any developer or deployment pipeline that copies `.env.example` verbatim to production disables per-request user status verification. Deactivated users retain valid sessions for up to 15 minutes after deactivation. *(Part 3 §6.5, P1-2)*

**Impact**
Auth session integrity. A deactivated user account continues to have API access until the access token expires. In a government communications system, this is an unacceptable window.

**Effort**
< 0.5 days

**Implementation Steps**
1. Change `VERIFY_USER_ON_REQUEST=false` to `VERIFY_USER_ON_REQUEST=true` in `backend/.env.example`.
2. Add an inline comment explaining the Redis caching behavior: the middleware caches the user's active status for 30 seconds to avoid a DB hit on every request.
3. Add a note in the same comment that setting this to `false` is only appropriate for high-throughput development environments.

**Risk Level:** None. This is a documentation/example fix. No code changes required.

---

## Quick Win #2 — Move `AUDIT_LOG_TTL_DAYS` into the Validated `env` Object

**Architecture Problem**
`AUDIT_LOG_TTL_DAYS` is read directly via `process.env` in two production files (`AuditLog.ts` and `auditCleanupQueue.ts`), bypassing the Zod-validated `env` object. This breaks the architectural invariant that all configuration is validated at startup. A missing or non-numeric value silently defaults to `90` or produces `NaN` in the TTL calculation. *(Part 3 §6.5, §8 H4, P1-3)*

**Impact**
Configuration integrity. Audit log retention could be silently misconfigured, causing premature deletion or unbounded growth of the `auditlogs` collection.

**Effort**
0.5 days

**Implementation Steps**
1. Add `AUDIT_LOG_TTL_DAYS` to the Zod schema in `src/config/env.ts` as `z.coerce.number().int().min(1).default(90)`.
2. Expose it on the `env` export object under `env.audit.logTtlDays`.
3. Replace `parseInt(process.env.AUDIT_LOG_TTL_DAYS || '90', 10)` in `AuditLog.ts` and `auditCleanupQueue.ts` with `env.audit.logTtlDays`.
4. Verify the migration file (`20240101000000-initial-setup.js`) also reads this value consistently — it currently uses `process.env` directly, which is acceptable for a migration script but should be noted.

**Risk Level:** Low. Purely additive change to the env schema. Existing behavior is preserved.

---

## Quick Win #3 — Extract the CSRF Skip List to a Named Constant

**Architecture Problem**
The array of paths that bypass CSRF protection is hardcoded inline inside `app.ts`. A security-critical configuration — which routes are exempt from CSRF enforcement — is not in a named, auditable location. Adding or removing a path requires editing the application bootstrap file with no indication of the security implication. *(Part 2 §5.4, Part 3 §8 M3, P2-2)*

**Impact**
Security configuration visibility and maintainability. An incorrect edit to this list (e.g., accidentally exempting a state-changing route) would silently remove CSRF protection from that route.

**Effort**
0.5 days

**Implementation Steps**
1. Create a named export in `src/config/security/policy.ts` (which already exists):
   ```ts
   export const CSRF_SKIP_PATHS = [
     '/api/v1/auth/refresh',
     '/api/v1/auth/logout',
     '/api/v1/auth/login',
     '/api/v1/auth/register',
     '/api/v1/auth/accept-invite',
     '/api/csrf-token',
   ] as const;
   ```
2. Import `CSRF_SKIP_PATHS` in `app.ts` and replace the inline array.
3. Add a JSDoc comment on the constant explaining why these paths are exempt.

**Risk Level:** None. Pure refactor — no behavioral change.

---

## Quick Win #4 — Remove Redundant `dotenv.config()` Calls

**Architecture Problem**
`dotenv.config()` is called in three files: `src/app.ts`, `src/config/database/redis.ts`, and `src/config/env.ts`. Since `server.ts` imports `config/env.ts` first (which calls `dotenv.config()`), the subsequent calls are no-ops. The redundant calls create a misleading impression that each module independently manages its own environment loading. *(Part 2 §4.3, Part 3 §8 L1, P3-4)*

**Impact**
Code clarity. A developer reading `redis.ts` in isolation might believe it can be initialized before `env.ts` is loaded, which is incorrect.

**Effort**
< 0.5 days

**Implementation Steps**
1. Remove `import dotenv from 'dotenv'` and `dotenv.config()` from `src/app.ts`.
2. Remove `import dotenv from 'dotenv'` and `dotenv.config()` from `src/config/database/redis.ts`.
3. Keep the single call in `src/config/env.ts`, which is the correct and only location.
4. Verify no other files call `dotenv.config()` outside of `env.ts`.

**Risk Level:** None. The calls are already no-ops at runtime.

---

## Quick Win #5 — Resolve `isomorphic-dompurify` (Remove or Apply)

**Architecture Problem**
`isomorphic-dompurify` is listed as a production dependency but no active usage was observed in route handlers, services, or middleware. An unused security library creates a false sense of protection — a developer might assume HTML content is being sanitized when it is not. *(Part 1 §2.2, Part 2 §4.3, Part 3 §8 M1, P2-3)*

**Impact**
Dependency hygiene and security posture clarity. If user-generated HTML is stored and later rendered without sanitization, XSS is possible. If it is not rendered as HTML, the dependency is dead weight.

**Effort**
0.5 days (remove) or 1–2 days (apply)

**Implementation Steps — Option A (Remove, if HTML rendering is not a use case):**
1. Run `npm uninstall isomorphic-dompurify` in `backend/`.
2. Verify no TypeScript compilation errors.
3. Document in `CONTRIBUTING.md` or architecture notes that HTML sanitization is not applied and why.

**Implementation Steps — Option B (Apply, if HTML content is stored and rendered):**
1. Identify all fields that accept user-generated HTML (e.g., `content` in `PressRelease`, `description` fields).
2. Apply `DOMPurify.sanitize()` in the relevant service `create` and `update` methods before passing data to the repository.
3. Add a unit test verifying that script tags are stripped from sanitized fields.

**Risk Level:** Low (remove) / Medium (apply — requires identifying all HTML-accepting fields).

---

## Quick Win #6 — Make `emailWorker` Startup Explicit in `worker.ts`

**Architecture Problem**
`emailWorker` is instantiated as a module-level side effect when `queues/emailQueue.ts` is imported. It starts automatically without any explicit call in `worker.ts`. This is invisible from reading the worker entry point and makes the worker lifecycle harder to reason about, test, or modify. *(Part 2 §5.3, P1-7)*

**Impact**
Deployment clarity and worker lifecycle management. If a future developer adds a conditional startup check (e.g., "only start email worker if email service is configured"), the implicit initialization pattern makes this difficult to implement correctly.

**Effort**
1 day

**Implementation Steps**
1. Refactor `queues/emailQueue.ts` to export a `startEmailWorker()` function that creates and returns the worker, rather than instantiating it at module load time.
2. Export the worker instance only after `startEmailWorker()` is called.
3. Call `startEmailWorker()` explicitly in `worker.ts` alongside `eventBus.startWorker()` and `scheduleAuditCleanup()`.
4. Update graceful shutdown in `worker.ts` to close the worker returned by `startEmailWorker()`.
5. Verify `NODE_ENV=test` guard is preserved (worker should remain null in test environment).

**Risk Level:** Low. Behavioral change is zero — the worker starts at the same point in the lifecycle. The change is purely structural.

---

## Quick Win #7 — Verify and Document `.env` Gitignore Status

**Architecture Problem**
`backend/.env` appears in the repository directory listing. If this file has been committed to version control with real secrets, all JWT secrets, CSRF secret, database credentials, and API keys are exposed. *(Part 3 §6.4, §8 C1, P0-3)*

**Impact**
Potentially critical. If real secrets are in version control history, the entire system is compromised regardless of other security controls.

**Effort**
< 0.5 days

**Implementation Steps**
1. Verify `backend/.env` is listed in `backend/.gitignore` (or the root `.gitignore`).
2. Run `git log --all --full-history -- backend/.env` to check if the file has ever been committed.
3. If it has been committed: rotate all secrets immediately (JWT_SECRET, JWT_REFRESH_SECRET, PORTAL_JWT_SECRET, CSRF_SECRET, SENDGRID_API_KEY, AWS credentials). Use `git filter-repo` or BFG Repo Cleaner to purge the file from history.
4. If it has not been committed: add `backend/.env` to `.gitignore` if not already present and document this in `CONTRIBUTING.md`.
5. Add a CI check (e.g., `git-secrets` or `truffleHog`) to prevent future secret commits.

**Risk Level:** The verification step is zero-risk. The remediation step (if needed) requires secret rotation and history rewrite, which is a coordinated team operation.

---

## Quick Win #8 — Add `uploads/` to `.dockerignore`

**Architecture Problem**
The `backend/uploads/` directory is committed to the repository for development convenience. It is the local file storage path used when `AWS_S3_BUCKET` is not configured. If not excluded from the Docker build context, it will be copied into production images, potentially including test files and increasing image size unnecessarily. *(Part 1 §3.4, P3-6)*

**Impact**
Deployment hygiene. Production Docker images should not contain local development artifacts.

**Effort**
< 0.5 days

**Implementation Steps**
1. Add `backend/uploads/` (or `uploads/`) to `backend/.dockerignore` (create the file if it does not exist).
2. Verify the production Dockerfile (`infrastructure/docker/Dockerfile.api`) does not explicitly copy the `uploads/` directory.
3. Confirm that the production storage adapter (S3) is selected when `AWS_S3_BUCKET` is set, so the `uploads/` directory is never used in production.
4. Add a `backend/uploads/.gitkeep` if not already present so the directory structure is preserved in the repository without committing its contents.

**Risk Level:** None. No code changes. No behavioral change in production (S3 adapter is used when configured).

---

## Quick Win Summary

| # | Title | Effort | Severity Addressed | Source |
|---|---|---|---|---|
| QW-1 | Fix `VERIFY_USER_ON_REQUEST=false` in `.env.example` | < 0.5 days | 🟧 P1-2 | Part 3 §6.5 |
| QW-2 | Move `AUDIT_LOG_TTL_DAYS` into validated `env` object | 0.5 days | 🟧 P1-3 | Part 3 §6.5, §8 H4 |
| QW-3 | Extract CSRF skip list to named constant | 0.5 days | 🟨 P2-2 | Part 2 §5.4, Part 3 §8 M3 |
| QW-4 | Remove redundant `dotenv.config()` calls | < 0.5 days | 🟩 P3-4 | Part 2 §4.3, Part 3 §8 L1 |
| QW-5 | Resolve `isomorphic-dompurify` (remove or apply) | 0.5–2 days | 🟨 P2-3 | Part 1 §2.2, Part 2 §4.3 |
| QW-6 | Make `emailWorker` startup explicit in `worker.ts` | 1 day | 🟧 P1-7 | Part 2 §5.3 |
| QW-7 | Verify and document `.env` gitignore status | < 0.5 days | 🟥 P0-3 | Part 3 §6.4, §8 C1 |
| QW-8 | Add `uploads/` to `.dockerignore` | < 0.5 days | 🟩 P3-6 | Part 1 §3.4 |

**Total estimated effort: 4–6 days**
**Issues addressed: 2× 🟥 P0, 3× 🟧 P1, 2× 🟨 P2, 2× 🟩 P3**

These eight items can be executed in any order and in parallel. None require new infrastructure, none introduce breaking API changes, and none depend on each other. They represent the highest return on investment relative to effort in the entire roadmap.
