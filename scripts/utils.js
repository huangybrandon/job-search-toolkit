const fs = require("fs");
const path = require("path");

const CONTEXT_DIR = path.join(__dirname, "..", "context");
const PROMPTS_DIR = path.join(__dirname, "..", "prompts");

/**
 * Load a prompt template and fill in variables.
 * Variables in the template look like: {{VARIABLE_NAME}}
 */
function loadPrompt(templateName, variables = {}) {
  const templatePath = path.join(PROMPTS_DIR, templateName);
  let template = fs.readFileSync(templatePath, "utf-8");

  for (const [key, value] of Object.entries(variables)) {
    template = template.replace(
      new RegExp(`\\{\\{${key}\\}\\}`, "g"),
      value || "(not provided)"
    );
  }

  return template;
}

/**
 * Load the candidate profile from context/profile.md
 */
function loadProfile() {
  const profilePath = path.join(CONTEXT_DIR, "profile.md");

  if (!fs.existsSync(profilePath)) {
    throw new Error(
      "context/profile.md not found. Copy context/profile.example.md to context/profile.md and fill it in."
    );
  }

  return fs.readFileSync(profilePath, "utf-8");
}

/**
 * Load the latest tracker snapshot.
 */
function loadSheetData() {
  const sheetPath = path.join(CONTEXT_DIR, "sheet-data.json");

  if (!fs.existsSync(sheetPath)) {
    console.warn(
      "No sheet-data.json found. Run: node scripts/fetch-tracker.js"
    );
    return null;
  }

  return JSON.parse(fs.readFileSync(sheetPath, "utf-8"));
}

/**
 * Save output to a timestamped file in output/.
 */
function saveOutput(type, company, content) {
  const outputDir = path.join(__dirname, "..", "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().split("T")[0];
  const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const filename = `${timestamp}-${slug}-${type}.md`;
  const filePath = path.join(outputDir, filename);

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Saved output to: ${filePath}`);

  return filePath;
}

/**
 * Save output to both local file AND Notion.
 * Creates a Prep & Debriefs page linked to the company.
 * @param {string} type - 'prep' or 'debrief'
 * @param {string} company - Company name (used for filename and Notion lookup)
 * @param {string} content - Markdown content
 * @param {string} personName - Person's name for the title
 * @param {string} [meetingNoteId] - Optional Meeting Notes page ID (for debriefs)
 * @returns {Promise<{filePath: string, pageId: string}>}
 */
async function saveOutputWithNotion(type, company, content, personName, meetingNoteId) {
  // Save locally first
  const filePath = saveOutput(type, company, content);

  // Then write to Notion
  try {
    const { writeToCompanyPage } = require("./write-to-notion");
    const notionType = type === "prep" ? "Prep" : "Debrief";
    const { pageId } = await writeToCompanyPage(
      company,
      content,
      notionType,
      personName,
      meetingNoteId
    );
    return { filePath, pageId };
  } catch (err) {
    console.error(`Warning: Could not write to Notion: ${err.message}`);
    console.error("Content was saved locally.");
    return { filePath, pageId: null };
  }
}

module.exports = {
  loadPrompt,
  loadProfile,
  loadSheetData,
  saveOutput,
  saveOutputWithNotion,
};
