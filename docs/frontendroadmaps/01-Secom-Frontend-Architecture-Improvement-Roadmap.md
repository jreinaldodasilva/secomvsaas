# Secom Frontend — Architecture Improvement Roadmap

**Document version:** 1.1  
**Based on:** Architecture Overview Part 1 (§1–§4) and Part 2 (§5–§8)  
**Codebase snapshot:** post-commit `7e3619d` (post quick-wins)  
**Last updated:** All 8 architecture quick wins implemented and closed.  
**Scope:** Architecture-only. No UX, accessibility, or feature-level concerns.

---

## 1. Prioritized Architecture Issues

### Issue ID Convention

`FE-P{tier}-{sequence}` — e.g., `FE-P0-01` = Priority 0, issue 1.

---

### 🟥 P0 — Architectural Instability / Structural Risk

| ID | Issue | Architectural Impact | System Area | Effort | Dependencies | Source | Status |
|---|---|---|---|---|---|---|---|
| ~~FE-P0-01~~ | ~~Provider ordering constraint is comment-only — `TenantProvider` silently breaks if moved above `AuthProvider`~~ | ~~Any provider reorder during refactor causes silent runtime failure in tenant resolution; no compile-time or test-time guard~~ | Bootstrap / Provider Hierarchy | 0.5d | None | Part 2 §5.1 | ✅ **Resolved** — `AppProviders` composition component created; dev-only invariant added to `TenantProvider`; ordering comment removed (QW-7) |
| ~~FE-P0-02~~ | ~~Production source maps publicly exposed (`build.sourcemap: true`)~~ | ~~Full original TypeScript source readable by anyone via browser DevTools on a government-facing application~~ | Build / Security | <0.5h | None | Part 2 §6.2 | ✅ **Resolved** — `build.sourcemap: 'hidden'` in `vite.config.ts` (QW-1) |
| ~~FE-P0-03~~ | ~~RBAC permission map duplicated between `config/permissions.ts` and backend with no shared source of truth~~ | ~~Permission drift between frontend and backend is undetectable at build time; a backend role change silently leaves the frontend showing wrong UI~~ | Module Boundaries / Security | 0.5d | `@vsaas/types` package | Part 1 §1, Part 2 §7.3 | ✅ **Resolved** — `PERMISSIONS`, `ROLE_PERMISSIONS`, helpers moved to `@vsaas/types`; `src/config/permissions.ts` deleted; all consumers updated (QW-6) |

---

### 🟧 P1 — Scalability / Maintainability Risks

