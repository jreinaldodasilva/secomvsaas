# Secom Frontend Architecture Quick Wins

**Source documents:**
- `docs/frontend/01-Secom-Frontend-Architecture-Overview-Part1.md`
- `docs/frontend/01-Secom-Frontend-Architecture-Overview-Part2.md`

**Scope:** Architecture-only quick wins — low effort, high structural impact  
**Generated:** July 2025

> Quick wins are defined as improvements achievable in ≤1 developer-day that resolve a documented architectural issue without requiring cross-cutting refactors or feature changes.

---

## Summary Table

| # | Title | Effort | Priority | Risk Level | Phase |
|---|---|---|---|---|---|
| QW-01 | Remove unused production dependencies | 0.5 days | P1 | Low | 1 |
| QW-02 | Consolidate duplicate theme Zustand stores | 0.5 days | P0 | Low | 1 |
| QW-03 | Fix RBAC role list in `UsersPage` | 0.5 days | P0 | Low | 1 |
| QW-04 | Add `vite build` step to CI pipeline | 0.5 days | P1 | Low | 1 |
| QW-05 | Remove empty `zod` manual chunk from `vite.config.ts` | 0.5 days | P2 | Low | 1 |
| QW-06 | Move `@tanstack/react-query-devtools` to `devDependencies` | 0.5 days | P2 | Low | 1 |
| QW-07 | Add startup environment variable validation | 0.5 days | P2 | Low | 2 |
| QW-08 | Fix i18n stale renders in UI components | 1 day | P1 | Low | 2 |
| QW-09 | Prune `.env.example` to consumed variables only | 0.5 days | P2 | Low | 1 |
| QW-10 | Remove or document empty placeholder directories | 0.5 days | P2 | Low | 1 |

**Total estimated effort: 6 developer-days**

---

## Quick Win Details

---

### QW-01: Remove Unused Production Dependencies

**Architecture Problem**

`framer-motion` (~140KB gzipped), `@stripe/react-stripe-js`, `@stripe/stripe-js`, `react-hook-form`, and `@hookform/resolvers` are declared as production dependencies in `package.json` with no observable usage in the source code. They inflate the declared dependency surface, expand the security attack surface, and risk bundle size inflation if tree-shaking is incomplete. `dompurify` and `web-vitals` are also declared but unverified as used.

**Impact**

- Removes up to ~215KB of potential bundle weight (framer-motion ~140KB, Stripe ~50KB, react-hook-form ~25KB)
- Reduces `npm audit` surface area
- Eliminates misleading dependency contract — `package.json` should reflect what the application actually uses
- Removes `@types/dompurify` (paired devDependency) if `dompurify` is also removed

**Effort:** 0.5 days (1 engineer)

**Implementation Steps**

1. Verify no usage of each package with a codebase-wide search: `grep -r "framer-motion\|@stripe\|react-hook-form\|hookform\|dompurify\|web-vitals" src/`
2. Remove confirmed-unused packages: `npm uninstall framer-motion @stripe/react-stripe-js @stripe/stripe-js react-hook-form @hookform/resolvers`
3. If `dompurify` and `web-vitals` are confirmed unused, remove them and their type packages
4. Run `npm run build` to verify the bundle builds cleanly after removal
5. Run `npm run test:frontend` to confirm no test imports were missed
6. Update `package-lock.json` and commit

**Risk Level:** Low — removing unused packages cannot break functionality. The only risk is a missed import that TypeScript strict mode would catch at compile time.

**Source:** Part 1 §4.3, §4.4 (H3 recommendation)

---

### QW-02: Consolidate Duplicate Theme Zustand Stores

**Architecture Problem**

`src/store/uiStore.ts` manages a `theme` field with `localStorage` key `'theme'`. `src/components/UI/ThemeToggle/ThemeToggle.tsx` creates a separate `useThemeStore` with `localStorage` key `'secom_theme'`. The `data-theme` attribute on `document.documentElement` — which drives the actual CSS dark/light mode — is only set by `useThemeStore`. The `uiStore` theme value is effectively dead code. Any component that reads theme from `uiStore` will receive a value that does not match the rendered visual state.

