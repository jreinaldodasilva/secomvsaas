# Secom Frontend — Component Library & Design System Audit
## Part 3: Component Deep Dive

---

## 4. Component Deep Dive

The following 18 components were selected based on highest usage count, architectural centrality, and UI criticality.

---

### 4.1 Button

**Metadata:** `src/components/UI/Button/Button.tsx` | Primitive | 47 LOC
**Responsibility:** The primary interactive element. Wraps `<button>` with variant, size, loading state, and full-width layout.

**Props Interface:**

| Prop | Type | Required | Default | Notes |
|---|---|---|---|---|
| `children` | `ReactNode` | Yes | — | Button label |
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'success' \| 'outline' \| 'ghost' \| 'destructive'` | No | `'primary'` | Maps to global `.btn-{variant}` class |
| `size` | `'sm' \| 'md' \| 'lg'` | No | `'md'` | Maps to global `.btn-{size}` class |
| `fullWidth` | `boolean` | No | `false` | Adds `.btn-full` |
| `isLoading` | `boolean` | No | `false` | Shows spinner, disables button, sets `aria-busy` |
| `...ButtonHTMLAttributes` | — | No | — | All native button attributes forwarded |

**Variants:** 7 visual variants × 3 sizes = 21 combinations. All variants are defined in `global.css` as `.btn-{variant}` classes.

**Interaction States:**
- Default: variant background
- Hover: `::after` pseudo-element shadow overlay (opacity 0 → 1)
- Focus: `outline: 2px solid var(--color-primary-500)` via `global.css`
- Disabled: `--color-neutral-200` background, `not-allowed` cursor
- Loading: spinner replaces children, `aria-busy="true"`, pointer-events disabled

**Accessibility:** 🟩 Good compliance
- `aria-busy` set when loading
- `disabled` attribute set when loading or explicitly disabled
- `sr-only` span with "Carregando..." for screen readers during loading
- Focus ring via `global.css` `:focus-visible` rule
- Extends native `ButtonHTMLAttributes` — all ARIA attributes passable

**Code Quality:** Clean, minimal, well-tested (8 test cases). `React.memo` applied. `displayName` set. No issues.

---

### 4.2 Input

**Metadata:** `src/components/UI/Input/Input.tsx` | Form | 147 LOC
**Responsibility:** Controlled text input with label, error, helper text, icons, loading/success/error states, floating label variant, and clear button.

**Props Interface:**

| Prop | Type | Required | Default | Notes |
|---|---|---|---|---|
| `label` | `string` | No | — | Renders above input (or floating) |
| `error` | `string` | No | — | Error message; triggers `aria-invalid` and `aria-describedby` |
| `helperText` | `string` | No | — | Helper text below input |
| `leftIcon` / `rightIcon` | `ReactNode` | No | — | Icon slots |
| `size` | `'sm' \| 'md' \| 'lg'` | No | `'md'` | |
| `variant` | `'default' \| 'filled' \| 'floating'` | No | `'default'` | `floating` enables animated label |
| `loading` | `boolean` | No | `false` | Shows spinner in right icon slot |
| `success` | `boolean` | No | `false` | Shows checkmark icon |
| `showClearButton` | `boolean` | No | `false` | Shows × button when field has value |
| `onClear` | `() => void` | No | — | Called when clear button clicked or Escape pressed |

**Variants:** 3 variants × 3 sizes. State combinations: default, focused, error, success, disabled, loading.

**Interaction States:** All states implemented with CSS Module classes. Escape key clears field when `showClearButton` is true.

**Accessibility:** 🟩 Good compliance
- `useId()` for stable, unique IDs
- `aria-required`, `aria-invalid`, `aria-describedby` (error + helper text)
- `forwardRef` for external ref access
- Clear button has `aria-label="Limpar campo"`
- Required marker has `aria-label="obrigatório"`
- `prefers-reduced-motion` respected in CSS

**Code Quality:** The richest component in the library. Well-structured. One observation: the `hasValue` state is tracked internally via `useState` but is also derived from the `value` prop on mount — if `value` changes externally without triggering `onChange`, `hasValue` can become stale. This is a controlled/uncontrolled input edge case.

**Usage gap:** Despite its rich API, `Input` is imported in only 2 files. The majority of form inputs across the 7 domain modules use raw `<input>` elements inside `FormField` wrappers. This means the `loading`, `success`, `showClearButton`, and `floating` variant features are effectively unused in domain workflows.

---

### 4.3 Modal

**Metadata:** `src/components/UI/Modal/Modal.tsx` | UI / Shared | 103 LOC
**Responsibility:** Accessible modal dialog with focus trap, scroll lock, Escape key handling, overlay click dismissal, and portal rendering.

**Props Interface:**

| Prop | Type | Required | Default | Notes |
|---|---|---|---|---|
| `isOpen` | `boolean` | Yes | — | Controls visibility |
| `onClose` | `() => void` | Yes | — | Called on Escape, overlay click, or close button |
| `title` | `string` | No | — | Sets `aria-labelledby` |
| `description` | `string` | No | — | Sets `aria-describedby` |
| `children` | `ReactNode` | Yes | — | Modal body content |
| `footer` | `ReactNode` | No | — | Rendered in footer slot |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | No | `'md'` | |
| `showCloseButton` | `boolean` | No | `true` | |
| `closeOnOverlayClick` | `boolean` | No | `true` | |
| `closeOnEscape` | `boolean` | No | `true` | |

**Variants:** 5 sizes. On mobile (≤480px), all sizes render as a bottom sheet.

**Interaction States:** Open/closed. Focus trap active when open. Body scroll locked when open.

**Accessibility:** 🟧 Partial support
- `role="dialog"`, `aria-modal="true"` ✅
- Focus trap implemented manually ✅
- Scroll lock on body ✅
- Escape key handling ✅
- Close button has `aria-label` via i18n ✅
- **🟥 Critical gap:** `aria-labelledby="modal-title"` and `aria-describedby="modal-desc"` use static string IDs. If two modals are open simultaneously (e.g., a nested confirmation dialog), both will have `id="modal-title"` in the DOM — duplicate IDs break ARIA associations. The IDs should be generated with `useId()`.
- **🟧 Gap:** Focus is moved to the first focusable element on open, but focus is not restored to the trigger element on close.

**Code Quality:** Solid implementation. The focus trap is a manual implementation (not using a library like `focus-trap-react`) — it handles Tab and Shift+Tab but does not handle all edge cases (e.g., dynamically added focusable elements). Acceptable for current usage patterns.

---

### 4.4 Card

**Metadata:** `src/components/UI/Card/Card.tsx` | Primitive | 33 LOC
**Responsibility:** Surface container with variant, size, padding, and interactive states.

**Props Interface:** `variant`, `size`, `padding`, `interactive`, extends `HTMLAttributes<div>`.

**Variants:** 4 variants (default, elevated, outlined, filled) × 3 sizes × 4 padding levels × interactive flag.

**Accessibility:** 🟩 Good compliance — `interactive` cards get `focus-visible` outline. No ARIA role added (correct — the consumer should add `role="button"` or `role="link"` if needed).

**Code Quality:** Clean. `prefers-contrast: high` adds `border-width: 2px`. `prefers-reduced-motion` respected.

**Usage gap:** Not used in citizen portal pages, which reimplement card-like surfaces with local CSS classes.

---

### 4.5 FormField

**Metadata:** `src/components/UI/FormField/FormField.tsx` | Form | 38 LOC
**Responsibility:** Wrapper providing label, help text, error message, and error state styling for any form control child.

**Props Interface:**

| Prop | Type | Required | Notes |
|---|---|---|---|
| `name` | `string` | Yes | Used as `htmlFor` on label and as ID prefix for error/help |
| `label` | `string` | No | |
| `error` | `string` | No | Triggers `role="alert"` paragraph |
| `helpText` | `string` | No | Rendered with `id="{name}-help"` |
| `required` | `boolean` | No | Adds `*` marker with `aria-label="obrigatório"` |
| `children` | `ReactNode` | Yes | The form control |

**Accessibility:** 🟧 Partial support
- Label `htmlFor` links to `name` — this works only if the child input has `id={name}`. All domain forms correctly set `id` on their inputs to match `name`. ✅
- Error has `role="alert"` and `id="{name}-error"` ✅
- **Gap:** `FormField` does not inject `aria-describedby` onto the child input — the child must set it manually. Domain forms do not set `aria-describedby` on their raw `<input>` elements, meaning error messages are not programmatically associated with inputs for screen readers. The `Input` component handles this correctly via `aria-describedby`, but `FormField` with raw `<input>` children does not.

**Code Quality:** The `helpText` paragraph has `order: 3` in CSS, rendering it after the input visually. This is an unusual UX pattern — help text typically appears between the label and the input. Not a bug, but worth noting.

---

### 4.6 StatusBadge

**Metadata:** `src/components/UI/StatusBadge/StatusBadge.tsx` | UI / Shared | 45 LOC
**Responsibility:** Color-coded status pill for press release states, appointment statuses, event statuses, and generic active/inactive states.

**Props Interface:**

| Prop | Type | Required | Notes |
|---|---|---|---|
| `status` | `string` | Yes | Key into `STATUS_VARIANT` and `STATUS_LABELS` maps |
| `colorMap` | `Record<string, string>` | No | Override default color mapping |
| `labelMap` | `Record<string, string>` | No | Override default label mapping |

**Built-in status coverage:**
- Press releases: `draft`, `review`, `approved`, `published`, `archived`
- Generic: `active`, `inactive`, `pending`, `cancelled`, `completed`, `scheduled`, `confirmed`

**Accessibility:** 🟧 Partial support
- Renders as `<span>` — correct for inline status indicators
- No `role` or `aria-label` — the text label is the accessible name ✅
- **Gap:** The `::before` dot is purely decorative and has no accessible equivalent. Color alone is used to convey status meaning (the dot color differs per variant). The text label mitigates this, but the dot adds no accessible information.

**Code Quality:** 🟧 Yellow and blue variants use hardcoded hex colors (`#92400e`, `#d97706`, `#1e40af`, `#3b82f6`) instead of design tokens. The corresponding token values exist (`--color-warning-700`, `--color-info-600`) but are not used. This is the most impactful token bypass in the library given `StatusBadge`'s usage count of 10.

