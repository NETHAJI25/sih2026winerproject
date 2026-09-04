# 03 IoT Telemetry Proof — Hive Monitoring
**Tables:** `api/migrations/003_hive_telemetry.sql` — hives, hive_telemetry (temp_c, humidity_pct, weight_kg, sound_db, sound_freq_hz, battery_pct, ts), hive_inspections.

**API:**
- `POST /api/telemetry/ingest` — healthClassify 32-37C, 50-75% etc → alerts hive_health; mirrors to RTDB `telemetry/{hiveCode}`
- `GET /api/telemetry/:hiveCode?limit=50` — postgres or firebase-rtdb fallback
- `GET /api/hives` — last_reading + reading_count

**Live Checks (running 2026-09-03 16:26):**
```bash
curl -X POST http://localhost:4000/api/telemetry/ingest -d '{"hiveCode":"HIVE-KVIC-001","tempC":34.5,"humidityPct":62,"weightKg":28.5,"soundDb":62}'
# {"inserted":[...healthScore 100 healthy...],"count":1}
curl https://sih2026-b9ef7-default-rtdb.firebaseio.com/telemetry/HIVE-KVIC-001.json | jq
# {"-P0c...":{"temp_c":34.5,"healthStatus":"healthy",...}}
curl http://localhost:4000/api/telemetry/HIVE-KVIC-001?limit=3
# {"source":"firebase-rtdb","count":3,"stats":{"avgTemp":34.1...}}
node seed/hive_simulator.js # tick every 12s HIVE-KVIC-00[1-4] ok
```

**Dashboard:** `web/src/pages/console/HiveMonitor.jsx` — LineChart temp/hum/weight 50 pts, colony health card, YieldWidget, /console/hives

**Significance:** Solves lack of advanced hive management (PS gap 0→100%); environmental monitoring + productivity, KVIC toolkit upgraded to smart beekeeping.

**Simulator log:** `/tmp/sim.log` 4 hives every 12s, RTDB telemetry.json growing.
