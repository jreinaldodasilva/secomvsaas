# Component Library Quick Wins
## Secom — Secretaria de Comunicação

> **Source documents:** component-library-part-1.md, part-2.md, part-3.md, part-4.md
> All items are grounded exclusively in those documents. No external assumptions.
> Quick wins are ordered by severity then effort — lowest effort, highest impact first.

---

## Quick Win #1: Fix Modal Duplicate Static IDs

**Component:** `Modal`

**Problem**
`Modal` uses static string IDs `id="modal-title"` and `id="modal-desc"` for `aria-labelledby` and `aria-describedby`. When two modals are open simultaneously (e.g., `CrudPage` edit modal + `ConfirmDialog` delete modal), both produce `id="modal-title"` in the DOM. Duplicate IDs break all ARIA associations — screen readers cannot identify which title belongs to which dialog.

**Impact**
Affects all 14 modal usages across the application. `CrudPage` (used by all 7 domain modules) opens a `ConfirmDialog` (which wraps `Modal`) while the edit `Modal` may still be mounted — this is the exact scenario that triggers the bug.

**Effort:** 1–2 hours

**Implementation Steps**
1. Add `useId()` inside `Modal` to generate a stable, unique ID per instance.
2. Replace the static `"modal-title"` and `"modal-desc"` strings with the generated ID suffixed (e.g., `${id}-title`, `${id}-desc`).
3. Pass the generated IDs to `aria-labelledby` and `aria-describedby` on the dialog element.

**Risk Level:** Low — internal change; no prop API changes required.