---

### 4.7 CrudPage

**Metadata:** `src/components/UI/CrudPage/CrudPage.tsx` | UI / Shared | 257 LOC
**Responsibility:** Generic list/create/edit/delete page shell. Encapsulates modal state, form state, validation dispatch, mutation callbacks, and delete confirmation. Used by all 7 domain module pages.

**Props Interface:** 30+ props. Key groups:
- **Display:** `title`, `createLabel`, `emptyMessage`, `emptyIcon`, `searchPlaceholder`, `editModalTitle`, `createModalTitle`, `modalSize`
- **Permissions:** `writePermission`, `deletePermission` (checked against `user.role` via `hasPermission`)
- **Columns:** `columns` factory function receiving `openEdit`, `openDelete`, `canWrite`, `canDelete`
- **Form:** `emptyForm`, `toFormState`, `validate`, `buildPayload`, `FormComponent`, `formExtraProps`
- **Data:** `listQuery`, `getItems`, `getTotal`, `page`, `onPageChange`, `onSearch`
- **Mutations:** `onCreate`, `onUpdate`, `onDelete`, `isCreatePending`, `isUpdatePending`, `isDeletePending`
- **Feedback:** `savedMessage`, `deletedMessage`, `onSuccess`, `onError`
- **Deep-link:** `initialOpen`

