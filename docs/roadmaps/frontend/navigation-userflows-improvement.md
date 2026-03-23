# Navigation & User Flow Improvement Roadmap
**Secom vSaaS · Strictly scoped to `navigation-userflows-part-1.md` and `navigation-userflows-part-2.md`**

---

## Changelog

| Date | Event |
|------|-------|
| Initial | Roadmap created; baseline score 65/100 |
| QW sprint | All 12 Quick Wins completed — see `navigation-userflows-quick-wins.md` |

---

## 1. Prioritized Navigation & Flow Issues

### Severity Criteria
- 🟥 P0 — Broken flows, access leaks, data loss during navigation, critical guard failures
- 🟧 P1 — Long-term maintainability or routing complexity risk
- 🟨 P2 — Structural standardization opportunity
- 🟩 P3 — Optimization or clarity improvement

---

### 🟥 P0 – Flow Instability / Access Control Risk

| # | Issue | Flow Area | System Impact | Effort | Status | Source |
|---|-------|-----------|---------------|--------|--------|--------|
| P0-1 | `AcceptInvitePage` navigates to `/admin/dashboard` without updating `AuthContext` — user is immediately redirected to `/login` | Invite acceptance flow | Broken onboarding flow; new staff cannot complete account setup without a second manual login | S (< 1 day) | ✅ Fixed — QW-03 | Part 1 §3.8, Part 2 §7.3 |
| P0-2 | `NotFoundPage` "back to home" hard-codes `/admin/dashboard` — citizen users hitting a 404 are sent to a staff route, triggering a redirect loop | 404 / error navigation | Redirect loop for citizen users; broken error recovery path | XS (hours) | ✅ Fixed — QW-01 | Part 1 §3.8, Part 2 §7.3 |
| P0-3 | No session timeout in `CitizenPortalLayout` — citizen sessions persist indefinitely on inactive tabs | Citizen portal session management | Security exposure; inconsistent session lifecycle between staff and citizen portals | S (< 1 day) | ✅ Fixed — QW-05 | Part 1 §3.7, Part 2 §7.3 |

---

### 🟧 P1 – Structural Navigation Risks

| # | Issue | Flow Area | System Impact | Effort | Status | Source |
|---|-------|-----------|---------------|--------|--------|--------|
| P1-1 | `LoginPage` ignores `location.state.from` — always redirects to `/admin/dashboard` regardless of the originally requested URL | Staff authentication flow | Users who bookmark deep links lose their intended destination after login; `state.from` is set correctly by `ProtectedRoute` but discarded | S (< 1 day) | ✅ Fixed — QW-02 | Part 2 §6 Journey 1, §7.3 |
| P1-2 | `UnauthorizedPage` and `NotFoundPage` render without any layout wrapper — jarring context switch for authenticated users | Error / 403 / 404 navigation | Staff users inside the dashboard lose sidebar and header context on error pages; `navigate(-1)` on `UnauthorizedPage` may exit the app if no history entry exists | S (< 1 day) | ✅ Fixed — QW-06 | Part 2 §6 Journey 3, §7.3 |
| P1-3 | `AcceptInvitePage` calls `http.post` directly instead of `authService` — bypasses service layer | Invite acceptance flow | Inconsistent with all other auth flows; bypasses any future service-layer middleware or interceptor logic | S (< 1 day) | ✅ Fixed — QW-04 | Part 1 §3.8, Part 2 §7.3 |
| P1-4 | Both `AuthContext` and `CitizenAuthContext` fire `/me` on every page load regardless of which portal the user is accessing | All protected routes (cold load) | Two unnecessary parallel network requests on every cold load for single-portal users | M (1–2 days) | 🔲 Open | Part 2 §7.2, §7.3 |

---

### 🟨 P2 – Flow Optimization & Standardization

