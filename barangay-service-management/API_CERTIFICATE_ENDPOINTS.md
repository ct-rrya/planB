# Certificate Generation API - Quick Reference

## 🔐 Authentication Required
All endpoints except certificate verification require JWT authentication:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Certificate Workflow Endpoints

### 1. Approve & Generate Certificate
**The main endpoint that starts the certificate workflow**

```http
POST /api/requests/:id/approve-and-generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "orNumber": "OR-2026-000001" // Optional - auto-generated if not provided
}
```

**Response:**
```json
{
  "_id": "67890abc",
  "trackingNumber": "REQ-2026-000001",
  "certificateNumber": "BC-2026-000001",
  "certificateUrl": "/certificates/BC-2026-000001.pdf",
  "orNumber": "OR-2026-000001",
  "status": "certificate_generated",
  "generatedAt": "2026-07-14T13:00:00.000Z",
  "generatedBy": "64abc123...",
  "resident": { ... },
  "documentType": { ... }
}
```

**What it does:**
1. Changes status from `pending` → `approved` → `certificate_generated`
2. Generates unique certificate number
3. Generates OR number
4. Creates PDF certificate with resident data
5. Embeds QR code in PDF
6. Sends 2 Messenger notifications (approved + generated)

---

### 2. Mark Certificate as Printed
```http
PATCH /api/requests/:id/mark-printed
Authorization: Bearer <token>
Content-Type: application/json

{
  "remarks": "Printed successfully" // Optional
}
```

**Status transition:** `certificate_generated` → `printed`

**What it does:**
1. Updates status to `printed`
2. Records `printed = true`, `printedAt`, `printedBy`
3. Sends Messenger notification

---

### 3. Secretary Signature
```http
PATCH /api/requests/:id/secretary-signed
Authorization: Bearer <token>
Content-Type: application/json

{
  "remarks": "Signed by Secretary" // Optional
}
```

**Status transition:** `printed` → `secretary_signed`

**Prerequisites:**
- Certificate must be printed first

**What it does:**
1. Updates status to `secretary_signed`
2. Records `secretarySigned = true`, timestamps
3. Sends Messenger notification

---

### 4. Captain Signature
```http
PATCH /api/requests/:id/captain-signed
Authorization: Bearer <token>
Content-Type: application/json

{
  "remarks": "Signed by Punong Barangay" // Optional
}
```

**Status transition:** `secretary_signed` → `captain_signed`

**Prerequisites:**
- Secretary must sign first

**What it does:**
1. Updates status to `captain_signed`
2. Records `captainSigned = true`, timestamps
3. Sends Messenger notification

---

### 5. Apply Official Seal
```http
PATCH /api/requests/:id/seal-applied
Authorization: Bearer <token>
Content-Type: application/json

{
  "remarks": "Official seal applied" // Optional
}
```

**Status transition:** `captain_signed` → `sealed`

**Prerequisites:**
- Captain must sign first

**What it does:**
1. Updates status to `sealed`
2. Records `sealApplied = true`, timestamps
3. Sends Messenger notification

---

### 6. Mark Ready for Pickup
```http
PATCH /api/requests/:id/ready-for-pickup
Authorization: Bearer <token>
Content-Type: application/json

{
  "remarks": "Ready for pickup" // Optional
}
```

**Status transition:** `sealed` → `ready`

**Prerequisites (ALL REQUIRED):**
- ✅ Secretary signature
- ✅ Captain signature
- ✅ Official seal

**What it does:**
1. Validates all prerequisites are complete
2. Updates status to `ready`
3. Records `readyForPickup = true`, timestamps
4. Sends Messenger notification with office hours

---

### 7. Release Certificate
```http
PATCH /api/requests/:id/release
Authorization: Bearer <token>
Content-Type: application/json

{
  "remarks": "Released to resident" // Optional
}
```

**Status transition:** `ready` → `released`

**What it does:**
1. Updates status to `released`
2. Records `releasedAt`, `releasedBy`
3. Sends Messenger notification (thank you message)

---

## 📊 Query Endpoints

### 8. Get Processing Checklist
```http
GET /api/requests/:id/checklist
Authorization: Bearer <token>
```

**Response:**
```json
{
  "certificateGenerated": {
    "completed": true,
    "completedAt": "2026-07-14T13:00:00.000Z",
    "completedBy": "64abc123..."
  },
  "printed": {
    "completed": true,
    "completedAt": "2026-07-14T13:05:00.000Z",
    "completedBy": "64abc123..."
  },
  "secretarySigned": {
    "completed": true,
    "completedAt": "2026-07-14T13:10:00.000Z",
    "completedBy": "64abc123...",
    "required": true
  },
  "captainSigned": {
    "completed": true,
    "completedAt": "2026-07-14T13:15:00.000Z",
    "completedBy": "64abc123...",
    "required": true
  },
  "sealApplied": {
    "completed": true,
    "completedAt": "2026-07-14T13:20:00.000Z",
    "completedBy": "64abc123...",
    "required": true
  },
  "readyForPickup": {
    "completed": false,
    "completedAt": null,
    "completedBy": null,
    "canComplete": true
  },
  "released": {
    "completed": false,
    "completedAt": null,
    "completedBy": null
  }
}
```

