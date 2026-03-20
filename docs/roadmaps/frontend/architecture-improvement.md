# Secom Frontend — Architecture Improvement Roadmap

> **Source:** `docs/architecture/frontend/overview-part1.md`, `overview-part2.md`, `overview-part3.md`
> **Scope:** Architecture findings only. No cross-document inference.
> **Last updated:** Quick Wins QW-01 through QW-09 completed. See `docs/roadmaps/frontend/architecture-quick-wins.md`.

---

## 1. Prioritized Architecture Issues

### Severity Criteria

| Symbol | Meaning |
|--------|---------| 
| 🟥 P0 | Production fragility, major coupling, scalability blockers, global state instability |
| 🟧 P1 | Long-term maintainability degradation or architectural rigidity |
| 🟨 P2 | Structural refinement opportunity |
| 🟩 P3 | Strategic enhancement or modernization |

---

### 🟥 P0 – Architectural Instability / Structural Risk

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source Section | Status |
|---|-------|---------------------|-------------|--------|--------------|----------------|--------|
| P0-01 | ~~`CitizenDashboardPage` hardcodes a link to `/appointments` (staff route), redirecting citizens to the staff login page~~ | ~~Broken cross-context navigation; auth context boundary violation~~ | ~~Routing / Citizen Portal~~ | ~~0.5d~~ | ~~None~~ | §8.5, §9 H1 | ✅ Resolved (QW-01) |
| P0-02 | Zustand stores (`uiStore`, `toastStore`) are module-level singletons not provided via React Context — cannot be reset between tests without explicit cleanup | Test isolation failure; state leakage across test suites | State Management / Testability | 2d | Test suite refactor | §7.3, §7.7 | Open |

---

### 🟧 P1 – Scalability / Maintainability Risks

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source Section | Status |
|---|-------|---------------------|-------------|--------|--------------|----------------|--------|
| P1-01 | ~~`react-hot-toast` declared as a production dependency but never imported — dead dependency with transitive surface and potential bundle inclusion~~ | ~~Bundle bloat; dependency confusion; unclear notification strategy ownership~~ | ~~Dependency Management~~ | ~~0.5d~~ | ~~None~~ | §4.1, §4.3, §9 H2 | ✅ Resolved (QW-02) |
| P1-02 | `CrudPage` abstraction is reaching its limits: `AppointmentsPage` already uses `useRef` + `formExtraProps` workaround to pass state outside `CrudPage`'s form management | Abstraction leakage; workarounds will proliferate as workflows grow (approval flows, multi-step forms) | Component Architecture | 5d | Press release approval workflow (§9 L5) | §7.3, §8.4 | Open |
| P1-03 | Standalone `t()` function reads Zustand store state directly and is not reactive — components using it will not re-render on locale change | Silent i18n breakage if a second locale is added; `ProtectedRoute` is a concrete affected site | i18n / State Architecture | 2d | None | §8.3, §9 M3 | Open |
| P1-04 | ~~No CI coverage threshold enforced — `vitest run --coverage` exists as a script but is not gated in CI~~ | ~~Coverage regression goes undetected; 24% file coverage with no floor~~ | ~~Build / CI~~ | ~~1d~~ | ~~None~~ | §6.4, §7.7, §9 H3 | ✅ Resolved (QW-04) — conservative thresholds active; raise incrementally |
| P1-05 | ~~`authentication.cy.ts` Cypress spec exists but is excluded from the CI `--spec` filter — auth flows are untested in CI~~ | ~~Critical auth regressions can reach production undetected~~ | ~~Build / CI~~ | ~~0.5d~~ | ~~None~~ | §6.4, §9 M5 | ✅ Resolved (QW-03) |
| P1-06 | Detail queries are not invalidated on mutation success — a stale detail view is possible when another user updates the same record | Data consistency risk in multi-user scenarios | Server State Architecture | 1d | None | §8.6 | Open |

---

