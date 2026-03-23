# Component Library Audit — Part 4 of 4
# Design Consistency, Reusability, Patterns & Recommendations

> Continuation of the Secom frontend component library audit.
> Parts 1–3 cover component inventory, design system documentation, and component deep dives.
> This part covers cross-cutting consistency findings, reusability classification, domain-specific patterns, and actionable recommendations.

---

## §5 Design Consistency Audit

### 5.1 Token Compliance Violations

34 hardcoded hex values were found across 9 files. All have a direct token equivalent in `src/styles/tokens/index.css`.

| File | Count | Examples | Severity |
|------|-------|---------|----------|
| `StatusBadge.tsx` | 4 | `#92400e`, `#d97706`, `#1e40af`, `#3b82f6` | 🟧 High |
| `PasswordInput.tsx` | 4 | `#e74c3c`, `#f39c12`, `#2ecc71`, `#27ae60` | 🟧 High |
| `Auth.module.css` | 7 | `.errorBanner`, `.infoBanner`, `.successBanner` backgrounds | 🟧 High |
| `DashboardLayout.module.css` | 3 | `#fff` (sidebar, header, nav active) | 🟨 Medium |
| `DashboardPage.module.css` | 2 | `#fff`, `#92400e` | 🟨 Medium |
| `DashboardMockup.module.css` | 6 | Status chip colors (`#dcfce7`, `#166534`, `#fef9c3`, `#854d0e`, `#dbeafe`, `#1e40af`) | 🟩 Low (landing page only) |
| `ContactForm.module.css` | 1 | `#fff` | 🟩 Low |
| `LandingPage.module.css` | 3 | `#fff` ×3 | 🟩 Low |

All `#fff` instances should use `var(--color-neutral-0)`. Status colors in `StatusBadge` and `Auth.module.css` should use the semantic tokens (`--color-error-*`, `--color-warning-*`, `--color-info-*`, `--color-success-*`). `PasswordInput` strength colors have no token equivalent — tokens must be added.

### 5.2 STATUS_COLORS Duplication

The same status-to-color mapping is defined as a local constant in 5 separate files:

| File | Constant Name | Statuses Covered |
|------|--------------|-----------------|
| `DashboardPage.tsx` | `STATUS_COLORS` | `published`, `draft`, `pending_review` |
| `PressReleasesPage.tsx` | `STATUS_COLORS` | `published`, `draft`, `pending_review` |
| `EventsPage.tsx` | `STATUS_COLORS` | `scheduled`, `ongoing`, `completed`, `cancelled` |
| `AppointmentsPage.tsx` | `STATUS_COLORS` | `scheduled`, `completed`, `cancelled`, `no_show` |
| `SocialMediaPage.tsx` | `STATUS_COLORS` | `scheduled`, `published`, `failed` |

`StatusBadge` already centralises label display but does not centralise color logic — each page re-implements it independently. The statuses `no_show` and `failed` are not present in `StatusBadge`'s built-in `STATUS_LABELS` map and fall back to raw string display.

### 5.3 Prop Naming Inconsistency

Loading state is expressed with three different prop names across the component library:

| Component | Prop | Type |
|-----------|------|------|
| `Button` | `isLoading` | `boolean` |
| `Input` | `loading` | `boolean` |
| `ConfirmDialog` | `isLoading` | `boolean` |
| `FormComponentProps` (CrudPage contract) | `isPending` | `boolean` |

No component consumes another's loading prop directly, so there is no runtime breakage, but the inconsistency increases cognitive load for contributors and violates the principle of least surprise.

### 5.4 Component Bypass Patterns

Cases where a UI primitive exists but is not used:

| Location | Available Primitive | What Is Used Instead | Severity |
|----------|--------------------|--------------------|----------|
| `LoginForm.tsx` | `Input` | Raw `<input>` + `.form-field` global class | 🟧 High |
| `LoginForm.tsx` | `PasswordInput` | Raw `<input type="password">` | 🟧 High |
| `CitizenPortalHomePage.tsx` | `Button` | Local `styles.btnPrimary`, `styles.btnOutline` | 🟧 High |
| `DashboardPage.tsx` (4 buttons) | `Button` | Raw `<button className="btn btn-*">` | 🟨 Medium |
| `CitizenDashboardPage.tsx` | `Card` | Locally reimplemented card surfaces | 🟨 Medium |
| `CitizenPortalHomePage.tsx` | `Card` | Locally reimplemented card surfaces | 🟨 Medium |
| Domain forms (all 7) | `Input` | Raw `<input>` / `<select>` inside `FormField` | 🟨 Medium |

The `LoginForm` bypass is the most impactful: it is the primary authentication entry point for staff users and lacks the accessibility and validation features built into `Input` and `PasswordInput`.

### 5.5 Accessibility Inconsistencies

