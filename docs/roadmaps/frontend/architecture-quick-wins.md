# Secom Frontend — Architecture Quick Wins

> **Source:** `docs/architecture/frontend/overview-part1.md`, `overview-part2.md`, `overview-part3.md`
> **Scope:** Architecture-only quick wins. No cross-document inference.
> **Criteria:** Low effort (≤ 2d), directly supported by architecture document findings.

---

## Quick Win #1: Fix Broken Citizen→Staff Route Link

- **Architecture Problem:** `CitizenDashboardPage` hardcodes a link to `/appointments` (the staff route). Citizens clicking this link are redirected to the staff login page — a direct auth context boundary violation.
- **Impact:** Eliminates a production UX breakage; enforces the architectural separation between `CitizenAuthContext` and `AuthContext` route namespaces.
- **Effort:** 0.5d
- **Implementation Steps:**
  1. Locate the hardcoded `/appointments` link in `src/pages/CitizenPortal/CitizenDashboardPage.tsx`.
  2. Replace with the appropriate citizen-facing route (e.g., `/portal/appointments` if it exists) or remove the link entirely until a citizen appointments view is implemented.
  3. Add a route guard test to `authentication.cy.ts` covering citizen→staff route access.
- **Risk Level:** Low — isolated change in a single component.
- **Source Section:** §8.5, §9 H1

---

## Quick Win #2: Remove `react-hot-toast` Dead Production Dependency

- **Architecture Problem:** `react-hot-toast` is declared in `dependencies` (not `devDependencies`) but is never imported anywhere in the source tree. The custom `toastStore` + `ToastContainer` is the actual notification system. The dead package adds transitive dependency surface and creates confusion about the intended notification strategy.
- **Impact:** Reduces production dependency surface; eliminates bundle inclusion risk; clarifies notification architecture ownership.
- **Effort:** 0.5d
- **Implementation Steps:**
  1. Run `npm uninstall react-hot-toast` in the frontend package.
  2. Verify no import of `react-hot-toast` exists (`grep -r "react-hot-toast" src/`).
  3. Confirm `ToastContainer` and `useToastStore` remain the sole notification mechanism.
  4. Run `npm run build` to confirm the bundle is unaffected.
- **Risk Level:** Low — the package is confirmed unused.
- **Source Section:** §4.1, §4.3, §9 H2

---

## Quick Win #3: Add `authentication.cy.ts` to CI Cypress Spec Filter

- **Architecture Problem:** The `authentication.cy.ts` Cypress spec exists but is excluded from the CI `--spec` filter. Authentication flows — the most critical path in the application — are not covered in CI.
- **Impact:** Closes the most significant CI blind spot; auth regressions (login, logout, token refresh, role-based redirect) are caught before merge.
- **Effort:** 0.5d
- **Implementation Steps:**
  1. Open `.github/workflows/ci.yml`.
  2. Locate the Cypress step with the `--spec` filter (currently `press-releases.cy.ts` only).
  3. Add `authentication.cy.ts` to the spec list: `--spec "cypress/e2e/authentication.cy.ts,cypress/e2e/press-releases.cy.ts"`.
  4. Run the CI pipeline to confirm both specs pass.
- **Risk Level:** Low — the spec already exists; this is a CI configuration change only.
- **Source Section:** §6.4, §9 M5

---

## Quick Win #4: Enforce Coverage Threshold in CI

- **Architecture Problem:** `vitest run --coverage` is available as a script but not run in CI. There is no coverage gate. Current file coverage is ~24% (41 test files for 173 source files) with no floor, meaning coverage can regress silently.
- **Impact:** Prevents coverage regression as the codebase grows; establishes a measurable quality baseline.
- **Effort:** 1d
- **Implementation Steps:**
  1. Open `vite.config.ts` and add a `coverage.thresholds` block to the Vitest config:
     ```ts
     coverage: {
       provider: 'v8',
       thresholds: { lines: 60, functions: 60, branches: 50, statements: 60 }
     }
     ```
  2. Run `npm run test:coverage` locally to confirm the current codebase meets or is close to the threshold (adjust values if needed to avoid blocking CI immediately).
  3. Update the CI step to use `vitest run --coverage` instead of `vitest run`.
  4. Document the threshold values and rationale in a comment in `vite.config.ts`.
- **Risk Level:** Medium — threshold must be calibrated against current coverage to avoid immediately blocking CI. Start conservatively (e.g., 50% lines) and raise incrementally.
- **Source Section:** §6.4, §7.7, §9 H3

---

## Quick Win #5: Rename `src/pages/Domain/CitizenPortal/` to `CitizenRecords/`

- **Architecture Problem:** Two directories share nearly identical names: `src/pages/Domain/CitizenPortal/` (staff-facing admin view of citizen records) and `src/pages/CitizenPortal/` (citizen-facing public portal). The distinction is enforced by routing but is not obvious from directory names, creating an onboarding risk and misrouted code placement.
- **Impact:** Eliminates naming ambiguity; makes the architectural separation between staff and citizen contexts immediately visible in the file tree.
- **Effort:** 1d
- **Implementation Steps:**
  1. Rename `src/pages/Domain/CitizenPortal/` → `src/pages/Domain/CitizenRecords/`.
  2. Update the internal file names: `CitizenPortalPage.tsx` → `CitizenRecordsPage.tsx`, `CitizenPortalForm.tsx` → `CitizenRecordsForm.tsx`, `CitizenPortalPage.test.tsx` → `CitizenRecordsPage.test.tsx`.
  3. Update all imports referencing the old path (`grep -r "Domain/CitizenPortal" src/`).
  4. Update the route definition in `src/routes/index.tsx` to import from the new path (the URL path `/citizen-portal` can remain unchanged).
  5. Run `tsc --noEmit` and `vitest run` to confirm no broken imports.
