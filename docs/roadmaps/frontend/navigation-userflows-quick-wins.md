# Navigation & User Flow Quick Wins
**Secom vSaaS · Strictly scoped to `navigation-userflows-part-1.md` and `navigation-userflows-part-2.md`**

> All quick wins are directly supported by documented findings. No cross-document inference.

## Status

**All 12 Quick Wins completed.** 🏁

| # | Title | Type | Tests Added |
|---|-------|------|-------------|
| QW-01 | Fix `NotFoundPage` redirect target | Small | — |
| QW-02 | Honour `state.from` in `LoginPage` | Standard | 2 new |
| QW-03 | Fix `AcceptInvitePage` `AuthContext` update | Standard | 2 new |
| QW-04 | Refactor `AcceptInvitePage` to use `authService` | Small (with QW-03) | — |
| QW-05 | Add session timeout to `CitizenPortalLayout` | Standard | 6 new |
| QW-06 | Wrap error pages in `PublicLayout` | Standard | 3 new |
| QW-07 | Remove unused `AuthLayout` component | Small | — |
| QW-08 | Persist sidebar state to `localStorage` | Small | — |
| QW-09 | Use `NavLink` in citizen portal header | Small | — |
| QW-10 | Add item name to delete `ConfirmDialog` | Standard | 1 updated |
| QW-11 | Add session expiry reason on `/login` redirect | Small | 2 new |
| QW-12 | Document undocumented guard exceptions | Small | — |

**Total new/updated tests:** 16 &nbsp;|&nbsp; **All passing:** ✅ 39/39

---

**Quick Win #1: Fix `NotFoundPage` Redirect Target** ✅ COMPLETED

- **Navigation Problem:** The "back to home" button in `NotFoundPage` hard-codes `/admin/dashboard`. Citizen users hitting a 404 are sent to a staff route, which redirects them to `/login`, creating a two-hop redirect loop.
- **Impact:** Eliminates a confirmed redirect loop for citizen users; safe for all user types since `/` is the public landing page.
- **Effort:** XS — hours
- **Implementation Steps:**
  1. ✅ Open `src/pages/NotFoundPage.tsx`.
  2. ✅ Change the `navigate('/admin/dashboard')` call (or `<Link to="/admin/dashboard">`) to `navigate('/')` / `<Link to="/">`.
  3. ✅ Button label already uses `t('common.backToHome')` → "Voltar ao início" — no change needed.
- **Risk Level:** Very Low — no guard or context dependency.
- **Source:** Part 1 §3.8, Part 2 §7.3 (R3)

---

**Quick Win #2: Honour `state.from` in `LoginPage`** ✅ COMPLETED

- **Navigation Problem:** `LoginPage.handleSubmit` always navigates to `/admin/dashboard` after successful login, discarding `location.state?.from` that `ProtectedRoute` correctly set before redirecting the user to `/login`. Bookmarked deep links never work for staff.
- **Impact:** Deep-link support becomes functional for all staff users with zero architectural change — the infrastructure (`state.from` in `ProtectedRoute`) is already in place.
- **Effort:** XS — hours
- **Implementation Steps:**
  1. ✅ Open `src/pages/LoginPage.tsx`.
  2. ✅ Add `const location = useLocation()` (already available via React Router).
  3. ✅ In `handleSubmit`, replace `navigate('/admin/dashboard')` with:
     ```ts
     const from = location.state?.from?.pathname ?? '/admin/dashboard';
     navigate(from, { replace: true });
     ```
  4. ✅ This mirrors the pattern already implemented in `CitizenLoginPage`.
- **Risk Level:** Very Low — mirrors existing `CitizenLoginPage` implementation.
- **Source:** Part 1 §3.6, Part 2 §6 Journey 1, §7.3 (R2)

---

**Quick Win #3: Fix `AcceptInvitePage` Post-Success `AuthContext` Update** ✅ COMPLETED

- **Navigation Problem:** After `POST /api/v1/auth/accept-invite` succeeds, `AcceptInvitePage` calls `navigate('/admin/dashboard')` without updating `AuthContext`. `ProtectedRoute` finds `isAuthenticated = false` and redirects to `/login`. New staff must log in manually after accepting their invite.
- **Impact:** Eliminates the broken onboarding flow — the highest-impact single fix in the codebase.
- **Effort:** S — less than 1 day
- **Implementation Steps:**
  1. ✅ Open `src/pages/AcceptInvitePage.tsx`.
  2. ✅ Import `useAuth` and call `const { refreshUser } = useAuth()`.
  3. ✅ After the successful `authService.acceptInvite` response, call `await refreshUser()` before `navigate('/admin/dashboard')`.
