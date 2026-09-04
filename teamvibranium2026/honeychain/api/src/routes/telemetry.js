const express = require('express');
const { query } = require('../db');
const { requireAuth } = require('../auth');
const { pushTelemetryRealtime, mirrorToFirebase } = require('../firebase');
const router = express.Router();
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function classifyHealth(t, h, w, soundDb) {
  let score = 100; let issues = [];
  if (t < 32 || t > 37) { score -= 25; issues.push(t < 32 ? 'brood chill risk' : 'overheating'); }
  if (h > 80 || h < 40) { score -= 15; issues.push(h > 80 ? 'high humidity pathogen risk' : 'low humidity dehydration'); }
  if (soundDb != null && soundDb > 75) { score -= 20; issues.push('agitated buzzing possible queenless'); }
  if (w != null && w < 10) { score -= 20; issues.push('low hive weight - feed needed'); }
  score = Math.max(0, Math.min(100, score));
  const status = score >= 80 ? 'healthy' : score >= 50 ? 'attention' : 'critical';
  return { healthScore: score, healthStatus: status, issues };
}

async function maybeAlert(hiveCode, hiveId, reading, health) {
  if (health.healthStatus === 'critical' || health.healthStatus === 'attention' && health.issues.length >= 2) {
    const severity = health.healthStatus === 'critical' ? 'high' : 'medium';
    const msg = `Hive ${hiveCode} ${health.healthStatus}: ${health.issues.join(', ')} (T=${reading.temp_c}C H=${reading.humidity_pct}% W=${reading.weight_kg}kg)`;
    try { await query(`INSERT INTO alerts (batch_id, type, severity, message, payload) VALUES ($1,'hive_health', $2, $3, $4::jsonb)`, [hiveCode, severity, msg, JSON.stringify({ hiveCode, hiveId, reading, health })]); } catch {}
    try { const { rtdbPut } = require('../firebase'); await rtdbPut(`alerts/${Date.now()}`, { batch_id: hiveCode, type: 'hive_health', severity, message: msg, payload: { hiveCode, health } }); } catch {}
  }
}

