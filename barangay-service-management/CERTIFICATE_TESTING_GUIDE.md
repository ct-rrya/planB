# Certificate Generation - Quick Testing Guide

**Last Updated:** July 14, 2026  
**For:** Testing the Certificate Generation Module

---

## 🚀 Quick Start Testing

### Step 1: Start the Backend Server

```bash
cd server
npm run start:dev
```

Wait for message: `Nest application successfully started`

**Expected Output:**
```
[Nest] LOG [NestApplication] Nest application successfully started
```

---

### Step 2: Get Your JWT Token

Use Postman, Thunder Client, or any HTTP client.

**Request:**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save this token!** You'll need it for all subsequent requests.

---

### Step 3: Get an Existing Request ID

**Request:**
```http
GET http://localhost:3000/api/requests
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
{
  "data": [
    {
      "_id": "67890abc",
      "trackingNumber": "REQ-2026-000001",
      "status": "pending",
      "resident": { ... },
      "documentType": { ... }
    }
  ]
}
```

**Copy the `_id` value** - this is your request ID for testing.

---

### Step 4: Generate a Certificate

**Request:**
```http
POST http://localhost:3000/api/requests/67890abc/approve-and-generate
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{}
```

**Expected Response:**
```json
{
  "_id": "67890abc",
  "trackingNumber": "REQ-2026-000001",
  "certificateNumber": "BC-2026-000001",
  "certificateUrl": "/certificates/BC-2026-000001.pdf",
  "orNumber": "OR-2026-000001",
  "status": "certificate_generated",
  "generatedAt": "2026-07-14T13:00:00.000Z",
  "generatedBy": "...",
  "resident": { ... },
  "documentType": { ... }
}
```

**What Just Happened:**
1. ✅ Status changed: `pending` → `approved` → `certificate_generated`
2. ✅ Certificate number assigned: `BC-2026-000001`
3. ✅ OR number assigned: `OR-2026-000001`
4. ✅ PDF created in: `server/uploads/certificates/BC-2026-000001.pdf`
5. ✅ QR code embedded in PDF
6. ✅ Two Messenger notifications sent to resident

---

### Step 5: View the Certificate PDF

**Option A: Open in Browser**
```
http://localhost:3000/certificates/BC-2026-000001.pdf
```

**Option B: Check File System**
```bash
cd server/uploads/certificates
dir
```

You should see: `BC-2026-000001.pdf`

**Option C: Download via API**
```http
GET http://localhost:3000/certificates/BC-2026-000001.pdf
```

---

### Step 6: Test the Complete Workflow

#### 6.1 Mark as Printed
```http
PATCH http://localhost:3000/api/requests/67890abc/mark-printed
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "remarks": "Printed successfully"
}
```

**Expected:** Status changes to `printed`

---

#### 6.2 Secretary Signs
```http
PATCH http://localhost:3000/api/requests/67890abc/secretary-signed
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "remarks": "Signed by Secretary"
}
```

**Expected:** Status changes to `secretary_signed`

---

#### 6.3 Captain Signs
```http
PATCH http://localhost:3000/api/requests/67890abc/captain-signed
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "remarks": "Signed by Captain"
}
```

**Expected:** Status changes to `captain_signed`

---

#### 6.4 Apply Official Seal
```http
PATCH http://localhost:3000/api/requests/67890abc/seal-applied
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "remarks": "Official seal applied"
}
```

**Expected:** Status changes to `sealed`

---

#### 6.5 Mark Ready for Pickup
```http
PATCH http://localhost:3000/api/requests/67890abc/ready-for-pickup
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "remarks": "Ready for pickup"
}
```

**Expected:** Status changes to `ready`

**Note:** This will only work if all three prerequisites are complete:
- ✅ Secretary signed
- ✅ Captain signed
- ✅ Seal applied

---

#### 6.6 Release to Resident
```http
PATCH http://localhost:3000/api/requests/67890abc/release
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "remarks": "Released to resident"
}
```

**Expected:** Status changes to `released`

---

### Step 7: Check Processing Checklist

