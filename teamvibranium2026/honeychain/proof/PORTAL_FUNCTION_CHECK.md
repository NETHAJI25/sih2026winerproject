# Portal Function Check — SIH26021 HoneyChain (Team Vibranium 2026)
*Date: 2026-09-04 · Build: `npm run build` ✅ (1243 modules, 404 kB gzip) · RTDB live: 14 batches, 4 hives with telemetry*

## Build & Runtime Evidence
| Check | Result | Evidence |
|-------|--------|----------|
| `npm run build` web | ✅ PASS | `vite v5.4.21 building ... 1243 modules → dist 404 kB gzip + PWA precache 28 entries` |
| Broken imports | ✅ none | Build succeeded; no missing `qrcode.react / jspdf / recharts / firebase` |
| RTDB batches | ✅ LIVE | `fetch https://sih2026-b9ef7-default-rtdb.firebaseio.com/batches.json → 14 keys: B-1027,B-1038,B-1042,… payload {id,status,weightKg,apiary,farmer}` |
| RTDB telemetry | ✅ LIVE | `fetch .../telemetry.json → HIVE-KVIC-001..004 ; sample {temp_c:34.5,humidity:62,weight_kg:28.5,healthScore:100,ts:2026-09-03T16:23:58Z}` |
| RTDB write path | ✅ verified | `web/src/lib/rtb.js:8-14 rtbCreateBatch → PUT batches/{id} + transfers/{id}/init + alerts/{id}_pickup` fired from FarmerDashboard |

## Master Table — Portal | Function (Should-have per SIH26021) | Status | Evidence (file:line + rtb/API) | Missing/Broken | Tested

### 1 — Farmer Portal — Harvest 5 steps, offline-first, RTDB direct
| Function | Status | Evidence | Missing/Broken |
|----------|--------|----------|----------------|
| 5-step wizard Apiary→Species→Flora→Details→Review | ✅ | `FarmerDashboard.jsx:40 tab/harvest, 192-295 step state 1..5 stepper + Continue/Back` | — |
| Choose Apiary (GPS thumb, register new apiary with auto GPS) | ✅ | `FarmerDashboard.jsx:33 initialApiaries, 146-172 Register New Hive/Apiary form, 170 navigator.geolocation, 44 newApi state` | Persist is in-memory only (not RTDB hives); acceptable demo |
| Bee species (cerana/mellifera/dorsata/florea/trigona with images) | ✅ | `FarmerDashboard.jsx:16 species[], 218-231 species grid buttons, 46 bee state` | — |
| Flora source 8 types with honey swatch + images | ✅ | `FarmerDashboard.jsx:23 flora[], 234-246 flora grid img+swatch, 47 flower state` | — |
| Weight stepper + harvest date + photo/video placeholders (hash on-chain bulk off-chain note) | ✅ | `FarmerDashboard.jsx:48-49 weight/date, 254-275 Step 4: weight +/- 0.5, date input, ICamera/IVideo blocks` | Photo/video are placeholders (no upload/hash yet) — demo-level; not broken |
| Review & Submit → RTDB direct (pickup alert to Lab) | ✅ | `FarmerDashboard.jsx:286-288 rtbCreateBatch({id:B-xxx, flora, beeSpecies, weightKg, harvestDate, apiary, geo, status:created})` | — |
| Dashboard KPIs (Total harvested 342kg, verified 28, pending 3 + trend SVG) | ✅ | `FarmerDashboard.jsx:53-118 KPI cards` | Mock numbers (not aggregated) |
| Apiary Map (Leaflet thumb placeholder) | ✅ | `FarmerDashboard.jsx:146-160 map thumbs` | Real Leaflet tiles not mounted (placeholder) — not critical |
| IoT+AI live cards linking to HiveMonitor / disease / productivity API | ✅ | `FarmerDashboard.jsx:120-143 3 cards href /console/hives + http://localhost:8001/disease + /productivity` | Requires AI service on 8001; fallback shows demo |
| Reports (filter tested/packaged batches + jsPDF certificate download) | ✅ | `FarmerDashboard.jsx:52 rtbListBatches filtered status tested/packaged, 298-302 jsPDF Harvest Certificate` | — |
| Batches/Alerts tabs | ✅ | `FarmerDashboard.jsx:297-304 mocked lists` | — |
| RTB wiring | ✅ | `FarmerDashboard.jsx:2 rtbCreateBatch, rtbListBatches; rtb.js:8-15 PUT batches/{id}` | — |
| Offline-ready note | ✅ | `FarmerDashboard.jsx:85 Offline ready — auto-syncs when online` (UI note) | PWA precache enabled (`vite-plugin-pwa` dist/sw.js 3746 KiB) — service-worker present |

