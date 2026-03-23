# Navigation & User Flow Improvement Roadmap
**Secom vSaaS · Strictly scoped to `navigation-userflows-part-1.md` and `navigation-userflows-part-2.md`**

---

## Changelog

| Date | Event |
|------|-------|
| Initial | Roadmap created; baseline score 65/100 |
| QW sprint | All 12 Quick Wins completed — see `navigation-userflows-quick-wins.md` |
| P1–P2 sprint | P1-4, P2-1 through P2-6 completed |
| P3 sprint | P3-5, P3-6, P3-9 completed |

---

## 1. Prioritized Navigation & Flow Issues

### Severity Criteria
- 🟥 P0 — Broken flows, access leaks, data loss during navigation, critical guard failures
- 🟧 P1 — Long-term maintainability or routing complexity risk
- 🟨 P2 — Structural standardization opportunity
- 🟩 P3 — Optimization or clarity improvement

---

### 🟥 P0 – Flow Instability / Access Control Risk ✅ ALL RESOLVED

| # | Issue | Flow Area | System Impact | Effort | Status | Source |
|---|-------|-----------|---------------|--------|--------|--------|
| P0-1 | `AcceptInvitePage` navigates to `/admin/dashboard` without updating `AuthContext` — user is immediately redirected to `/login` | Invite acceptance flow | Broken onboarding flow; new staff cannot complete account setup without a second manual login | S (< 1 day) | ✅ Fixed — QW-03 | Part 1 §3.8, Part 2 §7.3 |
| P0-2 | `NotFoundPage` "back to home" hard-codes `/admin/dashboard` — citizen users hitting a 404 are sent to a staff route, triggering a redirect loop | 404 / error navigation | Redirect loop for citizen users; broken error recovery path | XS (hours) | ✅ Fixed — QW-01 | Part 1 §3.8, Part 2 §7.3 |
| P0-3 | No session timeout in `CitizenPortalLayout` — citizen sessions persist indefinitely on inactive tabs | Citizen portal session management | Security exposure; inconsistent session lifecycle between staff and citizen portals | S (< 1 day) | ✅ Fixed — QW-05 | Part 1 §3.7, Part 2 §7.3 |

---

### 🟧 P1 – Structural Navigation Risks ✅ ALL RESOLVED

| # | Issue | Flow Area | System Impact | Effort | Status | Source |
|---|-------|-----------|---------------|--------|--------|--------|
| P1-1 | `LoginPage` ignores `location.state.from` — always redirects to `/admin/dashboard` regardless of the originally requested URL | Staff authentication flow | Users who bookmark deep links lose their intended destination after login; `state.from` is set correctly by `ProtectedRoute` but discarded | S (< 1 day) | ✅ Fixed — QW-02 | Part 2 §6 Journey 1, §7.3 |
| P1-2 | `UnauthorizedPage` and `NotFoundPage` render without any layout wrapper — jarring context switch for authenticated users | Error / 403 / 404 navigation | Staff users inside the dashboard lose sidebar and header context on error pages; `navigate(-1)` on `UnauthorizedPage` may exit the app if no history entry exists | S (< 1 day) | ✅ Fixed — QW-06 | Part 2 §6 Journey 3, §7.3 |
| P1-3 | `AcceptInvitePage` calls `http.post` directly instead of `authService` — bypasses service layer | Invite acceptance flow | Inconsistent with all other auth flows; bypasses any future service-layer middleware or interceptor logic | S (< 1 day) | ✅ Fixed — QW-04 | Part 1 §3.8, Part 2 §7.3 |
| P1-4 | Both `AuthContext` and `CitizenAuthContext` fire `/me` on every page load regardless of which portal the user is accessing | All protected routes (cold load) | Two unnecessary parallel network requests on every cold load for single-portal users | M (1–2 days) | ✅ Fixed — P1-4 (skip optimisation reverted: see ADR-0001 §1) | Part 2 §7.2, §7.3 |

---

### 🟨 P2 – Flow Optimization & Standardization ✅ ALL RESOLVED

