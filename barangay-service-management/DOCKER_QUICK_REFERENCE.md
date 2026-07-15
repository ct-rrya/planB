# 🐳 Docker Quick Reference Card

## 🚀 One-Line Deploy
```bash
docker compose up --build -d
```

## 📍 Access Points
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000/api
- **Swagger**: http://localhost:3000/api/docs

## ⚡ Quick Commands

### Start/Stop
```bash
docker compose up -d          # Start all services
docker compose down           # Stop all services
docker compose restart        # Restart all services
```

### Build/Rebuild
```bash
docker compose build          # Build images
docker compose up --build -d  # Rebuild and start
```

### Logs
```bash
docker compose logs -f              # All logs
docker compose logs -f backend      # Backend only
docker compose logs --tail=50       # Last 50 lines
```

### Status
```bash
docker compose ps             # Check status
docker ps                     # All containers
```

### Shell Access
```bash
docker compose exec backend sh      # Backend shell
docker compose exec mongodb mongosh # MongoDB shell
```

## 💾 Backup/Restore

### Backup
```bash
# Database
docker compose exec -T mongodb mongodump --archive > backup.archive

# Files (Windows)
docker run --rm -v barangay-service-management_uploads_data:/data -v %cd%:/backup alpine tar czf /backup/uploads.tar.gz -C /data .
```

### Restore
```bash
# Database
docker compose exec -T mongodb mongorestore --archive < backup.archive
```

## 🔧 Troubleshooting

### Check Docker Running
```bash
docker info
```

### Check Ports
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

### Clean Everything
```bash
docker compose down -v        # Remove volumes (⚠️ deletes data!)
docker system prune -a        # Clean unused Docker data
```

### Restart Service
```bash
docker compose restart backend
docker compose restart frontend
docker compose restart mongodb
```

## 🌐 Service Communication

```
Frontend  → backend:3000
Backend   → mongodb:27017
Host      → localhost:5173, localhost:3000
```

## 📦 Volumes

```
mongodb_data          - Database files
uploads_data          - Uploaded documents
certificates_data     - Generated certificates
```

## ⚙️ Environment Setup

```bash
# First time
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux

# Edit .env and set:
# - JWT_SECRET
# - META_PAGE_ACCESS_TOKEN
# - META_APP_SECRET
```

## 🆘 Emergency Commands

```bash
# Service not responding
docker compose restart <service>

# See what went wrong
docker compose logs <service>

# Start fresh (keeps data)
docker compose down && docker compose up -d

# Nuclear option (⚠️ loses all data)
docker compose down -v && docker compose up --build -d
```

## 📊 Health Checks

```bash
# Backend
curl http://localhost:3000/api/health

# All services
docker compose ps

# MongoDB
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

## 🎯 Common Tasks

### Update Code
```bash
git pull
docker compose up --build -d
```

### View Resource Usage
```bash
docker stats
```

### Remove Old Images
```bash
docker image prune
```

### Check Logs Since Time
```bash
docker compose logs --since 30m
```

## 💡 Tips

- Services start in order: MongoDB → Backend → Frontend
- Data persists in Docker volumes even when containers stop
- Health checks ensure services are ready before marking as "up"
- Use `--build` flag when code changes
- Check logs first when troubleshooting

## 📚 Full Documentation

- **Quick Start**: README-DOCKER.md
- **Complete Guide**: DOCKER_DEPLOYMENT.md
- **Implementation**: DOCKER_IMPLEMENTATION_REPORT.md