| ID | Issue | Architectural Impact | System Area | Effort | Dependencies | Source | Status |
|---|---|---|---|---|---|---|---|
| FE-P1-01 | `CrudPage` abstraction unimplemented — identical CRUD scaffold repeated 7× (~400 LOC duplication) | Every new domain module requires copy-pasting the full DataTable + Modal + ConfirmDialog + state pattern; bugs fixed in one page do not propagate | Component Architecture | 2d | None | Part 1 §3.4, Part 2 §7.2 | ✅ **Completed** — `CrudPage` generic component implemented in `components/UI/CrudPage/CrudPage.tsx`; all 7 domain pages migrated; 8 tests added (FE-P1-01) |
| FE-P1-02 | `TenantContext` fetches via raw `http.get()`, bypassing TanStack Query cache | Tenant data is not deduplicated, not stale-while-revalidate cached, and not invalidatable from other query operations; creates a parallel data-fetching path outside the established server-state layer | State Management / Layer Separation | 1d | None | Part 1 §2.4 | ✅ **Completed** — `tenantService.ts` added to `services/api/`; `TenantContext` migrated to `useQuery`; `refreshTenant` uses `queryClient.invalidateQueries`; `useState`/`useEffect`/raw `http.get()` removed (FE-P1-02) |
| FE-P1-03 | `services/base/` and `services/interceptors/` are empty placeholders — token refresh and error handling are monolithically embedded in `http.ts` | `http.ts` owns fetch, auth headers, token refresh, retry, and error normalization in a single 93-LOC file; cannot be extended or tested in isolation; documented intent to extract has not been acted on | Layer Separation / Services | 1.5d | None | Part 1 §3.4 | ✅ **Completed** — `ApiError` + `buildUrl` + `baseRequest` extracted to `services/base/`; `withRefreshInterceptor` extracted to `services/interceptors/`; `http.ts` reduced to a thin composition layer; all 12 existing http tests pass (FE-P1-03) |
| FE-P1-04 | Single top-level `<Suspense>` boundary for all 20+ lazy routes — full-page spinner on every route transition | All three layout surfaces (Public, Dashboard, CitizenPortal) share one loading state; a slow chunk in any layout degrades the perceived performance of all others | Routing Architecture / Resilience | 0.5d | None | Part 2 §5.3 | ✅ **Completed** — single `<Suspense>` removed; each of the 20+ lazy routes now has its own `<Suspense fallback={<LoadingScreen />}>` boundary scoped to the route element; `LazyFallback` inline component removed (FE-P1-04) |
| FE-P1-05 | `ProtectedRoute` enforces authentication only — no role-based route protection at the routing layer | Any authenticated user of any role can navigate to any staff route by URL; RBAC is enforced only at the component level via `PermissionGate`, with no defence-in-depth at the route boundary | Routing Architecture / Security | 0.5d | ~~FE-P0-03 resolved~~ ✅ | Part 2 §7.3, §7.5 | ✅ **Completed** — `STAFF_ROLES` constant added to `@vsaas/types`; outer dashboard `ProtectedRoute` now guards with `allowedRoles={STAFF_ROLES}`; `citizen` role redirected to `/unauthorized` on all staff routes; 1 test added (FE-P1-05) |
| FE-P1-06 | ESLint v8 at end-of-life (EOL October 2024) — static analysis toolchain is on an unsupported version | No security patches or rule updates for the linting layer; `@typescript-eslint` v8 supports ESLint v9 but the current `.eslintrc.json` flat-config migration has not been done | Build Tooling | 1d | None | Part 1 §4.3 | ✅ **Completed** — ESLint upgraded to v9.39.4; `.eslintrc.json` deleted; `eslint.config.js` flat config created with `globals` package; `react/prop-types` disabled for TS; Vitest globals added for test files; 2 pre-existing errors fixed (`TestimonialsSection` unescaped quotes, `TenantContext` eslint-disable for intentional hook guard); lint scripts updated to directory-based pattern; 0 errors, 65 warnings (FE-P1-06) |
| FE-P1-07 | Form validation logic co-located with page components — no dedicated validation layer | At 7 modules the coupling is manageable; at 15+ modules, form state types, empty-state factories, and validation functions scattered across `pages/Domain/` become a maintenance burden with no reuse path | Component Architecture / Layer Separation | 1d | FE-P1-01 | Part 1 §3.4 | ✅ **Completed** — `src/validation/domain/` layer created with 7 files (one per domain) + barrel `index.ts`; each exports `FormState` type, `emptyForm` constant, `validate*` function, and domain constants (`STATUSES`, `CATEGORIES`, etc.); all 7 `*Form.tsx` files updated to re-export from validation layer; `domain-validators.test.ts` imports updated to point directly to `src/validation/domain`; 227/227 tests pass, `tsc --noEmit` clean (FE-P1-07) |

---

### 🟨 P2 — Structural Improvements

| ID | Issue | Architectural Impact | System Area | Effort | Dependencies | Source | Status |
|---|---|---|---|---|---|---|---|
| ~~FE-P2-01~~ | ~~`useHealthCheck` uses raw `setInterval` instead of TanStack Query `refetchInterval`~~ | ~~Polling continues when the browser tab is hidden; bypasses the established server-state layer for a use case that fits naturally within it~~ | State Management / Observability | 0.5h | None | Part 2 §5.6 | ✅ **Resolved** — migrated to `useQuery` with `refetchInterval: 30_000, refetchIntervalInBackground: false`; `setInterval` removed; 5 tests added (QW-5) |
| FE-P2-02 | `@/*` path alias defined in `tsconfig.json` and `vite.config.ts` but unadopted — all imports use relative paths | Deep relative paths (`../../../components/UI`) will become fragile as the directory tree grows; the alias infrastructure is already in place but unused | Project Structure | 0.5d | None | Part 1 §2.3 | 🔴 Open |
| ~~FE-P2-03~~ | ~~No `VITE_APP_ENV` variable — frontend has no environment awareness~~ | ~~Cannot distinguish staging from production at the frontend level; environment-specific behaviour (banners, feature flags, analytics) requires a build-time workaround~~ | Environment Configuration | 2h | None | Part 2 §6.1 | ✅ **Resolved** — `APP_ENV` added to `ENV` object; `.env.example`, `.env`, and CI build step updated (QW-4) |
| ~~FE-P2-04~~ | ~~Google Fonts loaded via render-blocking `@import` in `global.css`~~ | ~~Blocks First Contentful Paint on every cold load; standard fix (`<link rel="preconnect">` in `index.html`) is well-known and low-effort~~ | Performance Architecture | 1h | None | Part 1 §4.3 | ✅ **Resolved** — `@import` removed from `global.css`; `<link rel="preconnect">` + `<link rel="stylesheet">` added to `index.html` (QW-3) |
| FE-P2-05 | `Breadcrumbs` uses hardcoded `ROUTE_LABELS` map — not wired to the i18n `t()` system | Creates a second source of UI strings outside the i18n layer; any label change requires editing two locations | Component Architecture / i18n | 2h | None | Part 2 §7.2 | 🔴 Open |
| FE-P2-06 | `FormField` UI component exists but is not used by any domain form — domain forms use raw `<label>/<input>` elements | The design system has a form primitive that is not adopted; form layout, error display, and attribute consistency vary across domain forms | Component Architecture | 1d | FE-P1-01 | Part 2 §7.2, §8.3 | 🔴 Open |
| FE-P2-07 | `Modal` uses inline DOM rendering, not `createPortal` | Modals rendered inside deeply nested DOM trees are subject to CSS stacking context issues; `z-index` conflicts will emerge as layout complexity grows | Component Architecture | 0.5d | None | Part 1 §2.2, Part 2 §7.2 | 🔴 Open |
| ~~FE-P2-08~~ | ~~CI pipeline has no `node_modules` cache — full `npm ci` on every run (~60s)~~ | ~~Slow feedback loop on every push; `actions/cache` is a one-line fix~~ | Build / CI | 0.25h | None | Part 2 §6.3 | ✅ **Resolved** — `actions/setup-node@v4` with `cache: 'npm'` was already present in `ci.yml`; intent fully satisfied (QW-2) |
| FE-P2-09 | `DataTable` mixes client-side sort with server-side pagination | Sort state and pagination state are owned by different layers; adding a new column requires reasoning about which operations are local and which are remote | Component Architecture | 1d | None | Part 2 §7.2 | 🔴 Open |

