Here is the fully structured, enterprise-grade version of your prompt for the **Frontend State Management** domain:

---

# Improved Prompt

Carefully review the following frontend roadmap documents:

* `docs/roadmaps/frontend/state-management-improvement.md`
* `docs/roadmaps/frontend/state-management-quick-wins.md`

Your objectives are to:

1. Update the following documentation files so they accurately reflect all **implemented state management fixes, refactors, and architectural improvements**:

   * `docs/architecture/frontend/state-management-part-1.md`
   * `docs/architecture/frontend/state-management-part-2.md`
   * `docs/architecture/frontend/state-management-part-3.md`

2. Create a new roadmap document defining the **remaining unimplemented state management issues**, including a structured and prioritized execution plan.

---

# Phase 1 – Update State Management Documentation

---

## Step 1 – Analyze the Roadmaps

Identify which improvements and Quick Wins have been:

* ✅ Completed
* 🟡 Partially implemented
* ❌ Not implemented

Extract changes affecting:

* Global vs local state boundaries
* State ownership and responsibility
* Context usage
* Store architecture (Redux, Zustand, Context API, etc., if applicable)
* Server state vs client state separation
* Data fetching and caching strategy
* Mutation handling patterns
* Optimistic updates
* Error state handling
* Loading state standardization
* Derived state management
* Memoization and performance optimizations
* State normalization
* Avoidance of prop drilling
* Avoidance of duplicated state
* Side-effect management
* Async flow orchestration
* Persistence strategy (if applicable)
* State reset patterns
* Testing strategy for state logic
* Coupling between state and UI

---

# Step 2 – Update Each Documentation File

---

## 1️⃣ `state-management-part-1.md`

* Update foundational state architecture principles.
* Reflect implemented structural changes.
* Align global vs local state boundaries with current implementation.
* Remove outdated state ownership descriptions.

---

## 2️⃣ `state-management-part-2.md`

* Update documentation of advanced patterns (server state, caching, derived state).
* Reflect changes to async handling and mutation flows.
* Align with implemented error and loading state patterns.
* Remove deprecated state patterns.

---

## 3️⃣ `state-management-part-3.md`

* Reflect cross-cutting state logic changes.
* Update performance optimizations.
* Align persistence or rehydration patterns (if applicable).
* Document integration with routing, forms, and component library.
* Ensure consistency with current architectural boundaries.

---

# Documentation Requirements

* Reflect only implemented improvements.
* Do not duplicate roadmap text.
* Remove outdated or conflicting state architecture descriptions.
* Preserve structure unless restructuring improves clarity.
* Ensure consistent terminology across all three files.
* Ensure alignment with:

  * Frontend Architecture documentation
  * API integration layer
  * Component Library documentation
  * Forms & Validation documentation
  * Performance documentation

Each document must describe the **current operational state management architecture**, not planned changes.

---

# Phase 2 – Create State Management Remaining Roadmap

Create a new roadmap file, for example:

`docs/roadmaps/frontend/state-management-remaining.md`

Obs: Consider splitting the document into multiple files due to its size. For example, create files such as 'docs/roadmaps/frontend/state-management-remaining-part-1.md', 'docs/roadmaps/frontend/state-management-remaining-part-2.md', and so on.

---

## The new roadmap must include:

### 1. Remaining Issues Grouped by Domain

Organize partially implemented and unimplemented issues into:

* Global vs Local State Boundaries
* Server State & Caching Strategy
* Async & Mutation Flow Improvements
* State Normalization
* Derived State Optimization
* Performance Optimization
* Error & Loading Standardization
* Side-Effect Isolation
* State Persistence Improvements
* Testability Enhancements
* Decoupling UI from State Logic
* Removal of Legacy Patterns

---

### 2. Prioritization

Each item must be categorized:

* 🔥 Critical (state inconsistency, race conditions, major performance risks)
* ⚠️ High Priority
* 📌 Medium Priority
* 🧩 Nice to Have

---

### 3. Required Implementation Strategy Per Item

For every remaining issue include:

* Problem Description
* Current State
* Target State
* UX or Consistency Risk
* Proposed Architectural Solution
* Breaking Change Risk (Yes/No)
* Migration Strategy (if required)
* Estimated Complexity (Low / Medium / High)
* Performance Impact (if relevant)
* Dependencies

---

### 4. Phased Execution Plan

Organize into:

* Quick Wins
* State Boundary Refactor Phase
* Async & Server-State Optimization Phase
* Performance Stabilization Phase
* Long-Term State Architecture Evolution

---

# Constraints

* Do not modify existing roadmap files.
* Do not use scripts or shell commands.
* Do not invent undocumented state management features.
* Base updates strictly on implemented roadmap items.
* Ensure cross-document consistency.
* Explicitly flag inconsistencies between documentation and implementation.

---

# Expected Output

After completing both phases, provide:

1. Summary of updates made to each of the three state management documentation files
2. Sections added, modified, or removed (per file)
3. List of roadmap items reflected as completed
4. Structured summary of the new Remaining Roadmap
5. Identified state architecture risks
6. Identified performance or consistency gaps
7. Maintainability and scalability risk assessment summary

