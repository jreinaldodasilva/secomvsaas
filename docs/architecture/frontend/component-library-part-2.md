# Secom Frontend — Component Library & Design System Audit
## Part 2: Design System Documentation

---

## 3. Design System Documentation

The design system is implemented as a set of CSS custom properties in `src/styles/tokens/index.css`, consumed via `var()` in per-component CSS Modules and in `src/styles/global.css` for global utility classes. There is no JavaScript-side token system, no Tailwind, and no CSS-in-JS.

### 3.1 Color System

#### Primary — Azul Petróleo

| Token | Value | Usage Context |
|---|---|---|
| `--color-primary-50` | `#eef2f7` | Light tints, hover backgrounds |
| `--color-primary-100` | `#d5dff0` | Subtle backgrounds |
| `--color-primary-200` | `#aabfe0` | Borders, dividers |
| `--color-primary-300` | `#7a9acb` | Disabled states |
| `--color-primary-400` | `#4e75b0` | Secondary actions |
| `--color-primary-500` | `#1e3a5f` | Primary brand color; focus rings; links |
| `--color-primary-600` | `#162e4d` | Button backgrounds; active states |
| `--color-primary-700` | `#10233b` | Button hover; dark surfaces |
| `--color-primary-800` | `#0a1828` | Page header gradient end |
| `--color-primary-900` | `#0F172A` | Page header gradient start; darkest surface |

#### Secondary — Verde Institucional

| Token | Value | Usage Context |
|---|---|---|
| `--color-secondary-50` | `#f0fdf4` | Light success tints |
| `--color-secondary-100` | `#dcfce7` | Success backgrounds |
| `--color-secondary-500` | `#166534` | Secondary brand; success text |
| `--color-secondary-600` | `#15803d` | Secondary hover |
| `--color-secondary-700` | `#14532d` | Secondary active |

#### Accent — Dourado

| Token | Value | Usage Context |
|---|---|---|
| `--color-accent-50` | `#fefce8` | Light accent tints |
| `--color-accent-100` | `#fef9c3` | Accent backgrounds |
| `--color-accent-200` | `#fef08a` | Accent borders |
| `--color-accent-300` | `#fde047` | Accent highlights |
| `--color-accent-400` | `#facc15` | Page header `h1` color (`.page-header h1`) |
| `--color-accent-500` | `#CA8A04` | Accent text on dark |
| `--color-accent-600` | `#a16207` | Accent hover |

#### Neutral / Grayscale

| Token | Value | Usage Context |
|---|---|---|
| `--color-neutral-0` | `#ffffff` | Pure white |
| `--color-neutral-25` / `--color-neutral-50` | `#F9FAFB` | Page backgrounds, filled inputs |
| `--color-neutral-100` | `#E5E7EB` | Borders, skeleton base |
| `--color-neutral-200` | `#D1D5DB` | Dividers, disabled backgrounds |
| `--color-neutral-300` | `#9CA3AF` | Placeholder text |
| `--color-neutral-400` | `#6B7280` | Tertiary text, icons |
| `--color-neutral-500` | `#4B5563` | Secondary text |
| `--color-neutral-600` | `#374151` | Body text |
| `--color-neutral-700` | `#1F2937` | Headings |
| `--color-neutral-800` | `#111827` | Dark text |
| `--color-neutral-900` | `#0F172A` | Darkest text |

**Legacy gray aliases:** `--color-gray-50/100/200/400/600/800/900` are defined as `var()` references to their neutral equivalents. These exist for backward compatibility with the vSaaS boilerplate and should be considered deprecated.

#### Semantic Tokens

