# Implementation Plan: Customer Success FTE

**Branch**: `001-customer-success-fte` | **Date**: 2026-03-12 | **Spec**: [specs/customer-success-fte-spec.md](../specs/customer-success-fte-spec.md)

**Input**: Customer Success FTE specification from `/specs/customer-success-fte-spec.md`

---

## Summary

Build a production-grade, 24/7 Customer Success Digital FTE that autonomously handles customer support inquiries across Email (Gmail), WhatsApp, and Web Form channels. The system uses OpenAI Agents SDK for intelligence, PostgreSQL for CRM/ticket management, Kafka for event streaming, and Kubernetes for deployment with auto-scaling.

**Primary Requirement**: Replace human support agents for routine inquiries (60% of tickets) while maintaining brand voice, appropriate escalation, and 24/7 availability.

**Technical Approach**: 
- Backend: FastAPI + Python 3.11 + OpenAI Agents SDK
- Frontend: Next.js 16 App Router + TypeScript + shadcn/ui
- Database: PostgreSQL 16 + pgvector for semantic search
- Streaming: Apache Kafka for event processing
- Deployment: Kubernetes with HPA for auto-scaling

---

## Technical Context

**Language/Version**: 
- Backend: Python 3.11+
- Frontend: TypeScript 5.3+ (Next.js 16)

**Primary Dependencies**:
- Backend: FastAPI v0.135.1, OpenAI Agents SDK v0.12.0, SQLModel v0.0.22, asyncpg v0.31.0, aiokafka v0.13.0
- Frontend: Next.js 16, React 18, React Hook Form v7, Zod v3, shadcn/ui components
- Database: PostgreSQL 16 with pgvector extension
- Infrastructure: Kafka, Kubernetes, Docker

**Storage**: 
- PostgreSQL 16 (CRM/ticket management with 8 tables)
- Vector embeddings for knowledge base semantic search

**Testing**: 
- Backend: pytest + pytest-asyncio
- Frontend: Vitest + @testing-library/react
- E2E: Multi-channel integration tests

**Target Platform**: 
- Cloud-native (AWS/GCP/Azure compatible)
- Local development with Docker Compose
- Production deployment on Kubernetes

**Project Type**: Full-stack web application (frontend + backend + infrastructure)

**Performance Goals**:
- Response time: < 3 seconds processing, < 30 seconds delivery
- Throughput: 1000+ concurrent conversations
- Accuracy: > 85% on test set
- Escalation rate: < 20%
- Uptime: 99.9%

**Constraints**:
- Budget: <$1,000/year operating cost
- Solo developer (hackathon timeline: 48-72 hours)
- Must build Web Support Form UI (required deliverable)
- PostgreSQL schema IS the CRM (no external CRM integration)

**Scale/Scope**:
- 500+ tickets/day initial volume
- 12,000+ customer base
- 3 channels (Email, WhatsApp, Web Form)
- 24/7 autonomous operation

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Constitution Principle Compliance

| Principle | Compliance Status | Evidence |
|-----------|------------------|----------|
| **I. Multi-Channel First** | ✅ PASS | Architecture supports 3 channels with unified customer identity |
| **II. Ticket-Tracking Mandatory** | ✅ PASS | All interactions create tickets with full metadata |
| **III. Escalation-Aware** | ✅ PASS | 8 escalation trigger categories defined |
| **IV. Knowledge-Grounded** | ✅ PASS | Semantic search with pgvector, no speculation |
| **V. Channel-Adaptive Response** | ✅ PASS | Response formatters for Email/WhatsApp/Web |
| **VI. Security & Privacy Non-Negotiable** | ✅ PASS | Authentication, encryption, least privilege |
| **VII. Observability & Metrics** | ✅ PASS | Structured logging, Kafka metrics streaming |
| **VIII. 24/7 Operational Readiness** | ✅ PASS | Kubernetes with HPA, 99.9% uptime target |

**GATE Status**: ✅ **PASS** - All constitution principles satisfied

**No violations requiring justification**

---

## Project Structure

### Documentation (this feature)

