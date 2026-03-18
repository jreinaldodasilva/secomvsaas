# Secom Frontend — Architecture Improvement Roadmap

**Document version:** 1.2
**Based on:** Architecture Overview Part 1 (§1–§4) and Part 2 (§5–§8)
**Codebase snapshot:** post-commit `7972600` (all roadmap issues resolved except FE-P3-01)
**Last updated:** All P0, P1, P2, and P3 issues resolved. FE-P3-01 skipped by decision.
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
| ~~FE-P1-01~~ | ~~`CrudPage` abstraction unimplemented — identical CRUD scaffold repeated 7× (~400 LOC duplication)~~ | ~~Every new domain module requires copy-pasting the full DataTable + Modal + ConfirmDialog + state pattern; bugs fixed in one page do not propagate~~ | Component Architecture | 2d | None | Part 1 §3.4, Part 2 §7.2 | ✅ **Completed** — `CrudPage` generic component implemented in `components/UI/CrudPage/CrudPage.tsx`; all 7 domain pages migrated; 8 tests added (FE-P1-01) |
| ~~FE-P1-02~~ | ~~`TenantContext` fetches via raw `http.get()`, bypassing TanStack Query cache~~ | ~~Tenant data is not deduplicated, not stale-while-revalidate cached, and not invalidatable from other query operations; creates a parallel data-fetching path outside the established server-state layer~~ | State Management / Layer Separation | 1d | None | Part 1 §2.4 | ✅ **Completed** — `tenantService.ts` added to `services/api/`; `TenantContext` migrated to `useQuery`; `refreshTenant` uses `queryClient.invalidateQueries`; `useState`/`useEffect`/raw `http.get()` removed (FE-P1-02) |
| ~~FE-P1-03~~ | ~~`services/base/` and `services/interceptors/` are empty placeholders — token refresh and error handling are monolithically embedded in `http.ts`~~ | ~~`http.ts` owns fetch, auth headers, token refresh, retry, and error normalization in a single 93-LOC file; cannot be extended or tested in isolation~~ | Layer Separation / Services | 1.5d | None | Part 1 §3.4 | ✅ **Completed** — `ApiError` + `buildUrl` + `baseRequest` extracted to `services/base/`; `withRefreshInterceptor` extracted to `services/interceptors/`; `http.ts` reduced to a thin composition layer; all 12 existing http tests pass (FE-P1-03) |
| ~~FE-P1-04~~ | ~~Single top-level `<Suspense>` boundary for all 20+ lazy routes — full-page spinner on every route transition~~ | ~~All three layout surfaces share one loading state; a slow chunk in any layout degrades the perceived performance of all others~~ | Routing Architecture / Resilience | 0.5d | None | Part 2 §5.3 | ✅ **Completed** — single `<Suspense>` removed; each of the 20+ lazy routes now has its own `<Suspense fallback={<LoadingScreen />}>` boundary scoped to the route element (FE-P1-04) |
| ~~FE-P1-05~~ | ~~`ProtectedRoute` enforces authentication only — no role-based route protection at the routing layer~~ | ~~Any authenticated user of any role can navigate to any staff route by URL; RBAC enforced only at component level via `PermissionGate`, with no defence-in-depth at the route boundary~~ | Routing Architecture / Security | 0.5d | ~~FE-P0-03~~ ✅ | Part 2 §7.3, §7.5 | ✅ **Completed** — `STAFF_ROLES` constant added to `@vsaas/types`; outer dashboard `ProtectedRoute` guards with `allowedRoles={STAFF_ROLES}`; `citizen` role redirected to `/unauthorized` on all staff routes; 1 test added (FE-P1-05) |
| ~~FE-P1-06~~ | ~~ESLint v8 at end-of-life (EOL October 2024) — static analysis toolchain on an unsupported version~~ | ~~No security patches or rule updates for the linting layer; `@typescript-eslint` v8 supports ESLint v9 but the `.eslintrc.json` flat-config migration had not been done~~ | Build Tooling | 1d | None | Part 1 §4.3 | ✅ **Completed** — ESLint upgraded to v9.39.4; `.eslintrc.json` deleted; `eslint.config.js` flat config created with `globals` package; `react/prop-types` disabled for TS; Vitest globals added for test files; 2 pre-existing errors fixed; lint scripts updated to directory-based pattern; 0 errors, 65 warnings (FE-P1-06) |
| ~~FE-P1-07~~ | ~~Form validation logic co-located with page components — no dedicated validation layer~~ | ~~At 7 modules the coupling is manageable; at 15+ modules, form state types, empty-state factories, and validation functions scattered across `pages/Domain/` become a maintenance burden with no reuse path~~ | Component Architecture / Layer Separation | 1d | FE-P1-01 | Part 1 §3.4 | ✅ **Completed** — `src/validation/domain/` layer created with 7 files (one per domain) + barrel `index.ts`; each exports `FormState` type, `emptyForm` constant, `validate*` function, and domain constants; all 7 `*Form.tsx` files updated to re-export from validation layer (FE-P1-07) |

