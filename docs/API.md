# Customer Success FTE - API Documentation

**Base URL**: `http://localhost:8000/api/v1`
**Version**: 1.0.0
**Last Updated**: 2026-03-17

---

## Authentication

Currently, the API does not require authentication for internal use. For production deployments, implement API key or JWT authentication.

---

## Endpoints

### Health Check

**GET** `/health`

Check system health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-17T12:00:00Z",
  "environment": "production",
  "channels": {
    "email": "active",
    "whatsapp": "active",
    "web_form": "active"
  }
}
```

---

### Support Form

#### Submit Support Form

**POST** `/support/submit`

Submit a customer support request via web form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Help with API authentication",
  "category": "technical",
  "priority": "medium",
  "message": "I'm having trouble authenticating with the API. Can you help?",
  "attachments": []
}
```

**Response (201 Created):**
```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Thank you for contacting us! Our AI assistant will respond shortly.",
  "estimated_response_time": "Usually within 5 minutes"
}
```

**Error Responses:**

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Invalid input data |
| 422 | Validation Error | Schema validation failed |
| 500 | Internal Server Error | Server error |

**Example (422):**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

#### Get Ticket Status

**GET** `/support/ticket/{ticket_id}`

Get status and conversation history for a ticket.

**Path Parameters:**
- `ticket_id` (string, UUID): Ticket identifier

**Response (200 OK):**
```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "created_at": "2026-03-17T12:00:00Z",
  "last_updated": "2026-03-17T12:05:00Z",
  "messages": [
    {
      "id": "msg-001",
      "channel": "web_form",
      "direction": "inbound",
      "role": "customer",
      "content": "I'm having trouble with...",
      "created_at": "2026-03-17T12:00:00Z"
    },
    {
      "id": "msg-002",
      "channel": "web_form",
      "direction": "outbound",
      "role": "agent",
      "content": "Thank you for reaching out...",
      "created_at": "2026-03-17T12:05:00Z"
    }
  ]
}
```

**Error Responses:**

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Invalid ticket ID format |
| 404 | Not Found | Ticket not found |

---

### Escalations

#### Create Escalation

**POST** `/escalations/`

Escalate a ticket to human support.

**Request Body:**
```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "pricing_inquiry",
  "urgency": "high",
  "notes": "Customer asking about enterprise pricing"
}
```

**Valid Reason Codes:**
- `pricing_inquiry` - Customer asking about pricing
- `refund_request` - Customer requesting refund
- `legal_issue` - Legal mentions (lawyer, lawsuit)
- `security_concern` - Security breach reports
- `angry_customer` - Very negative sentiment
- `technical_complex` - Complex technical issue
- `human_requested` - Customer requested human
- `billing_dispute` - Billing dispute

**Response (201 Created):**
```json
{
  "escalation_id": "660e8400-e29b-41d4-a716-446655440001",
  "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "escalated",
  "message": "Escalated to human support with high priority",
  "estimated_response_time": "1 hour"
}
```

**Estimated Response Times by Urgency:**
- `urgent`: 15 minutes
- `high`: 1 hour
- `normal`: 4 hours

---

#### Get Escalation Reasons

**GET** `/escalations/reasons`

Get all valid escalation reason codes.

**Response (200 OK):**
```json
[
  {
    "code": "pricing_inquiry",
    "description": "Customer asking about pricing or plans",
    "auto_escalate": true
  },
  {
    "code": "refund_request",
    "description": "Customer requesting refund or chargeback",
    "auto_escalate": true
  },
  {
    "code": "legal_issue",
    "description": "Legal mentions (lawyer, lawsuit, etc.)",
    "auto_escalate": true
  },
  {
    "code": "security_concern",
    "description": "Security breach or unauthorized access",
    "auto_escalate": true
  },
  {
    "code": "angry_customer",
    "description": "Customer sentiment very negative (< 0.2)",
    "auto_escalate": true
  },
  {
    "code": "technical_complex",
    "description": "Technical issue unresolved after 2 attempts",
    "auto_escalate": false
  },
  {
    "code": "human_requested",
    "description": "Customer explicitly requested human agent",
    "auto_escalate": true
  },
  {
    "code": "billing_dispute",
    "description": "Billing dispute or duplicate charge",
    "auto_escalate": true
  }
]
```

---

#### Get Escalation Status

**GET** `/escalations/{escalation_id}`

Get status of an escalation.

**Path Parameters:**
- `escalation_id` (string, UUID): Escalation identifier

**Response (200 OK):**
```json
{
  "escalation_id": "660e8400-e29b-41d4-a716-446655440001",
  "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "assigned",
  "assigned_to": "agent@example.com",
  "created_at": "2026-03-17T12:00:00Z",
  "estimated_response_time": "1 hour"
}
```

---

### Webhooks

#### Gmail Webhook

**POST** `/webhooks/gmail`

Handle Gmail push notifications from Pub/Sub.

