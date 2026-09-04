const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://honey:chain2026@localhost:5432/honeychain',
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 30000,
});

let pgReady = null;
async function ensurePg() {
  if (pgReady !== null) return pgReady;
  try {
    await pool.query('SELECT 1');
    pgReady = true;
  } catch (e) {
    console.warn('[db] postgres unavailable, using Firebase RTDB fallback:', e.message);
    pgReady = false;
  }
  return pgReady;
}

async function query(text, params = []) {
  const ok = await ensurePg();
  if (!ok) {
    const err = new Error('postgres unavailable - Firebase RTDB mode');
    err.code = 'PG_UNAVAILABLE';
    throw err;
  }
  return pool.query(text, params);
}

module.exports = { pool, query, ensurePg };
