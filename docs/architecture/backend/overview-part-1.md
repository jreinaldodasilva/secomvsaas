# Secom Backend — Architecture Overview (Part 1 of 3)

> **Document scope:** Technology stack, project structure, and dependency analysis.
> **Based on:** Observable source code, configuration files, and migration scripts.
> **Parts:** [Part 1 — Stack, Structure, Dependencies] · [Part 2 — Bootstrap, Config, Architecture](./overview-part-2.md) · [Part 3 — Secom Patterns, Recommendations](./overview-part-3.md)

---

## Executive Summary

The Secom backend is a **modular monolith** built on Node.js/Express/TypeScript, organized around domain-driven modules. It serves as the API layer for the Secretaria de Comunicação management system, handling seven business domains (press releases, media contacts, clippings, events, appointments, citizen portal, social media) under a shared multi-tenant infrastructure.

The codebase demonstrates a mature, security-conscious design: Zod-validated environment configuration, CSRF protection, Redis-backed rate limiting, BullMQ job queues, AsyncLocalStorage-based tenant context propagation, and a layered RBAC system with per-tenant feature flags. The architecture is well-suited for its current scale and provides clear extension points for future growth.

Key strengths: consistent module structure, strong tenant isolation at the data layer, defense-in-depth security middleware, and a clean separation between platform infrastructure and domain logic.

Key risks: thin test coverage for domain modules, a partially implemented secrets backend (`aws-secrets` throws at runtime), no full-text search capability, and a single-process deployment model that couples the HTTP server with background job workers in development.

---

## 1. Technology Stack

### 1.1 Stack Inventory

| Technology | Category | Version | Purpose | Notes |
|---|---|---|---|---|
| Node.js | Runtime | ≥18.0.0 (enforced) | JavaScript runtime | LTS; `engines` field enforces minimum |
| TypeScript | Language | ^5.9.2 | Static typing | `strict: true`, target ES2020 |
| Express | HTTP Framework | ^4.21.2 | REST API server | v4; no migration to v5 yet |
| Mongoose | ODM | ^8.18.0 | MongoDB object modeling | v8 — current major |
| MongoDB | Database | 8 (Docker) | Primary data store | Replica set required for transactions |
| Redis | Cache / Queue broker | 7 (Docker) | Rate limiting, caching, BullMQ transport | Sentinel mode supported via config |
| BullMQ | Job Queue | ^5.58.2 | Background job processing | 4 queues: email, webhook, domain-events, audit-cleanup |
| ioredis | Redis client | ^5.7.0 | Redis connection (standalone + Sentinel) | Used by both app and BullMQ |
| Zod | Validation | ^3.22.4 | Schema validation (env, request bodies) | Used consistently across all layers |
| jsonwebtoken | Auth | ^9.0.2 | JWT signing/verification | HS256; issuer/audience claims enforced |
| bcrypt | Auth | ^6.0.0 | Password hashing | Cost factor 12 |
| csrf-csrf | Security | ^4.0.3 | Double-submit CSRF protection | `__Host-` prefix cookie in production |
| helmet | Security | ^8.1.0 | HTTP security headers | CSP, HSTS, frameguard configured |
| express-rate-limit | Security | ^7.5.1 | Rate limiting | Redis-backed via `rate-limit-redis` |
| express-mongo-sanitize | Security | ^2.2.0 | NoSQL injection prevention | Replaces `$` and `.` in input |
| compression | Performance | ^1.8.1 | Gzip response compression | Level 6 |
| pino | Logging | ^9.11.0 | Structured JSON logging | pino-pretty in dev, JSON in prod |
| pino-http | Logging | ^10.5.0 | HTTP request logging middleware | Health endpoint excluded |
| @sentry/node | Monitoring | ^10.20.0 | Error tracking and performance | Optional; disabled if `SENTRY_DSN` absent |
| @sentry/profiling-node | Monitoring | ^10.20.0 | CPU profiling for Sentry | Paired with Sentry SDK |
| nodemailer | Email | ^6.10.1 | Email delivery | SendGrid (prod), Ethereal (staging), console (dev) |
| @aws-sdk/client-s3 | Storage | ^3.922.0 | S3 file uploads | Falls back to local disk in non-production |
| @aws-sdk/s3-request-presigner | Storage | ^3.922.0 | Pre-signed S3 URLs | Used for file download links |
| multer | Upload | ^2.1.1 | Multipart file handling | Memory storage; 10 MB limit |
| swagger-jsdoc | API Docs | ^6.2.8 | OpenAPI spec generation from JSDoc | Scans routes and module route files |
| swagger-ui-express | API Docs | ^5.0.1 | Swagger UI at `/api-docs` | |
| uuid | Utility | ^13.0.0 | Request ID and idempotency key generation | |
| date-fns | Utility | ^4.1.0 | Date manipulation | v4 — current major |
| cookie-parser | Middleware | ^1.4.7 | Cookie parsing | Required for JWT cookie auth |
| cors | Middleware | ^2.8.5 | CORS policy enforcement | Origin allowlist with regex support |
| dotenv | Config | ^16.6.1 | `.env` file loading | Loaded before Zod validation |
| migrate-mongo | Migrations | ^12.1.3 | MongoDB schema migrations | One migration file present |
| mongodb-memory-server | Testing | ^10.2.0 | In-memory MongoDB for tests | Used in Jest setup |
| jest / ts-jest | Testing | ^29.7.0 / ^29.4.1 | Unit and integration tests | `testTimeout: 15000` |
| supertest | Testing | ^7.1.4 | HTTP integration testing | |
| @faker-js/faker | Testing | ^10.0.0 | Test data generation | |
| ioredis-mock | Testing | ^8.9.0 | Redis mock for tests | |
| nodemon | Dev | ^3.1.10 | Auto-restart on file changes | Watches `src/` |
| ts-node | Dev | ^10.9.2 | TypeScript execution without build | Used for dev server and scripts |
| tsconfig-paths | Dev | ^4.2.0 | Path alias resolution at runtime | Maps `@vsaas/types` |
| @vsaas/types | Shared | file:../packages/types | Shared TypeScript types | Local workspace package |

