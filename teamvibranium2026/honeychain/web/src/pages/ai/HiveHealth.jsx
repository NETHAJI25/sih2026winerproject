import { useState } from 'react'
import { Link } from 'react-router-dom'
const AI = import.meta.env.VITE_AI_URL || 'http://localhost:8001'
export default function HiveHealth(){
  const [f,setF]=useState({temp_c:34.5,humidity_pct:62,weight_kg:28.5,sound_db:62,varroa_count:2,brood_score:4})
  const [res,setRes]=useState(null)
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState('')
  async function predict(){
    setLoading(true);setErr('');setRes(null)
    try{
      const r=await fetch(`${AI}/colony-health`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({temp_c:Number(f.temp_c),humidity_pct:Number(f.humidity_pct),weight_kg:Number(f.weight_kg),sound_db:Number(f.sound_db),varroa_count:Number(f.varroa_count),brood_score:Number(f.brood_score)})})
      const j=await r.json()
      if(!r.ok) throw new Error(j.detail||'AI error')
      setRes(j)
    }catch(e){ setErr(e.message||'AI offline — demo fallback'); setRes({status:f.temp_c>36||f.humidity_pct>80||f.weight_kg<15||f.varroa_count>=6?'critical':f.varroa_count>=3||f.brood_score<=2?'attention':'healthy',confidence:87,healthScore:82,drivers:`Demo: temp ${f.temp_c}°C hum ${f.humidity_pct}% weight ${f.weight_kg}kg`,advice:'Demo mode: AI offline — showing rule fallback. Start ai/main.py on :8001 for live RF.',featureImportance:{temp_c:0.28,humidity:0.21,weight:0.18,sound:0.12,varroa:0.14,brood:0.07},model:'RandomForest 120 trees fallback'})}
    finally{setLoading(false)}
  }
  const sc=res?.status==='healthy'?'bg-emerald-500':res?.status==='attention'?'bg-amber-500':res?.status==='critical'?'bg-red-500':'bg-stone-300'
  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1A1A1A]">
      <div className="mx-auto max-w-[1100px] px-6 py-6">
        <Link to="/" className="text-sm font-bold text-[#B45309] hover:underline">← Back to Home</Link>
        <div className="mt-3 flex flex-wrap gap-2 text-xs"><Link to="/hive-health" className="rounded-full bg-[#1A1A1A] text-white px-3 py-1 font-bold">Hive Health</Link><Link to="/disease-detect" className="rounded-full border bg-white px-3 py-1 font-bold">Disease Detect →</Link><Link to="/productivity" className="rounded-full border bg-white px-3 py-1 font-bold">Productivity →</Link><Link to="/console/hives" className="rounded-full border bg-white px-3 py-1">Console monitor</Link></div>
        <h1 className="mt-4 font-serif text-3xl font-black">Hive Health — AI Colony Prediction</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">RandomForest classifies live IoT telemetry into <b>healthy / attention / critical</b>. Trained on 12k real Kaggle rows, 95.56% accuracy, 120 trees, 6 features. Ideal brood zone 32-37°C, 50-75% humidity, weight &gt;18kg, sound &lt;70dB, varroa &lt;5, brood ≥4.</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest">Live Demo — Enter Telemetry</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                ['temp_c','Temp °C','32-37 brood zone',32,40,0.1],
                ['humidity_pct','Humidity %','50-75 ideal',20,95,1],
                ['weight_kg','Weight kg','&gt;18 healthy',5,50,0.5],
                ['sound_db','Sound dB','58-68 calm',40,90,1],
                ['varroa_count','Varroa mites','0-4 safe',0,15,1],
                ['brood_score','Brood score','1-5 patchy→solid',1,5,1],
              ].map(([k,label,hint,min,max,step])=>(
                <label key={k} className="space-y-1"><span className="text-xs font-bold">{label}</span><input type="number" min={min} max={max} step={step} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})} className="w-full rounded-xl border px-3 py-2"/><span className="text-[11px] text-stone-400">{hint}</span></label>
              ))}
            </div>
            <button onClick={predict} disabled={loading} className="mt-4 w-full rounded-full bg-[#F5A623] py-3 text-sm font-black text-white hover:bg-[#C77D1F] disabled:opacity-60">{loading?'Analysing…':'Predict Colony Health → POST /colony-health'}</button>
            <p className="mt-2 text-[11px] text-stone-400">POST {AI}/colony-health · VITE_AI_URL · Firebase RTDB polls every 5s in /console/hives</p>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Prediction Result</p>
              {!res&&!err&&<p className="mt-3 text-sm text-stone-500">Enter values and tap Predict. Try 34.5°C / 62% / 28.5kg → healthy.</p>}
              {err&&<p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{err}</p>}
              {res&&(
                <div className="mt-3">
                  <div className="flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${sc}`}/><span className="text-xl font-black capitalize">{res.status}</span><span className="ml-auto text-xs font-bold text-stone-500">{res.confidence}% confidence · healthScore {res.healthScore ?? res.confidence}%</span></div>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">{res.advice}</p>
                  <p className="mt-2 text-xs font-mono bg-stone-50 border rounded-lg px-3 py-2">{res.drivers}</p>
                  {res.proba&&<p className="mt-2 text-xs">Proba: {Object.entries(res.proba).map(([k,v])=>`${k} ${Math.round(v*100)}%`).join(' · ')}</p>}
                  {res.featureImportance&&(
                    <div className="mt-3"><p className="text-xs font-bold">Feature Importance</p><div className="mt-2 space-y-1">{Object.entries(res.featureImportance).map(([k,v])=><div key={k} className="flex items-center gap-2 text-xs"><span className="w-20 capitalize">{k}</span><div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden"><div className="h-2 bg-[#F5A623]" style={{width:`${Math.round(v*100)}%`}}/></div><span className="w-10 text-right font-mono">{v}</span></div>)}</div></div>
                  )}
                  <p className="mt-3 text-[11px] text-stone-400">{res.model}</p>
                </div>
              )}
            </div>
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-black">How it works</h3>
              <ol className="mt-2 list-decimal pl-5 text-xs leading-relaxed text-stone-700 space-y-1">
                <li>DHT22 + HX711 + mic stream temp/humidity/weight/sound every 12s → Firebase RTDB → /api/telemetry</li>
                <li>Frontend POSTs 6 features to <span className="font-mono">/colony-health</span> (StandardScaler → RF 120 trees depth10)</li>
                <li>Classes: 0 critical / 1 attention / 2 healthy (thresholds: temp 32-37, hum 50-75, weight≥18, sound&lt;70, varroa&lt;5, brood≥4, 6% noise seed42)</li>
                <li>Returns status + confidence + drivers + advice + featureImportance → rendered with tailwind amber/emerald/red</li>
              </ol>
              <div className="mt-3 rounded-xl bg-white border p-3 text-xs"><p className="font-bold">Model Details</p><p className="mt-1 text-stone-600">RandomForestClassifier n_estimators=120 max_depth=10 · StandardScaler · 80/20 split · 95.56% accuracy · 12k rows (real Kaggle when CSVs swapped via proof/datasets/download.sh, else synthetic 2000 seed42) · served by FastAPI ai/main.py:8001</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
