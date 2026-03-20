# Backend Architecture Improvement Roadmap

> **Scope:** Strictly derived from `docs/architecture/backend/overview-part-1.md`, `overview-part-2.md`, and `overview-part-3.md`.
> **Audience:** CTO / Engineering Leadership
> **Date:** 2025

---

## 1. Prioritized Architecture Issues

### 🟥 P0 — Architectural Instability / Structural Risk

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source Section |
|---|---|---|---|---|---|---|
| P0-1 | `aws-secrets` backend throws at runtime — documented but unimplemented | Deployment trap: any operator following `.env.example` for production crashes the server at startup | Secrets / Configuration | 1–2 days | `@aws-sdk/client-secrets-manager` absent from `package.json` | Part 1 §3.3, Part 2 §5.4, Part 3 §8.1 |
| P0-2 | `DEFAULT_ADMIN_PASSWORD` has no minimum length or complexity validation in Zod schema | Weak admin password can be set at first deployment without any warning or rejection | Configuration / Security Boundary | 0.5 days | None | Part 2 §5.5, Part 3 §8.1 |
| P0-3 | Citizen role has no row-level data scoping — `appointments:write` and `citizen-portal:read` are not filtered by `userId` at the service layer | A citizen can potentially access other citizens' appointments and profiles; shared-schema multi-tenancy amplifies the blast radius | Multi-Tenancy / RBAC | 3–5 days | All citizen-facing domain modules | Part 3 §7.2, §8.4 |

---

### 🟧 P1 — Scalability / Maintainability Risks

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source Section |
|---|---|---|---|---|---|---|
| P1-1 | `DashboardService` (platform layer) directly imports repositories from all 7 domain modules | Inverts the intended dependency direction: platform → domain. Prevents independent module extraction and creates a fan-in coupling point | Layering / Service Boundaries | 3–5 days | All 7 domain repositories | Part 1 §2.6, Part 2 §6.5, Part 3 §8.2 |
| P1-2 | Worker process has no enforced startup dependency on the server — a developer running only `npm run dev` gets a server without background job processing | Silent failures for email, webhooks, and domain events in development; risk of the same pattern reaching staging | Deployment Architecture | 1–2 days | `npm run dev:all` workspace script | Part 2 §4.7, Part 3 §8.2 |
| P1-3 | AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) loaded from environment variables with no production guard against static credentials | In production on AWS (ECS/EC2), static credentials should be replaced by IAM instance/task roles; no warning is emitted when both are set alongside `NODE_ENV=production` | Configuration / Infrastructure Coupling | 0.5 days | None | Part 2 §5.5, Part 3 §8.2 |
| P1-4 | Single-process deployment model couples HTTP server with background job workers in development | Scaling the HTTP tier independently of the worker tier requires explicit process separation; the current model obscures this boundary | Deployment Architecture / Scalability | 2–3 days | `server.ts` / `worker.ts` entry points | Part 1 §1.2, Part 2 §4.1 |
| P1-5 | Domain module test coverage is minimal — only `press-releases` has a unit test (2 cases); 6 modules have empty `tests/unit/` and `tests/integration/` directories | Business logic regressions in services and repositories are undetected; highest-risk gap for production stability | Structural / Testability | 10–15 days | All 7 domain modules | Part 2 §6.7, Part 3 §8.2 |

---

