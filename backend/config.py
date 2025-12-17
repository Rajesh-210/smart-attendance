import os
from datetime import timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# =========================
# File-based storage (Legacy / Backup)
# =========================
BASE_DIR = os.path.dirname(__file__)

DATA_DIR = os.path.join(BASE_DIR, 'data')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
ATTENDANCE_FILE = os.path.join(DATA_DIR, 'attendance.json')
LEAVES_FILE = os.path.join(DATA_DIR, 'leaves.json')

os.makedirs(DATA_DIR, exist_ok=True)

# =========================
# Security / JWT Settings
# =========================
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "your-secret-key-change-in-production"
)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

ACCESS_TOKEN_EXPIRE_DELTA = timedelta(
    minutes=ACCESS_TOKEN_EXPIRE_MINUTES
)

# =========================
# Database Configuration (NEW)
# =========================
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://attendance_user:strongpassword@db:5432/attendance"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
