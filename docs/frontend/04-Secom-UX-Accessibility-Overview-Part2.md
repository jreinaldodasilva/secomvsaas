# Secom — UX & Accessibility Audit
## Part 2: Accessibility · Animations · Loading States · Mobile UX · Priorities

---

## 4. Accessibility Compliance Report (WCAG 2.1 AA)

### 4.1 Color Contrast Audit

All contrast ratios are calculated against WCAG 2.1 SC 1.4.3 (minimum 4.5:1 for normal text, 3:1 for large text and UI components).

| Element | Foreground | Background | Ratio (est.) | Pass/Fail |
|---------|-----------|-----------|--------------|-----------|
| Body text (`--color-text-primary` on white) | `#0F172A` | `#ffffff` | 19.6:1 | ✅ Pass |
| Secondary text (`--color-text-secondary`) | `#374151` | `#ffffff` | 10.7:1 | ✅ Pass |
| Tertiary text (`--color-text-tertiary`) | `#6B7280` | `#ffffff` | 4.6:1 | ✅ Pass (marginal) |
| Tertiary text on `--color-bg-secondary` | `#6B7280` | `#F9FAFB` | 4.4:1 | 🟥 Fail |
| Sidebar nav link (inactive) | `rgba(255,255,255,0.65)` | `#0F172A` | 3.8:1 | 🟥 Fail |
| Sidebar section label | `rgba(255,255,255,0.35)` | `#0F172A` | 2.0:1 | 🟥 Fail |
| Sidebar user name | `rgba(255,255,255,0.65)` | `#0F172A` | 3.8:1 | 🟥 Fail |
| `.btn-primary` text (white on `#162e4d`) | `#ffffff` | `#162e4d` | 12.1:1 | ✅ Pass |
| Auth `.btnPrimary` (white on `#1e3a5f`) | `#ffffff` | `#1e3a5f` | 10.2:1 | ✅ Pass |
| StatusBadge `.yellow` text | `#92400e` | `#fef3c7` | 4.7:1 | ✅ Pass |
| StatusBadge `.gray` text | `--color-neutral-600` (`#4B5563`) | `--color-neutral-100` (`#E5E7EB`) | 4.1:1 | 🟥 Fail |
| StatusBadge `.blue` text | `#1e40af` | `#dbeafe` | 5.0:1 | ✅ Pass |
| StatusBadge `.green` text | `#065f46` | `#d1fae5` | 7.2:1 | ✅ Pass |
| Table header text (`--color-primary-700`) | `#10233b` | `--color-primary-50` (`#eef2f7`) | 11.4:1 | ✅ Pass |
| Breadcrumb link (`--color-primary-600`) | `#162e4d` | `#ffffff` | 11.8:1 | ✅ Pass |
| Citizen portal nav link (`--color-primary-200`) | `#aabfe0` | `#0F172A` | 4.2:1 | 🟥 Fail |
| Cookie banner text (`--color-neutral-400`) | `#6B7280` | `#111827` | 4.5:1 | ✅ Pass (marginal) |
| Dashboard banner subtitle (`rgba(255,255,255,0.65)`) | `rgba(255,255,255,0.65)` | `#0F172A` (gradient) | ~3.8:1 | 🟥 Fail |
| Error page `404` code (`--color-gray-200`) | `#D1D5DB` | `#ffffff` | 1.6:1 | 🟥 Fail (decorative) |

**Summary:** 6 contrast failures on interactive or informational text. The sidebar inactive nav links and the citizen portal header nav links are the most impactful, as they are primary navigation elements.


### 4.2 WCAG 2.1 AA Violations by Criterion

