# Secom Backend — Architecture Improvement Roadmap

> Source: `docs/backend/01-Secom-Backend-Architecture-Overview-Part1.md`,
> `docs/backend/01-Secom-Backend-Architecture-Overview-Part2.md`,
> `docs/backend/01-Secom-Backend-Architecture-Overview-Part3.md`
>
> Scope: Architecture-only. All findings are traceable to the overview documents above.

---

## 7. Executive Summary (CTO-Level)

### Overall Architecture Health Score

**67 / 100** — *Production-Ready (Single/Small Multi-Tenant)*

### Key Strengths

- **Tenant isolation is structurally enforced.** `BaseRepository` + `AsyncLocalStorage` (`TenantContext`) makes cross-tenant data leakage architecturally impossible through the standard data-access path. This is the most important correctness property in a multi-tenant system and it is correctly implemented. *(Part 1 §3.2 platform, Part 3 §7.4)*
- **Cohesive, modern stack.** No competing libraries for the same concern. TypeScript strict mode throughout. Zod validation at every boundary. *(Part 1 §2.2, Part 2 §4.4)*
- **Startup-time configuration validation.** The Zod-validated `env` object prevents the server from starting with missing or malformed configuration, eliminating an entire class of production incidents. *(Part 3 §6.2)*
- **Consistent vertical-slice module structure.** All seven domain modules follow an identical layout. Onboarding cost is low; a developer familiar with one module can navigate any other immediately. *(Part 1 §3.2)*
- **Graceful shutdown and health checks.** SIGTERM/SIGINT handling, 10-second force-exit timeout, and Kubernetes-compatible liveness/readiness probes are all present. *(Part 2 §5.2, §5.7)*
- **BullMQ-backed durable event bus.** Domain events survive process restarts. The worker process is correctly separated from the API server. *(Part 1 §3.2 queues, Part 3 §7.3)*

### Major Structural Risks

| # | Risk | Severity | Source |
|---|---|---|---|
| R1 | Multi-step writes (Tenant + User creation) have no database transaction — orphaned records on partial failure | 🟥 Critical | Part 3 §8 C2 |
| R2 | `DashboardService` bypasses `BaseRepository`, constructing raw tenant-filtered queries directly — isolation guarantee erodes if pattern spreads | 🟥 Critical | Part 3 §7.4, §7.6 |
| R3 | `backend/.env` present in directory listing — potential secret exposure if committed to VCS | 🟥 Critical | Part 3 §6.4 |
| R4 | Webhook delivery has no retry, no dead-letter queue, no delivery status — silent data loss on failure | 🟧 High | Part 3 §8 H3 |
| R5 | `VERIFY_USER_ON_REQUEST=false` in `.env.example` — deactivated users retain sessions if example is used verbatim in production | 🟧 High | Part 3 §6.5 |
| R6 | `AUDIT_LOG_TTL_DAYS` bypasses validated `env` object — unvalidated config in two production files | 🟧 High | Part 3 §8 H4 |
| R7 | No secrets manager — no rotation mechanism for JWT secrets, CSRF secret, or API keys | 🟧 High | Part 3 §6.4 |
| R8 | Single MongoDB instance, single Redis instance — no replica set or sentinel config observed | 🟧 High | Part 1 §2.1 |

### Estimated Investment

| Scope | Developer-Days | Timeline |
|---|---|---|
| P0 Critical stabilization | 4–6 days | Weeks 1–2 |
| P1 Structural hardening | 8–12 days | Weeks 3–6 |
| P2 Structural improvements | 6–9 days | Weeks 7–10 |
| P3 Optimization & maturity | 4–6 days | Weeks 11–14 |
| **Total** | **22–33 days** | **14 weeks** |

*Confidence: Medium. Estimates assume a developer already familiar with the codebase.*

### Recommendation

