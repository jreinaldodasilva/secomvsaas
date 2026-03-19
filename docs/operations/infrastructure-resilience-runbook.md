# Infrastructure Resilience Runbook — Secom Backend

> Scope: MongoDB replica set and Redis high-availability configuration.
> Last updated: P1-5 implementation.
> Related code: `backend/src/config/database/database.ts`, `backend/src/config/database/redis.ts`

---

## 1. Current State vs Target

| Component | Development | Production Target |
|-----------|-------------|-------------------|
| MongoDB | Single-node replica set (`rs0`) via Docker Compose | 3-node replica set (1 primary + 2 secondaries) |
| Redis | Standalone | Redis Sentinel (3 sentinels) or Redis Cluster |

---

## 2. MongoDB Replica Set

### 2.1 Why a Replica Set is Required

MongoDB multi-document transactions (used in `TenantService.create()` and `ensureDefaultTenant()`) require a replica set or mongos. A standalone `mongod` will throw:

```
MongoServerError: Transaction numbers are only allowed on a replica set member or mongos
```

The Docker Compose files already run MongoDB with `--replSet rs0` and auto-initiate the replica set on first start.

### 2.2 Development Setup (Docker Compose)

```bash
# Start infrastructure (replica set auto-initiates)
npm run infra:up

# Verify replica set status
docker exec -it <mongo-container> mongosh --eval "rs.status()"
```

The `DATABASE_URL` must include `?replicaSet=rs0`:
```
DATABASE_URL=mongodb://localhost:27017/vsaas?replicaSet=rs0
```

### 2.3 Production — 3-Node Replica Set

#### Prerequisites
- 3 servers (or VMs/containers) with MongoDB 8 installed
- Odd number of voting members to ensure majority elections
- Network connectivity between all members on port 27017
- Same MongoDB version on all nodes

#### Step 1 — Start mongod with replica set flag on each node

```bash
# On each node (node1, node2, node3)
mongod --replSet rs0 --bind_ip_all --port 27017 --dbpath /var/lib/mongodb
```

Or in `/etc/mongod.conf`:
```yaml
replication:
  replSetName: "rs0"
net:
  bindIp: 0.0.0.0
  port: 27017
```

#### Step 2 — Initiate the replica set (run once on the primary)

```javascript
// Connect to node1 via mongosh
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "node1.secom.internal:27017", priority: 2 },
    { _id: 1, host: "node2.secom.internal:27017", priority: 1 },
    { _id: 2, host: "node3.secom.internal:27017", priority: 1 },
  ]
})
```

#### Step 3 — Verify

```javascript
rs.status()   // all members should show state: PRIMARY or SECONDARY
rs.isMaster() // confirms which node is primary
```

#### Step 4 — Update DATABASE_URL

```env
DATABASE_URL=mongodb://node1.secom.internal:27017,node2.secom.internal:27017,node3.secom.internal:27017/vsaas?replicaSet=rs0&authSource=admin
```

For MongoDB Atlas:
```env
DATABASE_URL=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/vsaas
```

Atlas clusters are replica sets by default — no additional configuration needed.

### 2.4 Failover Behaviour

- **Primary failure:** Remaining nodes elect a new primary within ~10 seconds (configurable via `electionTimeoutMillis`)
- **Application behaviour:** Mongoose reconnects automatically. The `serverSelectionTimeoutMS: 30000` setting gives the driver 30 seconds to find a new primary before throwing
- **In-flight transactions:** Transactions in progress during a failover will fail and must be retried by the application. `session.withTransaction()` handles transient write conflict retries automatically

### 2.5 Backup

```bash
# Point-in-time backup using mongodump
mongodump \
  --uri="mongodb://node1.secom.internal:27017/vsaas?replicaSet=rs0" \
  --readPreference=secondary \
  --out=/backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://node1.secom.internal:27017/vsaas" /backups/20240101
```

For Atlas: enable continuous cloud backup in the Atlas UI.

---

## 3. Redis High Availability

### 3.1 Option A — Redis Sentinel (Recommended for VPS/bare-metal)

