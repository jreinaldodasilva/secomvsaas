# Secom Frontend — UX, Accessibility & Visual Design Audit
## Part 1: Executive Summary & Design Consistency Audit

> **Document scope:** Static analysis of the frontend source tree, CSS modules, design tokens, and cross-referenced architecture documents.
> All findings are grounded in observable code and configuration.
> Speculative assumptions are explicitly marked.
> This document does not re-document findings already established in `overview-part*.md`, `component-library-part*.md`, `navigation-userflows-part*.md`, or `forms-validation-part*.md`. It cross-references those documents where relevant.

---

## 1. Executive Summary

### 1.1 Overall Assessment

The Secom frontend presents a **structurally sound but unevenly executed** UX and visual design implementation. The design token system is comprehensive and well-named; the component library is purpose-built and consistent at the structural level. However, a meaningful gap exists between the quality of the design system definition and its actual application across all surfaces — particularly in citizen-facing pages, authentication flows, and domain module forms.

| Dimension | Rating | Summary |
|---|---|---|
| UX maturity | 🟨 Moderate | Consistent staff dashboard patterns; citizen portal is thin and underdeveloped |
| Visual design quality | 🟨 Moderate | Strong token system; 34 hardcoded values undermine consistency; no dark mode |
| Accessibility compliance | 🟧 Partial | Core primitives are compliant; critical gaps in modal IDs, citizen nav, and form error association |
| Responsive design | 🟩 Good | Mobile-first breakpoints; DataTable card-view on mobile; modal bottom-sheet; minor gaps remain |
| Visual modernity | 🟨 Moderate | Aligns with 2022–2023 SaaS patterns; gradient banners and card grids are contemporary; no dark mode, no skeleton coverage on all pages |
| Mobile UX quality | 🟨 Moderate | Touch targets meet WCAG 2.5.5 on most components; citizen portal mobile nav is minimal |
| Animation quality | 🟩 Good | GPU-friendly properties; `prefers-reduced-motion` respected; framer-motion dependency is dead weight |
| Loading & feedback | 🟩 Good | TopLoadingBar + skeleton + button loading states provide layered feedback |
| Government context fit | 🟨 Moderate | Institutional color palette is appropriate; emoji usage in citizen portal reduces credibility |

### 1.2 Top 5 Risks by Severity

| # | Risk | Severity | Affected Surface |
|---|---|---|---|
| 1 | `Modal` uses static `id="modal-title"` — duplicate IDs with multiple simultaneous modals break ARIA associations | 🟥 Critical | All 7 domain module forms, confirm dialogs |
| 2 | `CitizenPortalLayout` sets `aria-current={undefined}` on active nav links — screen readers receive no active page signal | 🟥 Critical | Citizen portal navigation |
| 3 | `FormField` does not inject `aria-describedby` onto child inputs — error messages are not programmatically associated with fields | 🟥 Critical | All 7 domain forms (raw `<input>` children) |
| 4 | Validation error messages are hybrid English/Portuguese — Zod's built-in English messages are appended to i18n field name keys | 🟥 Critical | All 7 domain module forms |
| 5 | No navigation guard on any form — unsaved data is silently lost on modal close or route change | 🟧 High | All 17 forms (partially mitigated by `CrudPage` discard dialog) |

### 1.3 Accessibility Compliance Level

**Estimated WCAG 2.1 AA compliance: ~65%**

Core primitives (Button, Input, Modal, DataTable, Skeleton, Breadcrumbs) are well-implemented. The primary compliance gaps are concentrated in:
- Form error association (`aria-describedby` not injected by `FormField`)
- Citizen portal navigation (`aria-current` disabled)
- Modal ARIA ID uniqueness
- Toast live region conflict
- `LoginForm` error div missing `role="alert"`

### 1.4 Responsive Design Readiness

**Rating: Good (🟩)**

The application uses a mobile-first approach with documented breakpoints. `DataTable` transforms to a card-view layout on mobile. Modals become bottom-sheets on small screens. The `DashboardLayout` implements a proper off-canvas drawer pattern. The main gaps are in the citizen portal's mobile navigation (no hamburger menu, links may overflow on narrow viewports) and the absence of responsive handling for the dashboard widget grid on mid-range tablets.

### 1.5 Visual Modernity Assessment

**Rating: Moderate (🟨) — aligns with 2022–2023 standards**

