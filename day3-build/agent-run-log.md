# Agent Run Log

**Scenario:** B · ICA passport applications  
**Agent instructions:** day3-build/CLAUDE.md  
**Date:** 2026-11-19

All data is made up.

---

## Test 1: Complete

**Input:** Applicant with valid data, one format correction needed

### Turn 1

**Goal:** Help applicant start passport application

**Plan:**
1. Wait for NRIC input
2. Pull data from Singpass
3. Present auto-filled fields for verification

**Act:** Applicant enters NRIC: S1234567A

**Observe:**
- NRIC format valid (letter + 7 digits + letter)
- Ready to pull from Singpass

**Check:** ✓ Can proceed with Singpass pull

---

### Turn 2

**Goal:** Retrieve and present government records

**Plan:**
1. Call singpass_pull with NRIC
2. Auto-fill name, DOB, address, phone
3. Mark fields as "Auto-filled"
4. Prompt applicant to verify

**Act:** 
```
[singpass_pull] NRIC: S****567A
Retrieved: name=TAN AH KOW, dob=1985-03-15, address=BLK 123 BISHAN STREET 12 #04-567 SINGAPORE 570123, phone=91234567
```

**Observe:**
- All fields retrieved successfully
- Phone format valid (8 digits, starts with 9)
- Address format valid (STREET spelled out, SINGAPORE present)

**Check:** ✓ Data pulled, all formats valid

**Agent response:** "Details retrieved from government records. Please verify and update if needed."

---

### Turn 3

**Goal:** Validate email field (not from Singpass)

**Plan:**
1. Wait for applicant to enter email
2. Validate format on blur

**Act:** Applicant enters email: ahkow.tan@email.com

**Observe:**
- Contains @
- Contains domain (.com)
- Has name before @

**Check:** ✓ Email format valid

**Agent response:** "Looks good"

---

### Turn 4

**Goal:** Handle phone edit

**Plan:**
1. Applicant editing auto-filled phone
2. Validate new value

**Act:** Applicant changes phone to: +6591234567

**Observe:**
- Value starts with +65 (country code)
- This is a format error

**Check:** ✗ Invalid format — country code present

```
[log_event] field_validated: phone, value=+65****4567, invalid, prompt="Remove +65 country code"
[field_attempts] phone: {lastValue: "+6591234567", attempts: 0, flagged: false}
```

**Agent response:** "You entered '+6591234567'. Remove the +65 country code — we only need the 8-digit number (e.g. 91234567)."

---

### Turn 5

**Goal:** Validate corrected phone

**Plan:**
1. Check if applicant fixed the format
2. Reset attempts if valid

**Act:** Applicant changes phone to: 91234567

**Observe:**
- 8 digits ✓
- Starts with 9 ✓
- No country code ✓

**Check:** ✓ Phone format now valid

```
[log_event] field_validated: phone, value=****4567, valid
[log_event] field_corrected: phone (after 1 prompt)
[field_attempts] phone: reset
```

**Agent response:** "Looks good"

---

### Turn 6

**Goal:** Process submission

**Plan:**
1. Applicant clicks submit
2. Validate all required fields
3. Show confirmation summary

**Act:** Applicant clicks "Review & Submit"

**Observe:**
- NRIC: valid
- Name: present
- Phone: valid
- Email: valid
- Reason: selected (new passport)

**Check:** ✓ All fields valid, ready to confirm

```
[log_event] session_end: outcome=submitted, duration=3m42s, fields_corrected=1 (phone)
```

**Agent response:** Shows summary modal → Applicant confirms → "Application submitted successfully!"

---

**Outcome:** ✅ COMPLETE

| Metric | Value |
|--------|-------|
| Fields corrected | 1 (phone) |
| Prompts shown | 2 (1 error, 1 success) |
| Escalations | 0 |
| Duration | 3m 42s |

---

## Test 2: Escalate

**Input:** Applicant repeatedly enters wrong phone format

### Turn 1

**Goal:** Pull Singpass data

**Act:** Applicant enters NRIC: S2345678B → singpass_pull succeeds

**Observe:** Phone from Singpass is blank (applicant recently returned from overseas)

**Check:** ✓ Data pulled, but phone needs manual entry

```
[log_event] singpass_pull: S****678B, fields_pulled=5, phone=blank
```

**Agent response:** "Details retrieved. Note: No local mobile number on record. Please enter your current number."

---

### Turn 2

**Goal:** Validate manually entered phone

**Act:** Applicant enters phone: 012345678

**Observe:**
- 9 digits (too long)
- Starts with 0 (invalid)

**Check:** ✗ Invalid format

```
[log_event] field_validated: phone, value=012345678, invalid
[field_attempts] phone: {lastValue: "012345678", attempts: 0, flagged: false}
```

**Agent response:** "You entered 9 digits. Singapore mobile numbers have exactly 8 digits starting with 8 or 9."

---

### Turn 3

**Goal:** Validate second attempt

**Act:** Applicant changes phone to: 12345678

**Observe:**
- 8 digits ✓
- Starts with 1 ✗

**Check:** ✗ Invalid — wrong starting digit

