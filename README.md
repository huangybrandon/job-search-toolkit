# Job Search Toolkit

A Claude Code-powered job search assistant that integrates with Notion and Granola to streamline interview prep, call debriefs, and outreach drafting.

## What it does

Slash commands for every step of the job search:

- `**/setup-notion**` — One-time setup: automatically creates the three Notion databases and configures `context/config.json`
- `**/setup-profile**` — One-time setup: generates `context/profile.md` from your resume and performance reviews
- `**/prep**` — Generate a prep doc for an upcoming interview: smart questions to ask + anticipated questions with suggested answers, grounded in your profile and the job description
- `**/debrief**` — After a call, pull the meeting notes from Granola, save them to Notion, and generate a structured debrief with key takeaways, self-assessment, and follow-up actions
- `**/outreach**` — Draft a concise, specific cold outreach email or cover letter tailored to a role
- `**/find**` — Search your Notion job tracker by company or role name

## Prerequisites

- [Claude Code](https://claude.ai/code) installed
- A [Notion](https://notion.so) account (free tier works)
- [Node.js](https://nodejs.org) 18+
- The [Granola](https://granola.so) desktop app (optional — only needed for `/debrief`)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/huangybrandon/job-search-toolkit
cd job-search-toolkit
npm install
```

### 2. Create a Notion integration

1. Go to [https://www.notion.so/profile/integrations/internal](https://www.notion.so/profile/integrations/internal)
2. Click **New integration**, give it a name (e.g. "Job Search Toolkit"), set type to **Internal**
3. Copy the **Internal Integration Secret** (starts with `ntn_...`)

### 3. Configure your API key

```bash
cp .env.example .env
```

Edit `.env` and paste your key:

```
NOTION_API_KEY=ntn_your_key_here
```

### 4. Create the Notion databases

First, create a page in Notion to house the databases (e.g. "Job Search"). Then share it with your integration: open the page → `...` → `Connections` → add your integration.

Then start Claude Code and run:

```
/setup-notion https://notion.so/your-page-url
```

This will automatically create three linked databases (Opportunities, Meeting Notes, Prep & Debriefs) inside that page and write their IDs to `context/config.json`. Once these are created, if you'd like you can edit the relational Notion columns to be "two-way relations."

Prefer to create the databases manually?

Create three databases with these schemas:

**Opportunities**


| Property            | Type   |
| ------------------- | ------ |
| Company             | Title  |
| Role                | Text   |
| Company Description | Text   |
| Role Type           | Select |
| Status              | Status |
| Applied Date        | Date   |
| Comp Range          | Text   |
| Notes               | Text   |
| Key people          | Text   |
| JD Link             | URL    |


**Meeting Notes**


| Property      | Type                     |
| ------------- | ------------------------ |
| Meeting Title | Title                    |
| Date          | Date                     |
| Opportunity   | Relation → Opportunities |


**Prep & Debriefs**


| Property      | Type                     |
| ------------- | ------------------------ |
| Title         | Title                    |
| Type          | Select (Prep, Debrief)   |
| Date          | Date                     |
| Opportunity   | Relation → Opportunities |
| Meeting Notes | Relation → Meeting Notes |


Then open each database → `...` → `Connections` → add your integration, and paste the database IDs into `context/config.json`.

### 5. Add your profile

`context/profile.md` grounds every prep doc, debrief, and outreach draft in your actual background.

**Option A: Auto-generate (recommended)**

Paste your resume into `context/resume.md`:

```bash
cp context/resume.example.md context/resume.md
# paste your resume content into context/resume.md
```

Optionally paste any performance review content into `context/performance_reviews.md`.

Then run (the role type is optional but improves output):

```
/setup-profile Chief of Staff
```

Claude will generate a structured `context/profile.md`. Review it and fill in any `[FILL IN: ...]` placeholders — particularly the "What I'm Looking For" section.

**Option B: Fill in manually**

```bash
cp context/profile.example.md context/profile.md
# edit context/profile.md following the template
```

### 6. Set up Granola MCP (for `/debrief`)

The `/debrief` command pulls meeting notes from Granola. To enable it:

1. Install [Granola](https://granola.so) and sign in
2. Add the Granola MCP to Claude Code — follow [Granola's MCP setup guide](https://granola.so)

### 7. Verify

```bash
node scripts/fetch-tracker.js
```

Should print "Fetched 0 entries from Notion." — zero rows is expected for a fresh database.

## Usage

Start Claude Code in the project directory:

```bash
claude
```

Then use the slash commands:

```
# First-time setup
/setup-notion
/setup-profile Chief of Staff

# Daily use
/prep Acme Corp
/prep Acme Corp, Jane Smith, hiring manager round
/debrief Acme Corp, Jane Smith
/outreach Acme Corp
/find acme
```

## How it works

Each command is a skill file in `.claude/commands/`. When you run `/prep`, Claude Code loads the skill prompt and executes the full workflow: refreshing tracker data, reading your profile, fetching the JD from Notion, generating prep content using the prompt templates in `prompts/`, saving locally to `output/`, and writing to Notion.

All personal files (`context/profile.md`, `context/resume.md`, `output/`, `.env`) are gitignored — fork this repo and use it privately without worrying about accidentally pushing personal data.

## File structure

```
.claude/commands/     - Skill definitions (/setup-notion, /setup-profile, /prep, etc.)
context/              - Config and personal data
prompts/              - Prompt templates
scripts/              - Node.js scripts for Notion integration
output/               - Generated docs (gitignored)
```

## License

MIT