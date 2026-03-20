# Secom Backend — Architecture Overview (Part 2 of 3)

> **Document scope:** Application bootstrap & lifecycle, configuration management, and architecture & design patterns.
> **Parts:** [Part 1 — Stack, Structure, Dependencies](./overview-part-1.md) · [Part 2 — Bootstrap, Config, Architecture] · [Part 3 — Secom Patterns, Recommendations](./overview-part-3.md)

---

## 4. Application Bootstrap & Runtime Lifecycle

### 4.1 Entry Points

The backend has two independent entry points:

| File | Role | Command |
|---|---|---|
| `src/server.ts` | HTTP API server | `npm run dev` / `node dist/server.js` |
| `src/worker.ts` | Background job worker | `npm run dev:worker` / `node dist/worker.js` |

In development, both processes are typically run together. In production, they can be deployed as separate containers or processes, which is the intended scaling model.

### 4.2 Server Startup Sequence (`server.ts`)

```
1. initializeMonitoring()       — Sentry SDK init (no-op if SENTRY_DSN absent)
2. validateEnv()                — Zod schema parse of process.env; fatal on failure
3. [module load] app.ts         — Express app factory (middleware stack assembled)
4. loadSecrets()                — Secrets loader (env/aws-ssm/aws-secrets backend)
5. connectToDatabase()          — Mongoose connect with exponential retry (3 attempts)
6. ensureDefaultTenant()        — Idempotent seed: creates 'secom' tenant + admin user
7. app.listen(PORT)             — HTTP server starts accepting connections
8. SIGTERM/SIGINT handlers      — Graceful shutdown registered
```

**Graceful shutdown sequence:**
```
SIGTERM/SIGINT received
  → server.close()             — stop accepting new connections
  → redisClient.quit()         — close Redis connection
  → closeDatabaseConnection()  — close Mongoose connection
  → process.exit(0)
  [10s timeout → process.exit(1) if stalled]
```

### 4.3 Worker Startup Sequence (`worker.ts`)

```
1. validateEnv()
2. loadSecrets()
3. connectToDatabase()
4. registerAuthEventListeners()  — subscribe auth events to eventBus
5. eventBus.startWorker()        — create BullMQ worker for domain-events queue
6. startEmailWorker()            — create BullMQ worker for email queue
7. startWebhookWorker()          — create BullMQ worker for webhook-delivery queue
8. scheduleAuditCleanup()        — register daily cron job (0 3 * * *)
```

**Worker graceful shutdown** closes all BullMQ workers and queues before Redis and MongoDB connections.

### 4.4 Express Middleware Stack (`app.ts`)

The middleware is applied in a deliberate order. Each layer is documented below:

```
┌─────────────────────────────────────────────────────────────┐
│  pino-http                  HTTP request logging            │
│  trust proxy                (production/TRUST_PROXY=1 only) │
│  helmet                     Security headers (CSP, HSTS...) │
│  cors                       Origin allowlist enforcement     │
│  express.json               Body parsing (10 MB limit)      │
│  express.urlencoded         Form body parsing               │
│  cookie-parser              Cookie parsing                  │
│  express-mongo-sanitize     NoSQL injection prevention      │
│  compression                Gzip (level 6)                  │
├─────────────────────────────────────────────────────────────┤
│  Rate limiters (path-specific):                             │
│    /api/v1/contact          contactLimiter (3/15min)        │
│    /api/v1/auth             authLimiter (5/15min)           │
│    /api/v1/auth/refresh     refreshLimiter (10/15min)       │
│    /api/v1/auth/*-password  passwordResetLimiter (3/1hr)    │
│    /api                     apiLimiter (100/15min)          │
├─────────────────────────────────────────────────────────────┤
│  Request ID injection       X-Request-ID header             │
│  Idempotency middleware      POST deduplication via Redis    │
│  CSRF token endpoint        GET /api/csrf-token             │
│  CSRF protection            (skips GET/HEAD/OPTIONS/test)   │
├─────────────────────────────────────────────────────────────┤
│  /api scope:                                                │
│    checkDatabaseConnection  503 if MongoDB disconnected     │
│    responseWrapper          Normalize success envelopes     │
│    auditLogger              Log write operations on finish  │
│    validatePagination       Normalize page/limit params     │
│    resolveTenant            Resolve tenant from JWT/header  │
│    setTenantContext         AsyncLocalStorage tenant scope  │
├─────────────────────────────────────────────────────────────┤
│  /api/v1                    Domain + platform routes        │
│  /api-docs                  Swagger UI                      │
│  /api/health                Health check endpoints          │
│  /health                    Liveness probe (no auth)        │
├─────────────────────────────────────────────────────────────┤
│  * (catch-all)              NotFoundError                   │
│  errorHandler               Centralized error serialization │
├─────────────────────────────────────────────────────────────┤
│  process.on('unhandledRejection')  Log + continue           │
│  process.on('uncaughtException')   Log + exit(1) in prod    │
└─────────────────────────────────────────────────────────────┘
```

