# Contributing to vSaaS

## Getting Started

```bash
npm run setup        # Install deps, generate secrets, copy .env files
npm run infra:up     # Start MongoDB, Redis, MailHog
npm run seed         # Create super_admin + demo tenant
npm run dev:all      # Start frontend + backend
```

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
