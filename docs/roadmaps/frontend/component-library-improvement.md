# Component Library Improvement Roadmap
## Secom — Secretaria de Comunicação

> **Source documents:** component-library-part-1.md, part-2.md, part-3.md, part-4.md
> All findings are grounded exclusively in those documents. No external assumptions.

---

## 7. Executive Summary

**Overall Component Library Health Score: 61 / 100**

### Key Strengths

1. **Comprehensive token foundation.** 200+ CSS custom properties covering color, spacing, typography, shadows, and z-index provide a solid base for design system coherence. Semantic aliases (`--radius-button`, `--shadow-modal`) make intent explicit. (Part 2)
2. **`CrudPage` generic abstraction.** A single 257-LOC component eliminates ~80% of CRUD boilerplate across all 7 domain modules, enforcing a uniform list/create/edit/delete workflow with consistent modal, form, and pagination patterns. (Part 1, Part 3)
3. **Uniform domain form pattern.** All 7 domain forms consistently use `.form-stack`, `.form-grid`, `.form-section`, and `FormField` wrappers — the most uniformly applied pattern in the codebase. (Part 1, Part 4)

### Major Risks

1. **Token bypass in high-visibility components.** 34 hardcoded hex values across 9 files — concentrated in `StatusBadge` (10 usages across all modules) and `PasswordInput` (auth flows) — mean a brand or theme change requires manual grep-and-replace rather than a single token update. (Part 2, Part 4)
2. **Critical accessibility regressions in core components.** `Modal` has duplicate static IDs breaking ARIA with multiple simultaneous dialogs; `CitizenPortalLayout` explicitly disables `aria-current` on active nav links; `FormField` does not propagate `aria-describedby` to child inputs across all 7 domain forms. (Part 3, Part 4)
3. **Component bypass fragmentation.** `LoginForm` — the primary staff authentication entry point — uses raw `<input>` elements instead of `Input`/`PasswordInput`. `CitizenPortalHomePage` reimplements `Button` and `Card` locally. Five domain pages maintain independent `STATUS_COLORS` constants that duplicate `StatusBadge` logic. (Part 4)

### Estimated Investment

| Item | Value |
|------|-------|
| Total developer-days | 38–52 days |
| Timeline | 14 weeks (4 phases, 2-week sprints) |
| Team assumption | 3–5 frontend engineers, parallel work allowed |

**Risk if delayed:** Token bypass debt compounds with every new component added. Accessibility regressions in `Modal` and `CitizenPortalLayout` are already present in production. The `LoginForm` bypass means the most-visited form in the application has lower accessibility than the citizen-facing equivalent it was supposed to supersede.

**Recommendation: Moderate design system refactor required.**
The foundation is sound. The token system, `CrudPage` abstraction, and form utility pattern are well-designed. The required work is targeted: fix critical accessibility bugs, close the token compliance gap in shared components, and add the missing form primitives that are causing the `Input` bypass pattern across all 7 modules.

---

## 1. Prioritized Component Issues

### 1.1 Issue Inventory

#### 🟥 P0 — Design System Instability / Breaking Inconsistency

| # | Issue | Component Area | System Impact | Effort | Dependencies | Source |
|---|-------|---------------|---------------|--------|--------------|--------|
| P0-1 | `Modal` uses static `id="modal-title"` and `id="modal-desc"` — multiple simultaneous modals produce duplicate IDs, breaking all ARIA associations (`aria-labelledby`, `aria-describedby`) | Modal | All 14 modal usages; `CrudPage` + `ConfirmDialog` nested flows | Low | None | Part 1, Part 3 |
| P0-2 | `CitizenPortalLayout` explicitly sets `aria-current={undefined}` on active NavLinks — screen readers receive no active page indication in the citizen portal | CitizenPortalLayout | Citizen portal navigation (all citizen roles) | Low | None | Part 1, Part 3, Part 4 |
| P0-3 | `Modal` does not restore focus to the trigger element on close — keyboard and AT users lose their position in the document | Modal | All 14 modal usages | Low | None | Part 3, Part 4 |
| P0-4 | `LoginForm` bypasses `Input` and `PasswordInput`, using raw `<input>` elements with no `role="alert"` on error — the primary staff auth entry point has lower accessibility than the citizen login it mirrors | LoginForm | Staff authentication flow | Low | None | Part 1, Part 3, Part 4 |

