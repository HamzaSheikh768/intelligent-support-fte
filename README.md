# CRM Digital FTE Factory - Production Folder Structure

Complete production-ready folder structure for the Customer Success FTE project with all files, configurations, and the constitution.

```
crm-digital-fte-factory/
│
├── README.md                          # This file - Professional README with setup, architecture, deployment
├── .env.example                       # Environment variables template (all required env vars)
├── .gitignore                         # Git ignore patterns (node_modules, .env, __pycache__, .qwen, etc.)
├── docker-compose.yml                 # Full stack local dev (Backend + DB + Kafka + Redis)
├── turbo.json                         # Turborepo configuration (monorepo speed - parallel builds)
├── package.json                       # Root package.json (for Turborepo scripts)
│
├── .specify/                          # SpecKit Plus configuration and templates
│   ├── memory/
│   │   └── constitution.md            # ⭐ CUSTOMER SUCCESS FTE CONSTITUTION v1.0 (8 principles, governance)
│   ├── scripts/
│   │   └── powershell/                # PowerShell scripts for Windows automation
│   └── templates/
│       ├── adr-template.md            # Architecture Decision Record template
│       ├── agent-file-template.md     # Agent file template
│       ├── checklist-template.md      # Checklist template
│       ├── phr-template.prompt.md     # Prompt History Record template
│       ├── plan-template.md           # Implementation plan template
│       ├── spec-template.md           # Feature specification template
│       └── tasks-template.md          # Task list template
│
├── history/                           # Project history and records
│   ├── prompts/                       # Prompt History Records (PHRs)
│   │   ├── constitution/              # Constitution-related prompts
│   │   │   └── 001-customer-success-fte-constitution.constitution.prompt.md
│   │   ├── spec/                      # Specification-related prompts
│   │   ├── plan/                      # Planning-related prompts
│   │   └── general/                   # General prompts
│   └── adr/                           # Architecture Decision Records
│
├── context/                           # Incubation phase context documents
│   ├── company-profile.md             # TechCorp SaaS company details
│   ├── product-docs.md                # Product documentation (for knowledge base)
│   ├── sample-tickets.json            # 50+ sample customer inquiries (multi-channel)
│   ├── escalation-rules.md            # Detailed escalation criteria
│   └── brand-voice.md                 # Tone, style guidelines
│
├── specs/                             # Feature specifications
│   └── customer-success-fte/
│       ├── spec.md                    # Feature specification
│       ├── plan.md                    # Architecture plan
│       ├── tasks.md                   # Implementation tasks
│       └── research.md                # Research findings
│
# ====================== FRONTEND (Next.js 16 App Router + TypeScript) ======================
│
├── frontend/                          # ← Standalone, Embeddable Web Support Form
│   ├── app/
│   │   ├── globals.css                # Global styles (Tailwind imports)
│   │   ├── layout.tsx                 # Root layout (metadata, providers)
│   │   └── page.tsx                   # Main support form page (renders SupportForm component)
│   ├── components/
│   │   ├── SupportForm.tsx            # Professional form (React Hook Form + Zod validation)
│   │   ├── SuccessModal.tsx           # Success confirmation modal with ticket ID display
│   │   ├── TicketStatus.tsx           # Check ticket status component
│   │   └── EmbedScript.tsx            # For embedding form anywhere (iframe/script tag)
│   ├── lib/
│   │   └── api.ts                     # Typed API client (fetch wrapper with error handling)
│   ├── public/
│   │   └── favicon.ico                # App icon
│   ├── types/
│   │   └── index.ts                   # TypeScript type definitions (form types, API responses)
│   ├── next.config.mjs                # Next.js configuration (CORS, API endpoint)
│   ├── tailwind.config.ts             # Tailwind CSS configuration
│   ├── tsconfig.json                  # TypeScript configuration (strict mode, paths)
│   ├── package.json                   # Frontend dependencies (next, react, react-hook-form, zod)
│   ├── eslint.config.mjs              # ESLint configuration (Next.js recommended)
│   └── Dockerfile                     # Multi-stage build for Vercel/K8s (nginx serving)
│
# ====================== BACKEND (FastAPI + Python Professional Structure) ======================
│
├── backend/
│   ├── src/
│   │   ├── __init__.py                # Package marker
│   │   ├── main.py                    # FastAPI app (with CORS, rate-limit, Swagger, all routers)
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py              # Settings (pydantic-settings, env var loading)
│   │   │   ├── security.py            # Security utilities (encryption, hashing, JWT if needed)
│   │   │   └── logging.py             # Structured logging setup (JSON format, correlation IDs)
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   └── support.py         # /api/v1/support (web form endpoint, ticket status)
│   │   │   └── routers.py             # Router aggregation (include all version routers)
│   │   │
│   │   ├── agent/                     # ⭐ CUSTOMER SUCCESS FTE AGENT DEFINITION
│   │   │   ├── __init__.py
│   │   │   ├── customer_success_agent.py  # OpenAI Agents SDK definition (instructions, tools)
│   │   │   ├── tools.py               # All 5 @function_tool definitions (with Pydantic schemas)
│   │   │   ├── prompts.py             # System prompts (CUSTOMER_SUCCESS_SYSTEM_PROMPT constant)
│   │   │   └── formatters.py          # Channel-specific response formatting utilities
│   │   │
│   │   ├── channels/                  # Multi-channel intake handlers
│   │   │   ├── __init__.py
│   │   │   ├── gmail_handler.py       # Gmail integration (Pub/Sub webhook, send via Gmail API)
│   │   │   ├── whatsapp_handler.py    # Twilio WhatsApp integration (webhook, send message)
│   │   │   └── web_form_handler.py    # Web form API (POST /support/submit, GET /ticket/:id)
│   │   │
│   │   ├── workers/
│   │   │   ├── __init__.py
│   │   │   ├── message_processor.py   # Kafka consumer + agent runner (unified message processing)
│   │   │   └── metrics_collector.py   # Background metrics aggregation (publish to fte.metrics)
│   │   │
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── schema.sql             # PostgreSQL schema (8 tables: customers, conversations, etc.)
│   │   │   ├── models.py              # SQLModel / Pydantic models (ORM-like database access)
│   │   │   └── session.py             # Database session management (asyncpg connection pool)
│   │   │
│   │   ├── schemas/                   # Request/Response Pydantic models (API layer)
│   │   │   └── support.py             # SupportFormSubmission, SupportFormResponse, etc.
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── kafka_producer.py      # Kafka producer utilities (publish to topics)
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py                # Pytest fixtures (db, kafka, client, mock agents)
│   │   ├── test_agent.py              # Agent unit tests (tool calls, escalation logic)
│   │   ├── test_support_form.py       # Web form tests (validation, submission, status)
│   │   ├── test_channels.py           # Channel handler tests (gmail, whatsapp, web)
│   │   ├── test_multichannel_e2e.py   # End-to-end multi-channel tests (cross-channel continuity)
│   │   └── load_test.py               # Locust load test (simulate 100+ concurrent users)
│   │
│   ├── alembic/                       # Database migrations (professional schema evolution)
│   │   ├── versions/                  # Migration scripts (auto-generated)
│   │   ├── env.py                     # Alembic environment config
│   │   └── script.py.mako             # Migration template
│   │
│   ├── requirements.txt               # Python dependencies (fastapi, openai, sqlmodel, aiokafka, etc.)
│   ├── Dockerfile                     # Multi-stage build (python:3.11-slim, uvicorn, gunicorn)
│   ├── pyproject.toml                 # Ruff + Black + mypy configuration
│   └── .env.example                   # Backend env vars (OPENROUTER_API_KEY, DATABASE_URL, KAFKA_URL, etc.)
│
# ====================== KUBERNETES DEPLOYMENT ======================
│
├── k8s/                               # Professional Kubernetes manifests
│   ├── namespace.yaml                 # customer-success-fte namespace with labels
│   ├── configmap.yaml                 # ConfigMap (ENVIRONMENT, LOG_LEVEL, KAFKA_URL, channel configs)
│   ├── secrets.yaml                   # Secrets (OPENROUTER_API_KEY, DB password, Gmail/Twilio credentials)
│   ├── backend-deployment.yaml        # API deployment (3 replicas, health checks, resource limits)
│   ├── backend-service.yaml           # API service (ClusterIP, port 8000)
│   ├── worker-deployment.yaml         # Message processor deployment (3 replicas, Kafka consumer)
│   ├── frontend-deployment.yaml       # Frontend deployment (optional, if hosting on K8s)
│   ├── hpa-api.yaml                   # HorizontalPodAutoscaler for API (3-20 replicas, 70% CPU)
│   ├── hpa-worker.yaml                # HorizontalPodAutoscaler for Worker (3-30 replicas, 70% CPU)
│   ├── ingress.yaml                   # Ingress (nginx, SSL via cert-manager, support-api.yourdomain.com)
│   └── configmap-kafka.yaml           # Kafka-specific configs (topics, consumer groups)
│
# ====================== CI/CD PIPELINES ======================
│
├── .github/
│   └── workflows/
│       ├── ci-backend.yml             # FastAPI tests + Docker build (pytest, ruff, mypy, docker build)
│       ├── ci-frontend.yml            # Next.js build + lint (npm install, npm run build, eslint)
│       └── cd-deploy.yml              # Deploy to K8s / Vercel (kubectl apply, helm upgrade, or Vercel CLI)
│
# ====================== DOCUMENTATION ======================
│
├── docs/
│   ├── ARCHITECTURE.md                # System architecture (multi-channel diagram, component descriptions)
│   ├── API.md                         # API documentation (endpoints, request/response schemas, examples)
│   ├── DEPLOYMENT.md                  # Deployment guide (local dev, K8s, cloud deployment steps)
│   ├── RUNBOOK.md                     # Incident response (common issues, escalation procedures, on-call)
│   └── CONSTITUTION-GUIDE.md          # Guide to using the constitution in development
│
# ====================== QWEN CODE CONFIGURATION ======================
│
├── .qwen/                             # Qwen Code agent configuration
│   ├── agents/                        # Custom agent definitions
│   ├── commands/                      # Custom commands (sp.* commands)
│   │   ├── sp.constitution.md         # Constitution command
│   │   ├── sp.plan.md                 # Plan command
│   │   ├── sp.tasks.md                # Tasks command
│   │   └── sp.phr.md                  # PHR command
│   ├── hooks/                         # Event hooks
│   └── README.md                      # Qwen Code setup guide
│
└── AGENTS.md                          # Production Custom Agent Definitions (Customer Success FTE agent)
```

