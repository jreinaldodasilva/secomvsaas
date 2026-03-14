# vSaaS Boilerplate — Improvement Schedule

> Tracks all identified improvements, organized into implementation phases.
> Update the status checkbox as each item is completed.

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Done

---

## Phase 1 — Critical Fixes (Stability & Testability)

Items that block testing, cause crashes, or create data integrity risks.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 1.1 | **Move `connectToDatabase()` from `app.ts` to `server.ts`** — DB connection fires at import time, crashing integration tests (`validateEnv` → `process.exit`). App module must be importable without side effects. | High | ✅ |
| 1.2 | **Replace `process.exit(1)` in `validateEnv` with thrown error** — Hard exit kills test runners and workers. Throw an error, let `server.ts` catch and exit. | High | ✅ |
| 1.3 | **Remove old `BaseService`** (`services/base/BaseService.ts`) — Dead code. Superseded by `platform/database/BaseRepository.ts`. Confusing to have both; CLI generator already uses BaseRepository. | High | ✅ |
| 1.4 | **Fix CLI generator test template import paths** — Generated test at `modules/domain/<name>/tests/unit/` imports `../../platform/...` but correct relative path is `../../../../../platform/...`. Same for events mock path. | High | ✅ |

---

## Phase 2 — Infrastructure & DX (Developer Experience)

Items that improve onboarding, local dev, and CI reliability.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 2.1 | **Add setup script / `.env` bootstrapping** — New users hit `validateEnv` errors immediately. Add a `scripts/setup.sh` that copies `.env.example` → `.env` if missing, runs `npm install`, and seeds secrets. | Medium | ✅ |
| 2.2 | **Complete graceful shutdown** — `server.ts` closes HTTP + MongoDB but not Redis or BullMQ. Add `redisClient.quit()` and queue worker cleanup to shutdown sequence. | Medium | ✅ |
| 2.3 | **Align MongoDB versions** — Docker Compose uses `mongo:7`, CI uses `mongo:8`. Pick one and align both. | Medium | ✅ |
| 2.4 | **Align Zod versions** — Root has `zod@^4`, backend has `zod@^3`. Pin both to same major to avoid schema incompatibilities. | Medium | ✅ |
| 2.5 | **Move `@types/react` and `@types/react-dom` to `devDependencies`** — Currently in `dependencies` in root `package.json`. | Low | ✅ |
| 2.6 | **Clean empty frontend directories** — 12 empty placeholder dirs (`LGPD/`, `Navigation/`, `common/`, `Form/`, `Table/`, `Toast/`, `hooks/`, `types/`, `utils/`, `services/base/`, `services/interceptors/`, `Notifications/`). Add `.gitkeep` or remove. | Low | ✅ |
| 2.7 | **Add `.gitkeep` to `backend/src/modules/domain/`** — Preserves directory structure for CLI generator. | Low | ✅ |
| 2.8 | **Verify CI runs platform tests and frontend tests** — Confirm Jest `testMatch` includes platform tests. Confirm `vitest` runs in CI after `npm ci`. | Medium | ✅ |

---

## Phase 3 — Backend Hardening

Items that improve production reliability and security.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 3.1 | **Replace `KEYS` with `SCAN` in `CacheService.invalidatePattern`** — `KEYS` is O(N) and blocks Redis. Use cursor-based `SCAN` iteration. | Medium | ⬜ |
| 3.2 | **Add backend unit tests for tenant middleware** — `resolveTenant`, `setTenantContext`, `requireTenant` have zero test coverage. | Medium | ✅ |
| 3.3 | **Add backend unit tests for tenant service** — `TenantService` CRUD, resolve, suspend/reactivate have zero test coverage. | Medium | ✅ |
| 3.4 | **Fix pre-existing `User.test.ts` import path issue** — Broken import with ts-jest, unrelated to our changes but should be fixed. | Low | ✅ |
| 3.5 | **Fix `auth.test.ts` integration test** — Crashes due to `validateEnv` → `process.exit`. Will be unblocked by 1.1 + 1.2. | Medium | ✅ |

---

## Phase 4 — Frontend Completeness

Items that fill gaps in the frontend boilerplate.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 4.1 | **Add 401 token refresh interceptor to `http.ts`** — No automatic refresh on token expiry. Users get silently logged out. Add retry logic that calls `authService.refresh()` on 401. | Medium | ✅ |
| 4.2 | **Wire Sentry or remove `@sentry/react`** — Installed but never initialized. Either add `Sentry.init()` in `index.tsx` or remove the dependency. | Low | ✅ |
| 4.3 | **Add `/forgot-password` route** — `LoginPage.tsx` links to it but no route exists. Hits 404 catch-all. | Low | ✅ |
| 4.4 | **Wire MSW or remove it** — MSW is installed with worker config but no mock handlers exist. Add `src/mocks/` with handler stubs or remove MSW. | Low | ✅ |

---

## Phase 5 — Documentation & Onboarding

Items that help new users get started quickly.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 5.1 | **Add root `README.md`** — Quickstart: clone → setup → dev → generate first module. Architecture overview, tech stack, project structure. | Medium | ✅ |
| 5.2 | **Add `Makefile` or `justfile`** — Common commands: `make setup`, `make dev`, `make test`, `make generate module=invoices`. | Low | ✅ |
| 5.3 | **Remove last domain-specific TODO** — `cypress/e2e/authentication.cy.ts` line 30: `// TODO: Add domain-specific auth tests here`. | Low | ✅ |

---

## Implementation Order

Recommended execution sequence, grouping items that naturally go together:

```
Batch A (foundation fixes):     1.1 → 1.2 → 1.3 → 1.4
Batch B (unblocked tests):      3.5 → 3.4 → 3.2 → 3.3
Batch C (infra & DX):           2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 → 2.8
Batch D (frontend):             4.1 → 4.2 → 4.3 → 4.4
Batch E (docs & polish):        5.1 → 5.2 → 5.3
```

Batches A and B should be done first — they fix broken tests and remove dead code.
Batches C–E can be parallelized or reordered based on priorities.

---

*Last updated: $(date)*
