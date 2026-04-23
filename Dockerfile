# ─────────────────────────────────────────────────────────
# Stage 1: Builder
# ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json package-lock.json* ./
# Use --legacy-peer-deps to handle any peer dep conflicts between registry versions
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy source (node_modules and .next excluded via .dockerignore)
COPY . .

# Build-time public env vars (baked into the static bundle)
ARG NEXT_PUBLIC_SUPABASE_URL=https://aytbujigrvjwdmgxzlyk.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dGJ1amlncnZqd2RtZ3h6bHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTY4NjQsImV4cCI6MjA4Nzc5Mjg2NH0.kbXnOQoas7yD8jdmgLStHRixgZczL7wv-ILElD1xfwo
ARG NEXT_PUBLIC_BASE_URL=https://whitepprint-ui-270124753853.asia-northeast1.run.app

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Runtime env vars (server-side, injected at deploy time via Cloud Run env vars)
ENV CONCERTMASTER_URL=https://concertmaster.aimastering.tech
ENV AUDITION_URL=https://audition.aimastering.tech
ENV DELIBERATION_URL=https://deliberation.aimastering.tech
ENV RENDITION_DSP_URL=https://rendition-dsp.aimastering.tech


# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─────────────────────────────────────────────────────────
# Stage 2: Production runner
# ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 1. standalone server (server.js + bundled node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 2. static assets — must be at .next/static relative to server.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 3. public folder (images, favicon, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 8080

CMD ["node", "server.js"]
