const crypto = require('crypto');
const express = require('express');
const { query } = require('../db');
const { requireAuth } = require('../auth');
const chain = require('../chain');

const router = express.Router();

const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function newBatchId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(6);
  let suffix = '';
  for (let i = 0; i < bytes.length; i++) suffix += alphabet[bytes[i] % alphabet.length];
  return `B-${suffix}`;
}

function parseBatchItem(item) {
  const weightKg = Number(item.weightKg ?? item.weight_kg ?? item.farmerWeight ?? item.farmer_weight);
  if (!Number.isFinite(weightKg) || weightKg <= 0) throw new Error('weightKg must be a positive number');
  const lat = item.geoLat ?? item.geo_lat ?? (item.geo && item.geo.lat) ?? null;
  const lng = item.geoLng ?? item.geo_lng ?? (item.geo && item.geo.lng) ?? null;
  return {
    clientBatchId: item.clientBatchId ?? item.client_batch_id ?? null,
    apiaryId: item.apiaryId ?? item.apiary_id ?? null,
    harvestDate: item.harvestDate ?? item.harvest_date ?? null,
    weightKg,
    farmerWeight: weightKg,
    geoLat: lat != null ? Number(lat) : null,
    geoLng: lng != null ? Number(lng) : null,
    floraType: item.floraType ?? item.flora_type ?? null,
    photoHash: item.photoHash ?? item.photo_hash ?? null,
    geo: item.geo ?? (lat != null && lng != null ? `${lat},${lng}` : null),
  };
}

async function createOne(rawItem, userId) {
  const item = parseBatchItem(rawItem || {});
  const id = newBatchId();
  const inserted = await query(
    `INSERT INTO batches (id, client_batch_id, apiary_id, harvest_date, weight_kg, farmer_weight, geo_lat, geo_lng, flora_type, photo_hash, status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'created', $11)
     ON CONFLICT (client_batch_id) DO NOTHING
     RETURNING *`,
    [id, item.clientBatchId, item.apiaryId, item.harvestDate, item.weightKg, item.farmerWeight, item.geoLat, item.geoLng, item.floraType, item.photoHash, userId]
  );
  const batch = inserted.rows[0];
  if (!batch) return { duplicated: true, clientBatchId: item.clientBatchId };
  const mint = await chain.recordBatch({
    id: batch.id,
    flora_type: batch.flora_type,
    weight_kg: batch.weight_kg,
    photo_hash: batch.photo_hash,
  });
  await query(
    'INSERT INTO transfers (batch_id, from_actor, to_actor, weight_kg, geo, tx_hash) VALUES ($1, $2, $3, $4, $5, $6)',
    [batch.id, userId, userId, batch.weight_kg, item.geo, mint.txHash]
  );
  await query(
    `INSERT INTO alerts (batch_id, type, severity, message, payload) VALUES ($1, 'pickup_request', 'medium', $2, $3::jsonb)`,
    [batch.id, `Pickup requested for ${batch.id} at ${item.geo || 'geotagged location'}`, JSON.stringify({ batchId: batch.id, geo: item.geo, geoLat: item.geoLat, geoLng: item.geoLng, farmerWeight: batch.weight_kg })]
  );
  return { duplicated: false, batch, txHash: mint.txHash };
}

router.post('/', requireAuth, ah(async (req, res) => {
  const body = req.body || {};
  const items = Array.isArray(body.batches) ? body.batches : [body];
  const created = [];
  const skipped = [];
  const failed = [];
  for (let i = 0; i < items.length; i++) {
    try {
      const result = await createOne(items[i], req.user.sub);
      if (result.duplicated) skipped.push({ index: i, clientBatchId: result.clientBatchId });
      else created.push({ ...result.batch, txHash: result.txHash });
    } catch (err) {
      failed.push({ index: i, error: err.message });
    }
  }
  res.status(created.length ? 201 : 200).json({ created, skipped, failed });
}));

router.get('/', ah(async (req, res) => {
  const conds = [];
  const params = [];
  if (req.query.status) {
    params.push(req.query.status);
    conds.push(`status = $${params.length}`);
  }
  if (req.query.apiary) {
    params.push(Number(req.query.apiary));
    conds.push(`apiary_id = $${params.length}`);
  }
  if (req.query.q) {
    params.push(`%${String(req.query.q)}%`);
    conds.push(`id ILIKE $${params.length}`);
  }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT * FROM batches ${where} ORDER BY created_at DESC LIMIT 200`,
    params
  );
  res.json({ batches: rows });
}));

router.get('/:id', ah(async (req, res) => {
  const batchId = req.params.id;
  const batchRes = await query('SELECT * FROM batches WHERE id = $1', [batchId]);
  const batch = batchRes.rows[0];
  if (!batch) return res.status(404).json({ error: 'batch not found' });
  const transfers = (await query(
    `SELECT t.*, fa.name AS from_name, fa.org AS from_org, ta.name AS to_name, ta.org AS to_org
     FROM transfers t
     LEFT JOIN actors fa ON fa.id = t.from_actor
     LEFT JOIN actors ta ON ta.id = t.to_actor
     WHERE t.batch_id = $1 ORDER BY t.id`,
    [batchId]
  )).rows;
  const quality = (await query(
    `SELECT q.*, a.name AS lab_name, a.org AS lab_org
     FROM quality_records q
     LEFT JOIN actors a ON a.id = q.lab_actor
     WHERE q.batch_id = $1 ORDER BY q.id`,
    [batchId]
  )).rows;
  const packages = (await query(
    'SELECT * FROM packages WHERE batch_id = $1 ORDER BY id',
    [batchId]
  )).rows;
  const alerts = (await query(
    'SELECT * FROM alerts WHERE batch_id = $1 ORDER BY id DESC',
    [batchId]
  )).rows;
  res.json({ batch, transfers, quality, packages, alerts });
}));

module.exports = router;
