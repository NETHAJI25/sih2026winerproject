const express = require('express');
const { query } = require('../db');
const { requireAuth } = require('../auth');
const chain = require('../chain');

const router = express.Router();

const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function checkAnomaly(batchId, userId) {
  try {
    const { rows } = await query(
      'SELECT weight_kg FROM transfers WHERE batch_id = $1 ORDER BY id',
      [batchId]
    );
    const hops = rows.map((r, i) => ({ hop: i + 1, weightKg: Number(r.weight_kg) }));
    const base = await fetch(`${process.env.AI_SERVICE_URL}/anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId, hops }),
    });
    if (!base.ok) return;
    const result = await base.json();
    if (!result || result.flag !== true) return;
    await query(
      `INSERT INTO alerts (batch_id, type, severity, message, payload)
       VALUES ($1, 'dilution', 'high', $2, $3::jsonb)`,
      [batchId, result.reason || 'dilution anomaly detected by AI service', JSON.stringify({ batchId, hops })]
    );
    await query("UPDATE batches SET status = 'flagged' WHERE id = $1", [batchId]);
  } catch {
  }
}

router.post('/', requireAuth, ah(async (req, res) => {
  const body = req.body || {};
  const batchId = String(body.batchId || '');
  const toActorId = Number(body.toActorId);
  const weightKg = Number(body.weightKg);
  if (!batchId) return res.status(400).json({ error: 'batchId is required' });
  if (!Number.isInteger(toActorId)) return res.status(400).json({ error: 'toActorId must be an integer actor id' });
  if (!Number.isFinite(weightKg) || weightKg <= 0) return res.status(400).json({ error: 'weightKg must be a positive number' });

  const batchRes = await query('SELECT * FROM batches WHERE id = $1', [batchId]);
  const batch = batchRes.rows[0];
  if (!batch) return res.status(404).json({ error: 'batch not found' });

  const lastRes = await query(
    'SELECT to_actor FROM transfers WHERE batch_id = $1 ORDER BY id DESC LIMIT 1',
    [batchId]
  );
  const currentHolder = lastRes.rows[0] ? lastRes.rows[0].to_actor : batch.created_by;
  if (currentHolder !== req.user.sub) {
    return res.status(403).json({ error: 'only the current custody holder can transfer this batch' });
  }

  const actorRes = await query('SELECT * FROM actors WHERE id = $1', [toActorId]);
  if (!actorRes.rows[0]) return res.status(404).json({ error: 'target actor not found' });

  const mint = await chain.recordTransfer({
    batchId,
    toAddress: actorRes.rows[0].wallet_address,
    weightKg,
    geo: body.geo ?? null,
  });
  const { rows } = await query(
    `INSERT INTO transfers (batch_id, from_actor, to_actor, weight_kg, geo, tx_hash)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [batchId, req.user.sub, toActorId, weightKg, body.geo ?? null, mint.txHash]
  );

  checkAnomaly(batchId, req.user.sub);

  res.status(201).json({ transfer: rows[0], txHash: mint.txHash });
}));

router.get('/', requireAuth, ah(async (req, res) => {
  const conds = [];
  const params = [];
  if (req.query.batchId) {
    params.push(req.query.batchId);
    conds.push(`batch_id = $${params.length}`);
  }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT t.*, fa.name AS from_name, ta.name AS to_name
     FROM transfers t
     LEFT JOIN actors fa ON fa.id = t.from_actor
     LEFT JOIN actors ta ON ta.id = t.to_actor
     ${where} ORDER BY t.id DESC LIMIT 200`,
    params
  );
  res.json({ transfers: rows });
}));

module.exports = router;
