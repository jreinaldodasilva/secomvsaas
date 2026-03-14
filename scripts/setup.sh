#!/usr/bin/env bash
set -e

echo "🚀 vSaaS — Project Setup"
echo "========================="

# .env files
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example"
else
  echo "⏭️  .env already exists, skipping"
fi

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "✅ Created backend/.env from backend/.env.example"
else
  echo "⏭️  backend/.env already exists, skipping"
fi

# Generate secrets and patch backend/.env
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
PORTAL_JWT_SECRET=$(openssl rand -hex 32)
CSRF_SECRET=$(openssl rand -hex 16)

if grep -q "your_jwt_secret" backend/.env 2>/dev/null; then
  sed -i.bak \
    -e "s|your_jwt_secret_min_64_chars_generate_with_openssl_rand_hex_32|${JWT_SECRET}|" \
    -e "s|your_refresh_secret_min_64_chars_generate_with_openssl_rand_hex_32|${JWT_REFRESH_SECRET}|" \
    -e "s|your_portal_jwt_secret_min_64_chars_generate_with_openssl_rand_hex_32|${PORTAL_JWT_SECRET}|" \
    -e "s|your_csrf_secret_min_32_chars|${CSRF_SECRET}|" \
    backend/.env
  rm -f backend/.env.bak
  echo "✅ Generated secrets in backend/.env"
else
  echo "⏭️  Secrets already configured, skipping"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."

echo "  → packages/types"
cd packages/types && npm install && npm run build && cd ../..

echo "  → frontend (root)"
npm install

echo "  → backend"
cd backend && npm install && cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start infrastructure:  npm run infra:up"
echo "  2. Start dev servers:     npm run dev:all"
echo "  3. Generate a module:     npm run generate:module -- <name>"
