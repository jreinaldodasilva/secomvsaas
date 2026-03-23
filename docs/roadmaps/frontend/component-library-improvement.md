# Component Library Improvement Roadmap
## Secom — Secretaria de Comunicação

> **Source documents:** component-library-part-1.md, part-2.md, part-3.md, part-4.md
> All findings are grounded exclusively in those documents. No external assumptions.

---

## 7. Executive Summary

**Overall Component Library Health Score: 74 / 100** *(up from 61 — 15 Quick Wins completed)*

### Key Strengths

1. **Comprehensive token foundation.** 200+ CSS custom properties covering color, spacing, typography, shadows, and z-index provide a solid base for design system coherence. Semantic aliases (`--radius-button`, `--shadow-modal`) make intent explicit. Token scale extended with `--color-warning-800`, `--color-info-200`, `--color-info-400`, `--color-info-800` during QW-08/QW-10. (Part 2)
2. **`CrudPage` generic abstraction.** A single component eliminates ~80% of CRUD boilerplate across all 7 domain modules, enforcing a uniform list/create/edit/delete workflow with consistent modal, form, and pagination patterns. (Part 1, Part 3)
3. **Uniform domain form pattern.** All 7 domain forms consistently use `.form-stack`, `.form-grid`, `.form-section`, and `FormField` wrappers — the most uniformly applied pattern in the codebase. (Part 1, Part 4)
4. **P0 accessibility issues resolved.** All four P0 issues are now fixed: `Modal` uses `useId()` for unique ARIA IDs, focus is restored on close, `CitizenPortalLayout` sets `aria-current="page"` on active links, and `LoginForm` uses `Input`/`PasswordInput` with `role="alert"` on errors. (QW-01 through QW-04)

### Remaining Major Risks

1. **Token bypass in domain pages.** `DashboardLayout.module.css` retains 3 hardcoded `#fff` values. `DashboardMockup.module.css` has 6 hardcoded status chip colors. These are lower-priority than the shared-component violations now resolved. (Part 2, Part 4)
2. **Missing form primitives.** No `Select`, `Textarea`, `Checkbox`, or `DateInput` components exist — all 7 domain forms still use raw HTML elements for these controls. This is the root cause of the `Input` bypass pattern and the largest remaining structural gap. (Part 4)
3. **`FormField` `aria-describedby` gap.** `FormField` does not inject `aria-describedby` onto child inputs — error messages are not programmatically associated with their inputs across all 7 domain forms. (Part 3, Part 4)
4. **`STATUS_COLORS` duplication.** 5 domain pages still maintain independent `STATUS_COLORS` constants duplicating `StatusBadge` logic. `no_show` and `failed` labels are now in `StatusBadge`, but the duplication remains. (Part 4)

### Estimated Remaining Investment

| Item | Value |
|------|-------|
| Remaining developer-days | 26–38 days |
| Timeline | 10 weeks (Phases 2–4, 2-week sprints) |
| Team assumption | 3–5 frontend engineers, parallel work allowed |

**Phase 1 is complete.** All 7 Phase 1 tasks and 8 additional Phase 2 tasks were delivered as Quick Wins. The remaining work is Phases 2 (partial), 3, and 4.

**Recommendation: Continue with Phase 2 standardization.**
The critical accessibility and token compliance gaps in shared components are resolved. The next highest-leverage work is centralising `STATUS_COLORS`, injecting `aria-describedby` from `FormField`, and building the missing form primitives.

---

## 1. Prioritized Component Issues

### 1.1 Issue Inventory

#### 🟥 P0 — Design System Instability / Breaking Inconsistency

| # | Issue | Component Area | System Impact | Effort | Dependencies | Status | Source |
|---|-------|---------------|---------------|--------|--------------|--------|--------|
| P0-1 | ~~`Modal` uses static `id="modal-title"` and `id="modal-desc"` — multiple simultaneous modals produce duplicate IDs, breaking all ARIA associations~~ | Modal | All 14 modal usages | Low | None | ✅ **Done — QW-01** | Part 1, Part 3 |
| P0-2 | ~~`CitizenPortalLayout` explicitly sets `aria-current={undefined}` on active NavLinks — screen readers receive no active page indication~~ | CitizenPortalLayout | Citizen portal navigation | Low | None | ✅ **Done — QW-02** | Part 1, Part 3, Part 4 |
| P0-3 | ~~`Modal` does not restore focus to the trigger element on close — keyboard and AT users lose their position~~ | Modal | All 14 modal usages | Low | None | ✅ **Done — QW-03** | Part 3, Part 4 |
| P0-4 | ~~`LoginForm` bypasses `Input` and `PasswordInput`, using raw `<input>` elements with no `role="alert"` on error~~ | LoginForm | Staff authentication flow | Low | None | ✅ **Done — QW-04** | Part 1, Part 3, Part 4 |

