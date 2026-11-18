# Build Log

**Scenario:** B · ICA passport applications

## Three leaders

### 1. Director of Frontline Operations

**Objection:**
"We already have a working system. My officers handle 10,000+ applications a week. You're proposing to add AI prompts that will confuse applicants and create more work for my staff when they come to us asking why the system is telling them their date format is wrong. How do I know this won't just shift the burden from incomplete applications to confused applicants calling our hotline?"

**Reply:**
One diagnosis is that applicants end up spending more time with officers correcting submission details. The hypothesis is that updating the form with simple prompts to help users input correct details upfront helps reduce future clarifications and corrections. We will make sure we measure the net change in work done by officers — we expect there to be a decrease. This could be validated via an A/B test.

**Requirement to prove:**
Prompts reduce net officer workload, not shift it to confused applicants calling the hotline.

---

### 2. Head of Product

**Objection:**
"Your prototype pulls data via Singpass, validates formats, and shows contextual prompts. That's three separate capabilities. Which one is actually solving the problem? If completion rates improve, we won't know whether it's because we pulled the address automatically, or because the date format hint worked, or because the 'confirm before submit' step caught errors. You're testing a bundle, not a hypothesis. How will we know what to scale — and what to cut if it doesn't work?"

**Reply:**
The problem to solve is to improve the application experience. We can tangibly measure this through applications completed within 15 minutes, down from 30 minutes today. Intuitively, the core idea is that we can improve accuracy and reduce effort by reducing human input and providing prompts. Where the effort is high, we can re-scope and take them more incrementally.

**Requirement to prove:**
Application completion time drops measurably (target: 15 minutes from 30 minutes today).

---

### 3. Chief Executive Sponsor

**Objection:**
"I'm accountable to the Minister for data protection. You're proposing an AI system that reads citizens' personal information and decides what prompts to show them. What happens when the system tells someone their name is 'wrong' because of a legitimate edge case — a transliteration, a hyphen, a suffix? Or worse, when it 'helpfully' suggests a correction that a citizen accepts, and now their passport has the wrong name? How do I explain that to Parliament?"

**Reply:**
We have guardrails — the system will never guess or auto-correct, only flagging and asking the user to confirm. There is an audit log on the prompts given and changes made. We will conduct reasonable user tests before launch. There is a rollback plan and killswitch.

**Requirement to prove:**
Guardrails hold: no guessed or auto-corrected data reaches submission without explicit user confirmation.