**Moderate architectural refactor required.** The foundation is sound. The tenant isolation model, module structure, and event system are production-grade. The required work is targeted hardening — not a rewrite. The three critical issues (transactions, dashboard bypass, secrets) can be resolved in under two weeks without touching the module structure.

---

## 1. Architecture Issue Extraction

### 1.1 Prioritized Architecture Issues

#### 🟥 P0 — Architectural Instability / Structural Risk

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| P0-1 | No database transactions on multi-step writes. `TenantService.create()` writes `User` then `Tenant` in two separate operations. Partial failure leaves orphaned records with no compensating mechanism. | Data integrity risk; orphaned documents corrupt tenant state | Multi-tenancy / Data Layer | 2–3 days | MongoDB replica set (transactions require replica set or mongos) | Part 3 §8 C2, §7.4 |
| P0-2 | `DashboardService` bypasses `BaseRepository`, constructing raw `{ tenantId }` Mongoose queries directly. Establishes a precedent that undermines the structural tenant isolation guarantee. | Tenant isolation erosion; reverse dependency violation | Service Layer / Multi-tenancy | 1–2 days | None | Part 3 §7.4, §7.6 |
| P0-3 | `backend/.env` file present in repository directory listing. If committed with real secrets, all JWT secrets, CSRF secret, and database credentials are exposed. | Credential exposure; full system compromise | Configuration / Secrets | < 1 day | None | Part 3 §6.4 C1 |

#### 🟧 P1 — Scalability / Maintainability Risks

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| P1-1 | Webhook delivery is fire-and-forget with no retry, no dead-letter queue, and no delivery status persistence. A single transient network failure silently drops the event. | Reliability risk for integrations; no observability into delivery failures | Resilience / Async Layer | 2–3 days | BullMQ (already present) | Part 3 §8 H3 |
| P1-2 | `VERIFY_USER_ON_REQUEST=false` in `.env.example`. If copied verbatim to production, deactivated users retain valid sessions for up to 15 minutes after deactivation. | Auth session integrity risk in production | Configuration / Auth | < 1 day | None | Part 3 §6.5 |
| P1-3 | `AUDIT_LOG_TTL_DAYS` read directly from `process.env` in `AuditLog.ts` and `auditCleanupQueue.ts`, bypassing the Zod-validated `env` object. Unvalidated config can silently default to `90` or produce `NaN`. | Configuration integrity; audit retention misconfiguration | Configuration Management | < 1 day | None | Part 3 §8 H4, §6.5 |
| P1-4 | No secrets manager. JWT secrets, CSRF secret, and API keys are loaded from `.env` files with no rotation mechanism. | Operational security risk; no secret rotation path | Infrastructure / Secrets | 3–5 days | AWS Secrets Manager or equivalent | Part 3 §6.4 |
| P1-5 | Single MongoDB instance and single Redis instance with no replica set or sentinel configuration observed. Both are single points of failure. | Availability risk; no failover for primary data store or cache/queue broker | Infrastructure / Deployment | 3–5 days | Infrastructure provisioning | Part 1 §2.1 |
| P1-6 | Two authorization mechanisms coexist (`authorize` role-based and `authorizeWithPermissions` permission-based) applied inconsistently across routes. Access control audit is unreliable. | Security auditability; inconsistent enforcement surface | Auth / RBAC Layer | 2–3 days | None | Part 3 §7.5, §8 H2 |
| P1-7 | `emailWorker` starts as an implicit side effect of module import in `queues/emailQueue.ts`. Not visible from reading `worker.ts`. Implicit startup behavior is a maintenance and debugging risk. | Deployment clarity; worker lifecycle management | Async Layer / Deployment | 1 day | None | Part 2 §5.3 |

