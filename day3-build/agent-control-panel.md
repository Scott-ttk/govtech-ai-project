# Agent Control Panel

**Scenario:** B · ICA passport applications  
**Date:** 2026-11-19

All data is made up.

---

## What the agent is doing

The agent helps applicants complete passport application forms accurately. It does not fill in forms for them.

**Current capabilities:**
1. Pulls name, DOB, address, phone from Singpass after NRIC entry
2. Validates phone, email, address formats on field blur
3. Gives specific feedback that echoes what the user entered
4. Offers "Speak to an officer" link after 2 failed attempts
5. Logs prompts shown and corrections made

**Not doing:**
- Guessing or auto-correcting any value
- Submitting applications (user confirms)
- Processing payments
- Validating photos beyond basic dimensions

---

## Opportunity portfolio

| Step | Type | Value | Risk | Status |
|------|------|-------|------|--------|
| Pull from Singpass | Workflow | 5–6 fields auto-filled, fewer typos | Low — user reviews before submit | Ready |
| Validate format on blur | Chat assistant | Catches errors early, specific feedback | Medium — false positives on edge cases | Ready |
| Offer help after 2 attempts | Chat assistant | Escape hatch for stuck users | Low — threshold may need tuning | Ready |
| Submit to backend | Workflow | Completes transaction | High — wrong data hard to undo | Not ready |
| Flag for officer review | Agent | Routes edge cases to humans | Medium — false flags waste time | Not ready |

**Portfolio balance:**
- 3 ready steps (pull, validate, help) — low risk, tested
- 2 not ready (submit, escalate) — need backend integration

---

## Rules of engagement

### Decides alone (no human approval needed)

| Action | Why autonomous | Guardrail |
|--------|----------------|-----------|
| Pull data from Singpass | Standard retrieval, user reviews result | Only pulls fields in scope |
| Validate field format | Immediate feedback loop | Never changes the value |
| Show "Looks good" | Soft confirmation, no action taken | Only after valid input |
| Log events | Internal telemetry | Masks sensitive data |

### Proposes and waits (user must confirm)

| Action | Why wait | Timeout |
|--------|----------|---------|
| Show error prompt | User may be mid-edit | Waits for blur |
| Offer help link | User decides if stuck | No timeout — stays visible |
| Show confirmation summary | Final check before submit | User clicks confirm |
| Submit application | Irreversible | User clicks confirm |

### A person reviews (officer or supervisor)

| Action | Who reviews | Trigger |
|--------|-------------|---------|
| Flagged application | Officer | User clicks "Speak to an officer" |
| Data mismatch after pull | Officer | User confirms Singpass data is wrong |
| 3+ fields flagged | Supervisor | Something systemic may be wrong |
| Edge case validation | Officer | Agent cannot validate (e.g. foreign address) |

---

## Stop conditions

The agent stops and waits for human intervention when:

| Condition | What happens | Who resumes |
|-----------|--------------|-------------|
| User requests officer | Connects to queue, stops prompting | Officer |
| 3+ fields flagged for help | Flags entire application | Supervisor |
| NRIC fails validation repeatedly | Cannot verify identity | User retries or calls hotline |
| User abandons session | Logs state, does not follow up | User returns or times out |
| System error | Apologises, offers retry or officer | User or support |

**Does not stop for:**
- Single field errors (keeps helping)
- Soft warnings (informational only)
- Optional fields left blank

---

## What stays human

These decisions are never delegated to the agent:

| Decision | Why human | Who decides |
|----------|-----------|-------------|
| Change guardrails | Chief Executive concern — wrong data on passport | Product owner |
| Override validation rules | Policy may have exceptions | ICA policy owner |
| Approve edge case data | Judgment call on ambiguous input | Officer |
| Handle complaints | Requires empathy and authority | Officer or supervisor |
| Change attempt threshold | Affects user experience at scale | Product owner |
| Add new validation rules | Requires policy sign-off | Product owner + ICA |
| Process refunds | Financial authority | Finance team |
| Access historical applications | Privacy and audit trail | Authorised staff only |

**Principle:** The agent helps users fill in forms correctly. It does not make decisions about what is correct — that stays with humans.