**Request Body:**
```json
{
  "message": {
    "data": "base64_encoded_data",
    "messageId": "msg-123",
    "historyId": "456"
  },
  "subscription": "projects/my-project/subscriptions/gmail-push"
}
```

**Response (200 OK):**
```json
{
  "status": "processed",
  "messageId": "msg-123"
}
```

---

#### WhatsApp Webhook

**POST** `/webhooks/whatsapp`

Handle incoming WhatsApp messages from Twilio.

**Request Headers:**
- `X-Twilio-Signature`: Twilio webhook signature

**Request Body (Form Data):**
```
MessageSid=SM123
From=whatsapp:+1234567890
Body=Hello, I need help
ProfileName=John Doe
WaId=+1234567890
```

**Response (200 OK):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>
```

---

#### WhatsApp Status Webhook

**POST** `/webhooks/whatsapp/status`

Handle WhatsApp message status updates.

**Request Body (Form Data):**
```
MessageSid=SM123
MessageStatus=delivered
```

**Response (200 OK):**
```json
{
  "status": "received"
}
```

---

### Metrics

#### Get Channel Metrics

**GET** `/metrics/channels`

Get performance metrics by channel.

**Response (200 OK):**
```json
{
  "email": {
    "channel": "email",
    "total_conversations": 150,
    "avg_sentiment": 0.65,
    "total_escalations": 25
  },
  "whatsapp": {
    "channel": "whatsapp",
    "total_conversations": 300,
    "avg_sentiment": 0.72,
    "total_escalations": 40
  },
  "web_form": {
    "channel": "web_form",
    "total_conversations": 200,
    "avg_sentiment": 0.58,
    "total_escalations": 35
  }
}
```

---

## Rate Limiting

| Endpoint | Rate Limit |
|----------|------------|
| `/support/submit` | 60 requests/minute |
| `/support/ticket/{id}` | 100 requests/minute |
| `/escalations/` | 30 requests/minute |
| `/metrics/*` | 10 requests/minute |
| `/webhooks/*` | No limit (internal only) |

**Rate Limit Response (429 Too Many Requests):**
```json
{
  "detail": "Rate limit exceeded. Try again in 60 seconds."
}
```

---

## Error Codes

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid request data |
| 403 | Forbidden | Invalid webhook signature |
| 404 | Not Found | Resource not found |
| 422 | Validation Error | Schema validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Application Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `TICKET_NOT_FOUND` | Ticket ID doesn't exist | Verify ticket ID |
| `INVALID_CATEGORY` | Invalid ticket category | Use valid category |
| `ESCALATION_FAILED` | Escalation processing failed | Retry or contact admin |
| `CHANNEL_ERROR` | Channel integration error | Check channel status |

---

## Data Models

### Customer

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "customer@example.com",
  "phone": "+1234567890",
  "name": "John Doe",
  "created_at": "2026-03-17T12:00:00Z"
}
```

### Ticket

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "customer_id": "550e8400-e29b-41d4-a716-446655440000",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440001",
  "source_channel": "web_form",
  "category": "technical",
  "priority": "medium",
  "status": "open",
  "created_at": "2026-03-17T12:00:00Z",
  "resolved_at": null,
  "resolution_notes": null
}
```

### Conversation

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "customer_id": "550e8400-e29b-41d4-a716-446655440000",
  "initial_channel": "web_form",
  "started_at": "2026-03-17T12:00:00Z",
  "ended_at": null,
  "status": "active",
  "sentiment_score": 0.65,
  "resolution_type": null
}
```

### Message

```json
{
  "id": "msg-001",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440001",
  "channel": "web_form",
  "direction": "inbound",
  "role": "customer",
  "content": "I need help with...",
  "created_at": "2026-03-17T12:00:00Z",
  "delivery_status": "sent"
}
```

---

## OpenAPI Specification

The full OpenAPI 3.0 specification is available at:
- **Interactive Docs**: `http://localhost:8000/docs`
- **JSON Spec**: `http://localhost:8000/openapi.json`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Code Examples

### Python Example - Submit Support Form

```python
import requests

url = "http://localhost:8000/api/v1/support/submit"
data = {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "API Help",
    "category": "technical",
    "priority": "medium",
    "message": "I need help with API authentication"
}

response = requests.post(url, json=data)
print(response.json())
# {"ticket_id": "...", "message": "Thank you..."}
```

### JavaScript Example - Get Ticket Status

```javascript
const ticketId = '550e8400-e29b-41d4-a716-446655440000';

fetch(`http://localhost:8000/api/v1/support/ticket/${ticketId}`)
  .then(response => response.json())
  .then(data => console.log(data));
```

### cURL Example - Create Escalation

```bash
curl -X POST http://localhost:8000/api/v1/escalations/ \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
    "reason": "pricing_inquiry",
    "urgency": "high"
  }'
```

---

**API Maintainer**: Engineering Team
**Support**: support@taskflowpro.com
