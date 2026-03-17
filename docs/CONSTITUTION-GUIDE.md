# Constitution Guide for Customer Success FTE

This guide explains how to use the **Customer Success FTE Constitution** during development, planning, and implementation.

---

## Constitution Location

The constitution is located at:

```
.specify/memory/constitution.md
```

This file is the **authoritative reference** for all development decisions related to the Customer Success FTE.

---

## Constitution Structure

The constitution contains four main sections:

### 1. Core Principles (8 Principles)

| Principle | Description |
| :---- | :---- |
| **I. Multi-Channel First** | Unify customer identity across Email, WhatsApp, Web Form |
| **II. Ticket-Tracking Mandatory** | ALWAYS create ticket before any response |
| **III. Escalation-Aware** | Detect triggers and escalate appropriately |
| **IV. Knowledge-Grounded** | ALL responses grounded in knowledge base |
| **V. Channel-Adaptive Response** | Format for Email (500w), WhatsApp (300c), Web (300w) |
| **VI. Security & Privacy Non-Negotiable** | Verify identity, encrypt data, comply with regulations |
| **VII. Observability & Metrics** | Log all interactions, track performance per channel |
| **VIII. 24/7 Operational Readiness** | 99.9% uptime, Kubernetes auto-scaling |

Each principle includes:
- **Name**: Clear, declarative title
- **Description**: What MUST be done (non-negotiable rules)
- **Rationale**: Why this principle exists (business/technical justification)

### 2. Additional Constraints

- **Technology Stack Requirements**: FastAPI, Next.js 16, PostgreSQL, Kafka, Kubernetes, OpenAI Agents SDK
- **Performance Budgets**: Response time p95 < 3s, throughput 1000+ concurrent, accuracy > 85%
- **Compliance Standards**: Data retention (7 years), right to erasure (30 days), audit trail, access control

### 3. Development Workflow

- **Code Quality Gates**: mypy strict, ruff zero violations, black formatting, pytest > 80% coverage
- **Testing Requirements**: Unit tests, integration tests (test_multichannel_e2e.py), load tests (Locust)
- **Deployment Process**: CI → Staging → Production with monitoring
- **Documentation Requirements**: ARCHITECTURE.md, API.md, DEPLOYMENT.md, RUNBOOK.md

### 4. Governance

- **Amendment Process**: Proposal → Review (48h) → Approval → Migration Plan → Documentation
- **Versioning Policy**: Semantic versioning (MAJOR.MINOR.PATCH)
- **Compliance Review**: All PRs MUST be reviewed for constitution compliance

---

## When to Use the Constitution

### During Planning (`/sp.plan`)

Before creating the architecture plan, review these principles:
- **Principle I (Multi-Channel First)**: Ensure architecture supports all 3 channels
- **Principle VII (Observability & Metrics)**: Include logging and metrics in design
- **Principle VIII (24/7 Operational Readiness)**: Plan for high availability, auto-scaling

**Constitution Check**: The plan template includes a "Constitution Check" section. Verify your design aligns with all 8 principles.

### During Task Creation (`/sp.tasks`)

When breaking down work into tasks:
- **Principle II (Ticket-Tracking Mandatory)**: Ensure ticket creation is in workflow
- **Principle III (Escalation-Aware)**: Include escalation logic tasks
- **Principle V (Channel-Adaptive Response)**: Create separate tasks for channel formatting

**Task Traceability**: Each task should reference which principle(s) it implements.

### During Implementation (`/sp.implement`)

When writing code:
- **Principle IV (Knowledge-Grounded)**: Never hardcode product info; always search knowledge base
- **Principle VI (Security & Privacy Non-Negotiable)**: Verify customer identity before sharing data
- **Principle VII (Observability & Metrics)**: Log all interactions with structured logging

**Code Review**: Reviewers MUST check constitution compliance using the checklist below.

### During Testing

When writing tests:
- **Principle III (Escalation-Aware)**: Test all escalation triggers
- **Principle V (Channel-Adaptive Response)**: Test response length limits per channel
- **Principle VIII (24/7 Operational Readiness)**: Load test, chaos test, pod restart test

---

## Constitution Compliance Checklist

Use this checklist for PR reviews:

### Code Compliance