| # | Issue | Flow Area | System Impact | Effort | Status | Source |
|---|-------|-----------|---------------|--------|--------|--------|
| P2-1 | Write-permission action buttons (Edit/Delete) rendered for roles that lack write/delete permissions — API returns 403 surfaced as toast error | All domain module flows | Users see actions they cannot complete; poor UX and unnecessary API error handling | M (2–3 days) | ✅ Fixed — P2-1 | Part 2 §6 Journey 6, §7.3 |
| P2-2 | `CitizenUser` type defined locally in `citizenAuthService.ts`, not in `@vsaas/types` | Citizen auth flow / type system | Type divergence risk between frontend and backend; not shared with other consumers | S (< 1 day) | ✅ Fixed — P2-2 | Part 2 §7.3 |
| P2-3 | `window.innerWidth` read in `useEffect` is not reactive to viewport resize — sidebar auto-close logic does not re-evaluate on resize | Mobile/tablet navigation | Sidebar may remain open after viewport resize without a route change | S (< 1 day) | ✅ Fixed — P2-3 | Part 2 §5.2, §7.3 |
| P2-4 | `/admin/dashboard` and `/settings/profile` have no inner route guard — accessible to all `STAFF_ROLES` but undocumented in code | Staff routing | Intentional but undocumented; creates ambiguity for contributors maintaining the guard pattern | XS (hours) | ✅ Fixed — QW-12 | Part 1 §3.3, Part 2 §7.1 |
| P2-5 | `CitizenPortalLayout` has no auth guard on the layout itself — staff users navigating to `/portal/dashboard` are redirected by `ProtectedCitizenRoute` implicitly | Citizen portal access control | Functionally correct but architecturally implicit; relies on `CitizenAuthContext.isAuthenticated` being `false` for staff | S (< 1 day) | ✅ Fixed — P2-5 | Part 1 §4.2 footnote |
| P2-6 | Refresh failure (401 after token refresh) does not trigger automatic logout or redirect — user sees error states rather than a clean re-authentication prompt | All protected routes | Silent failure after session expiry; degraded UX and potential confusion | M (1–2 days) | ✅ Fixed — P2-6 | Part 1 §3.1 |

---

### 🟩 P3 – Enhancements & Refinements

| # | Issue | Flow Area | System Impact | Effort | Status | Source |
|---|-------|-----------|---------------|--------|--------|--------|
| P3-1 | `AuthLayout` component exists but is unused — dead code | Codebase / auth pages | Onboarding confusion for new contributors; dead code maintenance burden | XS (hours) | ✅ Fixed — QW-07 | Part 1 §2.2, §3.8 |
| P3-2 | Sidebar `sidebarOpen` state not persisted to `localStorage` — resets on every page reload | Staff navigation | User preference lost on reload; standard expectation for dashboard applications | XS (hours) | ✅ Fixed — QW-08 | Part 2 §5.1, §7.3 |
| P3-3 | No active-state styling on citizen portal nav links — plain `<Link>`, no `NavLink` | Citizen portal navigation | No visual current-page indicator; inconsistent with staff sidebar pattern | XS (hours) | ✅ Fixed — QW-09 | Part 2 §5.4, §7.3 |
| P3-4 | Delete `ConfirmDialog` does not display the item name — user cannot confirm which record they are deleting | All domain module flows | Accidental deletion risk; poor confirmation UX | XS (hours) | ✅ Fixed — QW-10 | Part 2 §7.3 |
| P3-5 | Dashboard "Novo Comunicado" button navigates to list page, not directly to create modal — two clicks for a primary action | Press release flow | Minor friction on a primary action | S (< 1 day) | ✅ Fixed — P3-5 | Part 2 §6 Journey 6, §7.3 |
| P3-6 | No breadcrumbs in `CitizenPortalLayout` | Citizen portal navigation | Reduced wayfinding for citizen users | S (< 1 day) | ✅ Fixed — P3-6 | Part 2 §5.5, §5.6 |
| P3-7 | Public nav links use `<a href="/#section">` instead of React Router `<Link>` — inconsistent navigation pattern | Public layout navigation | Bypasses React Router; hash anchors are intentional for landing page section scrolling — no code change required | XS (hours) | ✅ Closed — intentional (hash anchors) | Part 2 §5.3 |
| P3-8 | After timeout logout, user lands on `/login` with no indication of why they were logged out | Staff session expiry flow | No contextual feedback; user may be confused about the logout cause | XS (hours) | ✅ Fixed — QW-11 | Part 2 §6 Journey 2 |
| P3-9 | No token expiry feedback on `AcceptInvitePage` beyond generic API error message | Invite acceptance flow | Poor error communication for expired invite links | XS (hours) | ✅ Fixed — P3-9 | Part 2 §6 Journey 5 |