#### 🟧 P1 — High Maintainability / Consistency Risks

| # | Issue | Component Area | System Impact | Effort | Dependencies | Status | Source |
|---|-------|---------------|---------------|--------|--------------|--------|--------|
| P1-1 | ~~`StatusBadge` yellow and blue variants use 4 hardcoded hex values — most impactful token bypass given 10 usages across all 7 modules~~ | StatusBadge | All modules | Low | Token gap resolved | ✅ **Done — QW-08** | Part 2, Part 3, Part 4 |
| P1-2 | ~~`PasswordInput` strength indicator uses 4 hardcoded inline hex values applied via `style` attribute — cannot be overridden via CSS~~ | PasswordInput | Auth flows | Low | None | ✅ **Done — QW-09** | Part 2, Part 3, Part 4 |
| P1-3 | ~~`Auth.module.css` contains 7 hardcoded hex values for `.errorBanner`, `.infoBanner`, `.successBanner` backgrounds~~ | Auth pages | Staff login, citizen login, register | Low | `--color-info-200` added | ✅ **Done — QW-10** | Part 2, Part 4 |
| P1-4 | `FormField` does not inject `aria-describedby` onto child inputs — error messages are not programmatically associated with their inputs across all 7 domain forms | FormField | All 7 domain module forms (~30 usages) | Medium | None | ✅ **Done** | Part 3, Part 4 |
| P1-5 | ~~`ToastContainer` has `aria-live="polite"` while individual `Toast` components have `aria-live="assertive"` — conflicting live region semantics~~ | Toast / ToastContainer | All 12 toast usages | Low | None | ✅ **Done — QW-05** | Part 3, Part 4 |
| P1-6 | `STATUS_COLORS` constant is independently defined in 5 domain page files — color logic is duplicated outside `StatusBadge` | StatusBadge / Domain pages | All 5 modules | Medium | P1-1 resolved | ✅ **Done** | Part 4 |
| P1-7 | ~~`CitizenPortalHomePage` reimplements `Button` and `Card` surfaces locally — citizen portal diverges from the shared component API~~ | CitizenPortalHomePage | Citizen portal | Low | None | ✅ **Done — QW-11** | Part 4 |
| P1-8 | ~~`no_show` and `failed` status values absent from `StatusBadge`'s `STATUS_LABELS` map — fall back to raw string display~~ | StatusBadge | Appointments, Social Media | Low | None | ✅ **Done — QW-06** | Part 4 |
| P1-9 | ~~`framer-motion` and `react-hot-toast` are production dependencies with zero imports across `src/`~~ | Dependencies | Bundle size | Low | None | ✅ **Done — QW-07** (packages were never present) | Part 1, Part 4 |

#### 🟨 P2 — Structural Improvements

