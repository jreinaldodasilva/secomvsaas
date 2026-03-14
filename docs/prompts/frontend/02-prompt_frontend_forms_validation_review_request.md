# 🔎 Prompt: Comprehensive Forms, Validation & User Input Audit — Sintgesp Frontend

You are a **Senior Frontend Architect and UX Systems Auditor specializing in form architecture, validation systems, accessibility, and data-entry optimization**.

Your task is to perform a **comprehensive audit of all forms, input components, validation strategies, and data-entry UX patterns** in the Sintgesp frontend.

The objective is to:

* Document the complete form ecosystem
* Evaluate technical validation correctness
* Assess accessibility and localization (Portuguese)
* Analyze desktop and mobile data-entry UX
* Identify usability bottlenecks and data-risk patterns
* Provide high-level architectural and UX improvement themes

This document should serve as a **long-term technical and UX reference** to support:

* Onboarding
* Refactoring
* Design system evolution
* Product usability improvements

---

# 📚 Available Context & Required Inputs

You have **full read-only access to the frontend repository**.

You must analyze:

* All form pages and modal forms
* All reusable input components
* Validation schemas and utilities
* Custom form hooks
* Styling files impacting forms
* Mobile/responsive styling rules

# 🎯 Deliverable

Generate a single Markdown document with the exact file path:

```
docs/frontend/02-Sintgesp-Forms-Validation-Overview-Part1.md
docs/frontend/02-Sintgesp-Forms-Validation-Overview-Part2.md
```

---

# ⚙️ Analytical Standards

When performing the audit:

* Base conclusions strictly on observable code.

* Distinguish between:

  * Technical correctness
  * UX quality
  * Accessibility compliance

* Evaluate both:

  * Happy paths
  * Error and edge cases

* Prefer measurable findings (field counts, LOC, validation rule density).

* Clearly separate facts from interpretation.

* Mark unverifiable assumptions as:

  > *“Not inferable from repository structure.”*

* Do NOT provide step-by-step implementation instructions.

* Provide high-level, strategic recommendations only.

---

# 🚨 Severity Classification

Use consistently:

* 🟥 **Critical** – Prevents task completion or risks incorrect data submission
* 🟧 **High** – Strong UX friction or accessibility barrier
* 🟨 **Medium** – Clarity, consistency, or efficiency issue
* 🟩 **Low** – Optimization or UX polish opportunity

---

# 📦 Scope of Analysis

---

# 1️⃣ Form Inventory

Identify and catalog **all user-facing forms** across:

* Pages
* Feature modules
* Modals
* Inline editing components
* Search and filter forms

---

## Required Table

| Form Name | Location | Role(s) | Field Count | Validation Strategy | Multi-Step | Dynamic Fields | Primary Issues |

Also document:

* Total number of forms
* Average number of fields per form
* Most complex forms (by field count or logic density)
* Forms with cross-field validation
* Forms with conditional role-based fields

---

## Observations

Include:

* Form architecture maturity
* Standardization level
* Consistency across modules

---

# 2️⃣ Input Component Library Audit

Catalog all reusable input and form-related components from:

```
src/components/
```

Cross-reference with Component Library documentation.

---

## Required Table

| Component | Input Type | Variants | Validation Support | Accessibility Level | Localization | Issues |

Evaluate:

* Support for:

  * Default
  * Error
  * Disabled
  * Loading
* Controlled vs uncontrolled patterns
* Integration with validation library
* Keyboard support
* Screen reader compatibility
* Label association (`htmlFor`)
* ARIA attributes
* Error message semantics
* Token usage consistency

Classify accessibility:

* 🟥 Major accessibility gaps
* 🟧 Partial compliance
* 🟩 Good compliance

---

# 3️⃣ Critical Forms Deep Dive (3–5 Key Forms)

Select 3–5 high-impact forms such as:

* Athlete registration
* Appointment creation
* User management
* Profile editing
* Authentication

Selection criteria:

* Highest complexity
* Highest frequency
* Multi-step logic
* Cross-role variation

---

## For Each Form Include:

### Metadata