---

### 🟨 P2 — Structural Improvements

| ID | Issue | Architectural Impact | System Area | Effort | Dependencies | Source | Status |
|---|---|---|---|---|---|---|---|
| ~~FE-P2-01~~ | ~~`useHealthCheck` uses raw `setInterval` instead of TanStack Query `refetchInterval`~~ | ~~Polling continues when the browser tab is hidden; bypasses the established server-state layer~~ | State Management / Observability | 0.5h | None | Part 2 §5.6 | ✅ **Resolved** — migrated to `useQuery` with `refetchInterval: 30_000, refetchIntervalInBackground: false`; `setInterval` removed; 5 tests added (QW-5) |
| ~~FE-P2-02~~ | ~~`@/*` path alias defined in `tsconfig.json` and `vite.config.ts` but unadopted — all imports use relative paths~~ | ~~Deep relative paths (`../../../components/UI`) will become fragile as the directory tree grows; the alias infrastructure is already in place but unused~~ | Project Structure | 0.5d | None | Part 1 §2.3 | ✅ **Completed** — 244 relative parent imports rewritten to `@/` alias across 84 files via Node.js path-resolution script; `no-restricted-imports` ESLint rule added to enforce alias going forward; 0 errors, 258/258 tests pass (FE-P2-02) |
| ~~FE-P2-03~~ | ~~No `VITE_APP_ENV` variable — frontend has no environment awareness~~ | ~~Cannot distinguish staging from production at the frontend level~~ | Environment Configuration | 2h | None | Part 2 §6.1 | ✅ **Resolved** — `APP_ENV` added to `ENV` object; `.env.example`, `.env`, and CI build step updated (QW-4) |
| ~~FE-P2-04~~ | ~~Google Fonts loaded via render-blocking `@import` in `global.css`~~ | ~~Blocks First Contentful Paint on every cold load~~ | Performance Architecture | 1h | None | Part 1 §4.3 | ✅ **Resolved** — `@import` removed from `global.css`; `<link rel="preconnect">` + `<link rel="stylesheet">` added to `index.html` (QW-3) |
| ~~FE-P2-05~~ | ~~`Breadcrumbs` uses hardcoded `ROUTE_LABELS` map — not wired to the i18n `t()` system~~ | ~~Creates a second source of UI strings outside the i18n layer; any label change requires editing two locations~~ | Component Architecture / i18n | 2h | None | Part 2 §7.2 | ✅ **Completed** — `breadcrumbs.*` section added to `pt-BR.json` with all 21 route keys; `ROUTE_LABELS` map deleted from `Breadcrumbs.tsx`; `generateBreadcrumbs` now takes `t` and calls `t('breadcrumbs.{seg}')`; falls back to capitalised segment for unknown routes (FE-P2-05) |
| ~~FE-P2-06~~ | ~~`FormField` UI component exists but is not used by any domain form — domain forms use raw `<label>/<input>` elements~~ | ~~The design system has a form primitive that is not adopted; form layout, error display, and attribute consistency vary across domain forms~~ | Component Architecture | 1d | FE-P1-01 | Part 2 §7.2, §8.3 | ✅ **Completed** — all 7 domain `*Form.tsx` files migrated from raw `<label>/<input>/<span class="form-error">` to `<FormField name error required helpText>`; `id` attributes added to all inputs/textareas/selects for `htmlFor` association (FE-P2-06) |
| ~~FE-P2-07~~ | ~~`Modal` uses inline DOM rendering, not `createPortal`~~ | ~~Modals rendered inside deeply nested DOM trees are subject to CSS stacking context issues; `z-index` conflicts will emerge as layout complexity grows~~ | Component Architecture | 0.5d | None | Part 1 §2.2, Part 2 §7.2 | ✅ **Completed** — `createPortal` imported from `react-dom`; modal JSX wrapped in `createPortal(…, document.body)`; overlay `position: fixed` already correct (FE-P2-07) |
| ~~FE-P2-08~~ | ~~CI pipeline has no `node_modules` cache — full `npm ci` on every run (~60s)~~ | ~~Slow feedback loop on every push~~ | Build / CI | 0.25h | None | Part 2 §6.3 | ✅ **Resolved** — `actions/setup-node@v4` with `cache: 'npm'` was already present in `ci.yml`; intent fully satisfied (QW-2) |
| ~~FE-P2-09~~ | ~~`DataTable` mixes client-side sort with server-side pagination~~ | ~~Sort state and pagination state are owned by different layers; adding a new column requires reasoning about which operations are local and which are remote~~ | Component Architecture | 1d | None | Part 2 §7.2 | ✅ **Completed** — `clientSort?: boolean` prop added (default `false`); when `false`, `onSortChange(key, dir)` called for server-side handling; when `true`, existing client-sort behaviour preserved; `useMemo` sort guard updated (FE-P2-09) |

