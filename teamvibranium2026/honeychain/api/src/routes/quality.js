const express = require('express');
const { query } = require('../db');
const { requireRole } = require('../auth');
const chain = require('../chain');

const router = express.Router();

const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/receive', requireRole('lab'), ah(async (req, res) => {
  const { batchId, receivedWeight } = req.body || {};
  if (!batchId) return res.status(400).json({ error: 'batchId required' });
  const w = Number(receivedWeight);
  if (!Number.isFinite(w) || w <= 0) return res.status(400).json({ error: 'receivedWeight must be >0' });
  await query('UPDATE batches SET lab_received_weight=$2, status=$3 WHERE id=$1', [batchId, w, 'at_lab']);
  res.json({ ok: true, batchId, lab_received_weight: w });
}));

router.post('/process', requireRole('lab'), ah(async (req, res) => {
  const { batchId, wastage, pureWeight } = req.body || {};
  if (!batchId) return res.status(400).json({ error: 'batchId required' });
  const ws = Number(wastage), pw = Number(pureWeight);
  if (!Number.isFinite(ws) || ws < 0) return res.status(400).json({ error: 'wastage must be >=0' });
  if (!Number.isFinite(pw) || pw <= 0) return res.status(400).json({ error: 'pureWeight must be >0' });
  await query('UPDATE batches SET lab_wastage=$2, lab_pure_weight=$3, status=$4 WHERE id=$1', [batchId, ws, pw, 'tested']);
  if (pw > 0) {
    const b = (await query('SELECT farmer_weight, lab_received_weight FROM batches WHERE id=$1', [batchId])).rows[0];
    if (b && (pw > Number(b.lab_received_weight) * 1.01 || pw > Number(b.farmer_weight) * 1.01)) {
      await query(`INSERT INTO alerts (batch_id,type,severity,message,payload) VALUES ($1,'dilution','high',$2,$3::jsonb)`, [batchId, `Pure ${pw}kg > received/lab weight — impossible gain flagged`, JSON.stringify({ pureWeight: pw, received: b.lab_received_weight, farmer: b.farmer_weight })]);
      await query("UPDATE batches SET status='flagged' WHERE id=$1", [batchId]);
    }
  }
  res.json({ ok: true, batchId, wastage: ws, pureWeight: pw });
}));

router.post('/', requireRole('lab'), ah(async (req, res) => {
  const body = req.body || {};
  const batchId = String(body.batchId || '');
  const testType = String(body.testType || '').trim();
  const passed = body.passed !== undefined ? Boolean(body.passed) : true;
  const certificateHash = body.certificateHash ?? body.certificate_hash ?? null;
  const testerPhotoHash = body.testerPhotoHash ?? body.tester_photo_hash ?? null;
  const receivedWeight = body.receivedWeight ?? body.received_weight ?? null;
  const wastage = body.wastage ?? null;
  const pureWeight = body.pureWeight ?? body.pure_weight ?? null;
  if (!batchId) return res.status(400).json({ error: 'batchId is required' });
  if (!testType) return res.status(400).json({ error: 'testType is required' });
  if (!certificateHash) return res.status(400).json({ error: 'certificateHash required (sample cert per batch)' });
  if (!testerPhotoHash) return res.status(400).json({ error: 'testerPhotoHash required (photo of tester with honey)' });

  const batchRes = await query('SELECT id FROM batches WHERE id = $1', [batchId]);
  if (!batchRes.rows[0]) return res.status(404).json({ error: 'batch not found' });

  const mint = await chain.recordQuality({ batchId, passed, certificateHash });
  const { rows } = await query(
    `INSERT INTO quality_records (batch_id, lab_actor, test_type, passed, certificate_hash, tester_photo_hash, received_weight, wastage, pure_weight)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [batchId, req.user.sub, testType, passed, certificateHash, testerPhotoHash, receivedWeight, wastage, pureWeight]
  );
  res.status(201).json({ record: rows[0], txHash: mint.txHash });
}));

module.exports = router;