### 🟨 P2 — Structural Improvements

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source Section |
|---|---|---|---|---|---|---|
| P2-1 | `src/models/mixins/tenantScopedMixin.ts` is a re-export shim pointing to `platform/database/tenantAware` — incomplete refactoring | Dead abstraction layer; consumers importing from the shim are coupled to an intermediate file that adds no value | Modularity / Dependency Structure | 1 day | All consumers of the shim | Part 1 §2.6, Part 3 §8.3 |
| P2-2 | `authLimiter` and `refreshLimiter` use hardcoded constants from `src/constants/validation.ts` instead of env-configured `API_RATE_LIMIT_MAX` | Rate limiting is partially configurable and partially hardcoded; inconsistent behavior across environments | Configuration Management | 0.5 days | `src/constants/validation.ts`, `src/middleware/rateLimiter.ts` | Part 2 §5.5, Part 3 §8.3 |
| P2-3 | `VERIFY_USER_ON_REQUEST=false` is documented as unsafe for production but not enforced by the Zod schema | A misconfigured production deployment silently disables per-request user validation with no warning | Configuration Management | 0.5 days | `src/config/env.ts` | Part 2 §5.5, Part 3 §8.3 |
| P2-4 | `src/controllers/` at root level mirrors module-level `controllers/` directories, creating ambiguity about where platform vs. domain controllers belong | Onboarding confusion; new code may be placed in the wrong layer | Structural Layering | 1 day | `auth.controller.ts`, `citizen-auth.controller.ts` | Part 1 §2.6, Part 3 §8.4 |
| P2-5 | `ensureDefaultTenant()` runs a MongoDB query on every server cold start | Negligible at current scale; becomes a latency concern in high-frequency restart scenarios (e.g., rolling deploys, crash loops) | Bootstrap / Performance | 0.5 days | `src/seeds/defaultTenant.ts` | Part 2 §4.7 |
| P2-6 | ESLint 8 + `@typescript-eslint` v6 are one major version behind; legacy config format | Forced migration when ESLint 8 reaches EOL; flat config migration becomes more disruptive the longer it is deferred | Dependency Structure | 1–2 days | `.eslintrc` config files | Part 1 §3.2 |
| P2-7 | Text search uses `$regex` queries (e.g., `PressReleaseRepository.findWithFilters()`) — no indexed full-text search | `$regex` does not use indexes efficiently; query performance degrades linearly with collection size | Scalability / Performance | 3–5 days | MongoDB text indexes or Atlas Search | Part 1 §1.2, §3.4, Part 3 §8.3 |
| P2-8 | `app.ts` module-level code (rate limiter instantiation, CORS config) runs at import time, before `loadSecrets()` completes | Rate limiters connect to Redis before secrets are loaded; acceptable now but creates a fragile ordering assumption | Bootstrap / Infrastructure Coupling | 1 day | `src/app.ts`, `src/server.ts` | Part 2 §4.7 |

---

### 🟩 P3 — Optimization & Future Enhancements

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source Section |
|---|---|---|---|---|---|---|
| P3-1 | No OpenTelemetry distributed tracing — Sentry covers errors but not cross-service trace propagation | Limits observability if modules are ever extracted into separate services | Observability | 3–5 days | OpenTelemetry SDK | Part 1 §3.4, Part 3 §8.4 |
| P3-2 | No WebSocket/SSE infrastructure despite README mentioning real-time updates | Real-time features require a separate architectural layer (Socket.IO, SSE endpoint, or push notification service) | Scalability / Feature Readiness | 5–8 days | None currently | Part 1 §1.2, §3.4, Part 2 §6.8 |
| P3-3 | No DI container — unit testing requires `jest.mock()` at module level rather than constructor injection | Limits testability and makes service composition harder as the system grows | Modularity / Testability | 5–8 days | All service classes | Part 2 §6.4, §6.7 |
| P3-4 | `loadSecrets()` returns a frozen `AppSecrets` object that is not consumed — secrets are read directly from `env.*` throughout the codebase | The secrets abstraction layer exists but is bypassed; secret rotation support cannot be added without refactoring all consumers | Configuration Management | 3–5 days | `src/config/secrets/secretsLoader.ts` | Part 2 §5.4 |
| P3-5 | Only one migration file exists; no migration discipline documented | Index drift between environments as schema evolves; migrations are the only mechanism for coordinated schema changes | Deployment Architecture | 2–3 days | `migrate-mongo` | Part 1 §3.3 |
| P3-6 | No API versioning strategy beyond path prefix `/api/v1/` — no version negotiation, no `/api/v2/` path | Future breaking changes require either a parallel router or a header-based strategy; no mechanism exists today | Versioning Strategy | 2–3 days | `src/routes/v1/index.ts` | Part 3 §7.7 |

---

## 2. Architecture Technical Debt Assessment

### Debt Categories