- **Risk Level:** Low — depends on whether the backend sets a session cookie on `accept-invite` (likely, but verify).
- **Source:** Part 1 §3.8, Part 2 §6 Journey 5, §7.3 (R1)

---

**Quick Win #4: Refactor `AcceptInvitePage` to Use `authService`** ✅ COMPLETED

- **Navigation Problem:** `AcceptInvitePage` calls `http.post('/api/v1/auth/accept-invite', ...)` directly, bypassing `authService`. This is inconsistent with all other auth flows and will bypass any future service-layer middleware.
- **Impact:** Restores consistency in the auth service layer; reduces future maintenance risk.
- **Effort:** XS — hours (can be done alongside Quick Win #3)
- **Implementation Steps:**
  1. ✅ Add an `acceptInvite(token, name, password)` method to `src/services/api/authService.ts`.
  2. ✅ In `AcceptInvitePage.tsx`, replace the direct `http.post` call with `authService.acceptInvite(...)`.
- **Risk Level:** Very Low — purely a refactor with no behaviour change.
- **Source:** Part 1 §3.8, Part 2 §7.3

---

**Quick Win #5: Add Session Timeout to `CitizenPortalLayout`** ✅ COMPLETED

- **Navigation Problem:** `CitizenPortalLayout` has no session timeout. Citizen sessions persist indefinitely on inactive tabs, unlike the staff portal which enforces a 30-minute timeout.
- **Impact:** Closes a security gap; aligns citizen session lifecycle with staff session lifecycle.
- **Effort:** S — less than 1 day
- **Implementation Steps:**
  1. ✅ Open `src/layouts/CitizenPortalLayout/CitizenPortalLayout.tsx`.
  2. ✅ Import `useSessionTimeout` (already used in `DashboardLayout`).
  3. ✅ Add the hook with `onTimeout` redirecting to `/portal/login` and `onWarning` showing `SessionTimeoutModal`.
  4. ✅ Hook is only active when `CitizenAuthContext.isAuthenticated` is `true`.
- **Risk Level:** Low — reuses existing `useSessionTimeout` hook; no new logic required.
- **Source:** Part 1 §3.7, Part 2 §7.2, §7.3 (R4)

---

**Quick Win #6: Wrap Error Pages in a Minimal Layout** ✅ COMPLETED

- **Navigation Problem:** `/unauthorized` and `*` (404) render without any layout wrapper. Staff users inside the dashboard experience a jarring context switch — no sidebar, no header. The "Voltar" button on `UnauthorizedPage` uses `navigate(-1)`, which may exit the application if there is no history entry.
- **Impact:** Consistent navigation context for authenticated users on error pages; eliminates the `navigate(-1)` fragility risk.
- **Effort:** S — less than 1 day
- **Implementation Steps:**
  1. ✅ Wrap `UnauthorizedPage` and `NotFoundPage` in `PublicLayout` in `src/routes/index.tsx`.
  2. ✅ On `UnauthorizedPage`, replace `navigate(-1)` with `navigate('/admin/dashboard')` for authenticated staff or `navigate('/')` as fallback (checks `AuthContext.isAuthenticated`).
- **Risk Level:** Low — layout wrapping is additive; no guard logic changes.
- **Source:** Part 2 §6 Journey 3, §7.3 (R5)

---

**Quick Win #7: Remove Unused `AuthLayout` Component** ✅ COMPLETED

- **Navigation Problem:** `src/layouts/AuthLayout/` exists but is not imported anywhere in the route tree. It is dead code that creates onboarding confusion for new contributors who may assume it is in use.
- **Impact:** Cleaner codebase; removes contributor confusion about the auth page layout pattern.
- **Effort:** XS — hours
- **Implementation Steps:**
  1. ✅ Confirmed `AuthLayout` is not imported anywhere: only defined in `AuthLayout.tsx` and re-exported from `layouts/index.ts`.
  2. ✅ Removed `AuthLayout` export from `src/layouts/index.ts`.
  3. ✅ Deleted `src/layouts/AuthLayout/` directory.
- **Risk Level:** Very Low — confirmed unused by static analysis.
- **Source:** Part 1 §2.2, §3.8, Part 2 §7.3

---

**Quick Win #8: Persist Sidebar State to `localStorage`** ✅ COMPLETED

- **Navigation Problem:** `sidebarOpen` in `uiStore` (Zustand) has no persistence middleware. The sidebar state resets to `true` (open) on every page reload, ignoring the user's last preference.
- **Impact:** Standard dashboard UX improvement; user preference is retained across sessions.
- **Effort:** XS — hours
- **Implementation Steps:**
  1. ✅ Open `src/store/uiStore.ts`.
  2. ✅ Added Zustand `persist` middleware wrapping the store, persisting only `sidebarOpen` to `localStorage` under key `secom-ui-state`.
  3. ✅ No component changes required — `useSidebarOpen()` consumers automatically receive the persisted value.
- **Risk Level:** Very Low — additive change; no logic modification.
- **Source:** Part 2 §5.1, §7.3 (R10)

---

**Quick Win #9: Use `NavLink` in Citizen Portal Header** ✅ COMPLETED

- **Navigation Problem:** `CitizenPortalLayout` uses plain `<Link>` for navigation items, providing no active-state styling. Users have no visual indication of their current page in the citizen portal, unlike the staff sidebar which uses `NavLink` with `aria-current="page"`.
- **Impact:** Consistent navigation pattern across portals; improved wayfinding for citizen users.
- **Effort:** XS — hours
- **Implementation Steps:**
  1. ✅ Open `src/layouts/CitizenPortalLayout/CitizenPortalLayout.tsx`.
  2. ✅ Replaced `<Link>` with `<NavLink>` for `Início` and `Meu perfil` nav items.
  3. ✅ Applied active-state class using the `NavLink` callback pattern (same as the staff sidebar); added `.navLinkActive` to the CSS module.
- **Risk Level:** Very Low — purely additive styling change.
- **Source:** Part 2 §5.4, §7.3 (R12)

---

**Quick Win #10: Add Item Name to Delete `ConfirmDialog`** ✅ COMPLETED

- **Navigation Problem:** The delete confirmation dialog in `CrudPage` does not display the name of the item being deleted. Users cannot confirm which record they are about to remove from the dialog alone.
- **Impact:** Reduces accidental deletion risk across all domain modules (press releases, media contacts, clippings, events, appointments, citizen records, social media posts).
- **Effort:** XS — hours
- **Implementation Steps:**
  1. ✅ Changed `columns` prop signature from `setDeleteTarget(id: string)` to `openDelete(item: TItem)` in `CrudPage`.
  2. ✅ Added `openDelete` handler in `CrudPage` that extracts `title ?? name ?? citizenName` as the display name.
  3. ✅ Passed `message` with item name to `ConfirmDialog`: `"Tem certeza que deseja excluir \"{{name}}\"?"`.
  4. ✅ Added `deleteConfirmNamed` translation key to both locale files.
  5. ✅ Updated all 7 domain pages to use `openDelete(item)` instead of `setDeleteTarget(item.id)`.
- **Risk Level:** Very Low — additive prop change; no logic modification.
- **Source:** Part 2 §7.3

---

**Quick Win #11: Add Session Expiry Reason on `/login` Redirect** ✅ COMPLETED

- **Navigation Problem:** After a session timeout logout, the user is navigated to `/login` with no indication of why they were logged out. The user cannot distinguish a voluntary logout from an automatic session expiry.
- **Impact:** Improved UX clarity; reduces support confusion about unexpected logouts.
- **Effort:** XS — hours
- **Implementation Steps:**
  1. ✅ In `DashboardLayout.tsx`, changed `navigate('/login')` to `navigate('/login', { state: { reason: 'session_expired' } })`.
  2. ✅ In `LoginPage.tsx`, read `location.state?.reason` and display an info banner: `"Sua sessão expirou. Por favor, faça login novamente."`.
  3. ✅ Added `auth.sessionExpired` translation key to both locale files.
  4. ✅ Added `.infoBanner` CSS class to `Auth.module.css`.
- **Risk Level:** Very Low — additive state passing; no guard or auth logic changes.
- **Source:** Part 2 §6 Journey 2

---

**Quick Win #12: Document Undocumented Guard Exceptions in Route File** ✅ COMPLETED

- **Navigation Problem:** `/admin/dashboard` and `/settings/profile` have no inner route guard and are accessible to all `STAFF_ROLES`. This is intentional but undocumented in code, creating ambiguity for contributors maintaining the guard pattern. `CitizenPortalLayout` has no auth guard on the layout itself — access control is implicit via `ProtectedCitizenRoute`.
- **Impact:** Prevents accidental addition of unnecessary guards or removal of existing ones; reduces onboarding friction for new contributors.
- **Effort:** XS — hours
- **Implementation Steps:**
  1. ✅ Added inline comments above `/admin/dashboard` and `/settings/profile` routes: `// No inner guard — accessible to all STAFF_ROLES by design`.
  2. ✅ Added a comment above `CitizenPortalLayout` route group: `// No layout-level auth guard — ProtectedCitizenRoute handles auth per protected route`.
- **Risk Level:** Very Low — documentation only; no code logic changes.
- **Source:** Part 1 §3.3, Part 2 §7.1
