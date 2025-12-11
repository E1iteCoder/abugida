# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only for smaller image)
RUN npm ci --only=production || npm install --only=production

# Copy application files
COPY . .

# Expose port (Railway will set PORT env var automatically)
EXPOSE 5000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "src/server/server.js"]