| Token | Value | Usage Context |
|---|---|---|
| `--color-success` / `--color-success-dark` | `#00A344` | Success states, `StatusBadge` green |
| `--color-success-light` | `#dcfce7` | Success badge backgrounds |
| `--color-success-500` | `#22c55e` | Success icons |
| `--color-success-600` | `#16a34a` | Success text |
| `--color-warning` / `--color-warning-dark` | `#E65100` / `#F57C00` | Warning states |
| `--color-warning-light` | `#fde68a` | Warning badge backgrounds |
| `--color-warning-400` | `#f59e0b` | Warning icons |
| `--color-danger` / `--color-error` / `--color-error-dark` | `#D32F2F` | Error states, danger buttons |
| `--color-error-light` | `#fee2e2` | Error badge backgrounds |
| `--color-error-500` | `#ef4444` | Error icons, required field markers |
| `--color-error-600` | `#dc2626` | Error text |
| `--color-info` / `--color-info-dark` | `#1976D2` | Info states |
| `--color-info-light` | `#dbeafe` | Info badge backgrounds |

#### Background / Surface Tokens

| Token | Value | Usage Context |
|---|---|---|
| `--color-bg-primary` | `#ffffff` | Main page background, card backgrounds |
| `--color-bg-secondary` | `#F9FAFB` | Sidebar, form sections, filled inputs |
| `--color-text-primary` | `#0F172A` | Body text, headings |
| `--color-text-secondary` | `#374151` | Paragraph text, labels |
| `--color-text-tertiary` | `#60646C` | Helper text, placeholders, icons |
| `--color-border-primary` | `#D1D5DB` | Input borders, card borders, dividers |
| `--color-border-focus` | `#1e3a5f` | Focus ring border color |

#### Stat Icon Palette (Dashboard Gradients)

| Token Pair | From → To | Dashboard Module |
|---|---|---|
| `--color-icon-blue-from/to` | `#3b82f6` → `#1d4ed8` | Press Releases |
| `--color-icon-teal-from/to` | `#14b8a6` → `#0f766e` | Media Contacts |
| `--color-icon-purple-from/to` | `#a855f7` → `#7c3aed` | Clippings |
| `--color-icon-orange-from/to` | `#f97316` → `#c2410c` | Events |
| `--color-icon-green-from/to` | `#22c55e` → `#15803d` | Appointments |
| `--color-icon-indigo-from/to` | `#6366f1` → `#4338ca` | Citizens |
| `--color-icon-pink-from/to` | `#ec4899` → `#be185d` | Social Media |

These tokens are defined but their consumption is limited to `DashboardPage.module.css`. They are not used in any other component.

---

### 3.2 Typography

#### Font Families

| Token | Value | Usage |
|---|---|---|
| `--font-family-sans` / `--font-family-base` | `'Inter', system-ui, -apple-system, sans-serif` | All UI text |
| `--font-sans` | Same as above | Legacy alias |
| `--font-family-mono` | `'JetBrains Mono', monospace` | Defined but not observed in use in any component |

#### Type Scale

| Token | Value | Usage |
|---|---|---|
| `--font-size-xs` | `0.75rem` (12px) | Badge text, helper text, small labels |
| `--font-size-sm` | `0.875rem` (14px) | Labels, secondary text, small buttons |
| `--font-size-base` | `1rem` (16px) | Body text, form inputs |
| `--font-size-lg` | `1.125rem` (18px) | `h6`, large buttons |
| `--font-size-xl` | `1.25rem` (20px) | `h5` |
| `--font-size-2xl` | `1.5rem` (24px) | `h4`, page header titles |
| `--font-size-3xl` | `1.75rem` (28px) | `h3` |
| `--font-size-4xl` | `2.25rem` (36px) | `h2` |
| `--font-size-5xl` | `3rem` (48px) | `h1` (landing page hero) |

**Note:** `--input-font-size: 16px` is set explicitly to prevent iOS auto-zoom on focus. This is a correct accessibility practice.

#### Font Weights

| Token | Value |
|---|---|
| `--font-weight-light` | 300 |
| `--font-weight-normal` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |
| `--font-weight-extrabold` | 800 |
| `--font-weight-black` | 900 |

