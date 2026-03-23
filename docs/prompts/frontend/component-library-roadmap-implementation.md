Carefully review and implement the improvements described in:

`docs/roadmaps/frontend/component-library-improvement.md`

The document defines a **prioritized component library improvement roadmap**, organized by **issue severity and implementation phases**.

Your task is to execute the roadmap **incrementally and safely**, following the rules below.

---

# Execution Rules

## 1. Work Order

Implementation must follow the **priority order defined in the roadmap**:

1. **P0 – Design System Instability / Breaking Inconsistency**
2. **P1 – High Maintainability / Consistency Risks**
3. **P2 – Structural Improvements**
4. **P3 – Enhancements & Optimization**

Within each priority level:

* Start with the **first issue listed**
* Fully complete that issue before proceeding to the next one.

---

## 2. Issue Execution Process

For each component library issue:

1. Carefully review:

   * The **issue description**
   * The **component area affected**
   * The **system impact**
   * The **dependencies listed in the roadmap**

2. Identify the relevant components, CSS Modules, and token usages in the codebase.

3. Implement the required change using **direct code edits only**.

4. Ensure the implementation:

   * Aligns with the **existing component architecture and CSS token system**
   * Preserves design token consumption: all style values must use `var(--token-name)` from `src/styles/tokens/index.css`
   * Maintains CSS Module scoping — do not move component styles into `global.css` unless explicitly required
   * Does not introduce regressions in component behavior or rendered output.

---

## 3. Validation Steps

After implementing an issue, perform the following validations.

### Logical Verification

Confirm that:

* The change resolves the component issue described in the roadmap.
* Component behavior and rendered output remain correct.
* No unintended token bypasses or style leakage were introduced.

---

### Compilation Verification

Only perform compilation checks if the change affects **runtime code**.

Examples requiring compilation verification:

* Component prop interface changes
* Variant logic refactoring
* CSS Module restructuring affecting class name references
* Removing or renaming exported components affecting imports

Compilation verification is **not required** for:

* CSS-only token alignment fixes (replacing hardcoded values with `var()`)
* Documentation changes
* Naming cleanup with no behavioral change.

---

## 4. Testing Requirements

Tests should be **added or updated only when appropriate**.

### Tests SHOULD be created when the issue:

* Introduces new component behavior or rendered output
* Changes existing prop interfaces or variant logic
* Alters form validation feedback or error state rendering
* Changes interaction states (focus, disabled, loading, error)
* Fixes a component bug that could regress.

In these cases:

* Add **minimal, targeted tests**
* Follow the project's **existing testing strategy** (Vitest + React Testing Library)
* Ensure tests verify the **new expected behavior**.

---

### Tests are NOT required when the issue is purely structural

Examples:

* Replacing hardcoded CSS values with `var(--token-name)` in CSS Modules
* Removing duplicate components with no logic change
* Prop or variant naming cleanup
* Moving or reorganizing CSS Module files
* Documentation updates.

These are considered **Low-Risk Structural Changes**.

For such changes:

* Test suite execution is **not required**
* Compilation verification may also be skipped if no runtime code changes occurred.

---

## 5. Component Library Safety Rules

During implementation:

* **Do NOT introduce design token bypasses** — all color, spacing, radius, shadow, and typography values must reference `var(--token-name)` from `src/styles/tokens/index.css`
* **Do NOT break CSS Module scoping** — component styles must remain in their `.module.css` files
* **Do NOT move component-specific styles into `global.css`** unless the roadmap explicitly requires it
* Preserve existing component APIs — avoid breaking prop interface changes unless the roadmap explicitly requires them
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
* Maintain **existing coding conventions, component architecture, and CSS token system**
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

Explanation of the most important component or styling changes.

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
