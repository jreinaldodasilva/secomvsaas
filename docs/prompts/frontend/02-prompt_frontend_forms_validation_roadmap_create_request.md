Excellent — below is the **forms & validation–scoped equivalent** of your previous structured prompts, tailored specifically for:

* `docs/frontend/02-Secom-Forms-Validation-Overview-Part1.md`
* `docs/frontend/02-Secom-Forms-Validation-Overview-Part2.md`

This version:

* Strictly isolates scope to forms and validation architecture
* Avoids cross-contamination with state, component, or backend audits
* Converts documented gaps into an execution roadmap
* Maintains CTO-level structure and traceability
* Focuses on systemic form reliability, validation consistency, and data integrity

---

# PROMPT (Forms & Validation–Scoped Version)

# Secom – Frontend Forms & Validation Improvement Roadmap

**Source Documents:**

* `docs/frontend/02-Secom-Forms-Validation-Overview-Part1.md`
* `docs/frontend/02-Secom-Forms-Validation-Overview-Part2.md`

**Scope Restriction:** Forms and Validation documentation only

---

## Context

You are generating a **strategic improvement roadmap strictly from the Forms & Validation documentation**.

You must:

* Use only findings, risks, inconsistencies, gaps, and recommendations explicitly described in Part1–Part3
* Not reference any other frontend documents
* Not assume issues from backend validation, API contracts, accessibility audits, or component architecture unless explicitly mentioned
* Not invent technical debt outside what is implied in these documents
* Clearly reference the relevant Part (Part1, Part2, or Part3)

This is a **forms & validation-focused roadmap**, not a full frontend roadmap.

---

# Objective

Transform the documented findings into:

1. Prioritized forms & validation risks
2. Form reliability and standardization plan
3. Validation-related technical debt estimate
4. Phased improvement roadmap
5. Forms maturity score
6. Executive summary for leadership

---

# 1. Forms & Validation Issue Extraction

Extract every issue related to:

* Validation strategy inconsistencies
* Client-side vs server-side validation gaps (only if discussed)
* Schema validation structure
* Field-level vs form-level validation misalignment
* Reusable form abstraction gaps
* Form state duplication
* Async validation handling
* Debouncing and performance issues
* Error message inconsistency
* Missing loading/submit states
* Validation timing (onBlur/onChange/onSubmit inconsistencies)
* Cross-field validation issues
* Dynamic form handling instability
* Conditional field rendering problems
* Multi-step form fragility
* Form reset logic inconsistencies
* Default value handling issues
* Controlled vs uncontrolled input misuse
* Form re-render performance bottlenecks
* Validation schema duplication
* Error state UX inconsistencies (only if structurally documented)
* Accessibility validation handling (if documented)
* Integration with state management (only if described)
* Form data normalization gaps
* Data transformation inconsistencies
* File upload validation issues (if mentioned)
* Security risks at validation layer (if described)
* Form testing gaps (if mentioned)
* Schema versioning problems (if mentioned)

---

## 1.1 Prioritized Forms & Validation Issues

### 🟥 P0 – Data Integrity / Submission Risk

| # | Issue | Form Area | System Impact | Effort | Dependencies | Source Part |
| - | ----- | --------- | ------------- | ------ | ------------ | ----------- |

---

### 🟧 P1 – Reliability / Maintainability Risks

[Same structure]

---

### 🟨 P2 – Structural Standardization Improvements

[Same structure]

---

### 🟩 P3 – Optimization & Refinements

[Same structure]

---

### Severity Criteria

* 🟥 Data corruption, failed submissions, inconsistent validation enforcement, security exposure
* 🟧 Long-term maintainability or scalability risk
* 🟨 Structural standardization opportunity
* 🟩 Optimization or governance improvement

---

## Deliverable:

Forms-prioritized issue inventory with traceability to Part1/2/3.

---

# 2. Forms & Validation Quick Wins

Identify low-effort improvements clearly supported by the documentation.

Examples (only if supported):

* Centralizing validation schemas
* Standardizing validation trigger timing
* Normalizing error message format
* Removing duplicated validation logic
* Enforcing consistent default value handling
* Adding missing loading states
* Simplifying cross-field validation pattern
* Extracting reusable form hooks
* Aligning validation naming conventions
* Debounce optimization

⚠️ Only include improvements supported by Part1–Part3.

---

## Quick Win Format

**Quick Win #1: [Title]**

* **Form/Validation Problem**
* **Impact**
* **Effort**
* **Implementation Steps**
* **Risk Level**
* **Source Part**