**Verdict: ✅ Complete — no critical broken. Minor: photo hashing + real Leaflet are placeholders.**

### 2 — Transport Portal — Pickup + 3-step verified handoff
| Function | Status | Evidence | Missing/Broken |
|----------|--------|----------|----------------|
| Dashboard: pickups today / completed week / distance + route map + queue | ✅ | `TransportPortal.jsx:48-214 sorted nearest, 175 map SVG with 4 pins + dashed path + You dot, 202 queue list` | Map is styled div/SVG placeholder, not real Leaflet map instance |
| Assigned Pickups sorted nearest-first + expected kg + GPS + Start Trip + Open in Maps | ✅ | `TransportPortal.jsx:46 sorted, 225-244 card: distance badge, expected, harvest, lat/lng, 239 startTrip, 240 google maps link` | — |
| Active Trip Step 1 Scan QR (verify harvest weight) | ✅ | `TransportPortal.jsx:274-299 scanId/scanFound, doScan() matches PICKUPS/assigned, 283-298 QR frame + batch detail` | Uses mock `PICKUPS[]` (4 hard-coded), not `rtbListBatches` / API |
| Step 2 Confirm Pickup: pickup weight vs harvest weight ±3% variance, photo capture, GPS pin hash | ✅ | `TransportPortal.jsx:75-92 pct=(v-e)/e*100 warnOver>3%, 307-345 variance badge, 327 filePickupRef+URL.createObjectURL, 335 gps 13.0827,80.2707 + confirmPickup→trip.step3` | No `rtbAddTransfer` / `POST /transfers` call — `confirmPickup` creates local `pickupRec` only, then `confirmDelivery` pushes to local `history` and `assigned.filter` |
| Step 3 Delivery to Lab: delivery weight + seal photo + Δ vs pickup | ✅ | `TransportPortal.jsx:349-364 deliveryWt/sealPhoto, 363 Δ calc, 364 Confirm Delivery→History` | Same — local state only |
| History: search by batch/farmer, immutable log table | ✅ | `TransportPortal.jsx:103 filteredHist, 372-403 table Batch/Farmer/Village/In/Out/Date/Status` | Persists only in-memory (HIST_INIT + added) |
| RTB/API wiring | ❌ Missing | No import from `../../lib/rtb` or `api.js` | **Critical gap for full chain trace**: should call `rtbAddTransfer(batchId,{nextStatus,inTransit, geo})` on pickup/delivery to anchor transfers + trigger `transfers.js:checkAnomaly` AI dilution flag |

**Verdict: ⚠️ UI flow fully working for judge demo, but NOT wired to RTDB/API → transfers not persisted, no real chain txHash. Fix 2 lines: import `rtbAddTransfer` and call on confirmPickup/confirmDelivery.**

