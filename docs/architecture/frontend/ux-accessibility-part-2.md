# Secom Frontend — UX, Accessibility & Visual Design Audit
## Part 2: Responsive Design Evaluation & Accessibility Compliance

> Continuation of the Secom UX audit. See Part 1 for Executive Summary and Design Consistency findings.

---

## 4. Responsive Design Evaluation

### 4.1 Breakpoint Reference

The application defines breakpoints inline in CSS media queries (not as tokens). The following values are in active use:

| Breakpoint | Value | Primary Usage |
|---|---|---|
| `bp-sm` | `max-width: 480px` | Modal bottom-sheet; stat grid single column; form grid collapse |
| `bp-md` | `max-width: 600px` | Form grid collapses to single column |
| `bp-lg` | `min-width: 640px` | Container padding increase |
| `bp-xl` | `max-width: 767px` | Page header stacks; DashboardLayout mobile drawer; DataTable card-view |
| `bp-2xl` | `min-width: 768px` | Hide/show mobile utilities; desktop sidebar |
| `bp-3xl` | `min-width: 1024px` | Container padding increase; widget grid collapse |
| `bp-dashboard` | `max-width: 840px` | Dashboard banner stacks; stat grid 2-column |
| `bp-dashboard-sm` | `max-width: 1024px` | Dashboard widget grid collapses to 1 column |

**Observation:** The breakpoint set is pragmatic but not unified. Seven distinct breakpoint values are used across the codebase. A standardized 4-breakpoint system (mobile / tablet / desktop / wide) would reduce cognitive overhead for contributors.

### 4.2 Viewport Testing Matrix

| Page | Mobile 375px | Tablet 768px | Desktop 1440px | Issues |
|---|---|---|---|---|
| Landing `/` | 🟩 Good | 🟩 Good | 🟩 Good | Hero text and CTA stack correctly; stats grid wraps cleanly |
| Login `/login` | 🟩 Good | 🟩 Good | 🟩 Good | Card is max-width 440px; centers correctly at all sizes |
| Staff Dashboard `/admin/dashboard` | 🟩 Good | 🟨 Mixed | 🟩 Good | Tablet: sidebar is off-canvas (correct); stat cards show 2-column at 840px; widget grid collapses at 1024px |
| Press Releases `/press-releases` | 🟩 Good | 🟩 Good | 🟩 Good | DataTable card-view on mobile is well-implemented; `page-header` stacks correctly |
| Events `/events` | 🟩 Good | 🟩 Good | 🟩 Good | Same as Press Releases |
| Appointments `/appointments` | 🟩 Good | 🟩 Good | 🟩 Good | Form sections collapse to single column at 600px |
| Social Media `/social-media` | 🟩 Good | 🟩 Good | 🟩 Good | Consistent with other domain pages |
| Citizen Portal Home `/portal` | 🟩 Good | 🟩 Good | 🟩 Good | Service card grid uses `auto-fit minmax(220px, 1fr)` — wraps cleanly |
| Citizen Dashboard `/portal/dashboard` | 🟩 Good | 🟩 Good | 🟩 Good | Welcome banner and quick links stack correctly |
| Citizen Profile `/portal/profile` | 🟨 Mixed | 🟩 Good | 🟩 Good | `fieldRow` stacks at 480px (correct); label min-width 160px may be tight at 375px |
| Modal (domain forms) | 🟩 Good | 🟩 Good | 🟩 Good | Bottom-sheet at ≤480px; form grid collapses at 600px |
| 404 / Unauthorized | 🟨 Mixed | 🟨 Mixed | 🟨 Mixed | No layout wrapper; no responsive treatment; raw page content |

### 4.3 Layout Breakage Analysis

**No horizontal scrolling observed** in any page at 375px based on CSS analysis. The following patterns prevent overflow:
- `box-sizing: border-box` on all elements (global reset)
- `max-width: 100%` on images
- `overflow-x: auto` on `DataTable` container (desktop)
- `overflow-x: visible` on `DataTable` container (mobile, card-view)
- `white-space: nowrap` + `overflow: hidden` + `text-overflow: ellipsis` on truncated text

**Potential overflow risk:** `CitizenPortalLayout` header navigation on narrow viewports. The `.nav` uses `display: flex; gap: var(--space-4)` with no wrapping or hamburger menu. At 375px with a logged-in citizen, the header contains: brand link + "Início" + "Meu perfil" + "Sair" button. This is 4 items in a flex row with no `flex-wrap` — overflow is possible on very narrow screens (320px) but unlikely at 375px.

