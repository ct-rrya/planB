# Quick Reference Card - Chatbot Registration

## 🚀 Quick Start

```bash
# Build
cd server
npm run build

# Start server
npm run start:dev

# Start ngrok (new terminal)
ngrok http 3000

# Test in Messenger
# Go to your Facebook Page and send a message
```

---

## 📋 Registration Steps

| # | Field | Input Type | Validation | Example |
|---|-------|------------|------------|---------|
| 1 | Full Name | Text | ≥2 words | `Juan Cruz Santos` |
| 2 | Birth Date | Text | Valid date, not future, age ≥1yr | `January 15, 2002` or `2002-01-15` |
| 3 | Sex | Quick Reply | Male or Female | Click `Male` |
| 4 | Contact | Text | 11 digits, starts with 09 | `09123456789` |
| 5 | Purok | Quick Reply | Purok 1-5 | Click `Purok 3` |
| 6 | Civil Status | Quick Reply | Single/Married/Widowed/Separated | Click `Single` |
| 7 | Address | Text | ≥10 characters | `123 Main Street, Sitio Maharlika` |

---

## ✅ Validation Rules

### Name
- **Required:** First name + Last name
- **Optional:** Middle name
- **Format:** Space-separated words
- **Example:** `Juan Santos` or `Juan Cruz Santos`

### Birth Date
- **Formats:**
  - ISO: `2002-01-15`
  - Natural: `January 15, 2002`
  - Slash: `01/15/2002`
- **Rules:**
  - Cannot be future
  - Age must be ≥ 1 year

### Contact Number
- **Format:** 11 digits starting with 09
- **Accepts:** `09123456789`, `0912-345-6789`, `9123456789`
- **Auto-fix:** Adds leading 0 if missing

### Address
- **Min length:** 10 characters
- **Format:** Any

---

## 🔧 State Machine

```
idle → awaiting_name → awaiting_birthdate → awaiting_sex
  → awaiting_contact → awaiting_purok → awaiting_civil_status
  → awaiting_address → idle (complete)
```

---

## 📝 Modified Files

| File | Changes |
|------|---------|
| `server/src/chatbot/chatbot.service.ts` | ~300 lines - Complete registration redesign |

---

## 🧪 Test Commands

### Local Test
```bash
# Open Messenger
# Go to your Facebook Page
# Send "Get Started"
# Complete all 7 steps
```

### Database Check
```javascript
// MongoDB
db.residents.find({ messengerPSID: "YOUR_PSID" })

// Should show all fields populated
```

---

## ❌ Common Errors & Fixes

### Build Error
```bash
# Clean and rebuild
rm -rf dist
npm run build
```

### ngrok URL Changed
```bash
# 1. Get new ngrok URL
# 2. Update Meta Developers webhook
# 3. Verify webhook again
```

### Quick Replies Not Showing
- Use official Messenger app (not some browsers)
- Check server logs for API errors

### Registration Incomplete
- Check MongoDB connection
- Check server logs for errors
- Verify all required fields in schema

---

## 📊 Database Record

```json
{
  "firstName": "Juan",
  "middleName": "Cruz",
  "lastName": "Santos",
  "birthDate": "2002-01-15T00:00:00.000Z",
  "sex": "Male",
  "contactNumber": "09123456789",
  "purok": "Purok 3",
  "civilStatus": "Single",
  "address": "123 Main Street, Sitio Maharlika",
  "messengerPSID": "1234567890"
}
```

✅ **No placeholder values!**

---

## 🎯 Success Indicators

- ✅ Build completes with zero errors
- ✅ All 7 steps complete in Messenger
- ✅ "Registration complete! ✅" message appears
- ✅ Main menu shows after registration
- ✅ Database record has all fields populated
- ✅ No "N/A" or default values in database
- ✅ User can immediately request documents

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `CHATBOT_REDESIGN_SUMMARY.md` | Executive summary |
| `CHATBOT_REGISTRATION_REDESIGN.md` | Complete technical documentation |
| `CHATBOT_TESTING_GUIDE.md` | Testing scenarios and verification |
| `CHATBOT_FLOW_DIAGRAM.md` | Visual flow charts |
| `QUICK_REFERENCE.md` | This card |

---

## 🆘 Support

### Issue: Validation not working
1. Check server logs for errors
2. Verify validation logic in `chatbot.service.ts`
3. Test with known valid input

### Issue: Database not saving
1. Check MongoDB connection
2. Check required fields in schema
3. Check server logs for save errors

### Issue: Existing user asked to register
1. Check `messengerPSID` in database
2. Verify same Facebook account used
3. Check resident lookup logic

---

## 🚀 Deployment Checklist

- [ ] Build succeeds (zero errors)
- [ ] Local registration flow works
- [ ] All 7 steps complete successfully
- [ ] Database record verified
- [ ] Quick replies display correctly
- [ ] Validation working
- [ ] Error messages clear
- [ ] Existing users skip registration
- [ ] Document request works after registration
- [ ] ngrok URL updated in Meta
- [ ] Webhook verified

---

## 💡 Pro Tips

1. **Test with multiple users** to ensure no race conditions
2. **Check database after each registration** to verify data quality
3. **Monitor server logs** for any validation errors
4. **Use Quick Replies** for better UX on mobile
5. **Keep error messages friendly** and helpful

---

## 📞 Quick Links

- **Meta Developers:** https://developers.facebook.com/
- **MongoDB Compass:** For database inspection
- **ngrok Dashboard:** https://dashboard.ngrok.com/

---

## ✅ Pre-Launch Checklist

- [ ] Server running
- [ ] ngrok tunnel active
- [ ] Meta webhook verified (green checkmark)
- [ ] Test registration completed successfully
- [ ] Database shows complete data
- [ ] No TypeScript errors
- [ ] Documentation reviewed
- [ ] Team trained on new flow

---

**Print this page for quick reference during development and testing!** 📄
