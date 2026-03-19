Here is the fully structured, enterprise-grade version of your prompt for the **Frontend Navigation & User Flows** domain:

---

# Improved Prompt

Carefully review the following frontend roadmap documents:

* `docs/roadmaps/frontend/navigation-userflows-improvement.md`
* `docs/roadmaps/frontend/navigation-userflows-quick-wins.md`

Your objectives are to:

1. Update the following documentation files so they accurately reflect all **implemented navigation, routing, and user flow improvements**:

   * `docs/architecture/frontend/navigation-userflows-part-1.md`
   * `docs/architecture/frontend/navigation-userflows-part-2.md`
   * `docs/architecture/frontend/navigation-userflows-part-3.md`

2. Create a new roadmap document defining the **remaining unimplemented navigation and user flow issues**, including a structured and prioritized execution plan.

---

# Phase 1 – Update Navigation & User Flows Documentation

---

## Step 1 – Analyze the Roadmaps

Identify which improvements and Quick Wins have been:

* ✅ Completed
* 🟡 Partially implemented
* ❌ Not implemented

Extract changes affecting:

* Route structure and hierarchy
* URL design and naming conventions
* Nested routing organization
* Layout structure and shared layouts
* Access control per route
* Guarded or protected routes
* Redirect logic
* Breadcrumb strategy
* Deep linking support
* Navigation state handling
* Multi-step flows
* Wizard flows
* Error page handling
* Fallback routes
* 404 and 403 handling
* Post-authentication redirects
* User journey simplification
* Mobile navigation behavior
* Accessibility in navigation (keyboard, ARIA)
* Performance optimizations (lazy routes, code splitting)
* Scroll restoration
* Navigation consistency across modules
* Cross-feature flow coherence

---

# Step 2 – Update Each Documentation File

---

## 1️⃣ `navigation-userflows-part-1.md`

* Update core routing structure.
* Reflect implemented route hierarchy changes.
* Align route naming conventions with current implementation.
* Remove deprecated routes or outdated flow explanations.
* Ensure documentation matches current layout composition.

---

## 2️⃣ `navigation-userflows-part-2.md`

* Update user journey descriptions.
* Reflect simplified or refactored flows.
* Align protected routes and guard logic with implementation.
* Update multi-step or wizard flow documentation.
* Remove outdated redirect patterns.

---

## 3️⃣ `navigation-userflows-part-3.md`

* Update advanced flow scenarios.
* Reflect cross-module navigation consistency improvements.
* Align deep linking behavior with actual behavior.
* Update error and fallback routing patterns.
* Document performance-related improvements (lazy loading, dynamic routes).

---

# Documentation Requirements

* Reflect only implemented improvements.
* Do not duplicate roadmap text.
* Remove outdated navigation diagrams or descriptions.
* Preserve structure unless restructuring improves clarity.
* Ensure consistent terminology across all three files.
* Ensure alignment with:

  * Frontend Architecture documentation
  * State Management documentation
  * Component Library documentation
  * Auth & RBAC documentation
  * UX & Accessibility documentation

Each file must describe the **current operational navigation architecture and user flow structure**, not planned changes.

---

# Phase 2 – Create Navigation & User Flows Remaining Roadmap

Create a new roadmap file, for example:

`docs/roadmaps/frontend/navigation-userflows-remaining.md`

Obs: Consider splitting the document into multiple files due to its size. For example, create files such as 'docs/roadmaps/frontend/navigation-userflows-remaining-part-1.md', 'docs/roadmaps/frontend/navigation-userflows-remaining-part-2.md', and so on.
---

## The new roadmap must include:

### 1. Remaining Issues Grouped by Domain

Organize partially implemented and unimplemented issues into:

* Route Structure Standardization
* URL Naming Consistency
* Protected Route & Access Control Improvements
* Flow Simplification
* Multi-Step Flow Optimization
* Redirect Logic Improvements
* Error & Fallback Handling
* Deep Linking Enhancements
* Mobile Navigation Improvements
* Accessibility Compliance
* Performance Optimization (lazy routes, code splitting)
* Cross-Feature Flow Consistency

---

### 2. Prioritization

Each item must be categorized:

* 🔥 Critical (broken flows, navigation dead ends, access control flaws)
* ⚠️ High Priority
* 📌 Medium Priority
* 🧩 Nice to Have

---

### 3. Required Implementation Strategy Per Item

For every remaining issue include:

* Problem Description
* Current State
* Target State
* UX Risk or Architectural Risk
* Proposed Structural or Routing Solution
* Breaking Change Risk (Yes/No)
* Migration Strategy (if required)
* Estimated Complexity (Low / Medium / High)
* Performance Impact (if relevant)
* Accessibility Impact (if relevant)
* Dependencies

---

### 4. Phased Execution Plan

Organize into:

* Quick Wins
* Route Structure Refactor Phase
* Flow Simplification Phase
* Access Control & Guard Stabilization
* Performance & UX Optimization Phase
* Long-Term Navigation Evolution

---

# Constraints

* Do not modify existing roadmap files.
* Do not use scripts or shell commands.
* Do not invent undocumented navigation features.
* Base updates strictly on implemented roadmap items.
* Ensure cross-document consistency.
* Explicitly flag inconsistencies between documentation and implementation.

---

# Expected Output

After completing both phases, provide:

1. Summary of updates made to each of the three navigation documentation files
2. Sections added, modified, or removed (per file)
3. List of roadmap items reflected as completed
4. Structured summary of the new Remaining Roadmap
5. Identified navigation or user flow risks
6. Identified architectural inconsistencies
7. UX and performance risk assessment summary