**Impact**

- Eliminates an active latent bug before it manifests in new components
- Establishes a single source of truth for theme state
- Removes the conflicting `localStorage` key (`'theme'` vs `'secom_theme'`)
- Reduces Zustand store count from 3 to 2 (uiStore, i18nStore)

**Effort:** 0.5 days (1 engineer)

**Implementation Steps**

1. Decide on the canonical store: `uiStore` is the correct home for theme (it already manages sidebar state)
2. Move the `getInitialTheme()` logic and `data-theme` DOM mutation from `ThemeToggle.tsx` into `uiStore.ts`
3. Update `uiStore.ts`: replace the current `theme` initialization (reads `'theme'` key) with `getInitialTheme()` (reads `'secom_theme'` or choose one key); add a `useEffect`-equivalent side effect via Zustand's `subscribe` to set `document.documentElement.setAttribute('data-theme', theme)` on change
4. Update `ThemeToggle.tsx` to consume `useUIStore` instead of the local `useThemeStore`; remove the local store definition
5. Standardize on a single `localStorage` key (recommend `'secom_theme'` for namespacing consistency with `'secom_locale'`)
6. Run `npm run test:frontend` — `uiStore.test.ts` already covers theme toggle behavior and will catch regressions
7. Manually verify dark/light mode toggle in the browser

**Risk Level:** Low — the change is self-contained within two files. Existing `uiStore` tests provide a regression safety net.

**Source:** Part 1 §3.2 (store), Part 2 §5.6, §8 (H1 recommendation)

---

### QW-03: Fix RBAC Role List in `UsersPage`

**Architecture Problem**

`src/pages/Admin/Users/UsersPage.tsx` defines `const ROLES = ['admin', 'manager', 'staff']` as a local constant. The canonical system roles defined in `src/config/permissions.ts` are `admin`, `assessor`, `social_media`, `atendente`, `citizen`. The invite form in `UsersPage` uses the local list, allowing operators to invite users with roles (`manager`, `staff`) that do not exist in the permission system. Users created with these roles will have no resolvable permissions.

**Impact**

- Eliminates a data integrity defect — invited users will receive valid, resolvable roles
- Aligns the invite form with the canonical permission system
- Removes a locally-defined constant that duplicates (incorrectly) a system-level configuration

**Effort:** 0.5 days (1 engineer)

**Implementation Steps**

1. Open `src/pages/Admin/Users/UsersPage.tsx`
2. Remove the local `const ROLES = ['admin', 'manager', 'staff']` declaration
3. Import `ROLES` from `src/config/permissions.ts`: `import { ROLES } from '../../../config/permissions'`
4. Replace all references to the local `ROLES` array with `Object.values(ROLES)` (or a filtered subset if citizen/super_admin should be excluded from the invite form — confirm with product requirements)
5. Update the `inviteRole` default state to a valid role value (e.g., `ROLES.ASSESSOR`)
6. Run `npm run type-check` to verify no type errors
7. Manually test the invite modal to confirm the role dropdown shows the correct options

**Risk Level:** Low — the change is confined to one file. The backend will reject invalid roles regardless; this fix aligns the frontend with the backend's existing validation.

**Source:** Part 2 §7.5, §8 (M1 recommendation)

---

### QW-04: Add `vite build` Step to CI Pipeline

**Architecture Problem**

The CI pipeline (`.github/workflows/ci.yml`) runs type-check, lint, and unit tests but never executes `vite build`. A build-time failure — such as a Rollup plugin error, a chunk configuration issue, or a TypeScript error that only manifests during Vite's build phase — is not caught until deployment. The production bundle is never verified in the automated pipeline.

**Impact**

- Catches build failures before they reach deployment
- Verifies that the manual chunk configuration in `vite.config.ts` produces a valid bundle
- Provides a baseline for future bundle size checks
- Closes the gap between "tests pass" and "application is deployable"

**Effort:** 0.5 days (1 engineer)

**Implementation Steps**

1. Open `.github/workflows/ci.yml`
2. Add a build step after the frontend test step:
   ```yaml
   - name: Build frontend
     run: npm run build
   ```