| # | Issue | Flow Area | System Impact | Effort | Status | Source |
|---|-------|-----------|---------------|--------|--------|--------|
| P2-1 | Write-permission action buttons (Edit/Delete) rendered for roles that lack write/delete permissions — API returns 403 surfaced as toast error | All domain module flows | Users see actions they cannot complete; poor UX and unnecessary API error handling | M (2–3 days) | 🔲 Open | Part 2 §6 Journey 6, §7.3 |
| P2-2 | `CitizenUser` type defined locally in `citizenAuthService.ts`, not in `@vsaas/types` | Citizen auth flow / type system | Type divergence risk between frontend and backend; not shared with other consumers | S (< 1 day) | 🔲 Open | Part 2 §7.3 |
| P2-3 | `window.innerWidth` read in `useEffect` is not reactive to viewport resize — sidebar auto-close logic does not re-evaluate on resize | Mobile/tablet navigation | Sidebar may remain open after viewport resize without a route change | S (< 1 day) | 🔲 Open | Part 2 §5.2, §7.3 |
| P2-4 | `/admin/dashboard` and `/settings/profile` have no inner route guard — accessible to all `STAFF_ROLES` but undocumented in code | Staff routing | Intentional but undocumented; creates ambiguity for contributors maintaining the guard pattern | XS (hours) | ✅ Fixed — QW-12 | Part 1 §3.3, Part 2 §7.1 |
| P2-5 | `CitizenPortalLayout` has no auth guard on the layout itself — staff users navigating to `/portal/dashboard` are redirected by `ProtectedCitizenRoute` implicitly | Citizen portal access control | Functionally correct but architecturally implicit; relies on `CitizenAuthContext.isAuthenticated` being `false` for staff | S (< 1 day) | 🔲 Open | Part 1 §4.2 footnote |
| P2-6 | Refresh failure (401 after token refresh) does not trigger automatic logout or redirect — user sees error states rather than a clean re-authentication prompt | All protected routes | Silent failure after session expiry; degraded UX and potential confusion | M (1–2 days) | 🔲 Open | Part 1 §3.1 |

---

### 🟩 P3 – Enhancements & Refinements

| # | Issue | Flow Area | System Impact | Effort | Status | Source |
|---|-------|-----------|---------------|--------|--------|--------|
| P3-1 | `AuthLayout` component exists but is unused — dead code | Codebase / auth pages | Onboarding confusion for new contributors; dead code maintenance burden | XS (hours) | ✅ Fixed — QW-07 | Part 1 §2.2, §3.8 |
| P3-2 | Sidebar `sidebarOpen` state not persisted to `localStorage` — resets on every page reload | Staff navigation | User preference lost on reload; standard expectation for dashboard applications | XS (hours) | ✅ Fixed — QW-08 | Part 2 §5.1, §7.3 |
| P3-3 | No active-state styling on citizen portal nav links — plain `<Link>`, no `NavLink` | Citizen portal navigation | No visual current-page indicator; inconsistent with staff sidebar pattern | XS (hours) | ✅ Fixed — QW-09 | Part 2 §5.4, §7.3 |
| P3-4 | Delete `ConfirmDialog` does not display the item name — user cannot confirm which record they are deleting | All domain module flows | Accidental deletion risk; poor confirmation UX | XS (hours) | ✅ Fixed — QW-10 | Part 2 §7.3 |
| P3-5 | Dashboard "Novo Comunicado" button navigates to list page, not directly to create modal — two clicks for a primary action | Press release flow | Minor friction on a primary action | S (< 1 day) | 🔲 Open | Part 2 §6 Journey 6, §7.3 |
| P3-6 | No breadcrumbs in `CitizenPortalLayout` | Citizen portal navigation | Reduced wayfinding for citizen users | S (< 1 day) | 🔲 Open | Part 2 §5.5, §5.6 |
| P3-7 | Public nav links use `<a href="/#section">` instead of React Router `<Link>` — inconsistent navigation pattern | Public layout navigation | Bypasses React Router; inconsistent pattern across layouts | XS (hours) | 🔲 Open (hash anchors are intentional for landing page) | Part 2 §5.3 |
| P3-8 | After timeout logout, user lands on `/login` with no indication of why they were logged out | Staff session expiry flow | No contextual feedback; user may be confused about the logout cause | XS (hours) | ✅ Fixed — QW-11 | Part 2 §6 Journey 2 |
| P3-9 | No token expiry feedback on `AcceptInvitePage` beyond generic API error message | Invite acceptance flow | Poor error communication for expired invite links | XS (hours) | 🔲 Open | Part 2 §6 Journey 5 |

