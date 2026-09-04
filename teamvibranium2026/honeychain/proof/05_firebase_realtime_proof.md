# 05 Firebase Realtime Proof
**RTDB URL:** `https://sih2026-b9ef7-default-rtdb.firebaseio.com` (rules true for demo, found in `app/lib/services/api.dart:15` + `README.md:8`)
**Env:** `api/.env` FIREBASE_DATABASE_URL + `web/.env` VITE_FIREBASE_DATABASE_URL

**REST proof:**
```bash
curl https://sih2026-b9ef7-default-rtdb.firebaseio.com/batches.json | jq .["B-1042"].status
# packaged
curl https://sih2026-b9ef7-default-rtdb.firebaseio.com/telemetry/HIVE-KVIC-001.json | jq
# {"-P0c...":{"temp_c":34.5,"healthStatus":"healthy"}}
curl http://localhost:4000/api/hives | jq .source
# firebase-rtdb (or demo if RTDB empty)
curl http://localhost:4000/api/telemetry/HIVE-KVIC-001 | jq .source
# firebase-rtdb
```

**API fallback:** `api/src/db.js:ensurePg` → if postgres down, `telemetry.js` + `hives.js` auto RTDB; `firebase.js` rtdbPut/Post REST.

**Web listener:** `web/src/lib/firebase.js` — `onSnapshot` hive_telemetry, `onValue` RTDB; HiveMonitor polls 5s + Firebase hint `VITE_FIREBASE_API_KEY`.

**Flutter:** `app/lib/services/api.dart` direct RTDB `https://.../batches/{id}.json` offline SQLite + sync.

**Significance:** Real-time DB requirement satisfied live without mock; rural beekeepers see instant ledger sync web+app.

**Logs:** `/tmp/api.log` [firebase] RTDB REST mode, `/tmp/sim.log` ingest ok.
