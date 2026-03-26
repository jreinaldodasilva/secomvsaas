# Secom Frontend — UX, Accessibility & Visual Design Improvement Roadmap

> **Source documents:** `ux-accessibility-part-1.md` through `ux-accessibility-part-4.md`
> **Analysis method:** Static code analysis of the Secom frontend source tree.
> All findings are grounded in the audit documents. No speculative debt is introduced.
> Issue IDs match the recommendation codes from Part 4 (C1–C4, H1–H8, M1–M9, L1–L6).

---

## Table of Contents

1. [Issue Extraction & Prioritization](#1-issue-extraction--prioritization)
2. [Accessibility & Visual Debt Assessment](#2-accessibility--visual-debt-assessment)
3. [Phased Implementation Roadmap](#3-phased-implementation-roadmap)
4. [Success Metrics & Baseline](#4-success-metrics--baseline)
5. [UX & Accessibility Maturity Score](#5-ux--accessibility-maturity-score)
6. [Executive Summary](#6-executive-summary)

---

## 1. Issue Extraction & Prioritization

### Priority Tier Summary

| Priority | Count | Description |
|---|---|---|
| 🟥 P0 | 4 | Blocks usage, violates WCAG 2.1 AA, or creates compliance risk |
| 🟧 P1 | 8 | Strong UX degradation, visual credibility issue, or significant usability barrier |
| 🟨 P2 | 9 | UX friction, consistency gap, or visual modernity issue |
| 🟩 P3 | 6 | Polish, optimization, or enhancement opportunity |
| **Total** | **27** | |

### Most Affected Modules

| Module | Issues | Priority |
|---|---|---|
| All 7 domain modules (via Modal + FormField) | C1, C2, C3, C4 | P0 |
| Appointments | H3, M1 | P1, P2 |
| Social Media | H3, M1 | P1, P2 |
| Press Releases | M3 | P2 |
| Citizen Portal | H1, H5, M2, M6, L2, L3, L5 | P1–P3 |
| Staff Dashboard (all roles) | H4, H6, H7, M4, M7, M8, M9 | P1–P2 |

### Most Affected User Roles

| Role Group | Issues | Notes |
|---|---|---|
| **Citizen** (public-facing) | C1–C4, H1, H5, M2, M6, L2, L3, L5 | Highest priority due to public accessibility obligations |
| **Assessor / Admin** | C1–C4, H3, H4, M3, M4 | Approval workflow and form accessibility |
| **Atendente** | C1–C4, H2, H3, M1 | Appointments module and data entry on mobile |
| **Social Media** | C1–C4, H3 | StatusBadge raw enum display |
| **All staff** | H6, H7, H8, M7, M8, M9 | Cross-cutting infrastructure issues |

### Issues Blocking WCAG 2.1 AA Compliance

C1, C2, C3, C4, H1, H2, H4, H7, M8

### Issues Blocking Visual Modernization Goals

H3, H5, H6, M4, M6, M9, L4

---

### 🟥 P0 — Blocks Usage or Violates WCAG 2.1 AA

| # | Issue | Source Section | UX/Accessibility Impact | Users Affected | Effort | Dependencies | Source Part |
|---|---|---|---|---|---|---|---|
| C1 | Modal uses static `id="modal-title"` — duplicate IDs when form modal and ConfirmDialog are open simultaneously, breaking `aria-labelledby` associations | Part 2 §5.2 / Part 4 §10.2 | Screen readers announce incorrect modal title; ARIA associations are broken across all 7 domain module workflows | All roles using any domain form | Low | None | Part 2, Part 4 |
| C2 | `FormField` does not inject `aria-describedby` onto child inputs — error messages are not programmatically associated with fields | Part 2 §5.2 / Part 4 §10.2 | Screen reader users do not hear field-level errors when navigating by form field; direct WCAG 1.3.1 violation | All roles using any domain form; all auth form users | Medium | None | Part 2, Part 4 |
| C3 | Validation error messages are hybrid English/Portuguese — Zod's built-in English strings appended to i18n field name keys (e.g., `"Título — String must contain at least 5 character(s)"`) | Part 2 §5.2 / Part 4 §10.2 | Unprofessional and confusing for end users in a Portuguese-language government application; credibility failure | All roles who encounter form validation errors | Medium | None | Part 2, Part 4 |
| C4 | Focus not restored on Modal close — keyboard focus falls to `<body>` after closing any modal | Part 2 §5.2 / Part 4 §10.2 | Keyboard and screen reader users lose their position in the page; must re-navigate from the top | All keyboard and screen reader users across all modal interactions | Low | None | Part 2, Part 4 |


### 🟧 P1 — Strong UX Degradation or Significant Usability Barrier

| # | Issue | Source Section | UX/Accessibility Impact | Users Affected | Effort | Dependencies | Source Part |
|---|---|---|---|---|---|---|---|
| H1 | Citizen portal nav links have no `min-height` — approximately 20px tall, failing WCAG 2.5.5 (44px minimum) | Part 3 §8.1 / Part 4 §10.3 | Direct tap target failure for mobile citizens; primary audience for citizen-facing services | All mobile citizen users | Low | None | Part 3, Part 4 |
| H2 | Pagination buttons in `DataTable` are 36px height — below WCAG 2.5.5 minimum of 44px | Part 3 §8.1 / Part 4 §10.3 | Mobile users cannot reliably tap pagination controls on any paginated list | All mobile users on any domain module page | Low | None | Part 3, Part 4 |
| H3 | `no_show` (Appointments) and `failed` (Social Media) statuses display as raw enum strings — not in `StatusBadge` `STATUS_LABELS` map | Part 1 §2.2 / Part 4 §10.3 | Users see `"no_show"` and `"failed"` as literal text; appears unfinished; screen reader users hear non-meaningful strings | Atendente (Appointments), Social Media role | Low | None | Part 1, Part 3, Part 4 |
| H4 | `ToastContainer` has `aria-live="polite"` while individual `Toast` has `role="alert"` (implies `aria-live="assertive"`) — conflicting live region semantics | Part 2 §5.4 / Part 4 §10.3 | Unpredictable screen reader announcement behavior for all toast notifications | All screen reader users | Low | None | Part 2, Part 4 |
| H5 | Citizen portal uses emoji (`🏛️`, `📅`, `📋`, `📢`, `🏗️`, `👤`, `👋`, `ℹ️`) as primary icons — staff dashboard uses `Icon` component (SVG) consistently | Part 1 §2.2 / Part 4 §10.3 | Visual quality gap between citizen and staff surfaces; reduces institutional credibility of the public-facing portal | All citizen users; government stakeholders | Low | None | Part 1, Part 3, Part 4 |
| H6 | Error pages (404, Unauthorized) render without any layout wrapper — no header, footer, or navigation context; 404 "back to home" hard-codes `/admin/dashboard` redirecting citizens to staff login | Part 1 §2.2 / Part 4 §10.3 | Jarring experience for users who encounter errors; citizens are sent to the wrong destination | All users who encounter error pages | Low | None | Part 1, Part 2, Part 4 |
| H7 | `LoginForm` error `<div>` has no `role="alert"` or `aria-live` — screen readers do not announce login errors | Part 2 §5.4 / Part 4 §10.3 | Screen reader users are not notified of login failures; must discover the error by navigating the page | All staff users who encounter login errors | Low | None | Part 2, Part 4 |
| H8 | `framer-motion` and `react-hot-toast` are listed as production dependencies but are not imported anywhere — `framer-motion` adds ~100KB gzipped to the production bundle | Part 3 §6.2 / Part 4 §10.3 | Unnecessary bundle weight; dependency confusion for contributors; `motion` chunk loaded on initial load | All users (performance); all contributors (DX) | Low | Remove `motion` from `vite.config.ts` `manualChunks` | Part 3, Part 4 |


### 🟨 P2 — UX Friction, Consistency Gap, or Visual Modernity Issue

| # | Issue | Source Section | UX/Accessibility Impact | Users Affected | Effort | Dependencies | Source Part |
|---|---|---|---|---|---|---|---|
| M1 | Phone, CPF, and URL fields in domain forms use `type="text"` with no `inputMode` — presents standard QWERTY keyboard on mobile instead of numeric/URL keyboard | Part 3 §8.3 / Part 4 §10.4 | Degraded mobile data entry experience for staff entering citizen records and media contacts | Atendente, Assessor on mobile | Low | None | Part 3, Part 4 |
| M2 | Citizen registration and profile forms have no `autoComplete` attributes — browser autofill is disabled | Part 3 §8.3 / Part 4 §10.4 | Citizens must manually type all fields on mobile; friction in the primary citizen onboarding flow | All citizen users on mobile | Low | None | Part 3, Part 4 |
| M3 | Status changes in press release approval workflow produce a generic "Salvo com sucesso" toast — no specific transition message (e.g., "Comunicado enviado para revisão") | Part 3 §7.5 / Part 4 §10.4 | Assessors and admins lack clear confirmation of workflow state transitions in a government approval process | Assessor, Admin | Medium | None | Part 3, Part 4 |
| M4 | Sidebar footer shows user name but not role — users unfamiliar with the system cannot understand why certain modules are unavailable | Part 3 §9.1 / Part 4 §10.4 | Role confusion for new staff; no persistent role context in the UI | All staff roles | Low | None | Part 3, Part 4 |
| M5 | Breakpoints are hardcoded values in media queries across all CSS modules — no `--bp-*` tokens; changing a breakpoint requires multi-file edits | Part 1 §2.4 / Part 4 §10.4 | Maintainability debt; responsive design changes are error-prone and time-consuming | All contributors | Medium | PostCSS custom media or documentation-only standardization | Part 1, Part 4 |
| M6 | `CitizenDashboardPage` and `CitizenProfilePage` show no skeleton loading — citizen name renders as empty/undefined briefly during context initialization | Part 3 §7.1 / Part 4 §10.4 | Perceived performance degradation and layout flash for citizen users | All citizen users | Low | None | Part 3, Part 4 |
| M7 | Loading state expressed with three different prop names: `isLoading` (Button, ConfirmDialog), `loading` (Input), `isPending` (FormComponentProps) | Part 4 §10.4 | Inconsistent component API; contributor friction; risk of incorrect prop usage | All contributors | Low | None | Part 4 |
| M8 | `Loading` component uses `aria-label="Loading"` in English in a Portuguese-language application | Part 2 §5.4 / Part 4 §10.4 | Minor but observable inconsistency for screen reader users | All screen reader users | Low | None | Part 2, Part 4 |
| M9 | No explicit `:active` state on any interactive component beyond browser default — no tactile feedback on touch devices | Part 3 §6.3 / Part 4 §10.4 | Degraded touch feedback on mobile; interactive affordance gap | All mobile users | Low | Must respect `prefers-reduced-motion` | Part 3, Part 4 |

### 🟩 P3 — Polish, Optimization, or Enhancement Opportunity

| # | Issue | Source Section | UX/Accessibility Impact | Users Affected | Effort | Dependencies | Source Part |
|---|---|---|---|---|---|---|---|
| L1 | `ConnectionBanner` has no `role="alert"` or `aria-live` — screen reader users are not notified when the API becomes unreachable | Part 2 §5.4 / Part 4 §10.5 | Screen reader users miss critical connectivity status changes | All screen reader users | Low | None | Part 2, Part 4 |
| L2 | Citizen portal has only 2 authenticated pages (dashboard, profile) — no appointments view; citizens cannot see their scheduled appointments | Part 3 §9.4 / Part 4 §10.5 | Core citizen portal functionality is absent; portal feels underdeveloped | All citizen users | High | Backend endpoint: appointments filtered by citizen ID | Part 3, Part 4 |
| L3 | `CitizenProfilePage` is read-only — citizens cannot update their own data | Part 3 §9.4 / Part 4 §10.5 | Self-service is absent; citizens must contact staff for profile changes | All citizen users | High | Backend endpoint: `PATCH /api/v1/citizen-auth/profile` | Part 3, Part 4 |
| L4 | No dark mode support — token system supports it via `:root[data-theme]` override but is not implemented | Part 1 §3.2 / Part 4 §10.5 | Missing expected 2024–2025 SaaS feature; no `prefers-color-scheme` support | All users | High | None (token system is ready) | Part 1, Part 4 |
| L5 | Citizen portal header navigation is not optimized for one-handed mobile use — all items in top header, no bottom nav | Part 3 §8.2 / Part 4 §10.5 | Ergonomic barrier for mobile citizens; reach-to-top required for all navigation | All mobile citizen users | Medium | L2, L3 (more pages justify bottom nav) | Part 3, Part 4 |
| L6 | `prefers-contrast: high` support exists only on `Card` — not extended to `Button`, `Input`, `Modal`, `DataTable` | Part 4 §10.5 | Users with visual impairments using high-contrast mode receive inconsistent treatment | Users with high-contrast mode enabled | Medium | None | Part 4 |

---

## 2. Accessibility & Visual Debt Assessment

### Debt by Category

| Debt Category | Description | Risk if Ignored | Effort Estimate | Priority | Source Part |
|---|---|---|---|---|---|
| WCAG 2.1 AA compliance gaps | Modal duplicate IDs (C1), FormField `aria-describedby` (C2), focus restoration (C4), Toast live region conflict (H4), LoginForm `role="alert"` (H7) | Legal accessibility risk for a government digital service; ~35% of WCAG 2.1 AA criteria unmet | 4–6 dev-days | P0 | Part 2, Part 4 |
| Validation message localization | Hybrid English/Portuguese Zod messages visible to all users on form validation (C3) | Credibility failure in a government context; unprofessional user experience | 2–3 dev-days | P0 | Part 2, Part 4 |
| Keyboard navigation & focus management | Focus not restored on modal close (C4); no explicit `:active` states (M9) | Keyboard users lose navigation position on every modal interaction | 1–2 dev-days | P0–P2 | Part 2, Part 3, Part 4 |
| Touch target compliance | Citizen portal nav links ~20px (H1); pagination buttons 36px (H2) — both fail WCAG 2.5.5 | Direct barrier for mobile citizens; public accessibility obligation | 0.5–1 dev-day | P1 | Part 3, Part 4 |
| Screen reader optimization | `aria-label="Loading"` in English (M8); `ConnectionBanner` no live region (L1); emoji without SVG alternatives in citizen portal (H5) | Screen reader users receive incomplete or incorrect information | 1–2 dev-days | P1–P3 | Part 2, Part 3, Part 4 |
| Color contrast corrections | `StatusBadge` green variant: `#00A344` on `#dcfce7` ≈ 3.8:1 — fails WCAG AA at `font-size-xs` (12px) | WCAG 1.4.3 failure for the most common badge variant | 0.5 dev-days | P1 | Part 2 |
| Animation & `prefers-reduced-motion` | Sidebar desktop collapse animates `width` (not GPU-composited); no `:active` state respecting reduced motion (M9) | Minor jank risk; incomplete motion compliance | 0.5–1 dev-day | P2 | Part 3, Part 4 |
| Design token adoption | 34 hardcoded values across 9 CSS files; breakpoints not tokenized (M5); `PasswordInput` strength colors not tokenized | Visual inconsistency; multi-file edits required for any design refresh | 3–5 dev-days | P2 | Part 1 |
| Visual modernity | No dark mode (L4); emoji iconography in citizen portal (H5); error page treatment (H6); no skeleton on citizen pages (M6) | Institutional credibility gap; below 2024–2025 government digital service standards | 5–10 dev-days | P1–P3 | Part 1, Part 3, Part 4 |
| Citizen portal depth & feature | Only 2 authenticated pages; no appointments view (L2); no self-service profile editing (L3); no bottom nav (L5) | Portal feels underdeveloped; citizens cannot self-serve | 10–15 dev-days | P3 | Part 3, Part 4 |
| Dead dependency removal | `framer-motion` (~100KB gzipped) and `react-hot-toast` in production bundle unused (H8) | Unnecessary bundle weight; contributor confusion | 0.5 dev-days | P1 | Part 3, Part 4 |

### Debt Classification

| Type | Issues | Estimated Dev-Days |
|---|---|---|
| Critical compliance debt (WCAG 2.1 AA / legal risk) | C1, C2, C3, C4, H1, H2, H4, H7 | 8–12 |
| Structural UX debt (usability and consistency) | H3, H5, H6, M1, M2, M3, M4, M7, M8, M9 | 5–8 |
| Visual modernization debt (design quality and credibility) | H5, H6, M6, M9, L4, L5, L6 | 7–12 |
| Design system debt (token coverage and component consistency) | M5, M7, H8, + 34 hardcoded values | 4–6 |
| Citizen portal feature debt | L2, L3, L5 | 10–15 |
| **Total** | | **34–53 dev-days** |

### Citizen Portal Debt (Public-Facing — Quantified Separately)

| Debt Item | Type | Effort | Priority |
|---|---|---|---|
| Nav touch targets ~20px (H1) | Compliance | 0.5 dev-days | P1 |
| Emoji iconography (H5) | Visual credibility | 0.5 dev-days | P1 |
| No skeleton loading (M6) | UX quality | 0.5 dev-days | P2 |
| No `autoComplete` on registration (M2) | Mobile usability | 0.5 dev-days | P2 |
| No appointments view (L2) | Feature depth | 5–7 dev-days | P3 |
| No self-service profile editing (L3) | Feature depth | 4–6 dev-days | P3 |
| No bottom navigation on mobile (L5) | Mobile ergonomics | 2–3 dev-days | P3 |
| **Citizen portal subtotal** | | **13–18 dev-days** | |

### Assumptions & Confidence

- Effort estimates assume 1 frontend engineer per task with full context of the codebase.
- "Low effort" items are estimated at 0.5–1 dev-day each; "Medium" at 1–3 dev-days; "High" at 4–7 dev-days.
- Backend-dependent items (L2, L3) include only frontend effort; backend work is additional.
- Confidence level: **Medium** — based on static code analysis; actual effort may vary with runtime testing and cross-browser validation.
- The ~65% WCAG 2.1 AA baseline (Part 2 §5.1) represents a compliance risk requiring escalation to product and leadership stakeholders before the next public release.

---

## 3. Phased Implementation Roadmap

> Assumes 2–4 frontend engineers, 2-week sprints, parallel work allowed on independent issues.
> Issue IDs reference Section 1. Effort estimates are in developer-days.

---

### Phase 1 — Critical Accessibility Compliance (Weeks 1–2)

**Goal:** Resolve all P0 issues blocking WCAG 2.1 AA compliance and apply all low-effort P1 quick wins that can be delivered in parallel.

| Issue | Description | Effort | Assignable In Parallel |
|---|---|---|---|
| C1 | Fix Modal duplicate `id="modal-title"` via `useId()` | 0.5 days | ✅ |
| C4 | Restore focus on Modal close | 0.5 days | ✅ (same file as C1) |
| C2 | Inject `aria-describedby` in `FormField` | 2 days | ✅ |
| C3 | Replace hybrid Zod validation messages with Portuguese-only | 2 days | ✅ |
| H7 | Add `role="alert"` to `LoginForm` error display | 0.5 days | ✅ |
| H4 | Resolve Toast `aria-live` conflict | 0.5 days | ✅ |
| H8 | Remove dead production dependencies (`framer-motion`, `react-hot-toast`) | 0.5 days | ✅ |
| M8 | Fix `aria-label="Loading"` to Portuguese | 0.5 days | ✅ |

**Total effort:** ~7 dev-days
**Dependencies:** None — all items are self-contained.
**Expected impact:** Resolves all 4 P0 WCAG 2.1 AA violations. Estimated compliance improvement from ~65% to ~80%. Eliminates ~100KB from production bundle. Removes English strings from all user-facing validation feedback.

---

### Phase 2 — High-Priority UX & Visual Fixes (Weeks 3–4)

**Goal:** Resolve all P1 issues causing mobile usability barriers, visual credibility gaps, and role-based UI failures.

| Issue | Description | Effort | Assignable In Parallel |
|---|---|---|---|
| H1 | Fix citizen portal nav touch targets to ≥44px | 0.5 days | ✅ |
| H2 | Fix pagination button touch targets to ≥44px | 0.5 days | ✅ |
| H3 | Add `no_show` / `failed` to `StatusBadge` with Portuguese labels | 0.5 days | ✅ |
| H5 | Replace emoji icons in citizen portal with `Icon` component instances | 1 day | ✅ |
| H6 | Add `PublicLayout` wrapper to error pages; fix 404 "back to home" link to `/` | 1 day | ✅ |
| StatusBadge contrast | Increase `StatusBadge` green variant contrast to ≥4.5:1 at `font-size-xs` | 0.5 days | ✅ |

**Total effort:** ~4 dev-days
**Dependencies:** Phase 1 complete (C3 resolves validation messages that may surface on error pages).
**Expected impact:** Resolves all P1 touch target failures (WCAG 2.5.5). Eliminates raw enum strings visible to end users. Removes emoji from citizen portal. Provides navigation context on error pages. Fixes the only color contrast failure identified in the audit.

---

### Phase 3 — UX Consistency & Mobile Optimization (Weeks 5–8)

**Goal:** Resolve all P2 issues advancing design token adoption, mobile usability, feedback consistency, and component API standardization.

| Issue | Description | Effort | Assignable In Parallel |
|---|---|---|---|
| M1 | Add `inputMode` / `type` to phone, CPF, URL fields in domain forms | 1 day | ✅ |
| M2 | Add `autoComplete` attributes to citizen registration form | 0.5 days | ✅ |
| M3 | Add specific approval workflow feedback messages for press release status transitions | 2 days | ✅ |
| M4 | Add role indicator to sidebar footer | 0.5 days | ✅ |
| M6 | Add `Skeleton` loading to citizen portal pages | 1 day | ✅ |
| M7 | Standardize loading prop naming to `isLoading` across all components | 1 day | ✅ |
| M9 | Add `:active` state to `Button` and interactive `Card` (with `prefers-reduced-motion` guard) | 1 day | ✅ |
| M5 | Tokenize breakpoints (documentation-only standardization or PostCSS custom media) | 2 days | ✅ |
| Hardcoded values | Resolve 34 hardcoded CSS values across 9 files (token substitution) | 2 days | ✅ |
| PasswordInput tokens | Add strength color tokens for `PasswordInput` inline JS values | 0.5 days | ✅ (same sprint as hardcoded values) |

**Total effort:** ~11.5 dev-days
**Dependencies:** Phase 2 complete. M7 requires coordination across component library files.
**Expected impact:** Design token adoption advances from ~83% to ≥95%. Mobile data entry improves for atendente and assessor roles. Approval workflow clarity improves for assessor and admin. Citizen portal perceived performance improves. Component API becomes consistent for contributors.

---

### Phase 4 — Visual Modernization & Citizen Portal Depth (Weeks 9+)

**Goal:** Resolve P3 issues, expand citizen portal functionality, and establish ongoing UX quality practices.

| Issue | Description | Effort | Dependencies |
|---|---|---|---|
| L1 | Add `role="alert"` to `ConnectionBanner` | 0.5 days | None |
| L6 | Extend `prefers-contrast: high` to `Button`, `Input`, `Modal`, `DataTable` | 2 days | None |
| L5 | Add bottom navigation for citizen portal on mobile (≤767px) | 2–3 days | L2, L3 (more pages justify the pattern) |
| L2 | Add citizen portal appointments view (`/portal/appointments`) | 5–7 days | Backend endpoint: appointments by citizen ID |
| L3 | Add self-service profile editing to `CitizenProfilePage` | 4–6 days | Backend endpoint: `PATCH /api/v1/citizen-auth/profile` |
| L4 | Add dark mode support via `[data-theme="dark"]` token override | 5–8 days | None (token system is ready) |
| Metrics baseline | Establish Lighthouse CI baseline and axe-core integration in CI pipeline | 2–3 days | None |

**Total effort:** ~21–30 dev-days
**Dependencies:** L2 and L3 require backend work not included in these estimates. L5 is most valuable after L2 and L3 add more portal pages.
**Expected impact:** Citizen portal grows from 2 to ≥3 authenticated pages. Self-service capability reduces atendente workload. Dark mode closes the most visible visual modernity gap. Automated accessibility checks prevent regression.

---

## 4. Success Metrics & Baseline

### Current Baseline (from audit documents)

| Metric | Current State | Source |
|---|---|---|
| Estimated WCAG 2.1 AA compliance | ~65% | Part 2 §5.1 |
| Perceivable (1.x) compliance | ~75% | Part 2 §5.1 |
| Operable (2.x) compliance | ~70% | Part 2 §5.1 |
| Understandable (3.x) compliance | ~60% | Part 2 §5.1 |
| Robust (4.x) compliance | ~65% | Part 2 §5.1 |
| Design token adoption | ~83% (34 hardcoded values across 9 files) | Part 1 §2.4 |
| Hardcoded color values | 34 across 9 CSS files | Part 1 §2.4 |
| `StatusBadge` green contrast ratio | ~3.8:1 (marginal fail at `font-size-xs`) | Part 2 §5.5 |
| Citizen portal nav touch target | ~20px (fails WCAG 2.5.5) | Part 3 §8.1 |
| Pagination button touch target | 36px (fails WCAG 2.5.5) | Part 3 §8.1 |
| Visual modernity score | ~7.5/10 average across 13 audited pages | Part 1 §2.1 |
| Dead production dependencies | 2 (`framer-motion`, `react-hot-toast`) | Part 3 §6.2 |
| Citizen portal authenticated pages | 2 (dashboard, profile) | Part 3 §9.4 |
| P0 accessibility issues open | 4 (C1, C2, C3, C4) | Part 4 §10.2 |
| Validation messages in English | All Zod built-in messages (all 7 domain forms) | Part 2 §5.2 |
| Approval workflow feedback specificity | Generic "Salvo com sucesso" for all status transitions | Part 3 §7.5 |

### Citizen Portal Baseline (Tracked Separately — Public-Facing)

| Metric | Current State | Source |
|---|---|---|
| Authenticated pages | 2 | Part 3 §9.4 |
| Nav touch target compliance | ❌ Fail (~20px) | Part 3 §8.1 |
| Skeleton loading coverage | ❌ None | Part 3 §7.1 |
| `autoComplete` on registration | ❌ None | Part 3 §8.3 |
| Iconography type | Emoji (credibility risk) | Part 1 §2.2 |
| Self-service profile editing | ❌ Read-only | Part 3 §9.4 |
| Appointments view | ❌ Not implemented | Part 3 §9.4 |

### 3-Month Target Goals

| Metric | Target | Priority | Phase |
|---|---|---|---|
| WCAG 2.1 AA compliance | ≥90% across all pages | P0 | Phase 1–2 |
| P0 accessibility issues open | 0 | P0 | Phase 1 |
| P1 accessibility/UX issues open | 0 | P1 | Phase 2 |
| Citizen portal nav touch targets | ≥44px (WCAG 2.5.5) | P1 | Phase 2 |
| Pagination button touch targets | ≥44px (WCAG 2.5.5) | P1 | Phase 2 |
| `StatusBadge` green contrast | ≥4.5:1 at all text sizes | P1 | Phase 2 |
| Validation messages | 100% Portuguese, no Zod English strings | P0 | Phase 1 |
| Dead dependencies removed | 0 unused production dependencies | P1 | Phase 1 |
| Design token adoption | ≥95% (≤5 hardcoded values) | P2 | Phase 3 |
| Approval workflow feedback | Status-specific messages for all transitions | P2 | Phase 3 |
| Citizen portal authenticated pages | ≥3 (add appointments view) | P3 | Phase 4 |
| Visual modernity score | ≥8.5/10 average across audited pages | P2 | Phase 3–4 |
| Automated accessibility checks | axe-core integrated in CI pipeline | P2 | Phase 4 |

---

## 5. UX & Accessibility Maturity Score

**Overall Score: 54 / 100**

### Dimension Breakdown

| Dimension | Score | Rationale | Source |
|---|---|---|---|
| WCAG 2.1 AA compliance depth | 9/20 | ~65% estimated compliance; 4 critical violations open (C1–C4); core primitives are well-implemented but form and modal ARIA is broken | Part 2 §5.1–5.2 |
| Keyboard navigation completeness | 7/10 | Largely navigable; focus restoration on modal close is missing (C4); `:active` states absent (M9) | Part 2 §5.3 |
| Screen reader optimization | 6/10 | Good landmark structure and heading hierarchy; `aria-describedby` not injected (C2); Toast live region conflict (H4); English `aria-label` (M8) | Part 2 §5.4 |
| Color contrast discipline | 7/10 | All primary elements pass AA; `StatusBadge` green fails at `font-size-xs`; disabled states intentionally fail (acceptable) | Part 2 §5.5 |
| Mobile usability | 6/10 | Mobile-first breakpoints; DataTable card-view excellent; citizen portal nav fails WCAG 2.5.5 (H1); pagination fails (H2); no `inputMode` on domain forms (M1) | Part 3 §8.1–8.3 |
| Animation & motion compliance | 8/10 | GPU-friendly properties throughout; `prefers-reduced-motion` respected globally; sidebar `width` animation is not GPU-composited; no `:active` state | Part 3 §6.1–6.3 |
| Design token adoption discipline | 7/10 | ~83% adoption; 34 hardcoded values; breakpoints not tokenized; `PasswordInput` strength colors not tokenized | Part 1 §2.4 |
| Visual modernity & institutional credibility | 6/10 | Strong staff dashboard; emoji in citizen portal reduces credibility; no dark mode; error pages lack layout; visual modernity ~7.5/10 average | Part 1 §2.1–2.5 |
| Loading & feedback state consistency | 7/10 | Layered feedback (TopLoadingBar + skeleton + button states); citizen portal pages have no skeleton; approval workflow feedback is generic | Part 3 §7.1–7.5 |
| Citizen portal UX completeness | 3/10 | Only 2 authenticated pages; no appointments view; no self-service editing; emoji iconography; no bottom nav; touch targets fail | Part 3 §9.4 |

### Current Maturity Stage

**Emerging → Structured** (transitioning)

| Stage | Description | Secom Status |
|---|---|---|
| Ad-hoc | No consistent patterns; no token system | ✅ Passed |
| Emerging | Token system exists; core components accessible; gaps in application | ✅ Current lower bound |
| Structured | Consistent token adoption; WCAG 2.1 AA met; mobile usability complete | 🔄 In progress — blocked by C1–C4, H1–H2 |
| Accessibility-Driven | Automated accessibility testing in CI; zero known WCAG violations; screen reader tested | ❌ Not yet |
| Government-Grade | Full WCAG 2.1 AA + citizen portal depth + dark mode + high-contrast support + audit trail | ❌ Not yet |

### Key Blockers Preventing Advancement to "Structured"

1. **C1–C4 (P0):** Four open WCAG 2.1 AA violations prevent claiming AA compliance — the minimum threshold for the "Structured" stage.
2. **H1–H2 (P1):** Touch target failures on citizen-facing navigation and pagination are direct WCAG 2.5.5 violations that must be resolved before mobile usability can be rated as complete.
3. **C3 (P0):** Hybrid English/Portuguese validation messages are a government-context credibility failure that prevents the "Understandable" WCAG category from advancing beyond ~60%.

---

## 6. Executive Summary

> Written for: CTO, Head of Product, and compliance stakeholders.

---

**Overall UX & Accessibility Health Score: 54 / 100**

The Secom frontend is structurally sound and visually coherent at the staff dashboard level. The design token system is comprehensive, the component library is purpose-built, and the responsive layout is well-implemented. However, four open WCAG 2.1 AA violations, a ~65% compliance baseline, and an underdeveloped citizen portal represent meaningful risks for a government digital service with public accessibility obligations.

---

### Key Strengths

1. **Comprehensive design token system** — ~200 tokens consumed via `var()` in CSS Modules across all components. A token-level change propagates automatically, meaning a visual refresh or dark mode implementation requires no component rewrites. (Part 1 §2.4, §3.3)

2. **Consistent staff dashboard UX** — All 7 domain modules share the same `CrudPage` abstraction, delivering uniform loading states, error states, empty states, and feedback patterns. Adding a new module automatically inherits the full UX pattern. (Part 3 §7.5, §9.2)

3. **Mobile-first responsive foundation** — `DataTable` card-view on mobile, modal bottom-sheet at ≤480px, off-canvas drawer navigation, and GPU-friendly animations with full `prefers-reduced-motion` compliance provide a strong responsive baseline. (Part 2 §4.5, Part 3 §6.2)

---

### Major Risks

1. **WCAG 2.1 AA compliance at ~65% — legal and reputational risk.** Four critical violations are open: duplicate modal ARIA IDs (C1), missing `aria-describedby` on all form fields (C2), hybrid English/Portuguese validation messages (C3), and missing focus restoration on modal close (C4). For a government digital service, WCAG 2.1 AA compliance is an expected standard. The current baseline exposes the Secretaria de Comunicação to accessibility complaints and reputational risk. (Part 2 §5.1–5.2, Part 4 §10.2)

2. **Citizen portal is underdeveloped and fails mobile accessibility standards.** The public-facing portal offers only 2 authenticated pages, uses emoji as primary iconography (reducing institutional credibility), and has navigation links that fail WCAG 2.5.5 touch target requirements (~20px vs. 44px minimum). Citizens — the primary audience for a government communication secretariat — receive a materially lower quality experience than staff. (Part 3 §8.1, §9.4, Part 4 §10.3)

3. **Visual credibility gaps undermine institutional trust.** Raw enum strings (`no_show`, `failed`) visible in production tables, error pages without layout or navigation context, and emoji iconography in the citizen portal collectively signal an unfinished product to end users and government stakeholders. These are low-effort fixes with high credibility impact. (Part 1 §2.2–2.5, Part 4 §10.3)

---

### Estimated Investment

| Phase | Focus | Effort | Timeline |
|---|---|---|---|
| Phase 1 | Critical accessibility compliance (P0) | ~7 dev-days | Weeks 1–2 |
| Phase 2 | High-priority UX & visual fixes (P1) | ~4 dev-days | Weeks 3–4 |
| Phase 3 | UX consistency & mobile optimization (P2) | ~11.5 dev-days | Weeks 5–8 |
| Phase 4 | Visual modernization & citizen portal depth (P3) | ~21–30 dev-days | Weeks 9+ |
| **Total** | | **~44–53 dev-days** | **~12–16 weeks** |

**Risk if delayed:**
- **Phase 1 delay:** Every public release with the current codebase ships with 4 known WCAG 2.1 AA violations. Accessibility complaints or audits would find these immediately.
- **Phase 2 delay:** Mobile citizens continue to encounter tap target failures on the primary navigation of a government public service.
- **Phase 3–4 delay:** The citizen portal remains underdeveloped relative to the staff dashboard, and the visual credibility gap persists for government stakeholders.

---

### Recommendation

**Moderate UX and accessibility refactor required.**

The foundation is strong. The required changes are targeted and well-scoped — no architectural rewrites are needed. Phase 1 and Phase 2 together require approximately 11 developer-days and resolve all P0 and P1 issues, advancing WCAG 2.1 AA compliance from ~65% to an estimated ≥85%. This investment is proportionate to the compliance and credibility risk for a government digital service.

---

*End of UX, Accessibility & Visual Design Improvement Roadmap.*
*All findings derived from static analysis documented in `ux-accessibility-part-1.md` through `ux-accessibility-part-4.md`.*