#### 🟨 P2 — Structural Improvements

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| P2-1 | `routes/auth.ts` contains 300 LOC of inline async handler logic, inconsistent with the controller pattern used by all seven domain modules. | Structural inconsistency; harder to test auth handlers in isolation | Layering / HTTP Layer | 1–2 days | None | Part 1 §3.4, Part 3 §8 M4 |
| P2-2 | CSRF skip list is hardcoded inline in `app.ts`. A security-critical configuration is not in a named, auditable constant. | Maintainability; security configuration visibility | Middleware / Configuration | < 1 day | None | Part 2 §5.4, Part 3 §8 M3 |
| P2-3 | `isomorphic-dompurify` is a production dependency with no observed usage in route handlers or services. An unused security library creates a false sense of protection. | Dependency hygiene; misleading security posture | Dependency Structure | < 1 day | None | Part 1 §2.2, Part 2 §4.3, Part 3 §8 M1 |
| P2-4 | MFA feature is partially implemented: `mfaEnabled`/`mfaSecret` fields on `User` model, `otplib` dependency, and security policy constants exist, but no enrollment or verification routes are present. The `mfaEnabled` flag can be set with no enforcement path. | Incomplete feature creates a false security signal | Auth Layer / Modularity | 3–5 days (complete) or < 1 day (remove) | None | Part 1 §2.2, Part 2 §4.3, Part 3 §8 M2 |
| P2-5 | RBAC registry is static (compile-time). No mechanism for runtime permission customization per tenant (e.g., feature flags per tenant plan). | Scalability of access control model as tenant plans diverge | RBAC / Multi-tenancy | 3–5 days | None | Part 3 §7.5 |
| P2-6 | No staging environment configuration or staging-specific validation rules. Only development and production environments are differentiated. | Deployment safety; no pre-production validation gate | Configuration / Deployment | 1–2 days | None | Part 3 §6.5 |
| P2-7 | `res.send`/`res.json` monkey-patching in `auditLogger.ts` and `normalizeResponse.ts` introduces subtle ordering dependencies. Incorrect middleware ordering can silently break audit logging or response normalization. | Middleware fragility; ordering-sensitive behavior | Middleware Layer | 2–3 days | None | Part 1 §3.2, Part 2 §5.4 |

#### 🟩 P3 — Optimization & Future Enhancements

| # | Issue | Architectural Impact | System Area | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| P3-1 | No OpenTelemetry or distributed tracing beyond Sentry. No structured trace IDs propagated through the async event pipeline. | Observability ceiling; difficult to trace a request through API → EventBus → Worker | Observability | 3–5 days | OpenTelemetry SDK | Part 1 §2.2 |
| P3-2 | No DI container. Services use constructor instantiation and module-level singletons. Unit tests require Jest module-level mocking rather than constructor injection. | Testability ceiling; harder to isolate units as complexity grows | Modularity / Testability | 3–5 days | None | Part 3 §7.7 |
| P3-3 | `PORTAL_JWT_SECRET` is validated and required at startup but its usage in a citizen portal auth flow is not present in current routes. A required secret with no implementation path. | Configuration clarity; dead configuration weight | Configuration / Auth | 1 day (document) or 3–5 days (implement) | None | Part 3 §8 L4 |
| P3-4 | Redundant `dotenv.config()` calls in `app.ts`, `config/database/redis.ts`, and `config/env.ts`. | Code clarity; misleading initialization sequence | Configuration | < 1 day | None | Part 2 §4.3, Part 3 §8 L1 |
| P3-5 | ESLint v8 and `@typescript-eslint` v6 are in maintenance mode. Stricter type-aware rules available in v9/v8 are not enforced. | Toolchain debt; missed static analysis coverage | Dev Tooling | 1 day | None | Part 2 §4.2, Part 3 §8 L2 |
| P3-6 | `uploads/` directory committed to repository. Appropriate for development but must be excluded from production Docker images. | Deployment hygiene; image bloat | Deployment | < 1 day | None | Part 1 §3.4 |

---

## 2. Architecture Technical Debt Assessment

### 2.1 Debt by Category

