from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from utils import get_current_user, require_admin, get_db, hash_password
from models import User, Employee

router = APIRouter(prefix="/api/users", tags=["Users"])

# =========================
# SCHEMAS
# =========================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "EMPLOYEE"
    department: str = "General"

class UserUpdate(BaseModel):
    name: str
    email: EmailStr
    role: str
    department: str


# =========================
# GET ALL USERS (ADMIN)
# =========================
@router.get("")
def get_all_users(
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = (
        db.query(Employee)
        .order_by(Employee.full_name)
        .all()
    )

    return [
        {
            "employee_id": u.employee_id,
            "name": u.full_name,
            "email": u.email,
            "role": u.role,
            "department": u.department
        }
        for u in users
    ]


# =========================
# GET SINGLE USER (ADMIN)
# =========================
@router.get("/{employee_id}")
def get_user(
    employee_id: str,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = (
        db.query(Employee)
        .filter(Employee.employee_id == employee_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {
        "employee_id": user.employee_id,
        "name": user.full_name,
        "email": user.email,
        "role": user.role,
        "department": user.department
    }


# =========================
# CREATE USER (ADMIN)
# =========================
@router.post("", status_code=201)
def create_user(
    user_data: UserCreate,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    if db.query(User).filter(User.employee_id == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

    employee = Employee(
        employee_id=user_data.email,
        full_name=user_data.name,
        email=user_data.email,
        department=user_data.department,
        role=user_data.role
    )

    user = User(
        employee_id=user_data.email,
        password_hash=hash_password(user_data.password)
    )

    db.add(employee)
    db.add(user)
    db.commit()

    return {
        "employee_id": employee.employee_id,
        "name": employee.full_name,
        "email": employee.email,
        "role": employee.role,
        "department": employee.department
    }


# =========================
# UPDATE USER (ADMIN)
# =========================
@router.put("/{employee_id}")
def update_user(
    employee_id: str,
    user_data: UserUpdate,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    employee = (
        db.query(Employee)
        .filter(Employee.employee_id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent email collision
    if (
        employee.email != user_data.email
        and db.query(Employee)
        .filter(Employee.email == user_data.email)
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

    employee.full_name = user_data.name
    employee.email = user_data.email
    employee.department = user_data.department
    employee.role = user_data.role

    # Sync employee_id if email changed
    if employee.employee_id != user_data.email:
        user = (
            db.query(User)
            .filter(User.employee_id == employee.employee_id)
            .first()
        )
        if user:
            user.employee_id = user_data.email
        employee.employee_id = user_data.email

    db.commit()

    return {
        "employee_id": employee.employee_id,
        "name": employee.full_name,
        "email": employee.email,
        "role": employee.role,
        "department": employee.department
    }


# =========================
# DELETE USER (ADMIN)
# =========================
@router.delete("/{employee_id}")
def delete_user(
    employee_id: str,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Prevent admin from deleting themselves
    if admin.employee_id == employee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete yourself"
        )

    employee = (
        db.query(Employee)
        .filter(Employee.employee_id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user = (
        db.query(User)
        .filter(User.employee_id == employee_id)
        .first()
    )

    if user:
        db.delete(user)

    db.delete(employee)
    db.commit()

    return {"message": "User deleted successfully"}
