# Escalation Rules - Customer Success FTE

## Overview

This document defines when and how the Customer Success Digital FTE should escalate issues to human agents. Proper escalation ensures customer satisfaction while maintaining operational efficiency.

---

## Escalation Priority Levels

| Priority | Response Time | Description | Examples |
|----------|---------------|-------------|----------|
| **URGENT** | Immediate (< 5 min) | Security, legal, severe billing errors | Data breach, lawsuit threat, triple charge |
| **HIGH** | < 1 hour | Critical business impact, enterprise customers | SSO failure, 500+ user enterprise issue |
| **MEDIUM** | < 4 hours | Important but not blocking | Feature not working, single billing issue |
| **LOW** | < 24 hours | General inquiries, feature requests | "How do I...", feedback, suggestions |

---

## Automatic Escalation Triggers

### 1. Legal & Compliance (ALWAYS ESCALATE IMMEDIATELY)

**Keywords to detect**:
- "lawyer", "attorney", "legal", "lawsuit", "sue", "litigation"
- "court", "subpoena", "warrant", "investigation"
- "GDPR", "compliance", "audit", "certification" (when from legal/compliance role)

**Action**: Immediate escalation to Legal Team  
**Priority**: URGENT  
**Message to Customer**: "I understand this is a serious matter. I'm escalating this to our legal team who will contact you within 1 hour."

---

### 2. Security Concerns (ALWAYS ESCALATE IMMEDIATELY)

**Keywords to detect**:
- "unauthorized access", "hacked", "compromised", "breach"
- "suspicious login", "unknown IP", "didn't log in"
- "stolen credentials", "account taken over"

**Action**: Immediate escalation to Security Team  
**Priority**: URGENT  
**Message to Customer**: "Security is our top priority. I'm escalating this to our security team immediately. They will contact you within 30 minutes."

---

### 3. Billing Disputes & Refunds (ESCALATE)

**Keywords to detect**:
- "refund", "chargeback", "dispute", "overcharged"
- "charged twice", "triple charge", "wrong amount"
- "cancel subscription", "cancel account", "closing account"

**Sub-rules**:
- Single refund request under $50 → Can handle with standard refund process
- Multiple charges, amounts over $50, or angry customer → Escalate to Billing
- "Chargeback" or "dispute" mentioned → Escalate immediately

**Action**: Escalate to Billing Team  
**Priority**: HIGH (if angry/urgent), MEDIUM (if calm)  
**Message to Customer**: "I understand your billing concern. I'm connecting you with our billing specialist who can resolve this quickly."

---

### 4. Angry/Upset Customers (ESCALATE BASED ON SENTIMENT)

**Sentiment Score Thresholds**:
- Sentiment < 0.2 → Escalate immediately
- Sentiment 0.2 - 0.3 → Offer escalation, handle with extra care
- Sentiment > 0.3 → Can handle normally

**Anger Indicators**:
- ALL CAPS messages
- Multiple exclamation marks (!!!)
- Profanity or aggressive language
- "This is ridiculous", "worst product", "unacceptable"
- Demands: "I demand", "I want this fixed NOW"

**Action**: Escalate to Customer Success Manager  
**Priority**: HIGH  
**Message to Customer**: "I completely understand your frustration, and I want to make this right. Let me connect you with a specialist who can help resolve this immediately."

---

### 5. Technical Issues After 2 Failed Attempts (ESCALATE)

**Rule**: If the FTE cannot resolve a technical issue after 2 solution attempts, escalate.

**Tracking**:
- Attempt 1: Provide solution, wait for response
- Attempt 2: Provide alternative solution, wait for response
- If still unresolved → Escalate

**Action**: Escalate to Technical Support  
**Priority**: MEDIUM (or HIGH if business-critical)  
**Message to Customer**: "I want to make sure you get the expert help you need. I'm escalating this to our technical team who can dive deeper into this issue."

---

### 6. Explicit Human Request (ESCALATE)

**Keywords to detect**:
- "human", "real person", "live agent", "support agent"
- "talk to someone", "speak with someone"
- "this is too complex", "need help from person"

