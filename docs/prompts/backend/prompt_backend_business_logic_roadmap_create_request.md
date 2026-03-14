# PROMPT (Business-Logic-Scoped Version)

# Sintgesp – Business Logic Improvement Roadmap

**Primary Source Document:**
`docs/backend/09-Sintgesp-Business-Logic-Index.md`

**Scope Restriction:** Business Logic document only

---

## Context

You are generating a **strategic business-logic improvement roadmap strictly from the Business Logic Index document**.

You must:

* Use only findings, risks, inconsistencies, and recommendations explicitly described in
  `docs/backend/09-Sintgesp-Business-Logic-Index.md`
* Not reference other backend documents unless explicitly referenced inside this document
* Not assume architectural, API, or database issues unless directly tied to business rules
* Not invent domain rules not implied in the document
* Clearly trace each issue back to its source section

This is a **domain logic and rule-consistency roadmap**, not a system architecture roadmap.

---

# Objective

Transform the business logic findings into:

1. Prioritized domain-rule risks
2. Business rule consistency improvement plan
3. Business logic technical debt estimate
4. Phased domain stabilization roadmap
5. Business logic maturity score
6. Executive summary for CTO / Product / Operations leadership

---

# 1. Business Logic Issue Extraction

Extract every issue related to:

### Domain Modeling

* Domain entity boundaries
* Aggregates and invariants
* Responsibility distribution
* Service-layer overreach
* Domain leakage into controllers
* Fat services / anemic models
* Missing domain abstractions

---

### Business Rule Consistency

* Inconsistent rule enforcement
* Missing validation logic
* Duplicated rule logic
* Implicit vs explicit rule definition
* Conditional logic sprawl
* Hardcoded business constraints
* Unclear state transitions
* Undefined lifecycle states

---

### Workflow & Process Logic

* Appointment lifecycle
* Payment lifecycle
* Treatment workflow
* Status transitions
* Approval flows
* Cancellation rules
* Edge-case handling
* Rollback/compensation logic

---

### Multi-Tenant Business Rules

* Department-scoped logic enforcement
* Cross-department rule consistency
* Ownership validation
* Business isolation guarantees

---

### Financial Logic

* Pricing rules
* Discounts
* Commission calculation
* Installments handling
* Refund rules
* Ledger consistency

---

### Data Integrity & Invariants

* Atomic rule execution
* Validation ordering
* Invariant enforcement gaps
* Concurrency logic
* Idempotency in workflows

---

### Cross-Domain Coupling

* Hidden dependencies between modules
* Circular logic flows
* Rule entanglement
* High cognitive complexity areas

---

## 1.1 Prioritized Business Logic Issues

### 🟥 P0 – Critical Rule Integrity / Financial / Legal Risk

| # | Issue | Business Impact | Domain Area | Effort | Dependencies | Source Section |
| - | ----- | --------------- | ----------- | ------ | ------------ | -------------- |

---

### 🟧 P1 – Rule Inconsistency / Workflow Risk

[Same structure]

---

### 🟨 P2 – Structural Domain Improvements

[Same structure]

---

### 🟩 P3 – Optimization & Maintainability Enhancements

[Same structure]

---

### Severity Criteria

* 🟥 Financial loss, data corruption, legal exposure, invariant violation
* 🟧 Workflow inconsistency, operational instability
* 🟨 Structural clarity improvements
* 🟩 Refactoring for maintainability

---

## Deliverable:

Business-logic-prioritized issue inventory with traceability.

---

# 2. Business Logic Quick Wins

Identify low-effort domain improvements mentioned or implied in the Business Logic document.

Examples may include:

* Centralizing duplicated validation
* Extracting domain services
* Clarifying status transitions
* Defining explicit invariants
* Replacing magic numbers with domain constants
* Introducing value objects
* Normalizing financial calculations
* Standardizing cancellation rules
* Adding precondition checks

⚠️ Only include improvements supported by the Business Logic document.

---

## Quick Win Format

**Quick Win #1: [Title]**

* **Business Rule Problem**
* **Operational/Financial Risk**
* **Effort**
* **Implementation Steps**
* **Risk Reduction Impact**

Target: 5–12 quick wins maximum.

---

## Deliverable:

Business-logic-scoped quick wins with implementation guidance.

---

# 3. Business Logic Technical Debt Assessment

Break down only domain-logic-related debt.

---

### Categories

