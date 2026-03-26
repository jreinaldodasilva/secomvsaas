# Secom Frontend — UX, Accessibility & Visual Design Audit
## Part 3: Animation Quality, Loading States, Mobile UX & Secom-Specific Patterns

> Continuation of the Secom UX audit. See Parts 1–2 for Executive Summary, Design Consistency, Responsive Design, and Accessibility findings.

---

## 6. Animation & Interaction Quality

### 6.1 Animation Inventory

| Animation | Location | Trigger | Duration | Easing | GPU-Friendly | Reduced Motion | Purpose |
|---|---|---|---|---|---|---|---|
| Modal overlay fade-in | `Modal.module.css` `@keyframes overlayIn` | Modal open | 0.18s | `ease` | ✅ `opacity` | ✅ `animation: none` | Contextual — signals content appearance |
| Modal scale + slide-in | `Modal.module.css` `@keyframes modalIn` | Modal open | 0.2s | `cubic-bezier(0.16, 1, 0.3, 1)` | ✅ `transform` + `opacity` | ✅ `animation: none` | Functional — draws attention to dialog |
| Toast slide-in/out | `Toast.module.css` `.visible` / `.exiting` | Toast add/remove | 0.28s | `ease` | ✅ `transform` + `opacity` | ✅ `transition: none` | Functional — notification entry/exit |
| Skeleton shimmer | `global.css` `@keyframes shimmer` | Always (while loading) | 1.5s | `linear` | ✅ `background-position` | ✅ via global `animation-duration: 0.01ms` | Functional — communicates loading state |
| Skeleton pulse | `Skeleton.module.css` | Always (while loading) | 1.5s | `ease-in-out` | ✅ `opacity` | ✅ | Functional — alternative loading indicator |
| Button hover shadow | `global.css` `.btn::after` | Hover | 0.15s | `ease` | ✅ `opacity` | ✅ via global rule | Decorative — depth cue |
| Stat card hover lift | `DashboardPage.module.css` `.statCard:hover` | Hover | 0.15s | `ease` | ✅ `transform` + `opacity` | ✅ `transition: none; transform: none` | Decorative — interactive affordance |
| Landing fade-in | `Landing.module.css` `@keyframes landingFadeIn` | On mount | 0.6s | `cubic-bezier(0.25, 0.1, 0.25, 1)` | ✅ `opacity` | ✅ `animation-duration: 0.15s` | Decorative — page entrance |
| Landing slide-up | `Landing.module.css` `@keyframes landingSlideUp` | On mount / in-view | 0.5s | `cubic-bezier(0.25, 0.1, 0.25, 1)` | ✅ `transform` + `opacity` | ✅ `animation-duration: 0.15s` | Decorative — section entrance |
| Landing staggered grid | `Landing.module.css` `.animItem` | In-view | 0.4s + `calc(var(--anim-i) * 0.12s)` delay | `cubic-bezier(0.25, 0.1, 0.25, 1)` | ✅ `transform` + `opacity` | ✅ `animation-delay: 0s` | Decorative — visual polish |
| Landing hover scale | `Landing.module.css` `.animItem:hover` | Hover | 0.2s | `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring) | ✅ `transform` | ✅ `transform: none` | Decorative — interactive affordance |
| Visual card image zoom | `Landing.module.css` `.visualCard:hover .visualImg` | Hover | 0.4s | `ease` | ✅ `transform` | ✅ via global rule | Decorative — visual richness |
| FormField error entrance | `FormField.module.css` `@keyframes errorIn` | Error state | 0.15s | `ease` | ✅ `transform` + `opacity` | ✅ via global rule | Functional — draws attention to error |
| TopLoadingBar | `TopLoadingBar.module.css` | React Query fetch active | CSS animation | CSS | ✅ | ✅ via global rule | Functional — global fetch indicator |
| Sidebar collapse | `DashboardLayout.module.css` `.sidebar` | Toggle click | `var(--transition-base)` = 0.2s | `ease` | ✅ `width` (layout shift) | ✅ via global rule | Functional — navigation state change |
| Sidebar mobile drawer | `DashboardLayout.module.css` `.sidebar` (mobile) | Hamburger click | `var(--transition-slow)` = 0.3s | `ease-out` | ✅ `transform` | ✅ via global rule | Functional — navigation reveal |
| Page transitions | `global.css` `.fade-in`, `.slide-in-up`, `.scale-in` | Applied via className | 0.3s | `ease-in-out` / `ease-out` | ✅ | ✅ via global rule | Decorative — page entrance |

### 6.2 Animation Quality Assessment

**GPU-friendly properties:** All animations use `transform` and/or `opacity` exclusively, with the exception of the sidebar desktop collapse which animates `width`. Width animation causes layout recalculation and is not GPU-composited. At 0.2s duration this is unlikely to cause perceptible jank, but replacing it with a `transform: translateX` approach would be more performant.

**`prefers-reduced-motion` compliance:** ✅ The global CSS rule in `global.css` applies `animation-duration: 0.01ms !important` and `transition-duration: 0.01ms !important` to all elements when `prefers-reduced-motion: reduce` is set. Individual components also have specific `@media (prefers-reduced-motion: reduce)` blocks for fine-grained control (stat card hover lift, landing animations). This is comprehensive and correct.

**Easing curve quality:** The modal uses `cubic-bezier(0.16, 1, 0.3, 1)` — a spring-like ease-out that feels natural for dialog appearance. The landing stagger uses `cubic-bezier(0.25, 0.1, 0.25, 1)` — a standard ease. The landing hover uses `cubic-bezier(0.34, 1.56, 0.64, 1)` — a slight overshoot spring, appropriate for interactive cards. These are well-chosen curves.

**Transition duration consistency:** Most UI transitions use `var(--transition-fast)` (0.15s) or `var(--transition-base)` (0.2s). The sidebar mobile drawer uses `var(--transition-slow)` (0.3s) — appropriate for a larger motion. The landing animations use longer durations (0.4–0.7s) — appropriate for decorative entrance animations. Duration usage is consistent with the token system.

**`framer-motion` dependency:** The `framer-motion` package is listed as a production dependency in `package.json` but is **not imported anywhere** in the source tree. `TopLoadingBar` uses a pure CSS animation. This is a dead dependency adding ~100KB gzipped to the production bundle. It should be removed.

**Distracting animations:** No animations were identified as distracting. The landing stagger animation (12 items × 0.12s delay = 1.44s total) is the longest sequence but is appropriate for a marketing page. All functional animations (modal, toast, error) are brief (≤0.3s).

### 6.3 Interaction State Coverage

| Component | Hover | Focus | Active | Disabled | Loading |
|---|---|---|---|---|---|
| `Button` | ✅ Shadow overlay | ✅ `outline: 2px solid` | ⚠️ Browser default only | ✅ Opacity + cursor | ✅ Spinner + `aria-busy` |
| `Input` | ✅ Border color | ✅ Focus ring | ⚠️ Browser default | ✅ Opacity | ✅ Spinner in right slot |
| `DataTable` row | ✅ Background tint | ✅ Outline | ⚠️ Browser default | N/A | N/A |
| `StatCard` | ✅ Shadow + lift | ✅ Outline | ⚠️ Browser default | N/A | N/A |
| Sidebar `NavLink` | ✅ Background tint | ✅ via global rule | ⚠️ Browser default | N/A | N/A |
| `Card` (interactive) | ✅ Shadow + border | ✅ Outline | ⚠️ Browser default | N/A | N/A |
| `Modal` close button | ✅ Background tint | ✅ Outline | ⚠️ Browser default | N/A | N/A |

**Gap:** No component defines an explicit `:active` state beyond the browser default. For touch devices, the `:active` state provides important tactile feedback. Adding a subtle scale-down (`transform: scale(0.97)`) on `:active` for buttons and interactive cards would improve the touch experience.

---

## 7. Loading States & User Feedback

### 7.1 Loading Indicator Inventory

| Indicator | Component | Trigger | Scope | Assessment |
|---|---|---|---|---|
| `TopLoadingBar` | `TopLoadingBar.tsx` | Any active React Query fetch | Global (top of viewport) | ✅ Always visible; non-intrusive |
| Full-page spinner | `Loading.tsx` (via `Suspense`) | Route lazy-load; auth initialization | Full page | ✅ Prevents flash of unauthenticated content |
| Table skeleton rows | `DataTable.tsx` | `isLoading: true` on list query | Table body | ✅ Preserves layout during load |
| Dashboard stat card skeleton | `DashboardPage.tsx` | `isLoading: true` on dashboard query | Stat card grid | ✅ Skeleton matches card dimensions |
| Button spinner | `Button.tsx` | `isLoading: true` | Button | ✅ Prevents double-submit; `aria-busy` |
| `Skeleton` component | `Skeleton.tsx` | Manual usage | Any surface | ✅ Shimmer + pulse variants |
| Connection banner | `ConnectionBanner.tsx` | API health check failure | Top of page | ✅ Persistent until resolved |

**Coverage gaps:**
- Citizen portal pages (`CitizenDashboardPage`, `CitizenProfilePage`, `CitizenPortalHomePage`) show no skeleton loading state during data fetch. The `CitizenDashboardPage` renders citizen name directly from context — if the context is loading, the name shows as empty/undefined briefly.
- The `UsersPage` (admin) does not use `CrudPage` and its loading state implementation is not fully inspected — not inferable from repository structure.
- Error states on list queries: `CrudPage` now renders an `EmptyState` with retry when `isError` is true (visible in the current `CrudPage.tsx` source). This resolves the previously documented gap.

### 7.2 Success Feedback

| Action | Feedback Mechanism | Timing | Assessment |
|---|---|---|---|
| Create domain record | `Toast` success (via `onSuccess` callback) | Immediate on API response | ✅ Clear and timely |
| Update domain record | `Toast` success | Immediate | ✅ |
| Delete domain record | `Toast` success | Immediate | ✅ |
| Login | Redirect to dashboard | Immediate | ✅ Implicit success |
| Logout | Redirect to `/login` | Immediate | ✅ Implicit success |
| Password reset request | `successBanner` in page | After API response | ✅ Inline confirmation |
| Citizen registration | Not fully inspected | — | Not inferable from repository structure |
| Form save (modal) | Modal closes + toast | Immediate | ✅ Two-signal confirmation |

### 7.3 Error Feedback

| Error Type | Feedback Mechanism | Clarity | Recovery Option | Assessment |
|---|---|---|---|---|
| API mutation error | `Toast` error (via `onError` callback) | `err.message` from `ApiError` | None (retry by re-submitting) | 🟨 Message quality depends on API error messages |
| Form validation error | Inline field error via `FormField` | Field-level messages | Correct the field | 🟧 Hybrid English/Portuguese messages (Issue A4) |
| Login failure | `errorBanner` in page | `err.message` or generic fallback | Re-enter credentials | ✅ |
| API connectivity loss | `ConnectionBanner` | "API indisponível" | Automatic retry (health check) | ✅ |
| Render error | `ErrorBoundary` fallback | "Algo deu errado" + retry button | Page reload | 🟨 No `role="alert"` on fallback |
| 401 after token expiry | No automatic redirect (interceptor re-throws) | Silent — user sees error states | Manual navigation to login | 🟧 Poor recovery UX |
| 404 route | `NotFoundPage` | "Página não encontrada" | "Voltar" button → `/admin/dashboard` | 🟧 Wrong target for citizen users |
| List query error | `EmptyState` with retry button | `t('common.errorLoading')` | Retry button calls `refetch()` | ✅ (resolved in current code) |

### 7.4 Empty States

| Page | Empty State | Icon | CTA | Assessment |
|---|---|---|---|---|
| All domain module pages | `EmptyState` via `CrudPage` | Module-specific icon name | "Criar" button (if `canWrite`) | ✅ Consistent across all 7 modules |
| Dashboard widgets | Inline `<p className={styles.empty}>` | None | None | 🟨 Inconsistent with `EmptyState` component |
| Citizen dashboard quick links | Only 1 link (profile) | Emoji | None | 🟧 Underdeveloped — no appointments, no events |
| `DataTable` (no results) | `EmptyState` via `DataTable` | Configurable | Configurable | ✅ |

**Consistency assessment:** Empty states are consistent across domain module pages (all use `CrudPage` → `DataTable` → `EmptyState`). The dashboard widget empty states use inline `<p>` elements instead of the `EmptyState` component — a minor inconsistency. The citizen dashboard is the most underdeveloped empty state surface.

### 7.5 Secom-Specific Feedback Assessment

**Approval workflow status changes:** When a press release status is updated (e.g., `draft` → `review`), the user receives a generic "Salvo com sucesso" toast. There is no specific message indicating the status transition (e.g., "Comunicado enviado para revisão"). For a government approval workflow, more specific feedback would improve clarity for the `assessor` and `admin` roles.

**Module consistency:** Loading and error states are consistent across all 7 domain modules because they all use `CrudPage`. This is a significant strength — adding a new module automatically inherits the same feedback patterns.

**Portuguese language quality:** Toast messages use i18n keys (`t('common.saved')`, `t('common.deleted')`). The quality of the Portuguese translations is not fully assessable from static analysis, but the key structure is consistent.

---

## 8. Mobile UX Analysis

### 8.1 Touch Target Audit

| Element | Minimum Size | Actual Size | WCAG 2.5.5 (44×44px) | Notes |
|---|---|---|---|---|
| `Button` (md) | `--button-height-md: 2.75rem` = 44px | 44px height | ✅ Pass | Width varies by content |
| `Button` (sm) on mobile | `min-height: 2.75rem` at ≤767px | 44px | ✅ Pass | Global CSS override |
| `Input` (md) | `--input-height-md: 2.75rem` = 44px | 44px | ✅ Pass | |
| `Modal` close button | `2.75rem × 2.75rem` at ≤767px | 44×44px | ✅ Pass | Expanded on mobile |
| `Toast` close button | `2.75rem × 2.75rem` at ≤767px | 44×44px | ✅ Pass | Expanded on mobile |
| Sidebar nav links | `padding: var(--space-2) var(--space-3)` + icon | ~36px height | ⚠️ Marginal | Drawer is off-canvas on mobile; links are accessible |
| Citizen portal nav links | `font-size-sm` inline links | ~20px height | ❌ Fail | No explicit min-height on `.navLink` |
| `DataTable` row (mobile card) | Full card block | ≥44px | ✅ Pass | Card layout provides large touch area |
| Pagination buttons | `height: 2.25rem` = 36px | 36px | ❌ Fail | Below 44px minimum |
| `form-check` checkbox row | `min-height: var(--touch-target-min)` = 44px | 44px | ✅ Pass | |
| `ConfirmDialog` buttons | `Button` component | 44px | ✅ Pass | |

**Touch target failures:**
- Citizen portal nav links (`.navLink` in `CitizenPortalLayout`) have no `min-height` — they are inline text links with approximately 20px height. On mobile, these are difficult to tap accurately.
- Pagination buttons in `DataTable` are 36px height — below the 44px WCAG 2.5.5 minimum.

### 8.2 Mobile Navigation Ergonomics

**Staff dashboard:** The off-canvas drawer pattern is ergonomically sound. The hamburger button is in the top-left of the fixed header — accessible with the left thumb in portrait mode. The overlay tap-to-close is a standard mobile pattern. Navigation items in the drawer are full-width with adequate padding.

**Citizen portal:** The inline header navigation has no hamburger menu. On a 375px screen, the authenticated nav shows "Início", "Meu perfil", and "Sair" — three items that fit in a single row. However, there is no thumb-zone optimization — all items are in the top header, requiring a reach to the top of the screen. A bottom navigation bar would be more ergonomic for a citizen-facing mobile experience.

**Public layout:** Not fully inspected — `MainHeader.tsx` uses `.hide-mobile` / `.hide-desktop` classes suggesting a mobile menu exists, but the implementation details are not fully visible from the files read.

### 8.3 Form Usability on Mobile

| Form Element | `inputMode` | `type` | `autoComplete` | Assessment |
|---|---|---|---|---|
| Email fields (auth) | Not set (defaults to text) | `email` | `email` | ✅ `type="email"` triggers email keyboard on iOS/Android |
| Password fields (auth) | Not set | `password` | `current-password` / `new-password` | ✅ |
| Domain form text inputs | Not set | `text` | Not set | 🟨 No `autoComplete` hints on domain forms |
| Phone fields (domain forms) | Not set | `text` | Not set | 🟧 Should use `type="tel"` and `inputMode="tel"` |
| CPF fields (domain forms) | Not set | `text` | Not set | 🟧 Should use `inputMode="numeric"` |
| Date/datetime fields | Not set | `datetime-local` | Not set | ✅ Native date picker on mobile |
| URL fields (domain forms) | Not set | `text` | Not set | 🟧 Should use `type="url"` |
| Number/count fields | Not set | `text` | Not set | 🟨 Could use `inputMode="numeric"` |

**iOS zoom prevention:** `--input-font-size: 16px` is set as a token and applied via the global mobile CSS rule:
```css
@media (max-width: 767px) {
  input[type='text'], input[type='email'], ... { font-size: 16px; }
}
```
This correctly prevents iOS auto-zoom on input focus. ✅

**`autoComplete` gaps:** Domain forms do not set `autoComplete` attributes on any fields. For citizen-facing forms (citizen registration, profile), `autoComplete` hints would improve the mobile experience by enabling browser autofill.

### 8.4 Scroll Behavior and Gesture Conflicts

**Modal scroll:** The `Modal` body has `overflow-y: auto` with `max-height: 90vh`. On mobile (bottom-sheet), `max-height: 92dvh`. This allows scrolling within the modal without scrolling the page behind it — correct behavior.

**Body scroll lock:** `Modal` applies `document.body.style.overflow = 'hidden'` when open. This prevents background scroll on desktop. On iOS Safari, `overflow: hidden` on `body` does not always prevent scroll — a more robust solution uses `position: fixed` on the body. This is a known iOS Safari limitation.

**`scroll-behavior: smooth`:** Set globally on `html`. This affects anchor navigation and `ScrollToTop` behavior. `prefers-reduced-motion` correctly overrides this to `auto`.

**Gesture conflicts:** No custom gesture handlers (swipe, pinch) are implemented. No conflicts with browser gestures are expected.

### 8.5 Perceived Mobile Performance

**Bundle splitting:** All page components are lazy-loaded via `React.lazy()`. The initial bundle contains only `vendor` (React, React Router), `query` (TanStack Query), `motion` (framer-motion — dead weight), and `icons` (react-icons). Domain module code is only loaded when the user navigates to that route.

**`framer-motion` dead weight:** The `motion` chunk (~100KB gzipped) is loaded as part of the initial bundle split despite not being used. Removing this dependency would reduce the initial load by ~100KB.

**Image optimization:** The `secom_logo.png` in the sidebar and `public/` favicon files are the only images. No large images are loaded in the application shell. Landing page images are not inspected in detail.

**Font loading:** Inter is referenced in `--font-family-sans` but no `@font-face` or `<link rel="preload">` is visible in the CSS or `index.html`. If Inter is loaded from Google Fonts or a CDN, font loading performance depends on the `index.html` configuration — not inferable from CSS alone.

### 8.6 Sticky/Fixed CTAs

No sticky or fixed CTAs are implemented in the application shell. The `page-header` with the "Criar" button is part of the normal document flow — it scrolls with the page. On long domain module pages (many table rows), the "Criar" button scrolls out of view. A sticky action bar or floating action button (FAB) would improve mobile usability for create actions on long lists.

---

## 9. Secom-Specific Patterns

### 9.1 Role-Based UI Assessment

The RBAC system operates at three levels: route guards, navigation visibility, and inline conditional rendering. From a UX perspective:

**Navigation adaptation by role:**

| Role | Visible Nav Items | Assessment |
|---|---|---|
| `super_admin` / `admin` | All 10 items | Full dashboard — information-dense but organized |
| `assessor` | Dashboard, Profile, Comunicados, Contatos, Clipping, Eventos | 6 items — focused on press/media workflow |
| `social_media` | Dashboard, Profile, Comunicados (read), Clipping (read), Eventos (read), Redes Sociais | 6 items — social media focused |
| `atendente` | Dashboard, Profile, Eventos (read), Agendamentos, Portal do Cidadão | 5 items — citizen service focused |

The navigation correctly adapts to each role. The `PermissionGate` wrapper ensures users only see relevant modules. This is a strong UX pattern — no role sees irrelevant navigation items.

**Write permission UI:** The `CrudPage` `writePermission` and `deletePermission` props control whether the "Criar" button and edit/delete actions are rendered. A `social_media` user viewing `/press-releases` (read-only access) will see the table but no create/edit/delete buttons. This is correctly implemented.

**Gap — No visual role indicator:** There is no persistent UI element showing the current user's role. The sidebar footer shows the user's name but not their role. For users with multiple potential roles (e.g., a new staff member learning the system), a role indicator would reduce confusion about why certain features are unavailable.

### 9.2 Module Coverage Assessment

| Module | Page | Form | Status Badges | Empty State | Loading State | Error State |
|---|---|---|---|---|---|---|
| Press Releases | ✅ | ✅ | ✅ (with `PRESS_RELEASE_STATUS_COLORS`) | ✅ | ✅ | ✅ |
| Media Contacts | ✅ | ✅ | ✅ (active/inactive) | ✅ | ✅ | ✅ |
| Clippings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Events | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Appointments | ✅ | ✅ | ⚠️ `no_show` shows raw enum | ✅ | ✅ | ✅ |
| Citizen Records | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Social Media | ✅ | ✅ | ⚠️ `failed` shows raw enum | ✅ | ✅ | ✅ |

All 7 modules have consistent UX patterns. The only module-level inconsistency is the raw enum status display for `no_show` and `failed`.

### 9.3 Approval Workflow UX

The press release approval workflow (`draft → review → approved → published → archived`) is managed via a `<select>` field in the edit modal. The `getAllowedStatuses(userRole)` function restricts which status values are available based on the user's role.

**UX assessment:**

| Aspect | Current State | Assessment |
|---|---|---|
| Status visibility | `StatusBadge` in table column | ✅ Clear at-a-glance status |
| Status transition UI | `<select>` in edit modal | 🟨 Functional but not workflow-optimized |
| Transition constraints | `getAllowedStatuses()` limits options by role | ✅ Role-appropriate options |
| Transition feedback | Generic "Salvo" toast | 🟨 No specific transition message |
| Audit trail | Not visible in frontend | Not inferable from repository structure |
| Bulk status change | Not implemented | 🟨 Missing for high-volume workflows |
| Status history | Not visible in frontend | Not inferable from repository structure |

The current approval workflow is functional for low-volume use but would benefit from dedicated workflow actions (e.g., an "Enviar para revisão" button separate from the general edit form) for higher-volume press release management.

### 9.4 Citizen Portal UX Assessment

The citizen portal is structurally separated from the staff dashboard at all levels (auth context, layout, routes, URL namespace). From a UX perspective:

**Strengths:**
- Clean, centered layout appropriate for a public-facing service
- Welcome banner with personalized greeting on dashboard
- Profile page shows citizen data in a readable field-list format
- Session timeout modal is implemented (unlike the previously documented gap — `CitizenPortalLayout` now uses `useSessionTimeout`)

**Gaps:**
- Only 2 authenticated pages (dashboard and profile) — the portal feels underdeveloped
- No appointments view for citizens (the previously documented dead link to `/portal/appointments` has been removed — `CitizenDashboardPage` now only links to `/portal/profile`)
- No self-service profile editing — `CitizenProfilePage` is read-only
- Emoji iconography reduces institutional credibility
- No skeleton loading on citizen pages
- Citizen portal nav links have insufficient touch targets on mobile (Issue §8.1)
- No breadcrumb on the home page (`/portal`) — `crumb?.parent` is undefined for the root route

### 9.5 Government Context Assessment

| Dimension | Assessment | Evidence |
|---|---|---|
| Institutional color palette | ✅ Appropriate | Azul Petróleo + Verde Institucional + Dourado — standard Brazilian government palette |
| Typography | ✅ Professional | Inter is widely used in government digital services |
| Language | ✅ Portuguese throughout | All UI text in pt-BR; validation messages partially English (Issue A4) |
| LGPD compliance signals | ✅ Present | Cookie consent banner, Privacy and Terms pages, LGPD section on landing |
| Accessibility baseline | 🟧 Partial | ~65% WCAG 2.1 AA — below the expected standard for government services |
| Credibility signals | 🟨 Mixed | Staff dashboard is credible; citizen portal emoji usage reduces institutional tone |
| Data privacy | ✅ httpOnly cookies, CSRF protection | No PII in localStorage |
| Branding consistency | 🟨 Mixed | Staff dashboard uses SVG icons; citizen portal uses emoji |