---

### 🟩 P3 — Optimization & Future Enhancements

| ID | Issue | Architectural Impact | System Area | Effort | Dependencies | Source | Status |
|---|---|---|---|---|---|---|---|
| FE-P3-01 | `framer-motion` (~100KB gzipped) used only for landing page animations and `TopLoadingBar` | The `motion` chunk is isolated but still downloaded on first visit; CSS `@keyframes` replacements would eliminate the dependency entirely | Bundle Structure | 1d | None | Part 1 §4.3 | 🔴 Open |
| FE-P3-02 | `react-icons` v4 — v5 available with improved tree-shaking | Minor bundle size improvement; upgrade is mechanical via the `Icon.tsx` wrapper | Dependency Management | 2h | None | Part 1 §4.3 | 🔴 Open |
| FE-P3-03 | i18n `t()` is a plain function reading `getState()` — components do not subscribe to locale changes | Architecture is not ready for multi-locale support; adding a second locale would require breaking all `t()` call sites or a forced re-render mechanism | i18n Architecture | 1–2d | None | Part 2 §7.4 | 🔴 Open |
| ~~FE-P3-04~~ | ~~`ThemeToggle` is a no-op — `toggleTheme()` updates Zustand state but dark mode CSS tokens are not defined~~ | ~~Dead UI element; either the dark mode token set must be implemented in `tokens/index.css` or the toggle must be removed~~ | Component Architecture / Design System | 1h (remove) / 1d (implement) | None | Part 1 §1, Part 2 §8.3 | ✅ **Resolved** — `ThemeToggle.tsx`, `ThemeToggle.module.css` deleted; `theme` and `toggleTheme` removed from `uiStore`; barrel export removed; test updated (QW-8) |
| FE-P3-05 | 6 of 7 domain pages have no unit tests; `useSessionTimeout`, `useHealthCheck`, `CitizenAuthContext` untested | Low test coverage on the domain layer means structural regressions during refactor (especially FE-P1-01) will not be caught automatically | Testability | 3d | FE-P1-01 | Part 2 §7.6 | 🟡 **Partial** — `useHealthCheck` now has 5 tests (QW-5); 6 domain pages, `useSessionTimeout`, `CitizenAuthContext` remain untested |
| FE-P3-06 | Barrel `index.ts` exports are partial — only `components/UI/` and `store/` have them | Inconsistent import ergonomics across the codebase; `contexts/`, `hooks/`, `services/api/`, and `layouts/` all require direct file imports | Project Structure | 0.5d | FE-P2-02 | Part 1 §3.3 | 🔴 Open |

---

### Severity Criteria Applied

| Tier | Criterion |
|---|---|
| 🟥 P0 | Silent runtime failure risk, security exposure in production, or undetectable contract drift |
| 🟧 P1 | Scalability ceiling reached at current module count, EOL toolchain, or missing defence-in-depth |
| 🟨 P2 | Structural inconsistency that degrades maintainability without immediate breakage risk |
| 🟩 P3 | Optimization, modernization, or future-proofing with no current breakage risk |

---

## 2. Technical Debt Assessment

### 2.1 Debt Table

