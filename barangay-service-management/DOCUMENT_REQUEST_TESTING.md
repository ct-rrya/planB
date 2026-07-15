# Document Request Module - Testing Guide

## Quick Test Checklist

### ✅ Pre-Testing Setup

- [ ] Server running: `npm run start:dev`
- [ ] ngrok running: `ngrok http 3000`
- [ ] Meta webhook verified
- [ ] User registered in Messenger

---

## Test Scenarios

### 1. Keyword Recognition Test

**Test All Keywords:**

| Input | Expected Result |
|-------|----------------|
| "Request Document" | Shows document carousel ✅ |
| "request document" | Shows document carousel ✅ |
| "document" | Shows document carousel ✅ |
| "clearance" | Shows document carousel ✅ |
| "barangay clearance" | Shows document carousel ✅ |
| "request" | Shows document carousel ✅ |
| "certificate" | Shows document carousel ✅ |
| "I need a document" | Shows document carousel ✅ |
| Quick Reply "📝 Request Document" | Shows document carousel ✅ |

**Pass Criteria:** All inputs trigger the document carousel

---

### 2. Document Carousel Test

**Expected Display:**

```
5 horizontal cards showing:

1. Barangay Clearance
   Fee: ₱50
   Processing: 2 days
   [Request]

2. Certificate of Residency
   Fee: ₱30
   Processing: 1 day
   [Request]

3. Certificate of Indigency
   Fee: ₱0
   Processing: 3 days
   [Request]

4. Business Clearance
   Fee: ₱200
   Processing: 5 days
   [Request]

5. Barangay ID
   Fee: ₱100
   Processing: 7 days
   [Request]
```

**Pass Criteria:**
- [ ] All 5 cards visible
- [ ] Fees displayed correctly
- [ ] Processing days shown
- [ ] "Request" button on each card
- [ ] Can swipe left/right on mobile

---

### 3. Complete Request Flow Test

**Step-by-Step:**

1. **Type:** "Request Document"
   - ✅ Carousel appears

2. **Click:** "Request" on "Barangay Clearance"
   - ✅ Bot asks: "What is the purpose of this document?"
   - ✅ Shows examples: Employment, Scholarship, etc.

3. **Type:** "Employment"
   - ✅ Bot shows summary:
     ```
     📋 Request Summary
     📄 Document: Barangay Clearance
     🎯 Purpose: Employment
     💰 Fee: ₱50
     ⏱️ Processing: 2 days
     Confirm this request?
     ```
   - ✅ Quick Replies: [✅ Confirm] [❌ Cancel]

4. **Click:** "✅ Confirm"
   - ✅ Bot replies:
     ```
     ✅ Request submitted successfully!
     🔖 Tracking Number: REQ-2026-000001
     📄 Document: Barangay Clearance
     📋 Status: Pending
     ```
   - ✅ Main menu appears

5. **Check Admin Dashboard**
   - ✅ Request appears immediately (no refresh needed)
   - ✅ Shows: REQ-2026-000001
   - ✅ Shows: Resident name
   - ✅ Shows: Barangay Clearance
   - ✅ Shows: Employment
   - ✅ Shows: Pending (badge)
   - ✅ Shows: Current date

**Pass Criteria:** All steps complete successfully

---

### 4. Purpose Validation Test

**Test Invalid Inputs:**

| Input | Expected Result |
|-------|----------------|
| "Em" (2 chars) | "Please provide a more detailed purpose..." |
| "A" (1 char) | "Please provide a more detailed purpose..." |
| "" (empty) | "Please provide a more detailed purpose..." |
| "Employment" (valid) | Shows confirmation summary ✅ |

**Pass Criteria:** Short inputs rejected, valid inputs accepted

---

### 5. Confirmation Test

**Test Cancel:**

1. **Complete flow until confirmation**
2. **Click:** "❌ Cancel"
   - ✅ Bot: "❌ Request cancelled. No problem! You can start a new request anytime."
   - ✅ Main menu appears
3. **Check Database:** Request should NOT exist

**Test Invalid Response:**

1. **Complete flow until confirmation**
2. **Type:** "maybe" (not confirm/cancel)
   - ✅ Bot shows summary again with quick replies

**Pass Criteria:** Cancel works, invalid input shows summary again

---

### 6. Multiple Requests Test

**Create 3 Requests:**

