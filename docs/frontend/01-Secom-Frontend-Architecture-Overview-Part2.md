# Secom Frontend Architecture Overview — Part 2

**Scope:** Application Bootstrap · Build & Environment · Architecture & Design Patterns · Recommendations  
**Codebase:** `secomvsaas/` (frontend root)  
**Analysis date:** July 2025  
**Part:** 2 of 2 — see [Part 1](./01-Secom-Frontend-Architecture-Overview-Part1.md) for Stack, Structure & Dependencies

---

## 5. Application Bootstrap & Runtime Lifecycle

### 5.1 Entry Point Chain

```
index.html
 └── src/index.tsx
      └── ReactDOM.createRoot('#root')
           └── React.StrictMode
                └── App.tsx
                     └── ErrorBoundary          (class component — catches render errors)
                          └── QueryProvider      (QueryClientProvider — TanStack Query)
                               └── BrowserRouter (React Router v6)
                                    └── AuthProvider    (Context — user session)
                                         └── TenantProvider  (Context — tenant data)
                                              ├── ConnectionBanner  (polls /health every 30s)
                                              ├── AppRoutes         (Suspense + lazy routes)
                                              ├── CookieConsent     (LGPD banner)
                                              └── Toaster           (react-hot-toast)
```

### 5.2 Provider Hierarchy Analysis

**`ErrorBoundary`** — outermost provider. Catches any render-phase error in the entire tree and displays a fallback with a "retry" button. The fallback message is hardcoded in Portuguese (`"Algo deu errado"`), bypassing the i18n system. This is acceptable for a last-resort boundary but worth noting.

**`QueryProvider`** — wraps a singleton `QueryClient` instance created in `src/config/queryClient.ts`. The client is instantiated at module load time (outside React), which is the correct pattern for a SPA. The `QueryClientProvider` must be above `BrowserRouter` because hooks like `useNavigate` (used inside query callbacks) require the router context — however, in this codebase, navigation from query callbacks is not observed, so the current order is safe.

**`BrowserRouter`** — standard HTML5 history routing. No hash routing or memory router.

**`AuthProvider`** — on mount, calls `authService.me()` to restore the session from the httpOnly cookie. Sets `isLoading: true` until the response resolves. All protected routes check `isLoading` before rendering, preventing a flash of the login redirect.

**`TenantProvider`** — depends on `AuthProvider` (calls `useAuth()` internally). Fetches tenant data from `/api/v1/tenants/me` when `isAuthenticated && user?.tenantId` is true. Exposes `hasFeature(feature)` for feature-flag gating.

**`ConnectionBanner`** — polls the backend health endpoint every 30 seconds using `useHealthCheck`. Renders a fixed red banner when the API is unreachable. This is rendered outside `AppRoutes`, so it appears on all pages including auth pages.

**`AppRoutes`** — wrapped in a single `<Suspense>` boundary with a spinner fallback. All page components are lazy-loaded via `React.lazy()`.

**`CookieConsent`** — reads `localStorage` on mount; shows a fixed bottom banner if consent has not been recorded. Stores consent in `localStorage` under `secom_cookie_consent`.

**`Toaster`** — `react-hot-toast` global toast container, positioned top-right with a 4-second default duration.

### 5.3 Initialization Sequence

```
1. Browser loads index.html → Vite serves bundled JS
2. React.StrictMode mounts (double-invokes effects in development)
3. ErrorBoundary mounts (passive — no side effects)
4. QueryClient singleton already created at module load time
5. QueryClientProvider mounts with the singleton client
6. BrowserRouter initializes history API
7. AuthProvider mounts → fires authService.me() → isLoading = true
8. TenantProvider mounts → waits for isAuthenticated (from AuthProvider)
9. ConnectionBanner mounts → fires first health check immediately
10. AppRoutes renders → Suspense shows spinner while lazy chunk loads
11. authService.me() resolves:
    a. Success → user set, isLoading = false → ProtectedRoute renders children
    b. Failure → user = null, isLoading = false → ProtectedRoute redirects to /login
12. If authenticated: TenantProvider fires /api/v1/tenants/me
13. Page component chunk loads → Suspense resolves → page renders
```

### 5.4 Error Boundaries & Suspense

| Boundary | Location | Scope | Fallback |
|---|---|---|---|
| `ErrorBoundary` | `App.tsx` (root) | Entire application | Hardcoded PT-BR error message + retry button |
| `Suspense` | `routes/index.tsx` | All lazy-loaded pages | CSS spinner (`loading-screen` class) |

