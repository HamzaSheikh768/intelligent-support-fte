# The CRM Digital FTE Factory – Hackathon 5 Execution Plan

**Author:** Hamza  
**Start:** March 13, 2026 10:00 PKT  
**Target finish:** March 16, 2026 23:00 PKT  
**Total planned hours:** ~58 hours  
**Risk level:** 🔴 **High** (multi-channel + infra + solo dev)

---

## 1. Success Criteria (Must-Have to Score >85/100)

**Priority Order** (non-negotiable):

1. ☑ **Web Support Form** — Complete UI + validation + submission to API (10 pts)
2. ☑ **PostgreSQL Schema** — 8 tables with proper relationships + pgvector (5 pts)
3. ☑ **OpenAI Agent** — 5 core tools working (create_ticket, send_response, search_kb, get_history, escalate) (10 pts)
4. ☑ **One Channel End-to-End** — Web form → API → Agent → Response (10 pts)
5. ☑ **FastAPI Backend** — CORS, rate-limit, Swagger docs, health checks (5 pts)
6. ☑ **Second Channel** — WhatsApp OR Gmail working (10 pts)
7. ☑ **Kafka Event Streaming** — Topics defined, producer/consumer working (5 pts)
8. ☑ **Kubernetes Manifests** — Deployments, services, HPA, ingress (5 pts)
9. ☑ **E2E Tests** — Multi-channel test suite passing (5 pts)
10. ☑ **Documentation** — README, API docs, deployment guide (5 pts)

**Total Possible:** 70 points base + 30 points (innovation, CX, evolution) = **100**

---

## 2. Time Budget & Phase Breakdown

### Phase 0: Setup & Research (4h) ⚙️
**When:** Fri 10:00 – 14:00 PKT

**Must-Have Outcomes:**
- ☐ All accounts created (OpenAI, Twilio, Google Cloud, Vercel/Neon)
- ☐ Local dev environment ready (Docker, Node 18, Python 3.11, PostgreSQL)
- ☐ Repository structure created
- ☐ Requirement document analyzed + spec reviewed

**Nice-to-Have:**
- ☐ Twilio WhatsApp sandbox joined
- ☐ Gmail API credentials downloaded

**Risk Level:** 🟢 Low

---

### Phase 1: Incubation / Claude Prototyping (14h) 🧪
**When:** Fri 15:00 – 23:00 PKT (with breaks)

**Must-Have Outcomes:**
- ☐ Working prototype handling web form queries
- ☐ MCP server with 5 tools exposed
- ☐ Discovery log with requirements found
- ☐ Edge cases documented (10+ scenarios)
- ☐ Escalation rules crystallized
- ☐ Channel-specific response templates discovered

**Nice-to-Have:**
- ☐ Gmail webhook prototype
- ☐ WhatsApp webhook prototype

**Risk Level:** 🟡 Medium (can get stuck in exploration loop)

**⏰ Time Box:** HARD STOP at 23:00 — move to Phase 2 even if incomplete

---

### Phase 2: Transition + Specs Crystallization (5h) 📝
**When:** Sat 09:00 – 14:00 PKT

**Must-Have Outcomes:**
- ☐ `specs/customer-success-fte-spec.md` completed
- ☐ Prompts extracted to `backend/src/agent/prompts.py`
- ☐ MCP tools converted to @function_tool with Pydantic schemas
- ☐ Transition test suite created (6+ tests)
- ☐ Production folder structure created

**Nice-to-Have:**
- ☐ All transition tests passing
- ☐ Error handling added to all tools

**Risk Level:** 🟡 Medium (documentation can expand infinitely)

**⏰ Time Box:** HARD STOP at 14:00 — move to Phase 3

---

### Phase 3: Core Backend + Database + Agent (18h) 🔧
**When:** Sat 15:00 – Sun 02:00 PKT (with sleep 02:00–07:00)

**Must-Have Outcomes:**
- ☐ PostgreSQL schema deployed (8 tables + indexes)
- ☐ SQLModel models for all entities
- ☐ FastAPI app with CORS, health check, /docs
- ☐ OpenAI Agents SDK implementation
- ☐ 5 function tools working (search_kb, create_ticket, get_history, escalate, send_response)
- ☐ Customer success agent with channel-aware instructions
- ☐ Database migrations with Alembic

**Nice-to-Have:**
- ☐ Vector search with pgvector
- ☐ Structured logging
- ☐ Rate limiting middleware

**Risk Level:** 🔴 High (database + agent integration complexity)

**⏰ Critical Path:** This phase blocks ALL subsequent work

---

### Phase 4: Channel Integrations + Web Form (16h) 🌐
**When:** Sun 09:00 – 23:00 PKT

