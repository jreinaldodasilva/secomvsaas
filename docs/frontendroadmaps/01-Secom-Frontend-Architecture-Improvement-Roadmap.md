# Secom Frontend — Architecture Improvement Roadmap

**Document version:** 1.0  
**Based on:** Architecture Overview Part 1 (§1–§4) and Part 2 (§5–§8)  
**Codebase snapshot:** post-commit `f2a9d48`  
**Scope:** Architecture-only. No UX, accessibility, or feature-level concerns.

---

## 1. Prioritized Architecture Issues

### Issue ID Convention

`FE-P{tier}-{sequence}` — e.g., `FE-P0-01` = Priority 0, issue 1.

---

### 🟥 P0 — Architectural Instability / Structural Risk

| ID | Issue | Architectural Impact | System Area | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| FE-P0-01 | Provider ordering constraint is comment-only — `TenantProvider` silently breaks if moved above `AuthProvider` | Any provider reorder during refactor causes silent runtime failure in tenant resolution; no compile-time or test-time guard | Bootstrap / Provider Hierarchy | 0.5d | None | Part 2 §5.1 |
| FE-P0-02 | Production source maps publicly exposed (`build.sourcemap: true`) | Full original TypeScript source readable by anyone via browser DevTools on a government-facing application | Build / Security | <0.5h | None | Part 2 §6.2 |
| FE-P0-03 | RBAC permission map duplicated between `config/permissions.ts` and backend with no shared source of truth | Permission drift between frontend and backend is undetectable at build time; a backend role change silently leaves the frontend showing wrong UI | Module Boundaries / Security | 0.5d | `@vsaas/types` package | Part 1 §1, Part 2 §7.3 |

---

### 🟧 P1 — Scalability / Maintainability Risks

| ID | Issue | Architectural Impact | System Area | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| FE-P1-01 | `CrudPage` abstraction unimplemented — identical CRUD scaffold repeated 7× (~400 LOC duplication) | Every new domain module requires copy-pasting the full DataTable + Modal + ConfirmDialog + state pattern; bugs fixed in one page do not propagate | Component Architecture | 2d | None | Part 1 §3.4, Part 2 §7.2 |
| FE-P1-02 | `TenantContext` fetches via raw `http.get()`, bypassing TanStack Query cache | Tenant data is not deduplicated, not stale-while-revalidate cached, and not invalidatable from other query operations; creates a parallel data-fetching path outside the established server-state layer | State Management / Layer Separation | 1d | None | Part 1 §2.4 |
| FE-P1-03 | `services/base/` and `services/interceptors/` are empty placeholders — token refresh and error handling are monolithically embedded in `http.ts` | `http.ts` owns fetch, auth headers, token refresh, retry, and error normalization in a single 93-LOC file; cannot be extended or tested in isolation; documented intent to extract has not been acted on | Layer Separation / Services | 1.5d | None | Part 1 §3.4 |
| FE-P1-04 | Single top-level `<Suspense>` boundary for all 20+ lazy routes — full-page spinner on every route transition | All three layout surfaces (Public, Dashboard, CitizenPortal) share one loading state; a slow chunk in any layout degrades the perceived performance of all others | Routing Architecture / Resilience | 0.5d | None | Part 2 §5.3 |
| FE-P1-05 | `ProtectedRoute` enforces authentication only — no role-based route protection at the routing layer | Any authenticated user of any role can navigate to any staff route by URL; RBAC is enforced only at the component level via `PermissionGate`, with no defence-in-depth at the route boundary | Routing Architecture / Security | 0.5d | FE-P0-03 resolved | Part 2 §7.3, §7.5 |
| FE-P1-06 | ESLint v8 at end-of-life (EOL October 2024) — static analysis toolchain is on an unsupported version | No security patches or rule updates for the linting layer; `@typescript-eslint` v8 supports ESLint v9 but the current `.eslintrc.json` flat-config migration has not been done | Build Tooling | 1d | None | Part 1 §4.3 |
| FE-P1-07 | Form validation logic co-located with page components — no dedicated validation layer | At 7 modules the coupling is manageable; at 15+ modules, form state types, empty-state factories, and validation functions scattered across `pages/Domain/` become a maintenance burden with no reuse path | Component Architecture / Layer Separation | 1d | FE-P1-01 | Part 1 §3.4 |