### 4.5 Route Registration

All API routes are registered under `/api/v1/` via `src/routes/v1/index.ts`:

```
/api/v1/
├── auth/                    Staff authentication (login, register, refresh, logout...)
├── citizen-auth/            Citizen portal authentication
├── health/                  Health checks (/, /ready, /live, /metrics)
├── tenants/                 Tenant management (super_admin)
├── users/                   User management (admin+)
├── uploads/                 File upload endpoint
├── webhooks/subscriptions/  Webhook subscription management
├── dashboard/               Aggregated dashboard data
├── press-releases/          Domain module
├── media-contacts/          Domain module
├── clippings/               Domain module
├── events/                  Domain module
├── appointments/            Domain module
├── citizen-portal/          Domain module
└── social-media/            Domain module
```

### 4.6 Health Check Endpoints

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /health` | None | Liveness probe — always returns 200 |
| `GET /api/v1/health` | None | Readiness — checks MongoDB + Redis |
| `GET /api/v1/health/ready` | None | Kubernetes readiness probe |
| `GET /api/v1/health/live` | None | Kubernetes liveness probe |
| `GET /api/v1/health/metrics` | admin+ | Process memory and uptime |

### 4.7 Bootstrap Observations

**Strengths:**
- Monitoring is initialized before environment validation, ensuring Sentry captures startup failures.
- `validateEnv()` is called before any async operations — the server refuses to start with a clear error message rather than failing silently later.
- `ensureDefaultTenant()` is idempotent and uses a MongoDB transaction, preventing partial state on repeated runs.
- Graceful shutdown handles all three connection types (HTTP, Redis, MongoDB) with a 10-second hard timeout.

**Concerns:**
- 🟧 In development, `server.ts` and `worker.ts` are separate processes but share the same Redis and MongoDB connections. There is no process supervisor (e.g., PM2, Docker Compose `depends_on`) ensuring the worker starts alongside the server. The `npm run dev:all` script (defined at the workspace root) handles this, but it is not enforced.
- 🟨 `ensureDefaultTenant()` runs on every server startup. While idempotent, it performs a MongoDB query on every cold start. This is negligible at current scale but could be guarded with a startup flag in high-frequency restart scenarios.
- 🟨 The `app.ts` module is loaded via `import app from './app'` after `validateEnv()` but the module-level code in `app.ts` (rate limiter instantiation, CORS config) runs at import time, before `loadSecrets()`. This means rate limiters connect to Redis before secrets are loaded — acceptable since Redis credentials are not secrets in this architecture, but worth noting.

---

## 5. Configuration & Environment Management

### 5.1 Environment Variables

All environment variables are validated at startup by a Zod schema in `src/config/env.ts`. The schema is the authoritative source of truth for all configuration.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `NODE_ENV` | No | `development` | Runtime environment |
| `PORT` | No | `5000` | HTTP server port |
| `DATABASE_URL` | **Yes** | — | MongoDB connection string |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection URL |
| `REDIS_SENTINEL_HOSTS` | No | — | Comma-separated sentinel host:port list |
| `REDIS_SENTINEL_NAME` | No | `mymaster` | Sentinel master name |
| `JWT_SECRET` | **Yes** | — | Access token signing key (≥64 chars) |
| `JWT_REFRESH_SECRET` | **Yes** | — | Refresh token signing key (≥64 chars) |
| `PORTAL_JWT_SECRET` | **Yes** | — | Citizen portal JWT key (≥64 chars) |
| `ACCESS_TOKEN_EXPIRES` | No | `15m` | Access token TTL |
| `REFRESH_TOKEN_EXPIRES_DAYS` | No | `7` | Refresh token TTL in days |
| `PORTAL_REFRESH_TOKEN_EXPIRES_DAYS` | No | `7` | Portal refresh token TTL |
| `MAX_REFRESH_TOKENS_PER_USER` | No | `5` | Max concurrent sessions |
| `CSRF_SECRET` | **Yes** | — | CSRF token signing key (≥32 chars in prod) |
| `FRONTEND_URL` | **Yes** | — | CORS allowed origin |
| `ADMIN_URL` | No | — | Additional CORS origin |
| `MOBILE_URL` | No | — | Additional CORS origin |
| `FROM_EMAIL` | No | `noreply@secom.gov.br` | Email sender address |
| `ADMIN_EMAIL` | No | `admin@secom.gov.br` | Admin notification address |
| `MOCK_EMAIL_SERVICE` | No | `false` | Disable real email delivery |
| `SENDGRID_API_KEY` | Prod only | — | SendGrid API key |
| `ETHEREAL_USER` / `ETHEREAL_PASS` | No | — | Ethereal SMTP credentials |
| `AWS_REGION` | No | — | AWS region for S3 |
| `AWS_S3_BUCKET` | No | — | S3 bucket name |
| `AWS_ACCESS_KEY_ID` | No | — | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | No | — | AWS secret key |
| `LOG_LEVEL` | No | `info` | Pino log level |
| `DETAILED_ERRORS` | No | `false` | Include stack traces in error responses |
| `COOKIE_SECURE` | No | `false` | Require HTTPS for cookies |
| `TRUST_PROXY` | No | `0` | Express trust proxy setting |
| `VERIFY_USER_ON_REQUEST` | No | `true` | Check user active status per request |
| `API_RATE_LIMIT_MAX` | No | `100` | API rate limit (requests/window) |
| `CONTACT_RATE_LIMIT_MAX` | No | `5` | Contact form rate limit |
| `SENTRY_DSN` | No | — | Sentry error reporting DSN |
| `SECRETS_BACKEND` | No | `env` | Secrets source: `env`, `aws-ssm`, `aws-secrets` |
| `AUDIT_LOG_TTL_DAYS` | No | `90` | Audit log retention in days |
| `DEFAULT_ADMIN_PASSWORD` | **Yes** (first run) | — | Initial admin password for seeding |

### 5.2 Environment Files

| File | Purpose | Committed |
|---|---|---|
| `.env.example` | Template with all variables documented | ✅ Yes |
| `.env` | Local development overrides | ❌ No (gitignored) |
| `.env.staging` | Staging configuration template | ✅ Yes |
| `.env.test` | Test environment (fixed secrets) | ✅ Yes |

### 5.3 Configuration Architecture

The `env.ts` module implements a **validated, shaped configuration** pattern:

1. `dotenv.config()` loads `.env` into `process.env`
2. `envSchema.safeParse(process.env)` validates and coerces all values
3. On failure, a formatted error message lists all invalid fields and the process exits
4. On success, a typed `env` object is exported with a structured shape (e.g., `env.jwt.secret`, `env.redis.url`)
5. `validateEnv()` is a no-op validator kept for call-site compatibility; it emits production warnings

**Production-specific validations enforced by Zod:**
- JWT secrets must be ≥64 characters
- CSRF secret must be ≥32 characters
- `DATABASE_URL` must be a valid MongoDB URI
- `FRONTEND_URL` must be a valid URL
- `SENDGRID_API_KEY` must start with `SG.`

### 5.4 Secrets Management

The `src/config/secrets/secretsLoader.ts` module abstracts secret loading behind a `SECRETS_BACKEND` switch:

| Backend | Behavior | Recommended For |
|---|---|---|
| `env` | Reads from validated `env` object | Development, CI |
| `aws-ssm` | Secrets injected by deployment pipeline; reads from env | Staging, Production |
| `aws-secrets` | **Not implemented** — throws `Error` at startup | — |

**Important:** The `aws-secrets` backend is documented in comments and `.env.example` but throws a runtime error. The `@aws-sdk/client-secrets-manager` package is not installed. This is a known gap, not a bug in the current deployment model.

The `loadSecrets()` function returns a frozen `AppSecrets` object, but the returned object is not currently used by any consumer — secrets are read directly from `env.*` throughout the codebase. The loader exists as an abstraction layer for future rotation support.

### 5.5 Configuration Observations

**Strengths:**
- Zod validation at startup provides fail-fast behavior with clear error messages.
- Environment-specific validation rules (production requires longer secrets, valid SendGrid key) prevent misconfiguration from reaching production.
- The shaped `env` object prevents scattered `process.env` reads throughout the codebase.
- Production warnings (e.g., `COOKIE_SECURE` not set) are logged without crashing.

**Concerns:**
- 🟥 `SECRETS_BACKEND=aws-secrets` is advertised but crashes the server. Any operator following the `.env.example` documentation for production could inadvertently select this option.
- 🟧 AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) are loaded from environment variables with no enforcement of IAM role-based access. In production on AWS, these should be empty and the SDK should use the instance/task role.
- 🟨 `DEFAULT_ADMIN_PASSWORD` is required on first run but has no minimum length or complexity validation in the Zod schema. A weak password could be set without warning.
- 🟨 The `VERIFY_USER_ON_REQUEST=false` option is documented as "never use in production" but is not enforced by the Zod schema — it can be set to `false` in production without a warning.
- 🟩 Rate limit constants (`API_RATE_LIMIT_MAX`, `CONTACT_RATE_LIMIT_MAX`) are configurable via environment but the `authLimiter` and `refreshLimiter` use hardcoded constants from `src/constants/validation.ts` rather than the env-configured values, creating an inconsistency.

---

## 6. Architecture & Design Patterns

### 6.1 Overall Architecture

The Secom backend is a **modular monolith** with domain-driven organization. All business logic runs in a single deployable unit (the Node.js process), but the code is organized into isolated domain modules that could theoretically be extracted into separate services.

```
┌─────────────────────────────────────────────────────────────────┐
│                        HTTP Clients                             │
│              (Browser, Mobile, API consumers)                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                    Express HTTP Server                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Middleware Pipeline                        │   │
│  │  Helmet · CORS · Rate Limit · CSRF · Tenant · Auth     │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │                  Route Layer (/api/v1/)                 │   │
│  │  Platform Routes    │    Domain Module Routes           │   │
│  │  auth, users,       │    press-releases, media-contacts │   │
│  │  tenants, webhooks  │    clippings, events, appointments│   │
│  │  dashboard, uploads │    citizen-portal, social-media   │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │              Domain Module Layer                        │   │
│  │  Controller → Service → Repository → Mongoose Model    │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │              Platform Layer                             │   │
│  │  TenantContext · BaseRepository · EventBus              │   │
│  └──────────────────────────┬──────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────▼─────┐      ┌──────▼──────┐    ┌──────▼──────┐
    │  MongoDB  │      │    Redis    │    │  BullMQ     │
    │ (replica  │      │ (cache,     │    │  Worker     │
    │  set)     │      │  rate limit)│    │  Process    │
    └───────────┘      └─────────────┘    └─────────────┘
