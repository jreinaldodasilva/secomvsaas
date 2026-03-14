
# Sintgesp – Comprehensive API Architecture & Design Audit

You are a **Senior Backend Architect performing a production-grade API audit** of the Sintgesp system.

Use the following documents as your primary sources of truth:

* `docs/backend/01-Sintgesp-Backend-Architecture-Overview-Part1.md`
* `docs/backend/01-Sintgesp-Backend-Architecture-Overview-Part2.md`
* `docs/backendroadmaps/01-Sintgesp-Backend-Architecture-Improvement-Roadmap.md`
* `docs/backendroadmaps/01-Sintgesp-Backend-Architecture-Quick-Wins.md`
* `docs/backendroadmaps/01-Sintgesp-Backend-Architecture-Open-Issues.md`


Assume:

* This is a **healthcare/department management system**
* The API is already in production or near-production
* The system must meet **high standards of security, scalability, data integrity, and maintainability**
* It uses **MongoDB + Mongoose**
* It implements **multi-tenancy at the department level**

If information is missing:

* Explicitly state assumptions
* Identify documentation gaps
* Flag architectural risks
* Do NOT invent endpoints or behavior without stating assumptions

---

# 🎯 Audit Objectives

Produce a **deep architectural analysis** of the API layer focusing on:

1. API surface completeness
2. REST design quality
3. Consistency & predictability
4. Scalability patterns
5. Security & multi-tenant isolation
6. Long-term maintainability risks
7. Developer experience

This is not a superficial checklist review — it is an engineering audit.

---

# 📦 Required Output File

```
docs/backend/02-Sintgesp-API-Design-Overview.md
```
Obs: Consider splitting the document into multiple files due to its size. For example, create files such as 'docs/backend/02-Sintgesp-API-Design-Overview-Part1.md', 'docs/backend/02-Sintgesp-API-Design-Overview-Part2.md', and so on.

---

# 📑 Required Sections

---

## 1️⃣ API Overview

Provide:

* High-level API architecture summary
* Domain breakdown (auth, athletes, appointments, billing, etc.)
* Estimated endpoint count
* API maturity level (Prototype / MVP / Production-Ready / Enterprise-Grade)
* Architectural strengths
* High-level risks

---

## 2️⃣ Complete API Endpoint Inventory

Create a structured inventory of **all discoverable endpoints**.

### Requirements:

* Group by resource domain
* Include protected vs public
* Include inferred endpoints only if clearly justified

### Required Table Format:

| Method | Endpoint | Controller | Handler | Auth | Roles | Request Schema | Response Schema | Status Codes | Notes |
| ------ | -------- | ---------- | ------- | ---- | ----- | -------------- | --------------- | ------------ | ----- |

Additionally:

* Count endpoints per domain
* Identify overly large controllers
* Flag missing CRUD symmetry
* Highlight inconsistent naming

Deliverable must include:

* Endpoint totals
* Observed patterns
* Design smells

---

## 3️⃣ RESTful Design Evaluation

Evaluate against REST principles:

### Checklist:

* Resource-based URLs
* Proper HTTP verbs
* No RPC-style naming
* Stateless design
* Proper status code usage
* Predictable nesting
* Idempotency where applicable
* Soft delete behavior consistency

### Output Format:

#### REST Compliance Score (0–100)

#### Severity Classification:

* 🟥 Critical (Breaks REST principles)
* 🟧 Major Design Smell
* 🟨 Minor Inconsistency
* 🟩 Well Designed

For each violation:

* Show concrete example
* Explain why it's problematic
* Provide corrected version
* Estimate refactor complexity (Low / Medium / High)

---

## 4️⃣ Request & Response Pattern Analysis

Analyze all request and response contracts.

### Evaluate:

#### Naming Consistency

* camelCase vs snake_case
* Enum casing
* Boolean naming

#### Success Envelope Pattern

Is there:

```json
{ "success": true, "data": {...}, "meta": {...} }
```

Or inconsistent raw objects?

#### Error Standardization

* Single error format?
* Machine-readable error codes?
* Field-level validation?
* Localization consistency (PT-BR vs EN)?

#### Date & Time Handling

* ISO 8601?
* Timezone awareness?
* UTC normalization?

#### Partial vs Full Updates

* PUT vs PATCH usage?
* Risk of accidental overwrites?

Deliver:

* Pattern Consistency Score (0–100)
* Identified contract fragmentation
* Refactor recommendations

---

## 5️⃣ Pagination, Filtering & Sorting Architecture

Evaluate all list endpoints.

### Required Analysis:

* Pagination strategy (page/limit vs cursor)
* Metadata consistency
* Default limits
* Protection against unbounded queries
* Index-aligned filtering
* Multi-field sorting support

### Risk Classification:

* 🟥 No pagination
* 🟧 Inconsistent format
* 🟨 Limited filtering
* 🟩 Production-ready scalable design

Provide:

* Performance implications
* Index alignment assessment (based on MongoDB architecture doc)
* Scalability ceiling estimation

---

## 6️⃣ API Versioning Strategy

Document:

* Versioning mechanism (URL/header/none)
* Version coverage consistency
* Breaking change strategy
* Deprecation policy
* Migration risk

Provide:

* Versioning maturity rating
* Enterprise-readiness assessment

---

## 7️⃣ Multi-Tenancy & Security Boundary Review

This is critical.

Evaluate:

* Department scoping enforcement
* Middleware dependency risks
* Potential cross-department leakage scenarios
* Super admin bypass rules
* Token scoping
* Audit logging exposure
* Mass assignment risks
* Field-level security

Provide:

* Tenant Isolation Risk Assessment
* Attack Surface Observations
* Required Hardening Steps

---

## 8️⃣ Rate Limiting & Abuse Protection

Analyze:

* Rate limiting existence
* Scope (IP / user / department / token)
* Headers exposed
* Protection of heavy endpoints
* DDoS mitigation
* Background job abuse

Provide:

* Abuse Risk Level
* Production-readiness rating

---

## 9️⃣ API Documentation Quality

Evaluate:

* Swagger/OpenAPI presence
* Schema accuracy vs code
* Example completeness
* Error documentation
* Auth documentation
* Onboarding clarity

Provide:

* Documentation Coverage %
* Developer Experience Rating

---

## 🔟 Architectural Risk Matrix

Create a final prioritized matrix:

| Risk | Category | Severity | Impact | Effort | Priority |
| ---- | -------- | -------- | ------ | ------ | -------- |

Include:

* Top 5 immediate risks
* Top 5 structural risks
* Quick wins
* Long-term refactors

---

# 📊 Scoring Summary

Provide final scores:

| Category             | Score (0–100) |
| -------------------- | ------------- |
| REST Design          |               |
| Contract Consistency |               |
| Scalability          |               |
| Security & Isolation |               |
| Documentation        |               |
| Overall API Maturity |               |

---

# ✍ Writing Standards

* No fluff
* No repetition
* Be specific
* Reference architecture evidence
* Separate Findings from Recommendations
* Use structured formatting
* Write for senior backend engineers

---

# 🔒 Important Constraints

* Do NOT fabricate endpoints
* If controller layer is undocumented, state limitation
* If inference is required, clearly label as assumption
* Tie performance analysis to MongoDB index strategy
* Tie security analysis to multi-tenant implementation details

---

# Expected Depth Level

This should read like:

> An internal enterprise architecture audit report
> prepared by a senior backend architect
> for technical leadership decision-making

Not a generic AI summary.

