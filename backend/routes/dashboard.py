from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
import json
import os
from config import USERS_FILE, ATTENDANCE_FILE, LEAVES_FILE
from utils import verify_token, load_json_file

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(current_user: dict = Depends(verify_token)):
    """Get dashboard statistics for admin"""
    try:
        users = load_json_file(USERS_FILE)
        attendance = load_json_file(ATTENDANCE_FILE)
        leaves = load_json_file(LEAVES_FILE)
        
        today = datetime.now().date()
        
        # Calculate statistics
        total_users = len(users)
        total_employees = len([u for u in users if u.get('role') == 'employee'])
        total_admins = len([u for u in users if u.get('role') == 'admin'])
        
        # Today's attendance
        today_attendance = [a for a in attendance if datetime.fromisoformat(a.get('date', '')).date() == today]
        present_today = len([a for a in today_attendance if a.get('check_in') and a.get('check_out')])
        absent_today = total_employees - len([a for a in today_attendance if a.get('check_in')])
        
        # Leave statistics
        pending_leaves = len([l for l in leaves if l.get('status') == 'pending'])
        approved_leaves = len([l for l in leaves if l.get('status') == 'approved'])
        rejected_leaves = len([l for l in leaves if l.get('status') == 'rejected'])
        
        # This month's attendance
        current_month = datetime.now().month
        current_year = datetime.now().year
        this_month_attendance = [
            a for a in attendance 
            if datetime.fromisoformat(a.get('date', '')).month == current_month 
            and datetime.fromisoformat(a.get('date', '')).year == current_year
        ]
        
        # Department-wise statistics
        departments = {}
        for user in users:
            dept = user.get('department', 'Unknown')
            if dept not in departments:
                departments[dept] = {'total': 0, 'present': 0}
            departments[dept]['total'] += 1
            
            user_attendance = [a for a in today_attendance if a.get('user_id') == user.get('id')]
            if user_attendance and user_attendance[0].get('check_in'):
                departments[dept]['present'] += 1
        
        return {
            "total_users": total_users,
            "total_employees": total_employees,
            "total_admins": total_admins,
            "today": {
                "present": present_today,
                "absent": absent_today,
                "total_checked_in": len([a for a in today_attendance if a.get('check_in')])
            },
            "leaves": {
                "pending": pending_leaves,
                "approved": approved_leaves,
                "rejected": rejected_leaves,
                "total": len(leaves)
            },
            "this_month": {
                "total_records": len(this_month_attendance),
                "unique_employees": len(set(a.get('user_id') for a in this_month_attendance))
            },
            "departments": departments
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/attendance-chart")
def get_attendance_chart(days: int = 7, current_user: dict = Depends(verify_token)):
    """Get attendance data for chart visualization"""
    try:
        attendance = load_json_file(ATTENDANCE_FILE)
        users = load_json_file(USERS_FILE)
        
        chart_data = []
        for i in range(days):
            date = (datetime.now() - timedelta(days=i)).date()
            day_attendance = [
                a for a in attendance 
                if datetime.fromisoformat(a.get('date', '')).date() == date
            ]
            
            present = len([a for a in day_attendance if a.get('check_in') and a.get('check_out')])
            absent = len(users) - len([a for a in day_attendance if a.get('check_in')])
            
            chart_data.append({
                "date": str(date),
                "present": present,
                "absent": absent,
                "checked_in": len([a for a in day_attendance if a.get('check_in')])
            })
        
        return sorted(chart_data, key=lambda x: x['date'])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/employee-performance")
def get_employee_performance(current_user: dict = Depends(verify_token)):
    """Get employee performance metrics"""
    try:
        users = load_json_file(USERS_FILE)
        attendance = load_json_file(ATTENDANCE_FILE)
        leaves = load_json_file(LEAVES_FILE)
        
        performance_data = []
        
        for user in users:
            if user.get('role') == 'employee':
                user_attendance = [a for a in attendance if a.get('user_id') == user.get('id')]
                user_leaves = [l for l in leaves if l.get('user_id') == user.get('id')]
                
                total_days = len(set(
                    datetime.fromisoformat(a.get('date', '')).date() 
                    for a in user_attendance
                ))
                
                present_days = len([a for a in user_attendance if a.get('check_in') and a.get('check_out')])
                
                approved_leaves = len([l for l in user_leaves if l.get('status') == 'approved'])
                
                attendance_rate = (present_days / total_days * 100) if total_days > 0 else 0
                
                performance_data.append({
                    "user_id": user.get('id'),
                    "name": user.get('name'),
                    "email": user.get('email'),
                    "department": user.get('department'),
                    "total_attendance_records": len(user_attendance),
                    "present_days": present_days,
                    "attendance_rate": round(attendance_rate, 2),
                    "approved_leaves": approved_leaves,
                    "pending_leaves": len([l for l in user_leaves if l.get('status') == 'pending'])
                })
        
        return sorted(performance_data, key=lambda x: x['attendance_rate'], reverse=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/monthly-report")
def get_monthly_report(month: int = None, year: int = None, current_user: dict = Depends(verify_token)):
    """Get monthly attendance report"""
    try:
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
        
        attendance = load_json_file(ATTENDANCE_FILE)
        users = load_json_file(USERS_FILE)
        
        monthly_data = [
            a for a in attendance
            if datetime.fromisoformat(a.get('date', '')).month == month
            and datetime.fromisoformat(a.get('date', '')).year == year
        ]
        
        report = {
            "month": month,
            "year": year,
            "total_records": len(monthly_data),
            "unique_employees": len(set(a.get('user_id') for a in monthly_data)),
            "total_present": len([a for a in monthly_data if a.get('check_in') and a.get('check_out')]),
            "total_absent": len(users) * 20 - len([a for a in monthly_data if a.get('check_in')]),
            "employee_summary": []
        }
        
        for user in users:
            if user.get('role') == 'employee':
                user_monthly = [a for a in monthly_data if a.get('user_id') == user.get('id')]
                report["employee_summary"].append({
                    "name": user.get('name'),
                    "email": user.get('email'),
                    "present": len([a for a in user_monthly if a.get('check_in') and a.get('check_out')]),
                    "absent": 20 - len([a for a in user_monthly if a.get('check_in')])
                })
        
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
