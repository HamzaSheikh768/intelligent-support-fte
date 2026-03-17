# Customer Success FTE - Setup Guide

**Version**: 1.0.0  
**Last Updated**: 2026-03-17  
**Status**: ✅ Complete & Ready

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Create Environment File

```powershell
# Navigate to project directory
cd "E:\Hackathon 5\CRM-Digital-FTE-Factory"

# Copy environment template
cp .env.example .env
```

### Step 2: Add Your API Key

Edit `.env` file and add your **OpenRouter API Key**:

```bash
# OpenRouter API Configuration
OPENROUTER_API_KEY=sk-or-your-actual-api-key-here
OPENROUTER_MODEL=gpt-4o

# Database Configuration
DATABASE_URL=postgresql+asyncpg://fte_user:fte_password@localhost:5432/fte_db
POSTGRES_USER=fte_user
POSTGRES_PASSWORD=fte_password
POSTGRES_DB=fte_db

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

> **Get OpenRouter API Key**: Visit https://openrouter.ai/keys

### Step 3: Start All Services

```powershell
# Start with Docker Compose
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Step 4: Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Web Support Form |
| **Backend API** | http://localhost:8000 | REST API |
| **API Docs** | http://localhost:8000/docs | Swagger UI |
| **Health Check** | http://localhost:8000/health | System Status |

---

## 📋 Prerequisites

Make sure you have these installed:

| Software | Version | Required | Purpose |
|----------|---------|----------|---------|
| **Docker Desktop** | 20.10+ | ✅ Yes | Container runtime |
| **Docker Compose** | 2.0+ | ✅ Yes | Orchestration |
| **Node.js** | 18+ | Optional | Frontend development |
| **Python** | 3.11 | Optional | Backend development |
| **Git** | Latest | Optional | Version control |

### Verify Installation

```powershell
# Check Docker
docker --version
docker compose version

# Check Node.js (optional)
node --version
npm --version

# Check Python (optional)
python --version
pip --version
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MULTI-CHANNEL INTAKE                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Gmail     │  │   WhatsApp   │  │   Web Form   │       │
│  │   (Email)    │  │  (Messaging) │  │  (Website)   │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                │
│         └─────────────────┼─────────────────┘                │
│                           ▼                                  │
│                  ┌─────────────────┐                         │
│                  │  FastAPI Backend│                         │
│                  │   (Port 8000)   │                         │
│                  └────────┬────────┘                         │
│                           │                                  │
│         ┌─────────────────┼─────────────────┐                │
│         ▼                 ▼                 ▼                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  PostgreSQL │  │    Kafka    │  │  OpenAI API │          │
│  │  (Database) │  │  (Streaming)│  │   (Agent)   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Development Mode

### Frontend Development

```powershell
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:3000
```

### Backend Development

```powershell
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Access at http://localhost:8000
```

### Database Only

```powershell
# Start only PostgreSQL
docker compose up -d postgres

# Connect to database
docker compose exec postgres psql -U fte_user -d fte_db
```

---

## 🧪 Testing

### Run Backend Tests

```powershell
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install test dependencies
pip install -r requirements.txt

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ -v --cov=src --cov-report=html
```

### Test API Endpoints

```powershell
# Health check
curl http://localhost:8000/health

# Submit support form
curl -X POST http://localhost:8000/api/v1/support/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Issue",
    "category": "technical",
    "priority": "medium",
    "message": "This is a test message"
  }'

# Get ticket status
curl http://localhost:8000/api/v1/support/ticket/{ticket_id}

# Get escalation reasons
curl http://localhost:8000/api/v1/escalations/reasons
```

---

## 📦 Project Structure

```
CRM-Digital-FTE-Factory/
├── backend/                    # FastAPI Backend
│   ├── src/
│   │   ├── agent/             # AI Agent (OpenAI SDK)
│   │   │   ├── customer_success_agent.py
│   │   │   ├── tools.py
│   │   │   ├── prompts.py
│   │   │   └── formatters.py
│   │   ├── api/               # API Routes
│   │   │   ├── v1/
│   │   │   └── routers.py
│   │   ├── channels/          # Channel Handlers
│   │   │   ├── gmail_handler.py
│   │   │   ├── whatsapp_handler.py
│   │   │   └── web_form_handler.py
│   │   ├── core/              # Core Config
│   │   │   ├── config.py
│   │   │   └── logging.py
│   │   ├── database/          # Database Layer
│   │   │   ├── models.py
│   │   │   ├── session.py
│   │   │   ├── customers.py
│   │   │   ├── tickets.py
│   │   │   ├── conversations.py
│   │   │   └── messages.py
│   │   ├── schemas/           # Pydantic Schemas
│   │   │   └── support.py
│   │   ├── utils/             # Utilities
│   │   │   ├── kafka_producer.py
│   │   │   └── openrouter_client.py
│   │   ├── workers/           # Background Workers
│   │   │   ├── message_processor.py
│   │   │   └── metrics_collector.py
│   │   └── main.py            # FastAPI App
│   ├── tests/                 # Test Suite
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pyproject.toml
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Next.js 16 App Router
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/        # React Components
│   │   │   ├── SupportForm.tsx
│   │   │   └── ui/            # shadcn/ui Components
│   │   └── lib/               # Utilities
│   │       └── validations.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── k8s/                        # Kubernetes Manifests
│   └── manifests.yaml
│
├── docs/                       # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── RUNBOOK.md
│   └── ENV-SETUP.md
│
├── specs/                      # Specifications
│   ├── 001-customer-success-fte/
│   └── 001-web-support-form/
│
├── docker-compose.yml          # Docker Orchestration
├── .env.example                # Environment Template
└── README.md                   # This File
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | ✅ Yes | - | OpenRouter API key |
| `OPENROUTER_MODEL` | No | `gpt-4o` | AI model to use |
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection string |
| `KAFKA_BOOTSTRAP_SERVERS` | ✅ Yes | - | Kafka bootstrap servers |
| `TWILIO_ACCOUNT_SID` | For WhatsApp | - | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | For WhatsApp | - | Twilio auth token |
| `TWILIO_WHATSAPP_NUMBER` | For WhatsApp | - | WhatsApp number |
| `ENVIRONMENT` | No | `development` | Environment name |
| `LOG_LEVEL` | No | `INFO` | Logging level |

