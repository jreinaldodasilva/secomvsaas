# PROMPT (Integrations-Scoped Version)

# Sintgesp – External Integrations Improvement Roadmap

**Primary Source Documents:**

* `docs/backend/10-Sintgesp-Integrations-Part1.md`
* `docs/backend/10-Sintgesp-Integrations-Part2.md`
* `docs/backend/10-Sintgesp-Integrations-Part3.md`

**Scope Restriction:** Integration documents only

---

## Context

You are generating a **strategic improvement roadmap strictly from the Integrations documentation (Parts 1–3)**.

You must:

* Use only findings, risks, gaps, and recommendations explicitly described in:

  * `10-Sintgesp-Integrations-Part1.md`
  * `10-Sintgesp-Integrations-Part2.md`
  * `10-Sintgesp-Integrations-Part3.md`
* Not reference other backend documents unless explicitly mentioned inside these integration documents
* Not invent integration failures not implied in the documentation
* Clearly trace every issue back to a specific section and part

This is an **external systems integration roadmap**, not a general backend, architecture, or security roadmap.

---

# Objective

Transform the integration findings into:

1. Prioritized integration risks
2. Reliability and resilience improvement plan
3. Integration technical debt estimate
4. Phased integration hardening roadmap
5. Integration maturity score
6. Executive-level summary for CTO / Operations

---

# 1. Integration Issue Extraction

Extract every issue related to:

---

## External Dependency Risk

* Third-party availability dependence
* Single-instructor lock-in
* Lack of fallback mechanisms
* SLA uncertainty
* Breaking API change risk
* Versioning risk
* SDK dependency fragility

---

## Data Synchronization

* One-way vs two-way sync risks
* Inconsistent data mapping
* Idempotency issues
* Partial failure handling
* Conflict resolution strategy
* Event ordering issues
* Data drift risk
* Retry logic weaknesses

---

## Webhooks & Event Handling

* Missing signature validation
* Duplicate event handling
* Replay attack risks
* Timeout handling
* Acknowledgment strategy
* Dead-letter handling
* Event persistence guarantees

---

## Error Handling & Resilience

* Retry policies
* Exponential backoff usage
* Circuit breaker absence
* Timeout configuration gaps
* Bulkhead isolation
* Fail-open vs fail-closed ambiguity
* Compensating transaction absence

---

## Observability & Monitoring

* Missing integration-level metrics
* No third-party health monitoring
* Lack of integration error dashboards
* Missing alert thresholds
* No tracking of retry exhaustion

---

## Security of Integrations

* API key storage practices
* OAuth token management
* Secret rotation strategy
* Webhook validation enforcement
* Data exposure to third parties
* Permission scoping weaknesses

---

## Rate Limiting & Throughput

* External API quota risks
* Burst traffic handling
* Throttling strategy
* Queue buffering strategy

---

## Financial / Payment Integrations (if mentioned)

* Payment confirmation consistency
* Refund synchronization
* Double-charge risk
* Idempotent charge enforcement
* Ledger reconciliation gaps

---

## 1.1 Prioritized Integration Issues

---

### 🟥 P0 – Critical External Failure / Financial / Data Corruption Risk

| # | Issue | Business Impact | Integration Area | Effort | Dependencies | Source Section |
| - | ----- | --------------- | ---------------- | ------ | ------------ | -------------- |

---

### 🟧 P1 – Reliability / Sync Consistency Risk

[Same structure]

---

### 🟨 P2 – Structural Integration Improvements

[Same structure]

---

### 🟩 P3 – Optimization & Strategic Enhancements

[Same structure]

---

### Severity Criteria

* 🟥 Financial loss, data corruption, payment inconsistency, tenant data leak
* 🟧 Service instability or data drift risk
* 🟨 Structural hardening opportunity
* 🟩 Strategic reliability or observability enhancement

---

## Deliverable:

Integration-prioritized issue inventory with clear traceability to Part1, Part2, or Part3.

---

# 2. Integration Quick Wins

Identify low-effort integration improvements mentioned or implied in the documentation.

Examples may include:

* Enforcing webhook signature validation
* Adding idempotency keys
* Introducing retry with exponential backoff
* Implementing timeout safeguards
* Adding basic circuit breaker pattern
* Centralizing external client configuration
* Masking API keys in logs
* Adding structured logging to integration calls
* Improving error classification

⚠️ Only include improvements supported by the Integrations documents.

---

## Quick Win Format

**Quick Win #1: [Title]**

* **Integration Problem**
* **Operational / Financial Risk**
* **Effort**
* **Implementation Steps**
* **Risk Reduction Impact**