**Not inferable from repository structure:** Actual pixel-level rendering at each breakpoint. The above analysis is based on CSS rules and layout logic.

### 4.4 Navigation Behavior

**Staff dashboard (mobile):**
- Sidebar becomes a fixed off-canvas drawer (`transform: translateX(-100%)`)
- A fixed top bar (64px) shows the logo and hamburger button
- Overlay covers main content when drawer is open
- Drawer closes on route change (`useEffect` on `location.pathname`)
- Drawer closes on viewport resize below 768px (`matchMedia` listener)
- **Assessment:** ✅ Correct and complete mobile navigation pattern

**Citizen portal (mobile):**
- Header is `position: sticky` with `display: flex` nav
- No hamburger menu or mobile drawer
- Navigation items are inline links with no collapse behavior
- **Assessment:** 🟨 Acceptable for the current 2–3 nav items; will break if more items are added

**Public layout (mobile):**
- `MainHeader` uses `.hide-mobile` / `.hide-desktop` utility classes for responsive nav
- Mobile menu state is managed via `useState` in `MainHeader`
- **Assessment:** Not inferable in detail without reading `MainHeader.tsx` fully, but the utility class pattern is documented.

### 4.5 Component Reflow Quality

| Component | Mobile Behavior | Assessment |
|---|---|---|
| `DataTable` | Transforms to card-view with `data-label` column headers | ✅ Excellent — best-in-class mobile table pattern |
| `Modal` | Bottom-sheet at ≤480px with `border-radius` top corners | ✅ Mobile-native feel |
| `page-header` | Stacks vertically at ≤767px; actions row goes full-width | ✅ Correct |
| `.form-grid` | Collapses to single column at ≤600px | ✅ Correct |
| `.form-grid-3` | Collapses to single column at ≤600px | ✅ Correct |
| Dashboard stat cards | `auto-fill minmax(9.5rem, 1fr)` → 2-col at 840px → 1-col at 480px | ✅ Smooth reflow |
| Dashboard widgets | 2-col → 1-col at 1024px | ✅ Correct |
| `Toast` close button | Expands to 44×44px touch target at ≤767px | ✅ WCAG 2.5.5 compliant |
| `Modal` close button | Expands to 44×44px touch target at ≤767px | ✅ WCAG 2.5.5 compliant |
| `.btn-sm` | `min-height: 2.75rem` at ≤767px | ✅ WCAG 2.5.5 compliant |

### 4.6 Secom-Specific Responsive Assessment

**Citizen-facing pages (appointments, citizen portal):** The citizen portal home page and dashboard are fully functional on mobile. The service card grid wraps cleanly. The profile page field layout stacks correctly at 480px. The primary concern is the absence of a mobile navigation menu — if the citizen portal grows to 5+ pages, the current inline nav will need a hamburger pattern.

**Staff dashboards on tablet (768px):** The sidebar correctly becomes an off-canvas drawer at 768px. Domain module pages (press releases, clipping, social media) are fully usable on tablet — the `DataTable` remains in table mode at 768px (card-view triggers at 767px), which is appropriate for tablet use. The dashboard widget grid collapses to single column at 1024px, which may be too early for a 1024px tablet in landscape mode.

---

## 5. Accessibility Compliance Report

### 5.1 Automated Accessibility Review

**Not inferable from repository structure:** Actual Lighthouse scores and axe-core violation counts require a running application. The following assessment is based on static code analysis of HTML structure, ARIA attributes, CSS, and component implementations.

**Estimated compliance by category (WCAG 2.1 AA):**

| Category | Estimated Compliance | Primary Gaps |
|---|---|---|
| Perceivable (1.x) | ~75% | Color contrast gaps in warning/info states; emoji without text alternatives in citizen portal |
| Operable (2.x) | ~70% | Focus not restored on modal close; citizen portal `aria-current` disabled; no skip link on citizen portal |
| Understandable (3.x) | ~60% | Hybrid English/Portuguese validation messages; raw enum status labels; `aria-label="Loading"` in English |
| Robust (4.x) | ~65% | Duplicate modal IDs; `aria-live` conflict in Toast; `FormField` missing `aria-describedby` injection |

### 5.2 Critical Accessibility Issues