### 3 — Lab Portal — IS 4941 6 params + PASS/FAIL gate + certificate hash
| Function | Status | Evidence | Missing/Broken |
|----------|--------|----------|----------------|
| Dashboard metrics (pending FIFO oldest, completed today, pass rate 6 params, 14-day bar, queue health, recent verdicts) | ✅ | `LabPortal.jsx:153-294 pendingCount, completedToday, passRate, barData 14, Queue Health cards` | — |
| Testing Queue FIFO oldest-first + New Orders latest-3 panel (both drive shared `selected`) | ✅ | `LabPortal.jsx:21 MOCK_QUEUE sorted arrivedAt, 299-363 FIFO list + reverse 3 newest + 349 IoT+AI links` | Uses mock queue (5) + completed/rejected mocks (4+2); not `rtbListBatches(status=at_lab)` |
| Receiving & Physical: receiving weight vs transport weight ±3% tolerance + wastage auto, seal photo, storage temp, batch age/harvest | ✅ | `LabPortal.jsx:369-395 weightDiff diff/pct/wastage,  63 receivingWeight/sealPhoto/temp state, 381 seal upload preview` | — |
| 6 IS 4941 params with per-field limit + red/green validation (moisture ≤20%, HMF ≤80, diastase ≥3, sucrose ≤5%, C3 Δ≤1.0‰, C4 ≤7%) | ✅ | `LabPortal.jsx:6 RANGES 6 entries, 398-415 grid 6 inputs with state neutral/ok/fail, 136 verdict logic v() max/min` | — |
| Verdict auto PASS/FAIL/PENDING + reasons list (blocks Submit on FAIL) | ✅ | `LabPortal.jsx:136-151 verdict {isPass,isFail,reasons,incomplete}, 419-432 FAIL red / PASS emerald card + reasons ul` | Correct — meets IS 4941:2018 + NMR C3/C4 |
| Certification: lab PDF upload (certHash), officer photo/name/designation, mouse/touch signature canvas | ✅ | `LabPortal.jsx:69 pdfFile/officerPhoto, 97-120 canvas mousedown/mousemove/touch, 434-469 Certification section` | — |
| Submit PASS → generate cert + chain anchor + release to Packaging only on PASS; Move to Rejected blocked from packaging | ✅ | `LabPortal.jsx:165 canSubmit = verdict.isPass+receivingWeight+sealPhoto+temp+pdfFile+officerPhoto+hasSignature, 167 handleSubmit pushes to completed+queue.filter+toast hashed on-chain, 180 handleReject pushes to rejected, 517 Rejected table note "Blocked from packaging — query-level enforcement"` | `handleSubmit/handleReject` push to local `completed/rejected` arrays + toast only; no `rtbAddQuality` / `POST /quality` (quality.js:36 requires certificateHash+testerPhotoHash+testType) — chain tx not actually minted |
| Completed/Rejected archive searchable | ✅ | `LabPortal.jsx:190 filteredCompleted search, 484-536 tables with cert hash` | — |
| RTB/API wiring | ❌ Missing (mock) | No `rtb*` import | **Gap**: should POST to `/api/quality` and `rtbAddQuality` + `quality/receive|process` |

**Verdict: ✅ All 6 IS 4941 params + verdict + cert gate functionally correct for demo; ⚠️ chain anchoring is simulated (local state), not real POST.**

### 4 — Packaging Portal — PASS gate + bottle + QR lock
| Function | Status | Evidence | Missing/Broken |
|----------|--------|----------|----------------|
| Dashboard: incoming today, bottles/week, ready to dispatch, eligibility gate note `GET /api/batches?status=PASS` | ✅ | `PackagingPortal.jsx:123-134 incomingToday, bottlesWeek, ready, 228 GET /api/batches?status=PASS note` | — |
| Incoming — Only PASS batches (query-level gate, flagged/pending excluded) | ✅ | `PackagingPortal.jsx:8 PASS_BATCHES 5, 77-86 rtbListBatches filter status==='tested' merges live, 254-281 filteredIncoming cards PASS badge, hint "Excluded B-2001 FAIL,B-1015 pending"` | Correct gate; live merge caps 20 |
| Confirm weight: transport/lab ref vs confirmed weight ±3% + weight-check math | ✅ | `PackagingPortal.jsx:89 confirmedWeight, 108 weightDiff pct, 296-311 Confirm Weight section + 309 weightCheckText` | — |
| Bottle size visual selection (100ml/250ml/500ml/1kg) + auto bottleCount = weight*1000/grams editable | ✅ | `PackagingPortal.jsx:16 SIZES 4, 32 BottleIllus SVG, 314-341 grid 4 bottles + auto count useEffect 101-105, 335 count math` | — |
| MFG/Harvest + shelf life 12/18/24 → auto expiry addMonths | ✅ | `PackagingPortal.jsx:67 addMonths, 93 mfgDate, 94 shelfLife 18, 107 expiry, 343-355 Mfg & Expiry section` | — |
| QR+Barcode locked (no manual edit) bound to batch+flora+honeyType+bottle+dates+lotHash | ✅ | `PackagingPortal.jsx:46 QrPlaceholder QRCodeSVG level M, 59 Barcode, 127-145 handleGenerate origin + qrData /verify/B-id?lot=&exp= + lotHash, 358-389 Locked payload vs dummy` | QR payload is local; real `POST /packages` (`api/src/routes/packages.js:19`) not called — `chain.recordMint` + `INSERT packages` + `UPDATE batches packaged` skipped |
| Label preview fraud-proof fixed fields + download mock PDF + dispatch (ledger transfer) | ✅ | `PackagingPortal.jsx:392-425 Label Preview max-w 360px + fixed fields Batch/NetWeight/Mfg/Expiry/Origin/FSSAI+QR+barcode+lotHash, 149 handleDownload Blob, 157 handleDispatch push dispatched` | Download is text Blob (not real rendered label); dispatch is local array, not chain tx |
| Search/filter | ✅ | Cards selectable via `selected` + `setTab form` | — |
| RTB wiring | ⚠️ Partial | `PackagingPortal.jsx:3 rtbListBatches` for intake only | No `rtbAddPackage` / `POST /packages` |

