const BASE='https://sih2026-b9ef7-default-rtdb.firebaseio.com'
const j = p => `${BASE}/${p}.json`
async function get(path){ const r=await fetch(j(path)); return r.ok? await r.json(): null }
async function put(path,data){ const r=await fetch(j(path),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); return r.ok? await r.json(): null }
async function post(path,data){ const r=await fetch(j(path),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); const d=await r.json(); return d?.name }
async function patch(path,data){ const r=await fetch(j(path),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); return r.ok? await r.json(): null }

export async function rtbCreateBatch(batch){
  const id=batch.id || `B-${Date.now().toString(36).toUpperCase()}`
  const payload={...batch,id,createdAt:Date.now(),status:batch.status||'created'}
  await put(`batches/${id}`,payload)
  await put(`transfers/${id}/init`,{batchId:id,from:'farmer',to:'farmer',weightKg:batch.farmerWeight||batch.weightKg,geo:batch.geo||'',txHash:'0x'+Math.random().toString(16).slice(2,10),ts:Date.now()})
  await put(`alerts/${id}_pickup`,{batchId:id,type:'pickup_request',severity:'medium',message:`Pickup requested for ${id}`,ts:Date.now()})
  return {id,...payload}
}
export async function rtbGetBatch(id){ return await get(`batches/${id}`) }
export async function rtbListBatches(){ const o=await get('batches'); return o? Object.values(o) : [] }
export async function rtbAddTransfer(batchId,data){ const key=Date.now().toString(36); await put(`transfers/${batchId}/${key}`,{...data,ts:Date.now(),txHash:'0x'+Math.random().toString(16).slice(2,10)}); await patch(`batches/${batchId}`,{status:data.nextStatus||'in_transit',lastTransfer:Date.now()}); return key }
export async function rtbAddQuality(batchId,rec){ const key=Date.now().toString(36); await put(`quality/${batchId}/${key}`,{...rec,ts:Date.now()}); await patch(`batches/${batchId}`,{labStatus:rec.passed?'PASS':'FAIL',lastQuality:Date.now()}); return key }
export async function rtbAddPackage(batchId,pkg){ await put(`packages/${batchId}`,{...pkg,ts:Date.now()}); await patch(`batches/${batchId}`,{status:'packaged',qrData:pkg.qrData}); return true }
export async function rtbListTransfers(batchId){ const o=await get(`transfers/${batchId}`); return o? Object.values(o).sort((a,b)=>a.ts-b.ts):[] }
export async function rtbOnValue(path,cb){ // polling fallback for true-rules REST streaming
  let timer=setInterval(async()=>{ const v=await get(path); cb(v)}, 2000)
  const init=await get(path); cb(init)
  return ()=>clearInterval(timer)
}
