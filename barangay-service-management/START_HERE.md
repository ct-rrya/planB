# 🚀 START HERE - Docker Deployment

## ⚡ Super Quick Start (2 Steps)

### 1. Start Docker Desktop
   - Windows: Open from Start Menu
   - Wait for Docker icon in system tray

### 2. Run This Command
   ```batch
   start.bat
   ```
   
   OR
   
   ```batch
   docker compose up --build -d
   ```

### 3. Access Your Application
   - **Frontend**: http://localhost:5173
   - **API Docs**: http://localhost:3000/api/docs

---

## 📚 Documentation Guide

### First Time? Read These in Order:

1. **START_HERE.md** ← You are here (2 min)
2. **README-DOCKER.md** - Quick setup guide (5 min)
3. **DOCKER_QUICK_REFERENCE.md** - Daily commands (bookmark this!)

### Need More Details?

4. **DOCKER_DEPLOYMENT.md** - Complete guide with troubleshooting (30 min)
5. **DOCKER_IMPLEMENTATION_REPORT.md** - Technical architecture

---

## ✅ Pre-Flight Checklist

Before running, verify:

- [ ] Docker Desktop is installed
- [ ] Docker Desktop is running (icon in system tray)
- [ ] You're in the `barangay-service-management` directory

Optional:
- [ ] Run `verify-setup.bat` to check everything

---

## 🎯 What Happens When You Start

1. Docker builds 3 containers (first time: 5-10 min)
2. Starts MongoDB database
3. Starts NestJS backend API
4. Starts React frontend
5. All services become "healthy" (check: `docker compose ps`)
6. You can access the application!

---

## 📦 What's Inside

```
3 Services:
├── Frontend (React + Nginx)      Port 5173
├── Backend (NestJS)              Port 3000
└── MongoDB (Database)            Port 27017

4 Persistent Volumes:
├── Database data
├── Uploaded files
├── Generated certificates
└── MongoDB config
```

---

## 🔧 Essential Commands

```bash
# Start
start.bat                    # Windows
./start.sh                   # Mac/Linux
docker compose up -d         # Alternative

# Stop  
stop.bat                     # Windows
./stop.sh                    # Mac/Linux
docker compose down          # Alternative

# Check Status
docker compose ps

# View Logs
docker compose logs -f

# Restart
docker compose restart
```

---

## 🆘 Something Not Working?

### Problem: Docker not found
**Solution**: Install Docker Desktop from docker.com

### Problem: Port already in use
**Solution**: 
```batch
netstat -ano | findstr :3000
# Kill the process or change port in docker-compose.yml
```

### Problem: Services unhealthy
**Solution**:
```batch
docker compose logs backend
docker compose restart
```

### Problem: Everything is broken
**Solution**:
```batch
docker compose down
docker compose up --build -d
```

---

## 🌍 Transfer to New Laptop

### Easy Method:
1. Install Docker Desktop on new laptop
2. Copy this entire folder
3. Run `start.bat`
4. Done! ✅

### With Data:
See **DOCKER_DEPLOYMENT.md** section "Transferring to Another Laptop"

---

## ⚙️ Configuration

### Must Edit Before First Run:

Edit `.env` file:
```env
# Generate this: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Your Meta tokens
META_PAGE_ACCESS_TOKEN=your-token-here
META_APP_SECRET=your-secret-here
```

Everything else can stay as default.

---

## 💡 Quick Tips

- First build takes 5-10 minutes (downloads images)
- Subsequent starts take < 30 seconds
- Data persists when you stop containers
- Use `docker compose logs -f` to see what's happening
- Check `docker compose ps` to verify all are "healthy"

---

## 🎊 That's It!

You're ready to deploy your Barangay Service Management System anywhere!

**Next**: Run `start.bat` and open http://localhost:5173

---

## 📖 Quick Reference

| Need to... | Command |
|------------|---------|
| Start everything | `start.bat` |
| Stop everything | `stop.bat` |
| See logs | `docker compose logs -f` |
| Check status | `docker compose ps` |
| Restart | `docker compose restart` |
| Rebuild | `docker compose up --build -d` |

---

**Questions?** Check **README-DOCKER.md** or **DOCKER_DEPLOYMENT.md**

**Ready?** Run `start.bat` now! 🚀
