
# PROMPT (Code Quality & Enterprise Engineering-Scoped Version)

# Secom – Code Quality & Enterprise Engineering Improvement Roadmap

**Source Document:**
`docs/backend/12-Secom-Code-Quality-Enterprise-Audit.md`

**Scope Restriction:** Code quality & enterprise engineering audit document only

---

## Context

You are generating a **strategic improvement roadmap strictly from the Code Quality Enterprise Audit document**.

You must:

* Use only findings, risks, technical debt, inconsistencies, and recommendations explicitly described in
  `docs/backend/12-Secom-Code-Quality-Enterprise-Audit.md`
* Not reference Architecture, MongoDB, API, Auth, Integrations, Performance, or Business Logic documents
* Not invent technical debt outside what is identified or clearly implied in the audit
* Not assume production issues unless described in the audit
* Clearly reference relevant audit sections for every issue

This is a **code-quality-focused roadmap**, not a full backend roadmap.

---

# Objective

Transform the code quality audit findings into:

1. Prioritized engineering risks
2. Structural refactor plan
3. Code-quality technical debt estimate
4. Phased improvement roadmap
5. Engineering maturity score
6. Executive summary for CTO-level audience

---

# 1. Code Quality Issue Extraction

Extract every issue related to:

* Code duplication
* Large file size / God classes
* Service layer violations
* Architectural boundary violations
* Naming inconsistencies
* Dead code
* Legacy patterns
* Inconsistent validation strategy
* Error handling inconsistencies
* Logging inconsistencies
* TypeScript typing gaps
* any usage or unsafe casts
* DTO inconsistencies
* Missing abstraction layers
* Tight coupling
* Circular dependencies
* Test coverage gaps (if mentioned)
* Mocking inconsistencies
* Code organization drift
* Folder structure inconsistencies
* Static analysis gaps
* ESLint / Prettier violations
* Missing strict mode enforcement
* Dependency hygiene issues
* Unused dependencies
* Build warnings
* Inconsistent import patterns
* Poor separation of concerns
* Maintainability bottlenecks
* Refactor candidates (explicitly mentioned)

---

## 1.1 Prioritized Code Quality Issues

### 🟥 P0 – Critical Maintainability Risk

| # | Issue | Engineering Impact | Code Area | Effort | Dependencies | Source Section |
| - | ----- | ------------------ | --------- | ------ | ------------ | -------------- |

Criteria:

* Prevents safe scaling of team
* High regression risk
* Strong coupling blocks refactors
* Major TypeScript safety breakdown
* Large God services
* Circular dependencies

---

### 🟧 P1 – High Technical Debt

Same structure.

Criteria:

* Slows development velocity
* Causes bug-prone changes
* Inconsistent patterns
* Repeated logic across modules

---

### 🟨 P2 – Structural Refinement

Same structure.

Criteria:

* Improvement opportunity
* Pattern standardization
* Minor refactors for consistency

---

### 🟩 P3 – Enterprise Hardening & Clean Code Enhancements

Same structure.

Criteria:

* Long-term engineering excellence
* Developer experience improvements
* Refactor polish

---

## Deliverable:

Fully traceable, prioritized code-quality issue inventory.

---

# 2. Code Quality Quick Wins

Identify low-effort improvements mentioned or clearly implied in the audit.

Examples may include:

* Extracting utility helpers
* Reducing file size via splitting services
* Removing unused imports
* Enforcing consistent naming
* Consolidating validation patterns
* Removing duplicate DTOs
* Cleaning dead code
* Replacing any with proper types
* Enabling stricter TypeScript flags
* ESLint rule enforcement
* Prettier config normalization
* Removing legacy validator folder

⚠️ Only include improvements supported by the Code Quality audit.

---

## Quick Win Format

**Quick Win #1: [Title]**

* **Code Quality Problem**
* **Maintainability Impact**
* **Effort**
* **Implementation Steps**
* **Risk Level**
* **Expected Maintainability Gain**

Target: 5–15 quick wins maximum.

---

## Deliverable:

Code-quality quick wins with measurable developer-experience impact.

---

# 3. Code Quality Technical Debt Assessment

Break down only code-quality-related debt.

### Categories

* File size & God object debt
* Duplication debt
* Typing safety debt
* Validation inconsistency debt
* Error handling inconsistency debt
* Logging inconsistency debt
* Testing structure debt
* Architectural boundary drift
* Static analysis debt
* Dependency hygiene debt
* Build process debt
* Code organization debt
* Refactor backlog