**Accessibility:** 🟩 Good compliance — delegates to `Modal`, `DataTable`, `ConfirmDialog`, and `Button`, all of which have their own accessibility implementations.

**Code Quality:**
- `getItems` and `getTotal` props accept `unknown` data but are called with `(data: any)` casts in all 7 domain pages — the generic typing is not enforced at the call site.
- The `initialOpen` + `useEffect` pattern for deep-linked create modal is clean.
- The `formExtraProps` escape hatch is used by `SocialMediaPage` to pass `editStatus`/`setEditStatus` into the form — a sign the abstraction is near its complexity ceiling for workflows with state outside the form fields.
- The `openDelete` function extracts a display name via `item.title ?? item.name ?? item.citizenName ?? ''` — this is a fragile pattern that will silently show an empty name for items with different field names.

---

### 4.8 DataTable

**Metadata:** `src/components/UI/Table/DataTable.tsx` | UI / Shared | 196 LOC
**Responsibility:** Paginated, sortable, searchable data table with skeleton loading, empty state, and keyboard row navigation.

**Props Interface:** `columns`, `data`, `total`, `page`, `limit`, `isLoading`, `onPageChange`, `onSearch`, `onRowClick`, `clientSort`, `onSortChange`.

**Accessibility:** 🟩 Good compliance
- `aria-sort` on sortable column headers ✅
- Keyboard navigation: Arrow Up/Down to move between rows, Enter/Space to activate ✅
- `tabIndex={0}` and `role="button"` on clickable rows ✅
- Search input has `aria-label` ✅
- Pagination buttons have `aria-label` with page number ✅
- `data-label` on `<td>` for responsive card layout ✅

