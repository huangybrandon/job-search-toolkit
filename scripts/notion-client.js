const path = require("path");
const { Client } = require("@notionhq/client");

// Load .env from project root
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const CONFIG_PATH = path.join(__dirname, "..", "context", "config.json");
const config = require(CONFIG_PATH);

const apiKey = process.env.NOTION_API_KEY;
if (!apiKey) {
  throw new Error(
    "NOTION_API_KEY not set. Add it to .env in the project root."
  );
}

const notion = new Client({ auth: apiKey });

const DB = {
  companies: config.notion.companies_db_id,
  meetingNotes: config.notion.meeting_notes_db_id,
  prepDebriefs: config.notion.prep_debriefs_db_id,
};

/**
 * Get the data source ID for a database (needed for v5 API queries).
 * Caches results to avoid repeated API calls.
 */
const _dsCache = {};
async function getDataSourceId(databaseId) {
  if (_dsCache[databaseId]) return _dsCache[databaseId];
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const dsId = db.data_sources?.[0]?.id;
  if (!dsId) throw new Error(`No data source found for database ${databaseId}`);
  _dsCache[databaseId] = dsId;
  return dsId;
}

/**
 * Query a Notion database. Wraps the v5 dataSources.query API.
 * Accepts the same options as dataSources.query (filter, sorts, page_size, etc.)
 * but takes a database_id instead of data_source_id.
 */
async function queryDatabase(databaseId, options = {}) {
  const dsId = await getDataSourceId(databaseId);
  return notion.dataSources.query({ data_source_id: dsId, ...options });
}

module.exports = { notion, DB, getDataSourceId, queryDatabase };