| Issue | Location | Severity |
|-------|----------|----------|
| `aria-current={undefined}` on active NavLinks | `CitizenPortalLayout.tsx` | 🟥 Critical |
| Static `id="modal-title"` — duplicate IDs with multiple modals | `Modal.tsx` | 🟥 Critical |
| Focus not restored to trigger element on modal close | `Modal.tsx` | 🟧 High |
| `FormField` does not inject `aria-describedby` onto children | `FormField.tsx` | 🟧 High |
| Raw `<input>`/`<select>` in domain forms have no error association | All 7 domain forms | 🟧 High |
| Conflicting `aria-live` semantics (container `polite`, items `assertive`) | `Toast.tsx` + `ToastContainer.tsx` | 🟧 High |
| No `role="alert"` on error div | `LoginForm.tsx` | 🟨 Medium |
| Static breadcrumb map covers only 2 routes | `CitizenPortalLayout.tsx` | 🟨 Medium |

### 5.6 Date Formatting Inconsistency

`EventsPage` and `SocialMediaPage` call `new Date().toLocaleString('pt-BR')` inline. Other pages use the shared `formatDate` utility from `src/utils/`. This creates a divergence in locale handling and makes future format changes require edits in multiple places.

### 5.7 Dead Dependencies

| Package | Evidence of Non-Use |
|---------|-------------------|
| `framer-motion` | Zero imports found across entire `src/` tree |
| `react-hot-toast` | Zero imports found across entire `src/` tree |

Both are production dependencies adding bundle weight with no current consumer.

---

## §6 Reusability Assessment

### 6.1 Component Reuse Classification

| Component | Files Using It | Classification | Notes |
|-----------|---------------|---------------|-------|
| `CrudPage` | 7 | ✅ Core abstraction | All domain pages; central to architecture |
| `StatusBadge` | 10 | ✅ Widely reused | All modules; color logic still duplicated externally |
| `Button` | ~20 | ✅ Widely reused | Bypassed in 5+ locations |
| `Modal` | 8 | ✅ Widely reused | Critical accessibility bug limits safe reuse |
| `DataTable` | 8 | ✅ Widely reused | Via CrudPage in 7 + UsersPage directly |
| `ConfirmDialog` | 7 | ✅ Widely reused | All domain delete flows |
| `FormField` | ~30 | ✅ Widely reused | All domain forms; `aria-describedby` gap |
| `Card` | 11 imports | ⚠️ Partially reused | Not used in citizen portal despite imports |
| `Input` | 6 | ⚠️ Underused | Rich API; bypassed in all domain forms |
| `PasswordInput` | 3 | ⚠️ Underused | Bypassed in `LoginForm` |
| `Toast` / `ToastContainer` | 2 | ⚠️ Underused | Conflicting aria semantics |
| `Spinner` | 4 | ✅ Appropriately scoped | Simple utility |
| `Skeleton` | 3 | ✅ Appropriately scoped | Simple utility |
| `PermissionGate` | 8 | ✅ Correctly scoped | Nav + route guards only |
| `Pagination` | 1 (via CrudPage) | ✅ Correctly abstracted | Not used directly |
| `SearchBar` | 1 (via CrudPage) | ✅ Correctly abstracted | Not used directly |
| `DashboardMockup` | 1 | 🔵 Landing page only | Not part of app component library |

### 6.2 Missing Primitives

The following form elements are used across domain forms but have no corresponding UI primitive:

| Element | Current Usage | Gap |
|---------|--------------|-----|
| `<select>` | Raw HTML in all 7 domain forms | No `Select` component; no consistent styling or accessibility wrapper |
| `<textarea>` | Raw HTML in PressReleases, Clippings, Events forms | No `Textarea` component |
| `<input type="checkbox">` | Raw HTML in SocialMedia, Appointments forms | No `Checkbox` component |
| `<input type="date">` / `<input type="datetime-local">` | Raw HTML in Events, Appointments, SocialMedia | No `DateInput` component |

The absence of these primitives is the primary reason domain forms bypass `Input` — the component does not cover the full range of form controls needed.

### 6.3 Abstraction Boundary Assessment

`CrudPage` is the correct level of abstraction for the 7 domain modules. Its generic `<TItem, TForm>` signature handles the full CRUD lifecycle without requiring domain pages to wire state, modals, or pagination manually. The `formExtraProps` escape hatch (used by `SocialMediaPage`) is a pragmatic extension point, though it relies on `any` casting internally.

`UsersPage` deliberately does not use `CrudPage` — it requires inline role editing within the table row, which falls outside `CrudPage`'s modal-based form model. This is a justified exception, not an inconsistency.

---

## §7 Secom-Specific Patterns

### 7.1 Role-Based UI

Role enforcement is handled at two levels:

