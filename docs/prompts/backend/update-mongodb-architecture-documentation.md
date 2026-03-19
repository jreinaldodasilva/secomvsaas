
## Improved Prompt

Carefully review the following MongoDB roadmap documents:

* `docs/roadmaps/backend/mongodb-improvement.md`
* `docs/roadmaps/backend/mongodb-quick-wins.md`

Your objectives are to:

1. Update
   `docs/architecture/backend/mongodb-architecture.md`
   so it accurately reflects all **implemented MongoDB architecture fixes and improvements**.

2. Create a new roadmap document defining the **remaining unimplemented MongoDB architecture issues**, including a structured execution plan.

---

# Phase 1 – MongoDB Architecture Documentation Update

## Responsibilities

### 1. Analyze the Roadmaps

* Identify which improvements and Quick Wins have been:

  * ✅ Completed
  * 🟡 Partially implemented
  * ❌ Not implemented
* Extract changes affecting:

  * Collection design
  * Schema structure
  * Indexing strategy
  * Data modeling decisions
  * Relationships and references
  * Aggregation usage
  * Transactions
  * Performance optimizations
  * Multi-tenancy strategies (if applicable)
  * Data validation and schema enforcement
  * Sharding or scaling considerations

### 2. Update the MongoDB Architecture Document

* Reflect only implemented changes.
* Remove outdated modeling descriptions.
* Update diagrams or structural explanations if needed.
* Align terminology with the current backend implementation.
* Improve clarity and technical accuracy.
* Ensure the document becomes the **authoritative reference** for MongoDB architecture.

### 3. Maintain Documentation Integrity

* Preserve structure unless restructuring improves clarity.
* Avoid copying roadmap plans verbatim.
* Reflect results, not intentions.
* Do not introduce speculative or future-state database design.

---

# Phase 2 – Create MongoDB Remaining Issues Roadmap

Create a new roadmap file, for example:

`docs/roadmaps/backend/mongodb-remaining.md`

---

## The new roadmap must include:

### 1. Remaining Items

List all partially implemented and unimplemented issues, grouped by domain:

* Data Modeling
* Indexing & Query Optimization
* Performance
* Transactions & Consistency
* Data Integrity & Validation
* Scalability (replication, sharding)
* Observability & Monitoring
* Security (roles, access control, encryption)
* Backup & Recovery
* Migration / Versioning strategy

---

### 2. Prioritization

Categorize each item:

* 🔥 Critical
* ⚠️ High Priority
* 📌 Medium Priority
* 🧩 Nice to Have

---

### 3. Implementation Strategy (Required Per Item)

For every remaining issue, include:

* Problem Description
* Current State
* Target State
* Proposed Technical Solution
* Required Indexes or Schema Changes (if applicable)
* Migration Strategy (if breaking changes are involved)
* Backward Compatibility Considerations
* Estimated Complexity (Low / Medium / High)
* Risks

---

### 4. Phased Execution Plan

Organize the roadmap into:

* Quick Wins
* Performance & Index Optimizations
* Structural Refactors
* Scalability Enhancements
* Long-Term Evolution

---

# Constraints

* Do not modify existing roadmap files.
* Do not use scripts or command-line tools.
* Do not invent new features outside what is documented.
* Base updates strictly on documented improvements and implemented changes.
* Ensure consistency with overall backend architecture documentation.

---

# Expected Output

After completing both phases, provide:

1. Summary of updates made to the MongoDB Architecture document
2. Sections added, modified, or removed
3. List of roadmap items reflected as completed
4. Structured summary of the new Remaining Roadmap
5. Identified inconsistencies between implementation and documentation
6. Identified data modeling or performance risks

