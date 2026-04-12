FROM node:22-slim AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (public only — safe to embed in client JS)
ENV NEXT_PUBLIC_SUPABASE_URL=https://aytbujigrvjwdmgxzlyk.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dGJ1amlncnZqd2RtZ3h6bHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTY4NjQsImV4cCI6MjA4Nzc5Mjg2NH0.kbXnOQoas7yD8jdmgLStHRixgZczL7wv-ILElD1xfwo

RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

RUN groupadd -r appuser && useradd -r -g appuser -d /app appuser

COPY --from=builder --chown=appuser:appuser /app/.next/standalone ./
COPY --from=builder --chown=appuser:appuser /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER appuser
EXPOSE 8080

CMD ["node", "server.js"]
