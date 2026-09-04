import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { getDatabase, ref, onValue } from 'firebase/database';

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null; let fs = null; let rdb = null;
export function getFirebase() {
  if (!cfg.apiKey || !cfg.projectId) return { app: null, fs: null, rdb: null };
  if (!getApps().length) app = initializeApp(cfg); else app = getApps()[0];
  try { fs = getFirestore(app); } catch {}
  try { if (cfg.databaseURL) rdb = getDatabase(app); } catch {}
  return { app, fs, rdb };
}
export function subscribeTelemetry(hiveCode, cb) {
  const { fs: f, rdb: d } = getFirebase();
  if (!f && !d) return () => {};
  if (f) {
    const q = query(collection(f, 'hive_telemetry'), orderBy('_ts', 'desc'), limit(50));
    return onSnapshot(q, (snap) => {
      const rows = snap.docs.map((doc) => doc.data()).filter((r) => !hiveCode || r.hiveCode === hiveCode);
      cb(rows);
    });
  }
  if (d) {
    const r = ref(d, `telemetry/${hiveCode}`);
    return onValue(r, (snap) => cb(snap.val() ? Object.values(snap.val()) : []));
  }
  return () => {};
}