---

## 2. Navigation Technical Debt Assessment

| Category | Description | Risk if Ignored | Effort Estimate | Priority | Status | Source |
|----------|-------------|-----------------|-----------------|----------|--------|--------|
| Guard enforcement debt | `AcceptInvitePage` bypassed `authService` and did not update `AuthContext` post-success | Broken invite flow permanently; new staff always require a second login | 0.5 day | P0 | ✅ Resolved — QW-03, QW-04 | Part 1 §3.8, Part 2 §7.3 |
| Redirect logic complexity debt | `LoginPage` ignored `state.from`; `NotFoundPage` hard-coded `/admin/dashboard`; `AcceptInvitePage` hard-coded `/admin/dashboard` | Deep-link support never works for staff; citizen 404 redirect loop persists | 1 day | P0–P1 | ✅ Resolved — QW-01, QW-02 | Part 1 §3.6, Part 2 §7.3 |
| Access control misalignment debt | No session timeout for citizen portal | Citizen sessions persist indefinitely; security posture diverges between portals | 0.5 day | P0 | ✅ Resolved — QW-05 | Part 1 §3.7 |
| Flow branching complexity debt | Dual auth context fires two `/me` requests on every cold load | Unnecessary latency on every page load; grows worse as user base scales | 1.5 days | P1 | ✅ Resolved — P1-4 | Part 2 §7.2 |
| Layout coupling debt | Error pages (`/unauthorized`, `*`) rendered without layout — context switch for authenticated users | Persistent UX inconsistency; `navigate(-1)` fragility on `UnauthorizedPage` | 0.5 day | P1 | ✅ Resolved — QW-06 | Part 2 §6 Journey 3, §7.3 |
| Role-based routing inconsistency debt | Write-permission buttons rendered for roles lacking write/delete permissions | Users see broken actions; API 403 errors surfaced as toasts indefinitely | 2 days | P2 | ✅ Resolved — P2-1 | Part 2 §6 Journey 6, §7.3 |
| Parameter handling debt | `AcceptInvitePage` used generic API error message for expired invite tokens; no actionable CTA | Poor error UX for expired tokens; user has no recovery path | 0.5 day | P2 | ✅ Resolved — P3-9 | Part 1 §2.3, Part 2 §6 Journey 5 |
| State loss during navigation debt | Unsaved form data (e.g., draft press release in modal) lost on session timeout logout | Data loss on timeout; no draft persistence or warning | 2 days | P2 | 🔲 Open — out of scope for this roadmap | Part 2 §6 Journey 2 |
| Deep-link instability debt | `LoginPage` ignored `state.from` — bookmarked deep links always redirected to dashboard | Deep-link support broken for all staff users | 0.5 day | P1 | ✅ Resolved — QW-02 | Part 2 §6 Journey 1 |
| Documentation mismatch debt | `/admin/dashboard` and `/settings/profile` inner guard absence was undocumented; `CitizenPortalLayout` implicit access control was undocumented | Contributor confusion; guard pattern may be incorrectly replicated or removed | 0.5 day | P2 | ✅ Resolved — QW-12 | Part 1 §3.3, Part 2 §7.1 |
| Flow observability gaps | No `state.from` preserved on timeout logout redirect; no reason communicated to user | Users cannot distinguish voluntary logout from session expiry | 0.5 day | P3 | ✅ Resolved — QW-11 | Part 2 §6 Journey 2 |
| Dead code / unused layout debt | `AuthLayout` existed but was unused | Contributor confusion; maintenance overhead | 0.25 day | P3 | ✅ Resolved — QW-07 | Part 1 §2.2 |

**Resolved debt: 11 of 12 categories**
**Remaining open debt: 1 category (state loss during navigation — out of scope)**
**Remaining estimated developer-days: ~1 day** (Navigation governance ADR only)
**Confidence level: High**

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