1. Barangay Clearance - Employment
2. Certificate of Residency - Bank Requirement
3. Certificate of Indigency - Medical Assistance

**Check:**
- [ ] All 3 appear in dashboard
- [ ] Tracking numbers increment: REQ-2026-000001, -000002, -000003
- [ ] Each shows correct document type
- [ ] Each shows correct purpose

**Pass Criteria:** All requests created with unique tracking numbers

---

### 7. Status Update - Approve Test

**In Admin Dashboard:**

1. **Find pending request**
2. **Click:** "Approve" button
3. **Check Messenger:**
   - ✅ User receives:
     ```
     ✅ Good news!
     Your request has been APPROVED!
     🔖 Tracking #: REQ-2026-000001
     📄 Document: Barangay Clearance
     ⏱️ Processing Time: 2 days
     ```
4. **Refresh Dashboard:**
   - ✅ Status shows "Approved" (green badge)
   - ✅ approvedAt field populated

**Pass Criteria:** Status updates, notification sent

---

### 8. Status Update - Ready Test

**In Admin Dashboard:**

1. **Find approved request**
2. **Click:** "Mark Ready"
3. **Check Messenger:**
   - ✅ User receives:
     ```
     📦 Your document is ready for pickup!
     🔖 Tracking #: REQ-2026-000001
     📄 Document: Barangay Clearance
     💰 Fee: ₱50
     📍 Please visit our office during office hours...
     ```
4. **Dashboard:**
   - ✅ Status shows "Ready" (blue badge)

**Pass Criteria:** Status updates, notification sent with office hours

---

### 9. Status Update - Release Test

**In Admin Dashboard:**

1. **Find ready request**
2. **Click:** "Release"
3. **Check Messenger:**
   - ✅ User receives:
     ```
     🎉 Document released successfully!
     🔖 Tracking #: REQ-2026-000001
     📄 Document: Barangay Clearance
     ✅ Status: RELEASED
     📅 Released: [date]
     Thank you for using our Barangay Service Management System!
     ```
4. **Dashboard:**
   - ✅ Status shows "Released" (gray badge)
   - ✅ releasedAt field populated
   - ✅ releasedBy shows admin name

**Pass Criteria:** Status updates, thank you notification sent

---

### 10. Status Update - Reject Test

**In Admin Dashboard:**

1. **Find pending request**
2. **Click:** "Reject"
3. **Add remarks:** "Missing valid ID"
4. **Check Messenger:**
   - ✅ User receives:
     ```
     ❌ Request Update
     🔖 Tracking #: REQ-2026-000001
     📄 Document: Barangay Clearance
     Unfortunately, your request could not be approved at this time.
     📝 Remarks: Missing valid ID
     Please contact our office...
     ```
5. **Dashboard:**
   - ✅ Status shows "Rejected" (red badge)
   - ✅ Remarks visible

**Pass Criteria:** Status updates, rejection notification sent with remarks

---

### 11. Invalid Status Transition Test

**Test Invalid Transitions:**

| From | To | Expected Result |
|------|----|--------------------|
| pending | ready | ❌ Error: Cannot transition |
| pending | released | ❌ Error: Cannot transition |
| approved | rejected | ❌ Error: Cannot transition |
| released | approved | ❌ Error: Cannot transition |

**Valid Transitions:**
```
pending → approved → ready → released
        ↓
     rejected
```

**Pass Criteria:** Invalid transitions rejected with error message

---

### 12. Tracking Request Test

**In Messenger:**

1. **Click:** "📦 Track Request" quick reply
2. **Type:** "REQ-2026-000001"
3. **Expected:**
   ```
   📋 Request Status
   🔖 Tracking #: REQ-2026-000001
   📄 Document: Barangay Clearance
   ✅ Status: APPROVED
   📅 Requested: January 15, 2026
   Good news! Your request has been approved and is being processed.
   ```

**Test Invalid Tracking:**

1. **Type:** "REQ-9999-999999"
2. **Expected:**
   ```
   ❌ No request found with tracking number: REQ-9999-999999
   Please check your tracking number and try again.
   ```

**Pass Criteria:** Valid tracking shows details, invalid shows error

---

### 13. Database Verification

**Check Document Types:**

```javascript
db.documenttypes.find({ isActive: true }).count()
// Expected: 5
```

**Check Requests:**

```javascript
db.requests.findOne({ trackingNumber: "REQ-2026-000001" })
// Expected: Complete request document with all fields
```

