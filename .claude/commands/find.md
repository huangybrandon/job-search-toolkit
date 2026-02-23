Look up a role or company in the job tracker: $ARGUMENTS

Run the following command to search the Opportunities database:
`node scripts/fetch-tracker.js find $ARGUMENTS`

Display the matching results in a readable format, including:
- Company name
- Role title
- Status
- Applied date (if any)
- Notes
- Any other relevant fields

If no matches are found, say so clearly and suggest trying a different search term.
