# Quick Start Guide - Customer Success FTE

**Last Updated**: 2026-03-17

---

## 🚀 Option 1: Using Docker (Recommended)

### Prerequisites
- Docker Desktop installed and running
- Git (optional)

### Steps

```powershell
# 1. Navigate to project root
cd "E:\Hackathon 5\CRM-Digital-FTE-Factory"

# 2. Start all services
docker compose up -d

# 3. Check status
docker compose ps

# 4. View logs
docker compose logs -f

# 5. Access services
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# Health: http://localhost:8000/health
```

### Common Docker Commands

```powershell
# Stop all services
docker compose down

# Rebuild and restart
docker compose up -d --build

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Access backend shell
docker compose exec backend bash

# Access database
docker compose exec postgres psql -U fte_user -d fte_db

# Restart a service
docker compose restart backend
```

---

## 🐍 Option 2: Local Python Development

### Prerequisites
- Python 3.11 or 3.12 (Python 3.13 has compatibility issues)
- Node.js 18+
- PostgreSQL 16 with pgvector
- Kafka (optional for full functionality)

### Backend Setup

```powershell
# 1. Navigate to backend
cd "E:\Hackathon 5\CRM-Digital-FTE-Factory\backend"

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
.\venv\Scripts\Activate.ps1  # PowerShell
# or
.\venv\Scripts\activate.bat  # CMD

# 4. Upgrade pip
python -m pip install --upgrade pip

# 5. Install dependencies
pip install -r requirements.txt

# 6. Create .env file (if not exists)
notepad .env

# Add this content to .env:
# DATABASE_URL=postgresql+asyncpg://fte_user:fte_password@localhost:5432/fte_db
# OPENROUTER_API_KEY=sk-or-your-api-key
# OPENROUTER_MODEL=gpt-4o
# KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# 7. Start backend server
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Access at: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Frontend Setup

```powershell
# 1. Navigate to frontend
cd "E:\Hackathon 5\CRM-Digital-FTE-Factory\frontend"

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# Access at: http://localhost:3000
```

### Production Build (Frontend)

```powershell
cd frontend

# Build for production
npm run build

# Start production server
npm start
```

---

## 🛠️ Troubleshooting

### Docker Issues

#### Container won't start
```powershell
# Check Docker is running
docker ps

# If not, start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait 30 seconds, then try again
docker compose up -d
```

#### Port already in use
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

#### Database connection failed
```powershell
# Check PostgreSQL is running
docker compose ps postgres

# Restart PostgreSQL
docker compose restart postgres

# Check logs
docker compose logs postgres
```

### Local Python Issues

#### asyncpg error (Python 3.13)
```powershell
# Python 3.13 has compatibility issues
# Use Python 3.11 or 3.12 instead

# Or use Docker (recommended)
docker compose up -d
```

#### Module not found
```powershell
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Clear cache
Get-ChildItem -Recurse __pycache__ | Remove-Item -Recurse -Force
```

#### DATABASE_URL error
```powershell
# Make sure .env file has correct URL:
# DATABASE_URL=postgresql+asyncpg://fte_user:fte_password@localhost:5432/fte_db

# NOT:
# DATABASE_URL=postgresql://... (missing asyncpg)
# DATABASE_URL=postgresql+psycopg2://... (wrong driver)
```

### Frontend Issues

#### Module not found
```powershell
cd frontend

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build fails
```powershell
cd frontend

# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## ✅ Verification

### Test Backend

```powershell
# Health check
curl http://localhost:8000/health

# Expected output:
# {"status":"healthy","timestamp":"...","environment":"development",...}
```

### Test Frontend

Open browser: http://localhost:3000

You should see the support form.

### Test API

```powershell
# Submit support ticket
curl -X POST http://localhost:8000/api/v1/support/submit `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Issue",
    "category": "technical",
    "priority": "medium",
    "message": "This is a test message"
  }'

# Expected output:
# {"ticket_id":"...","message":"Thank you...","estimated_response_time":"..."}
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│         Customer Success FTE            │
├─────────────────────────────────────────┤
│                                         │
│  Frontend (Next.js 16)                  │
│  http://localhost:3000                  │
│                                         │
│  Backend (FastAPI + SQLModel)           │
│  http://localhost:8000                  │
│                                         │
│  Database (PostgreSQL + pgvector)       │
│  localhost:5432                         │
│                                         │
│  Streaming (Kafka)                      │
│  localhost:9092                         │
│                                         │
│  AI Agent (OpenRouter API)              │
│  gpt-4o                                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📚 Next Steps

1. ✅ **Setup Complete** - Services running
2. 📝 **Add OpenRouter API Key** - Edit `.env` file
3. 🧪 **Test Application** - Submit support ticket
4. 📊 **Monitor Logs** - Check for errors
5. 🚀 **Deploy to Production** - Follow deployment guide

---

## 🔗 Additional Resources

- [Full Setup Guide](SETUP-GUIDE.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Operations Runbook](docs/RUNBOOK.md)

---

**Need Help?** Check the troubleshooting section or view logs:
- Docker: `docker compose logs -f`
- Backend: `tail -f backend/logs/app.log`
- Frontend: Check browser console

**Happy Coding! 🎉**