Target: 8–15 quick wins.

---

## Deliverable:

Forms-scoped quick wins with actionable implementation guidance.

---

# 3. Forms & Validation Technical Debt Assessment

Break down only forms-related debt.

---

## Categories

* Validation duplication debt
* Schema inconsistency debt
* Cross-field validation fragility debt
* Form abstraction gaps
* Async validation inconsistency debt
* Performance inefficiency debt (re-renders, debouncing)
* Error handling inconsistency debt
* Default value handling debt
* Conditional form logic complexity debt
* Multi-step form fragility debt
* Security validation gaps (if documented)
* Form testing gaps (if mentioned)
* Documentation mismatch debt

---

## Debt Table

| Category | Description | Risk if Ignored | Effort Estimate | Priority | Source Part |
| -------- | ----------- | --------------- | --------------- | -------- | ----------- |

Provide:

* Total estimated developer-days
* Confidence level (Low / Medium / High)
* Assumptions (if any)

---

# 4. Phased Forms & Validation Roadmap

Assume:

* 3–5 frontend engineers
* 2-week sprints
* Parallel refactoring allowed for independent forms

---

## Phase 1 – Stabilization (Weeks 1–2)

Focus:

* P0 issues
* Data integrity risks
* Submission failures
* Critical validation inconsistencies
* Security exposure at validation layer

---

## Phase 2 – Standardization (Weeks 3–6)

Focus:

* Schema consolidation
* Validation timing alignment
* Error message normalization
* Form abstraction enforcement
* Cross-field validation correction

---

## Phase 3 – Performance & Resilience (Weeks 7–10)

Focus:

* Debounce optimization
* Re-render reduction
* Async validation flow improvement
* Multi-step flow stabilization
* Conditional rendering simplification

---

## Phase 4 – Forms Governance & Maturity (Weeks 11–14)

Focus:

* Validation governance patterns
* Testing coverage expansion (if mentioned)
* Documentation alignment
* Reusable form toolkit consolidation
* Future-proofing strategy

---

Each phase must include:

* Goal
* Included issues (by ID)
* Effort estimate
* Dependencies
* Risk mitigation impact
* Business impact

---

# 5. Forms & Validation KPIs

Define metrics strictly relevant to forms reliability and validation consistency.

Examples (only if aligned with document findings):

| Metric                           | Current State | Target       | Measurement |
| -------------------------------- | ------------- | ------------ | ----------- |
| Validation duplication instances | ?             | -50%         | Code audit  |
| Submission failure rate          | ?             | -75%         | Error logs  |
| Cross-field validation bugs      | ?             | 0            | QA tracking |
| Form re-render frequency         | ?             | -30%         | Profiler    |
| Schema centralization            | ?             | 100% unified | Code review |
| Error message consistency        | ?             | Standardized | Audit       |

Do NOT include unrelated performance, architecture, or accessibility metrics unless documented.

---

# 6. Forms Maturity Score

Score 0–100 based only on Part1–Part3 findings.

Breakdown:

* Validation consistency
* Schema governance
* Data integrity enforcement
* Performance discipline
* Error handling standardization
* Reusability & abstraction
* Multi-step form robustness
* Documentation clarity

Provide:

* Current maturity stage (Ad-hoc, Fragmented, Standardizing, Structured, Enterprise-Grade)
* Key blockers preventing next level

---

# 7. Executive Summary (Leadership-Level)

Provide:

### Overall Forms & Validation Health Score

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

* Requires targeted validation standardization
* Moderate forms refactor required
* Strategic form system overhaul recommended

Keep concise, strategic, and traceable to documented findings (1–2 pages equivalent).

---

# Output Files

## File 1:

`docs/frontendroadmaps/02-Secom-Forms-Validation-Improvement-Roadmap.md`

Must include:

* Prioritized forms issues
* Phased roadmap
* Debt estimate
* KPIs
* Maturity score
* Executive summary

---

## File 2:

`docs/frontendroadmaps/02-Secom-Forms-Validation-Quick-Wins.md`

Must include:

* Forms-level quick wins
* Implementation steps
* Effort estimates
* Impact explanation
* Source traceability (Part1/2/3)

---

# Writing Guidelines

* Forms-and-validation-only scope
* No cross-document inference
* Clear traceability to Part1/2/3
* Executive-level clarity
* Focus on data integrity, consistency, and maintainability
* Avoid UI design critique unless structurally documented
* Prioritize reliability, predictability, and governance