---

### 🟨 P2 — Structural Improvements

| ID | Issue | Architectural Impact | System Area | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| FE-P2-01 | `useHealthCheck` uses raw `setInterval` instead of TanStack Query `refetchInterval` | Polling continues when the browser tab is hidden; bypasses the established server-state layer for a use case that fits naturally within it | State Management / Observability | 0.5h | None | Part 2 §5.6 |
| FE-P2-02 | `@/*` path alias defined in `tsconfig.json` and `vite.config.ts` but unadopted — all imports use relative paths | Deep relative paths (`../../../components/UI`) will become fragile as the directory tree grows; the alias infrastructure is already in place but unused | Project Structure | 0.5d | None | Part 1 §2.3 |
| FE-P2-03 | No `VITE_APP_ENV` variable — frontend has no environment awareness | Cannot distinguish staging from production at the frontend level; environment-specific behaviour (banners, feature flags, analytics) requires a build-time workaround | Environment Configuration | 2h | None | Part 2 §6.1 |
| FE-P2-04 | Google Fonts loaded via render-blocking `@import` in `global.css` | Blocks First Contentful Paint on every cold load; standard fix (`<link rel="preconnect">` in `index.html`) is well-known and low-effort | Performance Architecture | 1h | None | Part 1 §4.3 |
| FE-P2-05 | `Breadcrumbs` uses hardcoded `ROUTE_LABELS` map — not wired to the i18n `t()` system | Creates a second source of UI strings outside the i18n layer; any label change requires editing two locations | Component Architecture / i18n | 2h | None | Part 2 §7.2 |
| FE-P2-06 | `FormField` UI component exists but is not used by any domain form — domain forms use raw `<label>/<input>` elements | The design system has a form primitive that is not adopted; form layout, error display, and attribute consistency vary across domain forms | Component Architecture | 1d | FE-P1-01 | Part 2 §7.2, §8.3 |
| FE-P2-07 | `Modal` uses inline DOM rendering, not `createPortal` | Modals rendered inside deeply nested DOM trees are subject to CSS stacking context issues; `z-index` conflicts will emerge as layout complexity grows | Component Architecture | 0.5d | None | Part 1 §2.2, Part 2 §7.2 |
| FE-P2-08 | CI pipeline has no `node_modules` cache — full `npm ci` on every run (~60s) | Slow feedback loop on every push; `actions/cache` is a one-line fix | Build / CI | 0.25h | None | Part 2 §6.3 |
| FE-P2-09 | `DataTable` mixes client-side sort with server-side pagination | Sort state and pagination state are owned by different layers; adding a new column requires reasoning about which operations are local and which are remote | Component Architecture | 1d | None | Part 2 §7.2 |

---

### 🟩 P3 — Optimization & Future Enhancements