#### 🟧 P1 — High Maintainability / Consistency Risks

| # | Issue | Component Area | System Impact | Effort | Dependencies | Source |
|---|-------|---------------|---------------|--------|--------------|--------|
| P1-1 | `StatusBadge` yellow and blue variants use 4 hardcoded hex values (`#92400e`, `#d97706`, `#1e40af`, `#3b82f6`) — the most impactful token bypass given 10 usages across all 7 modules | StatusBadge | All modules displaying status (press releases, appointments, events, social media) | Low | Token gap: `--color-warning-700` exists but `#92400e` has no exact match; token must be added | Part 2, Part 3, Part 4 |
| P1-2 | `PasswordInput` strength indicator uses 4 hardcoded inline hex values (`#e74c3c`, `#f39c12`, `#2ecc71`, `#27ae60`) applied via `style` attribute — cannot be overridden via CSS | PasswordInput | Auth flows (register, password change) | Low | New tokens required: `--color-strength-weak`, `--color-strength-fair`, `--color-strength-good`, `--color-strength-strong` | Part 2, Part 3, Part 4 |
| P1-3 | `Auth.module.css` contains 7 hardcoded hex values for `.errorBanner`, `.infoBanner`, `.successBanner` backgrounds — high-visibility auth pages bypass semantic tokens | Auth pages | Staff login, citizen login, register | Low | Semantic tokens exist (`--color-error-light`, `--color-info-light`, `--color-success-light`) | Part 2, Part 4 |
| P1-4 | `FormField` does not inject `aria-describedby` onto child inputs — error messages rendered by `FormField` are not programmatically associated with their inputs across all 7 domain forms | FormField | All 7 domain module forms (~30 usages) | Medium | None | Part 3, Part 4 |
| P1-5 | `ToastContainer` has `aria-live="polite"` while individual `Toast` components have `aria-live="assertive"` — conflicting live region semantics cause unpredictable screen reader announcement behaviour | Toast / ToastContainer | All 12 toast usages across modules | Low | None | Part 3, Part 4 |
| P1-6 | `STATUS_COLORS` constant is independently defined in 5 domain page files (`DashboardPage`, `PressReleasesPage`, `EventsPage`, `AppointmentsPage`, `SocialMediaPage`) — color logic is duplicated outside `StatusBadge` | StatusBadge / Domain pages | All 5 modules; `no_show` and `failed` statuses fall back to raw string display | Medium | P1-1 (token alignment in StatusBadge should precede centralisation) | Part 4 |
| P1-7 | `CitizenPortalHomePage` reimplements `Button` (local `styles.btnPrimary`, `styles.btnOutline`) and `Card` surfaces locally — citizen portal diverges from the shared component API | CitizenPortalHomePage | Citizen portal | Low | None | Part 4 |
| P1-8 | `no_show` and `failed` status values are used in `AppointmentsPage` and `SocialMediaPage` but are absent from `StatusBadge`'s `STATUS_LABELS` map — they fall back to raw string display | StatusBadge | Appointments module, Social Media module | Low | None | Part 4 |
| P1-9 | `framer-motion` and `react-hot-toast` are production dependencies with zero imports across `src/` — dead bundle weight | Dependencies | Bundle size | Low | None | Part 1, Part 4 |

#### 🟨 P2 — Structural Improvements