| Category | Issue IDs | Description | Risk if Ignored | Effort | Priority | Source |
|---|---|---|---|---|---|---|
| Structural layering debt | FE-P1-02, FE-P1-03 | `TenantContext` bypasses TanStack Query; `http.ts` owns cross-cutting concerns that belong in the interceptor layer | Parallel data-fetching paths diverge; `http.ts` becomes a god file as new cross-cutting concerns are added | 2.5d | P1 | Part 1 §2.4, §3.4 |
| Component coupling debt | FE-P1-01, FE-P1-07, FE-P2-06, FE-P2-09 | CRUD pattern repeated 7×; form validation in page layer; `FormField` unused; `DataTable` mixed sort/pagination concerns | Each new domain module adds ~60 LOC of duplicated scaffolding; form bugs require 7 fixes instead of 1 | 5d | P1/P2 | Part 1 §3.4, Part 2 §7.2 |
| State management debt | FE-P1-02 | `TenantContext` outside TanStack Query cache | State sources remain split; cache invalidation inconsistent | 1d | P1 | Part 1 §2.4 |
| Routing architecture debt | FE-P1-04, FE-P1-05 | Single Suspense boundary; no role-based route guards | Full-page spinner on every navigation; unauthorized role access to staff routes caught only at component level | 1d | P1 | Part 2 §5.3, §7.3 |
| Performance architecture debt | FE-P3-01 | `framer-motion` chunk (~100KB gzipped) on first visit | Unnecessary download for users who only visit the landing page | 1d | P3 | Part 1 §4.3 |
| Build & bundling debt | FE-P1-06 | ESLint v8 EOL | No lint security patches or rule updates | 1d | P1 | Part 1 §4.3 |
| Environment configuration debt | — | ~~No `VITE_APP_ENV`~~ ✅ resolved | — | — | — | Part 2 §6.1 |
| Security hardening gaps | FE-P1-05 | No route-level role enforcement | Role bypass via direct URL; defence-in-depth missing at route boundary | 0.5d | P1 | Part 2 §7.3 |
| Scalability constraints | FE-P1-01, FE-P1-07, FE-P3-03 | No CRUD abstraction; form logic in page layer; i18n not multi-locale ready | Adding modules 8–15 multiplies duplication linearly; i18n refactor becomes a breaking change at scale | 5d | P1/P3 | Part 1 §3.4, Part 2 §7.4 |
| Observability gaps | FE-P3-05 | 6 domain pages, `useSessionTimeout`, `CitizenAuthContext` untested (`useHealthCheck` ✅ resolved) | Structural regressions during refactor go undetected | 2.5d | P3 | Part 2 §7.6 |

### 2.2 Debt Summary

| Metric | Value |
|---|---|
| Total remaining developer-days | **13 days** |
| Resolved by quick wins | **~4.5 days** (FE-P0-01, FE-P0-02, FE-P0-03, FE-P2-01, FE-P2-03, FE-P2-04, FE-P2-08, FE-P3-04) |
| Confidence level | **Medium** |
| P0 items remaining | 0 issues / 0 days ✅ all closed |
| P1 items remaining | 7 issues / ~7.5 days |
| P2 items remaining | 5 issues / ~3.5 days |
| P3 items remaining | 4 issues / ~6 days (FE-P3-04 closed; FE-P3-05 partial) |

**Assumptions:**
- Estimates assume a single mid-senior frontend engineer per task
- FE-P1-01 (`CrudPage`) is a prerequisite for FE-P1-07 and FE-P2-06; those estimates assume FE-P1-01 is complete
- FE-P3-05 (test coverage) estimate assumes FE-P1-01 is complete and the abstraction is tested once rather than 7 times
- FE-P3-03 (i18n) estimate assumes hook conversion only, not library migration
- P3 items are excluded from the phased roadmap timeline but included in the total

---

## 3. Phased Frontend Architecture Roadmap

**Assumptions:** 3–5 frontend engineers, 2-week sprints, parallel work permitted where issue boundaries allow.

---

### Phase 1 — Stabilization ✅ COMPLETE (Weeks 1–2)

**Goal:** Eliminate production security risks, enforce structural constraints, and unblock all subsequent phases.

| Issue | Task | Status | Effort |
|---|---|---|---|
| ~~FE-P0-01~~ | Encode provider ordering constraint — `AppProviders` composition component + dev-only invariant in `TenantProvider` | ✅ Done (QW-7) | 0.5d |
| ~~FE-P0-02~~ | `build.sourcemap: true` → `'hidden'` in `vite.config.ts` | ✅ Done (QW-1) | <0.5h |
| ~~FE-P0-03~~ | `PERMISSIONS`, `ROLE_PERMISSIONS`, helpers moved to `@vsaas/types`; `src/config/permissions.ts` deleted | ✅ Done (QW-6) | 0.5d |
| FE-P1-06 | Migrate `.eslintrc.json` to `eslint.config.js` flat config; upgrade ESLint to v9 | ✅ Done (QW-1 → FE-P1-06) | 1d |
| ~~FE-P2-03~~ | `VITE_APP_ENV` added to `ENV`; `.env.example`, `.env`, CI build step updated | ✅ Done (QW-4) | 2h |
| ~~FE-P2-08~~ | CI npm cache — already present via `setup-node@v4 cache: 'npm'` | ✅ Done (QW-2) | — |

