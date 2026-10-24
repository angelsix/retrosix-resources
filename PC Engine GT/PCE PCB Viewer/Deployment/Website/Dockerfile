FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the application files
COPY . .

# Expose the port (will be overridden by PORT env var)
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV HOST=0.0.0.0

# Start the server
# The base image's unprivileged user (2026-10-24 security sweep). The app writes nothing under
# /app at runtime, so the root-owned files copied above stay readable and nothing needs chowning.
USER node

CMD ["node", "server.js"]