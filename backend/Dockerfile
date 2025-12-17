FROM python:3.11-slim

WORKDIR /app

ENV DATABASE_URL=postgresql://attendance_user:strongpassword@db:5432/attendance

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
