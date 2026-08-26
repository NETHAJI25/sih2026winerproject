# SIH26021 — Features & MVP Scope

## MVP (must ship for idea submission demo)
| # | Feature | Module | Demo-visible? |
|---|---|---|---|
| 1 | Role-based auth (beekeeper/FPO/processor/lab/admin) | All | Yes |
| 2 | Batch creation with GPS + photo + flora type | M1 | Yes |
| 3 | Custody transfer with signed tx on ledger | M2 | Yes |
| 4 | Ledger explorer (blocks, txs, immutability proof) | M2 | Yes |
| 5 | Consumer QR scan → provenance story page | M3 | Yes (physical prop jar) |
| 6 | FPO console: aggregation list, weight mismatch flag | M4 | Yes |
| 7 | Offline mode: create batch offline → syncs later | M1 | Yes (airplane-mode moment in demo) |
| 8 | Hindi/Tamil/English toggle | M1/M3 | Yes |

## V2 (finale depth)
- AI dilution/anomaly alerts with confidence score
- Yield forecast per apiary
- Disease-risk seasonal alerts
- Lab result upload → certificate attached to batch lineage
- Madhukranti ID import adapter (mock API)
- Payout ledger for FPO members

## V3 (roadmap slide only — do NOT build)
- IoT hive sensors integration (show simulated telemetry card only)
- Exporter APEDA dossier auto-generation
- Carbon/bee-population analytics for govt dashboards

## Explicit non-goals (say "no" on stage if asked)
- No cryptocurrency/token/payments
- No replacing Madhukranti — we integrate
- No hardware deployment promises

## Demo dataset to prepare (seed script)
- 6 beekeepers (2 Tamil Nadu, 2 UP, 1 WB, 1 Punjab), 12 apiaries, ~30 batches across 4 custody hops, 1 lab record, 500 minted jars for one hero batch `B-1042`, plus ONE deliberately anomalous batch (weight gain at processing) so the alert engine has its moment.
