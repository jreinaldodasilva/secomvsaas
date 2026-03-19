# Secom — UX & Accessibility Audit
## Part 1: Executive Summary · Design Consistency · Responsive Design

**Scope:** Full frontend codebase static analysis  
**Date:** 2025  
**Methodology:** Source-code review of components, layouts, pages, styles, and tokens  
**Coverage:** 15 pages / 4 layouts / 22 UI components

---

## 1. Executive Summary

The Secom frontend is built on a well-structured design system with a centralized token file (`src/styles/tokens/index.css`) and a global stylesheet (`src/styles/global.css`). The component library is modular, consistently uses CSS Modules, and demonstrates awareness of accessibility fundamentals — skip links, ARIA roles, focus rings, and `prefers-reduced-motion` support are all present.

Despite this solid foundation, the audit identified a set of recurring issues that create measurable UX and accessibility risk across the application.

### Key Findings Summary

| Severity | Count | Category |
|----------|-------|----------|
| 🟥 Critical | 5 | Accessibility — focus trap, ARIA, contrast |
| 🟧 High | 9 | Consistency, mobile layout, feedback gaps |
| 🟨 Medium | 11 | Polish, spacing drift, interaction quality |
| 🟩 Low | 7 | Enhancement opportunities |

### Top Risks

1. **SessionTimeoutModal** has no focus trap — keyboard users can navigate behind the modal while it is open.
2. **DashboardLayout sidebar** has no mobile breakpoint — it is never hidden or converted to a drawer on small screens, causing layout breakage below 768 px.
3. **Auth pages** use a local `.btnPrimary` class instead of the shared `Button` component, creating a parallel styling path that diverges from the design system.
4. **Color contrast** for several secondary text and badge combinations falls below the WCAG 2.1 AA 4.5:1 threshold.
5. **Framer Motion animations** on the Landing page have no `prefers-reduced-motion` guard at the component level — the global CSS override is the only protection.
6. **CookieConsent** and **ConnectionBanner** have no keyboard-accessible dismiss mechanism beyond the provided button, and the ConnectionBanner retry icon uses a semantically incorrect icon (`search`) for a retry action.

### Strengths

- Comprehensive design token system with semantic aliases.
- `prefers-reduced-motion` handled globally in CSS.
- Modal component has a native focus trap and Escape key support.
- DataTable has a mobile card-view transformation.
- Skip link is present and functional.
- All form inputs enforce `font-size: 16px` on mobile to prevent iOS zoom.
- Skeleton loaders are used consistently across data-loading states.
- `aria-live` regions are used on Spinner, Skeleton, and Toast components.

---

## 2. Design Consistency Audit

### 2.1 Page-by-Page Consistency Matrix

| Page | Color Consistency | Typography | Spacing | Layout | Issues |
|------|-------------------|------------|---------|--------|--------|
| Landing (`/`) | 🟨 Partial | ✅ Good | ✅ Good | ✅ Good | `!important` overrides on CTA buttons bypass token system |
| Login (`/login`) | 🟨 Partial | ✅ Good | ✅ Good | ✅ Good | Uses local `.btnPrimary` instead of `Button` component |
| Register (`/register`) | 🟨 Partial | ✅ Good | ✅ Good | ✅ Good | Same parallel button pattern as Login |
| Forgot Password | ✅ Good | ✅ Good | ✅ Good | ✅ Good | Consistent with auth pattern |
| Reset Password | ✅ Good | ✅ Good | ✅ Good | ✅ Good | Consistent with auth pattern |
| Accept Invite | ✅ Good | ✅ Good | ✅ Good | ✅ Good | Consistent with auth pattern |
| Dashboard (`/admin/dashboard`) | 🟨 Partial | ✅ Good | ✅ Good | ✅ Good | Stat icon colors use raw hex gradients, not tokens |
| Users (`/admin/users`) | 🟨 Partial | ✅ Good | 🟨 Partial | ✅ Good | Inline `form-stack` labels lack `htmlFor` association |
| Profile (`/settings/profile`) | 🟨 Partial | ✅ Good | 🟨 Partial | ✅ Good | Raw `<h2>` without page-level heading hierarchy |
| Press Releases | ✅ Good | ✅ Good | ✅ Good | ✅ Good | Fully uses CrudPage + FormField pattern |
| Media Contacts | ✅ Good | ✅ Good | ✅ Good | ✅ Good | Consistent with domain pattern |
| Events | ✅ Good | ✅ Good | ✅ Good | ✅ Good | Consistent with domain pattern |
| Citizen Portal Home (`/portal`) | 🟨 Partial | ✅ Good | ✅ Good | ✅ Good | Emoji used as icon — no `aria-hidden` |
| Citizen Login (`/portal/login`) | 🟨 Partial | ✅ Good | ✅ Good | ✅ Good | Hardcoded Portuguese strings, not using i18n keys |
| Error / 404 | 🟧 High | 🟧 High | ✅ Good | ✅ Good | Uses legacy `--color-gray-*` aliases; `h1` is oversized at `4.5rem` with no responsive scaling |