**Code Quality:**
- `T extends Record<string, any>` is a weak generic constraint — `any` index signature bypasses type safety for column rendering.
- The keyboard navigation handler is attached to the table element via `addEventListener` in a `useEffect` — this is correct but could be simplified with `onKeyDown` on the `<table>` element directly.
- `clientSort` and server-side sort are both supported but the API is slightly awkward — `onSortChange` is only called when `clientSort` is false, which is not obvious from the prop name.

---

### 4.9 Toast / ToastContainer / toastStore

**Metadata:** `UI/Toast/Toast.tsx` (80 LOC) + `ToastContainer.tsx` (17 LOC) + `toastStore.ts` (27 LOC)
**Responsibility:** Notification system. `toastStore` (Zustand) holds the toast queue. `ToastContainer` renders the queue via portal. `Toast` renders individual notifications with auto-dismiss and exit animation.

**Props Interface (Toast):** `id`, `type` (`success | error | warning | info`), `title?`, `message`, `duration?` (default 4500ms), `onClose`.

**Accessibility:** 🟧 Partial support
- Individual `Toast` has `role="alert"` and `aria-live="assertive"` ✅
- `ToastContainer` has `aria-live="polite"` — **conflicting live region semantics**: the container is `polite` but each toast is `assertive`. Screen readers may announce toasts twice or inconsistently. The container's `aria-live` should be removed, leaving only the per-toast `role="alert"`.
- Close button has `aria-label="Fechar"` ✅
- Max 5 toasts enforced in store ✅

**Code Quality:** Clean. `resetToastStore()` export for test cleanup is a good practice. The 280ms exit animation timeout is hardcoded — should be a constant.

---

### 4.10 PasswordInput

**Metadata:** `src/components/UI/PasswordInput/PasswordInput.tsx` | Form | 85 LOC
**Responsibility:** Password input with show/hide toggle and optional strength indicator.

**Props Interface:** `showStrength?`, `label?`, `wrapperClassName?`, extends `InputHTMLAttributes` (minus `type`).

