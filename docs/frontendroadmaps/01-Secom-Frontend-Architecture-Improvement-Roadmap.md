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

**62 / 100** — Growing → Structured

---

### Key Structural Strengths

1. **Consistent layered architecture.** The codebase enforces a clear data-flow direction: HTTP client → service objects → domain hooks → pages. Each layer has a single responsibility and is independently testable. This is the strongest architectural asset in the codebase. *(Source: Part 2 §7.1)*

2. **Solid infrastructure test coverage.** The HTTP client, auth context, and core UI primitives are comprehensively tested with Vitest + React Testing Library. The token-refresh deduplication logic in `http.ts` is particularly well-implemented and verified. *(Source: Part 2 §7.8)*

3. **RBAC enforced at two independent levels.** Route-level guards (`ProtectedRoute`) and UI-level gates (`PermissionGate`) both derive from a single centralized permission matrix (`config/permissions.ts`), making the access control system auditable and consistent. *(Source: Part 2 §7.5)*

---

### Major Architectural Risks

1. **Duplicate, conflicting global state for theme.** `uiStore.ts` and `ThemeToggle.tsx` maintain two independent Zustand stores writing to different `localStorage` keys. The `data-theme` DOM attribute — which drives the actual visual theme — is only controlled by `ThemeToggle`'s store. The `uiStore` theme value is effectively dead code. This is a latent runtime bug that will surface as soon as any component reads theme from `uiStore` expecting it to match the rendered state. *(Source: Part 2 §5.6)*

2. **Domain pages have zero separation of concerns and zero test coverage.** All seven domain pages bundle list state, modal state, form state, client-side validation, and mutation callbacks into a single component (115–165 LOC each). These are the most business-critical components in the application and have no unit tests. Any regression in a domain page is invisible until it reaches production or E2E. *(Source: Part 1 §3.2, Part 2 §7.4, §7.8)*

3. **Production bundle carries ~215KB of unused dependencies.** `framer-motion` (~140KB gzipped), `@stripe/stripe-js` (~50KB), and `react-hook-form` (~25KB) are declared as production dependencies with no observable usage. If tree-shaking fails or is incomplete, these inflate every user's initial load. Beyond bundle size, they expand the security attack surface and create a misleading dependency contract. *(Source: Part 1 §4.3, §4.4)*

---

### Estimated Investment

| Item | Developer-Days |
|---|---|
| Phase 1 — Stabilization | 5–7 days |
| Phase 2 — Structural Hardening | 12–16 days |
| Phase 3 — Scalability & Performance | 10–13 days |
| Phase 4 — Architecture Maturity | 8–11 days |
| **Total** | **35–47 developer-days** |

- **Timeline:** 14 weeks (7 sprints × 2 weeks), parallelizable across 2–3 engineers
- **Confidence:** Medium — estimates assume no feature freeze; actual effort depends on domain page complexity discovered during refactor
- **Risk if delayed:** The duplicate state bug (Issue P0-01) will manifest as a visible defect as the application grows. The zero-test domain layer (Issue P1-02) means any refactor or new feature in domain pages carries unquantified regression risk.

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
| P0-01 | **Duplicate, conflicting Zustand theme stores.** `uiStore` and `ThemeToggle` maintain independent stores with different `localStorage` keys. The `data-theme` DOM attribute is only set by `ThemeToggle`'s store; `uiStore`'s theme value is dead. Any component reading theme from `uiStore` will receive a value that does not match the rendered state. | Global state inconsistency; latent visual bug; any future theme-aware component will behave incorrectly | State management | 0.5 days | None | Part 1 §3.2 (store), Part 2 §5.6 |
| P0-02 | **RBAC role list in `UsersPage` does not match the canonical permission system.** `UsersPage.tsx` defines `ROLES = ['admin', 'manager', 'staff']` locally. The system roles are `admin`, `assessor`, `social_media`, `atendente`, `citizen`. The invite form allows assigning roles that do not exist in `config/permissions.ts`, producing users with unresolvable permissions. | Data integrity; users created with invalid roles will have undefined permission behavior | RBAC / Security layer | 0.5 days | None | Part 2 §7.5 |

---

