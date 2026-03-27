# UI Layout & Style Quick Wins

## Implementation Status (Updated: 2026-03-27)
- Completed quick wins: **13 / 14**
- Partially completed quick wins: **1 / 14**
- Not started quick wins: **0 / 14**

| Seq | Quick Win | Status | Evidence Summary |
| --- | --------- | ------ | ---------------- |
| 1 | Normalize app-level container width tokens across shells | ✅ Completed | Canonical container token alignment applied across dashboard/citizen/public shells; hardcoded shell widths removed from key wrappers and modal XL sizing aligned to container tokens. |
| 2 | Replace `CrudPage` inline surface/layout styles with standardized class-based token styles | ✅ Completed | `CrudPage` moved from inline style objects to CSS module classes with tokenized surface/page structure. |
| 3 | Tune dashboard first-fold visual emphasis (reduce competing accents) | ✅ Completed | Admin dashboard first fold rebalanced with clearer section hierarchy and reduced visual competition. |
| 4 | Reduce border density in primary data-table views using whitespace-first grouping | ✅ Completed | Border-heavy rhythms reduced in tables/widgets/profile sections; whitespace-first grouping increased. |
| 5 | Standardize CTA prominence pattern on table-first pages | ✅ Completed | Page-header action behavior normalized for mobile/table-first contexts, improving primary CTA prominence. |
| 6 | Apply consistent dashboard widget spacing rhythm | ✅ Completed | Dashboard widget spacing and internal list rhythm normalized. |
| 7 | Normalize card padding/radius hierarchy across dashboard + settings + citizen pages | ✅ Completed | Card language aligned across settings/dashboard/citizen pages using shared radius/padding tokens. |
| 8 | Reduce hardcoded spacing and color values in high-reuse surfaces (top 20% files first) | ✅ Completed | Shared surfaces further tokenized (buttons, layout gaps, typography micro-values, and repeated shadow patterns). |
| 9 | Align citizen appointments list visual rhythm with shared data patterns | ✅ Completed | Citizen appointments list now uses explicit section hierarchy and shared list/pagination rhythm. |
| 10 | Converge citizen profile edit form layout language with shared form conventions | 🟨 Partial | Form spacing/grouping improved, but full migration to shared form abstractions is still pending. |
| 11 | Harmonize pagination pattern between citizen list pages and shared table pattern | ✅ Completed | Citizen pagination pattern aligned with shared `DataTable` pagination language. |
| 12 | Standardize heading-depth guidance on dense operational pages (H1-H3 usage consistency) | ✅ Completed | Additional dense-page subsection headings introduced (admin/crud/citizen list contexts). |
| 13 | Consolidate duplicated auth surface styling between staff and citizen flows | ✅ Completed | Auth surfaces converged on shared sizing/border/rhythm token patterns. |
| 14 | Replace high-friction divider usage with spacing-driven section separation in key dashboards/forms | ✅ Completed | Divider usage reduced in key dashboard/form/profile areas, replaced by spacing-driven separation. |

### Remaining Gap
- **Quick Win #10 (partial):** citizen profile edit remains custom and is not fully converged to shared form primitives yet.

## Scope & Ordering Logic
- Source of truth: `docs/architecture/frontend/ui-layout-style-audit.md`
- Selection rule: high-impact, low-effort opportunities explicitly supported by audit findings.
- Ordering rule: impact vs effort, then dependency readiness.

---

## Execution Sequence