```

### 6.2 Layered Architecture Within Modules

Each domain module implements a strict 4-layer architecture:

```
Request
  │
  ▼
Controller          — Parses HTTP request, calls service, returns HTTP response
  │                   No business logic. Delegates entirely to service.
  ▼
Service             — Business logic, event emission, orchestration
  │                   Calls repository for data access.
  ▼
Repository          — Data access only. Extends BaseRepository.
  │                   All queries are automatically tenant-scoped.
  ▼
Mongoose Model      — Schema definition, indexes, pre-save hooks
```

**Dependency direction:** Controller → Service → Repository → Model. No layer reaches upward.

### 6.3 Design Patterns

#### Repository Pattern

`platform/database/BaseRepository.ts` provides a generic, tenant-aware base class:

- All queries automatically inject `tenantId` from `AsyncLocalStorage`
- Provides: `findById`, `findByIdOrFail`, `find`, `findPaginated`, `findOne`, `create`, `createMany`, `updateById`, `updateByIdOrFail`, `deleteById`, `softDeleteById`, `count`, `exists`
- Domain repositories extend `BaseRepository<T>` and add domain-specific query methods (e.g., `findWithFilters`, `findRecent`, `findUpcoming`)
- Pagination is capped at 100 items per page

#### Service Layer Pattern

Services are instantiated as plain classes (not singletons via DI container). Each controller creates its own service instance:

```typescript
// In controller file (module-level)
const service = new PressReleaseService();
```

Services are stateless, so multiple instances are safe. This is a pragmatic choice that avoids DI framework complexity at the cost of not being able to inject mock services without module-level mocking.

#### Event-Driven Pattern (Domain Events)

Domain events flow through `platform/events/BullMQEventBus`:

```
Service.create()
  → eventBus.emit('press-release.created', payload)
    → [production] domainEventsQueue.add(job)
      → BullMQ worker dequeues
        → eventBus.dispatch(event)
          → registered handlers (e.g., webhookService.dispatch)
    → [test] direct in-process dispatch (no Redis)
