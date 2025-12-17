from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from datetime import timedelta
from config import USERS_FILE, ACCESS_TOKEN_EXPIRE_MINUTES
from utils import (
    hash_password, verify_password, create_access_token,
    read_json_file, write_json_file, get_next_id
)

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    users = read_json_file(USERS_FILE)
    
    user = next((u for u in users if u['email'] == request.email), None)
    if not user or not verify_password(request.password, user['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['email'], "user_id": user['id']},
        expires_delta=access_token_expires
    )
    
    user_data = {
        "id": user['id'],
        "name": user['name'],
        "email": user['email'],
        "role": user['role'],
        "department": user['department']
    }
    
    return {
        "token": access_token,
        "user": user_data
    }

@router.post("/register")
async def register(request: LoginRequest):
    users = read_json_file(USERS_FILE)
    
    if any(u['email'] == request.email for u in users):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    new_user = {
        "id": get_next_id(users),
        "name": request.email.split('@')[0],
        "email": request.email,
        "password": hash_password(request.password),
        "role": "employee",
        "department": "General"
    }
    
    users.append(new_user)
    write_json_file(USERS_FILE, users)
    
    return {"message": "User registered successfully"}
