# Navigation & User Flow Improvement Roadmap
**Secom vSaaS · Strictly scoped to `navigation-userflows-part-1.md` and `navigation-userflows-part-2.md`**

---

## 1. Prioritized Navigation & Flow Issues

### Severity Criteria
- 🟥 P0 — Broken flows, access leaks, data loss during navigation, critical guard failures
- 🟧 P1 — Long-term maintainability or routing complexity risk
- 🟨 P2 — Structural standardization opportunity
- 🟩 P3 — Optimization or clarity improvement

---

### 🟥 P0 – Flow Instability / Access Control Risk

| # | Issue | Flow Area | System Impact | Effort | Dependencies | Source |
|---|-------|-----------|---------------|--------|--------------|--------|
| P0-1 | `AcceptInvitePage` navigates to `/admin/dashboard` without updating `AuthContext` — user is immediately redirected to `/login` | Invite acceptance flow | Broken onboarding flow; new staff cannot complete account setup without a second manual login | S (< 1 day) | `AuthContext.refreshUser()` | Part 1 §3.8, Part 2 §7.3 |
| P0-2 | `NotFoundPage` "back to home" hard-codes `/admin/dashboard` — citizen users hitting a 404 are sent to a staff route, triggering a redirect loop | 404 / error navigation | Redirect loop for citizen users; broken error recovery path | XS (hours) | None | Part 1 §3.8, Part 2 §7.3 |
| P0-3 | No session timeout in `CitizenPortalLayout` — citizen sessions persist indefinitely on inactive tabs | Citizen portal session management | Security exposure; inconsistent session lifecycle between staff and citizen portals | S (< 1 day) | `useSessionTimeout` hook | Part 1 §3.7, Part 2 §7.3 |

---

### 🟧 P1 – Structural Navigation Risks

| # | Issue | Flow Area | System Impact | Effort | Dependencies | Source |
|---|-------|-----------|---------------|--------|--------------|--------|
| P1-1 | `LoginPage` ignores `location.state.from` — always redirects to `/admin/dashboard` regardless of the originally requested URL | Staff authentication flow | Users who bookmark deep links lose their intended destination after login; `state.from` is set correctly by `ProtectedRoute` but discarded | S (< 1 day) | None | Part 2 §6 Journey 1, §7.3 |
| P1-2 | `UnauthorizedPage` and `NotFoundPage` render without any layout wrapper — jarring context switch for authenticated users | Error / 403 / 404 navigation | Staff users inside the dashboard lose sidebar and header context on error pages; `navigate(-1)` on `UnauthorizedPage` may exit the app if no history entry exists | S (< 1 day) | Layout decision | Part 2 §6 Journey 3, §7.3 |
| P1-3 | `AcceptInvitePage` calls `http.post` directly instead of `authService` — bypasses service layer | Invite acceptance flow | Inconsistent with all other auth flows; bypasses any future service-layer middleware or interceptor logic | S (< 1 day) | `authService` refactor | Part 1 §3.8, Part 2 §7.3 |
| P1-4 | Both `AuthContext` and `CitizenAuthContext` fire `/me` on every page load regardless of which portal the user is accessing | All protected routes (cold load) | Two unnecessary parallel network requests on every cold load for single-portal users | M (1–2 days) | Session storage flag or portal detection | Part 2 §7.2, §7.3 |

---

### 🟨 P2 – Flow Optimization & Standardization

| # | Issue | Flow Area | System Impact | Effort | Dependencies | Source |
|---|-------|-----------|---------------|--------|--------------|--------|
| P2-1 | Write-permission action buttons (Edit/Delete) rendered for roles that lack write/delete permissions — API returns 403 surfaced as toast error | All domain module flows | Users see actions they cannot complete; poor UX and unnecessary API error handling | M (2–3 days) | `PermissionGate` / `hasPermission()` at `CrudPage` level | Part 2 §6 Journey 6, §7.3 |
| P2-2 | `CitizenUser` type defined locally in `citizenAuthService.ts`, not in `@vsaas/types` | Citizen auth flow / type system | Type divergence risk between frontend and backend; not shared with other consumers | S (< 1 day) | `@vsaas/types` package | Part 2 §7.3 |
| P2-3 | `window.innerWidth` read in `useEffect` is not reactive to viewport resize — sidebar auto-close logic does not re-evaluate on resize | Mobile/tablet navigation | Sidebar may remain open after viewport resize without a route change | S (< 1 day) | `ResizeObserver` or `matchMedia` | Part 2 §5.2, §7.3 |
| P2-4 | `/admin/dashboard` and `/settings/profile` have no inner route guard — accessible to all `STAFF_ROLES` but undocumented in code | Staff routing | Intentional but undocumented; creates ambiguity for contributors maintaining the guard pattern | XS (hours) | Code comment / ADR | Part 1 §3.3, Part 2 §7.1 |
| P2-5 | `CitizenPortalLayout` has no auth guard on the layout itself — staff users navigating to `/portal/dashboard` are redirected by `ProtectedCitizenRoute` implicitly | Citizen portal access control | Functionally correct but architecturally implicit; relies on `CitizenAuthContext.isAuthenticated` being `false` for staff | S (< 1 day) | None (or explicit guard) | Part 1 §4.2 footnote |
| P2-6 | Refresh failure (401 after token refresh) does not trigger automatic logout or redirect — user sees error states rather than a clean re-authentication prompt | All protected routes | Silent failure after session expiry; degraded UX and potential confusion | M (1–2 days) | Interceptor + `AuthContext` | Part 1 §3.1 |