| # | Issue | Component Area | System Impact | Effort | Dependencies | Status | Source |
|---|-------|---------------|---------------|--------|--------------|--------|--------|
| P2-1 | No `Select`, `Textarea`, `Checkbox`, or `DateInput` primitives exist — all 7 domain forms use raw HTML elements for these controls | Form primitives | All 7 domain module forms | High | None | 🔴 **Open** | Part 4 |
| P2-2 | ~~Loading prop named inconsistently: `isLoading` (Button, ConfirmDialog), `loading` (Input), `isPending` (FormComponentProps / CrudPage)~~ | Button, Input, ConfirmDialog, CrudPage | Contributor experience | Low | None | ✅ **Done — QW-12** | Part 4 |
| P2-3 | `DashboardLayout.module.css` has 3 hardcoded `#fff` values for sidebar text on dark background | DashboardLayout | Layout token compliance | Low | `--color-neutral-0` exists | ✅ **Done** | Part 2, Part 4 |
| P2-4 | `DashboardPage` uses 4 raw `<button className="btn btn-*">` elements instead of the `Button` component | DashboardPage | Dashboard module | Low | None | ✅ **Done** | Part 4 |
| P2-5 | `CitizenDashboardPage` reimplements card surfaces with local CSS instead of using the shared `Card` component | Citizen portal pages | Citizen portal visual consistency | Low | P1-7 resolved | ✅ **Done** | Part 1, Part 4 |
| P2-6 | `EventsPage` and `SocialMediaPage` call `new Date().toLocaleString('pt-BR')` inline instead of the shared `formatDate` utility | EventsPage, SocialMediaPage | Date formatting consistency | Low | None | ✅ **Done** | Part 4 |
| P2-7 | ~~`ProtectedRoute` and `ProtectedCitizenRoute` use raw `<div className="spinner spinner-lg">` instead of the `Spinner` component — lacks `role="status"` and `aria-live="polite"`~~ | ProtectedRoute, ProtectedCitizenRoute | Route loading states | Low | None | ✅ **Done — QW-13** | Part 1, Part 3 |
| P2-8 | ~~`SessionTimeoutModal` and `ErrorBoundary` use raw `<button>` elements instead of the `Button` component~~ | SessionTimeoutModal, ErrorBoundary | Component API consistency | Low | None | ✅ **Done — QW-14** | Part 1 |
| P2-9 | `CitizenPortalLayout` static breadcrumb map covers only 2 of the citizen portal routes | CitizenPortalLayout | Citizen portal navigation | Low | None | ✅ **Done** | Part 3, Part 4 |
| P2-10 | `ConfirmDialog` confirm button is always labeled "Excluir" — not appropriate for non-delete confirmation flows | ConfirmDialog | All 7 domain delete flows | Low | None | ✅ **Done** | Part 1 |
| P2-11 | ~~`Spinner` `aria-label="Loading"` is English in a Portuguese application~~ | Spinner / LoadingScreen | Accessibility / i18n | Low | None | ✅ **Done — QW-15** | Part 1 |

#### 🟩 P3 — Enhancements & Optimization

| # | Issue | Component Area | System Impact | Effort | Dependencies | Source |
|---|-------|---------------|---------------|--------|--------------|--------|
| P3-1 | Breakpoints are hardcoded in `global.css` media queries — changing a breakpoint requires multi-file edits | Global CSS | Responsive design maintainability | Medium | None | ✅ **Done** | Part 2 |
| P3-2 | `DashboardLayout` sidebar collapse uses `window.innerWidth < 768` directly at render time — not reactive to CSS breakpoint changes; SSR-unsafe | DashboardLayout | Layout responsiveness | Low | None | ✅ **Done** | Part 3, Part 4 |
| P3-3 | `--font-family-mono` token is defined but not observed in use in any component | Token system | Token hygiene | Low | None | ✅ **Done** | Part 2 |
| P3-4 | Legacy `--color-gray-*` aliases (deprecated vSaaS boilerplate tokens) remain defined — should be formally deprecated and removed | Token system | Token system hygiene | Low | None | ✅ **Done** | Part 2 |
| P3-5 | `CitizenPortalPage.tsx` is a redirect shim re-exporting `CitizenRecordsPage` with no purpose — dead file | CitizenPortal domain | Codebase hygiene | Low | None | ✅ **Done** | Part 1, Part 4 |
| P3-6 | Dead link in `CitizenDashboardPage` to `/portal/appointments` — route does not exist | CitizenDashboardPage | Citizen portal UX | Low | None | ✅ **Done** | Part 1, Part 4 |
| P3-7 | `CrudPage` `getItems`/`getTotal` props use `(data: any)` casts at all 7 call sites — generic typing not enforced | CrudPage | Type safety | Medium | None | 🔴 **Open** | Part 3 |
| P3-8 | `DataTable` uses `T extends Record<string, any>` — weak generic constraint bypasses type safety for column rendering | DataTable | Type safety | Medium | None | 🔴 **Open** | Part 3 |
| P3-9 | `DashboardMockup.module.css` has 6 hardcoded status chip colors — low priority as it is landing page only | DashboardMockup | Token compliance (landing) | Low | None | ✅ **Done** | Part 2, Part 4 |
| P3-10 | `Breadcrumbs` uses `dangerouslySetInnerHTML` for JSON-LD injection — safe in current usage but worth monitoring | Breadcrumbs | Security hygiene | Low | None | ✅ **Done (reviewed — no change required)** | Part 3 |

