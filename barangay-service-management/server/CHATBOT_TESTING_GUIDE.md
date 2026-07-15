# Chatbot Registration Testing Guide

## Quick Start

### 1. Start Server
```bash
cd server
npm run start:dev
```

### 2. Start ngrok
```bash
ngrok http 3000
```

### 3. Test in Messenger

Open Messenger → Go to your Page → Send a message

---

## Test Cases

### ✅ Test Case 1: Complete Valid Registration

**Steps:**

1. **Send:** `Get Started` (or any message)
   - **Expected:** Welcome message asking for name

2. **Send:** `Juan Cruz Santos`
   - **Expected:** Thanks message, asks for birth date

3. **Send:** `January 15, 2002` or `2002-01-15`
   - **Expected:** Quick replies for Male/Female

4. **Click:** `Male`
   - **Expected:** Asks for contact number

5. **Send:** `09123456789`
   - **Expected:** Quick replies for Purok 1-5

6. **Click:** `Purok 3`
   - **Expected:** Quick replies for civil status

7. **Click:** `Single`
   - **Expected:** Asks for complete address

8. **Send:** `123 Main Street, Sitio Maharlika, Barangay ABC`
   - **Expected:** 
     ```
     Registration complete! ✅
     Welcome, Juan! 🎉
     You can now use our services.
     How can I help you today?
     ```
   - **Expected:** Main menu with quick replies

**Verification:**
- Check MongoDB: Resident document created with all fields
- No placeholder values (Male, Single, N/A)
- All data matches user input

---

### ❌ Test Case 2: Invalid Name

**Steps:**

1. **Send:** `Get Started`
2. **Send:** `Juan` (only one word)
   - **Expected:**
     ```
     Please enter your complete name with at least first name and last name.
     
     Example: Juan Santos or Juan Cruz Santos
     ```

3. **Send:** `Juan Santos`
   - **Expected:** Proceeds to birth date

---

### ❌ Test Case 3: Invalid Birth Date

**Steps:**

1. Complete name step
2. **Send:** `2030-01-01` (future date)
   - **Expected:** `Birth date cannot be in the future. Please enter a valid birth date.`

3. **Send:** `abc123` (invalid format)
   - **Expected:**
     ```
     That doesn't look like a valid birth date.
     
     Please enter it in one of these formats:
     • YYYY-MM-DD (e.g., 2002-01-15)
     • Month Day, Year (e.g., January 15, 2002)
     ```

4. **Send:** Current date minus 6 months (too young)
   - **Expected:** `You must be at least 1 year old. Please enter a valid birth date.`

5. **Send:** `2000-01-01` (valid)
   - **Expected:** Proceeds to sex selection

---

### ❌ Test Case 4: Invalid Contact Number

**Steps:**

1. Complete name, birth date, sex steps
2. **Send:** `123` (too short)
   - **Expected:**
     ```
     Please enter a valid Philippine mobile number.
     
     Example: 09123456789
     
     Must be 11 digits starting with 09.
     ```

3. **Send:** `1234567890` (wrong format)
   - **Expected:** Same error

4. **Send:** `09123456789` (valid)
   - **Expected:** Proceeds to purok selection

---

### ❌ Test Case 5: Invalid Address

**Steps:**

1. Complete all steps until address
2. **Send:** `123` (too short)
   - **Expected:** `Please provide a more complete address (at least 10 characters).`

3. **Send:** `123 Main Street, Barangay ABC` (valid)
   - **Expected:** Registration complete

---

### ✅ Test Case 6: Existing User

**Steps:**

1. Complete registration (Test Case 1)
2. **Refresh/restart conversation**
3. **Send:** Any message
   - **Expected:** 
     - Does NOT ask for registration
     - Shows main menu immediately
     - Recognizes user by messengerPSID

---

### ✅ Test Case 7: Document Request After Registration

**Steps:**

1. Complete registration
2. **Click:** `Request Document` quick reply
   - **Expected:** Shows available document types

3. **Click:** Select a document (e.g., "Barangay Clearance")
   - **Expected:** Asks for purpose

4. **Send:** `For employment`
   - **Expected:**
     ```
     ✅ Request submitted successfully!
     
     Your tracking number is:
     🔖 REQ-2026-000001
     ```

**Verification:**
- Request created in database
- Linked to correct resident
- All resident information available for document generation

---

### ✅ Test Case 8: Alternative Input Formats

**Birth Date Formats:**
- ✅ `2002-01-15` (ISO format)
- ✅ `January 15, 2002` (natural language)
- ✅ `01/15/2002` (slash format)

**Contact Number Formats:**
- ✅ `09123456789` (standard)
- ✅ `0912-345-6789` (with hyphens)
- ✅ `0912 345 6789` (with spaces)
- ✅ `9123456789` (auto-adds leading 0)

**Purok Formats:**
- ✅ `Purok 1` (full format)
- ✅ `1` (just number)
- ✅ Clicking quick reply

**Sex/Civil Status:**
- ✅ `Male` / `Female`
- ✅ `male` / `female` (case-insensitive)
- ✅ Clicking quick reply

---

## Database Verification

### Check Resident Created

**MongoDB Compass:**
1. Connect to your MongoDB
2. Go to `residents` collection
3. Filter: `{ messengerPSID: "YOUR_PSID" }`

