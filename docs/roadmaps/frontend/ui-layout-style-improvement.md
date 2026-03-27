# UI Layout & Style Improvement Roadmap

## Scope & Traceability
- Source of truth: `docs/architecture/frontend/ui-layout-style-audit.md`
- Constraint applied: only issues explicitly documented in the audit were included.
- Recommendation level: strategic/high-level only (no implementation detail).

## Implementation Update (Updated: 2026-03-27)

### Execution Progress Snapshot
- Quick wins completed: **14 / 14**
- Quick wins partially completed: **0 / 14**
- Highest-priority delivered areas:
  - Container and shell normalization improvements
  - `CrudPage` composition standardization
  - Dashboard/table/readability and CTA hierarchy improvements
  - Token-governance hardening in shared UI surfaces
  - Citizen appointments/pagination and auth-surface convergence
  - Citizen profile edit convergence to shared `FormField` and layout primitives
  - Reusable layout primitive layer introduced (`Stack`, `Grid`, `Container`) and applied to core admin/citizen surfaces
  - Additional primitive rollout on citizen dashboard composition (`Stack` + `Grid`) and removal of remaining ad hoc section spacing
  - Domain form composition standardized with shared layout primitives (`Stack`/`Grid`) in appointments, events, clippings, media contacts, press releases, and social media forms
  - Auth and legal page composition aligned with shared primitives (`Stack`, `Container`, `FormField`) to reduce ad hoc wrapper divergence
  - Citizen auth flows and citizen-records form migrated to shared form/layout primitives, removing remaining legacy form wrapper patterns in key workflows
  - Admin users invite modal and settings profile password flow updated to shared primitive composition (`Stack` + `Button`) for consistent form structure in staff workflows
  - Final legacy form wrappers removed in citizen profile edit and shared auth/contact components (`CitizenProfilePage`, `LoginForm`, `ContactForm`) to complete primitive-first composition on high-reuse forms
  - Domain form action rows converted from legacy `div` wrappers to primitive-based `Stack` composition across all core module forms
  - Staff and citizen auth page shells (`page/card/header/body/footer`) migrated to primitive-driven `Stack` composition for consistent macro layout structure
  - Public landing page width governance aligned to shared `Container` primitives (utility bar, hero, and feature sections), removing duplicated local max-width container rules
  - Legal pages moved to `Container maxWidth` governance with simplified global legal wrapper styling, eliminating mixed width control paths
  - Remaining landing/public sections (`CtaSection`, `ContactSection`, `TestimonialsSection`, `LgpdSection`, `VisualBanner`) aligned to shared `Container` primitives and simplified section spacing rules
  - Shared `Footer` and `CitizenPortalLayout` main content refactored to container-primitive governance, removing final manual max-width wrapper implementations in core shells
  - Inline-style debt reduced in shared/demo surfaces (`DashboardMockup`, `Skeleton` multiline rendering)
  - Style governance script refined from broad noise detection to actionable token debt signals (advisory baseline reduced from **31 to 0 findings**)
  - CI governance gate added to enforce token/style compliance on every PR/push (`check:style-tokens:strict` in CI workflow)

### Remaining Immediate Focus
- Continue systemic layout primitive rollout (`Stack/Grid/Container`) across remaining pages to close P0 composition debt.
- Keep `check:style-tokens` at 0 findings as a governance baseline in shared `UI/layout/global` surfaces.
- Advance from quick-win completion to full phase-level P0/P1 standardization (shared layout contracts, dashboard/readability governance, and token-rule enforcement).

---

## 1. Issue Extraction & Prioritization

### Priority Legend
- 🟥 P0: Structural layout failure or system scalability risk
- 🟧 P1: Major layout inconsistency or poor dashboard usability
- 🟨 P2: Visual hierarchy, spacing, or styling inconsistency
- 🟩 P3: Modernization, polish, or enhancement opportunity

