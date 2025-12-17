from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from config import LEAVES_FILE, USERS_FILE
from utils import (
    read_json_file, write_json_file, get_next_id, verify_token
)

router = APIRouter()

class LeaveRequest(BaseModel):
    user_id: int
    start_date: str
    end_date: str
    reason: str

class LeaveResponse(BaseModel):
    id: int
    user_id: int
    start_date: str
    end_date: str
    reason: str
    status: str

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

@router.post("/request")
async def request_leave(request: LeaveRequest, current_user: dict = Depends(get_current_user)):
    leaves = read_json_file(LEAVES_FILE)
    
    new_leave = {
        "id": get_next_id(leaves),
        "user_id": request.user_id,
        "start_date": request.start_date,
        "end_date": request.end_date,
        "reason": request.reason,
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }
    
    leaves.append(new_leave)
    write_json_file(LEAVES_FILE, leaves)
    
    return {"message": "Leave request submitted successfully", "id": new_leave['id']}

@router.get("/user/{user_id}")
async def get_user_leaves(user_id: int, current_user: dict = Depends(get_current_user)):
    leaves = read_json_file(LEAVES_FILE)
    user_leaves = [l for l in leaves if l['user_id'] == user_id]
    return user_leaves

@router.get("/pending")
async def get_pending_leaves(current_user: dict = Depends(get_current_user)):
    leaves = read_json_file(LEAVES_FILE)
    users = read_json_file(USERS_FILE)
    
    user_map = {u['id']: u['name'] for u in users}
    
    pending_leaves = [l for l in leaves if l['status'] == 'pending']
    
    result = []
    for leave in pending_leaves:
        result.append({
            **leave,
            "user_name": user_map.get(leave['user_id'], 'Unknown')
        })
    
    return result

@router.post("/approve/{leave_id}")
async def approve_leave(leave_id: int, current_user: dict = Depends(get_current_user)):
    leaves = read_json_file(LEAVES_FILE)
    
    leave = next((l for l in leaves if l['id'] == leave_id), None)
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    leave['status'] = 'approved'
    leave['approved_at'] = datetime.now().isoformat()
    
    write_json_file(LEAVES_FILE, leaves)
    return {"message": "Leave approved successfully"}

@router.post("/reject/{leave_id}")
async def reject_leave(leave_id: int, current_user: dict = Depends(get_current_user)):
    leaves = read_json_file(LEAVES_FILE)
    
    leave = next((l for l in leaves if l['id'] == leave_id), None)
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    leave['status'] = 'rejected'
    leave['rejected_at'] = datetime.now().isoformat()
    
    write_json_file(LEAVES_FILE, leaves)
    return {"message": "Leave rejected successfully"}
