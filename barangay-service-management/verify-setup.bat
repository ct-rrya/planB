@echo off
echo ========================================
echo Docker Setup Verification
echo Barangay Service Management System
echo ========================================
echo.

echo [1/6] Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Docker is not installed
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
) else (
    docker --version
    echo [PASS] Docker is installed
)
echo.

echo [2/6] Checking Docker Compose...
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Docker Compose is not available
    pause
    exit /b 1
) else (
    docker compose version
    echo [PASS] Docker Compose is available
)
echo.

echo [3/6] Checking if Docker daemon is running...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Docker daemon is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
) else (
    echo [PASS] Docker daemon is running
)
echo.

echo [4/6] Checking environment configuration...
if exist .env (
    echo [PASS] .env file exists
    findstr /C:"JWT_SECRET=your-super-secret" .env >nul
    if %errorlevel% equ 0 (
        echo [WARN] JWT_SECRET needs to be changed from default
    )
    findstr /C:"META_PAGE_ACCESS_TOKEN=your-" .env >nul
    if %errorlevel% equ 0 (
        echo [WARN] META_PAGE_ACCESS_TOKEN needs to be configured
    )
) else (
    echo [WARN] .env file not found
    echo Creating from .env.example...
    copy .env.example .env >nul
    echo [ACTION] Please edit .env file before starting services
)
echo.

echo [5/6] Checking required files...
set FILES=docker-compose.yml server\Dockerfile client\Dockerfile client\nginx.conf
set ALL_EXIST=1
for %%F in (%FILES%) do (
    if exist %%F (
        echo [PASS] %%F exists
    ) else (
        echo [FAIL] %%F not found
        set ALL_EXIST=0
    )
)
echo.

echo [6/6] Checking port availability...
netstat -ano | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo [WARN] Port 3000 is in use
) else (
    echo [PASS] Port 3000 is available
)

netstat -ano | findstr ":5173" >nul
if %errorlevel% equ 0 (
    echo [WARN] Port 5173 is in use
) else (
    echo [PASS] Port 5173 is available
)

netstat -ano | findstr ":27017" >nul
if %errorlevel% equ 0 (
    echo [WARN] Port 27017 is in use
) else (
    echo [PASS] Port 27017 is available
)
echo.

echo ========================================
echo Verification Complete
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file and configure secrets
echo 2. Run: start.bat (or docker compose up --build)
echo 3. Access application at http://localhost:5173
echo.
pause
