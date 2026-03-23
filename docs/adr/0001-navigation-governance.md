# ADR-0001 — Navigation & Routing Governance

**Status:** Accepted  
**Date:** 2025  
**Scope:** `src/routes/`, `src/contexts/`, `src/components/Auth/`, `src/layouts/`, `src/providers/`

---

## Context

The Secom vSaaS frontend serves two independent user populations over a single React application:

- **Staff users** (`admin`, `assessor`, `social_media`, `atendente`, `super_admin`) — access the management dashboard at `/admin/*`, `/settings/*`, and domain module routes.
- **Citizen users** (`citizen`) — access the public-facing portal at `/portal/*`.

These populations authenticate against separate backend endpoints, carry separate session cookies, and have no overlapping route access. The application must enforce this separation at the routing layer without requiring a page reload or separate deployment.

Over the course of the navigation improvement roadmap (P0–P3), a set of patterns emerged as the canonical approach for guards, redirects, session management, and URL conventions. This ADR records those decisions so contributors can apply them consistently without re-deriving them from the codebase.

---

## Decisions

### 1. Dual Authentication Context

**Decision:** Maintain two independent auth contexts — `AuthContext` (staff) and `CitizenAuthContext` (citizen) — each backed by its own `/me` endpoint and session cookie.

**Rationale:**
- Staff and citizen sessions are issued by different backend endpoints (`/api/v1/auth/*` vs `/api/v1/citizen-auth/*`) and carry different user shapes (`User` vs `CitizenUser`).
- A single unified context would require conditional branching on user type throughout the component tree, increasing coupling and making the guard logic harder to reason about.
- The two-context model keeps each portal's auth lifecycle fully isolated — a citizen logout does not affect a staff session and vice versa.

**Implementation:**
- Both contexts live in `src/contexts/` and follow the same structural pattern: mount → call `/me` → `setUser` or `setUser(null)` → `setIsLoading(false)`.
- Both expose `isAuthenticated`, `isLoading`, `login`, `logout`, and `refreshUser` (or `refreshCitizenAuth`).
- `CitizenUser` is defined in `packages/types/src/index.ts` alongside `User` — not locally in the service file.

**Cold-load optimisation:**
- `AppProviders` reads `window.location.pathname` at module load time.
- If the path starts with `/portal`, `AuthProvider` receives `skip={true}` and `CitizenAuthProvider` receives `skip={false}`.
- Otherwise, `AuthProvider` receives `skip={false}` and `CitizenAuthProvider` receives `skip={true}`.
- `isLoading` initialises to `!skip`, so the skipped context is immediately non-loading and does not fire a `/me` request.
- This ensures exactly one `/me` request fires on every cold load.

**Consequences:**
- Any new portal added to the application requires a third auth context and a corresponding `skip` condition in `AppProviders`.
- The `skip` logic in `AppProviders` is path-prefix based — it is evaluated once at module load, not reactively. This is intentional: the staff and citizen portals are never accessed in the same browser session.

---

### 2. Two-Layer Route Guard Pattern

**Decision:** All protected route subtrees use a two-layer guard: an outer layout-level guard and, where applicable, inner per-route permission guards.

**Rationale:**
- A single flat guard per route would require repeating the authentication check on every route, increasing the risk of omission.
- A layout-level outer guard provides a single enforcement point for the entire subtree; inner guards add module-level permission checks without duplicating the auth check.

**Staff portal implementation:**

```
<Route element={<ProtectedRoute allowedRoles={STAFF_ROLES}><DashboardLayout /></ProtectedRoute>}>
  {/* No inner guard — accessible to all STAFF_ROLES by design */}
  <Route path="/admin/dashboard" element={<DashboardPage />} />
  <Route path="/settings/profile" element={<ProfilePage />} />

  {/* Inner guard — restricts by module permission */}
  <Route path="/press-releases" element={
    <ProtectedRoute allowedRoles={rolesWithPermission('press-releases:read')}>
      <PressReleasesPage />
    </ProtectedRoute>
  } />
  {/* … other domain routes follow the same pattern */}
</Route>
```

- Layer 1 (`ProtectedRoute(STAFF_ROLES)`): blocks unauthenticated users and the `citizen` role from the entire dashboard subtree. Redirects to `/login` with `state.from` preserved.
- Layer 2 (`ProtectedRoute(rolesWithPermission(permission))`): restricts individual domain modules by permission. Redirects to `/unauthorized` (no `state.from`).
- `/admin/dashboard` and `/settings/profile` intentionally have no inner guard — they are accessible to all staff roles. This is documented with an inline comment in `routes/index.tsx`.

**Citizen portal implementation:**

