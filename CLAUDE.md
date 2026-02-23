# Job Search Toolkit

A Claude Code-powered job search assistant. Workflows are exposed as slash commands (skills) — see `.claude/commands/` for the full list.

## Commands

| Command | What it does |
|---|---|
| `/setup-notion [page-url]` | Create all three Notion databases and write IDs to context/config.json |
| `/setup-profile [target role]` | Generate context/profile.md from resume and performance reviews |
| `/prep [Company] [Person] [Stage]` | Generate interview prep: questions to ask + anticipated questions |
| `/debrief [Company] [Person]` | Pull Granola meeting notes, generate structured debrief, save to Notion |
| `/outreach [Company]` | Draft cold outreach email or cover letter |
| `/find [query]` | Search the job tracker by company or role name |

## Project Structure

```
context/          - Config and candidate data (personal files are gitignored)
  config.json              - Notion database IDs
  profile.md               - Your background and stories (gitignored; generate with /setup-profile)
  profile.example.md       - Template for profile.md
  resume.md                - Your resume in markdown (gitignored)
  resume.example.md        - Template for resume.md
  performance_reviews*.md  - Optional perf review files (gitignored)
  sheet-data.json          - Cached tracker snapshot (auto-generated, gitignored)

prompts/          - Prompt templates used by the skills
  generate-profile.md
  interview-questions.md
  anticipated-questions.md
  debrief-summary.md
  outreach.md

scripts/          - Node.js scripts
  notion-client.js   - Notion API wrapper (v5)
  fetch-tracker.js   - Fetch + cache Opportunities database
  write-to-notion.js - Write prep docs, debriefs, and meeting notes to Notion
  fetch-jd.js        - Fetch JD text from Notion page body
  utils.js           - Shared helpers (load profile, save output)

output/           - Generated prep docs and debriefs (gitignored)
```

## Notion Data Model

Three databases, all linked:

1. **Opportunities** — one row per role
   - Fields: Company (title), Role, Company Description, Role Type, Status, Applied Date, Comp Range, Notes, Key people, JD Link
   - Page body: full job description text
   - Relations: Meeting Notes, Prep & Debriefs

2. **Meeting Notes** — call notes from Granola
   - Fields: Meeting Title (`MM/DD/YY Person Name`), Date, Opportunity (relation)
   - Page body: full meeting notes

3. **Prep & Debriefs** — generated docs
   - Fields: Title (`MM/DD/YY Person Name - Prep|Debrief`), Type (select), Date, Opportunity (relation), Meeting Notes (relation)
   - Page body: generated content

## Key Conventions

- Always use absolute paths in shell commands
- Notion client v5: use `queryDatabase()` from `scripts/notion-client.js` (wraps `dataSources.query`)
- Title formats: Meeting Notes → `MM/DD/YY {Person}`, Prep & Debriefs → `MM/DD/YY {Person} - {Prep|Debrief}`
- Output files: `output/YYYY-MM-DD-{company-slug}-{prep|debrief}.md`
- Prompt templates use `{{VARIABLE_NAME}}` placeholders
- After generating any output, save to `output/` AND write to Notion without asking
- `context/profile.md` is the source of truth for candidate background — always read it before generating prep or outreach