| Category | Description | Risk if Ignored | Effort Estimate | Priority |
|---|---|---|---|---|
| Structural Layering Debt | `DashboardService` in platform layer imports all 7 domain repositories; `src/controllers/` naming ambiguity | Prevents module extraction; onboarding confusion worsens as codebase grows | 4–6 days | P1 |
| Infrastructure Coupling Debt | `app.ts` module-level code runs before `loadSecrets()`; worker process has no enforced startup dependency | Fragile startup ordering; silent job processing failures in development bleed into staging | 3–4 days | P1 |
| Data Scoping Debt | Citizen role lacks row-level `userId` filtering; `tenantScopedMixin.ts` shim is an incomplete refactoring | Citizen data exposure risk; dead code accumulates around the shim | 4–6 days | P0/P2 |
| Observability Gaps | No distributed tracing (OpenTelemetry); `loadSecrets()` abstraction bypassed | Blind spots in production diagnostics; secret rotation impossible without full refactor | 6–10 days | P3 |
| Deployment Architecture Debt | Single-process model obscures HTTP/worker boundary; no migration discipline; static AWS credentials in env | Scaling confusion; index drift between environments; credential exposure risk | 4–6 days | P1 |
| Resilience & Fault Tolerance Debt | `aws-secrets` backend crashes at startup; no production guard for `VERIFY_USER_ON_REQUEST=false`; no `DEFAULT_ADMIN_PASSWORD` complexity check | Deployment traps; misconfigured production instances; weak admin credentials | 2–3 days | P0 |
| Scalability Constraints | `$regex` text search; no WebSocket/SSE; no full-text search index | Query degradation at scale; real-time features blocked | 8–13 days | P2/P3 |
| Configuration Management Debt | Rate limiter inconsistency (hardcoded vs. env-configured); `VERIFY_USER_ON_REQUEST` not guarded; `loadSecrets()` not consumed | Unpredictable rate limiting behavior; unsafe production configurations silently accepted | 2–3 days | P2 |

### Totals

| Metric | Value |
|---|---|
| Total estimated developer-days | **37–56 days** |
| Confidence level | Medium (±20%) |
| Assumptions | Single mid-senior backend engineer; no parallel workstreams; excludes domain module test coverage (P1-5, estimated separately at 10–15 days) |

---

## 3. Phased Architecture Roadmap

### Phase 1 — Stabilization (Weeks 1–2)

**Goal:** Eliminate deployment traps and critical data scoping risks before any production exposure.

| Issue | Task | Effort |
|---|---|---|
| P0-1 | Remove `aws-secrets` from Zod enum and `.env.example`, or install `@aws-sdk/client-secrets-manager` and implement the backend | 1–2 days |
| P0-2 | Add `DEFAULT_ADMIN_PASSWORD` minimum length (≥12 chars) and complexity check to `env.ts` Zod schema | 0.5 days |
| P0-3 | Add `userId` filter enforcement in citizen-facing service methods for `appointments` and `citizen-portal` | 3–5 days |
| P1-3 | Add production warning when `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` are set alongside `NODE_ENV=production` | 0.5 days |
| P2-3 | Add Zod production guard for `VERIFY_USER_ON_REQUEST=false` | 0.5 days |

**Total Phase 1 effort:** 5.5–8.5 days
**Dependencies:** None — all are self-contained configuration or service-layer changes.
**Business impact:** Eliminates startup crash risk, weak credential risk, and citizen data exposure risk before production launch.

---

### Phase 2 — Structural Hardening (Weeks 3–6)

**Goal:** Correct dependency direction, resolve incomplete refactorings, and standardize configuration.

| Issue | Task | Effort |
|---|---|---|
| P1-1 | Move `DashboardService` to `src/modules/dashboard/` or refactor to consume domain events/read models instead of direct repository imports | 3–5 days |
| P1-2 | Document and enforce worker startup dependency; add startup check or prominent documentation | 1–2 days |
| P2-1 | Update all consumers of `tenantScopedMixin.ts` shim to import from `platform/database` directly; delete shim | 1 day |
| P2-2 | Consolidate `authLimiter` and `refreshLimiter` to use env-configured values consistently | 0.5 days |
| P2-4 | Move `src/controllers/auth.controller.ts` and `citizen-auth.controller.ts` to `src/routes/auth/` and `src/routes/citizen-auth/` | 1 day |
| P2-6 | Migrate ESLint to v9 flat config format | 1–2 days |
| P2-8 | Restructure `server.ts` startup sequence so `loadSecrets()` completes before `app.ts` module-level code executes | 1 day |

**Total Phase 2 effort:** 8.5–12.5 days
**Dependencies:** Phase 1 complete; P1-1 requires understanding of all 7 domain repository interfaces.
**Business impact:** Correct dependency direction enables future module extraction; configuration consistency reduces environment-specific bugs.

---

### Phase 3 — Scalability & Resilience (Weeks 7–10)

**Goal:** Address performance bottlenecks, complete the secrets abstraction, and establish migration discipline.

