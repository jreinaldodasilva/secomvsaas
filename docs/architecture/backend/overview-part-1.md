# Secom Backend — Architecture Overview
## Part 1: Executive Summary, Technology Stack & Project Structure

---

## 1. Executive Summary

The Secom backend is a **Node.js/TypeScript REST API** built on Express, serving as the server-side foundation for the *Sistema da Secretaria de Comunicação*. It is structured as a **modular monolith** with a clear separation between a reusable platform layer and domain-specific business modules.

The codebase demonstrates a high level of architectural maturity for a project of its size. Key strengths include a well-enforced multi-tenancy model using `AsyncLocalStorage`, a layered module structure (Controller → Service → Repository), comprehensive security middleware, and a BullMQ-backed asynchronous event system. The stack is cohesive, modern, and consistently applied across all seven domain modules.

The primary risks identified are a thin automated test suite relative to the codebase size, the absence of database transactions for multi-step write operations, a webhook delivery mechanism with no retry durability, and a few inconsistencies in how the platform and domain layers interact. None of these represent immediate blockers, but they carry operational and maintainability risk as the system scales.

**Overall assessment:** Production-ready for a single-tenant or small multi-tenant deployment. Requires targeted hardening before high-load or high-criticality multi-tenant operation.

---

## 2. Technology Stack

### 2.1 Stack Inventory

| Technology | Category | Version | Purpose | Notes |
|---|---|---|---|---|
| Node.js | Runtime | ≥ 18.0.0 | Server runtime | Required by `engines` field; uses `AsyncLocalStorage` (stable since Node 16) |
| TypeScript | Language | ^5.9.2 | Static typing | `strict: true`; ES2020 target; `commonjs` module output |
| Express | Web Framework | ^4.21.2 | HTTP server, routing, middleware | Mature, stable; no plans to migrate to v5 observed |
| Mongoose | ODM | ^8.18.0 | MongoDB object modeling | Schema mixins, pre-save hooks, index management |
| MongoDB | Database | 8.x (implied) | Primary data store | Single instance; no replica set config observed |
| Redis (ioredis) | Cache / Queue broker | ^5.7.0 | Token blacklist, rate limiting, idempotency, BullMQ broker | `lazyConnect: true`; single instance |
| BullMQ | Job Queue | ^5.58.2 | Email queue, domain events queue, audit cleanup scheduler | Three named queues; worker process is separate |
| Zod | Validation | ^3.22.4 | Request body/query validation, env schema enforcement | Used consistently at route and config layers |
| jsonwebtoken | Auth | ^9.0.2 | JWT access token signing/verification | HS256; issuer/audience claims enforced |
| bcrypt | Auth | ^6.0.0 | Password hashing | Cost factor 12; password history enforced |
| csrf-csrf | Security | ^4.0.3 | Double-submit CSRF protection | `__Host-` prefix cookie in production |
| helmet | Security | ^8.1.0 | HTTP security headers | CSP, HSTS, frameguard configured |
| express-rate-limit + rate-limit-redis | Security | ^7.5.1 / ^4.2.3 | Per-route rate limiting backed by Redis | Five distinct limiters |
| express-mongo-sanitize | Security | ^2.2.0 | NoSQL injection prevention | Replaces `$` and `.` in input |
| isomorphic-dompurify | Security | ^2.26.0 | HTML sanitization (imported, usage not observed in routes) | Dependency present; active use unconfirmed |
| otplib | Auth | ^12.0.1 | TOTP/MFA support | MFA fields present on User model; full flow not observed in routes |
| nodemailer | Email | ^6.10.1 | Email delivery | SendGrid (prod), Ethereal (dev), stream fallback |
| @aws-sdk/client-s3 | Storage | ^3.922.0 | S3 file storage | Adapter pattern; falls back to local disk in non-production |
| @sentry/node + profiling | Monitoring | ^10.20.0 | Error tracking, performance profiling | Optional; disabled if `SENTRY_DSN` is absent |
| pino + pino-http | Logging | ^9.11.0 / ^10.5.0 | Structured JSON logging | `pino-pretty` in development; log sanitization applied |
| uuid | Utility | ^13.0.0 | Request ID generation, idempotency key validation | |
| date-fns | Utility | ^4.1.0 | Date manipulation | |
| compression | Middleware | ^1.8.1 | Gzip response compression | Level 6; skippable via `x-no-compression` header |
| cookie-parser | Middleware | ^1.4.7 | Cookie parsing for auth tokens | |
| swagger-jsdoc + swagger-ui-express | API Docs | ^6.2.8 / ^5.0.1 | OpenAPI 3.0 spec generation and UI | JSDoc annotations in route files |
| migrate-mongo | Migrations | ^12.1.3 | MongoDB schema migrations | One migration file present |
| Jest + ts-jest | Testing | ^29.7.0 / ^29.4.1 | Unit and integration tests | `mongodb-memory-server` for integration tests |
| supertest | Testing | ^7.1.4 | HTTP integration testing | |
| @faker-js/faker | Testing | ^10.0.0 | Test data generation | |
| mongodb-memory-server | Testing | ^10.2.0 | In-memory MongoDB for tests | |
| ioredis-mock | Testing | ^8.9.0 | Redis mock for tests | |
| nodemon + ts-node | Dev tooling | ^3.1.10 / ^10.9.2 | Development hot-reload | |
| tsconfig-paths | Dev tooling | ^4.2.0 | Path alias resolution (`@vsaas/types`) | |
| ESLint + @typescript-eslint | Linting | ^8.57.1 / ^6.21.0 | Code quality enforcement | |
| Docker Compose | Infrastructure | — | Local dev infrastructure (MongoDB, Redis) | `infrastructure/docker/` |
| GitHub Actions | CI | — | Automated CI pipeline | `.github/workflows/ci.yml` |

