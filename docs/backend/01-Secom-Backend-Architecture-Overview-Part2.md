# Secom Backend Architecture Overview — Part 2

> **Dependency Analysis · Application Bootstrap & Lifecycle**

---

## 4. Dependency Analysis

### 4.1 Production Dependencies Audit

| Package | Version | Purpose | Status | Severity | Notes |
|---|---|---|---|---|---|
| `express` | ^4.21.2 | Web framework | ✅ Current | — | Express 5 is in beta; v4 is stable and supported |
| `mongoose` | ^8.18.0 | MongoDB ODM | ✅ Current | — | Latest major |
| `ioredis` | ^5.7.0 | Redis client | ✅ Current | — | |
| `bullmq` | ^5.58.2 | Job queue | ✅ Current | — | |
| `jsonwebtoken` | ^9.0.2 | JWT auth | ✅ Current | — | |
| `bcrypt` | ^6.0.0 | Password hashing | ✅ Current | — | Native binding, requires build tools |
| `zod` | ^3.22.4 | Schema validation | ✅ Current | — | |
| `express-validator` | ^7.2.1 | Input validation | ✅ Current | 🟨 | Redundant with Zod — used only in auth routes |
| `pino` | ^9.11.0 | Logging | ✅ Current | — | |
| `pino-http` | ^10.5.0 | HTTP logging | ✅ Current | — | |
| `helmet` | ^8.1.0 | Security headers | ✅ Current | — | |
| `cors` | ^2.8.5 | CORS | ✅ Current | — | |
| `compression` | ^1.8.1 | gzip | ✅ Current | — | |
| `cookie-parser` | ^1.4.7 | Cookie parsing | ✅ Current | — | |
| `csrf-csrf` | ^4.0.3 | CSRF protection | ✅ Current | — | Double-submit cookie pattern |
| `express-mongo-sanitize` | ^2.2.0 | NoSQL injection prevention | ✅ Current | — | |
| `express-rate-limit` | ^7.5.1 | Rate limiting | ✅ Current | — | |
| `rate-limit-redis` | ^4.2.3 | Redis rate limit store | ✅ Current | — | |
| `nodemailer` | ^6.10.1 | Email delivery | ✅ Current | — | |
| `dotenv` | ^16.6.1 | Env loading | ✅ Current | — | |
| `uuid` | ^13.0.0 | UUID generation | ✅ Current | — | |
| `date-fns` | ^4.1.0 | Date utilities | ✅ Current | — | |
| `multer` | ^2.1.1 | File upload | ✅ Current | — | v2 is a major upgrade from v1 |
| `isomorphic-dompurify` | ^2.26.0 | HTML sanitization | ✅ Current | — | |
| `swagger-jsdoc` | ^6.2.8 | API docs generation | ⚠️ Behind | 🟩 | v7 available with better TS support |
| `swagger-ui-express` | ^5.0.1 | Swagger UI | ✅ Current | — | |
| `@aws-sdk/client-s3` | ^3.922.0 | S3 file storage | ✅ Current | — | |
| `@aws-sdk/s3-request-presigner` | ^3.922.0 | S3 presigned URLs | ✅ Current | — | |
| `@sentry/node` | ^10.20.0 | Error monitoring | ✅ Current | — | |
| `@sentry/profiling-node` | ^10.20.0 | Performance profiling | ✅ Current | — | |
| `stripe` | ^19.1.0 | Payment processing | ⚠️ Unused | 🟨 | Dependency present, no service/route integration beyond env vars |
| `twilio` | ^5.10.2 | SMS notifications | ⚠️ Unused | 🟨 | Dependency present, `MOCK_SMS_SERVICE` flag exists but no SMS service file |
| `otplib` | ^12.0.1 | TOTP/MFA | ⚠️ Partial | 🟩 | User model has MFA fields, but no MFA auth flow implemented |
| `@vsaas/types` | file:../packages/types | Shared types | ✅ Local | — | Workspace package |

### 4.2 Development Dependencies Audit

| Package | Version | Purpose | Status | Notes |
|---|---|---|---|---|
| `typescript` | ^5.9.2 | TypeScript compiler | ✅ Current | |
| `jest` | ^29.7.0 | Test runner | ✅ Current | |
| `ts-jest` | ^29.4.1 | TS transformer for Jest | ✅ Current | |
| `supertest` | ^7.1.4 | HTTP test assertions | ✅ Current | |
| `mongodb-memory-server` | ^10.2.0 | In-memory MongoDB | ✅ Current | |
| `ioredis-mock` | ^8.9.0 | Redis mock | ✅ Current | |
| `@faker-js/faker` | ^10.0.0 | Test data generation | ✅ Current | |
| `eslint` | ^8.57.1 | Linting | ⚠️ Behind | 🟩 ESLint 9 available (flat config) |
| `@typescript-eslint/*` | ^6.21.0 | TS ESLint | ⚠️ Behind | 🟩 v8 available |
| `nodemon` | ^3.1.10 | Dev auto-restart | ✅ Current | |
| `pino-pretty` | ^13.1.1 | Dev log formatting | ✅ Current | |
| `migrate-mongo` | ^12.1.3 | DB migrations | ✅ Current | |
| `ts-node` | ^10.9.2 | TS execution | ✅ Current | |
| `tsconfig-paths` | ^4.2.0 | Path alias resolution | ✅ Current | |
| `jest-junit` | ^16.0.0 | JUnit test reports | ✅ Current | For CI |