---

### Secom-Specific Focus Answers

**Token bypass concentration:** Violations are concentrated in `StatusBadge` (cross-module, highest impact), `PasswordInput` (auth flows), and `Auth.module.css` (high-visibility pages). Layout modules (`DashboardLayout`, `DashboardPage`) have medium-severity `#fff` bypasses. Landing-only files (`DashboardMockup`, `LandingPage`, `ContactForm`) are low priority. (Part 2, Part 4)

**Form component API inconsistency:** The primary source is the absence of `Select`, `Textarea`, `Checkbox`, and `DateInput` primitives (P2-1) — this is what forces all 7 domain forms to use raw HTML. The `FormField` `aria-describedby` gap (P1-4) is the secondary issue. The loading prop naming inconsistency (P2-2) is a tertiary contributor. (Part 4)

**StatusBadge as token misalignment source:** Yes — `StatusBadge` is the single highest-impact token violation given its 10-module usage count. The yellow/blue hardcoded values (P1-1), the missing `no_show`/`failed` labels (P1-8), and the 5 independent `STATUS_COLORS` duplicates (P1-6) together make the status indicator pattern the primary source of design system incoherence. (Part 3, Part 4)

---

## 2. Technical Debt Assessment

### Debt Table

| Category | Description | Risk if Ignored | Effort Estimate | Priority | Status | Source |
|----------|-------------|-----------------|-----------------|----------|--------|--------|
| CSS token misalignment | ~~34 hardcoded hex values in 9 files bypassing `tokens/index.css`~~ All resolved. | Brand/theme changes require manual multi-file edits | 0 days remaining | — | ✅ **Fully resolved — QW-08, QW-09, QW-10, P2-3, P3-9** | Part 2, Part 4 |
| Accessibility implementation gaps | ~~Duplicate Modal IDs, disabled `aria-current`, missing `role="alert"` on login error, conflicting `aria-live`~~ Resolved. ~~`FormField` `aria-describedby` propagation~~ Resolved. | WCAG non-compliance in domain forms | 0 days remaining | P1 | ✅ **Resolved — QW-01–05, P1-4** | Part 3, Part 4 |
| Component bypass / API fragmentation | ~~`LoginForm`, `CitizenPortalHomePage`, `ProtectedRoute` bypass shared primitives~~ Resolved. Remaining: `DashboardPage` raw buttons, `CitizenDashboardPage` card surfaces | Manual updates required if Button/Card API changes | ~1 day remaining | P2 | ⚠️ **Partially resolved — QW-04, QW-11, QW-13, QW-14** | Part 4 |
| Status indicator duplication | ~~`no_show`/`failed` not in `StatusBadge`~~ Resolved. ~~`STATUS_COLORS` still independently defined in 5 domain pages~~ Resolved. | Adding a new status requires edits in 5+ files | 0 days | P1 | ✅ **Resolved — QW-06, P1-6** | Part 4 |
| Missing form primitives | No `Select`, `Textarea`, `Checkbox`, `DateInput` components — root cause of raw HTML usage in all 7 domain forms | Domain forms cannot adopt `Input`-level accessibility without these primitives | 8–12 days | P2 | 🔴 **Open** | Part 4 |
| Prop naming inconsistency | ~~`isLoading` vs `loading` vs `isPending` across Button, Input, ConfirmDialog, CrudPage~~ | — | — | — | ✅ **Resolved — QW-12** | Part 4 |
| Dead dependencies | ~~`framer-motion` and `react-hot-toast` in production bundle with zero imports~~ | — | — | — | ✅ **Resolved — QW-07** (were never present) | Part 4 |
| Naming / hygiene debt | ~~English `aria-label` on Spinner~~ Resolved. ~~`CitizenPortalPage.tsx` redirect shim~~ Deleted. ~~Dead `/portal/appointments` link~~ Removed. ~~`--font-family-mono` unused token~~ Documented. ~~Deprecated `--color-gray-*` aliases~~ Commented out. | Minor but accumulates | 0 days remaining | P3 | ✅ **Resolved — QW-15, P3-3, P3-4, P3-5, P3-6** | Part 1, Part 2, Part 4 |
| Documentation / testing gaps | 25 of 43 components have no test file; `CrudPage` now has tests; new tests added for Modal, StatusBadge, LoginForm | Refactoring risk increases without test coverage | 5–8 days | P2/P3 | ⚠️ **Partially improved** | Part 1 |
| Type safety debt | `CrudPage` `any` casts in `getItems`/`getTotal`; `DataTable` weak generic constraint | Runtime errors not caught at compile time | 3–5 days | P3 | 🔴 **Open** | Part 3 |

