const fs = require("fs");
const path = require("path");
const { markdownToBlocks } = require("@tryfabric/martian");
const { notion, DB, queryDatabase } = require("./notion-client");

/**
 * Find a company page in the Opportunities database by name.
 * Matches against the Company (title) property, case-insensitive.
 * Returns the page object or null.
 */
async function findCompanyPage(companyName) {
  const res = await queryDatabase(DB.companies, {
    filter: {
      property: "Company",
      title: { equals: companyName },
    },
    page_size: 1,
  });

  if (res.results.length > 0) return res.results[0];

  // Try case-insensitive search if exact match fails
  const all = await queryDatabase(DB.companies, { page_size: 100 });
  return (
    all.results.find((page) => {
      const title =
        page.properties.Company?.title?.[0]?.plain_text?.toLowerCase() || "";
      return title === companyName.toLowerCase();
    }) || null
  );
}

/**
 * Append blocks to a Notion page. Handles the 100-block-per-request limit.
 */
async function appendBlocks(pageId, blocks) {
  const BATCH_SIZE = 100;
  for (let i = 0; i < blocks.length; i += BATCH_SIZE) {
    const batch = blocks.slice(i, i + BATCH_SIZE);
    await notion.blocks.children.append({
      block_id: pageId,
      children: batch,
    });
  }
}

/**
 * Format a date as MM/DD/YY.
 */
function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

/**
 * Write a prep doc or debrief to Notion.
 *
 * Creates a new page in the Prep & Debriefs database, sets the Opportunity
 * relation, and writes the markdown content as the page body.
 *
 * @param {string} companyName - Company name to link to
 * @param {string} content - Markdown content
 * @param {string} type - "Prep" or "Debrief"
 * @param {string} personName - Person's name (e.g. "Sarah Chen")
 * @param {string} [meetingNoteId] - Optional Meeting Notes page ID to link (for debriefs)
 * @returns {{ pageId: string, url: string }}
 */
async function writeToCompanyPage(companyName, content, type, personName, meetingNoteId) {
  // Find the company page
  const companyPage = await findCompanyPage(companyName);
  if (!companyPage) {
    throw new Error(
      `Company "${companyName}" not found in Opportunities database.`
    );
  }

  const dateStr = formatDate(new Date());
  const isoDate = new Date().toISOString().split("T")[0];
  const title = `${dateStr} ${personName} - ${type}`;

  // Build properties
  const properties = {
    Title: { title: [{ text: { content: title } }] },
    Type: { select: { name: type } },
    Date: { date: { start: isoDate } },
    Opportunity: { relation: [{ id: companyPage.id }] },
  };

  if (meetingNoteId) {
    properties["Meeting Notes"] = { relation: [{ id: meetingNoteId }] };
  }

  // Create the page
  const page = await notion.pages.create({
    parent: { database_id: DB.prepDebriefs },
    properties,
  });

  console.log(`Created ${type} page: "${title}" (${page.id})`);

  // Append content blocks to the page body
  const blocks = markdownToBlocks(content);
  await appendBlocks(page.id, blocks);
  console.log(`Appended ${blocks.length} blocks to page body.`);

  return { pageId: page.id, url: page.url };
}

/**
 * Write meeting notes to Notion.
 *
 * Creates a new page in the Meeting Notes database, sets the Opportunity
 * relation, and writes the content as the page body.
 *
 * @param {string} companyName - Company name to link to
 * @param {string} personName - Person's name (e.g. "Matt Logan")
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} content - Markdown content
 * @returns {{ pageId: string, url: string }}
 */
async function writeMeetingNotes(companyName, personName, date, content) {
  // Find the company page
  const companyPage = await findCompanyPage(companyName);
  if (!companyPage) {
    throw new Error(
      `Company "${companyName}" not found in Opportunities database.`
    );
  }

  const dateStr = formatDate(date);
  const meetingTitle = `${dateStr} ${personName}`;

  const properties = {
    "Meeting Title": { title: [{ text: { content: meetingTitle } }] },
    Date: { date: { start: date } },
    Opportunity: { relation: [{ id: companyPage.id }] },
  };

  const page = await notion.pages.create({
    parent: { database_id: DB.meetingNotes },
    properties,
  });

  console.log(`Created meeting note: "${meetingTitle}" (${page.id})`);

  // Append content blocks
  const blocks = markdownToBlocks(content);
  await appendBlocks(page.id, blocks);
  console.log(`Appended ${blocks.length} blocks to page body.`);

  return { pageId: page.id, url: page.url };
}

/**
 * List all companies in the Opportunities database.
 */
async function listCompanies() {
  const allResults = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const res = await queryDatabase(DB.companies, {
      page_size: 100,
      ...(startCursor ? { start_cursor: startCursor } : {}),
    });
    allResults.push(...res.results);
    hasMore = res.has_more;
    startCursor = res.next_cursor;
  }

  console.log(`Companies in Opportunities database:`);
  allResults.forEach((page, i) => {
    const name =
      page.properties.Company?.title?.[0]?.plain_text || "(untitled)";
    const status = page.properties.Status?.status?.name || "";
    console.log(`  ${i + 1}. ${name}${status ? ` (${status})` : ""}`);
  });

  return allResults;
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  if (command === "list") {
    listCompanies()
      .then(() => process.exit(0))
      .catch((err) => {
        console.error("Error:", err.message);
        process.exit(1);
      });
  } else if (command === "write") {
    const companyName = process.argv[3];
    const personName = process.argv[4];
    const contentFile = process.argv[5];
    const type = process.argv[6] || "Prep";

    if (!companyName || !personName || !contentFile) {
      console.error(
        "Usage: node write-to-notion.js write <company> <person-name> <file.md> [Prep|Debrief]"
      );
      process.exit(1);
    }

    const content = fs.readFileSync(contentFile, "utf-8");
    writeToCompanyPage(companyName, content, type, personName)
      .then(({ url }) => {
        console.log(`Done. Page: ${url}`);
        process.exit(0);
      })
      .catch((err) => {
        console.error("Error:", err.message);
        process.exit(1);
      });
  } else if (command === "meeting") {
    const companyName = process.argv[3];
    const personName = process.argv[4];
    const contentFile = process.argv[5];

    if (!companyName || !personName || !contentFile) {
      console.error(
        "Usage: node write-to-notion.js meeting <company> <person-name> <file.md>"
      );
      process.exit(1);
    }

    const content = fs.readFileSync(contentFile, "utf-8");
    const date = new Date().toISOString().split("T")[0];
    writeMeetingNotes(companyName, personName, date, content)
      .then(({ url }) => {
        console.log(`Done. Page: ${url}`);
        process.exit(0);
      })
      .catch((err) => {
        console.error("Error:", err.message);
        process.exit(1);
      });
  } else {
    console.log("Usage:");
    console.log(
      "  node write-to-notion.js list                                    - List all companies"
    );
    console.log(
      "  node write-to-notion.js write <company> <person> <file.md> [Prep|Debrief] - Write prep/debrief"
    );
    console.log(
      "  node write-to-notion.js meeting <company> <person> <file.md>               - Write meeting notes"
    );
  }
}

module.exports = {
  writeToCompanyPage,
  writeMeetingNotes,
  listCompanies,
  findCompanyPage,
};
