const { Pool } = require("pg");
const fs = require("fs");

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
} catch (e) {}

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
    const res = await pool.query("SELECT id, name, email, role, is_verified FROM users");
    console.log("Users in DB:");
    console.table(res.rows);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

run();
