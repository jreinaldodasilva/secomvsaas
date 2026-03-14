Here is the **priority-driven execution prompt** for:

```
docs/fullstack/Secom-Integration-Remediation-Roadmap-Phase2.md
```

This mirrors the structure and strictness of the previous prompts and enforces **P1 → P4 priority order**, single-issue execution, and contract-first discipline.

---

# 🚀 Implementation Prompt — Integration Remediation Phase 2 (Priority-Driven)

Carefully review and implement the fixes described in:

`docs/fullstack/Secom-Integration-Remediation-Roadmap-Phase2.md`

---

# 🎯 Objective

Implement all issues strictly according to the **Priority Matrix (P1 → P4)** defined in the document.

Execution must follow **priority order**, not remediation phase grouping.

---

# 🧭 Mandatory Priority Order

You must execute issues in this exact sequence:

1. **P1 — Breaking Flows / Type Lies**
2. **P2 — Type Alignment & Validation Drift**
3. **P3 — Contract & Code Consistency**
4. **P4 — UX / Convention Polish**

Within each priority level:

* Follow the order defined in the Priority Matrix.
* Fully complete one issue before moving to the next.
* Do not batch multiple issues.
* Do not skip unresolved items.

---

# 🔴 P1 Rules (Blocking / Type Integrity)

P1 issues must be treated as:

* Broken self-registration flows
* Incorrect return types
* Type safety masking (`as any`)
* Runtime/compile mismatch between frontend and backend

Before marking any P1 issue complete, confirm:

* Request payload matches backend validation exactly
* Response type reflects real backend shape
* No `as any` casts remain
* Shared types represent canonical contract
* No regression in affected features
* TypeScript builds with zero errors
* No runtime shape assumptions remain

P2 work **must not begin** until all P1 issues are fully complete.

---

# 🧱 Execution Discipline

For each issue:

1. Identify affected layer(s):

   * Frontend (services, hooks, schemas, components)
   * Backend (routes, middleware)
   * Shared package (`@secom/types`)
2. Inspect:

   * DTO types
   * Shared types
   * Zod schemas
   * Backend validation rules
   * Middleware behavior
   * Response envelopes
3. Implement only what is required for the issue.
4. Do not refactor unrelated code.
5. Do not introduce architectural changes.
6. Do not introduce duplicate types.
7. Maintain monorepo consistency.
8. Perform direct code edits only.

---

# 🔍 Mandatory Validation Checklist (Per Issue)

Before marking an issue complete:

* ✅ Shared types reflect backend truth
* ✅ No local duplicate types remain
* ✅ No `any` or unsafe casts
* ✅ No mismatch between validation rules
* ✅ No duplicated service implementations
* ✅ No unused imports
* ✅ No TypeScript errors
* ✅ No regression in related flows
* ✅ API contract preserved
* ✅ If backend changed, authentication & scoping preserved

---

# 📘 Roadmap Update Requirement

After completing each issue:

1. Update the roadmap file.
2. Mark the issue as **Completed**.
3. If implementation deviates from suggested fix:

   * Document reasoning.
   * Document final approach taken.

---

# 📦 Required Output Format (Per Issue)

After completing one issue, provide:

## 1. Issue Description (exact text)

## 2. Priority Level (P1 / P2 / P3 / P4)

## 3. Layer(s) Modified (Frontend / Backend / Shared)

## 4. Files Modified

## 5. Code Changes (Before → After)

## 6. Contract & Type Verification

* Request shape verified
* Response shape verified
* Shared types aligned
* Validation rules aligned

## 7. Regression Risk Analysis

## 8. Type Safety Confirmation

## 9. Roadmap Updated Confirmation

---

# ⚠️ Special Enforcement Rules for Phase 2

Because Phase 2 focuses heavily on **type truthfulness and contract correctness**, the following rules are mandatory:

* Never keep misleading types for convenience.
* Never leave `as any` casts in place.
* Never allow frontend validation to be weaker than backend validation.
* Never allow shared types to drift from backend documents.
* Never keep duplicate interfaces when shared types exist.
* Never silently change a response shape without updating shared types.

---

# ⛔ Stop Condition

After completing **one issue**:

* STOP.
* Do not proceed automatically.
* Explicitly request approval before continuing.

---

# 🏁 Completion Criteria

The roadmap is fully implemented only when:

* All P1 issues resolved
* All P2 issues resolved
* All P3 issues resolved
* All P4 issues resolved
* No duplicate types remain
* No `any` casts masking mismatches
* Shared package reflects backend truth
* Frontend validation equals or exceeds backend validation
* All hooks return correctly typed shapes
* No silent middleware redundancy remains

