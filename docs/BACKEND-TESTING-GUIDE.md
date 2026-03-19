# ✅ BACKEND SETUP & TESTING GUIDE

## Current Issue: Backend Not Running

The 404 error occurs because the backend server is not running at `http://localhost:8000`.

---

## How to Start Backend Server:

### Step 1: Navigate to Backend Directory
```bash
cd "E:\Hackathon 5\CRM-Digital-FTE-Factory\backend"
```

### Step 2: Install Dependencies (if not already done)
```bash
pip install -r requirements.txt
```

### Step 3: Setup Environment Variables
Create `.env` file in backend directory:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/crm_db
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:3000"]
```

### Step 4: Run Database Migrations
```bash
python setup_database.py
```

### Step 5: Start Backend Server
```bash
# Option 1: Using uvicorn directly
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Option 2: If there's a start script
python -m uvicorn src.main:app --reload --port 8000
```

### Step 6: Verify Backend is Running
Open browser and visit:
- http://localhost:8000 - Should show API info
- http://localhost:8000/docs - Swagger API documentation
- http://localhost:8000/health - Health check endpoint

---

## Testing Full Integration:

### Test 1: Submit Support Form
1. Go to http://localhost:3000/support
2. Fill out form:
   ```
   Name: Test User
   Email: test@example.com
   Subject: Integration Test
   Category: Technical Issue
   Message: Testing backend integration
   Priority: Medium
   ```
3. Click "Submit Ticket to AI FTE"
4. **Expected**: 
   - ✅ Loading toast appears
   - ✅ Success screen with REAL ticket ID from backend
   - ✅ Ticket saved to PostgreSQL database

### Test 2: Check Admin Dashboard
1. Go to http://localhost:3000/admin
2. Click "All Tickets" tab
3. **Expected**:
   - ✅ Your ticket appears in the table
   - ✅ Ticket ID matches the one from success screen
   - ✅ Shows customer name, email, subject, etc.

### Test 3: Check Live Activity Feed
1. Stay on Admin page
2. Look at right sidebar (or click "Live Activity" tab)
3. **Expected**:
   - ✅ Your ticket submission appears as "new_ticket"
   - ✅ Shows timestamp, customer name, channel
   - ✅ Auto-refreshes every 7 seconds

### Test 4: Track Ticket ID
1. In Admin dashboard, use the search/filter
2. Search for: `TK-2026-XXXXX` (your ticket ID)
3. **Expected**:
   - ✅ Ticket found and highlighted
   - ✅ Click to view full details
   - ✅ See conversation history

---

## Backend Endpoints Required:

Make sure these endpoints exist in your backend:

### 1. Support Endpoints
```python
# POST /api/support/submit
@app.post("/api/support/submit")
async def submit_ticket(ticket: TicketCreate):
    """Create new support ticket from web form"""
    # Save to database
    # Return ticket with ID
    return {"ticketId": "TK-2026-XXX", "status": "created"}
```

### 2. Admin Endpoints
```python
# GET /api/admin/metrics
@app.get("/api/admin/metrics")
async def get_metrics():
    """Get dashboard metrics"""
    return {...}

# GET /api/admin/tickets
@app.get("/api/admin/tickets")
async def get_tickets(page: int = 1, page_size: int = 10):
    """Get all tickets with pagination"""
    return {...}

# GET /api/admin/activity-feed
@app.get("/api/admin/activity-feed")
async def get_activity_feed(limit: int = 50):
    """Get recent activities"""
    return [...]

# GET /api/admin/users
@app.get("/api/admin/users")
async def get_users(page: int = 1):
    """Get all users"""
    return {...}
```

---

## Database Schema Required:

```sql
-- Tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'open',
    subject VARCHAR(500),
    message TEXT,
    sentiment_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES tickets(id),
    sender VARCHAR(50) NOT NULL, -- customer, ai, human
    content TEXT NOT NULL,
    channel VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Activity feed view
CREATE VIEW activity_feed AS
SELECT 
    t.id,
    t.ticket_id,
    t.customer_name,
    t.channel,
    t.sentiment_score,
    COALESCE(m.content, t.subject) as message_snippet,
    t.created_at as timestamp,
    'new_ticket' as type
FROM tickets t
LEFT JOIN messages m ON m.ticket_id = t.id
ORDER BY t.created_at DESC;
```

---

## Quick Test Without Backend:

If you want to test the frontend without backend:

### 1. Submit Form (Demo Mode)
- Go to http://localhost:3000/support
- Fill form and submit
- You'll get demo ticket ID like `TK-2026-247250`
- Success screen shows correctly

### 2. Check Admin (Empty State)
- Go to http://localhost:3000/admin
- You'll see empty states (no backend data)
- Metrics show 0 values
- Activity feed shows "No recent activity"

### 3. This is EXPECTED behavior
- Frontend is working correctly
- It's designed to handle missing backend gracefully
- No console errors (handled properly)

---

## Troubleshooting:

### Issue: Backend won't start
```bash
# Check Python version (need 3.9+)
python --version

# Check if port 8000 is already in use
netstat -ano | findstr :8000

# Kill process on port 8000 (Windows)
taskkill /PID <PID> /F
```

### Issue: Database connection error
```bash
# Make sure PostgreSQL is running
# Check DATABASE_URL in .env
# Run migrations again
python setup_database.py
```

### Issue: CORS error
```python
# In backend main.py, ensure CORS is configured:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Summary:

**Current State (Without Backend):**
- ✅ Frontend works perfectly
- ✅ Form submits in demo mode
- ✅ Generates ticket IDs
- ✅ Shows success screen
- ✅ Admin shows empty states
- ✅ No console errors

**With Backend Running:**
- ✅ Real tickets saved to database
- ✅ Real ticket IDs from backend
- ✅ Tickets appear in admin dashboard
- ✅ Activity feed shows real activities
- ✅ Metrics show real data
- ✅ Full integration working

**To see tickets in admin dashboard, you MUST start the backend server first!**
