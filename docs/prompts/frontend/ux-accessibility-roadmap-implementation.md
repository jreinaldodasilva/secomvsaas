Carefully review and implement the improvements described in:

`docs/roadmaps/frontend/ux-accessibility-improvement.md`

The document defines a **prioritized UX, accessibility, and visual design improvement roadmap**, organized by **issue severity and implementation phases**.

Your task is to execute the roadmap **incrementally and safely**, following the rules below.

---

# Execution Rules

## 1. Work Order

Implementation must follow the **priority order defined in the roadmap**:

1. **P0 — Critical** (WCAG 2.1 AA violations, compliance risk, or severe UX failure)
2. **P1 — High** (strong UX degradation, visual credibility issue, or significant usability barrier)
3. **P2 — Medium** (UX friction, consistency gap, or visual modernity issue)
4. **P3 — Low** (polish, optimization, or enhancement opportunity)

Within each priority level:

- **Skip any issue already marked ✅ (completed).**
- Start with the **first open issue listed.**
- Fully complete that issue before proceeding to the next one.
- **Respect declared dependencies** — do not implement an issue before its prerequisite is resolved.

---

## 2. Issue Execution Process

For each open issue:

1. Carefully review:
   - The **issue description** and **UX / accessibility impact**
   - The **users affected** (citizen-facing vs. staff-facing — citizen-facing issues carry higher compliance weight)
   - The **WCAG success criterion** cited, if any
   - The **dependencies listed in the roadmap**

2. Identify the relevant components, CSS Modules, ARIA attributes, and token usages in the codebase.

3. Implement the required change using **direct code edits only**.

4. Ensure the implementation:
   - Aligns with the **existing architecture, component conventions, and CSS token system**
   - Preserves design token consumption: all style values must use `var(--token-name)` from `src/styles/tokens/index.css`
   - Maintains CSS Module scoping — do not move component styles into `src/styles/global.css` unless explicitly required
   - Maintains **RBAC guards** at both route (`ProtectedRoute`) and UI (`PermissionGate`) levels — do not alter access control while refactoring components
   - Does not introduce regressions in unrelated areas

---

## 3. Validation Steps

After implementing an issue, perform the following validations.

### Logical Verification

Confirm that:

- The change resolves the issue described in the roadmap.
- The behavior of the system remains correct.
- No unintended side effects were introduced.
- For WCAG issues: the specific success criterion cited is now satisfied.
- For ARIA changes: no duplicate IDs, no conflicting live regions, no broken `aria-labelledby` / `aria-describedby` associations were introduced.
- For focus management changes: focus moves correctly on open and is restored correctly on close.
- For touch target changes: the affected element meets `var(--touch-target-min)` (44px) at 375px viewport width without breaking the surrounding layout.

---

### Compilation Verification

Only perform compilation checks if the change affects **runtime code**.

Required for:
- Component prop interface changes
- Hook modifications
- New token additions to `src/styles/tokens/index.css` referenced in TypeScript
- Dependency changes affecting imports
- `vite.config.ts` changes (e.g., removing a `manualChunks` entry)

Not required for:
- CSS-only changes (token replacements, touch target sizing, contrast fixes)
- Pure ARIA attribute additions with no logic change
- `aria-label` text corrections
- Documentation updates
- `package.json` dependency removal where the import was already absent

---

## 4. Testing Requirements

Tests should be **added or updated only when appropriate**.

### Tests SHOULD be created when the issue:

- Adds or modifies ARIA attributes that affect the accessibility tree (`role`, `aria-label`, `aria-describedby`, `aria-live`, `aria-current`, `aria-busy`, `aria-invalid`, `aria-expanded`)
- Changes focus management behavior (focus trap entry/exit, focus restoration on modal close, skip link activation)
- Modifies keyboard interaction logic (Tab order, Escape handling, Arrow key navigation, Enter/Space activation)
- Changes component rendered output in a way that affects the accessibility tree structure
- Fixes a bug that could regress (e.g., duplicate modal IDs, missing live region, broken `aria-describedby` association)
- Alters touch target sizing via component logic (not pure CSS)
- Changes validation message output visible to users

In these cases:
- Add **minimal, targeted tests** aligned with the project's existing testing strategy (Vitest + React Testing Library)
- Prefer `getByRole`, `getByLabelText`, `toHaveAttribute`, and `toBeVisible` assertions over snapshot tests
- Ensure tests validate the **specific accessibility behavior** the issue addresses

### Tests are NOT required when the issue is a small, low-risk change:

- CSS-only fixes (contrast, touch targets, spacing, token replacements)
- Single ARIA attribute additions where the attribute value is static and the element structure is unchanged
- Replacing emoji with `Icon` component instances where the accessible name is unchanged
- Adding `inputMode`, `type`, or `autoComplete` attributes to existing `<input>` elements with no validation logic change
- Removing unused production dependencies from `package.json`
- Adding a role indicator label to the sidebar footer (pure render addition, no logic)
- Correcting `aria-label` text from English to Portuguese with no structural change
- Replacing hardcoded color values with `var(--token-name)` in CSS Modules
- Documentation updates

These are considered **Low-Risk Structural Changes**.