---

### 🟩 P3 — Optimization & Future Enhancements

| ID | Issue | Architectural Impact | System Area | Effort | Dependencies | Source | Status |
|---|---|---|---|---|---|---|---|
| FE-P3-01 | `framer-motion` (~100KB gzipped) used only for landing page animations and `TopLoadingBar` | The `motion` chunk is isolated but still downloaded on first visit; CSS `@keyframes` replacements would eliminate the dependency entirely | Bundle Structure | 1d | None | Part 1 §4.3 | 🔴 **Skipped** — decision made not to remove `framer-motion` |
| ~~FE-P3-02~~ | ~~`react-icons` v4 — v5 available with improved tree-shaking~~ | ~~Minor bundle size improvement; upgrade is mechanical via the `Icon.tsx` wrapper~~ | Dependency Management | 2h | None | Part 1 §4.3 | ✅ **Completed** — `react-icons` upgraded from v4.12.0 to v5.6.0; `Icon.tsx` wrapper required no changes; `tsc --noEmit` clean (FE-P3-02) |
| ~~FE-P3-03~~ | ~~i18n `t()` is a plain function reading `getState()` — components do not subscribe to locale changes~~ | ~~Architecture is not ready for multi-locale support; adding a second locale would require breaking all `t()` call sites or a forced re-render mechanism~~ | i18n Architecture | 1–2d | None | Part 2 §7.4 | ✅ **Completed** — `useTranslation` now returns locale-bound `t`/`tArray` callbacks via `useCallback([locale])`; components re-render on locale change; standalone `t()`/`tArray()` retained for non-component use (validators, services); 258/258 tests pass (FE-P3-03) |
| ~~FE-P3-04~~ | ~~`ThemeToggle` is a no-op — `toggleTheme()` updates Zustand state but dark mode CSS tokens are not defined~~ | ~~Dead UI element~~ | Component Architecture / Design System | 1h (remove) / 1d (implement) | None | Part 1 §1, Part 2 §8.3 | ✅ **Resolved** — `ThemeToggle.tsx`, `ThemeToggle.module.css` deleted; `theme` and `toggleTheme` removed from `uiStore`; barrel export removed; test updated (QW-8) |
| ~~FE-P3-05~~ | ~~6 of 7 domain pages have no unit tests; `useSessionTimeout`, `useHealthCheck`, `CitizenAuthContext` untested~~ | ~~Low test coverage on the domain layer means structural regressions during refactor will not be caught automatically~~ | Testability | 3d | FE-P1-01 | Part 2 §7.6 | ✅ **Completed** — tests added for all 6 untested domain pages (4 tests each: render, empty state, rows, create modal); `CitizenAuthContext` tested with 7 tests; 258 tests across 35 files (FE-P3-05) |
| ~~FE-P3-06~~ | ~~Barrel `index.ts` exports are partial — only `components/UI/` and `store/` have them~~ | ~~Inconsistent import ergonomics across the codebase; `contexts/`, `hooks/`, `services/api/`, and `layouts/` all require direct file imports~~ | Project Structure | 0.5d | FE-P2-02 | Part 1 §3.3 | ✅ **Completed** — `contexts/index.ts` created; `hooks/index.ts` created (14 hooks); `services/api/index.ts` completed (10 services); `layouts/index.ts` completed (4 layouts); 40 import sites updated; domain page tests updated to mock `@/hooks` barrel; 258/258 tests pass (FE-P3-06) |

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