Redis Sentinel provides automatic failover for a primary/replica Redis setup.

#### Architecture
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Sentinel 1  │     │ Sentinel 2  │     │ Sentinel 3  │
│ :26379      │     │ :26379      │     │ :26379      │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │ monitors
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐           ┌──────▼──────┐
       │   Primary   │──repl────▶│  Replica 1  │
       │   :6379     │           │   :6380     │
       └─────────────┘           └─────────────┘
```

#### Step 1 — Start Redis primary and replica

```bash
# Primary (node1)
redis-server --port 6379 --bind 0.0.0.0

# Replica (node2)
redis-server --port 6380 --bind 0.0.0.0 \
  --replicaof node1.secom.internal 6379
```

#### Step 2 — Configure Sentinel on each of 3 nodes

`/etc/redis/sentinel.conf`:
```
port 26379
sentinel monitor mymaster node1.secom.internal 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
sentinel parallel-syncs mymaster 1
```

```bash
redis-sentinel /etc/redis/sentinel.conf
```

#### Step 3 — Update application configuration

```env
REDIS_SENTINEL_HOSTS=sentinel1.secom.internal:26379,sentinel2.secom.internal:26379,sentinel3.secom.internal:26379
REDIS_SENTINEL_NAME=mymaster
```

When `REDIS_SENTINEL_HOSTS` is set, `redis.ts` automatically uses ioredis Sentinel mode. `REDIS_URL` is ignored.

#### Step 4 — Verify

```bash
redis-cli -p 26379 sentinel masters
redis-cli -p 26379 sentinel slaves mymaster
```

### 3.2 Option B — Redis Cluster (Recommended for AWS ElastiCache / high throughput)

Redis Cluster provides both high availability and horizontal sharding.

#### AWS ElastiCache Cluster Mode

1. Create an ElastiCache Redis cluster (cluster mode enabled) in the AWS console
2. Use the cluster configuration endpoint:
   ```env
   REDIS_URL=redis://secom-cluster.xxxxx.cache.amazonaws.com:6379
   ```
3. ioredis supports cluster mode natively — update `redis.ts` to use `new Redis.Cluster([...])` if needed

#### Self-hosted Redis Cluster

```bash
# Create a 6-node cluster (3 primaries + 3 replicas)
redis-cli --cluster create \
  node1:6379 node2:6379 node3:6379 \
  node4:6379 node5:6379 node6:6379 \
  --cluster-replicas 1
```

### 3.3 Failover Behaviour

- **Sentinel:** Automatic failover in ~5–30 seconds. ioredis reconnects to the new primary transparently
- **BullMQ:** Jobs in flight during a Redis failover may be requeued. BullMQ's at-least-once delivery guarantee means jobs will not be lost, but may be processed twice — idempotent job processors are recommended
- **Sessions/cache:** Redis is used for user active-status caching (30s TTL) and idempotency keys. A brief Redis outage degrades performance but does not cause data loss — the application falls back gracefully (the `catch(() => null)` in `auth.ts` handles Redis errors)

---

## 4. CI Pipeline Configuration

The GitHub Actions CI workflow uses single-instance MongoDB and Redis, which is correct for testing. Transactions work in CI because the workflow already starts MongoDB as a service — update the CI service definition to use `--replSet rs0` if transaction tests are added:

```yaml
# .github/workflows/ci.yml
services:
  mongodb:
    image: mongo:8
    options: >-
      --health-cmd "mongosh --eval \"try { rs.status() } catch(e) { rs.initiate() }\""
      --health-interval 10s
      --health-timeout 10s
      --health-retries 10
    ports: ['27017:27017']
    # Add replica set flag
    command: ["mongod", "--replSet", "rs0", "--bind_ip_all"]
```

---

## 5. Health Check Verification

After infrastructure changes, verify via the health endpoint:

```bash
curl https://api.secom.gov.br/api/v1/health
# Expected: { "data": { "status": "healthy", "checks": { "database": { "status": "healthy" }, "redis": { "status": "healthy" } } } }

curl https://api.secom.gov.br/api/v1/health/metrics
# Shows memory usage and uptime
```