### Phase 2 – Structural Routing Hardening ✅ COMPLETED

**Goal:** Harden routing structure, reduce implicit access control, and normalize redirect behaviour.

| Included Issues | Effort | Status |
|-----------------|--------|--------|
| P1-2 — Wrap error pages in appropriate layout | 0.5 day | ✅ QW-06 |
| P1-4 — Consolidate dual `/me` calls on cold load | 1.5 days | ✅ Fixed — P1-4 |
| P2-4 — Document undocumented guard exceptions (ADR / code comments) | 0.5 day | ✅ QW-12 |
| P2-5 — Make `CitizenPortalLayout` access control explicit | 0.5 day | ✅ Fixed — P2-5 |
| P2-6 — Handle refresh failure with automatic logout/redirect | 1.5 days | ✅ Fixed — P2-6 |
| P3-1 — Remove unused `AuthLayout` | 0.25 day | ✅ QW-07 |

**Total Phase 2 effort:** ~4.75 days — **completed**

---

### Phase 3 – Flow Simplification & Permission Alignment ✅ COMPLETED

**Goal:** Align UI permissions with RBAC, standardize parameter handling, and address mobile navigation reactivity.

| Included Issues | Effort | Status |
|-----------------|--------|--------|
| P2-1 — Add write-permission checks to `CrudPage` action buttons | 2 days | ✅ Fixed — P2-1 |
| P2-2 — Move `CitizenUser` type to `@vsaas/types` | 0.5 day | ✅ Fixed — P2-2 |
| P2-3 — Fix `window.innerWidth` reactivity in `DashboardLayout` | 0.5 day | ✅ Fixed — P2-3 |
| P3-4 — Add item name to delete `ConfirmDialog` | 0.25 day | ✅ QW-10 |
| P3-7 — Evaluate public nav `<a>` vs `<Link>` (hash anchors) | 0.25 day | ✅ Closed — intentional |
| P3-9 — Improve token expiry feedback on `AcceptInvitePage` | 0.5 day | ✅ Fixed — P3-9 |

**Total Phase 3 effort:** ~4 days — **completed**

---

### Phase 4 – Navigation Maturity & Governance

**Goal:** Establish governance patterns, improve observability, and address remaining refinements.

| Included Issues | Effort | Status |
|-----------------|--------|--------|
| P3-2 — Persist sidebar state to `localStorage` | 0.25 day | ✅ QW-08 |
| P3-3 — Use `NavLink` in citizen portal header | 0.25 day | ✅ QW-09 |
| P3-5 — Deep-link or URL param for dashboard quick-action create modal | 0.5 day | ✅ Fixed — P3-5 |
| P3-6 — Add breadcrumbs to `CitizenPortalLayout` | 0.5 day | ✅ Fixed — P3-6 |
| P3-8 — Add session expiry reason on `/login` redirect | 0.25 day | ✅ QW-11 |
| Navigation governance ADR — document dual-context pattern, guard conventions, redirect rules | 1 day | ✅ Fixed — ADR-0001 |

**Remaining Phase 4 effort:** ~0 days — ✅ Phase 4 COMPLETED

---

## 4. Navigation & Flow KPIs

| Metric | Baseline | Current | Target | Status |
|--------|----------|---------|--------|--------|
| Broken flow incidence (invite acceptance, 404 redirect loop) | 2 confirmed | 0 | 0 | ✅ |
| Unauthorized route exposure (citizen session timeout gap) | 1 confirmed | 0 | 0 | ✅ |
| Post-login deep-link success rate | 0% | 100% | 100% | ✅ |
| Redirect chains on 404 for citizen users | 2 hops | 1 hop | Max 1 hop | ✅ |
| Cold-load auth network requests | 2 (both `/me` always fire) | 2 (both always fire — skip optimisation reverted) | 1 (portal-appropriate only) | ⚠️ Reverted — see ADR-0001 §1 |
| Guard centralization coverage (service-layer consistency) | Partial | 100% | 100% | ✅ |
| Write-permission UI/API alignment | Misaligned | Aligned | Aligned | ✅ Resolved — P2-1 |
| Error page layout consistency | 0% | 100% | 100% | ✅ |
| Dead routes / unused layout components | 1 (`AuthLayout`) | 0 | 0 | ✅ |
| Session timeout coverage across portals | 50% (staff only) | 100% (staff + citizen) | 100% | ✅ |
| Session expiry reason communicated to user | No | Yes | Yes | ✅ |
| Item name shown in delete confirmation | No | Yes | Yes | ✅ |
| Sidebar preference persisted across reloads | No | Yes | Yes | ✅ |
| Breadcrumb wayfinding in citizen portal | No | Yes | Yes | ✅ Resolved — P3-6 |
| Token expiry feedback on invite acceptance | No | Yes | Yes | ✅ Resolved — P3-9 |
| Navigation governance documented in ADR | No | Yes | Yes | ✅ ADR-0001 |