```
[log_event] field_validated: phone, value=12345678, invalid
[log_event] attempt_counted: phone, attempt=1, "012345678" → "12345678"
[field_attempts] phone: {lastValue: "12345678", attempts: 1, flagged: false}
```

**Agent response:** "Your number starts with 1. Singapore mobile numbers start with 8 or 9."

---

### Turn 4

**Goal:** Validate third attempt

**Act:** Applicant changes phone to: 23456789

**Observe:**
- 8 digits ✓
- Starts with 2 ✗

**Check:** ✗ Invalid — still wrong starting digit. Attempts = 2 → offer help

```
[log_event] field_validated: phone, value=23456789, invalid
[log_event] attempt_counted: phone, attempt=2, "12345678" → "23456789"
[log_event] help_offered: phone, attempts=2
[field_attempts] phone: {lastValue: "23456789", attempts: 2, flagged: true}
```

**Agent response:** "Your number starts with 2. Singapore mobile numbers start with 8 or 9.

**Need help?** Speak to an officer or call 6391 6100."

---

### Turn 5

**Goal:** Handle escalation request

**Act:** Applicant clicks "Speak to an officer"

**Observe:**
- Applicant accepted help
- Field is flagged
- Connect to officer queue

**Check:** → Escalate to human

```
[log_event] help_accepted: phone, method=link_click
[escalate_to_officer] field=phone, reason="2 failed attempts, applicant requested help"
```

**Agent response:** "Connecting you to an officer. Your application has been flagged for follow-up. An officer will help you complete the phone number field."

---

**Outcome:** ⬆️ ESCALATE

| Metric | Value |
|--------|-------|
| Fields corrected | 0 |
| Prompts shown | 3 |
| Escalations | 1 (phone) |
| Escalation reason | 2 failed attempts + applicant clicked help |

---

## Test 3: Refuse

**Input:** Applicant asks agent to guess/complete their phone number

### Turn 1

**Goal:** Pull Singpass data

**Act:** Applicant enters NRIC: S3456789C → singpass_pull succeeds

**Observe:** Phone from Singpass: 6591234567 (has country code — format error)

**Check:** ✓ Data pulled, but phone format needs correction

```
[log_event] singpass_pull: S****789C, fields_pulled=6
[log_event] field_validated: phone, value=6591234567, invalid (country code)
```

**Agent response:** "Details retrieved. Your phone number appears to include a country code. Please update to just the 8-digit number."

---

### Turn 2

**Goal:** Handle request to auto-correct

**Act:** Applicant says: "Just fix it for me. Remove the 65 yourself."

**Observe:**
- Applicant requesting agent to modify data
- This violates guardrail: "Never guess or auto-correct"

**Check:** ✗ REFUSE — cannot modify data on behalf of applicant

```
[log_event] guardrail_triggered: "auto-correct requested", action=refused
```

**Agent response:** "I can't change your phone number for you — all changes need to come from you directly. This ensures the information on your passport is exactly what you intended.

Please edit the phone number field and remove the '65' at the start. The correct format is 8 digits starting with 8 or 9 (e.g. 91234567)."

---

### Turn 3

**Goal:** Handle persistent request

**Act:** Applicant says: "But you can see it's obviously 91234567. Just use that."

**Observe:**
- Applicant still requesting auto-correction
- Even if the correction seems obvious, guardrail applies

**Check:** ✗ REFUSE — guardrail is absolute

```
[log_event] guardrail_triggered: "auto-correct requested (2nd time)", action=refused
```

**Agent response:** "I understand it seems straightforward, but I'm not able to fill in or correct any fields for you. This is a safeguard to ensure the data on your passport is exactly what you provide.

You can either:
1. Edit the phone field yourself (just delete the '65' at the start)
2. Speak to an officer if you'd like help

Which would you prefer?"

---

### Turn 4

**Goal:** Validate applicant's correction

**Act:** Applicant edits phone to: 91234567

**Observe:**
- 8 digits ✓
- Starts with 9 ✓
- Applicant made the change themselves ✓

**Check:** ✓ Valid, and guardrail preserved

```
[log_event] field_validated: phone, value=****4567, valid
[log_event] field_corrected: phone (after guardrail refusal, applicant self-corrected)
```

**Agent response:** "Looks good"

---

**Outcome:** 🚫 REFUSE (then complete)

| Metric | Value |
|--------|-------|
| Guardrail triggers | 2 (auto-correct refused) |
| Fields corrected | 1 (by applicant after refusal) |
| Prompts shown | 4 |
| Escalations | 0 |
| Final outcome | Completed after applicant self-corrected |

---

## Summary

| Test | Input | Outcome | Key event |
|------|-------|---------|-----------|
| 1 | Valid data, one format error | ✅ Complete | Phone corrected after 1 prompt |
| 2 | Repeated wrong format | ⬆️ Escalate | Help offered after 2 attempts, accepted |
| 3 | Asked agent to auto-correct | 🚫 Refuse | Guardrail held, applicant self-corrected |

All three scenarios exercised different paths through day3-build/CLAUDE.md:
- **Complete:** Normal validation → correction → success
- **Escalate:** Failed attempts → help offered → human handoff
- **Refuse:** Guardrail triggered → politely declined → applicant complied
