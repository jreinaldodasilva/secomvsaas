# Secom Backend — Architecture Overview
## Part 2: Dependency Analysis & Application Bootstrap

---

## 4. Dependency Analysis

### 4.1 Production Dependencies Audit

| Package | Version | Purpose | Risk | Status |
|---|---|---|---|---|
| `express` | ^4.21.2 | HTTP framework | None known | ✅ Current |
| `mongoose` | ^8.18.0 | MongoDB ODM | None known | ✅ Current |
| `bullmq` | ^5.58.2 | Job queues | None known | ✅ Current |
| `ioredis` | ^5.7.0 | Redis client | None known | ✅ Current |
| `zod` | ^3.22.4 | Validation | None known | ✅ Current (v4 available) |
| `jsonwebtoken` | ^9.0.2 | JWT | None known | ✅ Current |
| `bcrypt` | ^6.0.0 | Password hashing | None known | ✅ Current |
| `helmet` | ^8.1.0 | Security headers | None known | ✅ Current |
| `csrf-csrf` | ^4.0.3 | CSRF protection | None known | ✅ Current |
| `express-rate-limit` | ^7.5.1 | Rate limiting | None known | ✅ Current |
| `rate-limit-redis` | ^4.2.3 | Redis rate limit store | None known | ✅ Current |
| `express-mongo-sanitize` | ^2.2.0 | NoSQL injection prevention | None known | ✅ Current |
| `pino` | ^9.11.0 | Structured logging | None known | ✅ Current |
| `pino-http` | ^10.5.0 | HTTP request logging | None known | ✅ Current |
| `nodemailer` | ^6.10.1 | Email delivery | None known | ✅ Current |
| `@aws-sdk/client-s3` | ^3.922.0 | S3 storage | None known | ✅ Current |
| `@aws-sdk/s3-request-presigner` | ^3.922.0 | S3 presigned URLs | None known | ✅ Current |
| `@sentry/node` | ^10.20.0 | Error monitoring | None known | ✅ Current |
| `@sentry/profiling-node` | ^10.20.0 | Performance profiling | None known | ✅ Current |
| `otplib` | ^12.0.1 | TOTP/MFA | None known | 🟨 Partially used — MFA fields exist on User model but no enrollment routes found |
| `isomorphic-dompurify` | ^2.26.0 | HTML sanitization | None known | 🟨 Imported as dependency but no active usage observed in route handlers |
| `multer` | ^2.1.1 | File upload handling | None known | ✅ Current |
| `compression` | ^1.8.1 | Gzip compression | None known | ✅ Current |
| `cookie-parser` | ^1.4.7 | Cookie parsing | None known | ✅ Current |
| `cors` | ^2.8.5 | CORS handling | None known | ✅ Current |
| `dotenv` | ^16.6.1 | Env file loading | None known | ✅ Current |
| `date-fns` | ^4.1.0 | Date utilities | None known | ✅ Current |
| `uuid` | ^13.0.0 | UUID generation | None known | ✅ Current |
| `swagger-jsdoc` | ^6.2.8 | OpenAPI spec generation | None known | ✅ Current |
| `swagger-ui-express` | ^5.0.1 | Swagger UI | None known | ✅ Current |
| `@vsaas/types` | file:../packages/types | Shared TypeScript types | None known | ✅ Local package |

### 4.2 Development Dependencies Audit

| Package | Version | Purpose | Notes |
|---|---|---|---|
| `typescript` | ^5.9.2 | Compiler | ✅ Current |
| `ts-node` | ^10.9.2 | Dev execution | ✅ Current |
| `ts-jest` | ^29.4.1 | Jest TypeScript transform | ✅ Current |
| `jest` | ^29.7.0 | Test runner | ✅ Current |
| `supertest` | ^7.1.4 | HTTP integration testing | ✅ Current |
| `mongodb-memory-server` | ^10.2.0 | In-memory MongoDB for tests | ✅ Current |
| `ioredis-mock` | ^8.9.0 | Redis mock for tests | ✅ Current |
| `@faker-js/faker` | ^10.0.0 | Test data generation | ✅ Current |
| `migrate-mongo` | ^12.1.3 | DB migrations | ✅ Current |
| `nodemon` | ^3.1.10 | Dev hot-reload | ✅ Current |
| `tsconfig-paths` | ^4.2.0 | Path alias resolution | ✅ Current |
| `eslint` | ^8.57.1 | Linting | 🟨 ESLint v8; v9 is current stable |
| `@typescript-eslint/*` | ^6.21.0 | TypeScript ESLint rules | 🟨 v6; v8 is current stable |
| `pino-pretty` | ^13.1.1 | Dev log formatting | ✅ Current |
| `jest-junit` | ^16.0.0 | JUnit XML test reports (CI) | ✅ Current |

### 4.3 Risk Classification

#### 🟨 Medium — Unused or Partially Implemented Dependencies

