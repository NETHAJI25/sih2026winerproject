const express = require('express');
const { query } = require('../db');
const { requireAuth } = require('../auth');
const { mirrorToFirebase } = require('../firebase');
const router = express.Router();
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', ah(async (req, res) => {
  try {
    const { rows } = await query(`
    SELECT h.*, a.flora_profile, act.name as owner_name, act.org as owner_org,
    (SELECT json_build_object('temp_c', temp_c, 'humidity_pct', humidity_pct, 'weight_kg', weight_kg, 'sound_db', sound_db, 'ts', ts)
     FROM hive_telemetry WHERE hive_code = h.hive_code ORDER BY ts DESC LIMIT 1) as last_reading,
    (SELECT count(*) FROM hive_telemetry WHERE hive_code = h.hive_code) as reading_count
    FROM hives h LEFT JOIN apiaries a ON a.id = h.apiary_id LEFT JOIN actors act ON act.id = h.owner_actor_id
    ORDER BY h.id DESC LIMIT 200`);
    return res.json({ hives: rows, source: 'postgres' });
  } catch (e) {
    if (e.code !== 'PG_UNAVAILABLE') throw e;
    const url = (process.env.FIREBASE_DATABASE_URL || 'https://sih2026-b9ef7-default-rtdb.firebaseio.com').replace(/\/$/, '');
    try {
      const r = await fetch(`${url}/hives.json`);
      const data = r.ok ? await r.json() : null;
      const hives = data ? Object.entries(data).map(([k, v]) => ({ hive_code: k, ...v, last_reading: v.lastTelemetry || null })) : [];
      if (!hives.length) {
        return res.json({ hives: [
          { hive_code: 'HIVE-KVIC-001', status: 'active', flora_source: 'Mustard', bee_species: 'Apis mellifera', last_reading: { temp_c: 34.2, humidity_pct: 62, weight_kg: 28.5 }, reading_count: 12 },
          { hive_code: 'HIVE-KVIC-002', status: 'active', flora_source: 'Eucalyptus', bee_species: 'Apis cerana', last_reading: { temp_c: 36.1, humidity_pct: 78, weight_kg: 22.1 }, reading_count: 8 },
          { hive_code: 'HIVE-KVIC-003', status: 'active', flora_source: 'Lychee', bee_species: 'Apis mellifera', last_reading: { temp_c: 33.8, humidity_pct: 65, weight_kg: 31.2 }, reading_count: 15 },
        ], source: 'demo' });
      }
      return res.json({ hives, source: 'firebase-rtdb' });
    } catch { return res.json({ hives: [], source: 'empty' }); }
  }
}));

router.get('/:code', ah(async (req, res) => {
  const code = req.params.code;
  const hive = (await query('SELECT * FROM hives WHERE hive_code=$1', [code])).rows[0];
  if (!hive) return res.status(404).json({ error: 'hive not found' });
  const telemetry = (await query('SELECT * FROM hive_telemetry WHERE hive_code=$1 ORDER BY ts DESC LIMIT 100', [code])).rows;
  const inspections = (await query('SELECT * FROM hive_inspections WHERE hive_code=$1 ORDER BY created_at DESC LIMIT 20', [code])).rows;
  const apiary = hive.apiary_id ? (await query('SELECT * FROM apiaries WHERE id=$1', [hive.apiary_id])).rows[0] : null;
  res.json({ hive, telemetry, inspections, apiary });
}));

router.post('/', requireAuth, ah(async (req, res) => {
  const b = req.body || {};
  const hive_code = String(b.hiveCode || b.hive_code || '').trim().toUpperCase();
  if (!hive_code) return res.status(400).json({ error: 'hiveCode required e.g. HIVE-KVIC-001' });
  const payload = { hive_code, apiary_id: b.apiaryId||b.apiary_id||null, owner_actor_id: req.user.sub, bee_species: b.beeSpecies||b.bee_species||'Apis mellifera', flora_source: b.floraSource||b.flora_source||null, box_type: b.boxType||b.box_type||'Langstroth', lat: b.lat||null, lng: b.lng||null, status: b.status||'active' };
  try {
    const { rows } = await query(`INSERT INTO hives (hive_code, apiary_id, owner_actor_id, bee_species, flora_source, box_type, lat, lng, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (hive_code) DO NOTHING RETURNING *`, [hive_code, payload.apiary_id, payload.owner_actor_id, payload.bee_species, payload.flora_source, payload.box_type, payload.lat, payload.lng, payload.status]);
    if (!rows[0]) return res.status(409).json({ error: 'hive_code already exists' });
    mirrorToFirebase('hives', hive_code, rows[0]);
    return res.status(201).json({ hive: rows[0], source: 'postgres' });
  } catch (e) {
    if (e.code !== 'PG_UNAVAILABLE') throw e;
    await mirrorToFirebase('hives', hive_code, payload);
    return res.status(201).json({ hive: payload, source: 'firebase-rtdb' });
  }
}));

router.post('/:code/inspect', requireAuth, ah(async (req, res) => {
  const code = req.params.code;
  const hive = (await query('SELECT id FROM hives WHERE hive_code=$1', [code])).rows[0];
  if (!hive) return res.status(404).json({ error: 'hive not found' });
  const b = req.body || {};
  const { rows } = await query(
    `INSERT INTO hive_inspections (hive_id, hive_code, inspected_by, brood_pattern_score, queen_seen, varroa_count, disease_signs, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [hive.id, code, req.user.sub, b.broodPatternScore||b.brood_pattern_score||null, b.queenSeen??b.queen_seen??null, b.varroaCount??b.varroa_count??null, b.diseaseSigns||b.disease_signs||null, b.notes||null]
  );
  mirrorToFirebase('inspections', String(rows[0].id), rows[0]);
  res.status(201).json({ inspection: rows[0] });
}));

module.exports = router;
