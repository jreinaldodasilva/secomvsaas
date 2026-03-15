# vSaaS Boilerplate — Improvement Schedule (Phase 4)

> Continuation after Phase 3 completion (14/14 items done).
> Focuses on security enforcement, API consistency, frontend polish, and test coverage.

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Done

---

## Phase 14 — Security & Auth Hardening

Enforce existing security policies and close abuse vectors.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 14.1 | **Enforce password policy** — Add shared `validatePasswordStrength()` using `SECURITY_POLICY` config. Apply in register, accept-invite, reset-password, and change-password flows. Currently only `minLength: 8` is checked. | High | ✅ |
| 14.2 | **Account lockout notification** — Emit `AUTH_EVENTS.ACCOUNT_LOCKED` and queue email when `incLoginAttempts()` triggers a lock. | High | ✅ |
| 14.3 | **Invite rate limiting** — Add dedicated rate limiter to `POST /tenants/:id/invite` (20/hour per tenant). | High | ✅ |

---

## Phase 15 — Data & API Quality

Fix response inconsistencies and type mismatches.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 15.1 | **Fix response envelope double-wrapping** — Audit routes that manually return `{ success, data }` while `responseWrapper` also wraps. Remove manual wrapping or bypass wrapper where needed. | Medium | ✅ |
| 15.2 | **Export InviteToken from models index** — Add to `backend/src/models/index.ts`. | Medium | ✅ |
| 15.3 | **Add `hasNext`/`hasPrev` to backend pagination** — Align `BaseRepository.findPaginated()` output with `PaginatedData` type from `@vsaas/types`. | Medium | ✅ |
| 15.4 | **Fix health endpoint database response time** — Actually measure MongoDB ping time instead of hardcoding `0`. | Medium | ✅ |

---

## Phase 16 — Frontend Polish

Give existing backend features a proper UI.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 16.1 | **Users management page** — `/admin/users` with DataTable, invite modal, role editing, deactivation. | Medium | ✅ |
| 16.2 | **Styled 404 and unauthorized pages** — Replace inline `<div>` placeholders with proper page components. | Medium | ✅ |
| 16.3 | **Loading skeleton for initial auth check** — Show centered spinner or skeleton while `AuthContext.isLoading` is true. | Medium | ✅ |

---

## Phase 17 — Testing Coverage

Cover critical flows that currently have no tests.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 17.1 | **Invitation flow integration tests** — Test `POST /tenants/:id/invite` and `POST /auth/accept-invite`. | Low | ✅ |
| 17.2 | **User management route tests** — Test `GET/PATCH/DELETE /users` with tenant scoping. | Low | ✅ |
| 17.3 | **Email template unit tests** — Verify each template returns valid HTML with expected variables. | Low | ✅ |

---

## Implementation Order

```
Batch N (security):     14.1 → 14.2 → 14.3
Batch O (API quality):  15.1 → 15.2 → 15.3 → 15.4
Batch P (frontend):     16.1 → 16.2 → 16.3
Batch Q (testing):      17.1 → 17.2 → 17.3
```

Batch N first — enforces the password policy that's currently dead code.
Batch O fixes response inconsistencies clients will hit immediately.
Batches P and Q can be done in any order.

---

*Depends on: Phase 3 schedule (all 14 items complete)*
