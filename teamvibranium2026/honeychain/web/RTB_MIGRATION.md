# RTDB Direct Migration — https://sih2026-b9ef7-default-rtdb.firebaseio.com (rules true)

Direct REST, no SDK, no auth — web and app share same JSON tree. API Postgres bypassed for SIH prototype.

Paths:
- batches/{B-1042} {id, flora, beeSpecies, weightKg, farmerWeight, geo, photoHash, status, farmer:{name}, harvestDate}
- transfers/{B-1042}/{key} {from,to,weightKg,geo,txHash,ts}
- quality/{B-1042}/{key} {testType, passed, certificateHash, testerPhotoHash, labName}
- packages/{B-1042} {bottleCount, qrData, lotHash}
- alerts/{id}_pickup

Usage: import {rtbCreateBatch, rtbGetBatch, rtbAddTransfer} from '../lib/rtb'
- Farmer New Harvest → rtbCreateBatch
- Transport pickup → rtbAddTransfer(batchId,{from:'farmer',to:'transporter',weightKg,geo,nextStatus:'in_transit'})
- Lab → rtbAddQuality(batchId,{testType:'NMR',passed:true,certificateHash,labName:'Apex Pune'})
- Packaging → rtbAddPackage(batchId,{qrData:`${origin}/verify/${id}`, lotHash})

Verify page reads rtbGetBatch + rtbListTransfers.

Seed: run node scripts/seedRtb.js to push B-1042 hero + B-2001 villain to RTDB.

Vercel env: none needed — direct fetch works (CORS *). App uses same BASE with http package.

Security note: rules true = open for hackathon; lock to auth before prod.
