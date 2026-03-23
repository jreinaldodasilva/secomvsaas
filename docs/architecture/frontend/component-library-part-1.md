# Secom Frontend — Component Library & Design System Audit
## Part 1: Executive Summary & Component Inventory

> **Document scope:** Static analysis of the frontend source tree.
> All findings are grounded in observable code and file inspection.
> Speculative assumptions are explicitly marked.
> This document cross-references `overview-part1.md`, `overview-part2.md`, and `overview-part3.md` and does not re-document findings already established there.

---

## 1. Executive Summary

The Secom frontend component library is a **purpose-built design system** composed of 43 discrete components across `src/components/` and `src/layouts/`. It is not based on any third-party component library (no MUI, Ant Design, Radix, etc.) — all components are hand-authored.

The library is organized into a clear hierarchy: a token-based CSS design system at the foundation, global utility classes for common patterns, CSS Modules for component-scoped styles, and React components that consume both layers. The overall quality is high for a project of this scale.

**Key strengths:**
- Comprehensive design token system (200+ CSS custom properties) covering all visual dimensions.
- `CrudPage<TItem, TForm>` generic abstraction eliminates ~80% of boilerplate across all 7 domain modules.
- Consistent form workflow pattern: all 7 domain forms use `.form-stack`, `.form-grid`, `.form-section` global utility classes with `FormField` wrappers.
- Meaningful accessibility implementation in core primitives (Modal focus trap, Input `aria-describedby`, DataTable keyboard navigation).
- `StatusBadge` is the single shared status indicator used across all 7 modules — no duplication.

**Key risks:**
- 34 hardcoded hex color values across 9 CSS module files bypass the design token system, concentrated in `DashboardLayout`, `Auth.module.css`, `StatusBadge`, and `DashboardMockup`.
- `LoginForm` uses raw global `.form-field` classes instead of the `Input` component, creating an inconsistency in the most-visited form in the application.
- `Modal` uses static `id="modal-title"` and `id="modal-desc"` — multiple simultaneous modals would produce duplicate IDs, breaking ARIA associations.
- `CitizenDashboardPage` links to `/portal/appointments` which does not exist as a citizen route — a functional dead link.
- `CitizenPortalLayout` explicitly sets `aria-current={undefined}` on active nav links, disabling the active page indicator for screen readers.
- Citizen portal pages (`CitizenDashboardPage`, `CitizenProfilePage`, `CitizenPortalHomePage`) do not use the shared `Card` component — they reimplement card-like surfaces with local CSS classes.
- `framer-motion` is listed as a production dependency but is **not imported anywhere** in the source. `TopLoadingBar` uses a pure CSS animation. The dependency is dead weight.

**Secom-specific observations:**
- Domain-specific components (press releases, events, appointments) are correctly isolated in `src/pages/Domain/` and share no cross-module coupling.
- Role-based UI is handled at the route level (`ProtectedRoute`) and navigation level (`PermissionGate`) — not at the individual component level. This is the correct architectural choice.
- The citizen portal is structurally separated from the staff dashboard at the auth context, route guard, layout, and URL namespace levels.

---

## 2. Component Inventory

### 2.1 Classification Rules

| Category | Definition |
|---|---|
| Primitive / Base | Stateless or near-stateless building blocks with no domain knowledge |
| UI / Shared | Composed UI components with behavior, used across multiple contexts |
| Form | Components whose primary purpose is form input or form layout |
| Layout | Shell components that define page structure and navigation |
| Feature | Components tied to a specific application feature or domain |
| Page | Full-page components rendered by the router |

### 2.2 Complete Component Inventory

> LOC counts are for the `.tsx` source file only, excluding CSS modules and test files.
> Usage counts are based on import tracing across `src/` (excluding test files).

#### UI / Shared Components (`src/components/UI/`)

