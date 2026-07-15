#!/bin/bash

echo "========================================"
echo "Barangay Service Management System"
echo "Stopping Services"
echo "========================================"
echo ""

docker compose down

echo ""
echo "All services stopped."
echo "Data is preserved in Docker volumes."
echo ""
echo "To start again: run ./start.sh or docker compose up -d"
echo "========================================"
