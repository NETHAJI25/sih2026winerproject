# HoneyChain SIH26021 — Portal & Architecture Audit (proof/PORTAL_AUDIT.md)

**PS:** SIH26021 — Ministry of MSME — Blockchain-based Honey Traceability (Software) — Extend Madhukranti (NBB/NBHM) from registry to retail shelf.
**Team:** Vibranium 2026 — `teamvibranium2026/honeychain` — `web` + `api` + `chain` + `ai` + `iot` + `k8s`
**Date:** 2026-09-04
**Fix scope of this audit:** LabPortal queue (Task 1) · Farmer IoT+AI panel (Task 2) · Full audit + build verify (Task 3)

---

## 1) Architecture — Text Diagram (Blockchain → API → RTDB → AI → IoT → Web/App)

```
                         ┌─────────────────────────────────────────────┐
                         │  Polygon Amoy · HoneyChain.sol              │
                         │  createBatch / transfer / quality / package │
                         │  certHash + testerPhoto · txHash immutable  │
                         └──────────────┬──────────────────────────────┘
                                        │ ethers / hardhat deploy
                                        ▼
┌──────────┐  HTTPS   ┌──────────────────┐  REST+Firebase Admin  ┌─────────────────────┐  WebSocket/REST  ┌──────────────┐
│  Web/App │◄────────►│  API (Node/Express │◄───────────────────►│  Firebase RTDB      │◄────────────────►│  IoT Sim/HW  │
│  Vite+PWA│  /api/*  │  /api/hives,/tele │  realtime sync       │  /batches · /hives  │  POST /telemetry │
│  8 portals│          │  /batches,/quality│                     │  /telemetry · /trans│  every 12s       │
└────┬─────┘          └──────┬───────────┘                      └──────────┬──────────┘                  └──────┬───────┘
     │                       │  POST /colony-health                  │  rtb.* (lib/rtb.js)               │
     │                       ▼                                       │  rtbCreateBatch / rtbListBatches   │
     │              ┌─────────────────┐  Flask :8001                 │                                    │
     └─────────────►│  AI (FastAPI)   │◄────────────────────────────┘                                    │
                    │  RandomForest 12k Kaggle │  95.56% acc (varroa_mite.csv + hive_monitoring)         │
                    │  /colony-health · /disease · /productivity · /anomaly                             │
                    └─────────────────┴──────────────────────────────────────────────────────────────────┘
     Verifiable loop:  IoT (DHT22+HX711+mic) → API → RTDB → AI → Web (HiveMonitor chart 5s poll) → QR → Consumer verify → Blockchain explorer
     Offline: Farmer PWA caches harvest → sync on online (RTDB).  Packaging lab-gate: GET /batches?status=PASS — fail never reaches QR.
     Scale: Docker-Compose (api+ai+postgres) + k8s (api-deployment.yaml, ai-deployment.yaml, postgres-stateful, ingress.yaml) + Vercel (web) + Polygon.
```

**Flow per PS 3 bullets:**
- **Blockchain+QR:** `chain/contracts/HoneyChain.sol` → `api/src/routes/*` (chain, batches, transfers, quality, packages, public) → `web/src/pages/packaging/*` (QRCodeSVG locked payload `https://…/verify/{batch}?lot=`) → `web/src/pages/ConsumerPortal.jsx` (verify + TrustBadge + OSM + jsPDF cert) + `web/src/pages/console/Explorer.jsx`
- **IoT+AI:** `seed/hive_simulator.js` + `api/src/routes/hives.js,telemetry.js` → RTDB `/telemetry/{hive_code}` → `ai/main.py` (colony_health, disease seasonal, productivity flora×health) → `web/src/pages/console/HiveMonitor.jsx` (recharts, 5s poll) → **now also** FarmerDashboard top cards + LabPanel IoT+AI link (Tasks 1-2) + Home IoT section
- **Scalable deployment:** `docker-compose.yml` + `k8s/*` + `chain/hardhat.config.js` (Amoy) + `web/vercel.json` + `vite-plugin-pwa` (offline)

