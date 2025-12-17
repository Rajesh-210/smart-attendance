#!/bin/bash

set -e

echo "=========================================="
echo "Smart Attendance - Backend Fix"
echo "=========================================="
echo ""

# Stop and remove old backend container
echo "[1/4] Stopping old backend container..."
docker stop smart-attendance-backend 2>/dev/null || true
docker rm smart-attendance-backend 2>/dev/null || true
echo "✓ Old container removed"
echo ""

# Rebuild backend image
echo "[2/4] Rebuilding backend image..."
cd backend
docker build -t smart-attendance-backend:latest .
cd ..
echo "✓ Backend image built successfully"
echo ""

# Run new backend container
echo "[3/4] Starting new backend container..."
docker run -d \
  --name smart-attendance-backend \
  -p 8000:8000 \
  -v $(pwd)/backend/data:/app/data \
  --restart unless-stopped \
  smart-attendance-backend:latest

sleep 2
echo "✓ Backend container started"
echo ""

# Verify backend is running
echo "[4/4] Verifying backend..."
if docker ps | grep -q smart-attendance-backend; then
  echo "✓ Backend container is running"
  echo ""
  echo "Testing API health..."
  sleep 2
  if curl -s http://localhost:8000/health > /dev/null; then
    echo "✓ Backend API is responding"
  else
    echo "⚠ Backend API not responding yet, checking logs..."
    docker logs smart-attendance-backend | tail -20
  fi
else
  echo "✗ Backend container failed to start"
  docker logs smart-attendance-backend
  exit 1
fi

echo ""
echo "=========================================="
echo "Backend Fix Complete!"
echo "=========================================="
echo ""
echo "Access Points:"
echo "  Backend API:  http://localhost:8000"
echo "  API Docs:     http://localhost:8000/docs"
echo "  Health Check: http://localhost:8000/health"
echo ""
echo "Test login:"
echo "  curl -X POST http://localhost:8000/api/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"admin@example.com\",\"password\":\"password\"}'"
echo ""
