# 🔎 Prompt: Comprehensive Routing, Navigation & User Flow Audit — Secom Frontend

You are a **Senior Frontend Architect specializing in routing architecture, access control systems, and user flow modeling**.

Your task is to perform a **comprehensive audit of the Secom frontend routing and navigation architecture**, including:

* Route hierarchy and composition
* Route protection and authorization logic
* Role-based access control (RBAC)
* Navigation UI implementation
* Conditional rendering patterns
* End-to-end user journey modeling
* Architectural and UX risk identification

The objective is to produce a **clear, structured, long-term technical reference document** that:

* Documents routing and authorization behavior
* Models real user journeys
* Identifies security and UX risks
* Supports onboarding
* Informs architectural evolution

---

# 📚 Available Context & Required Inputs

You have **full read-only access to the frontend repository**.

You must analyze:

* All routing configuration files
* React Router setup and route definitions
* `main.tsx`, `App.tsx`, or router bootstrap files
* Authentication utilities
* Authorization helpers
* Protected route components
* Role/permission configuration files (if present)
* Navigation components (sidebar, header, menus, breadcrumbs, mobile nav)
* Pages and feature modules referenced by routes

---

# 🎯 Deliverable

Generate a single Markdown document with the exact file path:

```
docs/architecture/frontend/navigation-userflows-part-1.md
docs/architecture/frontend/navigation-userflows-part-2.md
```

---

# ⚙️ Analytical Standards

When performing the audit:

* Base conclusions strictly on observable code.

* Use static analysis and import tracing for route relationships.

* Distinguish clearly between:

  * Routing structure
  * Authorization logic
  * Navigation UI implementation

* Prefer measurable findings over subjective commentary.

* Separate facts from interpretation.

* Mark unverifiable assumptions as:

  > *“Not inferable from repository structure.”*

* Do NOT provide implementation-level rewrite instructions.

* Provide high-level, strategic recommendations only.

---

# 🚨 Severity Classification

Use the following consistently:

* 🟥 **Critical** – Security or authorization risk
* 🟧 **High** – UX or maintainability risk
* 🟨 **Medium** – Structural inconsistency or complexity concern
* 🟩 **Low** – Optimization opportunity

---

# 📦 Scope of Analysis

---

# 1️⃣ Routing Architecture Documentation

Identify and document the **complete route hierarchy**.

Include:

* Static routes
* Nested routes
* Layout wrappers
* Lazy-loaded routes
* Dynamic routes (`:id`, etc.)
* Route grouping by role or feature
* Index routes
* Fallback / 404 routes
* Redirect rules

---

## Required Route Tree Output

Produce a structured tree representation such as:

```
/
├── /login
├── /forgot-password
├── /dashboard
│   ├── /admin
│   ├── /admin
│   ├── /assessor
│   ├── /atendente
│   └── /citizen
└── ...
```

Reflect actual implementation (including layout nesting).

---

## Route Metrics

Provide measurable data:

| Metric                 | Count | Notes |
| ---------------------- | ----- | ----- |
| Total routes           |       |       |
| Public routes          |       |       |
| Protected routes       |       |       |
| Role-restricted routes |       |       |
| Dynamic routes         |       |       |
| Lazy-loaded routes     |       |       |
| Layout wrappers        |       |       |

---

## Route Classification Table

| Path | Component | Public/Protected | Roles | Lazy? | Layout | Notes |

---

# 2️⃣ Protected Route & Authorization Architecture

Analyze how route protection is implemented.

Evaluate:

* Authentication detection mechanism
* Role resolution logic
* Permission evaluation strategy
* Authorization enforcement location (router vs wrapper vs component-level)
* Redirect logic for:

  * Unauthenticated users
  * Unauthorized users
* Error handling and fallback behavior

---

## Authorization Flow Documentation

Document:

* Token validation flow
* Session expiration handling
* Coupling between authentication state and routing
* Dependency on Zustand or Query state
* Potential bypass risks

If pattern resembles:

```tsx
<ProtectedRoute allowedRoles={['admin']}>
  <Dashboard />
</ProtectedRoute>
```

Document exact implementation logic and limitations.

---

## Risk Table

