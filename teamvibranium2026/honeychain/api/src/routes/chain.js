const express = require('express');
const { query } = require('../db');
const chain = require('../chain');

const router = express.Router();

const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/status', ah(async (req, res) => {
  const status = await chain.getChainStatus();
  const transfers = Number((await query('SELECT count(*)::int AS n FROM transfers')).rows[0].n);
  const batches = Number((await query('SELECT count(*)::int AS n FROM batches')).rows[0].n);
  res.json({ ...status, counts: { transfers, batches } });
}));

module.exports = router;