**Check Notifications:**

```javascript
db.notifications.find({ trackingNumber: "REQ-2026-000001" })
// Expected: Notification logs for each status change
```

**Pass Criteria:** All collections have correct data

---

### 14. Notification Logging Test

**After each status change, check:**

```javascript
db.notifications.find({ request: ObjectId("request_id") })
```

**Expected Fields:**
```json
{
  "resident": ObjectId("..."),
  "request": ObjectId("..."),
  "trackingNumber": "REQ-2026-000001",
  "status": "approved",
  "message": "✅ Good news! Your request has been APPROVED!",
  "messengerPSID": "1234567890",
  "sent": true,
  "sentAt": ISODate("..."),
  "error": null
}
```

**Pass Criteria:** Notification logged with `sent: true`

---

### 15. Error Handling Test

**Test Network Error:**

1. **Stop ngrok** (simulate network failure)
2. **Admin approves request**
3. **Check notifications collection:**
   - ✅ Notification logged with `sent: false`
   - ✅ Error message captured

**Test Database Error:**

1. **Make tracking number generation fail** (temporarily)
2. **Confirm request**
3. **Check Messenger:**
   - ✅ User receives: "Sorry, there was an error..."

**Pass Criteria:** Errors handled gracefully, logged properly

---

### 16. Performance Test

**Create 10 Requests Rapidly:**

1. Request 10 different documents
2. Check dashboard loads quickly
3. Check all notifications sent

**Expected:**
- [ ] Dashboard responds in < 2 seconds
- [ ] All 10 requests appear
- [ ] Pagination works
- [ ] Sorting works

**Pass Criteria:** System handles multiple requests smoothly

---

### 17. Edge Cases Test

**Test Empty Database:**

1. Delete all document types
2. Type "Request Document"
3. **Expected:** Documents auto-seeded, carousel appears

**Test Duplicate Purpose:**

1. Submit request with purpose "Employment"
2. Submit another with purpose "Employment"
3. **Expected:** Both accepted (no unique constraint on purpose)

**Test Long Purpose:**

1. Submit request with 500-character purpose
2. **Expected:** Accepted and displayed correctly

**Pass Criteria:** Edge cases handled properly

---

## Sign-Off Checklist

### Core Functionality

- [ ] Keyword recognition works
- [ ] Document carousel displays
- [ ] Purpose collection works
- [ ] Confirmation step works
- [ ] Request saved to database
- [ ] Tracking number generated
- [ ] Dashboard shows request immediately

### Status Updates

- [ ] Approve works + notification sent
- [ ] Reject works + notification sent
- [ ] Mark Ready works + notification sent
- [ ] Release works + notification sent
- [ ] Invalid transitions rejected

### Notifications

- [ ] Approved notification sent
- [ ] Ready notification sent
- [ ] Released notification sent
- [ ] Rejected notification sent
- [ ] Notifications logged in database

### Error Handling

- [ ] Short purpose rejected
- [ ] Invalid tracking number handled
- [ ] Network errors logged
- [ ] Database errors handled
- [ ] User-friendly error messages

### Data Quality

- [ ] All fields populated
- [ ] Tracking numbers unique
- [ ] Timestamps accurate
- [ ] References populated correctly

---

## Troubleshooting

### Issue: Documents don't appear

**Check:**
1. Server running?
2. MongoDB connected?
3. Check console for errors
4. Manually check: `db.documenttypes.count()`

**Fix:** Run `npm run start:dev` again

### Issue: Notifications not sent

**Check:**
1. ngrok tunnel active?
2. Webhook verified in Meta?
3. Resident has messengerPSID?
4. Check notifications collection for errors

**Fix:** Check `error` field in notification document

### Issue: Dashboard doesn't update

**Check:**
1. TanStack Query invalidation called?
2. Check Network tab for API call
3. Check server logs

**Fix:** Refresh browser, check API endpoint

---

## Performance Benchmarks

| Operation | Expected Time |
|-----------|---------------|
| Show carousel | < 1 second |
| Save request | < 500ms |
| Send notification | < 2 seconds |
| Dashboard load (10 requests) | < 1 second |
| Status update | < 500ms |

---

## Final Verification

Run all test scenarios above. All should pass ✅

**Ready for Production:** Yes ✅ / No ❌

---

**Once all tests pass, the Document Request Module is production-ready!** 🚀