### 2.3 🟧 P1 — Scalability / Maintainability Risks

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| P1-01 | **Domain page components mix all concerns in a single file.** All 7 domain pages bundle list state, modal state, form state, validation logic, mutation callbacks, and toast triggers into one component (115–165 LOC). No form components, no validator functions, no separation. | Untestable business logic; high change-risk; linear complexity growth as forms gain fields | Component architecture / Layer separation | 6–8 days | None (can be done incrementally) | Part 1 §3.2, Part 2 §7.4 |
| P1-02 | **Zero test coverage for domain pages, domain hooks, and service layer.** The most business-critical code (7 domain pages, 7 domain hooks, 8 service objects) has no unit tests. Infrastructure is well-tested; domain logic is not. | Any change to domain code carries unquantified regression risk; no safety net for refactoring | Testing architecture | 5–7 days | P1-01 (easier to test after separation) | Part 2 §7.8 |
| P1-03 | **Single global error boundary covers the entire application.** One `ErrorBoundary` at the root means any render error in any page component unmounts the entire application. No per-route or per-layout containment. | Full application outage from a single page-level render error; poor fault isolation | Resilience / Error handling | 1–2 days | None | Part 2 §5.4, §8 (M6) |
| P1-04 | **No production build step in CI pipeline.** The CI workflow runs type-check, lint, and unit tests but never executes `vite build`. A build-time failure (e.g., a Rollup plugin error, a chunk configuration issue) is not caught until deployment. | Silent build failures reach deployment; no bundle integrity verification | Build / CI | 0.5 days | None | Part 2 §6.5 |
| P1-05 | **~215KB of unused production dependencies in `package.json`.** `framer-motion` (~140KB gzipped), `@stripe/stripe-js` (~50KB), `react-hook-form` (~25KB) are declared as production dependencies with no observable usage in source. | Bundle size inflation if tree-shaking is incomplete; expanded security attack surface; misleading dependency contract | Dependency management / Bundle | 0.5 days | None | Part 1 §4.3, §4.4 |
| P1-06 | **Monolithic `global.css` (610 LOC) with no scoping strategy.** All component styles live in a single file with global class names. No CSS Modules, no scoped styles. Adding new domain modules grows this file linearly with no organizational boundary. | Style collision risk as codebase grows; no encapsulation; difficult to audit which styles belong to which component | CSS architecture / Scalability | 4–6 days | None (can be done incrementally) | Part 1 §3.2 (styles), §3.4 |
| P1-07 | **i18n `t()` function used as a plain import in UI components, causing stale renders on locale change.** `DataTable`, `Modal`, `ConnectionBanner`, and `PasswordInput` import `t` directly rather than via `useTranslation()`. These components do not subscribe to the i18n store and will display stale translations after a locale switch. | Broken locale switching in core UI primitives; user-visible defect | i18n architecture / State | 1 day | None | Part 2 §7.6 |

---