### 2.2 Stack Observations

**Cohesion:** The stack is highly cohesive. Every layer uses TypeScript consistently, validation is uniformly handled by Zod, and logging is uniformly handled by Pino. There are no competing libraries for the same concern.

**Maturity:** All production dependencies are at stable, widely-adopted versions. The use of Mongoose 8.x and BullMQ 5.x reflects current best practices for the Node.js/MongoDB ecosystem.

**Notable design choices:**
- `AsyncLocalStorage` for tenant context propagation is an idiomatic Node.js pattern that avoids threading tenant IDs through every function signature.
- The storage service uses an Adapter pattern, allowing transparent switching between local disk and AWS S3 based on environment.
- The email service supports three transport modes (SendGrid, Ethereal, stream) without changing call sites.
- BullMQ workers are conditionally disabled in the test environment (`NODE_ENV === 'test'`), preventing Redis dependency in unit/integration tests.

**Gaps:**
- `isomorphic-dompurify` is listed as a dependency but no active usage was observed in route handlers or services. This should be verified and either used or removed.
- MFA (`otplib`) fields exist on the User model but no MFA enrollment/verification routes were found. The feature appears partially implemented.
- No OpenTelemetry or distributed tracing integration is present beyond Sentry.

---

## 3. Project Structure & Code Organization

### 3.1 Top-Level Backend Layout

