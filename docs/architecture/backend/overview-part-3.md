# Secom Backend — Architecture Overview (Part 3 of 3)

> **Document scope:** Secom-specific patterns (multi-tenancy, RBAC, modules, jobs, validation, error handling) and initial recommendations.
> **Parts:** [Part 1 — Stack, Structure, Dependencies](./overview-part-1.md) · [Part 2 — Bootstrap, Config, Architecture](./overview-part-2.md) · [Part 3 — Secom Patterns, Recommendations]

---

## 7. Secom-Specific Patterns

### 7.1 Multi-Tenancy Implementation

Secom uses a **shared database, shared schema** multi-tenancy model. All tenants' data lives in the same MongoDB collections, distinguished by a `tenantId` field on every document.

#### Tenant Data Model

```typescript
Tenant {
  name: string           // "Secretaria de Comunicação"
  slug: string           // "secom" (unique, URL-safe)
  domain?: string        // Optional custom domain (unique, sparse)
  status: 'active' | 'suspended' | 'trial' | 'cancelled' | 'deleted'
  plan: 'trial' | 'starter' | 'professional' | 'enterprise'
  settings: {
    timezone: string     // "America/Sao_Paulo"
    locale: string       // "pt-BR"
    currency: string     // "BRL"
    features: Record<string, boolean>  // Per-module feature flags
  }
  owner: ObjectId        // Reference to User
  maxUsers: number
  trialEndsAt?: Date
}
```

#### Tenant Resolution Flow

On every authenticated request, the tenant is resolved in this priority order:

```
1. JWT claim (tenantId from authenticated user's token)
   ↓ fallback
2. X-Tenant-Id header (used by super_admin or API clients)
   ↓ fallback
3. Subdomain extraction (hostname.split('.')[0] if not IP/localhost)
   ↓ if none found
4. Allow through (super_admin or public/auth routes)
```

The resolved tenant is attached to `req.tenant` and then wrapped in `AsyncLocalStorage` via `TenantContext.run()`.

#### Tenant Isolation at the Data Layer

`BaseRepository` enforces tenant isolation automatically:

```typescript
protected getTenantFilter(): FilterQuery<T> {
  const tenantId = TenantContext.requireTenantId();
  return { tenantId } as FilterQuery<T>;
}

protected mergeFilter(filter: FilterQuery<T> = {}): FilterQuery<T> {
  return { ...filter, ...this.getTenantFilter() };
}
```

Every query method (`find`, `findById`, `create`, `updateById`, `deleteById`, etc.) calls `mergeFilter()`, which injects the current tenant's ID from `AsyncLocalStorage`. If no tenant context is set, `requireTenantId()` throws, preventing accidental cross-tenant queries.

**Schema-level enforcement:** Every domain model includes `tenantAwareFields` (the `tenantId` field) and calls `applyTenantAware(schema)`, which adds pre-save hooks that:
1. Prevent `tenantId` from being changed after document creation
2. Require `tenantId` to be present on new documents

**Index strategy:** All domain collections have compound indexes on `(tenantId, <query field>)`, ensuring queries are always tenant-scoped at the database level.

#### Tenant Lifecycle

```
Registration → trial (14 days) → active
                               → suspended (admin action)
                               → cancelled
                               → deleted (soft delete)
```

Tenant creation uses a MongoDB transaction to atomically create the owner user and tenant document, then back-fill `tenantId` on the user. This prevents orphaned documents if any step fails.

#### Default Tenant Seeding

On first startup, `ensureDefaultTenant()` creates:
- Tenant: `{ name: 'Secretaria de Comunicação', slug: 'secom', plan: 'enterprise', status: 'active' }`
- Admin user: `admin@secom.gov.br` with password from `DEFAULT_ADMIN_PASSWORD`

This is idempotent — subsequent startups detect the existing tenant and skip creation.

### 7.2 RBAC Implementation

#### Role Hierarchy

```
super_admin (100)  — Bypasses ALL permission checks
    │
admin (80)         — Full access to all modules within tenant
    │
assessor (60)      — Press releases, media contacts, clippings, events
    │
social_media (50)  — Social media management + read access to related modules
    │
atendente (40)     — Appointments, citizen portal, events (read)
    │
citizen (10)       — Self-service: appointments, citizen portal (own data), events (read)
```

