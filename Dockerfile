# ── Stage 1: Build ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# ── Stage 2: Serve ──
FROM nginx:1.27-alpine
# Copy Nginx config as template — stored in /tmp to AVOID nginx entrypoint's
# auto-envsubst which replaces ALL env vars (destroying $daily_date, $1, $uri etc.)
COPY nginx.conf /tmp/default.conf.template
# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html
# Cloud Run requires port 8080
EXPOSE 8080
# envsubst replaces only $BUTTONDOWN_API_KEY, preserving Nginx vars ($uri, $host, etc.)
CMD ["/bin/sh", "-c", "envsubst '${BUTTONDOWN_API_KEY}' < /tmp/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
