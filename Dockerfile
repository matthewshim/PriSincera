# ── Stage 1: Build ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# ── Stage 2: Serve ──
FROM nginx:1.27-alpine
# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html
# Cloud Run requires port 8080
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
