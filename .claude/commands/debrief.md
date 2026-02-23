Generate a post-interview debrief for: $ARGUMENTS

Parse the input to extract:
- **Company name** (required)
- **Person name** (required — who did the candidate speak with?)

Then follow these steps in order:

**1. Find meeting notes in Granola**
Use the Granola MCP (`mcp__claude_ai_Granola__query_granola_meetings`) to find the relevant meeting notes. Search by person name and/or company name. If multiple matches exist, ask the user to confirm which one.

If Granola is not available or no notes are found, ask the user to paste their call notes directly.

**2. Load candidate context**
Read `context/profile.md` for candidate background.
Run `node scripts/fetch-tracker.js` to get current role/status info for this company.

**3. Save meeting notes to Notion**
Determine the output filename: `output/YYYY-MM-DD-[company-slug]-meeting-notes.md`
Write the Granola notes to that file, then run:
```
node scripts/write-to-notion.js meeting "[Company]" "[Person]" output/[filename].md
```
Capture the **Meeting note ID** printed on the first line of output — you will need it in step 6.

**4. Generate debrief**
Using the template in `prompts/debrief-summary.md`, fill in all `{{VARIABLE}}` placeholders with:
- `{{PROFILE}}` → contents of context/profile.md
- `{{ROLE_INFO}}` → company name, role title, and current status from tracker
- `{{CALL_NOTES}}` → the full Granola meeting notes

**5. Save locally**
Write the output to `output/YYYY-MM-DD-[company-slug]-debrief.md`.

**6. Write to Notion**
Run the following, substituting the meeting note ID captured in step 3:
```
node scripts/write-to-notion.js write "[Company]" "[Person]" output/[filename].md Debrief [meetingNoteId]
```

**7. Confirm**
Report the local file path and Notion page URL to the user.
