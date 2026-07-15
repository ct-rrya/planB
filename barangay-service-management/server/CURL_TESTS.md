# Webhook Testing - Curl Commands

## Local Testing (http://localhost:3000)

### 1. Test GET Verification - Valid Token
```bash
curl "http://localhost:3000/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=brgy-admin-service&hub.challenge=12345"
```
**Expected Response:** `12345`  
**Expected Status:** 200 OK

---

### 2. Test GET Verification - Invalid Token
```bash
curl "http://localhost:3000/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=12345"
```
**Expected Response:** Error message  
**Expected Status:** 403 Forbidden

---

### 3. Test POST Webhook - Valid Event
```bash
curl -X POST http://localhost:3000/api/chatbot/webhook \
  -H "Content-Type: application/json" \
  -d '{"object":"page","entry":[{"messaging":[{"sender":{"id":"123456789"},"message":{"text":"Hello"}}]}]}'
```
**Expected Response:** `EVENT_RECEIVED`  
**Expected Status:** 200 OK

---

### 4. Test POST Webhook - Invalid Object
```bash
curl -X POST http://localhost:3000/api/chatbot/webhook \
  -H "Content-Type: application/json" \
  -d '{"object":"user","entry":[]}'
```
**Expected Response:** `Not Found`  
**Expected Status:** 404 Not Found

---

## ngrok Testing (Replace with your ngrok URL)

### Setup
```bash
# Start ngrok
ngrok http 3000

# Note your ngrok URL (e.g., https://abc123.ngrok-free.app)
```

---

### 1. Test GET Verification through ngrok
```bash
curl "https://YOUR-NGROK-URL.ngrok-free.app/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=brgy-admin-service&hub.challenge=12345"
```
**Expected Response:** `12345`

**Example:**
```bash
curl "https://abc123.ngrok-free.app/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=brgy-admin-service&hub.challenge=12345"
```

---

### 2. Test POST Webhook through ngrok
```bash
curl -X POST https://YOUR-NGROK-URL.ngrok-free.app/api/chatbot/webhook \
  -H "Content-Type: application/json" \
  -d '{"object":"page","entry":[{"messaging":[{"sender":{"id":"123456789"},"message":{"text":"Hello from ngrok"}}]}]}'
```
**Expected Response:** `EVENT_RECEIVED`

---

## Verbose Testing (See Full Response)

### With Response Headers
```bash
curl -v "http://localhost:3000/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=brgy-admin-service&hub.challenge=12345"
```

### With Status Code
```bash
curl -w "\nHTTP Status: %{http_code}\n" "http://localhost:3000/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=brgy-admin-service&hub.challenge=12345"
```

---

## Windows PowerShell Alternatives

### Test GET Verification
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=brgy-admin-service&hub.challenge=12345" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Test POST Webhook
```powershell
$body = '{"object":"page","entry":[{"messaging":[{"sender":{"id":"123456789"},"message":{"text":"Hello"}}]}]}'
Invoke-WebRequest -Uri "http://localhost:3000/api/chatbot/webhook" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

## Expected Server Logs

When you run these tests, you should see in your server console:

```
=== WEBHOOK VERIFICATION REQUEST ===
hub.mode: subscribe
hub.verify_token: brgy-admin-service
hub.challenge: 12345
Expected token: brgy-admin-service
====================================
✓ Webhook verified successfully!
```

For POST requests:
```
=== WEBHOOK EVENT RECEIVED ===
Body object: page
==============================
Message from 123456789: Hello
```

---

## Meta Developers Testing

Once your webhook is verified in Meta, you can test with a real message:

1. Go to your Facebook Page
2. Send a message to your page (as a user, not as the page)
3. Check server logs for:
   ```
   === WEBHOOK EVENT RECEIVED ===
   Body object: page
   ==============================
   Message from [PSID]: [message text]
   ```

---

## Troubleshooting

### If curl returns HTML (ngrok warning page):
1. Visit your ngrok URL in a browser first: `https://your-ngrok-url.ngrok-free.app`
2. Click "Visit Site" 
3. Then retry the curl command

### If verification fails:
1. Check server is running (`npm run start:dev`)
2. Check `.env` has `META_VERIFY_TOKEN=brgy-admin-service`
3. Check server logs show the configuration on startup
4. Ensure URL path is exactly `/api/chatbot/webhook`

### If status is 404:
- Wrong path - should be `/api/chatbot/webhook` not `/webhook`
- Server not running
- Wrong port (should be 3000)

### If response is JSON instead of plain text:
- Code wasn't saved
- Server wasn't restarted
- Using old compiled code (run `npm run build`)