| Component | Location | Category | LOC | Props Summary | Variants | Usage | Issues |
|---|---|---|---|---|---|---|---|
| Button | `UI/Button/Button.tsx` | Primitive | 47 | `variant`, `size`, `fullWidth`, `isLoading`, extends `ButtonHTMLAttributes` | 7 variants × 3 sizes | 32 | None |
| Input | `UI/Input/Input.tsx` | Form | 147 | `label`, `error`, `helperText`, `leftIcon`, `rightIcon`, `size`, `variant`, `loading`, `success`, `showClearButton`, `onClear` | 3 variants × 3 sizes | 2 | Low usage despite rich API; `LoginForm` bypasses it |
| Modal | `UI/Modal/Modal.tsx` | UI / Shared | 103 | `isOpen`, `onClose`, `title`, `description`, `children`, `footer`, `size`, `showCloseButton`, `closeOnOverlayClick`, `closeOnEscape` | 5 sizes | 14 | Static `id="modal-title"` — duplicate ID risk with multiple modals |
| Card | `UI/Card/Card.tsx` | Primitive | 33 | `variant`, `size`, `padding`, `interactive`, extends `HTMLAttributes<div>` | 4 variants × 3 sizes × 4 padding | 11 | Not used in citizen portal pages |
| FormField | `UI/FormField/FormField.tsx` | Form | 38 | `label`, `name`, `error`, `helpText`, `required`, `children` | — | 9 | `helpText` renders before the input (order: 3 in CSS) — unusual UX |
| StatusBadge | `UI/StatusBadge/StatusBadge.tsx` | UI / Shared | 45 | `status`, `colorMap?`, `labelMap?` | 5 colors (green/red/yellow/blue/gray) | 10 | Yellow and blue variants use hardcoded hex colors |
| CrudPage | `UI/CrudPage/CrudPage.tsx` | UI / Shared | 257 | Generic `<TItem, TForm>`: `title`, `columns`, `emptyForm`, `validate`, `buildPayload`, `listQuery`, `onCreate`, `onUpdate`, `onDelete`, `FormComponent`, + 20 more | — | 7 | Largest component; `any` cast in `getItems`/`getTotal` props |
| DataTable | `UI/Table/DataTable.tsx` | UI / Shared | 196 | `columns`, `data`, `total`, `page`, `limit`, `isLoading`, `onPageChange`, `onSearch`, `onRowClick`, `clientSort`, `onSortChange` | — | 3 | `T extends Record<string, any>` — weak generic constraint |
| EmptyState | `UI/EmptyState/EmptyState.tsx` | UI / Shared | 52 | `title`, `description?`, `icon?`, `action?` | 8 built-in icons | 3 | — |
| Spinner / LoadingScreen | `UI/Loading/Loading.tsx` | UI / Shared | 23 | `size?`, `text?` | 3 sizes | ~8 (indirect) | `aria-label="Loading"` is English in a Portuguese app |
| ConfirmDialog | `UI/ConfirmDialog/ConfirmDialog.tsx` | UI / Shared | 28 | `isOpen`, `onClose`, `onConfirm`, `title?`, `message?`, `isLoading?` | — | 3 | Thin wrapper over Modal; confirm button always labeled "Excluir" |
| Skeleton | `UI/Skeleton/Skeleton.tsx` | UI / Shared | 53 | `variant`, `width`, `height`, `className`, `animation`, `lines` | 5 variants × 3 animations | 3 | — |
| Toast / ToastContainer | `UI/Toast/Toast.tsx` + `ToastContainer.tsx` | UI / Shared | 80 + 17 | `id`, `type`, `title?`, `message`, `duration?`, `onClose` | 4 types | 12 | `ToastContainer` has both `aria-live="polite"` and individual toasts have `aria-live="assertive"` — conflicting live region semantics |
| Breadcrumbs | `UI/Breadcrumbs/Breadcrumbs.tsx` | UI / Shared | 73 | `items?` (auto-generated from pathname if omitted) | — | 2 | `dangerouslySetInnerHTML` for JSON-LD schema injection |
| PasswordInput | `UI/PasswordInput/PasswordInput.tsx` | Form | 85 | `showStrength?`, `label?`, `wrapperClassName?`, extends `InputHTMLAttributes` | strength indicator on/off | ~5 | Hardcoded strength colors (`#e74c3c`, `#f39c12`, `#2ecc71`, `#27ae60`) |
| SessionTimeoutModal | `UI/SessionTimeoutModal/SessionTimeoutModal.tsx` | Feature | 30 | `show`, `onContinue`, `onLogout` | — | 2 | Uses raw `<button className="btn btn-primary">` instead of `Button` component |
| ConnectionBanner | `UI/ConnectionBanner/ConnectionBanner.tsx` | Feature | 20 | — (no props) | — | 1 | Hardcoded `#fff` in CSS module |
| TopLoadingBar | `UI/TopLoadingBar/TopLoadingBar.tsx` | Feature | 33 | — (no props) | — | 1 | `framer-motion` listed as dep but not used here; pure CSS animation |
| Icon | `UI/Icon/Icon.tsx` | Primitive | 60 | `name: IconName`, `size?`, `className?`, `aria-hidden?`, `aria-label?` | 30 named icons | 27 | — |
| ScrollToTop | `UI/ScrollToTop.tsx` | Feature | 8 | — (no props) | — | 1 | — |