| Issue | Task | Effort |
|---|---|---|
| P2-7 | Replace `$regex` text search with MongoDB `$text` indexes (or Atlas Search) in `press-releases` and `clippings` repositories | 3–5 days |
| P3-4 | Refactor all `env.*` secret reads to consume the `AppSecrets` object returned by `loadSecrets()`; enable future secret rotation | 3–5 days |
| P3-5 | Establish migration discipline: document migration workflow, add index migration for any schema changes since initial migration | 2–3 days |
| P1-4 | Document and validate the HTTP/worker process separation model; add Docker Compose `depends_on` or process supervisor configuration | 2–3 days |
| P2-5 | Add startup flag (e.g., Redis key or env var) to skip `ensureDefaultTenant()` after first successful run | 0.5 days |

**Total Phase 3 effort:** 10.5–16.5 days
**Dependencies:** Phase 2 complete; P3-4 requires Phase 1 P0-1 resolution.
**Business impact:** Search performance at scale; secret rotation capability; reproducible deployments across environments.

---

### Phase 4 — Architecture Maturity (Weeks 11–14)

**Goal:** Future-proof the architecture with observability, versioning strategy, and real-time readiness.

| Issue | Task | Effort |
|---|---|---|
| P3-1 | Integrate OpenTelemetry SDK for distributed tracing alongside existing Sentry error tracking | 3–5 days |
| P3-3 | Evaluate and optionally introduce a lightweight DI container (tsyringe or InversifyJS) for service composition | 5–8 days |
| P3-6 | Define and document API versioning strategy (parallel router vs. header negotiation) for future `/api/v2/` | 2–3 days |
| P3-2 | Architect real-time update layer (SSE endpoint or Socket.IO) as a separate concern from the HTTP API | 5–8 days |

**Total Phase 4 effort:** 15–24 days
**Dependencies:** Phases 1–3 complete; P3-3 is optional and should be evaluated against team familiarity.
**Business impact:** Observability for multi-service future; real-time features unblocked; versioning strategy prevents breaking changes.

---

## 4. Architecture KPIs & Success Metrics

| Metric | Current State | Target | Measurement Method |
|---|---|---|---|
| Deployment trap count | 1 (`aws-secrets` crash) | 0 | Startup smoke test across all `SECRETS_BACKEND` values |
| Citizen data scoping enforcement | Not enforced at service layer | 100% `userId`-filtered for citizen role | Code audit of citizen-facing service methods |
| Platform → domain dependency violations | 1 (`DashboardService` imports 7 repos) | 0 | Dependency graph analysis (e.g., `madge`) |
| Rate limiter configuration consistency | Partial (2 of 5 limiters hardcoded) | 100% env-configured | Code audit of `rateLimiter.ts` |
| Production configuration guards | 2 missing (`VERIFY_USER_ON_REQUEST`, `DEFAULT_ADMIN_PASSWORD`) | 0 missing | Zod schema review |
| Text search index coverage | 0% (all `$regex`) | 100% for searchable fields | MongoDB explain plan audit |
| Secrets abstraction adoption | 0% (all reads bypass `loadSecrets()`) | 100% via `AppSecrets` object | Code audit of `env.*` reads |
| Migration file count vs. schema changes | 1 migration, multiple schema changes | 1 migration per schema change | Migration file count vs. git history |
| Worker process isolation | Not enforced in development | Enforced via Docker Compose or process supervisor | Local dev startup validation |
| Incomplete refactoring artifacts | 1 (`tenantScopedMixin.ts` shim) | 0 | File existence check |

---

## 5. Architecture Maturity Score

### Scoring Breakdown (0–100)

| Dimension | Score | Max | Notes |
|---|---|---|---|
| Layering Discipline | 14 | 20 | Clean 4-layer module structure; penalized for `DashboardService` dependency inversion and `src/controllers/` naming ambiguity |
| Modularity | 16 | 20 | Consistent domain module structure; barrel exports; penalized for `tenantScopedMixin.ts` shim and no DI container |
| Scalability Readiness | 10 | 15 | Redis HA, replica set, S3 adapter, BullMQ worker separation all present; penalized for `$regex` search and absent real-time layer |
| Resilience Patterns | 8 | 15 | Graceful shutdown, retry queues, idempotency, CSRF, rate limiting all present; penalized for `aws-secrets` crash, missing production guards |
| Observability | 8 | 10 | Structured logging (pino), Sentry, audit trail, health endpoints; penalized for absent distributed tracing |
| Deployment Maturity | 7 | 10 | Separate entry points, Docker Compose, env validation; penalized for no migration discipline, no worker startup enforcement |
| Tenant Scoping Robustness | 7 | 10 | `BaseRepository` auto-scoping, compound indexes, schema-level hooks; penalized for citizen row-level gap |

**Total: 70 / 100**