**Verdict: ✅ PASS gate + weight plausibility + fraud-proof QR flow fully demonstrated; ⚠️ persistence is local (should call `rtbAddPackage` + `POST /packages` on Mark Dispatched; one-line fix).**

### 5 — Customer Portal (CustomerHome + ConsumerPortal) — Scan / Verify / Report
| Function | Status | Evidence | Missing/Broken |
|----------|--------|----------|----------------|
| CustomerHome: Scan QR via camera file capture (environment) + View demo B-1042 | ✅ | `CustomerHome.jsx:4 startScan mediaDevices, 19 file capture="environment", 22 demo link /verify/B-1042` | Decode not implemented — `alert demo would decode to /verify/B-1042`; acceptable fallback; real decode would use jsQR/html5-qrcode |
| Report Issue with proofs (photo/video+bill) → RTDB /reports | ✅ | `CustomerHome.jsx:28 form batch/type/desc/proof multiple, alert "stored to RTDB /reports"` | Form does `alert` only, not actual `PUT /reports` — needs `rtb put reports` |
| Customer Care contact | ✅ | `CustomerHome.jsx:37 nethajiramesh25@gmail.com + FPO helpline, mailto` | — |
| ConsumerPortal: getPublicBatch → fallback rtbGetBatch+rtbListTransfers, loading skeleton vs not-found | ✅ | `ConsumerPortal.jsx:143 batchId useParams, 147 getPublicBatch.then rtbGetBatch fallback, 161-191 loading + not-found → /b/B-1042` | — |
| Verified Pure badge logic (status!=flagged + ≥2 transfers + NMR PASS) | ✅ | `ConsumerPortal.jsx:193 verified = status!=='flagged' && transfers.length>=2 && qualityRecords.some(NMR passed)` | — |
| Farm section (farmer avatar initials, story, 3 images, harvest video /hero.mp4, apiary OSM pin) | ✅ | `ConsumerPortal.jsx:40 FarmSection initials, 53-67 images+video+OSM url mlats` | — |
| Journey lineage (ol step 1..n with from→to, kg, date, geo, tx shortHash) | ✅ | `ConsumerPortal.jsx:71 JourneySection map transfers, 92 shortHash` | — |
| Lab certificate with lab/officer/signature images + certificateHash + Download Lab Report PDF (jsPDF NABL-style) | ✅ | `ConsumerPortal.jsx:101 LabSection, 102 downloadReport jsPDF APEX FOOD TESTING + params + blockchain line` | — |
| Navigation Scan/Report/Care | ✅ | `ConsumerPortal.jsx:235 links /customer, /customer/report` | — |
| RTB/API wiring | ✅ | `ConsumerPortal.jsx:3 getPublicBatch from lib/api, 4 rtbGetBatch,rtbListTransfers. api.js:78 getPublicBatch → /api/public/batches/:id fallback demoBatches . rtb.js:16-17 rtbGetBatch/rtbListBatches fetch batches.json, 21 rtbListTransfers transfers/{id}` | Public endpoint fallback works without backend |

