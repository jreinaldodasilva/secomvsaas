# Secom – Frontend UX, Accessibility & Visual Design Improvement Roadmap

## Objective

Generate a **strategic improvement roadmap strictly from the UX, Accessibility & Visual Design audit documents**. The goal is to transform documented gaps, risks, and improvement notes into a prioritized, phased plan that improves accessibility compliance, visual consistency, mobile usability, and institutional credibility.

**Project Context**: Secom is a communication management system for the Secretaria de Comunicação, built on the vSaaS boilerplate. UX and visual design are central to:
- **Modules**: Press releases, media contacts, clipping, events, appointments, citizen portal, social media
- **Roles**: super_admin, admin, assessor, social_media, atendente, citizen
- **Styling**: Custom CSS design token system (`src/styles/tokens/index.css`) consumed via `var()` in CSS Modules per component and global utility classes in `src/styles/global.css`
- **Government Context**: Accessibility and visual credibility expectations of a public-sector digital service

**Source Documents:**

```
docs/architecture/frontend/ux-accessibility-part-1.md
docs/architecture/frontend/ux-accessibility-part-2.md
docs/architecture/frontend/ux-accessibility-part-3.md
docs/architecture/frontend/ux-accessibility-part-4.md
```

---

## Scope & Analysis Guidelines

* Use only findings, gaps, inconsistencies, risks, and recommendations explicitly described in the source documents.
* Do not reference architecture, component library, forms, navigation, or performance documents unless explicitly mentioned in the source documents.
* Do not invent UX or accessibility debt outside what is implied in the source documents.
* Clearly reference the relevant Part (Part 1, Part 2, Part 3, or Part 4) for each finding.
* Keep recommendations **high-level**, not step-by-step implementation instructions.

### Severity Classification

* 🟥 P0 – Blocks usage, violates WCAG 2.1 AA, or creates compliance risk for a government digital service
* 🟧 P1 – Strong UX degradation, visual credibility issue, or significant usability barrier
* 🟨 P2 – UX friction, consistency gap, or visual modernity issue
* 🟩 P3 – Polish, optimization, or enhancement opportunity

---

## Tasks

---

### 1. Issue Extraction & Prioritization

Extract every UX, accessibility, and visual design issue from the source documents and categorize by priority.

For each issue, capture:

| # | Issue | Source Section | UX/Accessibility Impact | Users Affected | Effort | Dependencies | Source Part |
| - | ----- | -------------- | ----------------------- | -------------- | ------ | ------------ | ----------- |

Organize into four priority tiers: P0, P1, P2, P3.

Extract issues across all documented dimensions:

* WCAG 2.1 AA compliance gaps (modal IDs, `aria-describedby`, `aria-current`, focus restoration, live regions)
* Color contrast violations (from the contrast audit table in Part 2)
* Keyboard navigation gaps (focus restoration, touch targets, tab order)
* Screen reader compatibility issues (landmark structure, heading hierarchy, ARIA labels, dynamic announcements)
* Responsive design breakage (overflow, navigation collapse, component reflow)
* Mobile UX gaps (`inputMode`, `autoComplete`, touch targets, ergonomics)
* Animation and interaction quality gaps (`:active` states, GPU-friendliness, `prefers-reduced-motion`)
* Loading and feedback state inconsistencies (skeleton coverage, empty states, error recovery)
* Design token adoption gaps (hardcoded values, missing tokens, breakpoint tokenization)
* Visual modernity gaps (dark mode, emoji iconography, error page treatment)
* Secom-specific patterns (approval workflow feedback, role indicator, citizen portal depth)
* Dead dependencies (`framer-motion`, `react-hot-toast`)

Also summarize:

* Total issue count by priority tier
* Most affected modules
* Most affected user roles (citizen-facing vs. staff-facing)
* Issues blocking WCAG 2.1 AA compliance
* Issues blocking visual modernization goals

**Secom-Specific Focus**:
- Are citizen-facing issues (citizen portal, mobile nav, touch targets) prioritized above staff-only issues of equivalent severity, given public accessibility obligations?
- Are approval workflow visibility issues (press release status transitions, event status) captured for assessor and admin roles?
- Are design token adoption gaps captured as a systemic issue rather than per-component findings?
- Are the 4 Critical issues from Part 4 (Modal IDs, `FormField` `aria-describedby`, hybrid validation messages, focus restoration) represented as P0 items?

