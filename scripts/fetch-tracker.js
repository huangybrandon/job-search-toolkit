const fs = require("fs");
const path = require("path");
const { queryDatabase, DB } = require("./notion-client");

/**
 * Extract a plain text value from a Notion property.
 */
function extractValue(prop) {
  if (!prop) return "";
  switch (prop.type) {
    case "title":
      return prop.title?.map((t) => t.plain_text).join("") || "";
    case "rich_text":
      return prop.rich_text?.map((t) => t.plain_text).join("") || "";
    case "select":
      return prop.select?.name || "";
    case "status":
      return prop.status?.name || "";
    case "date":
      return prop.date?.start || "";
    case "url":
      return prop.url || "";
    case "relation":
      return prop.relation?.map((r) => r.id).join(", ") || "";
    case "rollup":
      return prop.rollup?.array?.map((v) => extractValue(v)).join(", ") || "";
    default:
      return "";
  }
}

/**
 * Fetch all rows from the Opportunities database.
 * Returns { headers, data } in the same shape as the old Google Sheet fetch
 * for backward compatibility with local caching.
 */
async function fetchTracker() {
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

  console.log(`Fetched ${allResults.length} entries from Notion.`);

  const headers = [
    "Role",
    "Company",
    "Description",
    "Role Type",
    "Status",
    "Applied Date",
    "Comp Range",
    "Notes",
    "Key people",
    "URL",
  ];

  const data = allResults.map((page) => {
    const p = page.properties;
    return {
      Role: extractValue(p["Role"]),
      Company: extractValue(p["Company"]),
      Description: extractValue(p["Company Description"]),
      "Role Type": extractValue(p["Role Type"]),
      Status: extractValue(p["Status"]),
      "Applied Date": extractValue(p["Applied Date"]),
      "Comp Range": extractValue(p["Comp Range"]),
      Notes: extractValue(p["Notes"]),
      "Key people": extractValue(p["Key people"]),
      URL: extractValue(p["JD Link"]),
    };
  });

  return { headers, data };
}

/**
 * Fetch tracker and save as JSON + markdown table for quick reference.
 */
async function fetchAndSave(outputPath) {
  const { headers, data } = await fetchTracker();

  const savePath =
    outputPath || path.join(__dirname, "..", "context", "sheet-data.json");

  fs.writeFileSync(
    savePath,
    JSON.stringify({ headers, data }, null, 2),
    "utf-8"
  );
  console.log(`Saved JSON to ${savePath}`);

  // Also save a human-readable markdown version
  const mdPath = savePath.replace(".json", ".md");
  let md = `# Job Tracker\n\n`;
  md += `| ${headers.join(" | ")} |\n`;
  md += `| ${headers.map(() => "---").join(" | ")} |\n`;
  for (const row of data) {
    md += `| ${headers.map((h) => row[h] || "").join(" | ")} |\n`;
  }
  fs.writeFileSync(mdPath, md, "utf-8");
  console.log(`Saved markdown to ${mdPath}`);

  return { headers, data, savePath, mdPath };
}

/**
 * Find a specific role/company in the tracker.
 */
async function findRole(query) {
  const { data } = await fetchTracker();
  const q = query.toLowerCase();

  const matches = data.filter((row) =>
    Object.values(row).some((val) => val && val.toLowerCase().includes(q))
  );

  if (matches.length === 0) {
    console.log(`No matches found for "${query}"`);
  } else {
    console.log(`Found ${matches.length} match(es) for "${query}"`);
  }

  return matches;
}

if (require.main === module) {
  const action = process.argv[2];

  if (action === "find") {
    const query = process.argv.slice(3).join(" ");
    if (!query) {
      console.error("Usage: node fetch-tracker.js find <company or role>");
      process.exit(1);
    }
    findRole(query)
      .then((matches) => console.log(JSON.stringify(matches, null, 2)))
      .catch((err) => {
        console.error("Error:", err.message);
        process.exit(1);
      });
  } else {
    fetchAndSave()
      .then(({ savePath }) => console.log(`Done. Data saved to ${savePath}`))
      .catch((err) => {
        console.error("Error fetching tracker:", err.message);
        process.exit(1);
      });
  }
}

module.exports = { fetchTracker, fetchAndSave, findRole };
