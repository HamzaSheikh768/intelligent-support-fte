# Customer Success FTE - Quick Start Guide

## Prerequisites

Make sure you have the following installed:

- **Node.js 18+**: [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Docker Desktop** (optional, for full stack)

---

## Quick Start (Frontend Only)

### Option 1: Using the Startup Script (Windows)

1. Double-click `start-frontend.bat`
2. Wait for dependencies to install
3. Frontend will start automatically at http://localhost:3000

### Option 2: Manual Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Access at: **http://localhost:3000**

---

## Full Stack (with Docker)

### Start All Services

```bash
# Copy environment file
cp .env.example .env

# Edit .env and add your OPENROUTER_API_KEY

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Access Services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |

---

## Test Form Submission

### 1. Via Web Interface

1. Open http://localhost:3000
2. Fill out the support form
3. Submit and verify ticket ID is shown

### 2. Via API (curl)

```bash
curl -X POST http://localhost:8000/api/v1/support/submit \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"test@example.com\",
    \"subject\": \"Test Subject\",
    \"category\": \"technical\",
    \"priority\": \"medium\",
    \"message\": \"This is a test message with more than 10 characters\"
  }"
```

Expected response:
```json
{
  "ticket_id": "uuid-here",
  "message": "Thank you for contacting us! Our AI assistant will respond shortly.",
  "estimated_response_time": "Usually within 5 minutes"
}
```

### 3. Via API Docs

1. Open http://localhost:8000/docs
2. Click on `POST /api/v1/support/submit`
3. Click "Try it out"
4. Fill in the form
5. Click "Execute"

---

## Troubleshooting

### Frontend Won't Start

**Error: Module not found**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error: Port 3000 already in use**
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in package.json
npm run dev -- -p 3001
```

### Backend Won't Start

**Error: Database connection failed**
```bash
# Make sure PostgreSQL is running
docker-compose up postgres

# Check database URL in .env
DATABASE_URL=postgresql+asyncpg://fte_user:fte_password@postgres:5432/fte_db
```

**Error: Module not found**
```bash
cd backend
pip install -r requirements.txt
```

### Docker Issues

**Containers won't start**
```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Start fresh
docker-compose up -d
```

**Check logs**
```bash
docker-compose logs -f
```

---

## Verify Installation

### Frontend Checklist

- [ ] http://localhost:3000 loads
- [ ] Support form is visible
- [ ] All form fields render correctly
- [ ] Form validation works (try submitting empty form)
- [ ] File upload shows preview for images
- [ ] Character counter shows for message field

### Backend Checklist

- [ ] http://localhost:8000/health returns healthy status
- [ ] http://localhost:8000/docs shows API documentation
- [ ] POST /api/v1/support/submit creates ticket
- [ ] GET /api/v1/support/ticket/{id} returns ticket status

### Database Checklist

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U fte_user -d fte_db

# List tables
\dt

# Should see:
# - customers
# - tickets
# - conversations
# - messages
# - knowledge_base
# - agent_metrics
```

---

## Next Steps

1. ✅ Frontend running at http://localhost:3000
2. ✅ Backend running at http://localhost:8000
3. ✅ Database initialized with schema

### What to Test Next

1. **Submit a support request**
   - Fill all required fields
   - Verify ticket ID is shown
   - Check success message

2. **Test file upload**
   - Upload an image (should show thumbnail)
   - Upload a PDF (should show file icon)
   - Try uploading 4 files (should show error)

3. **Test auto-save**
   - Start filling the form
   - Close browser tab
   - Reopen and verify draft is loaded

4. **Test validation**
   - Submit empty form (should show errors)
   - Enter invalid email (should show error)
   - Enter short message (should show error)

5. **Test accessibility**
   - Navigate with Tab key
   - Press Escape to close modal
   - Test with screen reader (optional)

---

## Development Commands

### Frontend

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npm run typecheck
```

### Backend

```bash
# Development server
uvicorn src.main:app --reload

# Production server
uvicorn src.main:app --host 0.0.0.0 --port 8000

# Run tests
pytest

# Run linter
ruff check src/

# Format code
black src/
```

### Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build

# Remove everything (including volumes)
docker-compose down -v
```

---

## Support

**Documentation**: See `docs/` folder  
**API Docs**: http://localhost:8000/docs  
**Issues**: Check `specs/001-web-support-form/IMPLEMENTATION-COMPLETE.md`

---

**Last Updated**: 2026-03-12  
**Version**: 1.0.0