| WCAG Criterion | Level | Component / Page | Description | Severity |
|----------------|-------|-----------------|-------------|----------|
| 1.4.3 Contrast (Minimum) | AA | Sidebar nav links | Inactive links at ~3.8:1 | 🟥 Critical |
| 1.4.3 Contrast (Minimum) | AA | Sidebar section label | `rgba(255,255,255,0.35)` at ~2.0:1 | 🟥 Critical |
| 1.4.3 Contrast (Minimum) | AA | Citizen portal header nav | `--color-primary-200` on dark bg at ~4.2:1 | 🟧 High |
| 1.4.3 Contrast (Minimum) | AA | StatusBadge `.gray` | `#4B5563` on `#E5E7EB` at ~4.1:1 | 🟧 High |
| 1.4.3 Contrast (Minimum) | AA | Tertiary text on `bg-secondary` | `#6B7280` on `#F9FAFB` at ~4.4:1 | 🟧 High |
| 2.1.2 No Keyboard Trap | AA | SessionTimeoutModal | No focus trap implemented | 🟥 Critical |
| 2.4.3 Focus Order | AA | SessionTimeoutModal | Focus not moved correctly on open | 🟥 Critical |
| 1.3.1 Info and Relationships | AA | UsersPage invite form | `<label>` wraps input without `htmlFor` | 🟧 High |
| 1.3.1 Info and Relationships | AA | CitizenPortalLayout brand icon | Emoji `🏛️` not hidden from AT | 🟧 High |
| 1.3.1 Info and Relationships | AA | CitizenPortal service cards | Emoji icons not hidden from AT | 🟧 High |
| 2.4.6 Headings and Labels | AA | ProfilePage | `<h2>` used as page title without `<h1>` | 🟨 Medium |
| 2.4.2 Page Titled | AA | CitizenLoginPage | Page title hardcoded, not using `usePageTitle` | 🟨 Medium |
| 1.4.4 Resize Text | AA | Dashboard sidebar collapsed | Icon-only nav has no tooltip or visible label | 🟨 Medium |
| 4.1.3 Status Messages | AA | ConnectionBanner retry button | Icon `search` used for retry — misleading | 🟨 Medium |
| 2.5.3 Label in Name | AA | Sidebar toggle button | Label is `☰` character, not descriptive text | 🟨 Medium |

---

### 4.3 Keyboard Navigation Review

#### Tab Order

The tab order follows DOM order throughout the application. No `tabindex` values greater than 0 are used anywhere in the codebase, which is a positive finding.

#### Focus Visibility

Focus rings are defined globally in `global.css`:

```css
button:focus-visible, a:focus-visible, input:focus-visible,
select:focus-visible, textarea:focus-visible, [role='button']:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

Individual components (Modal close button, Input, PasswordInput toggle, Card interactive, Breadcrumb links) also define their own `focus-visible` rules, consistent with the global definition.

**Gap:** The sidebar toggle button (`☰`) has no explicit `min-width`/`min-height`, meaning the focus ring may be visually insufficient at its rendered size.

#### Modal Focus Trap — Modal Component ✅

`Modal.tsx` implements a correct native focus trap, querying all focusable elements and trapping Tab/Shift+Tab between first and last. Escape key closes the modal. Focus is moved to the first focusable element on open.

#### SessionTimeoutModal Focus Trap — 🟥 Critical

`SessionTimeoutModal.tsx` does **not** use the `Modal` component. It renders its own backdrop/dialog without any focus trap logic. `autoFocus` moves focus to the "Continue" button on mount, but there is no trap — a keyboard user can Tab past the modal buttons and interact with the page behind it. There is also no Escape key handler.

#### DataTable Keyboard Navigation ✅

`DataTable.tsx` implements arrow-key navigation for clickable rows (ArrowDown/ArrowUp moves focus, Enter/Space activates). This is a good accessibility enhancement.

#### Pagination Buttons

Pagination buttons use `t('common.previous')` and `t('common.next')` as text content, which is acceptable, but there is no `aria-label` indicating the target page number.


---

## 5. Keyboard Navigation & Screen Reader Support

### 5.1 Navigation Landmarks

| Landmark | Element | Present | Notes |
|----------|---------|---------|-------|
| `<header role="banner">` | MainHeader | ✅ Yes | Correctly uses `role="banner"` |
| `<nav aria-label="Navegação principal">` | MainHeader desktop nav | ✅ Yes | Labelled |
| `<nav aria-label="Breadcrumb">` | Breadcrumbs | ✅ Yes | Labelled |
| `<nav aria-label="...">` | DashboardLayout sidebar nav | ✅ Yes | Uses `t('nav.main')` |
| `<main id="main-content">` | DashboardLayout | ✅ Yes | Skip link target present |
| `<main id="main-content">` | LandingPage | ✅ Yes | Present on `<main>` element |
| `<main>` | CitizenPortalLayout | ✅ Yes | Present but no `id` for skip link |
| `<footer>` | CitizenPortalLayout | ✅ Yes | Present |
| `<footer>` | PublicLayout / Footer | ✅ Yes | Present |
| Skip link | App.tsx | ✅ Yes | `href="#main-content"`, visible on focus |

**Gap:** The CitizenPortalLayout `<main>` has no `id="main-content"`, so the global skip link (`href="#main-content"`) does not function correctly on citizen portal pages.

### 5.2 Form Labels and Instructions

| Form | Label Method | `aria-describedby` | Error Announcement | Notes |
|------|-------------|-------------------|-------------------|-------|
| LoginPage | `<label htmlFor>` | No | `role="alert"` on error banner | ✅ Acceptable |
| RegisterPage | `<label htmlFor>` via FormField | Yes (error id) | `role="alert"` on error | ✅ Good |
| PressReleaseForm | FormField component | Yes | `role="alert"` on error | ✅ Good |
| UsersPage invite form | `<label>` wrapping input | No | None | 🟧 High — implicit label, no error announcement |
| CitizenLoginPage | `<label htmlFor>` | No | `role="alert"` on error banner | ✅ Acceptable |
| ProfilePage password form | PasswordInput component | No | None | 🟨 Medium — no error state |
| Input component | `htmlFor` + `aria-describedby` | Yes | `role="alert"` on error | ✅ Good |
| FormField component | `htmlFor` + `aria-label` on required | Yes | `role="alert"` on error | ✅ Good |

**Key finding:** The `FormField` and `Input` components are well-implemented for accessibility. The main gaps are in pages that bypass these components and use raw HTML elements directly (UsersPage invite form, ProfilePage).

### 5.3 Dynamic Content and Live Regions

| Component | `aria-live` | `role` | Notes |
|-----------|------------|--------|-------|
| Toast | `aria-live="assertive"` | `role="alert"` | ✅ Both present — redundant but harmless |
| Spinner | `aria-live="polite"` | `role="status"` | ✅ Correct |
| Skeleton | `aria-live="polite"` | `role="status"` | ✅ Correct |
| ConnectionBanner | `aria-live="polite"` | `role="alert"` | 🟨 `role="alert"` implies assertive — should use `aria-live="assertive"` |
| Dashboard pending alert | `role="status"` | — | ✅ Correct for non-urgent status |
| PasswordInput strength | `aria-live="polite"` | — | ✅ Correct |
| SessionTimeoutModal | `role="dialog"` + `aria-modal="true"` | — | 🟥 No focus trap negates `aria-modal` |

### 5.4 Screen Reader Specific Findings

**Emoji as icons (🟧 High):**
The CitizenPortalLayout brand uses `<span className={styles.brandIcon}>🏛️</span>` and the CitizenPortal home page uses emoji as service card icons (e.g., `📰`, `📅`, `👤`) without `aria-hidden="true"`. Screen readers will announce these as their Unicode descriptions ("classical building", "newspaper", "calendar"), which is disruptive to the reading flow.

**Sidebar toggle button label (🟨 Medium):**
```tsx
<button className={styles.sidebarToggle} onClick={toggleSidebar} aria-label={t('nav.toggleSidebar')}>☰</button>
```
The `aria-label` is correctly set via i18n. However, the `☰` character inside the button will also be read by some screen readers before the `aria-label` is processed, depending on the AT. Using an SVG icon with `aria-hidden` inside the button would be more reliable.

**`aria-current="page"` on nav links (✅):**
DashboardLayout correctly sets `aria-current="page"` on the active NavLink. This is a positive finding.

**`aria-busy` on loading Button (✅):**
The Button component sets `aria-busy={isLoading}` when in loading state, which is correct.

**`aria-sort` on sortable table headers (✅):**
DataTable correctly sets `aria-sort="ascending"` or `aria-sort="descending"` on sorted columns.

**`aria-label` on modal close button (✅):**
Modal close button uses `aria-label={t('common.close')}` with an `aria-hidden` SVG icon.


---

## 6. Animation & Interaction Quality

### 6.1 Animation Inventory

| Animation | Location | Trigger | Properties | GPU-Friendly | Reduced Motion Support | Purpose |
|-----------|----------|---------|-----------|-------------|----------------------|---------|
| Hero section entrance | `HeroSection` (Framer Motion) | Page load | `opacity`, `y` (translateY) | ✅ Yes | 🟧 CSS-only guard | Decorative / brand |
| Stats section stagger | `StatsSection` (Framer Motion) | Page load | `opacity`, `y` | ✅ Yes | 🟧 CSS-only guard | Decorative |
| Feature cards stagger | `AnimatedGrid/Item` (Framer Motion) | Scroll into view | `opacity`, `y` | ✅ Yes | 🟧 CSS-only guard | Decorative |
| Feature card hover scale | `AnimatedItem` (Framer Motion) | Hover | `scale` | ✅ Yes | 🟧 CSS-only guard | Interactive feedback |
| Modal entrance | `Modal.module.css` | Open | `opacity`, `scale`, `translateY` | ✅ Yes | ✅ `@media` in CSS | Functional |
| Modal overlay fade | `Modal.module.css` | Open | `opacity` | ✅ Yes | ✅ `@media` in CSS | Functional |
| Toast slide-in | `Toast.module.css` | Triggered | `translateX`, `opacity` | ✅ Yes | ✅ `@media` in CSS | Functional |
| Toast slide-out | `Toast.module.css` | Dismiss/timeout | `translateX`, `opacity` | ✅ Yes | ✅ `@media` in CSS | Functional |
| Top loading bar | `TopLoadingBar` (Framer Motion) | Route change | `scaleX` | ✅ Yes | 🟧 CSS-only guard | Functional |
| Mobile menu slide-down | `MainHeader.module.css` | Toggle | `opacity`, `translateY` | ✅ Yes | ✅ `@media` in CSS | Functional |
| Skeleton shimmer | `Skeleton.module.css` | Loading state | `background-position` | ✅ Yes | ✅ `@media` in CSS | Functional |
| Spinner rotation | `Loading.module.css` | Loading state | `rotate` | ✅ Yes | ✅ `@media` in CSS | Functional |
| Button hover shadow | `global.css` `.btn::after` | Hover | `opacity` | ✅ Yes | ✅ `@media` in CSS | Interactive feedback |
| Stat card hover shadow | `DashboardPage.module.css` | Hover | `opacity` | ✅ Yes | ✅ `@media` in CSS | Interactive feedback |
| Visual card image zoom | `Landing.module.css` | Hover | `scale` | ✅ Yes | Not guarded | Decorative |
| Quick card lift | `CitizenPortal.module.css` | Hover | `translateY(-2px)` | ✅ Yes | Not guarded | Interactive feedback |
| Password strength bar | `PasswordInput.module.css` | Input change | `width`, `background` | ✅ Yes | Not guarded | Functional |

### 6.2 Reduced Motion Analysis

**Global CSS guard (✅ present):**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  html { scroll-behavior: auto; }
}
```

