FROM node:22-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Default command (overridden by Cloud Run Job)
CMD ["node", "src/collector.mjs"]
