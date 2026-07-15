# Backend Testing Script - Certificate Generation Module

**Server Status:** ✅ Running on http://localhost:3000/api  
**Swagger Docs:** http://localhost:3000/api/docs  
**Date:** July 14, 2026

---

## 🎯 Testing Checklist

Use this document to systematically test every backend feature. Record results after each test.

---

## 📋 Pre-Test Setup

### Step 0: Get Authentication Token

**Request:**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Record Result:**
- [ ] Login successful
- [ ] Token received: `______________________`

**Save your token - you'll use it for all subsequent requests!**

---

## 🧪 TEST 1: Verify Existing Data

### 1.1 Check Document Types
```http
GET http://localhost:3000/api/document-types
Authorization: Bearer YOUR_TOKEN
```

**Verify:**
- [ ] Returns list of document types
- [ ] "Barangay Clearance" exists
- [ ] Record a document type ID: `______________________`

---

### 1.2 Check Existing Residents
```http
GET http://localhost:3000/api/residents?limit=5
Authorization: Bearer YOUR_TOKEN
```

**Verify:**
- [ ] Returns list of residents
- [ ] Residents have: firstName, lastName, birthDate, address, purok, civilStatus, sex
- [ ] Record a resident ID: `______________________`
- [ ] Record resident's messengerPSID (if exists): `______________________`

**If no residents exist, you'll need to create one via Messenger chatbot or directly.**

---

### 1.3 Check Existing Requests
```http
GET http://localhost:3000/api/requests?status=pending&limit=5
Authorization: Bearer YOUR_TOKEN
```

**Verify:**
- [ ] Returns list of pending requests
- [ ] Record a pending request ID: `______________________`

**If no pending requests, create one via chatbot or skip to Test 2.**

---

##Human: test 1.1 failed. it says 401 unauthorized

<EnvironmentContext>
This information is provided as context about user environment. Only consider it if it's relevant to the user request ignore it otherwise.

<OPEN-EDITOR-FILES>
<file name="c:\Users\Merry Apple Edano\OneDrive\Desktop\planb\barangay-service-management\server\.env" />
<file name="c:\Users\Merry Apple Edano\OneDrive\Desktop\planb\barangay-service-management\READY_TO_TEST.md" />
<file name="c:\Users\Merry Apple Edano\OneDrive\Desktop\planb\barangay-service-management\server\src\chatbot\chatbot.controller.ts" />
<file name="c:\Users\Merry Apple Edano\OneDrive\Desktop\planb\barangay-service-management\server\src\main.ts" />
<file name="c:\Users\Merry Apple Edano\OneDrive\Desktop\planb\barangay-service-management\BACKEND_TESTING_SCRIPT.md" />
</invoke>