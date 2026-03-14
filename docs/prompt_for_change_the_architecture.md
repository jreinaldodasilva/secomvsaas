# Prompt for Claude / Amazon Q Developer

## Role

You are a principal software architect and large-scale codebase refactoring expert.

Your task is to analyze an existing multi-tenant Vertical SaaS boilerplate repository named `vsaas` and transform it into an architecture that supports two independent commercial products that can be distributed and sold separately.

The original repository (`vsaas`) must remain untouched as a backup. New repositories must be created from it.

The architecture must introduce a shared core repository containing reusable logic, while the two final products remain independent repositories.

This prompt is intentionally domain-agnostic. The system may represent any type of business application.

---

# Objective

Transform the original repository into the following ecosystem:

* `vsaas` (original repository kept as backup)
* `vsaas-core`
* `vsaas-saas-platform`
* `vsaas-app-boilerplate`

Repository purposes:

`vsaas-core`

A shared repository containing reusable modules used by both products.

`vsaas-saas-platform`

A multi-tenant SaaS platform boilerplate.

`vsaas-app-boilerplate`

A single-tenant business application boilerplate intended for one organization installation.

Goals of the transformation:

* avoid code duplication
* allow both products to evolve independently
* maintain a clean and maintainable architecture

---

# Repository Creation Process

Assume the current repository is named `vsaas`. This repository must remain unchanged and serve as the reference and backup.

## Step 1 — Create New Repositories

Create three new empty repositories:

* `vsaas-core`
* `vsaas-saas-platform`
* `vsaas-app-boilerplate`

## Step 2 — Create the SaaS Platform Repository

Clone the original repository and create the SaaS platform repository from it.

Commands:

```
git clone git@github.com:ORG/vsaas.git vsaas-saas-platform
cd vsaas-saas-platform

git remote remove origin

git remote add origin git@github.com:ORG/vsaas-saas-platform.git

git push -u origin main
```

This repository becomes the multi-tenant SaaS platform product.

## Step 3 — Create the Single-Tenant Repository

Clone the original repository again to generate the single-tenant product.

```
git clone git@github.com:ORG/vsaas.git vsaas-app-boilerplate
cd vsaas-app-boilerplate

git remote remove origin

git remote add origin git@github.com:ORG/vsaas-app-boilerplate.git

git push -u origin main
```

This repository will later have all multi-tenant logic removed.

## Step 4 — Create the Shared Core Repository

Initialize the core repository.

```
git clone git@github.com:ORG/vsaas-core.git
```

The core repository must contain only reusable logic that is independent of deployment model.

## Step 5 — Link the Core Repository

Both product repositories must consume the shared core.

Recommended method: Git submodules.

Example:

```
cd vsaas-saas-platform

git submodule add git@github.com:ORG/vsaas-core.git core

cd ../vsaas-app-boilerplate

git submodule add git@github.com:ORG/vsaas-core.git core
```

---

# Key Architectural Principles

## Separation Between Domain Logic and Platform Logic

Two categories of logic must be separated during refactoring.

### Domain Logic

Reusable application logic that represents the core business behavior of the system.

This logic must be extracted into the `vsaas-core` repository.

Rules:

* must not depend on tenant context
* must not depend on organization isolation
* must not depend on SaaS subscription logic

### Platform Logic

Deployment-specific infrastructure and platform behavior.

This logic must remain only inside the SaaS repository.

Examples of platform concerns include:

* multi-tenancy
* organization or workspace management
* subscription management
* tenant provisioning
* platform administration

---

# Core Repository Requirements

The core repository must contain only reusable and deployment-independent modules.

Rules:

* no multi-tenant concepts
* no SaaS billing logic
* no platform administration logic
* must be usable by both products

---

# SaaS Platform Repository Requirements

The SaaS repository contains platform-level functionality required to operate a multi-tenant SaaS product.

Responsibilities include:

* tenant isolation
* organization management
* subscription handling
* onboarding and provisioning
* platform administration

It must import reusable modules from `vsaas-core`.

---

# Single-Tenant Repository Requirements

The single-tenant repository contains a simplified application intended for deployment for a single organization.

Rules:

* no multi-tenant logic
* no subscription logic
* no tenant provisioning

The system assumes one organization instance only.

---

# Multi-Tenant Removal Requirements

Inside the single-tenant repository remove elements related to tenancy such as:

* tenant identifiers
* organization identifiers
* workspace identifiers

Also remove database tables and logic related to:

* tenants
* organizations
* workspaces
* subscriptions

Queries must no longer filter by tenant.

---

# Authorization Simplification

Replace SaaS platform role models with a simplified authorization model appropriate for a single organization.

Remove platform-specific roles and keep only roles required for application-level access control.

---

# Expected Deliverables

Provide the following outputs.

1. Architecture Overview

Explain the new architecture and how the repositories interact.

2. Repository Design

Describe the responsibilities of `vsaas-core`, `vsaas-saas-platform`, and `vsaas-app-boilerplate`.

3. Module Extraction Plan

Identify which modules must be moved into the core repository.

4. SaaS Refactor Plan

Explain what logic remains in the SaaS repository.

5. Single-Tenant Refactor Plan

Explain how to remove multi-tenant logic from the single-tenant application.

6. Database Changes

Describe how the schema must be simplified for the single-tenant version.

7. Code Transformation Examples

Provide examples such as removing tenant filters, removing tenant middleware, and simplifying authentication.

8. Migration Steps

Provide a step-by-step plan to migrate from the original `vsaas` repository to the new architecture.

9. Long-Term Maintenance Strategy

Explain how both products can evolve independently while sharing the core repository.

---

# Constraints

* Do not break existing domain logic.
* Avoid duplicated modules between repositories.
* Keep the architecture framework-agnostic whenever possible.

---

# Final Goal

Produce a professional repository ecosystem capable of supporting two independent commercial boilerplates while sharing a reusable and maintainable core codebase.


Here's an improved version of the prompt — tightened, more precise, and structured to get better outputs from an AI or a human architect:

---

# Refactor: vsaas → Three-Repository Ecosystem

## Context

You are a principal software architect. The existing repository `vsaas` is a multi-tenant Vertical SaaS boilerplate (Express + TypeScript backend, React frontend). A full code review has already been completed. Your task is to design and execute its transformation into a three-repository ecosystem supporting two independently sellable commercial products.

**The original `vsaas` repository must not be modified.** It serves as the reference and backup.

---

## Target Architecture

```
vsaas                    ← original repo, untouched
vsaas-core               ← shared reusable modules (no deployment assumptions)
vsaas-saas-platform      ← multi-tenant SaaS product (consumes core)
vsaas-app-boilerplate    ← single-tenant app product (consumes core)
```

Both product repos link `vsaas-core` as a **Git submodule** at `./core`.

---

## Repository Responsibilities

### `vsaas-core`
Contains only logic that is **deployment-model agnostic** — usable by both products without modification. Must have zero knowledge of tenancy, subscriptions, or platform administration.

Candidate modules to extract (verify against actual code before finalizing):
- Auth system: JWT generation/verification, token blacklisting, password helpers, refresh token rotation
- RBAC engine: permission definitions, role-permission registry, `hasPermission` / `hasAnyPermission` helpers
- Base model abstractions: `baseSchemaFields`, `baseSchemaOptions`, `authMixin`, `auditableMixin`, `BaseService<T>`
- Middleware utilities: `errorHandler`, `rateLimiter` factory, `idempotency`, `pagination`, `normalizeResponse`, `auditLogger`, `validate`
- Shared infrastructure: `CacheService`, `emailService`, `queueService`, `emailQueue`
- Utilities: `logSanitizer`, `masking`, `dateSerializer`, `responseHelpers`, `errorCodes`, `healthChecks`
- Shared types: the entire `@vsaas/types` package
- Config primitives: `logger`, `monitoring` (Sentry init), `database`, `redis`

**Extraction rule:** if a module references `tenantId`, `organizationId`, or any subscription concept, it must either be cleaned before extraction or remain in the product repo.

### `vsaas-saas-platform`
Starts as a direct clone of `vsaas`. Retains everything, then imports shared modules from `./core` replacing local copies. Adds:
- Tenant model, tenant middleware, tenant provisioning
- Organization/workspace management
- Subscription handling (Stripe integration)
- Platform administration (super_admin flows)
- Multi-tenant query scoping (`tenant` field filters)