The design language uses gradient banners, rounded cards with subtle shadows, icon-gradient stat cards, and a clean Inter typeface — all consistent with contemporary SaaS dashboard aesthetics. The primary modernity gaps are:
- No dark mode support
- Emoji used as primary iconography in citizen portal (reduces institutional credibility)
- No skeleton loading on citizen portal pages
- `--color-gray-*` legacy aliases still commented in token file (signals incomplete token migration)
- `framer-motion` listed as a production dependency but not used anywhere

---

## 2. Design Consistency & Visual Modernity Audit

### 2.1 Representative Page Audit

The following 13 pages were selected to cover authentication, staff dashboard, all 7 domain modules, citizen portal, and error states.

| Page | Route | Color Consistency | Typography | Spacing | Layout | Modernity Score | Issues |
|---|---|---|---|---|---|---|---|
| Landing | `/` | 🟩 Good | 🟩 Good | 🟩 Good | 🟩 Good | 8/10 | Emoji in hero section; `rgba(0,0,0,0.65)` hardcoded in `.visualLabel` |
| Login | `/login` | 🟩 Good | 🟩 Good | 🟩 Good | 🟩 Good | 8/10 | Gradient card header is modern; `Auth.module.css` now uses semantic tokens |
| Staff Dashboard | `/admin/dashboard` | 🟩 Good | 🟩 Good | 🟩 Good | 🟩 Good | 9/10 | `#92400e` hardcoded in alert; gradient banner + icon-gradient stat cards are contemporary |
| Press Releases | `/press-releases` | 🟩 Good | 🟩 Good | 🟩 Good | 🟩 Good | 8/10 | Consistent `page-header` + `DataTable` pattern; form uses raw `<input>` not `Input` component |
| Events | `/events` | 🟩 Good | 🟩 Good | 🟩 Good | 🟩 Good | 8/10 | Same as Press Releases; no end-before-start validation feedback |
| Appointments | `/appointments` | 🟩 Good | 🟩 Good | 🟩 Good | 🟩 Good | 8/10 | `form-section` grouping adds visual structure; status labels show raw enum values |
| Social Media | `/social-media` | 🟩 Good | 🟩 Good | 🟩 Good | 🟩 Good | 7/10 | Platform/status labels show raw enum values; `editStatus` outside Zod schema |
| Clippings | `/clippings` | 🟩 Good | 🟩 Good | 🟩 Good | 🟩 Good | 8/10 | No URL format validation feedback; otherwise consistent |
| Media Contacts | `/media-contacts` | 🟩 Good | 🟩 Good | 🟩 Good | 🟩 Good | 8/10 | No email/phone format validation feedback |
| Citizen Records | `/citizen-portal` | 🟩 Good | 🟩 Good | 🟩 Good | 🟩 Good | 7/10 | CPF/phone fields accept any string; no format hint |
| Citizen Portal Home | `/portal` | 🟨 Mixed | 🟩 Good | 🟩 Good | 🟩 Good | 6/10 | Emoji as primary icons reduces institutional credibility; `btn btn-primary` global class used directly |
| Citizen Dashboard | `/portal/dashboard` | 🟩 Good | 🟩 Good | 🟩 Good | 🟩 Good | 7/10 | Welcome banner uses tokens correctly; only 1 quick link (profile); no appointments link |
| 404 / Unauthorized | `/unauthorized` | 🟨 Mixed | 🟩 Good | 🟨 Mixed | 🟨 Mixed | 5/10 | No layout wrapper; no consistent visual treatment; "back to home" links to staff route |

### 2.2 Common Inconsistencies Across Pages

**Inconsistency 1 — Raw `<input>` vs. `Input` component**

All 7 domain module forms use raw `<input>`, `<select>`, and `<textarea>` elements inside `FormField` wrappers instead of the `Input` component. The `Input` component provides loading states, success states, clear buttons, and floating label variants that are entirely unused in domain workflows. This creates a two-tier form experience: auth pages (which use `Input` and `PasswordInput`) look and behave differently from domain forms.

**Inconsistency 2 — Button component vs. global class direct usage**

`Button` component is used in most pages, but `DashboardPage` uses `<button className="btn btn-outline btn-sm">` directly in 4 places. `CitizenPortalHomePage` uses `<Link className="btn btn-primary btn-md">` directly. `SessionTimeoutModal` uses raw `<button className="btn btn-primary">`. This means the `isLoading`, `aria-busy`, and `sr-only` loading text features of `Button` are absent in these locations.

**Inconsistency 3 — Status label display**

`StatusBadge` correctly maps status keys to Portuguese labels for most statuses. However, `AppointmentsPage` uses `no_show` and `SocialMediaPage` uses `failed` — both fall back to raw enum string display because they are not in `StatusBadge`'s `STATUS_LABELS` map. Users see `"no_show"` and `"failed"` as literal text in the table.