| Category | Issue IDs | Description | Risk if Ignored | Effort | Priority | Status |
|---|---|---|---|---|---|---|
| ~~Structural layering debt~~ | ~~FE-P1-02, FE-P1-03~~ | ~~`TenantContext` bypasses TanStack Query; `http.ts` owns cross-cutting concerns that belong in the interceptor layer~~ | ~~Parallel data-fetching paths diverge; `http.ts` becomes a god file~~ | ~~2.5d~~ | ~~P1~~ | ✅ Resolved |
| ~~Component coupling debt~~ | ~~FE-P1-01, FE-P1-07, FE-P2-06, FE-P2-09~~ | ~~CRUD pattern repeated 7×; form validation in page layer; `FormField` unused; `DataTable` mixed sort/pagination concerns~~ | ~~Each new domain module adds ~60 LOC of duplicated scaffolding; form bugs require 7 fixes instead of 1~~ | ~~5d~~ | ~~P1/P2~~ | ✅ Resolved |
| ~~State management debt~~ | ~~FE-P1-02~~ | ~~`TenantContext` outside TanStack Query cache~~ | ~~State sources remain split; cache invalidation inconsistent~~ | ~~1d~~ | ~~P1~~ | ✅ Resolved |
| ~~Routing architecture debt~~ | ~~FE-P1-04, FE-P1-05~~ | ~~Single Suspense boundary; no role-based route guards~~ | ~~Full-page spinner on every navigation; unauthorized role access to staff routes caught only at component level~~ | ~~1d~~ | ~~P1~~ | ✅ Resolved |
| Performance architecture debt | FE-P3-01 | `framer-motion` chunk (~100KB gzipped) on first visit | Unnecessary download for users who only visit the landing page | 1d | P3 | 🔴 Skipped by decision |
| ~~Build & bundling debt~~ | ~~FE-P1-06~~ | ~~ESLint v8 EOL~~ | ~~No lint security patches or rule updates~~ | ~~1d~~ | ~~P1~~ | ✅ Resolved |
| ~~Environment configuration debt~~ | ~~FE-P2-03~~ | ~~No `VITE_APP_ENV`~~ | — | — | — | ✅ Resolved |
| ~~Security hardening gaps~~ | ~~FE-P1-05~~ | ~~No route-level role enforcement~~ | ~~Role bypass via direct URL; defence-in-depth missing at route boundary~~ | ~~0.5d~~ | ~~P1~~ | ✅ Resolved |
| ~~Scalability constraints~~ | ~~FE-P1-01, FE-P1-07, FE-P3-03~~ | ~~No CRUD abstraction; form logic in page layer; i18n not multi-locale ready~~ | ~~Adding modules 8–15 multiplies duplication linearly; i18n refactor becomes a breaking change at scale~~ | ~~5d~~ | ~~P1/P3~~ | ✅ Resolved |
| ~~Observability gaps~~ | ~~FE-P3-05~~ | ~~6 domain pages, `useSessionTimeout`, `CitizenAuthContext` untested~~ | ~~Structural regressions during refactor go undetected~~ | ~~2.5d~~ | ~~P3~~ | ✅ Resolved |

### 2.2 Debt Summary

| Metric | Value |
|---|---|
| Total original developer-days estimated | ~17–18 days |
| Resolved by quick wins (QW-1–QW-8) | ~4.5 days |
| Resolved by roadmap issues (FE-P1 through FE-P3) | ~13 days |
| Remaining open debt | **~1 day** (FE-P3-01 — skipped by decision) |
| P0 items remaining | 0 ✅ all closed |
| P1 items remaining | 0 ✅ all closed |
| P2 items remaining | 0 ✅ all closed |
| P3 items remaining | 1 (FE-P3-01 skipped) |

**Note:** FE-P3-01 (`framer-motion` removal) was explicitly skipped. The ~100KB gzipped chunk remains on first visit. This is the only open item in the entire roadmap.


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
| ~~FE-P1-06~~ | Migrate `.eslintrc.json` to `eslint.config.js` flat config; upgrade ESLint to v9.39.4 | ✅ Done (FE-P1-06) | 1d |
| ~~FE-P2-03~~ | `VITE_APP_ENV` added to `ENV`; `.env.example`, `.env`, CI build step updated | ✅ Done (QW-4) | 2h |
| ~~FE-P2-08~~ | CI npm cache — already present via `setup-node@v4 cache: 'npm'` | ✅ Done (QW-2) | — |

