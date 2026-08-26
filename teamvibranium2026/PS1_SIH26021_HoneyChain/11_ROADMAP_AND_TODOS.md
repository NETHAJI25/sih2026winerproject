# HoneyChain — Build Roadmap & Master To-Do List

**Start:** now → **Submission lock:** 20 Sep 2026 | **Owners:** N = Nethaji, D = Devraj, G1–G4 = R&D/PPT team

---

## 0. Repo & environment (Day 1 — everything on this list before any feature code)

```
honeychain/
├── chain/      # ledger layer: Fabric chaincode OR Polygon contracts
├── api/        # Node.js + Express + PostgreSQL (REST)
├── app/        # Flutter beekeeper app (offline-first)
├── web/        # React: FPO console + consumer QR portal
├── ai/         # Python FastAPI: anomaly + disease + yield services
├── seed/       # demo dataset generator (Node script)
└── docs/       # diagrams, PPT assets, screenshots
```

- [ ] N: `git init honeychain` monorepo + branch rules (main protected, feature branches)
- [ ] N: README with setup steps (any member can run full stack in <15 min)
- [ ] N: Docker-compose for api + postgres (one-command startup)
- [ ] N: Decide ledger path by Day 3 spike: **Fabric testnet** (credibility) vs **Polygon Amoy PoA** (speed). Rule: if Fabric not minting a tx by end of Day 3 → switch to Polygon, no debate
- [ ] D: Flutter 3.x + Android studio working, physical Android test device ready
- [ ] G1: Create shared Drive: `/ppt /research /media /submissions` + naming convention
- [ ] All: 30-min daily sync 21:00; every session ends with git push + Drive mirror (3-copy rule)

## 1. Data model (Day 1–2 — everything depends on this)

Entities & key fields:

- **Actor**: id, role (beekeeper|fpo|processor|lab|packer|admin), name, phone, org, pubKeyId
- **Apiary**: id, ownerActorId, geo, boxCount, floraProfile
- **Batch**: id, apiaryId, harvestDate, weightKg, floraType, photoHash, status
- **Transfer**: id, batchId, fromActor, toActor, weightKg, geo, timestamp, txId
- **QualityRecord**: batchId, labActorId, testType (NMR/TLC), result, certificateHash
- **Package**: id, batchId, jarCount, qrCode, mintedAt
- **Alert**: id, batchId, type (dilution|disease|delay), severity, payload, readBy[]

- [ ] N: Write schema SQL + Postgres migrations
- [ ] N: Map which fields go ON-chain (hashes, events, custody txs) vs OFF-chain (photos, personal data) — DPDP rule: personal data never on ledger
- [ ] D + N review together (30 min) — both must be able to whiteboard this blind

**Gate G1 (end Day 3): one batch minted on ledger via API call. Nothing else matters until this is true.**

## 2. Chain core (N, Days 2–6)

- [ ] C1 Chaincode/contract: `registerActor`, `createBatch`, `transferCustody`, `attachQuality`, `mintJars`
- [ ] C2 Each tx emits event: `BatchTransferred(batchId, from, to, weight, ts)`
- [ ] C3 Query endpoints: batch history (full lineage), actor ledger, latest block info
- [ ] C4 Explorer mini-page (web): block height, last 20 txs — this is your live "immutability proof" in demo
- [ ] C5 Multi-key signing test: 3 different org keys must each sign successive transfers

## 3. API layer (N, Days 4–9, parallel with chain)

- [ ] A1 Auth: Firebase phone auth + role claims middleware
- [ ] A2 Batch endpoints: create/list/detail/transfer/quality
- [ ] A3 Offline-sync endpoint: accept queued batch array (idempotent, dedupe by clientBatchId)
- [ ] A4 Alert service: consume chain events → weight-delta rule engine → create Alert rows
- [ ] A5 QR mint: package creation → GS1-style URL `hc.in/b/B-1042` → printable QR PDF
- [ ] A6 Seed endpoint: load demo dataset (see §7)

## 4. Beekeeper app (D, Days 3–12)

