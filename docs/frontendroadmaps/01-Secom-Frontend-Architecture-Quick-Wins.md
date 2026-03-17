# Secom Frontend — Architecture Quick Wins

**Document version:** 1.0  
**Based on:** Architecture Overview Part 1 (§1–§4) and Part 2 (§5–§8)  
**Codebase snapshot:** post-commit `f2a9d48`  
**Scope:** Architecture-only quick wins. Each item is low-effort, independently executable, and directly traceable to a finding in the architecture overview.

**Definition of "quick win":** Implementable by one engineer in ≤4 hours with no dependency on other roadmap items, no architectural risk, and immediate measurable improvement.

---

## ✅ Quick Win #1: Scope Production Source Maps — COMPLETED

**Architecture Problem**  
`vite.config.ts` sets `build.sourcemap: true`, which publishes the full original TypeScript source to the production build artifact. Any user can read the application's source code via browser DevTools on the live government-facing deployment. (Part 2 §6.2, FE-P0-02)

**Impact**  
Eliminates unnecessary information disclosure in production. Source maps remain available for error tracking tools when configured with `'hidden'` mode — no debugging capability is lost.

**Effort**  
5 minutes

**Implementation Steps**  
1. Open `vite.config.ts`
2. Change `build.sourcemap: true` to `build.sourcemap: 'hidden'`
3. Run `npm run build` and verify no source map URLs appear in the generated JS files
4. Confirm `.map` files are still generated in `dist/` (for upload to an error tracking service if needed)

**Risk Level**  
None — `'hidden'` is a standard Vite option; it changes only whether the bundle references the map file, not whether the map file is generated.

**Source**  
Part 2 §6.2 — "For a government-facing application, consider `build.sourcemap: 'hidden'`"

---

## ✅ Quick Win #2: Add CI `node_modules` Cache — COMPLETED

> **Note:** `actions/setup-node@v4` with `cache: 'npm'` was already present in `ci.yml` — this is the official equivalent of a manual `actions/cache` step and fully satisfies the intent of this quick win. No change required.

**Architecture Problem**  
The GitHub Actions `ci.yml` pipeline runs `npm ci` on every push with no caching. Full dependency installation takes ~60 seconds on every run. (Part 2 §6.3, FE-P2-08)

**Impact**  
Reduces CI install time from ~60s to ~5s on cache hits. Faster feedback loop on every push and pull request.

**Effort**  
15 minutes

**Implementation Steps**  
1. Open `.github/workflows/ci.yml`
2. Add the following step immediately before the `npm ci` step:
   ```yaml
   - name: Cache node_modules
     uses: actions/cache@v4
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
       restore-keys: |
         ${{ runner.os }}-node-
   ```
3. Commit and push; verify the cache is created on the first run and restored on subsequent runs

**Risk Level**  
None — `actions/cache` is a first-party GitHub action; cache misses fall back to full `npm ci` transparently.

**Source**  
Part 2 §6.3 — "Adding `actions/cache` for the npm cache would reduce install time from ~60s to ~5s on cache hits"

---

## ✅ Quick Win #3: Fix Render-Blocking Google Fonts Load — COMPLETED

**Architecture Problem**  
`src/styles/global.css` loads the Inter typeface via `@import url(https://fonts.googleapis.com/...)`. CSS `@import` is render-blocking — the browser cannot begin rendering until the font stylesheet is fetched. This degrades First Contentful Paint on every cold load. (Part 1 §4.3, FE-P2-04)

**Impact**  
Eliminates the render-blocking font request. FCP improves on cold loads. No visual change — Inter continues to load; it loads non-blocking instead.

**Effort**  
1 hour (including self-hosting option evaluation)