```
<Route element={<CitizenPortalLayout />}>
  {/* Public citizen routes — no auth guard */}
  <Route path="/portal" element={<CitizenPortalHomePage />} />
  <Route path="/portal/login" element={<CitizenLoginPage />} />
  <Route path="/portal/register" element={<CitizenRegisterPage />} />

  {/* Protected citizen routes — explicit layout-level guard */}
  <Route element={<ProtectedCitizenRoute><Outlet /></ProtectedCitizenRoute>}>
    <Route path="/portal/dashboard" element={<CitizenDashboardPage />} />
    <Route path="/portal/profile" element={<CitizenProfilePage />} />
  </Route>
</Route>
```

- `ProtectedCitizenRoute` checks `CitizenAuthContext.isAuthenticated` only — there is no role comparison because all citizen users share the same `citizen` role.
- Public citizen routes (`/portal`, `/portal/login`, `/portal/register`) sit outside the `ProtectedCitizenRoute` wrapper within the same `CitizenPortalLayout`.
- New protected citizen routes must be added inside the `ProtectedCitizenRoute` wrapper, not as siblings of it.

**Rule:** Never add a new protected route directly under a layout `<Route>` without either placing it inside an existing guard wrapper or adding a new guard wrapper. The absence of a guard must be explicitly documented with an inline comment.

---

### 3. `ProtectedRoute` Redirect Behaviour

**Decision:** Standardise redirect targets and `state` payloads for all guard-triggered redirects.

| Trigger | Redirect target | `state` payload | `replace` |
|---------|----------------|-----------------|-----------|
| Unauthenticated staff accessing any protected route | `/login` | `{ from: location }` | `true` |
| Authenticated staff with insufficient role | `/unauthorized` | none | `true` |
| Unauthenticated citizen accessing `/portal/dashboard` or `/portal/profile` | `/portal/login` | `{ from: location }` | `true` |
| Session timeout (staff) | `/login` | `{ reason: 'session_expired' }` | — |
| Session timeout (citizen) | `/portal/login` | `{ reason: 'session_expired' }` | — |
| `auth:session-expired` event (interceptor-triggered) | `/login` or `/portal/login` | `{ reason: 'session_expired' }` | — |

**`state.from` convention:**
- `ProtectedRoute` and `ProtectedCitizenRoute` pass the full `location` object as `state.from` when redirecting to the login page.
- The login page reads `location.state?.from?.pathname` and navigates there on successful authentication, falling back to the portal's default landing route (`/admin/dashboard` for staff, `/portal/dashboard` for citizens).
- `state.from` is **not** preserved on `/unauthorized` redirects — the user is sent to the error page without a return path.

**`reason` convention:**
- When a logout is triggered by session expiry (timeout or interceptor), `{ reason: 'session_expired' }` is passed as navigation state.
- The login page reads `location.state?.reason` and displays a contextual info banner when `reason === 'session_expired'`.
- Voluntary logouts do not pass a `reason` — the login page renders without the banner.

---

### 4. Session Management

**Decision:** Both portals enforce a 30-minute inactivity timeout using `useSessionTimeout`, with a 2-minute warning modal before logout.

**Rationale:**
- Consistent session lifecycle across portals reduces security surface and contributor confusion.
- The warning modal gives users the opportunity to extend their session without losing work.

**Implementation:**
- `DashboardLayout` and `CitizenPortalLayout` both call `useSessionTimeout({ onWarning, onTimeout, enabled: isAuthenticated })`.
- `onWarning` sets a local `showTimeoutWarning` state to `true`, rendering `SessionTimeoutModal`.
- `onTimeout` calls `logout()` then navigates to the portal's login page with `{ reason: 'session_expired' }`.
- `enabled` is tied to `isAuthenticated` — the timer does not run on public pages.

**Interceptor-level session expiry:**
- When a token refresh fails (401 after `POST /api/v1/auth/refresh`), the interceptor dispatches `window.dispatchEvent(new CustomEvent('auth:session-expired'))` before re-throwing the error.
- Both `AuthProvider` and `CitizenAuthProvider` listen for this event (when not skipped) and respond with `logout()` + navigate to their portal's login page with `{ reason: 'session_expired' }`.
- This ensures that API-level session expiry produces the same clean re-auth redirect as inactivity timeout, regardless of which component triggered the failing request.

**Rule:** Any new layout that wraps authenticated routes must integrate `useSessionTimeout` with `enabled: isAuthenticated`. Do not add session timeout logic directly to page components.

---

### 5. Token-Based Flow Error Handling

**Decision:** Pages that accept a `?token=` query parameter must distinguish between a missing token and an expired/invalid token, and must provide an actionable recovery path for each case.

