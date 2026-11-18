# Living PRD

**Scenario:** B · ICA passport applications  
**Extracted from:** day2-validate/prototype/

All data is synthetic.

---

## 1. Product overview

A passport application form with contextual prompts that help users enter correct information. The prototype demonstrates three capabilities:

1. **Singpass data pull** — retrieve name, DOB, address, phone from government records
2. **Format validation** — flag errors with specific feedback ("You entered 6 digits...")
3. **Help escalation** — after 2 failed attempts, offer to speak with an officer

The form covers: reason for application, identity verification (NRIC + Singpass), personal details, contact information, and photo upload.

---

## 2. Problem and riskiest assumption

**Problem:** Applicants struggle to provide accurate information in the correct format, leading to follow-up corrections and officer workload.

**Riskiest assumption:** Prompts can help people fill in better information.

**Why it might be wrong:** Users might already understand the fields but simply don't have the information. Prompts won't help someone who needs to go find their previous passport number.

**Kill switch:** Most users who see a prompt still can't complete the field.

**Success signal:** Users who see a prompt successfully correct or complete the field.

---

## 3. User flow and screen map

```
┌─────────────────────────────────────────────────────────┐
│ 1. REASON FOR APPLICATION                               │
│    Select: New / Renew / Replace                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. IDENTITY VERIFICATION                                │
│    Enter NRIC → Click "Retrieve via Singpass"           │
│    [Demo mode: select test profile]                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. PERSONAL DETAILS (auto-filled, editable)             │
│    Name, DOB, Gender, Race                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. CONTACT INFORMATION                                  │
│    Address ← validates abbreviations (ST→STREET)        │
│    Phone   ← validates format, tracks attempts          │
│    Email   ← validates @ and domain                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. PHOTO UPLOAD                                         │
│    Drag/drop or click, checks dimensions                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. REVIEW & SUBMIT                                      │
│    Modal shows summary → Confirm                        │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Success metrics

| Metric | Target | How measured |
|--------|--------|--------------|
| Application completion time | 15 min (from 30 min) | Time from start to submit |
| Net officer workload | Decrease | Before/after comparison |
| Prompt effectiveness | Users who see prompt correct the field | Log prompt shown vs. field corrected |
| False positive rate | <5% | Count valid inputs flagged as wrong |
| Guardrail violations | 0 | No guessed or auto-corrected data reaches submission |

---

## 5. Technical reality

**What exists in code:**

| Component | Status | Location |
|-----------|--------|----------|
| Form HTML structure | ✓ Complete | `index.html` |
| Singpass simulation | ✓ Complete | `app.js:simulateDataPull()` |
| Phone validation + attempt tracking | ✓ Complete | `app.js:validatePhone()` |
| Address validation (abbreviations) | ✓ Complete | `app.js:validateAddress()` |
| Email validation | ✓ Partial | `app.js:validateEmail()` — no attempt tracking |
| Help escalation | ✓ Phone only | `app.js:flagForHelp()` |
| Test profiles | ✓ 5 profiles | `profiles.js` |
| Prompt styles | ✓ Complete | `style.css` |

**What's hard-coded:**

- All validation rules (regex patterns, digit counts)
- All prompt messages (inline strings in JS)
- Phone number rules (Singapore-specific: 8 digits, starts with 8/9)
- Address abbreviations (ST, AVE, RD, DR, S+postal)

---

## 6. Assumptions and risks

| Assumption | Risk if wrong | How to test |
|------------|---------------|-------------|
| Users are confused about format, not missing info | Prompts won't help; need different solution | Profile D vs E testing |
| Users trust and understand prompts | They ignore them or call hotline | Watch 5 users, ask what messages meant |
| Singpass data is accurate | Users have to correct auto-filled data | Check address note frequency |
| 2 attempts is the right threshold for help | Too few = premature; too many = frustrated | Observe when users actually get stuck |

**Documented risks (from one-pager):**

- **Market:** Users don't understand what AI is checking
- **Technical:** False positives on valid input (edge cases)
- **Team:** Can't isolate which feature works

---

## 7. In and out of scope

**In scope (prototype proves):**

- Specific feedback on format errors
- Help escalation after repeated failures
- Singpass data pull simulation
- 5 test profiles covering different scenarios

**Out of scope (not in prototype):**

- Real Singpass integration
- Backend submission / persistence
- Audit logging
- Accessibility (ARIA, screen readers)
- Internationalisation
- Automated tests
- Photo validation (background colour, face detection)
- Previous passport number field
- Payment flow

---

## 8. Engineering recommendation

**To move from prototype to production:**

1. **Extend attempt tracking** — currently only phone has it; add to address and email
2. **Centralise validation rules** — move from inline regex to config file
3. **Centralise prompt messages** — extract to JSON for i18n and A/B testing
4. **Add logging** — track which prompts shown, which fields corrected
5. **Add tests** — unit tests for validation functions, integration tests for flows
6. **Accessibility audit** — ARIA labels, focus management, screen reader announcements
7. **Replace global state** — `fieldAttempts` object → proper state management
8. **Security review** — `innerHTML` in `flagForHelp()` is XSS risk if user input ever reaches it

**Estimated effort:** 2-3 sprints to production-ready with logging and tests.

---

## Notes from prototype review

**[solid]**
- Simple UI and logic

**[fragile]**
- A significant proportion of hard-coded logic

**[surprise]**
- Some kind of validation logic already exists, albeit being hard coded