### Totals

| Item | Value |
|------|-------|
| Total estimated developer-days | 34–52 days |
| Confidence level | Medium — estimates assume no major API redesign; `Select`/`Textarea`/`Checkbox`/`DateInput` range is widest due to unknown styling complexity |
| Key assumption | Parallel work across phases by 3–5 engineers; token additions do not require design review cycles longer than 1 day |

---

## 3. Phased Roadmap

### Phase 1 — Stabilization (Weeks 1–2) ✅ COMPLETE

**Goal:** Eliminate all P0 issues and the highest-impact P1 issues. Unblock safe reuse of `Modal`, restore citizen portal accessibility, and remove dead production dependencies.

**Included issues:** P0-1, P0-2, P0-3, P0-4, P1-5, P1-8, P1-9

| Task | Issues | Effort | Status |
|------|--------|--------|--------|
| Fix `Modal` static IDs with `useId()` | P0-1 | 0.5 days | ✅ Done — QW-01 |
| Fix `CitizenPortalLayout` `aria-current` | P0-2 | 0.5 days | ✅ Done — QW-02 |
| Restore focus on `Modal` close | P0-3 | 0.5 days | ✅ Done — QW-03 |
| Migrate `LoginForm` to `Input` + `PasswordInput` + `role="alert"` | P0-4 | 1 day | ✅ Done — QW-04 |
| Resolve `Toast`/`ToastContainer` `aria-live` conflict | P1-5 | 0.5 days | ✅ Done — QW-05 |
| Add `no_show` and `failed` to `StatusBadge` `STATUS_LABELS` | P1-8 | 0.5 days | ✅ Done — QW-06 |
| Remove `framer-motion` and `react-hot-toast` | P1-9 | 0.5 days | ✅ Done — QW-07 |

**Effort estimate:** 4–5 developer-days
**Dependencies:** None — all Phase 1 items are self-contained
**Business/design impact:** Eliminates active WCAG regressions in the citizen portal and staff login. Reduces production bundle size. Unblocks safe nested modal usage (e.g., delete confirmation inside edit modal).

---

### Phase 2 — Standardization (Weeks 3–6) ⚠️ IN PROGRESS

**Goal:** Align token usage in high-impact shared components, centralise status color logic, close the component bypass pattern, and standardise prop naming.

**Included issues:** P1-1, P1-2, P1-3, P1-4, P1-6, P1-7, P2-2, P2-3, P2-4, P2-5, P2-6, P2-7, P2-8, P2-9, P2-10, P2-11

| Task | Issues | Effort | Status |
|------|--------|--------|--------|
| Add missing warning/info tokens; replace hardcoded hex in `StatusBadge` | P1-1 | 1 day | ✅ Done — QW-08 |
| Replace `PasswordInput` inline strength colors with CSS custom properties | P1-2 | 1 day | ✅ Done — QW-09 |
| Replace hardcoded values in `Auth.module.css` with semantic tokens | P1-3 | 0.5 days | ✅ Done — QW-10 |
| Inject `aria-describedby` from `FormField` onto child inputs | P1-4 | 2 days | ✅ Done |
| Centralise `STATUS_COLORS` into `src/utils/statusConfig.ts`; update 5 domain pages | P1-6 | 2 days | ✅ Done |
| Migrate `CitizenPortalHomePage` to `Button` and `Card` | P1-7 | 1 day | ✅ Done — QW-11 |
| Standardise loading prop naming to `isLoading` | P2-2 | 1 day | ✅ Done — QW-12 |
| Replace hardcoded `#fff` in `DashboardLayout.module.css` | P2-3 | 0.5 days | ✅ Done |
| Migrate `DashboardPage` raw buttons to `Button` component | P2-4 | 0.5 days | ✅ Done |
| Migrate `CitizenDashboardPage` card surfaces to `Card` component | P2-5 | 0.5 days | ✅ Done |
| Replace inline date formatting in `EventsPage`/`SocialMediaPage` | P2-6 | 0.5 days | ✅ Done |
| Replace raw spinner divs in `ProtectedRoute`/`ProtectedCitizenRoute` | P2-7 | 0.5 days | ✅ Done — QW-13 |
| Replace raw buttons in `SessionTimeoutModal` and `ErrorBoundary` | P2-8 | 0.5 days | ✅ Done — QW-14 |
| Expand `CitizenPortalLayout` breadcrumb map or replace with dynamic `Breadcrumbs` | P2-9 | 1 day | ✅ Done |
| Add `confirmLabel` prop to `ConfirmDialog` | P2-10 | 0.5 days | ✅ Done |
| Fix `Spinner` `aria-label` to Portuguese | P2-11 | 0.5 days | ✅ Done — QW-15 |