---

### 2. Quick Wins Identification

Identify **high-impact, low-effort improvements** that can be delivered without architectural changes. Base candidates strictly on the "Low effort" items documented in Part 4 and the quick win signals in Parts 1–3.

Candidates include (only if supported by source documents):

* Missing ARIA attributes (`role="alert"`, `aria-describedby`, `aria-live`, `aria-label`)
* Touch target size corrections (citizen portal nav links, pagination buttons)
* Replacing emoji icons with SVG `Icon` component instances
* Adding layout wrapper to error pages
* Removing dead production dependencies (`framer-motion`, `react-hot-toast`)
* Adding `no_show` and `failed` status labels to `StatusBadge`
* Resolving Toast `aria-live` conflict
* Adding `inputMode` and `type` attributes to domain form fields
* Adding `autoComplete` attributes to citizen-facing forms
* Adding role indicator to sidebar footer
* Adding skeleton loading to citizen portal pages
* Standardizing loading prop naming across components
* Fixing `aria-label="Loading"` to Portuguese

⚠️ Only include improvements supported by the source documents.

---

#### Quick Win Format

**Quick Win #N: [Title]**

* **Problem**: What is currently wrong, as documented in the audit
* **Impact**: Who is affected and how
* **Effort**: Estimated hours or days
* **Suggested Approach**: High-level direction (not implementation steps)
* **Expected Outcome**: Measurable or observable improvement
* **Source Part**: Which audit part documents this issue

Provide **10–20 quick wins**, ordered by impact-to-effort ratio.

**Secom-Specific Focus**:
- Are there quick wins specific to citizen-facing flows (citizen portal navigation, citizen registration)?
- Are there quick wins that improve role-based UI clarity (approval status badges, role indicators)?
- Are there token-level fixes that unblock broader visual consistency improvements?

---

### 3. Accessibility & Visual Debt Assessment

Estimate the total UX, accessibility, and visual modernization debt derived from the source documents.

#### Debt Categories

| Debt Category | Description | Risk if Ignored | Effort Estimate | Priority | Source Part |
| ------------- | ----------- | --------------- | --------------- | -------- | ----------- |

Categories to assess (only those documented in the source):

* WCAG 2.1 AA compliance gaps (modal ARIA, form error association, focus management, live regions)
* Keyboard navigation and focus management debt
* Screen reader optimization debt
* Color contrast corrections (StatusBadge green variant, marginal cases from Part 2 contrast table)
* Touch target and mobile usability debt
* Animation and `prefers-reduced-motion` compliance debt
* Design token adoption debt (hardcoded values, missing tokens, breakpoint tokenization)
* Visual modernity debt (dark mode, emoji iconography, error page treatment, skeleton coverage)
* Citizen portal depth and feature debt (appointments view, self-service profile editing, bottom nav)
* Dead dependency removal debt
* Validation message localization debt (hybrid English/Portuguese messages)

Provide:

* Total estimated developer-days
* Confidence level (Low / Medium / High)
* Assumptions

Also classify debt by type:

* Critical compliance debt (WCAG 2.1 AA / legal accessibility risk)
* Structural UX debt (usability and consistency)
* Visual modernization debt (design quality and institutional credibility)
* Design system debt (token coverage and component consistency)

**Secom-Specific Focus**:
- Is citizen-portal accessibility debt quantified separately, given its public-facing nature and government accessibility obligations?
- Is the visual modernization debt scoped in terms of token-level vs. component-level vs. layout-level changes?
- Is the estimated compliance risk of the ~65% WCAG 2.1 AA baseline reflected in the debt severity?

---

### 4. Phased Implementation Roadmap

Create a sprint-based roadmap derived strictly from the audit findings. Assume:

* 2–4 frontend engineers
* 2-week sprints
* Parallel work allowed on independent issues

Each phase must include:

* Goal
* Included issues (by ID from Section 1)
* Effort estimate
* Dependencies
* Expected impact on UX, accessibility, or visual quality

---

#### Phase 1 – Critical Accessibility Compliance (Weeks 1–2)

Focus: Resolve all P0 issues blocking WCAG 2.1 AA compliance.

Candidates (from Part 4 Critical recommendations):
* Fix Modal duplicate `id="modal-title"` (C1)
* Inject `aria-describedby` in `FormField` (C2)
* Replace hybrid validation messages with Portuguese-only messages (C3)
* Restore focus on Modal close (C4)
* Apply all "Low effort / High impact" quick wins from Section 2