#### Auth Components (`src/components/Auth/`)

| Component | Location | Category | LOC | Props Summary | Variants | Usage | Issues |
|---|---|---|---|---|---|---|---|
| PermissionGate | `Auth/PermissionGate/PermissionGate.tsx` | Feature | 15 | `permissions: string[]`, `children`, `fallback?` | — | 2 | Used only in `DashboardLayout` sidebar; not used in page-level guards |
| ProtectedRoute | `Auth/ProtectedRoute/ProtectedRoute.tsx` | Feature | 36 | `children`, `allowedRoles?` | — | ~12 (via routes) | Loading state uses raw `.spinner` class, not `Spinner` component |
| ProtectedCitizenRoute | `Auth/ProtectedRoute/ProtectedCitizenRoute.tsx` | Feature | 18 | `children` | — | 2 | Loading state uses raw `.spinner` class; no `aria-label` on spinner |
| LoginForm | `Auth/LoginForm/LoginForm.tsx` | Form | 47 | `onSuccess?` | — | 1 | Uses raw `.form-field` global classes instead of `Input` component |

#### Layout Components (`src/components/Layout/`)

| Component | Location | Category | LOC | Props Summary | Variants | Usage | Issues |
|---|---|---|---|---|---|---|---|
| MainHeader | `Layout/MainHeader.tsx` | Layout | 92 | — (no props) | — | 1 | Mobile menu has no focus trap |
| Footer | `Layout/Footer.tsx` | Layout | 50 | — (no props) | — | 1 | — |

#### Layout Shells (`src/layouts/`)

| Component | Location | Category | LOC | Props Summary | Variants | Usage | Issues |
|---|---|---|---|---|---|---|---|
| DashboardLayout | `layouts/DashboardLayout/DashboardLayout.tsx` | Layout | 134 | — (renders `<Outlet>`) | — | 1 | Hardcoded `#fff` in CSS module; sidebar collapse uses `window.innerWidth` directly |
| CitizenPortalLayout | `layouts/CitizenPortalLayout/CitizenPortalLayout.tsx` | Layout | 104 | — (renders `<Outlet>`) | — | 1 | `aria-current={undefined}` on active nav links; static breadcrumb map (only 2 routes) |
| PublicLayout | `layouts/PublicLayout/PublicLayout.tsx` | Layout | 19 | — (renders `<Outlet>`) | — | 1 | — |

#### Feature / Landing Components (`src/components/Landing/`)

