Set up the Notion databases for this toolkit: $ARGUMENTS

Walk the user through the Notion setup process interactively.

**Step 1: Check for API key**
Check whether `.env` exists and contains a non-empty `NOTION_API_KEY`. If not:
- Tell the user to go to https://www.notion.so/my-integrations
- Create a new integration (type: Internal), copy the API key
- Add it to `.env`: `NOTION_API_KEY=their_key_here`
- Then come back and run `/setup-notion` again
- Stop here until the key is present.

**Step 2: Determine parent location**
If $ARGUMENTS contains a Notion URL or page ID, extract the page ID and use it.
Otherwise, explain the two options and ask which they prefer:
  - **Workspace root** (default, no extra steps): databases appear in the Notion sidebar
  - **Inside a specific page**: databases are nested under a page they choose; they'll need to share that page with the integration first

**Step 3: Run the setup script**
- If workspace root: `node scripts/setup-notion.js`
- If specific page: `node scripts/setup-notion.js <page-url-or-id>`

**Step 4: Verify**
Run `node scripts/fetch-tracker.js` to confirm the connection works. It should print "Fetched 0 entries from Notion." (zero rows is expected for a fresh database).

**Step 5: Confirm done**
Tell the user their Notion setup is complete. Remind them:
- The three databases are now live in their Notion workspace
- The Status field in Opportunities uses Notion's default status options — they can customize the labels in Notion (e.g. rename "In progress" to "Interviewing")
- Next step: run `/setup-profile` to generate their candidate profile