**Action**: Escalate to Available Human Agent  
**Priority**: MEDIUM  
**Message to Customer**: "Of course! I'm connecting you with a human agent who will be happy to assist you. They'll be with you shortly."

---

### 7. Enterprise & High-Value Customers (ESCALATE FOR SPECIAL HANDLING)

**Criteria**:
- Customer from enterprise domain (500+ employees)
- Customer on Enterprise plan
- Partnership, reseller, or integration inquiries
- Training requests for large teams (50+ people)

**Action**: Escalate to Enterprise Success Team  
**Priority**: HIGH  
**Message to Customer**: "Thank you for reaching out. I'm connecting you with our enterprise team who specializes in supporting organizations like yours."

---

### 8. Sales & Partnership Inquiries (ESCALATE)

**Keywords to detect**:
- "partnership", "reseller", "white-label", "API integration"
- "enterprise pricing", "custom pricing", "500 users"
- "business development", "sales team"

**Action**: Escalate to Sales/Business Development  
**Priority**: HIGH  
**Message to Customer**: "Thank you for your interest! I'm connecting you with our business team who can discuss this opportunity with you."

---

## Escalation Decision Tree

```
Customer Message Received
         │
         ▼
┌─────────────────────────┐
│ Check for URGENT        │
│ triggers:               │
│ - Legal/Lawsuit         │
│ - Security breach       │
│ - Data breach           │
└───────────┬─────────────┘
            │
    ┌───────┴───────┐
    │               │
   YES             NO
    │               │
    ▼               ▼
┌─────────┐   ┌──────────────────┐
│ESCALATE │   │ Check sentiment  │
│URGENT   │   │ score & anger    │
│Priority │   │ indicators       │
└─────────┘   └────────┬─────────┘
                       │
              ┌────────┴────────┐
              │                 │
         Sentiment         Sentiment
         < 0.2             >= 0.2
              │                 │
              ▼                 ▼
       ┌──────────┐     ┌──────────────────┐
       │ ESCALATE │     │ Check if human   │
       │ HIGH     │     │ requested        │
       └──────────┘     └────────┬─────────┘
                                 │
                        ┌────────┴────────┐
                        │                 │
                       YES               NO
                        │                 │
                        ▼                 ▼
                 ┌──────────┐     ┌──────────────────┐
                 │ ESCALATE │     │ Attempt to       │
                 │ to human │     │ resolve (max 2x) │
                 └──────────┘     └────────┬─────────┘
                                          │
                                  ┌───────┴───────┐
                                  │               │
                              Resolved      Not resolved
                                  │               │
                                  ▼               ▼
                           ┌──────────┐   ┌──────────────────┐
                           │ CLOSE    │   │ ESCALATE to      │
                           │ ticket   │   │ technical team   │
                           └──────────┘   └──────────────────┘
```

---

## Escalation Message Templates

### Template 1: Security Escalation

```
Subject: Urgent: Security Concern - Ticket #[TICKET_ID]

Hi [Customer Name],

Thank you for bringing this to our attention. Security is our top priority, and I want to ensure this gets the immediate attention it deserves.

I'm escalating this to our Security Team who will:
- Investigate the issue immediately
- Secure your account if needed
- Provide you with next steps

A security specialist will contact you within 30 minutes at [Customer Email/Phone].

If you notice any additional suspicious activity, please reply to this message immediately.

Best regards,
[Agent Name]
Customer Success Team
```

### Template 2: Billing Escalation

```
Subject: Billing Review - Ticket #[TICKET_ID]

Hi [Customer Name],

I understand your concern about the billing issue, and I want to make sure this is resolved quickly and accurately.

I'm connecting you with our Billing Specialist who will:
- Review your account and charges
- Explain any discrepancies
- Process refunds if applicable

A billing specialist will contact you within 1 hour at [Customer Email/Phone].

Thank you for your patience.

Best regards,
[Agent Name]
Customer Success Team
```

### Template 3: Technical Escalation

