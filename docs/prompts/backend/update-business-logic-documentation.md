Here is the fully structured and enterprise-grade version of your prompt for the **Business Logic** domain:

---

# Improved Prompt

Carefully review the following roadmap documents:

* `docs/roadmaps/backend/business-logic-improvement.md`
* `docs/roadmaps/backend/business-logic-quick-wins.md`

Your objectives are to:

1. Update the following documentation files so they accurately reflect all **implemented business logic fixes, structural improvements, and refactors**:

   * `docs/architecture/backend/business-logic.md`
   * `docs/architecture/backend/business-logic-part-1.md`
   * `docs/architecture/backend/business-logic-part-2.md`
   * `docs/architecture/backend/business-logic-part-3.md`

2. Create a new roadmap document defining the **remaining unimplemented business logic issues**, including a structured and prioritized execution plan.

---

# Phase 1 – Update Business Logic Documentation

---

## Step 1 – Analyze the Roadmaps

Identify which improvements and Quick Wins have been:

* ✅ Completed
* 🟡 Partially implemented
* ❌ Not implemented

Extract changes affecting:

* Domain modeling
* Service layer structure
* Use case orchestration
* Separation of concerns
* Cross-module dependencies
* Transaction boundaries
* Error propagation strategy
* Validation responsibilities
* Side effects and external integrations
* Business rule centralization
* Event-driven patterns (if applicable)
* Idempotency and state consistency
* Performance bottlenecks in business workflows
* Duplication or logic scattering
* Anti-pattern removal (fat controllers, god services, etc.)
* Domain invariants enforcement

---

# Step 2 – Update Each Documentation File

---

## 1️⃣ `business-logic.md`

* Ensure this document accurately describes the current business logic architecture.
* Update module relationships and boundaries.
* Reflect structural refactors.
* Remove outdated architectural explanations.
* Ensure it acts as the **authoritative entry point** for business logic documentation.

---

## 2️⃣ `business-logic-part-1.md`

* Update documentation for the modules or domains covered in this file.
* Reflect implemented refactors.
* Align use case flows with current service structure.
* Remove deprecated patterns or responsibilities.

---

## 3️⃣ `business-logic-part-2.md`

* Align documentation with current orchestration patterns.
* Reflect changes to service coordination or transactional logic.
* Update domain rule explanations if centralized or refactored.

---

## 4️⃣ `business-logic-part-3.md`

* Reflect advanced patterns or cross-cutting logic changes.
* Update integration boundaries (if external services are involved).
* Align with any event-driven or asynchronous improvements.

---

# Documentation Requirements

* Reflect only implemented improvements.
* Do not copy roadmap items verbatim.
* Remove contradictions or outdated explanations.
* Preserve structure unless restructuring improves clarity.
* Ensure terminology consistency across all four files.
* Ensure alignment with:

  * Backend Architecture
  * API Design
  * MongoDB Architecture
  * Auth & Security
  * RBAC documentation

The documentation must describe the **current operational business logic architecture**, not future intentions.

---

# Phase 2 – Create Business Logic Remaining Roadmap

Create a new roadmap file, for example:

`docs/roadmaps/backend/business-logic-remaining.md`

Obs: Consider splitting the document into multiple files due to its size. For example, create files such as 'docs/roadmaps/backend/business-logic-remaining-part-1.md', 'docs/roadmaps/backend/business-logic-remaining-part-2.md', and so on

---

## The new roadmap must include:

### 1. Remaining Items Grouped by Domain

Organize partially implemented and unimplemented issues into categories such as:

* Domain Modeling Improvements
* Service Layer Refactors
* Use Case Isolation
* Cross-Module Coupling Reduction
* Transaction & Consistency Improvements
* Performance Optimization
* Business Rule Centralization
* Event-Driven Improvements
* Code Duplication Removal
* Error Handling Standardization
* Observability & Logging Improvements
* Testability & Isolation Improvements

---

### 2. Prioritization

Each item must be categorized:

* 🔥 Critical (logic inconsistencies, high-risk flows)
* ⚠️ High Priority
* 📌 Medium Priority
* 🧩 Nice to Have

---

### 3. Required Implementation Strategy Per Item

For every remaining issue include:

* Problem Description
* Current State
* Target State
* Business Risk or Technical Debt Impact
* Proposed Technical Solution
* Breaking Change Risk (Yes/No)
* Migration Strategy (if required)
* Backward Compatibility Considerations
* Estimated Complexity (Low / Medium / High)
* Performance Impact (if relevant)
* Dependencies

---

### 4. Phased Execution Plan

Organize the roadmap into:

* Quick Wins
* Structural Refactors
* Domain Consolidation Phase
* Performance & Consistency Improvements
* Long-Term Domain Evolution

---

# Constraints

* Do not modify existing roadmap files.
* Do not use automation scripts or shell tools.
* Do not invent undocumented business features.
* Base updates strictly on implemented roadmap items.
* Ensure cross-document consistency.
* Explicitly flag inconsistencies between documentation and implementation.

---

# Expected Output

After completing both phases, provide:

1. Summary of updates made to each of the four documentation files
2. Sections added, modified, or removed (per file)
3. List of roadmap items reflected as completed
4. Structured summary of the new Remaining Roadmap
5. Identified business logic gaps
6. Identified architectural inconsistencies
7. Risk assessment summary (highlighting any Critical business logic issues)

