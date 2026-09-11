# syntax=docker/dockerfile:1
# Production image for racespot.tv — replaces the Nixpacks build.
#
# Why a Dockerfile: Nixpacks runs `apt-get update` against archive.ubuntu.com on
# every uncached build; on 2026-09-11 that mirror was down for hours and every
# deploy failed. This build touches no package mirror — only Docker Hub for the
# base image — and pins Node 20 explicitly.
#
# Three stages: install deps → build → slim runtime with Next's standalone
# output (output: 'standalone' in next.config.mjs). Debian slim rather than
# Alpine so sharp uses the glibc build it is best tested with.

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:20-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Public build-time values are inlined by Next; Coolify passes "build variables"
# as --build-arg, which a Dockerfile only sees when declared as ARG.
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Standalone server + its traced node_modules, static assets and public files
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# sharp for the image optimizer and the cache warm-up (not always traced into standalone)
COPY --from=build /app/node_modules/sharp ./node_modules/sharp
COPY --from=build /app/node_modules/@img ./node_modules/@img
COPY --from=build /app/scripts ./scripts
RUN mkdir -p .next/cache/images && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node", "scripts/start.mjs"]