---

### 9. Get Request Details
```http
GET /api/requests/:id
Authorization: Bearer <token>
```

**Response includes all certificate fields:**
```json
{
  "_id": "67890abc",
  "trackingNumber": "REQ-2026-000001",
  "certificateNumber": "BC-2026-000001",
  "certificateUrl": "/certificates/BC-2026-000001.pdf",
  "orNumber": "OR-2026-000001",
  "status": "ready",
  "generatedAt": "2026-07-14T13:00:00.000Z",
  "generatedBy": { ... },
  "printed": true,
  "printedAt": "2026-07-14T13:05:00.000Z",
  "printedBy": { ... },
  "secretarySigned": true,
  "secretarySignedAt": "2026-07-14T13:10:00.000Z",
  "secretarySignedBy": { ... },
  "captainSigned": true,
  "captainSignedAt": "2026-07-14T13:15:00.000Z",
  "captainSignedBy": { ... },
  "sealApplied": true,
  "sealAppliedAt": "2026-07-14T13:20:00.000Z",
  "sealAppliedBy": { ... },
  "readyForPickup": true,
  "readyForPickupAt": "2026-07-14T13:25:00.000Z",
  "readyForPickupBy": { ... },
  "resident": { ... },
  "documentType": { ... },
  "purpose": "Employment requirements"
}
```

---

### 10. Get Dashboard Statistics
```http
GET /api/requests/stats
Authorization: Bearer <token>
```

**Response:**
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

## 🔓 Public Endpoints (No Authentication Required)

### 11. Verify Certificate
```http
GET /api/certificates/verify/:certificateNumber
```

**Example:**
```http
GET /api/certificates/verify/BC-2026-000001
```

**Response:**
```json
{
  "certificateNumber": "BC-2026-000001",
  "trackingNumber": "REQ-2026-000001",
  "residentName": "Juan Dela Cruz",
  "documentType": "Barangay Clearance",
  "dateIssued": "2026-07-14T13:00:00.000Z",
  "status": "Valid",
  "issuingBarangay": "Barangay Cayang, Bogo City, Cebu",
  "verifiedAt": "2026-07-14T13:30:00.000Z"
}
```

**Status values:**
- `Valid` - Certificate is active and legitimate
- `Revoked` - Certificate was rejected
- `Invalid` - Certificate not found

---

### 12. Download Certificate PDF
```http
GET /certificates/:certificateNumber.pdf
```

**Example:**
```http
GET http://localhost:3000/certificates/BC-2026-000001.pdf
```

**No authentication required** - Static file serving

---

## 🔄 Complete Workflow Example

```javascript
// 1. Approve and generate certificate
POST /api/requests/67890abc/approve-and-generate
→ Status: certificate_generated
→ PDF created
→ 2 Messenger notifications sent

// 2. Mark as printed
PATCH /api/requests/67890abc/mark-printed
→ Status: printed
→ Messenger notification sent

// 3. Secretary signs
PATCH /api/requests/67890abc/secretary-signed
→ Status: secretary_signed
→ Messenger notification sent

// 4. Captain signs
PATCH /api/requests/67890abc/captain-signed
→ Status: captain_signed
→ Messenger notification sent

// 5. Apply seal
PATCH /api/requests/67890abc/seal-applied
→ Status: sealed
→ Messenger notification sent

// 6. Mark ready
PATCH /api/requests/67890abc/ready-for-pickup
→ Status: ready
→ Validates all prerequisites
→ Messenger notification sent

// 7. Release to resident
PATCH /api/requests/67890abc/release
→ Status: released
→ Messenger notification sent
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Cannot transition from printed to ready",
  "error": "Bad Request"
}
```

**Common causes:**
- Trying to skip workflow steps
- Missing prerequisites (e.g., marking ready without all signatures)
- Invalid status transition

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Cause:** Missing or invalid JWT token

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Request with ID 67890abc not found",
  "error": "Not Found"
}
```

**Cause:** Invalid request ID

---

## 🧪 Testing with cURL

```bash
# 1. Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Save the token from response
TOKEN="your_jwt_token_here"

# 2. Approve and generate certificate
curl -X POST http://localhost:3000/api/requests/67890abc/approve-and-generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# 3. Mark as printed
curl -X PATCH http://localhost:3000/api/requests/67890abc/mark-printed \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"remarks":"Printed"}'

# 4. Secretary signature
curl -X PATCH http://localhost:3000/api/requests/67890abc/secretary-signed \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"remarks":"Signed"}'

