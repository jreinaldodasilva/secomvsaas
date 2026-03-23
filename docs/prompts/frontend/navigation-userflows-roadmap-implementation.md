Carefully review and implement the improvements described in:

`docs/roadmaps/frontend/navigation-userflows-improvement.md`

The document defines a **prioritized navigation and user flow improvement roadmap**, organized by **issue severity and implementation phases**.

Your task is to execute the roadmap **incrementally and safely**, following the rules below.

---

# Execution Rules

## 1. Work Order

Implementation must follow the **priority order defined in the roadmap**:

1. **P0 – Flow Instability / Access Control Risk**
2. **P1 – Structural Navigation Risks**
3. **P2 – Flow Optimization & Standardization**
4. **P3 – Enhancements & Refinements**

Within each priority level:

* Start with the **first issue listed**
* Fully complete that issue before proceeding to the next one.

---

## 2. Issue Execution Process

For each navigation issue:

1. Carefully review:

   * The **issue description**
   * The **system impact**
   * The **affected flow area**
   * The **dependencies listed in the roadmap**

2. Identify the relevant parts of the codebase.

3. Implement the required change using **direct code edits only**.

4. Ensure the implementation:

   * Aligns with the **existing routing and authorization architecture**
   * Preserves the established layering: HTTP client → services → domain hooks → pages
   * Maintains **RBAC guards** at both route and UI levels via `ProtectedRoute` and `PermissionGate`
   * Does not introduce regressions in existing navigation flows.

---

## 3. Validation Steps

After implementing an issue, perform the following validations.

### Logical Verification

Confirm that:

* The change resolves the navigation issue described in the roadmap.
* Redirect behavior, guard enforcement, and session management remain correct.
* No unintended navigation regressions were introduced.

---

### Compilation Verification

Only perform compilation checks if the change affects **runtime code**.

Examples requiring compilation verification:

* Routing changes (`routes/index.tsx`)
* Guard or auth context modifications
* Layout component changes
* Hook modifications (`useSessionTimeout`, `useAuth`)
* Service layer changes (`authService`)

Compilation verification is **not required** for:

* Documentation changes
* Inline code comments
* Dead code removal with no import side effects.

---

## 4. Testing Requirements

Tests should be **added or updated only when appropriate**.

### Tests SHOULD be created when the issue:

* Introduces new routing or redirect behavior
* Changes guard enforcement logic
* Alters session timeout or re-authentication flow
* Modifies `state.from` handling
* Changes auth context update behavior (e.g., `AcceptInvitePage` fix)
* Fixes a navigation bug that could regress.

In these cases:

* Add **minimal, targeted tests**
* Follow the project's **existing testing strategy** (Vitest + React Testing Library)
* Ensure tests verify the **new expected navigation behavior**.

---

### Tests are NOT required when the issue is purely structural

Examples:

* Removing unused layout components or dead code
* Adding inline code comments or documentation
* Replacing `Link` with `NavLink` for styling only
* Adding Zustand persistence middleware with no logic change
* Moving type definitions between files with no behavioral change.

These are considered **Low-Risk Structural Changes**.

For such changes:

* Test suite execution is **not required**
* Compilation verification may also be skipped if no runtime code changes occurred.

---

## 5. Navigation Safety Rules

During implementation:

* **Do NOT weaken or bypass existing route guards**
* Maintain the two-layer guard pattern: outer `ProtectedRoute(STAFF_ROLES)` + inner `ProtectedRoute(rolesWithPermission(...))`
* Preserve `PermissionGate` enforcement in the sidebar and at the UI level
* Do not introduce direct API calls in page components — route through `authService` and domain hooks
* Avoid coupling navigation logic between independent flows (staff vs. citizen portal)
* Avoid unnecessary refactors unrelated to the current issue.

---

## 6. Auth Context and Session Changes

If an issue involves:

* `AuthContext` or `CitizenAuthContext` modifications
* `useSessionTimeout` integration
* Token refresh or logout redirect behavior

then:

* Ensure both staff and citizen auth flows remain independently functional
* Verify that `isAuthenticated` state is correctly reflected after any context update
* Ensure session cookie handling is not altered — session state lives in httpOnly cookies managed by the backend.

---

## 7. Documentation Updates

After completing an issue:

* Update the roadmap document
* Mark the issue as **Completed**
* Add brief implementation notes if necessary.

---

## 8. Execution Control

After completing each navigation issue:

1. Stop execution.
2. Provide a report of the changes.
3. Request approval before proceeding to the next issue.

Do **not** continue automatically to the next roadmap item.

---

# Technical Constraints

The following constraints must be strictly respected:

* **Do NOT use scripts, automation tools, or the command shell to modify code**
* All changes must be implemented via **direct code edits**
* Maintain **existing coding conventions and project architecture**
* Do not introduce new dependencies unless explicitly required by the roadmap issue
* Avoid large refactors unless the roadmap explicitly requires them.

---

# Output Expectations

After completing an issue, provide a structured report containing:

## Implementation Summary

A clear explanation of what was implemented.

---

## Files Modified

List of all modified files.

---

## Key Code Changes

Explanation of the most important navigation or routing changes.

---

## Tests

If applicable:

* Tests added or modified
* What navigation behavior they validate.

---

## Assumptions

Any assumptions made during implementation.

---

## Risks or Edge Cases

Potential issues introduced by the change or areas that may require future attention.

---

## Documentation Update

Confirm that:

* The roadmap document was updated
* The issue was marked **Completed**

---

Then **pause execution and wait for approval before proceeding to the next issue**.