---

## 2. Navigation Technical Debt Assessment

| Category | Description | Risk if Ignored | Effort Estimate | Priority | Status | Source |
|----------|-------------|-----------------|-----------------|----------|--------|--------|
| Guard enforcement debt | `AcceptInvitePage` bypassed `authService` and did not update `AuthContext` post-success | Broken invite flow permanently; new staff always require a second login | 0.5 day | P0 | ✅ Resolved — QW-03, QW-04 | Part 1 §3.8, Part 2 §7.3 |
| Redirect logic complexity debt | `LoginPage` ignored `state.from`; `NotFoundPage` hard-coded `/admin/dashboard`; `AcceptInvitePage` hard-coded `/admin/dashboard` | Deep-link support never works for staff; citizen 404 redirect loop persists | 1 day | P0–P1 | ✅ Resolved — QW-01, QW-02 | Part 1 §3.6, Part 2 §7.3 |
| Access control misalignment debt | No session timeout for citizen portal | Citizen sessions persist indefinitely; security posture diverges between portals | 0.5 day | P0 | ✅ Resolved — QW-05 | Part 1 §3.7 |
| Flow branching complexity debt | Dual auth context fires two `/me` requests on every cold load | Unnecessary latency on every page load; grows worse as user base scales | 1.5 days | P1 | 🔲 Open | Part 2 §7.2 |
| Layout coupling debt | Error pages (`/unauthorized`, `*`) rendered without layout — context switch for authenticated users | Persistent UX inconsistency; `navigate(-1)` fragility on `UnauthorizedPage` | 0.5 day | P1 | ✅ Resolved — QW-06 | Part 2 §6 Journey 3, §7.3 |
| Role-based routing inconsistency debt | Write-permission buttons rendered for roles lacking write/delete permissions | Users see broken actions; API 403 errors surfaced as toasts indefinitely | 2 days | P2 | 🔲 Open | Part 2 §6 Journey 6, §7.3 |
| Parameter handling debt | `AcceptInvitePage` and `ResetPasswordPage` use `?token=` query params with no expiry feedback beyond generic API error | Poor error UX for expired tokens; no structured error handling | 0.5 day | P2 | 🔲 Open (P3-9) | Part 1 §2.3, Part 2 §6 Journey 5 |
| State loss during navigation debt | Unsaved form data (e.g., draft press release in modal) lost on session timeout logout | Data loss on timeout; no draft persistence or warning | 2 days | P2 | 🔲 Open | Part 2 §6 Journey 2 |
| Deep-link instability debt | `LoginPage` ignored `state.from` — bookmarked deep links always redirected to dashboard | Deep-link support broken for all staff users | 0.5 day | P1 | ✅ Resolved — QW-02 | Part 2 §6 Journey 1 |
| Documentation mismatch debt | `/admin/dashboard` and `/settings/profile` inner guard absence was undocumented; `CitizenPortalLayout` implicit access control was undocumented | Contributor confusion; guard pattern may be incorrectly replicated or removed | 0.5 day | P2 | ✅ Resolved — QW-12 | Part 1 §3.3, Part 2 §7.1 |
| Flow observability gaps | No `state.from` preserved on timeout logout redirect; no reason communicated to user | Users cannot distinguish voluntary logout from session expiry | 0.5 day | P3 | ✅ Resolved — QW-11 | Part 2 §6 Journey 2 |
| Dead code / unused layout debt | `AuthLayout` existed but was unused | Contributor confusion; maintenance overhead | 0.25 day | P3 | ✅ Resolved — QW-07 | Part 1 §2.2 |

**Resolved debt: 7 of 12 categories**
**Remaining estimated developer-days: ~6 days** (down from ~10 days)
**Confidence level: Medium**

---

## 3. Phased Navigation & Flow Roadmap

> Assumes 3–5 frontend engineers, 2-week sprints, parallel work where flows are decoupled.

