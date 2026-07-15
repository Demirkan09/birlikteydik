const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
try {
  const envPath = "c:/Users/pc/birlikteydik/.env.local";
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach(line => {
    const part = line.trim();
    if (!part || part.startsWith("#")) return;
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const k = part.substring(0, idx).trim();
    const v = part.substring(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    process.env[k] = v;
  });
} catch (e) {
  console.log("Could not load env file:", e.message);
}

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query(
      "SELECT page_slug, template_id, config, memories, is_published FROM page_settings WHERE page_slug IN ('sablon-emerald', 'sablon-kirmizi')"
    );
    console.log("Found rows count:", res.rowCount);
    res.rows.forEach(row => {
      console.log("\n------------------------------------------------");
      console.log("Page Slug:", row.page_slug);
      console.log("Template ID:", row.template_id);
      console.log("Is Published:", row.is_published);
      console.log("Config:", JSON.stringify(row.config, null, 2));
      console.log("Memories:", JSON.stringify(row.memories, null, 2));
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

run();
