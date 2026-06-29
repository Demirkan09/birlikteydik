const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: 'postgresql://birlikteydik_user:349292@157.90.173.248:5432/birlikteydik_db?schema=public'
});

const sql = `
  CREATE TABLE IF NOT EXISTS custom_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    template_config JSONB NOT NULL DEFAULT '{}',
    preview_color VARCHAR(20) DEFAULT '#C9A84C',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

pool.query(sql)
  .then(() => {
    console.log('custom_templates tablosu basariyla olusturuldu');
    pool.end();
  })
  .catch(err => {
    console.error('HATA:', err.message);
    pool.end();
    process.exit(1);
  });
