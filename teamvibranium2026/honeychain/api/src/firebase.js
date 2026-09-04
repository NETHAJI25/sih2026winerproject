let admin = null;
let firestore = null;
let rtdb = null;

const RTDB_URL = process.env.FIREBASE_DATABASE_URL || 'https://sih2026-b9ef7-default-rtdb.firebaseio.com';

async function rtdbPut(path, data) {
  try {
    const url = `${RTDB_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}.json`;
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.ok;
  } catch (e) {
    console.warn('[firebase REST] put failed', e.message);
    return false;
  }
}
async function rtdbPost(path, data) {
  try {
    const url = `${RTDB_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}.json`;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.ok;
  } catch (e) {
    return false;
  }
}

function initFirebase() {
  if (firestore || rtdb) return { firestore, rtdb, rtdbUrl: RTDB_URL };
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
  const dbUrl = process.env.FIREBASE_DATABASE_URL || RTDB_URL;
  console.log('[firebase] RTDB REST mode:', dbUrl);
  if (svc) {
    try {
      admin = require('firebase-admin');
      const cred = JSON.parse(Buffer.from(svc, 'base64').toString('utf8'));
      if (!admin.apps.length) {
        admin.initializeApp({ credential: admin.credential.cert(cred), databaseURL: dbUrl || undefined });
      }
      firestore = admin.firestore();
      rtdb = dbUrl ? admin.database() : null;
      console.log('[firebase] Admin SDK initialized firestore' + (rtdb ? ' + rtdb' : ''));
    } catch (e) {
      console.warn('[firebase] Admin init failed, using REST:', e.message);
    }
  }
  return { firestore, rtdb, rtdbUrl: RTDB_URL, rtdbPut, rtdbPost };
}

async function mirrorToFirebase(collection, docId, data) {
  const payload = { ...data, _syncedAt: new Date().toISOString() };
  await rtdbPut(`${collection}/${docId}`, payload);
  const { firestore: fs, rtdb: db } = initFirebase();
  try {
    if (fs) await fs.collection(collection).doc(String(docId)).set(payload, { merge: true });
    if (db) await db.ref(`${collection}/${docId}`).set(payload);
  } catch {}
}

async function pushTelemetryRealtime(hiveCode, point) {
  const payload = { ...point, _ts: new Date().toISOString() };
  await rtdbPost(`telemetry/${hiveCode}`, payload);
  await rtdbPut(`hives/${hiveCode}/lastTelemetry`, point);
  const { firestore: fs, rtdb: db } = initFirebase();
  try {
    if (fs) {
      await fs.collection('hive_telemetry').add({ hiveCode, ...point, _ts: new Date().toISOString() });
      await fs.collection('hives').doc(hiveCode).set({ lastTelemetry: point, updatedAt: new Date().toISOString() }, { merge: true });
    }
    if (db) {
      await db.ref(`telemetry/${hiveCode}`).push({ ...point, ts: Date.now() });
      await db.ref(`hives/${hiveCode}/lastTelemetry`).set(point);
    }
  } catch {}
}

module.exports = { initFirebase, mirrorToFirebase, pushTelemetryRealtime, rtdbPut, rtdbPost, RTDB_URL };
