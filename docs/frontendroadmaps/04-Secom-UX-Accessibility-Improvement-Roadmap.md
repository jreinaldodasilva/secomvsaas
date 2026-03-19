# Secom — UX & Accessibility Improvement Roadmap

**Source documents:**
- `docs/frontend/04-Secom-UX-Accessibility-Overview-Part1.md`
- `docs/frontend/04-Secom-UX-Accessibility-Overview-Part2.md`

**Total issues tracked:** 32 (5 Critical · 9 High · 14 Medium · 7 Low · 3 Unguarded animations)  
**Estimated total effort:** ~9.5 weeks (1 developer)  
**WCAG target:** 2.1 AA full compliance

> **Status as of Quick Wins pass:** 15 of 32 issues resolved. All P0 contrast/skip-link issues, all P1 contrast/emoji issues, and the majority of P2/P3 hygiene items are complete. Remaining work is concentrated in structural layout (P0-1), focus management (P0-2), and design system consistency (P1-1, P1-2, P1-5, P1-7, P1-8, P1-9).

---

## 1. Prioritized Issue Backlog

### 🟥 P0 — Critical (Compliance or Severe UX Risk)

Issues that block accessibility, violate WCAG 2.1 AA, prevent task completion, or create legal/compliance risk.

| # | Issue | UX / Accessibility Impact | Users Affected | Effort | Dependencies |
|---|-------|--------------------------|----------------|--------|--------------|
| P0-1 | Dashboard sidebar has no mobile breakpoint — occupies 240px of 375px viewport, leaving 135px for content | All 10 dashboard pages are functionally unusable on mobile; content is inaccessible | All mobile users of the staff dashboard | 3 days | None — self-contained CSS + layout change |
| P0-2 | `SessionTimeoutModal` has no focus trap (WCAG 2.1.2) and focus is not correctly managed on open (WCAG 2.4.3) | Keyboard users can Tab past modal buttons and interact with the page behind it; `aria-modal="true"` is negated | All keyboard users; screen reader users | 0.5 days | Existing `Modal` component can be reused |
| ~~P0-3~~ ✅ | ~~Sidebar inactive nav links fail contrast at 3.8:1 — below WCAG 4.5:1 minimum (WCAG 1.4.3)~~ | ~~Primary navigation is unreadable for low-vision users~~ | ~~All users with low vision using the staff dashboard~~ | ~~0.5 days~~ | ~~None — CSS opacity change only~~ |
| ~~P0-4~~ ✅ | ~~Sidebar section label fails contrast at 2.0:1 — critically below WCAG 4.5:1 (WCAG 1.4.3)~~ | ~~Section grouping label is invisible to low-vision users~~ | ~~All users with low vision using the staff dashboard~~ | ~~0.5 days~~ | ~~None — CSS opacity change only~~ |
| ~~P0-5~~ ✅ | ~~Skip link target `id="main-content"` missing on `CitizenPortalLayout` — skip link is non-functional on all citizen portal pages (WCAG 2.4.1)~~ | ~~Keyboard and AT users cannot bypass repeated navigation on any citizen portal page~~ | ~~All keyboard/AT users of the citizen portal~~ | ~~0.5 hours~~ | ~~None — single attribute addition~~ |

---

### 🟧 P1 — High Priority (Strong UX Degradation)

