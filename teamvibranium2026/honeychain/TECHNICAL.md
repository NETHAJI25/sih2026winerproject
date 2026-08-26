# HoneyChain — TECHNICAL.md (SIH26021)

## Stack
Web: React 18 + Vite 5 + Tailwind 3 + recharts, hero video `/public/hero.mp4`, Home.jsx (video hero Tesla/Apple style, Journey, Roles, Live, Blockchain). Console: Layout.jsx 5 tabs. Public: /b/:batchId ConsumerPortal.
Mobile: Flutter + SQLite offline queue + auto-sync (clientBatchId dedupe), role routes, en/hi/ta.
API: Express + Postgres (docker-compose), JWT (requireAuth/requireRole), chain.js (mock→live), AI proxy. Routes: actors, batches, transfers, quality (receive/process + cert), packages (receive + mint), alerts, public, chain.
Chain: Polygon Amoy Solidity 0.8.20 HoneyChain.sol (roles beekeeper/fpo/transporter/lab/packer/admin, createBatch beekeeper only, transferCustody holder only, attachQuality lab, mintJars packer only, flagBatch admin). ABI in chain.js toUnits milli-kg. Mock 0xMOCK fallback if no CHAIN_CONTRACT_ADDRESS. Hyperledger note: Polygon chosen for public verifiability + polygonscan; role gating gives Fabric-like permissioning, can swap to Fabric without API change.
AI: FastAPI :8001 /anomaly (weight gain >1% flagged high), /disease, /yield. Seed: 11 actors, 12 apiaries, 30 batches (B-1042 hero, B-2001 villain 42→55kg).
DB: actors, apiaries, batches(farmer_weight, lab_received/wastage/pure, packer_received, geo_lat/lng, status extended), transfers, quality_records(tester_photo_hash, received/wastage/pure), packages(packer_received_weight), alerts. 002_v2_flow.sql migration.
Offline: farmer batch stored locally → Background Queue → on Internet POST /batches → pickup_request alert to lab → driver assigned. User never clicks Sync.

## Flow (code-mapped)
1 POST /batches {weightKg, photoHash, geoLat/lng, flora/bee} → self-transfer + alert
2 POST /transfers {batchId, toActorId:transporter, weightKg:41.8, geo}
3 POST /quality/receive {receivedWeight} + /process {wastage,pure} (auto dilution check)
4 POST /quality {certificateHash, testerPhotoHash, testType NMR} (both required)
5 POST /transfers to packer + POST /packages/receive + POST /packages {jarCount, receivedWeight} → qr hc.in/b/B-*
6 GET /public/b/:id → Home Verify button jumps to ConsumerPortal

## Auth & Portals (6, no block today)
Farmer/Transport/Lab/Packaging/Customer (public QR)/Admin — role enum in DB + contract isValidRole. Login placeholder phone/OTP, certificate upload field, honey/bee/flower taxonomy (fixed lists) drives packing label, report button on Consumer.

## IoT
Optional hive_telemetry (temp/humidity/weight/sound) table + chart; manual mode works.

## Env
CHAIN_RPC_URL, CHAIN_CONTRACT_ADDRESS, AI_SERVICE_URL, DATABASE_URL, JWT_SECRET. Mock mode demo-safe.

## Deploy
docker compose up -d postgres → psql < migrations.sql → hardhat deploy --network amoy → set env → npm run dev (web 5173, api 3000, ai 8001).