#### Issue A1 — Modal Duplicate `id="modal-title"` (🟥 Critical)

**Location:** `src/components/UI/Modal/Modal.tsx`

**Evidence:**
```tsx
// Modal.tsx — static string IDs
<h2 id="modal-title" ...>{title}</h2>
<p id="modal-desc" ...>{description}</p>
// aria-labelledby="modal-title" aria-describedby="modal-desc"
```

**Impact:** When `CrudPage` renders both the form modal and the delete `ConfirmDialog` simultaneously (which both use `Modal`), two elements with `id="modal-title"` exist in the DOM. The HTML spec requires IDs to be unique. Screen readers and ARIA tooling will associate `aria-labelledby` with the first matching ID, producing incorrect announcements.

**Fix direction:** Replace static strings with `useId()` hook values.

---

#### Issue A2 — `CitizenPortalLayout` `aria-current` Disabled (🟥 Critical)

**Location:** `src/layouts/CitizenPortalLayout/CitizenPortalLayout.tsx`

**Evidence:**
```tsx
// CitizenPortalLayout.tsx
const navProps = ({ isActive }: { isActive: boolean }) => ({
  className: isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink,
  'aria-current': isActive ? ('page' as const) : undefined,  // ✅ This is CORRECT
});
```

**Correction from prior documentation:** The `CitizenPortalLayout` source code shows `aria-current` IS correctly set to `'page'` when active and `undefined` when inactive. This is the correct pattern — `undefined` means the attribute is omitted (not set to `"undefined"` as a string). The previously documented finding in `component-library-part-3.md §4.16` was based on an earlier version of the file. **This issue is resolved in the current codebase.**

---

#### Issue A3 — `FormField` Missing `aria-describedby` Injection (🟥 Critical)

**Location:** `src/components/UI/FormField/FormField.tsx`, all 7 domain forms

**Evidence:** `FormField` renders an error paragraph with `id="{name}-error"` and `role="alert"`, but does not inject `aria-describedby` onto its child input. Domain forms use raw `<input>` elements that do not set `aria-describedby` manually.

**Impact:** Screen readers do not announce field-level error messages when validation fails. The `role="alert"` on the error paragraph will announce the error when it first appears, but the programmatic association between the input and its error is absent — users navigating by form field will not hear the error when they focus the input.

**Fix direction:** `FormField` should use `React.cloneElement` or a context pattern to inject `aria-describedby={name + '-error'}` onto the child element when an error is present.

---

#### Issue A4 — Hybrid Validation Messages (🟥 Critical — UX)

**Location:** All 7 domain module validation functions in `src/validation/domain/`

**Evidence (from `forms-validation-part-1.md`):** Zod's built-in English error messages are appended to i18n field name keys, producing strings like:
```
"Título — String must contain at least 5 character(s)"
```

**Impact:** End users see English technical error messages in a Portuguese-language government application. This is a credibility and usability failure.

**Fix direction:** Override Zod's default error map with Portuguese messages, or replace Zod's `.parse()` error extraction with custom Portuguese message construction.

---

#### Issue A5 — Focus Not Restored on Modal Close (🟧 High)

**Location:** `src/components/UI/Modal/Modal.tsx`

**Evidence:** The `Modal` component moves focus to the first focusable element on open (via the focus trap implementation) but does not store a reference to the trigger element and restore focus on close.

**Impact:** After closing a modal, keyboard focus is lost — it typically falls back to the `<body>` element. Users must re-navigate to their previous position in the page.

**Fix direction:** Store `document.activeElement` before opening the modal and call `.focus()` on it in the cleanup effect when `isOpen` transitions from `true` to `false`.

### 5.3 Keyboard Navigation Review

