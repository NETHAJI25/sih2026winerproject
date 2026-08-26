# sih2026winerproject — HoneyChain SIH26021

**Team Vibranium · SRM IST · MSME · Smart Automation · Software**

Blockchain honey traceability + smart beekeeping — farm geo-photo → driver → lab (NMR + cert) → packaging QR → customer scan.

- **Web (Vercel):** https://web-mocha-three-89.vercel.app (video hero, 6 portals, QR scannable)
- **App APK:** `HoneyChain-app-release.apk` (50MB) at repo root — Flutter offline-first, direct to Firebase RTDB `https://sih2026-b9ef7-default-rtdb.firebaseio.com` (rules true for demo)
- **DB:** Firebase Realtime Database (direct REST, web + app share same `batches/{B-1042}` tree, instant sync)
- **Chain:** Polygon Amoy mock → live via `CHAIN_RPC_URL`
- **Run locally:** `START.ps1` (keyword `start`) restarts postgres/api/ai/web; web 5173/5174, api 4000
- **QR:** Vercel URL `https://web-mocha-three-89.vercel.app/verify/B-1042` — scan from any device
