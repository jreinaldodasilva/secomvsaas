# Sintgesp Frontend Review

# 🔎 Prompt: Comprehensive State Management & Data Flow Audit — Sintgesp Frontend

You are a **Senior Frontend Architect specializing in state management, data flow design, and scalable frontend architecture**.

Your task is to perform a **comprehensive audit of the Sintgesp frontend state management and data flow architecture**, focusing on:

* Zustand (client state)
* TanStack Query (server state)
* Data flow patterns
* Cache lifecycle management
* Synchronization boundaries
* Architectural consistency
* Risk exposure

The objective is to produce a **clear, structured, and durable technical reference document** that:

* Documents the current architecture
* Identifies strengths and weaknesses
* Classifies risks by severity
* Supports onboarding
* Informs future refactoring decisions

---

# 📚 Available Context & Required Inputs

You have **full read-only access to the frontend repository**.

You must analyze:

* `src/stores/`
* `src/api/`
* Custom data hooks (`src/hooks/` and feature-level hooks)
* TanStack Query configuration
* Store persistence utilities
* Any cache utilities or state helpers
* AND the previously generated documents:

```
docs/frontend/01-Sintgesp-Frontend-Architecture-Overview.md
docs/frontend/02-Sintgesp-Component-Library-Part1.md
docs/frontend/02-Sintgesp-Component-Library-Part2.md
docs/frontend/02-Sintgesp-Component-Library-Part3.md

```

Use those documents to:

* Ensure architectural consistency
* Avoid duplicating previously documented material
* Cross-reference dependency decisions
* Validate instructor hierarchy and bootstrap configuration
* Understand routing and feature boundaries

If inconsistencies are detected between implementation and documented architecture, clearly document them.

---

# 🎯 Deliverable

Generate a single Markdown document with the exact file path:

```
docs/frontend/03-Sintgesp-State-Management-Part1.md
docs/frontend/03-Sintgesp-State-Management-Part2.md
docs/frontend/03-Sintgesp-State-Management-Part3.md

```

---

# ⚙️ Analytical Standards

When performing the audit:

* Base conclusions strictly on observable code.

* Use static analysis and import tracing to determine usage.

* Avoid assumptions about undocumented runtime behavior.

* Clearly separate facts from interpretation.

* Prefer measurable findings over subjective commentary.

* Mark unverifiable items as:

  > *“Not inferable from repository structure.”*

* Do NOT provide implementation-level rewrite instructions.

* Provide high-level, strategic improvement themes only.

---

# 🚨 Severity Classification

Use the following severity levels consistently:

* 🟥 **Critical** – High risk of bugs, data corruption, race conditions, or security issues
* 🟧 **High** – Likely to cause performance, maintainability, or scaling problems
* 🟨 **Medium** – Architectural inconsistencies or structural concerns
* 🟩 **Low** – Optimization or best-practice opportunities

---

# 📦 Scope of Analysis

---

# 1️⃣ Zustand Store Architecture Analysis

Identify and document **all Zustand stores** in:

```
src/stores/
```

For each store, provide a structured section.

---

## Store Metadata

* Store name
* File location
* Primary responsibility
* Associated feature/domain
* Approximate LOC
* Store creation pattern (vanilla, middleware-enhanced, slices pattern, etc.)

---

## State Shape Documentation

Document the full state interface:

* Top-level fields
* Nested structures
* Derived/computed state
* Initial defaults
* Type definitions

Provide summary table:

| Field | Type | Default | Purpose | Derived? |

---

## Actions Analysis

For each action:

* Action name
* Responsibility
* Mutation strategy
* Side effects (API calls, navigation, persistence, etc.)
* Async handling approach
* Error handling behavior

Provide summary table:

| Action | Type (sync/async) | Side Effects | Affects Fields | Risks |

---

## Persistence Strategy

Document:

* Middleware used (e.g., persist)
* Storage type (localStorage, sessionStorage)
* Persisted keys
* Rehydration behavior
* Sensitive data storage risks
* Versioning strategy (if present)

Highlight:

* 🟥 Token storage risks
* 🟧 Improper persistence usage
* 🟨 Missing persistence boundaries

---

## Usage Mapping

Using import tracing, document:

* Components/pages using the store
* Custom hooks wrapping access
* Cross-store dependencies
* Store-to-store coupling