```http
GET http://localhost:3000/api/requests/67890abc/checklist
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "certificateGenerated": {
    "completed": true,
    "completedAt": "2026-07-14T13:00:00.000Z",
    "completedBy": "64abc..."
  },
  "printed": {
    "completed": true,
    "completedAt": "2026-07-14T13:05:00.000Z",
    "completedBy": "64abc..."
  },
  "secretarySigned": {
    "completed": true,
    "completedAt": "2026-07-14T13:10:00.000Z",
    "completedBy": "64abc...",
    "required": true
  },
  "captainSigned": {
    "completed": true,
    "completedAt": "2026-07-14T13:15:00.000Z",
    "completedBy": "64abc...",
    "required": true
  },
  "sealApplied": {
    "completed": true,
    "completedAt": "2026-07-14T13:20:00.000Z",
    "completedBy": "64abc...",
    "required": true
  },
  "readyForPickup": {
    "completed": true,
    "completedAt": "2026-07-14T13:25:00.000Z",
    "completedBy": "64abc...",
    "canComplete": true
  },
  "released": {
    "completed": true,
    "completedAt": "2026-07-14T13:30:00.000Z",
    "completedBy": "64abc..."
  }
}
```

---

### Step 8: Test Certificate Verification (Public)

**No authentication required!**

```http
GET http://localhost:3000/api/certificates/verify/BC-2026-000001
```

**Expected Response:**
```json
{
  "certificateNumber": "BC-2026-000001",
  "trackingNumber": "REQ-2026-000001",
  "residentName": "Juan Dela Cruz",
  "documentType": "Barangay Clearance",
  "dateIssued": "2026-07-14T13:00:00.000Z",
  "status": "Valid",
  "issuingBarangay": "Barangay Cayang, Bogo City, Cebu",
  "verifiedAt": "2026-07-14T13:40:00.000Z"
}
```

---

### Step 9: Check Dashboard Statistics

```http
GET http://localhost:3000/api/requests/stats
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "pendingReview": 5,
  "approved": 2,
  "certificateGenerated": 3,
  "printed": 2,
  "secretarySigned": 2,
  "captainSigned": 1,
  "sealed": 1,
  "ready": 3,
  "released": 10,
  "rejected": 1,
  "total": 30
}
```

---

## 🧪 Advanced Testing

### Test Invalid Status Transitions

**Try to skip a step:**
```http
PATCH http://localhost:3000/api/requests/67890abc/seal-applied
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{}
```

