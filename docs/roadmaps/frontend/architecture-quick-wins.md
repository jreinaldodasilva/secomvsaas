# Secom Frontend — Architecture Quick Wins

> **Source:** `docs/architecture/frontend/overview-part1.md`, `overview-part2.md`, `overview-part3.md`
> **Scope:** Architecture-only quick wins. No cross-document inference.
> **Criteria:** Low effort (≤ 2d), directly supported by architecture document findings.

---

## Quick Win #1: Fix Broken Citizen→Staff Route Link ✅

- **Architecture Problem:** `CitizenDashboardPage` hardcodes a link to `/appointments` (the staff route). Citizens clicking this link are redirected to the staff login page — a direct auth context boundary violation.
- **Impact:** Eliminates a production UX breakage; enforces the architectural separation between `CitizenAuthContext` and `AuthContext` route namespaces.
- **Effort:** 0.5d
- **Status:** Completed
- **Implementation Steps:**
  1. ✅ Located the hardcoded `/appointments` link in `src/pages/CitizenPortal/CitizenDashboardPage.tsx`.
  2. ✅ Removed the link entirely — no citizen appointments route exists yet.
  3. ✅ Added a `Citizen → Staff Route Boundary` describe block to `authentication.cy.ts` covering citizen→staff route access.
- **Risk Level:** Low — isolated change in a single component.
- **Source Section:** §8.5, §9 H1

---

## Quick Win #2: Remove `react-hot-toast` Dead Production Dependency ✅

- **Architecture Problem:** `react-hot-toast` is declared in `dependencies` (not `devDependencies`) but is never imported anywhere in the source tree. The custom `toastStore` + `ToastContainer` is the actual notification system. The dead package adds transitive dependency surface and creates confusion about the intended notification strategy.
- **Impact:** Reduces production dependency surface; eliminates bundle inclusion risk; clarifies notification architecture ownership.
- **Effort:** 0.5d
- **Status:** Completed
- **Implementation Steps:**
  1. ✅ Removed `react-hot-toast` from `dependencies` in `package.json` (direct edit — no shell).
  2. ✅ Verified zero imports of `react-hot-toast` in `src/` (`grep` returned empty).
  3. ✅ `ToastContainer` and `useToastStore` confirmed as the sole notification mechanism.
  4. ✅ Bundle unaffected — package was never imported, so no chunk referenced it.
- **Risk Level:** Low — the package is confirmed unused.
- **Source Section:** §4.1, §4.3, §9 H2

---

## Quick Win #3: Add `authentication.cy.ts` to CI Cypress Spec Filter ✅

- **Architecture Problem:** The `authentication.cy.ts` Cypress spec exists but is excluded from the CI `--spec` filter. Authentication flows — the most critical path in the application — are not covered in CI.
- **Impact:** Closes the most significant CI blind spot; auth regressions (login, logout, token refresh, role-based redirect) are caught before merge.
- **Effort:** 0.5d
- **Status:** Completed
- **Implementation Steps:**
  1. ✅ Opened `.github/workflows/ci.yml`.
  2. ✅ Located the Cypress step with the `--spec` filter (was `press-releases.cy.ts` only).
  3. ✅ Updated to `--spec 'cypress/e2e/authentication.cy.ts,cypress/e2e/press-releases.cy.ts'`.
- **Risk Level:** Low — the spec already exists; this is a CI configuration change only.
- **Source Section:** §6.4, §9 M5

---

## Quick Win #4: Enforce Coverage Threshold in CI ✅

- **Architecture Problem:** `vitest run --coverage` is available as a script but not run in CI. There is no coverage gate. Current file coverage is ~24% (41 test files for 173 source files) with no floor, meaning coverage can regress silently.
- **Impact:** Prevents coverage regression as the codebase grows; establishes a measurable quality baseline.
- **Effort:** 1d
- **Status:** Completed
- **Implementation Steps:**
  1. ✅ Added `coverage` block to `vite.config.ts` with `provider: 'v8'`, `include: ['src/**/*.{ts,tsx}']` (scopes gate to frontend source only), and conservative thresholds calibrated against the actual baseline: `{ lines: 20, functions: 40, branches: 30, statements: 20 }`.
  2. ✅ Verified thresholds pass locally — scoped `src/` coverage is lines: 56.41%, functions: 46.62%, branches: 82.73%, statements: 56.41%.
  3. ✅ Updated CI step from `npm run test:frontend` to `npm run test:frontend:coverage`.
  4. ✅ Threshold values and rationale documented in a comment in `vite.config.ts`.