**Verdict: ✅ Complete end-to-end verify flow; Report submit is demo-alert not persisted.**

### 6 — Admin Portal — Heatmap / Fraud / FPO scale
| Function | Status | Evidence | Missing/Broken |
|----------|--------|----------|----------------|
| Dashboard KPIs farmers 1284/batches 342/open alerts/states 4 + combined activity log timeline + donut batches by status | ✅ | `AdminPortal.jsx:50 stats, 51 activity 5, 58 donut 5 statuses conic-gradient, 137-182 dashboard grid` | Mock stats (demo) — not live from DB |
| Fraud Alerts: severity high/medium/low with inKg/outKg + pct + dilution msg + View Batch + Mark Reviewed | ✅ | `AdminPortal.jsx:14 FRAUD_INIT 4 with inKg/outKg/pct/msg, 69 filteredFrauds, 192-214 fraud cards + 72 markReviewed` | Local state, not `GET /api/alerts` |
| Heatmap choropleth production/alerts toggle + filters state/flora/date + district tiles 6 | ✅ | `AdminPortal.jsx:42 heatMode,43-46 fState/flora/date, 220-267 production red vs alerts emerald tiles + Leaflet note, 260 legend` | Mock grid div, not Leaflet `L.choropleth` real map; filter does not actually query |
| Cluster onboarding: Add FPO (HC-FPO-REG-2026-001) + CSV bulk invite generates HC-INV-xxxx codes + copy | ✅ | `AdminPortal.jsx:38 CLUSTERS_INIT 2, 73 addCluster code HC-FPO-..., 80 handleCsv FileReader → HC-INV-..., 270-318 cluster form+table` | Local only, not `POST /clusters` |
| Users: role filter all/farmer/transport/lab/packaging/admin + search + count | ✅ | `AdminPortal.jsx:21 USERS_INIT 6, 70 filteredUsers role+qUser, 322-349 table` | Mock, not `GET /actors` (`api/src/routes/actors.js`) |

**Verdict: ✅ All admin views present per SIH26021; ⚠️ all are mock in-memory — real wiring would be 3 API calls to `/api/alerts`, `/api/batches?status`, `/api/actors`.**

