# Admin Dashboard Real-Time Data - Troubleshooting Guide

## ✅ Fixed Issues

The admin page now has:
- ✅ **Real-time polling** every 5 seconds
- ✅ **Connection status indicator** (green/red dot)
- ✅ **Last updated timestamp**
- ✅ **Automatic reconnection** on error

---

## 🔍 Why Wasn't It Updating?

**Before:** The admin page fetched data **once** on mount with no polling.

**After:** Now fetches data **every 5 seconds** automatically.

---

## 🧪 Testing Steps

### 1. Start Backend Server

```bash
cd backend
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Test Backend Endpoints

Open another terminal and run:

```bash
# Test metrics endpoint
curl http://localhost:8000/api/v1/admin/metrics

# Test activity feed
curl http://localhost:8000/api/v1/admin/activity-feed?limit=10

# Test tickets endpoint
curl http://localhost:8000/api/v1/admin/tickets
```

**Expected Response:**
```json
{
  "totalTickets": 0,
  "openTickets": 0,
  "resolvedTickets": 0,
  ...
}
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

### 4. Open Admin Dashboard

Navigate to: **http://localhost:3000/admin**

**Check:**
- ✅ Connection status shows "Connected" with green dot
- ✅ Timestamp shows current time
- ✅ Metrics cards display numbers (may be 0 if no tickets)
- ✅ Timestamp updates every 5 seconds

### 5. Test Real-Time Updates

1. Open **http://localhost:3000/support** in another tab
2. Submit a new ticket
3. Go back to admin tab
4. Within 5 seconds, you should see:
   - Total Tickets count increase
   - Timestamp update
   - New activity in feed

---

## ❌ Common Issues & Solutions

### Issue: Shows "Disconnected" (Red Dot)

**Causes:**
1. Backend not running
2. Wrong port
3. CORS issues

**Solutions:**

1. **Check if backend is running:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check browser console:**
   - Press F12 → Console tab
   - Look for errors like "Failed to fetch"
   - Check Network tab for failed requests

3. **Verify .env configuration:**
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Check CORS settings in backend:**
   - Backend should allow `http://localhost:3000`

---

### Issue: Metrics Show All Zeros

**Causes:**
1. No tickets in database
2. Database connection issue

**Solutions:**

1. **Create a test ticket:**
   - Go to http://localhost:3000/support
   - Submit a ticket
   - Check admin page again

2. **Check database connection:**
   ```bash
   # Check if PostgreSQL is running
   docker ps | grep postgres
   # or
   pg_isready -h localhost -p 5432
   ```

3. **Check backend logs:**
   ```bash
   # Look for database errors in backend terminal
   ```

---

### Issue: Timestamp Not Updating

**Causes:**
1. JavaScript interval blocked
2. Component unmounting/remounting
3. Browser tab inactive

**Solutions:**

1. **Check browser console for errors**
2. **Navigate away and back to admin page**
3. **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## 📊 What the UI Shows Now

### Top Bar (Left Side)
```
┌─────────────────────────────────────────────────────────┐
│  Admin Dashboard                      ● Connected       │
│  Real-time AI Customer Success        [🕐 2:45:30 PM]  │
│  monitoring                                             │
└─────────────────────────────────────────────────────────┘
```

### Connection Status Colors
- 🟢 **Green (pulsing)** = Connected, data updating
- 🔴 **Red** = Disconnected, backend not reachable

### Metrics Cards
- **Total Tickets**: All-time count
- **Open Tickets**: Awaiting response
- **Avg Response Time**: In seconds
- **Sentiment Score**: Percentage

All metrics update automatically every 5 seconds!

---

## 🔧 Manual Testing Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Admin page loads without errors
- [ ] Connection status shows "Connected"
- [ ] Timestamp displays and updates
- [ ] Metrics show actual numbers (not loading)
- [ ] Submit ticket → metrics update within 5s
- [ ] No console errors in browser

---

## 📝 API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/admin/metrics` | GET | Dashboard metrics |
| `/api/v1/admin/tickets` | GET | All tickets (paginated) |
| `/api/v1/admin/users` | GET | All customers (paginated) |
| `/api/v1/admin/activity-feed` | GET | Recent activity |

All endpoints support filtering and pagination.

---

## 🎯 Expected Behavior

**Every 5 seconds:**
1. Frontend calls `/api/v1/admin/metrics`
2. Frontend calls `/api/v1/admin/activity-feed`
3. Timestamp updates
4. Metrics refresh if data changed
5. Connection status stays green

**On error:**
1. Connection status turns red
2. Console logs error
3. Continues retrying every 5 seconds
4. Auto-recovers when backend available

---

## 🚀 Next Steps

If everything works:
1. ✅ Admin dashboard shows real-time data
2. ✅ Connection indicator is green
3. ✅ Timestamp updates every 5 seconds
4. ✅ Metrics reflect actual database state

If issues persist:
1. Check backend logs for errors
2. Verify database connection
3. Test endpoints with curl
4. Check browser console for CORS errors

---

**Status:** Fixed and ready for testing!
