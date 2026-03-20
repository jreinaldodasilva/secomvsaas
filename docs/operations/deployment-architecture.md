# Deployment Architecture — HTTP/Worker Process Separation

## Overview

The Secom backend runs as **two independent processes** that must both be running for the system to function correctly:

| Process | Entry Point | Role |
|---|---|---|
| API server | `src/server.ts` / `dist/server.js` | Handles all HTTP requests |
| Worker | `src/worker.ts` / `dist/worker.js` | Processes background jobs (email, webhooks, domain events, audit cleanup) |

These processes share the same MongoDB database and Redis instance but are otherwise fully independent. They can be scaled, deployed, and restarted independently.

---

## Why Two Processes

The separation exists for two reasons:

1. **Scaling independence.** Under load, the HTTP tier and the job processing tier have different resource profiles. The API server is I/O-bound and benefits from horizontal scaling. The worker is queue-bound and typically needs only one or a few instances.

2. **Fault isolation.** A worker crash does not take down the HTTP API. Jobs accumulate in the BullMQ queue (Redis-backed) and are processed when the worker recovers. BullMQ provides automatic retry with exponential backoff.

---

## What Breaks Without the Worker

If the worker process is not running:

| Feature | Impact |
|---|---|
| Email delivery (invites, password reset, notifications) | Silent failure — jobs queue in Redis, delivered when worker starts |
| Webhook dispatch | Silent failure — jobs queue in Redis |
| Domain event processing | Silent failure — events queue in Redis |
| Audit log cleanup | Skipped — runs daily at 03:00 |

The API server emits a startup warning in `development` if the worker health signal is absent from Redis:

```
⚠️  Worker process is not running. Email delivery, webhook dispatch,
    and domain event processing will fail silently.
⚠️  Run 'npm run dev:all' from the project root to start the API,
    worker, and frontend together.
```

---

## Worker Health Signal

The worker publishes a Redis key `worker:health` with a 60-second TTL on startup and refreshes it every 30 seconds. The API server checks this key at startup (development only) to detect a missing worker.

This is a best-effort signal — it does not block the API from starting and is not checked at runtime.

---

## Running Locally (Development)

Always use `npm run dev:all` from the project root. This starts all three processes concurrently:

```bash
npm run dev:all
# Starts: frontend (Vite) + API server (nodemon) + worker (nodemon)
```

Running only `npm run dev` (backend only) or `cd backend && npm run dev` starts the API server without the worker. Background job processing will be unavailable.

---

## Docker Compose (Development)

```bash
# Start infrastructure (MongoDB, Redis, MailHog)
npm run infra:up

# Start all services including API + worker
docker compose -f infrastructure/docker/docker-compose.dev.yml up --build
```

The `worker` service in `docker-compose.dev.yml`:
- Runs the same image as `api` with `command: node dist/worker.js`
- Has `depends_on: [mongo, redis]` with health checks
- Has `restart: unless-stopped` — auto-restarts on crash

---

## Docker Compose (Staging)

```bash
docker compose \
  -f infrastructure/docker/docker-compose.yml \
  -f infrastructure/docker/docker-compose.staging.yml \
  up -d
```

The staging overlay adds:
- `restart: unless-stopped` on both `api` and `worker`
- Production multi-stage build (`backend/Dockerfile`, `target: production`)
- `NODE_ENV: staging` and `.env.staging` env file
- Redis password enforcement via `REDIS_PASSWORD`
- MailHog disabled (real email provider used)

---

## Production Deployment Model

### Recommended: Docker Compose (single host)

```
┌─────────────────────────────────────────────┐
│  Host                                       │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  api     │  │  worker  │  │  mongo   │  │
│  │ :5000    │  │          │  │  :27017  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                               ┌──────────┐  │
│                               │  redis   │  │
│                               │  :6379   │  │
│                               └──────────┘  │
└─────────────────────────────────────────────┘
```

Both `api` and `worker` use the same Docker image (`backend/Dockerfile`, `target: production`). The only difference is the startup command:
- `api`: `node dist/server.js` (default CMD)
- `worker`: `node dist/worker.js` (overrides CMD)

### Scaling the API Tier

To run multiple API instances behind a load balancer:

```yaml
# In docker-compose override
api:
  deploy:
    replicas: 3
```

Requirements for horizontal API scaling:
- Redis-backed rate limiting ✅ (already implemented)
- Redis-backed idempotency ✅ (already implemented)
- Stateless JWT authentication ✅ (no server-side session)
- Shared MongoDB replica set ✅ (already configured)

### Scaling the Worker Tier

BullMQ supports multiple concurrent workers consuming from the same queue. To run multiple worker instances:

```yaml
worker:
  deploy:
    replicas: 2
```

Each worker instance will compete for jobs. BullMQ's locking mechanism ensures each job is processed exactly once.

**Note:** The `scheduleAuditCleanup()` cron job should only run on one worker instance. With multiple workers, the cron will fire on each instance. This is safe (idempotent cleanup) but wasteful. A future improvement is to use BullMQ's `repeat` job with a named key to deduplicate.

---

## Build

The production image is built from `backend/Dockerfile` using the **repository root** as the build context (required to include `packages/types/`):

```bash
# From repo root
docker build \
  -f backend/Dockerfile \
  --target production \
  -t secom-api:latest \
  .
```

The Dockerfile uses a three-stage build:
1. `deps` — installs production dependencies only (`npm ci --omit=dev`)
2. `build` — installs all dependencies and compiles TypeScript
3. `production` — copies only `node_modules` and `dist/` from previous stages; runs as non-root `node` user

---

## Environment Variables

Both processes require the same environment variables. See `backend/.env.example` for the full list.

Key variables relevant to the worker:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MongoDB connection string |
| `REDIS_URL` | Redis connection URL |
| `FROM_EMAIL` | Email sender address |
| `SENDGRID_API_KEY` | Required in production for email delivery |
| `AUDIT_LOG_TTL_DAYS` | Audit log retention (default: 90 days) |

---

## Graceful Shutdown

Both processes handle `SIGTERM` and `SIGINT`:

**API server shutdown sequence:**
1. Stop accepting new HTTP connections (`server.close()`)
2. Close Redis connection
3. Close MongoDB connection
4. `process.exit(0)`
5. Hard timeout: `process.exit(1)` after 10 seconds

**Worker shutdown sequence:**
1. Close all BullMQ workers (drain in-flight jobs)
2. Close all BullMQ queues
3. Close Redis connection
4. Close MongoDB connection
5. `process.exit(0)`

Docker Compose sends `SIGTERM` on `docker compose stop` or `docker compose down`. The 10-second hard timeout in the API server aligns with Docker's default `stop_grace_period` of 10 seconds.

To increase the grace period for the worker (recommended if jobs can take longer than 10 seconds):

```yaml
worker:
  stop_grace_period: 30s
```