| ID | Issue | Architectural Impact | System Area | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| FE-P3-01 | `framer-motion` (~100KB gzipped) used only for landing page animations and `TopLoadingBar` | The `motion` chunk is isolated but still downloaded on first visit; CSS `@keyframes` replacements would eliminate the dependency entirely | Bundle Structure | 1d | None | Part 1 §4.3 |
| FE-P3-02 | `react-icons` v4 — v5 available with improved tree-shaking | Minor bundle size improvement; upgrade is mechanical via the `Icon.tsx` wrapper | Dependency Management | 2h | None | Part 1 §4.3 |
| FE-P3-03 | i18n `t()` is a plain function reading `getState()` — components do not subscribe to locale changes | Architecture is not ready for multi-locale support; adding a second locale would require breaking all `t()` call sites or a forced re-render mechanism | i18n Architecture | 1–2d | None | Part 2 §7.4 |
| FE-P3-04 | `ThemeToggle` is a no-op — `toggleTheme()` updates Zustand state but dark mode CSS tokens are not defined | Dead UI element; either the dark mode token set must be implemented in `tokens/index.css` or the toggle must be removed | Component Architecture / Design System | 1h (remove) / 1d (implement) | None | Part 1 §1, Part 2 §8.3 |
| FE-P3-05 | 6 of 7 domain pages have no unit tests; `useSessionTimeout`, `useHealthCheck`, `CitizenAuthContext` untested | Low test coverage on the domain layer means structural regressions during refactor (especially FE-P1-01) will not be caught automatically | Testability | 3d | FE-P1-01 | Part 2 §7.6 |
| FE-P3-06 | Barrel `index.ts` exports are partial — only `components/UI/` and `store/` have them | Inconsistent import ergonomics across the codebase; `contexts/`, `hooks/`, `services/api/`, and `layouts/` all require direct file imports | Project Structure | 0.5d | FE-P2-02 | Part 1 §3.3 |

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
| State management debt | FE-P1-02, FE-P2-01, FE-P3-04 | `TenantContext` outside cache; `useHealthCheck` outside TanStack Query; dead theme state in Zustand | State sources multiply; cache invalidation becomes inconsistent; dead state misleads future developers | 2d | P1/P2 | Part 1 §2.4, Part 2 §5.6 |
| Routing architecture debt | FE-P1-04, FE-P1-05 | Single Suspense boundary; no role-based route guards | Full-page spinner on every navigation; unauthorized role access to staff routes caught only at component level | 1d | P1 | Part 2 §5.3, §7.3 |
| Performance architecture debt | FE-P2-04, FE-P3-01 | Render-blocking Google Fonts `@import`; `framer-motion` chunk on first visit | FCP degraded on cold load; ~100KB unnecessary download for users who only visit the landing page | 1d + 1h | P2/P3 | Part 1 §4.3 |
| Build & bundling debt | FE-P0-02, FE-P2-08, FE-P1-06 | Public source maps; no CI cache; ESLint v8 EOL | Source code exposed in production; slow CI feedback; no lint security patches | 1.5d | P0/P1/P2 | Part 2 §6.2, §6.3, Part 1 §4.3 |
| Environment configuration debt | FE-P2-03 | No `VITE_APP_ENV` — frontend cannot distinguish environments | Environment-specific behaviour requires build-time workarounds; staging and production behave identically | 2h | P2 | Part 2 §6.1 |
| Security hardening gaps | FE-P0-02, FE-P0-03, FE-P1-05 | Public source maps; RBAC permission drift; no route-level role enforcement | Source exposure; silent permission mismatch between frontend and backend; role bypass via direct URL | 2d | P0/P1 | Part 2 §6.2, §7.3 |
| Scalability constraints | FE-P1-01, FE-P1-07, FE-P3-03 | No CRUD abstraction; form logic in page layer; i18n not multi-locale ready | Adding modules 8–15 multiplies duplication linearly; i18n refactor becomes a breaking change at scale | 5d | P1/P3 | Part 1 §3.4, Part 2 §7.4 |
| Observability gaps | FE-P2-01, FE-P3-05 | `useHealthCheck` outside TanStack Query; 6 domain pages untested | Health polling wastes resources; structural regressions during refactor go undetected | 3.5d | P2/P3 | Part 2 §5.6, §7.6 |

### 2.2 Debt Summary

| Metric | Value |
|---|---|
| Total estimated developer-days | **17.5 days** |
| Confidence level | **Medium** |
| P0 items (must resolve) | 3 issues / ~1 day |
| P1 items (resolve within 2 sprints) | 7 issues / ~7.5 days |
| P2 items (resolve within 1 quarter) | 9 issues / ~4.75 days |
| P3 items (backlog) | 6 issues / ~7.5 days |

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

### Phase 1 — Stabilization (Weeks 1–2)

**Goal:** Eliminate production security risks, enforce structural constraints, and unblock all subsequent phases.

| Issue | Task | Owner Suggestion | Effort |
|---|---|---|---|
| FE-P0-01 | Encode provider ordering constraint structurally — extract a `AppProviders` composition component that enforces nesting order and add a runtime invariant check | 1 engineer | 0.5d |
| FE-P0-02 | Change `build.sourcemap: true` → `'hidden'` in `vite.config.ts` | 1 engineer | 0.5h |
| FE-P0-03 | Move `ROLE_PERMISSIONS` map from `config/permissions.ts` into `@vsaas/types`; update frontend import; coordinate backend to import from the same package | 1 engineer | 0.5d |
| FE-P1-06 | Migrate `.eslintrc.json` to `eslint.config.js` flat config; upgrade ESLint to v9 | 1 engineer | 1d |
| FE-P2-03 | Add `VITE_APP_ENV` to `config/env.ts`; update `.env.example`; document in README | 1 engineer | 2h |
| FE-P2-08 | Add `actions/cache` for npm cache in `ci.yml` | 1 engineer | 0.25h |