**Rationale:**
- A missing token (no `?token=` in the URL) indicates the user navigated to the page directly, not via an email link. The appropriate response is an error banner with no form.
- An expired or invalid token (API returns 401/410) indicates the link was used after expiry or was already consumed. The appropriate response is the same error banner plus a CTA that guides the user toward recovery.
- Surfacing the raw API error message without a recovery path leaves the user with no actionable next step.

**Implementation — `AcceptInvitePage`:**
- Missing token: renders `acceptInviteInvalidToken` banner immediately, no form rendered.
- API returns 401 (`err.isUnauthorized`): sets `expired = true`, renders the same `acceptInviteInvalidToken` banner plus a "Voltar ao login" `<Button>` link to `/login`.
- Other API errors: renders the API error message in the standard `errorBanner`.

**Implementation — `ResetPasswordPage`:**
- Missing token: renders `resetInvalidToken` banner plus a "Solicitar novo link" button linking to `/forgot-password`.
- API errors: renders the API error message in the standard `errorBanner` (reset tokens do not return 401 specifically — the error message from the API is sufficient).

**Rule:** Any new page that accepts a `?token=` query parameter must handle the missing-token and expired-token cases separately, with a recovery CTA appropriate to the flow.

---

### 6. Write-Permission UI Enforcement

**Decision:** UI action buttons (New, Edit, Delete) in `CrudPage` are conditionally rendered based on the current user's permissions, not just their route access.

**Rationale:**
- Route guards enforce read access (can the user reach the page?). Write/delete permissions are a separate concern.
- Rendering action buttons for roles that lack the corresponding permission causes unnecessary API 403 errors surfaced as toast notifications, degrading UX.
- Hiding unavailable actions is consistent with the sidebar's `PermissionGate` pattern.

**Implementation:**
- `CrudPage` accepts `writePermission?: string` and `deletePermission?: string` props.
- `canWrite = writePermission ? hasPermission(user.role, writePermission) : true`
- `canDelete = deletePermission ? hasPermission(user.role, deletePermission) : true`
- The "New" button is rendered only when `canWrite`.
- The `columns` factory is called with `(openEdit, openDelete, canWrite, canDelete)` — Edit/Delete buttons in table rows are rendered conditionally.
- When neither prop is provided, `canWrite` and `canDelete` default to `true` (backward-compatible).

**Permission string convention:** `resource:write` gates create and edit; `resource:delete` gates delete. These match the `ROLE_PERMISSIONS` entries in `@vsaas/types`.

**Rule:** Every domain page that uses `CrudPage` must pass `writePermission` and `deletePermission` props. The `columns` factory signature is `(openEdit, openDelete, canWrite, canDelete) => Column<TItem>[]`.

---

### 7. URL Conventions

**Decision:** Standardise URL patterns for deep-linking, modal triggers, and hash navigation.

**Modal deep-links via query params:**
- The `?create=true` query parameter on a domain route signals that the create modal should open on mount.
- `CrudPage` accepts `initialOpen?: boolean`. When `initialOpen && canWrite`, a mount `useEffect` calls `openCreate()`.
- The page component reads the param, passes `initialOpen` to `CrudPage`, and clears the param with `replace: true` to prevent the modal from re-opening on back-navigation.
- Pattern: `navigate('/press-releases?create=true')` from a dashboard quick-action button.

**Hash anchors on the landing page:**
- Public nav links in `MainHeader` use `<a href="/#section">` (plain anchor tags), not React Router `<Link>`.
- This is intentional: React Router v6 does not natively handle same-page hash scrolling without additional configuration. Plain anchor tags produce the correct browser scroll behaviour.
- Do not replace these with `<Link>` unless hash scroll behaviour is explicitly implemented (e.g., via `react-router-hash-link` or a custom `ScrollToHash` component).

**Breadcrumbs:**
- Staff routes: auto-generated by `Breadcrumbs` component in `DashboardLayout` from `pathname` segments via `generateBreadcrumbs(pathname, t)`.
- Citizen portal routes: manually mapped in `CitizenPortalLayout` via a `CITIZEN_BREADCRUMBS` record keyed by exact pathname. Rendered as `<nav aria-label="Breadcrumb">` above `<Outlet>` when the current path has an entry.
- Public routes: no breadcrumbs.
- New citizen portal routes that should show breadcrumbs must be added to the `CITIZEN_BREADCRUMBS` map in `CitizenPortalLayout.tsx`.

---

### 8. `@vsaas/types` as Single Source of Truth

**Decision:** All shared types, role definitions, permission strings, and permission-check utilities live in `packages/types/src/index.ts`. No auth-related types are defined locally in service files or components.

