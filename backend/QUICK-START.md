# 🚀 QUICK START - Testing & Setup

## One-Line Commands

### Test Everything
```bash
cd backend && python test_full_system.py
```

### Setup Database
```bash
cd backend && python setup_database.py
```

### Start Server
```bash
cd backend && python -m uvicorn src.main:app --reload
```

---

## What Was Fixed

### ✅ Database Connection
- **Before:** `postgresql://` (wrong driver)
- **After:** `postgresql+asyncpg://` (correct)
- **Fix:** Auto-converted in `session.py`

### ✅ Tables Created
- **Before:** No tables in Neon
- **After:** All 7 tables created
- **Fix:** Run `python setup_database.py`

### ✅ Ticket Creation
- **Before:** Failed (no tables)
- **After:** Works perfectly
- **Test:** `test_full_system.py` creates real tickets

### ⚠️ Email Sending
- **Status:** Needs Gmail credentials
- **Location:** `backend/secrets/credentials.json`
- **Test:** Skipped if credentials missing

---

## Test Output Example

```
======================================================================
                     TEST 1: DATABASE CONNECTION
======================================================================
✅ Database Connected Successfully!

======================================================================
                      TEST 2: TABLE VERIFICATION
======================================================================
✅ All required tables exist!
Table row counts:
  - customers: 0 rows
  - tickets: 0 rows
  ...

======================================================================
                    TEST 3: END-TO-END TICKET FLOW
======================================================================
✅ Customer created: 6ee9c914-b480-47d1-b7db-3c1b006b21a5
✅ Ticket created: b68dd06b-928e-4f5e-a1f5-11d07f89ec9d
✅ Agent responded successfully!

======================================================================
                             TEST SUMMARY
======================================================================
Database Connection            ✅ PASS
Tables Created                 ✅ PASS
Ticket Created                 ✅ PASS
Agent Responded                ✅ PASS
Email Sent                     ❌ FAIL (expected)

Overall: 4/5 tests passed
```

---

## Files Created

1. **`backend/test_full_system.py`** - Complete system test
2. **`backend/setup_database.py`** - Database setup script
3. **`backend/TEST-RESULTS.md`** - Detailed test results
4. **`backend/QUICK-START.md`** - This file

---

## Troubleshooting

### Error: "No module named 'psycopg2'"
**Already fixed!** The code auto-converts to asyncpg.

### Error: "401 Invalid API Key"
Update your OpenRouter API key in `.env`:
```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-key
```

### Error: "sslmode parameter..."
**Already fixed!** Query params are auto-removed.

### Need to update system DATABASE_URL?
```powershell
setx DATABASE_URL "postgresql+asyncpg://your-neon-url"
# Then close terminal and reopen
```

---

## Web Form Test

After server starts, test the web form:

```bash
curl -X POST http://localhost:8000/api/v1/support/submit ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"subject\":\"Help\",\"category\":\"general\",\"message\":\"I need help with my account\"}"
```

Expected response:
```json
{
  "ticket_id": "uuid-here",
  "message": "Thank you for contacting us! Our AI assistant will respond shortly.",
  "estimated_response_time": "Usually within 5 minutes"
}
```

---

## Success Checklist

- [x] Database connected
- [x] Tables created (7)
- [x] Tickets can be created
- [x] Agent processes messages
- [x] Messages saved to DB
- [x] Knowledge base seeded
- [ ] Gmail credentials (optional for now)

**Status: READY FOR USE** ✅