**Total Phase 1 effort:** ~2.5 days  
**Dependencies:** None — all Phase 1 items are independent  
**Business impact:** Eliminates source code exposure in production; closes RBAC drift risk; restores linting security coverage; unblocks Phase 2 work on permissions and environment config

---

### Phase 2 — Structural Hardening (Weeks 3–6)

**Goal:** Enforce layer separation, eliminate the primary scalability ceiling, and bring state management into a single coherent model.

| Issue | Task | Owner Suggestion | Effort |
|---|---|---|---|
| FE-P1-01 | Implement `CrudPage` abstraction in `components/UI/CrudPage/`; migrate all 7 domain pages to use it | 1–2 engineers | 2d |
| FE-P1-02 | Migrate `TenantContext` data fetching from raw `http.get()` to a TanStack Query `useQuery` call | 1 engineer | 1d |
| FE-P1-03 | Extract token refresh logic from `http.ts` into `services/interceptors/`; extract base request logic into `services/base/` | 1 engineer | 1.5d |
| FE-P1-04 | Replace single top-level `<Suspense>` with per-layout Suspense boundaries in `routes/index.tsx` | 1 engineer | 0.5d |
| FE-P1-05 | Add optional `requiredRole` prop to `ProtectedRoute`; apply role guards to staff dashboard routes | 1 engineer | 0.5d |
| FE-P1-07 | Extract form validation schemas from page components into a `validation/` layer (after FE-P1-01) | 1 engineer | 1d |
| FE-P2-01 | Replace `setInterval` in `useHealthCheck` with TanStack Query `refetchInterval: 30000, refetchIntervalInBackground: false` | 1 engineer | 0.5h |
| FE-P2-05 | Wire `Breadcrumbs` `ROUTE_LABELS` map to `t()` keys in `pt-BR.json` | 1 engineer | 2h |
| FE-P2-06 | Migrate domain forms from raw `<label>/<input>` to `FormField` UI component (after FE-P1-01) | 1 engineer | 1d |

**Total Phase 2 effort:** ~8 days  
**Dependencies:** FE-P1-01 must complete before FE-P1-07 and FE-P2-06; FE-P0-03 (Phase 1) must complete before FE-P1-05  
**Parallel tracks:** FE-P1-01 + FE-P1-02 + FE-P1-03 can run in parallel; FE-P1-07 and FE-P2-06 are sequential after FE-P1-01  
**Business impact:** Eliminates ~400 LOC of CRUD duplication; new domain modules become 1-day additions instead of 3-day copy-paste exercises; state management is unified under TanStack Query; layer boundaries are enforced

---

### Phase 3 — Scalability & Performance (Weeks 7–10)

**Goal:** Optimize the build and runtime performance architecture; harden the component library boundaries.

| Issue | Task | Owner Suggestion | Effort |
|---|---|---|---|
| FE-P2-04 | Replace `@import` in `global.css` with `<link rel="preconnect">` + `<link rel="stylesheet">` in `index.html` | 1 engineer | 1h |
| FE-P2-07 | Migrate `Modal` from inline DOM to `createPortal` targeting `document.body` | 1 engineer | 0.5d |
| FE-P2-09 | Resolve `DataTable` mixed sort/pagination concern — move sort to server-side or make client-sort scope explicit via prop | 1 engineer | 1d |
| FE-P2-02 | Adopt `@/*` path alias across all `src/` imports; enforce via ESLint `no-restricted-imports` rule | 1 engineer | 0.5d |
| FE-P3-01 | Replace `framer-motion` landing page animations with CSS `@keyframes`; replace `TopLoadingBar` with CSS transition | 1 engineer | 1d |
| FE-P3-02 | Upgrade `react-icons` v4 → v5 via `Icon.tsx` wrapper | 1 engineer | 2h |
| FE-P3-05 | Add unit tests for 6 untested domain pages, `useSessionTimeout`, `useHealthCheck`, `CitizenAuthContext` (after FE-P1-01) | 2 engineers | 3d |

