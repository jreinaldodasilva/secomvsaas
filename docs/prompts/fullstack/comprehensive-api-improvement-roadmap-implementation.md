Understood — this is **not analysis or refactoring**, but **controlled execution of the roadmap itself**.

Below is a properly structured implementation prompt designed specifically for:

`docs/architecture/fullstack/api-improvement-roadmap.md`

It enforces:

* Phase-based execution
* Cross-layer coordination
* Regression prevention
* Documentation synchronization
* Controlled progression
* Explicit validation gates

---

# 🚀 Secom Comprehensive API Improvement Roadmap

## Controlled Implementation Protocol

## 🎯 Objective

Execute the implementation of:

```
docs/architecture/fullstack/api-improvement-roadmap.md
```

strictly following:

* The defined phases
* The defined weekly breakdown
* The defined priorities (P0 → P3)
* The documented sequencing and dependencies

This is a **structured execution process**, not a free-form refactor.

---

# 🔒 GLOBAL EXECUTION RULES

You must:

1. Follow roadmap order exactly (Phase → Week → Priority).
2. Implement only tasks scheduled for the current phase.
3. Respect cross-layer dependencies (backend before frontend when required).
4. Avoid scope expansion.
5. Prevent regressions at every step.
6. Keep documentation synchronized with implementation.
7. Stop after each phase for validation approval.

You must NOT:

* Skip priorities.
* Implement future-phase tasks early.
* Introduce architectural redesign unless explicitly defined.
* Perform unrelated refactors.
* Modify infrastructure beyond roadmap scope.

---

# 🧭 EXECUTION STRUCTURE

## Step 1 — Phase Selection

Begin with:

### Phase 1: Critical Fixes (Week 1–2)

Do NOT inspect or implement Phase 2+ tasks yet.

---

# 🛠 PHASE EXECUTION PROTOCOL

For each task within the current phase:

### 1️⃣ Pre-Implementation Review

Before writing code:

* Confirm task scope.
* Identify impacted layers:

  * Backend
  * Frontend
  * Shared types
  * Database
* Identify dependencies.
* Identify potential regressions.

---

### 2️⃣ Controlled Implementation

Implement:

* Only what the task requires.
* Using existing architecture patterns.
* Following coding standards.
* Preserving backward compatibility unless specified.

If a task affects multiple layers:

1. Update backend logic.
2. Update shared types.
3. Update frontend consumption.
4. Update tests (if applicable).
5. Update documentation.

Maintain strict layer alignment.

---

### 3️⃣ Validation Checklist (MANDATORY)

After each task:

* [ ] Compiles successfully
* [ ] No type errors
* [ ] No broken imports
* [ ] No DTO drift introduced
* [ ] API contracts preserved or updated intentionally
* [ ] Frontend renders correctly (if applicable)
* [ ] No duplicated logic introduced
* [ ] No new warnings or runtime errors

Fix issues immediately before proceeding.

---

# 📘 DOCUMENT SYNCHRONIZATION

After completing a task:

* Update the roadmap document:

  * Mark task as completed
  * Add short implementation note
  * Adjust status tracking if needed
* Update any affected documentation in:

  * `docs/architecture/backend/`
  * `docs/architecture/frontend/`
  * Shared types documentation

The roadmap must always reflect actual system state.

---

# 📦 PHASE COMPLETION REPORT

After completing an entire phase (e.g., Phase 1):

Provide a structured report:

---

## ✅ Phase X — Implementation Report

### Summary of Work

What was implemented and why.

### Tasks Completed

List tasks exactly as defined in the roadmap.

### Files Modified

Organized by:

* Backend
* Frontend
* Shared
* Docs

### Cross-Layer Changes

Explain integration impact.

### Regressions Prevented

What risks were evaluated and mitigated.

### Risks / Edge Cases

Any residual concerns.

### Verification Confirmation

Confirm:

* [ ] All tasks completed
* [ ] No regressions
* [ ] Documentation updated
* [ ] Phase marked complete

---

Then explicitly state:

> “Phase X implementation complete. Awaiting approval to proceed to Phase Y.”

Stop execution.

---

# 🧪 REGRESSION CONTROL

Before moving to next phase:

Re-evaluate:

* API response structure
* Type consistency
* Shared type alignment
* UI rendering integrity
* Database consistency
* Test stability (if applicable)

No phase transition without stability confirmation.

---

# 🏁 COMPLETION CRITERIA

The roadmap implementation is complete only if:

* All phases executed sequentially.
* All tasks marked complete in documentation.
* No architectural drift introduced.
* Backend, shared types, and frontend remain synchronized.
* No high or critical issues remain open.