**Implementation Steps — Option A (non-blocking link, fastest)**  
1. Remove the `@import url(...)` line from `src/styles/global.css`
2. Add to `index.html` `<head>`, before the CSS bundle link:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
   ```
3. Verify Inter renders correctly in development and production build

**Implementation Steps — Option B (self-hosted, no external dependency)**  
1. Download Inter font files from `fontsource` (`npm install @fontsource/inter`)
2. Import in `global.css`: `@import '@fontsource/inter/latin.css'`
3. Remove the Google Fonts `@import`
4. Verify font renders correctly; confirm no external network request in DevTools

**Risk Level**  
Low — visual regression risk only; verify font rendering in both options before merging.

**Source**  
Part 1 §4.3 — "The recommended approach is `<link rel='preconnect'>` + `<link rel='stylesheet'>` in `index.html`, or self-hosting the font"

---

## ✅ Quick Win #4: Add `VITE_APP_ENV` Environment Variable — COMPLETED

**Architecture Problem**  
The frontend has no environment awareness variable. `config/env.ts` exposes only `VITE_API_URL`. The frontend cannot distinguish `development`, `staging`, and `production` at runtime, making environment-specific behaviour (banners, feature flags, conditional logging) impossible without build-time workarounds. (Part 2 §6.1, FE-P2-03)

**Impact**  
Enables environment-aware frontend behaviour. Unblocks future work on environment banners, feature flag toggling, and conditional analytics without requiring separate build configurations.

**Effort**  
2 hours

**Implementation Steps**  
1. Add to `config/env.ts`:
   ```typescript
   export const ENV = {
     API_URL: import.meta.env.VITE_API_URL,
     APP_ENV: (import.meta.env.VITE_APP_ENV ?? 'development') as 'development' | 'staging' | 'production',
   };
   ```
2. Add `VITE_APP_ENV=development` to `.env.example` and `.env` (local)
3. Add `VITE_APP_ENV=production` to the production CI environment secrets
4. Add `VITE_APP_ENV=staging` to the staging CI environment (if applicable)
5. Update `README.md` environment variables table

**Risk Level**  
None — additive change; existing code is unaffected. Defaults to `'development'` if unset.

**Source**  
Part 2 §6.1 — "There is no `VITE_APP_ENV` or equivalent variable to distinguish `development`, `staging`, and `production` at the frontend level"

---

## ✅ Quick Win #5: Migrate `useHealthCheck` to TanStack Query — COMPLETED

**Architecture Problem**  
`useHealthCheck` polls `GET /api/v1/health` every 30 seconds using a raw `setInterval`. This bypasses the established TanStack Query server-state layer and continues polling even when the browser tab is hidden, generating unnecessary network requests. (Part 2 §5.6, FE-P2-01)

**Impact**  
Polling pauses automatically when the tab is hidden (`refetchIntervalInBackground: false`). Health check data enters the TanStack Query cache and becomes consistent with the rest of the server-state layer. Removes the only `setInterval` in the codebase.

**Effort**  
30 minutes

**Implementation Steps**  
1. Open `src/hooks/useHealthCheck.ts`
2. Replace the `setInterval` implementation with:
   ```typescript
   import { useQuery } from '@tanstack/react-query';
   import { http } from '../services/http';

   export const useHealthCheck = () =>
     useQuery({
       queryKey: ['health'],
       queryFn: () => http.get('/api/v1/health'),
       refetchInterval: 30_000,
       refetchIntervalInBackground: false,
       retry: false,
     });
   ```
3. Update any consumers of `useHealthCheck` that read the previous return shape to use TanStack Query's `{ data, isError }` shape
4. Run `tsc --noEmit` to confirm no type errors

**Risk Level**  
Low — behaviour is identical when the tab is active; polling pauses when hidden (improvement, not regression).

**Source**  
Part 2 §5.6 — "The health check uses `setInterval` directly rather than TanStack Query's `refetchInterval`. This means the polling is not paused when the tab is hidden"

---

## ✅ Quick Win #6: Move RBAC Permission Map to `@vsaas/types` — COMPLETED

**Architecture Problem**  
`config/permissions.ts` contains `ROLE_PERMISSIONS: Record<Role, Permission[]>` — a manual duplicate of the backend RBAC configuration. There is no shared source of truth. A backend permission change that is not mirrored to the frontend silently produces incorrect UI. (Part 1 §1, Part 2 §7.3, FE-P0-03)

**Impact**  
Eliminates RBAC drift risk. Frontend and backend import from the same canonical definition. Any permission change is a single-file edit in `@vsaas/types` that propagates to both sides at compile time.

**Effort**  
0.5 day (includes backend coordination)

**Implementation Steps**  
1. In `packages/types/src/`, create `permissions.ts`:
   ```typescript
   export type Permission = 'press_releases:create' | 'press_releases:read' | /* ... all permissions */;
   export type Role = 'admin' | 'assessor' | 'social_media' | 'atendente' | 'citizen';
   export const ROLE_PERMISSIONS: Record<Role, Permission[]> = { /* canonical map */ };
   ```
2. Export from `packages/types/src/index.ts`
3. Run `npm run build` in `packages/types/`
4. In the frontend, replace `import { ROLE_PERMISSIONS } from '../config/permissions'` with `import { ROLE_PERMISSIONS } from '@vsaas/types'` in `PermissionGate.tsx` and any other consumers
5. Delete `src/config/permissions.ts`
6. Coordinate with backend team to import from `@vsaas/types` instead of their local copy
7. Run `tsc --noEmit` on both frontend and backend to confirm no type errors

**Risk Level**  
Low — the permission map content does not change, only its location. The risk is coordination with the backend team; schedule together.

**Source**  
Part 2 §7.3 — "Moving the canonical permission definitions to the shared `@vsaas/types` package eliminates the risk of frontend/backend drift"

---

## ✅ Quick Win #7: Encode Provider Ordering Constraint Structurally — COMPLETED

**Architecture Problem**  
The `TenantProvider` ordering constraint (must be inside `AuthProvider`) is documented only as a comment in `TenantContext.tsx`. A future refactor that reorders providers in `index.tsx` would silently break tenant resolution with no compile-time or test-time guard. (Part 2 §5.1, FE-P0-01)

**Impact**  
Provider ordering becomes structurally enforced. The constraint cannot be violated accidentally during refactoring.

**Effort**  
0.5 day

**Implementation Steps**  
1. Create `src/providers/AppProviders.tsx`:
   ```typescript
   // Provider order is load-bearing. See docs/frontend/02-...-Part2.md §5.1.
   // TenantProvider MUST be inside AuthProvider (reads useAuth() on mount).
   // AuthProvider MUST be inside BrowserRouter (calls useNavigate() on logout).
   export const AppProviders = ({ children }: { children: React.ReactNode }) => (
     <QueryProvider>
       <BrowserRouter>
         <AuthProvider>
           <CitizenAuthProvider>
             <TenantProvider>
               {children}
             </TenantProvider>
           </CitizenAuthProvider>
         </AuthProvider>
       </BrowserRouter>
     </QueryProvider>
   );
   ```
2. Add a runtime invariant in `TenantProvider` that throws in development if `useAuth()` returns `undefined` (indicating it was mounted outside `AuthProvider`)
3. Update `index.tsx` to use `<AppProviders>` instead of the inline nesting
4. Delete the ordering comment from `TenantContext.tsx` — the structure now enforces it

**Risk Level**  
Low — pure refactor; no behaviour change. The runtime invariant only throws in `development` mode.

**Source**  
Part 2 §5.1 — "The `TenantProvider` ordering constraint is documented in a comment inside `TenantContext.tsx` but is not enforced structurally"

---

## ✅ Quick Win #8: Replace `ThemeToggle` No-Op with Honest UI — COMPLETED

**Architecture Problem**  
`ThemeToggle` calls `toggleTheme()` in `uiStore`, which updates Zustand state, but the dark mode CSS custom property token set is not defined in `tokens/index.css`. The toggle appears functional but has no effect. Users clicking it receive no feedback and no visual change. (Part 1 §1, Part 2 §8.3, FE-P3-04)

**Impact**  
Eliminates a dead UI element that misleads users. Removes dead state from `uiStore`. Cleans up the Zustand store surface area.

**Effort**  
1 hour (remove path)

**Implementation Steps — Remove path (recommended until dark mode is prioritized)**  
1. Remove `<ThemeToggle />` from `DashboardLayout` (or wherever it is rendered)
2. Remove `toggleTheme` action and `theme` state from `uiStore.ts`
3. Remove `ThemeToggle.tsx` and its CSS module
4. Run `tsc --noEmit` to confirm no remaining references
5. Run `npm run test` to confirm no test failures

**Risk Level**  
None for the remove path — the toggle has no functional effect today. The implement path (1 day) carries low risk but is out of scope for a quick win.

**Source**  
Part 1 §1 — "dark mode is wired but not implemented (ThemeToggle is a no-op)"; Part 2 §8.3 — "remove `ThemeToggle` from the UI to avoid user confusion. Estimated effort: 1 hour"

---

## Quick Win Summary

| # | Title | Issue ID | Effort | Risk | Phase |
|---|---|---|---|---|---|
| QW-1 | ~~Scope production source maps~~ ✅ | FE-P0-02 | 5 min | None | Phase 1 |
| QW-2 | ~~Add CI `node_modules` cache~~ ✅ | FE-P2-08 | 15 min | None | Phase 1 |
| QW-3 | ~~Fix render-blocking Google Fonts load~~ ✅ | FE-P2-04 | 1h | Low | Phase 3 |
| QW-4 | ~~Add `VITE_APP_ENV` environment variable~~ ✅ | FE-P2-03 | 2h | None | Phase 1 |
| QW-5 | ~~Migrate `useHealthCheck` to TanStack Query~~ ✅ | FE-P2-01 | 30 min | Low | Phase 2 |
| QW-6 | ~~Move RBAC permission map to `@vsaas/types`~~ ✅ | FE-P0-03 | 0.5d | Low | Phase 1 |
| QW-7 | ~~Encode provider ordering constraint structurally~~ ✅ | FE-P0-01 | 0.5d | Low | Phase 1 |
| QW-8 | ~~Replace `ThemeToggle` no-op with honest UI~~ ✅ | FE-P3-04 | 1h | None | Phase 4 |

**Total quick win effort:** ~1.5 days  
**Combined impact:** Closes all 3 P0 issues; eliminates render-blocking font load; removes dead state; unifies health check with server-state layer; enables environment-aware behaviour; accelerates CI by ~55s per run.
