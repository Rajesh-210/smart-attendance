from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from config import Base, engine, SessionLocal
from utils import hash_password
from models import User, Employee, Attendance, Leave  # adjust if Leave model name differs


def initialize_data():
    # =========================
    # CREATE TABLES
    # =========================
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")

    db: Session = SessionLocal()

    try:
        # =========================
        # CREATE ADMIN USER
        # =========================
        if not db.query(User).filter(User.employee_id == "admin@example.com").first():
            admin_employee = Employee(
                employee_id="admin@example.com",
                full_name="Admin User",
                email="admin@example.com",
                department="Management",
                role="ADMIN"
            )

            admin_user = User(
                employee_id="admin@example.com",
                password_hash=hash_password("password")
            )

            db.add(admin_employee)
            db.add(admin_user)
            print("✅ Admin user created")

        # =========================
        # CREATE EMPLOYEE USERS
        # =========================
        employees_data = [
            {
                "employee_id": "emp@example.com",
                "full_name": "John Doe",
                "email": "emp@example.com",
                "department": "Engineering",
                "role": "EMPLOYEE"
            },
            {
                "employee_id": "jane@example.com",
                "full_name": "Jane Smith",
                "email": "jane@example.com",
                "department": "HR",
                "role": "EMPLOYEE"
            }
        ]

        for emp in employees_data:
            if not db.query(User).filter(User.employee_id == emp["employee_id"]).first():
                employee = Employee(**emp)
                user = User(
                    employee_id=emp["employee_id"],
                    password_hash=hash_password("password")
                )
                db.add(employee)
                db.add(user)
                print(f"✅ User created: {emp['employee_id']}")

        # =========================
        # SAMPLE ATTENDANCE (OPTIONAL)
        # =========================
        today = datetime.utcnow().date()

        if not db.query(Attendance).first():
            sample_attendance = Attendance(
                employee_id="emp@example.com",
                date=today,
                check_in=datetime.utcnow(),
                check_out=None,
                status="PRESENT"
            )
            db.add(sample_attendance)
            print("✅ Sample attendance created")

        # =========================
        # SAMPLE LEAVES (OPTIONAL)
        # =========================
        if not db.query(Leave).first():
            sample_leaves = [
                Leave(
                    employee_id="emp@example.com",
                    start_date=(today + timedelta(days=5)),
                    end_date=(today + timedelta(days=7)),
                    reason="Annual vacation",
                    status="PENDING",
                    created_at=datetime.utcnow()
                ),
                Leave(
                    employee_id="jane@example.com",
                    start_date=(today + timedelta(days=3)),
                    end_date=(today + timedelta(days=4)),
                    reason="Medical appointment",
                    status="PENDING",
                    created_at=datetime.utcnow()
                )
            ]

            db.add_all(sample_leaves)
            print("✅ Sample leave requests created")

        db.commit()
        print("🎉 Initial data setup completed successfully")

    finally:
        db.close()


if __name__ == "__main__":
    initialize_data()