```
backend/
├── src/
│   ├── config/          # App configuration (env, DB, Redis, RBAC, Swagger, security policy, logger)
│   ├── constants/       # Shared constants (validation limits, rate limits, DB timeouts)
│   ├── middleware/       # Express middleware (auth, security, error handling, audit, etc.)
│   ├── models/          # Shared Mongoose models (User, AuditLog, RefreshToken, etc.) + base schema + mixins
│   ├── modules/
│   │   └── domain/      # Feature modules (press-releases, media-contacts, clippings, events,
│   │                    #   appointments, citizen-portal, social-media)
│   ├── platform/        # Cross-cutting infrastructure (BaseRepository, EventBus, TenantContext, Tenant model)
│   ├── queues/          # BullMQ queue and worker definitions
│   ├── routes/          # Top-level route aggregation (v1 index, auth, health, users, uploads, webhooks, dashboard)
│   ├── seeds/           # Default tenant seed
│   ├── services/        # Shared services (auth, cache, email, storage, webhooks, queue, admin)
│   ├── types/           # Express type augmentations
│   ├── utils/           # Utilities (errors, masking, logging, health checks, response helpers)
│   ├── validation/      # Shared Zod schemas and validation middleware
│   ├── app.ts           # Express application factory (middleware stack, route registration)
│   ├── server.ts        # HTTP server entry point (startup, graceful shutdown)
│   └── worker.ts        # BullMQ worker process entry point
├── tests/               # Test suite (unit, integration, smoke, helpers, mocks)
├── migrations/          # migrate-mongo migration files
├── scripts/             # Operational scripts (seed, index creation, tenancy migration)
├── uploads/             # Local file storage (development only)
├── .env.example         # Environment variable template
├── jest.config.js
├── package.json
└── tsconfig.json
```

### 3.2 Directory-by-Directory Analysis

#### `src/config/`
| Subdirectory / File | Files | Responsibility |
|---|---|---|
| `database/` | 2 | MongoDB connection with exponential-backoff retry; Redis client singleton |
| `rbac/` | 4 | Role definitions, permission constants, role-to-permission registry, helper functions |
| `security/` | 1 | Security policy constants (password rules, lockout thresholds, session limits) |
| `swagger/` | 1 | OpenAPI 3.0 spec generation via swagger-jsdoc |
| `env.ts` | 1 | Zod-validated environment schema; typed `env` export; startup validation |
| `logger.ts` | 1 | Pino logger singleton with log sanitization |
| `monitoring.ts` | 1 | Sentry initialization |

**Observation:** Configuration is well-organized and centralized. The Zod-based env validation in `env.ts` is a strong pattern — the server refuses to start with missing or malformed configuration.

#### `src/constants/`
Three files defining numeric limits for validation, pagination, rate limiting, and database connection. These are imported by middleware and config, preventing magic numbers from spreading through the codebase.

#### `src/middleware/`
| File | Responsibility |
|---|---|
| `auth/auth.ts` | JWT extraction, verification, user attachment, `authorize`, `authorizeWithPermissions`, `ensureTenantAccess` |
| `shared/baseAuth.ts` | Abstract base class for auth middleware (token extraction, error handling) |
| `security/security.ts` | CSRF double-submit protection, MongoDB sanitization |
| `auditLogger.ts` | Automatic audit log creation for write operations via `res.send` monkey-patching |
| `database.ts` | Database connection health guard (returns 503 if disconnected) |
| `errorHandler.ts` | Centralized error handler; maps `AppError` subclasses, Mongoose errors, JWT errors to HTTP responses |
| `idempotency.ts` | Redis-backed idempotency for POST requests via `Idempotency-Key` header |
| `normalizeResponse.ts` | Response envelope normalization (`{ success, data, error, meta }`) via `res.json` monkey-patching |
| `pagination.ts` | Parses and normalizes `page`/`limit` query params; attaches to `req.pagination` |
| `rateLimiter.ts` | Five Redis-backed rate limiters (api, auth, refresh, password-reset, invite, contact) |
| `upload.ts` | Multer configuration (memory storage, 10MB limit, MIME type allowlist) |

**Observation:** The middleware layer is comprehensive and well-separated. The use of `res.send`/`res.json` monkey-patching in `auditLogger.ts` and `normalizeResponse.ts` is a common Express pattern but introduces subtle ordering dependencies and can cause issues if middleware is applied out of sequence.

#### `src/models/`
Contains shared, platform-level Mongoose models:

| Model | Purpose |
|---|---|
| `User` | Staff user accounts; includes auth mixin (login attempts, lockout), password hashing, history |
| `AuditLog` | Immutable audit trail; TTL index for automatic expiry |
| `RefreshToken` | Refresh token store; TTL index for automatic expiry |
| `InviteToken` | Team invitation tokens; TTL index |
| `WebhookSubscription` | Outbound webhook registrations |