### Maturity Level: **Production-Ready (with conditions)**

The architecture is structurally sound and demonstrates mature patterns in tenant isolation, security middleware, and job queue design. It is not yet unconditionally production-ready due to the P0 deployment traps and the citizen data scoping gap.

**Key blockers to Enterprise-Ready (85+):**
1. Resolve all P0 issues (deployment traps, citizen scoping)
2. Correct `DashboardService` dependency inversion
3. Establish full-text search and migration discipline
4. Achieve secrets abstraction adoption
5. Add distributed tracing

---

## 6. Executive Summary (CTO-Level)

### Overall Architecture Health Score: 70 / 100

---

### Key Strengths

- **Tenant isolation is architecturally sound.** `BaseRepository` automatically injects `tenantId` from `AsyncLocalStorage` on every query. Compound indexes enforce scoping at the database level. Schema-level hooks prevent `tenantId` mutation. This is a production-grade multi-tenancy implementation.
- **Security middleware stack is defense-in-depth.** Helmet, CSRF double-submit, Redis-backed rate limiting, NoSQL injection prevention, and JWT with httpOnly cookies are all correctly layered and ordered.
- **Module structure is consistent and navigable.** All 7 domain modules follow an identical 4-layer layout. Any engineer familiar with one module can contribute to all others immediately — a significant onboarding and maintainability advantage.
- **Background job architecture is durable.** BullMQ with exponential retry, HMAC-signed webhook delivery, and in-process test dispatch provide a reliable async processing foundation.
- **Configuration management is fail-fast.** Zod-validated environment schema with production-specific rules prevents misconfigured deployments from starting silently.

---

### Major Structural Risks

1. **Deployment trap (P0-1):** `SECRETS_BACKEND=aws-secrets` is documented in `.env.example` but throws a runtime error at startup. An operator following the documentation for a production AWS deployment will crash the server. This must be resolved before any production deployment.

2. **Citizen data exposure (P0-3):** The `citizen` role has `appointments:write` and `citizen-portal:read` permissions, but the service layer does not enforce `userId` filtering. A citizen can potentially read or modify other citizens' records. This is a data privacy risk that must be addressed before the citizen portal is publicly accessible.

3. **Dependency inversion (P1-1):** `DashboardService` in the platform layer directly imports repositories from all 7 domain modules. This is the single largest structural violation in the codebase — it prevents independent module extraction and creates a maintenance bottleneck as the domain grows.

4. **Minimal domain test coverage (P1-5):** Six of seven domain modules have no unit or integration tests. Business logic regressions in services and repositories are undetected. This is the highest-risk gap for production stability as the system evolves.

5. **Secrets abstraction bypassed (P3-4):** The `loadSecrets()` abstraction exists but is not consumed — all code reads directly from `env.*`. Secret rotation (a compliance requirement for government systems) cannot be implemented without refactoring all consumers.

---

### Estimated Investment

| Phase | Focus | Effort | Timeline |
|---|---|---|---|
| Phase 1 | Stabilization — deployment traps, data scoping | 5.5–8.5 days | Weeks 1–2 |
| Phase 2 | Structural hardening — layering, configuration | 8.5–12.5 days | Weeks 3–6 |
| Phase 3 | Scalability & resilience — search, secrets, migrations | 10.5–16.5 days | Weeks 7–10 |
| Phase 4 | Architecture maturity — tracing, versioning, real-time | 15–24 days | Weeks 11–14 |
| **Total** | | **39.5–61.5 days** | **14 weeks** |

Domain module test coverage (P1-5) adds an estimated 10–15 days and should run in parallel with Phases 2–3.

**Risk if delayed:** The P0 issues (deployment trap, citizen data scoping) represent immediate production risk. Delaying Phase 1 beyond the first production deployment window is not recommended. The P1 issues (dependency inversion, test coverage) represent compounding technical debt — each new domain feature added before resolution increases the cost of correction.

---

### Recommendation

**Moderate architectural refactor required.**

The foundation is solid. The architecture demonstrates genuine engineering maturity in its security posture, tenant isolation model, and module consistency. The issues identified are correctable without a rewrite. The recommended path is:

1. Execute Phase 1 immediately — before any production deployment.
2. Run Phase 2 in parallel with feature development — structural corrections are low-risk and high-value.
3. Schedule Phases 3–4 as dedicated engineering sprints — these require focused attention and cannot be safely interleaved with high-velocity feature work.

The architecture is on a clear path to Enterprise-Ready with approximately 14 weeks of focused improvement work.
