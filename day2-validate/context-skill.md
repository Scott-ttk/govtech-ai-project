# Context Skill · Passport Application Field Guidance

**Scenario:** B · ICA passport applications

All examples in this file are made up.

## Purpose

Provide contextual prompts that help applicants enter correct information in the right format. The system should know when to show a hint (user might be confused), when to flag an error (format is wrong), and when to stay silent (input looks fine).

## Sources

- Field validation rules (format, length, allowed characters)
- Common error patterns from historical applications (made up)
- Singpass data schema (what can be pulled automatically)
- ICA passport photo requirements

## Rules

1. **Never guess or auto-correct** — only flag and ask the user to confirm
2. **Pull before asking** — if data is available from Singpass, don't ask the user to type it
3. **Show prompts only when needed** — if input matches expected format, stay silent
4. **Prioritise high-impact fields** — focus prompts on fields with highest error rates
5. **Use plain language** — no jargon, no field codes, just clear instructions

## Examples

### Good example 1: Format hint helps (made up)

**Field:** Mobile number  
**User input:** `6591234567`  
**Prompt shown:** "Please enter without country code. Just the 8-digit number."  
**User action:** Corrects to `91234567`  
**Outcome:** User had the info, prompt helped them fix the format. ✓

### Good example 2: Validation catches error (made up)

**Field:** Email address  
**User input:** `john.tan@gmailcom`  
**Prompt shown:** "This doesn't look like a valid email. Please check for typos."  
**User action:** Corrects to `john.tan@gmail.com`  
**Outcome:** User made a typo, prompt caught it. ✓

### Bad example: Prompt cannot solve missing info (made up)

**Field:** Previous passport number  
**User input:** (left blank)  
**Prompt shown:** "Please enter your previous passport number for renewal applications."  
**User action:** User doesn't have passport on hand, cannot proceed  
**Outcome:** User understood the field but lacked the info. Prompt explained what's needed but couldn't help them find it. ✗

This is the failure case — prompts don't help when the problem is missing information, not confusion about format.

## Owner

Product team for passport application experience.

## Review trigger

Review this context skill when:
- Error rates change significantly (new common mistakes emerge)
- Field validation rules are updated
- New fields are added to the application
- User feedback indicates prompts are unhelpful or confusing

## Test questions and expected answers

All questions and answers are made up for prototype testing.

### Q1: What format should the mobile number be in?

**Expected answer:** 8 digits starting with 8 or 9 (e.g. 91234567). No country code.

### Q2: A user enters their date of birth as "15/03/1985". Is this correct?

**Expected answer:** The system accepts date input via a date picker, so format is handled automatically. If entered as text, flag it and ask user to use the date picker.

### Q3: The address field shows "BLK 123 BISHAN ST 12 #04-567 S570123". Is this valid?

**Expected answer:** Close but not standard format. Should be "BLK 123 BISHAN STREET 12 #04-567 SINGAPORE 570123". Flag for user to verify.

### Q4: A user leaves the phone number blank. What prompt should show?

**Expected answer:** "Please enter your mobile number. We'll use this to contact you about your application." This explains why it's needed but cannot help if user doesn't have a local number.

### Q5: How should the system confirm correct input?

**Expected answer:** Show a soft, low-emphasis confirmation (e.g. "Looks good") that reassures the user without competing for attention with warnings or errors. The user's focus should stay on actionable items. For example, phone number "82345678" gets a subtle "Looks good" — not silent, but not as prominent as a warning.
