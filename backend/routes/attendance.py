from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from config import ATTENDANCE_FILE
from utils import (
    read_json_file, write_json_file, get_next_id, verify_token
)

router = APIRouter()

class AttendanceRequest(BaseModel):
    user_id: int

class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    date: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

@router.post("/check-in")
async def check_in(request: AttendanceRequest, current_user: dict = Depends(get_current_user)):
    attendance_records = read_json_file(ATTENDANCE_FILE)
    today = datetime.now().strftime("%Y-%m-%d")
    
    existing = next(
        (a for a in attendance_records if a['user_id'] == request.user_id and a['date'] == today),
        None
    )
    
    if existing and existing.get('check_in'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked in today"
        )
    
    if existing:
        existing['check_in'] = datetime.now().isoformat()
    else:
        new_record = {
            "id": get_next_id(attendance_records),
            "user_id": request.user_id,
            "date": today,
            "check_in": datetime.now().isoformat(),
            "check_out": None
        }
        attendance_records.append(new_record)
    
    write_json_file(ATTENDANCE_FILE, attendance_records)
    return {"message": "Checked in successfully"}

@router.post("/check-out")
async def check_out(request: AttendanceRequest, current_user: dict = Depends(get_current_user)):
    attendance_records = read_json_file(ATTENDANCE_FILE)
    today = datetime.now().strftime("%Y-%m-%d")
    
    existing = next(
        (a for a in attendance_records if a['user_id'] == request.user_id and a['date'] == today),
        None
    )
    
    if not existing or not existing.get('check_in'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must check in first"
        )
    
    if existing.get('check_out'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked out today"
        )
    
    existing['check_out'] = datetime.now().isoformat()
    write_json_file(ATTENDANCE_FILE, attendance_records)
    return {"message": "Checked out successfully"}

@router.get("/all")
async def get_all_attendance(current_user: dict = Depends(get_current_user)):
    from config import USERS_FILE
    attendance_records = read_json_file(ATTENDANCE_FILE)
    users = read_json_file(USERS_FILE)
    
    user_map = {u['id']: u['name'] for u in users}
    
    result = []
    for record in attendance_records:
        result.append({
            **record,
            "user_name": user_map.get(record['user_id'], 'Unknown')
        })
    
    return result

@router.get("/{user_id}")
async def get_today_attendance(user_id: int, current_user: dict = Depends(get_current_user)):
    attendance_records = read_json_file(ATTENDANCE_FILE)
    today = datetime.now().strftime("%Y-%m-%d")
    
    record = next(
        (a for a in attendance_records if a['user_id'] == user_id and a['date'] == today),
        None
    )
    
    if not record:
        return {
            "id": 0,
            "user_id": user_id,
            "date": today,
            "check_in": None,
            "check_out": None
        }
    
    return record
