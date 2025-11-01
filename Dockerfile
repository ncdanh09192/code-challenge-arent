FROM node:20-alpine

WORKDIR /app

# Install OpenSSL and other dependencies
RUN apk add --no-cache openssl ca-certificates wget

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for ts-node in seed)
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma

# Copy source code
COPY src ./src

# Copy TypeScript config
COPY tsconfig.json tsconfig.build.json ./

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Default command
CMD ["npm", "run", "start:dev"]
