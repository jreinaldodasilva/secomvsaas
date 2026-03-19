# 🔎 Prompt: Comprehensive Component Library Audit — Secom Frontend

You are a **Senior Frontend Architect and Design System Auditor**.

Your task is to perform a **comprehensive audit of the Secom component library**, including:

* Cataloging all components
* Documenting the design system
* Evaluating quality, consistency, accessibility, and reusability
* Identifying risks and architectural weaknesses
* Assessing scalability readiness

The objective is to produce a **long-term reference document** that supports:

* Maintainability
* Design standardization
* Component governance
* Future scalability

---

# 📚 Available Context & Required Inputs

You have **full read-only access to the entire frontend repository**.

You may analyze:

* Entire `src/components/` directory
* `src/features/` (for usage tracing)
* `src/pages/` (for usage tracing)
* Design system sources (tokens, themes, CSS variables)
* Tailwind / styling configuration files
* `tsconfig.json` (for path alias understanding)
* `package.json`
* Any styling architecture files
* AND the previously generated architecture overview:

```
docs/architecture/frontend/overview.md
```

Use the architecture overview document to:

* Understand state management context
* Understand routing structure
* Identify architectural constraints
* Cross-reference dependency findings
* Avoid re-documenting what already exists
* Ensure consistency between architectural and component-level analysis

Do not contradict documented architectural findings unless evidence shows inconsistencies.

---

# 🎯 Deliverable

Generate a single Markdown document with the exact file path:

```
docs/architecture/frontend/component-library.md
```

---

# ⚙️ Analytical Methodology

When performing the audit:

* Base conclusions only on observable code and configuration.

* Avoid assumptions about undocumented intent.

* Use static code inspection and import tracing for usage counts.

* Prefer measurable metrics over subjective commentary.

* Clearly separate facts from interpretation.

* Mark anything unverifiable as:

  > *“Not inferable from repository structure.”*

* Do NOT provide implementation-level rewrite instructions.

* Keep recommendations high-level and strategic.

---

# 📦 Scope of Analysis

---

# 1️⃣ Complete Component Inventory

Identify and catalog **all React components** in:

```
src/components/
```

For each component, capture:

* Component name
* File location
* Component category
* Lines of code (LOC estimate)
* Props interface summary
* Number of visual/behavioral variants
* Estimated usage count (based on import tracing)
* Identified code smells or risks

---

## Component Classification

Classify each component into one category:

* Page components
* Feature components
* UI / Shared components
* Layout components
* Form components
* Primitive / Base components

Be consistent with classification rules.

---

## Required Inventory Table

| Component | Location | Category | LOC | Props Summary | Variants | Usage Count | Issues |
| --------- | -------- | -------- | --- | ------------- | -------- | ----------- | ------ |

Also include:

* Total component count
* Count by category
* Largest components (>300 LOC)
* Average LOC per component
* Observations on maturity and structure

---

# 2️⃣ Design System Documentation

Identify and document the **design system implementation**.

Cross-reference styling architecture described in:

```
docs/architecture/frontend/overview.md
```

If discrepancies exist, document them.

---

## 🎨 Color System

Extract tokens from:

* Tailwind config
* CSS variables
* Theme files
* Design token files

Document in structured token format:

* Primary
* Secondary
* Success
* Error
* Warning
* Info
* Neutral / Grayscale
* Background / Surface

For each token include:

| Token Name | Value | Source | Usage Context | Notes |

---

## ✍ Typography

Document:

* Font families
* Type scale
* Font weights
* Line heights
* Heading hierarchy
* Utility class patterns (if Tailwind)

Include table format where applicable.

---

## 📐 Spacing & Layout

Document:

* Spacing scale
* Margin/padding conventions
* Container widths
* Grid system (if present)
* Breakpoints

---

## 🎛 Styling Architecture

Explain:

* Styling methodology (Tailwind, CSS Modules, styled-components, etc.)
* Token consumption patterns
* Dark mode support (if any)
* Theming architecture
* Global vs local styles
* Risk of style leakage

---

## Deliverable

Structured **Design System Specification** including:

* Token tables
* Architecture overview
* Consistency observations
* Scalability readiness assessment

---

# 3️⃣ Component Deep Dive (Top 15–20 Critical Components)

Select 15–20 components based on:

* Highest usage count
* Architectural importance
* UI criticality
* Core primitives (Button, Input, Modal, etc.)

Prioritize:

* Button
* Input
* Select
* Modal / Dialog
* Card
* Form controls
* Layout primitives
* Navigation components

---

For each component, create a structured section:

---

## Component Metadata

* Name
* File location
* Category
* Responsibility

---

## Props Interface Summary

* Required vs optional props
* Variant props
* Behavioral props
* Extensibility patterns

---

## Variants

Document all visual and behavioral variants.

---

## Interaction States

Evaluate support for:

* Default
* Hover
* Active
* Focus
* Disabled
* Loading
* Error (if applicable)

---

## Accessibility Review

Evaluate:

* Semantic HTML usage
* ARIA attributes
* Keyboard support
* Focus management
* Label associations
* Accessibility anti-patterns

Classify:

* 🟥 Critical accessibility gaps
* 🟧 Partial support
* 🟩 Good compliance

---

## Code Quality Observations

Identify:

* Over-complex logic
* Tight coupling
* Hardcoded tokens
* Repeated patterns
* Missing abstraction
* Performance risks

---

# 4️⃣ Design Consistency Audit

Evaluate component implementations against documented design system tokens and architecture.

Identify:

* 🟥 Components not using design tokens
* 🟧 Inconsistent props or API naming patterns
* 🟨 Duplicate or overlapping components
* 🟩 Missing essential variants or states

For each issue include:

| Component | Issue | Severity | Evidence | Impact |

Explain architectural impact clearly.

---

# 5️⃣ Component Reusability Analysis

Analyze usage patterns across:

* `src/pages/`
* `src/features/`
* Other components

Classify components:

* Highly reusable (10+ usages)
* Moderately reusable (3–9)
* Low reuse (1–2)
* Not reused
* Overloaded components (excess responsibility)

Include:

| Component | Usage Count | Reusability Level | Observations |

Include architectural insights such as:

* Premature abstraction
* Missing abstraction
* Over-fragmentation
* Tight feature coupling

---

# 📄 Required Output Structure

The final document must contain:

1. Executive Summary
2. Component Inventory
3. Design System Documentation
4. Component Documentation (Grouped by Category)
5. Design Consistency Audit
6. Reusability Assessment
7. Improvement Recommendations (High-Level Only)

---

# 🧭 Executive Summary Must Include

* Overall maturity level of component library
* Design system coherence level
* Reusability maturity
* Accessibility maturity
* Key structural risks
* Scalability readiness assessment

Keep summary concise but strategic.

---

# 📏 Formatting & Style Rules

* Use structured Markdown
* Use tables wherever useful
* Use Mermaid or ASCII diagrams if helpful
* Maintain neutral, technical tone
* Avoid speculative statements
* Avoid implementation-level instructions
* Do not repeat architectural details already documented unless relevant

---

# 🧠 Quality Standards

The audit must:

* Be exhaustive but structured
* Prefer measurable metrics
* Distinguish facts vs interpretation
* Highlight risk severity clearly
* Support onboarding and governance
* Serve as a long-term architectural reference

