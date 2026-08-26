const express = require('express');
const { query } = require('../db');
const { requireAuth, requireRole } = require('../auth');

const router = express.Router();

const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', ah(async (req, res) => {
  const conds = [];
  const params = [];
  if (req.query.batchId) {
    params.push(req.query.batchId);
    conds.push(`batch_id = $${params.length}`);
  }
  if (req.query.open === 'true') conds.push('acknowledged = false');
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT * FROM alerts ${where} ORDER BY acknowledged ASC, created_at DESC LIMIT 200`,
    params
  );
  res.json({ alerts: rows });
}));

router.post('/:id/ack', requireAuth, requireRole('admin', 'fpo'), ah(async (req, res) => {
  const { rows } = await query(
    'UPDATE alerts SET acknowledged = true WHERE id = $1 RETURNING *',
    [Number(req.params.id)]
  );
  if (!rows[0]) return res.status(404).json({ error: 'alert not found' });
  res.json({ alert: rows[0] });
}));

module.exports = router;