**Expected Fields:**
```json
{
  "_id": ObjectId("..."),
  "firstName": "Juan",
  "middleName": "Cruz",
  "lastName": "Santos",
  "birthDate": ISODate("2002-01-15T00:00:00.000Z"),
  "sex": "Male",
  "civilStatus": "Single",
  "contactNumber": "09123456789",
  "address": "123 Main Street, Sitio Maharlika, Barangay ABC",
  "purok": "Purok 3",
  "messengerPSID": "1234567890",
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### Check Conversation State

**MongoDB Compass:**
1. Go to `conversationstates` collection
2. Filter: `{ messengerPSID: "YOUR_PSID" }`

**After Registration:**
```json
{
  "_id": ObjectId("..."),
  "messengerPSID": "1234567890",
  "currentState": "idle",
  "context": {},
  "lastInteraction": ISODate("...")
}
```

**During Registration (e.g., at step 3):**
```json
{
  "_id": ObjectId("..."),
  "messengerPSID": "1234567890",
  "currentState": "awaiting_contact",
  "context": {
    "firstName": "Juan",
    "middleName": "Cruz",
    "lastName": "Santos",
    "birthDate": "2002-01-15T00:00:00.000Z",
    "sex": "Male"
  },
  "lastInteraction": ISODate("...")
}
```

---

## Server Logs to Watch For

### Successful Registration Flow

```
[ChatbotService] Received message from 1234567890: Juan Cruz Santos
[MessengerService] Message sent to 1234567890
[ChatbotService] Received message from 1234567890: January 15, 2002
[MessengerService] Message sent to 1234567890
[ChatbotService] Received message from 1234567890: Male
[MessengerService] Message sent to 1234567890
[ChatbotService] Received message from 1234567890: 09123456789
[MessengerService] Message sent to 1234567890
[ChatbotService] Received message from 1234567890: Purok 3
[MessengerService] Message sent to 1234567890
[ChatbotService] Received message from 1234567890: Single
[MessengerService] Message sent to 1234567890
[ChatbotService] Received message from 1234567890: 123 Main Street, Sitio Maharlika
[MessengerService] Message sent to 1234567890
```

### Validation Error

```
[ChatbotService] Received message from 1234567890: Juan
[MessengerService] Message sent to 1234567890
```
(User receives error message)

### Registration Error (Database Failure)

```
[ChatbotService] Received message from 1234567890: 123 Main Street, Sitio Maharlika
[ChatbotService] Error creating resident: [error details]
[MessengerService] Message sent to 1234567890
```

---

## Troubleshooting

### Issue: Bot doesn't respond

**Check:**
1. Server is running
2. ngrok tunnel is active
3. Webhook verified in Meta Developers
4. Check server logs for errors

### Issue: Quick replies don't appear

**Check:**
1. Using official Messenger app (not web in some browsers)
2. Check server logs - message sent successfully?
3. Meta API rate limits not exceeded

### Issue: Registration doesn't complete

**Check:**
1. MongoDB connection active
2. Server logs show error?
3. Resident schema has all required fields
4. No unique constraint violations

### Issue: Existing user asked to register again

**Check:**
1. messengerPSID stored correctly in database
2. Same Facebook account used for testing
3. Resident document exists: `db.residents.findOne({ messengerPSID: "..." })`

### Issue: Invalid date not caught

**Check:**
1. `parseBirthDate()` method working correctly
2. Date validation logic present
3. Check server logs for parsing errors

---

## Performance Testing

### Load Test (Optional)

1. **Create multiple test users**
2. **Register 10-20 users simultaneously**
3. **Check:**
   - All registrations complete successfully
   - No race conditions
   - All data saved correctly
   - Response times acceptable

### Database Queries

**Check indexes:**
```javascript
db.residents.getIndexes()
```

**Expected:**
- Index on `messengerPSID` (for fast lookup)

---

## Acceptance Criteria

### ✅ Registration Flow

- [ ] Collects all 7 fields in order
- [ ] Validates each input with appropriate error messages
- [ ] Uses Quick Replies for Sex, Purok, and Civil Status
- [ ] Creates Resident only after ALL fields collected
- [ ] No placeholder values used
- [ ] Existing users skip registration
- [ ] Shows main menu after registration

### ✅ Data Quality

- [ ] All fields populated with user input
- [ ] Birth date is valid Date object
- [ ] Contact number is 11 digits starting with 09
- [ ] Sex is "Male" or "Female"
- [ ] Civil Status is valid enum value
- [ ] Purok follows "Purok N" format
- [ ] No "N/A" or default placeholder values

### ✅ User Experience

- [ ] Clear instructions at each step
- [ ] Examples provided for complex inputs
- [ ] Error messages are helpful and friendly
- [ ] Quick Replies make selection easy
- [ ] Flow completes in reasonable time
- [ ] Can immediately use services after registration

### ✅ Technical

- [ ] Zero TypeScript errors
- [ ] Build succeeds
- [ ] No console errors
- [ ] Database constraints respected
- [ ] Error handling for all edge cases
- [ ] Logging for debugging

---

## Regression Testing

After making changes, verify:

1. ✅ **Document Request** still works
2. ✅ **Track Request** still works
3. ✅ **View Announcements** still works
4. ✅ **View Information** still works
5. ✅ **Get Started** button works
6. ✅ **Persistent Menu** works
7. ✅ **Main Menu** quick replies work
8. ✅ **Existing features** unchanged

---

## Sign-Off Checklist

Before deploying to production:

- [ ] All test cases pass
- [ ] Database verification successful
- [ ] Server logs show no errors
- [ ] Quick replies display correctly
- [ ] Validation works for all inputs
- [ ] Error messages are clear
- [ ] Registration completes successfully
- [ ] Existing users recognized
- [ ] Document request works after registration
- [ ] No placeholder data in database
- [ ] Build succeeds with zero errors
- [ ] Code reviewed
- [ ] Documentation updated

---

**Once all checkboxes are complete, the chatbot registration redesign is ready for production!** ✅
