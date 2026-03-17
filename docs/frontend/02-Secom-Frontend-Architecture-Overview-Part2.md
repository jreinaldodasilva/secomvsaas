# Secom Frontend — Architecture Overview
## Part 2: Bootstrap Lifecycle, Build Configuration, Design Patterns & Recommendations

**Document version:** 1.0  
**Codebase snapshot:** post-commit `f2a9d48`  
**Scope:** `src/` (frontend), `packages/types/`, `vite.config.ts`, `tsconfig.json`, `package.json`, CI pipeline  

---

## 5. Application Bootstrap & Runtime Lifecycle

### 5.1 Provider Hierarchy

`index.tsx` mounts the application with the following provider nesting order:

```
React.StrictMode
  └── ErrorBoundary                  # Class component; catches render errors app-wide
        └── QueryProvider            # TanStack QueryClientProvider
              └── BrowserRouter      # React Router v6 history context
                    └── AuthProvider # Staff JWT session + refresh logic
                          └── CitizenAuthProvider  # Citizen portal session (isolated)
                                └── TenantProvider # Tenant data + feature flags
                                      └── App      # Route tree + Toaster
```

**Ordering constraints:**

| Constraint | Reason |
|---|---|
| `AuthProvider` must wrap `TenantProvider` | `TenantProvider` reads `useAuth()` to get the current user's tenant ID before fetching tenant data |
| `QueryProvider` must wrap all context providers | `AuthProvider` and `TenantProvider` use TanStack Query internally |
| `BrowserRouter` must wrap `AuthProvider` | `AuthProvider` calls `useNavigate()` on logout |
| `CitizenAuthProvider` is independent of `TenantProvider` | Citizen sessions are tenant-agnostic; ordering between them is arbitrary |

**Observation:** The `TenantProvider` ordering constraint is documented in a comment inside `TenantContext.tsx` but is not enforced structurally. A future refactor that reorders providers would silently break tenant resolution.

### 5.2 Initialization Sequence

Before `ReactDOM.createRoot().render()` is called, `index.tsx` performs two synchronous DOM mutations:

```
1. document.documentElement.setAttribute('data-theme', 'light')
2. document.documentElement.setAttribute('lang', 'pt-BR')
```

This ensures the CSS custom property theme and the HTML language attribute are set before the first paint, preventing a flash of unstyled content (FOUC) for theme-dependent styles.

`config/env.ts` is imported at module load time and throws synchronously if `VITE_API_URL` is not defined. This means a misconfigured build fails immediately at startup rather than at the first API call.

### 5.3 Route-Level Code Splitting & Suspense

All 20+ page components are imported via `React.lazy()` in `routes/index.tsx`. A single `<Suspense>` boundary wraps the entire route tree with a `<LazyFallback>` spinner component. There are no nested Suspense boundaries — all lazy chunks share the same loading state.

```
<Suspense fallback={<LazyFallback />}>
  <Routes>
    <Route element={<PublicLayout />}>...</Route>
    <Route element={<DashboardLayout />}>...</Route>
    <Route element={<CitizenPortalLayout />}>...</Route>
  </Routes>
</Suspense>
```

**Observation:** A single top-level Suspense boundary means that navigating between any two lazy routes shows the full-page spinner, even for fast connections where the chunk loads in <100ms. Per-layout or per-route Suspense boundaries would scope the loading indicator to the content area only.

### 5.4 Error Boundary Strategy

`ErrorBoundary` is a class component (required by React for error boundaries). It is placed in two locations:

| Location | Scope | Fallback UI |
|---|---|---|
| `index.tsx` (wraps entire app) | Catches any unhandled render error | Full-page error screen with reload button |
| Each layout's `<Outlet>` wrapper | Catches errors within a layout's page content | Inline error card |

Errors thrown in event handlers or async code (e.g., inside `useEffect`) are **not** caught by error boundaries. These are handled by `react-hot-toast` error notifications triggered from TanStack Query's `onError` callbacks and from `http.ts`'s catch blocks.

### 5.5 Session Management

Two independent session mechanisms run in parallel:

**Staff session (`AuthContext`)**
- JWT stored in `httpOnly` cookie (`secom_token`); not accessible to JavaScript
- `AuthContext` holds the decoded user object in React state
- On mount, calls `GET /api/v1/auth/me` to rehydrate session
- `http.ts` intercepts 401 responses, calls `POST /api/v1/auth/refresh` once (deduplication via `refreshPromise` singleton), then retries the original request
- On refresh failure, calls `logout()` which clears state and navigates to `/login`