---

### 🟩 P3 – Enhancements & Refinements

| # | Issue | Flow Area | System Impact | Effort | Dependencies | Source |
|---|-------|-----------|---------------|--------|--------------|--------|
| P3-1 | `AuthLayout` component exists but is unused — dead code | Codebase / auth pages | Onboarding confusion for new contributors; dead code maintenance burden | XS (hours) | None | Part 1 §2.2, §3.8 |
| P3-2 | Sidebar `sidebarOpen` state not persisted to `localStorage` — resets on every page reload | Staff navigation | User preference lost on reload; standard expectation for dashboard applications | XS (hours) | Zustand `persist` middleware | Part 2 §5.1, §7.3 |
| P3-3 | No active-state styling on citizen portal nav links — plain `<Link>`, no `NavLink` | Citizen portal navigation | No visual current-page indicator; inconsistent with staff sidebar pattern | XS (hours) | None | Part 2 §5.4, §7.3 |
| P3-4 | Delete `ConfirmDialog` does not display the item name — user cannot confirm which record they are deleting | All domain module flows | Accidental deletion risk; poor confirmation UX | XS (hours) | `CrudPage` prop | Part 2 §7.3 |
| P3-5 | Dashboard "Novo Comunicado" button navigates to list page, not directly to create modal — two clicks for a primary action | Press release flow | Minor friction on a primary action | S (< 1 day) | Deep-link or modal state via URL param | Part 2 §6 Journey 6, §7.3 |
| P3-6 | No breadcrumbs in `CitizenPortalLayout` | Citizen portal navigation | Reduced wayfinding for citizen users | S (< 1 day) | `Breadcrumbs` component | Part 2 §5.5, §5.6 |
| P3-7 | Public nav links use `<a href="/#section">` instead of React Router `<Link>` — inconsistent navigation pattern | Public layout navigation | Bypasses React Router; inconsistent pattern across layouts | XS (hours) | None (hash anchors are intentional for landing page) | Part 2 §5.3 |
| P3-8 | After timeout logout, user lands on `/login` with no indication of why they were logged out | Staff session expiry flow | No contextual feedback; user may be confused about the logout cause | XS (hours) | Query param or toast on redirect | Part 2 §6 Journey 2 |
| P3-9 | No token expiry feedback on `AcceptInvitePage` beyond generic API error message | Invite acceptance flow | Poor error communication for expired invite links | XS (hours) | API error code handling | Part 2 §6 Journey 5 |

---

## 2. Navigation Technical Debt Assessment

