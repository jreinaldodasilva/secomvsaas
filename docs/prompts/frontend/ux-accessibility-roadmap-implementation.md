Carefully review and implement the improvements described in:

`docs/roadmaps/frontend/ux-accessibility-improvement.md`

The document defines a **prioritized UX & accessibility improvement roadmap**, organized by **issue severity and implementation sprints**.

> **Current status:** 15 of 32 issues have been resolved in a prior Quick Wins pass. All completed issues are marked ✅ (struck through) in the roadmap. **Begin with the first open issue in priority order — do not re-implement completed items.**

---

# Execution Rules

## 1. Work Order

Implementation must follow the **priority order defined in the roadmap**:

1. **P0 — Critical** (WCAG violations, compliance risk, or severe UX failure)
2. **P1 — High Priority** (strong UX degradation, design system gaps)
3. **P2 — Medium Priority** (improvements and enhancements)
4. **P3 — Low Priority** (nice-to-have refinements)

Within each priority level:

- **Skip any issue already marked ✅ (completed).**
- Start with the **first open issue listed.**
- Fully complete that issue before proceeding to the next one.

### Open issues at the start of this session

| ID | Title | Priority | Effort |
|----|-------|----------|--------|
| P0-1 | Dashboard sidebar — no mobile breakpoint | P0 | 3 days |
| P0-2 | `SessionTimeoutModal` — no focus trap (WCAG 2.1.2, 2.4.3) | P0 | 0.5 days |
| P1-1 | Auth pages — local `.btnPrimary` instead of shared `Button` | P1 | 1 day |
| P1-2 | Framer Motion animations — not guarded by `useReducedMotion()` | P1 | 1 day |
| P1-5 | Tertiary text contrast failure on `--color-bg-secondary` (WCAG 1.4.3) | P1 | 1 day |
| P1-7 | `UsersPage` invite form — missing `htmlFor`, no error announcement (WCAG 1.3.1) | P1 | 0.5 days |
| P1-8 | Table action buttons — 32px touch target, below 44px minimum | P1 | 1 day |
| P1-9 | Dashboard banner breakpoint — wrong effective content width | P1 | 0.5 days |
| P2-1 | `EmptyState` — no icon or CTA in `DataTable` | P2 | 0.5 days |
| P2-3 | Citizen portal profile `.fieldRow` — no responsive breakpoint | P2 | 0.5 days |
| P2-5 | Auth submit buttons — no spinner, no `aria-busy` | P2 | 0.5 days |
| P2-8 | Dashboard stat icon colors — raw hex, not mapped to tokens | P2 | 1 day |
| P2-9 | Landing CTA buttons — `!important` overrides bypass token cascade | P2 | 0.5 days |
| P2-11 | Modal close button — 32px, below 44px touch target | P2 | 0.5 days |
| P2-12 | Toast close button — 24px, below 44px touch target | P2 | 0.5 days |
| P2-13 | `PasswordInput` toggle — 32px, below 44px touch target | P2 | 0.5 days |
| P2-14 | `TopLoadingBar` — fixed 350ms duration, not tied to actual load state | P2 | 1 day |
| P3-3 | LGPD section image — `display: none` on mobile instead of stacked layout | P3 | 1 day |
| P3-6 | Numeric domain form fields — missing `inputmode="numeric"` | P3 | 0.5 days |
| P3-7 | `DashboardMockup` image — may be fetched on mobile before CSS hides it | P3 | 0.5 days |

---

## 2. Issue Execution Process

For each open issue:

1. Carefully review:
   - The **issue description** and **UX / accessibility impact**
   - The **users affected**
   - The **dependencies listed in the roadmap** (respect them — do not implement an issue before its dependency is resolved)

2. Identify the relevant parts of the codebase.

3. Implement the required change using **direct code edits only**.

4. Ensure the implementation:
   - Aligns with the **existing architecture and coding conventions**
   - Preserves the established layering: HTTP client → services → domain hooks → pages
   - Maintains **RBAC guards** at both route and UI levels
   - Does not introduce regressions in unrelated areas.

---

## 3. Validation Steps

After implementing an issue, perform the following validations.

### Logical Verification

Confirm that:

- The change resolves the issue described in the roadmap.
- The behavior of the system remains correct.
- No unintended side effects were introduced.
- For WCAG issues: the specific success criterion cited is now satisfied.

---

### Compilation Verification

Only perform compilation checks if the change affects **runtime code**.

Required for:
- Component refactoring or extraction
- Hook modifications
- State management changes
- Routing changes
- Dependency changes affecting imports

Not required for:
- CSS-only changes
- Documentation updates
- i18n key additions with no component changes.

---

## 4. Testing Requirements

### Tests SHOULD be added or updated when the issue:

- Introduces new component behavior
- Changes existing business logic or validation
- Alters authentication or authorization behavior
- Changes state management logic
- Modifies component rendered output in a way that could regress
- Fixes a bug that could regress

In these cases:
- Add **minimal, targeted tests**
- Follow the project's **existing testing strategy** (Vitest + React Testing Library)
- Ensure tests verify the **new expected behavior**.

### Tests are NOT required when the issue is a small, low-risk change:

- CSS-only fixes (contrast, touch targets, layout)
- Single attribute additions (`aria-hidden`, `id`, `type`)
- Icon swaps
- Token alias replacements
- i18n key additions

---

## 5. UX & Accessibility Safety Rules

During implementation:

- **Do not introduce new WCAG violations** while fixing existing ones — verify contrast ratios, focus order, and landmark structure after each change.
- **Preserve RBAC enforcement** via `ProtectedRoute` and `PermissionGate` — do not alter access control while refactoring components.
- **Respect `prefers-reduced-motion`** — any new animation or transition introduced must be guarded.
- **Do not bypass the service or hook layer** with direct API calls in page components.
- **Touch target fixes must not break visual layout** — verify at 375px and 768px viewports.
- **Avoid unnecessary refactors** unrelated to the current issue.
- **Respect dependencies** — P1-9 depends on P0-1; P2-5 depends on P1-1. Do not implement a dependent issue before its prerequisite.

---

## 6. Dependency and Build Changes

If an issue involves dependency removal, upgrades, or build configuration changes:

- Ensure unused imports are removed.
- Ensure the project compiles after the change.
- Ensure runtime behavior remains correct.

---

## 7. Documentation Updates

After completing an issue:

- Update `docs/roadmaps/frontend/ux-accessibility-improvement.md`.
- Mark the issue as **✅ Completed** (strike through the row in the backlog table and the sprint task row).
- Update the relevant **Definition of Done** checklist in the sprint section.
- Update the **baseline metrics** in section 4.1 if the issue resolves a tracked metric.

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
- Maintain **existing coding conventions and project architecture**.
- Do not introduce new dependencies unless explicitly required by the roadmap issue.
- Avoid large refactors unless the roadmap explicitly requires them.

---

# Output Expectations

After completing each issue, provide a structured report containing:

## Implementation Summary

Clear description of what was implemented and which roadmap issue it resolves.

---

## Files Modified

List of all modified files.

---

## Key Code Changes

Explanation of the most important changes, including before/after for critical lines.

---

## Tests

If applicable:
- Tests added or modified.
- What behavior they validate.

---

## Assumptions

Any assumptions made during implementation.

---

## Risks or Edge Cases

Potential issues introduced by the change or areas requiring future attention.

---

## Documentation Update

Confirm that:
- The roadmap document was updated.
- The issue was marked **✅ Completed** in both the backlog table and the sprint task table.
- Any affected baseline metrics in section 4.1 were updated.

---

Then **pause execution and wait for approval before proceeding to the next issue**.