- **Route level**: Protected routes check the user's role before rendering a page.
- **Navigation level**: `PermissionGate` wraps individual nav items in `DashboardLayout`, hiding links the current user's role cannot access.

No component-level role logic exists inside UI primitives — role awareness is correctly kept at the layout and routing boundary. The five roles (`admin`, `assessor`, `social_media`, `atendente`, `citizen`) map cleanly to the two layout trees: `DashboardLayout` (staff) and `CitizenPortalLayout` (citizen).

### 7.2 Domain Form Workflow

All 7 domain modules follow an identical form workflow pattern enforced by `CrudPage`:

1. `DataTable` renders the item list with an "Add" button and per-row edit/delete actions.
2. "Add" or "Edit" opens a `Modal` containing the domain-specific form component.
3. The form component receives `FormComponentProps` (`initialData`, `onSubmit`, `isPending`).
4. On submit, `CrudPage` calls the appropriate API mutation and closes the modal.
5. Delete triggers `ConfirmDialog` before calling the delete mutation.

Domain forms use `.form-stack`, `.form-grid`, `.form-section`, and `.form-actions` global utility classes consistently across all 7 modules. This is the most uniformly applied pattern in the codebase.

### 7.3 Citizen Portal Separation

The citizen portal is structurally isolated from the staff application:

- Separate layout: `CitizenPortalLayout` (no sidebar, public-facing nav)
- Separate auth pages: `CitizenLoginPage`, `CitizenRegisterPage` (share `Auth.module.css` with staff auth ✅)
- Separate dashboard: `CitizenDashboardPage` (no `CrudPage` usage — read-only views)
- Separate route tree under `/portal/`

The separation is architecturally sound. The main issues are within the citizen portal itself: `CitizenPortalHomePage` reimplements button and card surfaces locally instead of using `Button` and `Card`, and `CitizenDashboardPage` contains a dead link to `/portal/appointments` (route does not exist).

Additionally, `src/pages/Domain/CitizenPortal/CitizenPortalPage.tsx` is a redirect shim that re-exports `CitizenRecordsPage`. It serves no purpose and should be removed.

### 7.4 Status Indicator Pattern

Status values are displayed in two ways across the application:

- `StatusBadge` — renders a coloured pill with a human-readable label. Used in `DataTable` column renderers across all 7 modules.
- Local `STATUS_COLORS` constants — used to drive additional UI (row highlighting, stat cards) in domain pages.

The two mechanisms are not connected. `StatusBadge` owns label mapping; domain pages own color mapping independently. Centralising both into `StatusBadge` (or a shared `statusConfig` map) would eliminate the duplication documented in §5.2.

### 7.5 Authentication Forms

Staff and citizen authentication share `Auth.module.css` and follow the same visual structure. However, `LoginForm` (staff) diverges from `CitizenLoginPage` (citizen) in component usage: `CitizenLoginPage` uses the `Input` component correctly, while `LoginForm` uses raw `<input>` elements. This means the primary staff login form has lower accessibility and consistency than the citizen-facing equivalent.

---

## §8 Recommendations

### 🟥 Critical — Fix Before Next Release

**1. Fix Modal duplicate `id="modal-title"`**
Replace the static string with a generated ID (e.g. `useId()`) passed as `aria-labelledby`. Multiple simultaneous modals currently produce invalid HTML.

**2. Fix `CitizenPortalLayout` `aria-current`**
`aria-current={undefined}` is equivalent to omitting the attribute. Active NavLinks must set `aria-current="page"`. Screen reader users currently receive no active page indication in the citizen portal.

**3. Restore focus on Modal close**
Store a ref to the trigger element before opening and call `.focus()` on it when the modal closes. Required for keyboard and assistive technology users.

### 🟧 High — Address in Next Sprint

**4. Migrate `LoginForm` to `Input` and `PasswordInput`**
`LoginForm` is the staff authentication entry point. It currently uses raw `<input>` elements, bypassing validation, accessibility, and styling features already built into the component library. Add `role="alert"` to the error div.

**5. Inject `aria-describedby` in `FormField`**
`FormField` renders an error message but does not associate it with the child input. Use `React.cloneElement` or a context-based approach to inject `aria-describedby={errorId}` onto the child. Without this, screen readers do not announce field errors.

**6. Resolve Toast `aria-live` conflict**
Choose one strategy: either the container is `aria-live="assertive"` and items are silent, or items are `assertive` and the container is removed from the live region tree. The current mixed setup produces unpredictable announcement behaviour.

**7. Migrate `CitizenPortalHomePage` to `Button` and `Card`**
Remove `styles.btnPrimary`, `styles.btnOutline`, and locally reimplemented card surfaces. Use the existing primitives.

