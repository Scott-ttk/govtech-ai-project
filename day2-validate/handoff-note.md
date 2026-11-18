# Handoff Note

**Scenario:** B · ICA passport applications  
**Date:** 2026-11-18

---

## What it does

A passport application form prototype that demonstrates three AI-assisted capabilities:

1. **Singpass data pull** — retrieves name, DOB, address, phone from government records (simulated)
2. **Format validation with specific feedback** — tells users exactly what's wrong ("You entered 6 digits. Singapore mobile numbers have exactly 8 digits")
3. **Help escalation** — after 2 failed attempts to fix a field, offers "Speak to an officer" link

The prototype validates phone, email, and address fields. It tracks failed attempts per field and only counts when users change to a different wrong value (not every blur).

---

## What is synthetic

**All data is made up.** Nothing connects to real systems.

| Item | Synthetic? | Notes |
|------|------------|-------|
| NRIC numbers | Yes | S1234567A, S2345678B, etc. |
| Names | Yes | TAN AH KOW, LIM MEI LING, etc. |
| Addresses | Yes | Made-up block numbers and postal codes |
| Phone numbers | Yes | 91234567, 82345678, etc. |
| Singpass integration | Yes | Simulated with 800ms delay |
| Test profiles | Yes | 5 profiles testing different scenarios |
| ICA phone number | Yes | 6391 6100 used as placeholder |

---

## What is missing for production

| Category | Missing |
|----------|---------|
| **Integration** | Real Singpass API, backend submission, database |
| **Security** | XSS protection in `flagForHelp()`, input sanitisation, CSRF |
| **Accessibility** | ARIA labels, focus management, screen reader announcements |
| **Logging** | Which prompts shown, which fields corrected, attempt counts |
| **Testing** | Unit tests, integration tests, edge case coverage |
| **Attempt tracking** | Only phone has it; address and email need it too |
| **Photo validation** | Background colour check, face detection, proper dimension validation |
| **Previous passport** | Field not implemented (needed for renewals) |
| **Payment** | Not in scope for prototype |
| **i18n** | Messages in config.js but not structured for translation |

---

## Decisions an engineer must not change without asking

These are guardrails agreed with stakeholders:

| Decision | Reason | Ask before changing |
|----------|--------|---------------------|
| **Never guess or auto-correct** | Chief Executive concern: wrong data on passport goes to Parliament | Product owner |
| **Never ask for pullable info** | Strategy kernel: reduce effort by pulling from Singpass | Product owner |
| **2 failed attempts before help** | Balances user friction vs. premature escalation | Product owner |
| **Count only value changes as attempts** | Prevents triggering help while user is actively editing | Product owner |
| **Specific feedback echoes user input** | Expand prompt: user sees exactly what they entered and what's wrong | Product owner |
| **Soft success ("Looks good")** | Reassures without competing for attention with warnings | UX lead |
| **Phone starts with 8 or 9** | Singapore mobile number rule | ICA policy owner |
| **Address must spell out STREET, SINGAPORE** | ICA format requirement | ICA policy owner |

---

## Handoff decision

**Decision:** Move to production spec now.

**Why:** The prototype has validated the core hypothesis — prompts can help users who are confused about format (Profile D), while clearly showing the limitation when users lack information entirely (Profile E). The three capabilities (pull, validate, escalate) work together, and the configuration has been refactored for maintainability.

**What was proven:**
- Specific feedback is more helpful than generic errors
- Help escalation after 2 attempts gives users an escape hatch
- Counting only value changes prevents premature help triggers
- Soft success confirmations reassure without distracting

**What to watch in production:**
- False positive rate on address abbreviations
- Whether 2 attempts is the right threshold
- Whether users understand what the prompts are checking

**Next steps:**
1. Write production spec based on living-prd.md
2. Integrate with real Singpass API
3. Add logging before launch to measure prompt effectiveness
4. Plan A/B test against current form
