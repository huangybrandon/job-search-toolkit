const { queryDatabase, DB, notion } = require("./notion-client");

async function getPageJD(companyName) {
  const all = [];
  let hasMore = true;
  let cursor = undefined;

  while (hasMore) {
    const res = await queryDatabase(DB.companies, {
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    all.push(...res.results);
    hasMore = res.has_more;
    cursor = res.next_cursor;
  }

  const page = all.find((p) => {
    const company =
      p.properties?.Company?.title?.map((t) => t.plain_text).join("") || "";
    return company.toLowerCase().includes(companyName.toLowerCase());
  });

  if (!page) {
    console.log(`No page found for "${companyName}"`);
    return;
  }

  console.log(`Found page: ${page.id}`);

  const blocks = await notion.blocks.children.list({
    block_id: page.id,
    page_size: 100,
  });

  const text = blocks.results
    .map((b) => {
      const type = b.type;
      const content = b[type];
      if (content?.rich_text) return content.rich_text.map((t) => t.plain_text).join("");
      return "";
    })
    .filter(Boolean)
    .join("\n");

  console.log("\n--- JD Content ---\n");
  console.log(text);
}

const company = process.argv[2];
if (!company) {
  console.error("Usage: node fetch-jd.js <company name>");
  process.exit(1);
}

getPageJD(company).catch(console.error);
