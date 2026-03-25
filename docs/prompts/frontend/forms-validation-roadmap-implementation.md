Carefully review and implement the improvements described in:

`docs/roadmaps/frontend/forms-validation-improvement.md`

The document defines a **prioritized forms & validation improvement roadmap**, organized by **issue severity and implementation phases**.

Your task is to execute the roadmap **incrementally and safely**, following the rules below.

---

# Execution Rules

## 1. Work Order

Implementation must follow the **priority order defined in the roadmap**:

1. **P0 – Data Integrity / Submission Risk**
2. **P1 – Reliability / Maintainability Risks**
3. **P2 – Structural Standardization Improvements**
4. **P3 – Optimization & Refinements**

Within each priority level:

* Start with the **first issue listed**
* Fully complete that issue before proceeding to the next one.

---

## 2. Issue Execution Process

For each forms & validation issue:

1. Carefully review:

   * The **issue description**
   * The **form area affected**
   * The **system impact**
   * The **dependencies listed in the roadmap**

2. Identify the relevant form components, validation schemas, custom hooks, and CSS Modules in the codebase.

3. Implement the required change using **direct code edits only**.

4. Ensure the implementation:

   * Aligns with the **existing form architecture, validation library usage, and CSS token system**
   * Preserves design token consumption: all validation state styles must use `var(--token-name)` from `src/styles/tokens/index.css`
   * Maintains CSS Module scoping — do not move form component styles into `global.css` unless explicitly required
   * Does not change validation trigger timing (onBlur / onChange / onSubmit) unless the issue explicitly requires it
   * Does not introduce regressions in form behavior, validation logic, or submission flow.

---

## 3. Validation Steps

After implementing an issue, perform the following validations.

### Logical Verification

Confirm that:

* The change resolves the form or validation issue described in the roadmap.
* Form behavior, validation logic, and submission flow remain correct.
* No unintended token bypasses, validation regressions, or error state inconsistencies were introduced.

---

### Compilation Verification

Only perform compilation checks if the change affects **runtime code**.

Examples requiring compilation verification:

* Validation schema restructuring or centralization
* Form hook interface changes
* Conditional field rendering logic changes
* Removing or renaming exported form components or schemas affecting imports

Compilation verification is **not required** for:

* CSS-only token alignment fixes (replacing hardcoded values with `var()`)
* Validation message wording or Portuguese localization updates
* Naming cleanup with no behavioral change
* Documentation changes.

---

## 4. Testing Requirements

Tests should be **added or updated only when appropriate**.

### Tests SHOULD be created when the issue:

* Introduces new validation behavior or changes validation trigger timing
* Modifies existing schema rules, cross-field validation, or async validation logic
* Alters conditional field rendering or dynamic form behavior
* Changes error state rendering or error message output
* Fixes a form submission bug that could regress.

In these cases:

* Add **minimal, targeted tests**
* Follow the project's **existing testing strategy** (Vitest + React Testing Library)
* Ensure tests verify the **new expected behavior**.

---

### Tests are NOT required when the issue is purely structural

Examples:

* Replacing hardcoded CSS values with `var(--token-name)` in CSS Modules
* Normalizing validation message wording or Portuguese localization with no logic change
* Removing duplicated validation logic with identical behavior
* Naming convention cleanup in schema files
* Documentation updates.

These are considered **Low-Risk Structural Changes**.

For such changes:

* Test suite execution is **not required**
* Compilation verification may also be skipped if no runtime code changes occurred.

---

## 5. Forms & Validation Safety Rules

During implementation:

* **Do NOT introduce design token bypasses** — all validation state color, spacing, radius, and shadow values must reference `var(--token-name)` from `src/styles/tokens/index.css`
* **Do NOT break CSS Module scoping** — form component styles must remain in their `.module.css` files
* **Do NOT move form component styles into `global.css`** unless the roadmap explicitly requires it
* **Do NOT alter validation trigger timing** (onBlur / onChange / onSubmit) unless the roadmap explicitly requires it
* Preserve existing form component APIs — avoid breaking prop interface changes unless the roadmap explicitly requires them
* Avoid unnecessary refactors unrelated to the current issue.

---

## 6. Dependency and Build Changes

If an issue involves dependency removal, upgrades, or build configuration changes:

* Ensure unused imports are removed
* Ensure the project compiles after the change
* Ensure runtime behavior remains correct.

---

## 7. Documentation Updates

After completing an issue:

* Update the roadmap document
* Mark the issue as **Completed**
* Add brief implementation notes if necessary.

---

## 8. Execution Control

After completing each roadmap issue:

1. Stop execution.
2. Provide a report of the changes.
3. Request approval before proceeding to the next issue.

Do **not** continue automatically to the next roadmap item.

---

# Technical Constraints

The following constraints must be strictly respected:

* **Do NOT use scripts, automation tools, or the command shell to modify code**
* All changes must be implemented via **direct code edits**
* Maintain **existing coding conventions, form architecture, validation library usage, and CSS token system**
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

Explanation of the most important form, validation, or styling changes.

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
