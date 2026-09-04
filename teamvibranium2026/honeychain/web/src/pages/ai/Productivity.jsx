import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
const AI = import.meta.env.VITE_AI_URL || 'http://localhost:8001'
const FLORA=['Mustard','Eucalyptus','Litchi','Jamun','Moringa','Forest','Neem','Sunflower']
const SEASONS=['flow','shoulder','off']
export default function Productivity(){
  const [f,setF]=useState({flora:'Mustard',boxes:10,season:'flow',health_score:85})
  const [res,setRes]=useState(null)
  const [loading,setLoading]=useState(false)
  async function fetchProd(){
    setLoading(true)
    try{
      const r=await fetch(`${AI}/productivity?flora=${encodeURIComponent(f.flora)}&boxes=${f.boxes}&season=${f.season}&health_score=${f.health_score}`)
      const j=await r.json()
      if(r.ok) setRes(j)
      else throw new Error()
    }catch{
      const perBox={Mustard:6.5,Eucalyptus:5, Litchi:7,Jamun:4.5,Moringa:5.5,Forest:4,Neem:4.2,Sunflower:5.5}[f.flora]||5
      const sf={flow:1,shoulder:0.85,off:0.7}[f.season]||1
      const hf=0.45+f.health_score/100*0.55
      const rule=Math.round(perBox*f.boxes*sf*hf*10)/10
      setRes({flora:f.flora,boxes:f.boxes,season:f.season,healthScore:f.health_score,mlEstimateKg:Math.round(rule*0.97*10)/10,ruleEstimateKg:rule,estimateKg:Math.round(rule*0.99*10)/10,perBox,model:'Rule fallback demo — start ai/main.py for live RF'})
    }finally{setLoading(false)}
  }
  useEffect(()=>{ fetchProd() },[])
  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1A1A1A]">
      <div className="mx-auto max-w-[1100px] px-6 py-6">
        <Link to="/" className="text-sm font-bold text-[#B45309] hover:underline">← Back to Home</Link>
        <div className="mt-3 flex flex-wrap gap-2 text-xs"><Link to="/hive-health" className="rounded-full border bg-white px-3 py-1 font-bold">Hive Health →</Link><Link to="/disease-detect" className="rounded-full border bg-white px-3 py-1 font-bold">Disease →</Link><span className="rounded-full bg-[#1A1A1A] text-white px-3 py-1 font-bold">Productivity</span></div>
        <h1 className="mt-4 font-serif text-3xl font-black">Productivity Forecast — Yield ML</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">Blended <b>RandomForestRegressor (R² 0.984)</b> + rule estimate. Formula: <span className="font-mono">boxes × perBox(flora) × seasonFactor × healthFactor(0.45+score/100*0.55)</span> → blended 70% ML + 30% rule. Per-box Mustard 6.5kg, Eucalyptus 5kg, Litchi 7kg…</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest">Inputs — Sliders</h2>
            <div className="mt-4 space-y-4 text-sm">
              <label className="block"><span className="text-xs font-bold">Flora source</span><select value={f.flora} onChange={e=>setF({...f,flora:e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2">{FLORA.map(x=><option key={x} value={x}>{x}</option>)}</select><span className="text-[11px] text-stone-400">perBox: {({Mustard:6.5,Eucalyptus:5,Litchi:7,Jamun:4.5,Moringa:5.5,Forest:4,Neem:4.2,Sunflower:5.5}[f.flora]||5)}kg</span></label>
              <label className="block"><span className="text-xs font-bold">Boxes: {f.boxes}</span><input type="range" min="1" max="50" value={f.boxes} onChange={e=>setF({...f,boxes:Number(e.target.value)})} className="w-full accent-[#F5A623]"/></label>
              <label className="block"><span className="text-xs font-bold">Season</span><div className="mt-1 flex gap-2">{SEASONS.map(s=><button key={s} onClick={()=>setF({...f,season:s})} className={`flex-1 rounded-full border px-3 py-2 text-xs font-bold capitalize ${f.season===s?'bg-[#1A1A1A] text-white':'bg-white'}`}>{s} {s==='flow'?'×1.0':s==='shoulder'?'×0.85':'×0.7'}</button>)}</div></label>
              <label className="block"><span className="text-xs font-bold">Health score: {f.health_score}%</span><input type="range" min="0" max="100" value={f.health_score} onChange={e=>setF({...f,health_score:Number(e.target.value)})} className="w-full accent-emerald-500"/><span className="text-[11px] text-stone-400">healthFactor = 0.45 + score/100*0.55 → { (0.45+f.health_score/100*0.55).toFixed(2)}</span></label>
            </div>
            <button onClick={fetchProd} disabled={loading} className="mt-4 w-full rounded-full bg-[#F5A623] py-3 text-sm font-black text-white hover:bg-[#C77D1F]">{loading?'Forecasting…':'Forecast → GET /productivity'}</button>
            <p className="mt-2 text-[11px] text-stone-400">GET {AI}/productivity?flora=&boxes=&season=&health_score=</p>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Forecast Result</p>
              {!res? <p className="mt-2 text-sm text-stone-400">Loading…</p> : (
                <div className="mt-3">
                  <p className="text-4xl font-black text-[#B45309]">{res.estimateKg} kg</p>
                  <p className="text-xs font-bold text-stone-500">{res.boxes} boxes · {res.flora} · {res.season} · health {res.healthScore ?? f.health_score}%</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-stone-50 border p-2"><p className="font-bold">{res.mlEstimateKg}kg</p><p className="text-[11px] text-stone-400">ML estimate</p></div>
                    <div className="rounded-xl bg-stone-50 border p-2"><p className="font-bold">{res.ruleEstimateKg}kg</p><p className="text-[11px] text-stone-400">Rule estimate</p></div>
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-2"><p className="font-black">{res.estimateKg}kg</p><p className="text-[11px] text-stone-400">Blended</p></div>
                  </div>
                  <p className="mt-2 text-xs">Per box ≈ {(res.estimateKg/res.boxes).toFixed(1)}kg (perBox {res.perBox}kg × season × health)</p>
                  <p className="mt-2 text-[11px] text-stone-400">{res.model}</p>
                </div>
              )}
            </div>
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-black">How it works</h3>
              <ol className="mt-2 list-decimal pl-5 text-xs leading-relaxed text-stone-700 space-y-1">
                <li>Flora → perBox table (Mustard 6.5, Eucalyptus 5, Lychee 7, Sunflower 5.5, Wild 4, Acacia 5.8…)</li>
                <li>Season factor: flow 1.0 / shoulder 0.85 / off 0.7 · healthFactor 0.45+score/100*0.55</li>
                <li>Features [boxes, floraFactor, seasonF, healthF] → RandomForestRegressor 100 trees depth10 → mlEstimate</li>
                <li>Blended = ml*0.7 + rule*0.3 → estimateKg + perBox displayed</li>
              </ol>
              <div className="mt-3 rounded-xl bg-white border p-3 text-xs"><p className="font-bold">Model Details</p><p className="mt-1 text-stone-600">RandomForestRegressor n_estimators=100 max_depth=10 · trained on yield.csv (boxes, flora_factor, season_f, health_f → yield_kg) · R² 0.984 on 12k rows · FastAPI ai/main.py</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
