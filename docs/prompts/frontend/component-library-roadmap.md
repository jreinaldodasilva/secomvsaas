Excellent — below is the **component-library scoped equivalent** of your architecture prompt, adapted specifically for:

* `docs/architecture/frontend/component-library-part-1.md`
* `docs/architecture/frontend/component-library-part-2.md`
* `docs/architecture/frontend/component-library-part-3.md`

This version:

* Keeps strict scope boundaries
* Prevents cross-document inference
* Focuses on design system & component architecture quality
* Converts documented issues into an actionable roadmap
* Maintains CTO-level clarity

---

# PROMPT (Component Library–Scoped Version)

# Secom – Component Library Improvement Roadmap

**Source Documents:**

* `docs/architecture/frontend/component-library-part-1.md`
* `docs/architecture/frontend/component-library-part-2.md`
* `docs/architecture/frontend/component-library-part-3.md`

**Scope Restriction:** Component Library documentation only

---

## Context

You are generating a **strategic improvement roadmap strictly from the Component Library documentation**.

You must:

* Use only findings, gaps, inconsistencies, risks, and recommendations explicitly described in the three Part1–Part3 documents
* Not reference any other frontend documents
* Not assume issues from architecture, UX audit, accessibility audit, or performance documents
* Not invent design system debt outside what is implied in these documents
* Clearly reference the relevant Part (Part1, Part2, or Part3)

This is a **component-library-focused roadmap**, not a full frontend or product roadmap.

---

# Objective

Transform documented findings into:

1. Prioritized component system issues
2. Design system hardening plan
3. Component-level technical debt estimate
4. Phased improvement roadmap
5. Component library maturity score
6. Executive summary for leadership

---

# 1. Component Library Issue Extraction

Extract every issue related to:

* Component consistency
* API standardization
* Prop design patterns
* Reusability gaps
* Variant inconsistency
* Theming support
* Token usage
* Accessibility implementation (only if documented)
* Responsiveness patterns
* Composition vs inheritance problems
* Duplication across components
* Naming conventions
* Documentation gaps
* Storybook coverage (if mentioned)
* Testing strategy for components (if mentioned)
* Styling strategy inconsistencies
* Atomic design violations (if mentioned)
* Dependency usage within components
* Cross-component coupling
* Layout primitives consistency
* Form component standardization
* Interaction behavior inconsistencies
* Error/empty/loading state standardization

---

## 1.1 Prioritized Component Issues

### 🟥 P0 – Design System Instability / Breaking Inconsistency

| # | Issue | Component Area | System Impact | Effort | Dependencies | Source Part |
| - | ----- | -------------- | ------------- | ------ | ------------ | ----------- |

---

### 🟧 P1 – High Maintainability / Consistency Risks

[Same structure]

---

### 🟨 P2 – Structural Improvements

[Same structure]

---

### 🟩 P3 – Enhancements & Optimization

[Same structure]

---

### Severity Criteria

* 🟥 Component API instability, inconsistent behavior breaking UX predictability
* 🟧 Long-term maintainability or scaling risk
* 🟨 Standardization opportunity
* 🟩 Strategic enhancement

---

## Deliverable:

Component-prioritized issue inventory with traceability to Part1/2/3.

---

# 2. Component Library Quick Wins

Identify low-effort improvements clearly supported by the documentation.

Examples (only if supported):

* Prop normalization
* Variant consolidation
* Naming standard cleanup
* Removing duplicate components
* Token alignment fixes
* Default accessibility attributes
* Loading state standardization
* Ref forwarding consistency
* Documentation template standardization
* Story coverage expansion (if documented gap)

⚠️ Only include improvements supported by the three documents.

---

## Quick Win Format

**Quick Win #1: [Title]**

* **Component Problem**
* **Impact**
* **Effort**
* **Implementation Steps**
* **Risk Level**
* **Source Part**

Target: 8–15 quick wins.

---

## Deliverable:

Component-scoped quick wins with clear implementation guidance.

---

# 3. Component Library Technical Debt Assessment