| Category | Description | Risk if Ignored | Effort Estimate | Priority |
|---|---|---|---|---|
| **Structural Layering Debt** | `DashboardService` reverse dependency on domain module models; `routes/auth.ts` inline handlers violating controller pattern | Isolation guarantee erodes; structural inconsistency spreads to new modules | 3–4 days | P0/P2 |
| **Data Scoping Debt** | No MongoDB transactions for multi-step writes; tenant isolation relies entirely on application-layer correctness with no database-level enforcement | Orphaned records on partial failure; tenant data leakage if bypass pattern spreads | 3–5 days | P0 |
| **Resilience & Fault Tolerance Debt** | Webhook delivery with no retry or durability; single MongoDB and Redis instances with no failover config | Silent data loss on webhook failures; full outage on infrastructure node failure | 5–8 days | P1 |
| **Configuration Management Debt** | `AUDIT_LOG_TTL_DAYS` bypasses validated env; `VERIFY_USER_ON_REQUEST=false` in example; no staging env; no secrets manager | Misconfigured production deployments; secret exposure; no pre-production gate | 5–7 days | P1 |
| **Observability Debt** | No distributed tracing; no trace ID propagation through async event pipeline; `emailWorker` implicit startup | Blind spots in async flows; difficult incident diagnosis | 4–6 days | P1/P3 |
| **Modularity & Completeness Debt** | Partially implemented MFA (model fields + dependency, no routes); unused `isomorphic-dompurify`; undocumented `PORTAL_JWT_SECRET` | False security signals; dependency bloat; developer confusion | 2–3 days | P2 |
| **RBAC Architecture Debt** | Two coexisting authorization mechanisms; static RBAC with no per-tenant runtime customization | Inconsistent access control surface; cannot support per-plan feature gating | 5–8 days | P1/P2 |
| **Deployment Architecture Debt** | No secrets manager; `uploads/` in repo; no staging environment config; single-instance infrastructure | Operational risk; no secret rotation; deployment hygiene issues | 5–8 days | P1/P2 |

### 2.2 Debt Summary

| Metric | Value |
|---|---|
| Total estimated developer-days | 32–49 days |
| P0 Critical items | 3 issues, 4–6 days |
| P1 High items | 7 issues, 12–18 days |
| P2 Medium items | 7 issues, 11–18 days |
| P3 Low items | 6 issues, 9–13 days |
| Confidence level | Medium |

**Assumptions:**
- Developer is already familiar with the codebase (no ramp-up time included).
- MongoDB replica set provisioning (required for transactions) is treated as an infrastructure task, not a code task; code-side effort only is estimated.
- MFA completion estimate assumes implementing enrollment + verification + recovery routes only, not a full MFA UX.
- Secrets manager integration effort varies significantly by target platform; 3–5 days assumes AWS Secrets Manager with existing AWS SDK.

---

## 3. Phased Architecture Roadmap

### Phase 1 — Stabilization (Weeks 1–2)

**Goal:** Eliminate structural risks that can cause data corruption, credential exposure, or silent production misconfiguration. No new features. No module restructuring.

**Included Issues:** P0-1, P0-2, P0-3, P1-2, P1-3

| Task | Issue | Effort |
|---|---|---|
| Verify `.env` gitignore status; rotate secrets if committed | P0-3 | 0.5 days |
| Wrap `TenantService.create()` (User + Tenant) in a MongoDB session transaction | P0-1 | 2 days |
| Refactor `DashboardService` to call domain module methods instead of importing models directly | P0-2 | 1.5 days |
| Fix `VERIFY_USER_ON_REQUEST=false` in `.env.example`; add explanatory comment | P1-2 | 0.5 days |
| Move `AUDIT_LOG_TTL_DAYS` into `config/env.ts` Zod schema; update consumers | P1-3 | 0.5 days |

**Total effort:** 5 days
**Dependencies:** MongoDB must be running as a replica set (or mongos) for transactions. If the current dev/production setup is a standalone instance, replica set initialization is a prerequisite infrastructure task.
**Business impact:** Eliminates data integrity risk on tenant registration; closes the tenant isolation bypass; removes credential exposure risk.