| Element | Tab Order | Focus Visible | Keyboard Accessible | Notes |
|---|---|---|---|---|
| Skip link | ✅ First in tab order | ✅ Visible on focus | ✅ | `position: absolute; top: -3rem` → `top: var(--space-4)` on focus |
| Sidebar navigation | ✅ Logical | ✅ `outline: 2px solid` via global rule | ✅ | `aria-current="page"` on active link |
| `DataTable` rows | ✅ `tabIndex={0}` | ✅ `outline: 2px solid` | ✅ Arrow keys + Enter/Space | `role="button"` on clickable rows |
| `DataTable` sort headers | ✅ | ✅ | ✅ | `aria-sort` attribute present |
| `Modal` | ✅ Focus trap | ✅ | ✅ Escape closes | Focus not restored on close (Issue A5) |
| `Button` | ✅ | ✅ `focus-visible` outline | ✅ | `aria-busy` during loading |
| `Input` | ✅ | ✅ `box-shadow: var(--focus-ring)` | ✅ | Escape clears when `showClearButton` |
| Domain form inputs (raw) | ✅ | ✅ via `global.css` `:focus-visible` | ✅ | No `aria-describedby` (Issue A3) |
| `Toast` close button | ✅ | ✅ | ✅ | `aria-label="Fechar"` |
| `ConfirmDialog` | ✅ Focus trap via `Modal` | ✅ | ✅ | Confirm button always labeled "Excluir" regardless of action |
| Citizen portal nav | ✅ | ✅ | ✅ | No mobile hamburger — all items always in tab order |
| `PasswordInput` toggle | ✅ | ✅ | ✅ | `aria-label` for show/hide |
| `Breadcrumbs` | ✅ | ✅ | ✅ | `aria-current="page"` on last item |

**Overall keyboard navigation assessment:** 🟩 Good — the application is largely keyboard-navigable. The primary gap is focus restoration after modal close (Issue A5).

### 5.4 Screen Reader Compatibility

| Element | Landmark | Heading Hierarchy | ARIA Labels | Assessment |
|---|---|---|---|---|
| `DashboardLayout` | `<aside>`, `<nav aria-label>`, `<main id="main-content">` | ✅ | ✅ Sidebar toggle, nav label | 🟩 Good |
| `CitizenPortalLayout` | `<header>`, `<main id="main-content">`, `<footer>` | ✅ | ✅ | 🟩 Good |
| `PublicLayout` | Inherits from `MainHeader` + `Footer` | ✅ | Not fully inspected | 🟨 Partial |
| Domain pages | `<h1>` in `.page-header` | ✅ Single `h1` per page | ✅ | 🟩 Good |
| `DataTable` | `<table>` with `<thead>`, `<tbody>` | N/A | `aria-sort`, `aria-label` on search | 🟩 Good |
| `Modal` | `role="dialog"`, `aria-modal="true"` | `<h2>` for title | `aria-labelledby`, `aria-describedby` (ID bug) | 🟧 Partial |
| `Toast` | `role="alert"`, `aria-live="assertive"` | N/A | `aria-label="Fechar"` on close | 🟧 Partial (live region conflict) |
| `Skeleton` | `role="status"`, `aria-live="polite"` | N/A | `sr-only` "Carregando..." | 🟩 Good |
| `Button` (loading) | N/A | N/A | `aria-busy="true"`, `sr-only` "Carregando..." | 🟩 Good |
| `FormField` error | `role="alert"` | N/A | `id="{name}-error"` | 🟧 Partial (no `aria-describedby` on child) |
| `Breadcrumbs` | `<nav aria-label="Breadcrumb">` | N/A | `aria-current="page"` | 🟩 Good |
| `Loading` spinner | `role="status"` | N/A | `aria-label="Loading"` (English) | 🟨 Minor — should be Portuguese |

**Dynamic content updates:** The `TopLoadingBar` has no ARIA live region — it is a visual-only indicator. The `ConnectionBanner` has no `role="alert"` or `aria-live` — users relying on screen readers will not be notified of API connectivity loss. The `SessionTimeoutModal` uses `Modal` which has `role="dialog"` — the warning will be announced when it opens.

### 5.5 Color Contrast Audit

The following contrast ratios are calculated from the design token values. WCAG 2.1 AA requires 4.5:1 for normal text and 3:1 for large text (≥18pt or ≥14pt bold).

