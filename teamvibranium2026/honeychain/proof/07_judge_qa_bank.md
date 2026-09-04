# 07 Judge QA Bank — 55 Questions
**Use:** Search keyword, answer with file:line + live curl.

1. Counterfeit? → QR trustBadge + 2% gain check `api/src/routes/public.js:56` + `ai/main.py:66`
2. Offline? → Flutter SQLite `app/lib/services/db.dart` + sync `api.dart` RTDB PUT
3. No internet at farm? → Demo fallback `web/src/lib/api.js` + RTDB rules true
4. Why Polygon? → `TECHNICAL.md:7` public verifiability vs Fabric private
5. Varroa? → `POST /colony-health varroa_count` + `GET /disease?month` varroa peak Oct-Feb
6. Foulbrood? → Jun-Sep 40 pts `ai/main.py:116`
7. Yield? → `GET /productivity ML+rule 56.9kg`
8. Health accuracy? → 94.8% synthetic, see `proof/metrics/report.json`; real Kaggle →85-90%
9. Dataset? → 2000 synthetic + 3 Kaggle cards `proof/datasets/`
10. Firebase cost? → RTDB free tier, one project per India cluster
... (41-55) Market linkage, FPO weight, NMR cert, geo-tag, packaging mint, flagBatch admin, chain txHash, hive sound 75dB, battery, season factor, flora 8 types, audit, KVIC scaling, Vercel 6 portals, APK 50MB.

**Full 55 in:** See `PROGRESS.md` Next + `PS1_SIH26021_HoneyChain/07_JUDGE_QA_PLAYBOOK.md`
**Proof per answer:** Each A cites curl + file:line + RTDB/metrics json.
