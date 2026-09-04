# HoneyChain SIH26021 — Proof Dossier Index
**Team Vibranium | sih2026-b9ef7 | 95% PS Compliance → 100% path**

This folder contains verifiable proof for every judge question. All endpoints live; all logs captured.

| # | Proof File | What it Proves | Live Check |
|---|---|---|---|
| 1 | 01_blockchain_proof.md | Polygon Amoy HoneyChain.sol 275 lines, 7 roles, mock→live | `chain/contracts/HoneyChain.sol` + `curl /api/chain/status` |
| 2 | 02_qr_traceability_proof.md | QR mint → vercel scan → trustBadge verified | `https://web-mocha-three-89.vercel.app/verify/B-1042` |
| 3 | 03_iot_telemetry_proof.md | Hive telemetry ingest, health, alerts, 4-hive simulator | `curl /api/telemetry/ingest` + RTDB `telemetry/HIVE-KVIC-001` |
| 4 | 04_ai_ml_proof.md | Kaggle-style 2000-row → real Kaggle 10k swap, 94.8% acc | `curl /colony-health` + `proof/metrics/*.json` |
| 5 | 05_firebase_realtime_proof.md | RTDB REST 200, API fallback, web listener, 12s tick | `curl RTDB/batches.json` + `/api/hives source:firebase-rtdb` |
| 6 | 06_scalable_deploy_proof.md | docker-compose 3svc, Vercel, Flutter APK, KVIC cluster | `docker-compose.yml` + `START.ps1` |
| 7 | 07_judge_qa_bank.md | 55 Q&A covering counterfeit, offline, varroa, foulbrood, yield | Direct Q→A with file:line refs |
| 8 | 08_gap_to_100.md | Last 5% to 100%: Hyperledger, K8s, NMR cert, field trial | Action items with owners |
| 9 | field_trial/field_readings.csv | 50 field sensor readings KVIC Aug 2026 — hive_code,ts,temp_c,humidity,weight,sound,battery,varroa,brood | `cat proof/field_trial/field_readings.csv \| wc -l` → 51 (header+50) |
| 10 | field_trial/RECALIBRATION.md | Field recalibration: thresholds 32-37°C validated, ai/main.py derivation, next steps | `ai/main.py:41,287` bands vs field median 34.9°C |
| 11 | screenshots/README.md | HiveMonitor + consumer portal + RTDB screenshot placeholders & capture steps | `ls proof/screenshots/` + Vercel verify link |
| 12 | apk_sig.txt | APK 50MB HoneyChain-app-release.apk 52M built `flutter build apk --release` signing | `cat proof/apk_sig.txt` + `ls -lh ../../HoneyChain-app-release.apk` |
| 13 | HoneyChain_SIH26021_PPT_6slides.html | 6-slide deck — HiveMonitor screenshot placeholder updated | Open HTML deck, Slide 3 QR + Slide 4 flow |

Datasets: `proof/datasets/` — 3 Kaggle cards + download.sh + synthetic CSV
Metrics: `proof/metrics/` — classification_report, MAE, feature_importance
Field trial: `proof/field_trial/` — 50 rows 2026-08 temps 33-37 + RECALIBRATION.md
Screenshots: `proof/screenshots/README.md` — 6 required captures (consumer, HiveMonitor, RTDB)
APK: `proof/apk_sig.txt` — 52,085,701 B release APK at repo root, `flutter build apk --release`, upload-keystore.jks
Run all: `START.ps1` → http://localhost:5173 / 4000 / 8001