### Prioritized Issue Table

| # | Issue | Area | Layout/Style Impact | Users Affected | Effort | Dependencies | Source Section |
| - | ----- | ---- | ------------------- | -------------- | ------ | ------------ | -------------- |
| 1 | Container and width fragmentation across shells (`1400px`, `1200px`, `72rem`) | Layout architecture | Breaks global rhythm and cross-module consistency; blocks scalable layout governance | All staff + citizen + public users | M | None (foundational) | Executive Summary; Sections 2, 5, 11 |
| 2 | Lack of standardized layout primitives (`Stack/Grid/Container` layer absent) | Layout system | Forces ad hoc page composition and increases divergence over time | Staff-heavy modules; indirectly all roles | L | #1 baseline alignment | Executive Summary; Sections 3, 11 |
| 3 | Dashboard CRUD/table views have high data density and reduced scanability | Dashboard usability | Slower comprehension and actioning in core operational views | super_admin, admin, assessor, social_media, atendente | M | #1, #2 | Sections 4, 7, 11 |
| 4 | Token bypass hotspots (hardcoded values + inline style in reusable surfaces) | Design system | Reduces theming/reskin leverage and consistency control | All roles | M | #1 standards | Executive Summary; Sections 5, 11 |
| 5 | Parallel auth styling systems (staff auth vs citizen auth) | Role-based consistency | Duplicate maintenance surface and style drift across role journeys | citizen + all staff roles | M | #2 for reusable composition | Executive Summary; Sections 3, 8, 10, 11 |
| 6 | Border-heavy table/data rhythm | Surface design | Visual noise in data-heavy pages; lower readability under operational load | Staff roles (core modules) | M | #3 dashboard/data pass | Sections 3, 6, 7, 11 |
| 7 | Dashboard first fold has competing visual accents/layers | Dashboard usability | Important signals compete for attention; hierarchy load increases | Staff roles | S-M | #3 | Sections 4, 7 |
| 8 | CTA emphasis inconsistent on dense table-first pages | Visual hierarchy | Primary actions less obvious in operational contexts | Staff roles | S-M | #3 | Sections 4, 7 |
| 9 | Heading-depth plateau (H1-H3 only; no deeper semantic hierarchy) | Typography + hierarchy | Limits semantic chunking on complex pages and long-term content scalability | All roles | S | None | Sections 4, 11 |
| 10 | Spacing inconsistency from ad hoc px/gap usage | Spacing system | Inconsistent rhythm and cross-page polish gaps | All roles | M | #4 token governance | Sections 5, 11 |
| 11 | Custom shadows override semantic elevation tokens in places | Surface design | Uneven depth language; harder global visual tuning | All roles | S-M | #4 | Section 5 |
| 12 | Excess divider reliance vs whitespace-first grouping | Modern UI alignment | Makes dense interfaces feel heavier than modern SaaS norms | Staff-heavy modules + citizen profile pages | M | #6 | Sections 6, 11 |
| 13 | Citizen appointments page is utilitarian with weaker hierarchy/contextual filtering cues | Citizen-facing clarity | Lower perceived clarity and confidence in public-facing experience | citizen | S-M | #3 + #8 | Section 4; Section 9 |
| 14 | Citizen profile edit uses standalone form system vs shared form abstraction | Form consistency | Higher maintenance variance and inconsistent form behavior language | citizen | M | #5 + #2 | Sections 2, 8 |
| 15 | Pagination style divergence between citizen list and shared data-table patterns | Component consistency | Cross-context interaction inconsistency | citizen | S | #2 | Section 2 |
| 16 | `display: contents` in portal top-nav wrapper flagged for maintainability risk | Layout anti-pattern | Increases structural fragility in navigation composition | citizen | S | #2 | Section 2 |
| 17 | Settings profile page visual grammar diverges from standardized CRUD/page rhythm | Module consistency | Adds module-level style fragmentation | Staff roles | S-M | #2 | Section 2 |
| 18 | Role-based layout is structurally clean, but style-level fragmentation persists across contexts | Role-based consistency | Consistency debt accumulates between staff/public/citizen experiences | All roles | M | #1, #2, #5 | Section 10 |

