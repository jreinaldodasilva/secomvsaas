# Secom Authentication, Authorization & Security Architecture Review

## Implementation-Driven Security Audit (Production-Grade)

You are a **Senior Security Architect performing a deep technical security assessment** of the Secom backend system.

**Project Context**: Secom is a communication management system for the Secretaria de Comunicação (government agency) managing sensitive communications data with:
- **Roles**: admin, assessor, social_media, atendente, citizen
- **Architecture**: Modular monolith with multi-tenancy and RBAC
- **Data**: Government communications, citizen information, media contacts
- **Compliance**: LGPD (Brazilian Data Protection Law)

This is a **code-first audit**, not a documentation review.

---

## Evidence Hierarchy (Mandatory)

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

* Explicitly state "No implementation evidence found"
* Classify as risk
* Do NOT assume intended behavior
* Do NOT fabricate mechanisms

---

## System Context Assumptions

Treat the system as:

* A **government communications platform** handling PII and government communications data
* Subject to **LGPD (Brazilian Data Protection Law)**
* Using **MongoDB + Mongoose**
* Implementing **multi-tenancy with RBAC**
* Running in production or pre-production
* Operating under government-grade data protection requirements

Security expectations must reflect government data compliance standards.

---

## Audit Objectives

Produce a **deep, architecture-level security analysis**, covering:

1. Authentication architecture
2. Authorization & RBAC design
3. Data scoping guarantees
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

## Required Output Location

Primary output:

```
docs/architecture/backend/auth-security.md
```

If length requires:

```
docs/architecture/backend/auth-security-part-1.md
docs/architecture/backend/auth-security-part-2.md
...
```

Split logically by domain (Authentication, Authorization, Data Protection, etc.).

---

## Required Structure & Depth

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

## Authentication Architecture

### Strategy Analysis (Code-Based)

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

## Authorization & RBAC Architecture

### Role Model

Based on implementation:

* Role hierarchy correctness
* Inheritance logic
* Separation of duties
* Privilege escalation risk
* super_admin isolation

Deliver:

* Least Privilege Compliance Score
* Over-privilege findings
* Role explosion risk

---

### Permission Model

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

### Complete Role–Permission Matrix

Produce a fully expanded matrix for Secom modules:

* Press Releases
* Media Contacts
* Clipping
* Events
* Appointments
* Citizen Portal
* Social Media
* System configuration
* Multi-tenant controls

For each:

* Allowed roles
* Scope: Own / Assigned / Tenant-wide / Global

Flag:

* Dangerous permissions
* Privilege overlaps
* Structural inconsistencies

---

## Middleware & Enforcement Integrity

### Enforcement Architecture

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

### Tenant Isolation Validation

Evaluate enforcement of:

* Tenant-scoped data filtering
* Cross-boundary query protection
* Mongoose-level guards
* Service-level scope enforcement

Simulate:

* Horizontal privilege escalation
* Vertical privilege escalation
* Cross-boundary access attempt

Deliver:

* Tenant Isolation Confidence Level
* Attack scenario examples

---

## Secure Coding & Injection Prevention

### Validation & Injection

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

### Transport & Cookie Security

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

## Sensitive Data & Cryptography

### PII & Communication Record Protection

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

### Logging Hygiene

Evaluate:

* CPF masking
* Sensitive field logging
* Stack trace exposure
* Error leakage

Deliver:

* Data Leakage Risk Score

---

## LGPD Compliance Posture

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

## Session & Token Lifecycle

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

## Audit Logging & Observability

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

## Threat Modeling Summary

Provide:

### Top 10 Realistic Attack Scenarios

For each:

* Attack vector
* Exploit path
* Impact
* Likelihood
* Current mitigation status

---

## Security Risk Matrix

| Risk | Category | Severity | Likelihood | Impact | Effort | Priority |

Include:

* Top 5 Immediate Critical Risks
* Top 5 Structural Design Risks
* Quick Wins
* Long-Term Refactor Strategy

---

## Final Security Scorecard

| Category | Score (0–100) |
| -------- | ------------- |
| Authentication | |
| Authorization | |
| Tenant Isolation | |
| Data Protection | |
| LGPD Compliance | |
| Session Management | |
| Audit Logging | |
| Overall Security Maturity | |

Also classify overall maturity:

* Prototype
* Basic Production
* Hardened Production
* Enterprise-Grade
* Security-Mature Organization

---

## Writing Standards

* No fluff
* No vague advice
* No generic OWASP copy-paste
* Tie every finding to architectural impact
* Clearly separate Evidence vs Risk vs Recommendation
* Explicitly state assumptions
* Write for CTO / CISO audience
* Use precise technical language

---

## Critical Constraints

* Do NOT invent undocumented security mechanisms
* If evidence is missing → classify as risk
* Tie tenant scoping to authorization logic
* Tie data protection to MongoDB design
* Assume government-grade data protection requirements
* Prioritize citizen data protection above convenience
* Split document if necessary for completeness