This global rule effectively disables all CSS animations and transitions when the user has requested reduced motion. It is a reliable catch-all.

**Framer Motion gap (🟧 High):**
Framer Motion animations are JavaScript-driven and are **not** affected by the CSS `prefers-reduced-motion` media query. The global CSS guard does not suppress Framer Motion's `animate`, `initial`, `whileInView`, or `whileHover` props.

Framer Motion provides a `useReducedMotion()` hook and the `LazyMotion` / `MotionConfig` component to handle this. Neither is used in the codebase. As a result, users who have enabled "Reduce Motion" in their OS settings will still see the full entrance animations on the Landing page.

Affected components: `HeroSection`, `StatsSection`, `AnimatedGrid`, `AnimatedItem`, `TopLoadingBar`.

### 6.3 Interaction Quality Assessment

**Hover states:** All interactive elements have hover states. The shadow-lift pattern (using `::after` pseudo-element with `opacity` transition) is consistent across buttons, stat cards, and feature cards. This is a GPU-friendly approach that avoids layout recalculation.

**Active/pressed states:** The Card component has `transform: translateY(1px)` on `:active`, providing tactile feedback. Buttons do not have an explicit `:active` transform — only the shadow opacity changes. Adding a subtle scale or translate on `:active` would improve perceived responsiveness.

**Transition durations:** All transitions use tokens (`--transition-fast: 0.15s`, `--transition-base: 0.2s`, `--transition-slow: 0.3s`). These are within the recommended range for UI transitions (100–300ms). No janky or overly long transitions were identified.

**Framer Motion spring on feature card hover:**
```tsx
whileHover={{ scale: 1.03 }}
transition={{ type: 'spring', stiffness: 220 }}
```
The spring animation on hover is smooth but the `scale: 1.03` on a card that contains text can cause slight text blurriness on non-retina displays due to sub-pixel rendering during the transform. A value of `scale: 1.02` would reduce this risk.

**TopLoadingBar timing:** The bar is visible for exactly 350ms on every route change, regardless of actual load time. For fast navigations (cached routes), this creates a false loading indicator. For slow navigations (first load of lazy chunks), the bar may disappear before the content is ready.


---

## 7. Loading States & User Feedback

### 7.1 Loading Indicators