- [ ] **Principle I**: Code handles all 3 channels (Email, WhatsApp, Web Form)
- [ ] **Principle II**: `create_ticket` is called BEFORE any response
- [ ] **Principle III**: All escalation triggers are detected and handled
- [ ] **Principle IV**: No hardcoded product information; knowledge base search used
- [ ] **Principle V**: Response formatting respects channel limits (500w/300c/300w)
- [ ] **Principle VI**: Customer identity verified before data access
- [ ] **Principle VII**: Structured logging includes customer_id, ticket_id, channel, latency_ms
- [ ] **Principle VIII**: No single points of failure; graceful error handling

### Documentation Compliance

- [ ] Architecture diagram shows multi-channel flow
- [ ] API docs include all endpoints with request/response schemas
- [ ] Runbook includes escalation procedures
- [ ] Deployment guide covers Kubernetes setup

### Testing Compliance

- [ ] Unit tests for all tools and handlers
- [ ] Integration test for cross-channel continuity
- [ ] Load test simulating 100+ concurrent users
- [ ] All escalation triggers tested

---

## Constitution Amendment Process

If you need to modify the constitution:

### Step 1: Create Proposal

Create a document with:
- **Proposed Change**: What principle/section to modify
- **Rationale**: Why the change is needed
- **Impact Analysis**: What code/tests/docs will be affected
- **Migration Plan**: How to transition (if breaking change)

### Step 2: Team Review

- Post proposal in team channel
- Allow minimum 48 hours for feedback (non-critical changes)
- Address all concerns and iterate

### Step 3: Approval

- Technical lead approval (required)
- Product owner approval (required for business logic changes)

### Step 4: Update Constitution

- Edit `.specify/memory/constitution.md`
- Update version number (semantic versioning)
- Update "Last Amended" date
- Add entry to SYNC IMPACT REPORT at top of file

### Step 5: Communicate

- Announce change in team channel
- Update runbooks if operational procedures changed
- Update templates if workflow changed

---

## Version History

| Version | Date | Changes |
| :---- | :---- | :---- |
| **1.0.0** | 2026-03-12 | Initial constitution creation (8 principles, governance) |

---

## Quick Reference

### Tool Calling Order (Principle II)

```
1. create_ticket (MANDATORY - before any response)
2. get_customer_history
3. search_knowledge_base (if product questions)
4. escalate_to_human (if triggers detected)
5. send_response (MANDATORY - always use this tool)
```

### Escalation Triggers (Principle III)

**Immediate Escalation**:
- Legal mentions: "lawyer", "sue", "attorney"
- Aggressive language (sentiment < 0.3)
- Explicit human request: "human", "agent", "representative"
- Pricing inquiries, refund requests
- Security concerns, data breaches

**After 2 Failed Attempts**:
- Cannot find relevant information after 2 searches
- Customer dissatisfaction after 2 resolution attempts

### Channel Response Limits (Principle V)

| Channel | Max Length | Style |
| :---- | :---- | :---- |
| **Email** | 500 words | Formal, detailed, greeting + signature |
| **WhatsApp** | 300 chars preferred (1600 hard) | Conversational, concise, emoji |
| **Web Form** | 300 words | Semi-formal, helpful |

### Performance Budgets (Principle VII)

- **Response Time**: p95 < 3 seconds (processing), < 30 seconds (delivery)
- **Accuracy**: > 85% on test set
- **Escalation Rate**: < 20%
- **First-Contact Resolution**: > 70%
- **Uptime**: 99.9%

---

## Related Files

| File | Purpose |
| :---- | :---- |
| `.specify/memory/constitution.md` | ⭐ The Constitution (authoritative reference) |
| `docs/ARCHITECTURE.md` | System architecture aligned with principles |
| `docs/RUNBOOK.md` | Operational procedures (escalation, incidents) |
| `backend/src/agent/prompts.py` | System prompt implementing constitution |
| `backend/src/agent/tools.py` | Function tools implementing workflow |
| `AGENTS.md` | Agent definitions and workflow |

---

## Need Help?

If you're unsure whether something complies with the constitution:

1. **Re-read the principle**: Check the exact wording in `.specify/memory/constitution.md`
2. **Check rationale**: Understand WHY the principle exists
3. **Ask team**: Post question in team channel with principle reference
4. **Propose clarification**: If principle is ambiguous, propose clarification via amendment process

**Remember**: The constitution is a living document. If a principle doesn't make sense or needs updating, follow the amendment process.

---

**Last Updated**: 2026-03-12 | **Constitution Version**: 1.0.0