There is **one global error boundary** and **one global Suspense boundary**. There are no per-route or per-feature error boundaries. A render error in any page component will bubble to the root boundary and unmount the entire application.

### 5.5 Global State Hydration

| State | Hydration source | Timing |
|---|---|---|
| Auth user | `authService.me()` (API call) | On `AuthProvider` mount |
| Tenant | `/api/v1/tenants/me` (API call) | After auth resolves |
| Theme | `localStorage.getItem('theme')` | Synchronous, at Zustand store creation |
| i18n locale | `localStorage.getItem('secom_locale')` | Synchronous, at Zustand store creation |
| Cookie consent | `localStorage.getItem('secom_cookie_consent')` | On `CookieConsent` mount |

Theme and locale are hydrated synchronously from `localStorage` before the first render, avoiding a flash of the wrong theme or language. Auth and tenant state require async API calls, which is handled by the `isLoading` guard in `ProtectedRoute`.

### 5.6 Notable Bootstrap Issues

**🟧 Duplicate theme state**

`uiStore.ts` manages `theme` with `localStorage` key `'theme'`. `ThemeToggle.tsx` creates a separate `useThemeStore` with `localStorage` key `'secom_theme'`. These are two independent stores writing to different keys. The `DashboardLayout` uses `useUIStore` for the sidebar but imports `ThemeToggle` which uses `useThemeStore`. The `data-theme` attribute on `document.documentElement` is only set by `useThemeStore` (via `ThemeToggle`'s `useEffect`), meaning `uiStore`'s theme value has no effect on the actual rendered theme. This is a latent bug — the `uiStore` theme state is effectively dead.

**🟨 `AuthProvider` is inside `BrowserRouter`**

`AuthProvider` is nested inside `BrowserRouter`. This means `useNavigate` is available inside auth callbacks if needed. However, `AuthProvider` itself does not use `useNavigate` — navigation after login/logout is handled by the calling page component. The current nesting is correct.

**🟨 `TenantProvider` calls `useAuth()` directly**

`TenantProvider` imports and calls `useAuth()`, creating a direct dependency between two context providers. This is a common pattern but means `TenantProvider` cannot be used outside `AuthProvider`. The dependency is implicit — it would fail at runtime if the order were reversed.

---

## 6. Build & Environment Configuration

### 6.1 Environment Variables

Variables are prefixed with `VITE_` (Vite convention) and accessed via `import.meta.env.*`.

| Variable | Default | Purpose | Validation |
|---|---|---|---|
| `VITE_API_URL` | `http://localhost:5000` | Backend API base URL | None — falls back silently |
| `VITE_DISABLE_MSW` | `true` | Mock Service Worker toggle | Not used in source |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_` | Stripe public key | Not used in source |
| `VITE_SENTRY_DSN` | (empty) | Sentry error tracking DSN | Not used in source |
| `VITE_VERSION` | `1.0.0` | App version | Not used in source |
| `VITE_ENV` | `development` | Environment name | Not used in source |
| `VITE_FEATURE_BILLING` | `false` | Feature flag: billing | Not used in source |
| `VITE_FEATURE_PORTAL` | `true` | Feature flag: portal | Not used in source |

**Observations:**
- Only `VITE_API_URL` is actively consumed in the source (`src/services/http.ts`, `src/hooks/useHealthCheck.ts`)
- No environment variable validation exists at startup — a missing or malformed `VITE_API_URL` will cause silent runtime failures
- Several variables in `.env.example` reference features (Sentry, MSW, Stripe, feature flags) that are not implemented in the observable source code, suggesting the `.env.example` was inherited from the boilerplate and not pruned

### 6.2 Environment Separation

There is a single `.env.example` file at the project root. No `.env.development`, `.env.staging`, or `.env.production` files are present in the repository (correctly excluded via `.gitignore`). Environment separation relies entirely on the deployment pipeline providing the correct `.env` file.

The CI workflow (`ci.yml`) does not set any `VITE_*` environment variables for the frontend test job, relying on Vitest's `globals: true` and the fact that frontend tests mock the HTTP layer rather than making real API calls.

### 6.3 Build Configuration (vite.config.ts)

```typescript
// Key settings:
plugins: [react()]                    // Babel-based React transform
server.port: 3000                     // Dev server port
server.proxy: { '/api': 'localhost:5000' }  // API proxy (avoids CORS in dev)

build.rollupOptions.output.manualChunks: {
  vendor: ['react', 'react-dom', 'react-router-dom'],
  query:  ['@tanstack/react-query'],
  forms:  ['zod'],                    // zod not used in source — this chunk may be empty
}
```

**Code splitting strategy:**

| Chunk | Contents | Strategy |
|---|---|---|
| `vendor` | react, react-dom, react-router-dom | Manual — stable, rarely changes |
| `query` | @tanstack/react-query | Manual — stable |
| `forms` | zod | Manual — **zod not used; chunk likely empty** |
| Per-page chunks | Each lazy-loaded page | Automatic — via `React.lazy()` |
| Default chunk | Everything else | Automatic |

All 20 page components are lazy-loaded, producing 20 separate async chunks. This is good for initial load time — users only download the code for pages they visit.

**Missing build configurations:**
- No `sourcemap` setting (defaults to `false` in production — no source maps in prod)
- No explicit `target` for the build output (defaults to Vite's `modules` target — ES2015+)
- No `assetsInlineLimit` override (defaults to 4KB)
- No `chunkSizeWarningLimit` override (defaults to 500KB)

### 6.4 Dev Server

The Vite dev server proxies all `/api/*` requests to `http://localhost:5000`, eliminating CORS issues during development. The `concurrently` script (`dev:all`) starts both the frontend dev server and the backend simultaneously.

### 6.5 CI Pipeline

The GitHub Actions workflow (`ci.yml`) runs on push/PR to `main` and `develop`:

1. Installs `packages/types` and builds it
2. Installs frontend and backend dependencies
3. Runs `tsc --noEmit` (type check)
4. Runs ESLint on both frontend and backend
5. Runs Vitest (frontend unit tests)
6. Runs Jest (backend tests) with real MongoDB and Redis services

**Gaps:**
- No E2E (Cypress) step in CI — only unit tests run automatically
- No build step in CI — the production bundle is never verified in the pipeline
- No coverage threshold enforcement
- No bundle size check

### 6.6 Pre-commit Hooks

Husky runs on pre-commit:
1. `npm run type-check` — full TypeScript check (both frontend and backend)
2. `npm run lint` — ESLint on `src/**/*.{ts,tsx}`

`lint-staged` additionally runs Prettier and ESLint `--fix` on staged files.

---

## 7. Architecture & Design Patterns

### 7.1 Overall Architecture Style

The frontend follows a **layered architecture** with a clear data flow direction:

```
┌─────────────────────────────────────────────────────────┐
│                        Pages                            │
│  (UI rendering, local state, form handling, UX logic)   │
├─────────────────────────────────────────────────────────┤
│                    Domain Hooks                         │
│  (TanStack Query wrappers, cache key management)        │
├─────────────────────────────────────────────────────────┤
│                  Generic API Hooks                      │
│  (useApiQuery / useApiMutation — TanStack Query bridge) │
├─────────────────────────────────────────────────────────┤
│                   Service Layer                         │
│  (per-domain service objects — typed API calls)         │
├─────────────────────────────────────────────────────────┤
│                    HTTP Client                          │
│  (fetch wrapper — auth, error normalization, refresh)   │
└─────────────────────────────────────────────────────────┘
```

Cross-cutting concerns (auth, tenant, i18n, theme) are handled via React Context (auth, tenant) and Zustand stores (i18n, theme, UI state).

### 7.2 High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    React Application                    │    │
│  │                                                         │    │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │    │
│  │  │  Zustand │  │ React Context│  │  TanStack Query  │  │    │
│  │  │  Stores  │  │  (Auth,      │  │  (server state,  │  │    │
│  │  │ (UI,i18n,│  │   Tenant)    │  │   cache)         │  │    │
│  │  │  theme)  │  └──────────────┘  └──────────────────┘  │    │
│  │  └──────────┘                                           │    │
│  │                                                         │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │                    Pages                        │   │    │
│  │  │  (lazy-loaded, RBAC-gated, layout-wrapped)      │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  │                         │                               │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │              Domain Hooks (useApi*)             │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  │                         │                               │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │           Service Layer (*Service.ts)           │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  │                         │                               │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │         HTTP Client (http.ts / fetch)           │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                             │                                    │
│                    httpOnly cookies                              │
└─────────────────────────────┼────────────────────────────────────┘
                              │ HTTPS
                    ┌─────────▼──────────┐
                    │   Backend API      │
                    │  (Express / Node)  │
                    └────────────────────┘
```

### 7.3 Design Patterns in Use

**Custom Hook Pattern (primary pattern)**

The dominant pattern throughout the codebase. Business logic, data fetching, and side effects are extracted into custom hooks. Pages consume hooks and focus on rendering. Examples: `useApiQuery`, `useApiMutation`, `usePressRelease*`, `useHealthCheck`, `usePageTitle`, `useToast`.

**Service Object Pattern**

API calls are grouped into plain objects (`authService`, `pressReleaseService`, etc.) rather than classes or standalone functions. Each service object maps to one backend resource. This provides a clean, discoverable API surface.

**Provider / Context Pattern**

Used for cross-cutting state that needs to be accessible throughout the tree without prop drilling: `AuthContext` (user session) and `TenantContext` (tenant data). Zustand is used instead of Context for UI state and i18n to avoid unnecessary re-renders.

**Layout / Outlet Pattern (React Router v6)**

Three layout components (`PublicLayout`, `AuthLayout`, `DashboardLayout`) wrap route groups via `<Outlet>`. This cleanly separates layout concerns from page content.

**ProtectedRoute / PermissionGate Pattern**

Two complementary RBAC enforcement mechanisms:
- `ProtectedRoute` — route-level guard (redirects unauthenticated users, redirects unauthorized roles)
- `PermissionGate` — UI-level guard (hides elements the user lacks permission to see)

Both read from `AuthContext` and the `permissions.ts` config. The permission matrix is centralized in a single file, making it easy to audit.

**Barrel Export Pattern**

`src/components/UI/index.ts` exports all UI primitives from a single entry point. Pages import from `'../../../components/UI'` rather than individual files. This is convenient but can hinder tree-shaking if the bundler cannot statically analyze the barrel.

### 7.4 Separation of Concerns

| Concern | Location | Assessment |
|---|---|---|
| HTTP transport | `services/http.ts` | Well-isolated |
| API contracts | `services/api/*.ts` | Well-isolated |
| Server state / caching | `hooks/use*.ts` + TanStack Query | Well-isolated |
| Client UI state | `store/uiStore.ts` | Well-isolated |
| Auth state | `contexts/AuthContext.tsx` | Well-isolated |
| Tenant state | `contexts/TenantContext.tsx` | Well-isolated |
| i18n | `i18n/index.ts` | Isolated but has a hook/non-hook inconsistency |
| RBAC config | `config/permissions.ts` | Well-isolated |
| Routing | `routes/index.tsx` | Well-isolated |
| UI primitives | `components/UI/` | Well-isolated |
| Page UI + form state + validation | `pages/Domain/*.tsx` | **Mixed — no separation within pages** |

The main separation-of-concerns weakness is in the domain page components. Each page component manages: list state (pagination, search), modal open/close state, form state, client-side validation, mutation callbacks, and toast notifications — all in a single component. This is manageable at the current scale but will become harder to test and maintain as form complexity grows.

### 7.5 RBAC Architecture

The RBAC system is implemented at three levels:

```
Level 1: Route guard (ProtectedRoute)
  → Redirects unauthenticated users to /login
  → Redirects users without the required role to /unauthorized

Level 2: UI guard (PermissionGate)
  → Hides navigation links and UI elements for unauthorized roles
  → Used in DashboardLayout sidebar navigation

Level 3: Permission config (config/permissions.ts)
  → Single source of truth for role → permission mappings
  → rolesWithPermission() derives allowed roles for each route
```

The permission matrix is frontend-only — it mirrors the backend RBAC but is not authoritative. The backend enforces permissions independently. The frontend RBAC is a UX layer, not a security boundary.

**Observation:** The `UsersPage.tsx` defines `ROLES = ['admin', 'manager', 'staff']` locally, which does not match the system roles defined in `config/permissions.ts` (`admin`, `assessor`, `social_media`, `atendente`, `citizen`). This is a **data inconsistency** — the invite form would allow inviting users with roles that don't exist in the permission system.

### 7.6 i18n Architecture

The i18n system is custom-built using Zustand:

- Two locale files: `pt-BR.json` (primary) and `en.json` (complete parity)
- `t(key, params?)` — imperative function that reads from Zustand state
- `useTranslation()` — React hook that subscribes to locale changes
- `tArray(key)` — returns arrays (used for password strength labels)
- Locale persisted to `localStorage` under `secom_locale`
- Browser language detection with fallback to `pt-BR`

**Issue:** The `t()` function is used both as a hook (via `useTranslation`) and as a plain function (imported directly in `DataTable.tsx`, `Modal.tsx`, `ConnectionBanner.tsx`, `PasswordInput.tsx`). When called as a plain function outside a React component, it reads the current Zustand state correctly at call time, but the component will not re-render when the locale changes unless it also subscribes to the store. Components that import `t` directly (not via `useTranslation`) will show stale translations after a locale switch.

### 7.7 HTTP Client Architecture

`src/services/http.ts` is a custom `fetch` wrapper with:

- **Automatic token refresh:** On 401 responses, attempts to refresh the token via `/api/v1/auth/refresh`. Uses a module-level `refreshPromise` variable to deduplicate concurrent refresh attempts (multiple in-flight requests that all get 401 will share a single refresh call).
- **Error normalization:** All non-2xx responses throw `ApiError` with `status`, `code`, and `details` fields.
- **Query string serialization:** `params` object is serialized to URL query string, filtering out `undefined` values.
- **Auth route exclusion:** Requests to `/auth/` paths do not trigger the refresh flow.

The deduplication of refresh calls is a notable implementation detail that prevents the "refresh storm" problem.

### 7.8 Testing Architecture

| Layer | Framework | Coverage |
|---|---|---|
| HTTP client | Vitest | Comprehensive — all methods, error cases, 401 refresh flow |
| Auth context | Vitest + RTL | Comprehensive — mount, login, logout, error cases |
| UI primitives | Vitest + RTL | Good — Button, Modal, EmptyState, StatusBadge, Loading |
| Auth components | Vitest + RTL | Good — LoginForm, ProtectedRoute |
| Zustand stores | Vitest | Good — uiStore |
| Domain pages | None | **No tests** |
| Domain hooks | None | **No tests** |
| Service layer | None | **No tests** |
| i18n | None | **No tests** |
| E2E | Cypress | Auth flow only (login, register, protected routes, 404/403) |

Test coverage is strong for infrastructure (HTTP, auth, UI primitives) but absent for domain-specific code (pages, domain hooks, service objects). The domain pages are the most complex components in the codebase and have zero test coverage.

**Test isolation:** Tests mock the `authService` and `http` modules at the module level using Vitest's `vi.mock()`. This is the correct approach — tests do not make real HTTP calls.

---

## 8. Initial High-Level Recommendations

### 🟥 Critical

None identified. No security, data integrity, or availability risks were found in the observable frontend code. The HTTP client correctly uses `credentials: 'include'` for httpOnly cookie auth, and the RBAC system has both route and UI enforcement layers.

---

### 🟧 High

**H1 — Resolve the duplicate theme state**

`uiStore.ts` and `ThemeToggle.tsx` maintain independent theme stores with different `localStorage` keys. The `data-theme` attribute (which drives the actual visual theme) is only set by `ThemeToggle`'s store. The `uiStore` theme value is effectively dead. Consolidate to a single theme store and a single `localStorage` key.

**H2 — Separate concerns within domain page components**

All seven domain pages mix list state, modal state, form state, validation, and mutation callbacks in a single component. As form complexity grows (more fields, conditional logic, cross-field validation), these components will become difficult to test and maintain. Consider extracting form logic into dedicated form components or custom hooks, and validation into separate validator functions.

**H3 — Remove or activate unused production dependencies**

`framer-motion`, `@stripe/react-stripe-js`, `@stripe/stripe-js`, and `react-hook-form` are declared as production dependencies with no observable usage. Remove them to reduce bundle size, dependency surface, and security exposure. If Stripe or animations are planned features, add them when the implementation begins.

---

### 🟨 Medium

**M1 — Fix role inconsistency in UsersPage**

`UsersPage.tsx` defines `ROLES = ['admin', 'manager', 'staff']` locally. The system roles are `admin`, `assessor`, `social_media`, `atendente`, `citizen`. The invite form allows selecting non-existent roles. The local `ROLES` constant should reference the canonical `ROLES` object from `config/permissions.ts`.

**M2 — Fix i18n stale render issue**

Components that import `t` directly (not via `useTranslation`) will not re-render on locale change. `DataTable`, `Modal`, `ConnectionBanner`, and `PasswordInput` are affected. These components should either use `useTranslation()` internally or accept translated strings as props.

**M3 — Replace `eslint-config-react-app` with a Vite-appropriate config**

`eslint-config-react-app` is a CRA artifact. Migrate to `@typescript-eslint/eslint-plugin` + `eslint-plugin-react` + `eslint-plugin-react-hooks` for a configuration aligned with the actual toolchain.

**M4 — Move `@tanstack/react-query-devtools` to devDependencies**

The devtools package should be in `devDependencies` to signal intent and prevent accidental production inclusion.

**M5 — Add environment variable validation at startup**

Add a startup check (e.g., in `src/index.tsx` or a dedicated `src/config/env.ts`) that validates required environment variables and fails fast with a clear error message rather than silently falling back to defaults.

**M6 — Add per-route or per-feature error boundaries**

A single root error boundary means any render error unmounts the entire application. Adding error boundaries at the layout or page level would contain failures to the affected section.

**M7 — Add a build step to CI**

The CI pipeline runs tests but never builds the production bundle. A failed build (e.g., a TypeScript error that only manifests during Vite's build phase) would not be caught until deployment. Add `npm run build` to the CI workflow.

---

### 🟩 Low

**L1 — Remove or implement empty placeholder directories**

Eight directories contain only `.gitkeep` files: `components/common/`, `components/Navigation/`, `components/Notifications/`, `components/UI/Form/`, `components/UI/Toast/`, `services/base/`, `services/interceptors/`, `src/types/`, `src/utils/`. Remove placeholders for unplanned features; implement or document the intent for planned ones.

**L2 — Add test coverage for domain hooks and pages**

Domain hooks (`usePressRelease`, `useAppointment`, etc.) and domain pages have no unit tests. Given that these are the primary user-facing functionality, adding tests — even basic smoke tests — would significantly improve confidence in changes.

**L3 — Add Cypress E2E coverage for domain modules**

The only Cypress spec covers authentication. Adding E2E tests for at least one domain module (e.g., press releases CRUD) would provide end-to-end confidence.

**L4 — Prune `.env.example` to reflect actual usage**

Several variables in `.env.example` (`VITE_DISABLE_MSW`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_SENTRY_DSN`, `VITE_VERSION`, `VITE_ENV`, `VITE_FEATURE_BILLING`, `VITE_FEATURE_PORTAL`) are not consumed in the source code. Remove them or add the corresponding implementation to avoid confusion during onboarding.

**L5 — Consider migrating global.css to CSS Modules or scoped styles**

The single 610-LOC `global.css` file will grow linearly with new modules. CSS Modules or a utility-first approach (Tailwind) would provide better scoping and prevent class name collisions as the application scales.

**L6 — Upgrade `react-icons` to v5**

React Icons v5 provides improved tree-shaking. The upgrade is generally non-breaking for the `Md*` icon imports used in this codebase.

**L7 — Remove the `forms: ['zod']` manual chunk**

`zod` is not used in the source code. The manual chunk entry in `vite.config.ts` should be removed to avoid an empty or near-empty chunk in the production build.

---

## Appendix: File Count by Directory

| Directory | Production files | Test files |
|---|---|---|
| `src/` (root) | 2 (App.tsx, index.tsx) | 0 |
| `src/components/Auth/` | 3 | 2 |
| `src/components/ErrorBoundary/` | 1 | 1 |
| `src/components/Layout/` | 2 | 0 |
| `src/components/LGPD/` | 1 | 0 |
| `src/components/UI/` | 10 | 5 |
| `src/config/` | 2 | 0 |
| `src/contexts/` | 2 | 1 |
| `src/hooks/` | 11 | 0 |
| `src/i18n/` | 1 + 2 JSON | 0 |
| `src/layouts/` | 4 (incl. index) | 0 |
| `src/pages/Admin/` | 2 | 0 |
| `src/pages/Domain/` | 7 | 0 |
| `src/pages/Error/` | 2 | 0 |
| `src/pages/(auth/other)` | 6 | 0 |
| `src/providers/` | 1 | 0 |
| `src/routes/` | 1 | 0 |
| `src/services/http` | 1 | 1 |
| `src/services/api/` | 9 | 0 |
| `src/store/` | 2 | 1 |
| `src/styles/` | 2 CSS | 0 |
| `src/tests/` | 1 (setup) | 0 |
| **Total** | **~76** | **11** |
