// Migration: create client_submissions table
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Load .env.local manually so DATABASE_URL / PG* vars are available
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
      CREATE TABLE IF NOT EXISTS client_submissions (
        id           SERIAL PRIMARY KEY,
        token        VARCHAR(128) UNIQUE NOT NULL,
        page_slug    VARCHAR(255) NOT NULL,
        user_page_id INTEGER,
        status       VARCHAR(32) DEFAULT 'pending',
        expires_at   TIMESTAMP WITH TIME ZONE NOT NULL,
        couple_names VARCHAR(255),
        special_date VARCHAR(100),
        tagline      TEXT,
        music_url    TEXT,
        memories     JSONB DEFAULT '[]',
        submitted_at TIMESTAMP WITH TIME ZONE,
        created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_submissions_token
      ON client_submissions (token)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_submissions_page_slug
      ON client_submissions (page_slug)
    `);

    console.log('✅ client_submissions tablosu başarıyla oluşturuldu (veya zaten mevcut).');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('❌ Migration hatası:', err);
  process.exit(1);
});