**Total Phase 3 effort:** ~7 days  
**Dependencies:** FE-P3-05 requires FE-P1-01 complete; FE-P2-07 is independent; FE-P2-09 is independent  
**Parallel tracks:** FE-P2-04, FE-P2-07, FE-P3-01, FE-P3-02 are fully independent and can run in parallel  
**Business impact:** Eliminates render-blocking font load (FCP improvement); removes ~100KB `framer-motion` chunk; `Modal` stacking context issues resolved before they manifest; test coverage closes regression risk from Phase 2 refactors

---

### Phase 4 — Architecture Maturity (Weeks 11–14)

**Goal:** Future-proof the i18n layer, complete the design system, and establish barrel export consistency.

| Issue | Task | Owner Suggestion | Effort |
|---|---|---|---|
| FE-P3-03 | Convert `t()` from plain function to `useT()` hook; update all call sites; add locale-change reactivity | 1 engineer | 1–2d |
| FE-P3-04 | Decision point: implement dark mode token set in `tokens/index.css` OR remove `ThemeToggle` from UI | 1 engineer | 1h (remove) / 1d (implement) |
| FE-P3-06 | Add barrel `index.ts` exports to `contexts/`, `hooks/`, `services/api/`, `layouts/`; enforce via ESLint | 1 engineer | 0.5d |

**Total Phase 4 effort:** ~3 days (remove dark mode) / ~4 days (implement dark mode)  
**Dependencies:** FE-P3-03 requires FE-P2-02 (path alias adoption) to be complete for clean import updates; FE-P3-04 is independent  
**Business impact:** i18n layer becomes multi-locale ready without a breaking refactor; design system is internally consistent; import ergonomics are uniform across the codebase

---

### Roadmap Summary

| Phase | Weeks | Issues | Effort | Key Outcome |
|---|---|---|---|---|
| 1 — Stabilization | 1–2 | FE-P0-01, FE-P0-02, FE-P0-03, FE-P1-06, FE-P2-03, FE-P2-08 | ~2.5d | Security risks closed; RBAC drift eliminated; linting restored |
| 2 — Structural Hardening | 3–6 | FE-P1-01 through FE-P1-07, FE-P2-01, FE-P2-05, FE-P2-06 | ~8d | Layer separation enforced; CRUD abstraction live; state unified |
| 3 — Scalability & Performance | 7–10 | FE-P2-02, FE-P2-04, FE-P2-07, FE-P2-09, FE-P3-01, FE-P3-02, FE-P3-05 | ~7d | Bundle optimized; component library hardened; test coverage closed |
| 4 — Architecture Maturity | 11–14 | FE-P3-03, FE-P3-04, FE-P3-06 | ~3–4d | i18n multi-locale ready; design system complete; import consistency |
| **Total** | **14 weeks** | **19 issues** | **~20.5–21.5d** | |


---

## 4. Frontend Architecture KPIs & Success Metrics

| Metric | Current State | Target | Measurement Method | Related Issues |
|---|---|---|---|---|
| CRUD pattern duplication | 7 independent implementations (~400 LOC) | 1 shared `CrudPage` abstraction (0 duplicated LOC) | LOC diff after FE-P1-01 | FE-P1-01 |
| Domain page test coverage | 1 of 7 domain pages tested (14%) | 7 of 7 (100%) | Vitest coverage report | FE-P3-05 |
| Server-state layer consistency | 2 data-fetching paths (TanStack Query + raw `http.get()` in TenantContext) | 1 path (TanStack Query only) | Code audit: grep for `http.get` outside `services/api/` | FE-P1-02 |
| Provider ordering safety | Comment-only constraint (0 structural enforcement) | Structural enforcement via `AppProviders` composition + runtime invariant | Code review gate | FE-P0-01 |
| RBAC source of truth | 2 copies (frontend `config/permissions.ts` + backend) | 1 canonical source (`@vsaas/types`) | Package import audit | FE-P0-03 |
| Production source map exposure | Public (`build.sourcemap: true`) | Hidden (`build.sourcemap: 'hidden'`) | Build artifact inspection | FE-P0-02 |
| Route-level role enforcement | Authentication only (0 role checks at route boundary) | Role guard on all staff routes | Route config audit | FE-P1-05 |
| Suspense boundary granularity | 1 global boundary (full-page spinner on all transitions) | 3 per-layout boundaries (scoped loading) | Route config audit | FE-P1-04 |
| CI install time | ~60s (no cache) | ~5s (cache hit) | GitHub Actions job duration | FE-P2-08 |
| `framer-motion` chunk presence | Downloaded on first visit (~100KB gzipped) | Eliminated | Bundle analyzer (Rollup output) | FE-P3-01 |
| ESLint version | v8 (EOL) | v9 (supported) | `npm list eslint` | FE-P1-06 |
| Path alias adoption | 0% (`@/*` defined but unused) | 100% of `src/` imports | ESLint `no-restricted-imports` rule enforcement | FE-P2-02 |