Target: 6–15 quick wins maximum.

---

## Deliverable:

Integration-scoped quick wins with actionable implementation steps.

---

# 3. Integration Technical Debt Assessment

Break down only integration-related debt.

---

### Categories

* Third-party dependency coupling debt
* Retry & resilience debt
* Data synchronization debt
* Webhook validation debt
* Observability debt
* Secret management debt
* Rate limiting & throttling debt
* Error classification debt
* Payment consistency debt (if applicable)
* Versioning management debt

---

## Debt Table

| Category | Description | Risk if Ignored | Effort Estimate | Priority |
| -------- | ----------- | --------------- | --------------- | -------- |

Provide:

* Total estimated developer-days
* Confidence level (High / Medium / Low)
* Explicit assumptions
* Business exposure level (Low / Moderate / High / Critical)

---

# 4. Phased Integration Hardening Roadmap

Design a roadmap focused on reliability, safety, and resilience of integrations.

---

## Phase 1 – Critical Stability & Financial Safety (Weeks 1–2)

Focus:

* Payment integrity
* Data corruption risks
* Missing idempotency
* Webhook validation gaps
* P0 issues

---

## Phase 2 – Resilience & Retry Hardening (Weeks 3–6)

Focus:

* Retry standardization
* Timeout policies
* Circuit breaker implementation
* Dead-letter queue strategy
* Error classification

---

## Phase 3 – Observability & Monitoring (Weeks 7–10)

Focus:

* Integration dashboards
* SLA monitoring
* Failure-rate tracking
* Alert thresholds
* Retry exhaustion metrics

---

## Phase 4 – Strategic Integration Maturity (Weeks 11–14)

Focus:

* Instructor abstraction layers
* Fallback strategies
* Version negotiation mechanisms
* Rate-limit adaptive handling
* Integration governance model

---

Each phase must include:

* Goal
* Included issues
* Total effort estimate
* Dependencies
* Risk reduction impact
* Operational impact

---

# 5. Integration KPIs & Success Metrics

Define metrics specific to integrations.

Examples:

| Metric                        | Current State | Target              | Measurement         |
| ----------------------------- | ------------- | ------------------- | ------------------- |
| Webhook validation coverage   | ?             | 100%                | Audit               |
| Retry success rate            | ?             | ≥ 95%               | Monitoring          |
| External API timeout failures | ?             | < 1%                | Logs                |
| Payment reconciliation errors | ?             | 0                   | Financial audit     |
| Duplicate event processing    | ?             | 0                   | Event log           |
| API key rotation frequency    | ?             | Enforced schedule   | Security review     |
| Integration error visibility  | ?             | Real-time dashboard | Observability audit |

Do not include unrelated backend metrics.

---

# 6. Integration Maturity Score

Score from 0–100 based solely on integration findings.

Breakdown:

* Resilience patterns
* Data consistency
* Idempotency enforcement
* Webhook security
* Retry robustness
* Observability coverage
* Secret management maturity
* External dependency abstraction

Provide:

* Current maturity level (Basic Integration, Operationally Stable, Resilient, Enterprise-Grade)
* Key blockers to next level
* Financial exposure risk

---

# 7. Executive Summary (CTO / Operations-Level)

Provide:

### Overall Integration Health Score

X / 100

### Key Strengths

1.
2.
3.

### Major External Risks

1.
2.
3.

### Estimated Investment

* Total developer-days:
* Timeline:
* Risk if delayed:
* Financial exposure risk:

### Recommendation

* Immediate stabilization required
* Moderate resilience hardening needed
* Stable with targeted improvements
* Enterprise-grade integration posture achievable

Keep concise, strategic, and decision-ready.

---

# Output Files

## File 1:

`docs/backendroadmaps/06-Sintgesp-Integrations-Improvement-Roadmap.md`

Must include:

* Prioritized integration issues (Part1–3 combined)
* Phased roadmap
* Technical debt estimate
* KPIs
* Maturity score
* Executive summary

---

## File 2:

`docs/backendroadmaps/06-Sintgesp-Integrations-Quick-Wins.md`

Must include:

* Integration-only quick wins
* Implementation steps
* Effort estimate
* Risk reduction impact

---

# Writing Guidelines

* Integration-first perspective
* No cross-document inference unless explicitly referenced
* Clear traceability to Part1, Part2, or Part3
* Executive-level clarity
* Focus on reliability, data integrity, and financial safety
* Prioritize idempotency, retries, and monitoring
* Avoid general backend architecture commentary unless integration-related

