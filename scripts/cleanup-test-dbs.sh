#!/bin/bash

set -e

echo "🧹 Cleaning up test databases..."
echo ""

# MongoDB cleanup
# DB name comes from backend/.env.test: DATABASE_URL=mongodb://localhost:27017/vsaas-test
MONGO_DB="vsaas-test"

if command -v mongosh &> /dev/null; then
    echo "🗄️  Dropping MongoDB test database: ${MONGO_DB}..."
    if mongosh "${MONGO_DB}" --eval "db.dropDatabase()" --quiet; then
        echo "✅ MongoDB test database dropped"
    else
        echo "⚠️  Failed to drop MongoDB test database"
        exit 1
    fi
else
    echo "⚠️  mongosh not found, skipping MongoDB cleanup"
fi
echo ""

# Redis cleanup
# .env.test uses REDIS_URL=redis://localhost:6379 (default DB 0)
# We flush DB 1 to avoid wiping the dev DB (DB 0) by accident.
# If your test suite explicitly uses DB 1, adjust REDIS_TEST_DB below.
REDIS_TEST_DB=1

if command -v redis-cli &> /dev/null; then
    echo "🔴 Flushing Redis test database (DB ${REDIS_TEST_DB})..."
    if redis-cli -n "${REDIS_TEST_DB}" FLUSHDB > /dev/null; then
        echo "✅ Redis test database flushed"
    else
        echo "⚠️  Failed to flush Redis test database"
        exit 1
    fi
else
    echo "⚠️  redis-cli not found, skipping Redis cleanup"
fi
echo ""

echo "✨ Test databases cleaned successfully!"