### 1.2 Stack Observations

**Maturity and cohesion:** The stack is modern and internally consistent. All major dependencies are at current or near-current major versions. The choice of Zod for both environment validation and request validation is a strong cohesion signal — a single validation library across all layers.

**Notable design choices:**
- MongoDB is configured to require a replica set (`replicaSet=rs0`), enabling multi-document ACID transactions used in tenant creation and seeding.
- Redis serves triple duty: BullMQ transport, distributed rate limiting, and application-level caching — a reasonable consolidation for this scale.
- The `@vsaas/types` local package indicates the project was scaffolded from a vSaaS boilerplate and shares types with the frontend.
- Email delivery is abstracted behind a mock flag (`MOCK_EMAIL_SERVICE`), making local development frictionless.

**Gaps:**
- No full-text search engine (e.g., Elasticsearch/OpenSearch). Text search currently uses MongoDB `$regex`, which does not scale well for large datasets.
- `aws-secrets` backend is documented but throws a runtime error — it is not yet implemented.
- No WebSocket or SSE infrastructure for real-time updates despite the README mentioning "real-time updates" as a key feature.

---

## 2. Project Structure & Code Organization

### 2.1 Directory Map

```
backend/
├── src/
│   ├── app.ts                    # Express application factory
│   ├── server.ts                 # HTTP server entry point
│   ├── worker.ts                 # Background worker entry point
│   │
│   ├── config/                   # Application configuration
│   │   ├── database/             # MongoDB and Redis connection factories
│   │   ├── rbac/                 # RBAC: roles, permissions, registry, feature flags
│   │   ├── secrets/              # Secrets loader abstraction
│   │   ├── security/             # CSRF skip-path policy
│   │   ├── swagger/              # OpenAPI spec generation
│   │   ├── env.ts                # Zod-validated environment config (single source of truth)
│   │   ├── logger.ts             # Pino logger singleton
│   │   └── monitoring.ts         # Sentry initialization
│   │
│   ├── constants/                # Shared numeric/string constants
│   │   ├── index.ts
│   │   ├── time.ts
│   │   └── validation.ts         # Pagination, rate limit, DB, password constants
│   │
│   ├── controllers/              # Platform-level controllers (auth only)
│   │   ├── auth.controller.ts
│   │   └── citizen-auth.controller.ts
│   │
│   ├── middleware/               # Express middleware
│   │   ├── auth/                 # Staff and citizen authentication middleware
│   │   ├── security/             # CSRF + Mongo sanitization
│   │   ├── shared/               # BaseAuthMiddleware abstract class
│   │   ├── auditLogger.ts        # Write-operation audit logging
│   │   ├── database.ts           # DB connection health check
│   │   ├── errorHandler.ts       # Centralized error handler
│   │   ├── idempotency.ts        # POST idempotency via Redis
│   │   ├── normalizeResponse.ts  # Response envelope normalization
│   │   ├── pagination.ts         # Pagination query param normalization
│   │   ├── rateLimiter.ts        # Redis-backed rate limiters
│   │   └── upload.ts             # Multer file upload configuration
│   │
│   ├── models/                   # Platform-level Mongoose models
│   │   ├── base/                 # baseSchema fields and options
│   │   ├── mixins/               # authMixin, auditableMixin, tenantScopedMixin
│   │   ├── AuditLog.ts
│   │   ├── InviteToken.ts
│   │   ├── RefreshToken.ts
│   │   ├── User.ts
│   │   ├── WebhookDelivery.ts
│   │   └── WebhookSubscription.ts
│   │
│   ├── modules/
│   │   └── domain/               # Secom domain modules (7 modules)
│   │       ├── appointments/
│   │       ├── citizen-portal/
│   │       ├── clippings/
│   │       ├── events/
│   │       ├── media-contacts/
│   │       ├── press-releases/
│   │       └── social-media/
│   │
│   ├── platform/                 # Shared platform infrastructure
│   │   ├── database/             # BaseRepository + tenantAware schema helpers
│   │   ├── events/               # BullMQ-backed EventBus
│   │   └── tenants/              # Tenant model, service, middleware, TenantContext
│   │
│   ├── queues/                   # BullMQ queue and worker definitions
│   │   ├── auditCleanupQueue.ts
│   │   ├── domainEventsQueue.ts
│   │   ├── emailQueue.ts
│   │   └── webhookQueue.ts
│   │
│   ├── routes/                   # Platform-level route registration
│   │   ├── v1/index.ts           # Central v1 router (platform + domain)
│   │   ├── auth.ts
│   │   ├── citizen-auth.ts
│   │   ├── dashboard/
│   │   ├── monitoring/           # Health check endpoints
│   │   ├── uploads/
│   │   ├── users/
│   │   ├── validations/
│   │   └── webhooks/
│   │
│   ├── seeds/
│   │   └── defaultTenant.ts      # Idempotent default tenant + admin seeding
│   │
│   ├── services/                 # Platform-level services
│   │   ├── admin/                # UserService, DashboardService, AuditService
│   │   ├── auth/                 # AuthService, CitizenAuthService, helpers
│   │   ├── cache/                # CacheService (Redis wrapper)
│   │   ├── external/             # EmailService + email templates
│   │   ├── queue/                # QueueService (thin BullMQ facade)
│   │   ├── storage/              # StorageService (local/S3 adapter)
│   │   └── webhooks/             # WebhookService
│   │
│   ├── types/
│   │   └── express.d.ts          # Express Request augmentation (pagination)
│   │
│   ├── utils/
│   │   ├── errors/               # AppError hierarchy + error codes
│   │   ├── monitoring/           # Memory monitor
│   │   ├── dateSerializer.ts
│   │   ├── healthChecks.ts
│   │   ├── logSanitizer.ts
│   │   ├── masking.ts
│   │   └── responseHelpers.ts    # ApiResponse class + response factories
│   │
│   └── validation/
│       ├── index.ts
│       ├── middleware.ts          # validateSchema() Zod middleware factory
│       └── schemas.ts            # Shared Zod schemas (auth, pagination)
│
├── tests/
│   ├── helpers/
│   ├── integration/              # Auth, users, invite integration tests
│   ├── mocks/                    # uuid mock
│   ├── smoke/
│   ├── unit/                     # Platform unit tests (eventBus, tenant, middleware)
│   └── setup.ts                  # MongoMemoryServer + Redis teardown
│
├── migrations/
│   └── 20240101000000-initial-setup.js   # Full index migration
│
└── scripts/
    ├── add-database-indexes.ts   # Dev-only index sync
    ├── migrate-add-tenancy.ts    # One-time tenancy migration
    └── seedTestData.ts           # Test data seeder
```

