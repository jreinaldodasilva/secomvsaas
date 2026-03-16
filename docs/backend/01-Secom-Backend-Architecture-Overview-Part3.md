# Secom Backend Architecture Overview — Part 3

> **Configuration Management · Architecture & Design Patterns · Recommendations**

---

## 6. Configuration Management

### 6.1 Environment Variables

The application uses `dotenv` for environment loading. Configuration is centralized in `src/config/env.ts` which exports a typed `EnvConfig` object.

#### Variable Inventory (from `.env.example`)

| Variable | Category | Required | Default | Notes |
|---|---|---|---|---|
| `NODE_ENV` | Runtime | No | `development` | |
| `PORT` | Runtime | No | `5000` | |
| `DATABASE_URL` | Database | Yes (dev+prod) | `mongodb://localhost:27017/secom` | |
| `REDIS_URL` | Cache | No | `redis://localhost:6379` | |
| `JWT_SECRET` | Auth | Yes | Fallback in dev | Must be ≥64 chars |
| `JWT_REFRESH_SECRET` | Auth | Yes | Fallback in dev | Must be ≥64 chars |
| `PORTAL_JWT_SECRET` | Auth | Yes | Fallback in dev | Must be ≥64 chars |
| `JWT_EXPIRES_IN` | Auth | No | `15m` | |
| `ACCESS_TOKEN_EXPIRES` | Auth | No | `15m` | Duplicate of JWT_EXPIRES_IN |
| `REFRESH_TOKEN_EXPIRES_DAYS` | Auth | No | `7` | |
| `PORTAL_REFRESH_TOKEN_EXPIRES_DAYS` | Auth | No | `7` | |
| `MAX_REFRESH_TOKENS_PER_USER` | Auth | No | `5` | |
| `CSRF_SECRET` | Security | Yes (prod) | Fallback in dev | Must be ≥32 chars in prod |
| `FRONTEND_URL` | CORS | Yes (dev+prod) | `http://localhost:3000` | |
| `ADMIN_URL` | CORS | No | — | Optional additional CORS origin |
| `MOBILE_URL` | CORS | No | — | Optional additional CORS origin |
| `FROM_EMAIL` | Email | No | `noreply@vsaas.app` | |
| `ADMIN_EMAIL` | Email | No | `admin@vsaas.app` | |
| `MOCK_EMAIL_SERVICE` | Feature Flag | No | `false` | Set `true` to skip email delivery |
| `MOCK_SMS_SERVICE` | Feature Flag | No | `false` | Set `true` to skip SMS delivery |
| `ETHEREAL_USER` | Email (dev) | No | — | Ethereal SMTP for dev |
| `ETHEREAL_PASS` | Email (dev) | No | — | |
| `SENDGRID_API_KEY` | Email (prod) | Yes (prod) | — | Must start with `SG.` |
| `TWILIO_ACCOUNT_SID` | SMS | No | — | |
| `TWILIO_AUTH_TOKEN` | SMS | No | — | |
| `TWILIO_PHONE_NUMBER` | SMS | No | — | |
| `STRIPE_SECRET_KEY` | Payments | No | — | Not integrated |
| `STRIPE_WEBHOOK_SECRET` | Payments | No | — | Not integrated |
| `AWS_REGION` | Storage | No | `us-east-1` | |
| `AWS_ACCESS_KEY_ID` | Storage | No | — | |
| `AWS_SECRET_ACCESS_KEY` | Storage | No | — | |
| `AWS_S3_BUCKET` | Storage | No | `vsaas-files` | |
| `LOG_LEVEL` | Logging | No | `info` | |
| `DETAILED_ERRORS` | Logging | No | `false` | Stack traces in error responses |
| `COOKIE_SECURE` | Security | No | `false` | Should be `true` in prod |
| `TRUST_PROXY` | Security | No | `0` | |
| `VERIFY_USER_ON_REQUEST` | Security | No | `true` | DB check on every authenticated request |
| `SENTRY_DSN` | Monitoring | No | — | Enables Sentry if set |
| `DEFAULT_ADMIN_PASSWORD` | Seed | Yes (prod) | `Admin@Secom2024` (dev) | |
| `AUDIT_LOG_TTL_DAYS` | Data | No | `90` | Audit log retention |

### 6.2 Configuration Validation