- **Risk Level:** Medium — threshold calibrated conservatively; will not block CI immediately.
- **Source Section:** §6.4, §7.7, §9 H3

---

## Quick Win #5: Rename `src/pages/Domain/CitizenPortal/` to `CitizenRecords/` ✅

- **Architecture Problem:** Two directories share nearly identical names: `src/pages/Domain/CitizenPortal/` (staff-facing admin view of citizen records) and `src/pages/CitizenPortal/` (citizen-facing public portal). The distinction is enforced by routing but is not obvious from directory names, creating an onboarding risk and misrouted code placement.
- **Impact:** Eliminates naming ambiguity; makes the architectural separation between staff and citizen contexts immediately visible in the file tree.
- **Effort:** 1d
- **Status:** Completed
- **Implementation Steps:**
  1. ✅ Created `src/pages/Domain/CitizenRecords/` with `CitizenRecordsPage.tsx` and `CitizenRecordsForm.tsx`.
  2. ✅ Renamed component exports: `CitizenPortalPage` → `CitizenRecordsPage`, `CitizenPortalForm` → `CitizenRecordsForm`.
  3. ✅ No test file existed in the old directory — nothing to rename.
  4. ✅ Updated `src/routes/index.tsx` to import `CitizenRecordsPage` from the new path (URL `/citizen-portal` unchanged).
  5. ✅ Replaced old `CitizenPortal/CitizenPortalPage.tsx` and `CitizenPortalForm.tsx` with re-export shims pointing to the new location (safe bridge; can be deleted in a follow-up cleanup).
  6. ✅ `tsc --noEmit` passed with zero errors. All 321 tests pass.
- **Risk Level:** Low — purely a rename; URL paths and API endpoints are unaffected.
- **Source Section:** §3.2, §9 M1

---

## Quick Win #6: Remove Empty `src/types/` Directory ✅

- **Architecture Problem:** `src/types/` exists but is empty. All domain types live in `packages/types`. The empty directory misleads new developers into placing types there instead of the correct location.
- **Impact:** Eliminates structural confusion; reinforces the `packages/types` as the single source of truth for domain types.
- **Effort:** 0.5d
- **Status:** Completed (pre-existing — directory already absent)
- **Implementation Steps:**
  1. ✅ Confirmed `src/types/` does not exist — already removed in a prior reorganisation.
  2. ✅ Confirmed no source file references `src/types/` (`grep` returned empty).
  3. ✅ No further action required.
- **Risk Level:** Low — directory is confirmed absent.
- **Source Section:** §3.4, §9 L1

---

## Quick Win #7: Add `@tanstack/react-query-devtools` Conditional Rendering ✅

- **Architecture Problem:** `@tanstack/react-query-devtools` is installed as a dev dependency but is not rendered anywhere in the application. The tooling investment is wasted.
- **Impact:** Improves developer experience during debugging; makes query state, cache, and invalidation visible without external tooling.
- **Effort:** 0.5d
- **Status:** Completed
- **Implementation Steps:**
  1. ✅ Added `ReactQueryDevtools` import and `{import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}` inside `QueryProvider` in `src/providers/QueryProvider.tsx`.
  2. ✅ `tsc --noEmit` passed with zero errors.
  3. ✅ Devtools render only in development; zero production impact (tree-shaken by Vite in production builds).
- **Risk Level:** Low — dev-only rendering; zero production impact.
- **Source Section:** §9 L6

---

## Quick Win #8: Replace `framer-motion` with CSS Animation in `TopLoadingBar` ✅

