const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { pool } = require('./db');
const app = require('./app');

async function migrate() {
  const fs = await import('fs');
  const { ensurePg } = require('./db');
  const ok = await ensurePg();
  if (!ok) {
    console.log('[migrate] postgres unavailable - running in Firebase RTDB mode, skip SQL migrate');
    try { require('./firebase').initFirebase(); } catch {}
    return;
  }
  const files = ['migrations.sql', path.join('..', 'migrations', '002_v2_flow.sql'), path.join('..', 'migrations', '003_hive_telemetry.sql')];
  for (const f of files) {
    const p = path.join(__dirname, f);
    if (fs.existsSync(p)) {
      const sql = fs.readFileSync(p, 'utf8');
      await pool.query(sql);
      console.log('[migrate] applied', f);
    }
  }
  try {
    const fb = require('./firebase');
    fb.initFirebase();
  } catch {}
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