The `validateEnv()` function in `src/config/env.ts` performs environment-specific validation:

**Production checks (errors — will throw):**
- CSRF_SECRET ≥ 32 chars
- JWT_SECRET ≥ 64 chars
- JWT_REFRESH_SECRET ≥ 64 chars
- PORTAL_JWT_SECRET ≥ 64 chars
- DATABASE_URL is valid MongoDB URI
- SENDGRID_API_KEY starts with `SG.`
- FRONTEND_URL is a valid URL

**Production checks (warnings — logged only):**
- COOKIE_SECURE should be `true`
- DETAILED_ERRORS should be `false`

**Development checks (errors):**
- JWT_SECRET ≥ 64 chars
- JWT_REFRESH_SECRET ≥ 64 chars
- PORTAL_JWT_SECRET ≥ 64 chars
- DATABASE_URL is required
- FRONTEND_URL is required

### 6.3 Environment Separation

| Environment | Config Source | Database | Notes |
|---|---|---|---|
| Development | `.env` (gitignored) + `.env.example` template | Local MongoDB | Mock email/SMS enabled |
| Test | `.env.test` (committed) | mongodb-memory-server | Silent logging, mocked services |
| Production | Environment variables (no file) | External MongoDB | Strict validation, SendGrid required |

### 6.4 Secrets Management

- **Development**: Secrets are in `.env` files (gitignored). `.env.example` provides templates with placeholder values
- **Test**: `.env.test` contains test-only secrets (committed to repo — acceptable since they are test-only values)
- **Production**: Expected to be injected via environment variables (no secrets management service integration)
- **Generation**: `scripts/generate-secrets.js` exists at the monorepo root for generating random secrets

### 6.5 Configuration Observations

**Strengths:**
- Typed configuration object (`EnvConfig`) provides IDE autocompletion and compile-time safety
- Environment validation runs at startup, failing fast on misconfiguration
- Production validation is stricter than development — good security posture
- Feature flags (`MOCK_EMAIL_SERVICE`, `MOCK_SMS_SERVICE`) allow graceful degradation

**Concerns:**
- 🟥 **Development fallback secrets in code**: `env.ts` contains hardcoded fallback values for JWT secrets (`'development-jwt-secret'`), CSRF secret (`'development-csrf-secret'`), and the default admin password (`'Admin@Secom2024'`). While `validateEnv()` requires proper secrets, the fallbacks in `getEnvConfig()` mean the app could theoretically start with weak secrets if validation is bypassed or if a code path reads `env.jwt.secret` before `validateEnv()` runs.
- 🟥 **Default admin password in source code**: `seeds/defaultTenant.ts` contains `'Admin@Secom2024'` as a fallback password for non-production environments. This is documented in the README but is still a risk if the development database is exposed.
- 🟨 **Duplicate token expiry config**: Both `JWT_EXPIRES_IN` and `ACCESS_TOKEN_EXPIRES` exist and serve the same purpose. `env.jwt.expiresIn` and `env.auth.accessTokenExpires` are separate fields that could diverge.
- 🟨 **No schema validation for env vars**: The validation in `validateEnv()` is imperative (if/else chains). A Zod schema for environment variables would be more maintainable and self-documenting.
- 🟩 **No secrets rotation mechanism**: JWT secrets are static. Consider documenting a rotation procedure or supporting multiple active secrets during rotation windows.

---

## 7. Architecture & Design Patterns

### 7.1 Architecture Style

The Secom backend is a **modular monolith** with a **layered + domain-modular hybrid** organization:

- **Platform layer** (horizontal): Shared infrastructure — tenancy, auth, events, database, middleware
- **Domain layer** (vertical): Self-contained business modules, each with its own controller → service → repository → model stack

This is neither pure MVC nor pure Clean Architecture, but a pragmatic blend that prioritizes consistency and developer productivity via CLI-generated modules.

