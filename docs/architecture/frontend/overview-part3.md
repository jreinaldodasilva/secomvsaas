# Secom Frontend — Architecture Overview
## Part 3: Architecture & Design Patterns, Secom-Specific Patterns, Recommendations

---

## 7. Architecture & Design Patterns

### 7.1 Overall Architecture Style

The frontend follows a **layered + feature-based hybrid** architecture:

- **Layered** at the infrastructure level: HTTP client → service layer → React Query hooks → page components.
- **Feature-based** at the page level: each domain module is self-contained under `src/pages/Domain/<Module>/`.
- **Component-driven** at the UI level: a design system of primitives in `src/components/UI/` is consumed by all pages.

There is no Feature-Sliced Design (FSD) or similar formal architecture. The structure is pragmatic and well-suited to the current scale.

### 7.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (CSR)                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    React Application                     │   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │  Auth Layer │  │ Tenant Layer │  │  UI State      │  │   │
│  │  │ AuthContext │  │TenantContext │  │  uiStore       │  │   │
│  │  │CitizenAuth  │  │(React Query) │  │  toastStore    │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │                   Route Layer                      │  │   │
│  │  │  PublicLayout │ DashboardLayout │ CitizenPortal    │  │   │
│  │  │  ProtectedRoute (STAFF_ROLES + rolesWithPermission)│  │   │
│  │  │  ProtectedCitizenRoute                             │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │                  Page Layer                        │  │   │
│  │  │  Domain Pages (7 modules) │ Admin │ CitizenPortal  │  │   │
│  │  │  All domain pages → CrudPage<TItem, TForm>         │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │               Server State Layer                   │  │   │
│  │  │  useApiQuery / useApiMutation (TanStack Query v5)  │  │   │
│  │  │  Per-domain hooks: usePressRelease, useEvent, ...  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │                  HTTP Layer                        │  │   │
│  │  │  http.ts → withRefreshInterceptor → baseRequest    │  │   │
│  │  │  CSRF token management │ JWT refresh (401 retry)   │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │ fetch (httpOnly cookies)
                              ▼
                    ┌──────────────────┐
                    │  Express API     │
                    │  localhost:5000  │
                    └──────────────────┘
```

### 7.3 Design Patterns in Use

#### Container / Presenter (implicit)

Domain pages act as containers: they own state, wire hooks, and define column configurations. `CrudPage` acts as a presenter: it receives all data and callbacks as props and renders the UI. The `FormComponent` prop further separates form rendering from form orchestration.

#### Generic Abstraction — `CrudPage<TItem, TForm>`

The most significant architectural pattern in the codebase. `CrudPage` is a fully generic component that encapsulates:
- Modal open/close state
- Form state (`useState<TForm>`)
- Validation dispatch
- Create/update/delete mutation callbacks
- Delete confirmation dialog

Domain pages pass typed props (`emptyForm`, `toFormState`, `validate`, `buildPayload`, `FormComponent`) to customize behavior. This eliminates ~80% of boilerplate across the seven domain modules.

**Trade-off:** `CrudPage` is a large, opinionated abstraction. Pages with non-standard workflows (e.g., multi-step forms, approval flows, bulk actions) cannot use it without modification or workarounds. The `AppointmentsPage` already shows a workaround: it uses `formExtraProps` and a `useRef` to pass `editStatus` state into the form component, bypassing `CrudPage`'s form state management.

#### Custom Hooks as Service Adapters

`useApiQuery` and `useApiMutation` are thin wrappers over TanStack Query that inject the `http` client as the query/mutation function. Domain hooks (`usePressRelease`, `useEvent`, etc.) compose these primitives with domain-specific query keys and invalidation logic. This creates a clean three-layer hook hierarchy:

```
TanStack Query (useQuery / useMutation)
    └── useApiQuery / useApiMutation  (http client injection)
            └── usePressReleaseList / useCreatePressRelease  (domain keys + paths)
