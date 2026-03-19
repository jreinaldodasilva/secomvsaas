Here is a **structured, execution-controlled implementation prompt** specifically for starting:

`docs/backendroadmaps/04-Secom-Auth-Security-Remaining-Roadmap-Part2.md`
→ **Domain 3: RBAC & Authorisation Model**

This prompt is optimized for safe architectural implementation, strict scope control, and regression prevention.

---

# 🔐 Secom — Domain 3: RBAC & Authorisation Model

## Controlled Implementation Prompt

## 🎯 Objective

Begin the implementation of:

```
docs/backendroadmaps/04-Secom-Auth-Security-Remaining-Roadmap-Part2.md
```

Specifically:

> **Domain 3 — RBAC & Authorisation Model**

The goal is to design and implement a **robust, scalable, and maintainable Role-Based Access Control (RBAC) system** aligned with:

* Existing authentication logic
* Current user model
* API route protection patterns
* Backend architectural standards
* Future extensibility requirements

This is a structured architectural implementation — not a patch.

---

# 🔒 GLOBAL EXECUTION RULES

You must:

1. Work only within **Domain 3 scope**.
2. Do not implement tasks from other domains.
3. Preserve existing authentication logic unless explicitly refactoring it.
4. Avoid breaking current protected endpoints.
5. Maintain backward compatibility where possible.
6. Implement incrementally with validation gates.

You must NOT:

* Redesign unrelated security systems.
* Introduce new auth mechanisms (OAuth, SSO, etc.) unless specified.
* Modify frontend authorization yet (backend-first implementation).
* Skip validation and regression checks.

---

# 🧭 IMPLEMENTATION PHASE STRUCTURE

## Phase 1 — Architectural Assessment (Required Before Coding)

Before implementing:

1. Identify current authorization mechanisms:

   * How roles are stored (User model?)
   * How permissions are enforced (middleware?)
   * Route-level protection structure
2. Identify limitations:

   * Hardcoded role checks?
   * Missing permission granularity?
   * Inconsistent enforcement?
3. Define target RBAC architecture:

   * Role model structure
   * Permission structure
   * Middleware enforcement pattern
   * Route integration strategy

### Deliverable Before Coding

Provide:

* Current state summary
* Proposed RBAC architecture
* Data model adjustments (if needed)
* Migration impact assessment

Pause for confirmation before proceeding.

---

# 🏗 PHASE 2 — Core RBAC Model Implementation

After approval:

## 1️⃣ Role & Permission Structure

Implement:

* Clear role definitions (e.g., ADMIN, assessor, atendente, etc.)
* Permission matrix abstraction
* Centralized permission configuration
* Strongly typed role/permission enums

Ensure:

* No magic strings
* No hardcoded role comparisons scattered across code
* Single source of truth for permissions

---

## 2️⃣ Authorization Middleware

Create or refactor:

* `requireRole(...)`
* `requirePermission(...)`

Requirements:

* Composable middleware
* Clear error responses
* Consistent HTTP status codes (403 for forbidden)
* Structured error format aligned with API standard

---

## 3️⃣ Route-Level Enforcement

Gradually refactor protected routes:

* Replace inline role checks
* Use centralized RBAC middleware
* Ensure consistency across controllers

Do not refactor all routes at once — work domain by domain.

---

## 4️⃣ Database Considerations

If roles/permissions require persistence:

* Modify schema carefully
* Add migration logic if needed
* Preserve existing user data integrity

---

# 🧪 VALIDATION CHECKLIST (MANDATORY)

After implementation:

* [ ] All previously protected routes still work.
* [ ] Unauthorized access correctly returns 403.
* [ ] No privilege escalation paths introduced.
* [ ] No circular middleware dependencies.
* [ ] No type drift introduced.
* [ ] Shared types updated if required.
* [ ] No compile errors.
* [ ] No regression in authentication flow.

If any issue arises, resolve before proceeding.

---

# 📘 DOCUMENTATION SYNCHRONIZATION

After completing Domain 3:

1. Update the roadmap document:

   * Mark implemented sections complete.
   * Add implementation notes.
2. Update:

   * Backend auth documentation
   * API documentation (if behavior changed)
3. Document:

   * Role matrix
   * Permission model
   * Middleware usage guidelines

---

# 📦 REQUIRED IMPLEMENTATION REPORT

After completing Domain 3:

---

## ✅ Domain 3 — RBAC Implementation Report

### 1. Architecture Overview

Final RBAC structure implemented.

### 2. Files Modified

Grouped by:

* Models
* Middleware
* Controllers
* Config
* Documentation

### 3. Permission Matrix

Document final role → permission mapping.

### 4. Route Changes

List all routes updated to use RBAC middleware.

### 5. Migration Impact

Explain impact on existing users/data.

### 6. Risks & Future Improvements

Identify potential improvements or scaling concerns.

### 7. Verification Confirmation

* [ ] All tests pass (if applicable)
* [ ] No regressions
* [ ] Documentation updated
* [ ] Roadmap updated

---

Then conclude with:

> “Domain 3: RBAC & Authorisation Model implementation complete. Awaiting review.”

Pause execution.

---

# 🏁 SUCCESS CRITERIA

Implementation is complete only if:

* Authorization logic is centralized.
* No hardcoded role checks remain.
* Permissions are configurable and extensible.
* All protected routes use standardized middleware.
* Documentation reflects real system behavior.
* The system remains stable and secure.

