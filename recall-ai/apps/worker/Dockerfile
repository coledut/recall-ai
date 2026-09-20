# Multi-stage build for worker
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy root package files
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./

# Copy all package.json files
COPY packages/*/package.json ./packages/
COPY apps/worker/package.json ./apps/worker/
COPY apps/worker/tsconfig.json ./apps/worker/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages ./packages
COPY apps/worker ./apps/worker

# Build the app
WORKDIR /app/apps/worker
RUN pnpm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy pnpm files
COPY pnpm-workspace.yaml pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=base /app/apps/worker/dist ./apps/worker/dist
COPY --from=base /app/apps/worker/package.json ./apps/worker/

WORKDIR /app/apps/worker

# Set environment to production
ENV NODE_ENV=production

# Start the worker
CMD ["node", "dist/index.js"]
