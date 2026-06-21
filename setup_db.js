const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL
      );
    `);
    console.log("site_settings table ready.");

    // Insert default values if not exists
    const res = await pool.query("SELECT key FROM site_settings WHERE key = 'package_durations'");
    if (res.rowCount === 0) {
      await pool.query(`
        INSERT INTO site_settings (key, value)
        VALUES ('package_durations', '{"temel": {"old": null, "new": 6}, "premium": {"old": null, "new": 18}, "premium+": {"old": null, "new": 24}}'::jsonb)
      `);
      console.log("Inserted default package durations.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
