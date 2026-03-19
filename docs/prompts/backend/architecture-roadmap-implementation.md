Carefully review and implement the improvements described in:

`docs/roadmaps/backend/architecture-improvement.md`

The document defines a **prioritized architecture improvement roadmap**, organized by **issue severity and implementation phases**.

Your task is to execute the roadmap **incrementally and safely**, following the rules below.

---

# Execution Rules

## 1. Work Order

Implementation must follow the **priority order defined in the roadmap**:

1. **P0 – Architectural Instability / Structural Risk**
2. **P1 – Scalability / Maintainability Risks**
3. **P2 – Structural Improvements**
4. **P3 – Optimization & Future Enhancements**

Within each priority level:

* Start with the **first issue listed**
* Fully complete that issue before proceeding to the next one.

---

## 2. Issue Execution Process

For each architecture issue:

1. Carefully review:

   * The **issue description**
   * The **architectural impact**
   * The **affected system area**
   * The **dependencies listed in the roadmap**

2. Identify the relevant parts of the codebase.

3. Implement the required change using **direct code edits only**.

4. Ensure the implementation:

   * Aligns with the **existing architecture**
   * Preserves **multi-tenancy guarantees**
   * Maintains **security middleware ordering**
   * Does not introduce regressions.

---

## 3. Validation Steps

After implementing an issue, perform the following validations.

### Logical Verification

Confirm that:

* The change resolves the architecture issue described in the roadmap.
* The behavior of the system remains correct.
* No unintended architectural violations were introduced.

---

### Compilation Verification

Only perform compilation checks if the change affects **runtime code**.

Examples requiring compilation verification:

* Service or repository refactoring
* Middleware changes
* Dependency removal affecting imports
* Event system changes
* Worker bootstrap changes

Compilation verification is **not required** for:

* Documentation changes
* Dependency version upgrades with no API changes
* Configuration comments or cleanup.

---

## 4. Testing Requirements

Tests should be **added or updated only when appropriate**.

### Tests SHOULD be created when the issue:

* Introduces new system behavior
* Changes existing business logic
* Alters authentication or authorization behavior
* Changes event processing
* Modifies API responses
* Fixes a bug that could regress.

In these cases:

* Add **minimal, targeted tests**
* Follow the project's **existing testing strategy**
* Ensure tests verify the **new expected behavior**.

---

### Tests are NOT required when the issue is purely structural

Examples:

* Removing unused dependencies
* Refactoring internal architecture without behavior change
* Reordering middleware
* Moving event listener registration
* Configuration cleanup.

These are considered **Low-Risk Structural Changes**.

For such changes:

* Test suite execution is **not required**
* Compilation verification may also be skipped if no runtime code changes occurred.

---

## 5. Architecture Safety Rules

During implementation:

* **Do NOT introduce architectural drift**
* Maintain the **controller → service → repository → model** structure used in domain modules
* Preserve **tenant scoping via BaseRepository**
* Avoid bypassing the service or repository layer
* Avoid introducing global state or tight coupling
* Avoid unnecessary refactors unrelated to the current issue.

---

## 6. Dependency and Infrastructure Changes

If an issue involves:

* dependency removal
* dependency upgrades
* infrastructure changes (Redis, BullMQ, etc.)

then:

* Ensure unused imports are removed
* Ensure code compiles after the change
* Ensure runtime behavior remains correct.

---

## 7. Documentation Updates

After completing an issue:

* Update the roadmap document
* Mark the issue as **Completed**
* Add brief implementation notes if necessary.

---

## 8. Execution Control

After completing each architecture issue:

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

Explanation of the most important architectural changes.

---

## Tests

If applicable:

* Tests added or modified
* What behavior they validate.

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

