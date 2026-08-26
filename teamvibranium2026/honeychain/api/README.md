# HoneyChain API

Honey supply-chain traceability REST API for SIH 2026 — batch registration, custody transfers, lab quality records, packaging with QR codes, AI dilution alerts, and a public consumer trust view.

## Setup

```bash
cp .env.example .env
docker compose up -d db
npm install
node src/server.js
```

`.env.example` values: `PORT=4000`, `DATABASE_URL=postgres://honey:chain2026@localhost:5432/honeychain`, `JWT_SECRET=devsecret`, `CHAIN_RPC_URL=http://127.0.0.1:8545`, `CHAIN_CONTRACT_ADDRESS=` (leave empty), `AI_SERVICE_URL=http://localhost:8000`.

Migrations (`src/migrations.sql`) run automatically on boot and are idempotent.

## Mock-chain note

When `CHAIN_CONTRACT_ADDRESS` is empty (default), `src/chain.js` runs in **mock mode**: every on-chain call returns a deterministic-looking fake hash (`0xMOCK<timestamp>`). The demo never dies if no local chain is running. Point `CHAIN_CONTRACT_ADDRESS` at a deployed contract to switch to live mode.

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | none | liveness check |
| POST | `/api/actors` | JWT (any) | register actor (`role` in beekeeper/fpo/processor/lab/packer/admin, unique phone), returns row + JWT |
| GET | `/api/actors?role=` | none | list actors, optional role filter |
| GET | `/api/actors/:id` | none | actor detail |
| POST | `/api/batches` | JWT | create batch(es), mints on-chain record + initial self-transfer |
| GET | `/api/batches?status=&apiary=&q=` | none | list batches |
| GET | `/api/batches/:id` | none | batch detail with transfers/quality/packages/alerts |
| POST | `/api/transfers` | JWT | transfer custody (current holder only); fires async AI anomaly check → can flag batch + raise dilution alert |
| GET | `/api/transfers?batchId=` | JWT | list transfers |
| POST | `/api/quality` | JWT (lab) | add quality test result + on-chain record |
| POST | `/api/packages` | JWT (packer) | package batch into jars with QR (`hc.in/b/<batchId>`), sets status `packaged` |
| GET | `/api/alerts?batchId=&open=true` | none | alerts, unacknowledged first |
| POST | `/api/alerts/:id/ack` | JWT (admin/fpo) | acknowledge alert |
| GET | `/api/chain/status` | none | chain mode + block number + counts |
| GET | `/api/public/batches/:batchId` | **none** | consumer-facing trace view; sanitized (no phone numbers); `trustBadge`: `verified` when packaged + ≥1 passed test + ≥3 hops, else `partial` |

## Flow

beekeeper registers → creates batch → transfers to fpo → processor → packer; lab posts quality results along the way. Each transfer sends hop weights to the AI service (`AI_SERVICE_URL/anomaly`); a flagged response inserts a high-severity `dilution` alert and marks the batch `flagged`.