**What belongs in `@vsaas/types`:**
- `UserRoleType`, `STAFF_ROLES`, `CITIZEN_ROLE`
- `PermissionType`, `PERMISSIONS`, `ROLE_PERMISSIONS`
- `rolesWithPermission(permission)`, `hasPermission(role, permission)`, `hasAnyPermission(role, permissions[])`
- `User`, `CitizenUser`

**What does not belong in `@vsaas/types`:**
- React components, hooks, or context values
- API response shapes beyond the user/citizen user types
- Frontend-only UI state types

**Rule:** If a type is referenced in more than one file, or if it could be referenced by the backend, it belongs in `@vsaas/types`. Local type definitions for shared concepts are a divergence risk.

---

## Consequences

### Positive
- New contributors can apply the two-layer guard pattern, redirect conventions, and session management rules without reading the full architecture documentation.
- The `skip` optimisation in `AppProviders` ensures exactly one `/me` request per cold load, regardless of how many auth contexts are added in the future.
- Write-permission enforcement at the UI layer eliminates the class of 403 toast errors caused by rendering unavailable actions.
- Consistent session expiry handling (timeout + interceptor) across both portals means users always receive a clean re-auth redirect with a contextual reason message.

### Negative / Trade-offs
- The dual-context model adds cognitive overhead for contributors unfamiliar with the two-portal architecture. The `skip` logic in `AppProviders` is non-obvious without this document.
- The `CITIZEN_BREADCRUMBS` map in `CitizenPortalLayout` is a manual registry — it must be updated when new citizen routes are added. The staff breadcrumbs are auto-generated and do not have this maintenance burden.
- The `columns` factory 4-argument signature (`openEdit, openDelete, canWrite, canDelete`) is a breaking change from the original 2-argument signature. All 7 domain pages have been updated; any new domain page must use the 4-argument form.

---

## Alternatives Considered

**Single unified auth context with a `portalType` discriminator**
Rejected. Would require conditional branching on `portalType` throughout `ProtectedRoute`, `PermissionGate`, and session timeout logic. The two-context model is more explicit and easier to test in isolation.

**`sessionStorage` flag to skip the irrelevant `/me` call**
Considered as an alternative to the `skip` prop. Rejected because `sessionStorage` introduces a side effect that is harder to test and reason about than a prop passed at the provider level. The `window.location.pathname` check in `AppProviders` is evaluated once at module load and is deterministic.

**React Router `<HashLink>` for landing page anchors**
Considered for P3-7. Rejected because the existing `<a href="/#section">` pattern works correctly and adding a dependency (`react-router-hash-link`) or a custom scroll component would be disproportionate to the benefit. The inconsistency is cosmetic, not functional.

**Auto-generated breadcrumbs for the citizen portal**
Considered as an extension of the staff `generateBreadcrumbs` utility. Rejected because the citizen portal has only two protected routes with breadcrumbs, and the auto-generation utility is path-segment based — it would produce Portuguese labels only if i18n keys were added for each segment. The manual `CITIZEN_BREADCRUMBS` map is simpler and more explicit for the current scope.

---

## Related Files

| File | Role |
|------|------|
| `src/routes/index.tsx` | Single source of truth for all route definitions and guard placement |
| `src/providers/AppProviders.tsx` | Provider composition; `skip` logic for dual auth contexts |
| `src/contexts/AuthContext.tsx` | Staff auth context — `skip`, session-expired listener |
| `src/contexts/CitizenAuthContext.tsx` | Citizen auth context — `skip`, session-expired listener |
| `src/components/Auth/ProtectedRoute/ProtectedRoute.tsx` | Staff route guard — `allowedRoles`, `state.from` redirect |
| `src/components/Auth/ProtectedRoute/ProtectedCitizenRoute.tsx` | Citizen route guard — `isAuthenticated` check, `state.from` redirect |
| `src/components/Auth/PermissionGate/PermissionGate.tsx` | UI-level permission gating via `hasAnyPermission` |
| `src/components/UI/CrudPage/CrudPage.tsx` | Generic CRUD shell — `writePermission`, `deletePermission`, `initialOpen` |
| `src/layouts/DashboardLayout/DashboardLayout.tsx` | Staff layout — session timeout, sidebar, breadcrumbs |
| `src/layouts/CitizenPortalLayout/CitizenPortalLayout.tsx` | Citizen layout — session timeout, `CITIZEN_BREADCRUMBS` |
| `src/services/interceptors/index.ts` | HTTP interceptor — `auth:session-expired` dispatch on refresh failure |
| `src/hooks/useSessionTimeout.ts` | Inactivity timer — 30 min timeout, 2 min warning |
| `packages/types/src/index.ts` | Shared types — roles, permissions, `User`, `CitizenUser` |
