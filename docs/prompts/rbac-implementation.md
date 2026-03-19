# Secom RBAC Implementation

## Controlled Implementation Prompt

### Objective

Implement a **robust, scalable, and maintainable Role-Based Access Control (RBAC) system** for Secom aligned with:

* Existing authentication logic
* Current user model
* API route protection patterns
* Backend architectural standards
* Secom's specific roles and permissions
* Future extensibility requirements

**Secom Roles**:
- `admin` – Full system access
- `assessor` – Press release and media management
- `social_media` – Social media content management
- `atendente` – Citizen service and appointments
- `citizen` – Public portal access

This is a structured architectural implementation — not a patch.

---

## Global Execution Rules

You must:

1. Work only within **RBAC scope**.
2. Do not implement tasks from other domains.
3. Preserve existing authentication logic unless explicitly refactoring it.
4. Avoid breaking current protected endpoints.
5. Maintain backward compatibility where possible.
6. Implement incrementally with validation gates.
7. Respect Secom's role hierarchy and permissions model.

You must NOT:

* Redesign unrelated security systems.
* Introduce new auth mechanisms (OAuth, SSO, etc.) unless specified.
* Modify frontend authorization yet (backend-first implementation).
* Skip validation and regression checks.
* Introduce permissions that don't align with Secom's business requirements.

---

## Implementation Phase Structure

### Phase 1 — Architectural Assessment (Required Before Coding)

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

4. Map Secom-specific requirements:
   * Which roles can access which modules?
   * Which roles can perform which actions?
   * Are there cross-module permissions?
   * How do permissions relate to Secom modules (press-releases, media-contacts, clipping, events, appointments, citizen-portal, social-media)?

### Deliverable Before Coding

Provide:

* Current state summary
* Proposed RBAC architecture
* Secom role → permission mapping
* Data model adjustments (if needed)
* Migration impact assessment

Pause for confirmation before proceeding.

---

## Phase 2 — Core RBAC Model Implementation

After approval:

### 1️⃣ Role & Permission Structure

Implement:

* Clear role definitions:
  * `admin` – Full access to all modules
  * `assessor` – Press releases, media contacts, clipping
  * `social_media` – Social media module
  * `atendente` – Appointments, citizen service
  * `citizen` – Citizen portal only

* Permission matrix abstraction
* Centralized permission configuration
* Strongly typed role/permission enums

**Secom-Specific Permissions** (examples):
- `create-press-release`, `approve-press-release`, `publish-press-release`
- `manage-media-contacts`
- `view-clipping`
- `manage-events`
- `manage-appointments`
- `manage-citizen-portal`
- `manage-social-media`

Ensure:

* No magic strings
* No hardcoded role comparisons scattered across code
* Single source of truth for permissions
* Clear mapping between roles and modules

---

### 2️⃣ Authorization Middleware

Create or refactor:

* `requireRole(...)`
* `requirePermission(...)`
* `requireModule(...)`  (for module-specific access)

Requirements:

* Composable middleware
* Clear error responses
* Consistent HTTP status codes (403 for forbidden)
* Structured error format aligned with API standard

---

### 3️⃣ Route-Level Enforcement

Gradually refactor protected routes:

* Replace inline role checks
* Use centralized RBAC middleware
* Ensure consistency across controllers
* Apply to all Secom module routes

Do not refactor all routes at once — work module by module.

---

### 4️⃣ Database Considerations

If roles/permissions require persistence:

* Modify schema carefully
* Add migration logic if needed
* Preserve existing user data integrity
* Ensure tenant isolation is maintained

---

## Validation Checklist (MANDATORY)

After implementation:

* [ ] All previously protected routes still work.
* [ ] Unauthorized access correctly returns 403.
* [ ] No privilege escalation paths introduced.
* [ ] No circular middleware dependencies.
* [ ] No type drift introduced.
* [ ] Shared types updated if required.
* [ ] No compile errors.
* [ ] No regression in authentication flow.
* [ ] All Secom modules have appropriate role guards.
* [ ] Citizen role cannot access admin modules.
* [ ] Assessor role cannot access social_media module.
* [ ] Atendente role cannot access press-release module.

If any issue arises, resolve before proceeding.

---

## Documentation Synchronization

After completing RBAC implementation:

1. Update the roadmap document:
   * Mark implemented sections complete.
   * Add implementation notes.

2. Update:
   * Backend auth documentation
   * API documentation (if behavior changed)

3. Document:
   * Secom role matrix
   * Permission model
   * Middleware usage guidelines
   * Module access rules

---

## Required Implementation Report

After completing RBAC implementation:

---

## ✅ Secom RBAC Implementation Report

### 1. Architecture Overview

Final RBAC structure implemented for Secom.

### 2. Files Modified

Grouped by:

* Models
* Middleware
* Controllers
* Config
* Documentation

### 3. Secom Role Matrix

Document final role → permission mapping:

| Role | Modules | Key Permissions | Notes |
|------|---------|-----------------|-------|
| admin | All | All | Full system access |
| assessor | press-releases, media-contacts, clipping | create, read, update, approve, publish | Communication management |
| social_media | social-media | create, schedule, publish | Social media management |
| atendente | appointments, citizen-portal | create, read, update | Citizen service |
| citizen | citizen-portal | read, update-profile | Public portal access |

### 4. Route Changes

List all routes updated to use RBAC middleware, organized by module:

* `/api/v1/press-releases` – Protected by assessor role
* `/api/v1/media-contacts` – Protected by assessor role
* `/api/v1/clipping` – Protected by assessor role
* `/api/v1/events` – Protected by admin/assessor roles
* `/api/v1/appointments` – Protected by atendente role
* `/api/v1/citizen-portal` – Protected by citizen role
* `/api/v1/social-media` – Protected by social_media role

### 5. Migration Impact

Explain impact on existing users/data.

### 6. Risks & Future Improvements

Identify potential improvements or scaling concerns.

### 7. Verification Confirmation

* [ ] All tests pass (if applicable)
* [ ] No regressions
* [ ] Documentation updated
* [ ] Roadmap updated
* [ ] All Secom modules protected appropriately

---

Then conclude with:

> "Secom RBAC implementation complete. All roles and permissions aligned with business requirements. Awaiting review."

Pause execution.

---

## Success Criteria

Implementation is complete only if:

* Authorization logic is centralized.
* No hardcoded role checks remain.
* Permissions are configurable and extensible.
* All protected routes use standardized middleware.
* Secom's role hierarchy is properly enforced.
* Documentation reflects real system behavior.
* The system remains stable and secure.
* All Secom modules have appropriate access controls.