The numeric hierarchy (`ROLE_HIERARCHY`) enables `hasRoleLevel()` comparisons but is not used for permission checks — permissions are explicitly assigned per role in `ROLE_PERMISSIONS`.

#### Permission Model

Permissions follow a `resource:action` naming convention:

```
press-releases:read    press-releases:write    press-releases:delete
media-contacts:read    media-contacts:write    media-contacts:delete
clippings:read         clippings:write         clippings:delete
events:read            events:write            events:delete
appointments:read      appointments:write      appointments:delete
citizen-portal:read    citizen-portal:write    citizen-portal:delete
social-media:read      social-media:write      social-media:delete
users:read             users:write             users:delete
settings:read          settings:write
audit:read
reports:read           reports:write
tenants:read           tenants:write           tenants:delete
```

#### Role-Permission Matrix

| Permission | super_admin | admin | assessor | social_media | atendente | citizen |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| press-releases:read | ✅ | ✅ | ✅ | ✅ | — | — |
| press-releases:write | ✅ | ✅ | ✅ | — | — | — |
| press-releases:delete | ✅ | ✅ | — | — | — | — |
| media-contacts:read | ✅ | ✅ | ✅ | — | — | — |
| media-contacts:write | ✅ | ✅ | ✅ | — | — | — |
| media-contacts:delete | ✅ | ✅ | — | — | — | — |
| clippings:read | ✅ | ✅ | ✅ | ✅ | — | — |
| clippings:write | ✅ | ✅ | ✅ | — | — | — |
| clippings:delete | ✅ | ✅ | — | — | — | — |
| events:read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| events:write | ✅ | ✅ | ✅ | — | — | — |
| events:delete | ✅ | ✅ | — | — | — | — |
| appointments:read | ✅ | ✅ | — | — | ✅ | ✅ |
| appointments:write | ✅ | ✅ | — | — | ✅ | ✅ |
| appointments:delete | ✅ | ✅ | — | — | — | — |
| citizen-portal:read | ✅ | ✅ | — | — | ✅ | ✅ |
| citizen-portal:write | ✅ | ✅ | — | — | ✅ | — |
| citizen-portal:delete | ✅ | ✅ | — | — | — | — |
| social-media:read | ✅ | ✅ | — | ✅ | — | — |
| social-media:write | ✅ | ✅ | — | ✅ | — | — |
| social-media:delete | ✅ | ✅ | — | — | — | — |
| users:* | ✅ | ✅ | — | — | — | — |
| tenants:* | ✅ | ✅ (read/write) | — | — | — | — |
| audit:read | ✅ | ✅ | — | — | — | — |
| reports:* | ✅ | ✅ | ✅ (read) | — | — | — |

#### RBAC Enforcement Points

Authorization is enforced at the route level via `authorizeWithPermissions()` middleware:

```typescript
router.post('/',
  authenticate,                                              // 1. Verify JWT
  requireTenant,                                             // 2. Require tenant context
  authorizeWithPermissions({                                 // 3. Check permissions
    permissions: [PERMISSIONS.PRESS_RELEASES_WRITE]
  }),
  validateSchema(createPressReleaseSchema),                  // 4. Validate input
  pressReleaseController.create                              // 5. Handle request
);
```

`authorizeWithPermissions()` supports three check modes:
- `permissions` — check any/all permissions (controlled by `requireAll` flag)
- `roles` — check role membership directly
- `features` — check tenant feature flags (fetches tenant from DB)

**super_admin bypass:** The `super_admin` role bypasses all permission checks at three levels:
1. `authorizeWithPermissions()` — early return on `role === 'super_admin'`
2. `hasPermission()` in `registry.ts` — returns `true` unconditionally
3. `ensureTenantAccess()` — skips tenant ownership check
4. `requireFeature()` — skips feature flag check

**Authorization failure logging:** Every failed authorization attempt is logged to the audit trail via `logAuthzFailure()`, recording the user, role, resource, and reason.

#### Dual Authentication System

The system maintains two separate authentication flows:

