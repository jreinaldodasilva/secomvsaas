Here is a **significantly improved and stricter version** of your prompt — redesigned so that the audit is based on **actual code and runtime behavior**, not documentation as a primary source.

This version enforces an **evidence-first, implementation-driven security audit** suitable for production healthcare systems.

---

# 🔐 Sintgesp – Authentication, Authorization & Security Architecture Review

**Implementation-Driven Security Audit (Production-Grade)**

You are a **Senior Security Architect performing a deep technical security assessment** of the Sintgesp backend system.

This is a **code-first audit**, not a documentation review.

---

# ⚠️ Evidence Hierarchy (Mandatory)

You must follow this strict evidence order:

1. **Primary Source (Authoritative)**

   * Backend source code
   * Middleware implementations
   * Route definitions
   * Validation schemas
   * Models (Mongoose schemas)
   * Token logic
   * Security configuration

2. **Secondary Source (Context Only)**

   * Documentation files (if helpful)

If documentation contradicts code, **trust the code**.

If implementation evidence is missing:

* Explicitly state “No implementation evidence found”
* Classify as risk
* Do NOT assume intended behavior
* Do NOT fabricate mechanisms

---

# 🏥 System Context Assumptions

Treat the system as:

* A **healthcare / department management platform**
* Handling **PII and medical records**
* Subject to **LGPD (Brazilian Data Protection Law)**
* Using **MongoDB + Mongoose**
* Implementing **multi-tenancy (department isolation)**
* Running in production or pre-production
* Operating under healthcare-grade risk tolerance

Security expectations must reflect healthcare compliance standards.

---

# 🎯 Audit Objectives

Produce a **deep, architecture-level security analysis**, covering:

1. Authentication architecture
2. Authorization & RBAC design
3. Multi-tenant isolation guarantees
4. Middleware enforcement correctness
5. Sensitive data protection
6. LGPD compliance posture
7. Session & token lifecycle security
8. Audit logging robustness
9. Attack surface exposure
10. Strategic hardening roadmap

This must read like a **formal internal enterprise security assessment** prepared for a CTO / CISO.

Not a checklist. Not generic advice.

---

# 📁 Required Output Location

Primary output:

```
docs/backend/03-Sintgesp-Auth-Security-Overview.md
```

If length requires:

```
docs/backend/03-Sintgesp-Auth-Security-Overview-Part1.md
docs/backend/03-Sintgesp-Auth-Security-Overview-Part2.md
...
```

Split logically by domain (Authentication, Authorization, Data Protection, etc.).

---

# 📑 Required Structure & Depth

Every section must include:

* **Implementation Evidence**
* **Findings**
* **Risk Classification**
* **Architectural Impact**
* **Recommendations**
* **Refactor Complexity (Low / Medium / High)**

Clearly separate:

* Findings (what exists)
* Risks (what could go wrong)
* Recommendations (what must change)

---

# 1️⃣ Authentication Architecture

## 1.1 Strategy Analysis (Code-Based)

Determine from implementation:

* JWT / Session / Hybrid
* Access vs Refresh token model
* Rotation logic
* Revocation mechanism
* Signing algorithm
* Secret/key storage strategy
* Stateless vs stateful validation
* Cookie vs header transport

### Required Analysis:

* Replay attack exposure
* Token theft impact window
* Horizontal scaling implications
* Revocation effectiveness
* Compromise blast radius

Deliver:

* Authentication Maturity Score (0–100)
* Architecture Classification:

  * Prototype
  * Basic Production
  * Hardened Production
  * Enterprise-Grade
* Weakness summary
* Hardening complexity estimate

---

## 1.2 Login Flow Deep Review

Trace the login flow from:

Route → Validation → Service → DB → Token issuance → Logging

Evaluate:

* Timing attack resistance
* Account enumeration protection
* Login rate limiting
* Brute-force protection
* Suspended/blocked user enforcement
* Logging completeness
* Error message leakage

Deliver:

* Step-by-step annotated risk analysis
* Missing controls
* Security gap severity ranking

---

## 1.3 Password & Reset Security

Inspect:

* Hashing algorithm (bcrypt/argon2/etc.)
* Work factor adequacy (2026 standards)
* Salt strategy
* Password policy enforcement
* Reset token entropy
* Reset expiration
* Token reuse risk
* Storage method for reset tokens

Classify:

* 🟥 Critical
* 🟧 High
* 🟨 Medium
* 🟩 Low

Deliver:

* Password Security Rating
* Modern secure configuration recommendation (if weak)

---

# 2️⃣ Authorization & RBAC Architecture

## 2.1 Role Model

Based on implementation:

* Role hierarchy correctness
* Inheritance logic
* Separation of duties
* Privilege escalation risk
* SuperAdmin isolation

Deliver:

* Least Privilege Compliance Score
* Over-privilege findings
* Role explosion risk

---

## 2.2 Permission Model

Analyze:

* Static vs dynamic permission checks
* Hardcoded vs DB-driven permissions
* Ownership validation patterns
* Migration complexity risk

Deliver:

* Permission Model Classification
* Scalability risk level
* Maintainability score

---

