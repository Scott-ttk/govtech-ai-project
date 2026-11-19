# Operating Model

**Scenario:** B · ICA passport applications  
**Date:** 2026-11-19

All data is made up.

---

## Roles

| Role | Responsibility |
|------|----------------|
| **Product owner** | Owns the agent's scope, guardrails, and user experience. Decides what the agent does and doesn't do. Accountable for outcomes. |
| **Engineering lead** | Owns implementation, technical architecture, and deployment. Decides how the agent works. |
| **ICA policy owner** | Owns validation rules that come from ICA requirements (phone format, address format). Must approve changes to policy-driven rules. |
| **Operations lead** | Owns officer workflows, escalation queues, and staffing. Decides how escalations are handled. |
| **Security lead** | Owns data protection, access controls, and incident response. Reviews changes that affect data handling. |
| **Legal / Compliance** | Owns audit requirements, data retention, and regulatory obligations. |
| **Officer** | Handles escalated applications, edge cases, and applicant complaints. Front-line human checkpoint. |
| **Supervisor** | Handles systemic issues (3+ flags), reviews officer decisions, manages complaints. |
| **Vendor account manager** | Point of contact for AI model provider. Manages contract, SLAs, and support. |
| **Finance** | Owns budget, cost tracking, and financial approvals for vendor contracts. |

---

## Decision rights

| Decision | Harness part | Who decides | Who is consulted | Who is told |
|----------|--------------|-------------|------------------|-------------|
| **Scope** | Instructions, tools, permissions | Product owner | Engineering lead, ICA policy owner, Operations lead | Officer, Supervisor, Security lead |
| **Permissions** | Permission settings (auto/confirm/block) | Product owner | Engineering lead, Security lead | Officer, Supervisor, Legal |
| **Vendor and model** | Which AI provider and model to use | Engineering lead | Product owner, Security lead, Finance | Vendor account manager, Legal |
| **Go-live** | When to launch or expand rollout | Product owner | Engineering lead, Operations lead, Security lead | Officer, Supervisor, ICA policy owner |
| **Incident** | How to respond to agent failures or harm | Security lead | Engineering lead, Product owner, Operations lead | Officer, Supervisor, Legal, Vendor account manager |
| **Retire** | When to shut down or replace the agent | Product owner | Engineering lead, Operations lead, Finance | Officer, Supervisor, ICA policy owner, Vendor account manager |

---

## Decision details

### Scope

**What it covers:**
- What the agent does (pull, validate, escalate)
- What it doesn't do (guess, auto-correct, submit)
- Which fields it validates
- Which guardrails apply

**Triggers for review:**
- New capability request
- Change to guardrails
- New field or form section
- User feedback suggesting scope change

---

### Permissions

**What it covers:**
- Which actions are auto, confirm, or block
- Who can change permission settings
- Audit trail for permission changes

**Triggers for review:**
- Agent taking unexpected actions
- User complaints about friction
- Security concern about data access

---

### Vendor and model

**What it covers:**
- AI model selection (capability, cost, latency)
- Vendor contract terms
- Data processing agreements
- Failover and redundancy

**Triggers for review:**
- New model release
- Cost threshold exceeded
- Performance degradation
- Contract renewal

---

### Go-live

**What it covers:**
- Rollout gates (testing complete, logging working, escalation path ready)
- Rollout phases (pilot → controlled → general availability)
- Success metrics and thresholds
- Rollback criteria

**Triggers for review:**
- Metrics hit threshold
- New user segment
- Significant feature change

---

### Incident

**What it covers:**
- What counts as an incident (wrong data submitted, guardrail failure, data breach)
- Severity levels
- Response procedures
- Communication plan

**Triggers for review:**
- Any guardrail violation
- User harm or complaint
- System error affecting submissions
- Security alert

---

### Retire

**What it covers:**
- Criteria for retirement (low usage, better alternative, unacceptable risk)
- Transition plan (what replaces the agent)
- Data retention after retirement
- Communication to users and officers

**Triggers for review:**
- Sustained poor metrics
- Strategic pivot
- Regulatory change
- Cost unsustainable

---

## Escalation paths

| Issue type | First contact | Escalates to | Final authority |
|------------|---------------|--------------|-----------------|
| Applicant stuck on field | Agent (help link) | Officer | Supervisor |
| Agent gives wrong prompt | Officer | Engineering lead | Product owner |
| Agent violates guardrail | Engineering lead | Security lead | Product owner |
| Officer overloaded | Supervisor | Operations lead | Product owner |
| Model outage | Engineering lead | Vendor account manager | Engineering lead |
| Data breach suspicion | Security lead | Legal | Security lead + Legal |
