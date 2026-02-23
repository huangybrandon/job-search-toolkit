Generate interview prep materials for: $ARGUMENTS

Parse the input to extract:
- **Company name** (required)
- **Person name / interviewer** (optional — use "Interviewer" if not provided)
- **Interview stage** (optional — e.g. "recruiter screen", "hiring manager", "panel")

Then follow these steps in order:

**1. Refresh tracker data**
Run `node scripts/fetch-tracker.js` to get the latest opportunity data.

**2. Load candidate context**
Read `context/profile.md` for candidate background.

**3. Find the role**
Read `context/sheet-data.json` and find the matching company/role. Extract the role name, company description, and any notes. If a JD URL is listed, note it — but don't fetch it unless needed.

**4. Get the job description**
Run `node scripts/fetch-jd.js "[Company]"` to retrieve the full JD stored in the Notion page body. If no JD is stored, use whatever info is available from the tracker.

**5. Generate prep document**
Using the templates in `prompts/interview-questions.md` and `prompts/anticipated-questions.md`, fill in all `{{VARIABLE}}` placeholders with:
- `{{PROFILE}}` → contents of context/profile.md
- `{{JOB_DESCRIPTION}}` → JD from step 4
- `{{INTERVIEWER_INFO}}` → person name + any context you have
- `{{STAGE}}` → interview stage if provided

Generate a single combined prep document with two sections:
1. **Questions to Ask** (from interview-questions.md)
2. **Anticipated Questions** (from anticipated-questions.md)

**6. Save locally**
Write the output to `output/YYYY-MM-DD-[company-slug]-prep.md`.

**7. Write to Notion**
Run: `node scripts/write-to-notion.js write "[Company]" "[Person]" output/[filename].md Prep`

**8. Confirm**
Report the local file path and Notion page URL to the user.
