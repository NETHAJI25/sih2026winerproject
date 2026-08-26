const express = require('express');
const { query } = require('../db');
const { issueToken, requireAuth } = require('../auth');

const router = express.Router();

const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const ROLES = ['beekeeper', 'fpo', 'processor', 'lab', 'packer', 'admin'];

router.post('/', requireAuth, ah(async (req, res) => {
  const body = req.body || {};
  const role = String(body.role || '');
  const name = String(body.name || '').trim();
  const phone = String(body.phone || '').trim();
  if (!ROLES.includes(role)) return res.status(400).json({ error: `role must be one of ${ROLES.join('|')}` });
  if (!name) return res.status(400).json({ error: 'name is required' });
  if (!phone) return res.status(400).json({ error: 'phone is required' });
  try {
    const { rows } = await query(
      `INSERT INTO actors (role, name, phone, org, wallet_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, role, name, phone, org, wallet_address, created_at`,
      [role, name, phone, body.org ?? null, body.walletAddress ?? body.wallet_address ?? null]
    );
    const actor = rows[0];
    res.status(201).json({ actor, token: issueToken(actor) });
  } catch (err) {
    if (err && err.code === '23505') return res.status(409).json({ error: 'phone already registered' });
    throw err;
  }
}));

router.get('/', ah(async (req, res) => {
  const conds = [];
  const params = [];
  if (req.query.role) {
    if (!ROLES.includes(String(req.query.role))) {
      return res.status(400).json({ error: `role must be one of ${ROLES.join('|')}` });
    }
    params.push(req.query.role);
    conds.push(`role = $${params.length}`);
  }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT id, role, name, org, wallet_address, created_at FROM actors ${where} ORDER BY created_at DESC LIMIT 500`,
    params
  );
  res.json({ actors: rows });
}));

router.get('/:id', ah(async (req, res) => {
  const { rows } = await query(
    'SELECT id, role, name, org, wallet_address, created_at FROM actors WHERE id = $1',
    [Number(req.params.id)]
  );
  if (!rows[0]) return res.status(404).json({ error: 'actor not found' });
  res.json({ actor: rows[0] });
}));

module.exports = router;