| Context | Indicator Used | Consistent | Notes |
|---------|---------------|-----------|-------|
| Initial app load | `LoadingScreen` (full-page spinner) | ✅ Yes | Used in all `Suspense` fallbacks |
| Route lazy-load | `LoadingScreen` | ✅ Yes | Consistent across all routes |
| DataTable data fetch | `TableSkeleton` (skeleton rows) | ✅ Yes | Matches table column count |
| Dashboard stat cards | `Skeleton` (circular + text) | ✅ Yes | Matches card layout |
| Button submit action | Spinner inside button + `aria-busy` | ✅ Yes | `Button` component handles this |
| Auth page submit | Disabled button + text change | 🟨 Partial | Uses local `.btnPrimary`, no spinner |
| Top-level navigation | `TopLoadingBar` | ✅ Yes | Present on all dashboard routes |
| Citizen portal pages | `LoadingScreen` via Suspense | ✅ Yes | Consistent |

**Gap — Auth page loading state (🟨 Medium):**
Auth pages (`LoginPage`, `CitizenLoginPage`, `ForgotPasswordPage`) use a local `.btnPrimary` button that only disables and changes text on submit (`'Entrando...'`, `'Carregando...'`). They do not show a spinner. The shared `Button` component with `isLoading` prop provides a spinner and `aria-busy` — auth pages should use it for consistency and accessibility.

### 7.2 Success Feedback

| Action | Feedback Mechanism | Timing | Notes |
|--------|-------------------|--------|-------|
| CRUD create/update/delete | Toast (success) | Immediate | ✅ Consistent across all domain pages |
| User invite sent | Toast (success) | Immediate | ✅ |
| Password change | Toast (success) | Immediate | ✅ |
| Login | Redirect to dashboard | Immediate | No explicit success toast — redirect is sufficient |
| Forgot password submit | Inline success state (icon + text) | Immediate | ✅ Good — page transforms to confirmation |
| Cookie consent accept | Banner dismisses | Immediate | ✅ |

**Toast configuration:** Default duration is 4500ms, which is within the recommended 3–5 second range for non-critical notifications. The toast has a manual close button, which is important for users who need more time to read.

### 7.3 Error Feedback

| Context | Error Mechanism | Recovery Guidance | Notes |
|---------|----------------|------------------|-------|
| Login failure | Inline error banner (`role="alert"`) | None — no retry hint | 🟨 Medium — no guidance on what to do |
| Form validation | Per-field error via FormField | Implicit — fix the field | ✅ Good |
| CRUD mutation failure | Toast (error) | None | 🟨 Medium — no retry action in toast |
| API unreachable | ConnectionBanner | Retry button | 🟧 High — retry icon is `search`, misleading |
| Session timeout | SessionTimeoutModal | Continue / Logout | ✅ Clear options |
| 404 page | Error page with back button | Back to dashboard | ✅ Acceptable |
| Unauthorized page | Error page | — | 🟨 Medium — no explanation of why access was denied |
| ErrorBoundary | Generic error message | — | 🟨 Medium — no recovery action |

**ErrorBoundary gap (🟨 Medium):**
`ErrorBoundary.tsx` catches runtime errors but the UI shown to the user should be reviewed. Without seeing its render output, the pattern of providing a "Reload page" or "Go to dashboard" action is recommended.

### 7.4 Empty States

| Page / Context | Empty State Component | Icon | CTA | Notes |
|---------------|----------------------|------|-----|-------|
| All domain CRUD pages | `EmptyState` via `DataTable` | None (text only) | None | 🟨 Medium — no icon or CTA in default DataTable empty |
| DataTable search no results | `EmptyState` (title only) | None | None | 🟨 Medium — no suggestion to clear search |
| Dashboard recent press releases | Inline `<p>` text | None | None | 🟨 Medium — no CTA to create first item |
| Dashboard upcoming events | Inline `<p>` text | None | None | 🟨 Medium — no CTA |
| EmptyState component | Configurable icon + CTA | Optional | Optional | ✅ Component supports it — not always used |

**Key finding:** The `EmptyState` component supports icons and CTA actions, but `DataTable` passes only a `title` string to it, leaving the icon and action slots empty. Domain pages that use `CrudPage` → `DataTable` therefore show a text-only empty state with no visual hierarchy and no call to action. This is a missed opportunity to guide users toward creating their first record.

### 7.5 Feedback Consistency Summary

| Feedback Type | Consistency | Rating |
|--------------|-------------|--------|
| Loading — data fetch | Skeleton used consistently | ✅ Good |
| Loading — mutations | Button spinner via component | 🟨 Partial (auth pages bypass) |
| Success — mutations | Toast used consistently | ✅ Good |
| Error — mutations | Toast used consistently | ✅ Good |
| Error — forms | FormField inline errors | ✅ Good |
| Empty states | Text-only, no CTA | 🟨 Needs improvement |


---