### 7.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HTTP Client                                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                      Express Middleware Stack                        │
│  ┌─────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌───────┐ ┌────────────┐  │
│  │ Helmet  │ │ CORS │ │ Rate │ │ CSRF │ │ Audit │ │ Tenant     │  │
│  │         │ │      │ │ Limit│ │      │ │ Log   │ │ Resolver   │  │
│  └─────────┘ └──────┘ └──────┘ └──────┘ └───────┘ └────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                         Route Layer                                  │
│  ┌──────────────────────┐  ┌────────────────────────────────────┐   │
│  │   Platform Routes    │  │        Domain Module Routes        │   │
│  │  /auth /users /tenants│  │  /press-releases /clippings ...   │   │
│  └──────────┬───────────┘  └──────────────┬─────────────────────┘   │
└─────────────┼─────────────────────────────┼─────────────────────────┘
              │                             │
┌─────────────▼─────────────────────────────▼─────────────────────────┐
│                       Controller Layer                               │
│         (Request parsing, response formatting, delegates to service) │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                        Service Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ AuthService  │  │ TenantService│  │ Domain Services          │   │
│  │              │  │              │  │ (PressReleaseService...) │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘   │
│         │                 │                      │                   │
│         │    ┌────────────▼──────────────────────▼───────────┐      │
│         │    │         EventBus (in-process)                 │      │
│         │    │  emit() → handlers (audit, email, webhooks)   │      │
│         │    └───────────────────────────────────────────────┘      │
└─────────┼───────────────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────────────┐
│                      Repository Layer                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              BaseRepository<T> (abstract)                    │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │  TenantContext.requireTenantId() → auto-inject      │    │   │
│  │  │  tenantId into every query (find, create, update)   │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                      Data Layer                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │   MongoDB    │  │    Redis     │  │      BullMQ Queues       │   │
│  │  (Mongoose)  │  │  (ioredis)   │  │  (email, audit cleanup)  │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.3 Design Patterns Identified

| Pattern | Where Used | Implementation |
|---|---|---|
| **Repository** | `BaseRepository<T>`, all domain repositories | Abstract class with tenant-aware CRUD. Domain repos extend with custom queries |
| **Service Layer** | `AuthService`, `TenantService`, domain services | Encapsulates business logic, orchestrates repository + events |
| **Template Method** | `BaseAuthMiddleware` | Abstract class defines `authenticate()` flow; subclass provides `getCookieTokens()`, `verifyToken()`, `attachUserToRequest()` |
| **Strategy / Adapter** | `StorageService` | `StorageAdapter` interface with `LocalAdapter` and `S3Adapter` implementations, selected at runtime |
| **Observer** | `EventBus` | Publish-subscribe for domain events. Services emit, listeners react |
| **Singleton** | `eventBus`, `redisClient`, `tenantService`, `authService` | Module-level instances exported as singletons |
| **Middleware Chain** | Express middleware stack | 24-step pipeline for cross-cutting concerns |
| **Facade** | `queueService` | Thin wrapper over BullMQ queue, simplifying the email sending interface |
| **Mixin** | `authMixin`, `tenantAwareFields` | Reusable schema fields and methods composed into Mongoose schemas |
| **Barrel Export** | Every domain module `index.ts` | Clean public API per module |
| **Error Hierarchy** | `AppError` → `ValidationError`, `NotFoundError`, `UnauthorizedError`, etc. | Typed error classes mapped to HTTP status codes |
| **Envelope Pattern** | `responseWrapper` middleware | All responses normalized to `{ success, data, error, meta }` |

### 7.4 Multi-Tenancy Architecture

The multi-tenancy implementation is the most architecturally significant pattern:

```
Request → resolveTenant middleware → setTenantContext middleware
                                          │
                                    AsyncLocalStorage.run({ tenantId })
                                          │
                                    ┌─────▼─────┐
                                    │ Controller │
                                    └─────┬─────┘
                                          │
                                    ┌─────▼─────┐
                                    │  Service   │
                                    └─────┬─────┘
                                          │
                                    ┌─────▼──────────────┐
                                    │  BaseRepository     │
                                    │  getTenantFilter()  │──→ TenantContext.requireTenantId()
                                    │  mergeFilter()      │    (reads from AsyncLocalStorage)
                                    └─────┬──────────────┘
                                          │
                                    ┌─────▼─────┐
                                    │  MongoDB   │  ← every query includes { tenantId: ... }
                                    └───────────┘
```

**Tenant resolution order**: JWT claim → `X-Tenant-Id` header → subdomain extraction

**Isolation guarantee**: `BaseRepository.mergeFilter()` injects `tenantId` into every query. The `tenantAware` mixin prevents `tenantId` modification after document creation via a `pre('save')` hook.

