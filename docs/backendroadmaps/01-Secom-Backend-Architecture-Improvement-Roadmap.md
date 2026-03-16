# Secom – Backend Architecture Improvement Roadmap

> **Source:** `docs/backend/01-Secom-Backend-Architecture-Overview-Part1.md` (Part1),
> `docs/backend/01-Secom-Backend-Architecture-Overview-Part2.md` (Part2),
> `docs/backend/01-Secom-Backend-Architecture-Overview-Part3.md` (Part3)
>
> **Scope:** Architecture findings only. No cross-document inference.
>
> **Last updated:** Quick Wins QW-1 through QW-8 implemented and reflected below.

---

## Table of Contents

1. [Prioritized Architecture Issues](#1-prioritized-architecture-issues)
2. [Architecture Technical Debt Assessment](#2-architecture-technical-debt-assessment)
3. [Phased Architecture Roadmap](#3-phased-architecture-roadmap)
4. [Architecture KPIs & Success Metrics](#4-architecture-kpis--success-metrics)
5. [Architecture Maturity Score](#5-architecture-maturity-score)
6. [Executive Summary](#6-executive-summary)

---

## 1. Prioritized Architecture Issues

### Severity Criteria

| Symbol | Meaning |
|--------|---------|
| 🟥 P0 | Production fragility, scaling blockers, tenant scoping risk |
| 🟧 P1 | Long-term maintainability or reliability risk |
| 🟨 P2 | Architectural refinement opportunity |
| 🟩 P3 | Strategic enhancement |
| ✅ | Resolved |

---

### 🟥 P0 – Architectural Instability / Structural Risk

| # | Issue | Architectural Impact | System Area | Effort | Status | Source Section |
|---|-------|----------------------|-------------|--------|--------|----------------|
| P0-1 | ~~Hardcoded fallback JWT/CSRF secrets in `env.ts`~~ | ~~App can start with weak secrets if `validateEnv()` is bypassed~~ | Configuration Management | 0.5 d | ✅ QW-1 | Part3 §6.5, Part3 §8.1 |
| P0-2 | ~~Default admin password `'Admin@Secom2024'` hardcoded in `seeds/defaultTenant.ts`~~ | ~~Predictable credential in source code~~ | Configuration Management / Seed | 0.5 d | ✅ QW-2 | Part3 §6.5, Part3 §8.1 |

All P0 issues resolved. No production fragility risks remain in this category.

---

### 🟧 P1 – Scalability / Maintainability Risks

| # | Issue | Architectural Impact | System Area | Effort | Status | Source Section |
|---|-------|----------------------|-------------|--------|--------|----------------|
| P1-1 | In-memory EventBus singleton — events not visible across processes | Blocks horizontal scaling; multi-instance deployment silently drops cross-instance events | Event-Driven Architecture | 5 d | 🔴 Open | Part3 §7.6, Part3 §8.1 (Finding 5), Part3 §8.2 |
| P1-2 | BullMQ workers co-located with HTTP server process | Worker CPU/memory contention degrades HTTP response times; workers cannot scale independently | Deployment Architecture / Bootstrap | 3 d | 🔴 Open | Part2 §5.8 (Concern), Part3 §8.1 (Finding 6) |
| P1-3 | Platform routes (`user.routes.ts`, `dashboard.routes.ts`) bypass service/repository layer | Breaks layered architecture contract; tenant scoping not guaranteed through BaseRepository | System Layering / Service Boundaries | 4 d | 🔴 Open | Part1 §3.5 (Concern), Part3 §7.10 (Concern), Part3 §8.1 (Finding 4) |
| P1-4 | `dashboard.routes.ts` imports models from all 7 domain modules (fan-in dependency) | Tight coupling between dashboard and every domain module | Modularity / Dependency Structure | 2 d | 🔴 Open | Part3 §7.10 (Concern) |
| P1-5 | ~~Audit logger middleware writes to MongoDB synchronously on every authenticated request~~ | ~~Synchronous DB write per request; performance bottleneck under load~~ | Observability / Performance | 3 d | ✅ QW-8 (partial) | Part2 §5.8 (Concern) |

> **P1-5 note:** QW-8 eliminated the synchronous write from the response path (`setImmediate`) and restricted audit writes to mutating methods only (`POST`, `PUT`, `PATCH`, `DELETE`). The remaining work — moving audit writes to a BullMQ queue for full batching and retry — is tracked as a Phase 3 enhancement.

---

### 🟨 P2 – Structural Improvements

| # | Issue | Architectural Impact | System Area | Effort | Status | Source Section |
|---|-------|----------------------|-------------|--------|--------|----------------|
| P2-1 | Dual validation libraries: Zod (domain modules) + express-validator (auth routes) | Two mental models; inconsistent error shapes | Dependency Structure / Layering | 2 d | 🔴 Open | Part1 §2.2 (Concern), Part3 §8.1 (Finding 7) |
| P2-2 | ~~Unused production dependencies: `stripe` (~15 MB) and `twilio`~~ | ~~Inflated install size; increased attack surface~~ | Dependency Structure | 0.5 d | ✅ QW-5 | Part2 §4.3, Part3 §8.1 (Finding 8) |
| P2-3 | ~~Duplicate token expiry configuration: `JWT_EXPIRES_IN` and `ACCESS_TOKEN_EXPIRES`~~ | ~~Config fields can diverge silently~~ | Configuration Management | 0.5 d | ✅ QW-6 | Part3 §6.5 (Concern), Part3 §8.1 (Finding 10) |
| P2-4 | No DI container — services instantiate their own dependencies at constructor time | Couples services to concrete implementations; complicates unit testing | Dependency Structure / Testability | 5 d | 🔴 Open | Part3 §7.8, Part3 §7.10 (Concern), Part3 §8.1 (Finding 12) |
| P2-5 | Migration framework is placeholder-only (single no-op migration file) | No rollback capability; production schema drift risk | Deployment Architecture / Data | 3 d | 🔴 Open | Part1 §3.5 (Concern), Part3 §8.1 (Finding 11) |
| P2-6 | ~~Imperative if/else chains in `validateEnv()`~~ | ~~Harder to maintain; missing variables produce runtime errors~~ | Configuration Management | 1 d | ✅ QW-7 | Part3 §6.5 (Concern) |
| P2-7 | Dual organization strategy: platform layer-based, domain feature-based | Two mental models coexist; onboarding friction | System Layering / Modularity | 1 d (doc only) | 🔴 Open | Part1 §3.5 (Concern) |
| P2-8 | ~~Error handler ordering fragility: 404 handler placed after error handler in Express 4~~ | ~~Subtle routing bugs in edge cases; non-standard 404 response shape~~ | System Layering / Bootstrap | 1 d | ✅ QW-4 | Part2 §5.8 (Concern) |

---

### 🟩 P3 – Optimization & Future Enhancements

| # | Issue | Architectural Impact | System Area | Effort | Status | Source Section |
|---|-------|----------------------|-------------|--------|--------|----------------|
| P3-1 | `otplib` dependency present but MFA flow not implemented | Dead dependency; incomplete feature | Dependency Structure | 1 d (remove) / 8 d (implement) | 🔴 Open | Part1 §2.2 (Concern), Part2 §4.3, Part3 §8.1 (Finding 15) |
| P3-2 | ~~Event listeners registered after `app.listen()` — narrow race window~~ | ~~Events emitted before handler registration are silently dropped~~ | Bootstrap / Event Architecture | 0.5 d | ✅ QW-3 | Part2 §5.8 (Concern), Part3 §8.1 (Finding 16) |
| P3-3 | No secrets rotation mechanism for JWT secrets | Static secrets cannot be rotated without downtime | Configuration Management | 3 d | 🔴 Open | Part3 §6.5 (Concern) |
| P3-4 | Observability limited to Sentry (optional) + Pino logs; no structured metrics or distributed tracing | Insufficient for production diagnosis in scaled deployments | Observability | 5 d | 🔴 Open | Part3 §8.2 |
| P3-5 | ESLint 8 + @typescript-eslint v6 are 2+ major versions behind | Misses TypeScript 5.x linting improvements | Dependency Structure | 1 d | 🔴 Open | Part2 §4.3, Part3 §8.1 (Finding 13) |
| P3-6 | `swagger-jsdoc` v6 behind v7 | Missing OpenAPI 3.1 support | Dependency Structure | 0.5 d | 🔴 Open | Part2 §4.3, Part3 §8.1 (Finding 14) |
| P3-7 | No production secrets management service integration | Secrets injected as plain env vars; no audit trail or rotation | Configuration Management / Deployment | 5 d | 🔴 Open | Part3 §6.4 |

---

## 2. Architecture Technical Debt Assessment

### Debt Table

| Category | Description | Risk if Ignored | Remaining Effort | Status |
|----------|-------------|-----------------|------------------|--------|
| **Configuration Management Debt** | ~~Hardcoded secrets and admin password~~ resolved. ~~Duplicate token expiry~~ resolved. ~~Imperative env validation~~ replaced with Zod. Remaining: secrets rotation mechanism, secrets management service | Config drift; auth downtime on rotation | 8 d | 🟡 Partially resolved |
| **Structural Layering Debt** | Platform routes bypass service/repository layer; direct model queries in `user.routes.ts` and `dashboard.routes.ts` | Untestable routes; tenant scoping gaps | 6 d | 🔴 Open |
| **Infrastructure Coupling Debt** | BullMQ workers co-located with HTTP server; no separate worker process | Resource contention; cannot scale workers independently | 3 d | 🔴 Open |
| **Scalability Constraints** | In-memory EventBus blocks horizontal scaling | Multi-instance deployment silently drops events | 5 d | 🔴 Open |
| **Observability Gaps** | ~~Synchronous audit writes~~ resolved (async + write-only guard). Remaining: BullMQ-backed audit queue, structured metrics, distributed tracing | Blind spots in production diagnosis | 6 d | 🟡 Partially resolved |
| **Dependency Structure Debt** | ~~Unused Stripe/Twilio~~ removed. Dual validation libraries (Zod + express-validator) and fan-in dashboard imports remain | Cognitive overhead; tight coupling | 4 d | 🟡 Partially resolved |
| **Deployment Architecture Debt** | Migration framework is placeholder-only | No rollback; production schema drift | 3 d | 🔴 Open |
| **Resilience & Fault Tolerance Debt** | ~~Event listener race~~ resolved. ~~Error handler ordering~~ resolved. Remaining: secrets rotation | Edge-case routing bugs eliminated; auth downtime on rotation remains | 3 d | 🟡 Partially resolved |

### Summary

| Metric | Original | Remaining | Resolved |
|--------|----------|-----------|---------|
| Total estimated developer-days | 37 d | **~26 d** | **~11 d** |
| P0 issues | 2 / 1 d | 0 / 0 d | 2 / 1 d ✅ |
| P1 issues | 5 / 17 d | 4 / 14 d | 1 / 3 d (partial) |
| P2 issues | 8 / 13.5 d | 4 / 11 d | 4 / 2.5 d ✅ |
| P3 issues | 7 / 15.5 d | 6 / 15 d | 1 / 0.5 d ✅ |

**Confidence level:** Medium (±25%) — based on static analysis; no runtime profiling data.

---

## 3. Phased Architecture Roadmap

---

### Phase 1 – Stabilization ✅ COMPLETE

**Goal:** Eliminate production fragility risks and protect tenant scoping integrity.

| Issue | Effort | Status |
|-------|--------|--------|
| P0-1 — Remove hardcoded fallback secrets from `env.ts` | 0.5 d | ✅ QW-1 |
| P0-2 — Remove hardcoded default admin password from seed | 0.5 d | ✅ QW-2 |
| P3-2 — Move `registerAuthEventListeners()` before `app.listen()` | 0.5 d | ✅ QW-3 |
| P2-8 — Fix error handler / 404 handler ordering in `app.ts` | 1 d | ✅ QW-4 |

**Total Effort:** ~2.5 developer-days — **delivered**

**Delivered outcomes:**
- Production deployments can no longer start with weak auth or CSRF secrets
- Default admin credential removed from source control
- Event listener race window closed
- 404 responses now use the standard `{ success, error, meta }` envelope; routing is correct by Express 4 conventions

---

### Phase 2 – Structural Hardening (Weeks 3–6)

**Goal:** Enforce the layered architecture contract across all routes, clean up configuration and dependency structure, and establish safe schema management.

| Issue | Effort | Status |
|-------|--------|--------|
| P2-2 — ~~Remove unused Stripe and Twilio dependencies~~ | 0.5 d | ✅ QW-5 |
| P2-3 — ~~Consolidate duplicate token expiry config vars~~ | 0.5 d | ✅ QW-6 |
| P2-6 — ~~Replace imperative `validateEnv()` with Zod schema~~ | 1 d | ✅ QW-7 |
| P1-3 — Refactor `user.routes.ts` to use service/repository layer | 2 d | 🔴 Open |
| P1-4 — Extract dashboard service to eliminate fan-in model imports | 2 d | 🔴 Open |
| P2-1 — Consolidate validation on Zod; remove express-validator | 2 d | 🔴 Open |
| P2-5 — Implement real database migrations (indexes, schema changes) | 3 d | 🔴 Open |

**Total Effort:** ~11 d original — **~7 d remaining** (2 d delivered via quick wins)

**Dependencies:**
- P1-4 depends on P1-3 (dashboard service follows same pattern as user service)
- P2-5 requires agreement on migration strategy (migrate-mongo is already present)

**Business Impact:**
- Platform routes gain the same tenant scoping guarantees as domain modules
- Dependency graph is accurate and auditable (partially delivered)
- Configuration validation is self-documenting (delivered)
- Schema changes can be deployed and rolled back safely in production

---

### Phase 3 – Scalability & Resilience (Weeks 7–10)

**Goal:** Remove the horizontal scaling blockers and complete the audit logging performance improvement.

| Issue | Effort | Status |
|-------|--------|--------|
| P1-5 — Complete audit logger migration to BullMQ queue (async + batched) | 1 d | 🔴 Open (async guard delivered in QW-8) |
| P1-1 — Migrate EventBus to Redis Pub/Sub or BullMQ-based distribution | 5 d | 🔴 Open |
| P1-2 — Extract BullMQ workers to a separate process | 3 d | 🔴 Open |

**Total Effort:** ~11 d original — **~9 d remaining** (2 d delivered via QW-8)

**Dependencies:**
- P1-1 requires Redis Pub/Sub or BullMQ event queue design decision before implementation
- P1-2 requires Docker Compose update and process manager configuration
- P1-5 BullMQ queue work can proceed independently; the `setImmediate` guard from QW-8 is a safe interim state

**Business Impact:**
- System becomes horizontally scalable — multiple API instances can run behind a load balancer
- Workers can be scaled independently from the HTTP tier
- Audit logging fully decoupled from the request path

---

### Phase 4 – Architecture Maturity (Weeks 11–14)

**Goal:** Improve long-term maintainability, observability depth, and strategic future-proofing.

| Issue | Effort | Status |
|-------|--------|--------|
| P2-4 — Introduce constructor injection pattern (lightweight DI) | 5 d | 🔴 Open |
| P3-4 — Add structured metrics (Prometheus) and distributed tracing (OpenTelemetry) | 5 d | 🔴 Open |
| P3-3 — Document and implement JWT secrets rotation procedure | 3 d | 🔴 Open |
| P3-1 — Implement MFA flow or remove `otplib` dependency | 1 d (remove) | 🔴 Open |
| P3-7 — Integrate production secrets management (AWS Secrets Manager or equivalent) | 5 d | 🔴 Open |
| P3-5 — Upgrade ESLint 9 + @typescript-eslint v8 | 1 d | 🔴 Open |
| P3-6 — Upgrade swagger-jsdoc v6 → v7 | 0.5 d | 🔴 Open |

**Total Effort:** ~20.5 developer-days — unchanged

**Dependencies:**
- P3-4 requires infrastructure decision (Prometheus scrape endpoint vs. push gateway; OpenTelemetry collector)
- P3-7 requires cloud provider and deployment environment to be defined
- P2-4 (DI) should precede P3-4 to make service instrumentation cleaner

---

## 4. Architecture KPIs & Success Metrics

| Metric | Original State | Current State | Target | Measurement Method |
|--------|---------------|---------------|--------|--------------------|
| Hardcoded secrets in source | 2 occurrences | **0 occurrences** ✅ | 0 occurrences | Static code scan / grep |
| Env config validation | Imperative if/else chains | **Zod schema** ✅ | Zod schema — self-documenting | Code review |
| Duplicate config vars | `JWT_EXPIRES_IN` + `ACCESS_TOKEN_EXPIRES` | **Consolidated** ✅ | Single canonical var | Code review |
| Unused production dependencies | Stripe + Twilio present | **Removed** ✅ | 0 unused deps | `npm ls` + dependency audit |
| 404 response envelope | Non-standard `{ message, path }` | **Standard `{ success, error, meta }`** ✅ | Consistent envelope | Integration test |
| Event listener race window | Listeners registered after `app.listen()` | **Closed** ✅ | No race window | Code review |
| Audit write latency impact | Synchronous MongoDB write per authenticated request | **Async (setImmediate) + write-only guard** ✅ | BullMQ-backed — zero blocking writes | Request latency p99 |
| Tenant scoping consistency | Platform routes bypass BaseRepository | Unchanged 🔴 | 100% of routes use service/repository layer | Code audit |
| Horizontal scaling readiness | Blocked (in-memory EventBus + co-located workers) | Unchanged 🔴 | Stateless HTTP tier; distributed events | Load test with 2+ instances |
| Migration coverage | 0 real migrations | Unchanged 🔴 | All schema changes tracked | Migration file count |
| Worker process isolation | Workers co-located with HTTP server | Unchanged 🔴 | Workers in separate process(es) | Process topology |
| Event delivery reliability | In-process only; drops on multi-instance | Unchanged 🔴 | Distributed event delivery | Integration test with 2 instances |
| Observability depth | Sentry (optional) + Pino logs only | Unchanged 🔴 | Structured metrics + distributed tracing | Monitoring dashboard |

---

## 5. Architecture Maturity Score

### Scoring Breakdown

| Dimension | Original Score | Current Score | Max | Change | Rationale |
|-----------|---------------|---------------|-----|--------|-----------|
| Layering Discipline | 14 | 14 | 20 | — | Platform routes still bypass service/repository layer (P1-3, P1-4 open) |
| Modularity | 16 | 17 | 20 | +1 | Stripe/Twilio removed; dependency graph is cleaner; dashboard fan-in remains |
| Scalability Readiness | 8 | 8 | 20 | — | EventBus and worker co-location blockers unchanged |
| Resilience Patterns | 10 | 12 | 15 | +2 | Audit writes async + write-only; event listener race closed; error handler ordering fixed |
| Observability | 7 | 7 | 15 | — | No metrics or tracing added yet |
| Deployment Maturity | 6 | 7 | 10 | +1 | Zod env validation; no hardcoded secrets; migrations still placeholder |
| Tenant Scoping Robustness | 8 | 8 | 10 | — | BaseRepository enforcement strong; platform routes still bypass it |

**Original Score: 69 / 100**
**Current Score: 73 / 100** (+4)

### Maturity Level: **MVP → Production-Ready Transition**

The P0 security risks are eliminated and several structural improvements are in place. The system is now safer to deploy but still not production-ready for multi-instance or high-load scenarios.

### Key Blockers to "Production-Ready" (80+)

1. **In-memory EventBus** — must be replaced with a distributed mechanism before running more than one instance (P1-1)
2. **Platform route layering gap** — tenant scoping is not uniformly enforced across all routes (P1-3, P1-4)
3. **No real migrations** — schema management is not safe for production schema evolution (P2-5)
4. **BullMQ audit queue** — `setImmediate` is a safe interim; full decoupling requires a queue (P1-5 remainder)

### Key Blockers to "Enterprise-Ready" (90+)

1. Distributed tracing and structured metrics (P3-4)
2. Secrets management service integration (P3-7)
3. Constructor injection / DI for testability and configurability (P2-4)
4. Worker process isolation with independent scaling (P1-2)
5. JWT secrets rotation procedure (P3-3)

---

## 6. Executive Summary

### Overall Architecture Health Score: 73 / 100 *(was 69)*

---

### Key Strengths

1. **Consistent domain module pattern** — All 7 domain modules follow an identical CLI-generated structure (controller → service → repository → model). This eliminates architectural drift, makes onboarding predictable, and positions the system for future microservice extraction with minimal refactoring. *(Part1 §3.3, Part3 §7.10)*

2. **Robust multi-tenancy via AsyncLocalStorage + BaseRepository** — Tenant isolation is enforced at the data layer through `BaseRepository.mergeFilter()`, which automatically injects `tenantId` into every query. This is an elegant, low-friction design that does not require tenant-aware code in every service. *(Part3 §7.4)*

3. **Comprehensive security middleware stack** — The middleware pipeline covers OWASP top concerns: Helmet headers, CORS, rate limiting (Redis-backed), CSRF (double-submit cookie), NoSQL injection prevention, and structured audit logging. Security is applied before business logic in the correct order. *(Part2 §5.2, Part3 §7.9)*

---

### Quick Wins Delivered (Phase 1 + partial Phase 2 & 3)

The following architectural risks have been resolved:

| Issue | Resolution |
|-------|-----------|
| Hardcoded JWT/CSRF fallback secrets | Removed — server refuses to start without explicit secrets |
| Hardcoded admin password in seed | Removed — `DEFAULT_ADMIN_PASSWORD` required in all environments |
| Event listener registration race | Closed — listeners registered before `app.listen()` |
| 404 / error handler ordering | Fixed — standard envelope, correct Express 4 ordering |
| Unused Stripe + Twilio dependencies | Removed — dependency graph is accurate |
| Duplicate token expiry config | Consolidated — single canonical `ACCESS_TOKEN_EXPIRES` |
| Imperative env validation | Replaced with Zod schema — self-documenting, exhaustive |
| Synchronous audit writes on all requests | Resolved — async (`setImmediate`) + write-methods-only guard |

---

### Remaining Structural Risks

1. **Horizontal scaling is blocked** — The in-memory EventBus singleton cannot distribute events across multiple server instances. BullMQ workers are co-located with the HTTP server. Deploying more than one instance today would silently drop domain events and create worker resource contention. *(Part3 §7.6, Part2 §5.8)*

2. **Platform routes bypass the layered architecture** — `user.routes.ts` and `dashboard.routes.ts` query Mongoose models directly, bypassing the service and repository layers. These routes do not benefit from the tenant scoping guarantees provided by `BaseRepository`. *(Part1 §3.5, Part3 §7.10)*

3. **No real database migrations** — Schema management relies entirely on Mongoose auto-creation. There is no rollback capability and no safe path for production schema evolution. *(Part1 §3.5, Part3 §8.1)*

---

### Estimated Investment

| Item | Original | Remaining |
|------|----------|-----------|
| Total developer-days | ~37 d | **~26 d** |
| Phase 1 (stabilization) | 2.5 d | ✅ Complete |
| Phase 2 (structural hardening) | 11 d | ~7 d remaining |
| Phase 3 (scalability & resilience) | 11 d | ~9 d remaining |
| Phase 4 (maturity) | 20.5 d | ~20.5 d remaining |
| Timeline | 14 weeks | ~12 weeks remaining |

**Risk if Phase 2–3 delayed:**
- Scaling to multiple instances without EventBus migration causes silent event loss
- Platform routes without layering enforcement create an untestable, tenant-unsafe surface area that grows more expensive to refactor over time
- No migration framework means production schema changes carry rollback risk

---

### Recommendation

**Moderate architectural refactor required — foundation significantly hardened.**

All P0 risks are eliminated. The codebase is now safer to deploy and the configuration layer is production-quality. The next priority is Phase 2 completion (platform route layering, migration framework) followed by Phase 3 (EventBus distribution, worker isolation) before any horizontal scaling is attempted.

---

*Roadmap updated to reflect QW-1 through QW-8 implementation. All findings traceable to `docs/backend/01-Secom-Backend-Architecture-Overview-Part1/2/3.md`.*
