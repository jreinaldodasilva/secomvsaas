
## Improved Prompt

Carefully review the following API Design roadmap documents:

* `docs/backendroadmaps/03-Sintgesp-API-Design-Improvement-Roadmap.md`
* `docs/backendroadmaps/03-Sintgesp-API-Design-Quick-Wins.md`

Your objectives are to:

1. Update
   `docs/backend/03-Sintgesp-API-Design.md`
   so it accurately reflects all **implemented API design fixes, improvements, and structural changes**.

2. Create a new roadmap document that defines the **remaining unimplemented API design issues**, including a structured and prioritized execution plan.

---

# Phase 1 – API Design Documentation Update

## Responsibilities

### 1. Analyze the Roadmaps

* Identify which improvements and Quick Wins have been:

  * ✅ Completed
  * 🟡 Partially implemented
  * ❌ Not implemented
* Extract changes affecting:

  * Route structure and naming conventions
  * REST compliance and consistency
  * Versioning strategy
  * Error handling standardization
  * Response structure and envelope patterns
  * Status code correctness
  * DTO usage and validation
  * Authentication & authorization integration
  * Pagination, filtering, sorting
  * Idempotency rules
  * API documentation (e.g., OpenAPI/Swagger)
  * Rate limiting or throttling strategies
  * Consistency across modules

---

### 2. Update the API Design Document

* Reflect only implemented changes.
* Remove outdated endpoint structures or conventions.
* Align route definitions and examples with the current implementation.
* Update response and error structure documentation if modified.
* Improve clarity and architectural explanation where needed.
* Ensure the document becomes the **authoritative API design reference**.

Do not duplicate roadmap text — reflect outcomes and current reality.

---

### 3. Maintain Documentation Integrity

* Preserve structure unless restructuring improves clarity.
* Keep formatting aligned with other backend documentation.
* Do not introduce speculative future API features.
* Ensure consistency with:

  * Backend architecture documentation
  * MongoDB architecture documentation
  * Authentication and security documentation

---

# Phase 2 – Create API Design Remaining Issues Roadmap

Create a new roadmap file, for example:

`docs/backendroadmaps/03-Sintgesp-API-Design-Remaining-Roadmap.md`

Obs: Consider splitting the document into multiple files due to its size. For example, create files such as 'docs/backendroadmaps/03-Sintgesp-API-Design-Remaining-Roadmap-Part1.md', 'docs/backendroadmaps/03-Sintgesp-API-Design-Remaining-Roadmap-Part2.md', and so on.

---

## The new roadmap must include:

### 1. Remaining Items Grouped by Domain

Organize partially implemented and unimplemented issues into categories such as:

* Route Consistency & Naming
* REST Compliance & Resource Modeling
* Versioning Strategy
* Error Handling & Response Standardization
* Validation & DTO Enforcement
* Authentication & Authorization Alignment
* Pagination, Filtering & Sorting Standards
* Observability (logging, tracing)
* Documentation & OpenAPI Coverage
* API Security (rate limiting, abuse prevention)

---

### 2. Prioritization

Each item must be categorized:

* 🔥 Critical
* ⚠️ High Priority
* 📌 Medium Priority
* 🧩 Nice to Have

---

### 3. Required Implementation Strategy Per Item

For each remaining issue include:

* Problem Description
* Current State
* Target State
* Proposed Technical Solution
* Breaking Change Risk (Yes/No)
* Migration Strategy (if required)
* Backward Compatibility Considerations
* Estimated Complexity (Low / Medium / High)
* Risks and Dependencies

---

### 4. Phased Execution Plan

Organize the roadmap into:

* Quick Wins
* Standardization Phase
* Structural Refactors
* Security & Compliance Improvements
* Long-Term API Evolution

---

# Constraints

* Do not modify existing roadmap files.
* Do not use scripts or command-line tools.
* Do not invent new API features outside documented scope.
* Base updates strictly on implemented improvements.
* Ensure consistency across backend documentation.

---

# Expected Output

After completing both phases, provide:

1. Summary of updates made to the API Design document
2. Sections added, modified, or removed
3. List of roadmap items reflected as completed
4. Structured summary of the new Remaining Roadmap
5. Identified inconsistencies between documentation and implementation
6. Identified API design risks or architectural gaps