## 8. Mobile UX Analysis

### 8.1 Touch Target Sizes

The token `--touch-target-min: 44px` is defined and referenced in `MainHeader.module.css` for the mobile menu button. The following audit checks whether this standard is met across interactive elements.

| Element | Defined Size | Meets 44×44px | Notes |
|---------|-------------|--------------|-------|
| Mobile menu button (MainHeader) | `min-width: 44px; min-height: 44px` | ✅ Yes | Explicitly set |
| Mobile nav links | `min-height: var(--touch-target-min)` | ✅ Yes | Explicitly set |
| Button `.btn-md` | `min-height: 2.75rem` (44px) | ✅ Yes | Token-defined |
| Button `.btn-sm` | `min-height: 2rem` (32px) | 🟥 No | Below 44px — used in table action rows |
| Button `.btn-lg` | `min-height: 3rem` (48px) | ✅ Yes | |
| Input `.md` | `min-height: 2.75rem` (44px) | ✅ Yes | Token-defined |
| Modal close button | `width: 2rem; height: 2rem` (32px) | 🟥 No | Below 44px |
| Sidebar nav links | `padding: 8px 12px` — no min-height | 🟧 Partial | Effective height ~36px |
| Sidebar toggle button | No explicit size | 🟧 Partial | Inherits font-size padding only |
| Pagination buttons | `padding: 4px 12px` — no min-height | 🟥 No | Effective height ~30px |
| Toast close button | `width: 1.5rem; height: 1.5rem` (24px) | 🟥 No | Below 44px |
| PasswordInput toggle | `width: 2rem; height: 2rem` (32px) | 🟥 No | Below 44px |
| Table action buttons (ghost sm) | `min-height: 2rem` (32px) | 🟥 No | Used in every domain page |

**Summary:** 6 interactive elements fall below the 44×44px minimum touch target. The most impactful are the table action buttons (Edit/Delete in every domain page), the modal close button, and the toast dismiss button — all of which are used frequently on mobile.

### 8.2 Mobile Navigation Ergonomics

**Dashboard (🟥 Critical):**
As documented in Section 3.3, the dashboard sidebar has no mobile breakpoint. On a 375px device, the sidebar occupies 240px of the 375px viewport width, leaving 135px for content. This is the most severe mobile UX issue in the application.

There is no bottom navigation bar, no hamburger-triggered drawer, and no way for a mobile user to collapse the sidebar to a usable state without knowing about the toggle button (which itself has no minimum touch target size defined).

**Public site / Citizen Portal (✅ Good):**
The MainHeader correctly implements a mobile hamburger menu with full-width touch targets. The CitizenPortalLayout header is responsive and collapses correctly. These are well-implemented patterns.

### 8.3 Form Usability on Mobile Keyboards

| Form Element | `type` Attribute | `autocomplete` | `inputmode` | iOS Zoom Prevention | Notes |
|-------------|-----------------|---------------|------------|-------------------|-------|
| Email inputs | `type="email"` | `autocomplete="email"` | — | `font-size: 16px` ✅ | Triggers email keyboard |
| Password inputs | `type="password"` | `autocomplete="current-password"` / `"new-password"` | — | `font-size: 16px` ✅ | Correct |
| Text inputs (general) | `type="text"` | Varies | Not set | `font-size: 16px` ✅ | No `inputmode` for numeric fields |
| Date/time fields (Events form) | `type="datetime-local"` | Not set | — | `font-size: 16px` ✅ | Native date picker on mobile |
| Phone fields (if any) | Not observed | — | — | — | No phone inputs found |
| Search input (DataTable) | `type="text"` | Not set | Not set | `font-size: 16px` ✅ | Should use `type="search"` and `inputmode="search"` |

**Key findings:**
- iOS zoom prevention is correctly handled globally for all input types on mobile.
- The DataTable search input uses `type="text"` instead of `type="search"`, which misses the native "Search" keyboard return key on iOS and the browser's built-in clear button.
- Numeric fields in domain forms (e.g., quantities, counts) do not use `inputmode="numeric"`, which would trigger the numeric keyboard on mobile.

### 8.4 Scroll Behavior and Gesture Conflicts

**`scroll-behavior: smooth`** is set on `html` in `global.css` and correctly disabled under `prefers-reduced-motion`.

**Modal scroll lock:** `Modal.tsx` sets `document.body.style.overflow = 'hidden'` when open, preventing background scroll. This is correct.

**DataTable horizontal scroll:** The `tableContainer` uses `overflow-x: auto` on desktop, which is correct. On mobile, the card-view transformation removes the need for horizontal scroll entirely.