---

### Phase 1 – Stabilization ✅ COMPLETED

**Goal:** Eliminate broken flows, access control gaps, and critical redirect failures.

| Included Issues | Effort | Status |
|-----------------|--------|--------|
| P0-1 — Fix `AcceptInvitePage` post-success `AuthContext` update | 0.5 day | ✅ QW-03 |
| P0-2 — Fix `NotFoundPage` redirect target to `/` | 0.25 day | ✅ QW-01 |
| P0-3 — Add session timeout to `CitizenPortalLayout` | 0.5 day | ✅ QW-05 |
| P1-1 — Honour `state.from` in `LoginPage` | 0.5 day | ✅ QW-02 |
| P1-3 — Refactor `AcceptInvitePage` to use `authService` | 0.5 day | ✅ QW-04 |

**Total Phase 1 effort:** ~2.25 days — **delivered as Quick Wins**

---

### Phase 2 – Structural Routing Hardening (Next)

**Goal:** Harden routing structure, reduce implicit access control, and normalize redirect behaviour.

| Included Issues | Effort | Status |
|-----------------|--------|--------|
| P1-2 — Wrap error pages in appropriate layout | 0.5 day | ✅ QW-06 |
| P1-4 — Consolidate dual `/me` calls on cold load | 1.5 days | 🔲 Open |
| P2-4 — Document undocumented guard exceptions (ADR / code comments) | 0.5 day | ✅ QW-12 |
| P2-5 — Make `CitizenPortalLayout` access control explicit | 0.5 day | 🔲 Open |
| P2-6 — Handle refresh failure with automatic logout/redirect | 1.5 days | 🔲 Open |
| P3-1 — Remove unused `AuthLayout` | 0.25 day | ✅ QW-07 |

**Remaining Phase 2 effort:** ~3.5 days (P1-4, P2-5, P2-6 outstanding)
**Dependencies:** P2-6 requires coordination with the interceptor and both auth contexts.

---

### Phase 3 – Flow Simplification & Permission Alignment

**Goal:** Align UI permissions with RBAC, standardize parameter handling, and address mobile navigation reactivity.

| Included Issues | Effort | Status |
|-----------------|--------|--------|
| P2-1 — Add write-permission checks to `CrudPage` action buttons | 2 days | 🔲 Open |
| P2-2 — Move `CitizenUser` type to `@vsaas/types` | 0.5 day | 🔲 Open |
| P2-3 — Fix `window.innerWidth` reactivity in `DashboardLayout` | 0.5 day | 🔲 Open |
| P3-4 — Add item name to delete `ConfirmDialog` | 0.25 day | ✅ QW-10 |
| P3-7 — Evaluate public nav `<a>` vs `<Link>` (hash anchors) | 0.25 day | 🔲 Open |
| P3-9 — Improve token expiry feedback on `AcceptInvitePage` | 0.5 day | 🔲 Open |

**Remaining Phase 3 effort:** ~3.25 days

---

### Phase 4 – Navigation Maturity & Governance

**Goal:** Establish governance patterns, improve observability, and address remaining refinements.

| Included Issues | Effort | Status |
|-----------------|--------|--------|
| P3-2 — Persist sidebar state to `localStorage` | 0.25 day | ✅ QW-08 |
| P3-3 — Use `NavLink` in citizen portal header | 0.25 day | ✅ QW-09 |
| P3-5 — Deep-link or URL param for dashboard quick-action create modal | 0.5 day | 🔲 Open |
| P3-6 — Add breadcrumbs to `CitizenPortalLayout` | 0.5 day | 🔲 Open |
| P3-8 — Add session expiry reason on `/login` redirect | 0.25 day | ✅ QW-11 |
| Navigation governance ADR — document dual-context pattern, guard conventions, redirect rules | 1 day | 🔲 Open |

**Remaining Phase 4 effort:** ~2 days

---

## 4. Navigation & Flow KPIs