| # | Issue | Component Area | System Impact | Effort | Dependencies | Source |
|---|-------|---------------|---------------|--------|--------------|--------|
| P2-1 | No `Select`, `Textarea`, `Checkbox`, or `DateInput` primitives exist — all 7 domain forms use raw HTML elements for these controls, which is the root cause of the `Input` bypass pattern | Form primitives | All 7 domain module forms | High | None | Part 4 |
| P2-2 | Loading prop is named inconsistently: `isLoading` (Button, ConfirmDialog), `loading` (Input), `isPending` (FormComponentProps / CrudPage contract) | Button, Input, ConfirmDialog, CrudPage | Contributor experience; API predictability | Low | None | Part 4 |
| P2-3 | `DashboardLayout.module.css` has 3 hardcoded `#fff` values for sidebar text on dark background | DashboardLayout | Layout token compliance | Low | `--color-neutral-0` exists | Part 2, Part 4 |
| P2-4 | `DashboardPage` uses 4 raw `<button className="btn btn-*">` elements instead of the `Button` component — API fragmentation risk if `.btn` class API changes | DashboardPage | Dashboard module | Low | None | Part 4 |
| P2-5 | `CitizenDashboardPage` and `CitizenPortalHomePage` reimplement card surfaces with local CSS instead of using the shared `Card` component | Citizen portal pages | Citizen portal visual consistency | Low | P1-7 | Part 1, Part 4 |
| P2-6 | `EventsPage` and `SocialMediaPage` call `new Date().toLocaleString('pt-BR')` inline instead of the shared `formatDate` utility — locale handling divergence | EventsPage, SocialMediaPage | Date formatting consistency | Low | None | Part 4 |
| P2-7 | `ProtectedRoute` and `ProtectedCitizenRoute` use raw `<div className="spinner spinner-lg">` instead of the `Spinner` component — the raw div lacks `role="status"` and `aria-live="polite"` | ProtectedRoute, ProtectedCitizenRoute | Route loading states | Low | None | Part 1, Part 3 |
| P2-8 | `SessionTimeoutModal` and `ErrorBoundary` use raw `<button>` elements instead of the `Button` component | SessionTimeoutModal, ErrorBoundary | Component API consistency | Low | None | Part 1 |
| P2-9 | `CitizenPortalLayout` static breadcrumb map covers only 2 of the citizen portal routes — other routes show no breadcrumb | CitizenPortalLayout | Citizen portal navigation | Low | None | Part 3, Part 4 |
| P2-10 | `ConfirmDialog` confirm button is always labeled "Excluir" — not appropriate for non-delete confirmation flows | ConfirmDialog | All 7 domain delete flows | Low | None | Part 1 |
| P2-11 | `Spinner` `aria-label="Loading"` is English in a Portuguese application | Spinner / LoadingScreen | Accessibility / i18n | Low | None | Part 1 |

#### 🟩 P3 — Enhancements & Optimization

| # | Issue | Component Area | System Impact | Effort | Dependencies | Source |
|---|-------|---------------|---------------|--------|--------------|--------|
| P3-1 | Breakpoints are hardcoded in `global.css` media queries — changing a breakpoint requires multi-file edits | Global CSS | Responsive design maintainability | Medium | None | Part 2 |
| P3-2 | `DashboardLayout` sidebar collapse uses `window.innerWidth < 768` directly at render time — not reactive to CSS breakpoint changes; SSR-unsafe | DashboardLayout | Layout responsiveness | Low | None | Part 3, Part 4 |
| P3-3 | `--font-family-mono` token is defined but not observed in use in any component | Token system | Token hygiene | Low | None | Part 2 |
| P3-4 | Legacy `--color-gray-*` aliases (deprecated vSaaS boilerplate tokens) remain defined — should be formally deprecated and removed | Token system | Token system hygiene | Low | None | Part 2 |
| P3-5 | `CitizenPortalPage.tsx` is a redirect shim re-exporting `CitizenRecordsPage` with no purpose — dead file | CitizenPortal domain | Codebase hygiene | Low | None | Part 1, Part 4 |
| P3-6 | Dead link in `CitizenDashboardPage` to `/portal/appointments` — route does not exist | CitizenDashboardPage | Citizen portal UX | Low | None | Part 1, Part 4 |
| P3-7 | `CrudPage` `getItems`/`getTotal` props use `(data: any)` casts at all 7 call sites — generic typing not enforced | CrudPage | Type safety | Medium | None | Part 3 |
| P3-8 | `DataTable` uses `T extends Record<string, any>` — weak generic constraint bypasses type safety for column rendering | DataTable | Type safety | Medium | None | Part 3 |
| P3-9 | `DashboardMockup.module.css` has 6 hardcoded status chip colors — low priority as it is landing page only | DashboardMockup | Token compliance (landing) | Low | None | Part 2, Part 4 |
| P3-10 | `Breadcrumbs` uses `dangerouslySetInnerHTML` for JSON-LD injection — safe in current usage but worth monitoring | Breadcrumbs | Security hygiene | Low | None | Part 3 |

---

### Secom-Specific Focus Answers

