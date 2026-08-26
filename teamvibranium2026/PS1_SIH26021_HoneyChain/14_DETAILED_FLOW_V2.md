# SIH26021 — Detailed V2 Flow: Farmer → Driver → Lab → Packer → Consumer QR

> Single source of truth for judges, devs, PPT. Every weight is measured twice (source + destination) so any dilution creates a physics violation flagged by AI.

## 1. Roles & permissions (strict forward flow)
| Actor | Role key | Can do | Cannot |
|---|---|---|---|
| Beekeeper/Farmer | `beekeeper` | createBatch (photo+geo+farmerWeight) | transfer except to transporter/FPO |
| Transporter/Driver | `transporter` | confirm pickup weight (vehicle scale), in-transit update | create batch, attach lab cert |
| Lab/Tester | `lab` | record receivedWeight, wastage, pureWeight, certHash + testerPhotoHash | mint jars |
| Packer | `packer` | record packerReceivedWeight, jarCount, mint QR | edit lab data |
| Admin | `admin` | flag batch | edit weights |

Flow enforcement: `transfers.from_actor` must == current holder. Contract `transferCustody` checks `Registered` + weight>0. API adds stage checks below.

## 2. End-to-end story (Batch B-1042 example)

### Stage 1 — Harvest (App / Web)
- Farmer Ravi @ Tiruvallur apiary opens app, taps **New Harvest**
- Enters: apiaryId, flora=mustard, farmerWeight=42.00 kg (manual scale), harvestDate, auto-geo [13.08,80.27], takes geotagged photo (farmer + honey comb)
- App uploads: `POST /api/batches {weightKg:42, floraType, photoHash, geo, clientBatchId}`
- DB: `batches {id=B-1042, weight_kg=42, farmer_weight=42, status=created}` + `transfers {self→self, txHash}` + chain `BatchCreated`
- Side effect: notify lab pool — `alerts {type: pickup_request, batch_id}` visible in FPO/Lab console + push to transporter pool

### Stage 2 — Pickup allocation & transport
- Tester/FPO ops sees alert, assigns driver: `POST /api/transfers {batchId:B-1042, toActorId: driverId, weightKg:42, geo}`
- Driver app shows job with map pin (farmer geo). Driver reaches farm, verifies comb, weighs on **vehicle-mounted scale** → vehicleWeight=41.8kg (loss 0.2 evap OK)
- Driver taps Confirm Pickup → same transfer endpoint records `weightKg=41.8` second hop. Both weights on-chain.
- Transit tracked, geo updated on each hop. DB `transfers` keeps both 42 → 41.8 trail.

### Stage 3 — Lab receiving & testing
- Lab receives goods, weighs on lab scale → `receivedWeight=41.6kg` via `POST /api/quality/receive {batchId, receivedWeight}`
- Lab processes/extracts/filters → measures `wastage=3.6kg` (wax/impu) + `pureWeight=38.0kg`. Updates: `POST /api/quality/process {batchId, wastage, pureWeight}`
- Invariant checked: `farmerWeight(42) → pure(38)` loss 9.5% OK. If pure > received (like 55kg villain), AI flags `dilution` high-severity → batch `flagged`
- Lab uploads: test certificate PDF hash `certificateHash` + photo of tester holding sample `testerPhotoHash` + testType (NMR/pollen/Moisture), passed=true/false → `POST /api/quality {batchId, testType, passed, certificateHash, testerPhotoHash}`
- Chain: `QualityAttached` with cert hash. DB `quality_records` stores both hashes.

### Stage 4 — Packer
- Lab → packer handoff: `POST /api/transfers {batchId, toActorId: packerId, weightKg:38, geo: labGeo}`
- Packer receives, weighs → `packerReceivedWeight=37.9kg` via `POST /api/packages/receive` (optional confirm)
- Packer mints: enters `jarCount=500` (e.g., 75g jars). System computes expected: 37.9kg/0.075≈505 max → 500 plausible.
- `POST /api/packages {batchId, jarCount}` → DB `packages {qr_code=hc.in/b/B-1042#jar001..500}`, batch `status=packaged`, chain `JarsMinted` — **only packer can mint, so QR creation is gated**. Each jar QR = `hc.in/b/B-1042?jar=042`
- No further transfers after packaged except admin flag.

### Stage 5 — Consumer QR (transparent trail)
`GET https://hc.in/b/B-1042` → `GET /api/public/b/:batchId` returns:
- Farmer card: photoHash (geotagged harvest), name, apiary map, date, flora
- Transport card: driver name/org, pickup geo+time, farmerWeight vs vehicleWeight delta
- Lab card: receivedWeight, wastage, pureWeight, certificate link (IPFS/S3), testerPhoto, test pass badge, lab name
- Packer card: receivedWeight, jarCount, packed date, packer org
- Timeline: chronological transfers with txHash + geo + Polygonscan link
- Trust badges: PhysicsCheck PASS/FLAG, Lab PASS/FLAG

## 3. Data model deltas (what changed from V1)
- `batches`: + `farmer_weight`, `lab_received_weight`, `lab_wastage`, `lab_pure_weight`, `packer_received_weight`, `geo_lat`, `geo_lng`, `status` extended with `pickup_assigned`, `at_lab`, `tested`
- `transfers`: already stores per-hop weight+geo+txHash — now mandatory for every handoff
- `quality_records`: + `tester_photo_hash`, `wastage`, `pure_weight`, `received_weight`
- `packages`: + `packer_received_weight` before mint
- `pickup_requests` (view on alerts): lab notification is an `alerts` row of type `pickup_request`

## 4. Blockchain conceptual flow
- Polygon (public verifiable) with role-gated functions mimics Fabric permissioning
- Events emitted: `BatchCreated → CustodyTransferred (×3) → QualityAttached → JarsMinted` — each carries txHash anchor. Off-chain PII is hash-only (DPDP).
- Tamper check: if someone rewrites `weightKg` in DB, it mismatches on-chain event value → explorer flags divergence.

## 5. API sequence (happy path curls)
```
1 POST /api/auth/login (beekeeper) → token
2 POST /api/batches {weightKg, photoHash, geo} → B-1042
3 POST /api/transfers {batchId, toActorId:driver, weightKg:41.8}
4 POST /api/quality/receive {batchId, receivedWeight:41.6}
5 POST /api/quality/process {batchId, wastage:3.6, pureWeight:38}
6 POST /api/quality {batchId, testType:NMR, passed:true, certificateHash, testerPhotoHash}
7 POST /api/transfers {batchId, toActorId:packer, weightKg:38}
8 POST /api/packages {batchId, jarCount:500} → qr hc.in/b/B-1042
9 GET  /api/public/b/B-1042 → consumer view
```

## 6. Failure / fraud handling
- Weight gain >1% across any hop → AI `/anomaly` flags `high` dilution, batch auto-flagged, blocked from packing
- Missing dual-weigh (farmer vs vehicle vs lab) → packer mint rejected until all three present
- Certificate without tester photo → 400 (photo required per spec)
- Duplicate `clientBatchId` → deduped 200 (offline queue safe)

## 7. Website ↔ DB ↔ Chain wiring (today → tomorrow)
- Today: API runs mock-chain (0xMOCK…) via `CHAIN_CONTRACT_ADDRESS=""`, DB is Postgres, web reads `demoData` fallback when API down. Works demo-safe.
- To go live: `docker compose up -d postgres`, set `CHAIN_RPC_URL` + `CHAIN_CONTRACT_ADDRESS` after `npx hardhat run scripts/deploy.js --network amoy`, API then writes real txHashes and web shows green “on-chain” dot.