### 4.3 Classified Findings

#### 🟨 Medium — Unused / Minimally Integrated Dependencies

- **`stripe` (^19.1.0)**: The package is listed as a dependency and `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` appear in `.env.example`, but there is no Stripe service, no payment routes, and no webhook handler beyond the env vars. This adds ~15MB to `node_modules` and increases the attack surface unnecessarily.
- **`twilio` (^5.10.2)**: Similarly, `TWILIO_*` env vars exist and `MOCK_SMS_SERVICE` is referenced in config, but no SMS service implementation exists. The dependency is dead weight.
- **`express-validator` (^7.2.1)**: Used only in `routes/validations/authValidation.ts` and tenant invite validation. All domain modules use Zod. Having two validation libraries creates inconsistency.

#### 🟩 Low — Upgrade Opportunities

- **ESLint 8 → 9**: ESLint 9 introduces flat config. Not urgent but worth planning.
- **@typescript-eslint 6 → 8**: Two major versions behind. Newer versions have better TypeScript 5.x support.
- **swagger-jsdoc 6 → 7**: Minor improvement in TypeScript types and OpenAPI 3.1 support.
- **otplib**: Present but MFA flow is incomplete. Either implement or remove to reduce surface area.

#### ✅ No Known Critical Vulnerabilities

Based on the declared versions, no packages have known critical CVEs at the time of analysis. All core dependencies (Express, Mongoose, jsonwebtoken, bcrypt) are on current stable releases.

### 4.4 Dependency Graph Observations

- **Total production dependencies**: 33 packages
- **Total dev dependencies**: 20 packages
- **Heaviest dependencies** (by install size): `@aws-sdk/*`, `stripe`, `twilio`, `mongoose`
- **Local workspace dependency**: `@vsaas/types` linked via `file:../packages/types`

The dependency set is **reasonable for the feature scope** but could be trimmed by removing `stripe` and `twilio` until they are actively needed.

---

## 5. Application Bootstrap & Runtime Lifecycle

### 5.1 Startup Sequence

The application entry point is `src/server.ts`. The bootstrap follows this sequence:

```
server.ts
│
├── 1. initializeMonitoring()        → Sentry init (if SENTRY_DSN set)
├── 2. validateEnv()                 → Validates required env vars, throws on error
├── 3. import app from './app'       → Express app is constructed (middleware stack)
│
└── start()
    ├── 4. connectToDatabase()       → MongoDB connection with retry (3 attempts, exponential backoff)
    ├── 5. ensureDefaultTenant()     → Seeds "Secretaria de Comunicação" tenant + admin user
    ├── 6. app.listen(PORT)          → HTTP server starts on port 5000
    ├── 7. scheduleAuditCleanup()    → BullMQ cron job: daily at 3 AM
    ├── 8. registerAuthEventListeners() → EventBus listener for ACCOUNT_LOCKED
    └── 9. Register SIGTERM/SIGINT handlers → Graceful shutdown
```

### 5.2 Express Middleware Stack (app.ts)

The middleware is applied in this exact order:

```
Request Flow
│
├── 1.  pino-http logger              (skip /health in logs)
├── 2.  trust proxy                   (if TRUST_PROXY=1 or production)
├── 3.  helmet                        (CSP, HSTS, frameguard)
├── 4.  CORS                          (origin whitelist + env URLs)
├── 5.  express.json                  (10MB limit, strict mode)
├── 6.  express.urlencoded            (10MB limit, 100 params max)
├── 7.  cookie-parser
├── 8.  express-mongo-sanitize        (NoSQL injection prevention)
├── 9.  compression                   (gzip level 6)
├── 10. Rate limiters                 (per-route: contact, auth, refresh, password-reset, api)
├── 11. Request ID                    (X-Request-ID header, UUID fallback)
├── 12. Idempotency middleware        (POST only, Redis-cached responses)
├── 13. CSRF protection               (skip safe methods + specific paths)
├── 14. Database connection check     (503 if MongoDB disconnected)
├── 15. Response wrapper              (normalizes JSON envelope: {success, data, error, meta})
├── 16. Audit logger                  (logs authenticated requests to AuditLog collection)
├── 17. Pagination validator          (normalizes page/limit query params)
├── 18. Tenant resolver               (resolves tenant from JWT → header → subdomain)
├── 19. Tenant context setter         (wraps request in AsyncLocalStorage)
│
├── 20. v1 Routes                     (/api/v1/*)
├── 21. Swagger UI                    (/api-docs)
├── 22. Health routes                 (/api/health, /health)
│
├── 23. Error handler                 (centralized, maps error types to HTTP responses)
└── 24. 404 handler                   (catch-all)
```

