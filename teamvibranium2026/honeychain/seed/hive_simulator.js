const BASE = process.env.API_URL || 'http://localhost:4000';
const HIVES = ['HIVE-KVIC-001','HIVE-KVIC-002','HIVE-KVIC-003','HIVE-KVIC-004'];
async function ensureHives() {
  for (const code of HIVES) {
    await fetch(`${BASE}/api/hives`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: 'Bearer dummy' }, body: JSON.stringify({ hiveCode: code, floraSource: ['Mustard','Eucalyptus','Lychee','Sunflower'][Math.floor(Math.random()*4)], beeSpecies: 'Apis mellifera' }) }).catch(()=>{});
  }
}
async function tick() {
  for (const code of HIVES) {
    const temp = (33 + Math.random()*3 + Math.sin(Date.now()/600000)*1.2).toFixed(1);
    const hum = (60 + Math.random()*18).toFixed(1);
    const weight = (22 + Math.random()*10).toFixed(2);
    const sound = (58 + Math.random()*18).toFixed(1);
    await fetch(`${BASE}/api/telemetry/ingest`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ hiveCode: code, tempC: Number(temp), humidityPct: Number(hum), weightKg: Number(weight), soundDb: Number(sound), batteryPct: 80+Math.floor(Math.random()*20) }) }).then(r=>r.json()).then(d=>console.log(new Date().toISOString(), code, d.count?'ok':'fail')).catch(e=>console.log('ingest fail', e.message));
  }
}
(async()=>{ await ensureHives(); console.log('simulator started, tick every 12s'); await tick(); setInterval(tick, 12000); })();
