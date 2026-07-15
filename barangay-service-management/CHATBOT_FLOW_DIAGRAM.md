# Chatbot Registration Flow Diagram

## Visual Flow Chart

```
┌─────────────────────────────────────────────────────────────┐
│  User sends message / Clicks "Get Started"                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
             ┌────────────────────────┐
             │  Check if resident     │
             │  exists by PSID?       │
             └────────┬───────┬───────┘
                      │       │
           YES ───────┘       └─────── NO
            │                           │
            ▼                           ▼
  ┌─────────────────────┐    ┌──────────────────────┐
  │  Show Main Menu     │    │  Start Registration  │
  │  (Skip Registration)│    │  State: idle →       │
  └─────────────────────┘    │  awaiting_name       │
                              └──────────┬───────────┘
                                         │
                                         ▼
╔══════════════════════════════════════════════════════════════╗
║                    REGISTRATION FLOW                          ║
╚══════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────┐
│  STEP 1: Full Name                                           │
│  State: awaiting_name                                        │
├──────────────────────────────────────────────────────────────┤
│  Bot: "Please enter your complete name:"                     │
│  User: "Juan Cruz Santos"                                    │
│  Validation: ≥2 words (First + Last)                         │
│  Parsed: firstName="Juan", middleName="Cruz",                │
│          lastName="Santos"                                    │
└────────────────────────┬─────────────────────────────────────┘
                         │ Valid
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 2: Birth Date                                          │
│  State: awaiting_birthdate                                   │
├──────────────────────────────────────────────────────────────┤
│  Bot: "Enter your birth date.                                │
│       Example: January 15, 2002  or  2002-01-15"             │
│  User: "January 15, 2002"                                    │
│  Validation: Valid date, not future, age ≥1 year             │
│  Formats: ISO, natural language, MM/DD/YYYY                  │
└────────────────────────┬─────────────────────────────────────┘
                         │ Valid
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 3: Sex                                                 │
│  State: awaiting_sex                                         │
├──────────────────────────────────────────────────────────────┤
│  Bot: "What is your sex?"                                    │
│  Quick Replies: [Male] [Female]                             │
│  User: Clicks "Male"                                         │
│  Validation: Must be "Male" or "Female"                      │
└────────────────────────┬─────────────────────────────────────┘
                         │ Valid
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 4: Contact Number                                      │
│  State: awaiting_contact                                     │
├──────────────────────────────────────────────────────────────┤
│  Bot: "Enter your contact number.                            │
│       Example: 09123456789"                                  │
│  User: "09123456789"                                         │
│  Validation: 11 digits, starts with 09                       │
│  Auto-fix: Adds leading 0 if 10 digits starting with 9      │
└────────────────────────┬─────────────────────────────────────┘
                         │ Valid
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 5: Purok                                               │
│  State: awaiting_purok                                       │
├──────────────────────────────────────────────────────────────┤
│  Bot: "Which Purok do you belong to?"                        │
│  Quick Replies: [Purok 1] [Purok 2] [Purok 3]               │
│                 [Purok 4] [Purok 5]                          │
│  User: Clicks "Purok 3" or types "3"                         │
│  Validation: Must match Purok pattern                        │
└────────────────────────┬─────────────────────────────────────┘
                         │ Valid
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 6: Civil Status                                        │
│  State: awaiting_civil_status                                │
├──────────────────────────────────────────────────────────────┤
│  Bot: "What is your civil status?"                           │
│  Quick Replies: [Single] [Married] [Widowed] [Separated]    │
│  User: Clicks "Single"                                       │
│  Validation: Must be valid civil status                      │
└────────────────────────┬─────────────────────────────────────┘
                         │ Valid
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 7: Complete Address                                    │
│  State: awaiting_address                                     │
├──────────────────────────────────────────────────────────────┤
│  Bot: "Enter your complete address.                          │
│       Example: 123 Main Street, Sitio Maharlika"             │
│  User: "123 Main Street, Sitio Maharlika, Barangay ABC"     │
│  Validation: ≥10 characters                                  │
└────────────────────────┬─────────────────────────────────────┘
                         │ Valid
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  CREATE RESIDENT IN MONGODB                                  │
├──────────────────────────────────────────────────────────────┤
│  {                                                            │
│    firstName: "Juan",                                         │
│    middleName: "Cruz",                                        │
│    lastName: "Santos",                                        │
│    birthDate: Date("2002-01-15"),                            │
│    sex: "Male",                                               │
│    contactNumber: "09123456789",                             │
│    purok: "Purok 3",                                          │
│    civilStatus: "Single",                                     │
│    address: "123 Main Street, Sitio Maharlika",              │
│    messengerPSID: "1234567890"                               │
│  }                                                            │
└────────────────────────┬─────────────────────────────────────┘
                         │ Success
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  REGISTRATION COMPLETE!                                      │
│  State: idle                                                 │
├──────────────────────────────────────────────────────────────┤
│  Bot: "Registration complete! ✅                             │
│       Welcome, Juan! 🎉                                      │
│       You can now use our services.                          │
│       How can I help you today?"                             │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  SHOW MAIN MENU                                              │
├──────────────────────────────────────────────────────────────┤
│  Quick Replies:                                              │
│  📝 Request Document                                         │
│  📦 Track Request                                            │
│  📢 Announcements                                            │
│  ℹ️ Info                                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────┐
│  User provides INVALID input at any step                     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Show VALIDATION ERROR MESSAGE                               │
│  + Instructions/Examples                                     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Stay in SAME STATE                                          │
│  Wait for VALID input                                        │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  User provides VALID input                                   │
│  → Proceed to NEXT step                                      │
└──────────────────────────────────────────────────────────────┘
```