---

## Constitution File Location

The **Customer Success FTE Constitution** is located at:

```
.specify/memory/constitution.md
```

This file contains:
- **8 Core Principles**: Multi-Channel First, Ticket-Tracking Mandatory, Escalation-Aware, Knowledge-Grounded, Channel-Adaptive Response, Security & Privacy Non-Negotiable, Observability & Metrics, 24/7 Operational Readiness
- **Additional Constraints**: Technology stack, performance budgets, compliance standards
- **Development Workflow**: Code quality gates, testing requirements, deployment process
- **Governance**: Amendment process, versioning policy, compliance review

## Quick Start

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd crm-digital-fte-factory

# Start the full stack (Backend + PostgreSQL + Kafka)
docker-compose up -d

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && pip install -r requirements.txt

# Run the frontend (development)
npm run dev

# Run the backend (development)
uvicorn src.main:app --reload
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Key Files Reference

| File | Purpose |
| :---- | :---- |
| `.specify/memory/constitution.md` | ⭐ Customer Success FTE Constitution (8 principles, governance) |
| `backend/src/agent/customer_success_agent.py` | Agent definition (OpenAI Agents SDK) |
| `backend/src/agent/tools.py` | 5 function tools (create_ticket, send_response, etc.) |
| `backend/src/agent/prompts.py` | System prompt (CUSTOMER_SUCCESS_SYSTEM_PROMPT) |
| `backend/src/channels/` | Multi-channel handlers (Gmail, WhatsApp, Web Form) |
| `backend/src/workers/message_processor.py` | Kafka consumer + agent runner |
| `frontend/components/SupportForm.tsx` | Web Support Form (required build) |
| `k8s/` | Kubernetes deployment manifests |

## Constitution Principles Summary

1. **Multi-Channel First**: Unify customer identity across Email, WhatsApp, Web Form
2. **Ticket-Tracking Mandatory**: ALWAYS create ticket before any response
3. **Escalation-Aware**: Detect triggers and escalate appropriately
4. **Knowledge-Grounded**: ALL responses grounded in knowledge base
5. **Channel-Adaptive Response**: Format for Email (500w), WhatsApp (300c), Web (300w)
6. **Security & Privacy Non-Negotiable**: Verify identity, encrypt data, comply with regulations
7. **Observability & Metrics**: Log all interactions, track performance per channel
8. **24/7 Operational Readiness**: 99.9% uptime, Kubernetes auto-scaling

## Next Steps

1. Read the Constitution: `.specify/memory/constitution.md`
2. Review Architecture: `docs/ARCHITECTURE.md`
3. Setup Local Dev: Follow docker-compose setup above
4. Deploy to K8s: Follow `docs/DEPLOYMENT.md`

---

**Version**: 1.0.0 | **Constitution**: v1.0 | **Status**: Production-Ready
