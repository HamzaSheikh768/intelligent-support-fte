# WhatsApp Sandbox Setup Guide

## ⚠️ Important: Sandbox Membership Required

The application uses **Twilio's WhatsApp Sandbox** for free testing. Before you can send messages, you **must join the sandbox**.

---

## 📱 How to Join the WhatsApp Sandbox

### Step 1: Open WhatsApp
Open WhatsApp on your phone (the one with number `+923313511431` or any other number).

### Step 2: Message the Sandbox Number
Send a WhatsApp message to:
```
+1 415-523-8886
```

### Step 3: Join the Sandbox
Send the following message:
```
join friendly
```

**Note:** You can use any keyword, but `friendly` is the default sandbox keyword.

### Step 4: Wait for Confirmation
You'll receive a confirmation message from Twilio like:
```
Congratulations! You've joined the sandbox for 'friendly'.
Your sandbox is valid for 72 hours.
```

### Step 5: Start Sending Messages
Now you can send support messages to the sandbox number, and the AI FTE will respond!

---

## ⏰ Sandbox Validity

- **Duration:** 72 hours (3 days)
- **Rejoining:** You can rejoin as many times as you want
- **Multiple Numbers:** Different phone numbers can join the same sandbox

---

## 🔧 For Production Use

The sandbox is **free for testing** but has limitations:
- Messages can only be sent to/from numbers that have joined the sandbox
- Membership expires after 72 hours
- Limited features compared to production

### Production Setup Requirements:

1. **Twilio Account** - Upgrade to paid plan
2. **WhatsApp Business Number** - Apply for WhatsApp Business API access
3. **Facebook Business Verification** - Required for production WhatsApp
4. **Message Templates** - Pre-approved templates for outbound messages

### Production Configuration:

Update `.env` with your production credentials:

```env
# Production WhatsApp (not sandbox)
TWILIO_WHATSAPP_NUMBER=whatsapp:+1YOUR_BUSINESS_NUMBER
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
```

---

## 🐛 Troubleshooting

### "Not connected to a Sandbox" Error

**Cause:** Your number hasn't joined the sandbox or membership expired.

**Solution:**
1. Message `+1 415-523-8886` on WhatsApp
2. Send: `join friendly`
3. Wait for confirmation
4. Try sending your message again

### Messages Not Receiving Response

**Possible causes:**
1. Backend server not running
2. Twilio credentials not configured
3. Webhook URL not set correctly in Twilio console

**Check:**
- Backend logs at `http://localhost:8000/webhooks/whatsapp`
- Twilio console → WhatsApp → Sandbox Settings → Webhook URL
- Should be: `http://localhost:8000/webhooks/whatsapp` (use ngrok for local testing)

---

## 📚 Additional Resources

- [Twilio WhatsApp Sandbox Docs](https://www.twilio.com/docs/whatsapp/sandbox)
- [Twilio WhatsApp API Guide](https://www.twilio.com/whatsapp)
- [WhatsApp Business API](https://business.whatsapp.com/products/business-platform)

---

## 🎯 Quick Test Commands

After joining the sandbox, test with these messages:

```
Hello
I need help with my account
What are your business hours?
```

The AI FTE should respond within seconds!