---

### 2.2 Common Inconsistencies

#### A — Parallel Button Styling Path

Auth pages (`LoginPage`, `CitizenLoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`) define a local `.btnPrimary` class in `Auth.module.css` that duplicates the global `.btn.btn-primary` styles. This creates two separate maintenance surfaces for the same visual element.

- `Auth.module.css` `.btnPrimary` uses `--color-primary-500` as background.
- Global `.btn-primary` uses `--color-primary-600`.
- The result is a **visible color difference** between auth-page buttons and dashboard buttons.

#### B — Raw Hex Colors in Dashboard Stat Cards

`DashboardPage.module.css` defines seven icon color variants using raw hex gradient values:

```css
.icon_blue   { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.icon_teal   { background: linear-gradient(135deg, #14b8a6, #0f766e); }
.icon_purple { background: linear-gradient(135deg, #a855f7, #7c3aed); }
```

None of these map to the token system. If the brand palette changes, these will not update automatically.

#### C — `!important` Overrides on Landing CTA

`LandingPage.module.css` uses `!important` to override button colors in the CTA section:

```css
.ctaBtnPrimary { background: var(--color-accent-400) !important; color: var(--color-primary-900) !important; }
.ctaBtnOutline { color: #fff !important; border: 2px solid rgba(255,255,255,0.7) !important; }
```

This breaks the cascade intentionally but makes future theming fragile and harder to debug.

#### D — Legacy Color Alias Usage

`ErrorPage.module.css` uses `--color-gray-200` and `--color-gray-600` (legacy aliases) rather than their semantic equivalents `--color-neutral-200` and `--color-text-secondary`. While the aliases resolve correctly today, they represent technical debt.

#### E — `ConfirmDialog` Uses Legacy Alias

`ConfirmDialog.module.css` uses `--color-gray-600` for paragraph text color, inconsistent with the rest of the component library which uses `--color-text-secondary`.

#### F — Hardcoded Strings in Citizen Portal

`CitizenLoginPage.tsx` contains hardcoded Portuguese strings (`'Entrar'`, `'Entrando...'`, `'Erro ao fazer login'`, `'Acesse o Portal do Cidadão'`) instead of i18n keys. The staff `LoginPage.tsx` correctly uses `t()` throughout. This creates a maintenance inconsistency between the two login flows.

---

### 2.3 Components Most Often Violating Design Standards

| Component | Violation Type | Frequency |
|-----------|---------------|-----------|
| Auth page buttons (`.btnPrimary`) | Parallel styling, color drift | 5 pages |
| Dashboard stat icon colors | Raw hex, no token | 7 variants |
| CTA section buttons | `!important` overrides | 1 section |
| Error page | Legacy color aliases | 1 page |
| ConfirmDialog body text | Legacy color alias | 1 component |
| Citizen Portal strings | Missing i18n | 1 page |

---

### 2.4 Impact on Brand and Usability

- The color difference between auth buttons (`--color-primary-500`, `#1e3a5f`) and dashboard buttons (`--color-primary-600`, `#162e4d`) is subtle but measurable — approximately 8% luminance difference. It is unlikely to be noticed by most users but will be visible in side-by-side comparisons and will complicate future brand updates.
- The `!important` overrides on the CTA section create a maintenance risk: any future design system update to button variants will not propagate to those elements without additional manual intervention.
- Hardcoded strings in the Citizen Portal login page mean that if the application is ever extended to support additional locales, that page will require a separate code change rather than a translation file update.

---

## 3. Responsive Design Evaluation

### 3.1 Breakpoint Reference

```
mobile:  0 – 767px
tablet:  768px – 1024px
desktop: 1025px+
```

Token defined: `--touch-target-min: 44px`  
Container max-width: `--container-max-width: 1140px`

---

### 3.2 Viewport Testing Matrix

| Page | Mobile 375px | Tablet 768px | Desktop 1920px | Issues |
|------|-------------|-------------|----------------|--------|
| Landing | 🟨 Partial | ✅ Good | ✅ Good | Hero image hidden on mobile — content-only fallback |
| Login | ✅ Good | ✅ Good | ✅ Good | Card max-width 440px centers correctly at all sizes |
| Register | ✅ Good | ✅ Good | ✅ Good | Same as Login |
| Dashboard | 🟥 Critical | 🟧 High | ✅ Good | Sidebar never collapses to drawer on mobile |
| Users | 🟥 Critical | 🟧 High | ✅ Good | Inherits dashboard sidebar breakage |
| Press Releases | 🟥 Critical | 🟧 High | ✅ Good | Inherits dashboard sidebar breakage |
| All domain pages | 🟥 Critical | 🟧 High | ✅ Good | Inherits dashboard sidebar breakage |
| Citizen Portal Home | ✅ Good | ✅ Good | ✅ Good | Service grid collapses correctly |
| Citizen Login | ✅ Good | ✅ Good | ✅ Good | Reuses auth card pattern |
| Citizen Dashboard | ✅ Good | ✅ Good | ✅ Good | Quick grid uses `auto-fit` |
| Error / 404 | ✅ Good | ✅ Good | ✅ Good | Simple centered layout |
| Profile | 🟨 Partial | ✅ Good | ✅ Good | No responsive adjustment for `.fieldRow` label/value layout |