---

## 5. Frontend Architecture Maturity Score

### 5.1 Dimension Scores

| Dimension | Score | Rationale | Source |
|---|---|---|---|
| Layering discipline | 72 / 100 | Four-layer architecture is defined and consistently applied across domain modules. Two violations: `TenantContext` bypasses the cache layer; `http.ts` owns cross-cutting concerns that belong in the interceptor layer. | Part 1 §2.4, §3.4; Part 2 §7.1 |
| Component modularity | 55 / 100 | 20-component UI library is well-structured. Critical gap: CRUD pattern repeated 7× with no abstraction; `FormField` exists but is unused; `Modal` lacks portal rendering; `DataTable` has mixed sort/pagination concerns. | Part 1 §3.4; Part 2 §7.2 |
| State management clarity | 65 / 100 | Server state (TanStack Query) and client state (Zustand) are cleanly separated. Gaps: `TenantContext` outside the cache; `useHealthCheck` outside TanStack Query; dead theme state in Zustand. | Part 1 §2.4; Part 2 §5.6 |
| Scalability readiness | 50 / 100 | Domain hook pattern is consistent and extensible. Blocked by: CRUD duplication scales linearly with module count; form validation in page layer; i18n not multi-locale ready; no route-level RBAC. | Part 1 §3.4; Part 2 §7.3, §7.4 |
| Performance architecture | 58 / 100 | Route-level code splitting is implemented for all 20+ pages; manual chunk strategy is sound. Gaps: render-blocking font load; `framer-motion` chunk on first visit; health check polling ignores tab visibility. | Part 1 §4.4; Part 2 §5.6, §6.2 |
| Resilience & fault handling | 70 / 100 | Error boundaries at app and layout level; TanStack Query retry logic; `refreshPromise` deduplication for token refresh. Gap: single Suspense boundary degrades all layouts simultaneously; async errors not caught by boundaries. | Part 2 §5.3, §5.4 |
| Build & deployment maturity | 60 / 100 | Vite chunking strategy is deliberate; CI pipeline is well-ordered (type-check → lint → test → build → E2E). Gaps: public source maps; no CI cache; ESLint v8 EOL; no environment awareness variable. | Part 2 §6.2, §6.3; Part 1 §4.3 |
| Observability integration | 40 / 100 | `useHealthCheck` + `ConnectionBanner` provides basic API reachability signal. No structured frontend logging, no error tracking integration, no performance instrumentation. Health check bypasses the established state layer. | Part 2 §5.6 |

### 5.2 Overall Score

**62 / 100 — Structured**

| Level | Score Range | Description |
|---|---|---|
| Early | 0–30 | Ad-hoc structure; no consistent patterns |
| Growing | 31–50 | Patterns emerging; significant inconsistency |
| **Structured** | **51–70** | **Consistent patterns established; known gaps; scalability ceiling visible** |
| Advanced | 71–85 | Patterns enforced; abstractions in place; gaps are edge cases |
| Enterprise-Ready | 86–100 | Full observability; zero duplication; enforced boundaries; multi-environment maturity |

### 5.3 Key Blockers Preventing Advancement to "Advanced" (71+)