**Phase 1 outcome:** All security and structural stability items closed. FE-P1-06 (ESLint v9) is the sole remaining item and can be carried into Phase 2 without blocking other work.  
**Remaining Phase 1 effort:** ~1 day (FE-P1-06 only)

---

### Phase 2 — Structural Hardening (Weeks 3–6)

**Goal:** Enforce layer separation, eliminate the primary scalability ceiling, and bring state management into a single coherent model.

| Issue | Task | Owner Suggestion | Effort | Status |
|---|---|---|---|---|
| FE-P1-01 | Implement `CrudPage` abstraction in `components/UI/CrudPage/`; migrate all 7 domain pages to use it | 1–2 engineers | 2d | ✅ Done (FE-P1-01) |
| FE-P1-02 | Migrate `TenantContext` data fetching from raw `http.get()` to a TanStack Query `useQuery` call | 1 engineer | 1d | ✅ Done (FE-P1-02) |
| FE-P1-03 | Extract token refresh logic from `http.ts` into `services/interceptors/`; extract base request logic into `services/base/` | 1 engineer | 1.5d | ✅ Done (FE-P1-03) |
| FE-P1-04 | Replace single top-level `<Suspense>` with per-layout Suspense boundaries in `routes/index.tsx` | 1 engineer | 0.5d | ✅ Done (FE-P1-04) |
| FE-P1-05 | Add optional `requiredRole` prop to `ProtectedRoute`; apply role guards to staff dashboard routes | 1 engineer | 0.5d | ✅ Done (FE-P1-05) |
| FE-P1-06 | Migrate `.eslintrc.json` to `eslint.config.js` flat config; upgrade ESLint to v9 (carried from Phase 1) | 1 engineer | 1d | ✅ Done (FE-P1-06) |
| FE-P1-07 | Extract form validation schemas from page components into a `validation/` layer (after FE-P1-01) | 1 engineer | 1d | ✅ Done (FE-P1-07) |
| ~~FE-P2-01~~ | ~~Migrate `useHealthCheck` to TanStack Query `refetchInterval`~~ | — | — | ✅ Done (QW-5) |
| FE-P2-05 | Wire `Breadcrumbs` `ROUTE_LABELS` map to `t()` keys in `pt-BR.json` | 1 engineer | 2h | 🔴 Pending |
| FE-P2-06 | Migrate domain forms from raw `<label>/<input>` to `FormField` UI component (after FE-P1-01) | 1 engineer | 1d | 🔴 Pending |

**Total Phase 2 effort:** ~8 days (FE-P2-01 already done)  
**Dependencies:** FE-P1-01 must complete before FE-P1-07 and FE-P2-06; FE-P0-03 ✅ resolved — FE-P1-05 is unblocked  
**Parallel tracks:** FE-P1-01 + FE-P1-02 + FE-P1-03 can run in parallel; FE-P1-07 and FE-P2-06 are sequential after FE-P1-01  
**Business impact:** Eliminates ~400 LOC of CRUD duplication; new domain modules become 1-day additions; state management unified under TanStack Query; layer boundaries enforced

---

### Phase 3 — Scalability & Performance (Weeks 7–10)

**Goal:** Optimize the build and runtime performance architecture; harden the component library boundaries.

| Issue | Task | Owner Suggestion | Effort | Status |
|---|---|---|---|---|
| ~~FE-P2-04~~ | ~~Replace `@import` in `global.css` with `<link rel="preconnect">` + `<link rel="stylesheet">` in `index.html`~~ | — | — | ✅ Done (QW-3) |
| FE-P2-07 | Migrate `Modal` from inline DOM to `createPortal` targeting `document.body` | 1 engineer | 0.5d | 🔴 Pending |
| FE-P2-09 | Resolve `DataTable` mixed sort/pagination concern — move sort to server-side or make client-sort scope explicit via prop | 1 engineer | 1d | 🔴 Pending |
| FE-P2-02 | Adopt `@/*` path alias across all `src/` imports; enforce via ESLint `no-restricted-imports` rule | 1 engineer | 0.5d | 🔴 Pending |
| FE-P3-01 | Replace `framer-motion` landing page animations with CSS `@keyframes`; replace `TopLoadingBar` with CSS transition | 1 engineer | 1d | 🔴 Pending |
| FE-P3-02 | Upgrade `react-icons` v4 → v5 via `Icon.tsx` wrapper | 1 engineer | 2h | 🔴 Pending |
| FE-P3-05 | Add unit tests for 6 untested domain pages, `useSessionTimeout`, `CitizenAuthContext` (after FE-P1-01; `useHealthCheck` ✅ done) | 2 engineers | 2.5d | 🟡 Partial |

