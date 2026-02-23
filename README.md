# Job Search Toolkit

A Claude Code-powered job search assistant that integrates with Notion and Granola to streamline interview prep, call debriefs, and outreach drafting.

## What it does

Five slash commands, each running a complete workflow:

- **`/setup-profile`** — One-time setup: generate `context/profile.md` from your resume and performance reviews
- **`/prep`** — Generate a prep doc for an upcoming interview: smart questions to ask + anticipated questions with suggested answers, grounded in your profile and the job description
- **`/debrief`** — After a call, pull the meeting notes from Granola, save them to Notion, and generate a structured debrief with key takeaways, self-assessment, and follow-up actions
- **`/outreach`** — Draft a concise, specific cold outreach email or cover letter tailored to a role
- **`/find`** — Search your Notion job tracker by company or role name

## Prerequisites

- [Claude Code](https://docs.anthropic.com/claude-code) installed (`npm install -g @anthropic/claude-code`)
- A [Notion](https://notion.so) workspace with the three databases set up (see below)
- The [Granola](https://granola.so) desktop app for meeting notes (optional — only needed for `/debrief`)
- Node.js 18+

## Setup

### 1. Clone and install

```bash
git clone https://github.com/yourusername/job-search-toolkit
cd job-search-toolkit
npm install
```

### 2. Set up Notion

You need three Notion databases. You can duplicate this template: [coming soon] or create them manually with these schemas:

**Opportunities** (job tracker)
| Property | Type |
|---|---|
| Company | Title |
| Role | Text |
| Company Description | Text |
| Role Type | Select |
| Status | Status |
| Applied Date | Date |
| Comp Range | Text |
| Notes | Text |
| Key People | Text |
| JD Link | URL |

**Meeting Notes**
| Property | Type |
|---|---|
| Meeting Title | Title |
| Date | Date |
| Opportunity | Relation → Opportunities |

**Prep & Debriefs**
| Property | Type |
|---|---|
| Title | Title |
| Type | Select (Prep, Debrief) |
| Date | Date |
| Opportunity | Relation → Opportunities |
| Meeting Notes | Relation → Meeting Notes |

After creating the databases:
1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) and create a new integration
2. Copy the API key
3. Open each database → click `...` → `Connections` → add your integration
4. Copy the database IDs from each database URL (the 32-character hex string)

### 3. Configure

```bash
cp .env.example .env
```

Edit `.env` and add your Notion API key:
```
NOTION_API_KEY=your_key_here
```

Edit `context/config.json` and add your database IDs:
```json
{
  "notion": {
    "companies_db_id": "your_opportunities_db_id",
    "meeting_notes_db_id": "your_meeting_notes_db_id",
    "prep_debriefs_db_id": "your_prep_debriefs_db_id"
  }
}
```

### 4. Add your profile

`context/profile.md` is the most important input — it grounds every prep doc, debrief, and outreach draft in your actual background. You have two options:

**Option A: Auto-generate from your resume (recommended)**

```bash
cp context/resume.example.md context/resume.md
# Paste your resume into context/resume.md
```

Optionally, add performance review content:
```bash
# Paste any perf review text into context/performance_reviews.md
```

Then start Claude Code and run:
```
/setup-profile Chief of Staff
```

Claude will analyze your resume and reviews and write a structured `context/profile.md`. Review the output and fill in any `[FILL IN: ...]` placeholders — particularly the "What I'm Looking For" section, which requires your own judgment.

**Option B: Fill in manually**

```bash
cp context/profile.example.md context/profile.md
```

Edit `context/profile.md` following the template. The key sections are: work history with metrics, 3-5 key interview stories mapped to themes, and what you're optimizing for in your next role.

### 5. Set up Granola MCP (for `/debrief`)

The `/debrief` command uses the Granola MCP server to pull meeting notes. To enable it:

1. Install [Granola](https://granola.so) and sign in
2. Add the Granola MCP to Claude Code:
   ```bash
   claude mcp add granola
   ```
   Or follow [Granola's MCP setup guide](https://granola.so/docs/mcp).

### 6. Test the connection

```bash
node scripts/fetch-tracker.js
```

This should fetch your Opportunities database and save a snapshot to `context/sheet-data.json`.

## Usage

Start Claude Code in the project directory:
```bash
claude
```

Then use the slash commands:

```
# First-time setup
/setup-profile Chief of Staff

# Daily use
/prep Acme Corp
/prep Acme Corp, Jane Smith, hiring manager round
/debrief Acme Corp, Jane Smith
/outreach Acme Corp
/find acme
```

You can also use natural language — Claude knows the workflows from `CLAUDE.md`.

## How it works

Each command is a skill file in `.claude/commands/`. When you run `/prep`, Claude Code loads the skill prompt and executes the workflow: refreshing tracker data, reading your profile, fetching the JD from Notion, generating prep content using the prompt templates in `prompts/`, saving locally to `output/`, and writing to Notion.

All personal files (`context/profile.md`, `context/resume.md`, `output/`) are gitignored so you can fork this repo and use it privately without worrying about accidentally pushing personal data.

## File structure

```
.claude/commands/     - Skill definitions (/prep, /debrief, /outreach, /find)
context/              - Config and personal data
prompts/              - Prompt templates
scripts/              - Node.js scripts for Notion integration
output/               - Generated docs (gitignored)
```

## License

MIT
