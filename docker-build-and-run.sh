#!/bin/bash

set -e

echo "Building Smart Attendance & Leave Management System..."

# Build frontend
echo "Building frontend Docker image..."
cd frontend
docker build -t smart-attendance-frontend:latest .
cd ..

# Build backend
echo "Building backend Docker image..."
cd backend
docker build -t smart-attendance-backend:latest .
cd ..

# Stop existing containers if running
echo "Stopping existing containers..."
docker stop smart-attendance-backend smart-attendance-frontend 2>/dev/null || true
docker rm smart-attendance-backend smart-attendance-frontend 2>/dev/null || true

# Create data directory
mkdir -p backend/data

# Run backend
echo "Starting backend container..."
docker run -d \
  --name smart-attendance-backend \
  -p 8000:8000 \
  -v $(pwd)/backend/data:/app/data \
  --restart unless-stopped \
  smart-attendance-frontend:latest

# Run frontend
echo "Starting frontend container..."
docker run -d \
  --name smart-attendance-frontend \
  -p 80:80 \
  --restart unless-stopped \
  smart-attendance-frontend:latest

echo ""
echo "✓ Deployment complete!"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "Demo Credentials:"
echo "  Admin: admin@example.com / password"
echo "  Employee: emp@example.com / password"
echo ""
echo "View logs:"
echo "  docker logs -f smart-attendance-backend"
echo "  docker logs -f smart-attendance-frontend"