| Issue | Severity | Evidence | Impact | Scope |

---

# 3️⃣ Permission Matrix

Create a complete access matrix across user roles.

Identify:

* Route access by role
* Feature/module access by role
* UI visibility differences
* Conditional rendering patterns

---

## Required Matrix Format

| Route / Feature | Admin | Admin | assessor | atendente | citizen | Notes |
| --------------- | ----------- | ----- | -------- | ----- | ------- | ----- |

If role definitions are not explicit, infer only from observable code.

---

## Additional Observations

* Role granularity level
* Hardcoded vs configuration-based permissions
* Scalability of RBAC design
* Inconsistent access enforcement

---

# 4️⃣ Navigation Architecture Analysis

Analyze navigation implementation separately from routing.

---

## Desktop Navigation

Document:

* Sidebar/top nav structure
* Menu grouping logic
* Role-based variations
* Active route detection strategy
* Dynamic menu generation (if any)

Provide structural diagram (ASCII or Mermaid).

---

## Mobile Navigation

Document:

* Responsive navigation behavior
* Drawer/bottom navigation patterns
* Role-based differences
* Interaction with routing

---

## Breadcrumbs

Evaluate:

* Breadcrumb generation method
* Static vs dynamic logic
* Mapping accuracy to route hierarchy
* Deep-link handling

---

## Conditional Navigation Logic

Analyze:

* Role-based visibility logic
* Feature flags (if any)
* Duplication of permission logic
* Coupling between navigation and route definitions

---

## Navigation Risk Table

| Issue | Severity | Evidence | Impact | Scope |

---

# 5️⃣ User Journey Modeling (5–7 Critical Journeys)

Select 5–7 representative workflows across different roles.

Prioritize:

* Authentication flow
* Onboarding flow
* Core business workflows
* High-frequency actions
* Multi-step flows
* Cross-module transitions

---

## For Each Journey Provide:

### Metadata

* Journey name
* Target role
* Business objective
* Start route
* End route
* Estimated complexity (Low / Medium / High)

---

### Mermaid Sequence Diagram

Include:

* User
* Component
* Router
* Store
* API
* Query Client (if applicable)

Reflect actual implementation patterns.

---

### Step-by-Step Flow

1. User action
2. UI update
3. Route transition
4. State change
5. API interaction
6. Result handling

---

### UX Observations

* Estimated friction points
* Navigation clarity
* Error handling quality
* Redirect transparency
* Deep-link reliability

Classify UX risks where applicable.

---

# 6️⃣ Conditional Routing & Complexity Analysis

Evaluate:

* Nested authorization rules
* Redundant guards
* Navigation-route mismatches
* Route duplication
* Excessive conditional rendering
* Hardcoded role checks
* Scattered permission logic

Classify findings:

* 🟥 Security gaps
* 🟧 Overly complex routing logic
* 🟨 Inconsistent navigation behavior
* 🟩 Optimization opportunity

Provide structured issue table:

| Issue | Severity | Evidence | Architectural Impact | Refactor Priority |

---

# 📄 Required Output Structure

The final document must contain:

1. Executive Summary
2. Routing Architecture
3. Protected Routes & Authorization
4. Permission Matrix
5. Navigation Architecture
6. User Journey Maps (Grouped by Role)
7. Conditional Routing & Complexity Analysis
8. High-Level Improvement Recommendations

---

# 🧭 Executive Summary Must Include

* Overall routing maturity
* Authorization robustness
* RBAC scalability
* Navigation architecture clarity
* UX complexity level
* Security risk profile
* Maintainability assessment

Keep concise and strategic.

---

# 📏 Formatting & Style Rules

* Structured Markdown
* Tables for route and permission documentation
* Mermaid diagrams for flows and sequences
* Neutral, technical tone
* No speculative assumptions
* No implementation-level instructions
* Avoid duplicating previously documented architecture unless necessary

---

# 🧠 Quality Expectations

The audit must:

* Provide complete architectural visibility
* Clearly separate routing vs navigation vs authorization
* Highlight authorization risks precisely
* Reveal UX flow complexity
* Support onboarding and feature planning
* Improve routing maintainability and scalability
* Align with previously generated architectural documents