**Source:** Part 1, Part 3, Part 4 (Rec #1)

---

## Quick Win #2: Fix `CitizenPortalLayout` `aria-current`

**Component:** `CitizenPortalLayout`

**Problem**
Active `NavLink` elements in `CitizenPortalLayout` explicitly set `aria-current={undefined}`, which is equivalent to omitting the attribute entirely. Screen reader users navigating the citizen portal receive no indication of which page is currently active. `DashboardLayout` handles this correctly via its `navProps` helper — the citizen portal is inconsistent with the staff portal.

**Impact**
All citizen-role users navigating the portal (`/portal/dashboard`, `/portal/profile`, etc.) receive no active page feedback from assistive technologies.

**Effort:** 30 minutes

**Implementation Steps**
1. Remove the explicit `aria-current={undefined}` override from citizen portal `NavLink` elements.
2. Apply the same `navProps` pattern used in `DashboardLayout` — React Router's `NavLink` sets `aria-current="page"` automatically when `isActive` is true.

**Risk Level:** Low — no visual change; purely additive ARIA attribute.

**Source:** Part 1, Part 3, Part 4 (Rec #2)

---

## Quick Win #3: Restore Focus on Modal Close

**Component:** `Modal`

**Problem**
When a `Modal` closes, focus is not returned to the element that triggered it. Keyboard and assistive technology users lose their position in the document — focus typically falls to the `<body>` or an unpredictable element. This is a WCAG 2.1 failure (SC 2.4.3 Focus Order).

**Impact**
All 14 modal usages. Most critical in `CrudPage` flows where the user opens an edit modal from a table row action button.

**Effort:** 1–2 hours

**Implementation Steps**
1. In `Modal`, store a `ref` to `document.activeElement` at the moment `isOpen` transitions from `false` to `true`.
2. In the cleanup effect (when `isOpen` becomes `false`), call `.focus()` on the stored element if it is still in the DOM.

**Risk Level:** Low — additive behaviour; no existing focus management is removed.

**Source:** Part 3, Part 4 (Rec #3)

---

## Quick Win #4: Migrate `LoginForm` to `Input` and `PasswordInput`

**Component:** `LoginForm`

**Problem**
`LoginForm` — the primary staff authentication entry point — uses raw `<input>` and `<input type="password">` elements with global `.form-field` classes instead of the `Input` and `PasswordInput` components. The error `<div>` has no `role="alert"`, so login errors are not announced to screen readers. The citizen-facing `CitizenLoginPage` correctly uses `Input` — the staff login has lower accessibility than the citizen equivalent.

**Impact**
Every staff login attempt. Missing: show/hide password toggle, `aria-invalid`, `aria-describedby` on error, `role="alert"` on error message.

**Effort:** 2–4 hours

**Implementation Steps**
1. Replace the raw email `<input>` with `<Input>` (label, error, autoComplete props).
2. Replace the raw password `<input>` with `<PasswordInput>` (label, autoComplete).
3. Add `role="alert"` to the error `<div>` (or replace with a `FormField` error pattern).
4. Remove the now-unused raw `.form-field` class references.

**Risk Level:** Low — `Input` and `PasswordInput` are already used in the codebase; no new dependencies.

**Source:** Part 1, Part 3, Part 4 (Rec #4)

---

## Quick Win #5: Resolve Toast `aria-live` Conflict

**Component:** `Toast` / `ToastContainer`

**Problem**
`ToastContainer` has `aria-live="polite"` while each individual `Toast` has `role="alert"` (which implies `aria-live="assertive"`). This conflicting live region nesting causes screen readers to announce toasts twice or inconsistently — the container's `polite` region and the toast's `assertive` region both fire.

**Impact**
All 12 toast usages across the application. Affects every success/error/warning notification shown to users.

**Effort:** 30 minutes

**Implementation Steps**
1. Remove `aria-live="polite"` from `ToastContainer` — the container should not itself be a live region.
2. Keep `role="alert"` and `aria-live="assertive"` on individual `Toast` components.
3. Verify that the container still renders toasts into a portal so the live region is not nested inside another live region.

**Risk Level:** Low — no visual change; no prop API changes.

**Source:** Part 3, Part 4 (Rec #6)

---

## Quick Win #6: Add `no_show` and `failed` to `StatusBadge`

**Component:** `StatusBadge`

**Problem**
`AppointmentsPage` uses the status value `no_show` and `SocialMediaPage` uses `failed`. Neither is present in `StatusBadge`'s `STATUS_LABELS` map, so both fall back to raw string display (e.g., `"no_show"` rendered as-is). These are user-visible status values in two of the seven domain modules.

**Impact**
Appointments module and Social Media module — both display raw English snake_case strings to users instead of formatted Portuguese labels.

**Effort:** 30 minutes

**Implementation Steps**
1. Add `no_show: 'Não compareceu'` to `STATUS_LABELS` in `StatusBadge`.
2. Add `failed: 'Falhou'` (or appropriate Portuguese label) to `STATUS_LABELS`.
3. Map both to appropriate semantic token colors — `no_show` → gray/neutral variant; `failed` → red/danger variant.

**Risk Level:** Low — additive change to a map; no existing entries modified.

**Source:** Part 4 (Rec #8)

---

## Quick Win #7: Remove Dead Production Dependencies

**Area:** `package.json`

**Problem**
`framer-motion` and `react-hot-toast` are listed as production dependencies but have zero imports anywhere in `src/`. They add bundle weight and represent an unmonitored security surface for packages that provide no value.

**Impact**
Bundle size reduction. `framer-motion` is a significant package (~50KB+ gzipped). `react-hot-toast` is smaller but equally unused.

**Effort:** 30 minutes

**Implementation Steps**
1. Run `npm uninstall framer-motion react-hot-toast`.
2. Verify the build passes and no runtime errors appear (confirm no dynamic imports exist).
3. Confirm `TopLoadingBar` still works — it uses a pure CSS animation, not `framer-motion`.

**Risk Level:** Low — confirmed zero imports in source.

**Source:** Part 1, Part 4 (Rec #9)

---

## Quick Win #8: Replace Hardcoded Hex Values in `StatusBadge`

**Component:** `StatusBadge`

**Problem**
The yellow and blue badge variants use 4 hardcoded hex values (`#92400e`, `#d97706`, `#1e40af`, `#3b82f6`) in `StatusBadge.module.css` instead of design tokens. This is the highest-impact token bypass in the library given `StatusBadge`'s usage count of 10 across all 7 modules. `--color-warning-700: #b45309` is close to `#92400e` but not identical — a new token `--color-warning-800` may be needed.

**Impact**
All 10 `StatusBadge` usages. A brand color change would not propagate to yellow/blue badge variants.

**Effort:** 2–3 hours

**Implementation Steps**
1. Audit the exact hex values against the token scale in `tokens/index.css`.
2. Add `--color-warning-800` (or equivalent) if `#92400e` has no exact match.
3. Replace all 4 hardcoded values in `StatusBadge.module.css` with `var(--token-name)`.
4. Verify visual output matches the previous hardcoded values.

**Risk Level:** Low — CSS-only change; no component API changes.

**Source:** Part 2, Part 3, Part 4 (Rec #14)

---

## Quick Win #9: Replace `PasswordInput` Inline Strength Colors with Tokens

**Component:** `PasswordInput`

**Problem**
`PasswordInput` defines a `STRENGTH_COLORS` array with 4 hardcoded hex values (`#e74c3c`, `#f39c12`, `#2ecc71`, `#27ae60`) applied as inline `style` attributes. Inline styles cannot be overridden via CSS and bypass the token system entirely. The corresponding semantic tokens (`--color-error`, `--color-warning-400`, `--color-success-500`) exist but are not used.

**Impact**
Auth flows (staff register, password change). Inline styles block any future theming or brand update from affecting the strength indicator.

**Effort:** 1–2 hours

**Implementation Steps**
1. Add CSS custom property variables for each strength level to `PasswordInput.module.css` (e.g., `.strengthWeak { color: var(--color-error); }`).
2. Replace the `STRENGTH_COLORS` inline `style` array with CSS class application per strength level.
3. Remove the `STRENGTH_COLORS` constant from the `.tsx` file.

**Risk Level:** Low — visual output should be equivalent; no prop API changes.

**Source:** Part 2, Part 3, Part 4 (Rec #14)

---

## Quick Win #10: Replace Hardcoded Values in `Auth.module.css`

**Component:** Auth pages (`LoginPage`, `CitizenLoginPage`, `CitizenRegisterPage`)

**Problem**
`Auth.module.css` contains 7 hardcoded hex values for `.errorBanner`, `.infoBanner`, and `.successBanner` backgrounds. The exact semantic tokens already exist: `--color-error-light`, `--color-info-light`, `--color-success-light`, `--color-error-600`, `--color-info-dark`, `--color-success-600`.

**Impact**
High-visibility auth pages shared by both staff and citizen flows. Token bypass here means auth feedback banners are visually disconnected from the rest of the design system.

**Effort:** 1 hour

**Implementation Steps**
1. Open `Auth.module.css` and identify the 7 hardcoded hex values.
2. Replace each with the corresponding `var(--token-name)` from `tokens/index.css`.
3. Verify visual output in all three banner states (error, info, success).

**Risk Level:** Low — CSS-only change; no component API changes.

**Source:** Part 2, Part 4 (§5.1)

---

## Quick Win #11: Migrate `CitizenPortalHomePage` to `Button` and `Card`

**Component:** `CitizenPortalHomePage`

**Problem**
`CitizenPortalHomePage` defines local `styles.btnPrimary` and `styles.btnOutline` classes that duplicate the `Button` component's styling, and reimplements card surfaces with local CSS instead of using `Card`. This creates a visual divergence in the citizen portal and means button/card style changes must be applied in two places.

**Impact**
Citizen portal home page — the first page citizen users see after login. Visual inconsistency with the rest of the application.

**Effort:** 2–3 hours

**Implementation Steps**
1. Replace `<button className={styles.btnPrimary}>` and `<button className={styles.btnOutline}>` with `<Button variant="primary">` and `<Button variant="outline">`.
2. Replace locally reimplemented card `<div>` elements with `<Card>` using appropriate `variant` and `padding` props.
3. Remove the now-unused local CSS classes from `CitizenPortal.module.css`.

**Risk Level:** Low — `Button` and `Card` are stable, well-tested primitives.

**Source:** Part 4 (Rec #7, §5.4)

---

## Quick Win #12: Standardise Loading Prop Naming to `isLoading`

**Components:** `Button`, `Input`, `ConfirmDialog`, `CrudPage` (`FormComponentProps`)

**Problem**
The loading state prop is named `isLoading` in `Button` and `ConfirmDialog`, `loading` in `Input`, and `isPending` in `FormComponentProps` (the `CrudPage` form contract). No component consumes another's loading prop directly, so there is no runtime breakage — but the inconsistency increases cognitive load and violates the principle of least surprise for contributors.

**Impact**
Contributor experience across all form and action components. Risk of passing the wrong prop name silently (boolean props default to `false`).

**Effort:** 2–3 hours

**Implementation Steps**
1. Rename `loading` → `isLoading` in `Input`'s prop interface and all internal usages.
2. Rename `isPending` → `isLoading` in `FormComponentProps` and update all 7 domain form components that implement this interface.
3. Update `CrudPage` to pass `isLoading` instead of `isPending` to `FormComponent`.
4. Verify TypeScript compilation passes with no type errors.

**Risk Level:** Low-Medium — touches 7 domain form files; TypeScript will catch all missed renames at compile time.

**Source:** Part 4 (Rec #12, §5.3)

---

## Quick Win #13: Replace Raw Spinners in `ProtectedRoute` and `ProtectedCitizenRoute`

**Components:** `ProtectedRoute`, `ProtectedCitizenRoute`

**Problem**
Both route guards render `<div className="spinner spinner-lg" />` directly instead of using the `Spinner` component. The raw `<div>` lacks `role="status"` and `aria-live="polite"` that the `Spinner` component provides. Users on slow connections see a loading state with no accessible announcement.

**Impact**
Every authenticated page load — `ProtectedRoute` guards ~12 routes; `ProtectedCitizenRoute` guards 2 citizen routes.

**Effort:** 30 minutes

**Implementation Steps**
1. Import `Spinner` (or `LoadingScreen`) in `ProtectedRoute.tsx` and `ProtectedCitizenRoute.tsx`.
2. Replace `<div className="spinner spinner-lg" />` with `<Spinner size="lg" />`.
3. Remove the now-unused raw class references.

**Risk Level:** Low — `Spinner` is a stable, simple component.

**Source:** Part 1, Part 3 (§4.14)

---

## Quick Win #14: Replace Raw Buttons in `SessionTimeoutModal` and `ErrorBoundary`

**Components:** `SessionTimeoutModal`, `ErrorBoundary`

**Problem**
`SessionTimeoutModal` uses `<button className="btn btn-primary">` and `<button className="btn btn-outline">` directly. `ErrorBoundary`'s retry button uses a raw `<button>` element. Both bypass the `Button` component, creating API fragmentation — if the `.btn` class API changes, these sites must be updated manually.

**Impact**
Session timeout flow (affects all authenticated users) and error boundary fallback UI.

**Effort:** 1 hour

**Implementation Steps**
1. Import `Button` in `SessionTimeoutModal.tsx` and replace both raw buttons with `<Button variant="primary">` and `<Button variant="outline">`.
2. Import `Button` in `ErrorBoundary.tsx` and replace the retry `<button>` with `<Button variant="primary">`.

**Risk Level:** Low — `Button` is the most-used and best-tested component in the library.

**Source:** Part 1 (component inventory issues column)

---

## Quick Win #15: Fix `Spinner` English `aria-label`

**Component:** `Spinner` / `LoadingScreen`

**Problem**
`Spinner` has `aria-label="Loading"` — English text in a Portuguese application. Screen reader users navigating the app in Portuguese will hear an English announcement for every loading state.

**Effort:** 15 minutes

**Implementation Steps**
1. Change `aria-label="Loading"` to `aria-label="Carregando"` in `Loading.tsx`.
2. If the component already uses the `t()` i18n function, use `t('common.loading')` instead of a hardcoded string.

**Risk Level:** None — string-only change.

**Source:** Part 1 (component inventory issues column)

---

## Summary Table

| # | Title | Severity | Effort | Risk | Source |
|---|-------|----------|--------|------|--------|
| 1 | Fix Modal duplicate static IDs | 🟥 P0 | 1–2 hrs | Low | Part 1, 3, 4 |
| 2 | Fix `CitizenPortalLayout` `aria-current` | 🟥 P0 | 30 min | Low | Part 1, 3, 4 |
| 3 | Restore focus on Modal close | 🟥 P0 | 1–2 hrs | Low | Part 3, 4 |
| 4 | Migrate `LoginForm` to `Input`/`PasswordInput` | 🟥 P0 | 2–4 hrs | Low | Part 1, 3, 4 |
| 5 | Resolve Toast `aria-live` conflict | 🟧 P1 | 30 min | Low | Part 3, 4 |
| 6 | Add `no_show`/`failed` to `StatusBadge` | 🟧 P1 | 30 min | Low | Part 4 |
| 7 | Remove dead production dependencies | 🟧 P1 | 30 min | Low | Part 1, 4 |
| 8 | Replace hardcoded hex in `StatusBadge` | 🟧 P1 | 2–3 hrs | Low | Part 2, 3, 4 |
| 9 | Replace `PasswordInput` inline strength colors | 🟧 P1 | 1–2 hrs | Low | Part 2, 3, 4 |
| 10 | Replace hardcoded values in `Auth.module.css` | 🟧 P1 | 1 hr | Low | Part 2, 4 |
| 11 | Migrate `CitizenPortalHomePage` to `Button`/`Card` | 🟧 P1 | 2–3 hrs | Low | Part 4 |
| 12 | Standardise loading prop naming to `isLoading` | 🟨 P2 | 2–3 hrs | Low-Med | Part 4 |
| 13 | Replace raw spinners in `ProtectedRoute` components | 🟨 P2 | 30 min | Low | Part 1, 3 |
| 14 | Replace raw buttons in `SessionTimeoutModal`/`ErrorBoundary` | 🟨 P2 | 1 hr | Low | Part 1 |
| 15 | Fix `Spinner` English `aria-label` | 🟨 P2 | 15 min | None | Part 1 |

**Total estimated effort for all 15 quick wins: ~16–24 developer-hours (2–3 developer-days)**

All 15 items are self-contained with no cross-dependencies, making them safe to distribute across engineers in a single sprint.