For such changes:
- Test suite execution is **not required**
- Compilation verification may also be skipped if no runtime code changed

---

## 5. UX & Accessibility Safety Rules

During implementation:

**ARIA correctness:**
- Do not introduce new duplicate `id` values — use `useId()` for all ID-based ARIA associations (`aria-labelledby`, `aria-describedby`)
- Do not set `aria-hidden="true"` on elements that contain focusable children
- Do not add `role="presentation"` or `role="none"` to elements that carry semantic meaning
- When adding `aria-live` regions, use `polite` for non-urgent updates and `assertive` (or `role="alert"`) only for errors and critical status changes — do not apply both to the same element tree

**Focus management:**
- When implementing focus restoration on modal close, store the trigger element reference before the modal opens — do not attempt to infer it from the DOM after close
- Do not remove existing focus trap logic from `Modal` when adding focus restoration
- Ensure focus is never left on a non-focusable element after a modal or drawer closes

**Touch targets:**
- All touch target fixes must use `var(--touch-target-min)` from `src/styles/tokens/index.css`, not hardcoded pixel values
- Apply touch target sizing via `min-height` and `min-width` — verify the fix does not break the surrounding layout at 375px and 768px viewport widths

**Token discipline:**
- Do not introduce hardcoded color, spacing, radius, or shadow values
- If a required token does not exist, add it to `src/styles/tokens/index.css` before referencing it in a component or CSS Module

**Icon replacement:**
- When replacing emoji with `Icon` component instances, use the existing `Icon` component from `src/components/UI/Icon/Icon.tsx`
- Set `aria-hidden="true"` on decorative icons and ensure a visible text label is present alongside them
- Do not introduce new icon names that are not already defined in `Icon.tsx`

**Validation messages:**
- When correcting validation messages to Portuguese, update message strings only — do not change validation logic, field names, or schema structure
- Ensure corrected messages are consistent in tone and register with existing Portuguese strings in `src/i18n/locales/`

**RBAC preservation:**
- Preserve `ProtectedRoute` and `PermissionGate` enforcement — do not alter access control while refactoring components
- Do not introduce new role checks inside UI primitives — role awareness belongs at the layout and routing boundary

**General:**
- Do not introduce new WCAG violations while fixing existing ones — verify contrast ratios, focus order, and landmark structure after each change
- Respect `prefers-reduced-motion` — any new animation or transition introduced must be guarded by the global `@media (prefers-reduced-motion: reduce)` rule or a component-level equivalent
- Avoid unnecessary refactors unrelated to the current issue

---

## 6. Dependency and Build Changes

If an issue involves dependency removal, upgrades, or build configuration changes:

- Confirm the dependency has zero imports across the entire `src/` tree before removing it
- Remove the corresponding `manualChunks` entry from `vite.config.ts` when removing a bundled dependency
- Ensure unused imports are removed from all files
- Ensure the project compiles after the change
- Ensure runtime behavior remains correct

---

## 7. Documentation Updates

After completing an issue:

- Update `docs/roadmaps/frontend/ux-accessibility-improvement.md`
- Mark the issue as **✅ Completed** (strike through the row in the backlog table and the corresponding phase task row)
- Update the **baseline metrics table** in the Success Metrics section if the issue resolves a tracked metric (e.g., P0 issues open, WCAG compliance estimate, hardcoded value count, touch target failures)
- Add brief implementation notes to the issue row if any assumption or deviation from the roadmap description was made

---

## 8. Execution Control

After completing each issue:

1. Stop execution.
2. Provide a structured report (see Output Expectations below).
3. **Wait for approval before proceeding to the next issue.**

Do **not** continue automatically to the next roadmap item.

---

# Technical Constraints

- **Do NOT use scripts, automation tools, or the command shell to modify code.**
- All changes must be implemented via **direct code edits only**.
- Maintain **existing coding conventions, component architecture, and CSS token system**.
- Do not introduce new dependencies unless explicitly required by the roadmap issue and justified in the implementation report.
- Avoid large refactors unless the roadmap explicitly requires them.

---

# Output Expectations

After completing each issue, provide a structured report containing:

## Implementation Summary

Clear description of what was implemented and which roadmap issue it resolves (include the issue ID and title).

---

## Files Modified

List of all modified files with a one-line description of what changed in each.

---

## Key Code Changes

Explanation of the most important changes. For ARIA and focus management changes, include before/after for the critical attributes or logic. For CSS changes, confirm token references used.

---

## Tests

If applicable:
- Tests added or modified
- What specific accessibility behavior they validate
- Which assertions were used (`getByRole`, `toHaveAttribute`, etc.)

---

## Assumptions

Any assumptions made during implementation, including any deviation from the roadmap description.

---

## Risks or Edge Cases

Potential issues introduced by the change or areas requiring future attention. Include any ARIA, focus, or contrast edge cases relevant to the change.

---

## Documentation Update

Confirm that:
- The roadmap document was updated
- The issue was marked **✅ Completed** in both the backlog table and the phase task table
- Any affected baseline metrics in the Success Metrics section were updated

---

Then **pause execution and wait for approval before proceeding to the next issue**.