---

## State Transitions

```
idle (not registered)
  │
  ├─→ awaiting_name
  │     │
  │     ├─→ awaiting_birthdate
  │     │     │
  │     │     ├─→ awaiting_sex
  │     │     │     │
  │     │     │     ├─→ awaiting_contact
  │     │     │     │     │
  │     │     │     │     ├─→ awaiting_purok
  │     │     │     │     │     │
  │     │     │     │     │     ├─→ awaiting_civil_status
  │     │     │     │     │     │     │
  │     │     │     │     │     │     ├─→ awaiting_address
  │     │     │     │     │     │     │     │
  │     │     │     │     │     │     │     └─→ idle (registered) ✅
```

---

## Context Data Flow

### Step 1: Name
```javascript
context = {
  firstName: "Juan",
  middleName: "Cruz",
  lastName: "Santos"
}
```

### Step 2: Birth Date
```javascript
context = {
  firstName: "Juan",
  middleName: "Cruz",
  lastName: "Santos",
  birthDate: "2002-01-15T00:00:00.000Z"
}
```

### Step 3: Sex
```javascript
context = {
  firstName: "Juan",
  middleName: "Cruz",
  lastName: "Santos",
  birthDate: "2002-01-15T00:00:00.000Z",
  sex: "Male"
}
```

### Step 4: Contact
```javascript
context = {
  firstName: "Juan",
  middleName: "Cruz",
  lastName: "Santos",
  birthDate: "2002-01-15T00:00:00.000Z",
  sex: "Male",
  contactNumber: "09123456789"
}
```

### Step 5: Purok
```javascript
context = {
  firstName: "Juan",
  middleName: "Cruz",
  lastName: "Santos",
  birthDate: "2002-01-15T00:00:00.000Z",
  sex: "Male",
  contactNumber: "09123456789",
  purok: "Purok 3"
}
```

### Step 6: Civil Status
```javascript
context = {
  firstName: "Juan",
  middleName: "Cruz",
  lastName: "Santos",
  birthDate: "2002-01-15T00:00:00.000Z",
  sex: "Male",
  contactNumber: "09123456789",
  purok: "Purok 3",
  civilStatus: "Single"
}
```

### Step 7: Address → CREATE RESIDENT
```javascript
// Address added and Resident created in MongoDB
{
  firstName: "Juan",
  middleName: "Cruz",
  lastName: "Santos",
  birthDate: Date("2002-01-15"),
  sex: "Male",
  contactNumber: "09123456789",
  purok: "Purok 3",
  civilStatus: "Single",
  address: "123 Main Street, Sitio Maharlika",
  messengerPSID: "1234567890"
}
```

---

## Quick Reply Options

### Sex (Step 3)
```
┌──────────┬──────────┐
│   Male   │  Female  │
└──────────┴──────────┘
```