```

This provides durability (events survive process restarts) and decoupling between producers and consumers.

#### Adapter Pattern (Storage)

`StorageService` uses an adapter pattern to abstract local vs. S3 storage:

```
StorageService
  ├── LocalAdapter  (development/non-production)
  └── S3Adapter     (production when AWS_S3_BUCKET is set)
```

The adapter is selected at construction time based on environment, with no runtime switching.

#### Template Method Pattern (Auth Middleware)

`BaseAuthMiddleware` defines the authentication algorithm skeleton:

```
authenticate()
  → extractToken()          [concrete: checks Authorization header + cookie]
  → verifyToken()           [abstract: implemented by StaffAuth / CitizenAuth]
  → attachUserToRequest()   [abstract: populates req.user]
```

`StaffAuthMiddleware` and `CitizenAuthMiddleware` extend this base, differing only in cookie name, JWT secret, and user attachment logic.

#### Middleware Chain Pattern (Cross-Cutting Concerns)

Cross-cutting concerns are implemented as Express middleware applied globally:

| Concern | Middleware | Scope |
|---|---|---|
| Authentication | `authenticate` | Per-route |
| Authorization | `authorizeWithPermissions` | Per-route |
| Tenant resolution | `resolveTenant` + `setTenantContext` | All `/api` routes |
| Audit logging | `auditLogger` | All `/api` write operations |
| Response normalization | `responseWrapper` | All `/api` routes |
| Pagination | `validatePagination` | All `/api` routes |
| Idempotency | `idempotencyMiddleware` | All `/api/v1` POST routes |
| Rate limiting | Multiple limiters | Path-specific |

#### Feature Flag Pattern

Tenant-level feature flags gate module access:

```
FEATURE_FLAGS = {
  press_releases:  ['press-releases:read', 'press-releases:write', 'press-releases:delete'],
  media_contacts:  [...],
  ...
}
```

When `authorizeWithPermissions({ features: ['press_releases'] })` is used, the middleware fetches the tenant's `settings.features` from MongoDB and blocks access if the flag is `false`. Absent flags default to `true` (opt-out model).

### 6.4 Dependency Injection

The codebase does **not** use a DI container (no InversifyJS, tsyringe, etc.). Dependencies are resolved through:

1. **Module-level singletons** for platform services: `export const authService = new AuthService()`
2. **Constructor instantiation** for domain services: `const service = new PressReleaseService()` in controller files
3. **Direct imports** for utilities and configuration

This is a deliberate simplicity choice. The trade-off is that unit testing requires Jest module mocking (`jest.mock(...)`) rather than constructor injection.

### 6.5 Inter-Module Communication

Domain modules do not call each other directly. Cross-module communication happens through:

1. **Domain events** via `eventBus.emit()` — fire-and-forget, async
2. **Shared platform services** — `DashboardService` aggregates data from all module repositories (direct import, not event-based)
3. **Shared models** — `User` and `Tenant` models are imported by domain modules when needed

The `DashboardService` is the only place where the platform layer has direct dependencies on all 7 domain module repositories, creating a fan-in coupling point.

### 6.6 Architecture Diagram — Module Interactions

```
                    ┌─────────────────────────────────┐
                    │         Platform Layer           │
                    │                                 │
                    │  ┌──────────┐  ┌─────────────┐  │
                    │  │ Tenant   │  │  EventBus   │  │
                    │  │ Service  │  │  (BullMQ)   │  │
                    │  └──────────┘  └──────┬──────┘  │
                    │  ┌──────────┐         │         │
                    │  │Dashboard │◄────────┼─────────┼──── imports all repos
                    │  │ Service  │         │         │
                    │  └──────────┘         │         │
                    └───────────────────────┼─────────┘
                                            │ events
          ┌─────────────────────────────────▼──────────────────────────┐
          │                    Domain Modules                          │
          │                                                            │
          │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
          │  │press-releases│  │media-contacts│  │  clippings   │    │
          │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
          │         │ emit             │ emit             │ emit       │
          │  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐    │
          │  │   events     │  │ appointments │  │citizen-portal│    │
          │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
          │         │ emit             │ emit             │ emit       │
          │  ┌──────┴───────┐         │                  │            │
          │  │ social-media │◄────────┘◄─────────────────┘            │
          │  └──────────────┘                                         │
          └────────────────────────────────────────────────────────────┘
                    │ all emit to
          ┌─────────▼──────────────────────────────────────────────────┐
          │              BullMQ domain-events queue                    │
          │         → webhookService.dispatch() on consume             │
          └────────────────────────────────────────────────────────────┘
