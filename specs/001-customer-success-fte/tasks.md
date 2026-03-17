# Tasks: Customer Success FTE

**Input**: Design documents from `/specs/001-customer-success-fte/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ❌, data-model.md ❌, contracts/ ❌  
**Tests**: OPTIONAL - Not explicitly requested in specification  
**Branch**: `001-customer-success-fte`

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`, `frontend/components/`
- **Single project**: `src/`, `tests/` at repository root
- **Kubernetes**: `k8s/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan (backend/, frontend/, k8s/, docs/ directories)
- [ ] T002 Initialize Python 3.11 project with FastAPI dependencies in backend/requirements.txt
- [ ] T003 Initialize Node.js 18 project with Next.js 16 dependencies in frontend/package.json
- [ ] T004 [P] Configure Python linting and formatting (ruff, black, mypy) in backend/pyproject.toml
- [ ] T005 [P] Configure TypeScript and ESLint in frontend/tsconfig.json and frontend/eslint.config.mjs
- [ ] T006 [P] Setup docker-compose.yml with PostgreSQL 16 + pgvector, Kafka, backend, frontend services

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Setup PostgreSQL database schema framework with Alembic migrations in backend/alembic/
- [X] T008 [P] Implement database session management in backend/src/database/session.py (asyncpg connection pool)
- [X] T009 [P] Create base SQLModel entity classes in backend/src/database/models.py
- [X] T010 [P] Setup FastAPI app structure with CORS middleware in backend/src/main.py
- [X] T011 [P] Create API router structure in backend/src/api/routers.py and backend/src/api/v1/__init__.py
- [X] T012 Configure error handling and structured logging in backend/src/core/logging.py
- [X] T013 Setup environment configuration management in backend/src/core/config.py (pydantic-settings)
- [X] T014 [P] Create health check endpoint in backend/src/main.py (GET /health)
- [X] T015 [P] Setup Kafka producer/consumer base classes in backend/src/utils/kafka_producer.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Customer Submits Support Request via Email (Priority: P1) 🎯 MVP

**Goal**: Complete email intake flow - customer emails support@taskflowpro.com and receives response within 30 seconds

**Independent Test**: Send email to support address, verify ticket created and response received within SLA

### Implementation for User Story 1

- [X] T016 [P] [US1] Create SupportFormSubmission Pydantic schema in backend/src/schemas/support.py
- [X] T017 [P] [US1] Create SupportFormResponse Pydantic schema in backend/src/schemas/support.py
- [X] T018 [P] [US1] Create Ticket SQLModel in backend/src/database/models.py (id, customer_id, status, source_channel, etc.)
- [X] T019 [P] [US1] Create Customer SQLModel in backend/src/database/models.py (id, email, phone, name, etc.)
- [X] T020 [US1] Implement database ticket creation function in backend/src/database/tickets.py
- [X] T021 [US1] Implement customer lookup/creation function in backend/src/database/customers.py
- [X] T022 [US1] Create Gmail webhook handler in backend/src/channels/gmail_handler.py
- [X] T023 [US1] Implement Gmail API integration for sending responses in backend/src/channels/gmail_handler.py
- [X] T024 [P] [US1] Create OpenAI Agents SDK agent definition in backend/src/agent/customer_success_agent.py
- [X] T025 [P] [US1] Define 5 function tools in backend/src/agent/tools.py (search_kb, create_ticket, get_history, escalate, send_response)
- [X] T026 [US1] Create system prompts in backend/src/agent/prompts.py
- [X] T027 [US1] Implement channel response formatters in backend/src/agent/formatters.py
- [X] T028 [US1] Create message processor worker in backend/src/workers/message_processor.py
- [X] T029 [US1] Implement email-specific response formatting in backend/src/agent/formatters.py
- [X] T030 [US1] Add logging for email interactions in backend/src/core/logging.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - email intake working end-to-end

---

## Phase 4: User Story 2 - Customer Contacts Support via WhatsApp (Priority: P2)

**Goal**: Complete WhatsApp intake flow - customer messages WhatsApp number and receives conversational response

**Independent Test**: Send WhatsApp message via Twilio, verify ticket created and response received in conversational style

### Implementation for User Story 2

- [X] T031 [P] [US2] Extend Customer SQLModel with phone field in backend/src/database/models.py
- [X] T032 [P] [US2] Create WhatsApp webhook handler in backend/src/channels/whatsapp_handler.py
- [X] T033 [US2] Implement Twilio WhatsApp API integration in backend/src/channels/whatsapp_handler.py
- [X] T034 [US2] Add WhatsApp-specific response formatting (concise, emoji) in backend/src/agent/formatters.py
- [X] T035 [US2] Implement phone number-based customer identification in backend/src/database/customers.py
- [X] T036 [US2] Add WhatsApp message length validation (300 chars preferred) in backend/src/agent/formatters.py
- [X] T037 [US2] Implement conversation context tracking in backend/src/database/conversations.py
- [X] T038 [US2] Add Twilio signature validation in backend/src/channels/whatsapp_handler.py
- [ ] T039 [US2] Create WhatsApp-specific test scenarios in backend/tests/test_whatsapp.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - email and WhatsApp channels operational

---

## Phase 5: User Story 3 - Customer Submits Web Support Form (Priority: P1) 🎯 MVP

**Goal**: Complete web form submission flow - customer fills form on website and receives ticket ID with confirmation

**Independent Test**: Fill out and submit web form, verify ticket created and confirmation shown with ticket ID

### Implementation for User Story 3

- [X] T040 [P] [US3] Create Web Form API endpoint in backend/src/api/v1/support.py (POST /api/v1/support/submit)
- [X] T041 [P] [US3] Create Get Ticket Status endpoint in backend/src/api/v1/support.py (GET /api/v1/support/ticket/:id)
- [X] T042 [P] [US3] Install React Hook Form + Zod in frontend/package.json
- [X] T043 [P] [US3] Install shadcn/ui components in frontend/ (Form, Input, Textarea, Select, Button, Dialog)
- [X] T044 [P] [US3] Create Zod validation schema for form fields in frontend/src/lib/validations.ts
- [X] T045 [US3] Create SupportForm component in frontend/src/components/SupportForm.tsx
- [X] T046 [US3] Implement form fields (name, email, subject, category, priority, message) in frontend/src/components/SupportForm.tsx
- [X] T047 [US3] Implement form submission handler with fetch in frontend/src/components/SupportForm.tsx
- [X] T048 [US3] Implement success state with ticket ID display in frontend/src/components/SupportForm.tsx
- [X] T049 [US3] Implement error state with toast notifications in frontend/src/components/SupportForm.tsx
- [X] T050 [US3] Add loading state and double-submit prevention in frontend/src/components/SupportForm.tsx
- [X] T051 [US3] Create Next.js page in frontend/app/page.tsx (renders SupportForm)
- [X] T052 [US3] Create root layout in frontend/app/layout.tsx (metadata, providers, fonts)
- [X] T053 [US3] Setup Tailwind CSS configuration in frontend/tailwind.config.ts
- [X] T054 [US3] Add API client helper in frontend/src/lib/api.ts (typed fetch wrapper)
- [X] T055 [US3] Implement web form-specific response formatting in backend/src/agent/formatters.py
- [X] T056 [US3] Add CORS configuration for web form in backend/src/main.py

**Checkpoint**: At this point, User Story 3 should be fully functional - web form complete with frontend UI and backend API

---

## Phase 6: User Story 4 - Cross-Channel Conversation Continuity (Priority: P2)

**Goal**: Customer recognized across channels with full conversation history available

**Independent Test**: Customer contacts via email, then WhatsApp, system recognizes same customer and shows full history

### Implementation for User Story 4

- [X] T057 [P] [US4] Create Conversation SQLModel in backend/src/database/models.py
- [X] T058 [P] [US4] Create Message SQLModel in backend/src/database/models.py
- [X] T059 [US4] Implement cross-channel customer identification in backend/src/database/customers.py
- [X] T060 [US4] Create conversation history retrieval function in backend/src/database/conversations.py
- [X] T061 [US4] Implement customer identification service in backend/src/services/customer_service.py
- [X] T062 [US4] Add conversation context to agent prompts in backend/src/agent/prompts.py
- [X] T063 [US4] Implement conversation continuity logic in backend/src/workers/message_processor.py
- [X] T064 [US4] Add cross-channel test scenarios in backend/tests/test_cross_channel.py

**Checkpoint**: At this point, User Stories 1-4 should all work - cross-channel continuity operational

---

## Phase 7: User Story 5 - Appropriate Escalation to Human (Priority: P1) 🎯 MVP

**Goal**: System detects escalation triggers and appropriately escalates to human agents

**Independent Test**: Send message with escalation trigger (legal, angry, billing dispute), verify escalation created and human notified

### Implementation for User Story 5

- [X] T065 [P] [US5] Create Escalation SQLModel in backend/src/database/models.py
- [X] T066 [P] [US5] Implement sentiment analysis function in backend/src/agent/tools.py
- [X] T067 [US5] Create escalation detection logic in backend/src/agent/customer_success_agent.py
- [X] T068 [US5] Implement escalation trigger keywords detection in backend/src/agent/customer_success_agent.py
- [X] T069 [US5] Create escalation API endpoint in backend/src/api/v1/escalations.py
- [X] T070 [US5] Implement escalation notification system in backend/src/workers/message_processor.py
- [X] T071 [US5] Add escalation handoff message templates in backend/src/agent/prompts.py
- [X] T072 [US5] Create escalation test scenarios with all trigger categories in backend/tests/test_escalations.py

**Checkpoint**: At this point, User Story 5 should be fully functional - escalation system operational

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T073 [P] Add dark mode support with next-themes in frontend/app/layout.tsx
- [X] T074 [P] Implement file upload handling in backend/src/api/v1/support.py
- [X] T075 [P] Create KnowledgeBase SQLModel with pgvector in backend/src/database/models.py
- [X] T076 [P] Implement semantic search function in backend/src/agent/tools.py
- [X] T077 [P] Create AgentMetrics SQLModel in backend/src/database/models.py
- [X] T078 [P] Implement metrics collection worker in backend/src/workers/metrics_collector.py
- [X] T079 [P] Create Kubernetes namespace manifest in k8s/namespace.yaml
- [X] T080 [P] Create backend deployment manifest in k8s/backend-deployment.yaml
- [X] T081 [P] Create backend service manifest in k8s/backend-service.yaml
- [X] T082 [P] Create HPA manifest in k8s/hpa.yaml
- [X] T083 [P] Create ingress manifest in k8s/ingress.yaml
- [X] T084 [P] Create Kafka configmap in k8s/configmap-kafka.yaml
- [X] T085 [P] Create CI workflow for backend in .github/workflows/ci-backend.yml
- [X] T086 [P] Create CI workflow for frontend in .github/workflows/ci-frontend.yml
- [X] T087 [P] Create CD workflow in .github/workflows/cd-deploy.yml
- [X] T088 [P] Update documentation in docs/ARCHITECTURE.md
- [X] T089 [P] Add API documentation in docs/API.md
- [X] T090 [P] Add deployment guide in docs/DEPLOYMENT.md
- [X] T091 [P] Create quickstart guide in specs/001-customer-success-fte/quickstart.md
- [X] T092 [P] Run accessibility audit with axe-core in frontend/
- [X] T093 [P] Security hardening (CSP headers, input sanitization) in backend/
- [X] T094 [P] Create runbook in docs/RUNBOOK.md (common issues, troubleshooting)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Email)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2 - WhatsApp)**: Can start after Foundational (Phase 2) - Independent, can run in parallel with US1
- **User Story 3 (P1 - Web Form)**: Can start after Foundational (Phase 2) - Independent, can run in parallel
- **User Story 4 (P2 - Cross-Channel)**: Depends on US1 + US2 + US3 completion - Requires all channels operational
- **User Story 5 (P1 - Escalation)**: Can start after Foundational (Phase 2) - Independent, but integrates with all channels

### Within Each User Story

- Models before services
- Services before endpoints
- Backend before frontend integration (for US3)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T004-T006)
- All Foundational tasks marked [P] can run in parallel (T008-T011, T014-T015)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different developers

---

## Parallel Example: User Story 1 (Email Channel)

```bash
# Launch all models together:
Task: "Create SupportFormSubmission schema in backend/src/schemas/support.py"
Task: "Create SupportFormResponse schema in backend/src/schemas/support.py"
Task: "Create Ticket model in backend/src/database/models.py"
Task: "Create Customer model in backend/src/database/models.py"