**`isomorphic-dompurify` (^2.26.0)**
Listed as a production dependency. No usage was found in route handlers, services, or middleware. If user-generated HTML content is stored and later rendered, this library should be actively applied before persistence. If HTML rendering is not a use case, the dependency should be removed to reduce the attack surface and bundle size.

**`otplib` (^12.0.1)**
The `User` model includes `mfaEnabled` and `mfaSecret` fields, and the security policy constants reference MFA. However, no MFA enrollment, verification, or recovery routes were found in the codebase. The feature is structurally prepared but not implemented. This creates a risk of the `mfaEnabled` flag being set without a functional enforcement path.

#### 🟨 Medium — Tooling Version Lag

**`eslint` v8 + `@typescript-eslint` v6**
ESLint v9 introduced a new flat config format and ESLint v8 is in maintenance mode. `@typescript-eslint` v8 includes significant improvements in type-aware linting rules. This is not a security risk but represents technical debt in the development toolchain.

#### 🟩 Low — Consolidation Opportunities

**`dotenv` called in multiple files**
`dotenv.config()` is called in `app.ts`, `config/database/redis.ts`, and `config/env.ts`. Since `server.ts` imports `config/env.ts` first (which calls `dotenv.config()`), the subsequent calls are redundant. This is harmless but adds noise.

**`zod` v3 vs v4**
Zod v4 is available and includes performance improvements and a smaller bundle. Migration is low-risk given the consistent usage patterns in this codebase.

### 4.4 Overall Dependency Assessment

The dependency set is lean, purposeful, and well-maintained. There is no dependency bloat — each package has a clear, single responsibility. The use of the AWS SDK v3 (modular) rather than v2 (monolithic) is a good practice. The local `@vsaas/types` package provides a clean shared type boundary between frontend and backend.

---

## 5. Application Bootstrap & Runtime Lifecycle

### 5.1 Entry Points

The backend has two independent entry points:

| File | Process | Purpose |
|---|---|---|
| `src/server.ts` | API server | HTTP server, request handling |
| `src/worker.ts` | Worker process | BullMQ job processing, event dispatch |

Both can be run independently. In development, `npm run dev` starts only the API server; `npm run dev:worker` starts only the worker. In production, both should run as separate processes.

### 5.2 API Server Startup Sequence (`server.ts`)

```
1. initializeMonitoring()        → Sentry SDK init (if SENTRY_DSN present)
2. validateEnv()                 → Zod env schema parse; throws on invalid config
3. import app                    → Express app factory executes (middleware stack built)
4. connectToDatabase()           → MongoDB connect with exponential-backoff retry (max 3 attempts)
5. ensureDefaultTenant()         → Upserts the default 'secom' tenant on first run
6. app.listen(PORT)              → HTTP server starts
7. Signal handlers registered    → SIGTERM / SIGINT → gracefulShutdown()
```

**Graceful shutdown sequence:**
```
SIGTERM/SIGINT received
  → server.close()              (stop accepting new connections)
  → redisClient.quit()          (close Redis connection)
  → closeDatabaseConnection()   (close MongoDB connection)
  → process.exit(0)
  [10s timeout → process.exit(1) if stalled]
```

### 5.3 Worker Process Startup Sequence (`worker.ts`)

```
1. validateEnv()                 → Same env validation as API server
2. connectToDatabase()           → MongoDB connection
3. registerAuthEventListeners()  → Registers ACCOUNT_LOCKED handler on eventBus
4. eventBus.startWorker()        → Creates BullMQ worker for 'domain-events' queue
5. scheduleAuditCleanup()        → Registers daily cron job in 'audit-cleanup' queue
```

**Observation:** The worker process does not start the email queue worker — `emailWorker` is instantiated at module import time in `queues/emailQueue.ts`, so it starts automatically when the module is imported by `worker.ts`. This is an implicit side effect that is not obvious from reading `worker.ts` alone.

### 5.4 Express Middleware Stack (`app.ts`)

The middleware is applied in the following order, which is architecturally significant:

```
1.  pinoHttp                     HTTP request/response logging (skipped in test)
2.  trust proxy                  Enabled in production or when TRUST_PROXY=1
3.  helmet                       Security headers (CSP, HSTS, frameguard, etc.)
4.  cors                         CORS with origin allowlist validation
5.  express.json()               Body parsing (10MB limit, strict mode)
6.  express.urlencoded()         Form body parsing (10MB limit, 100 param limit)
7.  cookieParser()               Cookie parsing (required for auth token extraction)
8.  mongoSanitization            NoSQL injection prevention (replaces $ and . in input)
9.  compression                  Gzip response compression (level 6)
10. Rate limiters                Per-route: contact, auth, refresh, password-reset, api
11. Request ID middleware         Generates/validates X-Request-ID; attaches to req
12. idempotencyMiddleware         Redis-backed POST idempotency (on /api/v1)
13. CSRF token endpoint           GET /api/csrf-token (public)
14. CSRF protection               Applied to all non-safe methods on /api (with skip list)
15. checkDatabaseConnection       Returns 503 if MongoDB is disconnected (on /api)
16. responseWrapper               Normalizes all responses to { success, data, error, meta }
17. auditLogger                   Monkey-patches res.send for write-method audit logging
18. validatePagination            Parses page/limit query params; attaches to req.pagination
19. resolveTenant                 Resolves tenant from JWT → header → subdomain
20. setTenantContext              Wraps request in AsyncLocalStorage tenant context
21. v1Routes                      All /api/v1/* routes
22. Swagger UI                    /api-docs
23. Health routes                 /api/health
24. 404 handler                   Catches unmatched routes → NotFoundError
25. errorHandler                  Centralized error → HTTP response mapping
```

