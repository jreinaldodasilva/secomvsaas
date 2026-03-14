# PROMPT (Performance & Infrastructure-Scoped Version)

# Secom – Performance & Infrastructure Improvement Roadmap

**Source Documents:**

* `docs/backend/11-Secom-Performance-Infrastructure-Part1.md`
* `docs/backend/11-Secom-Performance-Infrastructure-Part2.md`
* `docs/backend/11-Secom-Performance-Infrastructure-Part3.md`

**Scope Restriction:** Performance & Infrastructure documents only

---

## Context

You are generating a **strategic improvement roadmap strictly from the Performance & Infrastructure documentation**.

You must:

* Use only findings, bottlenecks, risks, weaknesses, and recommendations explicitly described in the three Performance & Infrastructure documents
* Treat Part1, Part2, and Part3 as a single consolidated source of truth
* Not reference API, MongoDB, Auth, Business Logic, or Integration documents unless directly cited inside these files
* Not invent performance issues that are not described or clearly implied
* Clearly reference the relevant section and document part for every major issue

This is a **performance & infrastructure-focused roadmap**, not a backend-wide roadmap.

---

# Objective

Transform the documented performance and infrastructure findings into:

1. Prioritized performance risks
2. Infrastructure hardening plan
3. Performance technical debt estimate
4. Phased infrastructure roadmap
5. Performance maturity score
6. Executive summary for CTO-level audience

---

# 1. Performance & Infrastructure Issue Extraction

Extract every issue related to:

* Horizontal scaling limitations
* CPU / memory bottlenecks
* Event loop blocking
* Slow queries or unindexed operations
* Redis usage patterns
* Queue throughput limitations (BullMQ)
* Rate limiting strategy
* Load balancing gaps
* Single points of failure
* Deployment topology
* Environment configuration
* Containerization gaps
* Resource sizing
* Cold start latency
* Caching strategy gaps
* Background job scaling
* File upload performance
* Monitoring & observability blind spots
* Alerting gaps
* Logging overhead
* Performance test coverage
* Infrastructure automation
* CI/CD performance constraints
* Production hardening weaknesses

---

## 1.1 Prioritized Performance Issues

### 🟥 P0 – Production Instability / Scaling Blockers

| # | Issue | Production Impact | Infrastructure Area | Effort | Dependencies | Source Section |
| - | ----- | ----------------- | ------------------- | ------ | ------------ | -------------- |

Criteria:

* Causes outages
* Enables cascading failures
* Blocks horizontal scaling
* Single point of failure
* Data loss risk under load

---

### 🟧 P1 – High-Risk Performance Bottlenecks

Same structure.

Criteria:

* Severe degradation under growth
* Resource exhaustion risk
* Latency spikes
* Queue backlogs

---

### 🟨 P2 – Scalability & Optimization Improvements

Same structure.

Criteria:

* Inefficient but functional
* Performance ceilings at moderate scale

---

### 🟩 P3 – Strategic Infrastructure Enhancements

Same structure.

Criteria:

* Long-term modernization
* Cost optimization
* Enterprise hardening

---

## Deliverable:

A fully traceable, prioritized performance & infrastructure issue inventory.

---

# 2. Performance & Infrastructure Quick Wins

Identify low-effort, high-impact improvements described or implied in the performance documents.

Examples may include:

* Redis configuration tuning
* Adjusting rate limits
* Enabling compression improvements
* Fixing blocking operations
* Increasing connection pool sizes
* Adjusting queue concurrency
* Improving logging levels
* Enabling production caching flags
* Reducing synchronous operations
* Config cleanup

⚠️ Only include improvements supported in the Performance & Infrastructure documentation.

---

## Quick Win Format

**Quick Win #1: [Title]**

* **Performance Problem**
* **Operational Impact**
* **Effort**
* **Implementation Steps**
* **Risk Level**
* **Expected Latency/Throughput Impact**

Target: 5–12 quick wins maximum.

---

## Deliverable:

Performance-focused quick wins with measurable impact expectations.

---

# 3. Performance & Infrastructure Technical Debt Assessment

Break down only infrastructure and performance-related debt.

### Categories

* Horizontal scaling readiness debt
* Caching architecture debt
* Queue throughput limitations
* Redis resilience debt
* Single-node deployment risks
* Monitoring & alerting gaps
* CI/CD performance debt
* Logging & observability overhead
* Load testing coverage gaps
* Configuration hardening debt
* Resource utilization inefficiencies