**Phase 1 outcome:** All security and structural stability items closed. ESLint v9 migration complete. 0 lint errors.

---

### Phase 2 — Structural Hardening ✅ COMPLETE (Weeks 3–6)

**Goal:** Enforce layer separation, eliminate the primary scalability ceiling, and bring state management into a single coherent model.

| Issue | Task | Effort | Status |
|---|---|---|---|
| ~~FE-P1-01~~ | Implement `CrudPage` abstraction in `components/UI/CrudPage/`; migrate all 7 domain pages | 2d | ✅ Done (FE-P1-01) |
| ~~FE-P1-02~~ | Migrate `TenantContext` data fetching from raw `http.get()` to TanStack Query `useQuery` | 1d | ✅ Done (FE-P1-02) |
| ~~FE-P1-03~~ | Extract token refresh logic into `services/interceptors/`; extract base request logic into `services/base/` | 1.5d | ✅ Done (FE-P1-03) |
| ~~FE-P1-04~~ | Replace single top-level `<Suspense>` with per-route Suspense boundaries in `routes/index.tsx` | 0.5d | ✅ Done (FE-P1-04) |
| ~~FE-P1-05~~ | Add `allowedRoles` guard to `ProtectedRoute`; apply `STAFF_ROLES` to dashboard routes | 0.5d | ✅ Done (FE-P1-05) |
| ~~FE-P1-07~~ | Extract form validation schemas from page components into `src/validation/domain/` layer | 1d | ✅ Done (FE-P1-07) |
| ~~FE-P2-01~~ | Migrate `useHealthCheck` to TanStack Query `refetchInterval` | 0.5h | ✅ Done (QW-5) |
| ~~FE-P2-05~~ | Wire `Breadcrumbs` `ROUTE_LABELS` map to `t()` keys in `pt-BR.json` | 2h | ✅ Done (FE-P2-05) |
| ~~FE-P2-06~~ | Migrate domain forms from raw `<label>/<input>` to `FormField` UI component | 1d | ✅ Done (FE-P2-06) |

**Phase 2 outcome:** ~400 LOC of CRUD duplication eliminated. State management unified under TanStack Query. Layer boundaries enforced. Form validation extracted to dedicated layer. All 7 domain forms use `FormField`.

---

### Phase 3 — Scalability & Performance ✅ COMPLETE (Weeks 7–10)

**Goal:** Optimize the build and runtime performance architecture; harden the component library boundaries.

| Issue | Task | Effort | Status |
|---|---|---|---|
| ~~FE-P2-02~~ | Adopt `@/*` path alias across all `src/` imports; enforce via ESLint `no-restricted-imports` | 0.5d | ✅ Done (FE-P2-02) |
| ~~FE-P2-04~~ | Replace `@import` in `global.css` with `<link rel="preconnect">` + `<link rel="stylesheet">` in `index.html` | 1h | ✅ Done (QW-3) |
| ~~FE-P2-07~~ | Migrate `Modal` from inline DOM to `createPortal` targeting `document.body` | 0.5d | ✅ Done (FE-P2-07) |
| ~~FE-P2-09~~ | Resolve `DataTable` mixed sort/pagination concern via `clientSort` prop | 1d | ✅ Done (FE-P2-09) |
| FE-P3-01 | Replace `framer-motion` landing page animations with CSS `@keyframes`; replace `TopLoadingBar` with CSS transition | 1d | 🔴 Skipped by decision |
| ~~FE-P3-02~~ | Upgrade `react-icons` v4 → v5 via `Icon.tsx` wrapper | 2h | ✅ Done (FE-P3-02) |
| ~~FE-P3-05~~ | Add unit tests for 6 untested domain pages and `CitizenAuthContext` | 2.5d | ✅ Done (FE-P3-05) |

**Phase 3 outcome:** 244 relative imports rewritten to `@/` alias; `no-restricted-imports` enforces alias going forward. `Modal` stacking context issues resolved. `DataTable` sort scope explicit. 258 tests across 35 files. `framer-motion` chunk retained by decision.

---

### Phase 4 — Architecture Maturity ✅ COMPLETE (Weeks 11–14)

**Goal:** Future-proof the i18n layer, complete the design system, and establish barrel export consistency.