---

## 2) Portal Audit Table — Should vs Has vs Gap vs Fix

| Portal | Should Have (per PS “expected solution”) | Has (in repo) | Gap (before fix) | Fix (this patch) |
|---|---|---|---|---|
| **Home (`/` Home.jsx)** | Story hero (hive→home), 5-step HowItWorks, Who Uses 6 roles, stats, blockchain why, IoT teaser, MSME footer | ✅ Has all; IoT section already added (`New · IoT + AI Smart Beekeeping` with 3 cards + links to /console/hives and localhost:8001) | None | No change — reference portal |
| **Farmer (`/farmer` FarmerDashboard.jsx)** | 5-step New Harvest (apiary→species→flora→weight/photo/video→review RTDB), dashboard stats, Apiary Map (Leaflet), offline notice, batches/reports/alerts | ✅ Has 5-step + RTDB `rtbCreateBatch`, stats, map, flora/species. No IoT live teaser on dashboard | **Missing IoT+AI visible summary** — PS bullet 2 (IoT+AI disease/productivity) was only in Home + console/hives; farmer judges miss link | **Fixed Task 2:** Added top dashboard section (below stats, above Apiary Map) `border-2 amber-300 bg-amber-50` with 3 cards: Hive Health 32-37°C healthy → /console/hives, Disease Forecast varroa/foulbrood → http://localhost:8001/disease, Productivity 22kg → http://localhost:8001/productivity — obvious for judges, static demo + live hints |
| **Transport (`/transport` TransportPortal.jsx)** | Geo-assigned pickups nearest-first, Route Map Leaflet + OSM pins, Active Trip 3-step (Scan QR→Confirm Pickup pickupWt+photo+GPS+3% variance→Deliver seal), History immutable log | ✅ Has: sorted by distance, Leaflet placeholder + Google Maps external pin (no turn-by-turn), QR scan, variance 3%/6%, GPS pin, photo capture, variance flag `POST /transfers` style | None (spec says “No full turn-by-turn navigation · external Maps only”) — intentionally minimal | No code change — verified balanced JSX |
| **Lab (`/lab` LabPortal.jsx)** | NABL dashboard, FIFO queue, IS 4941 6 params (moisture/hmf/diastase/sucrose/c3/c4) with verdict PASS/FAIL/pending, receiving weight vs transport diff, seal photo, storage temp, cert PDF hash, officer photo+signature, chain anchoring block #1284, Completed/Rejected archive with search | ✅ Had FIFO queue oldest→newest + full Test Form (4 steps) + verdict chip + certHash; but FIFO was single full-width list, no “New Orders” quick triage, no IoT+AI jump link | **Two gaps:** (1) Demo UX showed only FIFO; evaluators expect both FIFO fairness and newest arrivals side-by-side. (2) IoT+AI not discoverable from Lab (PS bullet 2 cross-link missing). Also JSX tag balance fragile → queue tab could fail to open if unbalanced | **Fixed Task 1:** Replaced single-column queue with `grid lg:grid-cols-3` — Left `lg:col-span-2` = FIFO (oldest first, existing `MOCK_QUEUE` sorted ascending) + Right `lg:col-span-1` = New Orders latest 3 (computed `[...queue].slice().reverse().slice(0,3)` newest first, badge NEW) — both buttons drive same `selected` state (no React state break). Stacks on mobile. Right panel adds IoT+AI Live block: description + CTA `Open HiveMonitor → IoT+AI` → `/console/hives` + Disease/Yield API links. Verified JSX tags balanced (`grid` wrapper closed before `{selBatch &&` block) so queue tab opens |
| **Packaging (`/packaging` PackagingPortal.jsx)** | Only PASS batches (`GET /batches?status=PASS` query-level gate), confirm weight vs transport (±3%/6%), bottle size visual, auto bottleCount, MFG/EXP auto, locked QR+Barcode (QRCodeSVG `origin/verify/{id}?lot=`), fixed fraud-proof label, dispatch → ledger transfer | ✅ Has: `PASS_BATCHES` mock + live RTDB merge `rtbListBatches filter status===tested`, weightCheckText, 4 bottle illus (100ml/250ml/500ml/1kg), weight-checked label, QR locked, expiry `harvest+18m`, gate copy “status = PASS only” | None | No change — verified `qrcode.react` renders, `jsPDF` placeholder for label download |
| **Customer (`/verify/:batchId` + `/customer` — ConsumerPortal.jsx, CustomerHome.jsx)** | Public scan → batch header TrustBadge Verified Pure, farm story + flora/bee images, harvest video, OSM apiary map, `JourneySection` custody hops with txHash shortHash, `LabSection` NMR PASS/FAIL + lab/officer photos + signature + jsPDF report, footer | ✅ Has: `getPublicBatch` fallback to `rtbGetBatch`+`rtbListTransfers`, verified logic `transfers>=2 && NMR passed`, TrustBadge, FarmSection (Mustard flora, mellifera), JourneySection, LabSection with `APEX FOOD TESTING LABS PUNE` mock + Download PDF | None | No change |
| **Admin (`/admin` AdminPortal.jsx)** | Dashboard 4 stats, Combined Activity Log, Donut by status, Fraud Alerts plain language high/medium/low + inKg/outKg/pct impossible increase, Leaflet choropleth Heatmap toggle Production/Alerts + state/flora/date filters, Cluster Onboarding (FPO name/region/contact + CSV bulk invite generating HC-INV- codes), Users role filter | ✅ Has all tabs; fraud demo includes varroa/foulbrood strings; heatmap is CSS grid choropleth placeholder (not real Leaflet geodata) | Minor — Heatmap is demo grid, not real Leaflet tiles with GeoJSON; acceptable for prototype per `proof/06_scalable_deploy_proof.md` | No change — documented as pilot data |
| **Console (`/console` Layout + console/*)** | FPO Console: Dashboard, Batches, Receive, Alerts, Explorer (Polygon tx), Hives (IoT) — shared Layout nav | ✅ `App.jsx` nests `/console` under `Layout`, Explorer shows txHash list, Receive/Batches read RTDB/live API | None | No change |
| **Console/Hives (`/console/hives` HiveMonitor.jsx)** | IoT telemetry table (temp/humidity/weight/sound), AI Colony Health status+confidence+advice+drivers, Live Telemetry last reading, ProductivityEstimate (flora×boxes×health), Recharts LineChart last 50 readings 5s poll, All hives grid, Firebase realtime hint | ✅ Has: `BASE=VITE_API_URL` + `AI=VITE_AI_URL`, `jget /api/hives` fallback demo hives `HIVE-KVIC-001/002`, `jget /api/telemetry/{code}?limit=50` fallback `genDemo`, POST `${AI}/colony-health` fallback advice, `YieldWidget` calls `${AI}/productivity?flora=&boxes=10&season=flow&health_score=`, `health.status` healthy/attention/critical with 32-37°C rule, recharts + liveHint `Firebase realtime ready` | Gap previously was discoverability — only linked from Home nav; now linked from Farmer + Lab panels (Tasks 1-2) making IoT obvious across portals | No code change to HiveMonitor itself — cross-links added elsewhere satisfy PS visibility |

---

## 3) PS 3-Bullet Verification

| PS Bullet | Expected Evidence | Status & Proof Path |
|---|---|---|
| **1. Blockchain + QR traceability (Polygon)** | Smart contract deployed, API anchors hash, packaging generates non-editable QR, consumer scans verified pure | ✅ `chain/contracts/HoneyChain.sol` + `chain/scripts/deploy.js` + `api/src/routes/chain.js,quality.js,packages.js` + `web/src/pages/packaging/PackagingPortal.jsx:132-144` (`origin/verify/{id}?lot=`) + `web/src/pages/ConsumerPortal.jsx` trust logic. Proof: `proof/01_blockchain_proof.md` + `proof/02_qr_traceability_proof.md` |
| **2. IoT + AI smart beekeeping (disease + productivity)** | Sensors stream → RTDB → AI inference (12k real Kaggle, RF 95.56%) → dashboards + alerts | ✅ `seed/hive_simulator.js` (every 12s) → `api/src/routes/telemetry.js,hives.js` → `ai/main.py` (`/colony-health /disease /productivity`, datasets `ai/datasets/kaggle_varroa/*`) + `ai/requirements.txt` + `web/src/pages/console/HiveMonitor.jsx` (5s poll, recharts). New: Farmer top cards + Lab right panel link to `/console/hives` + `http://localhost:8001/*`. Proof: `proof/03_iot_telemetry_proof.md` + `proof/04_ai_ml_proof.md` + `proof/metrics/report.json` 95.56% |
| **3. Scalable deployment (reliable, low-cost)** | Docker, K8s, cloud, PWA offline, Amoy testnet, vercel | ✅ `docker-compose.yml` (api+ai+postgres) + `k8s/api-deployment.yaml,ai-deployment.yaml,postgres-stateful.yaml,ingress.yaml` + `chain/hardhat.config.js` + `web/vercel.json` + `vite-plugin-pwa` + `web/index.html` PWA manifest. Proof: `proof/06_scalable_deploy_proof.md` + `proof/05_firebase_realtime_proof.md` |

---

## 4) What Was Changed This Patch

- **Files edited:**
  - `web/src/pages/lab/LabPortal.jsx` — queue tab: `grid lg:grid-cols-3` (FIFO `lg:col-span-2` + New Orders `lg:col-span-1` latest 3 newest-first `reverse().slice(0,3)`), right panel IoT+AI card with links to `/console/hives`, `http://localhost:8001/disease`, `http://localhost:8001/productivity`; JSX balanced; no state break (`selected` shared).
  - `web/src/pages/farmer/FarmerDashboard.jsx` — dashboard tab: inserted above Apiary Map a `border-2 amber-300` demo section with 3 linked cards (Hive Health 32-37°C → /console/hives, Disease Forecast → /disease API, Productivity 22kg → /productivity API) + live badges.
  - `proof/PORTAL_AUDIT.md` — new (this file).
- **Build verification:** `npm run build` from `web/` must succeed (vite build, no JSX errors). See terminal output.
- **No secret leaks:** Verified `web/src/lib/api.js` and `ai/main.py` use `import.meta.env` placeholders; `.env.example` not committed.

---

## 5) Known Pilot Limitations (honest for judges)

- Leaflet maps are placeholder divs with OSM tile CSS (offline tiles cached notice) — real GPS pins work, but full turn-by-turn is external Google Maps only (Transport intent).
- Lab `MOCK_QUEUE` is in-memory demo; RTDB live batches via `rtbListBatches` exist but lab flow uses mocks for deterministic FIFO demo.
- Varroa images datasets are Kaggle CSV demos (12k rows) — not live hive camera inference; model is RF not CV.
- Rejected batches blocked at Packaging query level (in-code filter), blockchain flag is mock `block #1284`.

---

## 6) Quick Judge Click Path (60s)

1. `/` → scroll to `IoT + AI Smart Beekeeping` → `Open Hive Monitor` → `/console/hives` (chart + AI health)
2. `/farmer` Dashboard → top amber IoT cards (click any 3) → console/hives or AI JSON
3. `/lab` → `Testing Queue` → see side-by-side FIFO left / New Orders right (desktop) / stacked mobile → right panel `Open HiveMonitor → IoT+AI`
4. `/packaging` → Incoming (PASS only) → Form → Generate QR → open `verify/B-1042`
5. `/verify/B-1042` → TrustBadge Verified Pure → Journey txHash → Lab Report PDF

---
*Generated by audit script — matches SIH26021 expected solution checklist.*

