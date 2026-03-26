# Prompt

Carefully review and implement the fixes described in:

`docs/roadmaps/frontend/ux-accessibility-quick-wins.md`

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
   * Verify that ARIA attributes, focus behavior, and keyboard interactions integrate correctly with the existing component and layout architecture.
   * For CSS changes, confirm that token references use `var(--token-name)` from `src/styles/tokens/index.css` and that no hardcoded color, spacing, radius, or shadow values were introduced.

   **Compilation Check (when applicable)**

   * Ensure the code compiles successfully **only if the change affects executable code**.

5. **Testing Requirements**

   Determine whether tests are necessary based on the type of change.

   **Tests SHOULD be added or updated when the Quick Win:**

   * Adds or modifies ARIA attributes that affect screen reader behavior (`role`, `aria-label`, `aria-describedby`, `aria-live`, `aria-current`, `aria-busy`, `aria-invalid`)
   * Changes focus management behavior (focus trap, focus restoration on modal close, skip link)
   * Modifies keyboard interaction logic (Tab order, Escape handling, Arrow key navigation)
   * Changes component rendered output in a way that affects accessibility tree structure
   * Fixes a bug that could regress in the future (e.g., duplicate IDs, missing live region)
   * Alters touch target sizing via component logic (not pure CSS)

   In these cases:

   * Add **minimal, targeted tests** aligned with the project's current testing strategy (Vitest + React Testing Library).
   * Ensure the tests validate the intended accessibility behavior change — prefer `getByRole`, `getByLabelText`, and `toHaveAttribute` assertions over snapshot tests.

   **Tests are NOT required when the Quick Win is a small, low-risk change**, such as:

   * Replacing hardcoded color values with `var(--token-name)` in CSS Modules with no behavioral change
   * Adding or correcting `min-height` / `min-width` touch target values in CSS with no logic change
   * Replacing emoji with `Icon` component instances where the accessible name is unchanged
   * Adding `inputMode` or `type` attributes to existing `<input>` elements with no validation logic change
   * Adding `autoComplete` attributes to existing form fields
   * Removing unused production dependencies from `package.json`
   * Adding a role indicator label to the sidebar footer (pure render addition)
   * Updating `aria-label` text from English to Portuguese with no structural change
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
* Maintain the **existing component architecture, CSS token system, and coding standards** unless the Quick Win explicitly requires a change.

**Design token discipline:**
* All style values must use `var(--token-name)` from `src/styles/tokens/index.css` — do not introduce hardcoded color, spacing, radius, or shadow values.
* If a required token does not exist (e.g., a new strength color for `PasswordInput`), add it to `src/styles/tokens/index.css` before referencing it in a component.

**CSS Module scoping:**
* Do not move component styles into `src/styles/global.css` unless the Quick Win explicitly requires a global utility class.
* Do not add component-specific rules to `global.css`.

**ARIA correctness:**
* When adding or modifying ARIA attributes, follow the ARIA authoring practices: use `useId()` for ID-based associations (`aria-labelledby`, `aria-describedby`), not static strings.
* Do not set `aria-hidden="true"` on elements that contain focusable children.
* Do not add `role="presentation"` or `role="none"` to elements that carry semantic meaning.
* When adding `aria-live` regions, choose `polite` for non-urgent updates and `assertive` (or `role="alert"`) only for errors and critical status changes.

**Focus management:**
* When implementing focus restoration on modal close, store the trigger element reference before the modal opens — do not attempt to infer it from the DOM after close.
* Do not remove existing focus trap logic from `Modal` when adding focus restoration.

**Touch targets:**
* Touch target fixes must use `var(--touch-target-min)` (44px) from `src/styles/tokens/index.css`, not hardcoded pixel values.
* Apply touch target sizing via `min-height` and `min-width` — do not change the visual padding of surrounding elements unless required.

**Icon replacement:**
* When replacing emoji with `Icon` component instances, use the existing `Icon` component from `src/components/UI/Icon/Icon.tsx`.
* Set `aria-hidden="true"` on decorative icons and provide a visible text label alongside them.
* Do not introduce new icon names that are not already defined in `Icon.tsx`.

**Dependency removal:**
* When removing unused production dependencies, update both `package.json` and any related configuration (e.g., `vite.config.ts` `manualChunks`) in the same Quick Win.
* Do not remove a dependency without first confirming it has zero imports across the entire `src/` tree.

**Validation messages:**
* When correcting validation messages to Portuguese, update the message strings only — do not change validation logic, field names, or schema structure.
* Ensure corrected messages are consistent in tone and register with existing Portuguese strings in `src/i18n/locales/`.

* Avoid introducing new dependencies unless strictly necessary and explicitly justified by the Quick Win description.

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
* Explanation of what accessibility behavior they validate

### Assumptions

* Any assumptions made during implementation

### Risks or Edge Cases

* Potential issues or areas requiring future attention
* Any ARIA or focus behavior edge cases introduced by the change

### Documentation Update

* Confirmation that the Quick Wins document has been updated
* Confirmation that the Quick Win and all its sub-tasks were marked **Completed**

---

Then **pause and wait for approval before continuing to the next Quick Win** (unless the change qualifies as a Small Quick Win as defined above).