| Component | Location | Category | LOC | Props Summary | Variants | Usage | Issues |
|---|---|---|---|---|---|---|---|
| HeroSection | `Landing/HeroSection.tsx` | Feature | 65 | — | — | 1 | — |
| FeaturesSection | `Landing/FeaturesSection.tsx` | Feature | 35 | — | — | 1 | — |
| ModulesSection | `Landing/ModulesSection.tsx` | Feature | 45 | — | — | 1 | — |
| CtaSection | `Landing/CtaSection.tsx` | Feature | 49 | — | — | 1 | — |
| LgpdSection | `Landing/LgpdSection.tsx` | Feature | 48 | — | — | 1 | — |
| TestimonialsSection | `Landing/TestimonialsSection.tsx` | Feature | 35 | — | — | 1 | — |
| VisualBanner | `Landing/VisualBanner.tsx` | Feature | 23 | — | — | 1 | — |
| LandingShared | `Landing/LandingShared.tsx` | Feature | 80 | `SectionHeader`, `AnimatedGrid`, `AnimatedItem` sub-components | — | ~7 (internal) | — |

#### Other Components

| Component | Location | Category | LOC | Props Summary | Variants | Usage | Issues |
|---|---|---|---|---|---|---|---|
| ErrorBoundary | `ErrorBoundary/ErrorBoundary.tsx` | Feature | 36 | `children`, `fallback?`, `onError?` | — | 5 | Default fallback has no i18n; `button` uses raw element not `Button` component |
| DashboardMockup | `DashboardMockup/DashboardMockup.tsx` | Feature | 95 | — | — | 1 | Hardcoded status colors in CSS; purely presentational (landing page only) |
| ContactForm | `ContactForm/ContactForm.tsx` | Form | 84 | — | — | 1 | Does not use any shared UI components; own validation logic; hardcoded Portuguese strings |
| CookieConsent | `LGPD/CookieConsent.tsx` | Feature | 31 | — | — | 1 | — |

### 2.3 Summary Statistics

| Metric | Value |
|---|---|
| Total components | 43 |
| Primitive / Base | 3 (Button, Card, Icon) |
| UI / Shared | 13 (Modal, CrudPage, DataTable, EmptyState, Spinner, ConfirmDialog, Skeleton, Toast/ToastContainer, Breadcrumbs, StatusBadge, FormField, ScrollToTop, ConnectionBanner) |
| Form | 3 (Input, PasswordInput, LoginForm) |
| Layout | 6 (MainHeader, Footer, DashboardLayout, CitizenPortalLayout, PublicLayout, + Auth layout implied) |
| Feature | 18 (PermissionGate, ProtectedRoute, ProtectedCitizenRoute, SessionTimeoutModal, TopLoadingBar, ErrorBoundary, CookieConsent, DashboardMockup, ContactForm, 7 Landing sections + LandingShared) |
| Components > 200 LOC | 2 (CrudPage: 257, DataTable: 196 ≈ borderline) |
| Components > 100 LOC | 5 (CrudPage, DataTable, Input, Modal, DashboardLayout) |
| Average LOC (UI components only) | ~68 |
| Components with test files | 18 |

### 2.4 Secom-Specific Observations

**Domain isolation:** All 7 domain modules (press releases, media contacts, clipping, events, appointments, citizen records, social media) are correctly isolated in `src/pages/Domain/`. No cross-module component coupling is observable.

**Citizen portal separation:** The citizen portal is structurally separated at the layout, auth context, and route guard levels. However, citizen-facing page components (`CitizenDashboardPage`, `CitizenProfilePage`, `CitizenPortalHomePage`) do not consume the shared `Card` component — they reimplement card surfaces with local CSS classes in `CitizenPortal.module.css`. This is a missed reuse opportunity and a consistency risk.

**Role-based UI variations:** Role-based rendering is handled at the route level (`ProtectedRoute` with `allowedRoles`) and navigation level (`PermissionGate` in `DashboardLayout`). Individual components are role-agnostic. This is the correct architectural pattern — components do not need to know about roles.

**`CitizenPortalPage` redirect file:** `src/pages/Domain/CitizenPortal/CitizenPortalPage.tsx` is a redirect shim that re-exports `CitizenRecordsPage`. This file should be removed once all references are updated, as noted in its own comment.
