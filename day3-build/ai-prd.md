# AI PRD: Passport Application Assistant

**Scenario:** B · ICA passport applications  
**Date:** 2026-11-19  
**Status:** Draft for review

All data is made up.

---

## Problem and user

**User:** Singapore residents applying for a new, renewed, or replacement passport through the online form.

**Problem:** Applicants struggle to provide accurate information in the correct format, leading to:
- Follow-up corrections by officers
- Increased officer workload
- Longer processing times
- Applicant frustration

**Root cause hypothesis:** Users are confused about format requirements (e.g. phone without country code, address without abbreviations), not missing information entirely.

**What success looks like:** Users who see a prompt successfully correct or complete the field without officer intervention.

**Kill signal:** Most users who see a prompt still can't complete the field — prompts aren't the solution.

---

## Instructions

The agent helps applicants complete passport application forms accurately. It does not fill in forms for them.

**Core task:**
1. Pull available information from Singpass after NRIC entry
2. Validate field formats and give specific feedback when something is wrong
3. Offer help escalation when the applicant is stuck

**Tone:**
- Direct and specific ("You entered 6 digits. Singapore mobile numbers have 8 digits.")
- Echo what the user entered so they know exactly what's being flagged
- Soft confirmation on success ("Looks good") — reassure without competing for attention

**Guardrails (do not change without asking product owner):**
1. Never guess or auto-correct any field value
2. Never ask for information that can be pulled from Singpass
3. Offer help after 2 failed attempts (counting only value changes)
4. Specific feedback must echo the user's input
5. Phone must start with 8 or 9 (Singapore mobile rule)
6. Address must spell out STREET, SINGAPORE (ICA format requirement)

---

## Tools

| Tool | Purpose | Trigger |
|------|---------|---------|
| `singpass_pull` | Retrieve name, DOB, address, phone from government records | After NRIC provided |
| `validate_field` | Check if a field value matches expected format | On every field blur |
| `log_event` | Record prompts shown, corrections made, escalations | On every validation |
| `escalate_to_officer` | Flag application and connect to human support | After 2 failed attempts, or user request |

**Not available:**
- Tool to complete or correct data on behalf of applicant
- Tool to submit application (user confirms via UI)
- Access to previous passport records
- Photo validation beyond basic dimensions

---

## Context and memory

**Per-session (remembered during application):**

| Key | What | Used for |
|-----|------|----------|
| `nric` | Applicant's NRIC | Singpass pull, session identifier |
| `pulled_fields` | Which fields came from Singpass | Track what was auto-filled vs. manual |
| `field_attempts` | Per-field: last value, attempt count, flagged | Decide when to offer help |
| `prompts_shown` | List with timestamps | Logging, analysis |

**Cross-session:**
- None. Each application starts fresh.
- Agent forgets everything between sessions.
- No access to historical applications.

**Validation rules (loaded from config):**
- Phone: 8 digits, starts with 8 or 9, no country code
- Email: Contains @ and domain (.com, .sg, etc.)
- Address: STREET not ST, SINGAPORE not S before postal code
- NRIC: Letter + 7 digits + letter

---

## Permissions

Every action the agent takes, with tier and proposed setting:

| Action | Tier | Setting | Notes |
|--------|------|---------|-------|
| **Read NRIC from input** | read | `Proposed: auto` | Needed to call Singpass |
| **Call singpass_pull** | read | `Proposed: auto` | Standard retrieval, user reviews result |
| **Read field value on blur** | read | `Proposed: auto` | Needed to validate |
| **Check value against validation rules** | read | `Proposed: auto` | Internal logic |
| **Draft error prompt message** | draft | `Proposed: auto` | Echoes user input, follows template |
| **Draft success message ("Looks good")** | draft | `Proposed: auto` | Soft confirmation |
| **Write prompt to UI** | write | `Proposed: auto` | User sees immediately |
| **Write auto-filled data to form fields** | write | `Proposed: auto` | After Singpass pull, user can edit |
| **Draft help offer message** | draft | `Proposed: confirm` | After 2 attempts, significant moment |
| **Write help link to UI** | write | `Proposed: confirm` | Visible escalation path |
| **Log session_start event** | write | `Proposed: auto` | Internal telemetry |
| **Log field_validated event** | write | `Proposed: auto` | Internal telemetry |
| **Log attempt_counted event** | write | `Proposed: auto` | Internal telemetry |
| **Log help_offered event** | write | `Proposed: auto` | Internal telemetry |
| **Log help_accepted event** | write | `Proposed: auto` | Internal telemetry |
| **Log session_end event** | write | `Proposed: auto` | Internal telemetry |
| **Send escalation to officer queue** | send | `Proposed: confirm` | Creates work for officer |
| **Send application to backend** | send | `Proposed: block` | User must confirm via UI, not agent |

