# PROMPT (API-Design-Scoped Version)

# Secom – API Design Improvement Roadmap

**Source Document:** 
`docs/backend/02-Secom-API-Design-Overview-Part1.md`
`docs/backend/02-Secom-API-Design-Overview-Part2.md`
**Scope Restriction:** API Design document only

---

## Context

You are generating a **strategic API improvement roadmap strictly from the API Design document**.

You must:

* Use only findings, risks, gaps, and recommendations explicitly described in
  `docs/backend/02-Secom-API-Design-Overview-Part1.md` and `docs/backend/02-Secom-API-Design-Overview-Part2.md`
* Not reference any other backend documents
* Not assume issues from MongoDB, infrastructure, security, or architecture audits
* Not invent technical debt outside what is implied in the API design review
* Clearly reference relevant API design sections

This is an **API contract and interface design roadmap**, not a full backend or database roadmap.

---

# Objective

Transform the API design findings into:

1. Prioritized API design risks
2. Contract and structural improvement plan
3. API technical debt estimate
4. Phased API design roadmap
5. API maturity score
6. Executive summary for CTO / Head of Engineering

---

# 1. API Design Issue Extraction

Extract every issue related to:

* REST consistency
* Resource naming conventions
* Route structure
* HTTP verb usage correctness
* Idempotency handling
* Status code consistency
* Error response standardization
* Response envelope structure
* Pagination strategy
* Filtering & sorting consistency
* Versioning strategy
* Backward compatibility
* Request validation consistency
* DTO separation
* Response shape standardization
* HATEOAS (if mentioned)
* Rate limiting design (API-level only)
* Caching strategy (API contract perspective)
* File upload design
* Bulk operation patterns
* Partial update semantics (PATCH vs PUT)
* OpenAPI/Swagger documentation quality
* API surface redundancy
* Breaking-change risk exposure

---

## 1.1 Prioritized API Design Issues

### 🟥 P0 – Contract Instability / Breaking Risk

| # | Issue | API Impact | Endpoint Area | Effort | Dependencies | Source Section |
| - | ----- | ---------- | ------------- | ------ | ------------ | -------------- |

---

### 🟧 P1 – Consistency / Maintainability Risks

[Same structure]

---

### 🟨 P2 – Structural API Improvements

[Same structure]

---

### 🟩 P3 – Optimization & Enhancement

[Same structure]

---

### Severity Criteria

* 🟥 Breaking-change risk, inconsistent contract behavior, critical status-code misuse
* 🟧 Long-term maintainability or client-integration friction
* 🟨 Structural design refinements
* 🟩 Strategic improvements or DX enhancements

---

## Deliverable:

API-prioritized issue inventory with clear traceability to source sections.

---

# 2. API Quick Wins

Identify low-effort API design improvements mentioned or implied in the API design document.

Examples may include:

* Standardizing error response format
* Aligning status codes
* Introducing response envelope
* Cleaning inconsistent route naming
* Adding pagination metadata
* Normalizing filtering format
* Adding API version prefix
* Removing redundant endpoints
* Clarifying PATCH semantics
* Adding consistent validation responses

⚠️ Only include improvements supported by the API Design document.

---

## Quick Win Format

**Quick Win #1: [Title]**

* **API Problem**
* **Impact**
* **Effort**
* **Implementation Steps**
* **Risk Level**

Target: 5–12 quick wins maximum.

---

## Deliverable:

API-scoped quick wins with implementation guidance.

---

# 3. API Technical Debt Assessment

Break down only API design–related debt.

---

### Categories

* Contract inconsistency debt
* Route structure debt
* Versioning debt
* Error-handling debt
* Pagination/filtering inconsistency debt
* DTO separation debt
* Documentation debt
* Backward compatibility debt
* API redundancy debt
* Response standardization debt

---

## Debt Table

| Category | Description | Risk if Ignored | Effort Estimate | Priority |
| -------- | ----------- | --------------- | --------------- | -------- |

Provide:

* Total estimated developer-days
* Confidence level (High / Medium / Low)
* Explicit assumptions

---

# 4. Phased API Design Roadmap

Design a roadmap focused purely on API structure and contract improvements.

---

## Phase 1 – Contract Stabilization (Weeks 1–2)

Focus:

* Breaking-change risks
* Status code misalignment
* Error response inconsistencies
* Critical route inconsistencies
* Versioning exposure risks

Include only issues labeled high-risk in the API document.

---

## Phase 2 – Structural Consistency (Weeks 3–6)

Focus:

* Route naming standardization
* REST consistency
* Pagination & filtering normalization
* Response envelope alignment
* DTO separation enforcement

---

## Phase 3 – Maintainability & Developer Experience (Weeks 7–10)

Focus:

* OpenAPI documentation improvements
* Backward compatibility strategy
* Deprecation framework
* Validation standardization
* Bulk operation clarity

---

## Phase 4 – API Maturity & Evolution (Weeks 11–14)

Focus:

* Versioning strategy formalization
* Caching and idempotency refinement
* Rate limiting contract alignment
* Long-term API governance model
* Change management policies

---

Each phase must include:

* Goal
* Included issues
* Total effort estimate
* Dependencies
* Business impact

---

# 5. API KPIs & Success Metrics

Define API-design-specific metrics only.

Examples:

| Metric                       | Current State | Target                            | Measurement     |
| ---------------------------- | ------------- | --------------------------------- | --------------- |
| Status code consistency      | ?             | 100% aligned with REST standards  | Endpoint audit  |
| Error format standardization | ?             | Single unified structure          | Contract review |
| Versioning clarity           | ?             | Explicit versioning in all routes | API spec audit  |
| Pagination consistency       | ?             | Uniform format across endpoints   | Code audit      |
| DTO reuse ratio              | ?             | ≥ 80% standardized DTO patterns   | Static analysis |
| Breaking-change frequency    | ?             | 0 unannounced breaking changes    | Release logs    |

Do not include metrics unrelated to API design (e.g., database indexing or infra scaling).

---

# 6. API Design Maturity Score

Score from 0–100 based solely on API design findings.

Breakdown:

* REST discipline
* Contract consistency
* Versioning maturity
* Documentation completeness
* Backward compatibility safety
* Error-handling standardization
* API surface clarity
* Governance readiness

Provide:

* Current maturity level (Prototype, Stable API, Production-Ready, Enterprise-Grade)
* Key blockers to next level

---

# 7. Executive Summary (CTO-Level)

Provide:

### Overall API Design Health Score

X / 100

### Key Strengths

1.
2.
3.

### Major API Risks

1.
2.
3.

### Estimated Investment

* Total developer-days:
* Timeline:
* Risk if delayed:

### Recommendation

* Stable but needs contract hardening
* Moderate API refactor required
* Versioning strategy needed
* Enterprise-ready with targeted improvements

Keep concise, strategic, and decision-oriented (1–2 pages equivalent).

---

# Output Files

## File 1:

`docs/backendroadmaps/02-Secom-API-Design-Improvement-Roadmap.md`

Must include:

* Prioritized API issues
* Phased roadmap
* Technical debt estimate
* API KPIs
* API maturity score
* Executive summary

---

## File 2:

`docs/backendroadmaps/02-Secom-API-Design-Quick-Wins.md`

Must include:

* API-only quick wins
* Implementation steps
* Estimated effort
* Impact analysis

---

# Writing Guidelines

* API-design-only scope
* No cross-document inference
* Clear traceability to API Design sections
* Executive-level clarity
* Focus on contract stability and consistency
* Prioritize backward compatibility and production safety
* Avoid infrastructure or database discussions unless directly mentioned in API design document