**If status is still `printed` (secretary hasn't signed):**
```json
{
  "statusCode": 400,
  "message": "Cannot transition from printed to sealed",
  "error": "Bad Request"
}
```

---

### Test Prerequisites Validation

**Try to mark ready without all signatures:**
```http
PATCH http://localhost:3000/api/requests/67890abc/ready-for-pickup
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{}
```

**If seal is not applied:**
```json
{
  "statusCode": 400,
  "message": "Official seal required",
  "error": "Bad Request"
}
```

---

### Test Non-Existent Certificate Verification

```http
GET http://localhost:3000/api/certificates/verify/BC-2026-999999
```

**Expected:**
```json
{
  "statusCode": 404,
  "message": "Certificate BC-2026-999999 not found",
  "error": "Not Found"
}
```

---

## 📱 Test Messenger Notifications

### Prerequisites
1. Server must have valid Facebook App credentials
2. Resident must have `messengerPSID` in database
3. Messenger webhook must be verified

### How to Check
1. Go to Facebook Messenger
2. Open conversation with your resident test account
3. After each workflow action, check for automatic notifications

### Expected Notifications
- ✅ After approve-and-generate: 2 messages (approved + generated)
- ✅ After mark-printed: 1 message
- ✅ After secretary-signed: 1 message
- ✅ After captain-signed: 1 message
- ✅ After seal-applied: 1 message
- ✅ After ready-for-pickup: 1 message
- ✅ After release: 1 message

**Total: 8 notifications for complete workflow**

---

## 🔍 What to Look for in the PDF

### Open the Generated Certificate

**Check for:**
1. ✅ Header
   - Republic of the Philippines
   - Province of Cebu
   - City of Bogo
   - Barangay Cayang
   - Office of the Punong Barangay

2. ✅ Title
   - "BARANGAY CLEARANCE" (bold, centered)

3. ✅ Body
   - TO WHOM IT MAY CONCERN
   - Resident's full name (uppercase, centered, bold)
   - Age (auto-calculated from birth date)
   - Civil status
   - Purok
   - Complete address
   - Purpose

4. ✅ Signatures
   - HON. CELESTINO A. MARTINEZ I
   - ALEXANDER Y. ESTRELLA
   - OIC Punong Barangay

5. ✅ Footer Information
   - Date Issued
   - Certificate No. (BC-2026-000001)
   - Tracking No. (REQ-2026-000001)
   - Paid Under O.R. (OR-2026-000001)
   - Issued at: Barangay Cayang, Bogo City, Cebu

6. ✅ QR Code
   - Bottom right corner
   - "Scan to verify" text below
   - Should scan to verification URL

---

## 🐛 Common Issues & Solutions

### Issue 1: Server Won't Start
**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Then restart server
npm run start:dev
```

---

### Issue 2: Certificate Not Generated
**Error:** Request succeeds but no PDF created

**Check:**
1. Does `server/uploads/certificates/` directory exist?
2. Does the server have write permissions?
3. Check server logs for errors

**Solution:**
```bash
# Create directory manually if needed
cd server
mkdir uploads
mkdir uploads\certificates
```

---

### Issue 3: PDF Opens but Content is Wrong
**Possible causes:**
- Resident missing birth date
- Resident missing required fields
- Document type not found

**Solution:**
Check resident data:
```http
GET http://localhost:3000/api/residents/:residentId
Authorization: Bearer YOUR_TOKEN_HERE
```

Ensure all fields exist:
- firstName, middleName, lastName
- birthDate (required for age calculation)
- civilStatus
- sex
- purok
- address

---

### Issue 4: QR Code Not Working
**Check:**
1. Is `FRONTEND_URL` set in `.env`?
2. Does QR code scan properly?
3. Is verification endpoint accessible?

**Test verification URL manually:**
```http
GET http://localhost:3000/api/certificates/verify/BC-2026-000001
```

---

### Issue 5: No Messenger Notifications
**Possible causes:**
- Resident has no `messengerPSID`
- Facebook App credentials invalid
- Messenger service error

**Check logs:**
```
[NotificationsService] No Messenger PSID for resident: ...
```

**Solution:**
Resident must register via Messenger chatbot first to get PSID.

---

### Issue 6: Status Validation Error
**Error:** `Cannot transition from X to Y`

**Solution:**
Follow the correct workflow order:
```
pending → approved → certificate_generated → 
printed → secretary_signed → captain_signed → sealed → 
ready → released
```

---

## ✅ Testing Checklist

### Basic Functionality
- [ ] Server starts without errors
- [ ] Login works and returns JWT token
- [ ] Can retrieve existing requests
- [ ] Can approve and generate certificate
- [ ] PDF file is created in uploads/certificates/
- [ ] PDF opens and displays correctly
- [ ] Certificate number is unique (BC-2026-XXXXXX)
- [ ] OR number is unique (OR-2026-XXXXXX)
- [ ] QR code is embedded in PDF

### Workflow Testing
- [ ] Can mark as printed
- [ ] Can mark secretary signed
- [ ] Can mark captain signed
- [ ] Can mark seal applied
- [ ] Can mark ready for pickup
- [ ] Can release to resident
- [ ] Status transitions validate correctly
- [ ] Prerequisites are enforced

### Checklist API
- [ ] Processing checklist returns correct data
- [ ] Completion status is accurate
- [ ] Timestamps are recorded
- [ ] User tracking is recorded

### Verification
- [ ] Public verification endpoint works
- [ ] Returns correct certificate data
- [ ] Status is determined correctly (Valid/Revoked/Invalid)
- [ ] No authentication required

### Statistics
- [ ] Dashboard stats include all new statuses
- [ ] Counts are accurate
- [ ] Stats update after workflow changes

### Notifications (If Configured)
- [ ] Messenger notifications are sent
- [ ] Notification content is correct
- [ ] All 8 notifications work

### Error Handling
- [ ] Invalid status transitions are rejected
- [ ] Missing prerequisites are detected
- [ ] Non-existent requests return 404
- [ ] Invalid certificates return 404
- [ ] Proper error messages returned

---

## 📊 Success Criteria

**Backend is ready for production when:**
- ✅ All 16 checklist items pass
- ✅ PDF generates correctly every time
- ✅ QR code works
- ✅ All status transitions validated
- ✅ Messenger notifications sent (if configured)
- ✅ No TypeScript errors
- ✅ No runtime errors
- ✅ Database updates correctly

---

## 🎯 Next: Frontend Testing

Once backend testing is complete and passing, proceed to frontend implementation:

1. Update RequestsList component
2. Create CertificatePreview component
3. Create verification page
4. Update dashboard statistics
5. Test complete user flow

---

**Happy Testing! 🚀**

For detailed API documentation, see: `API_CERTIFICATE_ENDPOINTS.md`  
For complete module documentation, see: `CERTIFICATE_GENERATION_MODULE_COMPLETE.md`  
For overall project status, see: `IMPLEMENTATION_STATUS_SUMMARY.md`
