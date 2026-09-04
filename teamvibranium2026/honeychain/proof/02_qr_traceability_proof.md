# 02 QR Traceability Proof
**Flow:** `POST /batches` → `POST /transfers` → `POST /quality` → `POST /packages {jarCount}` → `qr hc.in/b/B-*` → `GET /api/public/batches/:id` trustBadge.

**Consumer Verify:**
- Vercel: https://web-mocha-three-89.vercel.app/verify/B-1042 (hero B-1042 verified, villain B-2001 flagged 42→55kg)
- QR: `packages.qr_code UNIQUE` = `https://web-mocha-three-89.vercel.app/b/B-1042`
- Trust: `verified` if status=packaged + passedQuality + transfers>=3 else `partial` (api/src/routes/public.js:56)

**Live Checks:**
```bash
curl http://localhost:4000/api/public/batches/B-1042 | jq .trustBadge
# verified
curl https://sih2026-b9ef7-default-rtdb.firebaseio.com/batches/B-1042.json | jq .status
# packaged
```

**Significance:** Solves counterfeit honey + low consumer trust (KVIC core pain); farm geo-photo on ledger, dilution 2% gain / 25% loss flagged by AI.

**Screenshots:** `proof/screenshots/consumer_portal.png` (ConsumerPortal.jsx) + check `web/src/pages/ConsumerPortal.jsx`
