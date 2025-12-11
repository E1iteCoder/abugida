# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
# Note: This will install all deps including frontend ones, but that's okay for now
RUN npm ci --only=production

# Copy only server files (client files are ignored by .dockerignore)
COPY . .

# Expose port (Railway will set PORT env var automatically)
EXPOSE 5000

# Start the server
CMD ["node", "src/server/server.js"]