### `vsaas-app-boilerplate`
Starts as a direct clone of `vsaas`. Removes all multi-tenant and subscription logic, then imports shared modules from `./core`. The result is a clean single-organization deployment.

---

## Deliverables

Produce each of the following. Be specific and reference actual files and code from the `vsaas` repo where relevant.

### 1. Repository Setup Commands
Exact shell commands to:
- Create `vsaas-core`, `vsaas-saas-platform`, `vsaas-app-boilerplate` from `vsaas`
- Wire `vsaas-core` as a Git submodule in both product repos
- Set up npm workspace or package resolution so both products can `import from './core/...'`

### 2. `vsaas-core` Extraction Plan
For each module being extracted:
- Source path in `vsaas`
- Destination path in `vsaas-core`
- Any changes required before it is safe to extract (e.g. removing `tenantId` references)
- How it will be imported by each product repo

### 3. `vsaas-saas-platform` Refactor Plan
- Which files are deleted (replaced by core imports)
- Which files are modified (to import from `./core` instead of local paths)
- What new platform-level files must be created
- How `tenantScopedMixin` and `ensureTenantAccess` are wired into the platform layer

### 4. `vsaas-app-boilerplate` Simplification Plan

#### Backend removals — identify exact files/lines:
- Remove `tenantScopedMixin` and all `tenant` field references
- Remove `ensureTenantAccess` middleware and all call sites
- Remove `tenantId` from `TokenPayload`, `AuthUser`, `User` model, and JWT claims
- Remove `tenantId` from `BaseService.tenantFilter()` — replace with unconditional queries
- Remove the `PORTAL_JWT_SECRET` / portal auth system entirely if unused
- Remove Stripe integration (`stripe` package, webhook routes, subscription logic)

#### Auth simplification:
- Keep roles: `admin`, `manager`, `staff`
- Remove: `super_admin` role, `PORTAL_JWT_SECRET`, portal refresh token fields
- Simplify `authorize()` — no tenant check, no portal bypass

#### Database schema changes:
- Remove `tenant` field from all models
- Remove `tenant`-scoped compound indexes
- Update `BaseService<T>` — remove `tenantFilter()`, simplify all query methods

#### Frontend removals:
- Remove `tenantId` from `User` type and `AuthContext`
- Remove any tenant-aware routing or tenant context providers

### 5. Concrete Code Transformation Examples
Provide before/after diffs for:
- `BaseService<T>` — removing `tenantFilter` and the `tenantId` parameter from all methods
- `authenticate` middleware — removing `tenantId` attachment and `ensureTenantAccess`
- `TokenPayload` — removing `tenantId` field
- `User` model — removing `tenant` field and its index
- `env.ts` — removing `PORTAL_JWT_SECRET` and portal token config
- `authService.login()` — removing `tenantId` from the JWT payload

### 6. `vsaas-core` Internal Structure
Propose the directory layout for `vsaas-core`. Include:
- `package.json` configuration (name, exports, how it resolves as a local dependency)
- Whether it ships TypeScript source or compiled output
- How both product repos reference it (submodule path alias in `tsconfig.json` and `vite.config.ts`)

### 7. Long-Term Maintenance Strategy
Address specifically:
- How a bug fix in a shared module in `vsaas-core` propagates to both products
- How to handle a breaking change in `vsaas-core` that only one product needs
- Versioning strategy for `vsaas-core` (tags vs. branch pinning)
- When it makes sense to graduate `vsaas-core` from a submodule to a published npm package

---

## Constraints

- Do not break existing domain logic in either product
- `vsaas-core` must have no runtime dependencies on `vsaas-saas-platform` or `vsaas-app-boilerplate`
- Prefer TypeScript path aliases over relative `../../../core` imports
- The solution must work with the existing stack: Express, Mongoose, React, Vite, TypeScript

---

## Input

The complete `vsaas` codebase has been provided. All file paths, module names, and implementation details referenced in the deliverables must reflect the actual code — not hypothetical examples.