---

#### Phase 2 – High-Priority UX & Visual Fixes (Weeks 3–4)

Focus: Resolve P1 issues causing strong UX degradation, visual credibility gaps, or mobile usability barriers.

Candidates (from Part 4 High recommendations):
* Fix citizen portal nav touch targets (H1)
* Fix pagination button touch targets (H2)
* Add `no_show` / `failed` to `StatusBadge` (H3)
* Resolve Toast `aria-live` conflict (H4)
* Replace emoji icons in citizen portal with SVG icons (H5)
* Add layout wrapper to error pages (H6)
* Add `role="alert"` to `LoginForm` error display (H7)
* Remove dead production dependencies (H8)

---

#### Phase 3 – UX Consistency & Mobile Optimization (Weeks 5–8)

Focus: Resolve P2 issues and advance design token adoption, mobile usability, and feedback consistency.

Candidates (from Part 4 Medium recommendations):
* Add `inputMode` / `type` to domain form fields (M1)
* Add `autoComplete` to citizen-facing forms (M2)
* Add specific approval workflow feedback messages (M3)
* Add role indicator to sidebar footer (M4)
* Tokenize breakpoints (M5)
* Add skeleton loading to citizen portal pages (M6)
* Standardize loading prop naming (M7)
* Fix `aria-label="Loading"` to Portuguese (M8)
* Add `:active` state to interactive elements (M9)

---

#### Phase 4 – Visual Modernization & Citizen Portal Depth (Weeks 9+)

Focus: Resolve P3 issues, expand citizen portal functionality, and establish ongoing UX quality practices.

Candidates (from Part 4 Low recommendations):
* Add `ConnectionBanner` ARIA live region (L1)
* Add citizen portal appointments view (L2)
* Add self-service profile editing to citizen portal (L3)
* Add dark mode support (L4)
* Add bottom navigation for citizen portal mobile (L5)
* Add `prefers-contrast: high` support (L6)
* Establish baseline metrics for ongoing tracking

---

### 5. Success Metrics & Baseline

Define measurable UX, accessibility, and visual design targets derived from the audit baseline in the source documents.

#### Current Baseline (from audit documents)

| Metric | Current State | Source |
| ------ | ------------- | ------ |
| Estimated WCAG 2.1 AA compliance | ~65% | Part 2 §5.1 |
| Perceivable (1.x) compliance | ~75% | Part 2 §5.1 |
| Operable (2.x) compliance | ~70% | Part 2 §5.1 |
| Understandable (3.x) compliance | ~60% | Part 2 §5.1 |
| Robust (4.x) compliance | ~65% | Part 2 §5.1 |
| Design token adoption | ~83% (34 hardcoded values across 9 files) | Part 1 §2.4 |
| Hardcoded color values | 34 across 9 CSS files | Part 1 §2.4 |
| StatusBadge green contrast ratio | ~3.8:1 (marginal fail at `font-size-xs`) | Part 2 §5.5 |
| Citizen portal nav touch target | ~20px (fails WCAG 2.5.5) | Part 3 §8.1 |
| Pagination button touch target | 36px (fails WCAG 2.5.5) | Part 3 §8.1 |
| Visual modernity score | ~7.5/10 average across 13 audited pages | Part 1 §2.1 |
| Dead production dependencies | 2 (`framer-motion`, `react-hot-toast`) | Part 3 §6.2 |
| Citizen portal authenticated pages | 2 (dashboard, profile) | Part 3 §9.4 |
| P0 accessibility issues open | 4 (Modal IDs, FormField aria, validation messages, focus restoration) | Part 4 §10.2 |

#### 3-Month Target Goals

| Metric | Target | Priority |
| ------ | ------ | -------- |
| WCAG 2.1 AA compliance | ≥90% across all pages | P0 |
| P0 accessibility issues | 0 open | P0 |
| P1 accessibility/UX issues | 0 open | P1 |
| Citizen portal nav touch targets | ≥44px (WCAG 2.5.5) | P1 |
| Pagination button touch targets | ≥44px (WCAG 2.5.5) | P1 |
| StatusBadge green contrast | ≥4.5:1 at all text sizes | P1 |
| Design token adoption | ≥95% (≤5 hardcoded values) | P2 |
| Validation messages | 100% Portuguese, no Zod English strings | P0 |
| Dead dependencies removed | 0 unused production dependencies | P1 |
| Citizen portal authenticated pages | ≥3 (add appointments view) | P3 |
| Visual modernity score | ≥8.5/10 average across audited pages | P2 |

