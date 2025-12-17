from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel
from config import USERS_FILE
from utils import read_json_file, write_json_file, verify_token, hash_password, get_next_id

router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str
    department: str

class UserUpdate(BaseModel):
    name: str
    email: str
    role: str
    department: str

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

@router.get("")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    users = read_json_file(USERS_FILE)
    return [
        {
            "id": u['id'],
            "name": u['name'],
            "email": u['email'],
            "role": u['role'],
            "department": u['department']
        }
        for u in users
    ]

@router.get("/{user_id}")
async def get_user(user_id: int, current_user: dict = Depends(get_current_user)):
    users = read_json_file(USERS_FILE)
    user = next((u for u in users if u['id'] == user_id), None)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user['id'],
        "name": user['name'],
        "email": user['email'],
        "role": user['role'],
        "department": user['department']
    }

@router.post("")
async def create_user(user_data: UserCreate, current_user: dict = Depends(get_current_user)):
    users = read_json_file(USERS_FILE)
    
    # Check if email already exists
    existing_user = next((u for u in users if u['email'] == user_data.email), None)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Create new user
    new_user = {
        "id": get_next_id(users),
        "name": user_data.name,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "role": user_data.role,
        "department": user_data.department
    }
    
    users.append(new_user)
    write_json_file(USERS_FILE, users)
    
    return {
        "id": new_user['id'],
        "name": new_user['name'],
        "email": new_user['email'],
        "role": new_user['role'],
        "department": new_user['department']
    }

@router.put("/{user_id}")
async def update_user(user_id: int, user_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    users = read_json_file(USERS_FILE)
    user_index = next((i for i, u in enumerate(users) if u['id'] == user_id), None)
    
    if user_index is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if email already exists (excluding current user)
    existing_user = next((u for i, u in enumerate(users) if u['email'] == user_data.email and i != user_index), None)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Update user
    users[user_index].update({
        "name": user_data.name,
        "email": user_data.email,
        "role": user_data.role,
        "department": user_data.department
    })
    
    write_json_file(USERS_FILE, users)
    
    return {
        "id": users[user_index]['id'],
        "name": users[user_index]['name'],
        "email": users[user_index]['email'],
        "role": users[user_index]['role'],
        "department": users[user_index]['department']
    }

@router.delete("/{user_id}")
async def delete_user(user_id: int, current_user: dict = Depends(get_current_user)):
    users = read_json_file(USERS_FILE)
    user_index = next((i for i, u in enumerate(users) if u['id'] == user_id), None)
    
    if user_index is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deleting themselves
    if current_user['id'] == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    deleted_user = users.pop(user_index)
    write_json_file(USERS_FILE, users)
    
    return {
        "id": deleted_user['id'],
        "name": deleted_user['name'],
        "email": deleted_user['email'],
        "role": deleted_user['role'],
        "department": deleted_user['department']
    }