| Seq | Quick Win | Priority | Impact | Effort | Source Section |
| --- | --------- | -------- | ------ | ------ | -------------- |
| 1 | Normalize app-level container width tokens across shells | 🟧 P1 | Very High | S-M | Executive Summary; Sections 2, 5, 11 |
| 2 | Replace `CrudPage` inline surface/layout styles with standardized class-based token styles | 🟧 P1 | High | S | Sections 2, 3, 5, 11 |
| 3 | Tune dashboard first-fold visual emphasis (reduce competing accents) | 🟧 P1 | High | S-M | Sections 4, 7 |
| 4 | Reduce border density in primary data-table views using whitespace-first grouping | 🟧 P1 | High | M | Sections 3, 6, 7, 11 |
| 5 | Standardize CTA prominence pattern on table-first pages | 🟨 P2 | High | S | Section 4; Section 7 |
| 6 | Apply consistent dashboard widget spacing rhythm | 🟨 P2 | Medium-High | S | Sections 2, 7 |
| 7 | Normalize card padding/radius hierarchy across dashboard + settings + citizen pages | 🟨 P2 | Medium-High | S-M | Sections 2, 5, 6 |
| 8 | Reduce hardcoded spacing and color values in high-reuse surfaces (top 20% files first) | 🟧 P1 | High | M | Section 5; Section 11 |
| 9 | Align citizen appointments list visual rhythm with shared data patterns | 🟨 P2 | Medium-High | S-M | Sections 4, 7, 9 |
| 10 | Converge citizen profile edit form layout language with shared form conventions | 🟨 P2 | Medium-High | M | Sections 2, 8 |
| 11 | Harmonize pagination pattern between citizen list pages and shared table pattern | 🟩 P3 | Medium | S | Section 2 |
| 12 | Standardize heading-depth guidance on dense operational pages (H1-H3 usage consistency) | 🟨 P2 | Medium | S | Sections 4, 11 |
| 13 | Consolidate duplicated auth surface styling between staff and citizen flows | 🟧 P1 | High | M | Sections 3, 8, 10, 11 |
| 14 | Replace high-friction divider usage with spacing-driven section separation in key dashboards/forms | 🟨 P2 | Medium-High | M | Sections 6, 11 |

---

## Quick Win Details

### Quick Win #1: Normalize Container Widths Across Shells
- **Problem**: Mixed container strategies (`1400px`, `1200px`, `72rem`) create cross-page rhythm inconsistency.
- **Impact**: All modules and all roles; highest impact on cross-module coherence.
- **Effort**: S-M.
- **Suggested Approach**: Define a single canonical container strategy and apply consistently to shell-level wrappers.
- **Expected Outcome**: Predictable page rhythm and cleaner foundation for future visual standardization.
- **Source Section**: Executive Summary; Sections 2, 5, 11.

### Quick Win #2: Remove Inline Layout Styles in `CrudPage`
- **Problem**: Inline layout/surface styles in reusable CRUD shell bypass styling governance.
- **Impact**: All domain CRUD modules used by staff roles.
- **Effort**: S.
- **Suggested Approach**: Move structural/surface styling into standardized tokenized classes.
- **Expected Outcome**: Better consistency, easier global visual tuning, reduced style leakage.
- **Source Section**: Sections 2, 3, 5, 11.

### Quick Win #3: Rebalance Admin Dashboard First Fold
- **Problem**: Banner/stat/widget accents compete for attention in the first fold.
- **Impact**: Core staff users on highest-traffic admin page.
- **Effort**: S-M.
- **Suggested Approach**: Simplify emphasis hierarchy so primary KPI/alert/action signals are visually prioritized.
- **Expected Outcome**: Faster scanning and decisioning on dashboard load.
- **Source Section**: Sections 4, 7.

### Quick Win #4: Reduce Border-Heavy Table Rhythm
- **Problem**: Border-heavy data presentation adds visual noise in dense workflows.
- **Impact**: Staff roles across CRUD/table-heavy modules.
- **Effort**: M.
- **Suggested Approach**: Shift from divider-heavy grouping to whitespace/surface rhythm where appropriate.
- **Expected Outcome**: Cleaner scan paths and improved readability under data load.
- **Source Section**: Sections 3, 6, 7, 11.

### Quick Win #5: Standardize CTA Priority in Table-First Pages
- **Problem**: CTA prominence is inconsistent where table controls and actions compete.
- **Impact**: Staff roles in operational modules.
- **Effort**: S.
- **Suggested Approach**: Apply a shared visual priority model for primary, secondary, and row-level actions.
- **Expected Outcome**: More predictable action discoverability.
- **Source Section**: Section 4; Section 7.