```text
specs/001-customer-success-fte/
├── plan.md              # This file
├── research.md          # Phase 0: Technical decisions
├── data-model.md        # Phase 1: Database schema
├── quickstart.md        # Phase 1: Setup guide
├── contracts/           # Phase 1: API specifications
│   ├── openapi.yaml
│   └── webhook-schemas.md
└── tasks.md             # Phase 2: Implementation tasks (created by /sp.tasks)
```

### Source Code (repository root)

```text
crm-digital-fte-factory/
├── backend/
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── logging.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   └── support.py
│   │   │   └── routers.py
│   │   ├── agent/
│   │   │   ├── customer_success_agent.py
│   │   │   ├── tools.py
│   │   │   ├── prompts.py
│   │   │   └── formatters.py
│   │   ├── channels/
│   │   │   ├── gmail_handler.py
│   │   │   ├── whatsapp_handler.py
│   │   │   └── web_form_handler.py
│   │   ├── workers/
│   │   │   ├── message_processor.py
│   │   │   └── metrics_collector.py
│   │   ├── database/
│   │   │   ├── schema.sql
│   │   │   ├── models.py
│   │   │   └── session.py
│   │   ├── schemas/
│   │   │   └── support.py
│   │   └── utils/
│   │       └── kafka_producer.py
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_agent.py
│   │   └── test_support_form.py
│   ├── alembic/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── SupportForm.tsx
│   │   ├── SuccessModal.tsx
│   │   └── EmbedScript.tsx
│   ├── lib/
│   │   └── api.ts
│   ├── public/
│   │   └── favicon.ico
│   ├── types/
│   │   └── index.ts
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── eslint.config.mjs
│   └── Dockerfile
│
├── k8s/
│   ├── namespace.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── hpa.yaml
│   ├── ingress.yaml
│   └── configmap-kafka.yaml
│
├── .github/workflows/
│   ├── ci-backend.yml
│   ├── ci-frontend.yml
│   └── cd-deploy.yml
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── context/
│   ├── company-profile.md
│   ├── product-docs.md
│   ├── sample-tickets.json
│   ├── escalation-rules.md
│   └── brand-voice.md
│
├── docker-compose.yml
├── .env.example
├── turbo.json
└── README.md
```

**Structure Decision**: Monorepo structure with separate `backend/` and `frontend/` directories, shared infrastructure in `k8s/` and root. This matches the hackathon requirements and enables independent scaling of frontend and backend.

---

## Phase 0: Research & Technical Decisions

### Research Tasks

1. **OpenAI Agents SDK Best Practices**
   - Research agent lifecycle management
   - Tool definition patterns with Pydantic
   - Streaming vs non-streaming responses

2. **PostgreSQL + pgvector for Semantic Search**
   - Vector embedding generation (OpenAI embeddings vs alternatives)
   - Index configuration (ivfflat, HNSW)
   - Query performance optimization

3. **Kafka Event Streaming Patterns**
   - Topic design for multi-channel intake
   - Consumer group configuration
   - Error handling and dead letter queues

4. **Kubernetes Auto-Scaling**
   - HPA configuration for API and workers
   - Resource requests/limits estimation
   - Health check endpoints

5. **Gmail API + Pub/Sub Integration**
   - Push notification setup
   - Rate limiting and quotas
   - Security (OAuth2, service accounts)

6. **Twilio WhatsApp API**
   - Webhook validation
   - Message formatting limits
   - Cost optimization

### Research Output: `research.md`

*(To be created with decisions, rationale, and alternatives for each research task)*

---

## Phase 1: Design & Contracts

### Data Model Design

**Entities from Specification**:

1. **Customer**
   - Fields: id (UUID), email, phone, name, created_at, metadata
   - Relationships: tickets (1:N), conversations (1:N)
   - Validation: email OR phone required, unique email

2. **Ticket**
   - Fields: id (UUID), customer_id, conversation_id, source_channel, category, priority, status, created_at, resolved_at, resolution_notes
   - Relationships: customer (N:1), conversation (N:1), messages (1:N)
   - Validation: source_channel enum, status enum, priority enum

3. **Conversation**
   - Fields: id (UUID), customer_id, initial_channel, started_at, ended_at, status, sentiment_score, resolution_type, escalated_to, metadata
   - Relationships: customer (N:1), ticket (1:1), messages (1:N)
   - Validation: initial_channel enum, status enum