```
Subject: Technical Support Escalation - Ticket #[TICKET_ID]

Hi [Customer Name],

Thank you for your patience as we've worked to resolve this issue.

I'm escalating this to our Technical Support Team who specializes in [specific issue]. They will:
- Perform a deep dive into the issue
- Provide advanced troubleshooting
- Work with engineering if needed

A technical specialist will contact you within 4 hours at [Customer Email/Phone].

Ticket Reference: #[TICKET_ID]

Best regards,
[Agent Name]
Customer Success Team
```

### Template 4: Human Agent Handoff

```
Subject: Connecting You with a Specialist - Ticket #[TICKET_ID]

Hi [Customer Name],

I'm connecting you with a human agent who will be happy to assist you further.

A customer success specialist will contact you within 2 hours at [Customer Email/Phone].

Ticket Reference: #[TICKET_ID]

Is there anything specific you'd like me to note for the specialist?

Best regards,
[Agent Name]
Customer Success Team
```

---

## Escalation Routing Matrix

| Issue Type | Team | Contact Method | SLA |
|------------|------|----------------|-----|
| Security breach | Security Team | Slack #security-urgent + PagerDuty | 15 min |
| Legal request | Legal Team | Email legal@taskflowpro.com + Slack | 1 hour |
| Billing dispute | Billing Team | Zendesk queue + Slack #billing | 1 hour |
| Technical bug | Engineering | J escalation + Slack #support-eng | 4 hours |
| Enterprise issue | Enterprise Success | Slack #enterprise-support | 1 hour |
| Sales inquiry | Sales | Slack #sales-leads + CRM | 2 hours |
| Partnership | Business Dev | Email partnerships@ + Slack | 4 hours |
| Training request | Customer Success | Slack #customer-success | 4 hours |
| Angry customer | CSM Manager | Slack #escalations | 30 min |

---

## De-escalation Techniques (Try Before Escalating)

### Technique 1: Acknowledge & Empathize

**Template**: "I completely understand why this is frustrating. Let me see what I can do to help."

**When to use**: Customer shows any sign of frustration (sentiment 0.3-0.5)

---

### Technique 2: Take Ownership

**Template**: "I'm going to personally make sure this gets resolved for you."

**When to use**: Customer feels ignored or passed around

---

### Technique 3: Provide Timeline

**Template**: "Here's what I'm going to do, and here's when you can expect to hear back from me."

**When to use**: Customer is anxious about resolution time

---

### Technique 4: Offer Options

**Template**: "I can help you with [Option A] or [Option B]. Which would you prefer?"

**When to use**: Customer feels out of control

---

## Post-Escalation Follow-up

### FTE Responsibilities After Escalation

1. **Log Escalation**: Record escalation reason, priority, and team in ticket
2. **Set Reminder**: Follow up in 24 hours if no resolution
3. **Customer Update**: Send brief "we're still working on it" message if >24 hours
4. **Close Loop**: Confirm resolution with customer when team provides fix

### Escalation Metrics to Track

| Metric | Target | Measurement |
|--------|--------|-------------|
| Escalation Rate | < 20% | Escalations / Total tickets |
| Time to Escalate | < 5 min (urgent), < 1 hour (high) | From ticket creation to escalation |
| Escalation Resolution Time | < 4 hours (urgent), < 24 hours (high) | From escalation to resolution |
| Re-escalation Rate | < 5% | Tickets escalated twice / Total escalations |
| Customer Satisfaction (escalated) | > 85% | Post-resolution survey |

---

## Special Handling Notes

### VIP Customers

**Definition**: Enterprise plan, C-level executives, partners

**Handling**:
- Always escalate to dedicated success manager
- Priority: HIGH minimum
- Response SLA: 1 hour maximum

### Regulatory Requests

**Definition**: GDPR, CCPA, data access requests

**Handling**:
- Escalate to compliance team
- Do NOT promise specific data handling
- Standard response: "I'm escalating this to our compliance team who handles these requests"

### Press & Media Inquiries

**Definition**: Journalists, bloggers, reviewers

**Handling**:
- Escalate to PR/Communications team
- Do NOT comment on behalf of company
- Standard response: "I'll connect you with our communications team"

---

**Last Updated**: March 2026  
**Document Owner**: Head of Customer Success  
**Review Cycle**: Quarterly
