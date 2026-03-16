# Secom Backend Architecture Overview — Part 1

> **Executive Summary · Technology Stack · Project Structure**

---

## 1. Executive Summary

The Secom backend is a **multi-tenant, modular monolith** built on Node.js/Express/TypeScript with MongoDB as the primary datastore and Redis for caching, rate limiting, and background job processing. It serves as the API layer for the *Secretaria de Comunicação* system, managing press releases, media contacts, clippings, events, appointments, citizen portal, and social media publications.

The codebase inherits its foundational architecture from the **vSaaS boilerplate** and extends it with seven domain-specific modules. The architecture follows a **layered + domain-modular** hybrid pattern: platform concerns (tenancy, auth, events) live in a shared layer, while each business domain is a self-contained module with its own controller, service, repository, model, validator, events, and types.

### Key Architectural Characteristics

| Characteristic | Assessment |
|---|---|
| Architecture style | Modular monolith with layered platform core |
| Multi-tenancy | Shared database, `tenantId` column, AsyncLocalStorage-based context |
| Auth model | JWT in httpOnly cookies, RBAC with 6 roles, permission-based authorization |
| API style | RESTful, versioned under `/api/v1/`, Swagger-documented |
| Event system | In-process EventBus (singleton), not distributed |
| Background jobs | BullMQ (Redis-backed) for email and audit cleanup |
| Test coverage | Present but thin — 11 test files / 877 LOC for ~7,600 LOC of source |
| Code quality | Consistent conventions, no "god files", largest file is 350 LOC |

### Overall Assessment

The backend is **well-structured for its current scale**. The domain module pattern is consistent and CLI-generated, which reduces drift. The platform layer (tenancy, RBAC, events) is cleanly separated. The main risks are: (1) low test coverage, (2) in-memory EventBus limiting horizontal scalability, (3) some security-sensitive defaults in development configuration, and (4) unused dependencies inflating the bundle.

---

## 2. Technology Stack

### 2.1 Technology Inventory

