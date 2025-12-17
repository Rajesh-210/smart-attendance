# Quick Start Guide

## Local Development (Without Docker)

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- pip

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup (in a new terminal)

```bash
cd backend
pip install -r requirements.txt
python init_data.py
python -m uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

### Access the Application

1. Open `http://localhost:5173` in your browser
2. Login with demo credentials:
   - Email: `admin@example.com`
   - Password: `password`

---

## Docker Deployment (Local Testing)

### Prerequisites
- Docker installed and running

### Build and Run

**On Linux/Mac:**
```bash
chmod +x docker-build-and-run.sh
./docker-build-and-run.sh
```

**On Windows (PowerShell):**
```powershell
.\docker-build-and-run.bat
```

### Access the Application

- Frontend: `http://localhost`
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| Employee | emp@example.com | password |
| Employee | jane@example.com | password |

### View Logs

```bash
# Backend logs
docker logs -f smart-attendance-backend

# Frontend logs
docker logs -f smart-attendance-frontend
```

### Stop Containers

```bash
docker stop smart-attendance-backend smart-attendance-frontend
```

### Restart Containers

```bash
docker start smart-attendance-backend smart-attendance-frontend
```

---

## AWS EC2 Deployment

See `DEPLOYMENT_GUIDE.md` for complete AWS EC2 deployment instructions.

### Quick Summary

1. SSH into EC2 instance
2. Install Docker
3. Clone/upload project
4. Build Docker images
5. Run containers with volume mounts
6. Update security group rules
7. Access via EC2 public IP

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :80
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Container Won't Start

```bash
docker logs <container-name>
```

### Backend Connection Error

Ensure backend container is running:
```bash
docker ps
```

Check if port 8000 is accessible:
```bash
curl http://localhost:8000/health
```

### Frontend Not Loading

Check Nginx logs:
```bash
docker logs smart-attendance-frontend
```

Clear browser cache and reload.

---

## Project Structure

```
smart-attendance/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile           # Frontend Docker image
│   ├── nginx.conf           # Nginx configuration
│   └── package.json
├── backend/                  # FastAPI backend
│   ├── routes/              # API routes
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   ├── utils.py             # Utilities
│   ├── init_data.py         # Initialize demo data
│   ├── Dockerfile           # Backend Docker image
│   ├── requirements.txt      # Python dependencies
│   └── data/                # JSON data storage
├── DEPLOYMENT_GUIDE.md      # AWS EC2 deployment
├── README.md                # Project documentation
└── QUICK_START.md          # This file
```

---

## Features

✓ User authentication with JWT  
✓ Attendance check-in/check-out  
✓ Leave request management  
✓ Admin approval workflow  
✓ Responsive UI  
✓ Data persistence  
✓ Docker containerization  
✓ Production-ready Nginx config  

---

## Next Steps

1. **Local Testing**: Run with Docker locally to test functionality
2. **AWS Deployment**: Follow DEPLOYMENT_GUIDE.md for EC2 deployment
3. **Production Setup**: Update SECRET_KEY and use environment variables
4. **Database Migration**: Consider PostgreSQL for production instead of JSON files
5. **Monitoring**: Set up CloudWatch for logs and metrics

---

## Support

- Check logs: `docker logs <container-name>`
- API Documentation: `http://localhost:8000/docs`
- See DEPLOYMENT_GUIDE.md for production deployment