```

#### Compound Component (partial)

`FormField` wraps a label, help text, error message, and the input child via `children`. This is a lightweight compound component pattern that keeps form markup clean.

#### Singleton Stores (Zustand)

`uiStore` and `toastStore` are module-level singletons created with `create()`. They are not provided via React Context, which means they are accessible anywhere without prop drilling but also cannot be reset between tests without explicit cleanup.

### 7.4 Separation of Concerns

| Concern | Location | Assessment |
|---|---|---|
| UI rendering | `src/components/UI/`, `src/pages/` | ✅ Clean |
| Business logic | `src/validation/domain/` (validation), `src/hooks/` (data) | ✅ Separated from UI |
| Data fetching | `src/hooks/` (React Query), `src/services/` (HTTP) | ✅ Clean layering |
| Auth state | `src/contexts/AuthContext.tsx` | ✅ Isolated |
| Tenant state | `src/contexts/TenantContext.tsx` | ✅ Isolated |
| UI state | `src/store/uiStore.ts` | ✅ Minimal, focused |
| Routing | `src/routes/index.tsx` | ✅ Single file, all routes visible |
| i18n | `src/i18n/index.ts` | 🟨 See §8.3 |
| Styling | `src/styles/` + `*.module.css` | ✅ Token-based, scoped |

### 7.5 Error Handling

| Layer | Mechanism |
|---|---|
| Render errors | `ErrorBoundary` (class component) at app root and inside each layout `<main>` |
| API errors | `ApiError` class with typed status codes; thrown by `baseRequest` |
| Query errors | TanStack Query surfaces `error` in hook return values; pages do not consistently handle `isError` states |
| Mutation errors | `onError` callbacks in `CrudPage` call `toast.error(err.message)` |
| Auth errors (401) | `withRefreshInterceptor` attempts token refresh; on failure, re-throws the 401 |
| Network errors | `ConnectionBanner` polls health endpoint; shows banner on failure |

**Gap:** Domain list pages (`usePressReleaseList`, etc.) do not render an error state when `isError` is true — they silently show an empty table. Only the `ConnectionBanner` provides a global signal of API unavailability.

### 7.6 Loading States

| Pattern | Usage |
|---|---|
| `LoadingScreen` (full-page spinner) | Route-level Suspense fallback; `ProtectedRoute` while auth initializes |
| `TableSkeleton` | `DataTable` renders skeleton rows while `isLoading` is true |
| `Skeleton` component | Used in `DashboardPage` stat cards |
| `Button isLoading` prop | Submit buttons show spinner and disable during pending mutations |
| `TopLoadingBar` | Global indicator for any active React Query fetch or navigation |

Loading states are well-covered at the component level. The combination of `TopLoadingBar` (global) + `TableSkeleton` (local) + `Button isLoading` (action) provides good user feedback.

### 7.7 Testability

| Aspect | Assessment |
|---|---|
| Component isolation | Components accept props cleanly; no hidden global dependencies in most cases |
| Context mocking | Tests wrap components in `AuthProvider` / `QueryClientProvider` as needed |
| Store isolation | Zustand stores are module singletons — require `vi.mock` or manual reset between tests |
| HTTP mocking | `vi.mock('@/services/http')` pattern used in domain hook tests |
| Test co-location | Tests live next to the component they test — easy to find |
| Coverage | 41 test files for 173 source files (~24% file coverage). No coverage threshold enforced in CI. |

---

## 8. Secom-Specific Patterns

### 8.1 Role-Based UI

The RBAC system has three layers:

**Layer 1 — Route-level enforcement (`ProtectedRoute`)**

```tsx
// Outer guard: any staff role can enter the dashboard shell
<ProtectedRoute allowedRoles={STAFF_ROLES}>
  <DashboardLayout />
</ProtectedRoute>

// Inner guard: only roles with the specific permission can access the page
<ProtectedRoute allowedRoles={rolesWithPermission('press-releases:read')}>
  <PressReleasesPage />