* Form name
* Target role(s)
* Business objective
* Entry route
* Exit route
* Approximate LOC

---

### Field Breakdown

Group fields logically and document:

| Field | Type | Required | Default | Validation | Conditional? |

Include:

* Mask usage (CPF, phone, CEP)
* Input optimization for mobile (inputMode, type)
* Derived fields

---

### Validation Review

Analyze:

* Library used (Yup, Zod, custom, etc.)
* Schema reuse
* Cross-field validation
* Async validation
* Trigger timing (onChange, onBlur, onSubmit)
* Server error mapping

---

### UX Evaluation

Assess:

* Cognitive load
* Field grouping logic
* Visual hierarchy
* Placeholder clarity
* Inline guidance
* Error recovery flow
* Submission feedback timing

Use structured indicators:

* ✅ Strength
* ⚠️ Friction
* ❌ Blocking issue

---

### Mobile Experience Review

Evaluate:

* Responsive layout behavior
* Keyboard type optimization
* Scroll and focus management
* Touch target sizes
* Sticky buttons or fixed CTAs
* Autofill support

Classify mobile usability issues using severity indicators.

---

# 4️⃣ Validation Architecture & Pattern Analysis

Document the overall validation ecosystem.

Analyze:

* Validation library usage
* Centralized vs scattered schemas
* Schema reuse consistency
* Duplication of validation logic
* Field-level vs form-level validation
* Server validation integration
* Error normalization layer (if present)

---

## Message Quality Review (Portuguese)

Evaluate validation messages for:

* Localization completeness
* Language consistency
* Tone (professional vs technical)
* Actionability
* Avoidance of developer jargon

---

## Required Table

| Issue | Severity | Example | Impact | Scope |

Classify:

* 🟥 English-only messages
* 🟧 Technical wording
* 🟨 Vague or generic messages
* 🟩 Opportunity for clarity improvement

---

# 5️⃣ Form UX & Data Entry Architecture Evaluation

Evaluate macro-level UX patterns:

* Field grouping quality
* Use of sections or cards
* Multi-step vs single-page trade-offs
* Progressive disclosure
* Smart defaults
* Autofill or prefill support
* Autosave/draft behavior
* Error summary vs inline feedback
* Duplicate field logic across forms

Identify:

* Redundant field definitions
* Overloaded forms
* Role-based dynamic complexity
* Inconsistent layout patterns

---

## Data Entry Risk Analysis

Identify risks such as:

* Data loss on navigation
* Missing confirmation dialogs
* Lack of input constraints
* Inconsistent formatting
* Masking inconsistencies
* Accessibility blocking patterns

Provide structured issue table:

| Issue | Severity | Evidence | UX Impact | Business Risk |

---

# 6️⃣ Mobile Form Experience Overview

Provide a consolidated mobile UX analysis:

* Most mobile-friendly forms
* Most problematic forms
* Layout density issues
* Touch optimization gaps
* Performance considerations
* Scroll fatigue risk

---

# 📄 Required Output Structure

The final document must contain:

1. Executive Summary
2. Form Inventory
3. Input Component Library
4. Critical Forms Deep Dive
5. Validation Architecture & Patterns
6. Mobile Form Experience
7. Form UX & Data Entry Analysis
8. High-Level Improvement Recommendations

---

# 🧭 Executive Summary Must Include

* Overall form ecosystem maturity
* Validation robustness
* Accessibility level
* Localization completeness
* Mobile readiness
* Data-entry risk profile
* Scalability readiness

Keep concise but strategic.

---

# 📏 Formatting & Style Requirements

* Structured Markdown
* Tables for inventories and comparisons
* Bullet points for UX findings
* Clear separation of facts vs interpretation
* Neutral, analytical tone
* No speculative assumptions
* No implementation-level instructions
* Align with previously documented architecture

---

# 🧠 Quality Expectations

The audit must:

* Reveal usability bottlenecks and error risks
* Highlight accessibility and localization gaps
* Identify architectural validation inconsistencies
* Support UX, frontend, and product decision-making
* Improve long-term form scalability and maintainability
* Integrate coherently with previously generated architectural documents

