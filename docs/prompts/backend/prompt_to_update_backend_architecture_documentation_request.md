
### Improved Prompt

Here is the enhanced version of your prompt, now including the requirement to generate a new roadmap for the remaining issues:

---

## Improved Prompt

Carefully review the following backend roadmap documents:

* `docs/backendroadmaps/01-Sintgesp-Backend-Architecture-Improvement-Roadmap.md`
* `docs/backendroadmaps/01-Sintgesp-Backend-Architecture-Quick-Wins.md`

Your objectives are to:

1. Update
   `docs/backend/01-Sintgesp-Backend-Architecture-Overview.md`
   so it accurately reflects all **implemented** fixes and architectural improvements.

2. Create a new roadmap document that clearly defines the **remaining unimplemented issues and improvements**, including a structured plan for addressing them.

---

## Phase 1 – Architecture Documentation Update

### Responsibilities

1. **Analyze the Roadmaps**

   * Identify which improvements and Quick Wins have been fully implemented.
   * Distinguish between:

     * ✅ Completed
     * 🟡 Partially implemented
     * ❌ Not implemented
   * Extract architectural changes that impact system structure, patterns, modules, infrastructure, conventions, or cross-cutting concerns.

2. **Update the Architecture Overview**

   * Reflect only implemented changes.
   * Remove or adjust outdated descriptions.
   * Align terminology with the current backend structure.
   * Improve clarity and technical accuracy where necessary.
   * Ensure the document becomes the **single source of truth** for the backend architecture.

3. **Maintain Documentation Integrity**

   * Preserve the original structure unless restructuring improves clarity.
   * Keep formatting consistent with other backend documentation.
   * Avoid duplicating roadmap content — reflect outcomes, not plans.
   * Do not introduce speculative or future-state architecture.

---

## Phase 2 – Create Remaining Issues Roadmap

Create a new roadmap document (e.g.,
`docs/backendroadmaps/01-Sintgesp-Backend-Architecture-Remaining-Roadmap.md`).

This document must:

### 1. Clearly List Remaining Items

* Include all partially implemented and unimplemented issues.
* Group them by architectural domain (e.g., structure, performance, security, observability, testing, infrastructure).

### 2. Prioritize Items

* Categorize as:

  * 🔥 Critical
  * ⚠️ High Priority
  * 📌 Medium Priority
  * 🧩 Nice to Have

### 3. Define Implementation Strategy

For each remaining item include:

* Problem description
* Current state
* Target state
* Proposed technical solution
* Dependencies
* Estimated complexity (Low / Medium / High)
* Risks

### 4. Organize into Phases

Structure the roadmap into:

* Quick Wins
* Structural Improvements
* Architectural Refactors
* Long-Term Enhancements

---

## Constraints

* Do not modify existing roadmap files.
* Do not use automation scripts or shell commands.
* Do not introduce features not already identified in the reviewed documents.
* Base all updates strictly on documented roadmap content and implemented changes.

---

## Expected Output

After completing both phases, provide:

1. A summary of updates made to the Architecture Overview
2. Sections added, modified, or removed
3. A list of roadmap items reflected as completed
4. A structured summary of the newly created roadmap
5. Any inconsistencies discovered between documentation and implementation
6. Architectural risks identified during the review