### 2.2 Domain Module Structure

Each of the 7 domain modules follows an identical internal layout:

```
<module>/
├── controllers/    # HTTP request handlers (thin — delegate to service)
├── events/         # Domain event type constants
├── models/         # Mongoose schema + model
├── repositories/   # Data access layer (extends BaseRepository)
├── routes/         # Express router with Swagger JSDoc annotations
├── services/       # Business logic
├── tests/
│   ├── fixtures/
│   ├── integration/
│   └── unit/
├── types/          # TypeScript interfaces and DTOs
├── validators/     # Zod schemas for request validation
└── index.ts        # Public barrel export
```

This uniformity is a significant maintainability strength — any developer familiar with one module can navigate all others immediately.

### 2.3 File Statistics

| Metric | Value |
|---|---|
| Total TypeScript source files (`src/`) | 177 |
| Total lines of code (`src/`) | ~8,860 |
| Average file size | ~50 LOC |
| Test files | 13 |
| Largest file | `authService.ts` — 350 LOC |
| Files > 200 LOC | 4 (`authService.ts`, `env.ts`, `tenant.service.ts`, `citizenAuthService.ts`) |

### 2.4 Largest Files

| File | LOC | Observation |
|---|---|---|
| `services/auth/authService.ts` | 350 | Handles login, register, refresh, password reset, invite flow — broad but cohesive |
| `config/env.ts` | 240 | Zod schema + shaped config export — intentionally comprehensive |
| `platform/tenants/services/tenant.service.ts` | 211 | Full tenant lifecycle — acceptable scope |
| `platform/tenants/routes/tenant.routes.ts` | 195 | Dense Swagger annotations inflate LOC |
| `services/auth/citizenAuthService.ts` | 182 | Parallel auth flow for citizens — mirrors authService |
| `app.ts` | 182 | Middleware stack assembly — expected for an Express app |

