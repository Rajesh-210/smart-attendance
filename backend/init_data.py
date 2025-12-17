import json
import os
from datetime import datetime, timedelta
from config import USERS_FILE, ATTENDANCE_FILE, LEAVES_FILE
from utils import hash_password

def initialize_data():
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    today = datetime.now()
    
    users = [
        {
            "id": 1,
            "name": "Admin User",
            "email": "admin@example.com",
            "password": hash_password("password"),
            "role": "admin",
            "department": "Management"
        },
        {
            "id": 2,
            "name": "John Doe",
            "email": "emp@example.com",
            "password": hash_password("password"),
            "role": "employee",
            "department": "Engineering"
        },
        {
            "id": 3,
            "name": "Jane Smith",
            "email": "jane@example.com",
            "password": hash_password("password"),
            "role": "employee",
            "department": "HR"
        }
    ]
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)
    print(f"Users initialized: {len(users)} users created")
    
    # Initialize with empty attendance records for functional check-in/check-out
    with open(ATTENDANCE_FILE, 'w') as f:
        json.dump([], f, indent=2)
    print("Attendance file initialized - ready for functional check-in/check-out")
    
    # Initialize with sample leave requests for demo
    sample_leaves = [
        {
            "id": 1,
            "user_id": 2,
            "start_date": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
            "end_date": (today + timedelta(days=7)).strftime("%Y-%m-%d"),
            "reason": "Annual vacation",
            "status": "pending",
            "created_at": today.isoformat()
        },
        {
            "id": 2,
            "user_id": 3,
            "start_date": (today + timedelta(days=3)).strftime("%Y-%m-%d"),
            "end_date": (today + timedelta(days=4)).strftime("%Y-%m-%d"),
            "reason": "Medical appointment",
            "status": "pending",
            "created_at": today.isoformat()
        }
    ]
    
    with open(LEAVES_FILE, 'w') as f:
        json.dump(sample_leaves, f, indent=2)
    print(f"Leaves file initialized with {len(sample_leaves)} sample requests")

if __name__ == "__main__":
    initialize_data()
    print("Data initialized successfully")