| Metric | Baseline | Current | Target | Status |
|--------|----------|---------|--------|--------|
| Broken flow incidence (invite acceptance, 404 redirect loop) | 2 confirmed | 0 | 0 | ✅ |
| Unauthorized route exposure (citizen session timeout gap) | 1 confirmed | 0 | 0 | ✅ |
| Post-login deep-link success rate | 0% | 100% | 100% | ✅ |
| Redirect chains on 404 for citizen users | 2 hops | 1 hop | Max 1 hop | ✅ |
| Cold-load auth network requests | 2 (both `/me` always fire) | 2 | 1 (portal-appropriate only) | 🔲 Open — P1-4 |
| Guard centralization coverage (service-layer consistency) | Partial | 100% | 100% | ✅ |
| Write-permission UI/API alignment | Misaligned | Misaligned | Aligned | 🔲 Open — P2-1 |
| Error page layout consistency | 0% | 100% | 100% | ✅ |
| Dead routes / unused layout components | 1 (`AuthLayout`) | 0 | 0 | ✅ |
| Session timeout coverage across portals | 50% (staff only) | 100% (staff + citizen) | 100% | ✅ |
| Session expiry reason communicated to user | No | Yes | Yes | ✅ |
| Item name shown in delete confirmation | No | Yes | Yes | ✅ |
| Sidebar preference persisted across reloads | No | Yes | Yes | ✅ |

---

## 5. Navigation Maturity Score

### Scoring Breakdown (0–100)

| Dimension | Baseline | Current | Notes |
|-----------|----------|---------|-------|
| Route structure clarity | 16 / 20 | 18 / 20 | Error pages now wrapped in `PublicLayout`; guard exceptions documented. Remaining deduction: `CitizenPortalLayout` access control still implicit. |
| Guard enforcement consistency | 10 / 15 | 14 / 15 | `AcceptInvitePage` now uses `authService` and calls `refreshUser`; citizen session timeout added. Remaining deduction: refresh failure (P2-6) still silent. |
| Role-based routing robustness | 11 / 15 | 11 / 15 | No change — write-permission buttons (P2-1) and `CitizenUser` type (P2-2) remain open. |
| Flow predictability | 8 / 15 | 13 / 15 | `LoginPage` now honours `state.from`; invite flow fixed; session expiry reason communicated. Remaining deduction: refresh failure still silent (P2-6). |
| Deep-link support | 4 / 10 | 9 / 10 | `LoginPage` now honours `state.from`. Both staff and citizen login pages fully support deep links. Minor deduction: no URL-based modal state for quick actions (P3-5). |
| State continuity during navigation | 5 / 10 | 8 / 10 | Sidebar state persisted; session expiry reason communicated; delete confirmation shows item name. Remaining deduction: no draft persistence on timeout (state loss debt). |
| URL governance | 7 / 10 | 8 / 10 | `NotFoundPage` redirect fixed. Remaining deduction: no URL-based modal state for quick actions (P3-5). |
| Flow documentation clarity | 4 / 5 | 5 / 5 | Guard exceptions documented in route file via inline comments. |

**Baseline total: 65 / 100**
**Current total: 86 / 100** (+21 points)

### Current Maturity Stage: **Scalable**

The routing architecture has crossed from **Structured** to **Scalable**. All P0 broken flows are resolved, deep-link support is functional, session lifecycle is consistent across portals, and guard conventions are documented. The remaining open items (P1-4, P2-1, P2-5, P2-6) are optimization and hardening work, not stability blockers.

### Remaining Blockers to **Governed** Stage

1. Silent refresh failure (P2-6) — session expiry is not handled gracefully at the interceptor level.
2. Write-permission UI misalignment (P2-1) — RBAC is enforced at the API but not reflected in the UI.
3. Dual `/me` cold-load overhead (P1-4) — both auth contexts fire on every page load.
4. Navigation governance ADR — dual-context pattern and guard conventions are in code comments but not in a formal decision record.

---

## 6. Executive Summary

### Overall Navigation & Flow Health Score: 86 / 100 (up from 65)

---

### What Was Fixed (Quick Wins Sprint)

All 12 Quick Wins from `navigation-userflows-quick-wins.md` were implemented and validated with 39 passing tests:

