const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { pool } = require('./db');
const app = require('./app');

async function migrate() {
  const fs = await import('fs');
  const sql = fs.readFileSync(path.join(__dirname, 'migrations.sql'), 'utf8');
  await pool.query(sql);
}

const PORT = Number(process.env.PORT) || 4000;

migrate()
  .then(() => {
    app.listen(PORT, () => console.log(`HoneyChain API listening on http://localhost:${PORT} (health: /health)`));
  })
  .catch((err) => {
    console.error('migration failed:', err.message);
    process.exit(1);
  });