</ProtectedRoute>
```

`rolesWithPermission(permission)` is a pure function from `@vsaas/types` that derives the allowed role list from the `ROLE_PERMISSIONS` map at call time. This means permission-to-role mappings are defined once (in `packages/types`) and consumed by both the frontend route guards and the backend middleware.

**Layer 2 — Navigation-level enforcement (`PermissionGate`)**

```tsx
<PermissionGate permissions={['press-releases:read']}>
  <NavLink to="/press-releases">Comunicados</NavLink>
</PermissionGate>
```

`PermissionGate` uses `hasAnyPermission(user.role, permissions)` to conditionally render navigation items. A user who lacks `press-releases:read` will not see the "Comunicados" link in the sidebar. This is a UI convenience — the route guard is the authoritative enforcement.

**Layer 3 — Inline conditional rendering**

Used in `UsersPage` to hide the role-change dropdown for the current user:
```tsx
{u.id === currentUser?.id ? <StatusBadge status={u.role} /> : <select ...>}
```

**Role permission matrix (from `@vsaas/types`):**

| Permission | super_admin | admin | assessor | social_media | atendente | citizen |
|---|---|---|---|---|---|---|
| press-releases:read | ✅ | ✅ | ✅ | ✅ | — | — |
| press-releases:write | ✅ | ✅ | ✅ | — | — | — |
| media-contacts:read | ✅ | ✅ | ✅ | — | — | — |
| clippings:read | ✅ | ✅ | ✅ | ✅ | — | — |
| events:read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| appointments:read | ✅ | ✅ | — | — | ✅ | ✅ |
| citizen-portal:read | ✅ | ✅ | — | — | ✅ | ✅ |
| social-media:read | ✅ | ✅ | — | ✅ | — | — |
| users:read | ✅ | ✅ | — | — | — | — |

**Observation:** The `citizen` role has `appointments:read` and `citizen-portal:read` permissions in `ROLE_PERMISSIONS`, but citizens are excluded from `STAFF_ROLES` and therefore cannot access the staff dashboard. These permissions are relevant only to the backend API authorization for citizen-facing endpoints, not to the frontend route guards.

### 8.2 Module Organization

All seven Secom domain modules follow an identical structural pattern:

```
src/pages/Domain/<Module>/
├── <Module>Page.tsx        # CrudPage consumer: columns, hooks, callbacks
├── <Module>Form.tsx        # FormComponent: controlled inputs, re-exports validation
└── <Module>Page.test.tsx   # Vitest tests

src/hooks/use<Module>.ts    # useXxxList, useXxxDetail, useCreateXxx, useUpdateXxx, useDeleteXxx
src/services/api/<module>Service.ts  # list, getById, create, update, remove
src/validation/domain/<module>.ts    # FormState, emptyForm, validate, constants
```

This uniformity means adding a new module requires creating files in four locations following established patterns. The `packages/cli/` directory contains a module generator (`generate-module.ts`) that automates this scaffolding.

### 8.3 i18n Implementation

The i18n system is custom-built using Zustand:

```typescript
// Standalone function — reads locale from Zustand store state directly
export function t(key: string, params?): string { ... }

