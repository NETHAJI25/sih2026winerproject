# SIH26021 — Solution Architecture: "HoneyChain"

## One-line pitch
*A permissioned-blockchain supply chain + smart-beekeeping platform that carries every honey jar from apiary to shelf as a tamper-proof digital identity, verifiable by anyone with one QR scan.*

## System components (5 modules)

```
┌─────────────────────────────────────────────────────────────┐
│                    HONEYCHAIN PLATFORM                       │
│                                                              │
│  [M1 Beekeeper App]   [M2 Chain Core]    [M3 Consumer Trust] │
│  Flutter (offline-first) Hyperledger     Web PWA + QR        │
│  hive logs, harvest      Fabric ledger   scan-to-story       │
│  batches, sync           smart contracts                      │
│         │                     │                  │           │
│  [M4 FPO/Admin Console]  [M5 Intelligence]   [Integration]   │
│  React dashboard          AI services:      Madhukranti ID   │
│  aggregation, payouts,    yield forecast,   import adapter   │
│  compliance exports       disease risk,                      │
│                           dilution alerts                    │
└─────────────────────────────────────────────────────────────┘
```

### M1 — Beekeeper App (Flutter, Devraj-led)
- Offline-first (SQLite local queue → sync when network returns)
- Icon+voice driven UI, Hindi/Tamil/English
- Hive register: box count, inspection notes, photo evidence geo-tagged
- Harvest event → creates **batch** with weight, flora type, date, GPS
- Batch handoff: shows signed transfer QR to collection center

### M2 — Chain Core (the blockchain layer)
- Permissioned ledger (Hyperledger Fabric preferred; fallback Polygon PoA)
- Assets: `Actor`, `Apiary`, `Batch`, `Transfer`, `QualityRecord`, `Package`
- Chaincode functions: `registerActor`, `createBatch`, `transferCustody`, `attachLabResult`, `mintJarQR`
- Each custody transfer = signed transaction → history is immutable & auditable
- Explorer view (block height, tx list) shown live in demo to prove immutability

### M3 — Consumer Trust Portal (PWA)
- GS1-style QR on jar → landing page: apiary location map, beekeeper profile (consented), harvest date, flora, lab certificate PDF, custody timeline
- Trust score badge computed from chain completeness + lab results

### M4 — FPO/Admin Console (React + your CRM DNA)
- Collection-center mode: weigh incoming batches, auto-detect weight-vs-manifest mismatch
- Member payouts ledger, batch status kanban, compliance report export (APEDA-format)
- District/state heatmap of production & alerts

### M5 — Intelligence Layer (Nethaji-led, mirrors DealMind AI memory pattern)
- Yield forecast per apiary (flora bloom calendar + IMD weather API)
- Disease-risk alert engine (seasonal model: varroa, foulbrood, absconding triggers)
- Dilution/anomaly detector: batch weight deltas across hops flag suspicious gain (water/syrup addition)
- All alerts surface as notifications in M1/M4

## Data flow (the demo storyline)

```
Beekeeper creates batch B-1042 (42kg, mustard flora, UP)
   → tx#001 minted on ledger
Collection center receives 42kg → matches manifest ✓ → tx#002
Processor: 42kg in → 38kg out (evaporation logged) → tx#003
   ⚠ if processor showed 55kg out instead → M5 flags dilution alert
Packer mints 500 jars, each QR links to B-1042 lineage → tx#004
Consumer scans jar → sees full journey + NMR lab pass + farmer story
```

## Tech stack (final unless blocked)

| Layer | Choice | Why |
|---|---|---|
| Mobile | Flutter + SQLite + Drift | Devraj's stack; offline-first free |
| Backend API | Node.js + Express + PostgreSQL | Team familiarity (your CRM stack) |
| Ledger | Hyperledger Fabric 3.x testnet | Enterprise credibility; no token talk |
| Auth | Firebase Auth + role claims | 30-minute setup, proven by you before |
| Dashboards | React + Recharts + Tailwind | Existing component library |
| AI/ML | Python FastAPI microservice; scikit-learn/XGBoost | Lightweight, explainable |
| Maps/GPS | Leaflet + OpenStreetMap tiles | Zero cost |
| Hosting | Render/Railway + Vercel | Free tiers, fast deploys |
| Storage | Cloudinary/S3 for photos & lab PDFs | Cheap, CDN-backed |

## Security & governance (judges will ask)
- Roles: Beekeeper / FPO Agent / Processor / Lab / Auditor / Admin — least privilege
- Private key custody: device keystore for beekeepers; org nodes run by FPOs
- Data privacy: personal data stays OFF-chain (hash references only) — DPDP Act compliant design
- Consortium governance: NBB/FPOs as validator orgs → no single party can rewrite history
