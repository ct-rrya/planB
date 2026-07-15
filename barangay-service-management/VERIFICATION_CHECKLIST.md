# ✅ Messenger Webhook Verification Checklist

Use this checklist to verify your webhook integration step by step.

---

## Phase 1: Code Verification ✅

- [x] **Fixed ConfigService key** from `META_VERIFY_TOKEN` to `meta.verifyToken`
- [x] **Fixed response format** to return raw string instead of JSON
- [x] **Fixed error handling** to throw `ForbiddenException` instead of returning string
- [x] **Added comprehensive logging** for all verification requests
- [x] **Added startup diagnostics** showing webhook configuration
- [x] **Disabled Helmet CSP** that could block webhooks
- [x] **Build succeeds** with zero TypeScript errors
- [x] **No TypeScript diagnostics** in modified files

**Status:** ✅ ALL COMPLETE

---

## Phase 2: Local Testing

### Step 1: Environment Setup
```bash
cd server
```

- [ ] `.env` file exists in `server/` directory
- [ ] `META_VERIFY_TOKEN=brgy-admin-service` is set in `.env`
- [ ] No extra spaces or quotes around the token
- [ ] File is saved

### Step 2: Start Server
```bash
npm run start:dev
```

- [ ] Server starts without errors
- [ ] Port 3000 is available
- [ ] You see startup logs:
  ```
  === MESSENGER WEBHOOK INFO ===
  Webhook Endpoint: http://localhost:3000/api/chatbot/webhook
  Verify Token: brgy-admin-service
  ```

### Step 3: Test Verification Endpoint
```bash
curl "http://localhost:3000/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=brgy-admin-service&hub.challenge=12345"
```

- [ ] Response is exactly: `12345` (no JSON, no quotes)
- [ ] Server logs show:
  ```
  === WEBHOOK VERIFICATION REQUEST ===
  hub.mode: subscribe
  hub.verify_token: brgy-admin-service
  hub.challenge: 12345
  Expected token: brgy-admin-service
  ====================================
  ✓ Webhook verified successfully!
  ```

### Step 4: Test Invalid Token
```bash
curl "http://localhost:3000/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=12345"
```

- [ ] Response is HTTP 403 Forbidden
- [ ] Server logs show:
  ```
  ✗ Webhook verification FAILED - Invalid token or mode
  ```

### Step 5: Test POST Webhook
```bash
curl -X POST http://localhost:3000/api/chatbot/webhook -H "Content-Type: application/json" -d '{"object":"page","entry":[{"messaging":[{"sender":{"id":"123"},"message":{"text":"test"}}]}]}'
```

- [ ] Response is exactly: `EVENT_RECEIVED`
- [ ] Server logs show:
  ```
  === WEBHOOK EVENT RECEIVED ===
  Body object: page
  ==============================
  ```

**Local Testing Status:** [ ] PASS / [ ] FAIL

---

## Phase 3: ngrok Setup

### Step 1: Start ngrok
```bash
ngrok http 3000
```

- [ ] ngrok starts successfully
- [ ] You see a forwarding URL like: `https://abc123.ngrok-free.app`
- [ ] Copy the HTTPS URL (not HTTP)

### Step 2: Test through ngrok
```bash
curl "https://YOUR-NGROK-URL/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=brgy-admin-service&hub.challenge=12345"
```

- [ ] Response is exactly: `12345`
- [ ] Server logs show verification request from ngrok IP
- [ ] No ngrok errors in terminal

**ngrok Testing Status:** [ ] PASS / [ ] FAIL

---

## Phase 4: Meta Developers Configuration

### Prerequisites
- [ ] You have a Facebook account
- [ ] You have a Facebook Page (or can create one)
- [ ] You have access to Meta for Developers

### Step 1: App Setup
Go to: https://developers.facebook.com/

- [ ] Created or selected an app
- [ ] App ID is visible in dashboard
- [ ] Added Messenger product to app

### Step 2: Connect Facebook Page
In Messenger Settings → Access Tokens:

- [ ] Clicked "Add or Remove Pages"
- [ ] Selected your Facebook Page
- [ ] Granted all required permissions
- [ ] Page appears in the list

### Step 3: Generate Page Access Token
- [ ] Clicked "Generate Token" for your page
- [ ] Copied the token (starts with `EAAA...`)
- [ ] Added to `.env` file:
  ```
  META_PAGE_ACCESS_TOKEN=YOUR-ACTUAL-TOKEN-HERE
  ```
- [ ] Saved `.env` file
- [ ] Restarted server (if running)

### Step 4: Configure Webhook
In Messenger Settings → Webhooks:

- [ ] Clicked "Add Callback URL"
- [ ] Entered Callback URL: `https://YOUR-NGROK-URL/api/chatbot/webhook`
- [ ] Entered Verify Token: `brgy-admin-service` (EXACT MATCH)
- [ ] Clicked "Verify and Save"
- [ ] ✅ **Green checkmark appeared** (VERIFICATION SUCCESS!)
- [ ] No error messages