# 5. Captain signature
curl -X PATCH http://localhost:3000/api/requests/67890abc/captain-signed \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"remarks":"Signed"}'

# 6. Apply seal
curl -X PATCH http://localhost:3000/api/requests/67890abc/seal-applied \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"remarks":"Sealed"}'

# 7. Mark ready
curl -X PATCH http://localhost:3000/api/requests/67890abc/ready-for-pickup \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"remarks":"Ready"}'

# 8. Release
curl -X PATCH http://localhost:3000/api/requests/67890abc/release \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"remarks":"Released"}'

# 9. Get checklist
curl -X GET http://localhost:3000/api/requests/67890abc/checklist \
  -H "Authorization: Bearer $TOKEN"

# 10. Verify certificate (public - no auth)
curl -X GET http://localhost:3000/api/certificates/verify/BC-2026-000001
```

---

## 🎯 Frontend Integration Notes

### Button Visibility Logic

```typescript
// Show "Approve & Generate" button
if (status === 'pending') {
  showApproveButton = true;
}

// Show "Mark Printed" button
if (status === 'certificate_generated') {
  showMarkPrintedButton = true;
}

// Show "Secretary Signed" button
if (status === 'printed') {
  showSecretaryButton = true;
}

// Show "Captain Signed" button
if (status === 'secretary_signed') {
  showCaptainButton = true;
}

// Show "Apply Seal" button
if (status === 'captain_signed') {
  showSealButton = true;
}

// Show "Mark Ready" button
if (status === 'sealed') {
  showReadyButton = true;
}

// Show "Release" button
if (status === 'ready') {
  showReleaseButton = true;
}

// Show "Preview/Download" buttons
if (certificateUrl) {
  showPreviewButton = true;
  showDownloadButton = true;
}
```

### Status Badge Colors

```typescript
const statusColors = {
  pending: 'gray',
  approved: 'green',
  certificate_generated: 'purple',
  printed: 'indigo',
  secretary_signed: 'teal',
  captain_signed: 'cyan',
  sealed: 'emerald',
  ready: 'lime',
  released: 'green',
  rejected: 'red'
};
```

---

## 📱 Messenger Notification Messages

**Approved:**
```
✅ Good news!

Your request has been APPROVED!

🔖 Tracking #: REQ-2026-000001
📄 Document: Barangay Clearance
⏱️ Processing Time: 3 days

Your document is now being processed. We'll notify you when it's ready for pickup.

Thank you for your patience!
```

**Certificate Generated:**
```
📄 Certificate Generated!

🔖 Tracking #: REQ-2026-000001
📄 Document: Barangay Clearance
🆔 Certificate #: BC-2026-000001

Your certificate has been generated and is now being processed for signatures and official seal.

We'll notify you once it's ready for pickup!
```

**Printed:**
```
🖨️ Certificate Printed!

🔖 Tracking #: REQ-2026-000001
📄 Document: Barangay Clearance

Your certificate has been printed and is now awaiting official signatures.

Next steps:
✍️ Barangay Secretary signature
✍️ Punong Barangay signature
🏛️ Official Barangay seal

We'll keep you updated!
```

**Secretary Signed:**
```
✍️ Secretary Signature Complete!

🔖 Tracking #: REQ-2026-000001
📄 Document: Barangay Clearance

The Barangay Secretary has signed your certificate.

Next: Waiting for Punong Barangay signature and official seal.

Almost ready! 😊
```

**Captain Signed:**
```
✍️ Punong Barangay Signature Complete!

🔖 Tracking #: REQ-2026-000001
📄 Document: Barangay Clearance

The Punong Barangay has signed your certificate.

Next: Official Barangay seal application.

You're almost there! 🎉
```

**Seal Applied:**
```
🏛️ Official Seal Applied!

🔖 Tracking #: REQ-2026-000001
📄 Document: Barangay Clearance

The official Barangay seal has been applied to your certificate.

Your certificate is now complete and will be marked ready for pickup shortly.

Thank you for your patience! 😊
```

**Ready for Pickup:**
```
📦 Your document is ready for pickup!

🔖 Tracking #: REQ-2026-000001
📄 Document: Barangay Clearance
💰 Fee: ₱50

📍 Please visit our office during office hours to claim your document.

🏢 Office Hours:
Monday - Friday: 8:00 AM - 5:00 PM
Saturday: 8:00 AM - 12:00 PM

Please bring:
✓ Valid ID
✓ This tracking number

See you soon!
```

**Released:**
```
🎉 Document released successfully!

🔖 Tracking #: REQ-2026-000001
📄 Document: Barangay Clearance
✅ Status: RELEASED
📅 Released: July 14, 2026

Thank you for using our Barangay Service Management System!

We hope we were able to serve you well. If you need another document in the future, don't hesitate to reach out!

Have a great day! 😊
```

---

**Last Updated:** July 14, 2026  
**API Version:** 1.0  
**Backend Status:** ✅ Complete and Tested
