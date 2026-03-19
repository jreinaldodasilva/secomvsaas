# 🔎 PROMPT Backend Code Quality & Testing – Enterprise Production Audit

# Secom Backend Code Quality & Testing Review

## Context

You are conducting a **senior-level production architecture audit** of the Secom backend.

The system:

* Is a **single-tenant government communications platform (Secretaria de Comunicação)**
* Uses **Node.js + Express + TypeScript**
* Implements **RBAC with 5 roles (admin, assessor, social_media, atendente, citizen)**
* Uses **JWT with httpOnly cookies**
* Supports **endpoints across 7 Secom modules (press-releases, media-contacts, clipping, events, appointments, citizen-portal, social-media)**
* Handles **sensitive government and communications data**
* Enforces **tenant-scoped isolation**
* Requires **high security, reliability, and auditability**

This is not a basic lint review.
This is a **production-grade codebase maturity assessment**.

If information is missing:

* Explicitly state assumptions
* Highlight architectural risks
* Recommend enterprise-level improvements

---

# Objectives

Evaluate:

1. Code quality & maintainability
2. Architectural discipline
3. Domain boundary enforcement
4. TypeScript strictness & type safety
5. Test coverage & reliability
6. Security implementation quality
7. Error handling consistency
8. Documentation maturity
9. Production readiness gaps

Deliver findings clearly separated into:

* 🔎 Findings
* ⚠ Risks
* 💡 Recommendations
* 🟥 Critical / 🟧 High / 🟨 Medium / 🟩 Low severity

---

# 1. Code Metrics & Structural Health

## 1.1 Codebase Metrics

Calculate and report:

* Total lines of code
* Number of source files
* Average file size
* Files >500 lines (flag)
* Files >800 lines (critical flag)
* Code duplication %
* Cyclomatic complexity (avg + top 10 worst files)
* Longest functions (>80 lines)

### File Size Distribution

```
< 100 lines:
100-200 lines:
200-300 lines:
300-500 lines:
> 500 lines:
> 800 lines:
```

Flag:

* 🟥 God services
* 🟧 Overloaded controllers
* 🟧 Mixed infrastructure + domain logic
* 🟨 Utility dumping grounds

---

## 1.2 Largest Files Deep Analysis

For each file >500 LOC:

| File | Lines | Domain | Responsibility | Violations | Risk Level | Refactor Strategy |
| ---- | ----- | ------ | -------------- | ---------- | ---------- | ----------------- |

Assess:

* Multiple responsibilities?
* Business logic in controllers?
* Direct DB access in routes?
* RBAC logic duplicated?
* Transaction logic scattered?

---

# 2. Architectural Discipline Review

Evaluate adherence to:

* Layered architecture (Controller → Service → Repository)
* Separation of concerns
* Domain-driven boundaries
* Data scoping enforcement
* RBAC enforcement centralization
* Transaction boundaries
* Dependency injection patterns

## 2.1 Layer Violations

Flag:

* 🟥 DB access in controllers
* 🟥 Auth logic in routes
* 🟧 Business rules in validators
* 🟧 Cross-domain coupling
* 🟨 Circular dependencies

---

## 2.2 Multi-Tenant Safety

Verify:

* Tenant ID always required?
* Query filters always scoped?
* Super-admin bypass properly isolated?
* No raw queries without tenant filter?

Flag:

* 🟥 Data leakage risk
* 🟧 Conditional isolation logic
* 🟨 Inconsistent scoping enforcement

---

## 2.3 RBAC Enforcement

Check:

* Centralized permission checks?
* Middleware-based enforcement?
* Hardcoded role strings?
* Permission logic duplicated?

Flag:

* 🟥 Authorization bypass risk
* 🟧 Inconsistent permission checks
* 🟨 Role logic in controllers

---

# 3. TypeScript Quality & Type Safety

## 3.1 tsconfig Strictness

Evaluate:

```json
{
  "strict": ?,
  "noImplicitAny": ?,
  "strictNullChecks": ?,
  "noUnusedLocals": ?,
  "noUnusedParameters": ?
}
```

Flag:

* 🟥 Strict mode disabled
* 🟧 Excessive `any`
* 🟨 Overuse of type assertions

---

## 3.2 Type Coverage

Measure:

* Explicit `any`
* Implicit `any`
* `as` assertions
* Non-null `!`
* Missing return types
* Untyped external integrations
* Unsafe JSON parsing

Evaluate advanced usage:

* Branded types (IDs)
* Discriminated unions
* Generic repository patterns
* Strict DTO validation alignment
* Enum usage for status values

Deliver:

* Type maturity score (0–100)

---

# 4. Domain Logic Quality

Focus on critical domains:

* Authentication
* Scheduling
* CitizenProfiles
* Payments
* Officeal records

Assess:

* Conflict detection robustness
* Transaction atomicity
* Payment integrity
* Data consistency guarantees
* Idempotency patterns
* Concurrency safeguards
* Retry safety
* External integration safety

Flag:

* 🟥 Financial logic without transaction protection
* 🟥 Scheduling race conditions
* 🟧 Missing idempotency
* 🟨 No optimistic locking

---

# 5. Testing Strategy & Coverage

## 5.1 Test Infrastructure

Identify:

* Framework used
* Test organization
* Test environment isolation
* Mocking patterns
* DB test isolation
* Seed strategies

---

## 5.2 Coverage Metrics

```
Statements:
Branches:
Functions:
Lines:
```

Break down by domain:

| Domain | Unit | Integration | E2E | Coverage | Critical Gaps |
| ------ | ---- | ----------- | --- | -------- | ------------- |

---

## 5.3 Critical Path Coverage

Specifically verify coverage for:

* Login & refresh token flow
* Password reset
* Agendamento booking conflicts
* Payment processing
* RBAC enforcement
* Data scoping
* Audit logging
* Error handling middleware

Flag:

* 🟥 Financial flows untested
* 🟥 Auth bypass untested
* 🟧 Scheduling edge cases missing
* 🟨 Partial validation coverage

---

## 5.4 Test Quality Evaluation

Detect:

* Testing implementation details
* Over-mocking
* No integration tests
* No negative test cases
* No concurrency tests
* No performance tests

Classify:

* 🟥 Brittle tests
* 🟧 Shallow coverage
* 🟨 Missing edge cases
* 🟩 Behavior-focused tests

Deliver:

* Test maturity score (0–100)

---

# 6. Error Handling & Observability

Assess:

* Global error middleware consistency
* Standardized error envelopes
* Error codes usage
* Sensitive data exposure
* Logging strategy (Pino?)
* Correlation ID propagation
* Sentry integration
* Audit logging completeness

Flag:

* 🟥 Stack traces in production
* 🟥 Sensitive data in logs
* 🟧 Inconsistent error formats
* 🟨 Missing structured logging

---

# 7. Security Code Review

Evaluate:

* Injection protections (MongoDB operators)
* Input sanitization
* XSS mitigation
* CSRF implementation
* Cookie security flags
* JWT validation robustness
* Secret management
* Rate limiting granularity
* Dependency vulnerabilities
* File upload validation
* Webhook signature validation

Flag:

* 🟥 Auth bypass risk
* 🟥 Payment security weakness
* 🟧 Hardcoded secrets
* 🟨 Overly permissive CORS

---

# 8. Code Organization & Modularity

Assess current structure vs ideal modular structure.

Evaluate:

* Domain cohesion
* Shared vs module separation
* Cross-domain imports
* Feature-based grouping
* Monolithic service files

Provide recommended structure:

```
src/
├── modules/
├── shared/
├── infrastructure/
├── config/
```

---

# 9. Documentation & Developer Experience

Evaluate:

* README completeness
* Setup instructions
* Environment configuration guide
* Testing instructions
* Deployment guide
* Swagger/OpenAPI accuracy
* Inline code documentation
* ADR presence (architecture decision records)

Flag:

* 🟧 Missing production setup instructions
* 🟧 Outdated API docs
* 🟨 Undocumented complex logic

---

# Required Output Documents

## File 1:

`docs/architecture/backend/code-quality.md`

Include:

* Code metrics
* Architecture review
* TypeScript maturity
* Security review
* Structural risks
* Refactoring roadmap
* Overall maturity score (0–100)
* Production readiness verdict

---

## File 2:

`docs/architecture/backend/testing-strategy.md`

Include:

* Current coverage state
* Critical gaps
* Test architecture review
* Testing anti-patterns
* Concurrency test strategy
* Performance testing strategy
* Target coverage goals
* 90-day testing improvement roadmap

---

# Writing Guidelines

* Be precise and structured
* Use severity classification consistently
* Separate findings from recommendations
* Avoid speculation without stating assumptions
* Write for senior backend engineers and architects
* Think in terms of production risk, not just style
* If necessary due to the size of the document, split the document into more files.
