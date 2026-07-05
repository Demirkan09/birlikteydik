const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: 'postgresql://birlikteydik_user:349292@127.0.0.1:5433/birlikteydik_db?schema=public'
});

const sql = `
  ALTER TABLE page_settings 
  ADD COLUMN IF NOT EXISTS is_showcase BOOLEAN DEFAULT false;
`;

pool.query(sql)
  .then(() => {
    console.log('page_settings tablosuna is_showcase kolonu basariyla eklendi');
    pool.end();
  })
  .catch(err => {
    console.error('HATA:', err.message);
    pool.end();
    process.exit(1);
  });