1. **CRUD abstraction gap (FE-P1-01)** — The most visible scalability ceiling. Until `CrudPage` is implemented, the component layer score cannot exceed 65.
2. **State management fragmentation (FE-P1-02, FE-P2-01)** — Two data-fetching paths and one polling mechanism outside TanStack Query prevent the state management score from reaching 80+.
3. **Observability absence** — No structured frontend logging or error tracking integration. The observability dimension is the lowest-scoring area and requires dedicated investment beyond the current roadmap scope.
4. **Security gaps (FE-P0-02, FE-P0-03)** — Public source maps and RBAC drift are active risks that suppress the build/deployment and scalability scores until resolved.

---

## 6. Executive Summary (CTO-Level)

### Overall Frontend Architecture Health Score

**62 / 100 — Structured**

The Secom frontend is a well-organized, type-safe React 18 SPA with a coherent four-layer architecture, consistent domain hook patterns, and a functional CI pipeline. The codebase is clean — no file exceeds 200 LOC, TypeScript strict mode is enforced, and the server/client state boundary is clearly drawn. The foundation is sound.

However, the architecture has reached a visible scalability ceiling at 7 domain modules, carries three active production risks, and has an observability gap that will become critical as the system grows.

---

### Key Structural Strengths

1. **Consistent four-layer architecture.** Pages → Domain Hooks → Service Functions → HTTP Client is applied uniformly across all 7 domain modules. Adding new modules follows a predictable, low-friction pattern.
2. **Type-safe API contract.** The `@vsaas/types` workspace package enforces alignment between frontend and backend at compile time. TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters` prevents silent type drift.
3. **Deliberate bundle strategy.** Route-level code splitting via `React.lazy()` on all 20+ pages, combined with four manual Vite chunks (vendor, query, motion, icons), produces a well-structured bundle with no monolithic entry point.

---

### Major Architectural Risks

1. **RBAC permission drift (FE-P0-03 — Active).** The frontend permission map in `config/permissions.ts` is a manual duplicate of the backend RBAC configuration. A backend role change that is not mirrored to the frontend silently shows incorrect UI to users. This is undetectable at build time and has no automated guard.
2. **Production source code exposure (FE-P0-02 — Active).** `build.sourcemap: true` publishes the full original TypeScript source to the production CDN. For a government-facing application, this is an unnecessary information disclosure risk. The fix is a single configuration change.
3. **CRUD duplication scalability ceiling (FE-P1-01 — Structural).** The identical DataTable + Modal + ConfirmDialog + state management pattern is implemented independently in all 7 domain pages (~400 LOC of duplication). The `CrudPage` abstraction directory exists but is empty. At the current growth rate, each new domain module adds ~60 LOC of duplicated scaffolding and multiplies the surface area for bugs.

---

### Estimated Investment

| Scope | Developer-Days | Calendar Time (3–5 engineers) |
|---|---|---|
| P0 — Critical security & stability | ~1 day | Week 1 |
| P1 — Scalability & maintainability | ~7.5 days | Weeks 2–4 |
| P2 — Structural improvements | ~4.75 days | Weeks 5–8 |
| P3 — Optimization & future-proofing | ~7.5 days | Weeks 9–14 |
| **Total** | **~20.75 days** | **14 weeks** |

**Risk if P0 items are delayed:** Source code exposure and RBAC drift are active in production today. Both are sub-1-day fixes. Delaying them beyond the current sprint carries disproportionate risk relative to effort.

**Risk if P1 items are delayed beyond 2 sprints:** The CRUD duplication ceiling means that adding modules 8–10 (planned per the README module list) will each require 3 days of copy-paste work instead of 1 day of configuration. The structural debt compounds with each new module.

---

### Recommendation

**Stable but requires targeted hardening.**

The frontend does not require a strategic restructuring. The architecture is coherent, the patterns are established, and the team has demonstrated discipline in applying them. What is required is:

1. Immediate resolution of the three P0 items (≤1 day total, no architectural risk)
2. A focused 2-sprint structural hardening phase (Phase 2) to implement the `CrudPage` abstraction and unify the state management layer before the next module sprint begins
3. Incremental delivery of P2 and P3 items alongside feature work, prioritized by the KPI targets in §4

The architecture is on a clear path to the "Advanced" maturity tier. The primary blocker is execution on the CRUD abstraction and state management unification — both of which are well-scoped, low-risk refactors with high return on investment.