#### Line Heights

| Token | Value | Usage |
|---|---|---|
| `--line-height-tight` | 1.2 | Headings |
| `--line-height-snug` | 1.4 | Compact text |
| `--line-height-normal` | 1.5 | Body text |
| `--line-height-relaxed` | 1.6 | Paragraphs, textarea content |

#### Heading Hierarchy (from `global.css`)

| Element | Font Size Token | Font Weight |
|---|---|---|
| `h1` | `--font-size-5xl` | bold (700) |
| `h2` | `--font-size-4xl` | semibold (600) |
| `h3` | `--font-size-3xl` | semibold (600) |
| `h4` | `--font-size-2xl` | semibold (600) |
| `h5` | `--font-size-xl` | semibold (600) |
| `h6` | `--font-size-lg` | semibold (600) |

---

### 3.3 Spacing & Layout

#### Spacing Scale

| Token | Value | Equivalent |
|---|---|---|
| `--space-0` | 0 | 0 |
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-5` | 1.25rem | 20px |
| `--space-6` | 1.5rem | 24px |
| `--space-8` | 2rem | 32px |
| `--space-9` | 2.25rem | 36px |
| `--space-10` | 2.5rem | 40px |
| `--space-12` | 3rem | 48px |
| `--space-16` | 4rem | 64px |
| `--space-20` | 5rem | 80px |
| `--space-24` | 6rem | 96px |
| `--space-32` | 8rem | 128px |

**Note:** `--space-7` and `--space-14` are absent from the scale. This is not a gap in practice — no component uses these values — but it is a minor inconsistency with a standard 4px-base scale.

#### Component Dimension Tokens

| Token | Value | Usage |
|---|---|---|
| `--button-height-sm` | 2rem (32px) | Small button min-height |
| `--button-height-md` | 2.75rem (44px) | Medium button — WCAG 2.5.5 touch target |
| `--button-height-lg` | 3rem (48px) | Large button |
| `--input-height-sm` | 2rem | Small input |
| `--input-height-md` | 2.75rem (44px) | Medium input — WCAG 2.5.5 touch target |
| `--input-height-lg` | 3rem | Large input |
| `--card-padding-sm` | `var(--space-3)` | 12px |
| `--card-padding-md` | `var(--space-4)` | 16px |
| `--card-padding-lg` | `var(--space-6)` | 24px |

#### Layout Tokens

| Token | Value | Usage |
|---|---|---|
| `--container-max-width` | 1140px | `.container` max-width |
| `--max-width-6xl` | 72rem (1152px) | Alternative max-width |
| `--header-height` | 4rem (64px) | Public header height reference |
| `--touch-target-min` | 44px | WCAG 2.5.5 minimum touch target |

#### Breakpoints

Breakpoints are defined inline in `global.css` (not as tokens):

| Breakpoint | Value | Usage |
|---|---|---|
| Mobile | `max-width: 480px` | Modal bottom-sheet behavior |
| Tablet | `max-width: 600px` | Form grid collapses to single column |
| Tablet+ | `min-width: 640px` | Container padding increase |
| Desktop | `min-width: 768px` | Hide/show mobile utilities |
| Desktop+ | `min-width: 1024px` | Container padding increase |
| Mobile nav | `max-width: 767px` | Page header stacks vertically |

**Observation:** Breakpoints are not tokenized — they are hardcoded values in media queries. This is a common pattern but means changing a breakpoint requires a grep-and-replace rather than a single token update.

#### Border Radius Scale

| Token | Value | Usage |
|---|---|---|
| `--radius-none` | 0 | Sharp corners |
| `--radius-sm` | 0.25rem | Small elements |
| `--radius-md` | 0.75rem | Modal, form sections |
| `--radius-lg` | 0.9375rem | Buttons, inputs, cards (default) |
| `--radius-xl` | 1rem | Modal container, page header |
| `--radius-2xl` | 1.5rem | Mobile modal bottom-sheet |
| `--radius-full` | 9999px | Pills, badges, avatars |
| `--radius-button` | `var(--radius-lg)` | Semantic alias |
| `--radius-input` | `var(--radius-lg)` | Semantic alias |
| `--radius-card` | `var(--radius-lg)` | Semantic alias |
| `--radius-modal` | `var(--radius-md)` | Semantic alias |

---

### 3.4 Styling Architecture

#### Methodology

The styling system uses three layers:

```
Layer 1: src/styles/tokens/index.css
  └── CSS custom properties on :root
      └── ~200 tokens covering color, spacing, typography, shadows, z-index, transitions