| Issue | Task | Effort | Status |
|---|---|---|---|
| ~~FE-P3-03~~ | Convert `t()` from plain function to locale-bound `useCallback` in `useTranslation`; add locale-change reactivity | 1–2d | ✅ Done (FE-P3-03) |
| ~~FE-P3-04~~ | Decision point: implement dark mode OR remove `ThemeToggle` | — | ✅ Done — removed (QW-8) |
| ~~FE-P3-06~~ | Add barrel `index.ts` exports to `contexts/`, `hooks/`, `services/api/`, `layouts/`; update 40 import sites | 0.5d | ✅ Done (FE-P3-06) |

**Phase 4 outcome:** i18n layer is multi-locale ready — components re-render on locale change; standalone `t()`/`tArray()` retained for non-component use. Import ergonomics uniform across the codebase via barrel exports.

---

### Roadmap Summary

| Phase | Weeks | Issues | Outcome | Status |
|---|---|---|---|---|
| 1 — Stabilization | 1–2 | FE-P0-01, FE-P0-02, FE-P0-03, FE-P1-06, FE-P2-03, FE-P2-08 | Security risks closed; RBAC drift eliminated; ESLint v9 | ✅ Complete |
| 2 — Structural Hardening | 3–6 | FE-P1-01–FE-P1-07, FE-P2-01, FE-P2-05, FE-P2-06 | Layer separation enforced; CRUD abstraction live; state unified | ✅ Complete |
| 3 — Scalability & Performance | 7–10 | FE-P2-02, FE-P2-04, FE-P2-07, FE-P2-09, FE-P3-01, FE-P3-02, FE-P3-05 | Bundle optimized; component library hardened; test coverage closed | ✅ Complete (FE-P3-01 skipped) |
| 4 — Architecture Maturity | 11–14 | FE-P3-03, FE-P3-04, FE-P3-06 | i18n multi-locale ready; import consistency | ✅ Complete |
| **Total** | **14 weeks** | **22 issues** | **21 resolved, 1 skipped** | ✅ **Roadmap complete** |


---

## 4. Frontend Architecture KPIs & Success Metrics

| Metric | Baseline | Target | Current State | Related Issues |
|---|---|---|---|---|
| CRUD pattern duplication | 7 independent implementations (~400 LOC) | 1 shared `CrudPage` abstraction | ✅ 0 duplicated LOC — `CrudPage` live | FE-P1-01 |
| Domain page test coverage | 1 of 7 pages tested (14%) | 7 of 7 (100%) | ✅ 7 of 7 — 258 tests / 35 files | FE-P3-05 |
| Server-state layer consistency | 2 data-fetching paths (TanStack Query + raw `http.get()`) | 1 path (TanStack Query only) | ✅ 1 path — `TenantContext` migrated | FE-P1-02 |
| Provider ordering safety | Comment-only constraint | Structural enforcement + runtime invariant | ✅ `AppProviders` + dev-only invariant | ~~FE-P0-01~~ |
| RBAC source of truth | Duplicated between frontend and backend | 1 canonical source (`@vsaas/types`) | ✅ `src/config/permissions.ts` deleted | ~~FE-P0-03~~ |
| Production source map exposure | Publicly exposed (`sourcemap: true`) | Hidden (`sourcemap: 'hidden'`) | ✅ `build.sourcemap: 'hidden'` | ~~FE-P0-02~~ |
| Route-level role enforcement | Authentication only (0 role checks at route boundary) | Role guard on all staff routes | ✅ `STAFF_ROLES` guard on dashboard routes | FE-P1-05 |
| Suspense boundary granularity | 1 global boundary (full-page spinner on all transitions) | Per-route boundaries (scoped loading) | ✅ 20+ per-route `<Suspense>` boundaries | FE-P1-04 |
| ESLint version | v8 (EOL October 2024) | v9 (supported) | ✅ v9.39.4 — 0 errors, 65 warnings | FE-P1-06 |
| Path alias adoption | 0% (`@/*` defined but unused) | 100% of `src/` imports | ✅ 244 imports rewritten; ESLint enforces | FE-P2-02 |
| Form validation layer | Co-located with page components | Dedicated `validation/domain/` layer | ✅ 7 domain files + barrel `index.ts` | FE-P1-07 |
| `FormField` adoption | 0 of 7 domain forms | 7 of 7 domain forms | ✅ All 7 `*Form.tsx` files migrated | FE-P2-06 |
| Modal stacking context | Inline DOM rendering | `createPortal` to `document.body` | ✅ `createPortal` in place | FE-P2-07 |
| `DataTable` sort scope | Mixed client-sort + server-pagination | Explicit `clientSort` prop | ✅ `clientSort?: boolean` (default `false`) | FE-P2-09 |
| Breadcrumbs i18n | Hardcoded `ROUTE_LABELS` map | Wired to `t()` system | ✅ `pt-BR.json` `breadcrumbs.*` section | FE-P2-05 |
| i18n locale reactivity | Plain `getState()` function — no re-render on locale change | `useCallback([locale])` — reactive | ✅ `useTranslation` returns memoised callbacks | FE-P3-03 |
| Barrel export consistency | Partial — only `components/UI/` and `store/` | All major directories | ✅ `contexts/`, `hooks/`, `services/api/`, `layouts/` | FE-P3-06 |
| `react-icons` version | v4.12.0 | v5 (improved tree-shaking) | ✅ v5.6.0 | FE-P3-02 |
| Google Fonts load strategy | Render-blocking `@import` in `global.css` | Non-blocking `<link>` in `index.html` | ✅ Non-blocking `<link>` tags | ~~FE-P2-04~~ |
| Dead UI state in Zustand | `theme`/`toggleTheme` in `uiStore` (no-op) | No dead state | ✅ Removed | ~~FE-P3-04~~ |
| CI install time | ~60s (no cache) | ~5s (cache hit) | ✅ `setup-node@v4 cache: 'npm'` | ~~FE-P2-08~~ |
| `framer-motion` chunk presence | ~100KB gzipped on first visit | Eliminated | 🔴 Retained — skipped by decision | FE-P3-01 |

