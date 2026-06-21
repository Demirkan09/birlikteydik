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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP DEFAULT NULL,
        reset_type VARCHAR(50) NOT NULL,
        page_slug VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("password_reset_tokens table ready.");

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
