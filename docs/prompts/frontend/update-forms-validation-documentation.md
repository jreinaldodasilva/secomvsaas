Here is the fully structured, enterprise-grade version of your prompt for the **Frontend Forms & Validation** domain:

---

# Improved Prompt

Carefully review the following frontend roadmap documents:

* `docs/roadmaps/frontend/forms-validation-improvement.md`
* `docs/roadmaps/frontend/forms-validation-quick-wins.md`

Your objectives are to:

1. Update the following documentation files so they accurately reflect all **implemented form architecture, validation, and UX improvements**:

   * `docs/architecture/frontend/forms-validation-part-1.md`
   * `docs/architecture/frontend/forms-validation-part-2.md`
   * `docs/architecture/frontend/forms-validation-part-3.md`

2. Create a new roadmap document defining the **remaining unimplemented form and validation issues**, including a structured and prioritized execution plan.

---

# Phase 1 – Update Forms & Validation Documentation

---

## Step 1 – Analyze the Roadmaps

Identify which improvements and Quick Wins have been:

* ✅ Completed
* 🟡 Partially implemented
* ❌ Not implemented

Extract changes affecting:

* Form architecture patterns
* Controlled vs uncontrolled input strategy
* Validation schema standardization (e.g., Zod, Yup, custom)
* Field-level vs form-level validation
* Async validation handling
* Error messaging standardization
* Reusable form components
* Form state management integration
* Submission flow patterns
* Optimistic vs pessimistic submission handling
* Loading and disabled states
* Form reset behavior
* Multi-step form handling
* Cross-field validation
* Accessibility (ARIA, labels, error associations)
* Mobile usability
* Performance optimization
* Debouncing strategies
* Backend validation alignment
* Error mapping from API responses
* Form abstraction layers
* Testing strategy for forms

---

# Step 2 – Update Each Documentation File

---

## 1️⃣ `forms-validation-part-1.md`

* Update foundational form architecture principles.
* Reflect implemented validation strategy.
* Align with current form state management approach.
* Remove outdated validation patterns.
* Ensure consistent description of submission flow.

---

## 2️⃣ `forms-validation-part-2.md`

* Update advanced validation patterns (cross-field, async validation).
* Reflect changes in error handling and API error mapping.
* Align multi-step or wizard form handling with implementation.
* Remove deprecated patterns.

---

## 3️⃣ `forms-validation-part-3.md`

* Update complex or high-impact form flows.
* Reflect accessibility improvements.
* Align performance optimizations with actual implementation.
* Document integration with component library and state management.
* Ensure consistency between frontend and backend validation rules.

---

# Documentation Requirements

* Reflect only implemented improvements.
* Do not duplicate roadmap content.
* Remove outdated or contradictory validation patterns.
* Preserve structure unless restructuring improves clarity.
* Ensure consistent terminology across all three files.
* Ensure alignment with:

  * Component Library documentation
  * State Management documentation
  * Navigation & User Flows documentation
  * Backend API validation rules
  * Security & Data Protection documentation

Each file must describe the **current operational form and validation architecture**, not planned changes.

---

# Phase 2 – Create Forms & Validation Remaining Roadmap

Create a new roadmap file, for example:

`docs/roadmaps/frontend/forms-validation-remaining.md`

Obs: Consider splitting the document into multiple files due to its size. For example, create files such as 'docs/roadmaps/frontend/forms-validation-remaining-part-1.md', 'docs/roadmaps/frontend/forms-validation-remaining-part-2.md', and so on
---

## The new roadmap must include:

### 1. Remaining Issues Grouped by Domain

Organize partially implemented and unimplemented issues into:

* Validation Schema Standardization
* Cross-Field & Complex Validation Improvements
* Async Validation Handling
* Error Messaging Consistency
* API Error Mapping Standardization
* Accessibility Compliance
* Multi-Step Form Optimization
* Performance Improvements
* Mobile UX Improvements
* Reusability & Abstraction
* Testing & Coverage Improvements
* Backend/Frontend Validation Alignment

---

### 2. Prioritization

Each item must be categorized:

* 🔥 Critical (data integrity risks, broken submission flows)
* ⚠️ High Priority
* 📌 Medium Priority
* 🧩 Nice to Have

---

### 3. Required Implementation Strategy Per Item

For every remaining issue include:

* Problem Description
* Current State
* Target State
* UX or Data Integrity Risk
* Proposed Architectural or Validation Solution
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
* Validation Standardization Phase
* UX & Accessibility Compliance Phase
* Performance & Optimization Phase
* Long-Term Form Architecture Evolution

---

# Constraints

* Do not modify existing roadmap files.
* Do not use scripts or shell commands.
* Do not invent undocumented form features.
* Base updates strictly on implemented roadmap items.
* Ensure cross-document consistency.
* Explicitly flag inconsistencies between documentation and implementation.

---

# Expected Output

After completing both phases, provide:

1. Summary of updates made to each of the three forms documentation files
2. Sections added, modified, or removed (per file)
3. List of roadmap items reflected as completed
4. Structured summary of the new Remaining Roadmap
5. Identified validation or data integrity gaps
6. Identified UX or accessibility risks
7. Maintainability and scalability risk assessment summary