Layer 2: src/styles/global.css
  └── @import './tokens/index.css'
  └── Global resets (box-sizing, margin, padding)
  └── Element defaults (body, h1-h6, a, button, input)
  └── Utility classes: .btn, .btn-primary, .form-field, .form-stack,
      .form-grid, .form-section, .page-header, .spinner, .skeleton,
      .container, .cookie-banner, .legal-page, .fade-in, .slide-in-up

Layer 3: *.module.css (33 files)
  └── Component-scoped styles via CSS Modules
  └── Consume tokens via var(--token-name)
  └── No global class leakage (CSS Modules hash class names)
```

#### Global Utility Classes

| Class | Purpose | Used By |
|---|---|---|
| `.btn`, `.btn-{variant}`, `.btn-{size}` | Button styling | `Button` component (via class composition), `DashboardPage`, `SessionTimeoutModal`, `ProtectedRoute` (raw usage) |
| `.form-field` | Single field wrapper | `LoginForm` (raw usage) |
| `.form-stack` | Vertical form layout | All 7 domain forms |
| `.form-grid` | 2-column form layout | All 7 domain forms |
| `.form-section` | Grouped form section | `AppointmentForm`, `CitizenRecordsForm` |
| `.form-actions` | Submit row | All 7 domain forms |
| `.form-check` | Checkbox row | `EventForm` |
| `.page-header` | Page title bar | `CrudPage`, `DashboardPage` |
| `.spinner`, `.spinner-{size}` | Loading spinner | `Button` (loading state), `ProtectedRoute`, `ProtectedCitizenRoute` |
| `.skeleton`, `.skeleton-line`, `.skeleton-circle` | Skeleton placeholders | `Skeleton` component |
| `.loading-shimmer` | Shimmer animation | `Skeleton` component |
| `.container` | Max-width wrapper | Landing page sections |
| `.fade-in`, `.slide-in-up`, `.scale-in` | Entry animations | Landing sections |
| `.hide-mobile`, `.hide-desktop` | Responsive visibility | `MainHeader` |
| `.cookie-banner` | Cookie consent bar | `CookieConsent` |
| `.legal-page` | Legal page layout | `PrivacyPage`, `TermsPage` |
| `.skip-link` | Accessibility skip link | `App.tsx` |

#### Token Consumption Assessment

**Correctly consuming tokens via `var()`:** The majority of CSS Modules use tokens consistently. All core UI components (Button, Input, Modal, Card, FormField, StatusBadge, Skeleton, Toast, Breadcrumbs, DataTable, EmptyState) consume tokens exclusively for colors, spacing, typography, and shadows.

**Bypassing tokens with hardcoded values:** 34 hardcoded hex color values were found across 9 files:

| File | Hardcoded Values | Severity |
|---|---|---|
| `StatusBadge.module.css` | `#92400e`, `#d97706`, `#1e40af`, `#3b82f6` (yellow/blue variants) | 🟧 High — core shared component |
| `PasswordInput.tsx` | `#e74c3c`, `#f39c12`, `#2ecc71`, `#27ae60` (strength colors) | 🟧 High — inline JS constants |
| `Auth.module.css` | `#fef2f2`, `#fecaca`, `#eff6ff`, `#bfdbfe`, `#1d4ed8`, `#f0fdf4`, `#bbf7d0` | 🟧 High — auth pages are high-visibility |
| `DashboardLayout.module.css` | `#fff` (3 instances) | 🟨 Medium — white on dark sidebar |
| `DashboardMockup/DashboardMockup.module.css` | `#fff` (3), `#dcfce7`, `#166534`, `#fef9c3`, `#854d0e`, `#dbeafe`, `#1e40af` | 🟩 Low — landing page mockup only |
| `ConnectionBanner.module.css` | `#fff` (2 instances) | 🟨 Medium |
| `Landing.module.css` | `rgba(0,0,0,0.65)`, `#fff` | 🟩 Low — landing page only |
| `LandingPage.module.css` | Not inspected in detail | 🟩 Low |
| `ContactForm.module.css` | Not inspected in detail | 🟩 Low |