---

### Phase 2 — Structural Hardening (Weeks 3–6)

**Goal:** Harden service boundaries, standardize authorization, improve configuration safety, and make the async layer observable.

**Included Issues:** P1-1, P1-4, P1-6, P1-7, P2-1, P2-2, P2-6

| Task | Issue | Effort |
|---|---|---|
| Route webhook delivery through BullMQ; add retry, dead-letter queue, delivery status model | P1-1 | 3 days |
| Standardize all routes to `authorizeWithPermissions`; deprecate and remove `authorize` | P1-6 | 2 days |
| Make `emailWorker` startup explicit in `worker.ts`; remove implicit side-effect initialization | P1-7 | 1 day |
| Extract auth route handlers to `controllers/auth.controller.ts` | P2-1 | 1.5 days |
| Extract CSRF skip list to a named constant in `config/` | P2-2 | 0.5 days |
| Add `.env.staging` template and staging-specific Zod validation rules | P2-6 | 1.5 days |
| Evaluate secrets manager integration (AWS Secrets Manager); implement or document rotation procedure | P1-4 | 3 days |

**Total effort:** 12.5 days
**Dependencies:** Phase 1 complete. BullMQ already present (no new infrastructure for webhook queue).
**Business impact:** Reliable webhook delivery; auditable access control; safer deployment pipeline; explicit worker lifecycle.

---

### Phase 3 — Scalability & Resilience (Weeks 7–10)

**Goal:** Address infrastructure single points of failure, resolve incomplete features, and eliminate dependency hygiene issues.

**Included Issues:** P1-5, P2-3, P2-4, P2-5, P2-7

| Task | Issue | Effort |
|---|---|---|
| Provision MongoDB replica set and Redis Sentinel/Cluster; update connection config | P1-5 | 3 days |
| Resolve `isomorphic-dompurify`: apply to HTML fields before persistence or remove | P2-3 | 0.5 days |
| Resolve MFA: implement enrollment/verification/recovery routes or remove model fields and `otplib` | P2-4 | 4 days (implement) or 0.5 days (remove) |
| Design per-tenant feature flag layer on top of static RBAC registry | P2-5 | 4 days |
| Replace `res.send`/`res.json` monkey-patching in `auditLogger` and `normalizeResponse` with explicit response interceptors or route-level wrappers | P2-7 | 2 days |

**Total effort:** 10–14 days
**Dependencies:** Phase 2 complete. Infrastructure provisioning for replica set/sentinel is a prerequisite for the MongoDB/Redis tasks.
**Business impact:** Eliminates infrastructure single points of failure; enables per-tenant plan differentiation; removes false security signals from unused dependencies.

---

### Phase 4 — Architecture Maturity (Weeks 11–14)

**Goal:** Improve observability, testability, and toolchain quality. Future-proof the architecture for growth.

**Included Issues:** P3-1, P3-2, P3-3, P3-4, P3-5, P3-6

| Task | Issue | Effort |
|---|---|---|
| Add OpenTelemetry instrumentation; propagate trace IDs through API → EventBus → Worker | P3-1 | 4 days |
| Introduce constructor injection for service dependencies; remove `jest.mock` dependency in unit tests | P3-2 | 3 days |
| Document or implement `PORTAL_JWT_SECRET` citizen portal auth flow | P3-3 | 1 day |
| Remove redundant `dotenv.config()` calls | P3-4 | 0.5 days |
| Upgrade ESLint to v9 and `@typescript-eslint` to v8 | P3-5 | 1 day |
| Add `uploads/` to `.dockerignore`; verify production image excludes local storage | P3-6 | 0.5 days |

**Total effort:** 10 days
**Dependencies:** Phase 3 complete.
**Business impact:** Faster incident diagnosis through distributed tracing; improved developer experience; cleaner production images.