**Token bypass concentration:** Violations are concentrated in `StatusBadge` (cross-module, highest impact), `PasswordInput` (auth flows), and `Auth.module.css` (high-visibility pages). Layout modules (`DashboardLayout`, `DashboardPage`) have medium-severity `#fff` bypasses. Landing-only files (`DashboardMockup`, `LandingPage`, `ContactForm`) are low priority. (Part 2, Part 4)

**Form component API inconsistency:** The primary source is the absence of `Select`, `Textarea`, `Checkbox`, and `DateInput` primitives (P2-1) — this is what forces all 7 domain forms to use raw HTML. The `FormField` `aria-describedby` gap (P1-4) is the secondary issue. The loading prop naming inconsistency (P2-2) is a tertiary contributor. (Part 4)

**StatusBadge as token misalignment source:** Yes — `StatusBadge` is the single highest-impact token violation given its 10-module usage count. The yellow/blue hardcoded values (P1-1), the missing `no_show`/`failed` labels (P1-8), and the 5 independent `STATUS_COLORS` duplicates (P1-6) together make the status indicator pattern the primary source of design system incoherence. (Part 3, Part 4)

---

## 2. Technical Debt Assessment

### Debt Table

| Category | Description | Risk if Ignored | Effort Estimate | Priority | Source |
|----------|-------------|-----------------|-----------------|----------|--------|
| CSS token misalignment | 34 hardcoded hex values in 9 files bypassing `tokens/index.css`; concentrated in `StatusBadge`, `PasswordInput`, `Auth.module.css` | Brand/theme changes require manual multi-file edits; visual inconsistency compounds with each new component | 4–6 days | P0/P1 | Part 2, Part 4 |
| Accessibility implementation gaps | Duplicate Modal IDs, disabled `aria-current`, missing `aria-describedby` propagation, conflicting `aria-live`, missing `role="alert"` on login error | WCAG non-compliance; screen reader users cannot navigate citizen portal or receive form error feedback | 5–8 days | P0/P1 | Part 3, Part 4 |
| Component bypass / API fragmentation | `LoginForm`, `CitizenPortalHomePage`, `DashboardPage`, `ProtectedRoute` bypass shared primitives; `.btn` class used directly in 5+ locations | If `Button` or `.btn` API changes, all bypass sites must be updated manually; no single source of truth | 3–5 days | P1/P2 | Part 4 |
| Status indicator duplication | `STATUS_COLORS` defined independently in 5 domain pages; `no_show`/`failed` not in `StatusBadge` | Adding a new status requires edits in 5+ files; inconsistent color rendering across modules | 3–4 days | P1 | Part 4 |
| Missing form primitives | No `Select`, `Textarea`, `Checkbox`, `DateInput` components — root cause of raw HTML usage in all 7 domain forms | Domain forms cannot adopt `Input`-level accessibility and styling without these primitives; debt grows with each new form field | 8–12 days | P2 | Part 4 |
| Prop naming inconsistency | `isLoading` vs `loading` vs `isPending` across Button, Input, ConfirmDialog, CrudPage | Contributor confusion; incorrect prop passed silently (boolean props default to `false`, no runtime error) | 1–2 days | P2 | Part 4 |
| Dead dependencies | `framer-motion` and `react-hot-toast` in production bundle with zero imports | Unnecessary bundle weight; security surface for unmonitored packages | 0.5 days | P1 | Part 4 |
| Naming / hygiene debt | `CitizenPortalPage.tsx` redirect shim; dead `/portal/appointments` link; English `aria-label` on Spinner; `--font-family-mono` unused token; deprecated `--color-gray-*` aliases | Minor but accumulates; dead code misleads contributors | 1–2 days | P3 | Part 1, Part 2, Part 4 |
| Documentation / testing gaps | 25 of 43 components have no test file; `CrudPage` (257 LOC, 7 usages) has no documented test coverage noted | Refactoring risk increases without test coverage on the most-used abstraction | 5–8 days | P2/P3 | Part 1 |
| Type safety debt | `CrudPage` `any` casts in `getItems`/`getTotal`; `DataTable` `T extends Record<string, any>` weak constraint | Runtime errors not caught at compile time; refactoring `CrudPage` props is unsafe without type enforcement | 3–5 days | P3 | Part 3 |

### Totals