**Total Phase 3 effort:** ~6 days (FE-P2-04 already done; FE-P3-05 reduced by 0.5d)  
**Dependencies:** FE-P3-05 requires FE-P1-01 complete; FE-P2-07 and FE-P2-09 are independent  
**Parallel tracks:** FE-P2-07, FE-P3-01, FE-P3-02 are fully independent and can run in parallel  
**Business impact:** `framer-motion` chunk eliminated; `Modal` stacking context issues resolved; test coverage closes regression risk from Phase 2 refactors

---

### Phase 4 — Architecture Maturity (Weeks 11–14)

**Goal:** Future-proof the i18n layer, complete the design system, and establish barrel export consistency.

| Issue | Task | Owner Suggestion | Effort | Status |
|---|---|---|---|---|
| FE-P3-03 | Convert `t()` from plain function to `useT()` hook; update all call sites; add locale-change reactivity | 1 engineer | 1–2d | 🔴 Pending |
| ~~FE-P3-04~~ | ~~Decision point: implement dark mode OR remove `ThemeToggle`~~ | — | — | ✅ Done — removed (QW-8) |
| FE-P3-06 | Add barrel `index.ts` exports to `contexts/`, `hooks/`, `services/api/`, `layouts/`; enforce via ESLint | 1 engineer | 0.5d | 🔴 Pending |

**Total Phase 4 effort:** ~2–3 days (FE-P3-04 closed)  
**Dependencies:** FE-P3-03 requires FE-P2-02 (path alias adoption) to be complete for clean import updates  
**Business impact:** i18n layer becomes multi-locale ready without a breaking refactor; import ergonomics uniform across the codebase

---

### Roadmap Summary

| Phase | Weeks | Issues | Remaining Effort | Key Outcome |
|---|---|---|---|---|
| 1 — Stabilization ✅ | 1–2 | ~~FE-P0-01~~, ~~FE-P0-02~~, ~~FE-P0-03~~, FE-P1-06, ~~FE-P2-03~~, ~~FE-P2-08~~ | ~1d (FE-P1-06 only) | Security risks closed; RBAC drift eliminated; linting pending |
| 2 — Structural Hardening | 3–6 | FE-P1-01–FE-P1-07, ~~FE-P2-01~~, FE-P2-05, FE-P2-06 | ~8d | Layer separation enforced; CRUD abstraction live; state unified |
| 3 — Scalability & Performance | 7–10 | FE-P2-02, ~~FE-P2-04~~, FE-P2-07, FE-P2-09, FE-P3-01, FE-P3-02, FE-P3-05 | ~6d | Bundle optimized; component library hardened; test coverage closed |
| 4 — Architecture Maturity | 11–14 | FE-P3-03, ~~FE-P3-04~~, FE-P3-06 | ~2–3d | i18n multi-locale ready; import consistency |
| **Total** | **14 weeks** | **11 open + 8 resolved** | **~17–18d remaining** | |


---

## 4. Frontend Architecture KPIs & Success Metrics

