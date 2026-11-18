# Prompt chain

**Scenario:** B · ICA passport applications
**Prototype today:** Guides the user through the passport application process

All data is synthetic and labelled as made up.

## 1. Expand

**Prompt:** Provide specific feedback on expectations on each field and where the input falls short

**Business rules:**
- Never make up information

**Edge cases:**
- Application has legitimately different data types or unique situations

**Result:** _fill in after you run it: what worked, what broke._

## 2. Behavior

**Prompt:** When we fail to get the correct information after 2 tries, show a message, flag the application, and allow the user to seek help

**Forced failure:** Instead of submitting the form, trigger a follow up request

**Business rules:**
- Never make up information to complete the application

**Edge cases:**
- Applicant is submitting on behalf of somebody else and doesn't have the necessary information

**Result:** _fill in after you run it: what worked, what broke._

## 3. Refine

**Prompt:** Consistent, precise guidance, be honest when there is low confidence

**Business rules:**
- Make a recommendation with under 50% confidence

**Edge cases:**
- Applicant with completely new information types

**Result:** _fill in after you run it: what worked, what broke._
