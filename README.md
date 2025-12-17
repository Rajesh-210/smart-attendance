# Smart Attendance & Leave Management System

A full-stack web application for managing employee attendance and leave requests with admin approval workflow.

## Features

- **User Authentication**: Secure login with JWT tokens
- **Attendance Tracking**: Check-in/check-out functionality
- **Leave Management**: Request and approve leave with reason tracking
- **Admin Dashboard**: View all attendance records and manage leave approvals
- **Employee Dashboard**: Track personal attendance and leave status
- **Data Persistence**: All data stored in JSON files (no database required)
- **Production Ready**: Dockerized frontend and backend with Nginx

## Technology Stack

### Frontend
- React 18
- Vite (build tool)
- Axios (HTTP client)
- CSS3 (responsive design)
- Nginx (web server)

### Backend
- FastAPI (Python web framework)
- Uvicorn (ASGI server)
- JWT (authentication)
- Bcrypt (password hashing)
- JSON (data storage)

## Project Structure

```
smart-attendance/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── nginx.conf
├── backend/
│   ├── routes/
│   │   ├── auth.py
│   │   ├── attendance.py
│   │   ├── leaves.py
│   │   └── users.py
│   ├── main.py
│   ├── config.py
│   ├── utils.py
│   ├── init_data.py
│   ├── requirements.txt
│   └── Dockerfile
├── DEPLOYMENT_GUIDE.md
└── README.md
```

## Local Development

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python init_data.py
python -m uvicorn main:app --reload
```

Backend will be available at `http://localhost:8000`

## Docker Deployment

### Build Images

```bash
# Frontend
cd frontend
docker build -t smart-attendance-frontend:latest .

# Backend
cd backend
docker build -t smart-attendance-backend:latest .
```

### Run Containers

```bash
# Backend (port 8000)
docker run -d \
  --name smart-attendance-backend \
  -p 8000:8000 \
  -v $(pwd)/backend/data:/app/data \
  --restart unless-stopped \
  smart-attendance-backend:latest

# Frontend (port 80)
docker run -d \
  --name smart-attendance-frontend \
  -p 80:80 \
  --restart unless-stopped \
  smart-attendance-frontend:latest
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| Employee | emp@example.com | password |
| Employee | jane@example.com | password |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Attendance
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/{user_id}` - Get today's attendance
- `GET /api/attendance/all` - Get all attendance records (admin)

### Leave Management
- `POST /api/leaves/request` - Request leave
- `GET /api/leaves/user/{user_id}` - Get user's leave requests
- `GET /api/leaves/pending` - Get pending leave requests (admin)
- `POST /api/leaves/approve/{leave_id}` - Approve leave (admin)
- `POST /api/leaves/reject/{leave_id}` - Reject leave (admin)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{user_id}` - Get user details

## Data Storage

All data is stored in JSON files:
- `backend/data/users.json` - User accounts
- `backend/data/attendance.json` - Attendance records
- `backend/data/leaves.json` - Leave requests

## Security Features

- JWT-based authentication
- Bcrypt password hashing
- CORS enabled for frontend-backend communication
- Token expiration (30 minutes)
- Authorization checks on protected endpoints

## Production Deployment

See `DEPLOYMENT_GUIDE.md` for detailed AWS EC2 deployment instructions.

### Key Points
- Containers restart automatically on failure
- Data persists in mounted volumes
- Nginx handles static file serving with caching
- Backend API available on port 8000
- Frontend available on port 80

## Environment Variables

For production, set these environment variables:

```bash
# Backend
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend
REACT_APP_API_URL=https://your-api-domain.com
```

## Troubleshooting

### Backend connection issues
- Ensure backend container is running: `docker ps`
- Check logs: `docker logs smart-attendance-backend`
- Verify port 8000 is accessible

### Frontend not loading
- Check Nginx logs: `docker logs smart-attendance-frontend`
- Verify port 80 is accessible
- Clear browser cache

### Data not persisting
- Ensure volume is mounted: `docker inspect smart-attendance-backend`
- Check directory permissions: `ls -la backend/data/`

## License

MIT License

## Support

For issues and questions, please refer to the DEPLOYMENT_GUIDE.md or check container logs.
