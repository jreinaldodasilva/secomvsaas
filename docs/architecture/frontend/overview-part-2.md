# Secom Frontend — Architecture Overview
## Part 2: Bootstrap Lifecycle, Build Configuration, Design Patterns & Recommendations

**Document version:** 1.2  
**Codebase snapshot:** post-commit `7972600`  
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

**Note:** Provider ordering is structurally enforced via the `AppProviders` composition component. A dev-only invariant in `TenantProvider` throws if mounted without `AuthProvider` above it. The ordering comment has been removed (FE-P0-01).

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

**Note:** Each of the 20+ lazy routes has its own `<Suspense fallback={<LoadingScreen />}>` boundary scoped to the route element. The single top-level boundary and `LazyFallback` component have been removed (FE-P1-04).

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

**Note:** `useHealthCheck` was migrated to TanStack Query `refetchInterval: 30_000, refetchIntervalInBackground: false`. The `setInterval` has been removed. Polling automatically pauses when the tab is hidden (FE-P2-01).

---

## 6. Build & Environment Configuration

### 6.1 Environment Variables

The application uses a single environment variable:

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_API_URL` | ✅ Yes | — | Base URL for all API requests |
| `VITE_APP_ENV` | ✅ Yes | `development` | Environment identifier (`development` \| `staging` \| `production`) |

`config/env.ts` validates this at module load:

```typescript
if (!import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL is not defined');
}
export const ENV = {
  API_URL: import.meta.env.VITE_API_URL,
  APP_ENV: import.meta.env.VITE_APP_ENV ?? 'development',
};
```

`APP_ENV` enables environment-aware frontend behaviour (environment banners, feature flags, analytics toggling) (FE-P2-03).

### 6.2 Vite Configuration

Key `vite.config.ts` settings:

| Setting | Value | Purpose |
|---|---|---|
| `plugins` | `[@vitejs/plugin-react]` | Babel-based React transform (Fast Refresh) |
| `server.proxy` | `/api → localhost:5000` | Dev proxy; avoids CORS in development |
| `resolve.alias` | `@/* → src/*`, `@vsaas/types` | Path aliases (mirrored from `tsconfig.json`) |
| `build.sourcemap` | `'hidden'` | Source maps generated but not referenced in bundle (FE-P0-02) |
| `build.rollupOptions.output.manualChunks` | vendor, query, motion, icons | Explicit chunk splitting (see §4.4) |
| `test.environment` | `jsdom` | Vitest DOM environment |
| `test.setupFiles` | `src/tests/setup.ts` | Global test setup |
| `test.globals` | `true` | `describe`/`it`/`expect` without imports |

**Note:** `build.sourcemap: 'hidden'` generates source maps for error tracking tools without exposing them publicly (FE-P0-02).

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

**Note:** `actions/setup-node@v4` with `cache: 'npm'` is present in `ci.yml`. CI install time is ~5s on cache hits (FE-P2-08).

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
| `DataTable` | Render prop for columns | `clientSort?: boolean` prop (default `false`); when `false`, `onSortChange(key, dir)` called for server-side handling (FE-P2-09) |
| `Modal` | Controlled (open/onClose props) | Uses `createPortal` targeting `document.body` (FE-P2-07) |
| `ConfirmDialog` | Wraps Modal | Reused across all domain delete flows |
| `FormField` | Label + input + error wrapper | Adopted by all 7 domain forms (FE-P2-06) |
| `PasswordInput` | Extends FormField | Show/hide toggle |
| `Pagination` | Controlled | Emits page number; parent owns state |
| `StatusBadge` | Variant-to-color map | Maps domain status strings to CSS classes |
| `Breadcrumbs` | i18n-aware via `t('breadcrumbs.{seg}')` | `ROUTE_LABELS` map deleted; keys in `pt-BR.json` (FE-P2-05) |
| `TopLoadingBar` | framer-motion AnimatePresence | Triggered by TanStack Query `isFetching` |

**Domain Page Pattern**

Every domain page uses the `CrudPage` generic abstraction (FE-P1-01):

```
{Domain}Page.tsx
  └── <CrudPage
        columns, hooks (use{Domain}List, useCreate, useUpdate, useDelete)
        FormComponent={Domain}Form
        title, searchPlaceholder
      />
```

The `CrudPage` component owns all state (search, page, selectedItem, isModalOpen, isConfirmOpen), all handlers (handleSubmit, handleEdit, handleDelete, handleConfirmDelete), and renders DataTable + Modal + ConfirmDialog. Domain pages are now thin configuration wrappers. The empty `CrudPage` placeholder has been replaced with a full implementation.

### 7.3 RBAC Implementation

Access control is implemented at two levels:

**Route level — `ProtectedRoute`**

```
ProtectedRoute
  ├── If not authenticated → redirect to /login
  ├── If allowedRoles provided and role not in list → redirect to /unauthorized
  └── If authenticated + authorized → render Outlet
```

`ProtectedRoute` accepts an optional `allowedRoles` prop. The outer dashboard route uses `allowedRoles={STAFF_ROLES}`, redirecting `citizen` role users to `/unauthorized` (FE-P1-05). `STAFF_ROLES` is defined in `@vsaas/types`.

**Component level — `PermissionGate`**

```tsx
<PermissionGate permission="press_releases:create">
  <Button>Novo Comunicado</Button>
</PermissionGate>
```

`PermissionGate` reads the current user's role from `AuthContext`, looks up the role's permissions in `config/permissions.ts`, and renders children only if the permission is present. This is the primary RBAC enforcement mechanism in the frontend.

**Permission map**

`PERMISSIONS`, `ROLE_PERMISSIONS`, and helper functions are defined in `@vsaas/types` — the shared package consumed by both frontend and backend. `src/config/permissions.ts` has been deleted. There is a single canonical source of truth for RBAC definitions (FE-P0-03).

**Observation:** Frontend RBAC is UI-only. It hides buttons and form fields but does not prevent API calls. All permission enforcement that matters for security happens on the backend. The frontend RBAC is purely a UX concern.

### 7.4 Internationalisation (i18n)

The i18n system is a thin Zustand store wrapping a single JSON locale file:

```typescript
// i18n/index.ts
const useI18nStore = create<I18nStore>(() => ({
  locale: 'pt-BR',
  messages: ptBR,
}));

// Standalone function — for non-component use (validators, services)
export const t = (key: string): string =>
  useI18nStore.getState().messages[key] ?? key;

// Hook — returns locale-bound callbacks; components re-render on locale change
export const useTranslation = () => {
  const locale = useI18nStore(s => s.locale);
  const messages = useI18nStore(s => s.messages);
  const t = useCallback((key: string) => messages[key] ?? key, [locale]);
  const tArray = useCallback((key: string) => messages[key] ?? [], [locale]);
  return { t, tArray };
};
```

`useTranslation` returns locale-bound `t`/`tArray` callbacks via `useCallback([locale])`. Components re-render on locale change. Standalone `t()`/`tArray()` are retained for non-component use (validators, services) (FE-P3-03).

`Breadcrumbs` now calls `t('breadcrumbs.{seg}')` — the hardcoded `ROUTE_LABELS` map has been deleted. All 21 route keys are in `pt-BR.json` under the `breadcrumbs.*` namespace (FE-P2-05).

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

35 test files covering:
- All UI components in `components/UI/` (9 test files)
- Domain hooks (1 test file)
- All 7 domain page components (7 test files — 4 tests each: render, empty state, rows, create modal)
- `CitizenAuthContext` (7 tests: mount, me() failure, login, register, logout, logout-on-error, throws outside provider)
- Auth context (1 test file)
- Key page components (5 test files)
- `http.ts` service (1 test file)
- Domain validators (1 test file)

Test setup (`src/tests/setup.ts`) mocks:
- `window.matchMedia` (not available in jsdom)
- `IntersectionObserver`
- Sets `document.documentElement.lang = 'pt-BR'`

**Note:** 258 tests across 35 files. All domain pages, `CitizenAuthContext`, HTTP layer, and domain validators covered. `tsc --noEmit` clean. `vite build` succeeds. 0 lint errors (FE-P3-05).

**E2E tests (Cypress)**

2 spec files:
- `auth.cy.ts` — login, logout, session persistence
- `press-releases.cy.ts` — CRUD flow for the press releases module

No E2E coverage for citizen portal flows, other domain modules, or error states.

---

## 8. Recommendations Status

All recommendations from the initial assessment have been addressed. The table below records the outcome of each.

| # | Recommendation | Effort | Outcome |
|---|---|---|---|
| R1 | Implement `CrudPage` abstraction | 2d | ✅ Done — FE-P1-01 |
| R2 | Move permissions to `@vsaas/types` | 0.5d | ✅ Done — FE-P0-03 |
| R3 | Fix Google Fonts loading | 1h | ✅ Done — FE-P2-04 (QW-3) |
| R4 | `useHealthCheck` → TanStack Query | 30min | ✅ Done — FE-P2-01 (QW-5) |
| R5 | Scope production source maps | 5min | ✅ Done — FE-P0-02 (QW-1) |
| R6 | Add `VITE_APP_ENV` | 2h | ✅ Done — FE-P2-03 (QW-4) |
| R7 | CI `node_modules` caching | 15min | ✅ Done — FE-P2-08 (QW-2, already present) |
| R8 | Implement or remove dark mode | 1h–1d | ✅ Done — removed (FE-P3-04, QW-8) |
| R9 | Adopt `FormField` in domain forms | 1d | ✅ Done — FE-P2-06 |
| R10 | Per-layout Suspense boundaries | 2h | ✅ Done — FE-P1-04 |
| R11 | ESLint v9 upgrade | 1d | ✅ Done — FE-P1-06 |
| R12 | Replace `framer-motion` on landing | 1d | 🔴 Skipped by decision — FE-P3-01 |
| R13 | Upgrade `react-icons` to v5 | 2h | ✅ Done — FE-P3-02 |
| R14 | Prepare i18n for multi-locale | 1–2d | ✅ Done — FE-P3-03 |
| R15 | Role-checking in `ProtectedRoute` | 2h | ✅ Done — FE-P1-05 |

**Additional improvements delivered beyond original recommendations:**

| Item | Outcome |
|---|---|
| Extract `services/base/` + `services/interceptors/` | ✅ Done — FE-P1-03 |
| Extract form validation to `src/validation/domain/` | ✅ Done — FE-P1-07 |
| Migrate `TenantContext` to TanStack Query | ✅ Done — FE-P1-02 |
| Adopt `@/` path alias across all imports | ✅ Done — FE-P2-02 |
| Wire `Breadcrumbs` to i18n `t()` | ✅ Done — FE-P2-05 |
| `Modal` → `createPortal` | ✅ Done — FE-P2-07 |
| `DataTable` explicit sort scope via `clientSort` prop | ✅ Done — FE-P2-09 |
| Barrel exports for `contexts/`, `hooks/`, `services/api/`, `layouts/` | ✅ Done — FE-P3-06 |
| Domain page + `CitizenAuthContext` test coverage | ✅ Done — FE-P3-05 |

---

## 9. Summary

| Metric | Value |
|---|---|
| Architecture maturity score | **83 / 100 — Advanced** |
| Tests | 258 passing across 35 files |
| Lint errors | 0 (65 pre-existing warnings) |
| TypeScript | `tsc --noEmit` clean |
| Build | `vite build` succeeds |
| Open roadmap items | 1 (FE-P3-01 — skipped by decision) |
| Remaining architectural debt | `framer-motion` bundle (~100KB gzipped) + frontend observability (out of scope) |