### 🟨 P2 – Structural Improvements

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source Section | Status |
|---|-------|---------------------|-------------|--------|--------------|----------------|--------|
| P2-01 | ~~`src/pages/Domain/CitizenPortal/` (staff view) and `src/pages/CitizenPortal/` (citizen view) share a confusingly similar name~~ | ~~Developer onboarding friction; misrouted code placement risk~~ | ~~Folder Organization~~ | ~~1d~~ | ~~Route + import updates~~ | §3.2, §9 M1 | ✅ Resolved (QW-05) — renamed to `CitizenRecords/`; shim files in old path pending cleanup |
| P2-02 | Form validation is plain imperative code — no schema library (Zod/Yup/Valibot) — limits composability, reuse, and TypeScript type inference from schemas | Validation logic cannot be shared with backend; error message construction mixes i18n keys with hardcoded strings | Validation Architecture | 4d | None | §3.2, §4.3, §8.4, §9 M6 | Open |
| P2-03 | ~~Domain list pages do not render an error state when `isError` is true — silently show an empty table~~ | ~~Silent failure; no user feedback or retry path on API errors~~ | ~~Error Handling / Resilience~~ | ~~2d~~ | ~~None~~ | §7.5, §9 M4 | ✅ Resolved (QW-09) — `CrudPage` renders `EmptyState` + retry on `isError` |
| P2-04 | ~~`framer-motion` (~100KB gzipped) used only in `TopLoadingBar` for a simple progress bar animation~~ | ~~Disproportionate bundle cost for a single animation; inflates initial load~~ | ~~Bundle / Dependency~~ | ~~1d~~ | ~~None~~ | §4.1, §4.3, §9 M2 | ⚠️ Partially resolved (QW-08) — `TopLoadingBar` migrated to CSS; `framer-motion` retained for Landing components |
| P2-05 | No `.env.staging` or `.env.production` file for the frontend — no local way to simulate a staging build without manually setting environment variables | Environment parity gap; staging-specific bugs may not surface locally | Environment Configuration | 1d | None | §6.2 | Open |
| P2-06 | ~~`src/types/` directory exists but is empty — all types live in `packages/types`~~ | ~~Misleading structure; new developers may place types in the wrong location~~ | ~~Folder Organization~~ | ~~0.5d~~ | ~~None~~ | §3.4, §9 L1 | ✅ Resolved (QW-06) — directory was already absent |

---

### 🟩 P3 – Optimization & Future Enhancements

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source Section | Status |
|---|-------|---------------------|-------------|--------|--------------|----------------|--------|
| P3-01 | `ErrorBoundary` logs to `console.error` only — no error monitoring integration (Sentry/Datadog) | Production errors are invisible without user reports | Observability | 2d | None | §4.3, §9 L3 | Open |
| P3-02 | Date formatting (`toLocaleDateString('pt-BR')`) is scattered inline across page components — no shared utility | Inconsistency risk; timezone handling not centralized | Code Structure | 1d | None | §4.3, §9 L4 | Open |
| P3-03 | Seven inline SVG icon components defined at the top of `DashboardPage.tsx` | Reduces reusability; inflates file size | Component Architecture | 0.5d | None | §3.4, §9 L2 | Open |
| P3-04 | ~~`@tanstack/react-query-devtools` installed but not rendered anywhere~~ | ~~Lost developer experience value~~ | ~~Build / DX~~ | ~~0.5d~~ | ~~None~~ | §9 L6 | ✅ Resolved (QW-07) — rendered conditionally in `QueryProvider` (DEV only) |
| P3-05 | `CrudPage` single-modal pattern will need extension or bypass for press release approval workflows (multi-status, audit trail) | Architectural constraint on future domain complexity | Component Architecture | 5d | Business requirement | §9 L5 | Open |
| P3-06 | No date library — `toLocaleDateString` inline calls are not timezone-aware | Future timezone requirements would require scattered refactor | Dependency Architecture | 1d | None | §4.3 | Open |
| P3-07 | Runtime-configurable API URL not supported — `VITE_API_URL` is inlined at build time; white-label or dynamic tenant routing would require a separate build per environment or a `/config.json` fetch-at-startup approach | Scalability constraint for multi-tenant white-label deployments | Build / Environment | 3d | Multi-tenant requirement | §6.5 | Open |

---

## 2. Frontend Architecture Technical Debt Assessment