| Aspect | Staff Auth | Citizen Auth |
|---|---|---|
| Cookie name | `secom_access_token` | `secom_portal_token` |
| Refresh cookie | `secom_refresh_token` | `secom_portal_refresh` |
| JWT secret | `JWT_SECRET` | `PORTAL_JWT_SECRET` |
| JWT issuer | `vsaas-api` | `vsaas-portal` |
| JWT audience | `vsaas-client` | `vsaas-citizen` |
| Role assigned | admin/assessor/social_media/atendente | citizen |
| Account lockout | ✅ (5 failed attempts) | ❌ |
| Password history | ✅ (last 5) | ❌ |
| Password expiry | ✅ (90 days) | ❌ |
| Token blacklist | ✅ (Redis) | ❌ |

The citizen auth flow is intentionally simpler — citizens self-register and have fewer security requirements than staff users.

### 7.3 Domain Module Organization

All 7 domain modules follow the same structure and patterns. The table below documents their domain models and key characteristics:

#### Press Releases (`press-releases`)

| Aspect | Detail |
|---|---|
| Model fields | title, subtitle, content, summary, category, tags, status, publishedAt, approvedBy, createdBy, updatedBy |
| Status workflow | `draft → review → approved → published → archived` |
| Categories | `nota_oficial`, `comunicado`, `convite`, `esclarecimento`, `outro` |
| Indexes | `(tenantId, status)`, `(tenantId, category)`, `(tenantId, createdAt)` |
| Events emitted | `press-release.created`, `press-release.updated`, `press-release.deleted` |
| Roles with write | admin, assessor |

#### Media Contacts (`media-contacts`)

| Aspect | Detail |
|---|---|
| Model fields | name, email, phone, outlet, beat, status, notes, createdBy, updatedBy |
| Roles with write | admin, assessor |

#### Clippings (`clippings`)

| Aspect | Detail |
|---|---|
| Model fields | title, url, outlet, publishedAt, sentiment, summary, tags, createdBy, updatedBy |
| Sentiment values | `positive`, `neutral`, `negative` |
| Indexes | `(tenantId, publishedAt)`, `(tenantId, sentiment)` |
| Roles with write | admin, assessor |

#### Events (`events`)

| Aspect | Detail |
|---|---|
| Model fields | title, description, location, startsAt, endsAt, status, type, createdBy, updatedBy |
| Status workflow | `draft → published → cancelled → completed` |
| Indexes | `(tenantId, startsAt)`, `(tenantId, status)` |
| Roles with write | admin, assessor |
| Roles with read | all roles including citizen |

#### Appointments (`appointments`)

| Aspect | Detail |
|---|---|
| Model fields | citizenName, citizenCpf, citizenPhone, service, scheduledAt, notes, status, createdBy, updatedBy |
| Status workflow | `pending → confirmed → completed / cancelled / no_show` |
| Indexes | `(tenantId, scheduledAt)`, `(tenantId, status)` |
| Roles with write | admin, atendente, citizen |

#### Citizen Portal (`citizen-portal`)

| Aspect | Detail |
|---|---|
| Model fields | userId, fullName, cpf, phone, email, address, neighborhood, city, state, status |
| Unique constraint | `(tenantId, userId)` — one profile per citizen per tenant |
| Indexes | `(tenantId, cpf)` |
| Roles with write | admin, atendente |
| Roles with read | admin, atendente, citizen |

#### Social Media (`social-media`)

| Aspect | Detail |
|---|---|
| Model fields | platform, content, mediaUrl, scheduledAt, publishedAt, status, createdBy, updatedBy |
| Platforms | `instagram`, `facebook`, `twitter`, `youtube`, `tiktok` |
| Status workflow | `draft → scheduled → published / failed` |
| Indexes | `(tenantId, platform, status)`, `(tenantId, scheduledAt)` |
| Roles with write | admin, social_media |

### 7.4 Background Job Processing

#### Queue Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BullMQ Queues (Redis-backed)                 │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ email        │  │webhook-      │  │ domain-events        │  │
│  │ (concurrency │  │delivery      │  │ (concurrency: 10)    │  │
│  │  5, 14/s)    │  │(concurrency  │  │                      │  │
│  └──────┬───────┘  │ 10)          │  └──────────┬───────────┘  │
│         │          └──────┬───────┘             │              │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────────┴───────────┐  │
│  │ audit-cleanup│  │              │  │                      │  │
│  │ (cron:       │  │              │  │                      │  │
│  │  0 3 * * *)  │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