**Remaining effort:** ~7–8 developer-days (8 tasks complete, 7 open)
**Dependencies:** Phase 1 complete ✅; P1-1 token additions complete ✅ (P1-6 centralisation now unblocked)
**Business/design impact:** Achieves token compliance in all shared components. Eliminates the 5-file `STATUS_COLORS` duplication. Closes the citizen portal component bypass. Standardises the contributor API surface.

---

### Phase 3 — Hardening & Scalability (Weeks 7–10)

**Goal:** Add the missing form primitives that are the root cause of raw HTML usage across all 7 domain forms. Improve type safety in core abstractions.

**Included issues:** P2-1, P3-7, P3-8

| Task | Issues | Effort |
|------|--------|--------|
| Build `Select` primitive with `forwardRef`, `aria-describedby`, token-based styling | P2-1 | 2–3 days |
| Build `Textarea` primitive | P2-1 | 1–2 days |
| Build `Checkbox` primitive | P2-1 | 1–2 days |
| Build `DateInput` primitive | P2-1 | 2–3 days |
| Tighten `CrudPage` generic typing; remove `any` casts in `getItems`/`getTotal` | P3-7 | 2 days |
| Tighten `DataTable` generic constraint | P3-8 | 1 day |

**Effort estimate:** 9–13 developer-days
**Dependencies:** Phase 2 complete (token system and `FormField` `aria-describedby` fix should be in place before new primitives are built)
**Business/design impact:** Eliminates the root cause of raw HTML in domain forms. New primitives can be adopted incrementally per module. Type safety improvements reduce regression risk when modifying `CrudPage`.

---

### Phase 4 — Design System Maturity (Weeks 11–14)

**Goal:** Governance, hygiene, and long-term scalability. Deprecate legacy tokens, remove dead code, and establish API governance patterns.

**Included issues:** P3-1, P3-2, P3-3, P3-4, P3-5, P3-6, P3-9, P3-10

| Task | Issues | Effort |
|------|--------|--------|
| Tokenize breakpoints or document the current values as a reference table | P3-1 | 1–2 days | ✅ Done |
| Replace `window.innerWidth` in `DashboardLayout` with `matchMedia` | P3-2 | 0.5 days | ✅ Done |
| Audit and remove or use `--font-family-mono` token | P3-3 | 0.5 days | ✅ Done |
| Formally deprecate and remove `--color-gray-*` aliases | P3-4 | 1 day | ✅ Done |
| Delete `CitizenPortalPage.tsx` redirect shim | P3-5 | 0.5 days | ✅ Done |
| Fix or remove dead `/portal/appointments` link | P3-6 | 0.5 days | ✅ Done |
| Replace hardcoded hex in `DashboardMockup.module.css` | P3-9 | 0.5 days | ✅ Done |
| Review `Breadcrumbs` `dangerouslySetInnerHTML` usage | P3-10 | 0.5 days | ✅ Done (reviewed — no change required) |

**Effort estimate:** 5–6 developer-days
**Dependencies:** Phases 1–3 complete
**Business/design impact:** Establishes a clean, governed token system with no deprecated aliases. Removes dead code that misleads contributors. Positions the library for dark mode or multi-tenant theming without legacy interference.

---

## 4. KPIs & Success Metrics

