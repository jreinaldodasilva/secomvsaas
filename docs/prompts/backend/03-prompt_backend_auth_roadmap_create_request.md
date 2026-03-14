# PROMPT (Auth & Security-Scoped Version)

# Secom – Authentication & Security Improvement Roadmap

**Primary Source Document:**
`docs/backend/03-Secom-Auth-Security-Overview-Part1.md`
`docs/backend/03-Secom-Auth-Security-Overview-Part2.md`

**Scope Rule:**
Use the Auth & Security Overview as the primary source of truth.
Other backend documents may only be used when explicitly referenced inside this document.

---

## Context

You are generating a **strategic security and authentication improvement roadmap** based on the Auth & Security Overview document.

You must:

* Use all findings, risks, and recommendations explicitly described in `docs/backend/03-Secom-Auth-Security-Overview-Part1.md` and `docs/backend/03-Secom-Auth-Security-Overview-Part2.md`
* Follow cross-document references mentioned inside it
* Not assume security issues outside what is stated or referenced
* Not invent vulnerabilities not implied in the documentation
* Clearly trace each issue back to its source section (including referenced documents when applicable)

This is a **security-architecture and authentication roadmap**, not a general backend roadmap.

---

# Objective

Transform the security findings into:

1. Prioritized authentication and security risks
2. Security hardening improvement plan
3. Security technical debt estimate
4. Phased security implementation roadmap
5. Security maturity score
6. Executive-level security summary for CTO

---

# 1. Security & Authentication Issue Extraction

Extract every issue related to:

### Authentication

* JWT handling
* Token expiration strategy
* Refresh token security
* Token storage approach
* Session management
* Revocation mechanisms
* Login brute-force protection
* Multi-factor authentication (if mentioned)
* OAuth strategy (if mentioned)
* Credential storage practices
* Password hashing configuration

---

### Authorization

* Role-based access control (RBAC)
* Permission model consistency
* Tenant-level isolation
* Tenant boundary enforcement
* Privilege escalation risk
* Middleware enforcement gaps
* Authorization checks at service layer
* Object-level authorization
* Admin privilege safety

---

### Multi-Tenancy Security

* Tenant scoping enforcement
* Cross-boundary data access risks
* Query filtering guarantees
* IDOR risks
* Data scoping consistency
* Tenant ID validation strategy

---

### API Security

* Endpoint protection consistency
* Public vs protected route clarity
* Rate limiting enforcement
* Input validation consistency
* Output filtering
* Sensitive data exposure
* Error message leakage

---

### Data Security

* Encryption at rest (if mentioned)
* Encryption in transit
* Secrets management
* Environment variable handling
* Backup security
* Data exposure risks

---

### Infrastructure & Deployment Security

* Environment isolation
* Production vs staging separation
* CI/CD secret handling
* Logging of sensitive data
* Monitoring of security events

---

## 1.1 Prioritized Security Issues

### 🟥 P0 – Critical Vulnerabilities / Breach Risk

| # | Issue | Security Impact | System Area | Effort | Dependencies | Source Section |
| - | ----- | --------------- | ----------- | ------ | ------------ | -------------- |

---

### 🟧 P1 – High-Risk Exposure / Escalation Risk

[Same structure]

---

### 🟨 P2 – Hardening & Structural Improvements

[Same structure]

---

### 🟩 P3 – Security Enhancements / Best Practices

[Same structure]

---

### Severity Criteria

* 🟥 Data breach, data boundary violation, privilege escalation, authentication bypass
* 🟧 Significant exposure risk or lateral movement possibility
* 🟨 Structural hardening improvements
* 🟩 Strategic or compliance enhancements

---

## Deliverable:

Security-prioritized issue inventory with cross-document traceability.

---

# 2. Security Quick Wins

Identify low-effort security improvements mentioned or implied in the documentation.

Examples may include:

* Adding rate limiting middleware
* Enforcing tenantId validation
* Standardizing auth middleware usage
* Strengthening password hashing configuration
* Masking sensitive logs
* Tightening JWT expiration
* Enforcing environment-based secret validation
* Removing sensitive fields from responses
* Adding object-level authorization checks

⚠️ Only include improvements supported by the Auth & Security document and its explicit references.

---

## Quick Win Format

**Quick Win #1: [Title]**

* **Security Problem**
* **Risk**
* **Effort**
* **Implementation Steps**
* **Risk Reduction Impact**

Target: 5–12 quick wins maximum.

---

## Deliverable:

Security-scoped quick wins with implementation guidance.

---