### 7 — Console (HiveMonitor + Dashboard + Batches + Alerts + Explorer + Receive) — Hives IoT AI
| Function | Status | Evidence | Missing/Broken |
|----------|--------|----------|----------------|
| Console Dashboard: Total batches / Flagged / Open alerts / Ledger transfers + flora bar + recent alerts (3) | ✅ | `Dashboard.jsx:22 Promise.all getBatches/getAlerts/getChainStatus, 61 StatCard 4, 82 BarChart flora, 109 recentAlerts 3` | Uses `lib/api` with 3.5s timeout fallback to demoData — live when API up |
| Batches: searchable grouped by STATUS_ORDER 6, card per batch, drawer with apiary/farmer/transfers+tx etherscan + qualityRecords | ✅ | `Batches.jsx:5 STATUS_ORDER,135 filtered q,142 grouped, 173 StatusChip, 19 BatchDetailDrawer transfers map + quality` | — |
| Alerts console (dilution payload 4kg→6kg viz, severity colors, acknowledge posts) | ✅ | `Alerts.jsx:16 DilutionPayload, 51 getAlerts sorted acknowledged, 63 ackAlert, 85 openCount badge` | — |
| Explorer ledger (block height, recent transfers, tx feed 15, mock-mode banner, etherscan link) | ✅ | `Explorer.jsx:14 getChainStatus+batches flatMap transfers feed 15, 25 mockNote chain.connected===mock-mode, 45 StatCard 3` | — |
| Receive batch (expected vs actual weight ±0.5kg, mismatch warn, Confirm Receive toast) | ✅ | `Receive.jsx:12 getBatches,20 expected/parsed diff mismatch>0.5, 91 actual input, 91 mismatch red card, 26 confirm toast` | Local demo — not `POST /transfers` |
| HiveMonitor: hives list, select, telemetry chart (temp/hum/weight) last 50, Live Telemetry 3 values+sound, Colony Health via AI, Productivity estimate, all hives grid | ✅ | `HiveMonitor.jsx:1 recharts LineChart, 5 BASE/AI env, 19 jget /api/hives, 31 load /api/telemetry/{code}?limit=50, 39 POST AI/colony-health {temp_c,humidity,weight,sound,varroa,brood}, 49 chartData, 74 health drivers, 121 YieldWidget fetch AI/productivity?flora=&boxes=10&season=flow&health_score=` | Live: polls every 5s; fallbacks genDemo if API offline |
| Live hint Firebase realtime ready vs REST polling | ✅ | `HiveMonitor.jsx:24 fbKey hint, 16 liveHint` | `firebase.js:21 subscribeTelemetry` exists but HiveMonitor uses REST polling `jget` instead of `subscribeTelemetry` — realtime path is available but not used (could be wired) |
| AI classification healthScore | ✅ | `HiveMonitor.jsx:39 health status/confidence/advice + 50 statusColor healthy/attention/critical; ` + `api/src/routes/telemetry.js:8 classifyHealth t 32-37 hum 40-80 sound>75 weight<10` + `maybeAlert hive_health` | — |
| RTDB/Firebase wiring (`lib/rtb.js` + `lib/firebase.js`) | ✅ | `rtb.js:1 BASE https://sih2026... ,16 rtbListBatches,17 rtbListTransfers,22 rtbOnValue polling; firebase.js:14 getFirebase cfg from VITE_FIREBASE_*, 21 subscribeTelemetry hive_telemetry query` | Firebase env not set → REST polling; config present via `firebase.js` ready when keys added |
| API routes health (hives, telemetry) | ✅ | `api/src/routes/hives.js:8 GET /hives with postgres or firebase-rtdb demo fallback, 46 POST /hives mirrorToFirebase ; telemetry.js:28 POST /telemetry/ingest classifyHealth+maybeAlert+pushTelemetryRealtime, 59 GET /:hiveCode 50 limit + stats avgTemp/Hum/Weight; : 96 GET / summary` | Verified running fallback demo (HiveMonitor shows HIVE-KVIC-001..003) |

**Verdict: ✅ Console fully working — Hives IoT AI is the strongest area; only polish: HiveMonitor could swap 5s poll for `subscribeTelemetry` when Firebase keys set.**

### 8 — Shared libs & Chain routes
| Lib/Route | Status | Evidence |
|-----------|--------|----------|
| `web/src/lib/rtb.js` (26 lines) | ✅ | `rtbCreateBatch, rtbGetBatch, rtbListBatches, rtbAddTransfer, rtbAddQuality, rtbAddPackage, rtbListTransfers, rtbOnValue` — BASE fixed, REST JSON |
| `web/src/lib/api.js` (107 lines) | ✅ | `BASE VITE_API_URL 4000 TIMEOUT 3500 mode demo/live listeners, fetchJson AbortController, request fallback clone(demoBatches), getBatches/getAlerts/getChainStatus/getPublicBatch/getHives/getTelemetry/ingestTelemetry/getColonyHealth AI` — graceful degrade |
| `web/src/lib/firebase.js` (36 lines) | ✅ | `initializeApp getFirestore getDatabase, getFirebase returns {app,fs,rdb} when VITE_FIREBASE keys else null, subscribeTelemetry onSnapshot hive_telemetry or onValue telemetry/{code}` |
| `api/src/routes/batches.js` | ✅ | `POST /batches requireAuth createOne (photo_hash, flora_type, chain.recordBatch, transfers, alerts pickup_request) + GET ?status/apiary/q (WHERE conds)` |
| `api/src/routes/hives.js` | ✅ | `GET / hives JOIN apiaries+actors+last_reading+count → fallback fetch RTDB /hives.json → demo 3 hives ; POST / mirrorToFirebase ; POST /:code/inspect` |
| `api/src/routes/telemetry.js` | ✅ | `classifyHealth + maybeAlert + POST /ingest bulk classify+pushRealtime + GET /:hiveCode limit 500 + stats + GET / summary` |
| `api/src/routes/quality.js` | ✅ | `POST /receive lab_received_weight + POST /process wastage/pureWeight dilution flag (>1.01) + POST / quality require testType+certificateHash+testerPhotoHash chain.recordQuality` |
| `api/src/routes/transfers.js` | ✅ | `POST / custody holder check chain.recordTransfer + checkAnomaly POST AI/anomaly → alert dilution high + flagged ; GET /?batchId` |
| `api/src/routes/packages.js` | ✅ | `POST /receive packer_received_weight + POST / jarCount+qr hc.in/b/{id} check flagged + labPure*1.01 gate chain.recordMint packages + packaged` |
| `api/src/routes/alerts.js, chain.js, public.js, actors.js` | ✅ | Exist under `api/src/routes/` — Explorer/Alerts consoles consume them |

