<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 (template) → 1.0.0 (initial)
Bump rationale: MAJOR - Initial constitution creation for Customer Success FTE

Modified Principles:
- All principles newly created from template (no prior versions)

Added Sections:
- I. Multi-Channel First
- II. Ticket-Tracking Mandatory
- III. Escalation-Aware
- IV. Knowledge-Grounded
- V. Channel-Adaptive Response
- VI. Security & Privacy Non-Negotiable
- VII. Observability & Metrics
- VIII. 24/7 Operational Readiness

Removed Sections: None

Templates Requiring Updates:
- ✅ .specify/templates/plan-template.md (Constitution Check section aligns)
- ✅ .specify/templates/spec-template.md (User scenarios align with principles)
- ✅ .specify/templates/tasks-template.md (Task phases align with workflow)

Follow-up TODOs:
- TODO(ESCALATION_MATRIX): Create detailed escalation decision matrix in docs/
- TODO(PERFORMANCE_BASELINE): Measure and document baseline metrics after first deployment
-->

# Customer Success FTE Constitution

## Core Principles

### I. Multi-Channel First
Every customer interaction MUST be handled consistently across all supported channels (Email/Gmail, WhatsApp, Web Form). The system MUST unify customer identity across channels using email addresses and phone numbers as primary keys. Cross-channel conversation continuity is MANDATORY - if a customer contacts us via any channel, their complete history from ALL channels MUST be retrieved and acknowledged.

**Rationale**: Customers expect seamless support regardless of how they reach out. Channel silos create fragmented experiences and force customers to repeat themselves.

### II. Ticket-Tracking Mandatory (NON-NEGOTIABLE)
ALWAYS create a ticket at the start of EVERY customer interaction, before any response is sent. Every ticket MUST include: customer_id, issue description, priority level, source channel, and timestamp. Tickets MUST track lifecycle status (open → processing → resolved/escalated) with resolution notes. No customer interaction occurs without a ticket_id.

**Rationale**: Complete audit trail is essential for accountability, metrics, compliance, and handoff to human agents.

### III. Escalation-Aware
The agent MUST detect escalation triggers and escalate appropriately. Immediate escalation required for: legal mentions ("lawyer", "sue", "attorney"), aggressive language (sentiment < 0.3), explicit human requests, pricing inquiries, refund requests, security concerns. After 2 failed resolution attempts, MUST escalate. Escalation MUST include full context and reason code.

**Rationale**: Recognizing limitations and escalating appropriately prevents customer dissatisfaction and protects the company from legal/financial risks.

### IV. Knowledge-Grounded
ALL product information responses MUST be grounded in the knowledge base. NEVER speculate, make assumptions, or promise features not in documentation. Search knowledge base before answering product questions (max 5 results with relevance scores). If no relevant information found after 2 searches, escalate to human.

**Rationale**: Accuracy and consistency in product information builds trust and prevents misinformation.

### V. Channel-Adaptive Response
Responses MUST be formatted appropriately for the target channel:
- **Email**: Formal tone, detailed (up to 500 words), proper greeting and signature, ticket reference
- **WhatsApp**: Conversational, concise (under 300 chars preferred, 1600 hard limit), emoji for friendliness
- **Web Form**: Semi-formal, balanced detail (up to 300 words), helpful tone

NEVER exceed channel response limits. ALWAYS use the send_response tool to ensure proper channel formatting.

**Rationale**: Different channels have different user expectations and technical constraints. Adaptation improves customer experience.

### VI. Security & Privacy Non-Negotiable
NEVER access or share customer data without proper authentication. Verify customer identity (email/phone) before sharing account details. NEVER store sensitive information in plain text. Encrypt all customer data transmission. Follow principle of least privilege for data access. Report security incidents immediately. Comply with all data protection regulations.

**Rationale**: Customer trust and legal compliance depend on rigorous security and privacy practices.

### VII. Observability & Metrics
ALL interactions MUST be logged with structured logging including: customer_id, ticket_id, channel, timestamps, latency_ms, tool_calls, sentiment_score. Performance metrics MUST be tracked per channel: response time, accuracy, escalation rate, first-contact resolution, customer satisfaction. Metrics published to Kafka topic fte.metrics for real-time monitoring.