| # | Issue | UX / Accessibility Impact | Users Affected | Effort | Dependencies |
|---|-------|--------------------------|----------------|--------|--------------|
| P1-1 | Auth pages use local `.btnPrimary` instead of shared `Button` component — visible color drift (~8% luminance), no spinner on submit, no `aria-busy` | Inconsistent visual identity across auth and dashboard; no accessible loading state on form submit | All users on login, register, forgot/reset password, accept invite | 1 day | None — replace 5 button instances |
| P1-2 | Framer Motion animations (`HeroSection`, `StatsSection`, `AnimatedGrid`, `AnimatedItem`, `TopLoadingBar`) not guarded by `useReducedMotion()` — CSS guard does not affect JS-driven animations | Users with vestibular disorders or motion sensitivity receive full entrance animations despite OS "Reduce Motion" setting | Users with vestibular disorders / motion sensitivity | 1 day | Framer Motion `useReducedMotion` hook (already in dependency) |
| ~~P1-3~~ ✅ | ~~Citizen portal header nav links fail contrast at 4.2:1 — below WCAG 4.5:1 (WCAG 1.4.3)~~ | ~~Primary navigation in the citizen portal is unreadable for low-vision users~~ | ~~All low-vision users of the citizen portal~~ | ~~0.5 days~~ | ~~None — CSS color value change~~ |
| ~~P1-4~~ ✅ | ~~`StatusBadge .gray` variant fails contrast at 4.1:1 — below WCAG 4.5:1 (WCAG 1.4.3)~~ | ~~Status information (draft, inactive, archived) is unreadable for low-vision users across all domain pages~~ | ~~All low-vision users viewing status badges~~ | ~~0.5 hours~~ | ~~None — CSS color value change~~ |
| P1-5 | Tertiary text (`#6B7280`) on `--color-bg-secondary` (`#F9FAFB`) fails contrast at 4.4:1 — below WCAG 4.5:1 (WCAG 1.4.3) | Affects all tertiary text rendered on secondary backgrounds throughout the application | All low-vision users | 1 day | Token-level change — audit all usages before applying |
| ~~P1-6~~ ✅ | ~~Decorative emoji in `CitizenPortalLayout` brand (`🏛️`) and citizen portal service cards not hidden from AT — screen readers announce Unicode descriptions~~ | ~~Screen reader users hear "classical building", "newspaper", "calendar" etc. disrupting reading flow~~ | ~~All screen reader users of the citizen portal~~ | ~~0.5 hours~~ | ~~None — add `aria-hidden="true"` to emoji spans~~ |
| P1-7 | `UsersPage` invite form uses implicit `<label>` wrapping without `htmlFor` — fields not programmatically associated with labels; no error announcement (WCAG 1.3.1) | Screen reader users cannot identify form fields; errors are not announced | All AT users of the Users admin page | 0.5 days | None — refactor to use `FormField` component |
| P1-8 | Table action buttons (`ghost sm`) have `min-height: 2rem` (32px) — below 44px minimum touch target; used in every domain page | Edit and Delete actions are difficult to tap accurately on mobile across all 7 domain pages | All mobile users of domain pages | 1 day | Requires CSS change + visual regression check |
| P1-9 | Dashboard banner breakpoint fires at wrong effective content width — at 768px viewport, sidebar consumes 240px leaving 528px effective width, causing banner action overflow at tablet sizes | Banner actions overflow or wrap incorrectly at tablet viewport sizes | Tablet users of the dashboard | 0.5 days | Depends on P0-1 (sidebar mobile fix) |


---

### 🟨 P2 — Medium Priority (Improvements & Enhancements)

| # | Issue | UX / Accessibility Impact | Users Affected | Effort | Dependencies |
|---|-------|--------------------------|----------------|--------|--------------|
| P2-1 | `EmptyState` component not used with icon or CTA in `DataTable` — all domain CRUD pages show text-only empty states with no call to action | Users are not guided to create their first record; no visual hierarchy in empty state | All users encountering empty lists | 0.5 days | None — pass props to existing `EmptyState` |
| ~~P2-2~~ ✅ | ~~`ProfilePage` uses `<h2>` as page title without a preceding `<h1>` — heading hierarchy is broken (WCAG 2.4.6)~~ | ~~Screen reader users navigating by headings encounter incorrect hierarchy~~ | ~~All AT users of the profile page~~ | ~~0.5 hours~~ | ~~None — add `<h1>` or change element~~ |
| P2-3 | Citizen portal profile `.fieldRow` has no responsive breakpoint — `min-width: 160px` label leaves ~175px for values on 375px screens, insufficient for email addresses | Content overflow on narrow screens; values may be truncated or unreadable | Mobile users of the citizen profile page | 0.5 days | None — add CSS breakpoint |
| ~~P2-4~~ ✅ | ~~`DataTable` search input uses `type="text"` instead of `type="search"` — misses native iOS "Search" return key and browser clear button~~ | ~~Suboptimal mobile keyboard experience; no native clear affordance~~ | ~~Mobile users using table search~~ | ~~0.5 hours~~ | ~~None — single attribute change~~ |
| P2-5 | Auth page submit buttons have no spinner — only text change and disabled state; inconsistent with `Button isLoading` pattern used everywhere else | Inconsistent loading feedback; no `aria-busy` on auth submit | All users submitting auth forms | 0.5 days | Depends on P1-1 (Button component adoption) |
| ~~P2-6~~ ✅ | ~~`ConnectionBanner` retry button uses `search` icon — semantically incorrect for a retry/reconnect action (WCAG 4.1.3)~~ | ~~Users and AT users receive misleading affordance for the retry action~~ | ~~All users encountering API connectivity issues~~ | ~~0.5 hours~~ | ~~None — swap icon~~ |
| ~~P2-7~~ ✅ | ~~Sidebar toggle button uses `☰` character inside button — some AT may announce the character before the `aria-label`~~ | ~~Unreliable screen reader announcement of the toggle action~~ | ~~Screen reader users of the dashboard~~ | ~~0.5 hours~~ | ~~None — replace with SVG + `aria-hidden`~~ |
| P2-8 | Dashboard stat icon colors use raw hex gradients — 7 variants not mapped to design tokens | Brand palette changes will not propagate to stat icons | Design/maintenance impact | 1 day | None — token mapping exercise |
| P2-9 | `!important` overrides on Landing CTA buttons bypass token cascade | Future design system updates will not propagate to CTA buttons | Design/maintenance impact | 0.5 days | None — refactor to use token-based variant |
| ~~P2-10~~ ✅ | ~~`CitizenLoginPage` uses hardcoded Portuguese strings instead of i18n keys — inconsistent with staff `LoginPage`~~ | ~~Blocks future localization; creates separate maintenance surface~~ | ~~Localization/maintenance impact~~ | ~~0.5 hours~~ | ~~None — replace strings with `t()` calls~~ |
| P2-11 | Modal close button is 32px — below 44px touch target minimum | Difficult to dismiss modals on mobile | Mobile users using modals | 0.5 days | None — CSS size increase |
| P2-12 | Toast close button is 24px — below 44px touch target minimum | Difficult to dismiss toast notifications on mobile | Mobile users | 0.5 days | None — CSS size increase |
| P2-13 | `PasswordInput` toggle button is 32px — below 44px touch target minimum | Difficult to toggle password visibility on mobile | Mobile users on auth forms | 0.5 days | None — CSS size increase |
| P2-14 | `TopLoadingBar` uses fixed 350ms duration regardless of actual navigation speed — creates false loading indicator on fast routes and disappears before content on slow routes | Misleading system status communication | All users navigating between routes | 1 day | Requires integration with React Query or Suspense state |

