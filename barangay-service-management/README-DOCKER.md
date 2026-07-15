# 🐳 Docker Quick Start

## One-Command Deployment

```bash
docker compose up --build
```

That's it! The entire Barangay Service Management System will start.

## 📍 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api/docs

## 🚀 Quick Scripts

### Windows
```batch
start.bat    # Build and start all services
stop.bat     # Stop all services
```

### macOS/Linux
```bash
./start.sh   # Build and start all services
./stop.sh    # Stop all services
```

## ⚙️ First Time Setup

1. **Install Docker Desktop**
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)

2. **Configure Environment**
   ```bash
   # Copy example environment file
   copy .env.example .env    # Windows
   cp .env.example .env      # macOS/Linux
   
   # Edit .env and set:
   # - JWT_SECRET (generate with: openssl rand -base64 32)
   # - META_PAGE_ACCESS_TOKEN
   # - META_APP_SECRET
   ```

3. **Start Services**
   ```bash
   docker compose up --build -d
   ```

4. **Check Status**
   ```bash
   docker compose ps
   ```

## 📊 Services

| Service  | Port | Description               |
|----------|------|---------------------------|
| Frontend | 5173 | React + Vite + Nginx      |
| Backend  | 3000 | NestJS API                |
| MongoDB  | 27017| Database                  |

## 🔧 Common Commands

```bash
# View logs
docker compose logs -f

# Stop services (keeps data)
docker compose down

# Stop and remove data
docker compose down -v

# Rebuild after code changes
docker compose up --build -d

# Restart specific service
docker compose restart backend
```

## 💾 Data Persistence

All data is stored in Docker volumes:
- Database data
- Uploaded files
- Generated certificates

Data persists even when containers are stopped.

## 📖 Full Documentation

See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for complete documentation including:
- Detailed installation steps
- Troubleshooting guide
- Backup and restore procedures
- Transfer to another laptop
- Advanced configuration

## ✅ Verify Installation

```bash
# Check all services are healthy
docker compose ps

# Test backend API
curl http://localhost:3000/api/health

# View frontend
# Open browser to http://localhost:5173
```

## 🆘 Troubleshooting

**Services won't start?**
```bash
# Check Docker is running
docker info

# Check logs
docker compose logs

# Restart Docker Desktop
```

**Port conflicts?**
```bash
# Check what's using ports
netstat -ano | findstr :3000    # Windows
lsof -i :3000                    # macOS/Linux
```

**Need to change ports?**

Edit `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "8080:80"  # Change from 5173 to 8080
```

## 🎯 Production Notes

- Change `JWT_SECRET` to a strong random value
- Configure proper Meta/Messenger tokens
- Set appropriate `ALLOWED_ORIGINS` for CORS
- Consider using Docker Swarm or Kubernetes for scaling
- Set up regular database backups

---

**For complete instructions, see [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)**
