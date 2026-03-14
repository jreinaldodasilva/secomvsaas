Here is the fully expanded and consolidated version of your prompt, now including:

`docs/backend/06-Secom-Authorization-RBAC.md`

---

# Improved Prompt

Carefully review the following roadmap documents:

* `docs/backendroadmaps/04-Secom-Auth-Security-Improvement-Roadmap.md`
* `docs/backendroadmaps/04-Secom-Auth-Security-Quick-Wins.md`

Your objectives are to:

1. Update the following documentation files so they accurately reflect all **implemented authentication, authorization, and security fixes and improvements**:

   * `docs/backend/04-Secom-Auth-Security-Overview.md`
   * `docs/backend/05-Secom-Auth-Implementation.md`
   * `docs/backend/06-Secom-Authorization-RBAC.md`
   * `docs/backend/07-Secom-Data-Protection.md`
   * `docs/backend/08-Secom-Security-Hardening.md`

2. Create a new roadmap document defining the **remaining unimplemented authentication, authorization, and security issues**, including a structured and prioritized execution plan.

---

# Phase 1 – Update Auth, Authorization & Security Documentation

## Step 1 – Analyze the Roadmaps

Identify which improvements and Quick Wins have been:

* ✅ Completed
* 🟡 Partially implemented
* ❌ Not implemented

Extract changes affecting:

### Authentication

* JWT structure and claims
* Token lifecycle (access, refresh, rotation, revocation)
* Session handling (if applicable)
* Password policies and hashing
* MFA (if applicable)
* Login, logout, refresh flows

### Authorization (RBAC)

* Role definitions
* Permission model
* Role-permission mapping
* Enforcement mechanisms (guards, middleware, decorators)
* Hierarchical roles (if applicable)
* Multi-tenant role scoping (if applicable)
* Policy enforcement consistency across modules

### Data Protection

* Encryption at rest
* Encryption in transit
* Sensitive field handling
* Hashing algorithms
* Data retention policies
* Data anonymization strategies
* Privacy compliance considerations

### Security Hardening

* CORS configuration
* Rate limiting
* Security headers
* Input validation and sanitization
* Dependency security
* Secrets management
* Logging and audit trails
* Production hardening measures

---

# Step 2 – Update Each Documentation File

---

## 1️⃣ `04-Secom-Auth-Security-Overview.md`

* Reflect the current high-level security architecture.
* Update conceptual diagrams or flow explanations.
* Remove outdated assumptions.
* Ensure this file serves as the **authoritative security architecture reference**.

---

## 2️⃣ `05-Secom-Auth-Implementation.md`

* Align authentication flows with current implementation.
* Update token structure and lifecycle handling.
* Reflect current middleware and guard logic.
* Ensure code examples (if any) match actual behavior.

---

## 3️⃣ `06-Secom-Authorization-RBAC.md`

* Update role definitions and permission mappings.
* Reflect implemented RBAC enforcement patterns.
* Align documentation with actual guard/middleware logic.
* Remove outdated role assumptions.
* Ensure consistency between RBAC documentation and API enforcement.
* Clearly document:

  * Role hierarchy (if any)
  * Permission naming conventions
  * Scope handling (global vs tenant-level)
  * Extension strategy for future roles

This file must act as the **authoritative RBAC reference**.

---

## 4️⃣ `07-Secom-Data-Protection.md`

* Reflect current encryption practices.
* Update sensitive field handling.
* Confirm hashing strategies.
* Align with implemented retention or anonymization mechanisms.
* Remove unimplemented compliance claims.

---

## 5️⃣ `08-Secom-Security-Hardening.md`

* Reflect implemented hardening controls.
* Update rate limiting, CORS, validation, and headers.
* Remove outdated mitigation notes.
* Ensure production security posture is accurately described.

---

# Documentation Requirements

* Reflect only implemented changes.
* Do not duplicate roadmap content.
* Remove contradictions across files.
* Ensure cross-document consistency.
* Preserve structure unless restructuring improves clarity.
* Ensure alignment with:

  * Backend Architecture
  * MongoDB Architecture
  * API Design documentation

---

# Phase 2 – Create Remaining Auth, RBAC & Security Roadmap

Create a new roadmap file, for example:

`docs/backendroadmaps/04-Secom-Auth-Security-Remaining-Roadmap.md`

Obs: Consider splitting the document into multiple files due to its size. For example, create files such as 'docs/backendroadmaps/04-Secom-Auth-Security-Remaining-Roadmap.md-Part1.md', 'docs/backendroadmaps/04-Secom-Auth-Security-Remaining-Roadmap.md-Part2.md', and so on.

---

## The new roadmap must include:

### 1. Remaining Items Grouped by Domain

* Authentication Mechanisms
* Token Lifecycle & Revocation
* RBAC & Authorization Model
* Data Protection & Encryption
* API Security & Middleware
* Infrastructure & Deployment Security
* Monitoring & Audit Logging
* Dependency & Supply Chain Security
* Compliance & Privacy
* Production Hardening

---

### 2. Prioritization

Each item must be categorized:

* 🔥 Critical
* ⚠️ High Priority
* 📌 Medium Priority
* 🧩 Nice to Have

---

### 3. Required Implementation Strategy Per Item

For every remaining issue include:

* Problem Description
* Current State
* Target State
* Security Risk or Threat Being Mitigated
* Proposed Technical Solution
* Breaking Change Risk (Yes/No)
* Migration Strategy (if required)
* Backward Compatibility Considerations
* Estimated Complexity (Low / Medium / High)
* Security Impact Level (Low / Medium / High / Critical)
* Dependencies

---

### 4. Phased Execution Plan

Organize into:

* Immediate Security Fixes (Critical)
* Quick Wins
* Structural Authorization Improvements
* Hardening & Compliance Phase
* Long-Term Security Maturity Improvements

---

# Constraints

* Do not modify existing roadmap files.
* Do not use scripts or shell commands.
* Do not introduce undocumented security features.
* Base updates strictly on implemented roadmap items.
* Ensure consistency across all backend documentation.
* Explicitly flag documentation vs implementation inconsistencies.

---

# Expected Output

After completing both phases, provide:

1. Summary of updates made to each of the five documentation files
2. Sections added, modified, or removed (per file)
3. List of roadmap items reflected as completed
4. Structured summary of the new Remaining Roadmap
5. Identified security and RBAC gaps
6. Identified architectural inconsistencies
7. Risk assessment summary (highlighting any Critical gaps)