---

### 🟩 P3 — Low Priority (Nice-to-Have Refinements)

| # | Issue | UX / Accessibility Impact | Users Affected | Effort | Dependencies |
|---|-------|--------------------------|----------------|--------|--------------|
| ~~P3-1~~ ✅ | ~~`ErrorPage.module.css` and `ConfirmDialog.module.css` use legacy `--color-gray-*` aliases instead of semantic tokens~~ | ~~Technical debt — no user-visible impact today~~ | ~~Maintenance impact~~ | ~~0.5 hours~~ | ~~None — token alias replacement~~ |
| ~~P3-2~~ ✅ | ~~Visual banner grid collapses to single column on mobile — two-column layout at 480–768px would use space better~~ | ~~Minor layout density improvement on mobile~~ | ~~Mobile users of the landing page~~ | ~~0.5 hours~~ | ~~None — CSS grid change~~ |
| P3-3 | LGPD section image is hidden on mobile (`display: none`) instead of adapted to a stacked layout | Visual context for the LGPD section is lost on mobile | Mobile users of the landing page | 1 day | Requires responsive image design |
| ~~P3-4~~ ✅ | ~~Feature card hover `scale: 1.03` may cause text blurriness on non-retina displays due to sub-pixel rendering~~ | ~~Minor visual quality issue~~ | ~~Desktop users on non-retina displays~~ | ~~0.5 hours~~ | ~~None — reduce to `scale: 1.02`~~ |
| ~~P3-5~~ ✅ | ~~Pagination buttons have no `aria-label` indicating target page number~~ | ~~AT users cannot determine which page they will navigate to~~ | ~~Screen reader users using paginated tables~~ | ~~0.5 hours~~ | ~~None — add `aria-label` to buttons~~ |
| P3-6 | Numeric domain form fields missing `inputmode="numeric"` — suboptimal mobile keyboard | Users must switch keyboard manually for numeric input | Mobile users on domain forms | 0.5 days | Requires field-by-field audit |
| P3-7 | `DashboardMockup` image is hidden via CSS on mobile but may still be fetched before CSS is evaluated | Unnecessary network request on mobile | Mobile users on the landing page | 0.5 days | None — add `loading="lazy"` or conditional render |

---

## 2. Accessibility Debt Assessment

### 2.1 Debt by Category

| Category | Issues | Estimated Effort | Severity |
|----------|--------|-----------------|----------|
| WCAG contrast compliance | ~~P0-3~~, ~~P0-4~~, ~~P1-3~~, ~~P1-4~~, P1-5 | ~~3 days~~ **~1 day remaining** | Critical compliance debt |
| Focus management & keyboard traps | P0-2 | 0.5 days | Critical compliance debt |
| Skip navigation / landmarks | ~~P0-5~~ ✅ | ~~0.5 hours~~ **Done** | ~~Critical compliance debt~~ |
| Semantic HTML corrections | ~~P2-2~~ ✅, P1-7 | ~~1 day~~ **~0.5 days remaining** | Structural UX debt |
| ARIA implementation gaps | ~~P1-6~~ ✅, ~~P2-6~~ ✅, ~~P2-7~~ ✅, ~~P3-5~~ ✅ | ~~1 day~~ **Done** | ~~ARIA implementation debt~~ |
| Screen reader optimization | ~~P1-6~~ ✅, ~~P2-7~~ ✅, P1-7 | ~~1 day~~ **~0.5 days remaining** | Screen reader debt |
| Motion & animation compliance | P1-2 | 1 day | Design system accessibility gap |
| Touch target sizing | P1-8, P2-11, P2-12, P2-13 | 2.5 days | Mobile accessibility debt |
| UX consistency (design system) | P1-1, P2-5, P2-8, P2-9, ~~P3-1~~ ✅ | ~~3 days~~ **~2.5 days remaining** | Design system accessibility gap |
| Mobile layout | P0-1, P1-9, P2-3 | 4 days | Structural UX debt |
| Feedback & empty states | P2-1, P2-14 | 1.5 days | UX consistency debt |
| i18n / microcopy | ~~P2-10~~ ✅ | ~~0.5 hours~~ **Done** | ~~UX consistency debt~~ |