**Rationale**: Observability enables performance optimization, incident detection, and continuous improvement.

### VIII. 24/7 Operational Readiness
The system MUST operate continuously with 99.9% uptime. Kubernetes deployment with auto-scaling (3-20 API pods, 3-30 worker pods). Health checks every 30 seconds. Graceful handling of pod restarts, database connection failures, and Kafka outages. Dead letter queue for failed message processing. Background metrics collection and alerting.

**Rationale**: Customer issues don't follow business hours. 24/7 availability is a core value proposition.

## Additional Constraints

### Technology Stack Requirements
- **Backend**: FastAPI with Python 3.11+, async/await patterns throughout
- **Frontend**: Next.js 16 App Router with TypeScript, React Hook Form, Zod validation
- **Database**: PostgreSQL 16 with pgvector extension for semantic search
- **Streaming**: Apache Kafka with aiokafka for async event processing
- **Orchestration**: Kubernetes with HorizontalPodAutoscaler for auto-scaling
- **Agent Framework**: OpenAI Agents SDK with @function_tool decorators

### Performance Budgets
- **Response Time**: p95 < 3 seconds (processing), < 30 seconds (delivery)
- **Throughput**: Handle 1000+ concurrent conversations
- **Accuracy**: > 85% on test set of 50+ sample tickets
- **Escalation Rate**: < 20% of total interactions
- **Cross-Channel ID**: > 95% accuracy in customer resolution

### Compliance Standards
- **Data Retention**: Customer data retained for 7 years minimum (audit requirements)
- **Right to Erasure**: Support customer data deletion requests within 30 days
- **Audit Trail**: All interactions logged with immutable timestamps
- **Access Control**: Role-based access for human agents viewing escalated tickets

## Development Workflow

### Code Quality Gates
- **Type Safety**: mypy strict mode, no Any types without justification
- **Linting**: ruff with project-specific rules, zero violations allowed
- **Formatting**: black with 100-char line length, consistent formatting
- **Testing**: pytest with > 80% code coverage, all tests must pass before merge

### Testing Requirements
- **Unit Tests**: All tools, handlers, and formatters must have unit tests
- **Integration Tests**: End-to-end multi-channel tests (test_multichannel_e2e.py)
- **Load Tests**: Locust-based load testing simulating 100+ concurrent users
- **Edge Cases**: Test all escalation triggers, empty messages, invalid input

### Deployment Process
1. **CI Pipeline**: Automated tests, linting, type checking, Docker build
2. **Staging**: Deploy to staging namespace, run smoke tests
3. **Production**: kubectl apply or Helm upgrade with rollback capability
4. **Monitoring**: Verify health checks, metrics streaming, alerting active

### Documentation Requirements
- **ARCHITECTURE.md**: System design, component interactions, data flow diagrams
- **API.md**: Complete API reference with request/response examples
- **DEPLOYMENT.md**: Step-by-step deployment guide for local, K8s, cloud
- **RUNBOOK.md**: Incident response procedures, troubleshooting, on-call rotation

## Governance

This constitution supersedes all other practices and guidelines for the Customer Success FTE project. Amendments require:

1. **Proposal**: Document proposed change with rationale and impact analysis
2. **Review**: Team review period (minimum 48 hours for non-critical changes)
3. **Approval**: Consensus from technical lead and product owner
4. **Migration Plan**: If breaking change, include migration strategy and timeline
5. **Documentation**: Update constitution, communicate changes to team, update runbooks

**Versioning Policy**: Semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: Backward-incompatible changes (principle removals, redefinitions)
- MINOR: New principles, sections, or material expansions
- PATCH: Clarifications, wording improvements, typo fixes

**Compliance Review**: All PRs MUST be reviewed for constitution compliance. Complexity must be justified against principles. Use `.specify/memory/constitution.md` as the authoritative reference during development.

**Version**: 1.0.0 | **Ratified**: 2026-03-12 | **Last Amended**: 2026-03-12
