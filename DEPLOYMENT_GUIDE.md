# Smart Attendance & Leave Management System - Deployment Guide

## Prerequisites

- AWS EC2 instance (Ubuntu 22.04 LTS recommended)
- Docker installed on EC2
- SSH access to EC2 instance
- Domain name (optional, for production)

## Step 1: Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

## Step 2: Install Docker

```bash
sudo apt-get update
sudo apt-get install -y docker.io
sudo usermod -aG docker ubuntu
newgrp docker
```

## Step 3: Clone or Upload Project

```bash
cd /home/ubuntu
git clone <your-repo-url> smart-attendance
cd smart-attendance
```

Or upload using SCP:
```bash
scp -i your-key.pem -r smart-attendance ubuntu@your-ec2-public-ip:/home/ubuntu/
```

## Step 4: Build Frontend Docker Image

```bash
cd frontend
docker build -t smart-attendance-frontend:latest .
```

## Step 5: Build Backend Docker Image

```bash
cd ../backend
docker build -t smart-attendance-backend:latest .
```

## Step 6: Run Backend Container

```bash
docker run -d \
  --name smart-attendance-backend \
  -p 8000:8000 \
  -v /home/ubuntu/smart-attendance/backend/data:/app/data \
  --restart unless-stopped \
  smart-attendance-backend:latest
```

## Step 7: Run Frontend Container

```bash
docker run -d \
  --name smart-attendance-frontend \
  -p 80:80 \
  --restart unless-stopped \
  smart-attendance-frontend:latest
```

## Step 8: Verify Containers

```bash
docker ps
docker logs smart-attendance-backend
docker logs smart-attendance-frontend
```

## Step 9: Update Security Group

In AWS Console:
- Go to EC2 > Security Groups
- Add inbound rules:
  - Port 80 (HTTP) from 0.0.0.0/0
  - Port 8000 (API) from 0.0.0.0/0 (or restrict to your IP)
  - Port 22 (SSH) from your IP

## Step 10: Access Application

- Frontend: http://your-ec2-public-ip
- Backend API: http://your-ec2-public-ip:8000
- API Docs: http://your-ec2-public-ip:8000/docs

## Demo Credentials

- **Admin**: admin@example.com / password
- **Employee**: emp@example.com / password

## Container Management

### View Logs
```bash
docker logs -f smart-attendance-backend
docker logs -f smart-attendance-frontend
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
docker rm smart-attendance-backend smart-attendance-frontend
```

### Restart Containers
```bash
docker restart smart-attendance-backend smart-attendance-frontend
```

## Data Persistence

- Backend data is stored in `/home/ubuntu/smart-attendance/backend/data/`
- This directory is mounted as a volume in the container
- Data persists across container restarts

## Production Best Practices

1. **Change Secret Key**: Update `SECRET_KEY` in `backend/config.py`
2. **Use Environment Variables**: Store sensitive data in environment variables
3. **Enable HTTPS**: Use AWS Certificate Manager and ALB
4. **Database**: Consider migrating from JSON to PostgreSQL for production
5. **Monitoring**: Set up CloudWatch for logs and metrics
6. **Backup**: Regularly backup the data directory
7. **Auto-scaling**: Use EC2 Auto Scaling Groups for multiple instances

## Troubleshooting

### Container won't start
```bash
docker logs <container-name>
```

### Port already in use
```bash
sudo lsof -i :<port>
sudo kill -9 <PID>
```

### Permission denied errors
```bash
sudo chown -R ubuntu:ubuntu /home/ubuntu/smart-attendance
```

### API connection issues
- Ensure backend container is running: `docker ps`
- Check backend logs: `docker logs smart-attendance-backend`
- Verify security group allows port 8000

## Scaling Considerations

For production deployment with multiple instances:
1. Use AWS Load Balancer (ALB) to distribute traffic
2. Use RDS for database instead of JSON files
3. Use EFS for shared data storage
4. Implement proper logging with CloudWatch
5. Use ECR for Docker image registry

## Monitoring

Monitor container health:
```bash
docker stats
```

Set up CloudWatch alarms for:
- CPU usage
- Memory usage
- Disk space
- Container restarts
