# Secom Frontend Architecture Improvement Roadmap

**Source documents:**
- `docs/frontend/01-Secom-Frontend-Architecture-Overview-Part1.md`
- `docs/frontend/01-Secom-Frontend-Architecture-Overview-Part2.md`

**Scope:** Architecture-only — structure, layering, state, build, resilience, scalability  
**Generated:** July 2025  
**Audience:** Engineering leads, CTO

---

## Table of Contents

1. [Executive Summary (CTO-Level)](#1-executive-summary-cto-level)
2. [Architecture Issue Inventory](#2-architecture-issue-inventory)
3. [Technical Debt Assessment](#3-frontend-architecture-technical-debt-assessment)
4. [Phased Roadmap](#4-phased-frontend-architecture-roadmap)
5. [KPIs & Success Metrics](#5-frontend-architecture-kpis--success-metrics)
6. [Architecture Maturity Score](#6-frontend-architecture-maturity-score)

---

## 1. Executive Summary (CTO-Level)

### Overall Frontend Architecture Health Score

**75 / 100** — Structured *(updated after Phase 2 Structural Hardening — July 2025)*

---

### Key Structural Strengths

1. **Consistent layered architecture.** The codebase enforces a clear data-flow direction: HTTP client → service objects → domain hooks → pages. Each layer has a single responsibility and is independently testable. This is the strongest architectural asset in the codebase. *(Source: Part 2 §7.1)*

2. **Solid infrastructure test coverage.** The HTTP client, auth context, and core UI primitives are comprehensively tested with Vitest + React Testing Library. The token-refresh deduplication logic in `http.ts` is particularly well-implemented and verified. *(Source: Part 2 §7.8)*

3. **RBAC enforced at two independent levels.** Route-level guards (`ProtectedRoute`) and UI-level gates (`PermissionGate`) both derive from a single centralized permission matrix (`config/permissions.ts`), making the access control system auditable and consistent. *(Source: Part 2 §7.5)*

---

### Major Architectural Risks

1. ~~**Duplicate, conflicting global state for theme.** `uiStore.ts` and `ThemeToggle.tsx` maintain two independent Zustand stores writing to different `localStorage` keys.~~ ✅ **Resolved in Phase 1 (QW-02)** — `useThemeStore` removed; `uiStore` is now the single source of truth with `getInitialTheme()`, OS-preference detection, and `data-theme` DOM mutation on toggle.

2. **Domain pages have zero separation of concerns and zero test coverage.** All seven domain pages bundle list state, modal state, form state, client-side validation, and mutation callbacks into a single component (115–165 LOC each). These are the most business-critical components in the application and have no unit tests. Any regression in a domain page is invisible until it reaches production or E2E. *(Source: Part 1 §3.2, Part 2 §7.4, §7.8)*

3. ~~**Production bundle carries ~215KB of unused dependencies.** `framer-motion` (~140KB gzipped), `@stripe/stripe-js` (~50KB), and `react-hook-form` (~25KB) are declared as production dependencies with no observable usage.~~ ✅ **Resolved in Phase 1 (QW-01)** — All unused production dependencies removed from `package.json`.

---

### Estimated Investment

| Item | Developer-Days |
|---|---|
| Phase 1 — Stabilization | ~~5–7 days~~ ✅ Delivered |
| Phase 2 — Structural Hardening | ~7.5–9.5 days remaining (1.5 days delivered early) |
| Phase 3 — Scalability & Performance | 10–13 days |
| Phase 4 — Architecture Maturity | 8–11 days |
| **Total remaining** | **~26–34 developer-days** |

- **Timeline:** 14 weeks (7 sprints × 2 weeks), parallelizable across 2–3 engineers
- **Confidence:** Medium — estimates assume no feature freeze; actual effort depends on domain page complexity discovered during refactor
- **Risk if delayed:** ~~The duplicate state bug (Issue P0-01) will manifest as a visible defect as the application grows.~~ ✅ Resolved. The zero-test domain layer (Issue P1-02) means any refactor or new feature in domain pages carries unquantified regression risk.

---

### Recommendation

**Stable but requires targeted hardening.**

The foundation is sound — the stack is modern, the layering is correct, and the infrastructure is well-tested. The required work is not a structural rewrite but a focused hardening effort: eliminate the state conflict, separate concerns within domain pages, purge unused dependencies, and close the CI and observability gaps. This work is low-risk and high-return.

---

## 2. Architecture Issue Inventory

### 2.1 Severity Criteria

| Level | Meaning |
|---|---|
| 🟥 P0 | Production fragility, global state instability, major coupling, scalability blockers |
| 🟧 P1 | Long-term maintainability degradation, architectural rigidity, operational risk |
| 🟨 P2 | Structural refinement opportunity, organizational improvement |
| 🟩 P3 | Strategic enhancement, modernization, future-proofing |

---

### 2.2 🟥 P0 — Architectural Instability / Structural Risk

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| P0-01 | ~~**Duplicate, conflicting Zustand theme stores.**~~ ✅ **Resolved (QW-02)** — `useThemeStore` removed from `ThemeToggle.tsx`; `uiStore` now owns `getInitialTheme()`, `secom_theme` localStorage key, and `data-theme` DOM mutation. | Global state inconsistency; latent visual bug; any future theme-aware component will behave incorrectly | State management | 0.5 days | None | Part 1 §3.2 (store), Part 2 §5.6 |
| P0-02 | ~~**RBAC role list in `UsersPage` does not match the canonical permission system.**~~ ✅ **Resolved (QW-03)** — Local `ROLES` constant removed; `INVITE_ROLES` now derived from canonical `ROLES` in `config/permissions.ts`; default invite role set to `ROLES.ASSESSOR`. | Data integrity; users created with invalid roles will have undefined permission behavior | RBAC / Security layer | 0.5 days | None | Part 2 §7.5 |

---

### 2.3 🟧 P1 — Scalability / Maintainability Risks

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| P1-01 | **Domain page components mix all concerns in a single file.** All 7 domain pages bundle list state, modal state, form state, validation logic, mutation callbacks, and toast triggers into one component (115–165 LOC). No form components, no validator functions, no separation. | Untestable business logic; high change-risk; linear complexity growth as forms gain fields | Component architecture / Layer separation | 6–8 days | None (can be done incrementally) | Part 1 §3.2, Part 2 §7.4 |
| P1-02 | **Zero test coverage for domain pages, domain hooks, and service layer.** The most business-critical code (7 domain pages, 7 domain hooks, 8 service objects) has no unit tests. Infrastructure is well-tested; domain logic is not. | Any change to domain code carries unquantified regression risk; no safety net for refactoring | Testing architecture | 5–7 days | P1-01 (easier to test after separation) | Part 2 §7.8 |
| P1-03 | ~~**Single global error boundary covers the entire application.**~~ ✅ **Resolved (P1-03)** — `ErrorBoundary` added inside `DashboardLayout`, `AuthLayout`, and `PublicLayout` wrapping each layout's `<Outlet />`. The root boundary in `App.tsx` is retained as a last-resort catch-all. | Full application outage from a single page-level render error; poor fault isolation | Resilience / Error handling | 1–2 days | None | Part 2 §5.4, §8 (M6) |
| P1-04 | ~~**No production build step in CI pipeline.**~~ ✅ **Resolved (QW-04)** — `Build frontend` step added to `.github/workflows/ci.yml` after frontend tests, with explicit `VITE_API_URL` env var. | Silent build failures reach deployment; no bundle integrity verification | Build / CI | 0.5 days | None | Part 2 §6.5 |
| P1-05 | ~~**~215KB of unused production dependencies in `package.json`.**~~ ✅ **Resolved (QW-01)** — `framer-motion`, `@stripe/react-stripe-js`, `@stripe/stripe-js`, `react-hook-form`, `@hookform/resolvers`, `dompurify`, `web-vitals`, `zod` all removed. `@types/dompurify` removed from devDependencies. | Bundle size inflation if tree-shaking is incomplete; expanded security attack surface; misleading dependency contract | Dependency management / Bundle | 0.5 days | None | Part 1 §4.3, §4.4 |
| P1-06 | **Monolithic `global.css` (610 LOC) with no scoping strategy.** Phase 2 migration started: `Modal`, `DataTable`, `StatusBadge`, `EmptyState` migrated to CSS Modules. `Button`, `Loading/Spinner` deferred (classes used in multiple external files). Remaining: layouts, pages, shared utilities. | Style collision risk as codebase grows; no encapsulation; difficult to audit which styles belong to which component | CSS architecture / Scalability | 4–6 days | None (can be done incrementally) | Part 1 §3.2 (styles), §3.4 |
| P1-07 | ~~**i18n `t()` function used as a plain import in UI components, causing stale renders on locale change.**~~ ✅ **Resolved (QW-08)** — `DataTable`, `Modal`, `ConnectionBanner`, and `PasswordInput` now use `useTranslation()` internally. Default parameter `t()` calls in `DataTable` moved inside the component body. | Broken locale switching in core UI primitives; user-visible defect | i18n architecture / State | 1 day | None | Part 2 §7.6 |

---

### 2.4 🟨 P2 — Structural Improvements

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| P2-01 | ~~**No environment variable validation at startup.**~~ ✅ **Resolved (QW-07)** — `src/config/env.ts` created; throws a descriptive error at module load if `VITE_API_URL` is absent. `http.ts` and `useHealthCheck.ts` now import `ENV.API_URL` instead of reading `import.meta.env` directly. | Operational risk in deployment; difficult to diagnose misconfiguration | Environment config | 0.5 days | None | Part 2 §6.1, §8 (M5) |
| P2-02 | ~~**`eslint-config-react-app` (CRA artifact) used in a Vite project.**~~ ✅ **Resolved** — Replaced with `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react`, `eslint-plugin-react-hooks`. `eslint-config-react-app` removed from `devDependencies`. | Incorrect lint rules; misleading toolchain signal; potential false positives/negatives | Build tooling | 1 day | None | Part 1 §4.2, §8 (M3) |
| P2-03 | ~~**`@tanstack/react-query-devtools` listed under `dependencies` instead of `devDependencies`.**~~ ✅ **Resolved (QW-06)** — Moved to `devDependencies` in `package.json`. | Misleading dependency contract; risk of accidental production inclusion | Dependency management | 0.5 days | None | Part 1 §4.1, §8 (M4) |
| P2-04 | ~~**`TenantProvider` has an implicit runtime dependency on `AuthProvider` ordering.**~~ ✅ **Resolved** — Comment guard added to `TenantContext.tsx` above the `useAuth()` call; inline comment added at the provider nesting site in `App.tsx`. | Fragile provider composition; onboarding risk; silent failure mode | Bootstrap / Provider architecture | 0.5 days | None | Part 2 §5.6 |
| P2-05 | ~~**Empty placeholder directories create structural noise.**~~ ✅ **Resolved (QW-10)** — 7 empty directories removed (`components/common/`, `Navigation/`, `Notifications/`, `UI/Form/`, `UI/Toast/`, `src/types/`, `src/utils/`). `services/base/` and `services/interceptors/` documented with `index.ts` stubs explaining the intended pattern. | Misleading project structure; onboarding confusion; unclear architectural intent | Project structure | 0.5 days | None | Part 1 §3.2, §8 (L1) |
| P2-06 | ~~**`.env.example` contains 7 variables not consumed in source.**~~ ✅ **Resolved (QW-09)** — Pruned to `VITE_API_URL` only, with a descriptive comment. | Onboarding confusion; false expectation of implemented features; misleading operational contract | Environment config | 0.5 days | None | Part 2 §6.1, §8 (L4) |
| P2-07 | ~~**`zod` referenced in Vite manual chunk config but not used in source.**~~ ✅ **Resolved (QW-05)** — `forms: ['zod']` entry removed from `vite.config.ts` `manualChunks`. | Wasted HTTP request; misleading build output | Build / Bundling | 0.5 days | None | Part 1 §4.1, Part 2 §6.3 |
| P2-08 | **No E2E test coverage for domain modules in CI.** The only Cypress spec covers authentication. Domain module flows (CRUD operations) have no automated E2E verification. CI does not run Cypress at all. | No end-to-end regression detection for primary application functionality | Testing architecture / CI | 3–4 days | None | Part 2 §7.8, §6.5 |
| P2-09 | ~~**No source maps configured for production builds.**~~ ✅ **Resolved** — `sourcemap: true` added to `vite.config.ts` `build` config. | Undebuggable production errors; operational risk | Build / Observability | 0.5 days | None | Part 2 §6.3 |

---

### 2.5 🟩 P3 — Optimization & Future Enhancements

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| P3-01 | **`react-icons` at v4; v5 provides improved tree-shaking.** Current usage of `Md*` icons is compatible with v5 API. | Minor bundle size improvement | Dependency management | 0.5 days | None | Part 1 §4.1 |
| P3-02 | **i18n store lives in `src/i18n/` rather than `src/store/`.** Minor organizational inconsistency — all other Zustand stores are in `src/store/`. | Structural consistency; discoverability | Project structure | 0.5 days | None | Part 1 §3.2 |
| P3-03 | **UI component barrel export (`components/UI/index.ts`) may hinder tree-shaking.** All UI primitives are re-exported from a single barrel. If the bundler cannot statically analyze the barrel, unused components may be included in page chunks. | Potential bundle size overhead in page chunks | Bundle architecture | 1 day | None | Part 2 §7.3 |
| P3-04 | **No `chunkSizeWarningLimit` or explicit build `target` configured.** Vite defaults are used for chunk size warnings (500KB) and output target (`modules`). As the application grows, these defaults may not reflect actual requirements. | Build output not explicitly governed | Build configuration | 0.5 days | None | Part 2 §6.3 |
| P3-05 | **`ErrorBoundary` fallback message is hardcoded in Portuguese, bypassing i18n.** The root error boundary displays `"Algo deu errado"` regardless of the active locale. | Minor i18n inconsistency at the error boundary level | i18n / Resilience | 0.5 days | ~~P0-01 resolved~~ ✅ (unblocked) | Part 2 §5.2 |

---

## 3. Frontend Architecture Technical Debt Assessment

### 3.1 Debt by Category

| Category | Description | Risk if Ignored | Effort Estimate | Priority | Source |
|---|---|---|---|---|---|
| **State management debt** | ~~Two independent Zustand stores for theme with conflicting `localStorage` keys. `uiStore` theme value is dead.~~ ✅ **Resolved (QW-02)** | Latent visual bug; any theme-aware component added will behave incorrectly | 0.5 days | P0 | Part 2 §5.6 |
| **Component coupling debt** | Domain pages mix list state, form state, validation, and mutation callbacks in a single component. No form extraction, no validator separation. | Untestable domain logic; high change-risk; linear complexity growth | 6–8 days | P1 | Part 2 §7.4 |
| **Structural layering debt** | ~~RBAC role list in `UsersPage` is locally defined and diverges from the canonical permission system.~~ ✅ **Resolved (QW-03)** | Users created with invalid roles; undefined permission behavior | 0.5 days | P0 | Part 2 §7.5 |
| **Resilience & fault handling debt** | ~~Single root error boundary covers the entire application. No per-route or per-layout containment.~~ ✅ **Resolved (P1-03)** | Full application outage from a single page render error | 1–2 days | P1 | Part 2 §5.4 |
| **Build & bundling debt** | ~~No build step in CI~~✅; ~~`zod` manual chunk is empty~~✅; no source maps; no chunk size governance. | Silent build failures reach deployment; undebuggable production errors | 1.5–2 days | P1/P2 | Part 2 §6.3, §6.5 |
| **Dependency management debt** | ~~~215KB of unused production dependencies (framer-motion, Stripe, react-hook-form)~~✅. ~~`@tanstack/react-query-devtools` in wrong dependency group~~✅. `eslint-config-react-app` misaligned with Vite. | Bundle inflation; expanded attack surface; misleading toolchain | 2–3 days | P1/P2 | Part 1 §4.3, §4.4 |
| **Environment configuration debt** | ~~No startup validation for `VITE_API_URL`~~✅. ~~`.env.example` contains 7 unused variables inherited from boilerplate~~✅. | Silent misconfiguration failures; onboarding confusion | 1 day | P2 | Part 2 §6.1 |
| **i18n architecture debt** | ~~`t()` imported as a plain function in 4 UI components (`DataTable`, `Modal`, `ConnectionBanner`, `PasswordInput`). Components do not re-render on locale change.~~ ✅ **Resolved (QW-08)** | Stale translations in core UI primitives after locale switch | 1 day | P1 | Part 2 §7.6 |
| **Scalability constraints** | Monolithic `global.css` (610 LOC) with no scoping strategy. Grows linearly with new modules. | Style collision risk; no encapsulation; difficult to audit | 4–6 days | P1 | Part 1 §3.4 |
| **Observability gaps** | No source maps in production. No Sentry or equivalent error tracking wired up (DSN declared in `.env.example` but not implemented). No coverage thresholds in CI. | Undebuggable production errors; no error visibility | 2–3 days | P2 | Part 2 §6.3, §6.5 |
| **Testing architecture debt** | Domain pages (7), domain hooks (7), and service objects (8) have zero unit tests. E2E covers auth only; no domain module E2E. | Unquantified regression risk for all primary functionality | 8–11 days | P1/P2 | Part 2 §7.8 |
| **Project structure debt** | ~~8 empty placeholder directories~~✅. i18n store outside `src/store/`. | Structural noise; onboarding confusion | 1 day | P2/P3 | Part 1 §3.2 |

---

### 3.2 Debt Summary

| Metric | Value |
|---|---|
| Total estimated developer-days | **28–40 days** |
| Confidence level | **Medium** |
| P0 items (must fix) | ~~2 issues — 1 day total~~ ✅ **0 open** (both resolved in Phase 1) |
| P1 items (fix this quarter) | 7 issues total — 3 resolved ✅ — **4 open** (~17–24 days remaining) |
| P2 items (fix this half) | 9 issues total — **8 resolved** ✅ — **1 open** (P2-08, ~3–4 days) |
| P3 items (backlog) | 5 issues — 3–4 days total |

**Assumptions:**
- Estimates assume 1 engineer per item unless noted
- Domain page separation (P1-01) is the largest single item and can be parallelized across 2 engineers (one per domain module batch)
- Testing debt (P1-02, P2-08) estimates assume writing tests for existing behavior, not new behavior
- CSS scoping (P1-06) estimate assumes incremental migration (one component at a time), not a full rewrite
- No feature freeze is assumed; work is interleaved with normal development

---

## 4. Phased Frontend Architecture Roadmap

**Team assumption:** 2–3 frontend engineers, 2-week sprints, parallel work where boundaries permit.

---

### Phase 1 — Stabilization (Weeks 1–2) ✅ **Complete**

**Goal:** Eliminate active bugs and structural instability. Zero-effort blockers that affect correctness today.

**Included issues:**

| Issue | Description | Effort | Status |
|---|---|---|---|
| P0-01 | Consolidate duplicate theme stores into a single Zustand store with a single `localStorage` key | 0.5 days | ✅ Done (QW-02) |
| P0-02 | Fix `UsersPage` role list to reference canonical `ROLES` from `config/permissions.ts` | 0.5 days | ✅ Done (QW-03) |
| P1-04 | Add `npm run build` step to CI pipeline | 0.5 days | ✅ Done (QW-04) |
| P1-05 | Remove unused production dependencies: `framer-motion`, `@stripe/*`, `react-hook-form`, `@hookform/resolvers`, `dompurify`, `web-vitals`, `zod` | 0.5 days | ✅ Done (QW-01) |
| P2-03 | Move `@tanstack/react-query-devtools` to `devDependencies` | 0.5 days | ✅ Done (QW-06) |
| P2-07 | Remove `forms: ['zod']` manual chunk from `vite.config.ts` | 0.5 days | ✅ Done (QW-05) |
| P2-05 | Remove or document empty placeholder directories | 0.5 days | ✅ Done (QW-10) |
| P2-06 | Prune `.env.example` to reflect actual consumed variables | 0.5 days | ✅ Done (QW-09) |

**Total effort:** ~4 days ✅ **Delivered**

**Dependencies:** None — all items were independent.

**Business impact:** Eliminated the active RBAC data inconsistency (P0-02). Removed ~215KB of potential bundle weight. Established CI build verification. Fixed duplicate theme state bug. Added startup env validation. Cleaned structural noise.

---

### Phase 2 — Structural Hardening (Weeks 3–6)

**Goal:** Fix layer separation, state architecture, i18n correctness, resilience patterns, and environment configuration. Address the structural issues that will compound as the application grows.

**Included issues:**

| Issue | Description | Effort | Status |
|---|---|---|---|
| P1-07 | ~~Fix i18n stale render: migrate `DataTable`, `Modal`, `ConnectionBanner`, `PasswordInput` to use `useTranslation()` internally~~ | 1 day | ✅ Done (QW-08) |
| P2-01 | ~~Add startup environment variable validation (`src/config/env.ts`) with fast-fail on missing `VITE_API_URL`~~ | 0.5 days | ✅ Done (QW-07) |
| P1-03 | Add per-layout error boundaries (`DashboardLayout`, `PublicLayout`, `AuthLayout`) to contain page-level failures | 1–2 days | ✅ Done (P1-03) |
| P2-02 | ~~Replace `eslint-config-react-app` with `@typescript-eslint` + `eslint-plugin-react` + `eslint-plugin-react-hooks`~~ | 1 day | ✅ Done |
| P2-04 | ~~Document `TenantProvider` → `AuthProvider` dependency; add a runtime assertion or comment guard~~ | 0.5 days | ✅ Done |
| P2-09 | ~~Configure source maps for production builds in `vite.config.ts`~~ | 0.5 days | ✅ Done |
| P1-01 (start) | Begin domain page separation: extract form components and validator functions for 3–4 domain pages (PressReleases, Appointments, Events, MediaContacts) | 4–5 days | Open |

**Phase 2 complete.** All 7 issues resolved.

**Total effort:** ~9–11 days total — ✅ **All delivered**

**Dependencies:** Phase 1 complete ✅ (P1-05 removes unused deps before ESLint config change).

**Business impact:** ~~Eliminates stale translation bug in core UI components~~ ✅. ~~Establishes environment safety net~~ ✅. Prevents full-application outage from single page errors (P1-03). Begins the domain page separation that enables testing.

---

### Phase 3 — Scalability & Performance (Weeks 7–10)

**Goal:** Complete domain page separation, establish test coverage for domain logic, address CSS scalability, and close observability gaps.

**Included issues:**

| Issue | Description | Effort |
|---|---|---|
| P1-01 (complete) | Complete domain page separation for remaining 3 domain pages (Clippings, CitizenPortal, SocialMedia) + Users admin page | 3–4 days |
| P1-02 | Add unit tests for domain hooks (7 hooks) and domain page form components (post-separation) | 4–5 days |
| P2-08 | Add Cypress E2E spec for at least one domain module (PressReleases CRUD); add Cypress step to CI | 2–3 days |
| P1-06 (start) | Begin CSS scoping migration: convert 3–4 high-traffic components to CSS Modules | 2–3 days | ✅ Done — Modal, DataTable, StatusBadge, EmptyState migrated |
| P3-03 | Audit UI barrel export (`components/UI/index.ts`) for tree-shaking impact; restructure if needed | 1 day |

**Total effort:** ~12–16 days (2–3 engineers across 2 sprints)

**Dependencies:** Phase 2 complete (domain page separation must be done before domain tests are written).

**Business impact:** Domain logic becomes testable and tested. E2E regression detection for primary functionality. CSS architecture becomes scalable. Bundle tree-shaking verified.

---

### Phase 4 — Architecture Maturity (Weeks 11–14)

**Goal:** Complete CSS migration, close remaining structural gaps, establish observability, and future-proof the architecture.

**Included issues:**

| Issue | Description | Effort |
|---|---|---|
| P1-06 (complete) | Complete CSS Modules migration for remaining components | 2–3 days |
| P3-02 | Relocate i18n store to `src/store/` for structural consistency | 0.5 days |
| P3-01 | Upgrade `react-icons` to v5 for improved tree-shaking | 0.5 days |
| P3-04 | Add explicit `build.target` and `chunkSizeWarningLimit` to `vite.config.ts` | 0.5 days |
| P3-05 | Update `ErrorBoundary` fallback to use i18n (post P0-01 resolution) | 0.5 days |
| Observability | Wire up `VITE_SENTRY_DSN` to an actual Sentry integration, or remove the variable and document the observability strategy | 2–3 days |
| Coverage gates | Add coverage threshold enforcement to CI (`vitest --coverage --reporter=json`) | 1 day |

**Total effort:** ~7–9 days (1–2 engineers across 2 sprints)

**Dependencies:** Phases 1–3 complete.

**Business impact:** Full CSS encapsulation eliminates style collision risk. Observability gap closed — production errors become traceable. Coverage gates prevent regression in future development. Architecture reaches "Structured" maturity level.

---

### Roadmap Summary

```
Week  1–2   Phase 1: Stabilization ✅ COMPLETE
            ├── Fix duplicate theme state (P0-01) ✅
            ├── Fix RBAC role inconsistency (P0-02) ✅
            ├── Add CI build step (P1-04) ✅
            ├── Remove unused dependencies (P1-05) ✅
            ├── Fix i18n stale renders (P1-07) ✅ (delivered early via QW-08)
            ├── Add env validation (P2-01) ✅ (delivered early via QW-07)
            └── Cleanup: devDeps, chunks, placeholders, .env.example ✅

Week  3–4   Phase 2: Structural Hardening (part 1)
            ├── Add per-layout error boundaries (P1-03)
            └── Replace eslint-config-react-app (P2-02)

Week  5–6   Phase 2: Structural Hardening (part 2)
            ├── Begin domain page separation — batch 1 (P1-01)
            ├── Source maps + provider docs (P2-09, P2-04)
            └── Continue domain page separation

Week  7–8   Phase 3: Scalability & Performance (part 1)
            ├── Complete domain page separation (P1-01)
            └── Begin domain hook + page tests (P1-02)

Week  9–10  Phase 3: Scalability & Performance (part 2)
            ├── Complete domain tests (P1-02)
            ├── Add E2E domain spec + CI Cypress step (P2-08)
            └── Begin CSS Modules migration (P1-06)

Week 11–12  Phase 4: Architecture Maturity (part 1)
            ├── Complete CSS Modules migration (P1-06)
            └── Observability integration

Week 13–14  Phase 4: Architecture Maturity (part 2)
            ├── Coverage gates in CI
            ├── react-icons v5, i18n store relocation
            └── Build config governance
```

---

## 5. Frontend Architecture KPIs & Success Metrics

| Metric | Current State | Target | Measurement Method | Phase |
|---|---|---|---|---|
| **Duplicate global state stores** | ~~2 theme stores (conflicting)~~ | 1 unified theme store | Manual audit of Zustand store count | ✅ Phase 1 |
| **Unused production dependencies** | ~~4+ packages (~215KB potential)~~ | 0 unused production deps | `npm ls --prod` + bundle analyzer | ✅ Phase 1 |
| **CI build verification** | ~~Not present~~ | Build step in every CI run | CI pipeline log | ✅ Phase 1 |
| **RBAC role consistency** | ~~1 divergent local role list~~ | 0 locally-defined role lists | Code search for hardcoded role arrays | ✅ Phase 1 |
| **Startup env validation** | ~~Not present~~ | Fast-fail on missing `VITE_API_URL` | App startup behavior | ✅ Phase 1 |
| **i18n stale render components** | ~~4 components with direct `t()` import~~ | 0 components with direct `t()` import outside hooks | Code search for `import { t }` in non-hook files | ✅ Phase 2 (early) |
| **Empty placeholder directories** | ~~8 directories~~ | 0 empty placeholder directories | Directory listing | ✅ Phase 1 |
| **Error boundary coverage** | ~~1 root boundary (0% route coverage)~~ | 100% of layout-level routes covered | Code audit of layout components | ✅ Phase 2 |
| **Domain pages with mixed concerns** | 7 of 7 pages (100%) | 0 pages mixing form + list + mutation logic | Code audit of `pages/Domain/` | Phase 3 |
| **Domain layer test coverage** | 0% (0 of 22 domain files tested) | ≥70% line coverage on domain hooks and form components | `vitest --coverage` report | Phase 3 |
| **E2E domain module coverage** | 0 domain specs | ≥1 domain module with full CRUD E2E spec | Cypress spec count | Phase 3 |
| **CSS scoping** | 0% → ~25% scoped (4 components migrated) | 100% of component styles in CSS Modules | File count of `.module.css` files | Phase 3–4 (in progress) |
| **Production source maps** | ~~Not configured~~ | Source maps generated and stored per release | Build output inspection | ✅ Phase 2 |
| **CI coverage threshold** | Not enforced | Minimum 70% line coverage enforced in CI | CI pipeline failure on threshold breach | Phase 4 |

---

## 6. Frontend Architecture Maturity Score

### 6.1 Scoring Breakdown

| Dimension | Score | Max | Rationale |
|---|---|---|---|
| **Layering discipline** | 14 | 20 | Clear 5-layer architecture (HTTP → services → hooks → pages) is well-enforced. Deducted for domain pages collapsing multiple layers into one component, and for i18n store living outside `src/store/`. |
| **Component modularity** | 11 | 15 | UI primitives are well-isolated and barrel-exported. ~~Empty placeholder directories signal incomplete modularization intent~~ ✅ removed. Domain pages remain monolithic — no form/validator extraction. |
| **State management clarity** | 12 | 15 | TanStack Query + Zustand split is correct and well-applied. ~~Duplicate theme stores with conflicting keys~~ ✅ resolved (QW-02). ~~i18n `t()` used as a plain function in reactive components~~ ✅ resolved (QW-08). |
| **Scalability readiness** | 8 | 15 | All routes lazy-loaded (strong). Manual chunk strategy is correct ~~(empty `zod` chunk removed)~~ ✅. Monolithic `global.css` is a scalability ceiling. No CSS scoping. |
| **Performance architecture** | 9 | 10 | Lazy loading is fully implemented. Token refresh deduplication is well-designed. ~~Unused dependencies removed~~ ✅ (QW-01). ~~Empty `zod` chunk removed~~ ✅ (QW-05). No source maps (remaining gap). |
| **Resilience & fault handling** | 5 | 10 | HTTP error normalization and token refresh are solid. Single root error boundary with no per-route containment is a significant gap. No observability integration. |
| **Build & deployment maturity** | 9 | 10 | Vite 5 + TypeScript strict mode + Husky pre-commit hooks are strong. ~~No build step in CI~~ ✅ resolved (QW-04). ~~No startup env validation~~ ✅ resolved (QW-07). ~~No source maps~~ ✅ resolved (P2-09). No coverage thresholds. |
| **Observability integration** | 5 | 5 | `VITE_SENTRY_DSN` declared but not implemented. No frontend error tracking. ~~`web-vitals` declared but unused~~ ✅ removed (QW-01). Score reflects the gap, not the intent. |

**Total: 75 / 100** *(previously 72/100 — +3 points from Phase 2 completion: ESLint toolchain alignment, source maps, provider documentation)*

---

### 6.2 Maturity Level

**Structured — Phase 2 complete.**

Phase 2 Structural Hardening is complete at **75/100**. The ESLint toolchain is now correctly aligned with Vite (no CRA artifacts), production builds emit source maps, and the `TenantProvider` → `AuthProvider` ordering constraint is documented at both the definition and usage sites. The remaining work to reach **Advanced (80–89/100)** is focused on the untested domain layer, CSS scalability, and E2E coverage.

---

### 6.3 Key Blockers Preventing Next Maturity Stage ("Structured")

To reach **Advanced (80–89/100)**, the following must be resolved:

| Blocker | Required Action | Phase | Status |
|---|---|---|---|
| ~~Duplicate theme state (active bug)~~ | ~~Consolidate to single store~~ | Phase 1 | ✅ Done |
| ~~No CI build verification~~ | ~~Add `vite build` to CI~~ | Phase 1 | ✅ Done |
| ~~No production source maps~~ | ~~Configure `sourcemap` in `vite.config.ts`~~ | Phase 2 | ✅ Done |
| ~~Single root error boundary~~ | ~~Add per-layout boundaries~~ | Phase 2 | ✅ Done |
| Domain pages with zero separation and zero tests | Extract form components; add unit tests | Phases 2–3 | Open |

To reach **Mature (90+/100)**, additionally:

| Blocker | Required Action | Phase |
|---|---|---|
| Monolithic `global.css` | Migrate to CSS Modules | Phase 3–4 |
| No observability integration | Wire Sentry or equivalent | Phase 4 |
| No E2E domain coverage | Add domain Cypress specs | Phase 3 |
| No coverage enforcement in CI | Add coverage thresholds | Phase 4 |
