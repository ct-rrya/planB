#!/bin/bash

echo "========================================"
echo "Barangay Service Management System"
echo "Docker Startup Script"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "[1/4] Checking Docker installation..."
docker --version
docker compose version
echo ""

echo "[2/4] Checking environment configuration..."
if [ ! -f .env ]; then
    echo "[WARNING] .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "[ACTION REQUIRED] Please edit .env file and configure:"
    echo "  - JWT_SECRET"
    echo "  - META_PAGE_ACCESS_TOKEN"
    echo "  - META_APP_SECRET"
    echo ""
    echo "Press Enter after updating .env file..."
    read
fi

echo "[3/4] Building Docker images..."
echo "This may take 5-10 minutes on first run..."
if ! docker compose build; then
    echo "[ERROR] Build failed!"
    exit 1
fi

echo ""
echo "[4/4] Starting all services..."
docker compose up -d

echo ""
echo "========================================"
echo "Services are starting..."
echo "========================================"
echo ""
echo "Checking service health (this may take 1-2 minutes)..."
sleep 5

docker compose ps
echo ""
echo "[Frontend]     http://localhost:5173"
echo "[Backend API]  http://localhost:3000/api"
echo "[API Docs]     http://localhost:3000/api/docs"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop:      docker compose down"
echo ""
echo "========================================"
