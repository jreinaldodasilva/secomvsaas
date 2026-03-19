# PROMPT (Testing Strategy-Scoped Version)

# Secom – Testing Strategy & Quality Assurance Improvement Roadmap

**Source Document:**
`docs/backend/13-Secom-Testing-Strategy-Enterprise.md`

**Scope Restriction:** Testing strategy document only

---

## Context

You are generating a **strategic improvement roadmap strictly from the Testing Strategy Enterprise document**.

You must:

* Use only findings, weaknesses, risks, coverage gaps, and recommendations explicitly described in
  `docs/backend/13-Secom-Testing-Strategy-Enterprise.md`
* Not reference Architecture, API, MongoDB, Auth, Performance, Code Quality, or Integrations documents unless explicitly cited inside the testing document
* Not invent test gaps that are not documented or clearly implied
* Not assume coverage issues without documentation support
* Clearly reference relevant sections of the testing strategy document for each issue

This is a **testing & QA-focused roadmap**, not a full backend roadmap.

---

# Objective

Transform the testing strategy findings into:

1. Prioritized testing risks
2. QA hardening plan
3. Test-related technical debt estimate
4. Phased testing maturity roadmap
5. QA maturity score
6. Executive summary for CTO-level audience

---

# 1. Testing Issue Extraction

Extract every issue related to:

* Test coverage gaps (unit, integration, e2e)
* Branch vs line coverage imbalance
* Critical path untested
* Security test gaps
* Performance test coverage
* Load test realism
* Mocking strategy weaknesses
* Test isolation issues
* Flaky tests
* CI test execution instability
* Test execution time problems
* Inconsistent test patterns
* Factory / fixture inconsistencies
* Missing negative test cases
* Missing edge-case coverage
* Error handling test gaps
* Multi-tenant test validation gaps
* Role/permission test coverage gaps
* Regression protection gaps
* Snapshot overuse
* Hardcoded test data
* Environment parity issues
* In-memory vs real DB divergence
* Missing contract tests
* Webhook test coverage
* Background job test coverage
* Queue test gaps
* Test documentation gaps
* Test ownership ambiguity
* Release validation gaps

---

## 1.1 Prioritized Testing Issues

### 🟥 P0 – Production Risk / Regression Exposure

| # | Issue | Risk to Production | Test Layer | Effort | Dependencies | Source Section |
| - | ----- | ------------------ | ---------- | ------ | ------------ | -------------- |

Criteria:

* Critical flows not tested
* Security-critical logic untested
* Tenant scoping not validated
* Permission logic insufficiently tested
* Flaky CI blocking deployments
* Test instability masking regressions

---

### 🟧 P1 – High QA Risk

Same structure.

Criteria:

* Important flows partially tested
* Weak integration coverage
* High mocking fragility
* Insufficient edge-case testing

---

### 🟨 P2 – Testing Strategy Refinement

Same structure.

Criteria:

* Pattern inconsistencies
* Redundant tests
* Slow tests
* Test structure improvements

---

### 🟩 P3 – Enterprise QA Enhancements

Same structure.

Criteria:

* Advanced automation
* Test observability
* Mutation testing
* Coverage visualization
* Risk-based testing frameworks

---

## Deliverable:

Fully traceable, prioritized testing issue inventory.

---

# 2. Testing Quick Wins

Identify low-effort improvements mentioned or implied in the testing strategy document.

Examples may include:

* Increasing coverage threshold in CI
* Fixing flaky tests
* Consolidating factory patterns
* Standardizing test setup/teardown
* Removing duplicated fixtures
* Adding missing negative tests
* Reducing over-mocking
* Enforcing deterministic test data
* Parallelizing test runs
* Cleaning skipped tests
* Improving error assertion consistency

⚠️ Only include improvements supported in the testing document.

---

## Quick Win Format

**Quick Win #1: [Title]**

* **Testing Problem**
* **Quality Risk**
* **Effort**
* **Implementation Steps**
* **Risk Level**
* **Expected Regression Protection Gain**

Target: 5–15 quick wins maximum.

---

## Deliverable:

Testing-focused quick wins with measurable QA impact.

---

# 3. Testing Technical Debt Assessment

Break down only testing-related debt.

### Categories

* Unit test coverage debt
* Integration test coverage debt
* E2E coverage gaps
* Security testing debt
* Performance testing debt
* Mocking fragility debt
* CI test instability debt
* Flaky test debt
* Test speed debt
* Fixture duplication debt
* Test architecture inconsistency debt
* Regression safety gaps
* Contract testing debt
* Background job testing debt
* Multi-tenant validation testing debt