# Launch all agent components together:
Task: "Create OpenAI Agents SDK agent definition in backend/src/agent/customer_success_agent.py"
Task: "Define 5 function tools in backend/src/agent/tools.py"
Task: "Create system prompts in backend/src/agent/prompts.py"
```

---

## Parallel Example: User Story 3 (Web Form)

```bash
# Launch all backend API tasks together:
Task: "Create Web Form API endpoint in backend/src/api/v1/support.py"
Task: "Create Get Ticket Status endpoint in backend/src/api/v1/support.py"

# Launch all frontend setup together:
Task: "Install React Hook Form + Zod in frontend/package.json"
Task: "Install shadcn/ui components in frontend/"
Task: "Create Zod validation schema in frontend/src/lib/validations.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 3, 5 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Email channel)
4. Complete Phase 5: User Story 3 (Web Form) - **Required deliverable**
5. Complete Phase 7: User Story 5 (Escalation)
6. **STOP and VALIDATE**: Test MVP end-to-end
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Email) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 3 (Web Form) → Test independently → Deploy/Demo
4. Add User Story 5 (Escalation) → Test independently → Deploy/Demo
5. Add User Story 2 (WhatsApp) → Test independently → Deploy/Demo
6. Add User Story 4 (Cross-Channel) → Test independently → Deploy/Demo
7. Add Polish features → Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Email)
   - Developer B: User Story 3 (Web Form)
   - Developer C: User Story 5 (Escalation)