**Secom-Specific Focus**:
- Are citizen portal and appointment booking pages tracked separately in the metrics baseline, given their public-facing nature?
- Are approval workflow visibility metrics captured for assessor and admin roles?
- Is the ~65% WCAG 2.1 AA baseline treated as a compliance risk requiring escalation to product and leadership stakeholders?

---

### 6. UX & Accessibility Maturity Score

Score 0–100 based only on the source documents.

Breakdown dimensions:

* WCAG 2.1 AA compliance depth
* Keyboard navigation completeness
* Screen reader optimization
* Color contrast discipline
* Mobile usability (touch targets, `inputMode`, ergonomics)
* Animation and motion compliance (`prefers-reduced-motion`)
* Design token adoption discipline
* Visual modernity and institutional credibility
* Loading and feedback state consistency
* Citizen portal UX completeness

Provide:

* Current maturity stage: Ad-hoc → Emerging → Structured → Accessibility-Driven → Government-Grade
* Key blockers preventing advancement to the next stage

---

### 7. Executive Summary (Leadership-Level)

Provide:

**Overall UX & Accessibility Health Score**: X / 100

**Key Strengths** (3 items, grounded in audit findings)

**Major Risks** (3 items, grounded in audit findings — include compliance and credibility risk)

**Estimated Investment**:
* Total developer-days
* Timeline
* Risk if delayed (compliance, citizen experience, institutional credibility)

**Recommendation** — choose one:
* Requires targeted accessibility fixes
* Moderate UX and accessibility refactor required
* Strategic UX overhaul and accessibility remediation recommended

Written for: CTO, Head of Product, and compliance stakeholders.

Keep concise and strategic.

---

## Output Requirements

### Output Files

**File 1:** `docs/roadmaps/frontend/ux-accessibility-improvement.md`

Must include:
* Prioritized issue list (P0–P3) with source traceability
* Accessibility and visual debt quantification
* Phased sprint roadmap with effort estimates and dependencies
* Success metrics baseline and 3-month targets
* UX & accessibility maturity score
* Executive summary

**File 2:** `docs/roadmaps/frontend/ux-accessibility-quick-wins.md`

Must include:
* All quick wins with problem, impact, effort, and expected outcome
* Ordered by impact-to-effort ratio
* Suggested execution sequence
* Source traceability (Part 1 / Part 2 / Part 3 / Part 4)

---

## Formatting & Style Requirements

* Use structured Markdown
* Prefer tables for issue lists, debt breakdowns, and metrics
* Maintain a neutral, analytical tone
* Avoid speculative assumptions — tie every item to documented audit findings
* Avoid step-by-step implementation instructions
* Align with previously documented architecture and audit findings

---

## Secom-Specific Analysis Points

When building the roadmap, pay special attention to:

* **Citizen-Facing Priority**: Issues affecting the citizen portal and appointment booking should be weighted higher due to public accessibility obligations under Brazilian government digital service standards
* **Role-Based UI Clarity**: Roadmap items affecting role-specific views (assessor approval workflows, atendente citizen records, admin user management) should note which roles are impacted
* **Approval Workflow Visibility**: Visual and accessibility gaps in press release and event approval flows affect core staff workflows for assessor and admin roles
* **Government Credibility**: Visual modernity gaps that affect institutional credibility (emoji iconography, error page treatment, raw enum status labels) should be flagged for product and leadership stakeholders
* **Design Token Leverage**: Token-level fixes that unblock multiple components (breakpoint tokenization, missing strength color tokens for `PasswordInput`) should be prioritized over per-component fixes
* **Module Coverage**: Ensure all 7 modules are represented in the issue list — the audit covers all modules via the `CrudPage` abstraction, but module-specific issues (Appointments `no_show`, Social Media `failed`) must be captured individually
* **WCAG 2.1 AA Baseline**: The ~65% compliance estimate from Part 2 §5.1 represents a compliance risk for a government digital service — this should be the primary driver of Phase 1 prioritization
* **Citizen Portal Depth**: The citizen portal currently offers only 2 authenticated pages — roadmap items expanding portal functionality (appointments view, self-service profile editing) should be scoped as Phase 4 items with backend dependency notes