**Must-Have Outcomes:**
- ☐ **Web Support Form** — Complete React component with validation
- ☐ **Web Form API** — POST /api/v1/support/submit + GET /ticket/:id
- ☐ **WhatsApp Handler** — Twilio webhook + send message
- ☐ **Unified Message Processor** — Kafka consumer + agent runner
- ☐ **Channel Response Formatting** — Email/WhatsApp/Web formatters

**Nice-to-Have:**
- ☐ Gmail handler with Pub/Sub
- ☐ File upload handling
- ☐ Embed script for web form

**Risk Level:** 🔴 High (frontend + multiple integrations)

**⏰ Priority:** Web Form FIRST (10 pts), WhatsApp SECOND (10 pts), Gmail OPTIONAL (5 pts)

---

### Phase 5: Kafka + FastAPI + Deployment (10h) 🚀
**When:** Mon 09:00 – 19:00 PKT

**Must-Have Outcomes:**
- ☐ Kafka topics defined + producer/consumer working
- ☐ Event streaming for tickets.incoming, escalations, metrics
- ☐ Kubernetes namespace + configmap + secrets
- ☐ Backend deployment (3 replicas, health checks, HPA)
- ☐ Worker deployment (Kafka consumer)
- ☐ Service + Ingress configured

**Nice-to-Have:**
- ☐ Frontend deployment on K8s
- ☐ SSL certificates via cert-manager
- ☐ Monitoring stack (Prometheus + Grafana)

**Risk Level:** 🟡 Medium (K8s YAML hell but well-documented)

**⏰ Time Box:** HARD STOP at 19:00 — move to Phase 6

---

### Phase 6: Testing + Polish + Documentation (8h) ✨
**When:** Mon 19:00 – 03:00 PKT (Tue)

**Must-Have Outcomes:**
- ☐ Multi-channel E2E tests passing (10+ tests)
- ☐ Load test results documented (100+ concurrent users)
- ☐ README.md with setup instructions
- ☐ API documentation complete
- ☐ Deployment guide written
- ☐ Runbook for incidents

**Nice-to-Have:**
- ☐ 24-hour chaos test simulation (documented)
- ☐ Performance optimization
- ☐ UI polish + animations

**Risk Level:** 🟢 Low (straightforward work)

**⏰ Final Push:** Last 2 hours for submission prep

---

## 3. Ruthless Prioritization Cheat Sheet

**Implement in THIS Order** — Cut from bottom if running out of time:

| Priority | Component | Points | Hours | Cut If Behind By |
|----------|-----------|--------|-------|------------------|
| **P0** | Web Support Form (full UI + API) | 10 | 8h | Never cut |
| **P0** | PostgreSQL Schema + CRUD | 5 | 4h | Never cut |
| **P0** | OpenAI Agent (5 tools) | 10 | 6h | Never cut |
| **P1** | Unified Message Processor | 5 | 4h | 12h behind |
| **P1** | Web Form End-to-End | 10 | 6h | 12h behind |
| **P2** | WhatsApp Channel | 10 | 6h | 18h behind |
| **P3** | Kafka Streaming | 5 | 4h | 24h behind |
| **P3** | Kubernetes Manifests | 5 | 4h | 24h behind |
| **P4** | Gmail Channel | 5 | 6h | 30h behind |
| **P4** | E2E Tests | 5 | 4h | 30h behind |
| **P4** | Documentation | 5 | 3h | 35h behind |

**🔥 If Behind by >8 Hours:**
1. Skip Gmail entirely (focus on Web + WhatsApp)
2. Reduce E2E tests to 5 critical paths only
3. Use managed Kafka (Confluent Cloud free tier) instead of self-hosted
4. Skip Kubernetes — deploy to Vercel (frontend) + Railway/Render (backend)
5. Skip file upload in web form

---

## 4. Daily Schedule Template (Karachi PKT)

### Day 1 (Friday) — Setup + Incubation
```
☀️  10:00 – 14:00  Phase 0: Setup & Research (4h)
                   - Accounts, environment, repo setup
                   - Read requirement doc thoroughly

🌙  15:00 – 19:00  Phase 1: Claude Prototyping (4h)
                   - Explore with Claude Code
                   - Build basic prototype

🌙  21:00 – 02:00  Phase 1: Claude Prototyping (5h)
                   - MCP server with tools
                   - Discovery log
                   - HARD STOP at 02:00
```

**Sleep:** 02:00 – 07:00 PKT (5h) 😴

### Day 2 (Saturday) — Transition + Backend Core
```
☀️  09:00 – 14:00  Phase 2: Transition + Specs (5h)
                   - Crystallize requirements
                   - Extract prompts
                   - Convert tools

🌙  15:00 – 02:00  Phase 3: Backend Core (9h)
                   - PostgreSQL schema
                   - FastAPI setup
                   - Agent implementation

🌙  Break every 90 min, dinner 21:00–22:00
```

**Sleep:** 02:00 – 07:00 PKT (5h) 😴