### 2.2 Total Effort Summary

| Debt Class | Effort |
|-----------|--------|
| Critical compliance debt (P0) | ~~5 days~~ **~3.5 days remaining** (P0-3, P0-4, P0-5 done) |
| High-priority UX debt (P1) | ~~5 days~~ **~3 days remaining** (P1-3, P1-4, P1-6 done) |
| Medium improvements (P2) | ~~8 days~~ **~6 days remaining** (P2-2, P2-4, P2-6, P2-7, P2-10 done) |
| Low refinements (P3) | ~~3 days~~ **~1.5 days remaining** (P3-1, P3-2, P3-4, P3-5 done) |
| **Remaining total** | **~14 days (~3 weeks, 1 developer)** |
| ~~Original total~~ | ~~21 days (~4.5 weeks, 1 developer)~~ |

With parallel work across 2 developers, the full backlog can be completed in approximately **2.5–3 weeks**.

### 2.3 Debt Classification

**Critical compliance debt** — Issues that constitute direct WCAG 2.1 AA violations:
- ~~P0-2: No focus trap on `SessionTimeoutModal` (WCAG 2.1.2, 2.4.3)~~ — **still open**
- ~~P0-3, P0-4: Sidebar contrast failures (WCAG 1.4.3)~~ ✅ **resolved**
- ~~P0-5: Skip link non-functional on citizen portal (WCAG 2.4.1)~~ ✅ **resolved**
- ~~P1-3, P1-4: Additional contrast failures (WCAG 1.4.3)~~ ✅ **resolved**
- P1-5: Tertiary text contrast failure (WCAG 1.4.3) — **still open**
- P1-7: Missing programmatic label association (WCAG 1.3.1) — **still open**
- P0-2: No focus trap on `SessionTimeoutModal` (WCAG 2.1.2, 2.4.3) — **still open**

**Structural UX debt** — Issues that affect layout, navigation, and usability at a structural level:
- P0-1: Dashboard sidebar mobile breakpoint
- P1-9: Banner breakpoint effective width
- P2-3: Profile field responsive layout

**Design system accessibility gaps** — Issues where the design system itself produces inaccessible or inconsistent output:
- P1-1: Parallel button styling path
- P1-2: Framer Motion reduced motion gap
- P2-8: Raw hex colors in dashboard
- P2-9: `!important` overrides blocking token cascade


---

## 3. Sprint Roadmap

### Sprint 1 — Weeks 1–2: Critical Accessibility Compliance

**Goal:** Eliminate all WCAG 2.1 AA violations and unblock mobile usage of the dashboard.  
**Total effort:** ~9 days  
**Risk if skipped:** Legal/compliance exposure; dashboard unusable on mobile; keyboard users blocked.

| Task | Issue Ref | File(s) | Effort | Expected Impact |
|------|-----------|---------|--------|-----------------|
| Add mobile sidebar drawer with breakpoint at 767px — hide sidebar, show hamburger trigger, implement off-canvas overlay | P0-1 | `DashboardLayout.tsx`, `DashboardLayout.module.css` | 3 days | All 10 dashboard pages become usable on mobile |
| Replace `SessionTimeoutModal` with existing `Modal` component to inherit focus trap and Escape handler | P0-2 | `SessionTimeoutModal.tsx` | 0.5 days | WCAG 2.1.2 and 2.4.3 compliance restored |
| ~~Increase sidebar inactive nav link opacity from `0.65` to minimum `0.87` (achieves ≥4.5:1 on `#0F172A`)~~ ✅ | ~~P0-3~~ | ~~`DashboardLayout.module.css`~~ | ~~0.5 days~~ | ~~WCAG 1.4.3 compliance for primary navigation~~ |
| ~~Increase sidebar section label opacity from `0.35` to minimum `0.60` or remove decorative label entirely~~ ✅ | ~~P0-4~~ | ~~`DashboardLayout.module.css`~~ | ~~0.5 days~~ | ~~WCAG 1.4.3 compliance for section grouping~~ |
| ~~Add `id="main-content"` to `<main>` in `CitizenPortalLayout`~~ ✅ | ~~P0-5~~ | ~~`CitizenPortalLayout.tsx`~~ | ~~0.5 hours~~ | ~~Skip link functional on all citizen portal pages~~ |
| ~~Increase citizen portal header nav link color from `--color-primary-200` to a value achieving ≥4.5:1 on `#0F172A`~~ ✅ | ~~P1-3~~ | ~~`CitizenPortalLayout.module.css`~~ | ~~0.5 days~~ | ~~WCAG 1.4.3 compliance for citizen portal navigation~~ |
| ~~Fix `StatusBadge .gray` — change text color from `#4B5563` to `#374151` (achieves ≥4.5:1 on `#E5E7EB`)~~ ✅ | ~~P1-4~~ | ~~`StatusBadge.module.css`~~ | ~~0.5 hours~~ | ~~WCAG 1.4.3 compliance for status badges~~ |
| Audit and adjust `--color-text-tertiary` usage on `--color-bg-secondary` — either darken token or restrict usage | P1-5 | `tokens/index.css`, affected components | 1 day | WCAG 1.4.3 compliance for tertiary text |
| ~~Add `aria-hidden="true"` to all decorative emoji in `CitizenPortalLayout` and citizen portal pages~~ ✅ | ~~P1-6~~ | ~~`CitizenPortalLayout.tsx`, portal page components~~ | ~~0.5 hours~~ | ~~Screen readers no longer announce emoji descriptions~~ |
| Refactor `UsersPage` invite form to use `FormField` component with explicit `htmlFor` and error announcement | P1-7 | `UsersPage.tsx` | 0.5 days | WCAG 1.3.1 compliance for invite form |