4. **Message**
   - Fields: id (UUID), conversation_id, ticket_id, channel, direction, role, content, created_at, tokens_used, latency_ms, tool_calls, channel_message_id, delivery_status
   - Relationships: conversation (N:1), ticket (N:1)
   - Validation: direction enum, role enum, channel enum

5. **KnowledgeBase**
   - Fields: id (UUID), title, content, category, embedding (vector), created_at, updated_at
   - Validation: embedding dimension (1536 for OpenAI)

6. **AgentMetrics**
   - Fields: id (UUID), metric_name, metric_value, channel, dimensions (JSON), recorded_at
   - Validation: metric_name enum

**Output**: `data-model.md` with complete schema, indexes, and relationships

---

### API Contracts

**Endpoints from Functional Requirements**:

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/v1/support/submit` | POST | Submit support form | None (public) |
| `/api/v1/support/ticket/:id` | GET | Get ticket status | None (public) |
| `/api/v1/customers/lookup` | GET | Look up customer | API key |
| `/api/v1/knowledge/search` | GET | Search knowledge base | API key |
| `/api/v1/escalations` | POST | Create escalation | API key |
| `/health` | GET | Health check | None (public) |
| `/webhooks/gmail` | POST | Gmail webhook | Signature |
| `/webhooks/whatsapp` | POST | WhatsApp webhook | Twilio signature |

**Output**: `contracts/openapi.yaml` with complete OpenAPI 3.0 specification

---

### Quickstart Guide

**Output**: `quickstart.md` with:
- Prerequisites checklist
- Local development setup (Docker Compose)
- Environment variable configuration
- First-time run instructions
- Troubleshooting common issues

---

## Constitution Check (Post-Design)

*Re-evaluate after Phase 1 design complete*

### Re-evaluation Status

| Principle | Still Compliant? | Changes Impacting |
|-----------|------------------|-------------------|
| I. Multi-Channel First | ✅ YES | Schema supports all 3 channels |
| II. Ticket-Tracking Mandatory | ✅ YES | All endpoints create tickets |
| III. Escalation-Aware | ✅ YES | Escalation endpoint + triggers |
| IV. Knowledge-Grounded | ✅ YES | pgvector semantic search |
| V. Channel-Adaptive Response | ✅ YES | Formatters per channel |
| VI. Security & Privacy | ✅ YES | Auth, encryption, validation |
| VII. Observability | ✅ YES | Logging + metrics endpoints |
| VIII. 24/7 Readiness | ✅ YES | K8s + HPA configuration |

**GATE Status**: ✅ **PASS** - Design maintains constitution compliance

---

## Complexity Tracking

*No violations requiring justification - all complexity is justified by requirements*

---

## Next Steps

1. ✅ Phase 0: Complete `research.md` with technical decisions
2. ✅ Phase 1: Create `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`
3. ✅ Phase 1: Update agent context files
4. ⏳ Phase 2: Run `/sp.tasks` to generate implementation tasks
5. ⏳ Phase 3: Begin implementation with `/sp.implement`

---

**Branch**: `001-customer-success-fte`  
**Plan Created**: 2026-03-12  
**Ready for**: Phase 0 research execution

---

## Appendix: Hackathon Timeline Alignment

| Phase | Hackathon Hours | Deliverables |
|-------|-----------------|--------------|
| Phase 0: Research | Hours 1-4 | research.md |
| Phase 1: Design | Hours 5-12 | data-model.md, contracts/, quickstart.md |
| Phase 2: Tasks | Hours 13-16 | tasks.md |
| Phase 3: Implementation | Hours 17-48 | Complete codebase |
| Phase 4: Testing | Hours 49-60 | Test suite, E2E tests |
| Phase 5: Deployment | Hours 61-72 | K8s deployment, docs |

**Critical Path**: Web Support Form → Backend API → Agent → One Channel → Second Channel → Kafka → K8s

---

**Last Updated**: 2026-03-12  
**Version**: 1.0.0  
**Status**: Ready for Phase 0 Research
