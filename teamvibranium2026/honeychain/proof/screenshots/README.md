# Screenshots — Required & Placeholder Status

> All captures pending finals device run. Placeholders describe framing; replace `.png` with real screenshots before PPT export.

## Required

| # | File | View | How to capture | Status |
|---|---|---|---|---|
| 1 | `01_consumer_portal_qr_verify.png` | Consumer QR Verify — `https://web-mocha-three-89.vercel.app/verify/B-1042` showing trustBadge `verified`, farmer photo, chain hops, lab cert | Open Vercel link → scan demo QR (`hc.in/b/B-1042`) → screenshot full lineage | TODO — placeholder note below |
| 2 | `02_hive_monitor_dashboard.png` | HiveMonitor Flutter — dashboard with 4 hives, temp 34.5°C, health `healthy`, 12s RTDB tick | `flutter run -d android` → HiveMonitor tab → screenshot `telemetry/HIVE-KVIC-001` live card | TODO |
| 3 | `03_firebase_rtdb_realtime.png` | Firebase Console RTDB — `telemetry/HIVE-KVIC-001` + `batches/B-1042` JSON tree with `source:firebase-rtdb` | Firebase Console → Realtime Database → Data tab → expand telemetry → screenshot | TODO |
| 4 | `04_api_chain_status.png` | `/api/chain/status` + `/api/telemetry/ingest` curl or Postman 200 | `curl http://localhost:4000/api/chain/status` + ingest POST → terminal screenshot | TODO |
| 5 | `05_lab_nmr_cert_upload.png` | Lab portal NMR cert upload — `tester_photo_hash` + `proof/lab_nmr_cert.pdf` preview | Web Lab role → upload cert → screenshot | TODO |
| 6 | `06_apk_install.png` | Android install — `HoneyChain-app-release.apk` installed, launcher icon, permission screen | `adb install HoneyChain-app-release.apk` → screenshot app drawer | TODO |

## Placeholder Notes (until device available)

- Consumer portal: uses `qrcode.react` (web) + `qr_flutter` (app); QR payload `hc.in/b/{batchId}` → `web/src/Verify.jsx` resolves via `chain/contracts/HoneyChain.sol: BatchCreated→JarsMinted`.
- Hive monitor: `app/lib/services/telemetry_service.dart` polls `/api/hives` (RTDB first, fallback mock) every 12s; see `proof/03_iot_telemetry_proof.md` for simulator `seed/hives.js`.
- RTDB: REST verified `curl https://sih2026-b9ef7-default-rtdb.firebaseio.com/batches.json` 200 per `proof/05_firebase_realtime_proof.md`.

## Capture Commands

```bash
# web
npm run dev --workspace=web
# api + ai
npm run dev --workspace=api
uvicorn ai.main:app --port 8001 --reload
# app
flutter build apk --release
flutter run -d <device>
adb shell screencap -p /sdcard/screen.png && adb pull /sdcard/screen.png proof/screenshots/02_hive_monitor_dashboard.png
```

## PPT Sync

Once screenshots replaced, update `HoneyChain_SIH26021_PPT_6slides.html` Slide 3 placeholder `[Madhukranti screenshot + QR code demo art]` with `<img src="proof/screenshots/01_consumer_portal_qr_verify.png">` and Slide 4 flow with HiveMonitor screenshot. See `proof/08_gap_to_100.md` PPT sync row.