**Base schema (`base/baseSchema.ts`):** Provides `isDeleted`/`deletedAt` fields and a standard `toJSON` transform (maps `_id` → `id`, removes `__v`). Applied to all models.

**Mixins (`models/mixins/`):** `auditableMixin` adds `createdBy`/`updatedBy` fields. `tenantScopedMixin` re-exports from `platform/database/tenantAware` (a thin compatibility shim).

#### `src/modules/domain/`
The core of the application. Seven domain modules, each with an identical internal structure:

```
<module>/
├── controllers/    # HTTP handler functions (thin — delegates to service)
├── events/         # Domain event type constants
├── models/         # Mongoose model for this domain
├── repositories/   # Extends BaseRepository; adds domain-specific filter queries
├── routes/         # Express Router with auth guards, validators, Swagger annotations
├── services/       # Business logic; orchestrates repository + event emission
├── tests/
│   ├── fixtures/   # (empty in most modules)
│   ├── integration/# (empty in most modules)
│   └── unit/       # Unit tests (present only in press-releases)
├── types/          # TypeScript interfaces and DTOs for this module
├── validators/     # Zod schemas for create/update/filter operations
└── index.ts        # Public API (re-exports routes and types)
```

**Modules:**

| Module | Domain Model | Key Status/Enum Values |
|---|---|---|
| `press-releases` | `PressRelease` | status: draft, review, approved, published, archived |
| `media-contacts` | `MediaContact` | — |
| `clippings` | `Clipping` | sentiment field |
| `events` | `Event` | startsAt, location |
| `appointments` | `Appointment` | scheduledAt, status: pending |
| `citizen-portal` | `CitizenPortal` | cpf field; unique per tenant+user |
| `social-media` | `SocialMedia` | platform, scheduledAt |

**Observation:** The module structure is highly consistent and follows a strict vertical slice pattern. This makes onboarding straightforward — a developer familiar with one module can immediately navigate any other. The `index.ts` barrel file per module provides a clean public API boundary.

#### `src/platform/`
The infrastructure layer shared across all domain modules:

| Path | Responsibility |
|---|---|
| `database/BaseRepository.ts` | Generic CRUD + pagination; automatically injects `tenantId` from `TenantContext` into every query |
| `database/tenantAware.ts` | `tenantAwareFields` schema definition; `applyTenantAware` hook (prevents tenantId mutation) |
| `events/eventBus.ts` | BullMQ-backed event bus singleton; in-process dispatch in test mode |
| `events/events.ts` | Domain event type constants (AUTH_EVENTS, TENANT_EVENTS, etc.) |
| `tenants/TenantContext.ts` | `AsyncLocalStorage`-based tenant context manager |
| `tenants/middleware/tenant.middleware.ts` | Resolves tenant from JWT → header → subdomain; sets `AsyncLocalStorage` context |
| `tenants/models/Tenant.ts` | Tenant Mongoose model |
| `tenants/services/tenant.service.ts` | Tenant CRUD, lifecycle management (suspend, reactivate, soft-delete) |
| `tenants/routes/tenant.routes.ts` | Admin-only tenant management endpoints |

**Observation:** The platform layer is the architectural backbone. The `BaseRepository` + `TenantContext` combination is the most critical design decision in the codebase — it enforces tenant isolation at the data access layer, making it structurally impossible to accidentally query across tenants.

#### `src/queues/`
Three BullMQ queue/worker definitions:

| Queue | Purpose | Retry | Schedule |
|---|---|---|---|
| `email` | Transactional email delivery | 3 attempts, exponential backoff | On-demand |
| `domain-events` | Async domain event processing | 3 attempts, exponential backoff | On-demand |
| `audit-cleanup` | Purge audit logs older than retention period | — | Daily at 03:00 (cron) |