### 7.5 RBAC Architecture

```
Roles (6):  super_admin > admin > assessor > social_media > atendente > citizen
                │
                ▼
Permissions (21):  resource:action format (e.g., press-releases:write)
                │
                ▼
ROLE_PERMISSIONS registry:  Maps each role to its permission set
                │
                ▼
authorizeWithPermissions() middleware:  Checks role + permissions per route
```

- `super_admin` bypasses all permission checks
- Role hierarchy is numeric (100 → 10) for comparison
- Permissions follow `resource:action` naming (`read`, `write`, `delete`)
- Each domain module route applies specific permission checks

### 7.6 Event-Driven Architecture

```
Domain Service                    EventBus (in-process)              Listeners
─────────────                    ──────────────────────              ─────────
pressReleaseService.create()  →  eventBus.emit('press-release.created')  →  (no listeners yet)
authService.login()           →  eventBus.emit('user.logged_in')         →  (no listeners yet)
authService.login() [locked]  →  eventBus.emit('user.account_locked')    →  Send account locked email
tenantService.create()        →  eventBus.emit('tenant.created')         →  (no listeners yet)
```

**Current state**: The EventBus infrastructure is well-designed but underutilized. Only one listener is registered (`ACCOUNT_LOCKED` → email). Most events are emitted but not consumed. This is appropriate for a boilerplate — listeners are added as business requirements emerge.

**Scaling limitation**: The EventBus is an in-memory singleton. Events are not visible across processes. The codebase documents three migration paths (Redis Pub/Sub, BullMQ, MongoDB event log) in the EventBus source comments.

### 7.7 Dependency Direction

```
Routes → Controllers → Services → Repositories → Models
                          │              │
                          ▼              ▼
                       EventBus    TenantContext (AsyncLocalStorage)
                          │
                          ▼
                    External Services (email, cache, storage)
```

Dependencies flow **inward and downward**:
- Routes depend on controllers (or directly on services for platform routes)
- Controllers depend on services
- Services depend on repositories and platform utilities
- Repositories depend on models and TenantContext
- Models are leaf nodes (no outward dependencies)

**No circular dependencies** were observed. Domain modules do not depend on each other — they are fully independent.

### 7.8 Dependency Injection

The codebase does **not use a DI container**. Dependencies are resolved via:
- **Module-level singletons**: `export const authService = new AuthService()` — instantiated at import time
- **Constructor instantiation**: Domain services create their own repository in the constructor (`this.repository = new PressReleaseRepository()`)
- **Direct imports**: Services import other services directly

This is simple and works for the current scale but makes unit testing harder — mocking requires module-level interception (e.g., `jest.mock()`).

### 7.9 Cross-Cutting Concerns

| Concern | Implementation | Scope |
|---|---|---|
| Authentication | `authenticate` middleware (JWT from cookie/header) | Per-route |
| Authorization | `authorize()` (role-based) + `authorizeWithPermissions()` (permission-based) | Per-route |
| Tenant isolation | `resolveTenant` + `setTenantContext` + `BaseRepository` | Global (middleware) + data layer |
| Validation | Zod schemas (domain) + express-validator (auth) | Per-route |
| Error handling | Centralized `errorHandler` middleware | Global |
| Audit logging | `auditLogger` middleware + `AuditLog` model | Global (authenticated requests) |
| Rate limiting | Per-route rate limiters with Redis store | Per-route group |
| CSRF protection | Double-submit cookie via `csrf-csrf` | Global (write operations) |
| Request ID | UUID middleware + `X-Request-ID` header | Global |
| Response normalization | `responseWrapper` middleware | Global |
| Logging | Pino structured logging with log sanitization | Global |

### 7.10 Architecture Observations

**Strengths:**
- The multi-tenancy implementation via AsyncLocalStorage + BaseRepository is elegant and provides strong isolation guarantees without requiring tenant-aware code in every service
- The domain module pattern is highly consistent — adding a new module is mechanical and predictable
- The RBAC system is well-designed with clear separation between roles, permissions, and the registry
- The error hierarchy provides consistent error responses across the entire API
- The middleware stack is comprehensive and well-ordered for security