| Item | Value |
|------|-------|
| Total estimated developer-days | 34–52 days |
| Confidence level | Medium — estimates assume no major API redesign; `Select`/`Textarea`/`Checkbox`/`DateInput` range is widest due to unknown styling complexity |
| Key assumption | Parallel work across phases by 3–5 engineers; token additions do not require design review cycles longer than 1 day |

---

## 3. Phased Roadmap

### Phase 1 — Stabilization (Weeks 1–2)

**Goal:** Eliminate all P0 issues and the highest-impact P1 issues. Unblock safe reuse of `Modal`, restore citizen portal accessibility, and remove dead production dependencies.

**Included issues:** P0-1, P0-2, P0-3, P0-4, P1-5, P1-8, P1-9

| Task | Issues | Effort |
|------|--------|--------|
| Fix `Modal` static IDs with `useId()` | P0-1 | 0.5 days |
| Fix `CitizenPortalLayout` `aria-current` | P0-2 | 0.5 days |
| Restore focus on `Modal` close | P0-3 | 0.5 days |
| Migrate `LoginForm` to `Input` + `PasswordInput` + `role="alert"` | P0-4 | 1 day |
| Resolve `Toast`/`ToastContainer` `aria-live` conflict | P1-5 | 0.5 days |
| Add `no_show` and `failed` to `StatusBadge` `STATUS_LABELS` | P1-8 | 0.5 days |
| Remove `framer-motion` and `react-hot-toast` | P1-9 | 0.5 days |

**Effort estimate:** 4–5 developer-days
**Dependencies:** None — all Phase 1 items are self-contained
**Business/design impact:** Eliminates active WCAG regressions in the citizen portal and staff login. Reduces production bundle size. Unblocks safe nested modal usage (e.g., delete confirmation inside edit modal).

---

### Phase 2 — Standardization (Weeks 3–6)

**Goal:** Align token usage in high-impact shared components, centralise status color logic, close the component bypass pattern, and standardise prop naming.

**Included issues:** P1-1, P1-2, P1-3, P1-4, P1-6, P1-7, P2-2, P2-3, P2-4, P2-5, P2-6, P2-7, P2-8, P2-9, P2-10, P2-11

| Task | Issues | Effort |
|------|--------|--------|
| Add missing warning/strength tokens; replace hardcoded hex in `StatusBadge` | P1-1 | 1 day |
| Replace `PasswordInput` inline strength colors with CSS custom properties | P1-2 | 1 day |
| Replace hardcoded values in `Auth.module.css` with semantic tokens | P1-3 | 0.5 days |
| Inject `aria-describedby` from `FormField` onto child inputs | P1-4 | 2 days |
| Centralise `STATUS_COLORS` into `src/utils/statusConfig.ts`; update 5 domain pages | P1-6 | 2 days |
| Migrate `CitizenPortalHomePage` to `Button` and `Card` | P1-7 | 1 day |
| Standardise loading prop naming to `isLoading` across Button, Input, ConfirmDialog, CrudPage | P2-2 | 1 day |
| Replace hardcoded `#fff` in `DashboardLayout.module.css` | P2-3 | 0.5 days |
| Migrate `DashboardPage` raw buttons to `Button` component | P2-4 | 0.5 days |
| Migrate citizen portal card surfaces to `Card` component | P2-5 | 0.5 days |
| Replace inline date formatting in `EventsPage`/`SocialMediaPage` | P2-6 | 0.5 days |
| Replace raw spinner divs in `ProtectedRoute`/`ProtectedCitizenRoute` with `Spinner` | P2-7 | 0.5 days |
| Replace raw buttons in `SessionTimeoutModal` and `ErrorBoundary` | P2-8 | 0.5 days |
| Expand `CitizenPortalLayout` breadcrumb map or replace with dynamic `Breadcrumbs` | P2-9 | 1 day |
| Add `confirmLabel` prop to `ConfirmDialog` | P2-10 | 0.5 days |
| Fix `Spinner` `aria-label` to Portuguese | P2-11 | 0.5 days |

