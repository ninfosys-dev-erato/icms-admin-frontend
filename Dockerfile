# =============================================================================
# PRODUCTION-GRADE NEXT.JS DOCKERFILE
# =============================================================================

# -----------------------------------------------------------------------------
# deps: install node_modules once (cached)
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat dumb-init && apk upgrade
WORKDIR /app
COPY package.json ./
RUN corepack enable && \
    yarn config set nodeLinker node-modules && \
    yarn install --network-timeout 1000000

# -----------------------------------------------------------------------------
# builder: compile the Next.js app with build-time env baked in
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public env (required for client bundle)
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_API_MOCKING
ARG NEXT_PUBLIC_DEBUG
ARG NEXT_PUBLIC_LOG_LEVEL

# Expose them to the build step
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_MOCKING=$NEXT_PUBLIC_API_MOCKING
ENV NEXT_PUBLIC_DEBUG=$NEXT_PUBLIC_DEBUG
ENV NEXT_PUBLIC_LOG_LEVEL=$NEXT_PUBLIC_LOG_LEVEL

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN corepack enable && yarn build

# -----------------------------------------------------------------------------
# runner: minimal production image
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner
RUN apk add --no-cache dumb-init curl tzdata && apk upgrade && rm -rf /var/cache/apk/*
RUN addgroup --system --gid 1001 nextjs && adduser --system --uid 1001 nextjs
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Only what we need to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000
USER nextjs

ENTRYPOINT ["dumb-init", "--"]
CMD ["yarn", "start"]

