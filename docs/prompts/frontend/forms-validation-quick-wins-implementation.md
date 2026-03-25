# Prompt

Carefully review and implement the fixes described in:

`docs/roadmaps/frontend/forms-validation-quick-wins.md`

---

# Execution Rules

1. Begin with **Quick Win #1** (QW-01).

2. Fully complete **all sub-tasks** associated with the current Quick Win before moving forward.

3. For each Quick Win:

   * Carefully analyze the intent described in the document.
   * Implement the required changes through **direct code edits only**.

4. After implementation, perform the following validation steps:

   **Logical Verification**

   * Confirm the implementation matches the documented intent.
   * Ensure no regressions or unintended side effects were introduced.
   * Verify that the changes integrate correctly with the existing form architecture, validation library, and design token system.

   **Compilation Check (when applicable)**

   * Ensure the code compiles successfully **only if the change affects executable code**.

5. **Testing Requirements**

   Determine whether tests are necessary based on the type of change.

   **Tests SHOULD be added or updated when the Quick Win:**

   * Introduces new validation behavior or changes validation trigger timing (onBlur / onChange / onSubmit)
   * Modifies existing form field logic, schema rules, or cross-field validation
   * Changes error state rendering or error message output
   * Fixes a form submission bug that could regress in the future
   * Alters conditional field rendering or dynamic form behavior

   In these cases:

   * Add **minimal, targeted tests** aligned with the project's current testing strategy (Vitest + React Testing Library).
   * Ensure the tests validate the intended behavior change.

   **Tests are NOT required when the Quick Win is a small, low-risk change**, such as:

   * Replacing hardcoded error style values with `var(--token-name)` in CSS Modules with no behavioral change
   * Normalizing validation message wording or Portuguese localization with no logic change
   * Naming convention cleanup in schema files
   * Removing duplicated validation logic with identical behavior
   * Documentation updates
   * Non-functional refactoring

   These are considered **Small Quick Wins**.

6. **Execution Optimization for Small Quick Wins**

   If the Quick Win qualifies as a **Small Quick Win**:

   * Do **not** require compilation verification.
   * Do **not** run the test suite.
   * Do **not** pause for approval between such small improvements if they are grouped under the same Quick Win.

7. Once the Quick Win is fully implemented and validated:

   * Update the Quick Wins document.
   * Mark the Quick Win and all its sub-tasks as **Completed**.

8. **Execution Control**

   * For **standard Quick Wins**, stop execution and request approval before proceeding to the next Quick Win.
   * For **Small Quick Wins within the same section**, proceed sequentially without requesting approval.

---

# Technical Constraints

* **Do NOT use scripts, automation tools, or the command shell** to modify code.
* All modifications must be performed through **direct code edits only**.
* Maintain the **existing form architecture, validation library usage, and coding standards** unless the Quick Win explicitly requires a change.
* Preserve the design token system: all validation state styles must use `var(--token-name)` from `src/styles/tokens/index.css` — do not introduce hardcoded color, spacing, radius, or shadow values.
* Preserve CSS Module scoping — do not move form component styles into `global.css` unless the Quick Win explicitly requires it.
* Do not change validation trigger timing (onBlur / onChange / onSubmit) unless the Quick Win explicitly targets it.
* Avoid introducing new dependencies unless strictly necessary.

---

# Output Expectations

After completing each Quick Win, provide a structured report containing:

### Implementation Summary

* Clear description of what was implemented

### Files Modified

* List of all modified files

### Key Code Changes

* Brief explanation of the most relevant code changes

### Tests

* Tests added or updated (if applicable)
* Explanation of what behavior they validate

### Assumptions

* Any assumptions made during implementation

### Risks or Edge Cases

* Potential issues or areas requiring future attention

### Documentation Update

* Confirmation that the Quick Wins document has been updated
* Confirmation that the Quick Win and its sub-tasks were marked **Completed**

---

Then **pause and wait for approval before continuing to the next Quick Win** (unless the change qualifies as a Small Quick Win as defined above).