- [ ] M1 Auth + role select + language toggle (ta/hi/en)
- [ ] M2 Hive register: box list, inspection log (notes + photo, geo-tagged)
- [ ] M3 Harvest → batch form (weight, flora picker, photo) → local SQLite queue
- [ ] M4 Sync engine: background flush when online; conflict-safe (clientBatchId dedupe)
- [ ] M5 Airplane-mode demo path: create offline → banner "queued" → online → "synced ✓ tx#"
- [ ] M6 Transfer screen: show signed QR to hand over batch at collection center
- [ ] M7 Notifications: disease alerts, sync status (local notifs fine)
- [ ] M8 Icon-first UI + voice hint buttons; test on ₹6–8k Android phone

## 5. Web: FPO console + consumer portal (N + G2, Days 8–15)

- [ ] W1 FPO login → incoming batches kanban (pending/received/flagged)
- [ ] W2 Receive flow: weigh → auto-compare manifest → mismatch warning
- [ ] W3 District heatmap (Leaflet): batches, alerts, FPO members
- [ ] W4 Ledger explorer page (from C4)
- [ ] W5 Consumer portal: public page `/b/:batchId` — farm map, farmer story, certificates, custody timeline, trust badge
- [ ] W6 Hindi/Tamil toggle on consumer page
- [ ] W7 Print-ready QR sheet for demo jars (physical props)

## 6. AI services (N, Days 10–16)

- [ ] I1 Dilution detector v1: rule-based weight deltas (ship this first — it's the demo moment)
- [ ] I2 Dilution detector v2: per-flora expected-yield-loss model (evaporation %) → confidence score
- [ ] I3 Disease-risk alerts: seasonal model (varroa/foulbrood risk by month + temp/humidity)
- [ ] I4 Yield forecast: flora bloom calendar + IMD weather API mock → kg estimate per apiary
- [ ] I5 All alerts → app push + console banner + alert log page

## 7. Demo dataset (G2 + N, Day 14)

- [ ] S1 Seed script: 6 beekeepers (2 TN, 2 UP, 1 WB, 1 Punjab), 12 apiaries, ~30 batches, 4 custody hops
- [ ] S2 Hero batch B-1042: full clean lineage → 500 minted jars
- [ ] S3 Villain batch: weight-gain anomaly at processing (alert fires on stage)
- [ ] S4 Lab record + certificate PDF for hero batch
- [ ] S5 Farmer story content (photo + 2 lines) for consumer page

## 8. Pitch & docs track (G1 leads, continuous; G3 = pitch lead, G4 = ops/QA)

- [ ] P1 PPT v1 from 06_PPT_OUTLINE.md (Day 6)
- [ ] P2 Concept note PDF finalized ✅ (done — v1.2)
- [ ] P3 Outreach mails sent (Day demo video ready → Day+1) — tracker in 10_VALIDATION_OUTREACH.md
- [ ] P4 Demo video: screen-record + voiceover ≤3 min, 720p (Day 16, re-record Day 18)
- [ ] P5 Judge QA drills 2×/week from 07_JUDGE_QA_PLAYBOOK.md (G3 runs them on N+D; N runs tech drills on girls)
- [ ] P6 SIH portal idea write-up draft (Day 15) — word limits respected, impact math up front
- [ ] P7 SUBMIT on portal by 17 Sep (3-day buffer; portals crash on deadline day)

## 9. Rehearsal & freeze (Days 16–20)

- [ ] R1 Full 7-min demo rehearsal ×5 (08_DEMO_SCRIPT.md) — timer, props, 2 devices charged
- [ ] R2 Failure drill: airplane mode, dead internet (hotspot off), QR mis-scan → fallback paths
- [ ] R3 Feature freeze 48h before submission — bugfixes only
- [ ] R4 Final backups: GitHub + Drive + D's laptop, verify restore once

## Gates (miss = stop and fix before proceeding)

| Gate | When | Definition of done |
|---|---|---|
| G1 | Day 3 | Batch minted on ledger via API |
| G2 | Day 9 | Happy path: app → API → chain → explorer visible |
| G3 | Day 15 | Full story demo <7 min incl. alert + QR scan |
| G4 | Day 17 | Video + write-up + PPT v2 done |
| SUBMIT | 17 Sep | Portal submission confirmed + screenshot saved |

## Standing rules

1. New idea mid-sprint → `BACKLOG.md`, never into the sprint
2. Every demo-critical path has a recorded-video fallback
3. If a task slips 24h, cut scope — never shift gates
4. PS2 hedge gets N's weekend blocks only (see PS2 folder)