| Metric | Current State | Target | Measurement Method | Related Issues |
|---|---|---|---|---|
| CRUD pattern duplication | 7 independent implementations (~400 LOC) | 1 shared `CrudPage` abstraction (0 duplicated LOC) | LOC diff after FE-P1-01 | FE-P1-01 |
| Domain page test coverage | 1 of 7 domain pages tested (14%) | 7 of 7 (100%) | Vitest coverage report | FE-P3-05 |
| Server-state layer consistency | 2 data-fetching paths (TanStack Query + raw `http.get()` in TenantContext) | 1 path (TanStack Query only) | Code audit: grep for `http.get` outside `services/api/` | FE-P1-02 |
| Provider ordering safety | ✅ Structural enforcement via `AppProviders` + dev-only invariant in `TenantProvider` | Structural enforcement via `AppProviders` composition + runtime invariant | Code review gate | ~~FE-P0-01~~ ✅ |
| RBAC source of truth | ✅ 1 canonical source (`@vsaas/types`) — `src/config/permissions.ts` deleted | 1 canonical source (`@vsaas/types`) | Package import audit | ~~FE-P0-03~~ ✅ |
| Production source map exposure | ✅ Hidden (`build.sourcemap: 'hidden'`) | Hidden (`build.sourcemap: 'hidden'`) | Build artifact inspection | ~~FE-P0-02~~ ✅ |
| Route-level role enforcement | Authentication only (0 role checks at route boundary) | Role guard on all staff routes | Route config audit | FE-P1-05 |
| Suspense boundary granularity | 1 global boundary (full-page spinner on all transitions) | 3 per-layout boundaries (scoped loading) | Route config audit | FE-P1-04 |
| CI install time | ✅ ~5s (cache hit via `setup-node@v4 cache: 'npm'`) | ~5s (cache hit) | GitHub Actions job duration | ~~FE-P2-08~~ ✅ |
| `framer-motion` chunk presence | Downloaded on first visit (~100KB gzipped) | Eliminated | Bundle analyzer (Rollup output) | FE-P3-01 |
| ESLint version | v9.39.4 (supported) | v9 (supported) | `npm list eslint` | FE-P1-06 ✅ |
| Path alias adoption | 0% (`@/*` defined but unused) | 100% of `src/` imports | ESLint `no-restricted-imports` rule enforcement | FE-P2-02 |
| Google Fonts load strategy | ✅ Non-blocking `<link>` tags in `index.html` | Non-blocking `<link>` in `index.html` | Lighthouse / DevTools network waterfall | ~~FE-P2-04~~ ✅ |
| Dead UI state in Zustand | ✅ `theme` and `toggleTheme` removed from `uiStore` | No dead state | Code audit | ~~FE-P3-04~~ ✅ |

---

## 5. Frontend Architecture Maturity Score

### 5.1 Dimension Scores

| Dimension | Score | Rationale | Source |
|---|---|---|---|
| Layering discipline | 72 / 100 | Four-layer architecture consistently applied. Two remaining violations: `TenantContext` bypasses the cache layer (FE-P1-02); `http.ts` owns cross-cutting concerns that belong in the interceptor layer (FE-P1-03). | Part 1 §2.4, §3.4; Part 2 §7.1 |
| Component modularity | 55 / 100 | 20-component UI library is well-structured. Critical gap: CRUD pattern repeated 7× with no abstraction (FE-P1-01); `FormField` exists but is unused (FE-P2-06); `Modal` lacks portal rendering (FE-P2-07); `DataTable` has mixed sort/pagination concerns (FE-P2-09). | Part 1 §3.4; Part 2 §7.2 |
| State management clarity | 72 / 100 | `useHealthCheck` ✅ migrated to TanStack Query; dead `theme`/`toggleTheme` state ✅ removed from Zustand. Remaining gap: `TenantContext` still outside the cache layer (FE-P1-02). +7 from baseline. | Part 1 §2.4; Part 2 §5.6 |
| Scalability readiness | 55 / 100 | FE-P0-03 ✅ resolved — FE-P1-05 (route-level RBAC) is now unblocked. CRUD duplication (FE-P1-01) and form validation coupling (FE-P1-07) remain the primary ceiling. +5 from baseline. | Part 1 §3.4; Part 2 §7.3, §7.4 |
| Performance architecture | 65 / 100 | Google Fonts `@import` ✅ replaced with non-blocking `<link>` tags. Health check polling ✅ pauses on hidden tab. `framer-motion` chunk still present (FE-P3-01). +7 from baseline. | Part 1 §4.4; Part 2 §5.6, §6.2 |
| Resilience & fault handling | 70 / 100 | Error boundaries at app and layout level; TanStack Query retry logic; `refreshPromise` deduplication. Gap: single Suspense boundary (FE-P1-04); async errors not caught by boundaries. Unchanged. | Part 2 §5.3, §5.4 |
| Build & deployment maturity | 72 / 100 | Source maps ✅ scoped to `'hidden'`; CI npm cache ✅ confirmed present; `VITE_APP_ENV` ✅ added. ESLint v8 EOL (FE-P1-06) is the sole remaining gap. +12 from baseline. | Part 2 §6.2, §6.3; Part 1 §4.3 |
| Observability integration | 43 / 100 | `useHealthCheck` ✅ now uses TanStack Query (tab-visibility-aware polling). No structured frontend logging, no error tracking integration, no performance instrumentation. +3 from baseline. | Part 2 §5.6 |

### 5.2 Overall Score

**67 / 100 — Structured** *(+5 from baseline of 62)*

> Score reflects quick win improvements: state management clarity +7, performance architecture +7, build & deployment maturity +12, scalability readiness +5, observability +3.

| Level | Score Range | Description |
|---|---|---|
| Early | 0–30 | Ad-hoc structure; no consistent patterns |
| Growing | 31–50 | Patterns emerging; significant inconsistency |
| **Structured** | **51–70** | **Consistent patterns established; known gaps; scalability ceiling visible** |
| Advanced | 71–85 | Patterns enforced; abstractions in place; gaps are edge cases |
| Enterprise-Ready | 86–100 | Full observability; zero duplication; enforced boundaries; multi-environment maturity |

