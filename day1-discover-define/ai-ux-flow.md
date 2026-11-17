# AI user flow: An applicant is filling in the form and receives guidance

**Scenario:** B · ICA passport applications

All data in this file is synthetic.

## The moment

An applicant is filling in the form and receives guidance

## The iceberg

### Above the line: what the user sees

The prompt to pull information or correct something

### Below the line

- Data: User information, validation rules for each field, examples of correct input
- Model: A validation model that checks through each field and flags potential corrections
- Rules: Never guess or make up information not explicitly given or pulled
- Handoffs: Applications with low confidence after several prompts goes to a human customer support officer

## The flow

1. **Trigger:** An applicant starts a new application
   - Trust gap: none
2. **AI step:** Prompt for initial information to pull and populate the relevant fields
   - Trust gap: Hallucination. The AI fills in fields with the wrong or made up information
3. **Human check:** The applicant reviews the pre-filled information, fills in the blanks, and corrects the wrong ones
   - Trust gap: Black box. The applicant does not know what to actually check for
4. **Outcome:** The applicant submits the application
   - Trust gap: Black box. The applicant does not know what happens after submission

## Fallback when the AI is unsure (Advanced)

Below a confidence threshold, flag the application so that a human customer support agent takes another look at the application

## How we measure trust (Expert)

Accept-as-is rate: the share sample of officers send without additional edits, checked weekly. Target: 8 in 10 by the end of the pilot (made up).