#### Queue Details

| Queue | Name | Concurrency | Retry | Purpose |
|---|---|---|---|---|
| `emailQueue` | `email` | 5 | 3× exponential (2s) | Transactional email delivery |
| `webhookQueue` | `webhook-delivery` | 10 | 3× exponential (5s) | Outbound webhook delivery |
| `domainEventsQueue` | `domain-events` | 10 | 3× exponential (1s) | Domain event fan-out |
| `auditCleanupQueue` | `audit-cleanup` | 1 | — | Daily audit log pruning |

#### Email Queue

- Rate-limited to 14 emails/second (SendGrid free tier limit)
- Lazy-imports `emailService` to avoid circular dependencies at module load
- Failed jobs logged with job ID and recipient

#### Webhook Queue

- HMAC-SHA256 signature on every delivery (`X-Webhook-Signature` header)
- Delivery status tracked in `WebhookDelivery` MongoDB collection
- 10-second timeout per delivery attempt via `AbortSignal.timeout()`
- Failed jobs retained in Redis for observability (`removeOnFail: false`)

#### Domain Events Queue

- Worker processor is injected at startup by `BullMQEventBus.startWorker()`
- In test environment, events are dispatched in-process (no Redis required)
- `Promise.allSettled()` ensures one failing handler does not block others

#### Audit Cleanup Queue

- Scheduled daily at 03:00 via cron pattern `0 3 * * *`
- Deletes `AuditLog` documents older than `AUDIT_LOG_TTL_DAYS` (default: 90)
- Complements the MongoDB TTL index on `AuditLog.createdAt` (belt-and-suspenders approach)

### 7.5 Input Validation

Validation is standardized across all modules using Zod schemas:

```
Request body/query/params
  → validateSchema(zodSchema, target) middleware
    → schema.safeParse(req[target])
      → success: req[target] = result.data (parsed + coerced)
      → failure: next(new ValidationError('Dados inválidos', details))
        → errorHandler → 422 response with field-level errors
```

Each domain module has a `validators/` directory with Zod schemas for:
- `create<Entity>Schema` — required fields for creation
- `update<Entity>Schema` — all fields optional for partial updates
- `<entity>FiltersSchema` — query parameter validation with coercion

**Validation consistency:** All validators use Zod's `.coerce` for numeric query parameters (page, limit), ensuring type safety even when values arrive as strings from query strings.

### 7.6 Error Handling

#### Error Hierarchy

```
Error (native)
└── AppError (base operational error)
    ├── ValidationError    (422 — VAL_INVALID_INPUT)
    ├── NotFoundError      (404 — RES_NOT_FOUND)
    ├── UnauthorizedError  (401 — AUTH_UNAUTHORIZED)
    ├── ForbiddenError     (403 — PERM_FORBIDDEN)
    ├── ConflictError      (409 — RES_CONFLICT)
    └── BadRequestError    (400 — VAL_INVALID_INPUT)
```

#### Error Response Format

All errors follow a consistent envelope:

```json
{
  "success": false,
  "error": {
    "code": "RES_NOT_FOUND",
    "message": "PressRelease não encontrado",
    "details": null
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "uuid-v4"
  }
}
```

#### Error Code Taxonomy

| Prefix | Category | Examples |
|---|---|---|
| `AUTH_` | Authentication | `AUTH_TOKEN_EXPIRED`, `AUTH_INVALID_CREDENTIALS` |
| `VAL_` | Validation | `VAL_INVALID_INPUT`, `VAL_INVALID_ID` |
| `RES_` | Resource | `RES_NOT_FOUND`, `RES_CONFLICT` |
| `PERM_` | Permission | `PERM_FORBIDDEN`, `PERM_INSUFFICIENT` |
| `BIZ_` | Business logic | `BIZ_OPERATION_FAILED`, `BIZ_INVALID_STATUS` |
| `SYS_` | System | `SYS_INTERNAL_ERROR`, `SYS_DATABASE_ERROR` |

#### Centralized Error Handler

