FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY next.config.mjs ./
COPY tailwind.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Copy environment variables
COPY .env .env

# Build application
RUN npm run build

# ==================== Runtime ====================
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
