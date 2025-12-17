#!/bin/bash

set -e

# Get branch name from input or use default
BRANCH_NAME="${1:-main}"
REPO_URL="https://github.com/bot28-b/attend.git"
DEPLOY_DIR="/home/ubuntu/smart-attendance"
PROJECT_DIR="$DEPLOY_DIR/smart-attendance"

echo "=========================================="
echo "Smart Attendance System - Auto Deployment"
echo "=========================================="
echo "Branch: $BRANCH_NAME"
echo "=========================================="
echo ""

# Step 1: Install Docker if not already installed
echo "[1/8] Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y docker.io
    sudo usermod -aG docker ubuntu
    newgrp docker
else
    echo "✓ Docker is already installed"
fi
echo ""

# Step 2: Clone repository and checkout branch
echo "[2/8] Cloning repository from branch: $BRANCH_NAME..."
if [ -d "$DEPLOY_DIR" ]; then
    echo "Removing existing deployment directory..."
    rm -rf "$DEPLOY_DIR"
fi
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"
git clone -b "$BRANCH_NAME" "$REPO_URL" .
if [ $? -ne 0 ]; then
    echo "✗ Failed to clone branch '$BRANCH_NAME'. Checking available branches..."
    git clone "$REPO_URL" .
    cd "$DEPLOY_DIR"
    echo "Available branches:"
    git branch -r
    echo "Please specify a valid branch name."
    exit 1
fi
echo "✓ Repository cloned successfully from branch: $BRANCH_NAME"
echo ""

# Step 3: Stop existing containers
echo "[3/8] Stopping existing containers..."
docker stop smart-attendance-backend smart-attendance-frontend 2>/dev/null || true
docker rm smart-attendance-backend smart-attendance-frontend 2>/dev/null || true
echo "✓ Old containers stopped and removed"
echo ""

# Step 4: Clean data directory
echo "[4/8] Cleaning data directory..."
rm -rf "$PROJECT_DIR/backend/data"
mkdir -p "$PROJECT_DIR/backend/data"
echo "✓ Data directory cleaned"
echo ""

# Step 5: Build backend Docker image
echo "[5/8] Building backend Docker image..."
cd "$PROJECT_DIR/backend"
docker build -t smart-attendance-backend:latest .
echo "✓ Backend image built successfully"
echo ""

# Step 6: Build frontend Docker image
echo "[6/8] Building frontend Docker image..."
cd "$PROJECT_DIR/frontend"
docker build -t smart-attendance-frontend:latest .
echo "✓ Frontend image built successfully"
echo ""

# Step 7: Run backend container
echo "[7/8] Starting backend container..."
docker run -d \
  --name smart-attendance-backend \
  -p 8000:8000 \
  -v "$PROJECT_DIR/backend/data:/app/data" \
  --restart unless-stopped \
  smart-attendance-backend:latest

sleep 3
echo "✓ Backend container started"
echo ""

# Step 8: Run frontend container
echo "[8/8] Starting frontend container..."
docker run -d \
  --name smart-attendance-frontend \
  -p 80:80 \
  --restart unless-stopped \
  smart-attendance-frontend:latest

sleep 2
echo "✓ Frontend container started"
echo ""

# Verification
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Deployment Details:"
echo "  Branch:       $BRANCH_NAME"
echo "  Repository:   $REPO_URL"
echo "  Deploy Dir:   $DEPLOY_DIR"
echo "  Project Dir:  $PROJECT_DIR"
echo ""
echo "Running Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Access Points:"
echo "  Frontend:     http://$(hostname -I | awk '{print $1}')"
echo "  Backend API:  http://$(hostname -I | awk '{print $1}'):8000"
echo "  API Docs:     http://$(hostname -I | awk '{print $1}'):8000/docs"
echo ""
echo "Demo Credentials:"
echo "  Admin:    admin@example.com / password"
echo "  Employee: emp@example.com / password"
echo ""
echo "Container Management:"
echo "  View logs:     docker logs -f smart-attendance-backend"
echo "  View logs:     docker logs -f smart-attendance-frontend"
echo "  Restart:       docker restart smart-attendance-backend smart-attendance-frontend"
echo "  Stop:          docker stop smart-attendance-backend smart-attendance-frontend"
echo ""
echo "Data Location: $PROJECT_DIR/backend/data"
echo ""
echo "To redeploy with a different branch:"
echo "  ./deploy.sh develop/1.0"
echo "  ./deploy.sh main"
echo "  ./deploy.sh <branch-name>"
echo ""
