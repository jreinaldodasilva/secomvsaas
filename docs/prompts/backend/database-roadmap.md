# PROMPT (MongoDB-Architecture-Scoped Version)

# Secom – MongoDB Architecture Improvement Roadmap

**Source Document:** `docs/backend/02-Secom-MongoDB-Architecture.md`
**Scope Restriction:** MongoDB Architecture document only

---

## Context

You are generating a **strategic database improvement roadmap strictly from the MongoDB Architecture document**.

You must:

* Use only findings, risks, gaps, and recommendations explicitly described in
  `docs/backend/02-Secom-MongoDB-Architecture.md`
* Not reference any other backend documents
* Not assume issues from API, testing, security, or backend architecture audits
* Not invent database technical debt outside what is implied in the MongoDB architecture review
* Clearly reference relevant MongoDB architecture sections

This is a **database-architecture-focused roadmap**, not a full backend or infrastructure roadmap.

---

# Objective

Transform the MongoDB architectural findings into:

1. Prioritized database risks
2. Data-architecture improvement plan
3. Database technical debt estimate
4. Phased MongoDB improvement roadmap
5. MongoDB maturity score
6. Executive summary for CTO / Head of Engineering

---

# 1. MongoDB Architecture Issue Extraction

Extract every issue related to:

* Data modeling strategy (embedding vs referencing)
* Collection design
* Schema consistency
* Multi-tenant data isolation
* Index strategy
* Query performance risks
* Aggregation complexity
* Document growth patterns
* Transaction usage
* Atomicity guarantees
* Sharding readiness
* Replica set configuration
* Backup and restore strategy
* Write/read scaling
* Locking and contention risks
* Data integrity constraints
* Soft-delete patterns
* TTL/index lifecycle policies
* Migration/versioning strategy
* Observability of database performance
* Data compliance concerns (if mentioned)

---

## 1.1 Prioritized MongoDB Issues

### 🟥 P0 – Data Integrity / Isolation / Production Risk

| # | Issue | Database Impact | Collection / Area | Effort | Dependencies | Source Section |
| - | ----- | --------------- | ----------------- | ------ | ------------ | -------------- |

---

### 🟧 P1 – Performance / Scalability Risks

[Same structure]

---

### 🟨 P2 – Structural Modeling Improvements

[Same structure]

---

### 🟩 P3 – Optimization & Strategic Enhancements

[Same structure]

---

### Severity Criteria

* 🟥 Data leakage, tenant scoping risk, corruption risk, unindexed critical queries
* 🟧 High latency risk, scaling blockers, inefficient data patterns
* 🟨 Modeling refinements, structural optimization
* 🟩 Strategic improvements or long-term enhancements

---

## Deliverable:

MongoDB-prioritized issue inventory with traceability to the source document.

---

# 2. MongoDB Quick Wins

Identify low-effort database improvements mentioned or implied in the MongoDB architecture document.

Examples may include:

* Adding missing indexes
* Converting collection scans to indexed queries
* Enforcing compound index alignment
* Adding TTL indexes
* Removing unused indexes
* Enforcing tenantId index for multi-tenancy
* Enabling query profiling
* Minor schema refinements
* Improving projection usage
* Adding unique constraints

⚠️ Only include improvements supported by the MongoDB architecture document.

---

## Quick Win Format

**Quick Win #1: [Title]**

* **Database Problem**
* **Impact**
* **Effort**
* **Implementation Steps**
* **Risk Level**

Target: 5–12 quick wins maximum.

---

## Deliverable:

MongoDB-scoped quick wins with implementation guidance.

---

# 3. MongoDB Technical Debt Assessment

Break down only database-architecture-related debt.

---

### Categories

* Data modeling debt
* Indexing debt
* Data scoping debt
* Query performance debt
* Transaction usage debt
* Aggregation complexity debt
* Scalability readiness debt
* Backup & recovery debt
* Migration/versioning debt
* Observability gaps (query metrics, slow logs)

---

## Debt Table