### Purok (Step 5)
```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Purok 1  │ Purok 2  │ Purok 3  │ Purok 4  │ Purok 5  │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Civil Status (Step 6)
```
┌──────────┬──────────┬──────────┬──────────┐
│  Single  │ Married  │ Widowed  │Separated │
└──────────┴──────────┴──────────┴──────────┘
```

---

## Validation Logic

```
┌─────────────────────────────────────────────────────────┐
│  Input Received                                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────┐
        │  Validate Input  │
        └────┬─────────┬───┘
             │         │
      VALID  │         │  INVALID
             │         │
             ▼         ▼
    ┌────────────┐  ┌──────────────────┐
    │ Store Data │  │ Show Error Msg   │
    │ in Context │  │ + Keep State     │
    └─────┬──────┘  └────────┬─────────┘
          │                  │
          ▼                  │
    ┌───────────┐            │
    │ Next Step │            │
    └───────────┘            │
                             │
          ┌──────────────────┘
          │
          ▼
    ┌─────────────┐
    │ Wait for    │
    │ Valid Input │
    └─────────────┘
```

---

## Example: Valid Registration (Full Flow)

```
User → Bot: [Start]
Bot → User: "Welcome! Please enter your complete name:"

User → Bot: "Juan Cruz Santos"
Bot → User: "Thank you, Juan! 😊 Enter your birth date..."

User → Bot: "January 15, 2002"
Bot → User: "What is your sex?" [Male] [Female]

User → Bot: [Male]
Bot → User: "Enter your contact number. Example: 09123456789"

User → Bot: "09123456789"
Bot → User: "Which Purok?" [Purok 1] [Purok 2] [Purok 3] [Purok 4] [Purok 5]

User → Bot: [Purok 3]
Bot → User: "Civil status?" [Single] [Married] [Widowed] [Separated]

User → Bot: [Single]
Bot → User: "Enter complete address. Example: 123 Main Street..."

User → Bot: "123 Main Street, Sitio Maharlika, Barangay ABC"
Bot → User: "Registration complete! ✅ Welcome, Juan! 🎉"
Bot → User: [Main Menu] 📝 Request Document | 📦 Track | 📢 News | ℹ️ Info
```

**Duration:** ~2-3 minutes  
**Result:** Complete resident record with NO placeholders ✅

---

## Example: Error Handling (Birth Date)

```
User → Bot: "January 15, 2002"
Bot → User: "What is your sex?" [Male] [Female]

User → Bot: [Male]
Bot → User: "Enter your contact number..."

User → Bot: "09123456789"
Bot → User: "Which Purok?" [Purok 1-5]

User → Bot: [Purok 2]
Bot → User: "Civil status?" [Single] [Married] [Widowed] [Separated]

User → Bot: [Married]
Bot → User: "Enter complete address..."

User → Bot: "abc"  ❌ TOO SHORT
Bot → User: "Please provide a more complete address (at least 10 characters)."
           [STAYS IN awaiting_address state]

User → Bot: "123 Main Street, Barangay ABC"  ✅ VALID
Bot → User: "Registration complete! ✅"
```

**User can retry without losing previous answers** ✅

---

## Comparison: Old vs New Flow

### Old Flow (3 Steps)
```
1. Name     →  2. Address  →  3. Contact  →  Done
   ↓              ↓             ↓
  ✅             ✅            ✅
                                ↓
                    birthDate: placeholder ❌
                    sex: default ❌
                    civilStatus: default ❌
                    purok: N/A ❌
```

### New Flow (7 Steps)
```
1. Name  →  2. BirthDate  →  3. Sex  →  4. Contact
   ↓            ↓              ↓           ↓
  ✅           ✅             ✅          ✅
                                          ↓
5. Purok  →  6. CivilStatus  →  7. Address  →  Done
   ↓             ↓                  ↓
  ✅            ✅                 ✅
                                   ↓
                       All fields: user input ✅
                       No placeholders ✅
```

---

## Benefits Visualization

```
┌─────────────────────────────────────────────────────────────┐
│  BEFORE: Incomplete Registration                            │
├─────────────────────────────────────────────────────────────┤
│  ❌ 40% placeholder data                                    │
│  ❌ Cannot generate accurate documents                      │
│  ❌ Need manual profile updates later                       │
│  ❌ Poor data quality                                       │
└─────────────────────────────────────────────────────────────┘

                           ⬇️ REDESIGN

┌─────────────────────────────────────────────────────────────┐
│  AFTER: Complete Registration                               │
├─────────────────────────────────────────────────────────────┤
│  ✅ 100% user-provided data                                 │
│  ✅ Ready for document generation                           │
│  ✅ No manual updates needed                                │
│  ✅ High data quality                                       │
│  ✅ Better user experience with Quick Replies               │
│  ✅ Clear validation and error messages                     │
└─────────────────────────────────────────────────────────────┘
```

---

**The registration flow now collects complete, accurate resident information in a user-friendly conversational manner!** ✅
