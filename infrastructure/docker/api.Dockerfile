FROM node:18-alpine AS base
WORKDIR /app

FROM base AS deps
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

FROM base AS build
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ .
COPY packages/types/ ../packages/types/
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY backend/package.json ./
EXPOSE 5000
USER node
CMD ["node", "dist/server.js"]
