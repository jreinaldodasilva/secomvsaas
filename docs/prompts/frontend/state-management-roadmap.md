Excellent — below is the **state-management–scoped equivalent** of your architecture and component prompts, adapted specifically for:

* `docs/architecture/frontend/state-management-part-1.md`
* `docs/architecture/frontend/state-management-part-2.md`
* `docs/architecture/frontend/state-management-part-3.md`

This version:

* Strictly isolates scope to state management
* Prevents cross-document inference
* Focuses on systemic state risks (not UI or backend concerns)
* Converts documented issues into an execution roadmap
* Maintains CTO-level clarity and traceability

---

# PROMPT (State-Management–Scoped Version)

# Secom – Frontend State Management Improvement Roadmap

**Source Documents:**

* `docs/architecture/frontend/state-management-part-1.md`
* `docs/architecture/frontend/state-management-part-2.md`
* `docs/architecture/frontend/state-management-part-3.md`

**Scope Restriction:** State Management documentation only

---

## Context

You are generating a **strategic improvement roadmap strictly from the Frontend State Management documentation**.

You must:

* Use only findings, risks, gaps, and recommendations explicitly described in Part1–Part3
* Not reference any other frontend documents
* Not assume issues from architecture, component library, performance audits, or backend documentation
* Not invent state-related technical debt outside what is implied in these documents
* Clearly reference the relevant Part (Part1, Part2, or Part3)

This is a **state-management-focused roadmap**, not a full frontend or product roadmap.

---

# Objective

Transform the documented findings into:

1. Prioritized state architecture risks
2. State stabilization & refactoring plan
3. State-management technical debt estimate
4. Phased implementation roadmap
5. State architecture maturity score
6. Executive summary for CTO-level audience

---

# 1. State Management Issue Extraction

Extract every issue related to:

* Global vs local state boundaries
* State ownership clarity
* State duplication
* Inconsistent state patterns
* Overuse of global stores
* Unnecessary re-renders
* Performance bottlenecks caused by state
* Improper memoization
* Selector inefficiencies
* Store modularization gaps
* State normalization issues
* Derived state anti-patterns
* Async state handling strategy
* Data fetching integration patterns
* Cache invalidation strategy
* Mutation side effects
* Race conditions
* Optimistic updates (if mentioned)
* Error state handling
* Loading state management
* Form state standardization
* Context overuse
* Coupling between state and UI
* Persistence strategy (if mentioned)
* State debugging limitations
* DevTools integration (if mentioned)
* Testing gaps for state logic
* Scalability of store structure
* Multi-tenant state isolation (if applicable)

---

## 1.1 Prioritized State Issues

### 🟥 P0 – State Instability / Production Risk

| # | Issue | State Area | System Impact | Effort | Dependencies | Source Part |
| - | ----- | ---------- | ------------- | ------ | ------------ | ----------- |

---

### 🟧 P1 – Scalability / Maintainability Risks

[Same structure]

---

### 🟨 P2 – Structural Improvements

[Same structure]

---

### 🟩 P3 – Optimization & Refinement

[Same structure]

---

### Severity Criteria

* 🟥 Data inconsistency, race conditions, major performance degradation, global instability
* 🟧 Long-term maintainability risk, architectural rigidity
* 🟨 Structural improvement opportunity
* 🟩 Optimization or governance enhancement

---

## Deliverable:

State-prioritized issue inventory with traceability to Part1/2/3.

---

# 2. State Management Quick Wins

Identify low-effort improvements clearly supported by the documentation.

Examples (only if supported by documents):

* Selector memoization fixes
* Removing duplicate state slices
* Localizing unnecessarily global state
* Adding missing loading/error states
* Extracting derived state
* Simplifying context usage
* Normalizing state shape
* Refactoring async handling pattern
* Removing redundant re-fetch logic
* Adding basic logging for state transitions

⚠️ Only include improvements supported by Part1–Part3.

---

## Quick Win Format

**Quick Win #1: [Title]**

* **State Problem**
* **Impact**
* **Effort**
* **Implementation Steps**
* **Risk Level**
* **Source Part**

Target: 8–15 quick wins.

---

## Deliverable:

State-scoped quick wins with actionable implementation guidance.

---

# 3. State Management Technical Debt Assessment

Break down only state-related debt.

---

## Categories

* Global store overexposure debt
* State duplication debt
* Async handling inconsistency debt
* Derived state misuse debt
* Selector inefficiency debt
* Re-render performance debt
* Cache invalidation debt
* Mutation side-effect debt
* Testing debt (state logic only if mentioned)
* Store modularization debt
* State persistence misconfiguration (if documented)
* Debugging & observability gaps

---

## Debt Table

| Category | Description | Risk if Ignored | Effort Estimate | Priority | Source Part |
| -------- | ----------- | --------------- | --------------- | -------- | ----------- |

Provide:

* Total estimated developer-days
* Confidence level (Low / Medium / High)
* Assumptions (if any)

---

# 4. Phased State Management Roadmap

Assume:

* 3–5 frontend engineers
* 2-week sprints
* Parallel refactoring allowed when isolated

---

## Phase 1 – Stabilization (Weeks 1–2)

Focus:

* P0 issues
* Data inconsistency
* Race conditions
* Major performance regressions
* Critical state duplication

---

## Phase 2 – Structural Refactoring (Weeks 3–6)

Focus:

* Store modularization
* Global vs local boundary cleanup
* Selector optimization
* Derived state correction
* Async flow standardization

---

## Phase 3 – Performance & Resilience (Weeks 7–10)

Focus:

* Memoization discipline
* Cache invalidation strategy
* Optimistic update handling
* Error/loading standardization
* Observability improvements

---

## Phase 4 – State Architecture Maturity (Weeks 11–14)

Focus:

* Governance patterns
* Store boundary enforcement
* Debug tooling integration
* Testing coverage expansion (if mentioned)
* Scalability reinforcement

---

Each phase must include:

* Goal
* Included issues (by ID)
* Effort estimate
* Dependencies
* Risk mitigation impact
* Business impact

---

# 5. State Management KPIs & Success Metrics

Define metrics strictly relevant to state architecture.

Examples (only if aligned with document findings):

| Metric                        | Current State | Target           | Measurement     |
| ----------------------------- | ------------- | ---------------- | --------------- |
| Global store size             | ?             | Reduced by 40%   | Store audit     |
| Duplicate state slices        | ?             | 0                | Code analysis   |
| Re-render frequency           | ?             | -30%             | Profiler        |
| Async pattern standardization | ?             | Unified strategy | Code audit      |
| Selector memoization coverage | ?             | 100%             | Static analysis |
| State-related bugs            | ?             | -50%             | Bug tracking    |

Do NOT include metrics unrelated to state management.

---

# 6. State Architecture Maturity Score

Score from 0–100 based only on Part1–Part3 findings.

Breakdown:

* Global vs local clarity
* Store modularity
* Async consistency
* Performance discipline
* Error/loading handling
* Debuggability
* Scalability
* Governance patterns

Provide:

* Current maturity stage (Ad-hoc, Growing, Structured, Advanced, Enterprise-Ready)
* Key blockers preventing next level

---

# 7. Executive Summary (CTO-Level)

Provide:

### Overall State Architecture Health Score

X / 100

---

### Key Strengths

1.
2.
3.

---

### Major State Risks

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

* Requires targeted state refactor
* Moderate structural reorganization required
* Strategic state architecture redesign recommended

Keep concise, strategic, and traceable to documented findings (1–2 pages equivalent).

---

# Output Files

## File 1:

`docs/roadmaps/frontend/state-management-improvement.md`

Must include:

* Prioritized state issues
* Phased roadmap
* Debt estimate
* KPIs
* Maturity score
* Executive summary

---

## File 2:

`docs/roadmaps/frontend/state-management-quick-wins.md`

Must include:

* State-level quick wins
* Implementation steps
* Effort estimates
* Impact explanation
* Source traceability (Part1/2/3)

---

# Writing Guidelines

* State-management-only scope
* No cross-document inference
* Clear traceability to Part1/2/3
* Executive-level clarity
* Focus on systemic data consistency and scalability
* Avoid UI-level commentary
* Prioritize stability, predictability, performance, and maintainability