```

### 6.7 Testability Assessment

| Aspect | Status | Notes |
|---|---|---|
| Unit test isolation | 🟨 Partial | Services require `jest.mock()` for repository injection; no DI container |
| Integration test infrastructure | ✅ Good | MongoMemoryServer + ioredis-mock in test setup |
| Test coverage — platform | ✅ Present | eventBus, tenantService, tenantContext, tenantMiddleware, User model |
| Test coverage — domain modules | 🟥 Minimal | Only `press-release.service.test.ts` exists (2 test cases) |
| Test coverage — integration | 🟨 Partial | auth, users, invite flows covered; no domain module integration tests |
| E2E tests | 🟨 Partial | Cypress covers authentication and press-releases only |
| Test environment isolation | ✅ Good | `afterEach` clears all collections; separate test DB |

### 6.8 Scalability Assessment

| Concern | Current State | Notes |
|---|---|---|
| Horizontal scaling | 🟨 Possible with caveats | Redis-backed rate limiting and idempotency support multiple instances; BullMQ worker should run as a separate process |
| Database scaling | ✅ Ready | Replica set configured; `readPreference: primaryPreferred` for read distribution |
| Redis HA | ✅ Supported | Sentinel mode configurable via `REDIS_SENTINEL_HOSTS` |
| Job queue scaling | ✅ Good | BullMQ workers can be scaled independently |
| File storage scaling | ✅ Ready | S3 adapter available for production |
| Search scaling | 🟥 Not ready | `$regex` queries do not use indexes efficiently at scale |
| Real-time features | 🟥 Absent | No WebSocket/SSE infrastructure |