* Domain modeling debt
* Invariant enforcement debt
* Workflow consistency debt
* Financial rule debt
* Validation logic duplication debt
* Rule centralization debt
* Cross-domain coupling debt
* Lifecycle definition gaps
* State-transition complexity debt
* Conditional logic sprawl debt

---

## Debt Table

| Category | Description | Risk if Ignored | Effort Estimate | Priority |
| -------- | ----------- | --------------- | --------------- | -------- |

Provide:

* Total estimated developer-days
* Confidence level (High / Medium / Low)
* Explicit assumptions
* Risk severity level (Low / Moderate / High / Critical)

---

# 4. Phased Business Logic Stabilization Roadmap

Design a roadmap focused purely on domain and rule stabilization.

---

## Phase 1 – Critical Rule Stabilization (Weeks 1–2)

Focus:

* Financial inconsistencies
* Invariant violations
* Illegal state transitions
* Data corruption risks
* Critical workflow gaps

Must include all P0 issues.

---

## Phase 2 – Rule Consolidation & Consistency (Weeks 3–6)

Focus:

* Centralizing validation logic
* Removing duplicated rules
* Clarifying lifecycle definitions
* Defining explicit state machines
* Enforcing business invariants

---

## Phase 3 – Domain Refactoring & Separation (Weeks 7–10)

Focus:

* Extracting domain services
* Reducing service-layer complexity
* Introducing value objects
* Improving aggregate boundaries
* Reducing cross-domain entanglement

---

## Phase 4 – Domain Maturity & Optimization (Weeks 11–14)

Focus:

* Simplifying complex conditionals
* Improving idempotency logic
* Standardizing financial calculations
* Enhancing rule documentation
* Establishing domain governance guidelines

---

Each phase must include:

* Goal
* Included issues
* Total effort estimate
* Dependencies
* Business risk reduction impact
* Operational impact

---

# 5. Business Logic KPIs & Success Metrics

Define business-rule-specific metrics only.

Examples:

| Metric                                | Current State | Target         | Measurement        |
| ------------------------------------- | ------------- | -------------- | ------------------ |
| Rule duplication instances            | ?             | Reduced by 60% | Code audit         |
| Illegal state transitions             | ?             | 0              | Domain tests       |
| Financial calculation inconsistencies | ?             | 0              | Audit              |
| Workflow rollback failures            | ?             | 0              | Integration test   |
| Domain service complexity (avg)       | ?             | Reduced by 30% | Static analysis    |
| Cross-module coupling                 | ?             | Reduced        | Dependency mapping |

Do not include infrastructure, database, or API metrics unless directly tied to domain logic integrity.

---

# 6. Business Logic Maturity Score

Score from 0–100 based solely on domain findings.

Breakdown:

* Domain modeling clarity
* Invariant enforcement
* Workflow stability
* Financial logic reliability
* Rule centralization
* Coupling control
* Lifecycle clarity
* Maintainability

Provide:

* Current maturity level (Ad-hoc, Structured, Domain-Stable, Enterprise-Grade Domain)
* Key blockers to next level
* Financial/operational risk exposure level

---

# 7. Executive Summary (CTO / Product / Operations-Level)

Provide:

### Overall Business Logic Health Score

X / 100

### Key Strengths

1.
2.
3.

### Major Domain Risks

1.
2.
3.

### Estimated Investment

* Total developer-days:
* Timeline:
* Risk if delayed:
* Financial/operational impact:

### Recommendation

* Immediate rule stabilization required
* Moderate domain refactor needed
* Stable with targeted improvements
* Enterprise-grade domain foundation

Keep strategic, concise, and decision-oriented.

---

# Output Files

## File 1:

`docs/backendroadmaps/05-Sintgesp-Business-Logic-Improvement-Roadmap.md`

Must include:

* Prioritized domain issues
* Phased roadmap
* Technical debt estimate
* Business KPIs
* Maturity score
* Executive summary

---

## File 2:

`docs/backendroadmaps/05-Sintgesp-Business-Logic-Quick-Wins.md`

Must include:

* Business-logic-only quick wins
* Implementation steps
* Estimated effort
* Risk reduction impact

---

# Writing Guidelines

* Domain-first perspective
* No cross-document inference unless explicitly referenced
* Clear traceability to Business Logic sections
* Executive-level clarity
* Focus on invariants, workflows, and financial integrity
* Prioritize operational stability and rule consistency
* Avoid infrastructure or API-layer analysis unless directly tied to domain logic

