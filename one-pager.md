# One Pager

Use case: [your chosen scenario (A, B, or C), written with synthetic data only]

## Problem and user
## Opportunity and evidence
## Experience and trust
## Risks (market, technical, team)

**Market risk:** Users don't trust or understand the prompts. If they don't know what the AI is checking for, they may ignore prompts or lose confidence in the form.

- **How to test:** Watch 5 users complete the form. Ask: "What did you think that message meant?" Count how many correctly explain the prompt's purpose.

**Technical risk:** Prompts fire on false positives. Valid input gets flagged as wrong — edge cases like names with hyphens, transliterations, or unusual address formats.

- **How to test:** Run the prototype against 20 synthetic edge cases (names with hyphens, addresses with unusual formats). Count false flags.

**Team risk:** We can't isolate which feature works. Prompts, Singpass pull, or confirmation step could each be the driver — we won't know what to scale or cut.

- **How to test:** Log which prompts were seen vs. which fields were corrected. Analyse before scaling to know what to keep.

## Build plan and handoff
## Agent role and guardrails

**What the agent does:** Helps applicants complete passport forms accurately by pulling data, validating formats, and offering help when stuck. It does not fill in forms for them.

**Decides alone:**
- Pull data from Singpass (user reviews before submit)
- Validate field format on blur (never changes the value)
- Show "Looks good" for valid input
- Log events (with masking)

**Proposes and waits:**
- Show error prompts (user may be mid-edit)
- Offer "Speak to an officer" after 2 failed attempts
- Show confirmation summary before submit

**A person reviews:**
- Flagged applications (officer)
- Data mismatches (officer)
- 3+ fields flagged (supervisor)
- Edge cases agent cannot validate (officer)

**Stop conditions:**
- User requests officer → connect to queue
- 3+ fields flagged → flag entire application
- NRIC fails repeatedly → cannot proceed
- System error → apologise, offer retry

**What stays human:**
- Changing guardrails (product owner)
- Overriding validation rules (ICA policy owner)
- Approving edge case data (officer)
- Handling complaints (officer/supervisor)

**Core guardrails (do not change without asking product owner):**
1. Never guess or auto-correct
2. Never ask for info we can pull
3. 2 failed attempts before help
4. Count only value changes as attempts
5. Specific feedback echoes user input
## Roles and operating model

**Key roles:**

| Role | Responsibility |
|------|----------------|
| Product owner | Owns scope, guardrails, outcomes. Accountable for agent behaviour. |
| Engineering lead | Owns implementation and deployment. Holds the kill switch. |
| Operations lead | Owns officer workflows and escalation queues. |
| Security lead | Owns incident response. Decides how to respond to harm. |
| Officer | Front-line human checkpoint. First to see wrong answers. |
| Supervisor | Handles systemic issues (3+ flags) and complaints. |

**Decision rights:**

| Decision | Who decides | Who is told |
|----------|-------------|-------------|
| Scope (what agent does) | Product owner | Officer, Security lead |
| Permissions (auto/confirm/block) | Product owner | Officer, Legal |
| Go-live | Product owner | Officer, Supervisor |
| Incident response | Security lead | Product owner, Officer, Legal |
| Kill switch | Engineering lead | Product owner, Security lead |

**Incident response (what was missing):**

| Item | Answer |
|------|--------|
| **Kill switch owner** | Engineering lead (or on-call engineer outside hours) |
| **On-call rota** | Engineering: 24/7. Product owner: business hours. Officer: shift hours. |
| **Severity levels** | S1: wrong data submitted (stop agent). S2: wrong prompt shown (investigate). S3: edge case flagged (log and review). |
| **Response time** | S1: 15 min to acknowledge, 1 hour to resolve or escalate. S2: 4 hours. S3: next business day. |
| **Who tells applicant** | Officer (with script from Product owner) |
| **Product owner notification** | Told immediately for S1, within 4 hours for S2 |
| **Rollback criteria** | Any S1 incident, or 3+ S2 incidents in 24 hours |
| **Post-incident review** | Security lead runs it within 48 hours. Product owner, Engineering lead, Officer attend. |

## Strategy and roadmap

### Strategy kernel

**Diagnosis**

A significant amount of information is required for each application. It is important for the information to be accurate and in the correct format. Some of the information (e.g. name, birthdate) are relatively straightforward, while others (e.g. job history) may be more complicated. It can be difficult for applicants to understand the ask, and provide information in the correct format (e.g. yymmdd instead of ddmmyyyy).

**Guiding policy**

1. Never ask for information we can pull ourselves
2. Never try to guess or complete information
3. Minimise the number of steps required to complete each submission

**Coherent actions**

1. Ask for the highest leverage information upfront, then pull relevant ones accordingly
2. Check for completeness, and correctness of each field, prioritising the ones with the highest impact on success rates, and those with highest error rates
3. Provide guidance on how to fill in the gaps, with examples (with safe, synthetic information)
## Metrics plan and stop line
## Evals and gates
## Decision: continue, pivot or stop
## Open issues