No "god files" are present. The largest files are large due to legitimate scope breadth, not mixed responsibilities.

### 2.5 Organization Strategy

The codebase uses a **hybrid organization strategy**:

- **Feature-based (domain-driven)** for business logic: `src/modules/domain/<module>/`
- **Layer-based** for platform infrastructure: `src/platform/`, `src/services/`, `src/middleware/`
- **Concern-based** for cross-cutting utilities: `src/config/`, `src/utils/`, `src/constants/`

This hybrid is appropriate for a modular monolith. The `platform/` directory cleanly separates reusable infrastructure from domain-specific code.

### 2.6 Architectural Observations

**Strengths:**
- Consistent module structure enables predictable navigation and onboarding.
- Clear boundary between `platform/` (infrastructure) and `modules/domain/` (business logic).
- Barrel exports (`index.ts`) in each module provide clean public APIs and prevent deep import paths.
- The `BaseRepository` in `platform/database/` centralizes tenant-scoped data access, preventing accidental cross-tenant queries.

**Concerns:**
- 🟨 The `src/controllers/` and `src/services/` directories at the root level contain only platform-level code (auth, admin), but their names mirror the module-level directories, which can cause confusion about where to place new code.
- 🟨 `DashboardService` in `src/services/admin/` directly imports repositories from all 7 domain modules, creating a fan-in dependency from the platform layer into the domain layer. This inverts the intended dependency direction.
- 🟩 The `src/models/mixins/tenantScopedMixin.ts` file is a thin re-export shim pointing to `platform/database/tenantAware`. This suggests a refactoring in progress; the shim should be removed once all consumers are updated.

---

## 3. Dependency Analysis

### 3.1 Production Dependencies

| Package | Version | Purpose | Status | Notes |
|---|---|---|---|---|
| `express` | ^4.21.2 | HTTP framework | ✅ Current | v5 available but not yet widely adopted |
| `mongoose` | ^8.18.0 | MongoDB ODM | ✅ Current | |
| `bullmq` | ^5.58.2 | Job queues | ✅ Current | |
| `ioredis` | ^5.7.0 | Redis client | ✅ Current | |
| `zod` | ^3.22.4 | Validation | ✅ Current | |
| `jsonwebtoken` | ^9.0.2 | JWT | ✅ Current | |
| `bcrypt` | ^6.0.0 | Password hashing | ✅ Current | |
| `helmet` | ^8.1.0 | Security headers | ✅ Current | |
| `csrf-csrf` | ^4.0.3 | CSRF protection | ✅ Current | |
| `express-rate-limit` | ^7.5.1 | Rate limiting | ✅ Current | |
| `rate-limit-redis` | ^4.2.3 | Redis rate limit store | ✅ Current | |
| `express-mongo-sanitize` | ^2.2.0 | NoSQL injection | ✅ Current | |
| `pino` | ^9.11.0 | Logging | ✅ Current | |
| `pino-http` | ^10.5.0 | HTTP logging | ✅ Current | |
| `@sentry/node` | ^10.20.0 | Error monitoring | ✅ Current | |
| `@sentry/profiling-node` | ^10.20.0 | Profiling | ✅ Current | |
| `nodemailer` | ^6.10.1 | Email | ✅ Current | |
| `@aws-sdk/client-s3` | ^3.922.0 | S3 storage | ✅ Current | AWS SDK v3 modular |
| `@aws-sdk/s3-request-presigner` | ^3.922.0 | S3 pre-signed URLs | ✅ Current | |
| `multer` | ^2.1.1 | File uploads | ✅ Current | |
| `compression` | ^1.8.1 | Gzip | ✅ Current | |
| `cookie-parser` | ^1.4.7 | Cookie parsing | ✅ Current | |
| `cors` | ^2.8.5 | CORS | ✅ Current | |
| `dotenv` | ^16.6.1 | Env loading | ✅ Current | |
| `date-fns` | ^4.1.0 | Date utilities | ✅ Current | v4 — current major |
| `uuid` | ^13.0.0 | UUID generation | ✅ Current | |
| `swagger-jsdoc` | ^6.2.8 | API docs | ✅ Current | |
| `swagger-ui-express` | ^5.0.1 | Swagger UI | ✅ Current | |
| `@vsaas/types` | file:../packages/types | Shared types | ✅ Local | Workspace package |

