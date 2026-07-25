# PC Engine PCB Viewer - Docker Deployment

## Overview
This Docker setup containerizes the PC Engine PCB Viewer application for easier deployment and management.

## Files
- `Dockerfile` - Builds the Node.js container image
- `docker-compose.yml` - Orchestrates the container with port mapping and health checks

## How It Works
The container:
1. Runs on port 8080
2. Serves the PC Engine PCB Viewer application

## Usage

### Start the container
```bash
cd Docker
docker compose up -d
```

### Stop the container
```bash
cd Docker
docker compose down
```

### Restart the container
```bash
cd Docker
docker compose restart
```

### Check status
```bash
cd Docker
docker compose ps
```

### View logs
```bash
cd Docker
docker compose logs -f
```

## Building the Image
If you need to rebuild the image after changes:
```bash
cd Docker
docker compose build --no-cache
```

## Environment Variables
The container uses these environment variables:
- `PORT=8080` - Internal port the server listens on
- `HOST=0.0.0.0` - Bind address (0.0.0.0 for all interfaces)

## Health Check
The container includes a health check that verifies the application is responding on port 8080 every 30 seconds.