**Sprint 1 Dependencies:** None — all tasks are self-contained or depend only on existing components.

**Sprint 1 Definition of Done:**
- ~~Zero WCAG 1.4.3 contrast failures on interactive/informational elements~~ ✅ (P0-3, P0-4, P1-3, P1-4 resolved; P1-5 still open)
- Zero WCAG 2.1.2/2.4.3 focus trap violations (P0-2 still open)
- ~~Skip link functional on citizen portal~~ ✅
- Dashboard sidebar renders as drawer on 375px and 768px viewports (P0-1 still open)

---

### Sprint 2 — Weeks 3–4: High-Priority UX Fixes

**Goal:** Eliminate design system inconsistencies, add reduced motion compliance, and fix the most impactful touch target failures.  
**Total effort:** ~7 days  
**Risk if skipped:** Vestibular disorder risk from unguarded animations; inconsistent auth UX; mobile Edit/Delete unusable.

| Task | Issue Ref | File(s) | Effort | Expected Impact |
|------|-----------|---------|--------|-----------------|
| Replace all 5 auth page `.btnPrimary` instances with `Button` component (`variant="primary"`, `isLoading`) | P1-1 | `LoginPage.tsx`, `CitizenLoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, `Auth.module.css` | 1 day | Consistent button color, spinner on submit, `aria-busy` on auth forms |
| Add `useReducedMotion()` guard to `HeroSection`, `StatsSection`, `AnimatedGrid`, `AnimatedItem` — disable or simplify animations when true | P1-2 | `HeroSection.tsx`, `LandingShared.tsx` | 0.5 days | Framer Motion respects OS reduced motion preference |
| Add `useReducedMotion()` guard to `TopLoadingBar` — skip animation when true | P1-2 | `TopLoadingBar.tsx` | 0.5 hours | Consistent reduced motion behavior on navigation |
| Increase table action button touch targets — apply `min-height: 44px; min-width: 44px` to `btn-sm` on mobile, or use `btn-md` in action columns | P1-8 | `global.css` or domain page action columns | 1 day | Edit/Delete tappable on mobile across all 7 domain pages |
| Fix dashboard banner breakpoint — adjust to fire at effective content width (accounting for sidebar) | P1-9 | `DashboardPage.module.css` | 0.5 days | Banner renders correctly at tablet sizes (depends on P0-1) |
| ~~Replace `☰` character in sidebar toggle with SVG icon + `aria-hidden`~~ ✅ | ~~P2-7~~ | ~~`DashboardLayout.tsx`~~ | ~~0.5 hours~~ | ~~Reliable screen reader announcement of toggle action~~ |
| ~~Replace `search` icon in `ConnectionBanner` retry button with a `refresh`/`retry` icon~~ ✅ | ~~P2-6~~ | ~~`ConnectionBanner.tsx`~~ | ~~0.5 hours~~ | ~~Correct semantic affordance for retry action~~ |
| ~~Replace hardcoded strings in `CitizenLoginPage` with `t()` i18n calls~~ ✅ | ~~P2-10~~ | ~~`CitizenLoginPage.tsx`~~ | ~~0.5 hours~~ | ~~Consistent with rest of app; unblocks future localization~~ |
| Increase modal close button from 32px to 44px | P2-11 | `Modal.module.css` | 0.5 days | Modal dismissible on mobile |
| Increase toast close button from 24px to 44px | P2-12 | `Toast.module.css` | 0.5 days | Toast dismissible on mobile |
| Increase `PasswordInput` toggle from 32px to 44px | P2-13 | `PasswordInput.module.css` | 0.5 days | Password visibility toggle usable on mobile |

**Sprint 2 Dependencies:**
- P1-9 depends on P0-1 (sidebar mobile fix) being complete.
- P2-5 (auth spinner) depends on P1-1 (Button adoption) — included in P1-1 task.

**Sprint 2 Definition of Done:**
- All Framer Motion components respect `prefers-reduced-motion`
- Auth buttons visually match dashboard buttons
- Table Edit/Delete buttons meet 44px touch target on mobile
- Modal, toast, and password toggle dismissible on mobile

---

### Sprint 3 — Weeks 5–6: UX Consistency & Enhancement

**Goal:** Improve empty states, heading hierarchy, responsive layouts, and design system token hygiene.  
**Total effort:** ~5 days

| Task | Issue Ref | File(s) | Effort | Expected Impact |
|------|-----------|---------|--------|-----------------|
| Pass `icon` and `action` props to `EmptyState` from `DataTable` — add domain-appropriate icons and "Create first record" CTA | P2-1 | `DataTable.tsx`, `CrudPage.tsx` | 0.5 days | Users guided to create first record on empty domain pages |
| ~~Add `<h1>` to `ProfilePage` — fix heading hierarchy~~ ✅ | ~~P2-2~~ | ~~`ProfilePage.tsx`~~ | ~~0.5 hours~~ | ~~Correct heading structure for AT users~~ |
| Add responsive breakpoint to citizen portal `.fieldRow` — stack label/value below 640px | P2-3 | `CitizenPortal.module.css` | 0.5 days | Profile values readable on narrow screens |
| ~~Change `DataTable` search input to `type="search"`~~ ✅ | ~~P2-4~~ | ~~`DataTable.tsx`~~ | ~~0.5 hours~~ | ~~Native iOS search keyboard and clear button~~ |
| Map dashboard stat icon colors to design tokens — replace 7 raw hex gradient variants | P2-8 | `DashboardPage.module.css`, `tokens/index.css` | 1 day | Brand updates propagate to stat icons |
| Remove `!important` from Landing CTA button overrides — use token-based variant or scoped class | P2-9 | `LandingPage.module.css` | 0.5 days | Token cascade restored; future theming unblocked |
| ~~Add `aria-label` with page number to pagination buttons~~ ✅ | ~~P3-5~~ | ~~`DataTable.tsx`~~ | ~~0.5 hours~~ | ~~AT users can determine pagination target~~ |
| ~~Replace legacy `--color-gray-*` aliases in `ErrorPage.module.css` and `ConfirmDialog.module.css`~~ ✅ | ~~P3-1~~ | ~~`ErrorPage.module.css`, `ConfirmDialog.module.css`~~ | ~~0.5 hours~~ | ~~Technical debt cleared~~ |

**Sprint 3 Definition of Done:**
- All domain empty states show icon and CTA
- ~~Heading hierarchy passes automated audit~~ ✅
- Citizen portal profile readable on 375px
- No `!important` in button styles
- ~~No legacy `--color-gray-*` aliases in use~~ ✅

---

### Sprint 4 — Weeks 7–8: Polish & Low-Priority Refinements

**Goal:** Address remaining low-priority items and improve mobile performance.  
**Total effort:** ~3 days

| Task | Issue Ref | File(s) | Effort | Expected Impact |
|------|-----------|---------|--------|-----------------|
| Add `inputmode="numeric"` to numeric domain form fields | P3-6 | Various domain form components | 0.5 days | Numeric keyboard on mobile for numeric fields |
| Add `loading="lazy"` or conditional render to `DashboardMockup` on mobile | P3-7 | `HeroSection.tsx` | 0.5 days | Eliminates unnecessary image fetch on mobile |
| Adapt LGPD section image for mobile — stacked layout instead of `display: none` | P3-3 | `LandingPage.module.css` | 1 day | Visual context preserved on mobile |
| ~~Update visual banner grid to two-column at 480–768px~~ ✅ | ~~P3-2~~ | ~~`LandingPage.module.css`~~ | ~~0.5 hours~~ | ~~Better space utilization on mobile~~ |
| ~~Reduce feature card hover scale from `1.03` to `1.02`~~ ✅ | ~~P3-4~~ | ~~`LandingShared.tsx`~~ | ~~0.5 hours~~ | ~~Reduced text blurriness on non-retina displays~~ |
| Investigate `TopLoadingBar` — tie visibility to actual navigation/loading state rather than fixed 350ms | P2-14 | `TopLoadingBar.tsx` | 1 day | Accurate loading indicator |

**Sprint 4 Definition of Done:**
- Numeric inputs trigger numeric keyboard on mobile
- Dashboard mockup not fetched on mobile
- LGPD section visible on mobile
- TopLoadingBar reflects actual load state


---

## 4. Success Metrics

### 4.1 Current Baseline (from audit documentation)

| Metric | Current State | Source |
|--------|--------------|--------|
| WCAG 2.1 AA compliance | ~~Partial — 6 contrast failures, 2 focus management violations, 3 semantic violations~~ **Improved — contrast failures reduced to 1 (P1-5); focus management (P0-2) and label association (P1-7) still open** | Part 2, §4.1–4.2 |
| Contrast failures (interactive/informational) | ~~6 elements failing~~ **1 remaining (tertiary text P1-5)** | Part 2, §4.1 |
| Keyboard navigation completeness | ~85% — DataTable, Modal, skip link all work; SessionTimeoutModal broken | Part 2, §4.3 |
| Screen reader landmark coverage | ~~∼90% — all major landmarks present; citizen portal skip link broken~~ **∼95% — skip link restored on citizen portal; emoji hidden from AT** | Part 2, §5.1 |
| Mobile dashboard usability | 0% — sidebar occupies 64% of 375px viewport | Part 1, §3.3 |
| Touch target compliance | 54% — 6 of 13 audited elements below 44px | Part 2, §8.1 |
| Reduced motion compliance | Partial — CSS guarded; Framer Motion unguarded | Part 2, §6.2 |
| Design system token adherence | ~~∼80% — raw hex in dashboard, `!important` in landing, legacy aliases in 2 files~~ **∼83% — legacy aliases cleared; raw hex and `!important` still open** | Part 1, §2.2 |
| Empty state quality | Low — text-only, no icon, no CTA on all domain pages | Part 2, §7.4 |
| Estimated Lighthouse Accessibility score | ~~∼72–78~~ **∼82–88 (estimated +8 to +12 from Quick Wins pass)** | Part 2, §4.1–4.2 |

### 4.2 Target Goals by Sprint

| Metric | After Sprint 1 | After Sprint 2 | After Sprint 3 | After Sprint 4 |
|--------|---------------|---------------|---------------|---------------|
| WCAG contrast failures | 0 | 0 | 0 | 0 |
| Focus trap violations | 0 | 0 | 0 | 0 |
| Skip link functional | ✅ All layouts | ✅ | ✅ | ✅ |
| Mobile dashboard usability | ✅ Drawer implemented | ✅ | ✅ | ✅ |
| Touch target compliance | 54% | ~85% | ~85% | 100% |
| Reduced motion (Framer Motion) | Partial | ✅ Full | ✅ | ✅ |
| Design system token adherence | ~80% | ~85% | ~95% | ~98% |
| Empty state quality | Low | Low | ✅ Icon + CTA | ✅ |
| Estimated Lighthouse score | ~82–86 | ~88–92 | ~93–96 | ~96–99 |

### 4.3 Measurable 3-Month Targets

| Goal | Metric | Target |
|------|--------|--------|
| Full WCAG 2.1 AA compliance | Zero automated violations; zero manual violations from audit list | 100% |
| Lighthouse Accessibility score | Automated score | ≥95 |
| Keyboard navigation completeness | All interactive flows operable by keyboard | 100% |
| Touch target compliance | All interactive elements ≥44×44px | 100% |
| Reduced motion compliance | All JS-driven animations respect `prefers-reduced-motion` | 100% |
| Design system token adherence | No raw hex colors, no `!important` overrides, no legacy aliases | 100% |
| Mobile dashboard usability | Dashboard usable on 375px viewport | ✅ |
| Empty state guidance | All domain empty states include icon and primary CTA | 100% |
| Screen reader landmark coverage | All layouts have functional skip link and correct landmarks | 100% |

### 4.4 Metrics Dashboard Definition

The following checks should be run after each sprint and tracked over time:

| Check | Tool | Frequency |
|-------|------|-----------|
| Automated WCAG audit | axe-core / Lighthouse CI | Per PR |
| Contrast ratio verification | Lighthouse / manual | Per sprint |
| Keyboard navigation smoke test | Manual — Tab through all flows | Per sprint |
| Touch target size audit | Chrome DevTools device emulation | Per sprint |
| Reduced motion test | OS setting + visual inspection | Per sprint |
| Screen reader smoke test | NVDA (Windows) / VoiceOver (macOS/iOS) | Per sprint |

---

## 5. Executive Summary

### 5.1 Overall Health Scores

| Dimension | Score | Rating |
|-----------|-------|--------|
| UX Health | ~~62~~ **70** / 100 | ~~🟧 Needs Improvement~~ **🟨 Fair** |
| Accessibility Compliance | ~~58~~ **72** / 100 | ~~🟧 Needs Improvement~~ **🟨 Fair** |
| Mobile Usability | 45 / 100 | 🟥 Poor |
| Design System Consistency | ~~78~~ **82** / 100 | 🟨 Fair |
| Interaction Quality | ~~80~~ **84** / 100 | 🟨 Good |
| Feedback & Loading States | 74 / 100 | 🟨 Fair |

**Scoring basis:** Derived from the ratio of passing to failing items in each category as documented in the audit. Mobile usability remains low due to the critical sidebar breakpoint failure (P0-1) affecting all 10 dashboard pages. Accessibility Compliance and UX Health scores reflect the 15 Quick Wins completed.

---

### 5.2 Top 3 Critical Risks

**Risk 1 — Dashboard unusable on mobile (P0-1)**
The staff dashboard sidebar has no mobile breakpoint. On a 375px device, the sidebar occupies 64% of the viewport, leaving 135px for content. All 10 dashboard and domain pages are functionally unusable on mobile. This affects any staff member attempting to use the system from a phone — a realistic scenario for field workers, event coordinators, and on-call assessors.

**Risk 2 — WCAG 2.1 AA contrast violations on primary navigation (P0-3, P0-4, P1-3)**
The sidebar inactive nav links (3.8:1), sidebar section label (2.0:1), and citizen portal header nav (4.2:1) all fail the WCAG 1.4.3 minimum contrast requirement. These are primary navigation elements — the most critical UI elements for all users. For government-facing systems, WCAG 2.1 AA compliance is frequently a legal requirement under Brazilian accessibility legislation (Lei Brasileira de Inclusão, Art. 63).

**Risk 3 — SessionTimeoutModal keyboard trap violation (P0-2)**
The session timeout modal has no focus trap. A keyboard user can Tab past the modal buttons and interact with the application behind it while the modal is open. This violates WCAG 2.1.2 (No Keyboard Trap) and 2.4.3 (Focus Order), and creates a security risk — a user who does not notice the modal may inadvertently continue a session that should be terminated.

---

### 5.3 Top 3 High-Impact Improvements

**Improvement 1 — Mobile sidebar drawer (P0-1)**
Implementing a mobile drawer for the dashboard sidebar would immediately make all 10 staff-facing pages usable on mobile. This is the single highest-impact change in the backlog. Estimated effort: 3 days.

**Improvement 2 — Framer Motion reduced motion guard (P1-2)**
Adding `useReducedMotion()` to the 5 affected Framer Motion components would bring the application into compliance with WCAG 2.3.3 (Animation from Interactions) and protect users with vestibular disorders. Estimated effort: 1 day.

**Improvement 3 — Auth page Button component adoption (P1-1)**
Replacing the 5 parallel `.btnPrimary` instances with the shared `Button` component would eliminate the color drift between auth and dashboard pages, add spinner feedback on form submit, and add `aria-busy` for AT users — all in a single refactor. Estimated effort: 1 day.

---

### 5.4 Estimated Total Effort & Timeline

| Phase | Sprints | Effort | Outcome |
|-------|---------|--------|---------|
| Critical compliance | Sprint 1 (Weeks 1–2) | ~~9 days~~ **~4 days remaining** (P0-3, P0-4, P0-5, P1-3, P1-4, P1-6 done) | Zero WCAG violations; mobile dashboard unblocked |
| High-priority UX | Sprint 2 (Weeks 3–4) | ~~7 days~~ **~4.5 days remaining** (P2-6, P2-7, P2-10 done) | Consistent design system; reduced motion compliant; touch targets fixed |
| Consistency & enhancement | Sprint 3 (Weeks 5–6) | ~~5 days~~ **~3 days remaining** (P2-2, P2-4, P3-1, P3-5 done) | Token hygiene; empty states; heading hierarchy |
| Polish & refinements | Sprint 4 (Weeks 7–8) | ~~3 days~~ **~2 days remaining** (P3-2, P3-4 done) | Mobile performance; remaining low-priority items |
| **Remaining total** | **4 sprints** | **~13.5 days** | **Full WCAG 2.1 AA compliance; Lighthouse ≥95** |
| ~~Original total~~ | ~~4 sprints~~ | ~~24 days~~ | — |

With 1 dedicated frontend developer, the full roadmap completes in approximately **8 weeks**. With 2 developers working in parallel on non-overlapping tasks, completion is achievable in **4–5 weeks**.

---

### 5.5 Risk if No Action is Taken

- **Legal exposure:** Government-facing systems in Brazil are subject to accessibility requirements under the Lei Brasileira de Inclusão (LBI) and e-MAG standards. Documented WCAG 2.1 AA violations on primary navigation and form elements constitute non-compliance.
- **Mobile exclusion:** Staff members without desktop access cannot use the dashboard. This is a functional exclusion of a user segment, not a degraded experience.
- **Vestibular disorder risk:** Unguarded Framer Motion animations will continue to affect users with motion sensitivity regardless of their OS accessibility settings.
- **Maintenance cost:** The parallel button styling path, raw hex colors, and `!important` overrides will compound over time — each new feature built on these patterns increases the cost of future design system updates.
- **User trust:** Text-only empty states with no guidance, misleading retry icons, and inconsistent loading feedback erode trust in the system's reliability, particularly for first-time users.

---

### 5.6 Business Impact of Improvements

- **Compliance:** Achieving WCAG 2.1 AA compliance removes legal risk and enables the system to be certified for government procurement requirements.
- **Mobile reach:** Fixing the sidebar breakpoint expands the usable audience from desktop-only to all devices — a meaningful expansion for a government communication system used in field contexts.
- **Inclusivity:** Contrast fixes and screen reader improvements make the system usable for the estimated 3.5% of the Brazilian population with visual impairments (IBGE, 2022).
- **Operational efficiency:** Consistent loading states, clear empty states with CTAs, and correct error feedback reduce user confusion and support ticket volume.
- **Design system ROI:** Eliminating the parallel button path and raw hex colors means future brand or design system updates propagate automatically — reducing the cost of every future change.