router.post('/ingest', ah(async (req, res) => {
  const body = req.body || {};
  const points = Array.isArray(body) ? body : Array.isArray(body.points) ? body.points : [body];
  const inserted = []; const failed = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const hiveCode = String(p.hiveCode || p.hive_code || '').trim().toUpperCase();
    const temp_c = Number(p.tempC ?? p.temp_c ?? p.temperature);
    const humidity_pct = Number(p.humidityPct ?? p.humidity_pct ?? p.humidity);
    const weight_kg = Number(p.weightKg ?? p.weight_kg ?? p.weight);
    if (!hiveCode || !Number.isFinite(temp_c) || !Number.isFinite(humidity_pct) || !Number.isFinite(weight_kg)) {
      failed.push({ index: i, error: 'hiveCode, tempC, humidityPct, weightKg required' }); continue;
    }
    let hiveId = null; try { const h = (await query('SELECT id FROM hives WHERE hive_code=$1', [hiveCode])).rows[0]; hiveId = h ? h.id : null; } catch {}
    const sound_db = p.soundDb ?? p.sound_db ?? p.sound ?? null;
    const sound_freq = p.soundFreqHz ?? p.sound_freq_hz ?? null;
    const battery = p.batteryPct ?? p.battery_pct ?? null;
    const ts = p.ts ? new Date(p.ts) : new Date();
    let reading = { hive_id: hiveId, hive_code: hiveCode, ts, temp_c, humidity_pct, weight_kg, sound_db, sound_freq_hz: sound_freq, battery_pct: battery };
    try {
      const { rows } = await query(`INSERT INTO hive_telemetry (hive_id, hive_code, ts, temp_c, humidity_pct, weight_kg, sound_db, sound_freq_hz, battery_pct) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [hiveId, hiveCode, ts, temp_c, humidity_pct, weight_kg, sound_db, sound_freq, battery]);
      reading = rows[0];
    } catch (e) { if (e.code !== 'PG_UNAVAILABLE') throw e; }
    const health = classifyHealth(temp_c, humidity_pct, weight_kg, sound_db != null ? Number(sound_db) : null);
    await maybeAlert(hiveCode, hiveId, reading, health);
    pushTelemetryRealtime(hiveCode, { temp_c, humidity_pct, weight_kg, sound_db, sound_freq_hz: sound_freq, battery_pct: battery, ts: reading.ts, healthScore: health.healthScore, healthStatus: health.healthStatus });
    inserted.push({ ...reading, healthScore: health.healthScore, healthStatus: health.healthStatus, issues: health.issues });
  }
  res.status(inserted.length ? 201 : 400).json({ inserted, failed, count: inserted.length });
}));

router.get('/:hiveCode', ah(async (req, res) => {
  const code = req.params.hiveCode.toUpperCase();
  const limit = Math.min(500, Number(req.query.limit) || 50);
  try {
    const since = req.query.since ? new Date(req.query.since) : null;
    let q = 'SELECT * FROM hive_telemetry WHERE hive_code=$1';
    const params = [code];
    if (since && !isNaN(since)) { params.push(since.toISOString()); q += ` AND ts >= $${params.length}`; }
    q += ' ORDER BY ts DESC LIMIT ' + limit;
    const { rows } = await query(q, params);
    const hive = (await query('SELECT * FROM hives WHERE hive_code=$1', [code])).rows[0] || null;
    let stats = null;
    if (rows.length) {
      const temps = rows.map(r => Number(r.temp_c)); const hums = rows.map(r => Number(r.humidity_pct)); const weights = rows.map(r => Number(r.weight_kg));
      const avg = a => a.reduce((s,v)=>s+v,0)/a.length;
      stats = { avgTemp: +avg(temps).toFixed(1), avgHumidity: +avg(hums).toFixed(1), avgWeight: +avg(weights).toFixed(1), latestHealth: classifyHealth(Number(rows[0].temp_c), Number(rows[0].humidity_pct), Number(rows[0].weight_kg), rows[0].sound_db) };
    }
    return res.json({ hive, telemetry: rows.reverse(), stats, count: rows.length, source: 'postgres' });
  } catch (e) {
    if (e.code !== 'PG_UNAVAILABLE') throw e;
    const RTDB_URL = process.env.FIREBASE_DATABASE_URL || 'https://sih2026-b9ef7-default-rtdb.firebaseio.com';
    try {
      const r = await fetch(`${RTDB_URL}/telemetry/${code}.json`);
      const data = r.ok ? await r.json() : null;
      const rows = data ? Object.values(data).map(v => ({ hive_code: code, ts: v.ts || v._ts, temp_c: v.temp_c, humidity_pct: v.humidity_pct, weight_kg: v.weight_kg, sound_db: v.sound_db })) : [];
      const sorted = rows.sort((a,b)=> new Date(a.ts)-new Date(b.ts)).slice(-limit);
      let stats = null;
      if (sorted.length) {
        const temps = sorted.map(r => Number(r.temp_c)); const hums = sorted.map(r => Number(r.humidity_pct)); const weights = sorted.map(r => Number(r.weight_kg));
        const avg = a => a.reduce((s,v)=>s+v,0)/a.length;
        stats = { avgTemp: +avg(temps).toFixed(1), avgHumidity: +avg(hums).toFixed(1), avgWeight: +avg(weights).toFixed(1), latestHealth: classifyHealth(Number(sorted[sorted.length-1].temp_c), Number(sorted[sorted.length-1].humidity_pct), Number(sorted[sorted.length-1].weight_kg), sorted[sorted.length-1].sound_db) };
      }
      return res.json({ hive: { hive_code: code }, telemetry: sorted, stats, count: sorted.length, source: 'firebase-rtdb' });
    } catch { return res.json({ hive: null, telemetry: [], stats: null, count: 0, source: 'empty' }); }
  }
}));

router.get('/', ah(async (req, res) => {
  try {
    const { rows } = await query(`SELECT hive_code, count(*) as points, max(ts) as last_ts, avg(temp_c)::numeric(4,1) as avg_temp, avg(humidity_pct)::numeric(4,1) as avg_hum, avg(weight_kg)::numeric(5,2) as avg_weight FROM hive_telemetry GROUP BY hive_code ORDER BY last_ts DESC LIMIT 100`);
    return res.json({ summary: rows, source: 'postgres' });
  } catch (e) {
    if (e.code !== 'PG_UNAVAILABLE') throw e;
    const RTDB_URL = process.env.FIREBASE_DATABASE_URL || 'https://sih2026-b9ef7-default-rtdb.firebaseio.com';
    try {
      const r = await fetch(`${RTDB_URL}/telemetry.json`);
      const data = r.ok ? await r.json() : null;
      const summary = data ? Object.entries(data).map(([hive_code, vals]) => {
        const arr = Object.values(vals);
        return { hive_code, points: arr.length, last_ts: arr[arr.length-1]?.ts || arr[arr.length-1]?._ts, avg_temp: null, avg_hum: null, avg_weight: null };
      }) : [];
      return res.json({ summary, source: 'firebase-rtdb' });
    } catch { return res.json({ summary: [], source: 'empty' }); }
  }
}));

module.exports = router;