3. Optionally add a `VITE_API_URL` environment variable to the build step to prevent the silent fallback to `localhost:5000` in CI:
   ```yaml
   - name: Build frontend
     env:
       VITE_API_URL: https://api.placeholder.example
     run: npm run build
   ```
4. Commit and push; verify the CI run completes successfully
5. Confirm the build artifact is produced (check `dist/` directory in the CI runner)

**Risk Level:** Low — adding a build step cannot break existing tests. If the build currently fails, that is a pre-existing issue that should be surfaced.

**Source:** Part 2 §6.5, §8 (M7 recommendation)

---

### QW-05: Remove Empty `zod` Manual Chunk from `vite.config.ts`

**Architecture Problem**

`vite.config.ts` defines a manual chunk `forms: ['zod']`. However, `zod` has no observable usage in the source code. This configuration produces a chunk that is empty or near-empty, adding a spurious network request on page load and creating a misleading build output. The `zod` package itself is also a production dependency with no active usage.

**Impact**

- Removes a spurious HTTP request for an empty chunk on every page load
- Cleans up the build output to reflect actual code structure
- If `zod` is also removed from `package.json` (see QW-01), this step is a prerequisite

**Effort:** 0.5 days (combined with QW-01; standalone is ~15 minutes)

**Implementation Steps**

1. Open `vite.config.ts`
2. Remove the `forms: ['zod']` entry from `build.rollupOptions.output.manualChunks`
3. If `zod` is being removed from `package.json` (QW-01), do both in the same commit
4. Run `npm run build` and inspect the `dist/` output to confirm no empty `forms-*.js` chunk is generated
5. Verify the `vendor` and `query` chunks are still produced correctly

**Risk Level:** Low — removing an empty chunk cannot affect application behavior.

**Source:** Part 1 §4.1, Part 2 §6.3, §8 (L7 recommendation)

---

### QW-06: Move `@tanstack/react-query-devtools` to `devDependencies`

**Architecture Problem**

`@tanstack/react-query-devtools` is listed under `dependencies` in `package.json` rather than `devDependencies`. This is a development tool that should never be required in a production environment. Its presence in `dependencies` signals incorrect intent, risks accidental production inclusion, and inflates the production dependency surface.

**Impact**

- Correctly signals that the devtools are a development-only concern
- Prevents the package from being installed in production environments that prune `devDependencies`
- Reduces the production `node_modules` footprint in containerized deployments

**Effort:** 0.5 days (combined with QW-01; standalone is ~10 minutes)

**Implementation Steps**

1. Run: `npm uninstall @tanstack/react-query-devtools && npm install --save-dev @tanstack/react-query-devtools`
2. Verify `package.json` shows the package under `devDependencies`
3. Confirm the `QueryProvider` or `App.tsx` only renders `<ReactQueryDevtools>` in `import.meta.env.DEV` mode (if it renders at all — verify current usage)
4. Run `npm run build` to confirm the devtools are not included in the production bundle
5. Run `npm run test:frontend` to confirm no test imports are affected

**Risk Level:** Low — moving a package between dependency groups does not change its availability during development or testing.

**Source:** Part 1 §4.1, §8 (M4 recommendation)

---

### QW-07: Add Startup Environment Variable Validation

**Architecture Problem**

`VITE_API_URL` is the only environment variable actively consumed in the source (`src/services/http.ts`, `src/hooks/useHealthCheck.ts`). There is no validation of its presence or format at startup. A missing or malformed value causes the application to silently fall back to `http://localhost:5000`, which will fail in any non-local environment without a clear error message. The `.env.example` also contains 7 variables that are not consumed in source, creating confusion about what is actually required.

**Impact**

- Converts silent misconfiguration failures into fast, descriptive startup errors
- Reduces deployment debugging time when environment variables are missing
- Establishes a pattern for validating future environment variables as they are added

**Effort:** 0.5 days (1 engineer)

**Implementation Steps**

1. Create `src/config/env.ts`:
   ```typescript
   const apiUrl = import.meta.env.VITE_API_URL;
   if (!apiUrl) {
     throw new Error('[Secom] VITE_API_URL is not defined. Set it in your .env file.');
   }
   export const ENV = {
     API_URL: apiUrl as string,
   } as const;
   ```
