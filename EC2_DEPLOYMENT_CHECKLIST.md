# EC2 Deployment Checklist

## ✓ Deployment Status: COMPLETE

### Containers Running
- [x] Backend container (port 8000) - `smart-attendance-backend:latest`
- [x] Frontend container (port 80) - `smart-attendance-frontend:latest`

### Container Details

```bash
CONTAINER ID   IMAGE                              COMMAND                  CREATED         STATUS         PORTS
68ef47e7ea7d   smart-attendance-frontend:latest   "/docker-entrypoint.…"   4 minutes ago   Up 2 minutes   0.0.0.0:80->80/tcp
5762c25f54da   smart-attendance-backend:latest    "uvicorn main:app --…"   4 minutes ago   Up 4 minutes   0.0.0.0:8000->8000/tcp
```

## Access Points

| Service | URL | Port |
|---------|-----|------|
| Frontend | `http://<EC2-IP>` | 80 |
| Backend API | `http://<EC2-IP>:8000` | 8000 |
| API Docs | `http://<EC2-IP>:8000/docs` | 8000 |
| Health Check | `http://<EC2-IP>:8000/health` | 8000 |

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| Employee | emp@example.com | password |
| Employee | jane@example.com | password |

## Container Management Commands

### View Running Containers
```bash
docker ps
```

### View Container Logs
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

### Remove Containers (if needed)
```bash
docker stop smart-attendance-backend smart-attendance-frontend
docker rm smart-attendance-backend smart-attendance-frontend
```

## Data Persistence

- Backend data stored in: `/home/ubuntu/content/attend/smart-attendance/backend/data/`
- Files:
  - `users.json` - User accounts
  - `attendance.json` - Attendance records
  - `leaves.json` - Leave requests

## Verify Deployment

### Test Backend Health
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

### Test API
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Test Frontend
Open browser and navigate to `http://<EC2-IP>`

## Security Group Configuration

Ensure these inbound rules are configured in AWS Security Group:

| Protocol | Port | Source |
|----------|------|--------|
| HTTP | 80 | 0.0.0.0/0 |
| Custom TCP | 8000 | 0.0.0.0/0 (or restrict to your IP) |
| SSH | 22 | Your IP |

## Auto-Restart Configuration

Both containers are configured with `--restart unless-stopped`:
- Containers automatically restart on failure
- Containers restart after EC2 instance reboot
- Manual stop prevents auto-restart

## Troubleshooting

### Port Already in Use
```bash
sudo lsof -i :80
sudo lsof -i :8000
sudo kill -9 <PID>
```

### Container Won't Start
```bash
docker logs <container-name>
```

### Connection Refused
- Verify container is running: `docker ps`
- Check security group allows the port
- Verify firewall rules on EC2

### Data Not Persisting
```bash
# Check volume mount
docker inspect smart-attendance-backend | grep -A 5 Mounts

# Check directory permissions
ls -la backend/data/
```

## Production Recommendations

1. **Change Secret Key**: Update `SECRET_KEY` in `backend/config.py`
2. **Use Environment Variables**: Store sensitive data in `.env`
3. **Enable HTTPS**: Use AWS Certificate Manager + ALB
4. **Database Migration**: Consider PostgreSQL instead of JSON files
5. **Monitoring**: Set up CloudWatch for logs and metrics
6. **Backup**: Regularly backup `/backend/data/` directory
7. **Load Balancing**: Use AWS ALB for multiple instances

## Next Steps

1. Test all features (login, attendance, leave requests)
2. Verify data persistence across container restarts
3. Set up monitoring and logging
4. Configure HTTPS for production
5. Plan database migration if needed