### Day 3 (Sunday) — Channels + Web Form
```
☀️  09:00 – 14:00  Phase 4: Web Form (5h)
                   - React component
                   - Validation + Zod
                   - API integration

🌙  15:00 – 23:00  Phase 4: Channels (8h)
                   - WhatsApp handler
                   - Message processor
                   - Response formatting

🌙  HARD STOP at 23:00
```

**Sleep:** 23:00 – 07:00 PKT (8h) 😴

### Day 4 (Monday) — Deployment + Testing
```
☀️  09:00 – 14:00  Phase 5: Kafka + K8s (5h)
                   - Kafka topics + streaming
                   - Kubernetes manifests

🌙  15:00 – 19:00  Phase 5: Deployment (4h)
                   - Deploy to K8s or cloud
                   - Health checks passing

🌙  19:00 – 03:00  Phase 6: Testing + Docs (8h)
                   - E2E tests
                   - Documentation
                   - Final polish
                   - SUBMISSION PREP
```

**Submit by:** Tue 03:00 PKT (buffer until 23:59)

---

## 5. Tools / Accounts / Setup Checklist

### Before Coding Starts (Complete ALL):

**Accounts:**
- ☐ OpenAI Platform (API key with GPT-4o access)
- ☐ Twilio (WhatsApp sandbox enabled)
- ☐ Google Cloud (Gmail API enabled, OAuth credentials)
- ☐ Neon/Supabase (PostgreSQL with pgvector)
- ☐ Vercel (frontend hosting)
- ☐ Railway/Render (backend hosting)
- ☐ Confluent Cloud (Kafka — free tier) OR local Docker

**Local Development:**
- ☐ Docker Desktop installed + running
- ☐ Node.js 18+ installed (`node -v`)
- ☐ Python 3.11+ installed (`python --version`)
- ☐ PostgreSQL client tools (psql)
- ☐ kubectl installed
- ☐ VS Code with extensions (Python, ESLint, Prettier)

**Repository:**
- ☐ Git initialized
- ☐ `.env.example` created
- ☐ `docker-compose.yml` working
- ☐ README.md with setup instructions

**Test All Credentials:**
```bash
# Test OpenAI
curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Twilio (check sandbox)
# Test PostgreSQL connection
# Test Kafka connection
```

---

## 6. Major Technical Decisions (Lock In Early)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Frontend Framework** | Next.js 16 App Router | Hackathon requirement, modern patterns |
| **UI Components** | shadcn/ui + Tailwind v4 | Fast development, accessible, professional |
| **Form Handling** | React Hook Form + Zod | Best-in-class validation, type-safe |
| **Backend Framework** | FastAPI + Python 3.11 | Async support, auto Swagger docs, type hints |
| **ORM** | SQLModel | Pydantic integration, async support |
| **Database** | PostgreSQL 16 + pgvector | Required by hackathon, vector search for KB |
| **Agent SDK** | OpenAI Agents SDK | Hackathon requirement, production-ready |
| **Knowledge Search** | pgvector cosine similarity | Semantic search, better than keyword |
| **WhatsApp** | Twilio Sandbox | Free for development, easy setup |
| **Gmail** | Gmail API + Pub/Sub | Official Google method |
| **Kafka** | Docker (local) → Confluent Cloud (prod) | Local dev easy, cloud for deployment |
| **Kubernetes** | Minikube (local) → Cloud K8s | Local testing, cloud deployment |
| **Deployment** | Vercel (FE) + Railway (BE) | Fastest deployment, free tiers |
| **Monitoring** | Structured logging + custom metrics | Hackathon requirement, lightweight |

**🔒 No Second-Guessing:** These are locked. Change ONLY if blocker found.

---

## 7. Risk Register & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **OpenAI API rate limits** | Medium | 🔴 High | Implement client-side rate limiting, use caching |
| **Twilio WhatsApp not working** | Low | 🔴 High | Fallback to email channel, document issue |
| **Kafka connection issues** | Medium | 🟡 Medium | Use Confluent Cloud instead of local, simplify to direct DB writes |
| **PostgreSQL pgvector not available** | Low | 🟡 Medium | Fallback to keyword search with tsvector |
| **Kubernetes deployment fails** | Medium | 🟡 Medium | Deploy to Railway/Vercel instead, document K8s manifests as "ready" |
| **Web form validation bugs** | High | 🟢 Low | Extensive testing, simplify validation rules |
| **Agent gives wrong responses** | Medium | 🔴 High | Improve system prompt, add more guardrails, test with sample tickets |
| **Running out of time** | 🔴 High | 🔴 High | Follow prioritization cheat sheet, cut P3/P4 features |
| **Sleep deprivation** | High | 🟡 Medium | Enforce 02:00–07:00 sleep schedule, no all-nighters |
| **Internet/power outage** | Low | 🟡 Medium | Backup hotspot, work from café if needed |

