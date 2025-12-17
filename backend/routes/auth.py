from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from sqlalchemy.orm import Session

from config import ACCESS_TOKEN_EXPIRE_MINUTES
from utils import (
    hash_password,
    verify_password,
    create_access_token,
    get_db
)
from models import User, Employee   # adjust import if models are elsewhere

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# =========================
# REQUEST / RESPONSE MODELS
# =========================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str | None = "General"
    role: str | None = "EMPLOYEE"


# =========================
# LOGIN
# =========================
@router.post("/login", response_model=LoginResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.employee_id == request.email)
        .first()
    )

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token_expires = timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    access_token = create_access_token(
        data={"sub": user.employee_id},
        expires_delta=access_token_expires
    )

    employee = (
        db.query(Employee)
        .filter(Employee.employee_id == user.employee_id)
        .first()
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "employee_id": employee.employee_id,
            "name": employee.full_name,
            "email": employee.email,
            "role": employee.role,
            "department": employee.department
        }
    }

# =========================
# REGISTER (OPTIONAL – ADMIN CAN USE)
# =========================
@router.post("/register", status_code=201)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.employee_id == request.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    employee = Employee(
        employee_id=request.email,
        full_name=request.name,
        email=request.email,
        department=request.department,
        role=request.role
    )

    user = User(
        employee_id=request.email,
        password_hash=hash_password(request.password)
    )

    db.add(employee)
    db.add(user)
    db.commit()

    return {"message": "User registered successfully"}
