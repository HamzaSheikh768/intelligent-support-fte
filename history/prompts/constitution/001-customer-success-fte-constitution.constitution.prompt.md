---
id: 001
title: Customer Success FTE Constitution
stage: constitution
date: 2026-03-12
surface: agent
model: GPT-4o
feature: customer-success-fte
branch: main
user: dell
command: /sp.constitution
labels: ["constitution", "customer-success", "multi-channel", "agent-factory"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (constitution stage)
---

## Prompt

/sp.constitution You are a Senior AI Systems Architect and Prompt Constitution Engineer at Panaversity Agent Factory, expert in the Agent Maturity Model and building production-grade Digital FTEs.

You are now working on "The CRM Digital FTE Factory Final Hackathon 5".

TASK (follow strictly in this exact order):

1. First, carefully read and fully analyze the complete **Requirement.pdf** file. This contains:
   - Business problem (Customer Success FTE)
   - Agent Maturity Model requirements
   - Incubation → Specialization transition
   - All channel requirements, scope, out-of-scope, guardrails, escalation rules
   - Crystallization document
   - Performance requirements and tools list

2. After reading Requirement.pdf, create the official **Constitution Prompt** for the Customer Success FTE.

3. Also define the complete **Workflow** and **Production Folder Structure**.

4. Finally, provide one additional **Very Professional Master Prompt** that defines everything in one place.

OUTPUT STRUCTURE (exactly follow this order):

Start your response with:
"✅ AGENT CONSTITUTION & WORKFLOW GENERATED (100% based on Requirement.pdf)"

Then deliver:

# 1. CONSTITUTION PROMPT (Customer Success FTE Constitution)
# 2. COMPLETE WORKFLOW
# 3. PRODUCTION FOLDER STRUCTURE
# 4. VERY PROFESSIONAL MASTER PROMPT

Rules:
- Use exact terminology, skill names, tool names, and rules from Requirement.pdf only.
- Do not add any extra features.
- Make the Constitution Prompt extremely detailed, clear, and production-grade.
- Keep everything professional and traceable.

## Response snapshot

Generated comprehensive Customer Success FTE constitution with four major deliverables:

1. **Constitution Prompt** (v1.0): Complete system prompt for Customer Success FTE agent including:
   - 5 registered agents/tools (search_knowledge_base, create_ticket, get_customer_history, escalate_to_human, send_response)
   - 8-step required workflow with mandatory ticket creation and response delivery
   - Channel awareness for Email (500 words), WhatsApp (300 chars), Web Form (300 words)
   - 8 hard constraints and 6 escalation trigger categories
   - Response quality standards, context variables, performance requirements
   - Security protocols, brand voice, database/CRM schema overview, Kafka topics

2. **Complete Workflow**: Detailed execution flow from incoming message to response including:
   - ASCII diagram showing multi-channel architecture (Gmail, WhatsApp, Web Form → Kafka → Agent)
   - Tool calling order table (create_ticket → get_customer_history → search_knowledge_base → escalate_to_human → send_response)
   - Cross-channel memory and ticket creation rules
   - Escalation decision tree with immediate vs conditional escalation paths

3. **Production Folder Structure**: Complete project tree with file purposes:
   - Frontend: Next.js 15 App Router with SupportForm.tsx (React Hook Form + Zod)
   - Backend: FastAPI with agent/, channels/, workers/, database/ structure
   - Kubernetes: namespace, configmap, secrets, deployments, services, HPA, ingress
   - CI/CD: GitHub workflows for backend tests, frontend build, deployment
   - Documentation: ARCHITECTURE.md, API.md, DEPLOYMENT.md, RUNBOOK.md

4. **Very Professional Master Prompt**: Self-contained reference prompt including:
   - Project overview and Agent Maturity Model context
   - Registered agents and tools with exact names
   - Required workflow order and channel requirements
   - Escalation triggers and hard constraints
   - Production folder structure reference
   - How to use in Claude Code (Incubation) and OpenAI Agents SDK (Specialization)

Updated `.specify/memory/constitution.md` with:
- 8 core principles (Multi-Channel First, Ticket-Tracking Mandatory, Escalation-Aware, Knowledge-Grounded, Channel-Adaptive Response, Security & Privacy Non-Negotiable, Observability & Metrics, 24/7 Operational Readiness)
- Additional constraints (technology stack, performance budgets, compliance standards)
- Development workflow (code quality gates, testing requirements, deployment process)
- Governance section with versioning policy and compliance review

## Outcome

- ✅ Impact: Established foundational constitution for Customer Success FTE with all principles, workflows, and folder structure traceable to Requirement.pdf. Constitution is production-ready and can be used immediately in both Incubation (Claude Code) and Specialization (OpenAI Agents SDK) phases.
- 🧪 Tests: N/A at constitution stage - test suite structure defined in production folder structure (test_agent.py, test_multichannel_e2e.py, load_test.py)
- 📁 Files: Created/updated `.specify/memory/constitution.md` with 8 principles, governance, and development workflow. Generated 4 major deliverables in response.
- 🔁 Next prompts: Recommend running `/sp.plan` to create architecture plan, then `/sp.tasks` to generate implementation tasks
- 🧠 Reflection: Constitution successfully captures all requirements from Requirement.pdf including multi-channel architecture, escalation rules, and Agent Maturity Model transition. All principles are declarative and testable.

## Evaluation notes (flywheel)

- Failure modes observed: None - all requirements successfully extracted and formalized
- Graders run and results (PASS/FAIL): N/A (constitution stage)
- Prompt variant: N/A
- Next experiment: Proceed to architecture planning phase with `/sp.plan`