`middleware/errorHandler.ts` handles:
- `AppError` subclasses — uses `statusCode` and `code` from the error
- Mongoose `ValidationError` — 422 with field-level details
- Mongoose `CastError` — 422 with `VAL_INVALID_ID`
- MongoDB duplicate key (code 11000) — 409 with field name
- JWT errors — 401 with appropriate code
- CSRF errors — 403
- Unhandled errors — 500 (stack trace in development only)

### 7.7 API Versioning

All routes are prefixed with `/api/v1/`. The version is embedded in the route path rather than a header. The `responseWrapper` middleware includes `"version": "v1"` in the response `meta` object.

There is currently no `/api/v2/` or version negotiation mechanism. Future versioning would require either:
- Adding a new `/api/v2/` router alongside the existing one
- Introducing a version header strategy

### 7.8 Audit Logging

The audit system has two layers:

1. **HTTP-level audit** (`middleware/auditLogger.ts`): Logs all write operations (POST, PUT, PATCH, DELETE) on `res.finish` using `setImmediate` to avoid blocking the response. Records: user, action, resource, method, path, IP, user agent, status code, tenant.

2. **Service-level audit** (`services/admin/auditService.ts`): Used for specific events like `authz_failure`, `login`, `logout`, `password_change`. Provides richer context including `changes.before/after`.

Audit logs are stored in MongoDB with a TTL index (`AUDIT_LOG_TTL_DAYS * 86400` seconds) and pruned daily by the `auditCleanupQueue`.

---

## 8. Initial High-Level Recommendations

### 8.1 Critical (Address Before Production)

**🟥 Remove or implement `aws-secrets` backend**
The `SECRETS_BACKEND=aws-secrets` option is documented and advertised but throws a runtime error. Either implement it (install `@aws-sdk/client-secrets-manager` and complete the commented code in `secretsLoader.ts`) or remove the option from the Zod enum and documentation to prevent operator confusion.

**🟥 Validate `DEFAULT_ADMIN_PASSWORD` strength**
The initial admin password has no minimum length or complexity enforcement in the Zod schema. A weak password set at first deployment would be a security risk. Add a minimum length check (≥12 characters) to the schema.

### 8.2 High Priority

**🟧 Expand domain module test coverage**
Only one domain module (`press-releases`) has a unit test, and it covers only 2 cases. The 6 remaining modules have empty `tests/unit/` and `tests/integration/` directories. Given that the business logic lives in services and repositories, this is the highest-risk gap for regression.

**🟧 Separate worker process in development**
The `npm run dev:all` script at the workspace root starts both server and worker, but there is no enforcement that the worker is running when the server is. A developer running only `npm run dev` will have a server without background job processing, causing silent failures for email, webhooks, and domain events. Consider documenting this dependency prominently or adding a startup check.