### Priority Totals

| Priority | Count |
| -------- | ----- |
| 🟥 P0 | 2 |
| 🟧 P1 | 6 |
| 🟨 P2 | 8 |
| 🟩 P3 | 2 |

### Required Summary
- Most affected modules: Admin dashboard, domain CRUD modules (press releases, media contacts, clipping, events, appointments, citizen records, social media), auth surfaces, citizen profile/appointments.
- Most affected roles: Staff roles (`super_admin`, `admin`, `assessor`, `social_media`, `atendente`) for dashboard/data density issues; `citizen` for clarity/consistency issues; all roles for systemic token/container issues.
- Most critical layout/system weaknesses:
  - Container fragmentation
  - Missing reusable layout composition layer
  - Dashboard/data-density readability debt
- Most impactful style inconsistencies:
  - Token bypass/hardcoded values
  - Auth/citizen style duplication
  - Border-heavy surfaces with reduced whitespace hierarchy

### Secom-Specific Focus Check
- Dashboard layout issues prioritized: **Yes** (P1 cluster #3, #6, #7, #8).
- Citizen-facing layout issues elevated: **Yes** (#13, #14, #15, #16, #18).
- Token/system-level issues treated as systemic: **Yes** (P0/P1 #1, #2, #4, #10, #11).

---

## 2. Layout & Style Debt Assessment

### Debt Categories

| Debt Category | Description | Risk if Ignored | Effort Estimate | Priority | Source Section |
| ------------- | ----------- | --------------- | --------------- | -------- | -------------- |
| Layout system fragmentation | Mixed container widths and shell-level sizing strategies | Ongoing cross-module inconsistency and costly future standardization | 12-16 dev-days | 🟥 P0 | Sections 2, 5, 11 |
| Lack of reusable layout primitives | No shared abstraction for common page composition patterns | Continued ad hoc composition and divergence growth | 12-18 dev-days | 🟥 P0 | Sections 3, 11 |
| Design token adoption gaps | Hardcoded values and inline surface styles in reusable contexts | Slower theming, weaker design-system governance | 8-12 dev-days | 🟧 P1 | Section 5; Section 11 |
| Spacing system inconsistency | Non-tokenized spacing pockets and inconsistent rhythm | Persistent visual drift and inconsistent readability | 6-10 dev-days | 🟨 P2 | Section 5; Section 11 |
| Typography inconsistency | Limited hierarchy depth and inconsistent emphasis in dense pages | Reduced semantic clarity on complex workflows | 4-7 dev-days | 🟨 P2 | Sections 4, 11 |
| Visual hierarchy weakness | CTA and emphasis competition in dense operational contexts | Slower decision/action flow in staff workflows | 8-12 dev-days | 🟧 P1 | Sections 4, 7 |
| Dashboard layout inefficiency | Density/scanability issues in admin and CRUD data surfaces | Core workflow productivity cost and perceived complexity | 12-18 dev-days | 🟧 P1 | Sections 4, 7, 11 |
| Form layout inconsistency | Citizen profile/edit and auth patterns diverge from shared form system | Inconsistent form behavior and higher maintenance burden | 7-10 dev-days | 🟨 P2 | Sections 8, 11 |
| Outdated/partial modern UI patterns | Border-heavy grouping and limited whitespace-first separation | Product appears less refined vs modern SaaS peers | 6-9 dev-days | 🟨 P2 | Section 6; Section 11 |
| Citizen-facing UI clarity debt | Citizen appointments/profile clarity and consistency opportunities | Trust/readability drag in public-facing touchpoints | 6-10 dev-days | 🟧 P1 | Sections 4, 8, 9, 10 |

### Debt Classification Roll-up
- Structural UI debt: layout fragmentation + missing layout primitives + dashboard structural density.
- Design system debt: token bypass + spacing inconsistency + elevation inconsistency.
- Visual hierarchy debt: CTA competition + heading-depth limits + dense grouping.
- Modernization debt: border-heavy patterns + citizen-facing refinement gaps.

### Estimated Debt Size
- Total estimated effort: **81-122 developer-days**.
- Confidence level: **Medium**.
- Key assumptions:
  - Scope remains limited to issues already listed in the audit.
  - 2-4 frontend engineers available in parallel.
  - No major route/domain redesign outside audit scope.

### Secom-Specific Debt Split
- Dashboard-related debt: **32-48 dev-days** (dashboard/readability/density/hierarchy cluster).
- Citizen-facing debt: **20-30 dev-days** (appointments/profile/auth consistency and clarity).
- Token-level debt: **14-22 dev-days** (hardcoded values, spacing/elevation/token governance).
- Component-level debt: **15-22 dev-days** (composition primitives, form/pagination/style convergence).

---

## 3. Phased Implementation Roadmap (2-week sprints)

## Phase 1 (Weeks 1-2): Layout System Stabilization
**Objective:** Resolve P0 structural risks and establish consistency baseline.

### Focus Areas
- Container strategy standardization across shells and major pages.
- Layout composition baseline definition (shared composition model).
- Critical hierarchy normalization for dense operational pages.

### Planned Outcomes
- One canonical container logic across staff/public/citizen contexts.
- Reduced ad hoc shell/page width variance.
- Foundations in place for dashboard and token consistency phases.

### Priority Alignment
- Primary: #1, #2
- Secondary enablement: #3, #4, #5

---

## Phase 2 (Weeks 3-4): Dashboard & Core UI Improvements
**Objective:** Improve readability and usability in highest-frequency staff workflows.

### Focus Areas
- Admin dashboard visual hierarchy and first-fold emphasis balancing.
- CRUD/table density tuning for faster scanning and actioning.
- CTA prominence improvements in table-first workflows.

### Planned Outcomes
- Reduced visual competition in key dashboards.
- Better chunking and scanability in high-density data views.
- Higher operational clarity for staff roles.

### Priority Alignment
- Primary: #3, #6, #7, #8
- Secondary: #12

---

## Phase 3 (Weeks 5-8): Design System & Consistency
**Objective:** Consolidate style governance and reduce cross-context drift.

### Focus Areas
- Token adoption hardening and removal of token bypass hotspots.
- Spacing/elevation normalization to align surfaces and rhythm.
- Form and shared component consistency convergence.

### Planned Outcomes
- Higher token-driven consistency and reskin readiness.
- Lower style drift across modules.
- Reduced maintenance burden through standardization.

### Priority Alignment
- Primary: #4, #10, #11, #14
- Secondary: #9, #15, #17

---

## Phase 4 (Weeks 9+): Modernization & Citizen Experience
**Objective:** Close modern UI gaps and elevate citizen-facing clarity/credibility.

### Focus Areas
- Whitespace-first grouping and border-load reduction.
- Citizen appointments/profile clarity and interaction consistency.
- Role-context style convergence (staff/public/citizen).

### Planned Outcomes
- Stronger modern SaaS/government visual credibility.
- Clearer citizen-facing service experience.
- Better cross-role UI coherence.

### Priority Alignment
- Primary: #5, #12, #13, #18
- Secondary: #16

---

## 4. Success Metrics & Targets

### Baseline (derived from audit statements)

| Metric | Current State | Source |
| ------ | ------------- | ------ |
| Layout consistency | 6.5/10 (Medium) | Executive Summary; Section 2 |
| Design token adoption | 76-82% proxy (High usage with moderate leakage) | Section 5 |
| Dashboard readability | 6.8/10 (Medium-High with density constraints) | Sections 4, 7 |
| Visual hierarchy clarity | 7.2/10 (Medium-High with dense-page inconsistencies) | Executive Summary; Section 4 |
| Modern UI alignment | 6.5/10 (Medium) | Executive Summary; Section 6 |

### 3-Month Targets

| Metric | Target | Priority |
| ------ | ------ | -------- |
| Layout consistency | >=9/10 | P0 |
| Token adoption | >=95% | P1 |
| Dashboard readability | >=9/10 | P1 |
| Visual hierarchy clarity | >=9/10 | P1 |
| Modern UI alignment | >=8.5/10 | P2 |

### Secom Tracking Focus
- Dashboard usability improvement trend (admin + CRUD density/readability).
- Citizen portal clarity trend (appointments/profile/auth coherence).
- Token adoption progression (hardcoded/inlined style reduction).

---

## 5. UI Layout & Style Maturity Score

## Current Score: **68 / 100**

### Dimension Scoring

| Dimension | Score (0-100) | Audit Basis |
| --------- | ------------- | ----------- |
| Layout system structure | 64 | Strong shells, fragmented container strategy |
| Component composition quality | 66 | Reusable primitives present, missing layout abstraction layer |
| Visual hierarchy effectiveness | 72 | Strong macro hierarchy, dense-page CTA/scanability gaps |
| Design token adoption | 74 | High token usage with moderate leakage |
| Spacing consistency | 67 | 8pt scale exists, ad hoc pockets remain |
| Typography system maturity | 69 | Good scale definitions, hierarchy-depth plateau |
| Dashboard layout quality | 65 | Modular structure with density/readability constraints |
| Modern UI alignment | 67 | Solid baseline, incomplete whitespace/surface modernization |

### Current Maturity Stage
- **Emerging** (between Fragmented and Structured).

### Key Blockers to Next Stage
- No unified container/layout composition system.
- Dashboard/table readability debt in core staff workflows.
- Token-governance leakage (hardcoded/inlined styles).
- Cross-context style duplication (staff/public/citizen).

---

## 6. Executive Summary (Leadership-Level)

## Overall UI Layout & Style Score: **68 / 100**

### Key Strengths (from audit)
1. Clear multi-shell architecture (`PublicLayout`, `DashboardLayout`, `CitizenPortalLayout`).
2. Strong token foundation with broad adoption and dark-mode readiness.
3. Reusable core UI primitives (`CrudPage`, `DataTable`, `Modal`, `FormField`, `Card`) provide a solid base for standardization.

### Major Risks
1. **Structural layout risk:** container fragmentation and absent composition primitives constrain scalability.
2. **Dashboard usability risk:** density and visual competition in core staff pages can reduce operational efficiency.
3. **Visual credibility risk:** style duplication and border-heavy patterns reduce perceived polish vs modern SaaS/government benchmarks.

### Estimated Investment
- Estimated effort: **81-122 developer-days**.
- Indicative timeline: **9-12 weeks** with 2-4 frontend engineers (parallelized by phase).
- Risk if delayed: compounding design-system debt, slower dashboard workflows, and lower citizen-facing clarity credibility.

### Recommendation
- **Moderate UI system refactor required.**
  - Targeted fixes alone will not fully resolve systemic container/composition/token-governance debt identified in the audit.

---

## 7. Secom Strategic Alignment Summary
- Dashboard-first execution is explicitly prioritized in Phase 2 and reflected in P1 issue concentration.
- Citizen-facing clarity is elevated in Phase 4 and in P1/P2 citizen issue cluster.
- Design-system leverage is treated as systemic through P0/P1 token/container/composition work, not isolated patching.
- Module consistency is addressed through standardized composition and convergence initiatives.
- Modern SaaS alignment is pursued through density/hierarchy/surface refinement while preserving institutional government clarity.
