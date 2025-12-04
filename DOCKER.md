# Docker Deployment Quick Reference

## Quick Start

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access the app at http://localhost:8080
```

## Build Image

```bash
docker build -t mortgage-planning-tool .
```

## Run Container

```bash
docker run -d \
  --name mortgage-app \
  -p 8080:80 \
  --restart unless-stopped \
  mortgage-planning-tool
```

## Management Commands

```bash
# View logs
docker logs -f mortgage-app

# Stop container
docker stop mortgage-app

# Start container
docker start mortgage-app

# Restart container
docker restart mortgage-app

# Remove container
docker rm mortgage-app

# Remove image
docker rmi mortgage-planning-tool
```

## Update Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

## Health Check

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' mortgage-app

# Test health endpoint
curl http://localhost:8080/health
```

## Custom Port

Edit `docker-compose.yml`:
```yaml
ports:
  - "3000:80"  # Change 8080 to your desired port
```

Or with Docker:
```bash
docker run -d --name mortgage-app -p 3000:80 mortgage-planning-tool
```

## Production Considerations

1. **Use HTTPS**: Set up a reverse proxy (Nginx/Traefik) with SSL certificates
2. **Resource Limits**: Configure CPU/memory limits in docker-compose.yml
3. **Monitoring**: Set up container monitoring and logging
4. **Backups**: Regular backups of the application code
5. **Updates**: Use CI/CD pipeline for automated deployments

## Troubleshooting

```bash
# View container logs
docker logs mortgage-app

# Check container status
docker ps -a | grep mortgage

# Inspect container
docker inspect mortgage-app

# Execute command in container
docker exec -it mortgage-app sh
```

