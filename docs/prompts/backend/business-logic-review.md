# Secom Business Logic & Domain Architecture Audit

You are a **Senior Backend Architect performing a production-grade Business Logic and Domain Architecture audit** of the Secom system.

Use the following documents as primary sources of truth:

* `docs/architecture/backend/overview.md`
* `docs/architecture/backend/mongodb-architecture.md`
* `docs/architecture/backend/api-design.md`
* `docs/architecture/backend/auth-security.md`

Assume:

* This is a **government communications platform (Secretaria de Comunicação)**
* The system supports **multi-tenancy with RBAC**
* It runs on **Node.js + TypeScript + MongoDB (Mongoose)**
* The system is **production or near-production**
* Data integrity and communication record correctness are critical
* LGPD compliance is mandatory

If information is missing:

* Explicitly state assumptions
* Identify documentation gaps
* Flag architectural uncertainty
* Do NOT invent behavior without labeling assumptions

---

## Audit Objective

Produce a **deep architectural assessment of business logic implementation**, focusing on:

1. Service layer structure & separation of concerns
2. Domain model maturity
3. Business rule enforcement integrity
4. Validation layering & data invariants
5. Transaction & consistency management
6. Error modeling & exception discipline
7. Rule centralization & bypass risks
8. Long-term maintainability & scalability

This is not a code walkthrough. This is an **architecture quality and risk audit**.

---

## Required Output File

```
docs/architecture/backend/business-logic.md
```

If necessary due to size, split into:
```
docs/architecture/backend/business-logic-part-1.md
docs/architecture/backend/business-logic-part-2.md
```

---

## Required Sections

---

## 1️⃣ Business Logic Architecture Overview

Provide:

* High-level description of business logic layering
* Responsibility boundaries:
  * Controllers
  * Services
  * Domain models
  * Repositories
* Business logic distribution map
* Coupling analysis between services
* Cross-domain dependencies
* Tenant-scoped data enforcement boundaries

### Evaluate:

* Is business logic centralized in services?
* Are controllers thin?
* Are repositories persistence-only?
* Are there "God services"?
* Are there circular dependencies?
* Is there clear domain separation between the 7 Secom modules?

### Deliver:

* Architecture Maturity Classification:
  * 🟥 Transaction Script
  * 🟧 Layered but Anemic
  * 🟨 Hybrid
  * 🟩 Strong Domain Alignment
* Maintainability Score (0–100)
* Structural Risk Summary

---

## 2️⃣ Service Layer Deep Analysis

Analyze all major Secom services:

* PressReleaseService
* MediaContactService
* ClippingService
* EventService
* AppointmentService
* CitizenPortalService
* SocialMediaService
* AuthService (business aspects only)
* TenantService
* NotificationService

For each:

### Evaluate:

* Cohesion
* Responsibility scope
* Business logic density
* External side effects
* Dependency injection quality
* Cross-service orchestration patterns
* Risk of duplicated logic
* Violation of single responsibility principle

### Identify Anti-Patterns:

* Fat services
* Logic in controllers
* Logic in Mongoose models without encapsulation
* Domain leakage between modules
* Shared mutable state risks

Provide:

* Service Complexity Rating (Low / Medium / High)
* Refactor priority classification

---

## 3️⃣ Domain Model Maturity

Analyze core Secom domain entities:

* PressRelease
* MediaContact
* Clipping
* Event
* Appointment
* CitizenProfile
* SocialMediaPost
* Tenant
* User

For each:

### Evaluate:

* Anemic vs Rich domain model
* Encapsulation of invariants
* State transition protection
* Status modeling discipline
* Behavioral methods vs procedural orchestration

### Required Output:

#### Domain Modeling Scorecard

| Dimension | Score (0–5) |
| --------- | ----------- |
| Encapsulation | |
| Invariant Protection | |
| State Modeling | |
| Cohesion | |
| Aggregate Integrity | |

---

## 4️⃣ Business Rule Inventory & Enforcement Map

Document all critical Secom business rules.

Examples (must verify implementation location):

* Press release requires approval before publishing
* Press release status workflow: draft → pending-approval → approved → published
* Appointment conflict prevention
* Appointment cancellation rules
* Citizen can only access own portal data
* Social media post scheduling validation
* Tenant data isolation enforcement
* Role-based module access enforcement
* Admin override policies