| Category | Description | Risk if Ignored | Effort Estimate | Priority | Status | Source Section |
|----------|-------------|-----------------|-----------------|----------|--------|----------------|
| Structural layering debt | `CrudPage` abstraction leakage via `formExtraProps`/`useRef` workarounds; pattern will proliferate | Increasing workaround complexity per module; abstraction becomes a liability | 5d | P1 | Open | §7.3, §8.4 |
| Component coupling debt | ~~Inline SVG icons in `DashboardPage`; `CitizenDashboardPage` hardcoded staff route link~~ → Inline SVG icons in `DashboardPage` remains | ~~Reuse blocked; cross-context coupling~~ → Reuse blocked | 0.5d | P3 | Partially resolved — route link fixed (QW-01) | §3.4, §8.5 |
| State management debt | Zustand singletons not resettable between tests; non-reactive `t()` reads store state directly | Test isolation failures; silent i18n breakage on locale expansion | 4d | P0/P1 | Open | §7.3, §8.3 |
| Routing architecture debt | ~~Citizen portal directory naming collision; broken citizen→staff route link~~ | ~~Developer confusion; auth context boundary violations~~ | ~~1.5d~~ | ~~P0/P2~~ | ✅ Resolved (QW-01, QW-05) | §3.2, §8.5 |
| Performance architecture debt | ~~`framer-motion` for single animation~~; no runtime config strategy for multi-tenant builds | ~~Bundle bloat~~; build-per-environment constraint | 3d (was 4d) | P2/P3 | Partially resolved — `TopLoadingBar` migrated (QW-08); Landing components retain `framer-motion` | §4.3, §6.5 |
| Build & bundling debt | ~~No coverage threshold in CI; `authentication.cy.ts` excluded from CI~~ | ~~Regressions reach production undetected~~ | ~~1.5d~~ | ~~P1~~ | ✅ Resolved (QW-03, QW-04) — thresholds conservative; raise incrementally | §6.4 |
| Environment configuration debt | No `.env.staging`/`.env.production` frontend files; no local staging simulation | Environment parity gap; staging bugs surface only in CI | 1d | P2 | Open | §6.2 |
| Observability gaps | `ErrorBoundary` logs to `console.error` only; no error monitoring SDK; ~~`react-query-devtools` not rendered~~ | Production errors invisible without user reports | 2d (was 2d) | P3 | Partially resolved — devtools added (QW-07); error monitoring SDK still absent | §4.3, §9 L3 |
| Security hardening gaps | ~~Dead `react-hot-toast` production dependency adds transitive attack surface~~ | ~~Unnecessary dependency surface; unclear ownership~~ | ~~0.5d~~ | ~~P1~~ | ✅ Resolved (QW-02) | §4.1, §4.3 |
| Scalability constraints | Imperative validation (no schema library); inline date formatting; `VITE_API_URL` build-time inlining | Validation cannot scale to complex forms or be shared with backend; multi-tenant builds require per-env CI | 8d | P1/P2/P3 | Open | §4.3, §6.5, §8.4 |
| Error resilience gaps | ~~Domain list pages silently fail on `isError`~~ | ~~No user feedback or retry path~~ | ~~2d~~ | ~~P2~~ | ✅ Resolved (QW-09) | §7.5 |

### Debt Summary

| Metric | Before Quick Wins | After Quick Wins |
|--------|-------------------|------------------|
| Total estimated developer-days | **28.5d** | **~19d** |
| Resolved items | — | 9 issues fully resolved; 2 partially resolved |
| Confidence level | Medium | Medium |
| Assumptions | Single frontend engineer per task; no backend coordination required except for schema validation sharing (P2-02); estimates assume existing test coverage is not broken by refactors | Same |

---

## 3. Phased Frontend Architecture Roadmap

> Assumes 3–5 frontend engineers, 2-week sprints, parallel work where boundaries permit.
> Phase 1 is complete. Phases 2–4 reflect remaining work.

---

### Phase 1 – Stabilization ✅ Complete

**Goal:** Eliminate production-impacting structural risks and CI blind spots.

| Issue | Description | Effort | Status |
|-------|-------------|--------|--------|
| P0-01 | Fix broken citizen→staff route link in `CitizenDashboardPage` | 0.5d | ✅ Done (QW-01) |
| P1-01 | Remove `react-hot-toast` from production dependencies | 0.5d | ✅ Done (QW-02) |
| P1-04 | Add coverage threshold to CI (`vitest run --coverage`) | 1d | ✅ Done (QW-04) |
| P1-05 | Add `authentication.cy.ts` to CI Cypress spec filter | 0.5d | ✅ Done (QW-03) |
| P2-06 | Remove or document empty `src/types/` directory | 0.5d | ✅ Done (QW-06) |