### 5.3 Key Blockers Preventing Advancement to "Advanced" (71+)

1. **CRUD abstraction gap (FE-P1-01)** — The most visible scalability ceiling. Until `CrudPage` is implemented, the component layer score cannot exceed 65.
2. **State management fragmentation (FE-P1-02)** — `TenantContext` remains outside TanStack Query. `useHealthCheck` ✅ resolved. One data-fetching path still outside the cache layer.
3. **Observability absence** — No structured frontend logging or error tracking integration. The observability dimension remains the lowest-scoring area.
4. **ESLint v8 EOL (FE-P1-06)** — The sole remaining build tooling gap after quick wins. Blocks the build/deployment score from reaching 80+.

---

## 6. Executive Summary (CTO-Level)

### Overall Frontend Architecture Health Score

**67 / 100 — Structured** *(+5 since initial assessment; all P0 issues closed)*

The Secom frontend is a well-organized, type-safe React 18 SPA with a coherent four-layer architecture, consistent domain hook patterns, and a functional CI pipeline. The codebase is clean — no file exceeds 200 LOC, TypeScript strict mode is enforced, and the server/client state boundary is clearly drawn. The foundation is sound.

All three P0 production risks have been resolved. The architecture has reached a visible scalability ceiling at 7 domain modules and has an observability gap that will become critical as the system grows. The next priority is Phase 2 structural hardening.

---

### Key Structural Strengths

1. **Consistent four-layer architecture.** Pages → Domain Hooks → Service Functions → HTTP Client is applied uniformly across all 7 domain modules. Adding new modules follows a predictable, low-friction pattern.
2. **Type-safe API contract with unified RBAC.** The `@vsaas/types` workspace package now includes the canonical `PERMISSIONS`, `ROLE_PERMISSIONS`, and helper functions — eliminating the frontend/backend drift risk that existed at initial assessment. TypeScript strict mode prevents silent type drift.
3. **Deliberate bundle strategy with hardened security posture.** Route-level code splitting via `React.lazy()` on all 20+ pages; four manual Vite chunks; source maps scoped to `'hidden'`; provider ordering structurally enforced via `AppProviders`.

---

### Major Architectural Risks

1. **CRUD duplication scalability ceiling (FE-P1-01 — Structural).** The identical DataTable + Modal + ConfirmDialog + state management pattern is implemented independently in all 7 domain pages (~400 LOC of duplication). The `CrudPage` abstraction directory exists but is empty. Each new domain module adds ~60 LOC of duplicated scaffolding and multiplies the surface area for bugs.
2. **State management fragmentation (FE-P1-02 — Structural).** `TenantContext` fetches via raw `http.get()`, bypassing TanStack Query. This is the last remaining data-fetching path outside the established server-state layer.
3. **ESLint v8 EOL (FE-P1-06 — Toolchain).** ESLint v8 reached end-of-life in October 2024. The linting layer receives no security patches or rule updates. Migration to v9 flat config is the sole remaining Phase 1 item.

---

### Estimated Investment

| Scope | Developer-Days | Calendar Time (3–5 engineers) |
|---|---|---|
| P0 — Critical security & stability | ✅ 0 days remaining | Complete |
| P1 — Scalability & maintainability | ~7.5 days | Weeks 2–4 |
| P2 — Structural improvements | ~3.5 days | Weeks 5–8 |
| P3 — Optimization & future-proofing | ~6 days | Weeks 9–14 |
| **Total remaining** | **~17 days** | **~13 weeks** |

**Quick wins delivered:** ~4.5 dev-days of debt eliminated across 8 items (commit `7e3619d`).

**Risk if P1 items are delayed beyond 2 sprints:** The CRUD duplication ceiling means that adding modules 8–10 will each require 3 days of copy-paste work instead of 1 day of configuration. The structural debt compounds with each new module.

---

### Recommendation

**Stable — P0 risks closed, Phase 2 structural hardening is the immediate priority.**

All three P0 production risks (source map exposure, RBAC drift, provider ordering) have been resolved. The architecture is coherent, the patterns are established, and the team has demonstrated discipline in applying them. What is required now is:

1. Complete Phase 1 by migrating ESLint to v9 (≤1 day, no architectural risk)
2. Execute Phase 2 structural hardening — implement the `CrudPage` abstraction and migrate `TenantContext` to TanStack Query before the next module sprint begins
3. Incremental delivery of P2 and P3 items alongside feature work, prioritized by the KPI targets in §4

The architecture is on a clear path to the "Advanced" maturity tier (71+). The primary blocker is execution on the CRUD abstraction (FE-P1-01) — a well-scoped, low-risk refactor with the highest return on investment remaining in the roadmap.