---

## 5. Frontend Architecture Maturity Score

### 5.1 Dimension Scores

| Dimension | Score | Rationale |
|---|---|---|
| Layering discipline | 92 / 100 | Four-layer architecture consistently applied. `services/base/` and `services/interceptors/` fully populated. `TenantContext` on TanStack Query. `http.ts` is a thin composition layer. Validation extracted to `src/validation/domain/`. Minor gap: no structured frontend logging layer. |
| Component modularity | 90 / 100 | `CrudPage` abstraction eliminates 7× CRUD duplication. `FormField` adopted by all domain forms. `Modal` uses `createPortal`. `DataTable` sort scope explicit via `clientSort` prop. Barrel exports consistent across all major directories. |
| State management clarity | 95 / 100 | All data fetching through TanStack Query — `TenantContext`, `useHealthCheck`, and all domain hooks. No parallel fetching paths. Dead `theme`/`toggleTheme` state removed from Zustand. |
| Scalability readiness | 90 / 100 | `CrudPage` makes new domain modules 1-day additions. Form validation in dedicated layer. i18n multi-locale ready. Route-level RBAC enforced. `@/` alias enforced via ESLint. `framer-motion` chunk (~100KB) is the sole remaining scalability concern. |
| Performance architecture | 78 / 100 | Google Fonts non-blocking. Health check polling pauses on hidden tab. `react-icons` v5 tree-shaking. `framer-motion` chunk (~100KB gzipped) retained by decision — the primary remaining performance gap. |
| Resilience & fault handling | 82 / 100 | Per-route Suspense boundaries. Role-based route guards. Error boundaries at app and layout level. TanStack Query retry logic. `refreshPromise` deduplication. Gap: async errors not caught by error boundaries. |
| Build & deployment maturity | 92 / 100 | Source maps hidden. CI npm cache confirmed. `VITE_APP_ENV` present. ESLint v9.39.4 — 0 errors. `no-restricted-imports` enforces `@/` alias. `tsc --noEmit` clean. `vite build` succeeds. |
| Observability integration | 48 / 100 | `useHealthCheck` uses TanStack Query (tab-visibility-aware). 258 tests across 35 files — all domain pages, `CitizenAuthContext`, HTTP layer covered. No structured frontend logging, no error tracking integration, no performance instrumentation. |

### 5.2 Overall Score

**83 / 100 — Advanced** *(+21 from baseline of 62)*

> The roadmap has been fully executed. The architecture has advanced from "Structured" to "Advanced". The primary remaining gaps are the `framer-motion` bundle (skipped by decision) and the absence of structured frontend observability (logging, error tracking, performance instrumentation) — neither of which was in scope for this roadmap.