| Category | Description | Risk if Ignored | Effort Estimate | Priority | Source |
|----------|-------------|-----------------|-----------------|----------|--------|
| Guard enforcement debt | `AcceptInvitePage` bypasses `authService` and does not update `AuthContext` post-success | Broken invite flow permanently; new staff always require a second login | 0.5 day | P0 | Part 1 §3.8, Part 2 §7.3 |
| Redirect logic complexity debt | `LoginPage` ignores `state.from`; `NotFoundPage` hard-codes `/admin/dashboard`; `AcceptInvitePage` hard-codes `/admin/dashboard` | Deep-link support never works for staff; citizen 404 redirect loop persists | 1 day | P0–P1 | Part 1 §3.6, Part 2 §7.3 |
| Access control misalignment debt | No session timeout for citizen portal | Citizen sessions persist indefinitely; security posture diverges between portals | 0.5 day | P0 | Part 1 §3.7 |
| Flow branching complexity debt | Dual auth context fires two `/me` requests on every cold load | Unnecessary latency on every page load; grows worse as user base scales | 1.5 days | P1 | Part 2 §7.2 |
| Layout coupling debt | Error pages (`/unauthorized`, `*`) render without layout — context switch for authenticated users | Persistent UX inconsistency; `navigate(-1)` fragility on `UnauthorizedPage` | 0.5 day | P1 | Part 2 §6 Journey 3, §7.3 |
| Role-based routing inconsistency debt | Write-permission buttons rendered for roles lacking write/delete permissions | Users see broken actions; API 403 errors surfaced as toasts indefinitely | 2 days | P2 | Part 2 §6 Journey 6, §7.3 |
| Parameter handling debt | `AcceptInvitePage` and `ResetPasswordPage` use `?token=` query params with no expiry feedback beyond generic API error | Poor error UX for expired tokens; no structured error handling | 0.5 day | P2 | Part 1 §2.3, Part 2 §6 Journey 5 |
| State loss during navigation debt | Unsaved form data (e.g., draft press release in modal) lost on session timeout logout | Data loss on timeout; no draft persistence or warning | 2 days | P2 | Part 2 §6 Journey 2 |
| Deep-link instability debt | `LoginPage` ignores `state.from` — bookmarked deep links always redirect to dashboard | Deep-link support broken for all staff users | 0.5 day | P1 | Part 2 §6 Journey 1 |
| Documentation mismatch debt | `/admin/dashboard` and `/settings/profile` inner guard absence is undocumented; `CitizenPortalLayout` implicit access control is undocumented | Contributor confusion; guard pattern may be incorrectly replicated or removed | 0.5 day | P2 | Part 1 §3.3, Part 2 §7.1 |
| Flow observability gaps | No `state.from` preserved on timeout logout redirect; no reason communicated to user | Users cannot distinguish voluntary logout from session expiry | 0.5 day | P3 | Part 2 §6 Journey 2 |
| Dead code / unused layout debt | `AuthLayout` exists but is unused | Contributor confusion; maintenance overhead | 0.25 day | P3 | Part 1 §2.2 |

**Total estimated developer-days: ~10 days**
**Confidence level: Medium**
**Assumptions:**
- Estimates assume a developer familiar with the existing codebase (React Router v6, Zustand, TanStack Query).
- State loss / draft persistence (P2) is estimated conservatively at 2 days; a full autosave solution would be larger.
- Dual `/me` consolidation (P1-4) assumes a `sessionStorage` flag approach, not a full context refactor.
- Write-permission `CrudPage` changes (P2-1) assume a prop-based approach using existing `PermissionGate`/`hasPermission` utilities.

---

## 3. Phased Navigation & Flow Roadmap

> Assumes 3–5 frontend engineers, 2-week sprints, parallel work where flows are decoupled.

---

### Phase 1 – Stabilization (Weeks 1–2)

**Goal:** Eliminate broken flows, access control gaps, and critical redirect failures.

| Included Issues | Effort |
|-----------------|--------|
| P0-1 — Fix `AcceptInvitePage` post-success `AuthContext` update | 0.5 day |
| P0-2 — Fix `NotFoundPage` redirect target to `/` | 0.25 day |
| P0-3 — Add session timeout to `CitizenPortalLayout` | 0.5 day |
| P1-1 — Honour `state.from` in `LoginPage` | 0.5 day |
| P1-3 — Refactor `AcceptInvitePage` to use `authService` | 0.5 day |

**Total Phase 1 effort:** ~2.25 days
**Dependencies:** None — all items are self-contained.
**Risk mitigation impact:** Eliminates the broken invite flow (P0-1), the citizen 404 redirect loop (P0-2), and the indefinite citizen session security gap (P0-3).
**Business impact:** New staff can complete onboarding without a second login; citizen users have a coherent error recovery path; citizen session security is on par with staff.

---

### Phase 2 – Structural Routing Hardening (Weeks 3–6)

**Goal:** Harden routing structure, reduce implicit access control, and normalize redirect behaviour.

| Included Issues | Effort |
|-----------------|--------|
| P1-2 — Wrap error pages in appropriate layout | 0.5 day |
| P1-4 — Consolidate dual `/me` calls on cold load | 1.5 days |
| P2-4 — Document undocumented guard exceptions (ADR / code comments) | 0.5 day |
| P2-5 — Make `CitizenPortalLayout` access control explicit | 0.5 day |
| P2-6 — Handle refresh failure with automatic logout/redirect | 1.5 days |
| P3-1 — Remove unused `AuthLayout` | 0.25 day |