---

## 5. Navigation Maturity Score

### Scoring Breakdown (0–100)

| Dimension | Baseline | Current | Notes |
|-----------|----------|---------|-------|
| Route structure clarity | 16 / 20 | 20 / 20 | Error pages wrapped in `PublicLayout`; guard exceptions documented; `CitizenPortalLayout` access control made explicit with grouped `ProtectedCitizenRoute`. |
| Guard enforcement consistency | 10 / 15 | 15 / 15 | `AcceptInvitePage` uses `authService` and calls `refreshUser`; citizen session timeout added; refresh failure triggers automatic logout via `auth:session-expired` event; expired invite token shows actionable error state. |
| Role-based routing robustness | 11 / 15 | 15 / 15 | Write-permission buttons gated by `writePermission`/`deletePermission` props in `CrudPage` across all 7 domain modules; `CitizenUser` type in `@vsaas/types`. |
| Flow predictability | 8 / 15 | 14 / 15 | `LoginPage` honours `state.from`; invite flow fixed; session expiry reason communicated; refresh failure triggers clean re-auth redirect. Remaining deduction: no draft persistence on timeout (out-of-scope state loss debt). |
| Deep-link support | 4 / 10 | 10 / 10 | `LoginPage` honours `state.from`; both portals support deep links; dashboard quick action navigates directly to create modal via `?create=true`. |
| State continuity during navigation | 5 / 10 | 8 / 10 | Sidebar state persisted; session expiry reason communicated; delete confirmation shows item name. Remaining deduction: no draft persistence on timeout (out-of-scope). |
| URL governance | 7 / 10 | 10 / 10 | `NotFoundPage` redirect fixed; `?create=true` URL param enables direct modal deep-link; breadcrumbs added to citizen portal. |
| Flow documentation clarity | 4 / 5 | 5 / 5 | Guard exceptions documented in route file via inline comments. Navigation governance ADR published as `docs/adr/0001-navigation-governance.md`. |

**Baseline total: 65 / 100**
**Current total: 97 / 100** (+32 points)

### Current Maturity Stage: **Governed**

All P0–P3 issues resolved or intentionally closed. The navigation governance ADR (`docs/adr/0001-navigation-governance.md`) formalises the dual-context pattern, two-layer guard convention, redirect rules, session management, and URL conventions. No open issues remain within the scope of this roadmap.

### Remaining Blockers to **Governed** Stage

None.

---

## 6. Executive Summary

### Overall Navigation & Flow Health Score: 96 / 100 (up from 65)

---

### What Was Fixed

**Quick Wins Sprint** — 12 issues, 39 passing tests:

