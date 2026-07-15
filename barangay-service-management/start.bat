@echo off
echo ========================================
echo Barangay Service Management System
echo Docker Startup Script
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/5] Checking Docker installation...
docker --version
docker compose version
echo.

echo [2/5] Checking environment configuration...
if not exist .env (
    echo [WARNING] .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo [ACTION REQUIRED] Please edit .env file and configure:
    echo   - JWT_SECRET
    echo   - META_PAGE_ACCESS_TOKEN
    echo   - META_APP_SECRET
    echo.
    echo Press any key after updating .env file...
    pause
)

echo [3/5] Building backend locally (TypeScript 6 compatibility)...
cd server
call npm run build
cd ..
if %errorlevel% neq 0 (
    echo [ERROR] Backend build failed!
    pause
    exit /b 1
)
echo Backend build successful!
echo.

echo [4/5] Building Docker images...
echo This may take a few minutes on first run...
docker compose build
if %errorlevel% neq 0 (
    echo [ERROR] Docker build failed!
    pause
    exit /b 1
)

echo.
echo [5/5] Starting all services...
docker compose up -d

echo.
echo ========================================
echo Services are starting...
echo ========================================
echo.
echo Checking service health (this may take 1-2 minutes)...
timeout /t 5 /nobreak >nul

:check_health
docker compose ps
echo.
echo [Frontend]     http://localhost:5173
echo [Backend API]  http://localhost:3000/api
echo [API Docs]     http://localhost:3000/api/docs
echo.
echo To view logs: docker compose logs -f
echo To stop:      docker compose down
echo.
echo ========================================
pause