---

## 4. Architecture KPIs & Success Metrics

| Metric | Current State | Target | Measurement Method |
|---|---|---|---|
| Tenant isolation consistency | Enforced via `BaseRepository` on all domain paths; bypassed in `DashboardService` | 100% of tenant-scoped queries routed through `BaseRepository` | Static dependency analysis — zero direct `{ tenantId }` filter constructions outside `BaseRepository` |
| Multi-step write atomicity | 0% of multi-collection writes use transactions | 100% of multi-collection writes wrapped in MongoDB sessions | Code audit of all service methods writing to > 1 collection |
| Authorization mechanism consistency | Two mechanisms (`authorize`, `authorizeWithPermissions`) used inconsistently | Single mechanism (`authorizeWithPermissions`) on 100% of protected routes | Route audit — zero `authorize()` calls remaining |
| Configuration validation coverage | `AUDIT_LOG_TTL_DAYS` bypasses validated `env` | 100% of env vars consumed via validated `env` object | Grep for `process.env` outside `config/env.ts` — zero results |
| Webhook delivery reliability | Fire-and-forget, no retry, no status tracking | Queued delivery with 3 retry attempts and persisted delivery status | BullMQ job failure rate + delivery status records |
| Infrastructure resilience | Single MongoDB instance, single Redis instance | MongoDB replica set (≥ 3 nodes), Redis Sentinel or Cluster | Infrastructure topology audit |
| Worker startup explicitness | `emailWorker` starts as implicit module import side effect | All worker startups explicit in `worker.ts` | Code review of `worker.ts` entry point |
| Secrets rotation capability | No rotation mechanism; secrets in `.env` files | Secrets loaded from managed store with documented rotation procedure | Operational runbook existence |
| Observability coverage | Sentry error tracking only; no distributed tracing | Trace IDs propagated through API → EventBus → Worker | OpenTelemetry trace completeness in staging |

---

## 5. Architecture Maturity Score

### Scoring Breakdown

| Dimension | Score | Max | Notes |
|---|---|---|---|
| Layering discipline | 14 | 20 | Strong vertical-slice modules and platform separation; penalized for `DashboardService` reverse dependency and `routes/auth.ts` inline handlers |
| Modularity | 15 | 20 | Consistent 7-module structure with clean `index.ts` boundaries; penalized for incomplete MFA feature and unused `dompurify` dependency |
| Scalability readiness | 8 | 15 | Good async event architecture; penalized for single-instance MongoDB/Redis, static RBAC with no per-tenant customization |
| Resilience patterns | 7 | 15 | Graceful shutdown, retry on DB connect, BullMQ retry on events/email; penalized for no transactions, no webhook retry, no infrastructure failover |
| Observability | 8 | 15 | Structured Pino logging, Sentry, health checks, request IDs, audit trail; penalized for no distributed tracing, implicit worker startup |
| Deployment maturity | 7 | 10 | Docker Compose, GitHub Actions CI, health probes; penalized for no staging env, no secrets manager, `uploads/` in repo |
| Tenant scoping robustness | 8 | 10 | `BaseRepository` + `AsyncLocalStorage` is structurally sound; penalized for `DashboardService` bypass and no database-level enforcement |

**Total: 67 / 100**

### Maturity Level

**Production-Ready (Single/Small Multi-Tenant)**

The system is deployable and operationally sound for a controlled multi-tenant environment. It is not yet hardened for high-load or high-criticality multi-tenant operation where data integrity guarantees, infrastructure resilience, and secret rotation are non-negotiable.

### Key Blockers to Next Level (Enterprise-Ready, ~80/100)

1. MongoDB transactions on multi-step writes (P0-1)
2. Infrastructure resilience — replica set + Redis Sentinel (P1-5)
3. Secrets manager integration (P1-4)
4. Webhook delivery durability (P1-1)
5. Unified authorization mechanism (P1-6)
