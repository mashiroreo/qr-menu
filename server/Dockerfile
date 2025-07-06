# ---------- build stage ----------
FROM node:20-slim AS build
WORKDIR /app

# Install deps
COPY server/package*.json ./
RUN npm ci --ignore-scripts

# Copy source
COPY server .

# Build TypeScript -> JavaScript
RUN npm run build

# ---------- runtime stage ----------
FROM node:20-slim
WORKDIR /app

# Install only production deps
COPY server/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built files & necessary assets
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Cloud Run will set PORT env variable automatically
ENV NODE_ENV=production
CMD ["node", "dist/index.js"] 