**🚨 Emergency Protocol:**
If 2+ 🔴 risks materialize → **IMMEDIATELY** cut scope to P0 + P1 only

---

## 8. Cut Scope Plan (If Behind by >8 Hours)

**Sacrifice in This Order** (lowest business value first):

### Behind by 8 Hours:
1. ❌ Skip Gmail channel entirely (focus on Web + WhatsApp)
2. ❌ Reduce E2E tests from 10 to 5 critical paths
3. ❌ Skip file upload in web form
4. ❌ Use managed services (Confluent Cloud, Neon) instead of Docker

### Behind by 16 Hours:
5. ❌ Skip WhatsApp — Web Form only (still 20/30 channel points)
6. ❌ Skip Kubernetes — deploy to Railway + Vercel
7. ❌ Skip Kafka — direct DB writes (document as "simplified for MVP")

### Behind by 24 Hours (EMERGENCY):
8. ❌ Skip agent memory/history (stateless responses only)
9. ❌ Skip dark mode + advanced UI polish
10. ❌ Skip load testing — basic functionality only

**🔥 Nuclear Option (Behind by 30+ Hours):**
- Web Form + FastAPI + PostgreSQL + Basic Agent (no channels, no K8s, no Kafka)
- Submit with clear documentation of what would be added with more time
- Focus on quality of what IS working over quantity of broken features

---

## 9. Final 6-Hour Sprint Checklist (Last Push)

**Start:** Mon 21:00 PKT | **End:** Tue 03:00 PKT

### Validation Steps:

1. ☐ **All Must-Have Deliverables Working:**
   - Web form submits → creates ticket → agent responds
   - Database has all 8 tables with data
   - Agent responds with channel-appropriate formatting
   - Escalation triggers working

2. ☐ **Tests Passing:**
   - Run `pytest` — all tests green
   - Run E2E tests — critical paths working
   - Health check endpoint returns 200

3. ☐ **Documentation Complete:**
   - README.md has setup instructions
   - API docs accessible at `/docs`
   - Deployment guide written
   - Architecture diagram included

4. ☐ **Deployment Verified:**
   - Frontend live (Vercel/K8s)
   - Backend live (Railway/K8s)
   - Database connected
   - All environment variables set

5. ☐ **Submission Package:**
   - GitHub repo public
   - Demo video recorded (5 min max)
   - Submission form completed
   - All required fields filled

6. ☐ **Code Quality:**
   - No TODO comments in critical paths
   - No console.log in production code
   - Error handling in place
   - Logging configured

7. ☐ **Security Check:**
   - No secrets in code (all in .env)
   - CORS configured correctly
   - Rate limiting enabled
   - Input validation on all endpoints

8. ☐ **Performance Check:**
   - Response time < 3 seconds
   - No memory leaks (check with load test)
   - Database queries optimized (indexes in place)

9. ☐ **Accessibility Check:**
   - Form fields have labels
   - Keyboard navigation works
   - Color contrast passes WCAG AA
   - Screen reader tested

10. ☐ **Final Polish:**
    - Success/error toasts working
    - Loading states visible
    - Form validation messages clear
    - Ticket ID displayed correctly

**🎯 SUBMISSION DEADLINE:** Tue 03:00 PKT (buffer until 23:59)

---

## 10. Energy Management

**Sleep Schedule** (NON-NEGOTIABLE):
- Fri→Sat: 02:00–07:00 (5h)
- Sat→Sun: 02:00–07:00 (5h)
- Sun→Mon: 23:00–07:00 (8h)
- Mon→Tue: Post-submission recovery 😴

**Breaks:**
- 10 min every 90 min (Pomodoro-style)
- 30 min meals (no coding during meals)
- 5 min stretch every hour

**Nutrition:**
- Hydrate (2L water minimum)
- Protein-rich meals (no sugar crashes)
- Caffeine cutoff: 18:00 (sleep quality)

**⚠️ Warning Signs:**
- Code not making sense → TAKE BREAK
- Irritability increasing → SLEEP
- Multiple bugs in a row → STEP AWAY

---

## 11. Contact & Escalation

**If Stuck on Technical Issue >2 Hours:**
1. Document what you tried
2. Ask on Discord/Slack
3. Stack Overflow search
4. **If still stuck → SKIP and move to next task**

**If Behind Schedule:**
1. Review prioritization cheat sheet
2. Cut P3/P4 features
3. **DO NOT sacrifice sleep**

**Submission Support:**
- Hackathon Discord: #help channel
- GitHub Issues: Document blockers
- Mentor office hours: Check schedule

---

**🔥 REMEMBER:** Done is better than perfect. Ship working software over perfect architecture. Good luck! 🚀

**Last Updated:** March 13, 2026 10:00 PKT
