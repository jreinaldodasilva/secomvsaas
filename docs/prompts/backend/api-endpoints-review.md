# Secom API Endpoints & Design Review

## Comprehensive API Architecture & Design Audit

You are a **Senior Backend Architect performing a production-grade API audit** of the Secom system.

**Project Context**: Secom is a communication management system for the Secretaria de Comunicação, built on the vSaaS boilerplate. The backend is a modular monolith with domain-driven organization.

**Verified Stack** (from codebase):
- **Runtime**: Node.js + TypeScript + Express
- **Database**: MongoDB + Mongoose
- **Cache / Queue**: Redis + BullMQ (`emailQueue`, `webhookQueue`, `domainEventsQueue`, `auditCleanupQueue`)
- **Auth**: JWT via `secom_access_token` httpOnly cookie
- **API prefix**: `/api/v1/`

**Verified Roles** (from `backend/src/config/rbac/roles.ts`):
- `super_admin` — full platform access (bypasses all permission checks)
- `admin` — full tenant access
- `assessor` — press releases, media contacts, clippings, events
- `social_media` — social media, press releases (read), events (read), clippings (read)
- `atendente` — appointments, citizen portal, events (read)
- `citizen` — appointments (own), citizen portal (read), events (read)

**Verified Permissions** (from `backend/src/config/rbac/permissions.ts`):
- `press-releases:read/write/delete`
- `media-contacts:read/write/delete`
- `clippings:read/write/delete`
- `events:read/write/delete`
- `appointments:read/write/delete`
- `citizen-portal:read/write/delete`
- `social-media:read/write/delete`
- `users:read/write/delete`
- `settings:read/write`
- `audit:read`
- `reports:read/write`
- `tenants:read/write/delete`

**Verified API Routes** (from `backend/src/routes/v1/index.ts`):

Platform routes:
- `/api/v1/auth`
- `/api/v1/citizen-auth`
- `/api/v1/health`
- `/api/v1/tenants`
- `/api/v1/users`
- `/api/v1/uploads`
- `/api/v1/webhooks/subscriptions`
- `/api/v1/dashboard`

Domain module routes:
- `/api/v1/press-releases`
- `/api/v1/media-contacts`
- `/api/v1/clippings`
- `/api/v1/events`
- `/api/v1/appointments`
- `/api/v1/citizen-portal`
- `/api/v1/social-media`

Use the following documents as your primary sources of truth:

* `docs/architecture/backend/overview-part-1.md`
* `docs/architecture/backend/overview-part-2.md`
* `docs/architecture/backend/overview-part-3.md`
* `docs/roadmaps/backend/architecture-improvement.md`
* `docs/roadmaps/backend/quick-wins.md`

If information is missing:

* Explicitly state assumptions
* Identify documentation gaps
* Flag architectural risks
* Do NOT invent endpoints or behavior without stating assumptions

---

## Audit Objectives

Produce a **deep architectural analysis** of the API layer focusing on:

1. API surface completeness for all Secom modules
2. REST design quality and consistency
3. Consistency & predictability across modules
4. Scalability patterns for multi-tenancy
5. Security & data scoping for tenant isolation
6. Long-term maintainability risks
7. Developer experience and API usability

This is not a superficial checklist review — it is an engineering audit.

---

## Required Output File

```
docs/architecture/backend/api-design.md
```

Note: Consider splitting the document into multiple files due to its size. For example, create files such as `docs/architecture/backend/api-design-part-1.md`, `docs/architecture/backend/api-design-part-2.md`, and so on.

---

## Required Sections

1. Executive Summary
2. API Overview (platform + domain routes)
3. Complete API Endpoint Inventory (organized by module)
4. RESTful Design Evaluation
5. Request & Response Pattern Analysis
6. Pagination, Filtering & Sorting Architecture
7. API Versioning Strategy
8. Multi-Tenancy & Security Boundary Review
9. Rate Limiting & Abuse Protection
10. API Documentation Quality (Swagger/OpenAPI)
11. Architectural Risk Matrix
12. Scoring Summary

---

## Secom-Specific Analysis Points

When analyzing the API, pay special attention to:

* **Dual Auth System**: Staff auth (`/api/v1/auth`) vs citizen auth (`/api/v1/citizen-auth`) — how are they separated and enforced?
* **Permission-Based Route Guards**: Routes use `rolesWithPermission('press-releases:read')` pattern from `@vsaas/types` — evaluate consistency
* **super_admin bypass**: `super_admin` bypasses all permission checks in `registry.ts` — evaluate security implications
* **Module Route Completeness**: Each of the 7 domain modules should have consistent CRUD surface
* **Tenant Isolation**: How `tenantId` is enforced at the route/middleware level
* **Status Workflows**: Press release approval workflow, appointment lifecycle, social media scheduling
* **Webhook Routes**: `/api/v1/webhooks/subscriptions` — evaluate security and idempotency
* **Upload Routes**: `/api/v1/uploads` — evaluate file validation and access control

---

## Role–Permission Matrix to Verify

| Route | super_admin | admin | assessor | social_media | atendente | citizen |
|-------|-------------|-------|----------|--------------|-----------|---------|
| `/press-releases` | ✓ | ✓ | read/write | read | — | — |
| `/media-contacts` | ✓ | ✓ | read/write | — | — | — |
| `/clippings` | ✓ | ✓ | read/write | read | — | — |
| `/events` | ✓ | ✓ | read/write | read | read | read |
| `/appointments` | ✓ | ✓ | — | — | read/write | own only |
| `/citizen-portal` | ✓ | ✓ | — | — | read/write | read/own |
| `/social-media` | ✓ | ✓ | — | read/write | — | — |
| `/users` | ✓ | ✓ | — | — | — | — |
| `/tenants` | ✓ | read/write | — | — | — | — |

Verify this matrix against actual middleware enforcement in the codebase.

---

## Formatting & Style Requirements

* Use structured Markdown
* Prefer tables for inventories and comparisons
* Use diagrams where they add clarity
* Maintain a neutral, technical tone
* Avoid speculative assumptions — base findings on observable code
* Write for senior backend engineers

---

## Quality Expectations

The analysis should:

* Provide architectural clarity specific to Secom's domain
* Reveal technical and organizational risks
* Support onboarding and long-term maintenance
* Serve as a baseline for refactoring or scaling discussions
* Document how multi-tenancy, RBAC, and the dual auth system are implemented in the API
