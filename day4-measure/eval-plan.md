# Eval Plan

**Scenario:** B · ICA passport applications  
**Version:** 1.0  
**Last updated:** 2026-11-20

All data is made up.

---

## Who owns what

| Responsibility | Role | Notes |
|----------------|------|-------|
| **Signs the pass bar** | Product owner | Approves thresholds in `human-rubric.md`. Accountable if agent passes eval but fails in production. |
| **Writes test cases** | Product owner | Creates new cases in `eval-cases.md` when guardrails or scope change. Consults ICA policy owner for policy-driven cases. |
| **Refreshes test cases** | Engineering lead | Reviews cases quarterly. Adds cases for new edge cases found in production. Consults Officer for real-world patterns. |
| **Runs the eval** | Engineering lead | Executes weekly eval using `human-rubric.md`. Records results in `eval-results.md`. |
| **Reviews weekly sample** | Officer | Spot-checks 3 random cases from each weekly eval. Flags if agent behaviour doesn't match officer expectations. |
| **Calibrates graders** | Product owner | Runs calibration session when onboarding new graders or after rubric changes. |

**Escalation:**
- If Engineering lead finds a deal-breaker failure → notify Product owner immediately
- If Officer disagrees with eval scoring → escalate to Product owner
- If eval pass rate drops below threshold → Product owner decides whether to pause rollout

---

## When it runs

| Trigger | What happens | Who runs it |
|---------|--------------|-------------|
| **Before go-live** | Full eval (all 13 cases). Must pass 100% of deal-breakers. Gate for launch. | Engineering lead |
| **Before every change** | Full eval after any change to `day3-build/CLAUDE.md`, validation rules, or guardrails. Must pass before merge. | Engineering lead |
| **Every week** | Full eval every Monday. Results recorded and compared to previous week. | Engineering lead |
| **When policy changes** | Full eval plus new cases for policy change. ICA policy owner reviews new cases before running. | Engineering lead, with ICA policy owner |
| **After incident** | Full eval plus targeted cases for incident type. Part of post-incident review. | Engineering lead |

**Schedule:**

| Day | Activity |
|-----|----------|
| Monday AM | Run weekly eval (30–45 min) |
| Monday PM | Record results, compare to last week |
| Tuesday | Officer reviews 3 random cases |
| Wednesday | Product owner reviews if any failures |
| Friday | Fix any non-deal-breaker issues before next week |

---

## How I'll know it's working

### The goal

Applicants complete passport forms faster and more accurately, with fewer follow-up corrections by officers. The agent never puts wrong data on a passport.

### The baseline

| Metric | Baseline (before agent) | Source |
|--------|-------------------------|--------|
| Form completion rate | Unknown | To be measured in pilot |
| Fields corrected per application | Unknown | To be measured in pilot |
| Officer follow-up rate | Unknown | To be measured in pilot |
| Eval pass rate | 100% (first run) | `eval-results.md` |

### The target and review date

| Metric | Target | Review date |
|--------|--------|-------------|
| Eval pass rate | 100% deal-breakers, 80%+ non-deal-breakers | Every Monday |
| D5 (Clarity) average | ≥ 3.5 | Every Monday |
| Form completion rate | +10% vs baseline | 30 days after go-live |
| Officer follow-up rate | -20% vs baseline | 30 days after go-live |
| Fabrication count | 0 | Every Monday (must stay 0) |

### A usage metric

Track "prompts shown vs. fields corrected" ratio.

| What to measure | Why |
|-----------------|-----|
| Prompts shown per session | Are users seeing too many prompts? |
| Fields corrected after prompt | Are prompts actually helping? |
| Correction rate | Prompts shown ÷ fields corrected. High = prompts work. Low = prompts ignored or unclear. |

**Target:** ≥ 60% of prompts result in a correction within the same session.

**Review:** Weekly, alongside eval results.

### The pattern to watch first

Watch for "same error twice" pattern (Case 8).

| Why this pattern | What to look for |
|------------------|------------------|
| Double-counting is a deal-breaker | If agent counts same value as 2 attempts, users get help offers too early |
| Hard to catch in production | Users won't report "help came too soon" — they'll just be confused |
| Indicates counting logic bug | If this fails, other counting logic may be wrong too |

**How to watch:**
1. In weekly eval, run Case 8 first
2. In production logs, filter for `help_offered` events where `attempts < 2`
3. If any found, investigate immediately

### The stop line

Stop the agent if any of these happen:

| Condition | Action | Who decides |
|-----------|--------|-------------|
| Any deal-breaker fails in eval | Do not deploy. Fix before next attempt. | Product owner |
| Any deal-breaker fails in production | Kill switch. File S1 incident. | Engineering lead |
| D5 average drops below 3.0 | Pause rollout. Review prompts. | Product owner |
| 3+ weeks of declining pass rate | Pause rollout. Review agent instructions. | Product owner |
| Officer flags 3+ disagreements in one week | Pause eval. Re-calibrate graders. | Product owner |
| Fabrication count > 0 in production | Kill switch immediately. File S1 incident. | Engineering lead |

---

## First 30 days

### Week 1: Pre-launch

| Day | Activity | Owner |
|-----|----------|-------|
| 1 | Run full eval (all 13 cases) | Engineering lead |
| 1 | Product owner signs off on pass bar | Product owner |
| 2 | Calibration session with Officer | Product owner + Officer |
| 3 | Fix any issues found in eval | Engineering lead |
| 4 | Re-run eval to confirm fixes | Engineering lead |
| 5 | Go/no-go decision | Product owner |

### Week 2: Pilot launch

| Day | Activity | Owner |
|-----|----------|-------|
| 8 | Launch to 10% of users | Engineering lead |
| 8 | Start logging all prompts shown and corrections made | Engineering lead |
| 9 | Run weekly eval (first production week) | Engineering lead |
| 10 | Officer reviews 3 random cases | Officer |
| 11 | Review pilot metrics (completion rate, correction rate) | Product owner |
| 12 | Decide: expand, hold, or rollback | Product owner |

### Week 3: Controlled rollout

| Day | Activity | Owner |
|-----|----------|-------|
| 15 | If Week 2 passed: expand to 50% of users | Engineering lead |
| 16 | Run weekly eval | Engineering lead |
| 17 | Officer reviews 3 random cases | Officer |
| 18 | Review metrics vs. baseline | Product owner |
| 19 | Add any new cases from production patterns | Product owner + Engineering lead |

### Week 4: General availability decision

| Day | Activity | Owner |
|-----|----------|-------|
| 22 | Run weekly eval | Engineering lead |
| 23 | Officer reviews 3 random cases | Officer |
| 24 | Compile 30-day report: eval pass rates, metrics vs. targets, issues found | Engineering lead |
| 25 | Product owner reviews 30-day report | Product owner |
| 26 | Go/no-go for general availability | Product owner |
| 26 | If GA: expand to 100% of users | Engineering lead |
| 26 | If not GA: document blockers, set new review date | Product owner |

### 30-day review checklist

| Question | Pass | Fail |
|----------|------|------|
| Did all weekly evals pass deal-breakers? | Yes | Any No |
| Is D5 average ≥ 3.5 across all weeks? | Yes | Below 3.5 |
| Is fabrication count 0? | Yes | Any fabrication |
| Is correction rate ≥ 60%? | Yes | Below 60% |
| Did Officer flag 0 disagreements? | Yes | 3+ disagreements |
| Is form completion rate ≥ baseline? | Yes | Below baseline |

**Confirmed:** All items approved 2026-11-20.