**Citizen session (`CitizenAuthContext`)**
- JWT stored in `httpOnly` cookie (`secom_portal_token`)
- Identical rehydration pattern via `GET /api/v1/citizen-auth/me`
- Uses a separate `PORTAL_JWT_SECRET` on the backend (issuer: `vsaas-portal`, audience: `vsaas-citizen`)
- Does **not** share the `refreshPromise` singleton with the staff session — each has its own refresh deduplication

**Inactivity timeout (`useSessionTimeout`)**
- Listens to `mousedown`, `keydown`, `scroll`, `touchstart` on `window`
- 30-minute inactivity window; resets on any event
- On timeout: calls `AuthContext.logout()` (staff only — citizen session is not affected)
- Registered in `DashboardLayout` — active only when the staff dashboard is mounted

### 5.6 Health Check & Connection Banner

`useHealthCheck` polls `GET /api/v1/health` every 30 seconds using `setInterval`. The result drives a `ConnectionBanner` component rendered in `DashboardLayout`. When the API is unreachable, the banner appears at the top of the dashboard with a warning message.

**Observation:** The health check uses `setInterval` directly rather than TanStack Query's `refetchInterval`. This means the polling is not paused when the tab is hidden (`document.visibilityState === 'hidden'`), resulting in unnecessary network requests when the user switches tabs.

---

## 6. Build & Environment Configuration

### 6.1 Environment Variables

