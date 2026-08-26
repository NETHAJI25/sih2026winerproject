const express = require('express');
const { query } = require('../db');

const router = express.Router();

const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function sanitizeActor(row, prefix) {
  return row ? {
    id: row[`${prefix}_id`],
    name: row[`${prefix}_name`],
    org: row[`${prefix}_org`],
  } : null;
}

router.get('/batches/:batchId', ah(async (req, res) => {
  const batchId = req.params.batchId;
  const batchRes = await query(
    `SELECT b.*, a.lat AS apiary_lat, a.lng AS apiary_lng, a.flora_profile AS apiary_flora,
            f.id AS farmer_id, f.name AS farmer_name, f.org AS farmer_org
     FROM batches b
     LEFT JOIN apiaries a ON a.id = b.apiary_id
     LEFT JOIN actors f ON f.id = b.created_by
     WHERE b.id = $1`,
    [batchId]
  );
  const row = batchRes.rows[0];
  if (!row) return res.status(404).json({ error: 'batch not found' });

  const transfers = (await query(
    `SELECT t.id, t.weight_kg, t.geo, t.tx_hash, t.created_at,
            fa.id AS from_id, fa.name AS from_name, fa.org AS from_org,
            ta.id AS to_id, ta.name AS to_name, ta.org AS to_org
     FROM transfers t
     LEFT JOIN actors fa ON fa.id = t.from_actor
     LEFT JOIN actors ta ON ta.id = t.to_actor
     WHERE t.batch_id = $1 ORDER BY t.id`,
    [batchId]
  )).rows;

  const quality = (await query(
    `SELECT q.test_type, q.passed, q.certificate_hash, q.created_at,
            a.name AS lab_name, a.org AS lab_org
     FROM quality_records q
     LEFT JOIN actors a ON a.id = q.lab_actor
     WHERE q.batch_id = $1 ORDER BY q.id`,
    [batchId]
  )).rows;

  const packages = (await query(
    'SELECT id, jar_count, qr_code, minted_at FROM packages WHERE batch_id = $1 ORDER BY id',
    [batchId]
  )).rows;

  const hasPassedQuality = quality.some((q) => q.passed);
  const trustBadge =
    row.status === 'packaged' && hasPassedQuality && transfers.length >= 3 ? 'verified' : 'partial';

  const batch = {
    id: row.id,
    harvestDate: row.harvest_date,
    weightKg: Number(row.weight_kg),
    floraType: row.flora_type,
    status: row.status,
    createdAt: row.created_at,
    apiary: row.apiary_lat != null ? {
      lat: Number(row.apiary_lat),
      lng: Number(row.apiary_lng),
      floraProfile: row.apiary_flora,
    } : null,
    farmer: sanitizeActor({ farmer_id: row.farmer_id, farmer_name: row.farmer_name, farmer_org: row.farmer_org }, 'farmer'),
  };

  res.json({
    batch,
    transfers: transfers.map((t) => ({
      id: t.id,
      weightKg: Number(t.weight_kg),
      geo: t.geo,
      txHash: t.tx_hash,
      createdAt: t.created_at,
      from: sanitizeActor(t, 'from'),
      to: sanitizeActor(t, 'to'),
    })),
    quality: quality.map((q) => ({
      testType: q.test_type,
      passed: q.passed,
      certificateHash: q.certificate_hash,
      labName: q.lab_name,
      labOrg: q.lab_org,
      createdAt: q.created_at,
    })),
    packages,
    trustBadge,
  });
}));

module.exports = router;