## 2.3 Complete Role–Permission Matrix

Produce a fully expanded matrix for:

* Users
* Athletes
* Appointments
* Billing
* Reports
* Audit logs
* System configuration
* Multi-tenant controls

For each:

* Allowed roles
* Scope: Own / Assigned / Department-wide / Global

Flag:

* Dangerous permissions
* Privilege overlaps
* Structural inconsistencies

---

# 3️⃣ Middleware & Enforcement Integrity

## 3.1 Enforcement Architecture

Trace:

* Middleware order
* Token verification placement
* Role checks
* Permission checks
* Ownership guards

Evaluate:

* Centralized vs scattered enforcement
* Forgotten authorization risk
* Inconsistent route protection
* Bypass possibilities

---

## 3.2 Tenant Isolation Validation

Evaluate enforcement of:

* Department-scoped data filtering
* Cross-tenant query protection
* Mongoose-level guards
* Service-level scope enforcement

Simulate:

* Horizontal privilege escalation
* Vertical privilege escalation
* Cross-department access attempt

Deliver:

* Tenant Isolation Confidence Level
* Attack scenario examples

---

# 4️⃣ Secure Coding & Injection Prevention

## 4.1 Validation & Injection

Evaluate:

* Validation library usage
* Coverage percentage
* MongoDB injection risk
* Mass assignment protection
* Prototype pollution exposure

Deliver:

* Validation Coverage Score
* Injection Risk Level

---

## 4.2 Transport & Cookie Security

Inspect:

* HTTPS enforcement
* Secure cookie flags
* SameSite policy
* CSRF mitigation
* HSTS usage
* TLS assumptions

Deliver:

* Transport Security Rating

---

## 4.3 CORS Configuration

Evaluate:

* Origin validation strategy
* Credential handling
* Wildcard usage
* Sensitive header exposure

Classify severity.

---

## 4.4 Security Headers

Evaluate presence and configuration of:

* CSP
* HSTS
* X-Frame-Options
* X-Content-Type-Options
* Referrer-Policy

Deliver:

* Header Hardening Score

---

# 5️⃣ Sensitive Data & Cryptography

## 5.1 PII & Medical Record Protection

Inspect:

* Field-level encryption
* Data minimization
* Encryption at rest (MongoDB config assumptions)
* Backup encryption
* File storage encryption
* Key management

Deliver:

* Data Exposure Risk Assessment
* Encryption Strategy Classification

---

## 5.2 Logging Hygiene

Evaluate:

* CPF masking
* Sensitive field logging
* Stack trace exposure
* Error leakage

Deliver:

* Data Leakage Risk Score

---

# 6️⃣ LGPD Compliance Posture

Assess:

* Consent tracking
* Data subject rights implementation
* Right to erasure
* Data retention enforcement
* Breach notification readiness
* Data processing documentation

Deliver:

* LGPD Compliance Level (Low / Moderate / High)
* Legal Exposure Classification

---

# 7️⃣ Session & Token Lifecycle

Evaluate:

* Refresh rotation
* Token revocation
* Concurrent session limits
* Invalidation on password change
* CSRF protection
* Session fixation resistance

Deliver:

* Session Security Rating
* Compromise window estimation

---

# 8️⃣ Audit Logging & Observability

Evaluate logging of:

* Login success/failure
* Authorization failures
* Role changes
* Sensitive data access
* Admin actions
* Token issuance

Assess:

* Log tamper resistance
* Retention
* Access controls
* SIEM readiness

Deliver:

* Observability Score
* Incident Response Readiness Level

---

# 9️⃣ Threat Modeling Summary

Provide:

### Top 10 Realistic Attack Scenarios

For each:

* Attack vector
* Exploit path
* Impact
* Likelihood
* Current mitigation status

---

# 🔟 Security Risk Matrix

| Risk | Category | Severity | Likelihood | Impact | Effort | Priority |

Include:

* Top 5 Immediate Critical Risks
* Top 5 Structural Design Risks
* Quick Wins
* Long-Term Refactor Strategy

---

# 📊 Final Security Scorecard

| Category                  | Score (0–100) |
| ------------------------- | ------------- |
| Authentication            |               |
| Authorization             |               |
| Tenant Isolation          |               |
| Data Protection           |               |
| LGPD Compliance           |               |
| Session Management        |               |
| Audit Logging             |               |
| Overall Security Maturity |               |

Also classify overall maturity:

* Prototype
* Basic Production
* Hardened Production
* Enterprise-Grade
* Security-Mature Organization

---

# ✍ Writing Standards

* No fluff
* No vague advice
* No generic OWASP copy-paste
* Tie every finding to architectural impact
* Clearly separate Evidence vs Risk vs Recommendation
* Explicitly state assumptions
* Write for CTO / CISO audience
* Use precise technical language

---

# 🔒 Critical Constraints

* Do NOT invent undocumented security mechanisms
* If evidence is missing → classify as risk
* Tie tenant isolation to authorization logic
* Tie data protection to MongoDB design
* Assume healthcare-grade risk tolerance
* Prioritize athlete data protection above convenience
* Split document if necessary for completeness