**Total Phase 2 effort:** ~4.75 days
**Dependencies:** P2-6 requires coordination with the interceptor and both auth contexts.
**Risk mitigation impact:** Eliminates silent session expiry failures (P2-6); removes implicit access control reliance (P2-5); reduces cold-load network overhead (P1-4).
**Business impact:** More predictable session lifecycle for all users; cleaner codebase for onboarding new contributors.

---

### Phase 3 – Flow Simplification & Permission Alignment (Weeks 7–10)

**Goal:** Align UI permissions with RBAC, standardize parameter handling, and address mobile navigation reactivity.

| Included Issues | Effort |
|-----------------|--------|
| P2-1 — Add write-permission checks to `CrudPage` action buttons | 2 days |
| P2-2 — Move `CitizenUser` type to `@vsaas/types` | 0.5 day |
| P2-3 — Fix `window.innerWidth` reactivity in `DashboardLayout` | 0.5 day |
| P3-4 — Add item name to delete `ConfirmDialog` | 0.25 day |
| P3-7 — Evaluate public nav `<a>` vs `<Link>` (hash anchors) | 0.25 day |
| P3-9 — Improve token expiry feedback on `AcceptInvitePage` | 0.5 day |

**Total Phase 3 effort:** ~4 days
**Dependencies:** P2-1 depends on `PermissionGate`/`hasPermission` utilities (already available).
**Risk mitigation impact:** Eliminates misleading UI actions for restricted roles (P2-1); improves type safety across the stack (P2-2).
**Business impact:** Users no longer encounter confusing 403 toast errors from visible-but-forbidden actions; mobile navigation is reliable across viewport changes.

---

### Phase 4 – Navigation Maturity & Governance (Weeks 11–14)

**Goal:** Establish governance patterns, improve observability, and address remaining refinements.

| Included Issues | Effort |
|-----------------|--------|
| P3-2 — Persist sidebar state to `localStorage` | 0.25 day |
| P3-3 — Use `NavLink` in citizen portal header | 0.25 day |
| P3-5 — Deep-link or URL param for dashboard quick-action create modal | 0.5 day |
| P3-6 — Add breadcrumbs to `CitizenPortalLayout` | 0.5 day |
| P3-8 — Add session expiry reason on `/login` redirect | 0.25 day |
| Navigation governance ADR — document dual-context pattern, guard conventions, redirect rules | 1 day |

**Total Phase 4 effort:** ~2.75 days
**Dependencies:** P3-6 depends on `Breadcrumbs` component (already exists in staff layout).
**Risk mitigation impact:** Establishes documented conventions preventing regression of fixed issues.
**Business impact:** Improved citizen portal wayfinding; consistent navigation experience across portals; documented patterns reduce future navigation debt accumulation.

---

## 4. Navigation & Flow KPIs

| Metric | Current State | Target | Measurement |
|--------|---------------|--------|-------------|
| Broken flow incidence (invite acceptance, 404 redirect loop) | 2 confirmed broken flows | 0 | QA flow audit |
| Unauthorized route exposure (citizen session timeout gap) | 1 confirmed gap | 0 | Security review |
| Post-login deep-link success rate | 0% (always redirects to `/admin/dashboard`) | 100% | Manual test / QA |
| Redirect chains on 404 for citizen users | 2 hops (`*` → `/admin/dashboard` → `/login`) | Max 1 hop | Route trace |
| Cold-load auth network requests | 2 (both `/me` endpoints always fire) | 1 (portal-appropriate only) | Network tab audit |
| Guard centralization coverage (service-layer consistency) | Partial (`AcceptInvitePage` bypasses `authService`) | 100% | Code review |
| Write-permission UI/API alignment | Misaligned (buttons visible for restricted roles) | Aligned | Permission audit |
| Error page layout consistency | 0% (no layout on `/unauthorized`, `*`) | 100% | Visual QA |
| Dead routes / unused layout components | 1 (`AuthLayout`) | 0 | Route audit |
| Session timeout coverage across portals | 50% (staff only) | 100% (staff + citizen) | Code review |

---

## 5. Navigation Maturity Score

### Scoring Breakdown (0–100)

