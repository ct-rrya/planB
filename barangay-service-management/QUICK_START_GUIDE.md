# Document Request Module - Quick Start Guide

## 🚀 Start the System

```bash
# Terminal 1: Start Server
cd server
npm run start:dev

# Terminal 2: Start ngrok
ngrok http 3000
```

---

## 📱 Test in Messenger

### 1. Request a Document

**Type any of these:**
- "Request Document"
- "document"
- "clearance"
- "I need a document"

**Or click:** "📝 Request Document" quick reply

**Expected:** Carousel with 5 documents appears

---

### 2. Select Document

**Click:** "Request" on any document

**Expected:** Bot asks "What is the purpose of this document?"

---

### 3. Enter Purpose

**Type:** "Employment" (or any purpose ≥3 characters)

**Expected:** 
```
📋 Request Summary
📄 Document: Barangay Clearance
🎯 Purpose: Employment
💰 Fee: ₱50
⏱️ Processing: 2 days
Confirm this request?
[✅ Confirm] [❌ Cancel]
```

---

### 4. Confirm Request

**Click:** "✅ Confirm"

**Expected:**
```
✅ Request submitted successfully!
🔖 Tracking Number: REQ-2026-000001
📄 Document: Barangay Clearance
📋 Status: Pending
```

---

## 💼 Admin Dashboard Actions

### Update Status

**Find the request → Click action button:**

1. **Approve** → Status: "Approved" ✅
   - User receives: "✅ Your request has been APPROVED!"

2. **Mark Ready** → Status: "Ready" 📦
   - User receives: "📦 Your document is ready for pickup!"

3. **Release** → Status: "Released" 🎉
   - User receives: "🎉 Document released successfully!"

4. **Reject** → Status: "Rejected" ❌
   - User receives: "❌ Request Update + Remarks"

**All notifications sent automatically via Messenger!**

---

## 🔍 Track Request

**In Messenger:**

1. **Click:** "📦 Track Request" quick reply
2. **Type:** "REQ-2026-000001"
3. **Expected:** Shows current status and details

---

## 📊 Default Documents

| Document | Fee | Processing |
|----------|-----|------------|
| Barangay Clearance | ₱50 | 2 days |
| Certificate of Residency | ₱30 | 1 day |
| Certificate of Indigency | FREE | 3 days |
| Business Clearance | ₱200 | 5 days |
| Barangay ID | ₱100 | 7 days |

**Auto-seeded on first run!**

---

## 🔗 API Endpoints

### Update Status

```http
PATCH /api/requests/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "remarks": "Optional admin notes"
}
```

**Status Options:**
- `approved` → Approve request
- `rejected` → Reject request
- `ready` → Mark ready for pickup
- `released` → Mark as released

---

## ✅ Quick Test Checklist

- [ ] Type "Request Document" → Carousel appears
- [ ] Click "Request" → Asks for purpose
- [ ] Enter purpose → Shows confirmation
- [ ] Click Confirm → Request saved
- [ ] Check dashboard → Request appears
- [ ] Click Approve → User receives notification
- [ ] Click Ready → User receives notification
- [ ] Click Release → User receives notification

---

## 🐛 Troubleshooting

### Documents don't appear
```bash
# Check if server is running
# Check MongoDB connection
# Documents auto-seed on first request
```

### Notifications not sent
```bash
# Check ngrok is running
# Verify webhook in Meta Developers
# Check resident has messengerPSID
```

### Dashboard doesn't update
```bash
# Refresh browser
# Check network tab for API errors
# Verify TanStack Query working
```

---

## 📝 Keywords That Trigger Document Request

- "request document"
- "document"
- "clearance"
- "barangay clearance"
- "request"
- "certificate"
- "residency"
- "indigency"

**All case-insensitive!**

---

## 🎯 Status Flow

```
pending → approved → ready → released
        ↓
     rejected
```

**Cannot skip steps!**

---

## 📱 Messenger Flow

```
User: "Request Document"
  ↓
Bot: Shows carousel (5 cards)
  ↓
User: Clicks "Request"
  ↓
Bot: "What is the purpose?"
  ↓
User: "Employment"
  ↓
Bot: Shows summary + [Confirm] [Cancel]
  ↓
User: Clicks "Confirm"
  ↓
Bot: "✅ Request submitted! REQ-2026-000001"
  ↓
Dashboard: Request appears (auto-refresh)
  ↓
Admin: Clicks "Approve"
  ↓
Bot: Sends notification to user
```

**Total time: ~2 minutes**

---

## 🔐 Admin Credentials

**Default admin (if using seed data):**
- Email: `admin@barangay.local`
- Password: `admin123`

**Create new admin:**
```bash
# Through Admin Dashboard
# Settings → User Management → Add User
```

---

## 📚 Documentation

- **Complete Guide:** `DOCUMENT_REQUEST_MODULE_COMPLETE.md`
- **Testing Guide:** `DOCUMENT_REQUEST_TESTING.md`
- **Summary:** `IMPLEMENTATION_SUMMARY.md`
- **This Guide:** `QUICK_START_GUIDE.md`

---

## 🎉 Success Indicators

✅ Carousel displays when typing "document"
✅ Purpose validation works (≥3 chars)
✅ Confirmation shows correct details
✅ Request saved with tracking number
✅ Dashboard shows request immediately
✅ Status updates work
✅ Notifications sent automatically
✅ Tracking works in Messenger

---

## 🚀 Deploy to Production

```bash
# 1. Build
npm run build

# 2. Set environment variables
# Update .env with production values

# 3. Start with PM2 (or similar)
pm2 start dist/main.js --name barangay-api

# 4. Update Meta webhook URL to production domain

# 5. Test all flows in production
```

---

**Everything is ready! Start testing and enjoy the new Document Request Module!** 🎊