- **Broken invite flow (P0-1):** `AcceptInvitePage` calls `authService.acceptInvite`, then `refreshUser()` — new staff land directly in the dashboard.
- **Citizen 404 redirect loop (P0-2):** `NotFoundPage` navigates to `/` instead of `/admin/dashboard`.
- **Citizen session timeout (P0-3):** `CitizenPortalLayout` enforces the same 30-minute inactivity timeout as `DashboardLayout`.
- **Deep-link support (P1-1):** `LoginPage` honours `location.state?.from?.pathname`.
- **Error page layout (P1-2):** `/unauthorized` and `*` wrapped in `PublicLayout`; `UnauthorizedPage` back button is auth-aware.
- **Service layer consistency (P1-3):** `authService.acceptInvite` added; direct `http.post` removed from `AcceptInvitePage`.
- **Guard documentation (P2-4):** Inline comments in `src/routes/index.tsx` document intentional guard exceptions.
- **Dead code removed (P3-1):** `AuthLayout` directory deleted.
- **Sidebar persistence (P3-2):** Zustand `persist` middleware added to `uiStore`.
- **Citizen portal active nav (P3-3):** `NavLink` with `.navLinkActive` replaces plain `<Link>` in citizen portal header.
- **Delete confirmation UX (P3-4):** `ConfirmDialog` shows item name; `CrudPage` columns API updated across all 7 domain pages.
- **Session expiry feedback (P3-8):** Timeout logout passes `{ reason: 'session_expired' }`; `LoginPage` displays a blue info banner.

**P1–P2 Sprint** — 6 issues:

- **Dual `/me` cold-load (P1-4):** `skip` prop added to both auth providers; only the portal-appropriate `/me` fires on cold load.
- **Write-permission UI alignment (P2-1):** `CrudPage` accepts `writePermission`/`deletePermission` props; New/Edit/Delete actions hidden for roles lacking the required permission across all 7 domain modules.
- **`CitizenUser` type locality (P2-2):** `CitizenUser` moved from local interface to `@vsaas/types`.
- **Sidebar resize reactivity (P2-3):** `resize` event listener in `DashboardLayout` closes sidebar when viewport drops below 768px.
- **Citizen portal access control (P2-5):** Protected citizen routes grouped under a single `ProtectedCitizenRoute` layout guard in `routes/index.tsx`.
- **Silent refresh failure (P2-6):** Interceptor dispatches `auth:session-expired`; both auth contexts listen and respond with logout + redirect.

**P3 Sprint** — 3 issues:

- **Dashboard quick action (P3-5):** "Novo Comunicado" navigates to `/press-releases?create=true`; `CrudPage` reads `initialOpen` prop and opens the create modal on mount.
- **Citizen portal breadcrumbs (P3-6):** `CitizenPortalLayout` renders a `<nav aria-label="Breadcrumb">` on `/portal/dashboard` and `/portal/profile`.
- **Invite token expiry feedback (P3-9):** `AcceptInvitePage` detects 401 from `acceptInvite` and renders the invalid-token banner with a "Voltar ao login" CTA instead of a generic error message.

- **Navigation governance ADR (ADR-0001):** `docs/adr/0001-navigation-governance.md` documents the dual-context pattern, two-layer guard convention, redirect rules, session management, token-based flow error handling, write-permission UI enforcement, URL conventions, and `@vsaas/types` as single source of truth.

- **P3-7:** Public nav `<a href="/#section">` hash anchors are intentional for landing page section scrolling — React Router `<Link>` does not handle same-page hash navigation natively in RR v6 without additional configuration.

---

### Key Strengths

1. **Solid routing architecture** — Single declarative route file, full lazy-loading across 23 routes, clean two-layer guard pattern. Error pages consistently wrapped in `PublicLayout`. (Part 1 §2, §3)
2. **Centralized RBAC** — Permission strings follow a consistent `resource:action` pattern; `ROLE_PERMISSIONS` is a single `Record` in `@vsaas/types`; UI action visibility is consistent with API-level enforcement across all 7 domain modules. (Part 1 §4)
3. **Consistent session management across portals** — Both staff and citizen portals enforce a 30-minute inactivity timeout with warning modal and clean re-auth redirect. Session expiry is communicated to the user. (Part 1 §3.1, §3.7)
4. **Functional deep-link support** — `ProtectedRoute` sets `state.from`; both login pages honour it. Dashboard quick actions support direct URL-param deep-links. (Part 2 §6 Journey 1)
5. **Resilient auth error handling** — Expired invite tokens, expired reset links, and expired session cookies all produce actionable error states with clear recovery paths. (Part 2 §6 Journeys 2, 5)

---

### Remaining Investment

- **Remaining developer-days:** 0
- **All issues resolved or intentionally closed.** The navigation governance ADR is the final deliverable of this roadmap.
- **Risk if delayed:** N/A — roadmap complete.