**Ordering observations:**
- Rate limiters (step 10) are applied before authentication (step 19+), which is correct — unauthenticated requests are rate-limited by IP.
- The `responseWrapper` (step 16) and `auditLogger` (step 17) are applied before route handlers, which means they wrap all `/api` responses including error responses. The `responseWrapper` correctly skips re-wrapping if the response already has the `success` envelope.
- CSRF protection (step 14) has a hardcoded skip list for auth endpoints. This is intentional (login/register cannot have a CSRF token yet) but the skip list is maintained inline in `app.ts` rather than in a configuration constant.
- `resolveTenant` (step 19) runs after authentication middleware is registered but before route handlers. However, authentication itself (`authenticate`) is applied per-route, not globally. This means `resolveTenant` may run before the user is authenticated on public routes — this is handled correctly by the middleware checking `authReq.user?.tenantId`.

### 5.5 Route Registration

All routes are mounted under `/api/v1/` via `routes/v1/index.ts`:

| Mount Path | Handler | Auth Required |
|---|---|---|
| `/api/v1/auth` | `routes/auth.ts` | Mixed (login/register public; others protected) |
| `/api/v1/health` | `routes/monitoring/health.ts` | Public (metrics endpoint requires admin) |
| `/api/v1/tenants` | `platform/tenants/routes/tenant.routes.ts` | `super_admin` only |
| `/api/v1/users` | `routes/users/user.routes.ts` | `admin`+ |
| `/api/v1/uploads` | `routes/uploads/upload.routes.ts` | Authenticated |
| `/api/v1/webhooks/subscriptions` | `routes/webhooks/subscriptions.ts` | Authenticated |
| `/api/v1/dashboard` | `routes/dashboard/dashboard.routes.ts` | Authenticated |
| `/api/v1/press-releases` | `modules/domain/press-releases` | Permission-gated |
| `/api/v1/media-contacts` | `modules/domain/media-contacts` | Permission-gated |
| `/api/v1/clippings` | `modules/domain/clippings` | Permission-gated |
| `/api/v1/events` | `modules/domain/events` | Permission-gated |
| `/api/v1/appointments` | `modules/domain/appointments` | Permission-gated |
| `/api/v1/citizen-portal` | `modules/domain/citizen-portal` | Permission-gated |
| `/api/v1/social-media` | `modules/domain/social-media` | Permission-gated |

Additionally:
- `GET /api/csrf-token` — public CSRF token endpoint
- `GET /api-docs` — Swagger UI
- `GET /health` — simple liveness probe (no `/api` prefix)

### 5.6 Global Error Handling

Three layers of error handling are present:

**1. Express error handler (`middleware/errorHandler.ts`)**
Catches all errors passed via `next(error)`. Maps known error types:
- `AppError` subclasses → their defined HTTP status code
- Mongoose `ValidationError` → 422
- Mongoose `CastError` → 422
- MongoDB duplicate key (code 11000) → 409
- `JsonWebTokenError` → 401
- `TokenExpiredError` → 401
- CSRF errors → 403
- Unknown errors → 500 (stack trace included in development only)

**2. Process-level handlers (`app.ts`)**
- `unhandledRejection` → logged via Pino
- `uncaughtException` → logged; `process.exit(1)` in production only

**3. Async operation error swallowing**
Several fire-and-forget operations (email queuing, audit logging, event emission) use `.catch(() => {})` or `.catch(err => logger.error(...))`. This is intentional to prevent non-critical failures from disrupting the primary request flow, but means some failures are silently absorbed.

### 5.7 Health Check Endpoints

| Endpoint | Auth | Response |
|---|---|---|
| `GET /health` | None | `{ status: 'alive' }` — process liveness only |
| `GET /api/v1/health` | None | Full health: DB + Redis status, latency, uptime |
| `GET /api/v1/health/ready` | None | Readiness: DB connected + Redis ping |
| `GET /api/v1/health/live` | None | Liveness: always 200 |
| `GET /api/v1/health/metrics` | `admin`+ | Memory usage, uptime, Node version |

**Observation:** The health check suite is well-structured for container orchestration (Kubernetes liveness/readiness probes). The `/health` root endpoint (without `/api` prefix) bypasses the full middleware stack, making it suitable as a lightweight load balancer probe.
