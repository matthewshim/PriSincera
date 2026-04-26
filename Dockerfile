# ── Stage 1: Build frontend ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# ── Stage 2: Production server ──
FROM node:20-alpine
WORKDIR /app

# Copy built frontend assets
COPY --from=builder /app/dist ./dist

# Copy server and install production deps only
COPY server.mjs ./
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Run as non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S prisincera -u 1001 -G nodejs
USER prisincera

# Cloud Run provides PORT env var (default 8080)
EXPOSE 8080
CMD ["node", "server.mjs"]
