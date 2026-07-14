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
      ALTER TABLE client_submissions 
      ADD COLUMN IF NOT EXISTS lang VARCHAR(10) DEFAULT 'tr';
    `);
    console.log('✅ client_submissions tablosuna "lang" kolonu başarıyla eklendi (veya zaten mevcut).');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('❌ Migration hatası:', err);
  process.exit(1);
});