Provide summary table:

| Store | Usage Locations | Wrapped in Hook? | Cross Dependencies | Coupling Risk |

---

## Code Quality & Risk Assessment

Evaluate:

* Overloaded stores (multiple responsibilities)
* Business logic leakage into stores
* Race condition risks
* Tight coupling to API layer
* Improper state normalization
* Uncontrolled side effects

---

# 2️⃣ TanStack Query Configuration Analysis

Identify and document the **QueryClient configuration**.

Document:

```ts
defaultOptions: {
  queries: {
    staleTime
    cacheTime
    retry
    refetchOnWindowFocus
    refetchOnReconnect
    refetchOnMount
  },
  mutations: {
    retry
  }
}
```

---

## Configuration Documentation

Create configuration table:

| Option | Value | Scope | Observed Impact | Risk |

---

## Query Architecture Analysis

Analyze:

* Query key naming conventions
* Query key consistency
* Cache invalidation strategy
* Manual vs automatic invalidation
* Pagination patterns
* Infinite query usage
* Optimistic updates
* Query deduplication
* Error boundary integration
* Global error handling strategy

Document observed caching philosophy:

* Aggressive refetching?
* Long-lived caching?
* Event-driven invalidation?

Highlight inconsistencies if present.

---

# 3️⃣ Query & Mutation Hooks Inventory

Catalog all custom hooks related to:

* Data fetching
* Data mutation
* Cache invalidation
* Data transformation
* Optimistic updates

Search across:

* `src/hooks/`
* Feature directories
* Co-located hook files

---

## Required Table

| Hook | Type | Responsibility | Query/Mutation Key | Cache Strategy | Error Handling | Dependencies | Issues |

Also include:

* Reusability patterns
* Abstraction quality
* Duplicate hooks
* Over-fragmentation
* Missing abstraction

---

# 4️⃣ Data Flow Modeling

Model key flows using Mermaid sequence diagrams.

Required flows:

1. Authentication lifecycle (login / logout / token persistence / refresh)
2. Standard server data fetch lifecycle
3. Mutation lifecycle
4. Cache invalidation and refetch lifecycle
5. Store-triggered query invalidation (if applicable)

Use clearly labeled actors:

* Component
* Custom Hook
* Zustand Store
* Query Client
* API Service
* Cache
* Browser Storage

Diagrams must reflect actual implementation patterns, not assumed best practices.

---

# 5️⃣ State Synchronization & Architectural Evaluation

Evaluate the relationship between:

* Client state (Zustand)
* Server state (TanStack Query)

Analyze:

* Separation of concerns clarity
* State duplication between store and cache
* Redundant derived state
* Cache invalidation correctness
* Synchronization race risks
* Normalization practices
* Cross-feature data consistency
* Query-to-store data copying patterns

Classify findings:

* 🟥 Data inconsistency risks
* 🟧 Redundant/conflicting state
* 🟨 Weak synchronization boundaries
* 🟩 Performance or maintainability improvements

Provide structured report:

| Issue | Severity | Evidence | Impact | Scope |

---

# 📄 Required Output Structure

The final document must contain:

1. Executive Summary
2. State Management Architecture Overview
3. Zustand Store Documentation
4. TanStack Query Configuration Analysis
5. Query & Mutation Hooks Catalog
6. Data Flow Diagrams
7. State Synchronization Analysis
8. High-Level Improvement Recommendations

---

# 🧭 Executive Summary Must Include

* Overall maturity level of state architecture
* Client vs server state separation clarity
* Cache management maturity
* Synchronization risk profile
* Scalability readiness
* Most critical architectural risks

Keep concise but strategic.

---

# 📏 Formatting & Style Requirements

* Structured Markdown
* Tables for all documentation sections
* Mermaid diagrams for data flows
* Neutral and technical tone
* No speculative assumptions
* No implementation-level rewrite instructions
* Do not duplicate architectural details already documented unless necessary for context

---

# 🧠 Quality Expectations

The audit must:

* Be exhaustive yet structured
* Highlight measurable and verifiable patterns
* Distinguish architectural design from incidental implementation
* Clearly separate client and server responsibilities
* Support onboarding, debugging, and refactoring planning
* Provide governance-level clarity