**🟧 Enforce IAM role-based AWS access**
`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are loaded from environment variables. In production on AWS (ECS/EC2), these should be empty and the SDK should use the instance/task IAM role. Add a production warning when these variables are set alongside `NODE_ENV=production`.

**🟧 Address `DashboardService` dependency inversion**
`DashboardService` in the platform layer directly imports repositories from all 7 domain modules. This inverts the intended dependency direction (platform should not depend on domain). Consider moving `DashboardService` to a dedicated `src/modules/dashboard/` module, or having it consume domain events/read models rather than repositories directly.

### 8.3 Medium Priority

**🟨 Resolve `tenantScopedMixin.ts` shim**
`src/models/mixins/tenantScopedMixin.ts` is a re-export shim pointing to `platform/database/tenantAware`. This suggests an incomplete refactoring. Identify all consumers and update them to import from `platform/database` directly, then remove the shim.

**🟨 Standardize rate limiter configuration**
`authLimiter` and `refreshLimiter` use hardcoded constants from `src/constants/validation.ts` rather than the env-configured `API_RATE_LIMIT_MAX`. This creates an inconsistency where some limiters are configurable and others are not. Consolidate to use env-configured values consistently.

**🟨 Add `VERIFY_USER_ON_REQUEST` production guard**
The `VERIFY_USER_ON_REQUEST=false` option is documented as unsafe for production but is not enforced by the Zod schema. Add a production warning (similar to `COOKIE_SECURE`) when this is set to `false` in `NODE_ENV=production`.

**🟨 Migrate ESLint to v9 flat config**
ESLint 8 with the legacy config format is one major version behind. ESLint 9 is the current release and uses a flat config format. Migrating now avoids a forced migration when ESLint 8 reaches end-of-life.

**🟨 Add full-text search for press releases and clippings**
The current `$regex` search in `PressReleaseRepository.findWithFilters()` and similar repositories does not use indexes and will degrade at scale. MongoDB Atlas Search or a dedicated search index (`$text` with a text index) would address this without introducing a new infrastructure dependency.

### 8.4 Low Priority (Optimization & Best Practices)

**🟩 Remove `tenantScopedMixin.ts` shim after migration**
Once all consumers import from `platform/database` directly, the shim file can be deleted.

**🟩 Add `DEFAULT_ADMIN_PASSWORD` to `validateEnv()` warnings**
Log a warning if `DEFAULT_ADMIN_PASSWORD` matches common weak patterns (e.g., length < 12) rather than only checking for presence.

**🟩 Consider moving `src/controllers/` to `src/routes/`**
The two files in `src/controllers/` (`auth.controller.ts`, `citizen-auth.controller.ts`) are platform-level controllers that could live alongside their route files in `src/routes/auth/` and `src/routes/citizen-auth/`, reducing the number of top-level directories and the confusion about where platform vs. domain controllers live.

**🟩 Add OpenTelemetry distributed tracing**
Sentry covers error tracking and basic performance monitoring. For a multi-service future (if modules are extracted), OpenTelemetry would provide distributed tracing across service boundaries.

**🟩 Document the `citizen` role's data access boundaries**
The `citizen` role has `appointments:write` and `citizen-portal:read` permissions, but there is no row-level security ensuring a citizen can only access their own appointments and profile. The service layer would need to enforce `userId` filtering for citizen-scoped queries. This is a business logic gap that should be addressed before the citizen portal is exposed publicly.

---

## Appendix A: Key File Reference

| File | Purpose |
|---|---|
| `src/server.ts` | HTTP server entry point and startup sequence |
| `src/worker.ts` | Background worker entry point |
| `src/app.ts` | Express application factory and middleware stack |
| `src/config/env.ts` | Zod-validated environment configuration (single source of truth) |
| `src/config/rbac/registry.ts` | Role-permission assignments and check functions |
| `src/config/rbac/featureFlags.ts` | Tenant feature flag registry |
| `src/platform/tenants/TenantContext.ts` | AsyncLocalStorage tenant context manager |
| `src/platform/tenants/middleware/tenant.middleware.ts` | Tenant resolution and context injection |
| `src/platform/database/BaseRepository.ts` | Tenant-aware generic repository base class |
| `src/platform/events/eventBus.ts` | BullMQ-backed domain event bus |
| `src/middleware/auth/auth.ts` | Staff authentication and authorization middleware |
| `src/middleware/errorHandler.ts` | Centralized error serialization |
| `src/middleware/normalizeResponse.ts` | Response envelope normalization |
| `src/routes/v1/index.ts` | Central v1 route registration |
| `src/seeds/defaultTenant.ts` | Idempotent default tenant seeding |
| `src/config/secrets/secretsLoader.ts` | Secrets backend abstraction |

## Appendix B: Glossary

| Term | Definition |
|---|---|
| Tenant | An isolated organizational unit (e.g., a municipality's Secom department) |
| TenantContext | AsyncLocalStorage store holding the current request's tenant ID |
| BaseRepository | Abstract class providing tenant-scoped CRUD operations |
| Domain module | A self-contained business domain (press-releases, events, etc.) |
| Platform layer | Shared infrastructure code (tenants, events, database) used by all modules |
| Feature flag | A per-tenant boolean that enables/disables a module or capability |
| RBAC | Role-Based Access Control — permissions assigned to roles, roles assigned to users |
| super_admin | A cross-tenant administrator role that bypasses all permission checks |
| BullMQ | Redis-backed job queue library used for background processing |
| EventBus | In-process pub/sub backed by BullMQ for durable domain event delivery |
| Soft delete | Marking a document as `isDeleted: true` rather than removing it from the database |