**If verification failed, check:**
- [ ] Server is running
- [ ] ngrok tunnel is active
- [ ] URL matches exactly: `https://YOUR-NGROK-URL/api/chatbot/webhook`
- [ ] Verify token matches exactly: `brgy-admin-service`
- [ ] Check server logs for verification request

### Step 5: Subscribe to Webhook Fields
After verification succeeds:

- [ ] Subscribed to `messages` field
- [ ] Subscribed to `messaging_postbacks` field
- [ ] (Optional) Subscribed to `message_deliveries`
- [ ] (Optional) Subscribed to `message_reads`

### Step 6: Subscribe Page
In Webhooks section:

- [ ] Selected your Facebook Page from dropdown
- [ ] Clicked "Subscribe"
- [ ] Page appears in "Subscribed pages" list

### Step 7: App Mode
- [ ] App is in "Development" mode (for testing)
- [ ] OR added test users (if app is Live)

**Meta Configuration Status:** [ ] COMPLETE / [ ] INCOMPLETE

---

## Phase 5: End-to-End Testing

### Test 1: Send Message from Facebook
1. Open your Facebook Page in a browser
2. Open Messenger and send a message to your page
3. Check server logs

- [ ] Message appears in server logs:
  ```
  === WEBHOOK EVENT RECEIVED ===
  Body object: page
  ==============================
  Message from [PSID]: [your message text]
  ```
- [ ] No errors in server logs
- [ ] Webhook event received successfully

### Test 2: Check Meta Webhooks Dashboard
In Meta Developers → Messenger → Webhooks:

- [ ] Webhook URL shows green checkmark
- [ ] Subscribed fields are checked
- [ ] Page is subscribed
- [ ] No error indicators

### Test 3: Bot Responds (If Implemented)
- [ ] Bot sends response back to Messenger
- [ ] Response appears in Messenger conversation
- [ ] No delivery errors

**End-to-End Status:** [ ] SUCCESS / [ ] ISSUES

---

## Phase 6: Production Readiness

### Security
- [ ] `.env` file is in `.gitignore`
- [ ] `META_PAGE_ACCESS_TOKEN` is kept secret
- [ ] `META_APP_SECRET` is set (for signature verification)
- [ ] Server uses HTTPS in production
- [ ] Webhook signature verification implemented (optional but recommended)

### Reliability
- [ ] Server stays running (use PM2 or similar)
- [ ] Error handling for all webhook events
- [ ] Logging for debugging
- [ ] Health check endpoint exists

### Deployment
- [ ] Use permanent domain (not ngrok) for production
- [ ] Update webhook URL in Meta when deploying
- [ ] Test webhook after deployment
- [ ] Monitor webhook delivery success rate

**Production Readiness:** [ ] READY / [ ] NOT READY

---

## Troubleshooting Reference

### Problem: Verification fails in Meta

**Check:**
1. Server logs - do you see verification request?
2. URL in Meta exactly matches: `https://your-domain/api/chatbot/webhook`
3. Verify token in Meta exactly matches: `brgy-admin-service`
4. Server is running and accessible
5. ngrok tunnel is active (if using ngrok)

### Problem: Response is JSON instead of plain text

**Fix:**
1. Ensure code changes were saved
2. Restart the server
3. Clear any cached builds
4. Run `npm run build` to recompile

### Problem: Can't subscribe webhook fields

**Cause:** Webhook verification must succeed first

**Fix:**
1. Verify webhook first (green checkmark)
2. Then fields become clickable
3. Subscribe to required fields

### Problem: Messages not arriving at webhook

**Check:**
1. Page is subscribed to webhook (Meta Developers)
2. `messages` field is subscribed
3. Server is running
4. Check server logs for incoming requests
5. Check Meta Webhooks logs for delivery status

---

## Summary

### Required for Success:
✅ Code fixes applied  
✅ Build succeeds  
✅ Local tests pass  
✅ ngrok tests pass  
✅ Meta verification succeeds (green checkmark)  
✅ Webhook fields subscribed  
✅ Page subscribed  
✅ End-to-end message delivery works  

### Signs of Success:
- ✅ Green checkmark in Meta Developers webhook settings
- ✅ Server logs show verification requests
- ✅ Server logs show incoming message events
- ✅ No 403 or 404 errors
- ✅ Response is plain text (not JSON)

---

## Quick Reference

| Test | Command | Expected Response |
|------|---------|-------------------|
| Local Verification | `curl "http://localhost:3000/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=brgy-admin-service&hub.challenge=12345"` | `12345` |
| ngrok Verification | `curl "https://YOUR-NGROK/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=brgy-admin-service&hub.challenge=12345"` | `12345` |
| POST Event | `curl -X POST http://localhost:3000/api/chatbot/webhook -H "Content-Type: application/json" -d '{"object":"page"}'` | `EVENT_RECEIVED` |

---

## Need Help?

1. Check `MESSENGER_WEBHOOK_FIX.md` for detailed documentation
2. Check `CURL_TESTS.md` for all test commands
3. Check server logs for diagnostic information
4. All requests are logged with full details

---

**Once all checkboxes are complete, your webhook integration is production-ready!** 🚀
