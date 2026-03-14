Excellent — below is the **navigation & user-flow–scoped equivalent** of your previous prompts, tailored specifically for:

* `docs/frontend/03-Secom-Navigation-UserFlows-Overview-Part1.md`
* `docs/frontend/03-Secom-Navigation-UserFlows-Overview-Part2.md`

This version:

* Strictly isolates scope to navigation and flow architecture
* Avoids UX audit contamination unless explicitly documented
* Converts documented flow gaps into an execution roadmap
* Maintains CTO-level structure and traceability
* Focuses on systemic navigation integrity and flow reliability

---

# PROMPT (Navigation & User-Flows–Scoped Version)

# Secom – Frontend Navigation & User Flow Improvement Roadmap

**Source Documents:**

* `docs/frontend/03-Secom-Navigation-UserFlows-Overview-Part1.md`
* `docs/frontend/03-Secom-Navigation-UserFlows-Overview-Part2.md`

**Scope Restriction:** Navigation and User Flow documentation only

---

## Context

You are generating a **strategic improvement roadmap strictly from the Navigation & User Flow documentation**.

You must:

* Use only findings, risks, gaps, inconsistencies, and recommendations explicitly described in Part1–Part2
* Not reference any other frontend documents
* Not assume issues from architecture, state management, accessibility audits, or performance documents
* Not invent navigation or UX problems not supported by these documents
* Clearly reference the relevant Part (Part1 or Part2)

This is a **navigation and flow-focused roadmap**, not a full UX or frontend roadmap.

---

# Objective

Transform the documented findings into:

1. Prioritized navigation & flow risks
2. Structural flow stabilization plan
3. Navigation-related technical debt estimate
4. Phased improvement roadmap
5. Navigation maturity score
6. Executive summary for leadership

---

# 1. Navigation & Flow Issue Extraction

Extract every issue related to:

* Routing structure inconsistencies
* Deep-linking limitations
* URL strategy problems
* Guard/authorization flow gaps
* Redirect logic complexity
* Broken or circular navigation paths
* Multi-step flow instability
* Back-navigation inconsistencies
* Breadcrumb inconsistency (if documented)
* State loss during navigation
* Parameter handling issues
* Nested route complexity
* Role-based routing gaps
* Multi-tenant navigation isolation (if mentioned)
* Error navigation handling
* 404/unknown route handling
* Lazy-loaded route structure (if mentioned)
* Navigation performance bottlenecks
* Flow branching complexity
* Cross-flow coupling
* Conditional rendering logic tied to routing
* Layout-to-route coupling
* Mobile vs desktop navigation divergence (if documented)
* Onboarding flow instability
* Checkout or transactional flow risks (if mentioned)
* Access control leaks
* Missing guard enforcement
* Analytics instrumentation gaps (if mentioned)
* Flow documentation inconsistencies

---

## 1.1 Prioritized Navigation & Flow Issues

### 🟥 P0 – Flow Instability / Access Control Risk

| # | Issue | Flow Area | System Impact | Effort | Dependencies | Source Part |
| - | ----- | --------- | ------------- | ------ | ------------ | ----------- |

---

### 🟧 P1 – Structural Navigation Risks

[Same structure]

---

### 🟨 P2 – Flow Optimization & Standardization

[Same structure]

---

### 🟩 P3 – Enhancements & Refinements

[Same structure]

---

### Severity Criteria

* 🟥 Broken flows, access leaks, data loss during navigation, critical guard failures
* 🟧 Long-term maintainability or routing complexity risk
* 🟨 Structural standardization opportunity
* 🟩 Optimization or clarity improvement

---

## Deliverable:

Navigation-prioritized issue inventory with traceability to Part1/2.

---

# 2. Navigation & Flow Quick Wins

Identify low-effort improvements clearly supported by the documentation.

Examples (only if supported):

* Route guard centralization
* URL normalization
* Redirect simplification
* Back-navigation fixes
* Breadcrumb alignment
* Default fallback route definition
* Layout-to-route decoupling adjustment
* Parameter validation enforcement
* Role-based routing cleanup
* Removing dead routes

⚠️ Only include improvements supported by Part1–Part2.

---

## Quick Win Format

**Quick Win #1: [Title]**

* **Navigation Problem**
* **Impact**
* **Effort**
* **Implementation Steps**
* **Risk Level**
* **Source Part**