| Technology | Category | Version | Purpose | Notes |
|---|---|---|---|---|
| TypeScript | Language | ^5.9.2 | Primary language | Strict mode enabled |
| Node.js | Runtime | ≥18.0.0 | Server runtime | Declared in `engines` |
| Express | Web Framework | ^4.21.2 | HTTP server, routing, middleware | Mature, widely supported |
| MongoDB | Database | 8 (Docker image) | Primary datastore | Shared-database multi-tenancy |
| Mongoose | ODM | ^8.18.0 | Schema definition, queries, validation | Latest major version |
| Redis | Cache / Queue Backend | 7 (Docker image) | Caching, rate limiting, token blacklist, BullMQ backend | Via ioredis ^5.7.0 |
| BullMQ | Job Queue | ^5.58.2 | Email queue, audit log cleanup scheduler | Redis-backed |
| JWT (jsonwebtoken) | Authentication | ^9.0.2 | Access/refresh token generation and verification | HS256, httpOnly cookies |
| bcrypt | Password Hashing | ^6.0.0 | Password hashing (salt rounds: 12) | Native binding |
| Zod | Validation (domain) | ^3.22.4 | Schema validation for domain modules and tenants | Used alongside express-validator |
| express-validator | Validation (auth) | ^7.2.1 | Auth route input validation | Legacy from boilerplate |
| Pino | Logging | ^9.11.0 | Structured JSON logging | pino-pretty for dev |
| pino-http | HTTP Logging | ^10.5.0 | Request/response logging middleware | |
| Sentry | Error Tracking | ^10.20.0 | Error monitoring, profiling | Optional (requires SENTRY_DSN) |
| Helmet | Security Headers | ^8.1.0 | CSP, HSTS, X-Frame-Options | |
| csrf-csrf | CSRF Protection | ^4.0.3 | Double-submit cookie CSRF | |
| express-mongo-sanitize | NoSQL Injection | ^2.2.0 | Sanitizes `$` and `.` from input | |
| express-rate-limit | Rate Limiting | ^7.5.1 | Per-route rate limiting | Redis-backed store |
| rate-limit-redis | Rate Limit Store | ^4.2.3 | Redis store for rate limiter | |
| Nodemailer | Email | ^6.10.1 | SMTP email delivery | SendGrid (prod), Ethereal/mock (dev) |
| AWS SDK S3 | File Storage | ^3.922.0 | S3 file upload/download | Local adapter for dev |
| Stripe | Payments | ^19.1.0 | Payment processing | Dependency present, minimal integration |
| Twilio | SMS | ^5.10.2 | SMS notifications | Dependency present, mock available |
| otplib | MFA | ^12.0.1 | TOTP generation | MFA-ready, not fully wired |
| Multer | File Upload | ^2.1.1 | Multipart form parsing | Memory storage, 10MB limit |
| Swagger (swagger-jsdoc + swagger-ui-express) | API Docs | ^6.2.8 / ^5.0.1 | OpenAPI spec generation and UI | JSDoc annotations in routes |
| compression | HTTP Compression | ^1.8.1 | gzip response compression | Level 6 |
| date-fns | Date Utilities | ^4.1.0 | Date manipulation | |
| isomorphic-dompurify | HTML Sanitization | ^2.26.0 | XSS prevention in HTML content | |
| uuid | ID Generation | ^13.0.0 | Request IDs, idempotency keys | |
| Jest | Testing | ^29.7.0 | Unit and integration tests | ts-jest transformer |
| Supertest | HTTP Testing | ^7.1.4 | Integration test HTTP assertions | |
| mongodb-memory-server | Test DB | ^10.2.0 | In-memory MongoDB for tests | |
| ioredis-mock | Test Redis | ^8.9.0 | Redis mock for tests | |
| Faker | Test Data | ^10.0.0 | Fake data generation | |
| ESLint | Linting | ^8.57.1 | Code quality enforcement | @typescript-eslint |
| Nodemon | Dev Server | ^3.1.10 | Auto-restart on file changes | |
| migrate-mongo | Migrations | ^12.1.3 | Database migration framework | Single placeholder migration |
| Docker Compose | Infrastructure | 3.8 | Local dev services (Mongo, Redis, MailHog) | |
| GitHub Actions | CI | — | Automated test, lint, type-check pipeline | |

### 2.2 Stack Observations

**Strengths:**
- Modern, current versions across the board — no critically outdated dependencies
- Consistent TypeScript with strict mode provides strong type safety
- Well-chosen middleware stack (Helmet, CORS, rate limiting, CSRF, mongo sanitize) covers OWASP top concerns
- Structured logging with Pino is production-appropriate
- BullMQ for async jobs is a solid choice over ad-hoc setTimeout patterns

**Concerns:**
- 🟨 **Dual validation libraries**: Zod (domain modules) and express-validator (auth routes) coexist. This creates cognitive overhead and inconsistent validation patterns
- 🟨 **Stripe and Twilio dependencies are present but minimally integrated** — they add to install size and attack surface without clear usage
- 🟩 **otplib is included but MFA is not fully wired** — the User model has `mfaEnabled`/`mfaSecret` fields but no MFA flow in auth routes
- 🟩 **swagger-jsdoc v6 is behind v7** — minor, but v7 has better TypeScript support

---

## 3. Project Structure & Code Organization

### 3.1 Directory Tree