**Effort estimate:** 13–16 developer-days (parallelisable across 3–5 engineers)
**Dependencies:** Phase 1 complete (P1-1 token additions should precede P1-6 centralisation)
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
| Tokenize breakpoints or document the current values as a reference table | P3-1 | 1–2 days |
| Replace `window.innerWidth` in `DashboardLayout` with `matchMedia` | P3-2 | 0.5 days |
| Audit and remove or use `--font-family-mono` token | P3-3 | 0.5 days |
| Formally deprecate and remove `--color-gray-*` aliases | P3-4 | 1 day |
| Delete `CitizenPortalPage.tsx` redirect shim | P3-5 | 0.5 days |
| Fix or remove dead `/portal/appointments` link | P3-6 | 0.5 days |
| Replace hardcoded hex in `DashboardMockup.module.css` | P3-9 | 0.5 days |
| Review `Breadcrumbs` `dangerouslySetInnerHTML` usage | P3-10 | 0.5 days |

**Effort estimate:** 5–6 developer-days
**Dependencies:** Phases 1–3 complete
**Business/design impact:** Establishes a clean, governed token system with no deprecated aliases. Removes dead code that misleads contributors. Positions the library for dark mode or multi-tenant theming without legacy interference.

---

## 4. KPIs & Success Metrics

| Metric | Current State | Target | Measurement |
|--------|--------------|--------|-------------|
| Token compliance — CSS Modules using `var()` exclusively | ~82% (34 hardcoded values in 9 files) | 100% | Static CSS audit; grep for hex literals in `*.module.css` and `*.tsx` inline styles |
| Component bypass ratio — shared primitives used vs bypassed | ~70% (Button bypassed in 5+ locations, Input bypassed in all domain forms) | ≥ 95% | Import tracing across `src/` |
| `STATUS_COLORS` duplication | 5 independent definitions | 1 centralised `statusConfig.ts` | File count |
| Missing form primitives | 4 missing (`Select`, `Textarea`, `Checkbox`, `DateInput`) | 0 missing | Component inventory |
| Accessibility — P0 issues resolved | 3 open P0 issues | 0 | Accessibility audit against Part 4 §5.5 |
| `aria-describedby` propagation in domain forms | 0 of 7 domain forms | 7 of 7 | Manual audit of form error association |
| Dead production dependencies | 2 (`framer-motion`, `react-hot-toast`) | 0 | `package.json` audit |
| Loading prop naming consistency | 3 different names (`isLoading`, `loading`, `isPending`) | 1 (`isLoading`) | Prop interface audit |
| Components with test coverage | 18 of 43 (42%) | ≥ 80% of UI/Shared components | Test file inventory |

---

## 5. Component Library Maturity Score

**Score: 61 / 100**

| Dimension | Score | Notes |
|-----------|-------|-------|
| API consistency | 11/20 | Token system and form utility pattern are strong; loading prop naming, component bypass, and missing primitives reduce score |
| Reusability across Secom modules | 14/20 | `CrudPage` and `StatusBadge` are exemplary; `Input` underused; citizen portal reimplements primitives |
| CSS token adoption discipline | 12/20 | Core UI components are compliant; `StatusBadge`, `PasswordInput`, `Auth.module.css` are significant violations |
| Accessibility integration | 8/20 | Good in `Button`, `Input`, `DataTable`, `Skeleton`; critical regressions in `Modal`, `CitizenPortalLayout`, `FormField`, `LoginForm` |
| Documentation completeness | 6/10 | 4-part audit is thorough; 25 of 43 components lack test files |
| Standardization discipline | 5/10 | Form workflow pattern is exemplary; status color duplication and component bypass patterns undermine overall score |
| Variant management | 3/5 | Button (7 variants) and Input (3 variants × 3 sizes) are well-managed; `ConfirmDialog` hardcoded label is a minor gap |
| Governance clarity | 2/5 | No formal deprecation strategy; legacy `--color-gray-*` aliases undocumented as deprecated; no prop naming convention enforced |

**Current maturity stage: Emerging → Structured**

The library has crossed from Ad-hoc into Emerging through the token system, `CrudPage` abstraction, and consistent form utility pattern. It is at the threshold of Structured but is blocked by:

1. Token compliance violations in shared components (`StatusBadge`, `PasswordInput`) that undermine the token system's value proposition.
2. Missing form primitives that prevent the component library from covering the full range of domain form controls.
3. Unresolved accessibility regressions in `Modal` and `CitizenPortalLayout` that prevent the library from being described as accessibility-compliant.
4. Absence of a formal prop naming convention and deprecation strategy.

Completing Phases 1–2 would advance the library to **Structured**. Completing Phase 3 would position it at the boundary of **Design-System-Driven**.
