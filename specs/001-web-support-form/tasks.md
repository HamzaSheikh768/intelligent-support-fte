# Tasks: Web Support Form (001-web-support-form)

**Input**: Design documents from `/specs/001-web-support-form/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ❌, data-model.md ❌, contracts/ ❌  
**Tests**: OPTIONAL - Not explicitly requested in specification  
**Branch**: `001-web-support-form`

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

- [x] T001 Create project structure per implementation plan (backend/, frontend/, k8s/ directories)
- [x] T002 Initialize Python 3.11 project with FastAPI dependencies in backend/requirements.txt
- [x] T003 Initialize Node.js 18 project with Next.js 16 dependencies in frontend/package.json
- [x] T004 [P] Configure Python linting and formatting (ruff, black, mypy) in backend/pyproject.toml
- [x] T005 [P] Configure TypeScript and ESLint in frontend/tsconfig.json and frontend/eslint.config.mjs
- [x] T006 [P] Setup docker-compose.yml with PostgreSQL 16 + pgvector, Kafka, backend, frontend services

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Setup PostgreSQL database schema framework with Alembic migrations in backend/alembic/
- [x] T008 [P] Implement database session management in backend/src/database/session.py (asyncpg connection pool)
- [x] T009 [P] Create base SQLModel entity classes in backend/src/database/models.py
- [x] T010 [P] Setup FastAPI app structure with CORS middleware in backend/src/main.py
- [x] T011 [P] Create API router structure in backend/src/api/routers.py and backend/src/api/v1/__init__.py
- [x] T012 Configure error handling and structured logging in backend/src/core/logging.py
- [x] T013 Setup environment configuration management in backend/src/core/config.py (pydantic-settings)
- [x] T014 [P] Create health check endpoint in backend/src/main.py (GET /health)
- [x] T015 [P] Setup Kafka producer/consumer base classes in backend/src/utils/kafka_producer.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Customer Submits Support Request (Priority: P1) 🎯 MVP

**Goal**: Complete web form submission flow - user can submit support request and receive ticket ID

**Independent Test**: User can fill form, submit, and see success message with ticket ID without page reload

### Implementation for User Story 1

- [x] T016 [P] [US1] Create SupportFormSubmission Pydantic schema in backend/src/schemas/support.py
- [x] T017 [P] [US1] Create SupportFormResponse Pydantic schema in backend/src/schemas/support.py
- [x] T018 [P] [US1] Create Ticket SQLModel in backend/src/database/models.py (id, customer_id, status, source_channel, etc.)
- [x] T019 [P] [US1] Create Customer SQLModel in backend/src/database/models.py (id, email, phone, name, etc.)
- [x] T020 [US1] Implement database ticket creation function in backend/src/database/tickets.py
- [x] T021 [US1] Implement customer lookup/creation function in backend/src/database/customers.py
- [x] T022 [US1] Create POST /api/v1/support/submit endpoint in backend/src/api/v1/support.py
- [x] T023 [US1] Create GET /api/v1/support/ticket/{ticket_id} endpoint in backend/src/api/v1/support.py
- [x] T024 [P] [US1] Install React Hook Form + Zod in frontend/package.json
- [x] T025 [P] [US1] Install shadcn/ui components in frontend/ (Form, Input, Textarea, Select, Button, Dialog)
- [x] T026 [P] [US1] Create Zod validation schema for form fields in frontend/src/lib/validations.ts
- [x] T027 [US1] Create SupportForm component structure in frontend/src/components/SupportForm.tsx
- [x] T028 [US1] Implement form fields (name, email, subject) in frontend/src/components/SupportForm.tsx
- [x] T029 [US1] Implement form fields (category, priority, message) in frontend/src/components/SupportForm.tsx
- [x] T030 [US1] Implement form submission handler with fetch in frontend/src/components/SupportForm.tsx
- [x] T031 [US1] Implement success state with ticket ID display in frontend/src/components/SupportForm.tsx
- [x] T032 [US1] Implement error state with toast notifications in frontend/src/components/SupportForm.tsx
- [x] T033 [US1] Add loading state and double-submit prevention in frontend/src/components/SupportForm.tsx
- [x] T034 [US1] Create Next.js page in frontend/app/page.tsx (renders SupportForm)
- [x] T035 [US1] Create root layout in frontend/app/layout.tsx (metadata, providers, fonts)
- [x] T036 [US1] Setup Tailwind CSS configuration in frontend/tailwind.config.ts
- [x] T037 [US1] Add API client helper in frontend/src/lib/api.ts (typed fetch wrapper)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - form submits to backend, creates ticket, returns ticket ID

---

## Phase 4: User Story 2 - Customer Uploads Attachments (Priority: P2)

**Goal**: Users can attach up to 3 files (images, PDFs, text) with previews and file management

**Independent Test**: User can upload files, see thumbnails, remove files, and submit with attachments

### Implementation for User Story 2

- [x] T038 [P] [US2] Extend SupportFormSubmission schema with attachments array in backend/src/schemas/support.py
- [x] T039 [P] [US2] Create Message SQLModel in backend/src/database/models.py (ticket_id, channel, content, attachments metadata)
- [x] T040 [US2] Implement file upload handling in backend/src/api/v1/support.py (Base64 decoding, validation)
- [x] T041 [US2] Add file size and type validation in backend/src/schemas/support.py
- [x] T042 [P] [US2] Install lucide-react icons in frontend/package.json (Upload, File, Image, X)
- [x] T043 [P] [US2] Create file upload helper functions in frontend/src/lib/files.ts (fileToBase64, formatFileSize, validateFile)
- [x] T044 [US2] Implement file upload area with drag-drop in frontend/src/components/SupportForm.tsx
- [x] T045 [US2] Implement file preview with thumbnails for images in frontend/src/components/SupportForm.tsx
- [x] T046 [US2] Implement file list with remove button in frontend/src/components/SupportForm.tsx
- [x] T047 [US2] Add file size and count validation in frontend/src/components/SupportForm.tsx
- [x] T048 [US2] Update form submission to include attachments in frontend/src/components/SupportForm.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - form with file upload fully functional

---

## Phase 5: User Story 3 - Customer Returns to Incomplete Form (Priority: P3)

**Goal**: Form auto-saves to localStorage and restores on return (7-day expiry)

**Independent Test**: User can start form, close browser, return within 7 days, and find form pre-filled

### Implementation for User Story 3

- [x] T049 [P] [US3] Create localStorage helper functions in frontend/src/lib/storage.ts (saveDraft, loadDraft, clearDraft)
- [x] T050 [US3] Implement auto-save on form change (debounced 500ms) in frontend/src/components/SupportForm.tsx
- [x] T051 [US3] Implement draft loading on component mount in frontend/src/components/SupportForm.tsx
- [x] T052 [US3] Add draft expiry check (7 days) in frontend/src/lib/storage.ts
- [x] T053 [US3] Clear draft on successful submission in frontend/src/components/SupportForm.tsx
- [x] T054 [US3] Add visual indicator for saved draft (optional badge/toast) in frontend/src/components/SupportForm.tsx

**Checkpoint**: All user stories should now be independently functional - form with auto-save complete

---

## Phase 6: User Story 4 - Form Validation Errors (Priority: P3)

**Goal**: Clear, user-friendly validation errors with focus management and accessibility

**Independent Test**: Submitting invalid form shows specific errors, focuses first error field, doesn't submit

### Implementation for User Story 4

- [x] T055 [P] [US4] Create custom error message mappings in frontend/src/lib/validations.ts (Zod error messages)
- [x] T056 [US4] Implement real-time validation on blur in frontend/src/components/SupportForm.tsx
- [x] T057 [US4] Add inline error messages below each field in frontend/src/components/SupportForm.tsx
- [x] T058 [US4] Implement focus management (move to first error) in frontend/src/components/SupportForm.tsx
- [x] T059 [US4] Add ARIA live regions for error announcements in frontend/src/components/SupportForm.tsx
- [x] T060 [US4] Add character counter for message field (10/1000) in frontend/src/components/SupportForm.tsx
- [x] T061 [US4] Add visual focus indicators (2px outline) in frontend/src/components/SupportForm.tsx
- [x] T062 [US4] Test keyboard navigation (Tab, Enter, Escape) in frontend/src/components/SupportForm.tsx
- [x] T063 [US4] Add ARIA labels and aria-required attributes in frontend/src/components/SupportForm.tsx
- [x] T064 [US4] Test with screen reader (VoiceOver/TalkBack) for accessibility compliance

**Checkpoint**: Form validation complete with full accessibility support (WCAG 2.1 AA)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T065 [P] Add dark mode support with next-themes in frontend/app/layout.tsx
- [x] T066 [P] Implement floating action button (bottom-right) in frontend/src/components/SupportForm.tsx
- [x] T067 [P] Add modal/dialog positioning and z-index management in frontend/src/components/SupportForm.tsx
- [x] T068 [P] Add subtle animations (form open, success checkmark) in frontend/src/components/SupportForm.tsx
- [x] T069 [P] Implement responsive design (mobile-first, stacked fields) in frontend/src/components/SupportForm.tsx
- [x] T070 [P] Add hover states and focus rings to all interactive elements in frontend/src/components/SupportForm.tsx
- [x] T071 [P] Create embed script in frontend/public/embed.js (vanilla JS, creates widget container)
- [x] T072 [P] Add embed script configuration (data-position, data-theme, data-api-url) in frontend/public/embed.js
- [x] T073 [P] Update documentation in docs/ with form integration guide
- [x] T074 [P] Add API documentation in docs/API.md (POST /support/submit request/response examples)
- [x] T075 [P] Run accessibility audit with axe-core in frontend/
- [x] T076 [P] Performance optimization (code splitting, lazy loading) in frontend/
- [x] T077 [P] Security hardening (CSP headers, input sanitization) in backend/
- [x] T078 [P] Create runbook in docs/RUNBOOK.md (common issues, troubleshooting)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent, can run in parallel with US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent, can run in parallel
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Independent, can run in parallel

### Within Each User Story

- Models before services
- Services before endpoints
- Backend before frontend integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T004-T006)
- All Foundational tasks marked [P] can run in parallel (T008-T011, T014-T015)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different developers

---

## Parallel Example: User Story 1

```bash
# Launch all backend models together:
Task: "Create SupportFormSubmission schema in backend/src/schemas/support.py"
Task: "Create SupportFormResponse schema in backend/src/schemas/support.py"
Task: "Create Ticket model in backend/src/database/models.py"
Task: "Create Customer model in backend/src/database/models.py"

