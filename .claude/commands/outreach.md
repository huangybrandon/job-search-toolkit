Draft a cold outreach email or cover letter for: $ARGUMENTS

Parse the input to extract:
- **Company name** (required)
- **Recipient name and title** (optional)
- **Outreach channel** (optional — email, LinkedIn DM, cover letter; default to email)

Then follow these steps:

**1. Load candidate context**
Read `context/profile.md` for candidate background.

**2. Get the job description**
If the user pasted a JD in their message, use it directly.
Otherwise, run `node scripts/fetch-jd.js "[Company]"` to retrieve the JD from Notion.
If no JD is available, ask the user to paste one or describe the role.

**3. Research the recipient (if provided)**
If a recipient name and title were given, use what you know about their background to personalize the message — e.g., shared background, notable work, relevant experience.

**4. Generate the outreach draft**
Using the template in `prompts/outreach.md`, fill in all `{{VARIABLE}}` placeholders with:
- `{{PROFILE}}` → contents of context/profile.md
- `{{JOB_DESCRIPTION}}` → JD from step 2
- `{{RECIPIENT_INFO}}` → recipient name, title, and any research from step 3
- `{{CHANNEL}}` → outreach channel

**5. Present inline**
Output the draft directly in the conversation for the user to review and iterate on. Do not save to output/ or Notion unless the user explicitly asks.