| Level | Score Range | Description |
|---|---|---|
| Early | 0–30 | Ad-hoc structure; no consistent patterns |
| Growing | 31–50 | Patterns emerging; significant inconsistency |
| Structured | 51–70 | Consistent patterns established; known gaps; scalability ceiling visible |
| **Advanced** | **71–85** | **Patterns enforced; abstractions in place; gaps are edge cases** |
| Enterprise-Ready | 86–100 | Full observability; zero duplication; enforced boundaries; multi-environment maturity |

### 5.3 Remaining Gaps Preventing "Enterprise-Ready" (86+)

1. **`framer-motion` bundle (FE-P3-01 — skipped).** The ~100KB gzipped chunk is downloaded on every first visit. Skipped by explicit decision. Resolving this would add ~2 points.
2. **Observability absence.** No structured frontend logging, no error tracking (e.g. Sentry), no performance instrumentation (e.g. Web Vitals reporting). This is the lowest-scoring dimension and was out of scope for this roadmap. Addressing it would add ~5–8 points.
3. **Async error boundary gap.** Async errors thrown outside React's render cycle are not caught by the existing error boundaries. A global `unhandledrejection` handler or error tracking integration would close this.


---

## 6. Executive Summary (CTO-Level)

### Overall Frontend Architecture Health Score

**83 / 100 — Advanced** *(+21 since initial assessment; all P0, P1, P2, and P3 issues resolved)*

The Secom frontend has completed its full architecture improvement roadmap. The codebase has advanced from a well-organized but duplication-heavy baseline to a fully layered, abstraction-backed, test-covered architecture. All 21 of 22 roadmap issues are resolved; the single open item (FE-P3-01) was explicitly skipped by decision.

---

### Key Structural Strengths

1. **Zero CRUD duplication.** The `CrudPage` generic abstraction replaced 7 independent implementations (~400 LOC). New domain modules are now 1-day additions with no scaffolding copy-paste.
2. **Unified server-state layer.** All data fetching runs through TanStack Query — `TenantContext`, `useHealthCheck`, and all 7 domain hooks. No parallel fetching paths remain.
3. **Enforced layer boundaries.** `src/validation/domain/` owns all form state types, empty-state factories, and validation functions. `services/base/` and `services/interceptors/` own HTTP cross-cutting concerns. `@/` alias enforced via ESLint `no-restricted-imports` — relative parent imports are blocked at the lint level.
4. **Consistent import ergonomics.** Barrel exports in `contexts/`, `hooks/`, `services/api/`, `layouts/`, `components/UI/`, and `store/` — all major directories have a single import surface.
5. **Multi-locale ready i18n.** `useTranslation` returns locale-bound `t`/`tArray` callbacks via `useCallback([locale])`. Components re-render on locale change. Standalone `t()`/`tArray()` retained for non-component use.
6. **258 tests across 35 files.** All 7 domain pages, `CitizenAuthContext`, HTTP layer, and domain validators covered. `tsc --noEmit` clean. `vite build` succeeds. 0 lint errors.

---

### Remaining Open Items

| Item | Status | Impact |
|---|---|---|
| FE-P3-01 — `framer-motion` removal | 🔴 Skipped by decision | ~100KB gzipped chunk on first visit |
| Frontend observability | Out of scope | No structured logging, error tracking, or performance instrumentation |

---

### Investment Delivered

| Scope | Issues | Developer-Days Delivered |
|---|---|---|
| P0 — Critical security & stability | 3 issues (QW-1, QW-6, QW-7) | ~1.5d |
| P1 — Scalability & maintainability | 7 issues | ~7.5d |
| P2 — Structural improvements | 9 issues (incl. 4 quick wins) | ~5d |
| P3 — Optimization & future-proofing | 5 issues (1 skipped) | ~4.5d |
| **Total delivered** | **21 issues resolved** | **~18.5 dev-days** |

---

### Recommendation

**Roadmap complete. Architecture is in the "Advanced" tier.**

The codebase is ready for the next feature sprint without architectural debt accumulating. The two remaining gaps — `framer-motion` bundle and frontend observability — are independent workstreams that can be addressed as separate initiatives when prioritized:

- **`framer-motion` removal** is a 1-day, low-risk task if bundle size becomes a concern.
- **Frontend observability** (structured logging + error tracking + Web Vitals) is a 3–5 day initiative that would push the score into the "Enterprise-Ready" tier (86+) and is the highest-value remaining investment.
