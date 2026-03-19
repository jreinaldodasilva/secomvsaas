Here is the fully structured, enterprise-grade version of your prompt for the **Frontend Component Library** domain:

---

# Improved Prompt

Carefully review the following frontend roadmap documents:

* `docs/frontendroadmaps/02-Secom-Component-Library-Improvement-Roadmap.md`
* `docs/frontendroadmaps/02-Secom-Component-Library-Quick-Wins.md`

Your objectives are to:

1. Update the following documentation files so they accurately reflect all **implemented component library fixes, standardization improvements, and refactors**:

   * `docs/frontend/02-Secom-Component-Library-Part1.md`
   * `docs/frontend/02-Secom-Component-Library-Part2.md`
   * `docs/frontend/02-Secom-Component-Library-Part3.md`

2. Create a new roadmap document defining the **remaining unimplemented component library issues**, including a structured and prioritized execution plan.

---

# Phase 1 – Update Component Library Documentation

---

## Step 1 – Analyze the Roadmaps

Identify which improvements and Quick Wins have been:

* ✅ Completed
* 🟡 Partially implemented
* ❌ Not implemented

Extract changes affecting:

* Component structure and organization
* Atomic design adherence (if applicable)
* Reusability patterns
* Prop consistency and typing
* Controlled vs uncontrolled patterns
* Styling standardization
* Theming and design tokens
* Accessibility compliance (ARIA, keyboard support)
* Responsiveness
* Variant systems
* Composition patterns
* Form component standardization
* Error and loading state handling
* Documentation and usage examples
* Removal of duplicated components
* Breaking API changes
* Refactoring of legacy UI components
* Storybook or visual documentation alignment (if applicable)

---

# Step 2 – Update Each Component Library Document

---

## 1️⃣ `02-Secom-Component-Library-Part1.md`

* Update foundational components documentation.
* Reflect refactored APIs and prop changes.
* Remove deprecated component patterns.
* Align examples with current implementation.
* Update design principles if structural changes were implemented.

---

## 2️⃣ `02-Secom-Component-Library-Part2.md`

* Update compound or feature-level components.
* Reflect improvements in composition and reuse.
* Align variant and styling strategies with implementation.
* Remove outdated usage patterns.

---

## 3️⃣ `02-Secom-Component-Library-Part3.md`

* Update advanced or cross-cutting components.
* Reflect accessibility improvements.
* Align performance optimizations (memoization, lazy rendering).
* Ensure integration with routing, forms, and state management is accurate.

---

# Documentation Requirements

* Reflect only implemented improvements.
* Do not copy roadmap content verbatim.
* Remove outdated or conflicting component descriptions.
* Preserve structure unless restructuring improves clarity.
* Ensure consistent terminology across all three files.
* Ensure alignment with:

  * Frontend Architecture documentation
  * UX & Accessibility documentation
  * Forms & Validation documentation (if applicable)
  * Performance documentation

Each document must reflect the **current operational component library**, not planned changes.

---

# Phase 2 – Create Component Library Remaining Roadmap

Create a new roadmap file, for example:

`docs/frontendroadmaps/02-Secom-Component-Library-Remaining-Roadmap.md`

Obs: Consider splitting the document into multiple files due to its size. For example, create files such as 'docs/frontendroadmaps/02-Secom-Component-Library-Remaining-Roadmap-Part1.md', 'docs/frontendroadmaps/02-Secom-Component-Library-Remaining-Roadmap-Part2.md', and so on.

---

## The new roadmap must include:

### 1. Remaining Issues Grouped by Domain

Organize partially implemented and unimplemented issues into:

* Structural Standardization
* API Consistency
* Prop Typing & Type Safety
* Styling & Theming Improvements
* Accessibility Compliance Gaps
* Reusability & Composition Enhancements
* Performance Optimization
* Variant System Improvements
* Form Component Standardization
* Removal of Legacy Patterns
* Documentation & Usage Clarity
* Testing & Visual Regression Coverage

---

### 2. Prioritization

Each item must be categorized:

* 🔥 Critical (accessibility violations, breaking inconsistencies)
* ⚠️ High Priority
* 📌 Medium Priority
* 🧩 Nice to Have

---

### 3. Required Implementation Strategy Per Item

For every remaining issue include:

* Problem Description
* Current State
* Target State
* UX or Maintainability Risk
* Proposed Structural or API Solution
* Breaking Change Risk (Yes/No)
* Migration Strategy (if required)
* Estimated Complexity (Low / Medium / High)
* Accessibility Impact (if relevant)
* Performance Impact (if relevant)
* Dependencies

---

### 4. Phased Execution Plan

Organize into:

* Quick Wins
* API Standardization Phase
* Accessibility & UX Compliance Phase
* Structural Refactor Phase
* Long-Term Design System Evolution

---

# Constraints

* Do not modify existing roadmap files.
* Do not use scripts or shell commands.
* Do not invent undocumented component features.
* Base updates strictly on implemented roadmap items.
* Ensure cross-document consistency.
* Explicitly flag inconsistencies between documentation and implementation.

---

# Expected Output

After completing both phases, provide:

1. Summary of updates made to each of the three component library documentation files
2. Sections added, modified, or removed (per file)
3. List of roadmap items reflected as completed
4. Structured summary of the new Remaining Roadmap
5. Identified component architecture gaps
6. Identified accessibility or UX risks
7. Maintainability and scalability risk assessment summary
