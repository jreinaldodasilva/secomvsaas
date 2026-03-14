Here is the fully structured, enterprise-grade version of your prompt for the **Code Quality** domain:

---

# Improved Prompt

Carefully review the following roadmap documents:

* `docs/backendroadmaps/08-Sintgesp-Code-Quality-Improvement-Roadmap.md`
* `docs/backendroadmaps/08-Sintgesp-Code-Quality-Quick-Wins.md`

Your objectives are to:

1. Update the following documentation file so it accurately reflects all **implemented code quality improvements and refactors**:

   * `docs/backend/12-Sintgesp-Code-Quality-Enterprise-Audit.md`

2. Create a new roadmap document defining the **remaining unimplemented code quality issues**, including a structured and prioritized execution plan.

---

# Phase 1 – Update Code Quality Enterprise Audit Documentation

---

## Step 1 – Analyze the Roadmaps

Identify which improvements and Quick Wins have been:

* ✅ Completed
* 🟡 Partially implemented
* ❌ Not implemented

Extract changes affecting:

* Architectural consistency
* Folder and module structure
* Naming conventions
* Type safety improvements
* Linting configuration
* Formatting standards
* Static analysis tooling
* Dependency management
* Code duplication reduction
* Cyclomatic complexity
* Function length and responsibility scope
* Separation of concerns
* Test coverage improvements
* Mocking strategy
* Logging consistency
* Error handling standardization
* Anti-pattern removal
* Technical debt reduction
* Refactoring of legacy modules
* Dead code removal
* Documentation quality within code

---

# Step 2 – Update `12-Sintgesp-Code-Quality-Enterprise-Audit.md`

The document must:

### 1. Reflect Current Reality

* Update all audit findings that have been resolved.
* Mark previously identified issues as:

  * Resolved
  * Partially resolved
  * Still open
* Remove outdated criticality classifications where fixes were implemented.

### 2. Improve Audit Structure (if needed)

Ensure the audit document clearly separates:

* Structural Quality
* Maintainability
* Testability
* Readability
* Scalability Readiness
* Dependency Health
* Technical Debt Status
* Code Consistency
* Risk Areas

### 3. Maintain Enterprise Audit Tone

The document must:

* Be objective and factual.
* Reflect measurable improvements where applicable.
* Clearly state residual risk areas.
* Avoid speculative future improvements.
* Serve as the **authoritative code quality reference**.

---

# Phase 2 – Create Code Quality Remaining Roadmap

Create a new roadmap file, for example:

`docs/backendroadmaps/08-Sintgesp-Code-Quality-Remaining-Roadmap.md`

---

## The new roadmap must include:

### 1. Remaining Issues Grouped by Domain

Organize partially implemented and unimplemented issues into:

* Architecture & Structure
* Naming & Conventions
* Type Safety & Strictness
* Refactoring & Technical Debt
* Complexity Reduction
* Error Handling Standardization
* Logging Improvements
* Testing & Coverage
* Static Analysis & Tooling
* Dependency Hygiene
* Code Duplication
* Performance-related Code Smells
* Documentation Quality

---

### 2. Prioritization

Each item must be categorized:

* 🔥 Critical (risk of instability or maintainability collapse)
* ⚠️ High Priority
* 📌 Medium Priority
* 🧩 Nice to Have

---

### 3. Required Implementation Strategy Per Item

For every remaining issue include:

* Problem Description
* Current State
* Target State
* Maintainability Risk
* Proposed Refactor Strategy
* Breaking Change Risk (Yes/No)
* Migration Strategy (if required)
* Estimated Complexity (Low / Medium / High)
* Technical Debt Impact (Low / Medium / High)
* Dependencies

---

### 4. Phased Execution Plan

Organize into:

* Quick Wins
* Structural Refactor Phase
* Complexity Reduction Phase
* Testing & Coverage Expansion
* Long-Term Maintainability Improvements

---

# Constraints

* Do not modify existing roadmap files.
* Do not use scripts or shell commands.
* Do not invent undocumented quality initiatives.
* Base updates strictly on implemented roadmap items.
* Ensure consistency with:

  * Backend Architecture
  * Business Logic
  * API Design
  * Security documentation
* Explicitly flag discrepancies between documentation and implementation.

---

# Expected Output

After completing both phases, provide:

1. Summary of updates made to `12-Sintgesp-Code-Quality-Enterprise-Audit.md`
2. Sections added, modified, or removed
3. List of roadmap items reflected as completed
4. Structured summary of the new Remaining Roadmap
5. Identified technical debt hotspots
6. Identified architectural inconsistencies
7. Maintainability risk assessment summary

