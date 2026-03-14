Here is the fully structured, enterprise-grade version of your prompt for the **Frontend Architecture** domain:

---

# Improved Prompt

Carefully review the following frontend roadmap documents:

* `docs/frontendroadmaps/01-Sintgesp-Frontend-Architecture-Improvement-Roadmap.md`
* `docs/frontendroadmaps/01-Sintgesp-Frontend-Architecture-Quick-Wins.md`

Your objectives are to:

1. Update the following documentation file so it accurately reflects all **implemented frontend architectural fixes, structural improvements, and refactors**:

   * `docs/frontend/01-Sintgesp-Frontend-Architecture-Overview.md`

2. Create a new roadmap document defining the **remaining unimplemented frontend architecture issues**, including a structured and prioritized execution plan.

---

# Phase 1 – Update Frontend Architecture Documentation

---

## Step 1 – Analyze the Roadmaps

Identify which improvements and Quick Wins have been:

* ✅ Completed
* 🟡 Partially implemented
* ❌ Not implemented

Extract changes affecting:

* Folder and module structure
* Feature-based vs layer-based architecture decisions
* Component hierarchy and organization
* Separation of concerns (UI vs business logic)
* State management architecture
* API integration layer structure
* Data fetching patterns
* Caching strategy
* Routing structure
* Navigation organization
* Reusability patterns
* Shared component design
* Design system alignment
* Error boundaries
* Lazy loading and code splitting
* Performance-driven structural changes
* Testing architecture
* Environment configuration handling
* Dependency structure
* Frontend security considerations
* Build and deployment workflow adjustments

---

# Step 2 – Update `01-Sintgesp-Frontend-Architecture-Overview.md`

The document must:

### 1. Reflect Current Reality

* Remove outdated structural descriptions.
* Update module and folder diagrams if needed.
* Reflect refactored component structure.
* Align state management explanation with implementation.
* Update routing and navigation structure.
* Ensure architectural decisions match the current codebase.

---

### 2. Improve Clarity and Structure (if necessary)

Ensure the document clearly separates:

* Application Structure
* Architectural Principles
* Component Organization Strategy
* State Management Strategy
* API Integration Layer
* Routing & Navigation Architecture
* Performance Strategy
* Error Handling Strategy
* Testing Strategy
* Scalability & Maintainability Considerations

---

### 3. Maintain Architectural Authority

The document must:

* Reflect implemented changes only.
* Avoid roadmap duplication.
* Avoid speculative future-state architecture.
* Serve as the **single source of truth** for frontend architecture.

Ensure alignment with:

* Backend API Design documentation
* Frontend UX documentation (if applicable)
* Performance & Quality documentation

---

# Phase 2 – Create Frontend Architecture Remaining Roadmap

Create a new roadmap file, for example:

`docs/frontendroadmaps/01-Sintgesp-Frontend-Architecture-Remaining-Roadmap.md`

Obs: Consider splitting the document into multiple files due to its size. For example, create files such as 'docs/frontendroadmaps/01-Sintgesp-Frontend-Architecture-Remaining-Roadmap-Part1.md', 'docs/frontendroadmaps/01-Sintgesp-Frontend-Architecture-Remaining-Roadmap-Part2.md', and so on.

---

## The new roadmap must include:

### 1. Remaining Issues Grouped by Domain

Organize partially implemented and unimplemented issues into:

* Structural Improvements
* State Management Refactors
* Component Isolation & Reusability
* Routing & Navigation Improvements
* API Integration Standardization
* Performance & Code Splitting
* Error Handling & Resilience
* Testing & Coverage Expansion
* Dependency Optimization
* Scalability & Modularity Enhancements
* Frontend Security Improvements

---

### 2. Prioritization

Each item must be categorized:

* 🔥 Critical (structural risks or major maintainability issues)
* ⚠️ High Priority
* 📌 Medium Priority
* 🧩 Nice to Have

---

### 3. Required Implementation Strategy Per Item

For every remaining issue include:

* Problem Description
* Current State
* Target State
* Architectural Risk or Technical Debt Impact
* Proposed Structural Solution
* Breaking Change Risk (Yes/No)
* Migration Strategy (if required)
* Estimated Complexity (Low / Medium / High)
* Performance Impact (if relevant)
* Dependencies

---

### 4. Phased Execution Plan

Organize into:

* Quick Wins
* Structural Refactor Phase
* State Management Consolidation
* Performance & Optimization Phase
* Long-Term Architectural Evolution

---

# Constraints

* Do not modify existing roadmap files.
* Do not use scripts or shell commands.
* Do not invent undocumented frontend features.
* Base updates strictly on implemented roadmap items.
* Ensure cross-document consistency.
* Explicitly flag inconsistencies between documentation and implementation.

---

# Expected Output

After completing both phases, provide:

1. Summary of updates made to `01-Sintgesp-Frontend-Architecture-Overview.md`
2. Sections added, modified, or removed
3. List of roadmap items reflected as completed
4. Structured summary of the new Remaining Roadmap
5. Identified architectural risks
6. Identified structural inconsistencies
7. Frontend maintainability risk assessment summary

