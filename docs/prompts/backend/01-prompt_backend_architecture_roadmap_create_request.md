# PROMPT (Architecture-Scoped Version)

# Secom – Architecture Improvement Roadmap

**Source Document:** 
`docs/backend/01-Secom-Backend-Architecture-Overview-Part1.md`
`docs/backend/01-Secom-Backend-Architecture-Overview-Part2.md`
`docs/backend/01-Secom-Backend-Architecture-Overview-Part3.md`
**Scope Restriction:** Architecture document only

---

## Context

You are generating a **strategic improvement roadmap strictly from the Backend Architecture Overview document**.

You must:

* Use only findings, gaps, risks, and recommendations explicitly described in `docs/backend/01-Secom-Backend-Architecture-Overview-Part1.md`, `docs/backend/01-Secom-Backend-Architecture-Overview-Part2.md` and `docs/backend/01-Secom-Backend-Architecture-Overview-Part3.md`
* Not reference any other backend documents
* Not assume issues from API, testing, or security audits
* Not invent technical debt outside what is implied in the architecture review
* Clearly reference relevant architecture sections

This is an **architecture-focused roadmap**, not a full backend roadmap.

---

# Objective

Transform the architectural findings into:

1. Prioritized architectural risks
2. Structural improvement plan
3. Technical debt estimate (architecture-only)
4. Phased implementation roadmap
5. Architecture maturity score
6. Executive summary for CTO-level audience

---

# 1. Architecture Issue Extraction

Extract every issue related to:

* System layering
* Service boundaries
* Multi-tenancy design
* Scalability patterns
* Infrastructure coupling
* Observability design
* Resilience patterns
* Deployment architecture
* Dependency structure
* Configuration management
* Environment isolation
* Fault tolerance
* Performance bottlenecks
* Modularity gaps
* Versioning strategy (if mentioned architecturally)

---

## 1.1 Prioritized Architecture Issues

### 🟥 P0 – Architectural Instability / Structural Risk

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source Section |
| - | ----- | -------------------- | ----------- | ------ | ------------ | -------------- |

### 🟧 P1 – Scalability / Maintainability Risks

[Same structure]

### 🟨 P2 – Structural Improvements

[Same structure]

### 🟩 P3 – Optimization & Future Enhancements

[Same structure]

---

### Severity Criteria

* 🟥 Production fragility, scaling blockers, tenant scoping risk
* 🟧 Long-term maintainability or reliability risk
* 🟨 Architectural refinement opportunity
* 🟩 Strategic enhancement

---

## Deliverable:

Architecture-prioritized issue inventory with traceability.

---

# 2. Architectural Quick Wins

Identify low-effort improvements mentioned or implied in the architecture overview.

Examples may include:

* Configuration restructuring
* Middleware reordering
* Logging enhancements
* Containerization improvements
* Environment separation fixes
* Dependency cleanup

⚠️ Only include improvements supported by the architecture document.

---

## Quick Win Format

**Quick Win #1: [Title]**

* **Architecture Problem**
* **Impact**
* **Effort**
* **Implementation Steps**
* **Risk Level**

Target: 5–10 quick wins max.

---

## Deliverable:

Architecture-scoped quick wins with implementation guidance.

---

# 3. Architecture Technical Debt Assessment

Break down only architecture-related debt:

### Categories

* Structural layering debt
* Infrastructure coupling debt
* Data scoping debt
* Observability gaps
* Deployment architecture debt
* Resilience & fault tolerance debt
* Scalability constraints
* Configuration management debt

---

## Debt Table

| Category | Description | Risk if Ignored | Effort Estimate | Priority |
| -------- | ----------- | --------------- | --------------- | -------- |

Provide:

* Total estimated developer-days
* Confidence level
* Assumptions

---

# 4. Phased Architecture Roadmap

Design an execution roadmap focused on structural improvements.

---

## Phase 1 – Stabilization (Weeks 1–2)

Focus:

* Critical architectural risks
* Tenant scoping protection
* Deployment safety

Include:

* Issues explicitly labeled as high-risk in the architecture document

---

## Phase 2 – Structural Hardening (Weeks 3–6)

Focus:

* Layer separation
* Service boundary cleanup
* Configuration isolation
* Observability improvements

---

## Phase 3 – Scalability & Resilience (Weeks 7–10)

Focus:

* Horizontal scaling readiness
* Performance bottlenecks
* Fault tolerance patterns
* Rate limiting architecture

---

## Phase 4 – Architecture Maturity (Weeks 11–14)

Focus:

* Optimization
* Strategic modernization
* Modularization improvements
* Future-proofing

---

Each phase must include:

* Goal
* Included issues
* Total effort estimate
* Dependencies
* Business impact

---

# 5. Architecture KPIs & Success Metrics

Define metrics relevant only to architecture.

Examples:

| Metric                       | Current State | Target                  | Measurement      |
| ---------------------------- | ------------- | ----------------------- | ---------------- |
| Horizontal scaling readiness | ?             | Stateless services      | Load test        |
| Tenant scoping consistency | ?             | 100% enforced           | Code audit       |
| Deployment reproducibility   | ?             | Fully automated         | CI/CD validation |
| Error observability coverage | ?             | 100% structured logging | Log audit        |
| Service coupling index       | ?             | Reduced by 40%          | Dependency graph |

Do not include metrics unrelated to architecture (e.g., test coverage unless architecture mentions it).

---

# 6. Architecture Maturity Score

Score from 0–100 based solely on architecture findings.

Breakdown:

* Layering discipline
* Modularity
* Scalability readiness
* Resilience patterns
* Observability
* Deployment maturity
* Tenant scoping robustness

Provide:

* Current maturity level (e.g., MVP, Production-Ready, Enterprise-Ready)
* Key blockers to next level

---

# 7. Executive Summary (CTO-Level)

Provide:

### Overall Architecture Health Score

X / 100

### Key Strengths

1.
2.
3.

### Major Structural Risks

1.
2.
3.

### Estimated Investment

* Total developer-days:
* Timeline:
* Risk if delayed:

### Recommendation

* Stable but needs hardening
* Moderate architectural refactor required
* Strategic restructuring recommended

Keep concise and strategic (1–2 pages equivalent).

---

# Output Files

## File 1:

`docs/backendroadmaps/01-Secom-Backend-Architecture-Improvement-Roadmap.md`

Must include:

* Prioritized architecture issues
* Phased roadmap
* Debt estimate
* KPIs
* Maturity score
* Executive summary

---

## File 2:

`docs/backendroadmaps/01-Secom-Backend-Architecture-Quick-Wins.md`

Must include:

* Architecture-only quick wins
* Implementation steps
* Estimated effort
* Impact analysis

---

# Writing Guidelines

* Architecture-only scope
* No cross-document inference
* Clear traceability
* Executive-level clarity
* Focus on systemic risk, not code style
* Prioritize production resilience and scalability
* Due to the size of the documents, they should be created in sections.