### Quick Win #6: Align Dashboard Widget Spacing Rhythm
- **Problem**: Widget spacing and compact stacking can reduce digestibility.
- **Impact**: Staff dashboards, especially admin.
- **Effort**: S.
- **Suggested Approach**: Normalize internal and inter-widget spacing using existing spacing token scale.
- **Expected Outcome**: Better chunking and reduced cognitive load.
- **Source Section**: Sections 2, 7.

### Quick Win #7: Standardize Card Surface Language
- **Problem**: Card padding/radius/elevation feel uneven across modules.
- **Impact**: Staff + citizen pages using card surfaces.
- **Effort**: S-M.
- **Suggested Approach**: Apply a shared card surface matrix (padding/elevation/radius levels) to key page types.
- **Expected Outcome**: Higher visual consistency and stronger design-system expression.
- **Source Section**: Sections 2, 5, 6.

### Quick Win #8: Accelerate Token Adoption in High-Reuse Surfaces
- **Problem**: Hardcoded values and ad hoc spacing/color remain in important shared contexts.
- **Impact**: System-wide consistency and theming resilience.
- **Effort**: M.
- **Suggested Approach**: Prioritize top shared surfaces for token substitution and style governance cleanup.
- **Expected Outcome**: Faster movement toward token-driven UI with lower regression risk.
- **Source Section**: Section 5; Section 11.

### Quick Win #9: Improve Citizen Appointments Readability Rhythm
- **Problem**: Citizen appointments page is clear but utilitarian, with weaker contextual hierarchy.
- **Impact**: Citizen-facing trust and readability.
- **Effort**: S-M.
- **Suggested Approach**: Strengthen list-level hierarchy and contextual grouping using existing card/tokens patterns.
- **Expected Outcome**: More approachable and credible service experience.
- **Source Section**: Sections 4, 7, 9.

### Quick Win #10: Harmonize Citizen Profile Form Structure
- **Problem**: Citizen profile edit uses a standalone layout language vs shared form abstractions.
- **Impact**: Citizen consistency and long-term form maintenance.
- **Effort**: M.
- **Suggested Approach**: Align profile edit form grouping/spacing/error rhythm with shared form conventions.
- **Expected Outcome**: Cross-context form coherence and reduced style divergence.
- **Source Section**: Sections 2, 8.

### Quick Win #11: Normalize Pagination Pattern Across Contexts
- **Problem**: Citizen list pagination diverges from shared data-table patterns.
- **Impact**: Citizen interaction consistency.
- **Effort**: S.
- **Suggested Approach**: Align citizen pagination visual/structural pattern with shared pagination language.
- **Expected Outcome**: More predictable cross-page navigation behavior.
- **Source Section**: Section 2.

### Quick Win #12: Apply Heading Hierarchy Guidance on Dense Pages
- **Problem**: Heading depth plateaus at H1-H3, limiting semantic granularity in complex views.
- **Impact**: Staff and citizen pages with complex content grouping.
- **Effort**: S.
- **Suggested Approach**: Establish and apply a consistent hierarchy policy for dense workflows.
- **Expected Outcome**: Improved scanability and better long-term content structure.
- **Source Section**: Sections 4, 11.

### Quick Win #13: Consolidate Duplicated Auth Surface Patterns
- **Problem**: Staff and citizen auth surfaces use parallel styling systems.
- **Impact**: All roles passing through auth journeys.
- **Effort**: M.
- **Suggested Approach**: Converge shared auth layout language while preserving role-context content differences.
- **Expected Outcome**: Lower maintenance cost and better cross-role consistency.
- **Source Section**: Sections 3, 8, 10, 11.

### Quick Win #14: Replace Excess Divider Usage with Whitespace Grouping
- **Problem**: Divider-heavy grouping contributes to dense visual tone.
- **Impact**: Staff dashboards/forms and citizen profile experiences.
- **Effort**: M.
- **Suggested Approach**: Prioritize spacing-based separation in high-density sections while keeping essential boundaries.
- **Expected Outcome**: More modern, calmer, and readable interface rhythm.
- **Source Section**: Sections 6, 11.

---

## Secom-Specific Coverage Check
- Dashboard readability quick wins included: #3, #4, #5, #6.
- Citizen portal clarity quick wins included: #9, #10, #11.
- Token adoption acceleration quick wins included: #2, #8.