# 3. Security Technical Debt Assessment

Break down only authentication and security-related debt.

---

### Categories

* Authentication architecture debt
* Authorization model debt
* Data scoping debt
* API protection debt
* Secrets management debt
* Encryption gaps
* Input validation debt
* Monitoring & audit logging gaps
* Incident response readiness debt
* Compliance readiness gaps (if mentioned)

---

## Debt Table

| Category | Description | Risk if Ignored | Effort Estimate | Priority |
| -------- | ----------- | --------------- | --------------- | -------- |

Provide:

* Total estimated developer-days
* Confidence level (High / Medium / Low)
* Explicit assumptions
* Risk exposure level (Low / Moderate / High / Critical)

---

# 4. Phased Security Hardening Roadmap

Design a roadmap focused purely on authentication and security hardening.

---

## Phase 1 – Critical Risk Mitigation (Weeks 1–2)

Focus:

* Authentication bypass risks
* Data boundary violation risks
* Privilege escalation exposure
* Critical secret leakage risks
* Missing authorization enforcement

Must include all P0 issues.

---

## Phase 2 – Authorization & Isolation Hardening (Weeks 3–6)

Focus:

* RBAC consistency
* Object-level authorization
* Tenant scoping enforcement
* IDOR prevention
* Service-layer auth checks

---

## Phase 3 – Defensive Security Improvements (Weeks 7–10)

Focus:

* Rate limiting enforcement
* Brute-force mitigation
* Logging hardening
* Sensitive data exposure prevention
* Audit log improvements
* Backup security validation

---

## Phase 4 – Security Maturity & Governance (Weeks 11–14)

Focus:

* MFA introduction (if referenced)
* Token lifecycle improvements
* Security monitoring dashboards
* Compliance alignment
* Incident response readiness
* Long-term security governance model

---

Each phase must include:

* Goal
* Included issues
* Total effort estimate
* Dependencies
* Risk reduction impact
* Business impact

---

# 5. Security KPIs & Success Metrics

Define security-specific metrics only.

Examples:

| Metric                       | Current State | Target                 | Measurement      |
| ---------------------------- | ------------- | ---------------------- | ---------------- |
| Tenant scoping breaches    | ?             | 0                      | Audit            |
| Auth bypass vectors          | ?             | 0                      | Security testing |
| Privilege escalation vectors | ?             | 0                      | Role review      |
| JWT expiration policy        | ?             | Hardened standard      | Code audit       |
| Password hashing strength    | ?             | ≥ recommended strength | Config review    |
| Sensitive data in logs       | ?             | 0                      | Log scan         |
| Rate limiting coverage       | ?             | 100% auth endpoints    | Middleware audit |

Do not include performance or database metrics unless explicitly security-related.

---

# 6. Security Maturity Score

Score from 0–100 based solely on security findings.

Breakdown:

* Authentication robustness
* Authorization enforcement
* Tenant scoping safety
* Secret management maturity
* Encryption coverage
* Monitoring & detection capability
* Defensive security mechanisms
* Governance & compliance readiness

Provide:

* Current maturity level (Basic, Hardened MVP, Production-Secure, Enterprise-Secure)
* Key blockers preventing higher maturity
* Estimated breach risk level

---

# 7. Executive Security Summary (CTO-Level)

Provide:

### Overall Security Health Score

X / 100

### Key Strengths

1.
2.
3.

### Major Security Risks

1.
2.
3.

### Estimated Investment

* Total developer-days:
* Timeline:
* Risk if delayed:
* Potential impact of breach:

### Recommendation

* Critical hardening required immediately
* Moderate security refactor needed
* Secure with targeted improvements
* Enterprise-grade with governance expansion

Keep concise, strategic, and board-ready.

---

# Output Files

## File 1:

`docs/backendroadmaps/03-Secom-Auth-Security-Improvement-Roadmap.md`

Must include:

* Prioritized security issues
* Phased roadmap
* Technical debt estimate
* Security KPIs
* Security maturity score
* Executive summary

---

## File 2:

`docs/backendroadmaps/03-Secom-Auth-Security-Quick-Wins.md`

Must include:

* Security-only quick wins
* Implementation steps
* Estimated effort
* Risk reduction impact

---

# Writing Guidelines

* Security-first perspective
* Cross-document use allowed only when referenced in the Auth & Security document
* No invented vulnerabilities
* Clear traceability
* Executive-level clarity
* Focus on breach prevention and tenant scoping
* Prioritize production safety and data protection
* Avoid non-security architectural analysis unless security-related