The most impactful violations are in `StatusBadge` (used 10 times across all modules) and `PasswordInput` (used in auth flows). The yellow and blue badge variants lack corresponding semantic tokens — `--color-warning-*` covers orange/amber but not the amber-brown text color `#92400e` used in the yellow badge.

#### Dark Mode Support

No dark mode is implemented. There is no `@media (prefers-color-scheme: dark)` block in any CSS file. The token system uses semantic surface tokens (`--color-bg-primary`, `--color-bg-secondary`) which would support a dark mode implementation via a `:root[data-theme="dark"]` override, but this is not currently built.

#### Theming Architecture

The token system is defined on `:root` with no theming layer. Multi-tenant theming (e.g., different primary colors per tenant) is not implemented. The architecture would support it via a CSS class or data attribute override on `<html>` or `<body>`, but this is not a current requirement.

#### Style Leakage Risk

CSS Modules hash class names at build time, preventing leakage between component scopes. The risk of leakage is between **global utility classes** (`.btn`, `.form-stack`, etc.) and component-scoped styles.

Observable leakage patterns:
- `DashboardPage` uses `className="btn btn-outline btn-sm"` on raw `<button>` elements — this is intentional consumption of global utilities, not leakage.
- `SessionTimeoutModal` uses `className="btn btn-primary"` on raw `<button>` elements instead of the `Button` component — this is an inconsistency, not a leakage bug.
- `ProtectedRoute` and `ProtectedCitizenRoute` use `className="spinner spinner-lg"` on raw `<div>` elements — same pattern.

The risk is not CSS leakage in the technical sense, but **API fragmentation**: some components use the `Button` component (which encapsulates the `.btn` class logic), while others use the global classes directly. If the `.btn` class API changes, both paths must be updated.

---

### 3.5 Design System Consistency Observations

**Strengths:**
- The token system is comprehensive and well-named. Semantic aliases (`--radius-button`, `--radius-input`, `--radius-card`) make intent clear.
- All 7 domain forms use `.form-stack` + `.form-grid` + `FormField` consistently — the form workflow pattern is fully standardized.
- `StatusBadge` is the single shared status indicator across all modules — no per-module status badge reimplementation.
- Shadow tokens use a semantic naming convention (`--shadow-card`, `--shadow-modal`, `--shadow-dropdown`) that maps intent to value.

**Gaps:**
- No token for the amber-brown text color used in warning/yellow badge states (`#92400e`). The warning scale has `--color-warning-700: #b45309` which is close but not identical.
- No token for pure white (`#fff`) as a text color on dark backgrounds. `--color-neutral-0: #ffffff` exists but is not used in this context.
- Breakpoints are not tokenized, making responsive design changes require multi-file edits.
- The `--font-family-mono` token is defined but not observed in use in any component.

**Scalability readiness:**
The token system is well-positioned for future expansion. Adding dark mode, a second brand theme, or additional semantic tokens would require only additions to `tokens/index.css` and corresponding CSS Module updates. The absence of CSS-in-JS means there is no runtime theming overhead.
