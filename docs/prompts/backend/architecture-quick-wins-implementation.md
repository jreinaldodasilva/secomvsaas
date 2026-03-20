# Prompt

Carefully review and implement the fixes described in:

`docs/roadmaps/backend/architecture-quick-wins.md`

---

# Execution Rules

1. Begin with **Quick Win #1**.

2. Fully complete **all sub-tasks** associated with the current Quick Win before moving forward.

3. For each Quick Win:

   * Carefully analyze the intent described in the document.
   * Implement the required changes through **direct code edits only**.

4. After implementation, perform the following validation steps:

   **Logical Verification**

   * Confirm the implementation matches the documented intent.
   * Ensure no regressions or unintended side effects were introduced.
   * Verify that the changes integrate correctly with the existing architecture.

   **Compilation Check (when applicable)**

   * Ensure the code compiles successfully **only if the change affects executable code**.

5. **Testing Requirements**

   Determine whether tests are necessary based on the type of change.

   **Tests SHOULD be added or updated when the Quick Win:**

   * Introduces new logic or behavior
   * Modifies existing business logic
   * Changes validation rules
   * Alters API behavior or response formats
   * Fixes a bug that could regress in the future

   In these cases:

   * Add **minimal, targeted tests** aligned with the project's current testing strategy.
   * Ensure the tests validate the intended behavior change.

   **Tests are NOT required when the Quick Win is a small, low-risk change**, such as:

   * Documentation updates
   * Naming improvements
   * Logging improvements
   * Non-functional refactoring
   * Minor structural adjustments with no behavioral change

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
* Maintain the **existing architecture, project conventions, and coding standards** unless the Quick Win explicitly requires a change.
* Avoid introducing new dependencies unless strictly necessary.

---

# Output Expectations

After completing the Quick Win, provide a structured report containing:

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