**Total effort:** ~3d ✅
**Business impact:** Citizen UX breakage eliminated; CI coverage blind spots closed; dead dependency surface removed.

---

### Phase 2 – Structural Hardening (Weeks 3–6)

**Goal:** Enforce layer separation, fix state isolation, improve resilience patterns, and harden environment configuration.

> P2-01, P2-03, and P3-04 were completed as Quick Wins and are removed from this phase.

| Issue | Description | Effort | Status |
|-------|-------------|--------|--------|
| P0-02 | Refactor Zustand stores to support test isolation (reset helpers or Context-provided stores) | 2d | Open |
| P1-03 | Standardize on `useTranslation().t` inside all components; remove standalone `t()` from component scope | 2d | Open |
| P1-06 | Invalidate detail queries on mutation success in domain hooks | 1d | Open |
| P2-05 | Add `.env.staging` and `.env.production` frontend environment files | 1d | Open |
| P2-04 (remainder) | Migrate Landing component animations away from `framer-motion`; remove dependency entirely | 1d | Open — `TopLoadingBar` done; Landing components remain |

**Total effort:** ~7d (was ~9.5d)
**Dependencies:** P0-02 before any test suite expansion; P2-04 remainder is independent.
**Business impact:** Eliminates test isolation failures; closes the i18n reactive gap before locale expansion; establishes environment parity; completes `framer-motion` removal.

---

### Phase 3 – Scalability & Performance (Weeks 7–10)

**Goal:** Reduce bundle weight, introduce schema-based validation, and centralize cross-cutting utilities.

> P2-04 (`TopLoadingBar` migration) was completed as QW-08 and is removed. The remainder (Landing components) is carried into Phase 2.

| Issue | Description | Effort | Status |
|-------|-------------|--------|--------|
| P2-02 | Introduce Zod (or equivalent) for form validation; migrate domain validation files | 4d | Open |
| P3-02 | Extract shared `formatDate`/`formatDateTime` utility; replace inline `toLocaleDateString` calls | 1d | Open |
| P3-03 | Extract inline SVG icons from `DashboardPage` to `src/components/UI/Icon/` | 0.5d | Open |
| P3-06 | Evaluate `date-fns` adoption for timezone-aware date formatting | 1d | Open |

**Total effort:** ~6.5d (was ~7.5d)
**Dependencies:** P2-02 benefits from P0-02 (test isolation) being complete first; P3-02 and P3-03 are independent.
**Business impact:** Validation becomes composable and type-safe; date handling is consistent and timezone-ready; bundle size reduced further once `framer-motion` is fully removed in Phase 2.

---

### Phase 4 – Architecture Maturity (Weeks 11–14)

**Goal:** Future-proof the component abstraction layer, add observability, and address multi-tenant build scalability.

| Issue | Description | Effort | Status |
|-------|-------------|--------|--------|
| P1-02 | Extend `CrudPage` with an escape hatch API (e.g., `renderActions`, `renderExtraModal`) to eliminate `formExtraProps`/`useRef` workarounds | 5d | Open |
| P3-01 | Integrate error monitoring SDK (Sentry or equivalent) into `ErrorBoundary` | 2d | Open |
| P3-05 | Design `CrudPage` extension or bypass pattern for approval workflows (press releases) | 5d | Open |
| P3-07 | Evaluate runtime config strategy (`/config.json` fetch-at-startup) for multi-tenant deployments | 3d | Open |

**Total effort:** ~15d (unchanged)
**Dependencies:** P3-05 depends on P1-02 (abstraction extension must precede approval workflow implementation); P3-07 is a strategic decision requiring product alignment.
**Business impact:** Removes the primary architectural constraint on domain workflow complexity; production error visibility; unlocks white-label/multi-tenant deployment model.

---

### Roadmap Summary