- **Risk Level:** Low — purely a rename; URL paths and API endpoints are unaffected.
- **Source Section:** §3.2, §9 M1

---

## Quick Win #6: Remove Empty `src/types/` Directory

- **Architecture Problem:** `src/types/` exists but is empty. All domain types live in `packages/types`. The empty directory misleads new developers into placing types there instead of the correct location.
- **Impact:** Eliminates structural confusion; reinforces the `packages/types` as the single source of truth for domain types.
- **Effort:** 0.5d
- **Implementation Steps:**
  1. Confirm `src/types/` is empty (`ls src/types/`).
  2. Either remove the directory (`rm -rf src/types/`) or add a `README.md` inside it explaining: "All domain types live in `packages/types/src/`. Do not add types here."
  3. If removed, run `tsc --noEmit` to confirm no references to `src/types/` exist.
- **Risk Level:** Low — directory is confirmed empty.
- **Source Section:** §3.4, §9 L1

---

## Quick Win #7: Add `@tanstack/react-query-devtools` Conditional Rendering

- **Architecture Problem:** `@tanstack/react-query-devtools` is installed as a dev dependency but is not rendered anywhere in the application. The tooling investment is wasted.
- **Impact:** Improves developer experience during debugging; makes query state, cache, and invalidation visible without external tooling.
- **Effort:** 0.5d
- **Implementation Steps:**
  1. Open `src/providers/AppProviders.tsx` (or `src/providers/QueryProvider.tsx`).
  2. Add conditional rendering inside `QueryProvider`:
     ```tsx
     import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
     // Inside the provider return:
     {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
     ```
  3. Confirm the devtools panel does not appear in a production build (`npm run build && npm run preview`).
- **Risk Level:** Low — dev-only rendering; zero production impact.
- **Source Section:** §9 L6

---

## Quick Win #8: Replace `framer-motion` with CSS Animation in `TopLoadingBar`

- **Architecture Problem:** `framer-motion` (~100KB gzipped) is used exclusively in `TopLoadingBar` for a simple progress bar animation (`AnimatePresence` + `motion.div`). The same visual effect is achievable with a CSS `@keyframes` animation, eliminating the dependency entirely.
- **Impact:** Removes ~100KB gzipped from the `motion` bundle chunk; eliminates a production dependency; simplifies the component.
- **Effort:** 1d
- **Implementation Steps:**
  1. Open `src/components/UI/TopLoadingBar/TopLoadingBar.tsx` and its `.module.css`.
  2. Replace `AnimatePresence` + `motion.div` with a plain `div` that conditionally applies a CSS class when `isFetching` is true.
  3. In `TopLoadingBar.module.css`, add a `@keyframes` animation (e.g., `slideIn` for entry, `fadeOut` for exit) applied via the conditional class.
  4. Remove `framer-motion` from `package.json` (`npm uninstall framer-motion`).
  5. Remove the `motion` manual chunk from `vite.config.ts` `rollupOptions.manualChunks`.
  6. Run `npm run build` and verify bundle size reduction with `npx rollup-plugin-visualizer` or equivalent.
- **Risk Level:** Low — isolated to a single component; visual parity is straightforward with CSS transitions.
- **Source Section:** §4.1, §4.3, §9 M2

---

## Quick Win #9: Add Explicit Error State to Domain List Pages

- **Architecture Problem:** When `isError` is true on a domain list query, all seven domain pages silently render an empty table. There is no user feedback, no error message, and no retry path. Only the global `ConnectionBanner` provides any signal of API unavailability.
- **Impact:** Improves resilience and debuggability; users receive actionable feedback instead of a silent empty state; aligns with the existing `EmptyState` component already in the design system.
- **Effort:** 2d
- **Implementation Steps:**
  1. Open each domain page (e.g., `PressReleasesPage.tsx`) and locate the `useXxxList` hook call.
  2. Destructure `isError` and `refetch` from the hook return value.
  3. Pass `isError` and `refetch` as props to `CrudPage` (or handle inline if `CrudPage` does not support it yet).
  4. In `CrudPage.tsx` (or the domain page directly), add a conditional render: if `isError`, render `<EmptyState icon="error" message={t('common.errorLoading')} action={<Button onClick={refetch}>{t('common.retry')}</Button>} />`.
  5. Add i18n keys `common.errorLoading` and `common.retry` to `pt-BR.json`.
  6. Update the relevant `*.test.tsx` files to cover the `isError` rendering path.
- **Risk Level:** Low — additive change; does not modify existing happy-path rendering.
- **Source Section:** §7.5, §9 M4

---

## Quick Win Summary

| # | Title | Effort | Risk | Priority |
|---|-------|--------|------|----------|
| QW-01 | Fix broken citizen→staff route link | 0.5d | Low | P0 |
| QW-02 | Remove `react-hot-toast` dead dependency | 0.5d | Low | P1 |
| QW-03 | Add `authentication.cy.ts` to CI | 0.5d | Low | P1 |
| QW-04 | Enforce coverage threshold in CI | 1d | Medium | P1 |
| QW-05 | Rename `Domain/CitizenPortal/` → `CitizenRecords/` | 1d | Low | P2 |
| QW-06 | Remove empty `src/types/` directory | 0.5d | Low | P2 |
| QW-07 | Add React Query devtools conditional rendering | 0.5d | Low | P3 |
| QW-08 | Replace `framer-motion` with CSS animation | 1d | Low | P2 |
| QW-09 | Add explicit error state to domain list pages | 2d | Low | P2 |
| **Total** | | **7.5d** | | |
