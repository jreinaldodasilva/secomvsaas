# vSaaS — Vertical SaaS Boilerplate

A production-ready, domain-agnostic boilerplate for building Vertical SaaS applications. Includes multi-tenancy, RBAC, event-driven architecture, and a CLI module generator — so you can focus on your domain logic.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, React Query, Zustand, React Router |
| Backend | Node.js, Express, TypeScript, Mongoose, BullMQ |
| Database | MongoDB 8, Redis 7 |
| Auth | JWT (httpOnly cookies), RBAC, MFA-ready |
| Testing | Vitest (frontend), Jest (backend), Cypress (e2e) |
| Infra | Docker Compose, GitHub Actions CI |

## Quick Start

```bash
# 1. Clone and setup
git clone <repo-url> && cd vsaas
npm run setup

# 2. Start infrastructure (MongoDB, Redis, MailHog)
npm run infra:up

# 3. Start dev servers (frontend + backend)
npm run dev:all
```

Frontend: http://localhost:3000
Backend API: http://localhost:5000
API Docs: http://localhost:5000/api-docs
MailHog: http://localhost:8025

## Generate a Domain Module

```bash
npm run generate:module -- invoices --domain billing
```

This scaffolds 10 files (model, repository, service, controller, routes, validators, events, types, index, test) under `backend/src/modules/domain/<name>/`. Follow the printed next-steps to wire permissions and routes.

## Project Structure

```
vsaas/
├── src/                    # Frontend (React + Vite)
│   ├── components/         # UI components, Auth, ErrorBoundary
│   ├── contexts/           # AuthContext
│   ├── layouts/            # AuthLayout, DashboardLayout
│   ├── pages/              # Login, ForgotPassword, Dashboard
│   ├── routes/             # React Router config
│   ├── services/           # HTTP client, API services
│   └── store/              # Zustand stores
├── backend/
│   ├── src/
│   │   ├── platform/       # Multi-tenancy core
│   │   │   ├── database/   # BaseRepository, tenantAware mixin
│   │   │   ├── events/     # EventBus, domain events catalog
│   │   │   └── tenants/    # Tenant model, service, middleware, routes
│   │   ├── config/         # env, database, RBAC, security, swagger
│   │   ├── middleware/     # auth, security, rate limiting, error handling
│   │   ├── models/         # User, AuditLog, RefreshToken
│   │   ├── modules/domain/ # Generated domain modules go here
│   │   ├── routes/         # v1 router, auth routes
│   │   └── services/       # auth, audit, cache, email, queue
│   └── tests/              # unit, integration, platform tests
├── packages/
│   ├── types/              # Shared TypeScript types (@vsaas/types)
│   └── cli/                # Module generator CLI
├── infrastructure/         # Docker Compose, Dockerfile
└── scripts/                # setup, build, secrets
```

## Key Concepts

- **Multi-tenancy**: Shared database with `tenantId` column. Enforced via AsyncLocalStorage + BaseRepository — every query is automatically tenant-scoped.
- **RBAC**: Role-based access control with permissions. Roles: `super_admin`, `admin`, `manager`, `staff`.
- **EventBus**: In-process event system with wildcard support. Domain modules emit events, other modules react.
- **BaseRepository**: Abstract class that auto-injects `tenantId` from AsyncLocalStorage into every query.
- **CLI Generator**: Scaffolds a complete domain module from a single command.

## API Versioning

All routes live under `/api/v1/`. When you need a breaking change:

1. Create `backend/src/routes/v2/index.ts` — copy the v1 router and modify only the changed routes.
2. Mount it in `app.ts`: `app.use('/api/v2', v2Routes);`
3. Keep v1 running alongside v2 until clients migrate.
4. Use the `Accept-Version` header or URL prefix — the boilerplate uses URL prefix by convention.
5. Deprecate v1 by adding a `Sunset` response header with a date, then remove it after the deadline.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run setup` | First-time project setup |
| `npm run dev:all` | Start frontend + backend |
| `npm run infra:up` | Start Docker services |
| `npm run infra:down` | Stop Docker services |
| `npm run test:all` | Run all tests |
| `npm run test:frontend` | Run frontend tests (Vitest) |
| `npm run test:backend` | Run backend tests (Jest) |
| `npm run type-check` | TypeScript check (both) |
| `npm run generate:module -- <name>` | Generate domain module |

## License

MIT