Break down only component-system-related debt.

---

## Categories

* Component API inconsistency debt
* Styling standardization debt
* Token misalignment debt
* Accessibility implementation gaps (if documented)
* Variant explosion debt
* Documentation debt
* Testing debt (component-level only if mentioned)
* Duplication debt
* Naming inconsistency debt
* Composition misuse debt

---

## Debt Table

| Category | Description | Risk if Ignored | Effort Estimate | Priority | Source Part |
| -------- | ----------- | --------------- | --------------- | -------- | ----------- |

Provide:

* Total estimated developer-days
* Confidence level
* Assumptions

---

# 4. Phased Component Library Roadmap

Assume:

* 3–5 frontend engineers
* 2-week sprints
* Parallel component refactoring allowed

---

## Phase 1 – Stabilization (Weeks 1–2)

Focus:

* P0 issues
* API-breaking inconsistencies
* Critical duplication
* Core component instability

---

## Phase 2 – Standardization (Weeks 3–6)

Focus:

* Prop consistency
* Variant normalization
* Token alignment
* Naming conventions
* Layout primitives cleanup

---

## Phase 3 – Hardening & Scalability (Weeks 7–10)

Focus:

* Accessibility enforcement (if documented)
* Testing improvements
* Documentation coverage
* Composition refinement
* Theming improvements

---

## Phase 4 – Design System Maturity (Weeks 11–14)

Focus:

* Advanced composition patterns
* Strict API governance
* Deprecation strategy
* Performance optimization within components

---

Each phase must include:

* Goal
* Included issues (by ID)
* Effort estimate
* Dependencies
* Business/design impact

---

# 5. Component Library KPIs & Success Metrics

Define metrics strictly relevant to component system quality.

Examples (only if supported by documents):

| Metric                      | Current State | Target                              | Measurement         |
| --------------------------- | ------------- | ----------------------------------- | ------------------- |
| Component duplication ratio | ?             | -50%                                | Static analysis     |
| Variant consistency         | ?             | Standardized APIs                   | Component audit     |
| Token compliance            | ?             | 100% usage                          | Style audit         |
| Accessibility coverage      | ?             | Full compliance for base components | Accessibility audit |
| Documentation coverage      | ?             | 100% core components documented     | Doc review          |
| API consistency score       | ?             | ≥ 90% standardized                  | Prop analysis       |

Do NOT include unrelated frontend architecture metrics.

---

# 6. Component Library Maturity Score

Score 0–100 based only on the three documents.

Breakdown:

* API consistency
* Reusability
* Theming structure
* Accessibility integration
* Documentation completeness
* Standardization discipline
* Variant management
* Governance clarity

Provide:

* Current maturity stage (Ad-hoc, Emerging, Structured, Design-System-Driven, Enterprise-Ready)
* Key blockers preventing next level

---

# 7. Executive Summary (Leadership-Level)

Provide:

### Overall Component Library Health Score

X / 100

---

### Key Strengths

1.
2.
3.

---

### Major Risks

1.
2.
3.

---

### Estimated Investment

* Total developer-days:
* Timeline:
* Risk if delayed:

---

### Recommendation

Choose one:

* Requires targeted standardization
* Moderate design system refactor required
* Strategic design system overhaul recommended

Keep concise and strategic (1–2 pages equivalent).

---

# Output Files

## File 1:

`docs/roadmaps/frontend/component-library-improvement.md`

Must include:

* Prioritized component issues
* Phased roadmap
* Debt estimate
* KPIs
* Maturity score
* Executive summary

---

## File 2:

`docs/roadmaps/frontend/component-library-quick-wins.md`

Must include:

* Component-level quick wins
* Implementation steps
* Effort estimates
* Impact explanation
* Source traceability (Part1/2/3)

---

# Writing Guidelines

* Component-library-only scope
* No cross-document inference
* Clear traceability to Part1/2/3
* Executive-level clarity
* Focus on systemic consistency
* Avoid feature-level product commentary
* Prioritize predictability, scalability, reusability, and governance