**Tier definitions:**
- **read** — Access data without changing anything
- **draft** — Prepare content but don't show/send yet
- **write** — Make visible changes to the user's session
- **send** — Transmit to external system or person

**Setting definitions:**
- **auto** — Agent proceeds without asking
- **confirm** — Agent proposes, waits for confirmation
- **block** — Agent cannot do this; human must

---

## Human checkpoints

| Trigger | What agent does | Who reviews |
|---------|-----------------|-------------|
| 2 failed attempts on same field | Shows "Need help? Speak to an officer" link | User decides |
| User clicks help link | Connects to officer queue | Officer |
| User explicitly asks for help | Connects to officer queue | Officer |
| Edge case agent cannot validate | Flags for manual review, lets user proceed | Officer |
| User confirms Singpass data is wrong | Flags mismatch, lets user edit | Officer |
| 3+ fields flagged for help | Flags entire application | Supervisor |

**Does not escalate:**
- On first error (give them a chance)
- While user is actively editing (wait for blur)
- For soft warnings

---

## Stop conditions

| Condition | Agent action | Who resumes |
|-----------|--------------|-------------|
| User requests officer | Connect to queue, stop prompting | Officer |
| 3+ fields flagged | Flag entire application, stop | Supervisor |
| NRIC fails validation repeatedly | Cannot proceed, offer hotline | User retries or calls |
| User abandons session | Log state, do not follow up | User returns or times out |
| System error | Apologise, offer retry or officer | User or support |

**Does not stop:**
- Single field errors (keeps helping)
- Soft warnings (informational)
- Optional fields left blank

---

## Logs

| Event | What to log | Masking |
|-------|-------------|---------|
| `session_start` | Timestamp, session ID | None |
| `singpass_pull` | NRIC, fields pulled, success/failure | NRIC: S****567A |
| `field_validated` | Field name, value, valid/invalid, prompt shown | Phone: ****4567, Email: ****@domain |
| `attempt_counted` | Field name, attempt number, old → new value | Mask sensitive values |
| `help_offered` | Field name, attempt count, timestamp | None |
| `help_accepted` | Field name, method (link click, phone) | None |
| `field_corrected` | Field name, after which prompt | None |
| `guardrail_triggered` | What was requested, action taken | None |
| `session_end` | Outcome, duration, fields corrected | None |

**Retention:** TBD — depends on audit requirements.

---

## Business rules

| Rule | Source | Can agent change? |
|------|--------|-------------------|
| Phone starts with 8 or 9 | Singapore mobile standard | No — ICA policy |
| Phone has exactly 8 digits | Singapore mobile standard | No — ICA policy |
| No country code in phone | ICA form requirement | No — ICA policy |
| Address spells out STREET, AVENUE, etc. | ICA format requirement | No — ICA policy |
| Address includes SINGAPORE before postal code | ICA format requirement | No — ICA policy |
| NRIC format: letter + 7 digits + letter | National standard | No |
| 2 attempts before help offer | Product decision | No — ask product owner |
| Count only value changes as attempts | Product decision | No — ask product owner |
| Singpass fields: name, DOB, address, phone | Singpass API scope | No — API constraint |

---

## What engineering decides

These are implementation details the engineering team owns:

| Decision | Constraint | Current choice |
|----------|------------|----------------|
| Validation runs on blur vs. submit | Must not interrupt typing | On blur |
| How to track attempts | Must count value changes, not every blur | `fieldAttempts` object |
| Where to store validation rules | Must be easy to update | `config.js` |
| How to mask logs | NRIC, phone, email must not be fully visible | First letter + last 3, last 4, domain only |
| Help link implementation | Must be visible but not blocking | Inline link + phone number |
| State management | Must work per session | Global object (prototype); TBD for production |
| Error message template | Must echo user input | String interpolation in config |

---

## Open decisions

These need product or stakeholder input before implementation:

| Decision | Options | Who decides | Impact if delayed |
|----------|---------|-------------|-------------------|
| Help offer setting | `auto` or `confirm`? | Product owner | Affects user flow |
| Escalation send setting | `confirm` or `block`? | Product owner | Affects officer workload |
| Log retention period | 30 days? 1 year? Indefinite? | Legal / compliance | Audit risk |
| What happens after escalation | Queue? Callback? Live chat? | Operations | Officer staffing |
| Attempt threshold | Is 2 the right number? | Product owner | User friction vs. escalation rate |
| Address false positive handling | Block submit or warn only? | Product owner | User friction vs. data quality |
| Extend attempt tracking | Add to email, address? | Engineering + product | Consistency |
| Photo validation depth | Basic dimensions or face detection? | Product owner | Scope creep vs. error reduction |
| A/B test design | Which metrics? How long? | Product owner | Learning speed |
| Rollback trigger | What failure rate triggers rollback? | Product owner + engineering | Risk tolerance |