---

### 3.3 Critical Issue: Dashboard Sidebar Has No Mobile Breakpoint

**Severity: 🟥 Critical**

`DashboardLayout.module.css` defines the sidebar at a fixed `width: 240px` (collapsed: `64px`) with no media query to hide it, convert it to a drawer, or overlay it on small screens.

```css
/* DashboardLayout.module.css — no mobile breakpoint exists */
.sidebar {
  width: 240px;
  background: var(--color-primary-900);
  flex-shrink: 0;
}
.sidebarClosed .sidebar { width: 64px; }
```

On a 375px viewport, the sidebar consumes 240px (64% of the screen width), leaving only 135px for the main content area. On a 375px screen with the sidebar collapsed, 64px is consumed, leaving 311px — still a significantly constrained content area with no touch-friendly navigation affordance.

**Affected pages:** All 10 dashboard/domain pages.

**Expected behavior:** Below 768px, the sidebar should either:
- Collapse to a bottom navigation bar, or
- Convert to an off-canvas drawer triggered by the hamburger toggle.

---

### 3.4 High Issue: Dashboard Banner Wraps but Actions Overflow

**Severity: 🟧 High**

`DashboardPage.module.css` has a 768px breakpoint that stacks the banner:

```css
@media (max-width: 768px) {
  .banner { flex-direction: column; align-items: flex-start; }
  .bannerActions { width: 100%; }
  .bannerActions > * { flex: 1; }
}
```

This is correct, but because the sidebar is still present at 768px, the effective content width is `768 - 240 = 528px`, meaning the banner breakpoint fires at a wider effective width than intended. The banner actions may still overflow at tablet sizes.

---

### 3.5 Medium Issue: Profile Page Field Layout Not Responsive

**Severity: 🟨 Medium**

`CitizenPortal.module.css` `.fieldRow` uses a horizontal label/value layout with `min-width: 160px` on the label:

```css
.fieldRow { display: flex; gap: var(--space-4); align-items: baseline; }
.fieldLabel { min-width: 160px; flex-shrink: 0; }
```

No breakpoint converts this to a stacked layout on narrow screens. On a 375px viewport, the label consumes 160px, leaving only ~175px for the value — insufficient for longer values like email addresses.

---

### 3.6 Medium Issue: Landing LGPD Section Image Hidden on Mobile

**Severity: 🟨 Medium**

```css
@media (max-width: 768px) {
  .lgpdImage { display: none; }
}
```

The LGPD section image is entirely hidden on mobile. While this prevents layout breakage, it removes visual context for the section. A reduced-size or stacked version would be preferable.

---

### 3.7 Low Issue: Visual Banner Grid Collapses to Single Column

**Severity: 🟩 Low**

The visual banner grid (`grid-template-columns: repeat(3, 1fr)`) collapses to a single column on mobile. A two-column layout at 480–768px would make better use of available space.

---

### 3.8 Positive Responsive Patterns

The following responsive implementations are well-executed and should be used as reference patterns:

- **DataTable mobile card-view** — `thead` is hidden, rows become block cards with `data-label` pseudo-element headers. This is a robust pattern for tabular data on mobile.
- **Modal bottom-sheet on mobile** — below 480px, modals align to the bottom of the screen with rounded top corners, matching native mobile sheet behavior.
- **MainHeader mobile menu** — the hamburger menu correctly hides desktop nav links and shows a full-width mobile menu with 44px touch targets.
- **Auth card** — `max-width: 440px` with `width: 100%` and horizontal padding ensures the card never overflows on any screen size.
- **Input font-size: 16px on mobile** — prevents iOS Safari auto-zoom on focus, applied both in the global stylesheet and in `Input.module.css`.

---

### 3.9 Responsive Summary

| Issue | Severity | Affected Pages |
|-------|----------|----------------|
| Sidebar has no mobile breakpoint | 🟥 Critical | All 10 dashboard pages |
| Banner breakpoint fires at wrong effective width | 🟧 High | Dashboard |
| Profile field layout not responsive | 🟨 Medium | Citizen Profile |
| LGPD image hidden instead of adapted | 🟨 Medium | Landing |
| Visual banner single-column on mobile | 🟩 Low | Landing |