# Launch all frontend setup together:
Task: "Install React Hook Form + Zod in frontend/package.json"
Task: "Install shadcn/ui components in frontend/"
Task: "Create Zod validation schema in frontend/src/lib/validations.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test form submission end-to-end
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add Polish features → Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (form submission)
   - Developer B: User Story 2 (file upload)
   - Developer C: User Story 3 + 4 (auto-save + validation)
3. Stories complete and integrate independently
4. Team reunites for Phase 7: Polish

---

## Task Summary

| Phase | Description | Task Count | Story |
|-------|-------------|------------|-------|
| Phase 1 | Setup | 6 tasks | N/A |
| Phase 2 | Foundational | 9 tasks | N/A |
| Phase 3 | User Story 1: Submit Request | 22 tasks | P1 (MVP) |
| Phase 4 | User Story 2: Upload Attachments | 11 tasks | P2 |
| Phase 5 | User Story 3: Auto-Save Draft | 6 tasks | P3 |
| Phase 6 | User Story 4: Validation Errors | 10 tasks | P3 |
| Phase 7 | Polish & Cross-Cutting | 14 tasks | N/A |
| **Total** | **All Phases** | **78 tasks** | - |

### MVP Scope (User Story 1 Only)
- **Tasks**: T001-T037 (37 tasks)
- **Deliverable**: Working form submission with ticket ID
- **Test**: Can submit form and see success message

### Full Feature Scope (All Stories)
- **Tasks**: T001-T078 (78 tasks)
- **Deliverable**: Complete embeddable support widget
- **Test**: All 4 user scenarios working with accessibility compliance

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at phase checkpoints to validate independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Accessibility is non-negotiable**: All tasks in Phase 6 must be completed for WCAG 2.1 AA compliance
- **Mobile-first**: Responsive design (T069) should be tested throughout, not just at end

---

**Next Steps**:
1. Review and approve tasks
2. Begin Phase 1: Setup (T001-T006)
3. Continue to Phase 2: Foundational (T007-T015)
4. Implement User Story 1 (T016-T037) for MVP
5. Add remaining stories incrementally
