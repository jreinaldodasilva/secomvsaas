# vSaaS Boilerplate — Improvement Schedule (Phase 3)

> Continuation after Phase 2 completion (13/13 items done).
> Focuses on missing SaaS table-stakes, frontend completeness, backend hardening, and DX.

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Done

---

## Phase 10 — Missing SaaS Table-Stakes

Features every multi-tenant SaaS user expects out of the box.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 10.1 | **User invitation flow** — `POST /tenants/:id/invite` sends email with invite token, `POST /auth/accept-invite` creates user under that tenant. Frontend invite acceptance page. | High | ✅ |
| 10.2 | **User management CRUD** — `GET/PATCH/DELETE /users` for tenant admins to list, update roles, deactivate members. Frontend page with table. | High | ✅ |
| 10.3 | **Email templates + actual sending** — Wire `queueService.sendEmail()` into forgot-password, invite, and welcome flows. Add HTML email templates. | High | ✅ |

---

## Phase 11 — Frontend Completeness

Close remaining UX gaps so every auth and CRUD flow has a working frontend.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 11.1 | **ResetPasswordPage** — `/reset-password?token=xxx` page that calls `POST /auth/reset-password`. | Medium | ✅ |
| 11.2 | **DataTable component** — Reusable table with pagination, sorting, search, loading states. Place in `src/components/UI/Table/`. | Medium | ✅ |
| 11.3 | **Toast/notification system** — Wire `react-hot-toast` (already installed) into a `useToast` hook. Show success/error toasts on mutations. | Medium | ✅ |
| 11.4 | **Profile/settings page** — `/settings/profile` page where users can change name and password. | Medium | ✅ |

---

## Phase 12 — Backend Hardening

Fix resource leaks, improve test reliability, and add production safeguards.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 12.1 | **Refactor TokenBlacklistService** — Replace private Redis connection with shared `redisClient`. Eliminates resource leak and shutdown gap. | Medium | ✅ |
| 12.2 | **Add `.env.test`** — Test-specific env file with deterministic secrets and `VERIFY_USER_ON_REQUEST=false`. Reference in jest setup. | Medium | ✅ |
| 12.3 | **Audit log retention** — BullMQ repeatable job that deletes audit logs older than N days. Add TTL index on `createdAt`. | Medium | ✅ |
| 12.4 | **Rate limiter per-tenant** — Add tenant-aware key generator so one tenant can't exhaust rate limits for others behind shared IPs. | Medium | ✅ |

---

## Phase 13 — DX & Documentation

Make the boilerplate usable by teams and discoverable via API docs.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 13.1 | **Swagger/OpenAPI annotations** — Add `@swagger` JSDoc to auth, tenant, and webhook routes. | Low | ✅ |
| 13.2 | **Seed script** — `npm run seed` creates super_admin + demo tenant for local dev. | Low | ✅ |
| 13.3 | **Contributing guide** — `CONTRIBUTING.md` with module generation workflow, commit conventions, test requirements, PR checklist. | Low | ✅ |

---

## Implementation Order

```
Batch J (SaaS table-stakes):   10.1 → 10.3 → 10.2
Batch K (frontend UX):         11.1 → 11.3 → 11.2 → 11.4
Batch L (hardening):           12.1 → 12.2 → 12.3 → 12.4
Batch M (DX & docs):           13.1 → 13.2 → 13.3
```

Batch J first — invitations + emails complete the tenant onboarding story.
Batch K closes auth UX gaps (reset-password page, toasts).
Batches L and M can be done in any order.

---

*Depends on: Phase 2 schedule (all 13 items complete)*
