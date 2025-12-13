# Use Node.js 18 LTS
FROM node:18-alpine

# Install cloudflared
RUN apk add --no-cache curl && \
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && \
    chmod +x /usr/local/bin/cloudflared

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only for smaller image)
RUN npm ci --only=production || npm install --only=production

# Copy application files
COPY . .

# Expose port (Railway will set PORT env var automatically)
# EXPOSE is just documentation - Railway uses the PORT env var
EXPOSE 8080

# Healthcheck removed - Railway handles this automatically

# Start both server and cloudflared tunnel
# The tunnel token should be set as CLOUDFLARE_TUNNEL_TOKEN environment variable in Railway
# Using 'tunnel run' with token connects to the named tunnel instead of creating a quick tunnel
# Start server first, wait a moment, then start tunnel
CMD sh -c "node src/server/server.js & sleep 2 && cloudflared tunnel run --token $CLOUDFLARE_TUNNEL_TOKEN"

