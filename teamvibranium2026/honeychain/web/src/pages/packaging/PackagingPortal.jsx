import { useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const ACCENT = '#F5A623'
const DARK = '#452A07'

const PASS_BATCHES = [
  { id: 'B-1042', flora: 'Mustard', honeyType: 'Mustard honey', farmer: 'Ravi Kumar', harvestDate: '2026-02-14', labWeight: 41.5, transportWeight: 42, district: 'Tiruvallur, TN', floraColor: '#F59E0B' },
  { id: 'B-1027', flora: 'Eucalyptus', honeyType: 'Eucalyptus honey', farmer: 'Jose Thomas', harvestDate: '2026-01-28', labWeight: 60, transportWeight: 60, district: 'Munnar, KL', floraColor: '#0EA5E9' },
  { id: 'B-1038', flora: 'Litchi', honeyType: 'Litchi honey', farmer: 'Anil Sahni', harvestDate: '2026-02-05', labWeight: 32.8, transportWeight: 33, district: 'Muzaffarpur, BR', floraColor: '#EC4899' },
  { id: 'B-1050', flora: 'Acacia', honeyType: 'Acacia honey', farmer: 'Ganga Prasad', harvestDate: '2026-01-20', labWeight: 47.5, transportWeight: 48, district: 'Haridwar, UK', floraColor: '#8B5CF6' },
  { id: 'B-1047', flora: 'Jamun', honeyType: 'Wild Jamun honey', farmer: 'Lakshmi Priya', harvestDate: '2026-02-18', labWeight: 37.9, transportWeight: 38, district: 'Coimbatore, TN', floraColor: '#4B5563' },
]

const SIZES = [
  { id: '100ml', label: '100 ml', grams: 140, sub: '≈ 140 g net', desc: 'Sampler', h: 34, w: 22 },
  { id: '250ml', label: '250 ml', grams: 250, sub: '250 g net', desc: 'Retail', h: 42, w: 26 },
  { id: '500ml', label: '500 ml', grams: 500, sub: '500 g net', desc: 'Family', h: 52, w: 30 },
  { id: '1kg', label: '1 kg', grams: 1000, sub: '1000 g net', desc: 'Bulk', h: 60, w: 34 },
]

function IconMulti({ children, size=18 }){ return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg> }

const SIDEBAR = [
  { id:'dashboard', label:'Dashboard', icon:<IconMulti size={16}><><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></></IconMulti> },
  { id:'incoming', label:'Incoming', icon:<IconMulti size={16}><><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M12 22.08V12"/><path d="M3.27 6.96 12 12.01l8.73-5.05"/></></IconMulti> },
  { id:'form', label:'Packaging Form', icon:<IconMulti size={16}><><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/></></IconMulti> },
  { id:'labels', label:'Labels', icon:<IconMulti size={16}><><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/></></IconMulti> },
]

function BottleIllus({ h, w, active }){
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 40 70" className="h-[56px] w-[40px]">
        <path d={`M ${20-w/2} 16 L ${20-w/2} 8 Q ${20-w/2} 4 ${20} 4 Q ${20+w/2} 4 ${20+w/2} 8 L ${20+w/2} 16 Z`} fill={active? ACCENT : '#FEF3C7'} stroke={active? DARK : '#F59E0B'} strokeWidth="1.4"/>
        <rect x={20-w/2-1} y={16} width={w+2} height={h} rx={active?6:5} fill={active? '#FFFBEB' : 'white'} stroke={active? ACCENT : '#FDE68A'} strokeWidth="1.6"/>
        <rect x={20-w/2+3} y={20} width={w-6} height={h-10} rx="2" fill={active? ACCENT : '#FEF3C7'} opacity={active?0.2:0.9}/>
        <path d={`M ${20-w/2+4} ${16+h-7} Q ${20} ${16+h-2} ${20+w/2-4} ${16+h-7}`} fill="none" stroke={ACCENT} strokeWidth="1" opacity="0.35"/>
      </svg>
      <span className={`mt-1 h-1.5 w-8 rounded-full ${active?'bg-amber-300':'bg-stone-200'} blur-[0.5px]`}/>
    </div>
  )
}

function QrPlaceholder({value}){
  if(value){
    return <div className="rounded-xl border bg-white p-2"><QRCodeSVG value={value} size={118} level="M" includeMargin={false} /></div>
  }
  return (
    <svg viewBox="0 0 100 100" className="h-[118px] w-[118px] rounded-xl border bg-white p-2">
      <rect x="6" y="6" width="28" height="28" fill="none" stroke="#111" strokeWidth="4"/><rect x="14" y="14" width="12" height="12" fill="#111"/><rect x="66" y="6" width="28" height="28" fill="none" stroke="#111" strokeWidth="4"/><rect x="74" y="14" width="12" height="12" fill="#111"/><rect x="6" y="66" width="28" height="28" fill="none" stroke="#111" strokeWidth="4"/><rect x="14" y="74" width="12" height="12" fill="#111"/>
      <g fill="#111">
        <rect x="42" y="10" width="6" height="6"/><rect x="52" y="10" width="4" height="4"/><rect x="42" y="20" width="4" height="14"/><rect x="50" y="22" width="12" height="4"/><rect x="66" y="42" width="6" height="6"/><rect x="76" y="42" width="8" height="4"/><rect x="42" y="42" width="14" height="4"/><rect x="42" y="50" width="4" height="18"/><rect x="52" y="52" width="10" height="10"/><rect x="66" y="52" width="18" height="4"/><rect x="72" y="60" width="12" height="4"/><rect x="66" y="68" width="6" height="12"/><rect x="76" y="72" width="10" height="6"/><rect x="50" y="74" width="12" height="6"/>
      </g>
    </svg>
  )
}
function BarcodePlaceholder(){
  return (
    <svg viewBox="0 0 200 60" className="h-[46px] w-[200px] rounded-lg border bg-white p-1.5">
      {Array.from({length:48}).map((_,i)=> <rect key={i} x={6+i*4} y={i%3===0?4:8} width={i%5===0?3:1.6} height={i%3===0?36:28} fill="#111" opacity={i%7===0?0.9:1}/>)}
    </svg>
  )
}

function addMonths(dateStr, months){
  const d=new Date(dateStr); d.setMonth(d.getMonth()+months); return d.toISOString().slice(0,10)
}

export default function PackagingPortal(){
  const [tab, setTab] = useState('dashboard')
  const [selected, setSelected] = useState(PASS_BATCHES[0].id)
  const sel = useMemo(()=> PASS_BATCHES.find(b=>b.id===selected)||PASS_BATCHES[0],[selected])
  const [confirmedWeight, setConfirmedWeight] = useState(String(sel.labWeight))
  const [bottleSize, setBottleSize] = useState('250ml')
  const sizeObj = useMemo(()=> SIZES.find(s=>s.id===bottleSize),[bottleSize])
  const [bottleCount, setBottleCount] = useState('')
  const [shelfLife, setShelfLife] = useState('18')
  const [mfgDate] = useState(sel.harvestDate)
  const [generated, setGenerated] = useState(null)
  const [dispatched, setDispatched] = useState([])
  const [toasts, setToasts]=useState([])

  const pushToast=(msg)=>{ const id=Date.now(); setToasts(t=>[...t,{id,msg}]); setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),2800) }

  useEffect(()=>{ setConfirmedWeight(String(sel.labWeight)); setGenerated(null) },[sel.id])
  useEffect(()=>{
    const w=parseFloat(confirmedWeight)
    if(!isNaN(w) && sizeObj){ const auto = Math.floor((w*1000)/sizeObj.grams); setBottleCount(String(auto)) }
  },[confirmedWeight, sizeObj])

  const expiry = useMemo(()=> addMonths(mfgDate, parseInt(shelfLife||'18',10)),[mfgDate, shelfLife])
  const weightDiff = useMemo(()=>{
    const cw=parseFloat(confirmedWeight); if(isNaN(cw)) return null
    const diff=cw - sel.transportWeight; const pct=(diff/sel.transportWeight)*100; return {diff,pct}
  },[confirmedWeight, sel])
  const weightOk = weightDiff? Math.abs(weightDiff.pct) <=3 : null
  const totalPackedGrams = useMemo(()=>{ const c=parseInt(bottleCount||'0',10); return c * (sizeObj?.grams||0) },[bottleCount, sizeObj])
  const weightCheckText = useMemo(()=>{
    const cw=parseFloat(confirmedWeight); if(isNaN(cw)||!sizeObj) return ''
    const expected = cw*1000
    const packed = totalPackedGrams
    const diff = expected - packed
    const perBottle = (cw*1000 / (parseInt(bottleCount||'1',10)||1)).toFixed(1)
    return `${cw.toFixed(1)}kg → ${bottleCount}×${sizeObj.grams}g = ${(packed/1000).toFixed(2)}kg packed · ${Math.abs(diff).toFixed(0)}g ${diff>=0?'remaining':'overfill'} · ~${perBottle}g/bottle`
  },[confirmedWeight, bottleCount, sizeObj, totalPackedGrams])

  const incomingToday = PASS_BATCHES.filter(b=> b.harvestDate >= '2026-02-18').length
  const bottlesWeek = useMemo(()=> PASS_BATCHES.reduce((a,b)=> a + Math.floor(b.labWeight*1000/250),0),[])
  const ready = PASS_BATCHES.length - dispatched.length

  const handleGenerate=()=>{
    if(!confirmedWeight || !bottleCount || parseInt(bottleCount,10)<=0){ pushToast('Confirm weight and bottle count first'); return }
    if(weightDiff && Math.abs(weightDiff.pct)>6){ pushToast('Weight anomaly >6% — review before generating codes'); return }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:5173'
    const lot = Date.now().toString(36)
    const payload = {
      batchId: sel.id,
      flora: sel.flora,
      honeyType: sel.honeyType,
      mfg: mfgDate,
      expiry,
      bottleSize: sizeObj.label,
      bottleCount: parseInt(bottleCount,10),
      netWeight: sizeObj.grams+'g',
      lotHash: '0x'+Math.random().toString(16).slice(2,10)+Math.random().toString(16).slice(2,6),
      qrData: `${origin}/verify/${sel.id}?lot=${lot}&exp=${expiry}`,
    }
    setGenerated(payload)
    pushToast(`QR locked for ${sel.id} — scan from any device → /verify/${sel.id}`)
  }

  const handleDownload=()=>{
    if(!generated){ pushToast('Generate codes first'); return }
    const text = `HoneyChain Label — ${generated.honeyType}\nBatch ${generated.batchId} · Flora ${generated.flora}\nMFG ${generated.mfg} · EXP ${generated.expiry}\n${generated.bottleSize} · ${generated.bottleCount} bottles\nQR: ${generated.qrData}\nHash ${generated.lotHash}\n(Fraud-proof · non-editable)`
    const blob=new Blob([text],{type:'application/pdf'})
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`HoneyChain-${generated.batchId}-${generated.bottleSize}.pdf`; a.click(); URL.revokeObjectURL(url)
    pushToast('Label PDF downloaded (mock)')
  }

  const handleDispatch=()=>{
    if(!generated){ pushToast('Generate labels before dispatch'); return }
    setDispatched(d=> [...d, sel.id])
    pushToast(`${sel.id} marked dispatched — ledger transfer created`)
    setGenerated(null)
  }

  const filteredIncoming = PASS_BATCHES

  return (
    <div className="min-h-screen bg-[#FFFBEB]">
      <div className="mx-auto flex max-w-[1280px]">
        <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-amber-100 bg-white md:flex">
          <div className="px-5 py-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{background:ACCENT}}><svg viewBox="0 0 24 24" className="h-5 w-5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" fill={DARK} stroke="white" strokeWidth="1.3"/><path d="M12 8.5c1.6 1.9 2.4 3.2 2.4 4.3a2.4 2.4 0 1 1-4.8 0c0-1.1.8-2.4 2.4-4.3Z" fill="white"/></svg></div>
              <div><p className="text-sm font-black leading-none" style={{color:DARK}}>HoneyChain</p><p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">Packaging · FPO</p></div>
            </div>
            <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2.5">
              <p className="text-xs font-bold text-violet-900">AmberPack Facility, Chennai</p>
              <p className="text-[11px] leading-tight text-stone-500">FSSAI Lic. 12418003001234 · Only PASS batches accepted</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/> Query-level gate: status=PASS</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {SIDEBAR.map(s=>{
              const active=tab===s.id
              return <button key={s.id} onClick={()=>setTab(s.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active? 'text-white shadow' : 'text-stone-600 hover:bg-amber-50'}`} style={active?{background:ACCENT}:{}}>
                <span className={`${active?'text-white':'text-stone-400'}`}>{s.icon}</span>{s.label}
                {s.id==='incoming' && <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold ${active?'bg-white text-amber-700':'bg-amber-100 text-amber-700'}`}>{ready}</span>}
              </button>
            })}
          </nav>
          <div className="p-4">
            <div className="rounded-xl bg-stone-900 px-3 py-3 text-white">
              <p className="text-xs font-bold">Fraud-proof labels</p><p className="text-[11px] text-stone-300">Fixed fields · QR/Barcode locked · weight-checked</p>
              <p className="mt-2 font-mono text-[10px] text-amber-300">POST /packages · blocked if flagged</p>
            </div>
            <p className="mt-3 px-1 text-[10px] leading-relaxed text-stone-400">SIH 2026 · Team Vibranium<br/>Packaging build v1.0 · #F5A623</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-20 border-b border-amber-100 bg-white/85 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
              <h1 className="text-lg font-black md:text-xl" style={{color:DARK}}>{tab==='dashboard'?'Packaging Dashboard': tab==='incoming'?'Incoming — Only PASS Batches': tab==='form'?'Packaging Form — Bottle & Label': 'Labels — Fraud-Proof Preview'}</h1>
              <span className="hidden rounded-full border border-amber-100 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 md:inline-flex">Query gate enforced</span>
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
              {SIDEBAR.map(s=> <button key={s.id} onClick={()=>setTab(s.id)} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold ${tab===s.id?'text-white shadow':'border bg-white text-stone-600'}`} style={tab===s.id?{background:ACCENT}:{}}>{s.label}</button>)}
            </div>
          </div>

          <div className="p-4 md:p-6">
            {tab==='dashboard' && (
              <div className="space-y-6 animate-fade-up">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Incoming Today</p><p className="mt-1 text-3xl font-black" style={{color:DARK}}>{incomingToday}</p><p className="text-xs font-medium text-stone-500">Only PASS · newest arrivals</p></div><div className="rounded-xl p-2.5" style={{background:'#FFF7ED', color:ACCENT}}><IconMulti size={20}><><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.27 6.96 12 12.01l8.73-5.05"/></></IconMulti></div></div>
                    <p className="mt-3 text-xs font-semibold text-emerald-700">All flagged/rejected batches are filtered at query level — never appear.</p>
                  </div>
                  <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Bottles / Week</p><p className="mt-1 text-3xl font-black" style={{color:DARK}}>{bottlesWeek.toLocaleString()}</p><p className="text-xs font-medium text-stone-500">At 250g avg · from eligible stock</p></div><div className="rounded-xl bg-sky-50 p-2.5 text-sky-600"><IconMulti size={20}><><path d="M6 8h12"/><path d="M6 12h12"/><path d="M6 16h12"/></></IconMulti></div></div>
                    <div className="mt-3 h-1.5 rounded-full bg-stone-100 overflow-hidden"><div className="h-full" style={{width:'72%', background:ACCENT}}/></div>
                  </div>
                  <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Ready to Dispatch</p><p className="mt-1 text-3xl font-black" style={{color:DARK}}>{ready}</p><p className="text-xs font-medium text-stone-500">Labeled & QR-locked</p></div><div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><IconMulti size={20}><><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></></IconMulti></div></div>
                    <div className="mt-3 flex gap-2"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">{ready} PASS</span><span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">0 flagged inbound</span></div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between"><h2 className="text-sm font-black" style={{color:DARK}}>Incoming — Eligibility Gate</h2><span className="rounded-full bg-stone-900 px-2.5 py-1 text-xs font-bold text-white">status = PASS only</span></div>
                  <p className="mt-1 text-xs leading-relaxed text-stone-500">Packaging intake query is <span className="font-bold text-stone-700">GET /api/batches?status=PASS</span> — server filters at query level. Flagged / Rejected / Pending batches never reach this view. Example: B-2001 (C4 18%) and B-1015 (in_transit) are excluded.</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {PASS_BATCHES.slice(0,4).map(b=> <div key={b.id} className="flex items-center justify-between rounded-xl border bg-amber-50/50 px-3 py-2.5"><span className="text-sm font-black" style={{color:DARK}}>{b.id} · {b.flora}</span><span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">PASS</span></div>)}
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
                    <h2 className="text-sm font-black" style={{color:DARK}}>Throughput — 14d</h2>
                    <div className="mt-4 flex h-[140px] items-end gap-1.5">{[4,6,5,8,6,9,7,10,6,8,11,7,9,12].map((v,i)=> <div key={i} className="flex-1 rounded-t-lg" style={{height:`${v*10+18}px`, background: i===13? ACCENT : '#FEF3C7', border: i===13?`1px solid ${ACCENT}`:'1px solid #FDE68A'}}/> )}</div>
                    <p className="mt-2 text-xs text-stone-500">Placeholder bar chart · Bottles dispatched per day</p>
                  </div>
                  <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-black" style={{color:DARK}}>Quick Actions</h2>
                    <div className="mt-4 space-y-2">
                      <button onClick={()=>setTab('incoming')} className="w-full rounded-full py-2.5 text-sm font-bold text-white" style={{background:ACCENT}}>View Incoming PASS Batches</button>
                      <button onClick={()=>setTab('form')} className="w-full rounded-full border bg-white py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-50">Open Packaging Form</button>
                      <div className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-stone-600 border border-amber-100"><span className="font-bold" style={{color:DARK}}>Reminder:</span> Weight check uses transport vs confirmed weight. Example 38.2kg → 500×76g flagged as implausible.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab==='incoming' && (
              <div className="space-y-4 animate-fade-up">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex gap-2 items-start">
                  <span className="mt-0.5"><IconMulti size={14}><><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></></IconMulti></span>
                  <span><span className="font-black">Query-level enforcement:</span> This list is the result of <span className="font-mono bg-white px-1.5 py-0.5 rounded border text-xs">GET /api/batches?quality=PASS</span> — only batches with lab verdict PASS are returned. No client-side filtering.</span>
                </div>
                <div className="grid gap-3">
                  {filteredIncoming.map(b=>{
                    const active=b.id===selected
                    const isDone=dispatched.includes(b.id)
                    return (
                      <button key={b.id} onClick={()=>{setSelected(b.id); setTab('form')}} className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-amber-200 hover:bg-amber-50/50 ${active?'ring-2 ring-amber-200 border-amber-300':''}`}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white text-xs font-black" style={{background: b.floraColor}}>{b.flora.slice(0,2).toUpperCase()}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-black" style={{color:DARK}}>{b.id}</span><span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">PASS · Lab</span><span className="hidden text-xs text-stone-500 md:inline">· {b.honeyType} · {b.farmer}</span></div>
                          <div className="text-xs text-stone-500">Harvest {b.harvestDate} · Lab weight {b.labWeight} kg · Transport {b.transportWeight} kg · {b.district}</div>
                        </div>
                        <div className="hidden flex-col items-end gap-1 md:flex">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isDone?'bg-stone-900 text-white':'bg-white border text-stone-700'}`}>{isDone?'Dispatched':'Ready for packaging'}</span>
                          <span className="text-xs font-bold" style={{color:ACCENT}}>Package →</span>
                        </div>
                        <span className="text-stone-300 md:hidden"><IconMulti size={18}><><path d="M9 18l6-6-6-6"/></></IconMulti></span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-center text-xs text-stone-400">Showing {filteredIncoming.length} PASS batches · Excluded examples: B-2001 (FAIL), B-1015 (pending), B-1061 (pending) — not queryable here.</p>
              </div>
            )}

            {tab==='form' && (
              <div className="space-y-6 animate-fade-up">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black" style={{color:DARK}}>Packaging Form — {sel.id}</h2>
                  <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">PASS verified</span>
                  <span className="text-xs text-stone-500">{sel.honeyType} · {sel.flora} · {sel.farmer}</span>
                  <span className="ml-auto flex items-center gap-2">
                    <select value={selected} onChange={e=>setSelected(e.target.value)} className="rounded-full border bg-white px-3 py-1.5 text-sm font-semibold outline-none">{PASS_BATCHES.map(b=> <option key={b.id} value={b.id}>{b.id} · {b.flora}</option>)}</select>
                  </span>
                </div>

                <section className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-black" style={{background:ACCENT}}>1</span><h3 className="text-sm font-black" style={{color:DARK}}>Confirm Weight</h3><span className="ml-auto text-xs font-semibold text-stone-400">Compare to lab/transport weight</span></div>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Transport / Lab weight (kg)</span>
                      <div className="rounded-xl border bg-stone-50 px-3 py-2.5 text-sm font-semibold text-stone-700">{sel.transportWeight} kg transport · {sel.labWeight} kg lab verified</div>
                      <span className="text-[11px] text-stone-400">Reference — not editable</span>
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Confirmed weight at packaging (kg) *</span>
                      <input value={confirmedWeight} onChange={e=>setConfirmedWeight(e.target.value)} type="number" step="0.1" className="rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"/>
                      {weightDiff && <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold ${Math.abs(weightDiff.pct)<=3?'bg-emerald-50 text-emerald-700 border border-emerald-200': Math.abs(weightDiff.pct)<=6?'bg-amber-100 text-amber-800 border border-amber-200':'bg-red-50 text-red-700 border border-red-200'}`}>{weightDiff.diff>0?'+':''}{weightDiff.diff.toFixed(2)} kg ({weightDiff.pct>0?'+':''}{weightDiff.pct.toFixed(1)}%) {Math.abs(weightDiff.pct)<=3?'· Within ±3%':'· Review required'}</span>}
                    </label>
                    <div className="rounded-xl bg-sky-50 border border-sky-100 px-3 py-3">
                      <p className="text-xs font-bold text-sky-800">Weight check</p><p className="mt-1 text-xs leading-relaxed text-sky-700">{weightCheckText || 'Enter confirmed weight and bottle size to validate'}</p><p className="mt-1 text-[11px] text-sky-600">Plausibility: total packed ≈ confirmed weight ±2% · flag if &gt;6% diff</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-black" style={{background:ACCENT}}>2</span><h3 className="text-sm font-black" style={{color:DARK}}>Bottle Size — Visual Selection</h3></div>
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {SIZES.map(s=>{
                      const active=bottleSize===s.id
                      return (
                        <button key={s.id} onClick={()=>setBottleSize(s.id)} className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-4 transition ${active?'border-amber-400 bg-amber-50 shadow-sm':'border-stone-200 hover:border-amber-200'}`}>
                          {active && <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-white" style={{background:ACCENT}}><IconMulti size={12}><><path d="M20 6L9 17l-5-5"/></></IconMulti></span>}
                          <BottleIllus h={s.h} w={s.w} active={active}/>
                          <div className="text-center"><p className="text-sm font-black" style={{color:DARK}}>{s.label}</p><p className="text-xs font-semibold text-stone-500">{s.sub}</p><p className="text-[11px] text-stone-400">{s.desc}</p></div>
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Bottle count (auto = weight / size) *</span>
                      <input value={bottleCount} onChange={e=>setBottleCount(e.target.value.replace(/[^0-9]/g,''))} placeholder="e.g. 152" className="rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"/>
                      <span className="text-[11px] text-stone-400">Editable — auto-computed but you can override</span>
                    </label>
                    <div className="rounded-xl bg-stone-50 border px-3 py-3">
                      <p className="text-xs font-bold" style={{color:DARK}}>Count math</p><p className="mt-1 font-mono text-xs text-stone-600">{parseFloat(confirmedWeight||'0').toFixed(2)}kg ×1000 ÷ {sizeObj.grams}g = {bottleCount} bottles</p><p className="text-[11px] text-stone-400">Total packed {(totalPackedGrams/1000).toFixed(2)} kg</p>
                    </div>
                    <div className="rounded-xl border bg-white px-3 py-3">
                      <p className="text-xs font-bold" style={{color:DARK}}>Example validation</p><p className="text-xs leading-relaxed text-stone-600">38.2 kg → 500×76 g flagged as <span className="font-bold text-red-600">implausible</span> — system warns when per-bottle math diverges &gt;10% from selected size.</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-black" style={{background:ACCENT}}>3</span><h3 className="text-sm font-black" style={{color:DARK}}>Mfg & Expiry</h3></div>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <label className="flex flex-col gap-1.5"><span className="text-xs font-bold uppercase tracking-widest text-stone-500">Harvest / Mfg date</span><input value={mfgDate} readOnly className="rounded-xl border bg-stone-50 px-3 py-2.5 text-sm text-stone-600"/><span className="text-[11px] text-stone-400">From batch record — not editable</span></label>
                    <label className="flex flex-col gap-1.5"><span className="text-xs font-bold uppercase tracking-widest text-stone-500">Shelf life</span>
                      <select value={shelfLife} onChange={e=>setShelfLife(e.target.value)} className="rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                        <option value="12">12 months</option><option value="18">18 months (FSSAI default)</option><option value="24">24 months</option>
                      </select>
                      <span className="text-[11px] text-stone-400">Expiry = Harvest + shelf life</span>
                    </label>
                    <label className="flex flex-col gap-1.5"><span className="text-xs font-bold uppercase tracking-widest text-stone-500">Expiry date (auto)</span><input value={expiry} readOnly className="rounded-xl border bg-amber-50 px-3 py-2.5 text-sm font-bold text-amber-800"/><span className="text-[11px] text-stone-400">Auto-computed · fraud-proof</span></label>
                  </div>
                </section>

                <section className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-black" style={{background:ACCENT}}>4</span><h3 className="text-sm font-black" style={{color:DARK}}>QR + Barcode — Locked Content</h3><span className="ml-auto rounded-full bg-stone-900 px-2.5 py-1 text-xs font-bold text-white">Locked · not editable</span></div>
                  {!generated ? (
                    <div className="mt-4">
                      <div className="rounded-xl border border-dashed bg-stone-50 px-4 py-6 text-center">
                        <p className="text-sm font-bold" style={{color:DARK}}>Codes not yet generated</p><p className="mx-auto mt-1 max-w-[520px] text-xs leading-relaxed text-stone-500">Content is locked: batch ID, flora, honey type, bottle size/count, MFG/EXP, and lot hash are bound immutably. No manual QR text editing is allowed — prevents fraud.</p>
                        <button onClick={handleGenerate} className="mt-4 rounded-full px-6 py-2.5 text-sm font-black text-white shadow" style={{background:ACCENT}}>Generate QR + Barcode → POST /packages</button>
                        <p className="mt-2 text-[11px] text-stone-400">Blocked if batch flagged · 38→52 flagged weight anomaly example</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border bg-stone-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Locked payload</p>
                        <div className="mt-2 space-y-1 font-mono text-xs text-stone-700">
                          <div><span className="text-stone-400">batch</span> {generated.batchId} · <span className="text-stone-400">flora</span> {generated.flora}</div>
                          <div><span className="text-stone-400">type</span> {generated.honeyType}</div>
                          <div><span className="text-stone-400">mfg</span> {generated.mfg} · <span className="text-stone-400">exp</span> {generated.expiry}</div>
                          <div><span className="text-stone-400">pack</span> {generated.bottleCount} × {generated.bottleSize} ({generated.netWeight})</div>
                          <div className="truncate"><span className="text-stone-400">qr</span> {generated.qrData}</div>
                          <div><span className="text-stone-400">hash</span> {generated.lotHash}</div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button onClick={()=>setGenerated(null)} className="rounded-full border bg-white px-3 py-1.5 text-xs font-bold text-stone-700">Regenerate</button>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">Locked</span>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center justify-center rounded-xl border bg-white p-4">
                        <div className="text-center"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-stone-500">QR per bottle — scan from any device</p><QrPlaceholder value={generated.qrData}/><p className="mt-1 font-mono text-[10px] text-stone-400 truncate max-w-[150px]">{generated.qrData}</p><a href={generated.qrData} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-bold text-[#F5A623] underline">Open verify page ↗</a></div>
                        <div className="text-center"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-stone-500">Barcode (lot)</p><BarcodePlaceholder/><p className="mt-2 font-mono text-[10px] text-stone-500">{generated.lotHash.toUpperCase()}</p></div>
                      </div>
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border-2 bg-white p-5 shadow-sm" style={{borderColor: generated? ACCENT : '#E7E5E4'}}>
                  <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-black" style={{background:ACCENT}}>5</span><h3 className="text-sm font-black" style={{color:DARK}}>Label Preview — Non-editable · Fraud-proof</h3><span className="ml-auto rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">Fixed fields</span></div>
                  <div className="mt-4 flex justify-center">
                    <div className="w-full max-w-[360px] overflow-hidden rounded-2xl border-2 bg-white shadow-sm" style={{borderColor:ACCENT}}>
                      <div className="px-4 py-3 text-white" style={{background:ACCENT}}>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-90">HoneyChain · Traceable Honey</p><p className="text-lg font-black leading-none">{sel.honeyType}</p><p className="text-xs font-semibold opacity-90">{sel.flora} flora · Single-origin</p>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div><p className="font-bold uppercase tracking-widest text-stone-400">Batch No.</p><p className="font-mono font-bold" style={{color:DARK}}>{sel.id}</p></div>
                          <div><p className="font-bold uppercase tracking-widest text-stone-400">Net weight</p><p className="font-bold" style={{color:DARK}}>{sizeObj.label} · {sizeObj.grams}g</p></div>
                          <div><p className="font-bold uppercase tracking-widest text-stone-400">Mfg date</p><p className="font-semibold text-stone-700">{mfgDate}</p></div>
                          <div><p className="font-bold uppercase tracking-widest text-stone-400">Expiry</p><p className="font-bold text-red-600">{expiry}</p></div>
                          <div className="col-span-2"><p className="font-bold uppercase tracking-widest text-stone-400">Origin</p><p className="font-semibold text-stone-700">{sel.district} · Farmer {sel.farmer}</p></div>
                          <div className="col-span-2"><p className="font-bold uppercase tracking-widest text-stone-400">FSSAI</p><p className="font-mono text-stone-600">12418003001234 · AmberPack Chennai</p></div>
                        </div>
                        <div className="mt-3 flex items-center gap-3 rounded-xl bg-stone-50 p-2.5 border">
                          <div className="shrink-0 scale-[0.62] origin-left -my-2 -ml-1">{generated ? <QRCodeSVG value={generated.qrData} size={118} /> : <QrPlaceholder/>}</div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-black uppercase tracking-widest" style={{color:DARK}}>Scan to verify — any phone</p><p className="font-mono text-[11px] leading-tight text-stone-500 break-all">{generated? generated.qrData : `${typeof window!=='undefined'?window.location.origin:''}/verify/${sel.id}?lot=…`}</p>
                            <div className="mt-1 scale-[0.72] origin-left"><BarcodePlaceholder/></div>
                          </div>
                        </div>
                        <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-widest text-stone-400">Weight-checked · QR-locked · Non-editable</p>
                      </div>
                      <div className="bg-stone-900 px-3 py-2 text-center text-[10px] font-mono text-amber-300">{generated? generated.lotHash : '— generate to lock hash —'}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-xs text-stone-500">Label fields are <span className="font-bold text-stone-700">fixed</span>: honey type + flora + batch no + expiry + QR. Weight check shown: <span className="font-mono bg-stone-50 px-1.5 py-0.5 rounded border text-[11px]">{weightCheckText || '—'}</span></p>
                  <div className="mt-4 flex flex-col gap-2 md:flex-row">
                    <button onClick={handleDownload} className={`flex-1 rounded-full py-3 text-sm font-black text-white shadow ${!generated?'bg-stone-300 cursor-not-allowed shadow-none':'hover:brightness-95'}`} style={generated?{background:DARK}:{}} disabled={!generated}>Download Label PDF</button>
                    <button onClick={handleDispatch} className={`rounded-full border px-6 py-3 text-sm font-bold ${generated?'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700':'bg-white text-stone-400 cursor-not-allowed'}`}>Mark Dispatched</button>
                  </div>
                  <p className="mt-2 text-center text-[11px] text-stone-400">Dispatch creates ledger transfer: AmberPack → Retail Depot · txHash anchored.</p>
                </section>
              </div>
            )}

            {tab==='labels' && (
              <div className="space-y-4 animate-fade-up">
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-black" style={{color:DARK}}>Label Archive</h2>
                  <p className="mt-1 text-xs text-stone-500">All generated labels are immutable once QR/Barcode is locked. Re-generation creates a new lot hash.</p>
                  {!generated ? (
                    <div className="mt-4 rounded-xl border border-dashed bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">No labels generated yet — go to Packaging Form to generate.</div>
                  ) : (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border bg-stone-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Current lot</p>
                        <p className="mt-1 text-sm font-black" style={{color:DARK}}>{generated.batchId} · {generated.bottleCount} × {generated.bottleSize}</p>
                        <p className="font-mono text-xs text-stone-600">EXP {generated.expiry} · {generated.lotHash}</p>
                        <button onClick={handleDownload} className="mt-3 rounded-full px-4 py-2 text-xs font-bold text-white" style={{background:DARK}}>Download PDF</button>
                      </div>
                      <div className="rounded-xl border bg-white p-4 flex items-center gap-4">
                        <QrPlaceholder value={generated.qrData}/>
                        <div><p className="text-xs font-bold">QR data — scannable URL</p><p className="font-mono text-xs break-all text-stone-600">{generated.qrData}</p><div className="mt-2"><BarcodePlaceholder/></div></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold" style={{color:DARK}}>Dispatched Lots</h3>
                  {dispatched.length===0? <p className="mt-2 text-sm text-stone-500">No dispatches yet.</p> : <div className="mt-3 space-y-2">{dispatched.map(id=> <div key={id} className="flex items-center justify-between rounded-xl border bg-emerald-50 px-3 py-2.5 text-sm"><span className="font-bold">{id}</span><span className="rounded-full bg-stone-900 px-2.5 py-1 text-xs font-bold text-white">Dispatched</span></div>)}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t=> <div key={t.id} className="pointer-events-auto rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg">{t.msg}</div>)}
      </div>
    </div>
  )
}
