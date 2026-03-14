Excellent — here is the **frontend-equivalent version** of your backend architecture-scoped prompt, aligned in structure, rigor, and clarity.

This version is tailored specifically for:

`docs/frontend/01-Secom-Frontend-Architecture-Overview.md`

---

# PROMPT (Architecture-Scoped Version)

# Secom – Frontend Architecture Improvement Roadmap

**Source Document:** `docs/frontend/01-Secom-Frontend-Architecture-Overview.md`
**Scope Restriction:** Architecture document only

---

## Context

You are generating a **strategic frontend architecture improvement roadmap strictly from the Frontend Architecture Overview document**.

You must:

* Use only findings, gaps, risks, and recommendations explicitly described in
  `docs/frontend/01-Secom-Frontend-Architecture-Overview.md`
* Not reference any other frontend documents
* Not assume issues from UX audits, accessibility audits, performance audits, or testing strategy documents
* Not invent technical debt outside what is implied in the architecture review
* Clearly reference relevant architecture sections

This is an **architecture-focused roadmap**, not a full frontend product roadmap.

---

# Objective

Transform the architectural findings into:

1. Prioritized architectural risks
2. Structural improvement plan
3. Architecture-only technical debt estimate
4. Phased implementation roadmap
5. Frontend architecture maturity score
6. Executive summary for CTO-level audience

---

# 1. Frontend Architecture Issue Extraction

Extract every issue related to:

* Application structure & folder organization
* Layer separation (UI / domain / services / state)
* Component architecture
* State management strategy
* Routing architecture
* Module boundaries
* Shared component design
* Dependency management
* Environment configuration handling
* Build tooling & bundling structure
* Code splitting strategy (if mentioned)
* Error boundaries & resilience patterns
* Performance architecture decisions
* Security practices at frontend level
* Observability/logging integration (frontend scope)
* Scalability readiness
* Micro-frontend strategy (if applicable)
* API consumption architecture (structure only, not API quality)

---

## 1.1 Prioritized Architecture Issues

### 🟥 P0 – Architectural Instability / Structural Risk

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source Section |
| - | ----- | -------------------- | ----------- | ------ | ------------ | -------------- |

---

### 🟧 P1 – Scalability / Maintainability Risks

[Same structure]

---

### 🟨 P2 – Structural Improvements

[Same structure]

---

### 🟩 P3 – Optimization & Future Enhancements

[Same structure]

---

### Severity Criteria

* 🟥 Production fragility, major coupling, scalability blockers, global state instability
* 🟧 Long-term maintainability degradation or architectural rigidity
* 🟨 Structural refinement opportunity
* 🟩 Strategic enhancement or modernization

---

## Deliverable:

Architecture-prioritized issue inventory with traceability to document sections.

---

# 2. Frontend Architecture Quick Wins

Identify low-effort improvements mentioned or clearly implied in the architecture overview.

Examples may include (only if supported by document):

* Folder restructuring adjustments
* Dependency cleanup
* Environment configuration isolation
* Lazy-loading activation
* Error boundary addition
* Logging normalization
* Removal of circular dependencies
* State colocation improvements
* Configuration extraction

⚠️ Only include improvements supported by the architecture document.

---

## Quick Win Format

**Quick Win #1: [Title]**

* **Architecture Problem**
* **Impact**
* **Effort**
* **Implementation Steps**
* **Risk Level**
* **Source Section**

Target: 5–10 quick wins maximum.

---

## Deliverable:

Architecture-scoped quick wins with actionable implementation guidance.

---

# 3. Frontend Architecture Technical Debt Assessment

Break down only architecture-related debt.

### Categories

* Structural layering debt
* Component coupling debt
* State management debt
* Routing architecture debt
* Performance architecture debt
* Build & bundling debt
* Environment configuration debt
* Observability gaps
* Security hardening gaps
* Scalability constraints

---

## Debt Table

| Category | Description | Risk if Ignored | Effort Estimate | Priority | Source Section |
| -------- | ----------- | --------------- | --------------- | -------- | -------------- |

Provide:

* Total estimated developer-days
* Confidence level (Low / Medium / High)
* Assumptions (if any)

---

# 4. Phased Frontend Architecture Roadmap

Design an execution roadmap focused strictly on structural frontend improvements.

Assume:

* 3–5 frontend engineers
* 2-week sprints
* Parallel work allowed when boundaries permit

---

## Phase 1 – Stabilization (Weeks 1–2)

Focus:

* Critical architectural risks
* Global state instability
* Deployment/build fragility
* Major coupling risks

---

## Phase 2 – Structural Hardening (Weeks 3–6)

Focus:

* Layer separation enforcement
* Component boundary cleanup
* State architecture refactor
* Configuration isolation
* Observability improvements

---

## Phase 3 – Scalability & Performance (Weeks 7–10)

Focus:

* Code splitting readiness
* Lazy loading improvements
* Bundle structure optimization
* Performance architecture enforcement
* Resilience patterns

---

## Phase 4 – Architecture Maturity (Weeks 11–14)

Focus:

* Modularization improvements
* Shared component architecture
* Future-proofing patterns
* Strategic modernization

---

Each phase must include:

* Goal
* Included issues (by ID)
* Total effort estimate
* Dependencies
* Business impact

---

# 5. Frontend Architecture KPIs & Success Metrics

Define architecture-relevant metrics only.

Examples (only if aligned with document findings):

| Metric                    | Current State | Target                | Measurement Method  |
| ------------------------- | ------------- | --------------------- | ------------------- |
| Component coupling index  | ?             | -40%                  | Dependency analysis |
| Global state surface area | ?             | Reduced by 50%        | State audit         |
| Bundle modularization     | ?             | Lazy-loaded routes    | Bundle analyzer     |
| Build time                | ?             | -30%                  | CI metrics          |
| Error boundary coverage   | ?             | 100% top-level routes | Code audit          |
| Circular dependencies     | ?             | 0                     | Static analysis     |

Do NOT include UX, design, or accessibility metrics unless architecture document discusses them structurally.

---

# 6. Frontend Architecture Maturity Score

Score from 0–100 based solely on architecture findings.

Breakdown:

* Layering discipline
* Component modularity
* State management clarity
* Scalability readiness
* Performance architecture
* Resilience & fault handling
* Build & deployment maturity
* Observability integration

Provide:

* Current maturity level (e.g., Early, Growing, Structured, Advanced, Enterprise-Ready)
* Key blockers preventing next maturity stage

---

# 7. Executive Summary (CTO-Level)

Provide:

### Overall Frontend Architecture Health Score

X / 100

---

### Key Structural Strengths

1.
2.
3.

---

### Major Architectural Risks

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

* Stable but requires targeted hardening
* Moderate architectural refactor required
* Strategic structural restructuring recommended

Keep concise, strategic, and traceable to document findings (1–2 pages equivalent).

---

# Output Files

## File 1:

`docs/frontendroadmaps/01-Secom-Frontend-Architecture-Improvement-Roadmap.md`

Must include:

* Prioritized architecture issues
* Phased roadmap
* Debt estimate
* KPIs
* Maturity score
* Executive summary

---

## File 2:

`docs/frontendroadmaps/01-Secom-Frontend-Architecture-Quick-Wins.md`

Must include:

* Architecture-only quick wins
* Implementation steps
* Estimated effort
* Impact analysis
* Source traceability

---

# Writing Guidelines

* Architecture-only scope
* No cross-document inference
* Clear traceability to architecture overview
* Executive-level clarity
* Focus on systemic structural risk
* Avoid feature-level UX commentary
* Prioritize scalability, resilience, maintainability, and deployment stability
