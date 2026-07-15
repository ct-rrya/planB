# 🐳 Docker Deployment Guide
## Barangay Service Management System

This guide provides complete instructions for deploying the Barangay Service Management System using Docker on any Windows, Linux, or macOS laptop.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Installation Steps](#installation-steps)
4. [Environment Configuration](#environment-configuration)
5. [Building and Running](#building-and-running)
6. [Service Management](#service-management)
7. [Data Management](#data-management)
8. [Transferring to Another Laptop](#transferring-to-another-laptop)
9. [Troubleshooting](#troubleshooting)
10. [Technical Details](#technical-details)

---

## 🔧 Prerequisites

### Required Software
- **Docker Desktop** (version 20.10 or higher)
  - Windows: [Download Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
  - macOS: [Download Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
  - Linux: Install Docker Engine and Docker Compose

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: Minimum 10GB free space
- **CPU**: 2 cores or more recommended

### Verify Installation
```bash
docker --version
docker compose version
```

Expected output:
```
Docker version 24.0.x or higher
Docker Compose version v2.x.x or higher
```

---

## ⚡ Quick Start

For experienced users who want to get running immediately:

```bash
# 1. Navigate to project directory
cd barangay-service-management

# 2. Copy environment file
copy .env.example .env

# 3. Edit .env and set your credentials (especially JWT_SECRET and Meta tokens)

# 4. Build and start all services
docker compose up --build

# 5. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000/api
# API Documentation: http://localhost:3000/api/docs
```

---

## 📦 Installation Steps

### Step 1: Install Docker Desktop

#### Windows
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
2. Run the installer
3. Restart your computer when prompted
4. Launch Docker Desktop from Start Menu
5. Verify it's running (Docker icon in system tray)

#### macOS
1. Download Docker Desktop for Mac
2. Drag Docker.app to Applications
3. Launch Docker from Applications
4. Verify it's running (Docker icon in menu bar)

#### Linux
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt-get install docker-compose-plugin
```

### Step 2: Clone or Transfer Project

If you're setting up on a new laptop:

#### Option A: Using Git
```bash
git clone <your-repository-url>
cd barangay-service-management
```

#### Option B: Using USB/File Transfer
1. Copy the entire `barangay-service-management` folder
2. Navigate to the folder in terminal/command prompt

---

## ⚙️ Environment Configuration

### Step 1: Create Environment File

```bash
# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

### Step 2: Edit Configuration

Open `.env` file in a text editor and configure:

```env
# ==============================================
# CRITICAL: MUST CONFIGURE THESE
# ==============================================

# JWT Secret - Generate a strong random key
# Use: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Meta/Facebook Messenger Integration
META_VERIFY_TOKEN=brgy-admin-service
META_PAGE_ACCESS_TOKEN=your-actual-meta-token-here
META_APP_SECRET=your-actual-app-secret-here

# ==============================================
# DEFAULT VALUES (can keep as-is)
# ==============================================

NODE_ENV=production
MONGODB_URI=mongodb://mongodb:27017/barangay
JWT_EXPIRATION=7d
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

### Generate Secure JWT Secret

#### Windows
```powershell
# PowerShell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

#### macOS/Linux
```bash
openssl rand -base64 32
```

---

## 🚀 Building and Running

### First Time Setup

```bash
# Navigate to project directory
cd barangay-service-management

# Build all Docker images (this may take 5-10 minutes)
docker compose build

# Start all services
docker compose up -d
```

### Watch Startup Logs

```bash
# View logs from all services
docker compose logs -f

# View logs from specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

### Verify Services are Running

```bash
# Check service status
docker compose ps
```

Expected output:
```
NAME                    STATUS              PORTS
barangay-backend        Up (healthy)        0.0.0.0:3000->3000/tcp
barangay-frontend       Up (healthy)        0.0.0.0:5173->80/tcp
barangay-mongodb        Up (healthy)        0.0.0.0:27017->27017/tcp
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Documentation (Swagger)**: http://localhost:3000/api/docs
- **MongoDB**: localhost:27017

### Default Admin Credentials

The system automatically creates an admin account on first startup:
- **Email**: admin@barangay.local
- **Password**: Check console logs or configured default

---

## 🔄 Service Management

### Start Services

```bash
# Start all services
docker compose up -d

# Start specific service
docker compose up -d backend
```

### Stop Services

```bash
# Stop all services (data is preserved)
docker compose down

# Stop and remove volumes (WARNING: deletes all data)
docker compose down -v
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend
```

### View Logs

```bash
# All services
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Specific service
docker compose logs -f backend
```

### Execute Commands Inside Containers

```bash
# Access backend container shell
docker compose exec backend sh

# Access MongoDB shell
docker compose exec mongodb mongosh

# Run npm command in backend
docker compose exec backend npm run lint
```

### Rebuild After Code Changes

```bash
# Rebuild and restart all services
docker compose up --build -d

# Rebuild specific service
docker compose up --build -d backend
```

---

## 💾 Data Management

### Persistent Volumes

Docker automatically creates these volumes to persist data:

- **mongodb_data**: Database data
- **mongodb_config**: MongoDB configuration
- **uploads_data**: Uploaded documents
- **certificates_data**: Generated certificates

### Backup Database

#### Windows (PowerShell)
```powershell
# Create backup directory
New-Item -ItemType Directory -Force -Path ".\backups"

# Backup MongoDB
docker compose exec -T mongodb mongodump --archive > ".\backups\backup-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').archive"
```

#### macOS/Linux
```bash
# Create backup directory
mkdir -p backups

# Backup MongoDB
docker compose exec -T mongodb mongodump --archive > "./backups/backup-$(date +%Y-%m-%d-%H%M%S).archive"
```

### Restore Database

```bash
# Restore from backup
docker compose exec -T mongodb mongorestore --archive < ./backups/backup-2024-01-15-103000.archive
```

### Backup Uploaded Files

```bash
# Windows
docker run --rm -v barangay-service-management_uploads_data:/data -v %cd%:/backup alpine tar czf /backup/uploads-backup.tar.gz -C /data .

# macOS/Linux
docker run --rm -v barangay-service-management_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz -C /data .
```

### View Volume Information

```bash
# List all volumes
docker volume ls

# Inspect specific volume
docker volume inspect barangay-service-management_mongodb_data
```

---

## 📤 Transferring to Another Laptop

### Method 1: Git + Docker (Recommended)

On **Source Laptop**:
```bash
# Commit your .env file (if not in .gitignore)
git add .env
git commit -m "Add environment configuration"
git push
```

On **New Laptop**:
```bash
# Install Docker Desktop
# Clone repository
git clone <repository-url>
cd barangay-service-management

# Start services
docker compose up --build -d
```

### Method 2: Complete Export with Data

On **Source Laptop**:

```bash
# 1. Create transfer directory
mkdir transfer-package
cd transfer-package

# 2. Copy project files
cp -r ../barangay-service-management .

# 3. Backup MongoDB data
docker compose exec -T mongodb mongodump --archive > mongodb-backup.archive

# 4. Backup volumes
docker run --rm -v barangay-service-management_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads.tar.gz -C /data .
docker run --rm -v barangay-service-management_certificates_data:/data -v $(pwd):/backup alpine tar czf /backup/certificates.tar.gz -C /data .

# 5. Create README
echo "Transfer Package Created: $(date)" > TRANSFER_README.txt
echo "1. Install Docker Desktop" >> TRANSFER_README.txt
echo "2. Copy this folder to new laptop" >> TRANSFER_README.txt
echo "3. Run: cd barangay-service-management && docker compose up --build -d" >> TRANSFER_README.txt
echo "4. Restore data using restore scripts" >> TRANSFER_README.txt

# 6. Compress everything
cd ..
tar czf barangay-transfer-$(date +%Y%m%d).tar.gz transfer-package
```

On **New Laptop**:

```bash
# 1. Install Docker Desktop

# 2. Extract transfer package
tar xzf barangay-transfer-20240115.tar.gz
cd transfer-package/barangay-service-management

# 3. Start services
docker compose up --build -d

# 4. Wait for services to be healthy
docker compose ps

# 5. Restore MongoDB data
docker compose exec -T mongodb mongorestore --archive < ../mongodb-backup.archive

# 6. Restore uploaded files
docker run --rm -v barangay-service-management_uploads_data:/data -v $(pwd)/../:/backup alpine tar xzf /backup/uploads.tar.gz -C /data
docker run --rm -v barangay-service-management_certificates_data:/data -v $(pwd)/../:/backup alpine tar xzf /backup/certificates.tar.gz -C /data

# 7. Restart services
docker compose restart
```

### Method 3: USB Drive Transfer (Windows)

```batch
REM On Source Laptop - Create transfer.bat
@echo off
echo Creating transfer package...
mkdir transfer-package
xcopy /E /I barangay-service-management transfer-package\barangay-service-management

REM Backup database
docker compose exec -T mongodb mongodump --archive > transfer-package\mongodb-backup.archive

echo Package created! Copy transfer-package folder to USB drive.
pause
```

---

## 🔧 Troubleshooting

### Services Won't Start

```bash
# Check Docker is running
docker info

# Check logs for errors
docker compose logs

# Check port conflicts
netstat -ano | findstr :3000
netstat -ano | findstr :5173
netstat -ano | findstr :27017

# Remove old containers and retry
docker compose down
docker compose up --build -d
```

### Port Already in Use

Edit `docker-compose.yml` to change ports:

```yaml
# Change frontend port from 5173 to 8080
frontend:
  ports:
    - "8080:80"  # Change this line

# Change backend port from 3000 to 3001
backend:
  ports:
    - "3001:3000"  # Change this line
```

### Cannot Connect to MongoDB

```bash
# Check MongoDB is running
docker compose ps mongodb

# Check MongoDB logs
docker compose logs mongodb

# Test connection
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Backend Health Check Failing

```bash
# Check backend logs
docker compose logs backend

# Test health endpoint manually
curl http://localhost:3000/api/health

# Restart backend
docker compose restart backend
```

### Out of Disk Space

```bash
# Remove unused Docker images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused containers
docker container prune
```

### Frontend Shows 502 Bad Gateway

```bash
# Backend might not be ready yet
docker compose logs backend

# Wait for backend to be healthy
docker compose ps

# Restart frontend
docker compose restart frontend
```

### Slow Performance on Windows

1. Enable WSL 2 backend in Docker Desktop settings
2. Allocate more resources: Docker Desktop → Settings → Resources
3. Increase CPU and Memory limits

### Can't Access from Other Devices

To access from other devices on your network:

1. Find your laptop's IP address:
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   ```

2. Update `.env`:
   ```env
   ALLOWED_ORIGINS=http://localhost:5173,http://YOUR_IP:5173
   ```

3. Restart services:
   ```bash
   docker compose restart
   ```

4. Access from other device:
   ```
   http://YOUR_IP:5173
   ```

---

## 📊 Technical Details

### Docker Architecture

```
┌─────────────────────────────────────────────┐
│           Docker Host (Your Laptop)         │
│                                             │
│  ┌────────────────────────────────────┐   │
│  │     Frontend Container (Nginx)     │   │
│  │     Port: 80 → Host: 5173          │   │
│  │     Image: node:20-alpine          │   │
│  └────────────────────────────────────┘   │
│                    ↓                        │
│  ┌────────────────────────────────────┐   │
│  │     Backend Container (NestJS)     │   │
│  │     Port: 3000 → Host: 3000        │   │
│  │     Image: node:20-alpine          │   │
│  └────────────────────────────────────┘   │
│                    ↓                        │
│  ┌────────────────────────────────────┐   │
│  │   MongoDB Container (Database)     │   │
│  │     Port: 27017 → Host: 27017      │   │
│  │     Image: mongo:7.0               │   │
│  └────────────────────────────────────┘   │
│                                             │
│  Persistent Volumes:                        │
│  • mongodb_data                             │
│  • uploads_data                             │
│  • certificates_data                        │
└─────────────────────────────────────────────┘
```

### Network Configuration

All containers communicate through the `barangay-network` bridge network:
- Internal DNS resolves service names (e.g., `mongodb`, `backend`)
- Isolated from host network by default
- Exposed ports mapped to host for access

### Exposed Ports

| Service  | Internal Port | Host Port | Purpose                    |
|----------|---------------|-----------|----------------------------|
| Frontend | 80            | 5173      | React application (Nginx)  |
| Backend  | 3000          | 3000      | NestJS API                 |
| MongoDB  | 27017         | 27017     | Database (optional expose) |

### Volume Mounts

| Volume Name            | Container Path    | Purpose                |
|------------------------|-------------------|------------------------|
| mongodb_data           | /data/db          | Database files         |
| mongodb_config         | /data/configdb    | MongoDB configuration  |
| uploads_data           | /app/uploads      | Uploaded documents     |
| certificates_data      | /app/certificates | Generated certificates |

### Health Checks

All services include health checks to ensure proper startup order:

- **MongoDB**: Checks database connectivity every 10s
- **Backend**: Checks API endpoint every 30s
- **Frontend**: Checks Nginx every 30s

### Build Process

#### Backend Build
1. Base image: `node:20-alpine`
2. Install dependencies (`npm ci`)
3. Build NestJS (`npm run build`)
4. Create production image with only runtime dependencies
5. Run as non-root user for security

#### Frontend Build
1. Base image: `node:20-alpine`
2. Install dependencies and build React app
3. Copy built files to Nginx image
4. Configure Nginx for SPA routing
5. Run as non-root user for security

### Security Features

- ✅ Non-root users in all containers
- ✅ Security headers configured in Nginx
- ✅ CORS protection in backend
- ✅ Health checks for monitoring
- ✅ Resource limits (can be configured)
- ✅ Network isolation
- ✅ No secrets in Dockerfiles

---

## 📞 Support

### Common Commands Reference

```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# View logs
docker compose logs -f

# Rebuild after changes
docker compose up --build -d

# Check service health
docker compose ps

# Access container shell
docker compose exec backend sh

# Backup database
docker compose exec mongodb mongodump --archive > backup.archive

# Restore database
docker compose exec -T mongodb mongorestore --archive < backup.archive
```

### Getting Help

1. Check logs: `docker compose logs`
2. Check this troubleshooting section
3. Verify `.env` configuration
4. Ensure Docker Desktop is running
5. Check system resources (RAM, disk space)

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Docker Desktop is running
- [ ] All services show "Up (healthy)" status
- [ ] Frontend loads at http://localhost:5173
- [ ] Backend API responds at http://localhost:3000/api/health
- [ ] Swagger docs available at http://localhost:3000/api/docs
- [ ] Can log in with admin credentials
- [ ] MongoDB is storing data (create a test resident)
- [ ] Services restart automatically after `docker compose restart`

---

## 📝 Notes

- **First startup** may take 2-5 minutes for all services to be healthy
- **Data persists** between container restarts via Docker volumes
- **Environment variables** must be configured in `.env` file
- **Ports 3000, 5173, and 27017** must be available on your system
- **Docker Desktop must be running** before executing any commands
- **Meta/Messenger integration** requires valid tokens in `.env`

---

**Last Updated**: January 2024  
**Docker Compose Version**: 3.8  
**Tested On**: Windows 11, macOS Monterey, Ubuntu 22.04
