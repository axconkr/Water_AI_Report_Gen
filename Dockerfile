# Multi-stage build for APAS (Automated Proposal Authoring System)

# Stage 1: Build Backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Set CI environment to skip husky
ENV CI=true

# Copy backend package files
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies
RUN npm install --only=production && \
    npm install -g prisma

# Copy backend source
COPY backend ./

# Generate Prisma client
RUN npx prisma generate

# Build backend
RUN npm run build

# Stage 2: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Set CI environment to skip husky
ENV CI=true

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source
COPY frontend ./

# Build frontend
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Production Runtime
FROM node:18-alpine

WORKDIR /app

# Install production dependencies with retry and mirror fallback
RUN set -ex && \
    # Try default mirror first
    (apk update && apk add --no-cache tini curl) || \
    # Fallback to Korean mirror
    (echo "http://mirror.kakao.com/alpine/v3.18/main" > /etc/apk/repositories && \
     echo "http://mirror.kakao.com/alpine/v3.18/community" >> /etc/apk/repositories && \
     apk update && apk add --no-cache tini curl) || \
    # Final fallback to alternative mirror
    (echo "http://dl-cdn.alpinelinux.org/alpine/v3.18/main" > /etc/apk/repositories && \
     echo "http://dl-cdn.alpinelinux.org/alpine/v3.18/community" >> /etc/apk/repositories && \
     apk update && apk add --no-cache tini curl) && \
    rm -rf /var/cache/apk/*

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy backend build
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/prisma ./backend/prisma
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/package*.json ./backend/

# Copy frontend build
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/public ./frontend/public
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/next.config.js ./frontend/

# Copy startup scripts
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh && chown nodejs:nodejs /app/start.sh

# Create upload directory
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

# Switch to non-root user
USER nodejs

# Expose ports
EXPOSE 3000 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4000/api/v1/health || exit 1

# Use tini as init system
ENTRYPOINT ["/sbin/tini", "--"]

# Start application
CMD ["/app/start.sh"]