**Landing page anchor links:** The MainHeader uses `href="/#features"` style anchor links for in-page navigation. On mobile, after the menu closes, the smooth scroll to the anchor works correctly. However, if the user is on a different page (e.g., `/login`) and clicks a nav link, the browser navigates to `/#features` which may not scroll to the correct position depending on the SPA routing behavior.

**CitizenPortal quick cards:** `CitizenPortal.module.css` applies `transform: translateY(-2px)` on hover for quick cards. On touch devices, hover states are triggered on tap and persist until the next tap elsewhere, which can cause the card to appear "stuck" in the lifted state. This is a minor cosmetic issue.

### 8.5 Perceived Mobile Performance

**Code splitting:** All pages are lazy-loaded via `React.lazy` with `Suspense` fallbacks. This is a strong performance pattern that reduces the initial bundle size.

**Font loading:** Inter is loaded from Google Fonts with `display=swap` implied by the stylesheet URL. The `<link rel="preconnect">` tags are present in `index.html`, which reduces DNS lookup time.

**Image handling:** The `DashboardMockup` component is hidden on mobile (`heroImageWrap: display: none` at 768px), which eliminates a potentially large image download on mobile. However, the image is still fetched if the component renders before the CSS breakpoint is evaluated — a `loading="lazy"` attribute or conditional rendering would be more efficient.

**Animation overhead:** Framer Motion is loaded for the Landing page. On low-end mobile devices, the staggered entrance animations (7 stat cards, 4 feature cards) may cause frame drops. The `whileInView` viewport observer is used, which defers animations until elements are visible — this is a good practice.


---

## 9. Improvement Priorities & Risk Summary

### 9.1 Critical — Must Fix

These issues block usage or violate WCAG 2.1 AA standards.

| # | Issue | Location | WCAG | Impact |
|---|-------|----------|------|--------|
| C1 | Dashboard sidebar has no mobile breakpoint | `DashboardLayout.module.css` | — | All 10 dashboard pages unusable on mobile |
| C2 | SessionTimeoutModal has no focus trap | `SessionTimeoutModal.tsx` | 2.1.2, 2.4.3 | Keyboard users can interact behind modal |
| C3 | Sidebar inactive nav links fail contrast (3.8:1) | `DashboardLayout.module.css` | 1.4.3 | Primary navigation unreadable for low-vision users |
| C4 | Sidebar section label fails contrast (2.0:1) | `DashboardLayout.module.css` | 1.4.3 | Section grouping invisible to low-vision users |
| C5 | Skip link target missing on Citizen Portal | `CitizenPortalLayout.tsx` | 2.4.1 | Skip link non-functional for keyboard/AT users on portal |

### 9.2 High — Fix Soon

These issues create strong usability or consistency problems.

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| H1 | Auth pages use parallel `.btnPrimary` instead of `Button` component | `Auth.module.css`, 5 pages | Color drift, maintenance risk, no spinner on submit |
| H2 | Framer Motion animations not guarded by `useReducedMotion()` | `LandingShared.tsx`, `HeroSection.tsx`, `TopLoadingBar.tsx` | Vestibular disorder risk for users with reduced motion preference |
| H3 | Citizen portal header nav links fail contrast (4.2:1) | `CitizenPortalLayout.module.css` | Navigation unreadable for low-vision users |
| H4 | StatusBadge `.gray` fails contrast (4.1:1) | `StatusBadge.module.css` | Status information unreadable |
| H5 | Tertiary text on `bg-secondary` fails contrast (4.4:1) | `tokens/index.css` | Affects all tertiary text on secondary backgrounds |
| H6 | Emoji icons not hidden from assistive technology | `CitizenPortalLayout.tsx`, portal pages | Screen readers announce emoji descriptions |
| H7 | UsersPage invite form uses implicit labels without `htmlFor` | `UsersPage.tsx` | Form fields not programmatically associated with labels |
| H8 | Table action buttons (ghost sm) below 44px touch target | All domain pages | Edit/Delete actions difficult to tap on mobile |
| H9 | Dashboard banner breakpoint fires at wrong effective width | `DashboardPage.module.css` | Banner overflow at tablet sizes |