### 2.4 🟨 P2 — Structural Improvements

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| P2-01 | **No environment variable validation at startup.** Only `VITE_API_URL` is consumed in source. No startup check validates its presence or format. A missing or malformed value causes silent runtime failures rather than a fast, descriptive error. | Operational risk in deployment; difficult to diagnose misconfiguration | Environment config | 0.5 days | None | Part 2 §6.1, §8 (M5) |
| P2-02 | **`eslint-config-react-app` (CRA artifact) used in a Vite project.** The ESLint config extends a Create React App base that pulls in CRA-specific rules and peer dependencies misaligned with the actual toolchain. | Incorrect lint rules; misleading toolchain signal; potential false positives/negatives | Build tooling | 1 day | None | Part 1 §4.2, §8 (M3) |
| P2-03 | **`@tanstack/react-query-devtools` listed under `dependencies` instead of `devDependencies`.** The devtools package is a development tool and should not be in the production dependency list. | Misleading dependency contract; risk of accidental production inclusion | Dependency management | 0.5 days | None | Part 1 §4.1, §8 (M4) |
| P2-04 | **`TenantProvider` has an implicit runtime dependency on `AuthProvider` ordering.** `TenantProvider` calls `useAuth()` internally, creating an undocumented coupling. Reversing the provider order in `App.tsx` would cause a runtime crash with no compile-time warning. | Fragile provider composition; onboarding risk; silent failure mode | Bootstrap / Provider architecture | 0.5 days | None | Part 2 §5.6 |
| P2-05 | **Empty placeholder directories create structural noise.** Eight directories contain only `.gitkeep`: `components/common/`, `Navigation/`, `Notifications/`, `UI/Form/`, `UI/Toast/`, `services/base/`, `services/interceptors/`, `src/types/`, `src/utils/`. | Misleading project structure; onboarding confusion; unclear architectural intent | Project structure | 0.5 days | None | Part 1 §3.2, §8 (L1) |
| P2-06 | **`.env.example` contains 7 variables not consumed in source.** `VITE_DISABLE_MSW`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_SENTRY_DSN`, `VITE_VERSION`, `VITE_ENV`, `VITE_FEATURE_BILLING`, `VITE_FEATURE_PORTAL` are declared but unused. Inherited from boilerplate without pruning. | Onboarding confusion; false expectation of implemented features; misleading operational contract | Environment config | 0.5 days | None | Part 2 §6.1, §8 (L4) |
| P2-07 | **`zod` referenced in Vite manual chunk config but not used in source.** The `forms: ['zod']` entry in `vite.config.ts` produces a chunk that is empty or near-empty, adding a spurious network request on page load. | Wasted HTTP request; misleading build output | Build / Bundling | 0.5 days | None | Part 1 §4.1, Part 2 §6.3 |
| P2-08 | **No E2E test coverage for domain modules in CI.** The only Cypress spec covers authentication. Domain module flows (CRUD operations) have no automated E2E verification. CI does not run Cypress at all. | No end-to-end regression detection for primary application functionality | Testing architecture / CI | 3–4 days | None | Part 2 §7.8, §6.5 |
| P2-09 | **No source maps configured for production builds.** `vite.config.ts` has no `sourcemap` setting, defaulting to `false`. Production errors cannot be traced to source locations. | Undebuggable production errors; operational risk | Build / Observability | 0.5 days | None | Part 2 §6.3 |

---

### 2.5 🟩 P3 — Optimization & Future Enhancements

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| P3-01 | **`react-icons` at v4; v5 provides improved tree-shaking.** Current usage of `Md*` icons is compatible with v5 API. | Minor bundle size improvement | Dependency management | 0.5 days | None | Part 1 §4.1 |
| P3-02 | **i18n store lives in `src/i18n/` rather than `src/store/`.** Minor organizational inconsistency — all other Zustand stores are in `src/store/`. | Structural consistency; discoverability | Project structure | 0.5 days | None | Part 1 §3.2 |
| P3-03 | **UI component barrel export (`components/UI/index.ts`) may hinder tree-shaking.** All UI primitives are re-exported from a single barrel. If the bundler cannot statically analyze the barrel, unused components may be included in page chunks. | Potential bundle size overhead in page chunks | Bundle architecture | 1 day | None | Part 2 §7.3 |
| P3-04 | **No `chunkSizeWarningLimit` or explicit build `target` configured.** Vite defaults are used for chunk size warnings (500KB) and output target (`modules`). As the application grows, these defaults may not reflect actual requirements. | Build output not explicitly governed | Build configuration | 0.5 days | None | Part 2 §6.3 |
| P3-05 | **`ErrorBoundary` fallback message is hardcoded in Portuguese, bypassing i18n.** The root error boundary displays `"Algo deu errado"` regardless of the active locale. | Minor i18n inconsistency at the error boundary level | i18n / Resilience | 0.5 days | P0-01 resolved | Part 2 §5.2 |

---

## 3. Frontend Architecture Technical Debt Assessment

### 3.1 Debt by Category

| Category | Description | Risk if Ignored | Effort Estimate | Priority | Source |
|---|---|---|---|---|---|
| **State management debt** | Two independent Zustand stores for theme with conflicting `localStorage` keys. `uiStore` theme value is dead. | Latent visual bug; any theme-aware component added will behave incorrectly | 0.5 days | P0 | Part 2 §5.6 |
| **Component coupling debt** | Domain pages mix list state, form state, validation, and mutation callbacks in a single component. No form extraction, no validator separation. | Untestable domain logic; high change-risk; linear complexity growth | 6–8 days | P1 | Part 2 §7.4 |
| **Structural layering debt** | RBAC role list in `UsersPage` is locally defined and diverges from the canonical permission system. | Users created with invalid roles; undefined permission behavior | 0.5 days | P0 | Part 2 §7.5 |
| **Resilience & fault handling debt** | Single root error boundary covers the entire application. No per-route or per-layout containment. | Full application outage from a single page render error | 1–2 days | P1 | Part 2 §5.4 |
| **Build & bundling debt** | No build step in CI; `zod` manual chunk is empty; no source maps; no chunk size governance. | Silent build failures reach deployment; undebuggable production errors | 1.5–2 days | P1/P2 | Part 2 §6.3, §6.5 |
| **Dependency management debt** | ~215KB of unused production dependencies (framer-motion, Stripe, react-hook-form). `@tanstack/react-query-devtools` in wrong dependency group. `eslint-config-react-app` misaligned with Vite. | Bundle inflation; expanded attack surface; misleading toolchain | 2–3 days | P1/P2 | Part 1 §4.3, §4.4 |
| **Environment configuration debt** | No startup validation for `VITE_API_URL`. `.env.example` contains 7 unused variables inherited from boilerplate. | Silent misconfiguration failures; onboarding confusion | 1 day | P2 | Part 2 §6.1 |
| **i18n architecture debt** | `t()` imported as a plain function in 4 UI components (`DataTable`, `Modal`, `ConnectionBanner`, `PasswordInput`). Components do not re-render on locale change. | Stale translations in core UI primitives after locale switch | 1 day | P1 | Part 2 §7.6 |
| **Scalability constraints** | Monolithic `global.css` (610 LOC) with no scoping strategy. Grows linearly with new modules. | Style collision risk; no encapsulation; difficult to audit | 4–6 days | P1 | Part 1 §3.4 |
| **Observability gaps** | No source maps in production. No Sentry or equivalent error tracking wired up (DSN declared in `.env.example` but not implemented). No coverage thresholds in CI. | Undebuggable production errors; no error visibility | 2–3 days | P2 | Part 2 §6.3, §6.5 |
| **Testing architecture debt** | Domain pages (7), domain hooks (7), and service objects (8) have zero unit tests. E2E covers auth only; no domain module E2E. | Unquantified regression risk for all primary functionality | 8–11 days | P1/P2 | Part 2 §7.8 |
| **Project structure debt** | 8 empty placeholder directories. i18n store outside `src/store/`. | Structural noise; onboarding confusion | 1 day | P2/P3 | Part 1 §3.2 |

---

### 3.2 Debt Summary

| Metric | Value |
|---|---|
| Total estimated developer-days | **28–40 days** |
| Confidence level | **Medium** |
| P0 items (must fix) | 2 issues — 1 day total |
| P1 items (fix this quarter) | 7 issues — 18–26 days total |
| P2 items (fix this half) | 9 issues — 8–12 days total |
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

### Phase 1 — Stabilization (Weeks 1–2)

**Goal:** Eliminate active bugs and structural instability. Zero-effort blockers that affect correctness today.

**Included issues:**

| Issue | Description | Effort |
|---|---|---|
| P0-01 | Consolidate duplicate theme stores into a single Zustand store with a single `localStorage` key | 0.5 days |
| P0-02 | Fix `UsersPage` role list to reference canonical `ROLES` from `config/permissions.ts` | 0.5 days |
| P1-04 | Add `npm run build` step to CI pipeline | 0.5 days |
| P1-05 | Remove unused production dependencies: `framer-motion`, `@stripe/*`, `react-hook-form`, `@hookform/resolvers` | 0.5 days |
| P2-03 | Move `@tanstack/react-query-devtools` to `devDependencies` | 0.5 days |
| P2-07 | Remove `forms: ['zod']` manual chunk from `vite.config.ts` | 0.5 days |
| P2-05 | Remove or document empty placeholder directories | 0.5 days |
| P2-06 | Prune `.env.example` to reflect actual consumed variables | 0.5 days |

**Total effort:** ~4 days (parallelizable across 2 engineers in 1 sprint)

**Dependencies:** None — all items are independent.

**Business impact:** Eliminates the active RBAC data inconsistency (P0-02) that allows creating users with invalid roles. Removes ~215KB of potential bundle weight. Establishes CI build verification. Low risk, high return.

---

### Phase 2 — Structural Hardening (Weeks 3–6)

**Goal:** Fix layer separation, state architecture, i18n correctness, resilience patterns, and environment configuration. Address the structural issues that will compound as the application grows.

**Included issues:**

| Issue | Description | Effort |
|---|---|---|
| P1-07 | Fix i18n stale render: migrate `DataTable`, `Modal`, `ConnectionBanner`, `PasswordInput` to use `useTranslation()` internally | 1 day |
| P1-03 | Add per-layout error boundaries (`DashboardLayout`, `PublicLayout`, `AuthLayout`) to contain page-level failures | 1–2 days |
| P2-01 | Add startup environment variable validation (`src/config/env.ts`) with fast-fail on missing `VITE_API_URL` | 0.5 days |
| P2-02 | Replace `eslint-config-react-app` with `@typescript-eslint` + `eslint-plugin-react` + `eslint-plugin-react-hooks` | 1 day |
| P2-04 | Document `TenantProvider` → `AuthProvider` dependency; add a runtime assertion or comment guard | 0.5 days |
| P2-09 | Configure source maps for production builds in `vite.config.ts` | 0.5 days |
| P1-01 (start) | Begin domain page separation: extract form components and validator functions for 3–4 domain pages (PressReleases, Appointments, Events, MediaContacts) | 4–5 days |

**Total effort:** ~9–11 days (2 engineers across 2 sprints)

**Dependencies:** Phase 1 complete (P1-05 removes unused deps before ESLint config change).

**Business impact:** Eliminates stale translation bug in core UI components. Prevents full-application outage from single page errors. Establishes environment safety net. Begins the domain page separation that enables testing.

---

### Phase 3 — Scalability & Performance (Weeks 7–10)

**Goal:** Complete domain page separation, establish test coverage for domain logic, address CSS scalability, and close observability gaps.

**Included issues:**

| Issue | Description | Effort |
|---|---|---|
| P1-01 (complete) | Complete domain page separation for remaining 3 domain pages (Clippings, CitizenPortal, SocialMedia) + Users admin page | 3–4 days |
| P1-02 | Add unit tests for domain hooks (7 hooks) and domain page form components (post-separation) | 4–5 days |
| P2-08 | Add Cypress E2E spec for at least one domain module (PressReleases CRUD); add Cypress step to CI | 2–3 days |
| P1-06 (start) | Begin CSS scoping migration: convert 3–4 high-traffic components to CSS Modules | 2–3 days |
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
Week  1–2   Phase 1: Stabilization
            ├── Fix duplicate theme state (P0-01)
            ├── Fix RBAC role inconsistency (P0-02)
            ├── Add CI build step (P1-04)
            ├── Remove unused dependencies (P1-05)
            └── Cleanup: devDeps, chunks, placeholders, .env.example

Week  3–4   Phase 2: Structural Hardening (part 1)
            ├── Fix i18n stale renders (P1-07)
            ├── Add per-layout error boundaries (P1-03)
            ├── Add env validation (P2-01)
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
| **Duplicate global state stores** | 2 theme stores (conflicting) | 1 unified theme store | Manual audit of Zustand store count | Phase 1 |
| **Unused production dependencies** | 4+ packages (~215KB potential) | 0 unused production deps | `npm ls --prod` + bundle analyzer | Phase 1 |
| **CI build verification** | Not present | Build step in every CI run | CI pipeline log | Phase 1 |
| **RBAC role consistency** | 1 divergent local role list | 0 locally-defined role lists | Code search for hardcoded role arrays | Phase 1 |
| **Error boundary coverage** | 1 root boundary (0% route coverage) | 100% of layout-level routes covered | Code audit of layout components | Phase 2 |
| **i18n stale render components** | 4 components with direct `t()` import | 0 components with direct `t()` import outside hooks | Code search for `import { t }` in non-hook files | Phase 2 |
| **Domain pages with mixed concerns** | 7 of 7 pages (100%) | 0 pages mixing form + list + mutation logic | Code audit of `pages/Domain/` | Phase 3 |
| **Domain layer test coverage** | 0% (0 of 22 domain files tested) | ≥70% line coverage on domain hooks and form components | `vitest --coverage` report | Phase 3 |
| **E2E domain module coverage** | 0 domain specs | ≥1 domain module with full CRUD E2E spec | Cypress spec count | Phase 3 |
| **CSS scoping** | 0% scoped (610 LOC global) | 100% of component styles in CSS Modules | File count of `.module.css` files | Phase 4 |
| **Production source maps** | Not configured | Source maps generated and stored per release | Build output inspection | Phase 2 |
| **Empty placeholder directories** | 8 directories | 0 empty placeholder directories | Directory listing | Phase 1 |
| **CI coverage threshold** | Not enforced | Minimum 70% line coverage enforced in CI | CI pipeline failure on threshold breach | Phase 4 |

---

## 6. Frontend Architecture Maturity Score

### 6.1 Scoring Breakdown

| Dimension | Score | Max | Rationale |
|---|---|---|---|
| **Layering discipline** | 14 | 20 | Clear 5-layer architecture (HTTP → services → hooks → pages) is well-enforced. Deducted for domain pages collapsing multiple layers into one component, and for i18n store living outside `src/store/`. |
| **Component modularity** | 10 | 15 | UI primitives are well-isolated and barrel-exported. Domain pages are monolithic — no form/validator extraction. Empty placeholder directories signal incomplete modularization intent. |
| **State management clarity** | 7 | 15 | TanStack Query + Zustand split is correct and well-applied. Deducted heavily for duplicate theme stores with conflicting keys (active bug), and for i18n `t()` used as a plain function in reactive components. |
| **Scalability readiness** | 8 | 15 | All routes lazy-loaded (strong). Manual chunk strategy is partially correct. Monolithic `global.css` is a scalability ceiling. No CSS scoping. Flat `hooks/` and `services/api/` directories will remain manageable at 2× current scale. |
| **Performance architecture** | 7 | 10 | Lazy loading is fully implemented. Token refresh deduplication is well-designed. Deducted for ~215KB of unused dependencies, empty `zod` chunk, and no source maps. |
| **Resilience & fault handling** | 5 | 10 | HTTP error normalization and token refresh are solid. Single root error boundary with no per-route containment is a significant gap. No observability integration. |
| **Build & deployment maturity** | 6 | 10 | Vite 5 + TypeScript strict mode + Husky pre-commit hooks are strong. No build step in CI, no coverage thresholds, no bundle size checks, no source maps. |
| **Observability integration** | 5 | 5 | `VITE_SENTRY_DSN` declared but not implemented. No frontend error tracking. No Core Web Vitals collection (`web-vitals` declared but unused). Score reflects the gap, not the intent. |

**Total: 62 / 100**

---

### 6.2 Maturity Level

**Current level: Growing → Structured**

The architecture has a solid foundation — the layering is correct, the stack is modern, and the infrastructure is well-tested. It has outgrown "Early" (ad-hoc) but has not yet reached "Structured" because of the active state conflict, the untested domain layer, and the missing operational safeguards (CI build, source maps, observability).

---

### 6.3 Key Blockers Preventing Next Maturity Stage ("Structured")

To reach **Structured (70–79/100)**, the following must be resolved:

| Blocker | Required Action | Phase |
|---|---|---|
| Duplicate theme state (active bug) | Consolidate to single store | Phase 1 |
| Domain pages with zero separation and zero tests | Extract form components; add unit tests | Phases 2–3 |
| Single root error boundary | Add per-layout boundaries | Phase 2 |
| No CI build verification | Add `vite build` to CI | Phase 1 |
| No production source maps | Configure `sourcemap` in `vite.config.ts` | Phase 2 |

To reach **Advanced (80–89/100)**, additionally:

| Blocker | Required Action | Phase |
|---|---|---|
| Monolithic `global.css` | Migrate to CSS Modules | Phase 3–4 |
| No observability integration | Wire Sentry or equivalent | Phase 4 |
| No E2E domain coverage | Add domain Cypress specs | Phase 3 |
| No coverage enforcement in CI | Add coverage thresholds | Phase 4 |