| Dimension | Score | Notes |
|-----------|-------|-------|
| Route structure clarity | 16 / 20 | Single declarative file, clear layout nesting, full lazy-loading. Deductions: orphan error pages, undocumented guard exceptions. |
| Guard enforcement consistency | 10 / 15 | Dual-layer guard pattern is sound. Deductions: `AcceptInvitePage` bypasses `authService`; no session timeout for citizen portal. |
| Role-based routing robustness | 11 / 15 | Centralized `ROLE_PERMISSIONS`, consistent `PermissionGate` in sidebar. Deductions: write-permission buttons not gated in UI; `CitizenUser` type not in shared package. |
| Flow predictability | 8 / 15 | Most flows are predictable. Deductions: `LoginPage` ignores `state.from`; invite flow broken; refresh failure silent. |
| Deep-link support | 4 / 10 | `ProtectedRoute` sets `state.from` correctly but `LoginPage` discards it. Citizen login honours `state.from`. Net: partial. |
| State continuity during navigation | 5 / 10 | No draft persistence on timeout; sidebar state resets on reload; no session expiry reason communicated. |
| URL governance | 7 / 10 | Consistent URL patterns across modules. Deductions: `NotFoundPage` hard-coded redirect; no URL-based modal state for quick actions. |
| Flow documentation clarity | 4 / 5 | Part 1–2 provide thorough documentation. Minor deduction: undocumented guard exceptions in code. |

**Total: 65 / 100**

### Current Maturity Stage: **Structured**

The routing architecture is well-organized with a single declarative route file, centralized permissions, and consistent guard placement. It has not yet reached "Scalable" due to several broken flows, a missing citizen session timeout, and incomplete deep-link support.

### Key Blockers Preventing Next Level (Scalable)

1. Broken invite acceptance flow (P0-1) — a core onboarding path is non-functional.
2. `LoginPage` ignoring `state.from` (P1-1) — deep-link support is structurally in place but discarded at the last step.
3. No citizen session timeout (P0-3) — security posture is inconsistent across portals.
4. Silent refresh failure (P2-6) — session expiry is not communicated or handled gracefully.
5. Write-permission UI misalignment (P2-1) — RBAC is enforced at the API but not reflected in the UI.

---

## 6. Executive Summary

### Overall Navigation & Flow Health Score: 65 / 100

---

### Key Strengths

1. **Solid routing architecture** — A single declarative route file (~80 LOC), full lazy-loading across 23 routes, and a clean two-layer guard pattern (outer staff membership + inner module permission) provide a maintainable foundation. (Part 1 §2, §3)
2. **Centralized RBAC** — Permission strings follow a consistent `resource:action` pattern; `ROLE_PERMISSIONS` is a single `Record` in `@vsaas/types`; sidebar visibility is consistent with route-level access. No scattered role-check logic. (Part 1 §4)
3. **Consistent session management for staff** — The 30-minute inactivity timeout with a 2-minute warning modal, httpOnly cookie session, and CSRF interceptor represent a well-implemented staff security model. (Part 1 §3.1, §3.7)

---

### Major Navigation Risks

1. **Broken invite acceptance flow (P0-1)** — New staff members cannot complete onboarding without a second manual login. `AcceptInvitePage` navigates to a protected route without updating `AuthContext`, causing an immediate redirect to `/login`. This is a functional gap in a critical onboarding path. (Part 1 §3.8, Part 2 §6 Journey 5)
2. **No citizen session timeout (P0-3)** — Citizen sessions persist indefinitely on inactive tabs. The staff portal has a 30-minute timeout; the citizen portal has none. This is a security inconsistency that grows in risk as citizen portal usage scales. (Part 1 §3.7, Part 2 §7.2)
3. **Deep-link support structurally broken (P1-1 + P0-2)** — `ProtectedRoute` correctly captures `state.from` on redirect to `/login`, but `LoginPage` discards it and always navigates to `/admin/dashboard`. Additionally, `NotFoundPage` sends citizen users into a redirect loop via a hard-coded staff route. Both issues undermine navigation predictability. (Part 1 §3.6, Part 2 §6 Journey 1, §7.3)

---

### Estimated Investment

- **Total developer-days:** ~14 days (all four phases)
- **Timeline:** 14 weeks (4 phases × ~3.5 days average, with parallel work)
- **Minimum viable stabilization (Phase 1 only):** ~2.25 days, 1–2 weeks
- **Risk if delayed:** The broken invite flow (P0-1) and citizen session gap (P0-3) are active functional and security issues. Each sprint without Phase 1 completion means new staff onboarding requires a manual workaround and citizen sessions remain unprotected.

---

### Recommendation

**Moderate navigation refactor required.**

The routing foundation is sound and does not require structural redesign. The required work is targeted: fix three broken/insecure flows in Phase 1 (≈2 days), harden routing structure in Phase 2 (≈5 days), align UI permissions with RBAC in Phase 3 (≈4 days), and establish governance in Phase 4 (≈3 days). No route tree restructuring is needed. The highest-leverage action is completing Phase 1 immediately to unblock new staff onboarding and close the citizen session security gap.