**Accessibility:** 🟩 Good compliance
- Toggle button has `aria-label` (show/hide) ✅
- Strength indicator has `aria-live="polite"` ✅
- Rules list provides text feedback for each criterion ✅

**Code Quality:** 🟧 `STRENGTH_COLORS` array uses hardcoded hex values (`#e74c3c`, `#f39c12`, `#2ecc71`, `#27ae60`) applied as inline `style` attributes. These bypass the design token system and cannot be overridden via CSS. The corresponding semantic tokens (`--color-error`, `--color-warning-400`, `--color-success-500`) exist and should be used instead.

---

### 4.11 Skeleton

**Metadata:** `src/components/UI/Skeleton/Skeleton.tsx` | UI / Shared | 53 LOC
**Responsibility:** Loading placeholder with shimmer or pulse animation.

**Props Interface:** `variant` (text/rectangular/circular/card/avatar), `width`, `height`, `className`, `animation` (wave/pulse/none), `lines` (for multi-line text).

**Accessibility:** 🟩 Good compliance — `role="status"`, `aria-live="polite"`, `sr-only` "Carregando..." text, `aria-hidden` on visual element.

**Code Quality:** Clean. The `lines > 1` path renders a `<div>` wrapper with `role="status"` while the single-line path also renders a `<div role="status">` — consistent.

---

### 4.12 Breadcrumbs

**Metadata:** `src/components/UI/Breadcrumbs/Breadcrumbs.tsx` | UI / Shared | 73 LOC
**Responsibility:** Navigation breadcrumb trail, auto-generated from `location.pathname` using i18n keys, or manually provided.

**Accessibility:** 🟩 Good compliance
- `<nav aria-label="Breadcrumb">` ✅
- `<ol>` list structure ✅
- `aria-current="page"` on last item ✅
- JSON-LD structured data for SEO ✅

**Code Quality:** `dangerouslySetInnerHTML` is used for the JSON-LD `<script>` tag. This is a standard pattern for injecting structured data and is safe here since the content is constructed from `window.location.origin` and i18n-translated labels (not user input). The UUID/ObjectId segment filter (`/^[a-f0-9]{24}$/i`) correctly skips MongoDB IDs in paths.

---

### 4.13 PermissionGate

**Metadata:** `src/components/Auth/PermissionGate/PermissionGate.tsx` | Feature | 15 LOC
**Responsibility:** Conditionally renders children based on the current user's role and a list of required permissions.

**Props Interface:** `permissions: string[]`, `children`, `fallback?` (default `null`).

**Accessibility:** 🟩 Good compliance — purely conditional rendering, no DOM output of its own.

**Code Quality:** Clean and minimal. Uses `hasAnyPermission` from `@vsaas/types` — the permission check logic is centralized in the shared types package, not duplicated here.

**Usage observation:** `PermissionGate` is only used in `DashboardLayout` for sidebar navigation items. Page-level access control uses `ProtectedRoute` with `allowedRoles`. This is the correct separation — navigation visibility vs. route access.

---

### 4.14 ProtectedRoute

**Metadata:** `src/components/Auth/ProtectedRoute/ProtectedRoute.tsx` | Feature | 36 LOC
**Responsibility:** Route guard for staff users. Redirects to `/login` if unauthenticated, to `/unauthorized` if role is not in `allowedRoles`.

**Accessibility:** 🟧 Partial support
- Loading state renders a spinner with no `role="status"` or `aria-label` on the outer `<div>` ✅ (spinner itself has `aria-label` via global CSS)
- **Gap:** Uses raw `<div className="spinner spinner-lg" />` instead of the `Spinner` component — the `Spinner` component has `role="status"` and `aria-live="polite"`, the raw div does not.

**Code Quality:** Uses the standalone `t('common.loading')` function (not `useTranslation().t`) — non-reactive to locale changes, as documented in `overview-part3.md §8.3`.

---

### 4.15 DashboardLayout

