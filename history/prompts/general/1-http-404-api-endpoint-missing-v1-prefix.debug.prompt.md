---
id: 1
title: "HTTP 404 API Endpoint Missing v1 Prefix"
stage: debug
date_iso: "2026-03-20T00:00:00Z"
surface: agent
model: qwen-code
feature: support-form-submission
branch: main
user: dell
command: manual-debug
labels: ["bug", "404-error", "api-routing", "frontend", "nextjs"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - frontend/src/lib/api.ts
  - frontend/src/components/support/SupportForm.tsx
tests_yaml: []
prompt_text: |
  This is the Qwen Code. We are setting up the context for our chat.
  Today's date is Friday, March 20, 2026 (formatted according to the user's locale).
  My operating system is: win32
  I'm currently working in the directory: E:\Hackathon 5\CRM-Digital-FTE-Factory
  Here is the folder structure of the current working directories:

  Showing up to 20 items:

  E:\Hackathon 5\CRM-Digital-FTE-Factory\
  ├───.dockerignore
  ├───.env.example
  ├───.eslintignore
  ├───.gitignore
  ├───.prettierignore
  ├───AGENTS.md
  ├───BACKEND-TESTING-GUIDE.md
  ├───CLAUDE.md
  ├───docker-compose.yml
  ├───QWEN.md
  ├───README.md
  ├───requirement.md
  ├───.claude\
  ├───.git\...
  ├───.github\
  ├───.qwen\
  ├───.specify\
  ├───backend\
  ├───context\
  ├───docs\
  └───...

  ---
  --- Context from: QWEN.md ---
  # Qwen Code Rules

  This file is generated during init for the selected agent.

  Your primary goal is to work with the architext to build products.

  ## Task context

  **Your Surface:** You operate on a project level, providing guidance to users and executing development tasks via a defined set of tools.

  **Your Success is Measured By:**
  - All outputs strictly follow the user intent.
  - Prompt History Records (PHRs) are created automatically and accurately for every user prompt.
  - Architectural Decision Record (ADR) suggestions are made intelligently for significant decisions.
  - All changes are small, testable, and reference code precisely.

  ## Core Guarantees (Product Promise)

  - Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
  - PHR routing (all under `history/prompts/`):
    - Constitution → `history/prompts/constitution/`
    - Feature-specific → `history/prompts/<feature-name>/`
    - General → `history/prompts/general/`
  - ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

  ## Development Guidelines

  ### 1. Authoritative Source Mandate:
  Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

  ### 2. Execution Flow:
  Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

  ### 3. Knowledge capture (PHR) for Every User Input.
  After completing requests, you **MUST** create a PHR (Prompt History Record).

  **When to create PHRs:**
  - Implementation work (code changes, new features)
  - Planning/architecture discussions
  - Debugging sessions
  - Spec/task/plan creation
  - Multi-step workflows

  **PHR Creation Process:**

  1) Detect stage
     - One of: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

  2) Generate title
     - 3–7 words; create a slug for the filename.

  2a) Resolve route (all under history/prompts/)
    - `constitution` → `history/prompts/constitution/`
    - Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) → `history/prompts/<feature-name>/` (requires feature context)
    - `general` → `history/prompts/general/`

  3) Prefer agent‑native flow (no shell)
     - Read the PHR template from one of:
       - `.specify/templates/phr-template.prompt.md`
       - `templates/phr-template.prompt.md`
     - Allocate an ID (increment; on collision, increment again).
     - Compute output path based on stage:
       - Constitution → `history/prompts/constitution/<ID>-<slug>.constitution.prompt.md`
       - Feature → `history/prompts/<feature-name>/<ID>-<slug>.<stage>.prompt.md`
       - General → `history/prompts/general/<ID>-<slug>.general.prompt.md`
     - Fill ALL placeholders in YAML and body:
       - ID, TITLE, STAGE, DATE_ISO (YYYY‑MM‑DD), SURFACE="agent"
       - MODEL (best known), FEATURE (or "none"), BRANCH, USER
       - COMMAND (current command), LABELS (["topic1","topic2",...])
       - LINKS: SPEC/TICKET/ADR/PR (URLs or "null")
       - FILES_YAML: list created/modified files (one per line, " - ")
       - TESTS_YAML: list tests run/added (one per line, " - ")
       - PROMPT_TEXT: full user input (verbatim, not truncated)
       - RESPONSE_TEXT: key assistant output (concise but representative)
       - Any OUTCOME/EVALUATION fields required by the template
     - Write the completed file with agent file tools (WriteFile/Edit).
     - Confirm absolute path in output.

  4) Use sp.phr command file if present
     - If `.**/commands/sp.phr.*` exists, follow its structure.
     - If it references shell but Shell is unavailable, still perform step 3 with agent‑native tools.

  5) Shell fallback (only if step 3 is unavailable or fails, and Shell is permitted)
     - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
     - Then open/patch the created file to ensure all placeholders are filled and prompt/response are embedded.

  6) Routing (automatic, all under history/prompts/)
     - Constitution → `history/prompts/constitution/`
     - Feature stages → `history/prompts/<feature-name>/` (auto-detected from branch or explicit feature context)
     - General → `history/prompts/general/`

  7) Post‑creation validations (must pass)
     - No unresolved placeholders (e.g., `{{THIS}}`, `[THAT]`).
     - Title, stage, and dates match front‑matter.
     - PROMPT_TEXT is complete (not truncated).
     - File exists at the expected path and is readable.
     - Path matches route.

  8) Report
     - Print: ID, path, stage, title.
     - On any failure: warn but do not block the main command.
     - Skip PHR only for `/sp.phr` itself.

  ## Explicit ADR suggestions
  - When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting with:
    "📋 Architectural decision detected: <brief> — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
  - Wait for user consent; never auto‑create the ADR.

  ### Minimum acceptance criteria
  - Clear, testable acceptance criteria included
  - Explicit error paths and constraints stated
  - Smallest viable change; no unrelated edits
  - Code references to modified/inspected files where relevant

  ## Architect Guidelines (for planning)

  Instructions: As an expert architect, generate a detailed architectural plan for [Project Name]. Address each of the following thoroughly.

  1. Scope and Dependencies:
     - In Scope: boundaries and key features.
     - Out of Scope: explicitly excluded items.
     - External Dependencies: systems/services/teams and ownership.

  2. Key Decisions and Rationale:
     - Options Considered, Trade-offs, Rationale.
     - Principles: measurable, reversible where possible, smallest viable change.

  3. Interfaces and API Contracts:
     - Public APIs: Inputs, Outputs, Errors.
     - Versioning Strategy.
     - Idempotency, Timeouts, Retries.
     - Error Taxonomy with status codes.

  4. Non-Functional Requirements (NFRs) and Budgets:
     - Performance: p95 latency, throughput, resource caps.
     - Reliability: SLOs, error budgets, degradation strategy.
     - Security: AuthN/AuthZ, data handling, secrets, auditing.
     - Cost: unit economics.

  5. Data Management and Migration:
     - Source of Truth, Schema Evolution, Migration and Rollback, Data Retention.

  6. Operational Readiness:
     - Observability: logs, metrics, traces.
     - Alerting: thresholds and on-call owners.
     - Runbooks for common tasks.
     - Deployment and Rollback strategies.
     - Feature Flags and compatibility.

  7. Risk Analysis and Mitigation:
     - Top 3 Risks, blast radius, kill switches/guardrails.

  8. Evaluation and Validation:
     - Definition of Done (tests, scans).
     - Output Validation for format/requirements/safety.

  9. Architectural Decision Record (ADR):
     - For each significant decision, create an ADR and link it.

  ### Architecture Decision Records (ADR) - Intelligent Suggestion

  After design/architecture work, test for ADR significance:

  - Impact: long-term consequences? (e.g., framework, data model, API, security, platform)
  - Alternatives: multiple viable options considered?
  - Scope: cross‑cutting and influences system design?

  If ALL true, suggest:
  📋 Architectural decision detected: [brief-description]
     Document reasoning and tradeoffs? Run `/sp.adr [decision-title]`

  Wait for consent; never auto-create ADRs. Group related decisions (stacks, authentication, deployment) into one ADR when appropriate.

  ## Basic Project Structure

  - `.specify/memory/constitution.md` — Project principles
  - `specs/<feature>/spec.md` — Feature requirements
  - `specs/<feature>/plan.md` — Architecture decisions
  - `specs/<feature>/tasks.md` — Testable tasks with cases
  - `history/prompts/` — Prompt History Records
  - `history/adr/` — Architecture Decision Records
  - `.specify/` — SpecKit Plus templates and scripts

  ## Code Standards
  See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.
  --- End of Context from: QWEN.md ---

  --- Context from: AGENTS.md ---
  # AGENTS.md - Production Custom Agent Definitions

  ## 1. Agent Overview
  The Customer Success FTE (Full-Time Equivalent) agent is designed to handle customer support operations autonomously, emulating the role of a full-time customer success representative. This agent processes customer inquiries across multiple channels, manages account information, resolves common issues, and escalates complex problems to human agents according to established protocols. The agent maintains performance guardrails and follows escalation rules to ensure customer satisfaction while reducing operational costs.

  ## 2. Registered Agents (Exact Names)

  ### cloud-deploy-agent
  - **Purpose**: Agent for deploying applications to cloud Kubernetes (AKS/GKE/DOKS). Handles CI/CD pipeline setup, managed services integration (Neon/Upstash), ingress configuration, SSL certificates, and Next.js build-time variable handling. Use this agent when setting up cloud deployments or debugging deployment issues.
  - **Tools it can use**:
    - `Glob` - Find files
    - `Grep` - Search patterns
    - `Read` - Read files
    - `Edit` - Modify files
    - `Write` - Create files
    - `Bash` - Execute commands
    - `mcp__context7__resolve-library-id`
    - `mcp__context7__get-library-docs`
    - `mcp__better-auth__search`
    - `mcp__better-auth__chat`
  - **System Prompt**: End-to-end cloud deployment agent that handles the complete journey from local Docker to production Kubernetes. Covers CI/CD pipelines, managed services, ingress, SSL, and the critical Next.js build-time vs runtime variable distinction.

  ### fastapi-backend-agent
  - **Purpose**: Agent for building production-grade FastAPI backends with SQLModel, async PostgreSQL, JWT authentication, and audit logging. Enforces async session patterns to prevent MissingGreenlet errors. Use when building REST APIs, integrating with Neon PostgreSQL, or implementing Better Auth JWT verification.
  - **Tools it can use**:
    - `Glob` - Find files
    - `Grep` - Search patterns
    - `Read` - Read files
    - `Edit` - Modify files
    - `Write` - Create files
    - `Bash` - Execute commands
    - `mcp__context7__resolve-library-id`
    - `mcp__context7__get-library-docs`
    - `mcp__better-auth__search`
    - `mcp__better-auth__chat`
  - **System Prompt**: Build production-grade FastAPI backends with SQLModel and async PostgreSQL, enforcing critical async patterns to prevent MissingGreenlet errors and ensuring human-agent parity in API design.

  ### monorepo-agent
  - **Purpose**: Use this agent for autonomous monorepo operations including analysis, setup, and migration. Spawns when complex multi-step monorepo tasks need autonomous execution. Combines Nx CLI, MCP tools, and 3 monorepo skills for comprehensive monorepo work.
  - **Tools it can use**:
    - `Glob` - Find files
    - `Grep` - Search patterns
    - `Read` - Read files
    - `Edit` - Modify files
    - `Write` - Create files
    - `Bash` - Execute commands
    - `nx_docs` - Query Nx documentation
    - `nx_available_plugins` - List official @nx/* plugins
  - **System Prompt**: Monorepo specialist who thinks about repository architecture the way a distributed systems engineer thinks about service boundaries—cohesion within, loose coupling between. Tends to treat all repositories the same regardless of structure, creating context blindness where monorepo-specific optimizations, boundaries, and workflows are ignored. Distinctive capability: recognizing monorepo patterns and autonomously executing multi-step operations.

  ### nextjs-16-agent
  - **Purpose**: Agent for building Next.js 16 applications correctly. Handles async params/searchParams, proxy.ts (replacing middleware), httpOnly cookie proxies, Script loading strategies, and cacheComponents. Prevents common breaking change mistakes.
  - **Tools it can use**:
    - `Glob` - Find files
    - `Grep` - Search patterns
    - `Read` - Read files
    - `Edit` - Modify files
    - `Write` - Create files
    - `Bash` - Execute commands
    - `mcp__next-devtools__init`
    - `mcp__next-devtools__nextjs_index`
    - `mcp__next-devtools__nextjs_call`
    - `mcp__next-devtools__nextjs_docs`
    - `mcp__next-devtools__browser_eval`
    - `mcp__context7__resolve-library-id`
    - `mcp__context7__get-library-docs`
  - **System Prompt**: Build and debug Next.js 16 applications while avoiding the many breaking changes from Next.js 15, ensuring correct patterns are used for async params, request proxying, authentication with httpOnly cookies, and web component script loading.

  ### spec-architect
  - **Purpose**: Use this agent when you need to validate or refine a specification for completeness, testability, clarity, and formal correctness. This agent ensures requirements are unambiguous, measurable, and formally verifiable before planning begins. Applies Alloy-style formal verification (invariant identification, small scope testing, counterexample generation) for complex specifications. Invoke when spec appears vague, lacks success criteria, has unclear constraints, or involves multi-component systems requiring formal analysis.
  - **Tools it can use**:
    - `Glob` - Find files
    - `Grep` - Search patterns
    - `Read` - Read files
    - `Edit` - Modify files
    - `Write` - Follow instructions
    - `Bash` - Execute commands
    - `mcp__context7__resolve-library-id`
    - `mcp__context7__get-library-docs`
  - **System Prompt**: Specification architect who thinks about requirements the way a compiler designer thinks about formal grammars—every ambiguity creates runtime errors in human understanding. Tends to accept vague specifications because humans communicate informally, creating implementation divergence where 10 engineers produce 10 different solutions from the same spec. Distinctive capability: recognizing where specifications are underspecified and proposing targeted refinements that activate implementation reasoning rather than guesswork.

  ## 3. Skills → Tools Mapping Table
  | Skill from claude/skills | Becomes @function_tool in Production |
  |--------------------------|--------------------------------------|
  | automation-script-builder | `@function_tool: build_automation_scripts` |
  | nextjs-16 | `@function_tool: create_nextjs_pages` |
  | minikube | `@function_tool: manage_k8s_cluster` |
  | fastapi-backend | `@function_tool: create_fastapi_backend` |
  | browser-use | `@function_tool: automate_browser` |
  | context7-efficient | `@function_tool: fetch_documentation` |
  | kubernetes-essentials | `@function_tool: kubectl_commands` |
  | kubernetes-deployment-validator | `@function_tool: validate_deployment` |
  | deploying-postgres-k8s | `@function_tool: deploy_postgres` |
  | deploying-kafka-k8s | `@function_tool: deploy_kafka` |
  | nx-monorepo | `@function_tool: nx_operations` |
  | production-dockerfile | `@function_tool: create_dockerfile` |
  | production-debugging | `@function_tool: debug_production` |
  | styling-with-shadcn | `@function_tool: create_styled_components` |
  | theme-factory | `@function_tool: apply_themes` |
  | building-nextjs-apps | `@function_tool: build_nextjs_app` |
  | browsing-with-playwright | `@function_tool: browse_web` |
  | pdf | `@function_tool: process_pdf` |
  | frontend-design | `@function_tool: create_frontend` |
  | skill-creator | `@function_tool: create_skill` |

  ## 4. Production System Prompt (OpenAI Agents SDK Ready)
  ```
  CUSTOMER_SUCCESS_SYSTEM_PROMPT

  You are the Customer Success FTE (Full-Time Equivalent) agent responsible for managing customer relationships and resolving their issues. Your primary functions include:

  1. Processing customer inquiries across multiple channels (email, chat, phone)
  2. Managing customer accounts and personal information
  3. Troubleshooting technical issues and feature requests
  4. Escalating complex problems to human agents according to established protocols
  5. Conducting proactive customer outreach and retention activities

  **Brand Voice Requirements:**
  - Professional but approachable on all channels
  - Adapt tone based on communication method (email=formal, chat=conversational, phone=friendly)
  - Maintain customer privacy and security at all times
  - Focus on first-contact resolution while recognizing escalation needs

  **Critical Constraints:**
  - NEVER access or share sensitive customer data without proper authentication
  - DO NOT make commitments about product features beyond current roadmap
  - DO NOT provide technical advice outside approved knowledge base
  - ALWAYS follow company policies and compliance requirements
  - MAINTAIN detailed interaction logs in CRM system

  **Escalation Triggers (activate when any of these occur):**
  - Financial disputes or billing complaints
  - Security concerns or potential data breaches
  - Legal matters or compliance issues
  - Technical issues after 2 resolution attempts
  - Customer dissatisfaction or service complaints after 2 attempts
  - Requests for refunds or account closures
  - Any issue requiring management approval

  **Performance Requirements:**
  - Acknowledge all customer communications within 2 minutes
  - Document all interactions in CRM with resolution status
  - Follow up on open issues within 24 hours
  - Maintain 90%+ customer satisfaction rating
  - Resolve 70%+ of issues without escalation

  **Information Handling:**
  - Verify customer identity before sharing account details
  - Use positive, solution-focused language
  - Confirm customer understanding before proceeding
  - Provide multiple solution options when available
  - Set realistic expectations for resolution timelines

  **Security Protocols:**
  - Encrypt all customer data transmission
  - Follow principle of least privilege for data access
  - Never store sensitive information in plain text
  - Report security incidents immediately
  - Comply with all data protection regulations
  ```

  ## 5. Tool Calling Order & Workflow
  The required workflow follows this sequence:

  1. **create_ticket** → Creates new customer support ticket
     - Input: customer_id, issue_description, priority_level
     - Output: ticket_id with status "created"

  2. **get_customer_history** → Retrieves customer interaction history
     - Input: customer_id
     - Output: previous tickets, preferences, account status

  3. **search_knowledge_base** → Finds relevant solutions in knowledge base
     - Input: issue_description, customer_context
     - Output: potential solutions with confidence scores

  4. **execute_resolution_step** → Performs a specific resolution action
     - Input: ticket_id, action_type, parameters
     - Output: action_result with success/failure status

  5. **update_ticket_status** → Updates ticket with resolution progress
     - Input: ticket_id, status, resolution_notes
     - Output: updated_ticket_object

  6. **escalate_to_human** → Escalates complex issues to human agent
     - Input: ticket_id, escalation_reason, context_summary
     - Output: escalation_confirmation with human_agent_assignment

  7. **send_response** → Sends final response to customer
     - Input: ticket_id, customer_id, response_content
     - Output: delivery_confirmation

  ## 6. Integration Points
  This AGENTS.md document serves as the blueprint for the Custom Agent (OpenAI Agents SDK) in Specialization Phase, specifically for:
  - production/agent/prompts.py: Contains the CUSTOMER_SUCCESS_SYSTEM_PROMPT implementation
  - production/agent/tools.py: Contains all @function_tool implementations mapped from skills
  - production/agent/workflow.py: Implements the required tool calling order and workflow
  - production/agent/escalation.py: Handles escalation logic and human agent routing
  - production/agent/metrics.py: Tracks performance metrics and compliance requirements

  The document defines the complete architecture for the OpenAI Agents SDK implementation, ensuring all registered agents, their capabilities, and required workflows are properly documented for production deployment.
  --- End of Context from: AGENTS.md ---

  --- Context from: C:\Users\dell\.qwen\output-language.md ---
  # Output language preference: English
  <!-- qwen-code:llm-output-language: English -->

  ## Goal
  Prefer responding in **English** for normal assistant messages and explanations.

  ## Keep technical artifacts unchanged
  Do **not** translate or rewrite:
  - Code blocks, CLI commands, file paths, stack traces, logs, JSON keys, identifiers
  - Exact quoted text from the user (keep quotes verbatim)

  ## When a conflict exists
  If higher-priority instructions (system/developer) require a different behavior, follow them.

  ## Tool / system outputs
  Raw tool/system outputs may contain fixed-format English. Preserve them verbatim, and if needed, add a short **English** explanation below.
  --- End of Context from: C:\Users\dell\.qwen\output-language.md ---

  ok

  now khud read code/files

response_text: |
  ## ✅ ROOT CAUSE IDENTIFIED (Issue #1)

  **Issue:** API endpoint mismatch between frontend and backend.

  **Frontend** (`frontend/src/lib/api.ts`) was calling: `/api/support/submit`
  
  **Backend** (`backend/src/api/routers.py` + `backend/src/api/v1/support.py`) exposes: `/api/v1/support/submit`

  The backend router has a `/v1` prefix that the frontend was missing.

  **Actual backend endpoint:** `http://localhost:8000/api/v1/support/submit`
  
  **Frontend was calling:** `http://localhost:8000/api/support/submit` (missing `/v1`)

  **Fix Applied:**
  - Updated `frontend/src/lib/api.ts`: Changed `API_BASE` from `${API_BASE_URL}/api` to `${API_BASE_URL}/api/v1`
  - Updated JSDoc comments in `api.ts` and `SupportForm.tsx` to reflect correct endpoints
  - Health endpoint remains at `/health` (no `/api/v1` prefix needed)

  **Files Modified:**
  - `frontend/src/lib/api.ts` - Fixed API_BASE constant and endpoint comments
  - `frontend/src/components/support/SupportForm.tsx` - Updated endpoint comments

  **Verification Steps:**
  1. Ensure backend is running: `http://localhost:8000/health`
  2. Ensure frontend is running: `http://localhost:3000/support`
  3. Submit the support form
  4. Check Network tab - request should go to `http://localhost:8000/api/v1/support/submit`
  5. Expected response: HTTP 201 with ticket_id

  **Note:** Backend must be running on port 8000. If using Docker: `docker-compose up`

---

## ✅ SECOND ISSUE FIXED (Ticket Tracking)

**Issue:** "Ticket not found" error when tracking ticket TK-2026-100233

**Root Causes:**
1. Missing `/v1` prefix in track page API call (same as issue #1)
2. **Ticket ID format mismatch:** Frontend generated `TK-2026-100233` but backend expects UUID format

**Backend expects:** UUID like `550e8400-e29b-41d4-a716-446655440000`
**Frontend generated:** `TK-2026-100233` (display format only)

**Fixes Applied:**
1. Updated `frontend/src/app/track/page.tsx`: Added `/v1` prefix to API call
2. Updated `frontend/src/components/support/SupportForm.tsx`: Now uses actual UUID from backend response instead of generated TK ID
3. Updated `backend/src/api/v1/support.py`: Better error messages for invalid ticket ID formats
4. Updated TypeScript interface to use snake_case field names matching backend response

**Files Modified:**
- `frontend/src/app/track/page.tsx` - Fixed API endpoint, updated interface to snake_case
- `frontend/src/components/support/SupportForm.tsx` - Uses actual UUID from response
- `backend/src/api/v1/support.py` - Improved error handling for ticket ID format

**Verification Steps:**
1. Submit a new ticket via `/support`
2. Copy the ticket ID from success screen (now shows actual UUID)
3. Click "Track Ticket Status" or go to `/track?ticket_id=<UUID>`
4. Should see ticket details instead of "Ticket not found" error

---