**Concerns:**
- 🟧 **Platform routes bypass the layered pattern**: `user.routes.ts` and `dashboard.routes.ts` query Mongoose models directly instead of going through a service/repository layer. This creates inconsistency with domain modules and makes these routes harder to test
- 🟧 **In-memory EventBus is a scaling bottleneck**: The current EventBus cannot distribute events across multiple server instances. This is documented but will require migration before horizontal scaling
- 🟨 **No DI container**: Constructor-level dependency creation couples services to their concrete dependencies. This is acceptable at current scale but will complicate testing and refactoring as the codebase grows
- 🟨 **Singleton services are stateful**: `AuthService`, `TenantService`, etc. are instantiated at module load time. This makes it harder to configure them differently per test or per environment
- 🟩 **Dashboard route has direct model imports from 7 modules**: `dashboard.routes.ts` imports models from all domain modules, creating a fan-in dependency. A dedicated dashboard service would be cleaner

---

## 8. Initial High-Level Recommendations

### 8.1 Prioritized by Severity

#### 🟥 Critical

| # | Finding | Recommendation |
|---|---|---|
| 1 | Hardcoded fallback secrets in `env.ts` (`'development-jwt-secret'`, etc.) | Remove fallback values for security-sensitive config. Require explicit env vars in all environments |
| 2 | Default admin password in source code (`'Admin@Secom2024'`) | Require `DEFAULT_ADMIN_PASSWORD` env var in all environments, remove hardcoded fallback |

#### 🟧 High

| # | Finding | Recommendation |
|---|---|---|
| 3 | Low test coverage (11 test files / 877 LOC for ~7,600 LOC source) | Prioritize tests for auth flows, tenant isolation, and RBAC — the highest-risk areas |
| 4 | Platform routes (`user.routes.ts`, `dashboard.routes.ts`) bypass service/repository layer | Refactor to use service classes consistent with domain module pattern |
| 5 | In-memory EventBus limits horizontal scaling | Plan migration to Redis Pub/Sub or BullMQ-based event distribution before scaling |
| 6 | BullMQ workers run in the same process as HTTP server | Consider separate worker process for production deployments |

#### 🟨 Medium

| # | Finding | Recommendation |
|---|---|---|
| 7 | Dual validation libraries (Zod + express-validator) | Consolidate on Zod for all validation |
| 8 | Unused dependencies (Stripe, Twilio) inflate bundle and attack surface | Remove until actively needed |
| 9 | Audit logger writes to MongoDB on every authenticated request | Consider sampling, batching, or limiting to write operations |
| 10 | Duplicate token expiry config (`JWT_EXPIRES_IN` vs `ACCESS_TOKEN_EXPIRES`) | Consolidate to a single env var |
| 11 | Migration framework is placeholder-only | Implement proper migrations for schema changes and index management |
| 12 | No DI container — services create their own dependencies | Evaluate lightweight DI (e.g., constructor injection) for improved testability |

#### 🟩 Low

| # | Finding | Recommendation |
|---|---|---|
| 13 | ESLint and @typescript-eslint are 2+ major versions behind | Plan upgrade to ESLint 9 + @typescript-eslint v8 |
| 14 | swagger-jsdoc v6 → v7 available | Upgrade for better TypeScript and OpenAPI 3.1 support |
| 15 | otplib present but MFA not implemented | Either implement MFA flow or remove dependency |
| 16 | Event listeners registered after server starts | Move `registerAuthEventListeners()` before `app.listen()` |
| 17 | Empty test directories (helpers/, smoke/, unit/modules/) | Populate or remove scaffolded empty directories |

### 8.2 Architecture Evolution Considerations

- **Horizontal scaling**: The main blockers are the in-memory EventBus and co-located BullMQ workers. Address these before deploying multiple instances behind a load balancer.
- **Module boundaries**: The domain modules are well-isolated. If the system grows significantly, they could be extracted into separate services with minimal refactoring due to the consistent interface pattern.
- **API versioning**: The v1 router structure is ready for v2 introduction. The README documents the versioning strategy.
- **Observability**: Sentry integration is present but optional. Consider adding structured metrics (e.g., Prometheus) and distributed tracing (e.g., OpenTelemetry) for production monitoring.

---

*Document generated from static analysis of the secomvsaas backend codebase. All findings are based on observable code and configuration as of the analysis date.*