**Metadata:** `src/layouts/DashboardLayout/DashboardLayout.tsx` | Layout | 134 LOC
**Responsibility:** Staff dashboard shell. Renders collapsible sidebar with role-gated navigation, main content area, breadcrumbs, session timeout modal, and top loading bar.

**Accessibility:** 🟩 Good compliance
- `<aside>` for sidebar ✅
- `<nav aria-label>` for navigation ✅
- `aria-current="page"` on active `NavLink` ✅
- `aria-label` on sidebar toggle button ✅
- Mobile overlay has `aria-hidden="true"` ✅
- `id="main-content"` on `<main>` for skip link ✅

**Code Quality:**
- Sidebar collapse uses `window.innerWidth < 768` directly — not reactive to CSS breakpoint changes. A `matchMedia` listener would be more robust.
- `navProps` helper function returns a render prop for `NavLink` — clean pattern.
- `DashboardLayout.module.css` has 3 hardcoded `#fff` values for text on the dark sidebar. These should use `--color-neutral-0` or `rgba(255,255,255,*)`.

---

### 4.16 CitizenPortalLayout

**Metadata:** `src/layouts/CitizenPortalLayout/CitizenPortalLayout.tsx` | Layout | 104 LOC
**Responsibility:** Citizen portal shell. Renders public header with auth-aware navigation, main content area, footer, and session timeout modal.

**Accessibility:** 🟧 Partial support
- `<header>`, `<main id="main-content">`, `<footer>` semantic structure ✅
- Breadcrumb nav with `aria-label` and `aria-current="page"` ✅
- **🟥 Critical gap:** Active `NavLink` elements explicitly set `aria-current={undefined}`, disabling the active page indicator for screen readers. The `DashboardLayout` correctly uses `aria-current="page"` via the `navProps` helper. This is an inconsistency that should be corrected.

**Code Quality:**
- The static `CITIZEN_BREADCRUMBS` map only covers 2 routes (`/portal/dashboard`, `/portal/profile`). Other citizen routes will show no breadcrumb. The `DashboardLayout` uses the auto-generating `Breadcrumbs` component — the citizen portal should do the same.
- The emoji `🏛️` is used as the brand icon — this is not accessible (no `alt` text equivalent for emoji in this context, though `aria-hidden="true"` is set).

---

### 4.17 LoginForm

**Metadata:** `src/components/Auth/LoginForm/LoginForm.tsx` | Form | 47 LOC
**Responsibility:** Staff login form with email/password fields and error display.

**Accessibility:** 🟧 Partial support
- Labels with `htmlFor` ✅
- `autoComplete` attributes ✅
- Error displayed in `<div className="form-error">` — no `role="alert"` ✅ (missing)
- **Gap:** Error `<div>` has no `role="alert"` or `aria-live` — screen readers will not announce login errors.
- **Gap:** Uses raw `<input type="password">` instead of `PasswordInput` component — no show/hide toggle for the password field.

**Code Quality:** Uses raw `.form-field` global classes instead of the `Input` component. This is the most-visited form in the application and is inconsistent with the component library's own form primitives.

---

### 4.18 ErrorBoundary

**Metadata:** `src/components/ErrorBoundary/ErrorBoundary.tsx` | Feature | 36 LOC
**Responsibility:** Class-based React error boundary. Catches render errors, reports them, and renders a fallback UI.

**Props Interface:** `children`, `fallback?`, `onError?`.

**Accessibility:** 🟧 Partial support
- Default fallback renders `<h2>Algo deu errado</h2>` — hardcoded Portuguese, no i18n ✅ (acceptable for error boundary)
- Retry `<button>` uses raw element, not `Button` component
- **Gap:** No `role="alert"` on the error fallback — screen readers may not announce the error state.

**Code Quality:** `reportError` from `@/utils/errorReporting` is called in `componentDidCatch` — but `errorReporting.ts` only calls `console.error`. No external error monitoring integration.