---

## Debt Table

| Category | Description | Risk if Ignored | Effort Estimate | Priority |
| -------- | ----------- | --------------- | --------------- | -------- |

Provide:

* Total estimated developer-days
* Confidence level
* Assumptions

Only count debt explicitly described or implied in the audit document.

---

# 4. Phased Code Quality Roadmap

Design a structured engineering improvement roadmap.

---

## Phase 1 – Stabilization & Safety (Weeks 1–2)

Focus:

* Critical maintainability blockers
* Type safety gaps
* Circular dependencies
* Large God services
* Unsafe patterns

Include:

* All 🟥 P0 issues

Provide:

* Clear refactor objectives
* Total effort
* Regression risk mitigation
* Expected engineering stability gain

---

## Phase 2 – Structural Refactoring (Weeks 3–6)

Focus:

* Extract shared utilities
* Standardize validation patterns
* Consolidate DTOs
* Improve service boundaries
* Reduce duplication
* Normalize error handling

Include:

* 🟧 P1 issues

---

## Phase 3 – Engineering Consistency & Standards (Weeks 7–10)

Focus:

* Naming conventions
* ESLint/Prettier hardening
* Strict TypeScript configuration
* Folder structure cleanup
* Dependency pruning
* Logging standardization

Include:

* 🟨 P2 issues

---

## Phase 4 – Enterprise Engineering Maturity (Weeks 11–14)

Focus:

* Developer experience improvements
* CI enforcement
* Static analysis integration
* Documentation alignment
* Long-term maintainability hardening

Include:

* 🟩 P3 issues

---

Each phase must include:

* Clear engineering objective
* Explicit issue references
* Total effort estimate
* Developer velocity impact
* Risk if delayed

---

# 5. Code Quality KPIs & Success Metrics

Define metrics strictly related to code quality.

Examples:

| Metric                        | Current State | Target         | Measurement         |
| ----------------------------- | ------------- | -------------- | ------------------- |
| Avg Service File Size         | ?             | <400 LOC       | Static analysis     |
| Largest File                  | ?             | <600 LOC       | Code scan           |
| any Usage Count               | ?             | 0              | TypeScript compiler |
| ESLint Errors                 | ?             | 0              | CI                  |
| Duplication Ratio             | ?             | <5%            | Static analysis     |
| Circular Dependencies         | ?             | 0              | Dependency graph    |
| Type Coverage                 | ?             | 100%           | TS metrics          |
| Test Coverage (if referenced) | ?             | ≥ audit target | Jest report         |
| Lint Rule Compliance          | ?             | 100%           | CI                  |

Do not include performance or security metrics unless explicitly mentioned in the audit.

---

# 6. Engineering Maturity Score

Score from 0–100 based solely on the Code Quality audit findings.

Breakdown:

* Maintainability
* Modularity
* Type Safety
* Testability
* Consistency
* Static Analysis Discipline
* Refactor Readiness
* Developer Experience

Provide:

* Current maturity classification:

  * Prototype
  * MVP
  * Production-Ready
  * Structured Engineering
  * Enterprise Engineering Grade

* Key blockers preventing next level

---

# 7. Executive Summary (CTO-Level)

Provide:

### Overall Code Quality Health Score

X / 100

---

### Key Strengths

1.
2.
3.

---

### Major Engineering Risks

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

* Acceptable but needs cleanup
* Moderate refactor required
* Significant structural refactor required
* Strategic engineering hardening required

Keep concise, executive-level, and strategic (1–2 pages equivalent).

---

# Output Files

## File 1:

`docs/backendroadmaps/08-Secom-Code-Quality-Improvement-Roadmap.md`

Must include:

* Prioritized code-quality issues
* Phased roadmap
* Technical debt estimate
* KPIs
* Engineering maturity score
* Executive summary

---

## File 2:

`docs/backendroadmaps/08-Secom-Code-Quality-Quick-Wins.md`

Must include:

* Code-quality-only quick wins
* Implementation steps
* Effort estimate
* Maintainability impact
* Developer velocity improvement expectations

---

# Writing Guidelines

* Code quality scope only
* No cross-document inference
* Clear traceability to audit sections
* Focus on maintainability and engineering scalability
* Avoid operational performance recommendations
* Quantify developer-impact improvements where possible
* Prioritize regression risk reduction and team scalability

