# 🔎 Prompt: Comprehensive Architectural & Technical Audit — Sintgesp Frontend

You are a **Senior Frontend Architect and Technical Auditor**.

Your task is to perform a **comprehensive architectural and technical analysis** of the **Sintgesp frontend codebase**.

Assume you have **full read-only access to the entire frontend repository**, including:

* Source files
* Configuration files
* `package.json` and lock files
* Build configuration
* Environment configuration
* CI configuration (if present)

Your objective is to:

1. Document the **current technical state** of the application
2. Identify **risks, architectural constraints, and scalability concerns**
3. Highlight **improvement and consolidation opportunities**
4. Produce a **clear onboarding and architectural reference document**
5. Avoid speculation — rely only on observable evidence from the repository

---

# 🎯 Deliverable

Generate a single Markdown document with the exact file path:

```
docs/frontend/01-Sintgesp-Frontend-Architecture-Overview.md
```

The document must contain the following sections in order:

1. Executive Summary
2. Technology Stack
3. Folder Structure & Organization
4. Dependency Analysis
5. Application Bootstrap
6. Build Configuration
7. Initial Recommendations (High-Level)

Tone must be:

* Technical
* Neutral
* Concise but thorough
* Evidence-based
* Structured with tables and diagrams

Do NOT include implementation-level instructions.

---

# 📦 Scope of Analysis

---

## 1️⃣ Technology Stack Inventory

Identify and document **all technologies, libraries, frameworks, and tools** used in the frontend.

### Include (but do not limit to):

### Core Framework

* React version
* Rendering mode (CSR, SSR, hybrid)
* Key React features used:

  * Hooks
  * Suspense
  * Lazy loading
  * Context API
  * Memoization
  * Concurrent features (if present)

### Language & Type System

* TypeScript version
* Key `tsconfig.json` settings:

  * strict mode
  * path aliases
  * module resolution strategy
  * incremental builds

### State Management

* Client state (e.g., Zustand)

  * Store organization pattern
  * Store coupling level
* Server state (e.g., TanStack Query)

  * Query structure
  * Caching strategy
  * Retry behavior
  * Global configuration

### Routing

* Router library and version
* Routing strategy (file-based, config-based, nested)
* Lazy route loading

### UI & Styling

* UI libraries
* Component frameworks
* CSS strategy (CSS Modules, Tailwind, styled-components, etc.)
* Theming approach

### Build & Bundling

* Build tool (Vite, Webpack, etc.)
* Plugins
* Dev server configuration

### Quality & Dev Tooling

* ESLint configuration
* Prettier
* Testing frameworks
* Storybook (if present)
* Husky / Git hooks
* CI tooling

---

### 📋 Required Output Format

Create a structured table:

| Technology | Version | Category | Purpose | Notes |
| ---------- | ------- | -------- | ------- | ----- |

Include everything observable from configuration files.

---

## 2️⃣ Folder Structure & Code Organization

Analyze the structure under:

```
frontend/src/
├── pages/
├── features/
├── components/
├── hooks/
├── stores/
├── api/
├── utils/
├── types/
├── styles/
└── assets/
```

For each directory:

* File count
* Naming conventions
* Organizational strategy:

  * Feature-based
  * Layer-based
  * Type-based
* Average file size (LOC estimate)
* Largest files (>300 LOC)
* Possible “god files”
* Mixed responsibilities
* Cross-feature coupling

---

### 📋 Deliverables

1. Directory-by-directory breakdown
2. Summary statistics table
3. Observations on:

   * Scalability
   * Maintainability
   * Architectural consistency

---

## 3️⃣ Dependency Analysis

Analyze:

* `package.json`
* `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`

Create a dependency audit table:

| Package | Version | Category | Estimated Size | Purpose | Issues | Replacement Options |
| ------- | ------- | -------- | -------------- | ------- | ------ | ------------------- |

Classify findings using indicators:

* 🟥 Security vulnerability
* 🟧 ≥ 2 major versions behind
* 🟨 Possibly unused / redundant
* 🟩 Optimization opportunity

Include:

* Redundant libraries
* Overlapping utilities
* Heavy dependencies
* Polyfill overhead
* Transitive risk dependencies

Conclude with:

* Risk highlights
* Cleanup opportunities
* Modernization potential

---

## 4️⃣ Application Entry Point Analysis

Analyze:

* `main.tsx`
* `App.tsx`
* Root instructors

Document:

* Instructor hierarchy (QueryClientProvider, Router, ThemeProvider, etc.)
* Initialization order
* Global state hydration
* Error boundaries
* Suspense boundaries
* Fallback UI handling
* Global CSS or theme injection

---

### 📋 Deliverables

1. Written explanation of bootstrap flow
2. High-level diagram (ASCII or Mermaid)

Example structure:

```
main.tsx
 └── ReactDOM.createRoot()
      └── QueryClientProvider
           └── ThemeProvider
                └── RouterProvider
                     └── App
```

---

## 5️⃣ Build & Environment Configuration

Analyze:

* Vite / Webpack config
* tsconfig
* PostCSS / Tailwind config
* Babel config (if present)
* Environment variable strategy (`.env` usage)
* Build output structure

Document:

* Code splitting strategy
* Lazy loading usage
* Tree shaking
* Chunking strategy
* Static asset handling
* Source maps
* Minification
* Estimated or observable:

  * Build time
  * Bundle size

Include architectural implications of current setup.

---

# 🧾 Output Structure Requirements

The final document must include:

---

## 1. Executive Summary

* High-level architecture pattern
* Technical maturity assessment
* Key risks
* Key strengths
* Overall maintainability assessment

---

## 2. Technology Stack

* Inventory table
* Observations

---

## 3. Folder Structure & Organization

* Breakdown
* Statistics
* Scalability analysis

---

## 4. Dependency Analysis

* Audit tables
* Risk flags
* Observations

---

## 5. Application Bootstrap

* Instructor hierarchy
* Diagram
* Architectural implications

---

## 6. Build Configuration

* Configuration analysis
* Optimization strategy assessment

---

## 7. Initial Recommendations (High-Level)

Provide:

* Architectural refinement themes
* Risk mitigation themes
* Scalability improvement themes

Do NOT provide:

* Code-level rewrites
* Step-by-step implementation guides

Keep recommendations strategic and directional.

---

# ⚙️ Analytical Constraints

* Do not assume undocumented architecture decisions.
* If something is unclear, mark as:

  > *“Not inferable from repository structure”*
* Base conclusions strictly on observable code.
* Avoid subjective judgments — justify claims with evidence.
* Prefer structured tables over long paragraphs.
* Maintain professional architecture review tone.

