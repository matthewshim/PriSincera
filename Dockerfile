# ── Stage 1: Build ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# ── Stage 2: Serve ──
FROM nginx:1.27-alpine
# Copy Nginx config as template (envsubst will inject env vars at runtime)
COPY nginx.conf /etc/nginx/templates/default.conf.template
# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html
# Cloud Run requires port 8080
EXPOSE 8080
# envsubst replaces only $BUTTONDOWN_API_KEY, preserving Nginx vars ($uri, $host, etc.)
CMD ["/bin/sh", "-c", "envsubst '${BUTTONDOWN_API_KEY}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