2. Update `src/services/http.ts` and `src/hooks/useHealthCheck.ts` to import `ENV.API_URL` from `src/config/env.ts` instead of reading `import.meta.env.VITE_API_URL` directly
3. Add a CI environment variable for the build step (see QW-04) so the validation does not fail during `vite build` in CI
4. Run `npm run type-check` and `npm run build` to verify

**Risk Level:** Low — the validation only affects startup behavior when the variable is missing, which is already a broken state.

**Source:** Part 2 §6.1, §8 (M5 recommendation)

---

### QW-08: Fix i18n Stale Renders in UI Components

**Architecture Problem**

Four UI components import the `t()` function as a plain module import rather than via `useTranslation()`: `DataTable.tsx`, `Modal.tsx`, `ConnectionBanner.tsx`, and `PasswordInput.tsx`. The `t()` function reads the current Zustand i18n state at call time but does not subscribe to store changes. These components will not re-render when the user switches locale, displaying stale translations until the component is unmounted and remounted.

**Impact**

- Fixes broken locale switching in four core UI primitives used across all domain pages
- Ensures the locale selector in `DashboardLayout` produces consistent results throughout the UI
- Aligns all components with the established `useTranslation()` pattern

**Effort:** 1 day (1 engineer)

**Implementation Steps**

1. For each affected component (`DataTable.tsx`, `Modal.tsx`, `ConnectionBanner.tsx`, `PasswordInput.tsx`):
   - Replace `import { t } from '../../../i18n'` with `import { useTranslation } from '../../../i18n'`
   - Add `const { t } = useTranslation();` inside the component function body
   - Remove any direct `t(...)` calls at module scope (default parameter values, etc.) — move them inside the component or accept them as props
2. For `DataTable.tsx`: the `searchPlaceholder` and `emptyMessage` default parameter values use `t(...)` at the function signature level. Move these defaults inside the component body or require callers to always pass them explicitly
3. Run `npm run test:frontend` — existing tests for `Modal` and `Button` will catch regressions
4. Manually test locale switching in the browser to verify `DataTable` headers, `Modal` close button, and `ConnectionBanner` text update correctly

**Risk Level:** Low — the change is additive (adding a hook call). The only edge case is default parameter values that use `t()` at the function signature level, which must be moved inside the component body.

**Source:** Part 2 §7.6, §8 (M2 recommendation)

---

### QW-09: Prune `.env.example` to Consumed Variables Only

**Architecture Problem**