---

## Debt Table

| Category | Description | Risk if Ignored | Effort Estimate | Priority |
| -------- | ----------- | --------------- | --------------- | -------- |

Provide:

* Total estimated developer-days
* Confidence level
* Assumptions

Only count debt clearly supported in the testing strategy document.

---

# 4. Phased Testing Maturity Roadmap

Design a structured QA improvement roadmap.

---

## Phase 1 – Regression Protection Stabilization (Weeks 1–2)

Focus:

* Untested critical paths
* Permission & tenant scoping testing
* Security-sensitive flow coverage
* CI instability fixes
* Flaky test elimination

Include:

* All 🟥 P0 issues

Provide:

* Stabilization objectives
* Effort estimate
* Regression risk reduction
* CI stability improvement

---

## Phase 2 – Coverage Expansion (Weeks 3–6)

Focus:

* Expand integration coverage
* Reduce over-mocking
* Increase negative test cases
* Improve edge-case coverage
* Improve error handling validation

Include:

* 🟧 P1 issues

---

## Phase 3 – Test Architecture Hardening (Weeks 7–10)

Focus:

* Test pattern standardization
* Fixture consolidation
* Performance test improvement
* Queue & background job coverage
* Webhook coverage
* Contract testing (if referenced)

Include:

* 🟨 P2 issues

---

## Phase 4 – Enterprise QA Excellence (Weeks 11–14)

Focus:

* Advanced automation
* Mutation testing (if referenced)
* Risk-based test prioritization
* Coverage quality over quantity
* Observability of test reliability

Include:

* 🟩 P3 issues

---

Each phase must include:

* Clear QA objective
* Explicit issue references
* Total effort estimate
* Quality impact
* Risk if delayed

---

# 5. Testing KPIs & Success Metrics

Define metrics strictly related to testing quality.

Examples:

| Metric                        | Current State | Target              | Measurement |
| ----------------------------- | ------------- | ------------------- | ----------- |
| Overall Coverage              | ?             | ≥ audit target      | Jest        |
| Branch Coverage               | ?             | ≥ audit target      | Jest        |
| Critical Flow Coverage        | ?             | 100%                | Code map    |
| Flaky Test Rate               | ?             | 0%                  | CI logs     |
| CI Test Failure Rate          | ?             | <1%                 | CI metrics  |
| Avg Test Runtime              | ?             | < target threshold  | CI          |
| Integration Coverage          | ?             | ≥ defined target    | Jest        |
| E2E Coverage                  | ?             | Critical paths only | E2E suite   |
| Negative Test Ratio           | ?             | ≥ 30%               | Test review |
| Multi-Tenant Validation Tests | ?             | 100% enforced       | Code audit  |

Do not include performance infrastructure KPIs unless explicitly defined in the testing document.

---

# 6. QA Maturity Score

Score from 0–100 based solely on findings in the Testing Strategy document.

Breakdown:

* Coverage Depth
* Critical Path Protection
* Isolation & Determinism
* CI Reliability
* Security Test Coverage
* Integration Test Strength
* Test Architecture Quality
* Regression Safety

Provide:

* Current maturity classification:

  * Prototype Testing
  * Basic Coverage
  * Production-Ready QA
  * Structured QA
  * Enterprise QA Maturity

* Key blockers preventing next level

---

# 7. Executive Summary (CTO-Level)

Provide:

### Overall Testing & QA Health Score

X / 100

---

### Key Strengths

1.
2.
3.

---

### Major QA Risks

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

* Acceptable but needs coverage expansion
* Moderate QA hardening required
* Significant regression risk reduction required
* Strategic QA modernization recommended

Keep concise, executive-level, and strategic (1–2 pages equivalent).

---

# Output Files

## File 1:

`docs/backendroadmaps/09-Secom-Testing-Strategy-Improvement-Roadmap.md`

Must include:

* Prioritized testing issues
* Phased roadmap
* Technical debt estimate
* KPIs
* QA maturity score
* Executive summary

---

## File 2:

`docs/backendroadmaps/09-Secom-Testing-Strategy-Quick-Wins.md`

Must include:

* Testing-only quick wins
* Implementation steps
* Effort estimate
* Regression protection impact
* CI stability impact

---

# Writing Guidelines

* Testing scope only
* No cross-document inference
* Clear traceability to testing strategy sections
* Focus on regression protection and risk reduction
* Quantify risk reduction wherever possible
* Prioritize production safety and CI reliability
* Avoid architecture or performance redesign recommendations unless explicitly referenced