**8. Add `no_show` and `failed` to `StatusBadge` `STATUS_LABELS`**
These statuses are used in `AppointmentsPage` and `SocialMediaPage` respectively but fall back to raw string display. Add Portuguese labels and token-mapped colors.

**9. Remove dead dependencies**
Uninstall `framer-motion` and `react-hot-toast`. Neither is imported anywhere in `src/`. They add production bundle weight with no benefit.

### 🟨 Medium — Backlog

**10. Centralise `STATUS_COLORS`**
Create a single `src/utils/statusConfig.ts` that exports both label and color for each status value. Replace the 5 local `STATUS_COLORS` constants. `StatusBadge` should consume this map.

**11. Add `Select`, `Textarea`, `Checkbox`, `DateInput` primitives**
Domain forms currently use raw HTML for these elements. Adding wrapped primitives with consistent styling, `forwardRef`, and `aria-describedby` support would allow domain forms to use the component library fully and eliminate the `Input` bypass pattern.

**12. Standardise loading prop naming**
Align on `isLoading` across `Button`, `Input`, `ConfirmDialog`, and `FormComponentProps`. A single codebase-wide rename is low risk and improves contributor experience.

**13. Replace inline date formatting with `formatDate` utility**
`EventsPage` and `SocialMediaPage` call `new Date().toLocaleString('pt-BR')` inline. Replace with the shared utility to centralise locale and format control.

**14. Replace hardcoded hex values with tokens**
Priority order: `StatusBadge` → `PasswordInput` → `Auth.module.css` → layout modules. See §5.1 for the full list. `PasswordInput` strength colors require new tokens to be added first.

**15. Migrate `DashboardPage` raw buttons to `Button` component**
Four `<button className="btn btn-*">` elements in `DashboardPage` should use `<Button variant="...">`.

### 🟩 Low — When Convenient

**16. Delete `CitizenPortalPage.tsx` redirect shim**
`src/pages/Domain/CitizenPortal/CitizenPortalPage.tsx` re-exports `CitizenRecordsPage` and serves no purpose. Remove it and update any imports.

**17. Fix dead link in `CitizenDashboardPage`**
The link to `/portal/appointments` points to a non-existent route. Either create the route or remove the link.

**18. Expand `CitizenPortalLayout` breadcrumb map**
The static map covers only 2 routes. Extend it to cover all citizen portal routes or replace with a dynamic solution.

**19. Replace hardcoded `#fff` in layout and page modules**
`DashboardLayout.module.css` (×3), `DashboardPage.module.css` (×1), `ContactForm.module.css` (×1), `LandingPage.module.css` (×3) — replace with `var(--color-neutral-0)`.

**20. Add `window.innerWidth` SSR guard in `DashboardLayout`**
Currently called directly at render time. Wrap in a `useEffect` or replace with a CSS-based responsive approach to avoid issues if server-side rendering is ever introduced.

---

## Summary Table

| # | Recommendation | Severity | Effort |
|---|---------------|----------|--------|
| 1 | Fix Modal duplicate `id="modal-title"` | 🟥 Critical | Low |
| 2 | Fix `CitizenPortalLayout` `aria-current` | 🟥 Critical | Low |
| 3 | Restore focus on Modal close | 🟥 Critical | Low |
| 4 | Migrate `LoginForm` to `Input`/`PasswordInput` | 🟧 High | Low |
| 5 | Inject `aria-describedby` in `FormField` | 🟧 High | Medium |
| 6 | Resolve Toast `aria-live` conflict | 🟧 High | Low |
| 7 | Migrate `CitizenPortalHomePage` to `Button`/`Card` | 🟧 High | Low |
| 8 | Add `no_show`/`failed` to `StatusBadge` | 🟧 High | Low |
| 9 | Remove dead dependencies | 🟧 High | Low |
| 10 | Centralise `STATUS_COLORS` | 🟨 Medium | Medium |
| 11 | Add `Select`, `Textarea`, `Checkbox`, `DateInput` | 🟨 Medium | High |
| 12 | Standardise loading prop naming | 🟨 Medium | Low |
| 13 | Replace inline date formatting | 🟨 Medium | Low |
| 14 | Replace hardcoded hex values with tokens | 🟨 Medium | Medium |
| 15 | Migrate `DashboardPage` raw buttons | 🟨 Medium | Low |
| 16 | Delete `CitizenPortalPage` shim | 🟩 Low | Low |
| 17 | Fix dead link in `CitizenDashboardPage` | 🟩 Low | Low |
| 18 | Expand breadcrumb map | 🟩 Low | Low |
| 19 | Replace hardcoded `#fff` in layout modules | 🟩 Low | Low |
| 20 | Add `window.innerWidth` SSR guard | 🟩 Low | Low |

---

*End of audit. See Parts 1–3 for component inventory, design system documentation, and component deep dives.*