| Element | Foreground | Background | Approx. Ratio | WCAG Level | Pass/Fail |
|---|---|---|---|---|---|
| Body text (`--color-text-primary` on `--color-bg-primary`) | `#0F172A` | `#ffffff` | ~19.5:1 | AA + AAA | ✅ Pass |
| Secondary text (`--color-text-secondary` on `--color-bg-primary`) | `#374151` | `#ffffff` | ~10.7:1 | AA + AAA | ✅ Pass |
| Tertiary text (`--color-text-tertiary` on `--color-bg-primary`) | `#60646C` | `#ffffff` | ~5.9:1 | AA | ✅ Pass |
| Primary button text (white on `--color-primary-600`) | `#ffffff` | `#162e4d` | ~14.5:1 | AA + AAA | ✅ Pass |
| Page header `h1` (`--color-accent-400` on `--color-primary-900`) | `#facc15` | `#0F172A` | ~11.2:1 | AA + AAA | ✅ Pass |
| Sidebar nav link (rgba 87% white on `--color-primary-900`) | `rgba(255,255,255,0.87)` ≈ `#dde` | `#0F172A` | ~12.8:1 | AA + AAA | ✅ Pass |
| Sidebar nav active (white on rgba 12% white overlay) | `#ffffff` | `#0F172A` + 12% | ~13.1:1 | AA + AAA | ✅ Pass |
| Error text (`--color-error` on `--color-error-50`) | `#D32F2F` | `#fef2f2` | ~4.6:1 | AA | ✅ Pass (marginal) |
| Warning text (`--color-warning-800` on `--color-warning-50`) | `#92400e` | `#fffbeb` | ~7.2:1 | AA + AAA | ✅ Pass |
| Info text (`--color-info-700` on `--color-info-50`) | `#1d4ed8` | `#eff6ff` | ~5.9:1 | AA | ✅ Pass |
| Success text (`--color-success-dark` on `--color-success-light`) | `#00A344` | `#dcfce7` | ~3.8:1 | AA (large text) | ⚠️ Marginal for small text |
| Placeholder text (`--color-neutral-400` on `--color-bg-primary`) | `#6B7280` | `#ffffff` | ~4.6:1 | AA | ✅ Pass (marginal) |
| Disabled button text (`--color-neutral-500` on `--color-neutral-200`) | `#4B5563` | `#D1D5DB` | ~2.8:1 | — | ❌ Fail (intentional — disabled state) |
| `StatusBadge` green text (`--color-success-dark` on `--color-success-100`) | `#00A344` | `#dcfce7` | ~3.8:1 | AA (large text only) | ⚠️ Marginal for `font-size-xs` (12px) |
| `StatusBadge` gray text (`--color-neutral-600` on `--color-neutral-100`) | `#374151` | `#E5E7EB` | ~6.2:1 | AA + AAA | ✅ Pass |
| Citizen portal nav link (`--color-primary-100` on `--color-primary-900`) | `#d5dff0` | `#0F172A` | ~11.8:1 | AA + AAA | ✅ Pass |
| `.citizenBar` text (`--color-primary-200` on `--color-primary-800`) | `#aabfe0` | `#0a1828` | ~8.4:1 | AA + AAA | ✅ Pass |
| Table header text (`--color-text-tertiary` on `--color-neutral-50`) | `#60646C` | `#F9FAFB` | ~5.7:1 | AA | ✅ Pass |

**Key contrast findings:**
- 🟧 `StatusBadge` green variant: `#00A344` on `#dcfce7` achieves ~3.8:1. At `font-size-xs` (12px / 9pt), this fails WCAG AA for normal text (requires 4.5:1). The badge text is not bold, so the large-text exception does not apply. This is a marginal failure for the most common badge variant.
- 🟩 All primary interactive elements (buttons, links, form labels) pass AA contrast requirements.
- 🟩 The dark sidebar achieves excellent contrast ratios throughout.
- ⚠️ Disabled states intentionally fail contrast — this is acceptable per WCAG 1.4.3 exception for disabled components.

### 5.6 Secom-Specific Accessibility Assessment

**Citizen-facing pages:** The citizen portal home page uses emoji as primary icons with `aria-hidden="true"` — the emoji are decorative and the text labels provide the accessible name. This is technically correct but reduces the quality of the experience for screen reader users who hear only the text without visual context. Replacing emoji with SVG icons from the `Icon` component would improve consistency.

**Role-based UI elements:** `StatusBadge` renders status as text within a colored pill. The text label is the accessible name — color alone is not used to convey meaning (the `::before` dot is decorative). This is WCAG 1.4.1 compliant. However, the `no_show` and `failed` statuses display as raw enum strings, which are not meaningful to screen reader users.

**Approval workflow states:** Press release status changes are communicated via `StatusBadge` in the table and via a `<select>` in the edit form. There is no live region announcement when a status changes — users must observe the table update after saving. For approval workflows, a toast notification on status change would improve feedback.

**`Loading` component `aria-label`:** The `Loading` component uses `aria-label="Loading"` in English. In a Portuguese-language application, this should be `aria-label="Carregando"`. This is a minor but observable inconsistency.
