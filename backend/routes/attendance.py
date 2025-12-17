from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, datetime

from utils import get_current_user, require_admin, get_db
from models import Attendance, Employee

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


# =========================
# CHECK-IN
# =========================
@router.post("/check-in")
def check_in(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()

    record = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_user.employee_id,
            Attendance.date == today
        )
        .first()
    )

    if record and record.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked in today"
        )

    if not record:
        record = Attendance(
            employee_id=current_user.employee_id,
            date=today,
            check_in=datetime.utcnow(),
            status="PRESENT"
        )
        db.add(record)
    else:
        record.check_in = datetime.utcnow()

    db.commit()
    return {"message": "Checked in successfully"}


# =========================
# CHECK-OUT
# =========================
@router.post("/check-out")
def check_out(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()

    record = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_user.employee_id,
            Attendance.date == today
        )
        .first()
    )

    if not record or not record.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must check in first"
        )

    if record.check_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked out today"
        )

    record.check_out = datetime.utcnow()
    db.commit()

    return {"message": "Checked out successfully"}


# =========================
# GET TODAY'S ATTENDANCE (SELF)
# =========================
@router.get("/today")
def get_today_attendance(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()

    record = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_user.employee_id,
            Attendance.date == today
        )
        .first()
    )

    if not record:
        return {
            "date": today,
            "check_in": None,
            "check_out": None,
            "status": "ABSENT"
        }

    return {
        "date": record.date,
        "check_in": record.check_in,
        "check_out": record.check_out,
        "status": record.status
    }


# =========================
# GET ALL ATTENDANCE (ADMIN ONLY)
# =========================
@router.get("/all")
def get_all_attendance(
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    records = (
        db.query(Attendance, Employee)
        .join(Employee, Attendance.employee_id == Employee.employee_id)
        .order_by(Attendance.date.desc())
        .all()
    )

    return [
        {
            "employee_id": emp.employee_id,
            "name": emp.full_name,
            "department": emp.department,
            "date": att.date,
            "check_in": att.check_in,
            "check_out": att.check_out,
            "status": att.status
        }
        for att, emp in records
    ]


# =========================
# GET ATTENDANCE BY EMPLOYEE (ADMIN)
# =========================
@router.get("/employee/{employee_id}")
def get_employee_attendance(
    employee_id: str,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    records = (
        db.query(Attendance)
        .filter(Attendance.employee_id == employee_id)
        .order_by(Attendance.date.desc())
        .all()
    )

    if not records:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No attendance records found"
        )

    return records
