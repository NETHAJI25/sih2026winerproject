const express = require('express');
const { query } = require('../db');
const { requireRole } = require('../auth');
const chain = require('../chain');

const router = express.Router();

const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/receive', requireRole('packer'), ah(async (req, res) => {
  const { batchId, receivedWeight } = req.body || {};
  if (!batchId) return res.status(400).json({ error: 'batchId required' });
  const w = Number(receivedWeight);
  if (!Number.isFinite(w) || w <= 0) return res.status(400).json({ error: 'receivedWeight must be >0' });
  await query('UPDATE batches SET packer_received_weight=$2 WHERE id=$1', [batchId, w]);
  res.json({ ok: true, batchId, packer_received_weight: w });
}));

router.post('/', requireRole('packer'), ah(async (req, res) => {
  const body = req.body || {};
  const batchId = String(body.batchId || '');
  const jarCount = Number(body.jarCount);
  const receivedWeight = body.receivedWeight ?? body.packerReceivedWeight ?? null;
  if (!batchId) return res.status(400).json({ error: 'batchId is required' });
  if (!Number.isInteger(jarCount) || jarCount <= 0) {
    return res.status(400).json({ error: 'jarCount must be a positive integer' });
  }

  const batchRes = await query('SELECT * FROM batches WHERE id = $1', [batchId]);
  const batch = batchRes.rows[0];
  if (!batch) return res.status(404).json({ error: 'batch not found' });
  if (batch.status === 'flagged') return res.status(409).json({ error: 'batch flagged — cannot mint QR' });
  const labPure = batch.lab_pure_weight != null ? Number(batch.lab_pure_weight) : null;
  if (labPure != null && receivedWeight != null && Number(receivedWeight) > labPure * 1.01) {
    return res.status(409).json({ error: `packer received ${receivedWeight}kg > lab pure ${labPure}kg — flagged` });
  }
  if (receivedWeight != null) await query('UPDATE batches SET packer_received_weight=$2 WHERE id=$1', [batchId, Number(receivedWeight)]);

  const qrCode = `hc.in/b/${batchId}`;
  const mint = await chain.recordMint({ batchId, jarCount });
  const { rows } = await query(
    `INSERT INTO packages (batch_id, jar_count, qr_code, packer_received_weight)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [batchId, jarCount, qrCode, receivedWeight != null ? Number(receivedWeight) : batch.packer_received_weight]
  );
  await query("UPDATE batches SET status = 'packaged' WHERE id = $1", [batchId]);
  res.status(201).json({ package: rows[0], txHash: mint.txHash });
}));

module.exports = router;
