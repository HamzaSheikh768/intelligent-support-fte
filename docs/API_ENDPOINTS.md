# API Endpoints Documentation

## Customer Success FTE - API Endpoints

All endpoints are prefixed with `/api/v1`

### Support Endpoints

#### POST `/api/v1/support/submit`
Submit a new support ticket
- **Body**: `{ name, email, subject, category, message, priority, attachments? }`
- **Response**: `{ ticketId, status, message }`

#### GET `/api/v1/support/ticket/{ticketId}`
Get ticket details
- **Response**: Ticket object with messages

### Admin Endpoints

#### GET `/api/v1/admin/metrics`
Get dashboard metrics
- **Response**:
```json
{
  "totalTickets": 1247,
  "openTickets": 23,
  "resolvedTickets": 1198,
  "escalatedTickets": 26,
  "avgResponseTime": 2.4,
  "avgResolutionTime": 15.3,
  "sentimentScore": 0.82,
  "sentimentLabel": "positive",
  "ticketsByChannel": { "whatsapp": 523, "gmail": 412, "webform": 312 },
  "ticketsByStatus": { "open": 23, "resolved": 1198, "escalated": 26 },
  "ticketsByPriority": { "low": 624, "medium": 498, "high": 125 },
  "dailyTickets": []
}
```

#### GET `/api/v1/admin/tickets`
Get all tickets with filtering and pagination
- **Query Params**: `page`, `page_size`, `channel`, `status`, `priority`, `search`
- **Response**: Paginated list of tickets

#### GET `/api/v1/admin/tickets/{ticket_id}`
Get single ticket details
- **Response**: Ticket with messages

#### POST `/api/v1/admin/tickets/{ticket_id}/resolve`
Resolve a ticket
- **Response**: `{ success: true, message: "Ticket resolved" }`

#### POST `/api/v1/admin/tickets/{ticket_id}/escalate`
Escalate a ticket
- **Response**: `{ success: true, message: "Ticket escalated" }`

#### POST `/api/v1/admin/tickets/{ticket_id}/priority`
Update ticket priority
- **Body**: `{ priority: "low" | "medium" | "high" }`
- **Response**: `{ success: true, message: "Priority updated" }`

#### POST `/api/v1/admin/tickets/{ticket_id}/notes`
Add internal note
- **Body**: `{ note: string }`
- **Response**: `{ success: true, message: "Note added" }`

#### GET `/api/v1/admin/activity-feed`
Get recent activity feed
- **Query Params**: `limit` (default: 20)
- **Response**: List of recent activities

#### GET `/api/v1/admin/users`
Get all users
- **Query Params**: `page`, `page_size`, `search`
- **Response**: Paginated list of users

### Escalation Endpoints

#### POST `/api/v1/escalations`
Create escalation
- **Body**: `{ ticket_id, reason, priority }`
- **Response**: Escalation object

#### GET `/api/v1/escalations/{escalation_id}`
Get escalation details

#### POST `/api/v1/escalations/{escalation_id}/resolve`
Resolve escalation

---

## Frontend API Integration

All frontend API calls are in:
- `frontend/src/lib/api/admin.ts` - Admin endpoints
- `frontend/src/lib/api.ts` - Support endpoints

### Example Usage:

```typescript
// Get metrics
import { getMetrics } from "@/lib/api/admin";

const metrics = await getMetrics();

// Get tickets
import { getTickets } from "@/lib/api/admin";

const tickets = await getTickets(
  { channel: "whatsapp", status: "open" },
  1,  // page
  10  // page_size
);

// Resolve ticket
import { resolveTicket } from "@/lib/api/admin";

await resolveTicket(ticketId);
```

---

## Database Tables Used

- `customers` - Customer information
- `tickets` - Support tickets
- `conversations` - Conversation threads
- `messages` - Individual messages
- `customer_identifiers` - Contact method tracking

---

## Status Codes

- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
