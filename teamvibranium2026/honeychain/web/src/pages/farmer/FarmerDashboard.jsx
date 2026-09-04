import { useState, useEffect } from 'react'
import { rtbCreateBatch, rtbListBatches } from '../../lib/rtb'
import jsPDF from 'jspdf'
import MobileSensorDemo from '../../components/MobileSensorDemo'

const pal = { honey: '#F5A623', dark: '#1A1A1A', bg: '#FAF7F0' }

function IHome(p){ return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 9 12 2l9 7v11a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/><path d="M9 21V11h6v10"/></svg> }
function IPlus(p){ return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg> }
function IPkg(p){ return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="m16 16 4-4-8-8-8 8 4 4"/><path d="M2 12 12 2l10 10-4 4-6-6-6 6z"/><path d="M12 22V12"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/></svg> }
function IFile(p){ return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> }
function IBell(p){ return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7-6 5-6 7H6c0-2-6 0-6-7"/><path d="M10 21a2 2 0 0 0 4 0"/></svg> }
function IMapPin(p){ return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> }
function ICamera(p){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M14 4 16 6h4a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4l2-2z"/><circle cx="12" cy="13" r="4"/><path d="M12 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/></svg> }
function IVideo(p){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 12 6-4v8l-6-4Z"/></svg> }

const species = [
  { id:'cerana', label:'Apis cerana indica', sub:'Indian Hive Bee', color:'#F6C453', img:'/species/cerana.jpg' },
  { id:'mellifera', label:'Apis mellifera', sub:'Western Honey Bee', color:'#E9A825', img:'/species/mellifera.jpg' },
  { id:'dorsata', label:'Apis dorsata', sub:'Rock Bee', color:'#C67A15', img:'/species/dorsata.jpg' },
  { id:'florea', label:'Apis florea', sub:'Little Bee', color:'#E9B9A0', img:'/species/florea.jpg' },
  { id:'trigona', label:'Trigona sp.', sub:'Stingless Bee', color:'#7A4A1A', img:'/species/trigona.jpg' },
]
const flora = [
  { n:'Mustard', c:'#F2B705', f:'#F5D76E', img:'/flora/mustard.jpg' },
  { n:'Eucalyptus', c:'#C9A86A', f:'#D8C99B', img:'/flora/eucalyptus.jpg' },
  { n:'Litchi', c:'#E8AFAF', f:'#F9C4B4', img:'/flora/litchi.jpg' },
  { n:'Jamun', c:'#5B2C6F', f:'#8E6B9E', img:'/flora/jamun.jpg' },
  { n:'Moringa', c:'#A3C585', f:'#DDEDC0', img:'/flora/moringa.jpg' },
  { n:'Forest', c:'#3A5A40', f:'#7FA37A', img:'/flora/forest.jpg' },
  { n:'Neem', c:'#8DB580', f:'#C7E0B8', img:'/flora/neem.jpg' },
  { n:'Sunflower', c:'#FFC300', f:'#FFE27A', img:'/flora/sunflower.jpg' },
]
async function farmDisease(){ const AI=import.meta.env.VITE_AI_URL||'http://localhost:8001'; try{ const r=await fetch(AI+'/disease?month=7&temp_c=30&humidity_pct=80'); const j=r.ok?await r.json():null; alert(j?'Disease '+j.risk+' '+j.score:'Demo: high 80 varroa')}catch{ alert('Demo: high 80')} }
async function farmProd(){ const AI=import.meta.env.VITE_AI_URL||'http://localhost:8001'; try{ const r=await fetch(AI+'/productivity?flora=Mustard&boxes=10&season=flow&health_score=85'); const j=r.ok?await r.json():null; alert(j?'Productivity '+j.estimateKg+'kg':'Demo: 56.9kg')}catch{ alert('Demo: 56.9kg')} }
const initialApiaries = [
  { id:1, name:'North Grove — Tiruvallur', hives:12, gps:'13.132, 79.972' },
  { id:2, name:'River Edge — Poondi', hives:8, gps:'13.185, 80.061' },
  { id:3, name:'Hill View — Uthukottai', hives:5, gps:'13.342, 79.902' },
]

export default function FarmerDashboard(){
  const [tab,setTab]=useState('dashboard')
  const [step,setStep]=useState(1)
  const [apiaries,setApiaries]=useState(initialApiaries)
  const [showAdd,setShowAdd]=useState(false)
  const [newApi,setNewApi]=useState({name:'',gps:'',hives:5,flora:'Mustard'})
  const [apiary,setApiary]=useState(1)
  const [bee,setBee]=useState('mellifera')
  const [flower,setFlower]=useState('Mustard')
  const [weight,setWeight]=useState(12.5)
  const [date,setDate]=useState('2026-08-26')
  const [saved,setSaved]=useState(false)
  const [reports,setReports]=useState([])
  useEffect(()=>{ if(tab!=='reports') return; (async()=>{ try{ const all=await rtbListBatches(); const r=all.filter(b=> b.status==='tested'||b.status==='packaged').map(b=> `${b.id} ${b.status==='tested'?'Passed':b.status} ${new Date(b.createdAt||Date.now()).toISOString().slice(0,10)}`); if(r.length) setReports(r); }catch(e){} })(); },[tab])
  const harvested = 342
  const verified = 28
  const pending = 3

  return (
    <div className="min-h-screen flex" style={{ background: pal.bg, color: pal.dark }}>
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r bg-white sticky top-0 h-screen">
        <div className="px-6 py-5 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-white" style={{ background: pal.honey }}>H</div>
          <span className="font-black tracking-tight" style={{ color: pal.dark }}>HoneyChain</span>
        </div>
        <nav className="px-3 space-y-1 mt-2">
          {[
            { k:'dashboard', l:'Dashboard', I:IHome },
            { k:'harvest', l:'New Harvest', I:IPlus },
            { k:'batches', l:'Batches', I:IPkg },
            { k:'reports', l:'Reports', I:IFile },
            { k:'alerts', l:'Alerts', I:IBell },
          ].map(it=>(
            <button key={it.k} onClick={()=>setTab(it.k)} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${tab===it.k?'text-white':'text-stone-600 hover:bg-stone-50'}`} style={tab===it.k?{background:pal.dark}:{}}>
              <it.I /> {it.l} {it.k==='alerts'&&<span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">3</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-3">
            <img src="https://i.pravatar.cc/100?img=12" alt="profile" className="h-9 w-9 rounded-full object-cover border" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">Ravi Kumar</div>
              <div className="text-xs text-stone-500">KVIC-2024-1042</div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-stone-500 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">Offline ready — data saved locally and auto-syncs when online.</div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-[1120px] mx-auto p-4 md:p-7">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-[26px] font-black tracking-tight">Good morning, Ravi</h1>
              <p className="text-sm text-stone-500">Tiruvallur • 12 hives • Last sync 2h ago</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500"><span className="h-2 w-2 rounded-full bg-emerald-500"/> Online • GPS locked</div>
          </div>

          {tab==='dashboard' && (<>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white border p-4">
              <div className="text-xs font-semibold tracking-widest text-stone-500">TOTAL HARVESTED</div>
              <div className="mt-1 flex items-baseline gap-2"><span className="text-2xl font-black">{harvested} kg</span><span className="text-xs font-medium text-emerald-600">+12% this month</span></div>
              <svg viewBox="0 0 120 36" className="mt-3 w-full h-9"><polyline fill="none" stroke={pal.honey} strokeWidth="2.2" points="0,28 20,22 40,26 60,14 80,18 100,6 120,10"/><circle cx="120" cy="10" r="3" fill={pal.honey}/></svg>
              <div className="text-[11px] text-stone-400">Trend — last 6 harvests</div>
            </div>
            <div className="rounded-2xl bg-white border p-4">
              <div className="text-xs font-semibold tracking-widest text-stone-500">BATCHES VERIFIED</div>
              <div className="mt-1 text-2xl font-black">{verified}</div>
              <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1">On-chain verified</div>
              <div className="mt-2 text-[11px] text-stone-400">Lab + QA completed</div>
            </div>
            <div className={`rounded-2xl border p-4 ${pending>0?'bg-amber-50 border-amber-200':'bg-white'}`}>
              <div className="text-xs font-semibold tracking-widest text-stone-500">PENDING SYNC</div>
              <div className="mt-1 flex items-center gap-2"><span className={`text-2xl font-black ${pending>0?'text-amber-600':''}`}>{pending}</span>{pending>0&&<span className="text-xs font-bold text-amber-700 bg-white border border-amber-200 px-2 py-0.5 rounded-full">Action needed</span>}</div>
              <div className="mt-2 text-xs text-stone-600">{pending>0?'Amber — will auto-upload when online':'All batches synced'}</div>
            </div>
          </div>

          <MobileSensorDemo />
          <div className="mt-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-black text-sm">🐝 IoT + AI — Dedicated Prediction Pages (Judge Demo)</h2><a href="/hive-health" className="rounded-full bg-[#1A1A1A] px-4 py-1.5 text-xs font-bold text-white hover:bg-black">Open AI Pages →</a></div>
            <p className="mt-1 text-xs text-stone-600">RTDB live · AI RandomForest 12k Kaggle · temp/humidity/weight/sound every 12s · image ML via Gemini Vision</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <a href="/hive-health" className="rounded-xl bg-white border p-4 hover:shadow-md transition text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Hive Health — IoT + ML</p>
                <p className="mt-1 text-lg font-black">32–37°C Healthy</p>
                <p className="text-xs text-stone-500">Brood zone 32-37°C · Hum 50-75% · Sound 58-68 dB → healthy/attention/critical</p>
                <p className="mt-2 text-xs font-bold text-amber-600">Live demo → /hive-health</p>
              </a>
              <a href="/disease-detect" className="rounded-xl bg-white border p-4 hover:shadow-md transition text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-red-600">Disease Forecast — IMAGE ML</p>
                <p className="mt-1 text-lg font-black">Varroa · Foulbrood</p>
                <p className="text-xs text-stone-500">Upload bee/hive photo → Gemini Vision + seasonal /disease → high/medium/low + solution</p>
                <p className="mt-2 text-xs font-bold text-amber-600">Image ML → /disease-detect</p>
              </a>
              <a href="/productivity" className="rounded-xl bg-white border p-4 hover:shadow-md transition text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-sky-600">Productivity — AI</p>
                <p className="mt-1 text-lg font-black">22 kg Forecast</p>
                <p className="text-xs text-stone-500">Flora × season × health → ML+rule blended · 2.2 kg/box · Mustard flow season · R² 0.984</p>
                <p className="mt-2 text-xs font-bold text-amber-600">Forecast → /productivity</p>
              </a>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]"><span className="rounded-full bg-white border px-2.5 py-1 font-bold">HIVE-KVIC-001 34.5°C</span><span className="rounded-full bg-white border px-2.5 py-1 font-bold">Varroa 2 mites low risk</span><span className="rounded-full bg-white border px-2.5 py-1 font-bold">Yield 22kg /10 boxes</span><span className="rounded-full bg-emerald-500 text-white px-2.5 py-1 font-bold">● Dedicated AI pages + console</span></div>
          </div>

          <div className="mt-6 rounded-2xl bg-white border p-4">
            <div className="flex items-center justify-between"><h2 className="font-bold">Apiary Map</h2><span className="text-xs text-stone-500">Leaflet • offline tiles cached</span></div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2 snap-x">
              {apiaries.map(a=>(
                <div key={a.id} className="min-w-[220px] snap-start rounded-xl border overflow-hidden bg-[#FAF7F0]">
                  <div className="h-[110px] bg-stone-200 relative">
                    <div className="absolute inset-0 opacity-60" style={{ background:`radial-gradient(circle at 30% 30%, #fff, transparent 40%), linear-gradient(135deg, #E9E4D9, #DDE8D0)` }}/>
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-20"><div className="col-span-6 row-span-4 border border-stone-400/30"/></div>
                    <div className="absolute inset-0 flex items-center justify-center"><span className="rounded-full bg-white shadow px-2 py-1 text-xs font-semibold flex items-center gap-1"><IMapPin/> Map thumb</span></div>
                  </div>
                  <div className="p-3"><div className="text-sm font-semibold leading-tight">{a.name}</div><div className="text-xs text-stone-500">{a.hives} hives • {a.gps}</div></div>
                </div>
              ))}
              <button onClick={()=>setShowAdd(true)} className="min-w-[220px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-sm text-stone-600 bg-white hover:bg-amber-50 hover:border-amber-300"><span className="text-lg">＋</span>Register New Hive / Apiary</button>
            </div>
            {showAdd && (<div className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
              <h4 className="font-bold text-sm">Register New Hive / Apiary</h4>
              <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                <input placeholder="Apiary name (e.g. South Field — Madurai)" value={newApi.name} onChange={e=>setNewApi({...newApi,name:e.target.value})} className="rounded-lg border px-3 py-2"/>
                <input placeholder="Hive count (e.g. 8)" type="number" value={newApi.hives} onChange={e=>setNewApi({...newApi,hives:Number(e.target.value)})} className="rounded-lg border px-3 py-2"/>
                <input placeholder="GPS auto (e.g. 13.123, 79.123) — tap Get Location" value={newApi.gps} onChange={e=>setNewApi({...newApi,gps:e.target.value})} className="rounded-lg border px-3 py-2"/>
                <select value={newApi.flora} onChange={e=>setNewApi({...newApi,flora:e.target.value})} className="rounded-lg border px-3 py-2"><option>Mustard</option><option>Eucalyptus</option><option>Litchi</option><option>Jamun</option><option>Moringa</option><option>Forest</option><option>Neem</option><option>Sunflower</option></select>
                <button onClick={()=>{ if(!newApi.name||!newApi.gps) return alert('Enter name & GPS'); const id=Math.max(...apiaries.map(a=>a.id))+1; const nxt={id,name:newApi.name,hives:newApi.hives,gps:newApi.gps}; setApiaries([...apiaries,nxt]); setApiary(id); setShowAdd(false); setNewApi({name:'',gps:'',hives:5,flora:'Mustard'}) }} className="rounded-full bg-[#F5A623] text-white font-bold py-2">Save Apiary</button>
                <button onClick={()=>setShowAdd(false)} className="rounded-full border bg-white py-2 font-semibold">Cancel</button>
                <button onClick={()=>{ if(navigator.geolocation) navigator.geolocation.getCurrentPosition(p=> setNewApi({...newApi,gps:`${p.coords.latitude.toFixed(3)}, ${p.coords.longitude.toFixed(3)}`}))}} className="sm:col-span-2 text-xs text-[#F5A623] font-bold underline">Use my location (auto GPS)</button>
              </div>
            </div>)}
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-3">
            {[
              { c:'#F59E0B', t:'Varroa risk high Sep-Oct', d:'Inspect brood frames this week' },
              { c:'#10B981', t:'Yield forecast 22 kg', d:'Moringa bloom + rain → harvest in 4 days' },
              { c:'#EF4444', t:'Pending lab pickup', d:'Batch #1042 — schedule collection' },
            ].map(a=>(
              <div key={a.t} className="rounded-xl bg-white border p-3 flex gap-3" style={{ borderLeft:`4px solid ${a.c}` }}>
                <div className="h-2 w-2 rounded-full mt-1.5" style={{ background:a.c }}/>
                <div><div className="text-sm font-semibold leading-tight">{a.t}</div><div className="text-xs text-stone-500">{a.d}</div></div>
              </div>
            ))}
          </div>
          </>)}

          {tab==='harvest' && (<>
          <div className="mt-8">
            <div className="flex items-center gap-2"><h2 className="text-lg font-black">New Harvest</h2><span className="text-xs bg-stone-900 text-white px-2 py-1 rounded-full">5 steps</span></div>
            <div className="mt-3 flex items-center gap-2">
              {[1,2,3,4,5].map(n=>(
                <div key={n} className="flex items-center gap-2 flex-1">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border ${step>=n?'text-white border-transparent':'bg-white text-stone-500'}`} style={step>=n?{background:pal.honey}:{}}>{n}</div>
                  {n<5&&<div className={`h-1 flex-1 rounded ${step>n?'':'bg-stone-200'}`} style={step>n?{background:pal.honey}:{}}/>}
                </div>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[11px] font-medium text-stone-500"><span>Apiary</span><span>Species</span><span>Flora</span><span>Details</span><span>Review</span></div>
          </div>

          {step===1&&(
            <section className="mt-4 rounded-2xl bg-white border p-4">
              <h3 className="font-bold">Step 1 — Choose Apiary</h3><p className="text-xs text-stone-500">Select where this harvest was collected</p>
              <div className="mt-3 grid sm:grid-cols-3 gap-3">
                {apiaries.map(a=>(
                  <button key={a.id} onClick={()=>setApiary(a.id)} className={`text-left rounded-xl border-2 overflow-hidden ${apiary===a.id?'border-amber-400':'border-stone-200'}`}>
                    <div className="h-24 bg-stone-100 relative"><div className="absolute inset-0" style={{ background:`linear-gradient(135deg,#EDE9DD,#DCE9D8)` }}/><span className="absolute bottom-1 left-1 text-[10px] bg-white px-1.5 py-0.5 rounded border">{a.gps}</span></div>
                    <div className="p-3"><div className="text-sm font-semibold">{a.name}</div><div className="text-xs text-stone-500">{a.hives} hives</div></div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex justify-end"><button onClick={()=>setStep(2)} className="rounded-full px-5 py-2 text-sm font-bold text-white" style={{ background: pal.dark }}>Continue</button></div>
            </section>
          )}

          {step===2&&(
            <section className="mt-4 rounded-2xl bg-white border p-4">
              <h3 className="font-bold">Step 2 — Bee Species</h3><p className="text-xs text-stone-500">Choose the species for this batch</p>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
                {species.map(s=>(
                  <button key={s.id} onClick={()=>setBee(s.id)} className={`rounded-xl border-2 p-2 text-left overflow-hidden ${bee===s.id?'border-amber-400 bg-amber-50/60':'border-stone-200 bg-white'}`}>
                    <img src={s.img} alt={s.label} className="h-20 w-full rounded-lg object-cover border" loading="lazy" referrerPolicy="no-referrer"/>
                    <div className="mt-2 flex items-center gap-2"><span className="h-3 w-3 rounded-full border" style={{ background:s.color }}/><span className="text-xs font-medium">Honey</span></div>
                    <div className="text-sm font-semibold leading-tight mt-1">{s.label}</div><div className="text-[11px] text-stone-500">{s.sub}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex justify-between"><button onClick={()=>setStep(1)} className="rounded-full border px-5 py-2 text-sm font-semibold">Back</button><button onClick={()=>setStep(3)} className="rounded-full px-5 py-2 text-sm font-bold text-white" style={{ background: pal.dark }}>Continue</button></div>
            </section>
          )}

          {step===3&&(
            <section className="mt-4 rounded-2xl bg-white border p-4">
              <h3 className="font-bold">Step 3 — Honey / Flora Source</h3><p className="text-xs text-stone-500">Mustard / Eucalyptus / Litchi / Jamun / Moringa / Forest / Neem / Sunflower</p>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                {flora.map(f=>(
                  <button key={f.n} onClick={()=>setFlower(f.n)} className={`rounded-xl border-2 overflow-hidden text-left ${flower===f.n?'border-amber-400':'border-stone-200'}`}>
                    <div className="h-20 relative"><img src={f.img} alt={f.n} className="h-20 w-full object-cover" loading="lazy" referrerPolicy="no-referrer"/><span className="absolute top-2 right-2 h-5 w-5 rounded-full border-2 border-white shadow" style={{ background:f.c }} title="honey swatch"/></div>
                    <div className="p-2.5 bg-white"><div className="text-sm font-semibold">{f.n}</div><div className="text-[11px] text-stone-500">Flora honey</div></div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex justify-between"><button onClick={()=>setStep(2)} className="rounded-full border px-5 py-2 text-sm font-semibold">Back</button><button onClick={()=>setStep(4)} className="rounded-full px-5 py-2 text-sm font-bold text-white" style={{ background: pal.dark }}>Continue</button></div>
            </section>
          )}

          {step===4&&(
            <section className="mt-4 rounded-2xl bg-white border p-4">
              <h3 className="font-bold">Step 4 — Batch Details</h3>
              <div className="mt-3 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold tracking-widest text-stone-500">WEIGHT (KG)</label>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={()=>setWeight(v=>Math.max(0.5, +(v-0.5).toFixed(1)))} className="h-10 w-10 rounded-full border bg-white font-bold">-</button>
                    <div className="flex-1 rounded-xl border bg-[#FAF7F0] px-4 py-3 text-center"><span className="text-xl font-black">{weight.toFixed(1)}</span><span className="text-sm text-stone-500"> kg</span></div>
                    <button onClick={()=>setWeight(v=>+(v+0.5).toFixed(1))} className="h-10 w-10 rounded-full text-white font-bold" style={{ background: pal.honey }}>+</button>
                  </div>
                  <label className="mt-4 block text-xs font-semibold tracking-widest text-stone-500">HARVEST DATE</label>
                  <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 text-sm" />
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border p-3 bg-stone-50">
                    <div className="text-xs font-semibold flex items-center gap-1.5"><ICamera/> Photo — camera thumb + hash on-chain</div>
                    <div className="mt-2 h-24 rounded-lg border-2 border-dashed bg-white flex items-center justify-center text-xs text-stone-500">Tap to capture / upload</div>
                  </div>
                  <div className="rounded-xl border p-3 bg-stone-50">
                    <div className="text-xs font-semibold flex items-center gap-1.5"><IVideo/> Video 10-20s — bulk hash off-chain</div>
                    <div className="mt-2 flex items-center gap-2"><div className="h-16 flex-1 rounded-lg border-2 border-dashed bg-white flex items-center justify-center text-xs text-stone-500">Record 10-20s</div><span className="text-xs text-stone-500">MP4</span></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-between"><button onClick={()=>setStep(3)} className="rounded-full border px-5 py-2 text-sm font-semibold">Back</button><button onClick={()=>setStep(5)} className="rounded-full px-5 py-2 text-sm font-bold text-white" style={{ background: pal.dark }}>Review</button></div>
            </section>
          )}

          {step===5&&(
            <section className="mt-4 rounded-2xl bg-white border p-4">
              <h3 className="font-bold">Step 5 — Review & Submit</h3>
              <div className="mt-3 rounded-xl border bg-[#FAF7F0] p-4 text-sm">
                <div className="grid grid-cols-2 gap-2"><span className="text-stone-500">Apiary</span><span className="font-semibold">{apiaries.find(a=>a.id===apiary)?.name}</span><span className="text-stone-500">Bee Species</span><span className="font-semibold">{species.find(s=>s.id===bee)?.label}</span><span className="text-stone-500">Flora</span><span className="font-semibold">{flower} honey</span><span className="text-stone-500">Weight</span><span className="font-semibold">{weight.toFixed(1)} kg</span><span className="text-stone-500">Date</span><span className="font-semibold">{date}</span></div>
                <div className="mt-3 text-xs text-stone-500">GPS auto-captured • photo hash on-chain, bulk hash off-chain</div>
              </div>
              {!saved?(
                <button onClick={async()=>{
                  const batch={ id:`B-${Date.now().toString(36).toUpperCase()}`, flora, beeSpecies:bee, weightKg:weight, farmerWeight:weight, harvestDate:date, apiary:apiaries.find(a=>a.id===apiary)?.name||'Apiary', geo:apiaries.find(a=>a.id===apiary)?.gps||'', photoHash:'local', status:'created', farmer:{name:'Ravi Kumar',story:'Tiruvallur mustard fields'} }
                  await rtbCreateBatch(batch); setSaved(true)
                }} className="mt-4 w-full rounded-full py-3 font-bold text-white" style={{ background: pal.honey }}>Submit Batch → RTDB direct (pickup alert to Lab)</button>
              ):(
                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center"><div className="text-sm font-bold text-emerald-700">Saved to Firebase RTDB</div><div className="text-xs text-stone-500">Direct to https://sih2026-b9ef7-default-rtdb.firebaseio.com/batches — visible in app instantly</div></div>
              )}
              <div className="mt-3 flex justify-between"><button onClick={()=>{setSaved(false);setStep(4)}} className="text-sm font-semibold text-stone-600">Back to edit</button><button onClick={()=>{setSaved(false);setStep(1)}} className="text-sm font-semibold" style={{ color: pal.honey }}>New batch</button></div>
            </section>
          )}
          </>)}
          {tab==='batches' && (<section className="mt-6 rounded-2xl bg-white border p-4"><h3 className="font-bold">My Batches</h3><div className="mt-3 space-y-2">{[{id:'B-1042',w:'42.0 kg',s:'Verified',c:'green'},{id:'B-1043',w:'18.5 kg',s:'At Lab',c:'blue'},{id:'B-1044',w:'22.0 kg',s:'Pending Sync',c:'grey'}].map(b=><div key={b.id} className="flex items-center gap-3 rounded-xl border p-3"><img src={`https://picsum.photos/seed/${b.id}/80/80`} className="h-12 w-12 rounded-lg object-cover border"/><div className="flex-1"><div className="text-sm font-bold">{b.id} • {b.w}</div><div className="text-xs text-stone-500">2026-08-26 • Moringa</div></div><span className={`text-xs font-bold px-2 py-1 rounded-full border ${b.c==='green'?'bg-emerald-50 text-emerald-700':b.c==='blue'?'bg-sky-50 text-sky-700':'bg-stone-100 text-stone-600'}`}>{b.s}</span></div>)}</div></section>)}
          {tab==='reports' && (<section className="mt-6 rounded-2xl bg-white border p-4"><h3 className="font-bold">Reports & Certificates</h3><div className="mt-3 space-y-2">{(reports.length?reports:['B-1042 Passed 2026-08-20','B-1040 Passed 2026-08-12']).map(r=>{
            const download=()=>{
              const doc=new jsPDF(); doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.text('HoneyChain — Harvest Certificate',10,15); doc.setFontSize(11); doc.setFont('helvetica','normal'); doc.text(r,10,25); doc.text('Farmer: Ravi Kumar — Tiruvallur',10,35); doc.text('Status: Lab PASS — NMR verified pure',10,45); doc.text('Blockchain: Polygon Amoy — tx anchored',10,55); doc.text('Downloaded from Farmer Portal /reports',10,65); doc.save(`Certificate-${r.split(' ')[0]}.pdf`)
            }
            return <div key={r} className="flex items-center justify-between rounded-xl border p-3"><span className="text-sm">{r}</span><button onClick={download} className="rounded-full bg-[#1A1A1A] text-white text-xs font-bold px-3 py-1.5 hover:bg-black">Download PDF ↓</button></div>
          })}</div></section>)}
          {tab==='alerts' && (<section className="mt-6 rounded-2xl bg-white border p-4"><h3 className="font-bold">Alerts</h3><div className="mt-3 space-y-2">{[{t:'Varroa risk',d:'Inspect brood frames'},{t:'Yield forecast 22kg',d:'Harvest in 4 days'},{t:'Lab pickup pending',d:'B-1042 schedule'}].map(a=><div key={a.t} className="rounded-xl border p-3"><div className="text-sm font-bold">{a.t}</div><div className="text-xs text-stone-500">{a.d}</div></div>)}</div></section>)}

          <div className="mt-6 text-[11px] text-stone-400">HoneyChain Farmer Portal • Offline-first • Tailwind warm palette</div>
        </div>
      </main>
    </div>
  )
}