The application uses a single environment variable:

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_API_URL` | ✅ Yes | — | Base URL for all API requests |

`config/env.ts` validates this at module load:

```typescript
if (!import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL is not defined');
}
export const ENV = { API_URL: import.meta.env.VITE_API_URL };
```

All other configuration (JWT secrets, database URLs, Redis) lives in the backend `.env` and is never exposed to the frontend.

**Observation:** There is no `VITE_APP_ENV` or equivalent variable to distinguish `development`, `staging`, and `production` at the frontend level. The `secure` cookie flag in the backend citizen auth controller checks `NODE_ENV`, but the frontend has no equivalent environment awareness. This matters if frontend behaviour needs to differ between staging and production (e.g., disabling analytics, showing environment banners).

### 6.2 Vite Configuration

Key `vite.config.ts` settings:

| Setting | Value | Purpose |
|---|---|---|
| `plugins` | `[@vitejs/plugin-react]` | Babel-based React transform (Fast Refresh) |
| `server.proxy` | `/api → localhost:5000` | Dev proxy; avoids CORS in development |
| `resolve.alias` | `@/* → src/*`, `@vsaas/types` | Path aliases (mirrored from `tsconfig.json`) |
| `build.sourcemap` | `true` | Source maps enabled in production build |
| `build.rollupOptions.output.manualChunks` | vendor, query, motion, icons | Explicit chunk splitting (see §4.4) |
| `test.environment` | `jsdom` | Vitest DOM environment |
| `test.setupFiles` | `src/tests/setup.ts` | Global test setup |
| `test.globals` | `true` | `describe`/`it`/`expect` without imports |

**Observation:** `build.sourcemap: true` exposes source maps in the production build. This aids debugging but also exposes the original source code to anyone who inspects the network tab. For a government-facing application, consider `build.sourcemap: 'hidden'` (generates source maps but does not reference them in the bundle) or uploading source maps to an error tracking service and excluding them from the public deployment.

### 6.3 CI Pipeline

The GitHub Actions `ci.yml` workflow runs on every push and pull request:

```
Job: ci
  1. Checkout
  2. Setup Node.js 20
  3. Install dependencies (npm ci)
  4. Type-check (tsc --noEmit)
  5. Lint (eslint src/)
  6. Unit tests (vitest run)
  7. Build (vite build)
  8. Start backend + frontend (concurrently, wait-on)
  9. Cypress E2E tests
```

All steps run sequentially in a single job. A failure in type-check blocks lint, which blocks tests, which blocks E2E — providing fast feedback at the cheapest step first.

**Observation:** The CI pipeline has no caching for `node_modules`. Adding `actions/cache` for the npm cache would reduce install time from ~60s to ~5s on cache hits.

---

## 7. Architecture & Design Patterns

### 7.1 Layered Architecture

The frontend follows a strict four-layer architecture:

```
┌─────────────────────────────────────────────────────────┐
│  Layer 4 — Pages                                        │
│  Route-level components. Compose hooks + UI components. │
│  No direct API calls. No business logic.                │
├─────────────────────────────────────────────────────────┤
│  Layer 3 — Domain Hooks                                 │
│  use{Domain}List, use{Domain}Detail, useCreate{Domain}  │
│  Wrap useApiQuery / useApiMutation. Own query keys.     │
├─────────────────────────────────────────────────────────┤
│  Layer 2 — Service Functions                            │
│  services/api/{domain}Service.ts                        │
│  Pure async functions. Call http.ts. Return typed data. │
├─────────────────────────────────────────────────────────┤
│  Layer 1 — HTTP Client                                  │
│  services/http.ts                                       │
│  Fetch wrapper. Auth headers. Token refresh. Errors.    │
└─────────────────────────────────────────────────────────┘
```

This layering is consistently applied across all 7 domain modules. Pages never import from `http.ts` directly; service functions never import from hooks; hooks never render JSX.

### 7.2 Component Patterns

**UI Component Library (`components/UI/`)**

20 components forming an in-house design system. All components:
- Accept `className` prop for style extension
- Use CSS Modules for scoped styles
- Are typed with explicit prop interfaces (no `any`)
- Are exported from a single barrel `components/UI/index.ts`

Key components and their patterns:

| Component | Pattern | Notes |
|---|---|---|
| `Button` | Variant + size props | `variant: primary\|secondary\|danger\|ghost` |
| `DataTable` | Render prop for columns | Client-side sort, server-side pagination — mixed concerns |
| `Modal` | Controlled (open/onClose props) | Uses inline DOM, not `createPortal` |
| `ConfirmDialog` | Wraps Modal | Reused across all domain delete flows |
| `FormField` | Label + input + error wrapper | Exists but not used by domain forms |
| `PasswordInput` | Extends FormField | Show/hide toggle |
| `Pagination` | Controlled | Emits page number; parent owns state |
| `StatusBadge` | Variant-to-color map | Maps domain status strings to CSS classes |
| `Breadcrumbs` | Hardcoded `ROUTE_LABELS` map | Not i18n-aware |
| `TopLoadingBar` | framer-motion AnimatePresence | Triggered by TanStack Query `isFetching` |

**Domain Page Pattern**

Every domain page follows an identical structure:

```
{Domain}Page.tsx
  ├── State: search, page, selectedItem, isModalOpen, isConfirmOpen
  ├── Hooks: use{Domain}List, useCreate{Domain}, useUpdate{Domain}, useDelete{Domain}
  ├── Handlers: handleSubmit, handleEdit, handleDelete, handleConfirmDelete
  └── Render: <DataTable> + <Modal>{Domain}Form</Modal> + <ConfirmDialog>
```

This pattern is repeated 7 times with no shared abstraction. The empty `CrudPage` component directory (`components/UI/CrudPage/`) was intended to house this abstraction but was never implemented.

### 7.3 RBAC Implementation

Access control is implemented at two levels:

**Route level — `ProtectedRoute`**

```
ProtectedRoute
  ├── If not authenticated → redirect to /login
  └── If authenticated → render Outlet
```

`ProtectedRoute` checks authentication only — it does not check roles. Role-based route protection is not implemented at the route level.

**Component level — `PermissionGate`**

```tsx
<PermissionGate permission="press_releases:create">
  <Button>Novo Comunicado</Button>
</PermissionGate>
```

`PermissionGate` reads the current user's role from `AuthContext`, looks up the role's permissions in `config/permissions.ts`, and renders children only if the permission is present. This is the primary RBAC enforcement mechanism in the frontend.

**Permission map (`config/permissions.ts`)**

```typescript
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [...],
  assessor: [...],
  social_media: [...],
  atendente: [...],
  citizen: [...],
};
```

This map is a **duplicate** of the backend's RBAC configuration. There is no shared source of truth — changes to backend permissions must be manually mirrored to the frontend. The `@vsaas/types` package does not include permission definitions.

**Observation:** Frontend RBAC is UI-only. It hides buttons and form fields but does not prevent API calls. All permission enforcement that matters for security happens on the backend. The frontend RBAC is purely a UX concern.

### 7.4 Internationalisation (i18n)

The i18n system is a thin Zustand store wrapping a single JSON locale file:

```typescript
// i18n/index.ts
const useI18nStore = create<I18nStore>(() => ({
  locale: 'pt-BR',
  messages: ptBR,
}));

export const t = (key: string): string =>
  useI18nStore.getState().messages[key] ?? key;
```

`t()` is a **plain function**, not a React hook. It reads from the Zustand store's `getState()` (not `useStore()`), which means:

1. Components calling `t()` do **not** subscribe to locale changes
2. If the locale were ever changed at runtime, components would not re-render
3. Currently this is not a problem because only `pt-BR` is implemented and the locale is hardcoded

**Observation:** The i18n architecture is not ready for multi-locale support. Adding a second locale would require either converting `t()` to a hook (breaking all current call sites) or adding a mechanism to force re-render on locale change. The `Breadcrumbs` component uses a hardcoded `ROUTE_LABELS` map instead of `t()` keys, creating a second source of UI strings.

### 7.5 Auth Guard Patterns

Three guard components protect routes:

| Component | Location | Redirects to | Condition |
|---|---|---|---|
| `ProtectedRoute` | `components/Auth/ProtectedRoute/` | `/login` | Staff not authenticated |
| `ProtectedCitizenRoute` | `components/Auth/ProtectedRoute/` | `/portal/login` | Citizen not authenticated |
| `PermissionGate` | `components/Auth/` | — (renders null) | Missing permission |

Both `ProtectedRoute` and `ProtectedCitizenRoute` show a loading spinner while the respective context is initializing (rehydrating session from the server). This prevents a redirect flash on page reload.

### 7.6 Testability

**Unit tests (Vitest + Testing Library)**

26 test files covering:
- All UI components in `components/UI/` (9 test files)
- Domain hooks (1 test file with 328 LOC — the largest test file)
- Auth context (1 test file)
- Key page components (5 test files)
- `http.ts` service (1 test file)

Test setup (`src/tests/setup.ts`) mocks:
- `window.matchMedia` (not available in jsdom)
- `IntersectionObserver`
- Sets `document.documentElement.lang = 'pt-BR'`

**Observations:**
- Domain page components (7 pages) have only 1 test file between them — `CitizenPortalPage.test.tsx`. The other 6 domain pages have no tests.
- `useSessionTimeout` has no test.
- `useHealthCheck` has no test.
- `CitizenAuthContext` has no test.

**E2E tests (Cypress)**

2 spec files:
- `auth.cy.ts` — login, logout, session persistence
- `press-releases.cy.ts` — CRUD flow for the press releases module

No E2E coverage for citizen portal flows, other domain modules, or error states.

---

## 8. Initial High-Level Recommendations

The following recommendations are ordered by impact-to-effort ratio. They are not prescriptive — each should be evaluated against current priorities before scheduling.

### 8.1 Critical (address before next feature sprint)

**R1 — Implement `CrudPage` abstraction**  
The 7 domain pages share ~400 LOC of identical CRUD scaffolding (DataTable + Modal + ConfirmDialog + state management). The `CrudPage` directory already exists as a placeholder. Implementing this abstraction would reduce domain page code by ~70% and make adding new modules trivial. Estimated effort: 2 days.

**R2 — Move permission definitions to `@vsaas/types`**  
`config/permissions.ts` duplicates the backend RBAC map. Moving the canonical permission definitions to the shared `@vsaas/types` package eliminates the risk of frontend/backend drift. The frontend would import from `@vsaas/types` instead of maintaining its own copy. Estimated effort: 0.5 days.

**R3 — Fix Google Fonts loading**  
Replace the render-blocking `@import url(...)` in `global.css` with `<link rel="preconnect">` + `<link rel="stylesheet">` in `index.html`, or self-host the Inter font. This is a Lighthouse performance issue that affects First Contentful Paint. Estimated effort: 1 hour.

### 8.2 High (address within 2 sprints)

**R4 — Migrate `useHealthCheck` to TanStack Query `refetchInterval`**  
Replace the raw `setInterval` in `useHealthCheck` with TanStack Query's `refetchInterval` option. This automatically pauses polling when the tab is hidden (`refetchIntervalInBackground: false`), reducing unnecessary network requests. Estimated effort: 30 minutes.

**R5 — Scope production source maps**  
Change `build.sourcemap: true` to `build.sourcemap: 'hidden'` in `vite.config.ts`. This generates source maps for error tracking tools without exposing them publicly. Estimated effort: 5 minutes.

**R6 — Add `VITE_APP_ENV` environment variable**  
Introduce a `VITE_APP_ENV` variable (`development` | `staging` | `production`) to allow environment-aware frontend behaviour (environment banners, feature flags, analytics toggling). Estimated effort: 2 hours.

**R7 — Add CI `node_modules` caching**  
Add `actions/cache` for the npm cache in `ci.yml`. Reduces CI install time from ~60s to ~5s on cache hits. Estimated effort: 15 minutes.

### 8.3 Medium (address within 1 quarter)

**R8 — Implement dark mode or remove the toggle**  
`ThemeToggle` is a no-op — it calls `toggleTheme()` in `uiStore` which updates state but the CSS custom properties for dark mode are not defined. Either implement the dark mode token set in `tokens/index.css` or remove `ThemeToggle` from the UI to avoid user confusion. Estimated effort: 1 day (implement) or 1 hour (remove).

**R9 — Adopt `FormField` component in domain forms**  
Domain forms use raw `<label>/<input>` elements instead of the `FormField` UI component. Migrating to `FormField` would standardize form layout, error display, and accessibility attributes across all domain forms. Estimated effort: 1 day.

**R10 — Add per-layout Suspense boundaries**  
Replace the single top-level `<Suspense>` with per-layout boundaries so that lazy route transitions show a scoped loading indicator rather than a full-page spinner. Estimated effort: 2 hours.

**R11 — Upgrade ESLint to v9**  
ESLint v8 is in maintenance mode (EOL October 2024). Migrate `.eslintrc.json` to `eslint.config.js` flat config format. The `@typescript-eslint` packages already support v9. This is tracked as P3-5. Estimated effort: 1 day.

### 8.4 Low (backlog)

**R12 — Replace `framer-motion` with CSS animations on landing page**  
The 4 landing page section components use `framer-motion` for fade-in/slide-up animations that are achievable with CSS `@keyframes` + `animation`. Removing `framer-motion` from the landing page would eliminate the `motion` chunk (~100KB gzipped) for users who never visit the staff dashboard. `TopLoadingBar` would need a CSS-based replacement. Estimated effort: 1 day.

**R13 — Upgrade `react-icons` to v5**  
`react-icons` v4 is superseded by v5. The upgrade is largely mechanical — the import paths change but the component API is the same. The custom `Icon.tsx` wrapper means only one file needs updating. Estimated effort: 2 hours.

**R14 — Prepare i18n for multi-locale support**  
Convert `t()` from a plain function to a React hook (`useT()`), or use a proper i18n library (e.g., `react-i18next`). This is only necessary if a second locale is planned. If the application will remain Portuguese-only, the current approach is acceptable. Estimated effort: 1 day (hook conversion) or 2 days (library migration).

**R15 — Add `ProtectedRoute` role-checking**  
Currently `ProtectedRoute` checks authentication only. Adding an optional `requiredRole` prop would allow route-level role enforcement in addition to the component-level `PermissionGate`. This is a defence-in-depth measure — the backend enforces all real access control. Estimated effort: 2 hours.

---

## 9. Summary Table

| # | Recommendation | Priority | Effort | Impact |
|---|---|---|---|---|
| R1 | Implement `CrudPage` abstraction | Critical | 2 days | High — eliminates ~400 LOC duplication |
| R2 | Move permissions to `@vsaas/types` | Critical | 0.5 days | High — eliminates RBAC drift risk |
| R3 | Fix Google Fonts loading | Critical | 1 hour | Medium — FCP improvement |
| R4 | `useHealthCheck` → TanStack Query | High | 30 min | Low — reduces background requests |
| R5 | Scope production source maps | High | 5 min | Medium — security posture |
| R6 | Add `VITE_APP_ENV` | High | 2 hours | Medium — enables env-aware behaviour |
| R7 | CI `node_modules` caching | High | 15 min | Low — faster CI |
| R8 | Implement or remove dark mode | Medium | 1h–1d | Medium — UX clarity |
| R9 | Adopt `FormField` in domain forms | Medium | 1 day | Medium — consistency + a11y |
| R10 | Per-layout Suspense boundaries | Medium | 2 hours | Low — UX polish |
| R11 | ESLint v9 upgrade | Medium | 1 day | Low — tooling hygiene |
| R12 | Replace framer-motion on landing | Low | 1 day | Low — bundle size |
| R13 | Upgrade react-icons to v5 | Low | 2 hours | Low — dependency hygiene |
| R14 | Prepare i18n for multi-locale | Low | 1–2 days | Low (if PT-only) |
| R15 | Role-checking in `ProtectedRoute` | Low | 2 hours | Low — defence in depth |