| Phase | Weeks | Effort | Key Outcome | Status |
|-------|-------|--------|-------------|--------|
| 1 – Stabilization | 1–2 | ~3d | Production bug fixed; CI hardened | ✅ Complete |
| 2 – Structural Hardening | 3–6 | ~7d | State isolation; env parity; `framer-motion` fully removed | In progress |
| 3 – Scalability & Performance | 7–10 | ~6.5d | Schema validation; bundle reduction; utilities | Not started |
| 4 – Architecture Maturity | 11–14 | ~15d | Abstraction extensibility; observability; multi-tenant readiness | Not started |
| **Total remaining** | | **~28.5d** | | |

> Note: Total remaining reflects ~19d of open debt plus Phase 4 design/evaluation work. Original total was ~35d; ~6.5d resolved by Quick Wins.

---

## 4. Frontend Architecture KPIs & Success Metrics

| Metric | Baseline | Current | Target | Measurement Method | Source Section |
|--------|----------|---------|--------|--------------------|----------------|
| Broken cross-context route links | 1 (citizen→staff) | **0** ✅ | 0 | Manual route audit + E2E test | §8.5 |
| Dead production dependencies | 1 (`react-hot-toast`) | **0** ✅ | 0 | `npm ls` + bundle analysis | §4.1 |
| CI Cypress spec coverage | 1 of 2 specs | **2 of 2** ✅ | 2 of 2 | CI workflow config | §6.4 |
| CI coverage threshold | None enforced | **Active** ✅ (lines: 20%, funcs: 40%, branches: 30%) | ≥ 60% lines | Vitest coverage report in CI | §6.4, §7.7 |
| Domain list pages with explicit error state | 0 of 7 | **7 of 7** ✅ | 7 of 7 | Code audit | §7.5 |
| `@tanstack/react-query-devtools` rendered | No | **Yes (DEV only)** ✅ | Yes (DEV only) | Code audit | §9 L6 |
| `CitizenPortal/` naming ambiguity | Present | **Resolved** ✅ | Resolved | Directory audit | §3.2 |
| `framer-motion` usage in `TopLoadingBar` | Yes | **No** ✅ | No | Code audit | §4.3 |
| `framer-motion` fully removed from bundle | No | **No** ⚠️ | Yes | Bundle analyzer | §4.3 |
| Components using non-reactive `t()` | ≥ 1 (`ProtectedRoute`) | ≥ 1 | 0 | Static analysis / grep | §8.3 |
| Detail query invalidation on mutation | 0 of 7 domains | 0 of 7 | 7 of 7 | React Query devtools + code audit | §8.6 |
| Zustand store test isolation | Not supported | Not supported | Full reset between test suites | Test suite audit | §7.3, §7.7 |
| Form validation schema coverage | 0% (imperative only) | 0% | 100% domain forms via Zod | Code audit | §4.3, §8.4 |
| `CrudPage` workaround instances | 1 (`AppointmentsPage`) | 1 | 0 (escape hatch API) | Code audit | §7.3, §8.4 |
| Error monitoring integration | None | None | SDK integrated + `ErrorBoundary` wired | Production error dashboard | §4.3 |

---

## 5. Frontend Architecture Maturity Score

### Dimension Scores

| Dimension | Baseline Score | Current Score | Notes |
|-----------|---------------|---------------|-------|
| Layering discipline | 17/20 | **17/20** | Unchanged — `CrudPage` abstraction leakage remains |
| Component modularity | 13/15 | **14/15** | +1: `CitizenRecords/` rename eliminates naming ambiguity; inline SVGs in `DashboardPage` remain |
| State management clarity | 10/15 | **10/15** | Unchanged — Zustand singletons and non-reactive `t()` remain open |
| Scalability readiness | 8/15 | **8/15** | Unchanged — `CrudPage` limits and build-time API URL inlining remain |
| Performance architecture | 8/10 | **9/10** | +1: `framer-motion` removed from `TopLoadingBar`; Landing components still use it |
| Resilience & fault handling | 6/10 | **8/10** | +2: all 7 domain list pages now render explicit error state with retry; no error monitoring SDK yet |
| Build & deployment maturity | 8/10 | **10/10** | +2: coverage threshold active in CI; `authentication.cy.ts` added to CI spec filter |
| Observability integration | 2/5 | **3/5** | +1: React Query devtools now rendered in development; `ErrorBoundary` still `console.error` only |