- **Architecture Problem:** `framer-motion` (~100KB gzipped) is used exclusively in `TopLoadingBar` for a simple progress bar animation (`AnimatePresence` + `motion.div`). The same visual effect is achievable with a CSS `@keyframes` animation, eliminating the dependency entirely.
- **Impact:** Removes `framer-motion` usage from `TopLoadingBar`; simplifies the component. Full dependency removal was not possible — see note below.
- **Effort:** 1d
- **Status:** Completed (partial — see note)
- **Implementation Steps:**
  1. ✅ Replaced `AnimatePresence` + `motion.div` in `TopLoadingBar.tsx` with a plain `div` conditionally rendered when `visible` is true.
  2. ✅ Removed `framer-motion` import and `useReducedMotion` hook from `TopLoadingBar.tsx`.
  3. ✅ Added `@keyframes barSlideIn` (scaleX 0→1, 0.35s) to `TopLoadingBar.module.css`; added `@media (prefers-reduced-motion: reduce)` override to disable animation for accessibility.
  4. ⚠️ `framer-motion` was **not** removed from `package.json` — it is actively used in four Landing components (`LandingShared.tsx`, `LgpdSection.tsx`, `CtaSection.tsx`, `HeroSection.tsx`). The `motion` manual chunk in `vite.config.ts` was also retained.
  5. ✅ `tsc --noEmit` passed. All 321 tests pass.
- **Risk Level:** Low — isolated to a single component; visual parity achieved with CSS transitions.
- **Source Section:** §4.1, §4.3, §9 M2

---

## Quick Win #9: Add Explicit Error State to Domain List Pages ✅

- **Architecture Problem:** When `isError` is true on a domain list query, all seven domain pages silently render an empty table. There is no user feedback, no error message, and no retry path. Only the global `ConnectionBanner` provides any signal of API unavailability.
- **Impact:** Improves resilience and debuggability; users receive actionable feedback instead of a silent empty state; aligns with the existing `EmptyState` component already in the design system.
- **Effort:** 2d
- **Status:** Completed
- **Implementation Steps:**
  1. ✅ Added `common.errorLoading` and `common.retry` i18n keys to `pt-BR.json` and `en.json`.
  2. ✅ Extended `CrudPageProps.listQuery` type to accept optional `isError?: boolean` and `refetch?: () => void`.
  3. ✅ Added `EmptyState` + `useTranslation` imports to `CrudPage.tsx`; added early-return error render branch: when `isError` is true, renders `<EmptyState title={t('common.errorLoading')} action={{ label: t('common.retry'), onClick: refetch }} />` in place of the `DataTable`.
  4. ✅ All seven domain pages pass `listQuery` directly from their hooks — no page-level changes required; React Query hooks already expose `isError` and `refetch` on the returned object.
  5. ✅ Added `isError` rendering test to `CrudPage.test.tsx` (2 new tests: with and without `refetch`).
  6. ✅ Added `isError` rendering test to all seven domain page test files.
  7. ✅ Created `CitizenRecordsPage.test.tsx` (was missing from QW-05 rename) with full happy-path + error-path coverage.
  8. ✅ `tsc --noEmit` passed. All 334 tests pass (42 test files).
- **Risk Level:** Low — additive change; does not modify existing happy-path rendering.
- **Source Section:** §7.5, §9 M4

---

## Quick Win Summary

| # | Title | Effort | Risk | Priority |
|---|-------|--------|------|----------|
| QW-01 | Fix broken citizen→staff route link | 0.5d | Low | P0 | ✅ Completed |
| QW-02 | Remove `react-hot-toast` dead dependency | 0.5d | Low | P1 | ✅ Completed |
| QW-03 | Add `authentication.cy.ts` to CI | 0.5d | Low | P1 | ✅ Completed |
| QW-04 | Enforce coverage threshold in CI | 1d | Medium | P1 | ✅ Completed |
| QW-05 | Rename `Domain/CitizenPortal/` → `CitizenRecords/` | 1d | Low | P2 | ✅ Completed |
| QW-06 | Remove empty `src/types/` directory | 0.5d | Low | P2 | ✅ Completed |
| QW-07 | Add React Query devtools conditional rendering | 0.5d | Low | P3 | ✅ Completed |
| QW-08 | Replace `framer-motion` with CSS animation | 1d | Low | P2 | ✅ Completed (partial) |
| QW-09 | Add explicit error state to domain list pages | 2d | Low | P2 | ✅ Completed |
| **Total** | | **7.5d** | | |
