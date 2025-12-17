# Automatic Deployment Guide

## One-Command Deployment

Deploy the entire Smart Attendance & Leave Management System on a fresh EC2 instance with a single command.

### Prerequisites

- AWS EC2 instance (Ubuntu 22.04 LTS)
- SSH access to the instance
- Internet connectivity

### Quick Start

SSH into your EC2 instance and run:

```bash
curl -fsSL https://raw.githubusercontent.com/bot28-b/attend/main/deploy.sh | bash
```

Or if you prefer to review the script first:

```bash
# Download the script
wget https://raw.githubusercontent.com/bot28-b/attend/main/deploy.sh

# Make it executable
chmod +x deploy.sh

# Run it
./deploy.sh
```

### Manual Deployment (Alternative)

If you prefer to deploy manually or the script fails:

```bash
# 1. Install Docker
sudo apt-get update
sudo apt-get install -y docker.io
sudo usermod -aG docker ubuntu
newgrp docker

# 2. Clone repository
mkdir -p /home/ubuntu/smart-attendance
cd /home/ubuntu/smart-attendance
git clone https://github.com/bot28-b/attend.git .

# 3. Build and run containers
cd smart-attendance

# Build backend
cd backend
docker build -t smart-attendance-backend:latest .
cd ..

# Build frontend
cd frontend
docker build -t smart-attendance-frontend:latest .
cd ..

# Run backend
docker run -d \
  --name smart-attendance-backend \
  -p 8000:8000 \
  -v $(pwd)/backend/data:/app/data \
  --restart unless-stopped \
  smart-attendance-backend:latest

# Run frontend
docker run -d \
  --name smart-attendance-frontend \
  -p 80:80 \
  --restart unless-stopped \
  smart-attendance-frontend:latest

# Verify
docker ps
```

## What the Script Does

1. **Checks Docker** - Installs Docker if not present
2. **Clones Repository** - Pulls the latest code from GitHub
3. **Stops Old Containers** - Removes any existing deployment
4. **Cleans Data** - Resets data directory for fresh start
5. **Builds Backend** - Creates backend Docker image
6. **Builds Frontend** - Creates frontend Docker image
7. **Runs Backend** - Starts backend container with volume mount
8. **Runs Frontend** - Starts frontend container
9. **Displays Info** - Shows access points and credentials

## Access After Deployment

Once the script completes, you'll see output like:

```
Access Points:
  Frontend:     http://54.123.45.67
  Backend API:  http://54.123.45.67:8000
  API Docs:     http://54.123.45.67:8000/docs
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| Employee | emp@example.com | password |

## Container Management

### View Logs

```bash
# Backend logs
docker logs -f smart-attendance-backend

# Frontend logs
docker logs -f smart-attendance-frontend
```

### Restart Containers

```bash
docker restart smart-attendance-backend smart-attendance-frontend
```

### Stop Containers

```bash
docker stop smart-attendance-backend smart-attendance-frontend
```

### Start Containers

```bash
docker start smart-attendance-backend smart-attendance-frontend
```

### Remove Containers

```bash
docker stop smart-attendance-backend smart-attendance-frontend
docker rm smart-attendance-backend smart-attendance-frontend
```

## Troubleshooting

### Port 80 Already in Use

```bash
sudo lsof -i :80
sudo kill -9 <PID>
docker run -d -p 80:80 --name smart-attendance-frontend smart-attendance-frontend:latest
```

### Port 8000 Already in Use

```bash
sudo lsof -i :8000
sudo kill -9 <PID>
docker run -d -p 8000:8000 --name smart-attendance-backend smart-attendance-backend:latest
```

### Backend Connection Refused

```bash
# Check if backend is running
docker ps | grep smart-attendance-backend

# Check backend logs
docker logs smart-attendance-backend

# Test health endpoint
curl http://localhost:8000/health
```

### Frontend Not Loading

```bash
# Check frontend logs
docker logs smart-attendance-frontend

# Check if port 80 is accessible
curl http://localhost
```

### Data Not Persisting

```bash
# Check volume mount
docker inspect smart-attendance-backend | grep -A 5 Mounts

# Check data directory
ls -la /home/ubuntu/smart-attendance/smart-attendance/backend/data/
```

## Security Group Configuration

In AWS Console, ensure these inbound rules are set:

| Protocol | Port | Source | Purpose |
|----------|------|--------|---------|
| HTTP | 80 | 0.0.0.0/0 | Frontend access |
| Custom TCP | 8000 | 0.0.0.0/0 | API access (restrict in production) |
| SSH | 22 | Your IP | SSH access |

## Production Recommendations

1. **Change Secret Key** - Update `SECRET_KEY` in backend config
2. **Use HTTPS** - Set up AWS Certificate Manager + ALB
3. **Restrict API Access** - Limit port 8000 to specific IPs
4. **Database** - Migrate from JSON to PostgreSQL
5. **Monitoring** - Set up CloudWatch logs and metrics
6. **Backups** - Regularly backup `/backend/data/` directory
7. **Load Balancing** - Use AWS ALB for multiple instances

## Redeployment

To redeploy with the latest code:

```bash
cd /home/ubuntu/smart-attendance/smart-attendance

# Stop containers
docker stop smart-attendance-backend smart-attendance-frontend

# Pull latest code
git pull origin main

# Rebuild and restart
cd backend && docker build -t smart-attendance-backend:latest . && cd ..
cd frontend && docker build -t smart-attendance-frontend:latest . && cd ..

docker start smart-attendance-backend smart-attendance-frontend
```

## Support

- **API Documentation**: `http://<your-ec2-ip>:8000/docs`
- **Health Check**: `curl http://<your-ec2-ip>:8000/health`
- **View Logs**: `docker logs -f <container-name>`

## Features Included

✓ User authentication with JWT  
✓ Attendance check-in/check-out  
✓ Leave request management  
✓ Admin approval workflow  
✓ Responsive UI  
✓ Data persistence  
✓ Auto-restart on failure  
✓ Production-ready Nginx  
✓ CORS enabled  
✓ API documentation  