### Overall Score

**Baseline: 72 / 100 → Current: 79 / 100**

### Maturity Level: **Structured** (approaching Advanced)

The Quick Wins closed the most visible CI and UX gaps. The score improvement (+7 points) reflects concrete changes: CI is now gated on coverage and auth specs, all domain pages surface errors to users, and the developer tooling gap is closed. The ceiling preventing **Advanced** status is unchanged — it requires resolving the `CrudPage` abstraction ceiling, Zustand test isolation, schema validation, and error monitoring.

### Key Blockers Preventing Next Maturity Stage (Advanced)

1. No error monitoring integration — production errors are invisible.
2. `CrudPage` abstraction has no escape hatch — complex workflows require workarounds.
3. Zustand singletons are not test-resettable — test isolation is structurally compromised.
4. No schema validation library — validation cannot scale or be shared with the backend.
5. CI coverage thresholds are conservative (lines: 20%) — need incremental raises to be meaningful.

---

## 6. Executive Summary (CTO-Level)

### Overall Frontend Architecture Health Score: **79 / 100** (was 72)

---

### Quick Wins Completed

Nine architecture quick wins were implemented (QW-01 through QW-09), resolving 9 issues fully and 2 partially:

- **Production UX fix:** Broken citizen→staff route link eliminated; E2E boundary tests added.
- **CI hardened:** Coverage threshold active; `authentication.cy.ts` now runs in CI on every push.
- **Dead dependency removed:** `react-hot-toast` removed from production dependencies.
- **Error resilience:** All 7 domain list pages now render an explicit error state with retry action.
- **Structural clarity:** `Domain/CitizenPortal/` renamed to `Domain/CitizenRecords/`; naming ambiguity eliminated.
- **Developer tooling:** React Query devtools now available in development builds.
- **Bundle improvement:** `framer-motion` removed from `TopLoadingBar`; Landing components still use it (full removal is Phase 2).

---

### Key Structural Strengths

1. **Modern, cohesive stack with strict TypeScript.** React 18, TanStack Query v5, Vite 5, and TypeScript 5.7 with `strict: true` provide a solid, current foundation. All major dependencies are up to date with no version debt.

2. **Uniform module architecture.** All seven domain modules follow an identical structural pattern (page → hook → service → validation), enforced by a CLI module generator. Onboarding a new module is predictable and low-risk.

3. **Well-layered HTTP and server state architecture.** The custom fetch client, interceptor chain (CSRF + JWT refresh), and TanStack Query hook hierarchy are cleanly separated. The `CrudPage<TItem, TForm>` generic abstraction eliminates ~80% of boilerplate across domain modules.

---

### Remaining Architectural Risks

1. **`CrudPage` abstraction ceiling.** The `AppointmentsPage` already bypasses `CrudPage`'s form state management via a `useRef` workaround. As domain workflows grow in complexity (approval flows, multi-step forms, bulk actions), this pattern will proliferate and erode the abstraction's value. This is the highest-priority remaining structural risk.

2. **No production error visibility.** The `ErrorBoundary` logs to `console.error` only. There is no error monitoring SDK. Production failures are invisible until users report them — a significant operational blind spot for a government-facing system.

3. **Test isolation gap.** Zustand stores are module-level singletons that cannot be reset between tests. The CI coverage thresholds are intentionally conservative (lines: 20%) and must be raised incrementally as coverage grows.

---

### Estimated Remaining Investment

| Item | Value |
|------|-------|
| Remaining developer-days | ~28.5d |
| Timeline | ~12 weeks (Phases 2–4, 2-week sprints) |
| Team size assumed | 3–5 frontend engineers |
| Risk if delayed | `CrudPage` workarounds accumulate; auth regressions reach production; error monitoring gap persists in a public-facing system; multi-tenant deployment model remains blocked |

---

### Recommendation

**Stabilization complete. Proceed to Phase 2.**

Phase 1 is done. The immediate next priority is Phase 2 (7 developer-days): resolve Zustand test isolation, standardize `useTranslation` usage, invalidate detail queries on mutation, add environment files, and complete `framer-motion` removal. Phases 3 and 4 address the structural and performance debt that will compound as the system grows.