### For each rule:

| Rule ID | Description | Enforcement Layer | Consistent? | Can Be Bypassed? | Risk Level |
| ------- | ----------- | ----------------- | ----------- | ---------------- | ---------- |

### Evaluate:

* Are rules centralized?
* Are rules duplicated?
* Are rules protected at DB level?
* Are rules tested?
* Can rules be bypassed via alternate endpoints?
* Are rules protected in background jobs?

Deliver:

* Business Rule Integrity Rating
* Top 5 Enforcement Gaps

---

## 5️⃣ Validation Architecture Assessment

Evaluate validation layers:

### Layer 1 – DTO / Request Validation

* Library used?
* Field-level coverage completeness?
* Module-specific validation schemas?

### Layer 2 – Business Validation

* Domain invariant enforcement?
* Async validation correctness?
* Race condition exposure?

### Layer 3 – Database Constraints

* Composite unique indexes?
* Partial indexes for soft deletes?
* Tenant-scoped unique constraints?

### Deliver:

* Validation Coverage Matrix
* Data Integrity Risk Level
* Validation Consistency Score (0–100)

---

## 6️⃣ Transaction & Consistency Strategy

Considering MongoDB architecture:

### Evaluate:

* Multi-document transaction usage
* Transaction scope discipline
* Side effects inside transactions
* Retry strategies
* Idempotency in critical operations
* Eventual consistency risks
* Background job atomicity (BullMQ)

### Critical Flows to Inspect:

* Press release approval and publishing
* Appointment booking
* Appointment cancellation
* Citizen profile creation
* Social media post scheduling
* Tenant initialization

### Deliver:

* Transaction Safety Rating
* Concurrency Risk Assessment
* Top 3 Consistency Vulnerabilities

---

## 7️⃣ Error Modeling & Exception Discipline

Evaluate:

* Custom exception hierarchy presence
* HTTP mapping correctness
* BusinessRuleError usage consistency
* Domain-specific error codes
* Localization discipline (PT-BR vs EN)
* Sensitive data exposure risk
* Logging integration

### Identify:

* Generic `Error` usage
* Leaky internal errors
* Inconsistent status codes
* Unstructured error payloads

Deliver:

* Error Architecture Maturity Score
* Refactor Complexity Estimate

---

## 8️⃣ Multi-Tenant Integrity & Domain Isolation

This is critical.

Evaluate:

* Tenant scoping enforcement inside services
* Tenant filtering in repository queries
* Cross-boundary data leakage risks
* Admin override discipline
* Invariant protection during updates
* Aggregation queries without tenant filters

Deliver:

* Tenant Isolation Risk Level
* Highest Exposure Scenarios
* Hardening Recommendations

---

## 9️⃣ Business Logic Quality Scorecard

| Category | Score (0–100) |
| -------- | ------------- |
| Service Architecture | |
| Domain Modeling | |
| Rule Enforcement | |
| Data Integrity | |
| Transaction Safety | |
| Error Discipline | |
| Multi-Tenant Isolation | |
| Maintainability | |
| Scalability | |
| Overall Business Logic Maturity | |

---

## 🔟 Architectural Risk Matrix

| Risk | Category | Severity | Impact | Effort | Priority |
| ---- | -------- | -------- | ------ | ------ | -------- |

Include:

* Top 5 Immediate Integrity Risks
* Top 5 Structural Refactor Needs
* Quick Wins
* Long-Term Architectural Improvements

---

## Writing Standards

* No generic explanations
* No repetition
* Use structured tables
* Separate Findings from Recommendations
* Cite architectural evidence
* Explicitly state assumptions
* Write for senior backend engineers and technical leadership

---

## Important Constraints

* Do NOT fabricate undocumented behavior
* Clearly mark assumptions
* Tie transaction analysis to MongoDB architecture
* Tie validation analysis to index strategy
* Tie tenant scoping to auth/security model
* Focus on enforceability, not theoretical design

---

## Expected Depth Level

This document must read like:

> An internal enterprise-grade domain architecture audit
> performed by a senior backend architect
> to evaluate production-readiness and systemic risk

Not a general AI overview.