Target: 8–15 quick wins.

---

## Deliverable:

Navigation-scoped quick wins with actionable implementation guidance.

---

# 3. Navigation Technical Debt Assessment

Break down only navigation and user-flow-related debt.

---

## Categories

* Routing structure complexity debt
* Guard enforcement debt
* URL inconsistency debt
* Flow branching complexity debt
* Multi-step flow fragility debt
* Access control misalignment debt
* Layout coupling debt
* Parameter handling debt
* State loss during navigation debt
* Role-based routing inconsistency debt
* Deep-link instability debt
* Flow observability gaps (if documented)
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

# 4. Phased Navigation & Flow Roadmap

Assume:

* 3–5 frontend engineers
* 2-week sprints
* Parallel work allowed where flows are decoupled

---

## Phase 1 – Stabilization (Weeks 1–2)

Focus:

* P0 issues
* Access control leaks
* Broken or unstable flows
* Critical guard failures
* State loss between routes

---

## Phase 2 – Structural Routing Hardening (Weeks 3–6)

Focus:

* Route hierarchy cleanup
* Guard centralization
* Role-based routing alignment
* Redirect normalization
* URL strategy enforcement

---

## Phase 3 – Flow Simplification & Performance (Weeks 7–10)

Focus:

* Multi-step flow simplification
* Lazy-loaded route improvements
* Navigation performance tuning
* Parameter validation standardization
* Layout decoupling

---

## Phase 4 – Navigation Maturity & Governance (Weeks 11–14)

Focus:

* Governance patterns
* Flow documentation alignment
* Observability integration (if mentioned)
* Analytics instrumentation consistency
* Future-proofing routing strategy

---

Each phase must include:

* Goal
* Included issues (by ID)
* Effort estimate
* Dependencies
* Risk mitigation impact
* Business impact

---

# 5. Navigation & Flow KPIs

Define metrics strictly relevant to navigation and flow architecture.

Examples (only if aligned with document findings):

| Metric                                   | Current State | Target         | Measurement      |
| ---------------------------------------- | ------------- | -------------- | ---------------- |
| Broken flow incidence                    | ?             | 0              | QA audit         |
| Unauthorized route exposure              | ?             | 0              | Guard test audit |
| Route nesting depth                      | ?             | Reduced by 30% | Route analysis   |
| Redirect chains                          | ?             | Max 1 hop      | Route trace      |
| Multi-step flow drop-off (if documented) | ?             | -25%           | Analytics        |
| Dead routes                              | ?             | 0              | Route audit      |
| Guard centralization coverage            | ?             | 100%           | Code review      |

Do NOT include unrelated performance or accessibility metrics.

---

# 6. Navigation Maturity Score

Score 0–100 based only on Part1–Part2 findings.

Breakdown:

* Route structure clarity
* Guard enforcement consistency
* Role-based routing robustness
* Flow predictability
* Deep-link support
* State continuity during navigation
* URL governance
* Flow documentation clarity

Provide:

* Current maturity stage (Ad-hoc, Fragmented, Structured, Scalable, Enterprise-Grade)
* Key blockers preventing next level

---

# 7. Executive Summary (Leadership-Level)

Provide:

### Overall Navigation & Flow Health Score

X / 100

---

### Key Strengths

1.
2.
3.

---

### Major Navigation Risks

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

* Requires targeted routing cleanup
* Moderate navigation refactor required
* Strategic flow restructuring recommended

Keep concise, strategic, and traceable to documented findings (1–2 pages equivalent).

---

# Output Files

## File 1:

`docs/frontendroadmaps/02-Secom-Navigation-UserFlows-Improvement-Roadmap.md`

Must include:

* Prioritized navigation issues
* Phased roadmap
* Debt estimate
* KPIs
* Maturity score
* Executive summary

---

## File 2:

`docs/frontendroadmaps/02-Secom-Navigation-UserFlows-Quick-Wins.md`

Must include:

* Navigation-level quick wins
* Implementation steps
* Effort estimates
* Impact explanation
* Source traceability (Part1/2)

---

# Writing Guidelines

* Navigation-only scope
* No cross-document inference
* Clear traceability to Part1/2
* Executive-level clarity
* Focus on systemic flow stability
* Avoid visual UX critique unless structurally documented
* Prioritize predictability, guard integrity, routing clarity, and scalability