| Category | Description | Risk if Ignored | Effort Estimate | Priority |
| -------- | ----------- | --------------- | --------------- | -------- |

Provide:

* Total estimated developer-days
* Confidence level (High / Medium / Low)
* Explicit assumptions

---

# 4. Phased MongoDB Improvement Roadmap

Design a roadmap focused purely on database improvements.

---

## Phase 1 – Data Safety & Integrity (Weeks 1–2)

Focus:

* Tenant scoping enforcement
* Unique constraints
* Critical index gaps
* Transaction safeguards
* Corruption or duplication risks

Include only issues labeled high-risk in the MongoDB document.

---

## Phase 2 – Performance Hardening (Weeks 3–6)

Focus:

* Index optimization
* Query plan improvements
* Compound index alignment
* Projection optimization
* Eliminating collection scans
* Aggregation performance tuning

---

## Phase 3 – Scalability & Resilience (Weeks 7–10)

Focus:

* Replica set configuration
* Sharding readiness
* Write scaling
* Read distribution
* Backup automation
* Disaster recovery validation

---

## Phase 4 – Data Architecture Maturity (Weeks 11–14)

Focus:

* Schema evolution strategy
* Migration versioning
* Observability improvements
* Index lifecycle management
* Long-term scalability optimization

---

Each phase must include:

* Goal
* Included issues
* Total effort estimate
* Dependencies
* Business impact

---

# 5. MongoDB KPIs & Success Metrics

Define database-specific metrics only.

Examples:

| Metric                       | Current State | Target                        | Measurement           |
| ---------------------------- | ------------- | ----------------------------- | --------------------- |
| Indexed query coverage       | ?             | 100% critical queries indexed | Query plan audit      |
| Avg query latency            | ?             | <50ms                         | Performance profiling |
| Collection scan count        | ?             | 0 on critical paths           | MongoDB profiler      |
| Tenant scoping enforcement | ?             | 100%                          | Query review          |
| Write conflict rate          | ?             | <0.5%                         | Monitoring            |
| Backup success rate          | ?             | 100% automated                | Backup logs           |
| Aggregation runtime (P95)    | ?             | <100ms                        | APM                   |

Do not include non-database KPIs (e.g., test coverage, API consistency).

---

# 6. MongoDB Architecture Maturity Score

Score from 0–100 based solely on MongoDB architecture findings.

Breakdown:

* Data modeling discipline
* Index strategy maturity
* Performance optimization
* Transaction safety
* Data scoping robustness
* Scalability readiness
* Backup & recovery maturity
* Observability coverage

Provide:

* Current maturity level (MVP, Production-Ready, Scalable, Enterprise-Grade)
* Key blockers preventing higher maturity

---

# 7. Executive Summary (CTO-Level)

Provide:

### Overall MongoDB Architecture Health Score

X / 100

### Key Strengths

1.
2.
3.

### Major Database Risks

1.
2.
3.

### Estimated Investment

* Total developer-days:
* Timeline:
* Risk if delayed:

### Recommendation

* Stable but needs indexing hardening
* Performance refactor required
* Data model restructuring recommended
* Scalable with targeted improvements

Keep concise and strategic (1–2 pages equivalent).

---

# Output Files

## File 1:

`docs/backendroadmaps/02-Secom-MongoDB-Architecture-Improvement-Roadmap.md`

Must include:

* Prioritized MongoDB issues
* Phased roadmap
* Technical debt estimate
* Database KPIs
* MongoDB maturity score
* Executive summary

---

## File 2:

`docs/backendroadmaps/02-Secom-MongoDB-Architecture-Quick-Wins.md`

Must include:

* MongoDB-only quick wins
* Implementation steps
* Estimated effort
* Impact analysis

---

# Writing Guidelines

* MongoDB-only scope
* No cross-document inference
* Clear traceability to MongoDB architecture sections
* Executive-level clarity
* Focus on data integrity, isolation, and performance
* Prioritize production data safety and scalability
* Avoid backend-layer discussions unless directly tied to MongoDB architecture

