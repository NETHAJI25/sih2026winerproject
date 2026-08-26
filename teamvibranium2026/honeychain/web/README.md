# HoneyChain Web

Web module of **HoneyChain** — a honey supply-chain traceability platform built by **Team Vibranium** for Smart India Hackathon 2026 (PS SIH26021).

Two faces:

- **FPO Console** (`/console`) — dashboard, batch lineage, receive flow, alerts inbox, mock ledger explorer.
- **Consumer Portal** (`/b/:batchId`) — public mobile-first jar page scanned from the QR code on the jar.

## Stack

React 18 · Vite · react-router-dom v6 · Tailwind CSS v3 · recharts

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173. Build with `npm run build`, preview with `npm run preview`.

Optional env: set `VITE_API_URL` in a `.env` file to point at a live API (default `http://localhost:4000`). Without it, or whenever the API is unreachable, the app runs entirely on built-in demo data.

## Routes

| Route | Page |
| --- | --- |
| `/` | Redirects to `/console` |
| `/console` | Dashboard — stat cards, batches-by-flora bar chart, recent alerts |
| `/console/batches` | Batches grouped kanban-style by status, search, click for lineage drawer |
| `/console/receive` | Receive flow — expected vs actual weight, mismatch warning, confirm toast |
| `/console/alerts` | Severity-colored alert cards, dilution payload visualized (42 in / 55 out), acknowledge |
| `/console/explorer` | Mock ledger explorer — block height, recent transfer table |
| `/b/:batchId` | Public consumer portal — trust badge, farmer story, apiary map link, journey timeline, NMR certificate |
| `*` | 404 |

Try `/b/B-1042` (hero batch, Verified Pure) and `/b/B-2001` (flagged villain, Partial records).

## Demo fallback

Every data function in `src/lib/api.js` wraps its fetch with an abort timeout (~3.5 s). On any failure — server down, non-200 response, timeout — it silently returns data from `src/lib/demoData.js`, so the demo **never dies** on stage. The header status dot shows green (**API live**) when the real backend answers and pulsing amber (**Demo data**) when running on the local dataset. Acknowledging alerts mutates the in-memory demo store so state survives navigation within a session.

Demo dataset highlights: 8 batches across all statuses, full 4-hop lineage for B-1042 with farmer Ravi (8 boxes, mustard fields of Tiruvallur), flagged B-2001 where QuickHoney Processing took in 42 kg and shipped 55 kg, plus a mock chain at block 1284.