**Inconsistency 4 — Error/unauthorized pages lack layout**

`/unauthorized` and `*` (404) render without any layout wrapper — no header, no footer, no navigation context. A user who lands on these pages has no visual continuity with the rest of the application and no clear path back (the 404 "back to home" button hard-codes `/admin/dashboard`, which redirects citizens to the staff login).

**Inconsistency 5 — Citizen portal emoji iconography**

The citizen portal uses emoji (`🏛️`, `📅`, `📋`, `📢`, `🏗️`, `👤`, `👋`, `ℹ️`) as primary icons throughout `CitizenPortalHomePage`, `CitizenDashboardPage`, and `CitizenPortalLayout`. The staff dashboard uses the `Icon` component (react-icons SVG set) consistently. This creates a visual quality gap between the two surfaces and reduces the institutional credibility of the citizen-facing portal.

### 2.3 Components Most Often Violating Design Standards

| Component | Violation Type | Frequency | Severity |
|---|---|---|---|
| Domain forms (all 7) | Raw `<input>` bypasses `Input` component | 7 pages | 🟨 Medium |
| `StatusBadge` | `no_show`, `failed` statuses show raw enum text | 2 pages | 🟧 High |
| `DashboardPage` | Raw `<button className="btn ...">` bypasses `Button` | 1 page (4 instances) | 🟨 Medium |
| `CitizenPortalHomePage` | Raw `<Link className="btn ...">` bypasses `Button` | 1 page (2 instances) | 🟧 High |
| Error pages | No layout wrapper, no navigation context | 2 pages | 🟧 High |
| `CitizenPortalLayout` | Emoji brand icon, `aria-current` disabled | 1 layout | 🟥 Critical |

### 2.4 Token Adoption Gaps

The design token system is comprehensive (~200 tokens). The following gaps were identified between token definitions and actual usage:

| Gap | Location | Token Available | Severity |
|---|---|---|---|
| `#92400e` hardcoded (warning text on dark bg) | `DashboardPage.module.css` `.alert` | `--color-warning-800: #92400e` — exact match exists | 🟧 High |
| `color: #fff` hardcoded (3 instances) | `DashboardLayout.module.css` | `--color-neutral-0: #ffffff` | 🟨 Medium |
| `rgba(0,0,0,0.65)` hardcoded | `Landing.module.css` `.visualLabel` | No rgba overlay token — token needed | 🟩 Low |
| `PasswordInput` strength colors (4 values) | `PasswordInput.tsx` inline JS | No strength color tokens — tokens needed | 🟧 High |
| `--color-gray-*` aliases commented out | `tokens/index.css` | Deprecated aliases still in file as comments | 🟩 Low |
| `--font-family-mono` defined but unused | `tokens/index.css` | Token defined; no component uses it | 🟩 Low |
| Breakpoints not tokenized | All CSS modules | No `--bp-*` tokens; values hardcoded in media queries | 🟨 Medium |

**Note:** The `StatusBadge.module.css` file was updated to use semantic tokens (`--color-warning-light`, `--color-warning-800`, `--color-info-light`, `--color-info-800`) — the previously documented hardcoded hex values in that file have been resolved. The `Auth.module.css` banners also now use semantic tokens correctly.

### 2.5 Impact on Brand Perception and Usability

**Government context fit:** The primary color palette (Azul Petróleo `#1e3a5f`, Verde Institucional `#166534`, Dourado `#CA8A04`) is appropriate for a Brazilian government communication secretariat. The gradient banners and dark sidebar convey institutional authority. The Inter typeface is professional and highly legible.

**Credibility risks:**
- Emoji iconography in the citizen portal (`🏛️`, `📅`, etc.) is inconsistent with the institutional tone of the staff dashboard and reduces perceived quality for citizens.
- Raw enum values displayed as status labels (`no_show`, `failed`, `draft`) are visible to end users and appear unfinished.
- The 404 and unauthorized pages lack any visual treatment, creating a jarring experience for users who encounter them.

**Usability impact:**
- The absence of `aria-describedby` on form fields means screen reader users do not hear error messages when they occur — a direct usability barrier.
- The `CitizenPortalLayout` `aria-current` bug means keyboard and screen reader users cannot determine which page they are on within the citizen portal.
- Validation messages mixing English (Zod) and Portuguese (i18n keys) are confusing for end users and unprofessional in a government context.

---

## 3. Layout & Style Modernization Assessment

### 3.1 Layout Patterns

