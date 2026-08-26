const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://honey:chain2026@localhost:5432/honeychain',
});

async function query(text, params = []) {
  return pool.query(text, params);
}

module.exports = { pool, query };