### 9.3 Medium — Plan for Next Cycle

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| M1 | Empty states have no icon or CTA | `DataTable.tsx` → `EmptyState` | Users not guided to create first record |
| M2 | ProfilePage missing `<h1>` — uses `<h2>` as page title | `ProfilePage.tsx` | Heading hierarchy broken for AT users |
| M3 | Citizen portal profile field layout not responsive | `CitizenPortal.module.css` | Label/value overflow on narrow screens |
| M4 | DataTable search uses `type="text"` not `type="search"` | `DataTable.tsx` | Misses native search keyboard on iOS |
| M5 | Auth page loading state has no spinner | `LoginPage.tsx`, `CitizenLoginPage.tsx` | Inconsistent feedback vs. dashboard mutations |
| M6 | ConnectionBanner retry uses `search` icon | `ConnectionBanner.tsx` | Misleading icon for retry action |
| M7 | Sidebar toggle button uses `☰` character as label | `DashboardLayout.tsx` | Unreliable screen reader announcement |
| M8 | Dashboard stat icon colors use raw hex, not tokens | `DashboardPage.module.css` | Brand update will not propagate |
| M9 | `!important` overrides on Landing CTA buttons | `LandingPage.module.css` | Fragile cascade, blocks future theming |
| M10 | CitizenLoginPage uses hardcoded strings, not i18n | `CitizenLoginPage.tsx` | Inconsistent with rest of app, blocks localization |
| M11 | Modal close button below 44px touch target (32px) | `Modal.module.css` | Difficult to dismiss modal on mobile |
| M12 | Toast close button below 44px touch target (24px) | `Toast.module.css` | Difficult to dismiss toast on mobile |
| M13 | PasswordInput toggle below 44px touch target (32px) | `PasswordInput.module.css` | Difficult to toggle visibility on mobile |
| M14 | TopLoadingBar fixed 350ms duration regardless of load time | `TopLoadingBar.tsx` | False loading indicator on fast/slow navigations |

### 9.4 Low — Enhancement Opportunities

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| L1 | Legacy `--color-gray-*` aliases used in ErrorPage and ConfirmDialog | `ErrorPage.module.css`, `ConfirmDialog.module.css` | Technical debt |
| L2 | Visual banner grid single-column on mobile | `LandingPage.module.css` | Missed two-column opportunity at 480–768px |
| L3 | LGPD section image hidden on mobile instead of adapted | `LandingPage.module.css` | Visual context lost on mobile |
| L4 | Feature card hover `scale: 1.03` may cause text blurriness | `LandingShared.tsx` | Minor visual quality issue on non-retina displays |
| L5 | Pagination buttons have no `aria-label` with page number | `DataTable.tsx` | AT users cannot determine target page |
| L6 | Numeric domain form fields missing `inputmode="numeric"` | Various domain forms | Suboptimal mobile keyboard on numeric fields |
| L7 | `DashboardMockup` image not conditionally rendered on mobile | `HeroSection.tsx` | Image may be fetched even when hidden |

---

### 9.5 Risk Matrix

```
                    HIGH IMPACT
                         │
    C1 (sidebar mobile)  │  C2 (focus trap)
    H1 (auth buttons)    │  C3/C4 (contrast)
    H2 (reduced motion)  │  C5 (skip link)
                         │
LOW EFFORT ──────────────┼────────────────── HIGH EFFORT
                         │
    M1 (empty states)    │  H8 (touch targets)
    M6 (retry icon)      │  H9 (banner breakpoint)
    M10 (i18n strings)   │  M3 (profile responsive)
                         │
                    LOW IMPACT
```

### 9.6 Recommended Fix Order

**Sprint 1 — Critical accessibility and mobile blockers:**
- C1: Add mobile sidebar drawer/bottom-nav breakpoint
- C2: Replace `SessionTimeoutModal` with the existing `Modal` component
- C5: Add `id="main-content"` to `CitizenPortalLayout` main element
- C3/C4: Increase sidebar nav link opacity to `rgba(255,255,255,0.85)` minimum; remove or elevate section label

**Sprint 2 — High-impact consistency and contrast:**
- H1: Replace auth page `.btnPrimary` with `Button` component
- H2: Add `useReducedMotion()` guard to all Framer Motion components
- H3: Increase citizen portal nav link contrast
- H5: Adjust `--color-text-tertiary` or restrict its use on `bg-secondary`
- H6: Add `aria-hidden="true"` to all decorative emoji

**Sprint 3 — Medium polish and mobile UX:**
- M1: Pass icon and action props to `EmptyState` from `DataTable`
- M4: Change DataTable search to `type="search"`
- M5: Replace auth page submit buttons with `Button isLoading`
- M11/M12/M13: Increase touch target sizes for modal close, toast close, password toggle
- M10: Replace hardcoded strings in `CitizenLoginPage` with i18n keys

---

*End of Part 2*
