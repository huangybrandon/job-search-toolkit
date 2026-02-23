/**
 * setup-notion.js
 *
 * Creates the three Notion databases required by this toolkit and writes
 * their IDs to context/config.json.
 *
 * Usage:
 *   node scripts/setup-notion.js <page-url>    # create inside a Notion page
 *   node scripts/setup-notion.js <page-id>     # create inside a Notion page
 *
 * Note: internal Notion integrations require a parent page.
 * Create a page, share it with your integration, then pass its URL here.
 */

const path = require("path");
const fs = require("fs");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Client } = require("@notionhq/client");

const CONFIG_PATH = path.join(__dirname, "..", "context", "config.json");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract a Notion page/database ID from a URL or raw ID string.
 * Notion IDs are 32-character hex strings, optionally with dashes.
 */
function extractId(input) {
  if (!input) return null;
  const match = input.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
  return match ? match[1].replace(/-/g, "") : null;
}

/**
 * Get the data source ID for a database. In Notion API v5, relations are
 * wired using the data source ID rather than the database ID.
 */
async function getDataSourceId(notion, databaseId) {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const dsId = db.data_sources?.[0]?.id;
  if (!dsId) throw new Error(`No data source found for database ${databaseId}`);
  return dsId;
}

// ---------------------------------------------------------------------------
// Database creation
// ---------------------------------------------------------------------------

async function createOpportunitiesDb(notion, parent) {
  console.log("Creating Opportunities database...");

  const db = await notion.databases.create({
    parent,
    title: [{ type: "text", text: { content: "Opportunities" } }],
    initial_data_source: {
      properties: {
        Company: { title: {} },
        Role: { rich_text: {} },
        "Company Description": { rich_text: {} },
        "Role Type": {
          select: {
            options: [
              { name: "Full-time", color: "blue" },
              { name: "Contract", color: "yellow" },
              { name: "Fractional", color: "orange" },
              { name: "Part-time", color: "gray" },
            ],
          },
        },
        Status: { status: {} },
        "Applied Date": { date: {} },
        "Comp Range": { rich_text: {} },
        Notes: { rich_text: {} },
        "Key people": { rich_text: {} },
        "JD Link": { url: {} },
      },
    },
  });

  console.log(`  Created: ${db.url}`);
  return db;
}

async function createMeetingNotesDb(notion, parent, opportunitiesDataSourceId) {
  console.log("Creating Meeting Notes database...");

  const db = await notion.databases.create({
    parent,
    title: [{ type: "text", text: { content: "Meeting Notes" } }],
    initial_data_source: {
      properties: {
        "Meeting Title": { title: {} },
        Date: { date: {} },
        Opportunity: {
          relation: {
            data_source_id: opportunitiesDataSourceId,
            type: "dual_property",
            dual_property: {},
          },
        },
      },
    },
  });

  console.log(`  Created: ${db.url}`);
  return db;
}

async function createPrepDebriefsDb(notion, parent, opportunitiesDataSourceId, meetingNotesDataSourceId) {
  console.log("Creating Prep & Debriefs database...");

  const db = await notion.databases.create({
    parent,
    title: [{ type: "text", text: { content: "Prep & Debriefs" } }],
    initial_data_source: {
      properties: {
        Title: { title: {} },
        Type: {
          select: {
            options: [
              { name: "Prep", color: "blue" },
              { name: "Debrief", color: "green" },
            ],
          },
        },
        Date: { date: {} },
        Opportunity: {
          relation: {
            data_source_id: opportunitiesDataSourceId,
            type: "dual_property",
            dual_property: {},
          },
        },
        "Meeting Notes": {
          relation: {
            data_source_id: meetingNotesDataSourceId,
            type: "dual_property",
            dual_property: {},
          },
        },
      },
    },
  });

  console.log(`  Created: ${db.url}`);
  return db;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    console.error("Error: NOTION_API_KEY not set.");
    console.error("Add it to .env in the project root:");
    console.error("  NOTION_API_KEY=your_key_here");
    process.exit(1);
  }

  // Warn if config.json already has real IDs
  if (fs.existsSync(CONFIG_PATH)) {
    const existing = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    const ids = Object.values(existing.notion || {});
    const hasRealIds = ids.some((id) => id && !id.startsWith("YOUR_"));
    if (hasRealIds) {
      console.warn("Warning: context/config.json already contains database IDs.");
      console.warn("Running setup will overwrite them. Ctrl+C to cancel, or continue to proceed.");
      console.warn("");
      await new Promise((res) => setTimeout(res, 3000));
    }
  }

  // Determine parent — internal integrations require a parent page
  const input = process.argv[2];

  if (!input) {
    console.error("Error: A parent page is required.");
    console.error("");
    console.error("  1. Create a page in Notion (e.g. 'Job Search')");
    console.error("  2. Open the page → '...' → Connections → add your integration");
    console.error("  3. Copy the page URL and run:");
    console.error("       node scripts/setup-notion.js https://notion.so/your-page-url");
    process.exit(1);
  }

  const pageId = extractId(input);
  if (!pageId) {
    console.error(`Error: Could not parse a Notion page ID from: ${input}`);
    console.error("Provide a Notion page URL or a 32-character page ID.");
    process.exit(1);
  }

  const parent = { type: "page_id", page_id: pageId };
  console.log(`Creating databases inside page: ${pageId}\n`);

  const notion = new Client({ auth: apiKey });

  // Create databases in dependency order
  const opportunitiesDb = await createOpportunitiesDb(notion, parent);
  const oppsDataSourceId = await getDataSourceId(notion, opportunitiesDb.id);

  const meetingNotesDb = await createMeetingNotesDb(notion, parent, oppsDataSourceId);
  const meetingNotesDataSourceId = await getDataSourceId(notion, meetingNotesDb.id);

  const prepDebriefsDb = await createPrepDebriefsDb(notion, parent, oppsDataSourceId, meetingNotesDataSourceId);

  // Write IDs to config.json
  const config = {
    notion: {
      companies_db_id: opportunitiesDb.id,
      meeting_notes_db_id: meetingNotesDb.id,
      prep_debriefs_db_id: prepDebriefsDb.id,
    },
  };

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  console.log("\nUpdated context/config.json with database IDs.");

  console.log("\nSetup complete!");
  console.log("Next: run `node scripts/fetch-tracker.js` to verify the connection.");
}

main().catch((err) => {
  console.error("\nError:", err.message);
  if (err.code) console.error("Code:", err.code);
  if (err.status === 404) {
    console.error("\nHint: Make sure your integration has access to the parent page,");
    console.error("or omit the page argument to create databases at workspace root.");
  }
  if (err.status === 401) {
    console.error("\nHint: Check that NOTION_API_KEY in .env is correct.");
  }
  process.exit(1);
});