---

## Debt Table

| Category | Description | Risk if Ignored | Effort Estimate | Priority |
| -------- | ----------- | --------------- | --------------- | -------- |

Provide:

* Total estimated developer-days
* Confidence level
* Assumptions

Only count debt directly supported in the source documents.

---

# 4. Phased Performance & Infrastructure Roadmap

Design an execution roadmap focused exclusively on performance and infrastructure improvements.

---

## Phase 1 – Stabilization (Weeks 1–2)

Focus:

* Production blockers
* Single points of failure
* Critical resource bottlenecks
* Security-related performance risks (if described)

Include:

* All 🟥 P0 issues

Provide:

* Goal
* Included issues
* Effort estimate
* Dependencies
* Operational risk reduction

---

## Phase 2 – Performance Hardening (Weeks 3–6)

Focus:

* Throughput improvements
* Query optimization alignment
* Queue scaling
* Redis resilience
* Memory & CPU stabilization

Include:

* 🟧 P1 issues

---

## Phase 3 – Scalability Enablement (Weeks 7–10)

Focus:

* Horizontal scaling readiness
* Stateless enforcement
* Load balancing maturity
* Multi-instance safety
* Deployment automation improvements

Include:

* 🟨 P2 issues

---

## Phase 4 – Enterprise Performance Maturity (Weeks 11–14)

Focus:

* Cost optimization
* Performance observability depth
* Auto-scaling readiness
* Proactive alerting
* Capacity forecasting

Include:

* 🟩 P3 issues

---

Each phase must include:

* Clear technical objective
* Explicit issue references
* Total effort estimate
* Operational benefit
* Risk if delayed

---

# 5. Performance & Infrastructure KPIs

Define metrics strictly related to performance and infrastructure.

Examples:

| Metric                       | Current State | Target              | Measurement    |
| ---------------------------- | ------------- | ------------------- | -------------- |
| P95 API Latency              | ?             | <200ms              | APM            |
| Redis hit rate               | ?             | >80%                | Redis metrics  |
| Queue processing time        | ?             | <2s avg             | BullMQ metrics |
| CPU utilization              | ?             | <65% under peak     | Infra metrics  |
| Memory headroom              | ?             | >30%                | Monitoring     |
| Error rate under load        | ?             | <0.5%               | Load test      |
| Horizontal scaling readiness | ?             | Multi-instance safe | Load test      |
| Deployment reproducibility   | ?             | 100% automated      | CI/CD logs     |
| Alert coverage               | ?             | 100% critical paths | Alert audit    |

Do not include non-performance KPIs.

---

# 6. Performance & Infrastructure Maturity Score

Score from 0–100 based solely on the performance & infrastructure findings.

Breakdown:

* Runtime performance efficiency
* Horizontal scalability readiness
* Resilience & fault tolerance
* Observability depth
* Queue & background job scaling
* Caching strategy maturity
* Deployment automation
* Infrastructure hardening

Provide:

* Current maturity classification:

  * Prototype
  * MVP
  * Production-Ready
  * Scalable Production
  * Enterprise-Grade

* Key blockers preventing next level

---

# 7. Executive Summary (CTO-Level)

Provide:

### Overall Performance & Infrastructure Health Score

X / 100

---

### Key Strengths

1.
2.
3.

---

### Major Infrastructure Risks

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

* Stable but needs optimization
* Moderate performance refactor required
* Scaling architecture required
* Strategic infrastructure modernization recommended

Keep concise, strategic, and executive-oriented (1–2 pages equivalent).

---

# Output Files

## File 1:

`docs/backendroadmaps/07-Secom-Performance-Infrastructure-Improvement-Roadmap.md`

Must include:

* Prioritized performance issues
* Phased roadmap
* Technical debt estimate
* KPIs
* Maturity score
* Executive summary

---

## File 2:

`docs/backendroadmaps/07-Secom-Performance-Infrastructure-Quick-Wins.md`

Must include:

* Performance-only quick wins
* Implementation steps
* Expected measurable impact
* Effort estimate
* Operational benefit

---

# Writing Guidelines

* Performance & infrastructure scope only
* No cross-document inference unless explicitly cited in source files
* Explicit traceability to Part1 / Part2 / Part3
* Focus on measurable impact
* Avoid code-style recommendations
* Prioritize production resilience and scaling safety
* Quantify wherever possible (latency, throughput, CPU, memory, queue depth)