`.env.example` contains 8 variables, of which only `VITE_API_URL` is actively consumed in the source code. The remaining 7 (`VITE_DISABLE_MSW`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_SENTRY_DSN`, `VITE_VERSION`, `VITE_ENV`, `VITE_FEATURE_BILLING`, `VITE_FEATURE_PORTAL`) were inherited from the vSaaS boilerplate and reference features not implemented in the observable source. This creates onboarding confusion — new engineers may spend time configuring variables that have no effect.

**Impact**

- Eliminates onboarding confusion about required configuration
- Makes the operational contract explicit: only `VITE_API_URL` is required
- Prevents false expectations about implemented features (Stripe, Sentry, MSW, feature flags)

**Effort:** 0.5 days (combined with QW-07; standalone is ~15 minutes)

**Implementation Steps**

1. Verify each variable in `.env.example` with a codebase-wide search: `grep -r "VITE_DISABLE_MSW\|VITE_STRIPE\|VITE_SENTRY\|VITE_VERSION\|VITE_ENV\|VITE_FEATURE" src/`
2. For each variable confirmed as unused: remove it from `.env.example`
3. Keep `VITE_API_URL` with a clear comment explaining its purpose and required format
4. If any variable is planned for near-term implementation (e.g., `VITE_SENTRY_DSN`), add a comment marking it as `# Planned — not yet active` rather than removing it
5. Update `README.md` if it references any of the removed variables

**Risk Level:** Low — `.env.example` is documentation only; removing entries from it cannot affect runtime behavior.

**Source:** Part 2 §6.1, §8 (L4 recommendation)

---

### QW-10: Remove or Document Empty Placeholder Directories

**Architecture Problem**

Eight directories contain only `.gitkeep` files with no source code: `components/common/`, `components/Navigation/`, `components/Notifications/`, `components/UI/Form/`, `components/UI/Toast/`, `services/base/`, `services/interceptors/`, `src/types/`, `src/utils/`. These represent planned but unimplemented abstractions. They create structural noise in the project tree and mislead engineers about the actual scope of the codebase.

**Impact**

- Removes structural noise from the project tree
- Eliminates false signals about planned architecture that may not be implemented
- Reduces onboarding confusion — engineers will not search for code in empty directories

**Effort:** 0.5 days (1 engineer)

**Implementation Steps**

1. For each empty directory, make an explicit decision:
   - **Remove** if there is no near-term plan to implement it (e.g., `components/common/`, `src/types/`, `src/utils/` — these are generic placeholders with no specific design intent documented)
   - **Document** if there is a concrete architectural plan (e.g., `services/interceptors/` — if an interceptor pattern is planned, add a `README.md` or `index.ts` stub with a comment explaining the intended pattern)
2. Recommended removals: `components/common/`, `components/Navigation/`, `components/Notifications/`, `components/UI/Form/`, `components/UI/Toast/`, `src/types/`, `src/utils/`
3. Recommended documentation: `services/base/` and `services/interceptors/` — these suggest a planned HTTP interceptor pattern; add a brief comment in `services/http.ts` explaining the current approach and the intended evolution
4. Remove `.gitkeep` files from directories being deleted; `git rm -r` the empty directories
5. Run `npm run type-check` to confirm no imports reference the removed directories

**Risk Level:** Low — removing empty directories cannot affect compilation or runtime. The only risk is a stale import pointing to an empty directory, which TypeScript strict mode would already flag.

**Source:** Part 1 §3.2, §8 (L1 recommendation)

---

## Impact Analysis

### Cumulative Architectural Impact of All Quick Wins

| Dimension | Before Quick Wins | After Quick Wins |
|---|---|---|
| Active state bugs | 1 (duplicate theme stores) | 0 |
| RBAC data integrity issues | 1 (invalid role list) | 0 |
| Unused production dependencies | 4+ packages | 0 |
| Potential bundle weight from unused deps | ~215KB | 0KB |
| CI build verification | Not present | Present |
| Empty spurious build chunks | 1 (`forms/zod`) | 0 |
| Miscategorized devDependencies | 1 | 0 |
| Env variable silent failure risk | Present | Eliminated |
| i18n stale render components | 4 | 0 |
| Misleading `.env.example` variables | 7 unused | 0 unused |
| Empty placeholder directories | 8 | 0 (or documented) |

### Effort vs. Impact Summary

| Quick Win | Effort | Architectural Impact |
|---|---|---|
| QW-01 Remove unused deps | 0.5 days | High — bundle, security surface, dependency clarity |
| QW-02 Consolidate theme stores | 0.5 days | High — eliminates active state bug |
| QW-03 Fix RBAC role list | 0.5 days | High — eliminates data integrity defect |
| QW-04 Add CI build step | 0.5 days | High — closes deployment blind spot |
| QW-05 Remove zod chunk | 0.5 days | Medium — removes spurious network request |
| QW-06 Move devtools to devDeps | 0.5 days | Medium — correct dependency contract |
| QW-07 Env var validation | 0.5 days | Medium — operational safety |
| QW-08 Fix i18n stale renders | 1 day | High — fixes user-visible locale bug in core UI |
| QW-09 Prune .env.example | 0.5 days | Low-Medium — onboarding clarity |
| QW-10 Remove empty dirs | 0.5 days | Low-Medium — structural clarity |

**All 10 quick wins can be completed in approximately 6 developer-days, ideally within a single 2-week sprint (Phase 1 of the roadmap). QW-01 through QW-06 and QW-09/QW-10 can be parallelized across two engineers. QW-07 and QW-08 are sequential (QW-07 should precede QW-08 to establish the `ENV` config module first).**