## Summary of Critical Broken Functions (need fix before jury, <1 hr each)

| # | Critical? | Issue | Where | Fix (one-liner) |
|---|-----------|-------|-------|-----------------|
| 1 | 🔴 **Highest** | Transport pickup/delivery never writes to ledger/RTDB → no custody chain, no AI fraud trigger | `TransportPortal.jsx:84 confirmPickup,93 confirmDelivery` | `import {rtbAddTransfer} from '../../lib/rtb'; await rtbAddTransfer(scanFound.id,{weightKg:pickupWt, geo:gps, nextStatus:'in_transit'})` + same for delivery `nextStatus:'received'` |
| 2 | 🔴 | Lab PASS/FAIL never calls `POST /api/quality` nor `rtbAddQuality` → packaging gate & chain never learn verdict | `LabPortal.jsx:167 handleSubmit / 180 handleReject` | `await rtbAddQuality(selBatch.id,{testType:'IS4941-NMR', passed:true, certificateHash: pdfHash, testerPhotoHash: officerPreview}) ; fetch(BASE+'/api/quality', {method:'POST', body:JSON.stringify({batchId, testType, passed, certificateHash, testerPhotoHash})})` |
| 3 | 🟠 | Packaging Mark Dispatched never mints `qrCode hc.in/b/...` on chain nor `rtbAddPackage` | `PackagingPortal.jsx:157 handleDispatch` | `await rtbAddPackage(sel.id,{jarCount: bottleCount, qrData: generated.qrData}); fetch(BASE+'/api/packages',{body:{batchId:sel.id, jarCount}})` |
| 4 | 🟡 | Customer Report is alert-only, not persisted | `CustomerHome.jsx:28` | `await fetch('https://sih2026.../reports.json',{method:'POST', body:JSON.stringify({batch,type,desc,ts:Date.now()})})` |
| 5 | 🟡 | Admin heatmap / fraud / users are mock (not live from `getAlerts/getBatches/getActors`) | `AdminPortal.jsx:14 FRAUD_INIT etc` | `useEffect(()=>Promise.all([getAlerts(),getBatches()]).then(...))` — 5 min wiring |
| 6 | 🟢 | HiveMonitor uses 5s poll not `subscribeTelemetry` realtime | `HiveMonitor.jsx:44 setInterval` | `import {subscribeTelemetry} from '../../lib/firebase'; subscribeTelemetry(selected, rows=>setData(...))` when `VITE_FIREBASE_API_KEY` set |
| 7 | 🟢 | Farmer photo/video placeholders not hashed | `FarmerDashboard.jsx:265` | Wire file input → `crypto.subtle.digest('SHA-256', file)` → `photoHash` in `rtbCreateBatch` |

**No build breakers. All 6 portals render and meet SIH26021 functional checklist for demo. The 3 🔴/🟠 gaps above are local-state-only sinks — they don't break the demo but judges will probe `transfers` lineage if they check RTDB after a transport run. Patching them (4 fetch calls) makes the flow end-to-end live.**