```
backend/
├── src/                          # Application source (164 .ts files, ~7,669 LOC)
│   ├── app.ts                    # Express app setup, middleware stack (184 LOC)
│   ├── server.ts                 # Entry point, bootstrap, graceful shutdown (75 LOC)
│   ├── config/                   # Configuration (11 files, 491 LOC)
│   │   ├── database/             #   MongoDB + Redis connection
│   │   ├── rbac/                 #   Roles, permissions, registry
│   │   ├── security/             #   Password/lockout policy constants
│   │   ├── swagger/              #   OpenAPI spec generation
│   │   ├── env.ts                #   Environment config + validation
│   │   ├── logger.ts             #   Pino logger setup
│   │   └── monitoring.ts         #   Sentry initialization
│   ├── constants/                # Shared constants (3 files, 56 LOC)
│   ├── middleware/               # Express middleware (13 files, 537 LOC)
│   │   ├── auth/                 #   Authentication + authorization
│   │   ├── security/             #   CSRF, mongo sanitize
│   │   └── shared/               #   BaseAuthMiddleware abstract class
│   ├── models/                   # Mongoose models (11 files, 335 LOC)
│   │   ├── base/                 #   baseSchemaFields, baseSchemaOptions
│   │   └── mixins/               #   authMixin (login attempts, lockout)
│   ├── modules/domain/           # Domain modules (70 files, 2,912 LOC)
│   │   ├── press-releases/       #   7 Secom-specific domain modules
│   │   ├── media-contacts/       #   Each follows identical structure:
│   │   ├── clippings/            #     controllers/, services/, repositories/,
│   │   ├── events/               #     models/, routes/, validators/, events/,
│   │   ├── appointments/         #     types/, tests/, index.ts
│   │   ├── citizen-portal/       #
│   │   └── social-media/         #
│   ├── platform/                 # Multi-tenancy core (15 files, 989 LOC)
│   │   ├── database/             #   BaseRepository, tenantAware mixin
│   │   ├── events/               #   EventBus, domain event catalog
│   │   └── tenants/              #   Tenant model, service, middleware, routes
│   ├── queues/                   # BullMQ queues (2 files, 59 LOC)
│   ├── routes/                   # Platform routes (8 files, 811 LOC)
│   │   ├── v1/                   #   Version 1 router aggregator
│   │   ├── auth.ts               #   Auth routes (login, register, etc.)
│   │   ├── dashboard/            #   Dashboard summary endpoint
│   │   ├── monitoring/           #   Health, readiness, liveness, metrics
│   │   ├── uploads/              #   File upload/delete
│   │   ├── users/                #   User management (admin)
│   │   ├── validations/          #   Auth validation schemas
│   │   └── webhooks/             #   Webhook subscription management
│   ├── seeds/                    # Default tenant seeder (1 file, 54 LOC)
│   ├── services/                 # Platform services (14 files, 799 LOC)
│   │   ├── auth/                 #   Auth service, helpers, token blacklist
│   │   ├── cache/                #   CacheService (Redis wrapper)
│   │   ├── external/             #   Email service + templates
│   │   ├── queue/                #   Queue service facade
│   │   ├── storage/              #   Storage service (local/S3 adapter)
│   │   └── webhooks/             #   Webhook dispatch service
│   ├── types/                    # Express type augmentation (1 file, 12 LOC)
│   ├── utils/                    # Utilities (10 files, 318 LOC)
│   │   ├── errors/               #   AppError hierarchy, error codes, logger
│   │   └── monitoring/           #   Memory usage monitor
│   └── validation/               # Zod validation middleware (3 files, 37 LOC)
├── tests/                        # Test suite (11 files, 877 LOC)
│   ├── unit/                     #   Unit tests (models, platform, services)
│   ├── integration/              #   Integration tests (auth, invite, users)
│   ├── helpers/                  #   (empty)
│   ├── smoke/                    #   (empty)
│   └── mocks/                    #   UUID mock
├── migrations/                   # Database migrations (1 placeholder file)
├── scripts/                      # Utility scripts (4 files)
├── uploads/                      # Local file storage directory
├── .env.example                  # Environment template
├── .env.test                     # Test environment
├── jest.config.js                # Jest configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

### 3.2 Directory-by-Directory Analysis

| Directory | Files | LOC | Naming Convention | Responsibility | Organization |
|---|---|---|---|---|---|
| `src/config/` | 11 | 491 | `camelCase.ts` | Environment, DB, RBAC, security, swagger, logging, monitoring | Layer-based |
| `src/middleware/` | 13 | 537 | `camelCase.ts` | Auth, security, rate limiting, error handling, pagination, audit | Layer-based |
| `src/models/` | 11 | 335 | `PascalCase.ts` | Mongoose schemas for platform entities (User, AuditLog, etc.) | Layer-based |
| `src/modules/domain/` | 70 | 2,912 | `kebab-case.*.ts` | 7 domain modules, each self-contained | Domain-driven |
| `src/platform/` | 15 | 989 | Mixed | Multi-tenancy core: BaseRepository, EventBus, TenantContext | Feature-based |
| `src/routes/` | 8 | 811 | `kebab-case.routes.ts` | Platform route definitions (auth, users, uploads, webhooks) | Layer-based |
| `src/services/` | 14 | 799 | `camelCase.ts` | Business logic for auth, email, cache, storage, webhooks | Layer-based |
| `src/utils/` | 10 | 318 | `camelCase.ts` | Error classes, masking, date serialization, health checks | Layer-based |
| `src/queues/` | 2 | 59 | `camelCase.ts` | BullMQ queue/worker definitions | Layer-based |
| `src/constants/` | 3 | 56 | `camelCase.ts` | Validation limits, rate limit values, DB constants | Layer-based |
| `src/validation/` | 3 | 37 | `camelCase.ts` | Zod validation middleware and shared schemas | Layer-based |
| `src/seeds/` | 1 | 54 | `camelCase.ts` | Default tenant + admin seeder | Layer-based |
| `tests/` | 11 | 877 | `*.test.ts` | Unit and integration tests | Mirror of src structure |

### 3.3 Domain Module Internal Structure

Each of the 7 domain modules follows an identical structure (CLI-generated):

```
modules/domain/<name>/
├── controllers/    <name>.controller.ts     # Request handling, delegates to service
├── services/       <name>.service.ts        # Business logic, emits events
├── repositories/   <name>.repository.ts     # Data access, extends BaseRepository
├── models/         <Name>.ts                # Mongoose schema + model
├── routes/         <name>.routes.ts         # Express router with auth + validation
├── validators/     <name>.validator.ts      # Zod schemas
├── events/         <name>.events.ts         # Event type constants
├── types/          index.ts                 # TypeScript interfaces and DTOs
├── tests/          fixtures/, integration/, unit/
└── index.ts                                 # Barrel export
```

Average module size: ~416 LOC across 10 files. No file exceeds 141 LOC within domain modules.

### 3.4 Summary Statistics

| Metric | Value |
|---|---|
| Total source files | 164 `.ts` files |
| Total source LOC | ~7,669 |
| Total test files | 11 |
| Total test LOC | 877 |
| Test-to-source ratio | ~11.4% (LOC) |
| Largest file | `authService.ts` (350 LOC) |
| Domain modules | 7 |
| Domain module files | 70 (42.7% of total) |
| Domain module LOC | 2,912 (38.0% of total) |
| Average file size | ~47 LOC |
| Files > 200 LOC | 3 (`authService.ts`, `auth.ts` routes, `app.ts`) |
| Files > 500 LOC | 0 |

### 3.5 Structural Observations

**Strengths:**
- No "god files" — the largest file is 350 LOC, well within maintainability thresholds
- Domain modules are highly consistent due to CLI generation — onboarding a new module is predictable
- Clear separation between platform (`src/platform/`, `src/services/`, `src/middleware/`) and domain (`src/modules/domain/`)
- Barrel exports (`index.ts`) in each module provide clean public APIs

**Concerns:**
- 🟧 **Platform routes live outside the platform directory**: `src/routes/auth.ts`, `src/routes/users/`, `src/routes/dashboard/` contain business logic (direct model queries) rather than delegating to services. This breaks the layered pattern used by domain modules
- 🟨 **Dual organization strategy**: Platform code uses layer-based organization (routes/, services/, models/ at top level) while domain code uses feature-based organization (modules/domain/<name>/). This is intentional but creates two mental models
- 🟨 **Empty test directories**: `tests/helpers/`, `tests/smoke/`, and most `tests/unit/modules/` and `tests/integration/modules/` directories are empty — scaffolded but not populated
- 🟩 **Migration framework is placeholder-only**: The single migration file is a no-op. Schema management relies entirely on Mongoose auto-creation