Workers are conditionally null in `NODE_ENV=test`, preventing Redis dependency in tests.

#### `src/routes/`
Top-level route aggregation. `routes/v1/index.ts` is the single mount point for all platform and domain routes under `/api/v1/`. Auth routes live in `routes/auth.ts` (300 LOC — the largest route file, containing inline handler logic rather than delegating to a controller).

#### `src/services/`
Shared services not belonging to a specific domain module:

| Service | Responsibility |
|---|---|
| `auth/authService.ts` | Login, register, token management, password reset, invite flow |
| `auth/tokenBlacklistService.ts` | Redis-backed JWT blacklist |
| `auth/authEventListeners.ts` | Handles `ACCOUNT_LOCKED` event → sends email |
| `admin/auditService.ts` | Writes to `AuditLog` collection |
| `admin/userService.ts` | Admin user management (list, update, deactivate) |
| `admin/dashboardService.ts` | Aggregates counts across all domain collections |
| `cache/CacheService.ts` | Generic Redis cache wrapper with prefix namespacing |
| `external/emailService.ts` | Nodemailer wrapper (SendGrid / Ethereal / stream) |
| `storage/storageService.ts` | Adapter-pattern file storage (S3 / local disk) |
| `webhooks/webhookService.ts` | Outbound webhook dispatch with HMAC-SHA256 signing |
| `queue/queueService.ts` | Thin facade over `addEmailToQueue` |

#### `src/utils/`
| File | Responsibility |
|---|---|
| `errors/errors.ts` | `AppError` hierarchy (`ValidationError`, `NotFoundError`, `UnauthorizedError`, etc.) |
| `errors/errorCodes.ts` | Typed error code constants |
| `errors/errorLogger.ts` | Error logging utility |
| `logSanitizer.ts` | Redacts sensitive fields and masks emails in log output |
| `masking.ts` | PII masking functions (email, phone) for audit logs |
| `responseHelpers.ts` | `ApiResponse` static class + response factory functions |
| `healthChecks.ts` | Redis health check utility |
| `dateSerializer.ts` | Date serialization for JSON responses |
| `monitoring/memoryMonitor.ts` | Memory usage monitoring utility |

#### `src/validation/`
Shared Zod schemas (`paginationSchema`, `objectIdSchema`, `idParamSchema`) and the `validateSchema` middleware factory used by all route files.

### 3.3 Summary Statistics

| Metric | Value |
|---|---|
| Total TypeScript source files (`src/`) | 168 |
| Total test files (`tests/` + module `tests/`) | ~20 |
| Total source LOC | ~7,812 |
| Average file size | ~46 LOC |
| Largest file | `authService.ts` (350 LOC) |
| Second largest | `routes/auth.ts` (300 LOC) |
| Domain modules | 7 |
| Files > 200 LOC | 3 (`authService.ts`, `routes/auth.ts`, `config/env.ts`) |

### 3.4 Architectural Observations

**Strengths:**
- Consistent vertical-slice module structure makes the codebase highly navigable.
- Clear separation between `platform/` (infrastructure) and `modules/domain/` (business logic).
- No "god files" — the largest file (`authService.ts` at 350 LOC) is appropriately sized for its responsibility.
- Naming conventions are consistent: `<entity>.controller.ts`, `<entity>.service.ts`, `<entity>.repository.ts`, `<entity>.routes.ts`, `<entity>.validator.ts`.

**Weaknesses:**
- `routes/auth.ts` contains inline async handler logic (300 LOC) rather than delegating to a controller, inconsistent with the pattern used by all domain modules.
- `services/admin/dashboardService.ts` directly imports Mongoose models from domain modules, creating a cross-layer dependency from the shared services layer into domain modules.
- Test coverage is sparse: only `press-releases` has a unit test within its module; most `tests/unit/` and `tests/integration/` subdirectories are empty or contain only a few files.
- The `uploads/` directory is committed to the repository, which is appropriate for development but should be excluded from production Docker images.