3. Stories complete and integrate independently
4. Team reunites for Phase 8: Polish

---

## Task Summary

| Phase | Description | Task Count | Story |
|-------|-------------|------------|-------|
| Phase 1 | Setup | 6 tasks | N/A |
| Phase 2 | Foundational | 9 tasks | N/A |
| Phase 3 | US1: Email Channel | 15 tasks | P1 |
| Phase 4 | US2: WhatsApp Channel | 9 tasks | P2 |
| Phase 5 | US3: Web Form | 17 tasks | P1 |
| Phase 6 | US4: Cross-Channel | 8 tasks | P2 |
| Phase 7 | US5: Escalation | 8 tasks | P1 |
| Phase 8 | Polish & Cross-Cutting | 22 tasks | N/A |
| **Total** | **All Phases** | **94 tasks** | - |

### MVP Scope (User Stories 1, 3, 5 Only)
- **Tasks**: T001-T030, T040-T056, T065-T072 (50 tasks)
- **Deliverable**: Email + Web Form channels with escalation
- **Test**: Can receive emails, web form submissions, and escalate appropriately

### Full Feature Scope (All Stories)
- **Tasks**: T001-T094 (94 tasks)
- **Deliverable**: Complete multi-channel support system
- **Test**: All 5 user scenarios working with cross-channel continuity

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at phase checkpoints to validate independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Web Form is required deliverable** - prioritize Phase 5 tasks
- **Escalation is critical** - prioritize Phase 7 tasks
- **Accessibility is non-negotiable** - All tasks in Phase 8 must be completed for WCAG 2.1 AA compliance
- **Mobile-first** - Responsive design (T092) should be tested throughout, not just at end

---

**Next Steps**:
1. Review and approve tasks
2. Begin Phase 1: Setup (T001-T006)
3. Continue to Phase 2: Foundational (T007-T015)
4. Implement User Story 1 (T016-T030) for MVP
5. Add remaining stories incrementally