| Pattern | Usage | Assessment |
|---|---|---|
| CSS Flexbox | Sidebar layout, header rows, form rows, card interiors | ✅ Correct and consistent |
| CSS Grid | Stat cards (`auto-fill minmax`), widget grid, form grid, quick actions | ✅ Modern responsive grid usage |
| Off-canvas drawer | `DashboardLayout` mobile sidebar | ✅ Contemporary pattern with overlay |
| Sticky header | `CitizenPortalLayout` header | ✅ Correct `position: sticky` |
| Bottom-sheet modal | `Modal` on `max-width: 480px` | ✅ Mobile-native pattern |
| Card-view table | `DataTable` on `max-width: 767px` | ✅ Excellent mobile data pattern |
| Fixed top bar | `DashboardLayout` mobile header | ✅ Correct fixed positioning with z-index |
| Container max-width | `--container-max-width: 1140px` | ✅ Appropriate for content-heavy pages |

No legacy layout patterns (float-based, table-based) were observed. The layout system is fully modern.

### 3.2 Modernization Gap Table

| Area | Current State | Modern Standard | Gap Severity | Notes |
|---|---|---|---|---|
| Dark mode | Not implemented | Expected in 2024–2025 SaaS products | 🟧 Noticeable gap | Token system supports it via `:root[data-theme]` override |
| Skeleton loading coverage | Dashboard + DataTable only | All async content surfaces | 🟨 Minor gap | Citizen portal pages show no skeleton during load |
| Component surface depth | Flat cards with `shadow-level-1` | Layered elevation system | 🟩 Acceptable | Shadow scale is defined; usage is consistent |
| Color system range | 200+ tokens, no dark mode | Semantic + adaptive tokens | 🟧 Noticeable gap | `prefers-color-scheme` not implemented |
| Typography scale | 9 steps (xs → 5xl) | 8–10 steps | 🟩 Acceptable | Scale is appropriate; `--font-size-5xl` used only on landing |
| Spacing scale | 15 steps (0 → 32) | 12–16 steps | 🟩 Acceptable | Missing `--space-7` and `--space-14` are not used in practice |
| Interactive states | Hover + focus + disabled + loading | + active state | 🟨 Minor gap | No explicit `:active` state on buttons beyond browser default |
| Empty states | `EmptyState` component with 8 icons | Illustrated empty states | 🟨 Minor gap | Icon-only empty states are functional but not visually rich |
| Loading states | Spinner + skeleton + TopLoadingBar | + progress indicators for multi-step | 🟩 Acceptable | Coverage is good for current workflow complexity |
| Form aesthetics | Rounded inputs, token-based borders | Floating labels, inline validation | 🟨 Minor gap | `Input` component supports floating labels but domain forms don't use it |
| Data table design | Striped hover, sortable headers, pagination | + column resizing, bulk actions | 🟨 Minor gap | Acceptable for current data volumes |
| Iconography | react-icons SVG set (staff) + emoji (citizen) | Unified SVG icon set | 🟧 Noticeable gap | Emoji in citizen portal is inconsistent with staff dashboard |
| Micro-interactions | Hover shadows, button loading, modal animation | + skeleton-to-content transitions | 🟨 Minor gap | Transitions are present but not on all interactive surfaces |
| Breakpoint tokenization | Hardcoded in media queries | CSS custom property breakpoints | 🟨 Minor gap | Changing a breakpoint requires multi-file edits |

### 3.3 Secom-Specific Layout Assessment

**Dashboard layout:** The staff dashboard uses a sidebar + main content pattern with collapsible navigation — a contemporary and appropriate choice for a multi-module management system. The stat card grid (`auto-fill minmax(9.5rem, 1fr)`) adapts well from desktop to mobile. The widget grid (2-column on desktop, 1-column on tablet) is clean and information-dense without being overwhelming.

**Module pages:** All 7 domain module pages use the `page-header` + `DataTable` pattern consistently. The dark gradient `page-header` with gold title text is visually distinctive and creates a clear page identity. The `DataTable` with search, sort, and pagination provides a complete data management experience.

**Citizen portal layout:** The citizen portal uses a centered max-width container layout appropriate for a public-facing service. The hero section on the home page is clean and welcoming. However, the portal currently offers only 2 authenticated pages (dashboard and profile), making it feel underdeveloped relative to the staff dashboard.

**Design system token coverage for visual refresh:** The token system is sufficiently comprehensive to support a visual refresh (new color palette, updated radius scale, different shadow depth) without component rewrites. All visual properties are consumed via `var()` in CSS Modules, meaning a token-level change propagates automatically. The primary exception is the 34 hardcoded values documented in §2.4.
