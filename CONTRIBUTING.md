# Contributing to Secom Piquete

## Getting Started

```bash
npm run setup        # Install deps, generate secrets, copy .env files
npm run infra:up     # Start MongoDB, Redis, MailHog
npm run dev:all      # Start frontend + backend API + worker (creates secom tenant on first run)
npm run seed:test    # Populate database with Piquete domain test data
```

> ⚠️ **Always use `npm run dev:all`**, not `npm run dev` or `npm run server` alone.
> Running only the API server without the worker causes email delivery, webhook dispatch,
> and domain event processing to fail silently. The API server will log a warning at startup
> if the worker is not detected.

## Generating a Domain Module

```bash
npm run generate:module -- <name> --domain <domain>
```

This scaffolds backend files (model, repository, service, controller, routes, validators, events, types, tests) and frontend files (API service, React Query hooks).

After generating:
1. Add permissions to `backend/src/config/rbac/permissions.ts`
2. Register route in `backend/src/routes/v1/index.ts`
3. Add types to `packages/types/src/index.ts`

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user invitation flow
fix: resolve tenant middleware IP detection
docs: update README with new scripts
test: add tenant service unit tests
refactor: simplify TokenBlacklistService
chore: update dependencies
```

## Testing

| Command | Scope |
|---------|-------|
| `npm run test:all` | All tests |
| `npm run test:frontend` | Vitest (frontend) |
| `npm run test:backend` | Jest (backend) |
| `npm run test:e2e` | Cypress |

Requirements before merging:
- All existing tests pass
- New features include tests
- TypeScript compiles clean: `npm run type-check`

## Project Architecture

- **Multi-tenancy**: Shared DB with `tenantId`, enforced via `AsyncLocalStorage` + `BaseRepository`
- **RBAC**: Permissions defined in `config/rbac/`, checked via `authorizeWithPermissions` middleware
- **EventBus**: In-process pub/sub. Domain modules emit events, others react
- **Email**: BullMQ queue → emailService. Templates in `services/external/templates/`

## PR Checklist

- [ ] TypeScript compiles clean (`npm run type-check`)
- [ ] All tests pass (`npm run test:all`)
- [ ] New endpoints have Swagger annotations
- [ ] New features have tests
- [ ] Commit messages follow conventional commits
- [ ] No credentials or PII in code