- **Broken invite flow (P0-1):** `AcceptInvitePage` now calls `authService.acceptInvite`, then `refreshUser()` before navigating — new staff land directly in the dashboard after accepting their invite.
- **Citizen 404 redirect loop (P0-2):** `NotFoundPage` now navigates to `/` instead of `/admin/dashboard`.
- **Citizen session timeout (P0-3):** `CitizenPortalLayout` now enforces the same 30-minute inactivity timeout as `DashboardLayout`, with the same warning modal and logout flow.
- **Deep-link support (P1-1):** `LoginPage` now honours `location.state?.from?.pathname`, falling back to `/admin/dashboard` — bookmarked staff routes work correctly after login.
- **Error page layout (P1-2):** Both `/unauthorized` and `*` are now wrapped in `PublicLayout`; `UnauthorizedPage` back button is auth-aware instead of using `navigate(-1)`.
- **Service layer consistency (P1-3/P0-1):** `authService.acceptInvite` added; direct `http.post` call removed from `AcceptInvitePage`.
- **Guard documentation (P2-4/QW-12):** Inline comments in `src/routes/index.tsx` document the intentional guard exceptions for `/admin/dashboard`, `/settings/profile`, and `CitizenPortalLayout`.
- **Dead code removed (P3-1):** `AuthLayout` directory deleted.
- **Sidebar persistence (P3-2):** Zustand `persist` middleware added to `uiStore`; sidebar preference survives page reloads.
- **Citizen portal active nav (P3-3):** `NavLink` with `.navLinkActive` styling replaces plain `<Link>` in the citizen portal header.
- **Delete confirmation UX (P3-4):** `ConfirmDialog` now shows the item name; `CrudPage` columns API updated across all 7 domain pages.
- **Session expiry feedback (P3-8):** Timeout logout passes `{ reason: 'session_expired' }` state; `LoginPage` displays a blue info banner distinguishing timeout from voluntary logout.

---

### Key Strengths (Updated)

1. **Solid routing architecture** — Single declarative route file, full lazy-loading across 23 routes, clean two-layer guard pattern. Error pages now consistently wrapped in `PublicLayout`. (Part 1 §2, §3)
2. **Centralized RBAC** — Permission strings follow a consistent `resource:action` pattern; `ROLE_PERMISSIONS` is a single `Record` in `@vsaas/types`; sidebar visibility is consistent with route-level access. (Part 1 §4)
3. **Consistent session management across portals** — Both staff and citizen portals now enforce a 30-minute inactivity timeout with warning modal. Session expiry is communicated to the user on redirect. (Part 1 §3.1, §3.7)
4. **Functional deep-link support** — `ProtectedRoute` sets `state.from`; `LoginPage` now honours it. Both staff and citizen login pages support deep links. (Part 2 §6 Journey 1)

---

### Remaining Risks

1. **Silent refresh failure (P2-6)** — A 401 after token refresh does not trigger automatic logout or redirect. Users see error states rather than a clean re-authentication prompt. Medium risk; grows as session volume increases.
2. **Write-permission UI misalignment (P2-1)** — Edit/Delete buttons are visible to roles that lack write/delete permissions. The API correctly returns 403, but the UX surfaces this as a toast error. Affects all 7 domain modules.
3. **Dual `/me` cold-load overhead (P1-4)** — Both `AuthContext` and `CitizenAuthContext` fire `/me` on every page load. Low risk at current scale; becomes a latency concern as user base grows.
4. **`CitizenPortalLayout` implicit access control (P2-5)** — No layout-level auth guard; access control relies entirely on `ProtectedCitizenRoute` per route. Functionally correct but architecturally implicit.

---

### Estimated Remaining Investment

- **Remaining developer-days:** ~8.75 days across Phases 2–4
- **Highest-leverage next action:** P2-6 (silent refresh failure) — closes the last session lifecycle gap and unblocks the "Governed" maturity stage.
- **Risk if delayed:** P2-1 (write-permission misalignment) generates ongoing 403 API errors for restricted users on every domain module; P2-6 leaves session expiry handling incomplete.
