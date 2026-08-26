# HoneyChain — Team Vibranium (SIH 2026 · SIH26021)

Farm-to-jar blockchain traceability + smart beekeeping platform.

## Modules

| Folder | What | Stack | Port |
|---|---|---|---|
| `chain/` | Ledger contracts + deploy/test | Solidity + Hardhat (Polygon Amoy ready) | — |
| `api/` | REST API, auth, chain bridge, alerts | Node.js + Express + PostgreSQL | 4000 |
| `app/` | Beekeeper app (offline-first) | Flutter + sqflite | — |
| `web/` | FPO console + consumer QR portal | React + Vite + Tailwind | 5173 |
| `ai/` | Anomaly / disease / yield services | Python + FastAPI | 8000 |
| `seed/` | Demo dataset generator | Node (no deps) | — |

## Quick start (after deps installed)

```bash
# 1. database
docker compose up -d

# 2. ai service
cd ai && pip install -r requirements.txt && uvicorn main:app --port 8000

# 3. api
cd api && npm install && npm run dev        # uses .env (copy from .env.example)

# 4. web
cd web && npm install && npm run dev

# 5. seed demo data
cd seed && node generate.js > data/demo.json

# 6. contracts (optional local chain)
cd chain && npm install && npx hardhat test
```

## Data flow

Beekeeper app (offline queue) → API → ledger tx → custody chain across FPO/processor/lab/packer keys → AI weight-physics checks at every hop → jars minted with QR → consumer portal shows full lineage.

## Docs

See `../PS1_SIH26021_HoneyChain/` for problem breakdown, architecture story, roadmap, judge Q&A, demo script.