### 5.3 Route Registration

All routes are mounted under `/api/v1/` via the v1 router (`src/routes/v1/index.ts`):

```
/api/v1/
├── /auth                → Auth routes (login, register, refresh, logout, password reset, invite)
├── /health              → Health, readiness, liveness, metrics
├── /tenants             → Tenant CRUD, invite, suspend/reactivate (platform)
├── /users               → User management (admin)
├── /uploads             → File upload/delete
├── /webhooks/subscriptions → Webhook subscription management
├── /dashboard           → Dashboard summary
├── /press-releases      → Domain module
├── /media-contacts      → Domain module
├── /clippings           → Domain module
├── /events              → Domain module
├── /appointments        → Domain module
├── /citizen-portal      → Domain module
└── /social-media        → Domain module
```

### 5.4 Database Connection Lifecycle

- **Connection**: Mongoose connects on startup with retry logic (3 attempts, exponential backoff from 1s to 10s max)
- **Pool**: `maxPoolSize: 50`, `serverSelectionTimeoutMS: 30000`, `socketTimeoutMS: 45000`
- **Monitoring**: Connection events (`error`, `disconnected`, `reconnected`, `connected`) are logged
- **Health check**: Middleware returns 503 if `mongoose.connection.readyState !== 1`
- **Shutdown**: `mongoose.connection.close()` called during graceful shutdown

Redis uses `lazyConnect: true` and is initialized as a module-level singleton.

### 5.5 Graceful Shutdown

The shutdown handler (`SIGTERM`, `SIGINT`) follows this sequence:

```
Signal received
│
├── 1. server.close()           → Stop accepting new connections
├── 2. emailWorker.close()      → Stop BullMQ email worker
├── 3. emailQueue.close()       → Close email queue
├── 4. auditCleanupWorker.close() → Stop audit cleanup worker
├── 5. auditCleanupQueue.close()  → Close audit cleanup queue
├── 6. redisClient.quit()       → Close Redis connection
├── 7. closeDatabaseConnection() → Close MongoDB connection
└── 8. process.exit(0)
```

A 10-second timeout forces `process.exit(1)` if graceful shutdown stalls.

### 5.6 Global Error Handling

Three layers of error handling:

1. **Route-level**: Each route handler wraps logic in try/catch and calls `next(error)`
2. **Express error handler** (`middleware/errorHandler.ts`): Centralized handler that maps error types:
   - `AppError` subclasses → appropriate HTTP status + error code
   - Mongoose `ValidationError` → 422
   - Mongoose `CastError` → 422
   - MongoDB duplicate key (code 11000) → 409
   - JWT errors → 401
   - CSRF errors → 403
   - Unknown errors → 500 (message hidden in production)
3. **Process-level**: `unhandledRejection` and `uncaughtException` handlers log errors. In production, `uncaughtException` triggers `process.exit(1)`

### 5.7 Health Checks

Three health endpoints are available:

| Endpoint | Auth | Purpose | Checks |
|---|---|---|---|
| `GET /health` | None | Basic liveness | Returns `{ status: 'alive' }` |
| `GET /api/health` (or `/api/v1/health`) | None | Comprehensive health | MongoDB ping + Redis ping with response times |
| `GET /api/v1/health/ready` | None | Readiness probe | MongoDB readyState + Redis ping |
| `GET /api/v1/health/live` | None | Liveness probe | Always returns 200 |
| `GET /api/v1/health/metrics` | Admin | Process metrics | Memory usage, uptime, node version |

### 5.8 Bootstrap Observations

**Strengths:**
- Well-ordered middleware stack with security middleware applied before business logic
- Graceful shutdown covers all external connections (HTTP, Redis, MongoDB, BullMQ)
- Health checks include both liveness and readiness probes (Kubernetes-ready)
- Environment validation runs before any connections are established
- Default tenant seeding ensures the system is usable on first run

**Concerns:**
- 🟧 **Error handler is mounted after 404 handler**: The 404 catch-all (`app.use('*', ...)`) is placed after `app.use(errorHandler)`. Since Express processes middleware in order, errors thrown in route handlers will be caught by `errorHandler`, but the 404 handler will never trigger for routes that throw — this is correct. However, the 404 handler uses `app.use('*', ...)` which in Express 4 matches all methods and paths, potentially catching requests that should have been handled by the error handler if they fall through. The current ordering works but is fragile.
- 🟨 **Audit logger intercepts every authenticated request**: The `auditLogger` middleware monkey-patches `res.send` on every request to log audit entries. This adds a MongoDB write per request, which could become a performance bottleneck under load. Consider sampling or limiting to write operations.
- 🟨 **BullMQ workers start unconditionally**: Email and audit cleanup workers start in the same process as the HTTP server. In a scaled deployment, workers should run in separate processes to avoid resource contention.
- 🟩 **Event listeners registered after server starts**: `registerAuthEventListeners()` is called after `app.listen()`. If a request arrives between server start and listener registration, events could be emitted without handlers. The window is negligible in practice but could be eliminated by registering listeners before `app.listen()`.