// React hook — reactive to locale changes
export function useTranslation(): { t, tArray, locale, setLocale }
```

**Critical observation:** The standalone `t()` function calls `useI18nStore.getState()` directly (not via a hook). This means it can be called outside React components (e.g., in validation functions). However, it is **not reactive** — if the locale changes, components using `t()` directly (not `useTranslation().t`) will not re-render.

In practice this is not a current problem because `SUPPORTED_LOCALES = ['pt-BR']` — there is only one locale and locale switching is not exposed in the UI. However, if a second locale (e.g., `en`) is added, components using the standalone `t()` will not update on locale change.

`ProtectedRoute` uses the standalone `t('common.loading')` — this is a concrete example of the reactive gap.

Only `pt-BR` locale is implemented. The `en.json` file exists but is empty.

### 8.4 Form Workflows

All domain module forms follow the same pattern:

1. `CrudPage` owns `form: TForm` state and `errors: Record<string, string>` state.
2. On submit, `CrudPage` calls `validate(form, editing)` — if errors exist, sets them and stops.
3. If valid, calls `buildPayload(form, editing)` to transform form state to API payload.
4. Calls `onCreate` or `onUpdate` with the payload and `{ onSuccess, onError }` callbacks.
5. On success, closes the modal and shows a toast.

**Form state is always a flat string/boolean record** — no nested objects, no arrays (tags are comma-separated strings that `buildPayload` splits). This simplifies the generic `CrudPage` but limits form complexity.

**Validation is synchronous and imperative.** There is no async validation (e.g., checking email uniqueness). Error messages are constructed by concatenating the field label with a hardcoded Portuguese suffix (e.g., `t('domain.pressReleases.fields.title') + ' — mín. 5 caracteres'`). This mixes i18n keys with hardcoded strings.

**The `AppointmentsPage` workaround** is the most notable deviation from the standard pattern. Because `CrudPage` does not expose the current item's `status` field to the form (it is not part of `AppointmentFormState`), the page uses a `useRef` + `formExtraProps` to pass `editStatus` and `setEditStatus` into `AppointmentForm`. This is a sign that `CrudPage`'s abstraction is reaching its limits for workflows that need to track state outside the form fields.

### 8.5 Citizen Portal Separation

The citizen portal is architecturally separated from the staff dashboard at three levels:

| Level | Staff | Citizen |
|---|---|---|
| Auth context | `AuthContext` (user + role) | `CitizenAuthContext` (citizen) |
| Route guard | `ProtectedRoute` (checks `user.role`) | `ProtectedCitizenRoute` (checks `citizen`) |
| Layout | `DashboardLayout` (sidebar nav, session timeout) | `CitizenPortalLayout` (public header, footer) |
| URL namespace | `/admin/*`, `/press-releases`, etc. | `/portal/*` |
| API endpoints | `/api/v1/auth/*` | `/api/v1/citizen-auth/*` |

The two auth contexts are completely independent — a staff user and a citizen can theoretically be "logged in" simultaneously in the same browser session (different httpOnly cookies). This is an edge case with no current UI handling.

`CitizenDashboardPage` contains a hardcoded quick link to `/appointments` (the staff route), which would redirect a citizen to the staff login page. This is a 🟧 functional bug.

### 8.6 React Query Configuration

Global `QueryClient` defaults (`src/config/queryClient.ts`):

| Setting | Value | Rationale |
|---|---|---|
| `staleTime` | 5 minutes | Data is considered fresh for 5 minutes; no refetch on window focus within this window |
| `gcTime` | 10 minutes | Inactive query cache is garbage-collected after 10 minutes |
| `networkMode` | `offlineFirst` | Queries run even when the browser reports offline; relies on `ConnectionBanner` for user feedback |
| `retry` | Custom function | No retry on 401/403; up to 2 retries on other errors |
| Mutations `networkMode` | `offlineFirst` | Mutations also run offline-first |

**Query key strategy:** Domain hooks use simple string arrays as keys:
- List: `['press-releases']`
- Detail: `['press-releases', id]`

On mutation success, `invalidateKeys: [['press-releases']]` invalidates the list query. Detail queries are not invalidated on update — a stale detail view is possible if a user opens a detail and another user updates the same record.

**`networkMode: 'offlineFirst'`** means queries will attempt to run even when `navigator.onLine` is false. Combined with the `ConnectionBanner` health check, this provides a reasonable offline experience, but mutations submitted while offline will fail with a network error (not queued for retry).

---

## 9. Initial High-Level Recommendations

### 🟥 Critical

None identified. No security vulnerabilities, data integrity risks, or availability issues were found in the observable frontend code.

### 🟧 High

**H1 — Fix the citizen dashboard broken link**
`CitizenDashboardPage` links to `/appointments` (staff route). Citizens clicking this link are redirected to the staff login page. The link should point to a citizen-appropriate appointments view or be removed.

**H2 — Remove `react-hot-toast` from production dependencies**
The package is never imported. It should be removed from `package.json` to eliminate dead dependency surface and potential bundle inclusion.

**H3 — Enforce test coverage thresholds in CI**
There is no coverage gate. Adding a minimum threshold (e.g., 60% line coverage) to the CI pipeline would prevent coverage regression as the codebase grows.

### 🟨 Medium

**M1 — Rename the citizen portal page directories to eliminate ambiguity**
`src/pages/Domain/CitizenPortal/` (staff view) and `src/pages/CitizenPortal/` (citizen view) are confusingly named. Consider renaming to `src/pages/Domain/CitizenRecords/` for the staff view to make the distinction explicit.

**M2 — Replace `framer-motion` with a CSS animation for `TopLoadingBar`**
`framer-motion` (~100KB gzipped) is used only for a simple progress bar animation. A CSS `@keyframes` animation would achieve the same result with zero bundle cost.

**M3 — Address the non-reactive standalone `t()` function**
The standalone `t()` function is not reactive to locale changes. If multi-locale support is ever added, components using `t()` directly (including `ProtectedRoute`) will not re-render on locale change. Standardize on `useTranslation().t` inside components.

**M4 — Add error state rendering to domain list pages**
When `isError` is true on a list query, pages silently show an empty table. An explicit error state (e.g., an `EmptyState` with a retry button) would improve user experience and debuggability.

**M5 — Add the `authentication.cy.ts` Cypress spec to CI**
The spec exists but is excluded from the CI `--spec` filter. Authentication flows are critical and should be covered in CI.

**M6 — Introduce a schema validation library for forms**
The current imperative validation functions are difficult to compose and test. A library like Zod would enable type-safe schema definitions, reuse between frontend and backend, and automatic TypeScript type inference from schemas.

### 🟩 Low

**L1 — Remove the empty `src/types/` directory**
The directory is misleading — all types live in `packages/types`. Remove it or add a README explaining the type organization.

**L2 — Extract inline SVG icons from `DashboardPage`**
Seven SVG icon components are defined inline at the top of `DashboardPage.tsx`. Moving them to `src/components/UI/Icon/` would reduce file size and enable reuse.

**L3 — Add an error monitoring integration**
`ErrorBoundary` currently logs to `console.error` only. Integrating an error monitoring service (e.g., Sentry) would provide visibility into production errors.

**L4 — Centralize date formatting**
`new Date().toLocaleDateString('pt-BR')` and `toLocaleString('pt-BR')` are scattered across multiple page components. A shared `formatDate` / `formatDateTime` utility would ensure consistency and simplify future timezone handling.

**L5 — Consider `CrudPage` extensibility for approval workflows**
The press release module has a multi-status workflow (`draft → review → approved → published → archived`) that is currently managed via a simple `<select>` in the edit form. As approval workflows become more complex (e.g., requiring a separate "approve" action with audit trail), `CrudPage`'s single-modal pattern may need to be extended or bypassed.

**L6 — Add `@tanstack/react-query-devtools` conditional rendering**
The devtools package is installed but not rendered anywhere in the application. Adding it conditionally in development (`ENV.IS_DEV`) would improve developer experience during debugging.

---

## Appendix: Module Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        @vsaas/types (packages/types)                │
│  UserRole, STAFF_ROLES, ROLE_PERMISSIONS, rolesWithPermission()     │
│  Domain types: PressRelease, Event, Appointment, ...                │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ imported by
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   src/contexts/        src/routes/          src/services/api/
   AuthContext          index.tsx            pressReleaseService
   TenantContext        (ProtectedRoute      mediaContactService
                         allowedRoles)       ...
          │                                        │
          ▼                                        ▼
   src/hooks/                              src/services/http.ts
   usePressRelease ──────────────────────► useApiQuery/Mutation
   useEvent                                        │
   useAppointment                                  ▼
   ...                                    src/services/interceptors/
          │                               withRefreshInterceptor
          ▼                               (CSRF + JWT refresh)
   src/pages/Domain/
   PressReleasesPage ──► CrudPage<TItem, TForm>
   EventsPage                    │
   AppointmentsPage              ▼
   ...                    src/components/UI/
                          DataTable, Modal, FormField,
                          Button, StatusBadge, ...
```