### 3.2 Development Dependencies

| Package | Version | Purpose | Status | Notes |
|---|---|---|---|---|
| `typescript` | ^5.9.2 | Compiler | ✅ Current | |
| `ts-node` | ^10.9.2 | TS execution | ✅ Current | |
| `ts-jest` | ^29.4.1 | Jest TS transform | ✅ Current | |
| `jest` | ^29.7.0 | Test runner | ✅ Current | |
| `supertest` | ^7.1.4 | HTTP testing | ✅ Current | |
| `mongodb-memory-server` | ^10.2.0 | In-memory MongoDB | ✅ Current | |
| `ioredis-mock` | ^8.9.0 | Redis mock | ✅ Current | |
| `@faker-js/faker` | ^10.0.0 | Test data | ✅ Current | |
| `nodemon` | ^3.1.10 | Dev auto-restart | ✅ Current | |
| `migrate-mongo` | ^12.1.3 | DB migrations | ✅ Current | |
| `eslint` | ^8.57.1 | Linting | 🟨 Behind | ESLint 9 released; config uses legacy format |
| `@typescript-eslint/*` | ^6.21.0 | TS linting | 🟨 Behind | v8 available |
| `pino-pretty` | ^13.1.1 | Log formatting | ✅ Current | Dev only |
| `jest-junit` | ^16.0.0 | JUnit reporter | ✅ Current | CI artifact output |
| `tsconfig-paths` | ^4.2.0 | Path aliases | ✅ Current | |

### 3.3 Dependency Risk Assessment

**🟥 Critical — None identified.** No known CVEs in the dependency set at time of analysis.

**🟧 High:**
- No `@aws-sdk/client-secrets-manager` is installed, yet `SECRETS_BACKEND=aws-secrets` is documented as a supported option. Selecting this backend causes a runtime `throw` at startup. This is a deployment trap — the configuration option appears valid but will crash the server.

**🟨 Medium:**
- ESLint 8 + `@typescript-eslint` v6 are one major version behind. ESLint 9 introduced a flat config format; migrating now avoids a forced migration later.
- The `migrate-mongo` migration framework has only one migration file. As the schema evolves, the absence of a migration discipline could lead to index drift between environments.

**🟩 Low:**
- `compression` middleware has no active maintainer but remains stable. Consider `shrink-ray-current` or native Node.js compression if this becomes a concern.
- `nodemailer` is used only as a transport adapter. The dependency could be replaced with a dedicated SendGrid SDK for production to reduce surface area, though the current abstraction is clean.
- No `helmet` CSP nonce support — inline scripts are blocked by the current CSP, which is correct, but any future need for inline scripts would require nonce infrastructure.

### 3.4 Missing Dependencies

| Gap | Impact | Notes |
|---|---|---|
| `@aws-sdk/client-secrets-manager` | 🟧 High | Required for `SECRETS_BACKEND=aws-secrets` but absent from `package.json` |
| Full-text search client | 🟨 Medium | No Elasticsearch/OpenSearch client; text search uses `$regex` |
| WebSocket library | 🟩 Low | No real-time push capability despite README mention |
| OpenTelemetry SDK | 🟩 Low | Sentry covers errors; distributed tracing is absent |
