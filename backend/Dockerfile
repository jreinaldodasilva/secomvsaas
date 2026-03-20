FROM node:20-alpine AS base
WORKDIR /app

# ── deps: production dependencies only ───────────────────────────────────────
FROM base AS deps
COPY backend/package.json backend/package-lock.json ./backend/
COPY packages/types/ ./packages/types/
WORKDIR /app/backend
RUN npm ci --omit=dev

# ── build: compile TypeScript ─────────────────────────────────────────────────
FROM base AS build
COPY backend/package.json backend/package-lock.json ./backend/
COPY packages/types/ ./packages/types/
WORKDIR /app/backend
RUN npm ci
COPY backend/ .
RUN npm run build

# ── production: minimal runtime image ────────────────────────────────────────
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist
COPY backend/package.json ./
EXPOSE 5000
USER node
CMD ["node", "dist/server.js"]
