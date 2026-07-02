// Migration: create quiz_answers table
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  }
}

const dbUrl = (process.env.DATABASE_URL || '').replace(/^"|"$/g, '').split('?')[0];
const pool = new Pool({ connectionString: dbUrl });


async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id               SERIAL PRIMARY KEY,
        page_slug        VARCHAR(255) NOT NULL,
        component_id     INTEGER NOT NULL,
        question         TEXT NOT NULL,
        selected_option  TEXT NOT NULL,
        answered_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_answers_page_component
      ON quiz_answers (page_slug, component_id)
    `);
    console.log('quiz_answers table created (or already exists).');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
