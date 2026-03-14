# vSaaS Boilerplate — Improvement Schedule (Phase 2)

> Continuation of the improvement roadmap after Phase 1 completion (28/28 items done).
> Focuses on feature completeness, production readiness, and full-stack DX.

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Done

---

## Phase 6 — Core SaaS Flows

Critical features that every SaaS boilerplate user will need immediately.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 6.1 | **Tenant self-service registration** — Add `POST /api/v1/auth/register` endpoint that creates tenant + owner in one step. Add `/register` frontend page with name, email, password, company name fields. Wire into AuthContext. | High | ✅ |
| 6.2 | **Stripe webhook endpoint** — Add `POST /api/v1/webhooks/stripe` with signature verification (`stripe.webhooks.constructEvent`). Handle `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated/deleted`. Emit billing events via EventBus. | High | ✅ |
| 6.3 | **Replace `KEYS` with `SCAN` in CacheService** — `invalidatePattern` uses `KEYS` which is O(N) and blocks Redis. Replace with cursor-based `SCAN` iteration. | High | ✅ |

---

## Phase 7 — Frontend Architecture

Patterns and hooks that every generated module will depend on.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 7.1 | **Add `useApiQuery` / `useApiMutation` hooks** — Generic React Query wrappers integrating with `http.ts`. Handle loading, error, and cache invalidation consistently. Place in `src/hooks/`. | Medium | ✅ |
| 7.2 | **Add `TenantContext` and `useTenant` hook** — Fetch tenant info (name, plan, features, settings) after login. Expose via context so components can check feature flags and plan limits. | Medium | ✅ |
| 7.3 | **Add `PasswordInput` component with strength indicator** — Reusable input with real-time validation feedback (min length, uppercase, number, special char). Use in registration and reset-password flows. | Medium | ✅ |
| 7.4 | **Extend CLI generator to scaffold frontend files** — Generate `src/services/api/<module>Service.ts` and `src/hooks/use<Module>.ts` (React Query CRUD hooks) alongside backend files. | Medium | ✅ |

---

## Phase 8 — Production Hardening

Items that improve reliability and observability in production.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 8.1 | **Document EventBus scaling path** — Add README/code comments in `eventBus.ts` explaining how to swap to Redis pub/sub or BullMQ events for multi-process deployments. Optionally add a `PersistentEventBus` adapter that writes events to MongoDB for audit/replay. | Medium | ✅ |
| 8.2 | **Add request body logging toggle** — Add `LOG_REQUEST_BODY=true` env var that logs sanitized request bodies via pino-http in development. Respect existing `logSanitizer` to strip sensitive fields. | Low | ✅ |
| 8.3 | **Add full-stack `docker-compose.dev.yml`** — Extend infra compose to also run API and frontend containers. Single `docker compose up` for the entire stack without local Node. | Low | ✅ |

---

## Phase 9 — Testing & Quality

Fill remaining test coverage gaps.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 9.1 | **Expand Cypress e2e tests** — Add tests for forgot-password flow, protected route redirect, and unauthorized access. | Low | ✅ |
| 9.2 | **Add frontend `useHealthCheck` hook** — Polls `/api/health`, exposes `isApiReachable` boolean. Optional `<ConnectionBanner>` component that shows when API is down. | Low | ✅ |

---

## Implementation Order

Recommended execution sequence:

```
Batch F (core SaaS):        6.1 → 6.2 → 6.3
Batch G (frontend arch):    7.1 → 7.2 → 7.3 → 7.4
Batch H (production):       8.1 → 8.2 → 8.3
Batch I (testing):          9.1 → 9.2
```

Batch F should be done first — registration and webhooks are the first things
a user will need after cloning the boilerplate.

Batch G builds the frontend patterns that all generated modules will use.

Batches H and I can be done in any order.

---

*Depends on: Phase 1 schedule (all 28 items complete)*