| Metric | Baseline | Current State | Target | Measurement |
|--------|----------|--------------|--------|-------------|
| Token compliance — CSS Modules using `var()` exclusively | ~82% (34 hardcoded values in 9 files) | ~96% (shared components clean; `DashboardLayout`, `DashboardMockup` remain) | 100% | Static CSS audit; grep for hex literals in `*.module.css` and `*.tsx` inline styles |
| Component bypass ratio — shared primitives used vs bypassed | ~70% | ~88% (`LoginForm`, `CitizenPortalHomePage`, `ProtectedRoute`, `SessionTimeoutModal`, `ErrorBoundary` resolved; `DashboardPage` open) | ≥ 95% | Import tracing across `src/` |
| `STATUS_COLORS` duplication | 5 independent definitions | 1 centralised `statusConfig.ts` ✅ | 1 centralised `statusConfig.ts` | File count |
| Missing form primitives | 4 missing (`Select`, `Textarea`, `Checkbox`, `DateInput`) | 4 missing | 0 missing | Component inventory |
| Accessibility — P0 issues resolved | 4 open P0 issues | 0 open P0 issues | 0 | Accessibility audit |
| `aria-describedby` propagation in domain forms | 0 of 7 domain forms | 7 of 7 domain forms ✅ | 7 of 7 | Manual audit of form error association |
| Dead production dependencies | 2 (`framer-motion`, `react-hot-toast`) | 0 (were never present) | 0 | `package.json` audit |
| Loading prop naming consistency | 3 different names (`isLoading`, `loading`, `isPending`) | 1 (`isLoading`) | 1 (`isLoading`) | Prop interface audit |
| Components with test coverage | 18 of 43 (42%) | ~22 of 43 (~51%) — Modal, StatusBadge, LoginForm tests updated/added | ≥ 80% of UI/Shared components | Test file inventory |

---

## 5. Component Library Maturity Score

**Score: 74 / 100** *(up from 61 — 15 Quick Wins completed)*

| Dimension | Baseline | Current | Notes |
|-----------|----------|---------|-------|
| API consistency | 11/20 | 15/20 | Loading prop naming unified (`isLoading` everywhere); `Button`/`Spinner`/`Card` bypass sites closed; missing form primitives remain |
| Reusability across Secom modules | 14/20 | 16/20 | `LoginForm`, `CitizenPortalHomePage`, `ProtectedRoute`, `SessionTimeoutModal`, `ErrorBoundary` now use shared primitives; `DashboardPage` and `CitizenDashboardPage` still open |
| CSS token adoption discipline | 12/20 | 18/20 | `StatusBadge`, `PasswordInput`, `Auth.module.css` fully tokenised; `DashboardLayout` and `DashboardMockup` are the only remaining violations |
| Accessibility integration | 8/20 | 14/20 | All P0 regressions resolved (`Modal` IDs, focus restore, `aria-current`, `LoginForm`); `Toast` live region conflict fixed; `Spinner` label localised; `FormField` `aria-describedby` gap remains |
| Documentation completeness | 6/10 | 7/10 | Test coverage improved for Modal, StatusBadge, LoginForm, CrudPage; ~22 of 43 components now have tests |
| Standardization discipline | 5/10 | 7/10 | `STATUS_COLORS` centralisation still pending; form primitive gap still open; component bypass pattern significantly reduced |
| Variant management | 3/5 | 3/5 | No change; `ConfirmDialog` hardcoded label still open |
| Governance clarity | 2/5 | 2/5 | No change; legacy `--color-gray-*` aliases and deprecation strategy still pending |

**Current maturity stage: Emerging → Structured** *(advancing)*

The library has made significant progress toward Structured. The P0 accessibility regressions are resolved, the token system is now compliant in all shared components, and the contributor API surface is more consistent. The remaining blockers to reaching Structured are:

1. **`FormField` `aria-describedby` gap (P1-4)** — domain forms still do not programmatically associate error messages with their inputs.
2. **`STATUS_COLORS` centralisation (P1-6)** — 5 domain pages still maintain independent color maps that duplicate `StatusBadge` logic.
3. **Missing form primitives (P2-1)** — `Select`, `Textarea`, `Checkbox`, `DateInput` are the root cause of raw HTML usage across all 7 domain forms.

Completing the remaining Phase 2 tasks (P1-4, P1-6, P2-3 through P2-10) would advance the library to **Structured**. Completing Phase 3 (form primitives, type safety) would position it at the boundary of **Design-System-Driven**.