### Database Schema

The system uses PostgreSQL with the following tables:

- **customers** - Customer information (email, phone, name)
- **tickets** - Support tickets with status tracking
- **conversations** - Conversation threads across channels
- **messages** - Individual messages in conversations
- **knowledge_base** - Product documentation for AI responses
- **agent_metrics** - Performance metrics
- **customer_identifiers** - Multi-channel customer identification

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Docker Desktop Not Starting

**Error**: `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`

**Solution**:
```powershell
# Start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait 30 seconds, then run
docker compose up -d
```

#### 2. Port Already in Use

**Error**: `Bind for 0.0.0.0:8000 failed: port is already occupied`

**Solution**:
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

#### 3. Database Connection Failed

**Error**: `could not connect to server: Connection refused`

**Solution**:
```powershell
# Check if postgres is running
docker compose ps postgres

# Restart postgres
docker compose restart postgres

# Check logs
docker compose logs postgres
```

#### 4. Frontend Build Fails

**Error**: `Module not found` or `Type error`

**Solution**:
```powershell
cd frontend

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### 5. Backend Import Errors

**Error**: `ModuleNotFoundError: No module named 'xxx'`

**Solution**:
```powershell
cd backend

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Or rebuild Docker
docker compose up -d --build backend
```

---

## 📊 Monitoring & Logs

### View Logs

```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
docker compose logs -f kafka

# Last 100 lines
docker compose logs --tail=100 backend
```

### Database Access

```powershell
# Connect to PostgreSQL
docker compose exec postgres psql -U fte_user -d fte_db

# Useful queries
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM tickets;
SELECT * FROM tickets ORDER BY created_at DESC LIMIT 10;
SELECT status, COUNT(*) FROM tickets GROUP BY status;
```

### Kafka Topics

```powershell
# List topics
docker compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Describe topic
docker compose exec kafka kafka-topics --bootstrap-server localhost:9092 --describe fte.tickets.incoming

# Consume messages
docker compose exec kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic fte.tickets.incoming --from-beginning
```

---

## 🚀 Deployment

### Local Development

```powershell
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Rebuild and restart
docker compose up -d --build

# Full reset (including database)
docker compose down -v
docker compose up -d
```

### Production (Kubernetes)

```bash
# Create namespace and secrets
kubectl apply -f k8s/manifests.yaml

# Create secrets
kubectl create secret generic fte-secrets \
  --from-literal=OPENROUTER_API_KEY=your-key \
  --from-literal=POSTGRES_PASSWORD=your-password \
  -n customer-success-fte

# Deploy
kubectl apply -f k8s/manifests.yaml

# Check status
kubectl get pods -n customer-success-fte
```

---

## 📚 Additional Resources

- **[API Documentation](docs/API.md)** - Complete API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment
- **[Operations Runbook](docs/RUNBOOK.md)** - Troubleshooting & monitoring
- **[Environment Setup](docs/ENV-SETUP.md)** - Detailed environment configuration

---

## ✅ Verification Checklist

Before going to production, verify:

- [ ] All services are running (`docker compose ps`)
- [ ] Health check passes (http://localhost:8000/health)
- [ ] Frontend loads (http://localhost:3000)
- [ ] API docs accessible (http://localhost:8000/docs)
- [ ] Database connected (check logs)
- [ ] OpenRouter API key configured
- [ ] Test ticket submission works
- [ ] Logs show no errors
- [ ] Backup strategy in place
- [ ] Monitoring configured

---

## 🎯 Next Steps

1. ✅ **Setup Complete** - All services running
2. 📝 **Configure API Key** - Add OpenRouter API key to `.env`
3. 🧪 **Test Application** - Submit test support ticket
4. 📊 **Monitor Logs** - Check for any errors
5. 🚀 **Deploy to Production** - Follow deployment guide

---

**Need Help?** Check the [troubleshooting section](#troubleshooting) or view detailed logs with `docker compose logs -f`.

**Happy Coding! 🎉**
