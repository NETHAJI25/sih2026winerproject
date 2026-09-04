import { useEffect, useMemo, useRef, useState } from 'react'

const ACCENT = '#F5A623'
const DARK = '#452A07'

const RANGES = {
  moisture: { max: 20, hint: 'Permissible ≤ 20%  ·  IS 4941', label: 'Moisture', unit: '%' },
  hmf: { max: 80, hint: 'Permissible ≤ 80 mg/kg  ·  IS 4941', label: 'HMF', unit: 'mg/kg' },
  diastase: { min: 3, hint: 'Permissible ≥ 3 DN (Schade 8)  ·  IS 4941', label: 'Diastase', unit: 'DN' },
  sucrose: { max: 5, hint: 'Permissible ≤ 5%  ·  IS 4941', label: 'Sucrose', unit: '%' },
  c3: { max: 1.0, hint: 'Δδ13C protein–honey ≤ 1.0 ‰  ·  NMR', label: 'C3 marker (Δδ13C)', unit: '‰' },
  c4: { max: 7, hint: 'C4 sugars ≤ 7%  ·  NMR adulteration screen', label: 'C4 sugars', unit: '%' },
}

const MOCK_QUEUE = [
  { id: 'B-1031', farmer: 'Lakshmi Priya', flora: 'Wild Jamun', apiary: 'Siruvani Foothills', transportWeight: 38.0, harvestDate: '2026-02-18', arrivedAt: '2026-02-19T07:10:00Z', village: 'Coimbatore, TN' },
  { id: 'B-1015', farmer: 'Devi Shanmugam', flora: 'Mustard', apiary: 'Panruti', transportWeight: 25.0, harvestDate: '2026-02-12', arrivedAt: '2026-02-17T05:32:00Z', village: 'Cuddalore, TN' },
  { id: 'B-1061', farmer: 'Padma Rao', flora: 'Coriander', apiary: 'Tenali Fields', transportWeight: 22.0, harvestDate: '2026-02-21', arrivedAt: '2026-02-22T08:20:00Z', village: 'Guntur, AP' },
  { id: 'B-1044', farmer: 'Suresh K.', flora: 'Eucalyptus', apiary: 'Marayoor', transportWeight: 41.2, harvestDate: '2026-02-15', arrivedAt: '2026-02-16T11:02:00Z', village: 'Munnar, KL' },
  { id: 'B-1047', farmer: 'Anitha R.', flora: 'Acacia', apiary: 'Haridwar Fringe', transportWeight: 36.5, harvestDate: '2026-02-20', arrivedAt: '2026-02-23T06:45:00Z', village: 'Haridwar, UK' },
].sort((a,b)=> new Date(a.arrivedAt)-new Date(b.arrivedAt))

const MOCK_COMPLETED = [
  { id: 'B-1027', farmer: 'Jose Thomas', flora: 'Eucalyptus', weight: 60, result: 'PASS', date: '2026-02-26', lab: 'Kerala Food Analysis Lab, Kochi', cert: '0x4e87b1c0...' },
  { id: 'B-1038', farmer: 'Anil Sahni', flora: 'Litchi', weight: 32.8, result: 'PASS', date: '2026-02-26', lab: 'Food Safety Works, Delhi', cert: '0xf19a62cd...' },
  { id: 'B-1050', farmer: 'Ganga Prasad', flora: 'Acacia', weight: 47.5, result: 'PASS', date: '2026-02-25', lab: 'Himalayan Food Test, Dehradun', cert: '0x2d70c8a4...' },
  { id: 'B-1042', farmer: 'Ravi Kumar', flora: 'Mustard', weight: 41.5, result: 'PASS', date: '2026-02-25', lab: 'Apex Food Testing, Pune', cert: '0x7c1e9ab5...' },
]

const MOCK_REJECTED = [
  { id: 'B-2001', farmer: 'Meena Selvam', flora: 'Sunflower', weight: 42, result: 'FAIL', date: '2026-02-24', lab: 'QuickTest, Chennai', reason: 'C4 sugars 18.4% · Moisture 21.8% · Sucrose 9.2%' },
  { id: 'B-1039', farmer: 'K. Murugan', flora: 'Mixed Forest', weight: 29, result: 'FAIL', date: '2026-02-23', lab: 'Apex Food Testing, Pune', reason: 'HMF 112 mg/kg · Diastase 1.8 DN' },
]

function Icon({ d, size=18 }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
}
function IconMulti({ children, size=18 }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
}

const SIDEBAR = [
  { id: 'dashboard', label: 'Dashboard', icon: <IconMulti size={16}><><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></></IconMulti> },
  { id: 'queue', label: 'Testing Queue', icon: <IconMulti size={16}><><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></></IconMulti> },
  { id: 'completed', label: 'Completed', icon: <IconMulti size={16}><><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></></IconMulti> },
  { id: 'rejected', label: 'Rejected', icon: <IconMulti size={16}><><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/></></IconMulti> },
]

function daysAgo(iso){
  const d = (Date.now()-new Date(iso).getTime())/86400000
  return Math.max(0, Math.floor(d))
}

export default function LabPortal(){
  const [tab, setTab] = useState('dashboard')
  const [queue, setQueue] = useState(MOCK_QUEUE)
  const [completed, setCompleted] = useState(MOCK_COMPLETED)
  const [rejected, setRejected] = useState(MOCK_REJECTED)
  const [searchCompleted, setSearchCompleted] = useState('')
  const [selected, setSelected] = useState(MOCK_QUEUE[0]?.id || 'B-1015')
  const selBatch = useMemo(()=> queue.find(q=>q.id===selected) || queue[0], [queue, selected])

  const [receivingWeight, setReceivingWeight] = useState('')
  const [sealPhoto, setSealPhoto] = useState(null)
  const [sealPreview, setSealPreview] = useState('')
  const [temp, setTemp] = useState('4')
  const [params, setParams] = useState({ moisture:'', hmf:'', diastase:'', sucrose:'', c3:'', c4:'' })
  const [pdfFile, setPdfFile] = useState(null)
  const [officerPhoto, setOfficerPhoto] = useState(null)
  const [officerPreview, setOfficerPreview] = useState('')
  const [officerName, setOfficerName] = useState('Dr. A. Sharma')
  const [designation, setDesignation] = useState('Food Analyst, FSSAI Notified Lab')

  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [toasts, setToasts] = useState([])

  const pushToast = (msg) => {
    const id = Date.now()
    setToasts(t=>[...t,{id,msg}])
    setTimeout(()=> setToasts(t=>t.filter(x=>x.id!==id)), 2800)
  }

  useEffect(()=>{
    if(!selBatch) return
    setReceivingWeight('')
  },[selBatch?.id])

  useEffect(()=>{
    if(sealPhoto){ const u=URL.createObjectURL(sealPhoto); setSealPreview(u); return()=>URL.revokeObjectURL(u) } else setSealPreview('')
  },[sealPhoto])
  useEffect(()=>{
    if(officerPhoto){ const u=URL.createObjectURL(officerPhoto); setOfficerPreview(u); return()=>URL.revokeObjectURL(u) } else setOfficerPreview('')
  },[officerPhoto])

  useEffect(()=>{
    const c = canvasRef.current
    if(!c) return
    const ctx = c.getContext('2d')
    ctx.lineWidth = 2
    ctx.lineCap='round'
    ctx.strokeStyle='#1c1917'
    const rect = () => c.getBoundingClientRect()
    const pos = (e) => {
      const r=rect()
      const t=e.touches? e.touches[0] : e
      return { x: t.clientX - r.left, y: t.clientY - r.top }
    }
    const start=(e)=>{ isDrawing.current=true; const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); e.preventDefault() }
    const move=(e)=>{ if(!isDrawing.current) return; const p=pos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); setHasSignature(true); e.preventDefault() }
    const end=()=>{ isDrawing.current=false }
    c.addEventListener('mousedown', start); c.addEventListener('mousemove', move); window.addEventListener('mouseup', end)
    c.addEventListener('touchstart', start, {passive:false}); c.addEventListener('touchmove', move, {passive:false}); c.addEventListener('touchend', end)
    return ()=>{ c.removeEventListener('mousedown', start); c.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end); c.removeEventListener('touchstart', start); c.removeEventListener('touchmove', move); c.removeEventListener('touchend', end) }
  },[tab, selected])

  const clearSig = () => {
    const c=canvasRef.current; if(!c) return; const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height); setHasSignature(false)
  }

  const weightDiff = useMemo(()=>{
    const rw = parseFloat(receivingWeight)
    if(!selBatch || isNaN(rw)) return null
    const tw = selBatch.transportWeight
    const diff = rw - tw
    const pct = (diff/tw)*100
    return { diff, pct, tw, rw }
  },[receivingWeight, selBatch])

  const wastage = useMemo(()=>{
    if(!weightDiff) return null
    return weightDiff.diff < 0 ? Math.abs(weightDiff.diff) : 0
  },[weightDiff])

  const verdict = useMemo(()=>{
    const reasons=[]
    const v = (k, val) => {
      if(val==='') return
      const n=parseFloat(val)
      if(isNaN(n)) return
      const r=RANGES[k]
      if('max' in r && n > r.max) reasons.push(`${RANGES[k].label} ${n}${RANGES[k].unit} exceeds limit (${'≤ '+r.max+r.unit})`)
      if('min' in r && n < r.min) reasons.push(`${RANGES[k].label} ${n}${RANGES[k].unit} below minimum (≥ ${r.min}${RANGES[k].unit})`)
    }
    v('moisture', params.moisture); v('hmf', params.hmf); v('diastase', params.diastase); v('sucrose', params.sucrose); v('c3', params.c3); v('c4', params.c4)
    const incomplete = Object.values(params).some(v=>v==='') ? 1 : 0
    const isFail = reasons.length>0
    const isPass = !isFail && !incomplete
    return { isPass, isFail, reasons, incomplete: !!incomplete }
  },[params])

  const pendingCount = queue.length
  const completedToday = completed.filter(c=>c.date==='2026-02-26').length
  const passRate = useMemo(()=>{
    const total = completed.length + rejected.length
    if(!total) return 100
    return Math.round((completed.length/total)*100)
  },[completed, rejected])

  const barData = [ 3,5,4,6,2,7,4,5,6,3,8,4,6,5 ]

  const weightStatus = weightDiff ? Math.abs(weightDiff.pct) <= 3 ? 'ok' : Math.abs(weightDiff.pct) <= 6 ? 'warn' : 'fail' : null

  const canSubmit = verdict.isPass && receivingWeight && parseFloat(receivingWeight)>0 && sealPhoto && temp && pdfFile && officerPhoto && hasSignature && officerName

  const handleSubmit = () => {
    if(verdict.isFail){ pushToast('Submission locked — batch Failed IS 4941. Move to Rejected.'); return }
    if(!canSubmit){ pushToast('Complete all required fields and signature.'); return }
    const rec = { id: selBatch.id, farmer: selBatch.farmer, flora: selBatch.flora, weight: parseFloat(receivingWeight), result:'PASS', date: new Date().toISOString().slice(0,10), lab:'HoneyChain Lab, Chennai', cert:'0x'+Math.random().toString(16).slice(2,10)+'...' }
    setCompleted(c=>[rec, ...c])
    setQueue(q=>q.filter(x=>x.id!==selBatch.id))
    pushToast(`${selBatch.id} certified PASS — certificate hashed on-chain`)
    setParams({ moisture:'', hmf:'', diastase:'', sucrose:'', c3:'', c4:'' })
    setReceivingWeight(''); setSealPhoto(null); setPdfFile(null); setOfficerPhoto(null); clearSig()
    if(queue.length>1) setSelected(queue.filter(x=>x.id!==selBatch.id)[0]?.id)
    setTab('completed')
  }

  const handleReject = () => {
    if(!verdict.isFail){ pushToast('Mark as Rejected only when verdict is FAIL'); return }
    const rec = { id: selBatch.id, farmer: selBatch.farmer, flora: selBatch.flora, weight: parseFloat(receivingWeight)||selBatch.transportWeight, result:'FAIL', date: new Date().toISOString().slice(0,10), lab:'HoneyChain Lab, Chennai', reason: verdict.reasons.join(' · ') }
    setRejected(r=>[rec, ...r])
    setQueue(q=>q.filter(x=>x.id!==selBatch.id))
    pushToast(`${selBatch.id} moved to Rejected — blocked from packaging`)
    if(queue.length>1) setSelected(queue.filter(x=>x.id!==selBatch.id)[0]?.id)
    setTab('rejected')
  }

  const filteredCompleted = useMemo(()=>{
    if(!searchCompleted.trim()) return completed
    const q=searchCompleted.toLowerCase()
    return completed.filter(b=> b.id.toLowerCase().includes(q) || b.farmer.toLowerCase().includes(q) || b.flora.toLowerCase().includes(q) || b.cert.toLowerCase().includes(q))
  },[completed, searchCompleted])

  return (
    <div className="min-h-screen bg-[#FFFBEB]">
      <div className="mx-auto flex max-w-[1280px]">
        <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-amber-100 bg-white md:flex">
          <div className="px-5 py-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{background:ACCENT}}><svg viewBox="0 0 24 24" className="h-5 w-5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" fill={DARK} stroke="white" strokeWidth="1.3"/><path d="M12 8.5c1.6 1.9 2.4 3.2 2.4 4.3a2.4 2.4 0 1 1-4.8 0c0-1.1.8-2.4 2.4-4.3Z" fill="white"/></svg></div>
              <div><p className="text-sm font-black leading-none" style={{color:DARK}}>HoneyChain</p><p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">Lab Portal · IS 4941</p></div>
            </div>
            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
              <p className="text-xs font-bold" style={{color:DARK}}>Trust Authority Lab</p>
              <p className="text-[11px] leading-tight text-stone-500">FSSAI Notified · NABL Accredited</p>
              <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/> On duty: A. Sharma</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {SIDEBAR.map(s=>{
              const active=tab===s.id
              return <button key={s.id} onClick={()=>setTab(s.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active? 'text-white shadow' : 'text-stone-600 hover:bg-amber-50'}`} style={active?{background:ACCENT}:{}}>
                <span className={`${active?'text-white':'text-stone-400'}`}>{s.icon}</span>{s.label}
                {s.id==='queue' && <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold ${active?'bg-white text-amber-700':'bg-amber-100 text-amber-700'}`}>{pendingCount}</span>}
                {s.id==='rejected' && rejected.length>0 && <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">{rejected.length}</span>}
              </button>
            })}
          </nav>
          <div className="p-4">
            <div className="rounded-xl bg-stone-900 px-3 py-3 text-white">
              <p className="text-xs font-bold">Chain anchoring</p><p className="text-[11px] text-stone-300">POST /quality certHash+testerPhoto · Pass/Fail lock</p>
              <p className="mt-2 font-mono text-[10px] text-amber-300">block #1284 · mock-mode</p>
            </div>
            <p className="mt-3 px-1 text-[10px] leading-relaxed text-stone-400">SIH 2026 · Team Vibranium<br/>Lab build v1.0 · #F5A623</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-20 border-b border-amber-100 bg-white/85 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-black md:text-xl" style={{color:DARK}}>{tab==='dashboard'?'Laboratory Dashboard': tab==='queue'?'Testing Queue · Oldest First': tab==='completed'?'Completed Archive': 'Rejected · Blocked from Packaging'}</h1>
                {tab==='queue' && <span className="hidden rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 md:inline-flex">Oldest → Newest</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-2 rounded-full border border-amber-100 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 md:inline-flex"><span className="h-2 w-2 rounded-full bg-emerald-500"/> NABL Live</span>
                <div className="h-8 w-8 rounded-full border-2 border-white bg-amber-100 shadow" style={{backgroundImage: officerPreview?`url(${officerPreview})`:'none', backgroundSize:'cover'}}/>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
              {SIDEBAR.map(s=> <button key={s.id} onClick={()=>setTab(s.id)} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold ${tab===s.id?'text-white shadow':'border bg-white text-stone-600'}`} style={tab===s.id?{background:ACCENT}:{}}>{s.label}{s.id==='queue'?` (${pendingCount})`:''}</button>)}
            </div>
          </div>

          <div className="p-4 md:p-6">
            {tab==='dashboard' && (
              <div className="space-y-6 animate-fade-up">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Pending Testing</p><p className="mt-1 text-3xl font-black" style={{color:DARK}}>{pendingCount}</p><p className="text-xs font-medium text-stone-500">Oldest: {queue[0]?.id} · {queue[0]?daysAgo(queue[0].arrivedAt):0}d in queue</p></div><div className="rounded-xl p-2.5" style={{background:'#FFF7ED', color:ACCENT}}><IconMulti size={20}><><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></></IconMulti></div></div>
                    <div className="mt-4 flex gap-2"><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">{queue.filter(q=>daysAgo(q.arrivedAt)>7).length} &gt;7 days</span><span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">FIFO enforced</span></div>
                  </div>
                  <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Completed Today</p><p className="mt-1 text-3xl font-black" style={{color:DARK}}>{completedToday}</p><p className="text-xs font-medium text-stone-500">Total completed {completed.length} · rejected {rejected.length}</p></div><div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><IconMulti size={20}><><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></></IconMulti></div></div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full" style={{width:`${completedToday? Math.min(100, completedToday*20):12}%`, background:ACCENT}}/></div>
                  </div>
                  <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Pass Rate</p><p className="mt-1 text-3xl font-black" style={{color:DARK}}>{passRate}%</p><p className="text-xs font-medium text-stone-500">{completed.length} pass · {rejected.length} fail · IS 4941</p></div><div className="rounded-xl bg-sky-50 p-2.5 text-sky-600"><IconMulti size={20}><><path d="M3 3v18h18"/><path d="M7 16l3-3 3 3 5-5"/></></IconMulti></div></div>
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold"><span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">Pass</span><div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden"><div className="h-full bg-emerald-500" style={{width:`${passRate}%`}}/></div><span className="text-stone-500">{100-passRate}% fail</span></div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between"><h2 className="text-sm font-black" style={{color:DARK}}>Tests — Last 14 Days</h2><span className="rounded-full border bg-white px-2.5 py-1 text-xs font-semibold text-stone-500">Bar chart placeholder · Recharts</span></div>
                    <div className="mt-4 flex h-[160px] items-end gap-1.5">
                      {barData.map((v,i)=> <div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full rounded-t-lg transition-all" style={{height:`${v*12+22}px`, background: i===barData.length-1? ACCENT : i%3===0? '#FDE68A' : '#FEF3C7', border: i===barData.length-1?`1px solid ${ACCENT}`:'1px solid #FDE68A'}}/><span className="text-[10px] font-medium text-stone-400">{i+1}</span></div>)}
                    </div>
                    <div className="mt-3 flex gap-4 text-xs font-medium text-stone-500"><span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded" style={{background:ACCENT}}/> Current</span><span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded bg-amber-200"/> Previous</span><span className="ml-auto">Total 68 tests</span></div>
                  </div>
                  <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-black" style={{color:DARK}}>Queue Health</h2>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2.5"><span className="text-sm font-semibold" style={{color:DARK}}>Oldest batch</span><span className="text-sm font-black">{queue[0]?.id} · {queue[0]?daysAgo(queue[0].arrivedAt):0}d</span></div>
                      <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2.5"><span className="text-sm text-stone-600">Avg. wait</span><span className="text-sm font-bold">6.2 days</span></div>
                      <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2.5"><span className="text-sm text-stone-600">Lab capacity today</span><span className="text-sm font-bold">8 / 12 slots</span></div>
                    </div>
                    <button onClick={()=>setTab('queue')} className="mt-4 w-full rounded-full py-2.5 text-sm font-bold text-white" style={{background:ACCENT}}>Open Testing Queue</button>
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-black" style={{color:DARK}}>Recent Verdicts</h2>
                  <div className="mt-3 grid gap-2">
                    {[...completed.slice(0,2), ...rejected.slice(0,1)].map(b=>(
                      <div key={b.id} className="flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm">
                        <div className="flex items-center gap-3"><span className={`h-2 w-2 rounded-full ${b.result==='PASS'?'bg-emerald-500':'bg-red-500'}`}/><span className="font-bold">{b.id}</span><span className="hidden text-stone-500 md:inline">{b.farmer} · {b.flora}</span></div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${b.result==='PASS'?'bg-emerald-50 text-emerald-700':'bg-red-50 text-red-700'}`}>{b.result}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab==='queue' && (
              <div className="space-y-6 animate-fade-up">
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 rounded-2xl border bg-white shadow-sm overflow-hidden h-fit">
                    <div className="flex items-center justify-between border-b bg-amber-50/60 px-4 py-3">
                      <p className="text-sm font-bold" style={{color:DARK}}>Testing Queue — FIFO (oldest first)</p>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-stone-600 border">{queue.length} batches</span>
                    </div>
                    <div className="divide-y">
                      {queue.map(b=>{
                        const age=daysAgo(b.arrivedAt)
                        const active=b.id===selected
                        return (
                          <button key={b.id} onClick={()=>setSelected(b.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${active?'bg-amber-50': 'hover:bg-stone-50'}`}>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-xs font-black" style={{color:DARK}}>{b.id.slice(2)}</div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-black" style={{color:DARK}}>{b.id}</span><span className="rounded-full bg-stone-900 px-2 py-0.5 text-[11px] font-bold text-white">{b.flora}</span><span className="hidden text-xs text-stone-500 md:inline">· {b.farmer} · {b.village}</span></div>
                              <div className="flex gap-2 text-xs text-stone-500"><span>Transport {b.transportWeight} kg</span><span>·</span><span>Harvest {b.harvestDate}</span><span className="hidden md:inline">·</span><span className="hidden md:inline">Arrived {new Date(b.arrivedAt).toLocaleDateString()}</span></div>
                            </div>
                            <div className="hidden items-center gap-2 md:flex"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${age>7?'bg-red-50 text-red-700 border border-red-200': age>4?'bg-amber-100 text-amber-800':'bg-emerald-50 text-emerald-700'}`}>{age}d in lab</span><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${active?'text-white shadow':'border bg-white text-stone-700'}`} style={active?{background:ACCENT}:{}}>{active?'Testing →':'Open'}</span></div>
                            <span className="md:hidden text-stone-400"><Icon d="M9 18l6-6-6-6" size={18}/></span>
                          </button>
                        )
                      })}
                      {queue.length===0 && <div className="p-10 text-center text-sm text-stone-500">Queue empty — all batches processed.</div>}
                    </div>
                  </div>
                  <div className="lg:col-span-1 space-y-4">
                    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between border-b bg-stone-900 px-4 py-3">
                        <p className="text-sm font-bold text-white">New Orders — Latest 3</p>
                        <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold text-white border border-white/20">newest first</span>
                      </div>
                      <div className="divide-y">
                        {[...queue].slice().reverse().slice(0,3).map(b=>{
                          const age=daysAgo(b.arrivedAt)
                          const active=b.id===selected
                          return (
                            <button key={'new-'+b.id} onClick={()=>setSelected(b.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${active?'bg-amber-50':'hover:bg-stone-50'}`}>
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl border bg-white text-xs font-black shrink-0" style={{color:DARK}}>{b.id.slice(2)}</div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5"><span className="text-sm font-black" style={{color:DARK}}>{b.id}</span><span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-white">NEW</span></div>
                                <p className="truncate text-xs text-stone-500">{b.flora} · {b.farmer}</p>
                              </div>
                              <span className={`rounded-full px-2 py-1 text-xs font-bold shrink-0 ${age>7?'bg-red-50 text-red-700':age>4?'bg-amber-100 text-amber-800':'bg-emerald-50 text-emerald-700'}`}>{age}d</span>
                            </button>
                          )
                        })}
                        {queue.length===0 && <div className="p-6 text-center text-sm text-stone-500">No new orders.</div>}
                      </div>
                      <div className="bg-amber-50 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-amber-700">IoT + AI Live</p>
                        <p className="mt-1 text-xs leading-relaxed text-stone-600">Hive temp 32-37°C healthy · varroa/foulbrood AI forecast · yield estimate</p>
                        <a href="/console/hives" className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#452A07] px-4 py-2 text-xs font-black text-white hover:bg-black">Open HiveMonitor → IoT+AI</a>
                        <div className="mt-2 flex gap-2">
                          <a href="http://localhost:8001/disease?month=7&temp_c=30&humidity_pct=80" target="_blank" rel="noreferrer" className="flex-1 rounded-full border bg-white px-2 py-1 text-center text-[11px] font-bold text-stone-700">Disease API</a>
                          <a href="http://localhost:8001/productivity?flora=Mustard&boxes=10&season=flow&health_score=85" target="_blank" rel="noreferrer" className="flex-1 rounded-full border bg-white px-2 py-1 text-center text-[11px] font-bold text-stone-700">Yield API</a>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
                      <p className="text-xs font-black uppercase tracking-widest text-amber-700">Why two panels?</p>
                      <p className="mt-1 text-xs leading-relaxed text-stone-600">Left = FIFO lab order (oldest first, fair). Right = New Orders (latest 3, newest first) for triage. Both drive same React state <span className="font-mono font-bold">selected</span>.</p>
                    </div>
                  </div>
                </div>

                {selBatch && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2"><h2 className="text-lg font-black" style={{color:DARK}}>Test Form — {selBatch.id}</h2><span className="rounded-full bg-stone-900 px-2.5 py-1 text-xs font-bold text-white">{selBatch.flora} honey</span><span className="text-xs font-medium text-stone-500">{selBatch.farmer} · {selBatch.apiary}</span></div>

                    <section className="rounded-2xl border bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-black" style={{background:ACCENT}}>1</span><h3 className="text-sm font-black" style={{color:DARK}}>Receiving & Physical Check</h3><span className="ml-auto hidden text-xs font-semibold text-stone-400 md:inline">Auto-compare to transport weight · Seal + temperature</span></div>
                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Receiving weight (kg) *</span>
                          <input value={receivingWeight} onChange={e=>setReceivingWeight(e.target.value)} placeholder="e.g. 37.9" type="number" step="0.1" className="rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"/>
                          <span className="text-[11px] font-medium text-stone-400">Transport weight {selBatch.transportWeight} kg {weightDiff? `· diff ${weightDiff.diff>0?'+':''}${weightDiff.diff.toFixed(2)} kg (${weightDiff.pct>0?'+':''}${weightDiff.pct.toFixed(1)}%)` : ''}</span>
                          {weightDiff && (
                            <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold ${weightStatus==='ok'?'bg-emerald-50 text-emerald-700 border border-emerald-200': weightStatus==='warn'?'bg-amber-100 text-amber-800 border border-amber-200':'bg-red-50 text-red-700 border border-red-200'}`}>
                              {weightStatus==='ok'?'Within tolerance (±3%)': weightStatus==='warn'?'Warning: exceeds ±3%': 'Anomaly: exceeds ±6% — flag for review'} · Wastage {wastage.toFixed(2)} kg
                            </span>
                          )}
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Seal photo *</span>
                          <label className={`flex h-[104px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-stone-50 px-3 text-center transition hover:bg-amber-50 ${sealPreview?'border-amber-300 bg-amber-50':''}`}>
                            {sealPreview ? <img src={sealPreview} alt="seal" className="h-full w-full rounded-lg object-cover"/> : <><span className="text-stone-400"><IconMulti size={22}><><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></></IconMulti></span><span className="mt-1 text-xs font-semibold text-stone-600">Tap to upload seal / container photo</span><span className="text-[11px] text-stone-400">JPG/PNG, max 5MB</span></>}
                            <input type="file" accept="image/*" className="hidden" onChange={e=>setSealPhoto(e.target.files?.[0]||null)}/>
                          </label>
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Storage temp (°C) *</span>
                          <input value={temp} onChange={e=>setTemp(e.target.value)} placeholder="4" type="number" step="0.5" className="rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"/>
                          <span className="text-[11px] text-stone-400">Record at receiving · ideal 4–8°C for honey</span>
                          <span className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700 border border-sky-100">Batch age {daysAgo(selBatch.arrivedAt)} days · Harvest {selBatch.harvestDate}</span>
                        </label>
                      </div>
                    </section>

                    <section className="rounded-2xl border bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-black" style={{background:ACCENT}}>2</span><h3 className="text-sm font-black" style={{color:DARK}}>Physico-chemical Parameters — IS 4941</h3></div>
                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        {Object.entries(RANGES).map(([key,cfg])=>{
                          const val=params[key]
                          const n=parseFloat(val)
                          const hasVal=val!=='' && !isNaN(n)
                          let state='neutral'
                          if(hasVal){ if('max' in cfg && n>cfg.max) state='fail'; else if('min' in cfg && n<cfg.min) state='fail'; else state='ok' }
                          return (
                            <label key={key} className="flex flex-col gap-1.5">
                              <span className="text-xs font-bold uppercase tracking-widest text-stone-500">{cfg.label} {cfg.unit?`(${cfg.unit})`:''} *</span>
                              <input value={val} onChange={e=>setParams(p=>({...p, [key]:e.target.value}))} placeholder={key==='moisture'?'e.g. 18.5': key==='hmf'?'e.g. 22': key==='diastase'?'e.g. 12': key==='sucrose'?'e.g. 2.1': key==='c3'?'e.g. 0.4':'e.g. 3.2'} type="number" step="0.1" className={`rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${state==='fail'?'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100': state==='ok'?'border-emerald-300 bg-emerald-50/40 focus:border-emerald-400 focus:ring-emerald-100':'border-stone-200 focus:border-amber-400 focus:ring-amber-100'}`}/>
                              <span className={`text-[11px] font-medium ${state==='fail'?'text-red-600': state==='ok'?'text-emerald-600':'text-stone-400'}`}>{cfg.hint}{hasVal? state==='fail'?' · Out of range': ' · In range':''}</span>
                            </label>
                          )
                        })}
                      </div>
                      <p className="mt-3 text-[11px] leading-relaxed text-stone-400">All six fields are mandatory. Thresholds are enforced automatically per IS 4941:2018 and NMR adulteration screening. Leave no field blank.</p>
                    </section>

                    <section className={`rounded-2xl border-2 p-5 shadow-sm ${verdict.isFail?'border-red-200 bg-red-50': verdict.isPass?'border-emerald-200 bg-emerald-50':'border-amber-200 bg-amber-50'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${verdict.isFail?'bg-red-500': verdict.isPass?'bg-emerald-500':'bg-amber-400'}`}>
                          {verdict.isFail? <IconMulti size={18}><><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></></IconMulti> : verdict.isPass? <Icon d="M20 6L9 17l-5-5" size={18}/> : <IconMulti size={18}><><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></></IconMulti>}
                        </span>
                        <div>
                          <p className={`text-sm font-black ${verdict.isFail?'text-red-700': verdict.isPass?'text-emerald-700':'text-amber-800'}`}>{verdict.isFail? 'FAIL — Rejected per IS 4941' : verdict.isPass? 'PASS — Meets IS 4941' : 'Awaiting complete parameters'}</p>
                          <p className="text-xs font-medium text-stone-600">{verdict.isFail? `${verdict.reasons.length} parameter(s) out of specification` : verdict.isPass? 'All parameters within permissible limits — eligible for Submit' : 'Enter all six parameters to auto-compute verdict'}</p>
                        </div>
                        <span className={`ml-auto hidden rounded-full px-3 py-1 text-xs font-black md:inline-flex ${verdict.isFail?'bg-red-500 text-white': verdict.isPass?'bg-emerald-600 text-white':'bg-amber-400 text-white'}`}>{verdict.isFail?'FAIL': verdict.isPass?'PASS':'PENDING'}</span>
                      </div>
                      {verdict.isFail && <div className="mt-3 rounded-xl border border-red-200 bg-white p-3"><p className="text-xs font-bold uppercase tracking-widest text-red-600">Fail reasons</p><ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm font-medium text-stone-700">{verdict.reasons.map(r=><li key={r}>{r}</li>)}</ul></div>}
                      {verdict.isPass && <div className="mt-3 rounded-xl border border-emerald-200 bg-white p-3 text-sm text-emerald-800"><span className="font-bold">Next:</span> upload report PDF, capture officer photo and signature to certify. Submission will hash certificate on-chain and release batch to Packaging only on PASS.</div>}
                    </section>

                    <section className="rounded-2xl border bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-black" style={{background:ACCENT}}>4</span><h3 className="text-sm font-black" style={{color:DARK}}>Certification & Sign-off</h3><span className="ml-auto rounded-full bg-stone-900 px-2.5 py-1 text-xs font-bold text-white">Submit locks on FAIL</span></div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Lab report PDF *</span>
                          <label className="flex cursor-pointer items-center justify-between rounded-xl border bg-stone-50 px-3 py-3 hover:bg-amber-50">
                            <span className="flex items-center gap-2 text-sm font-semibold text-stone-700"><span className="text-stone-400"><IconMulti size={18}><><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/></></IconMulti></span>{pdfFile? pdfFile.name : 'Upload PDF report'}</span>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold border text-stone-700">Choose</span>
                            <input type="file" accept=".pdf" className="hidden" onChange={e=>setPdfFile(e.target.files?.[0]||null)}/>
                          </label>
                          <span className="text-[11px] text-stone-400">PDF will be hashed (certHash) and anchored on-chain.</span>
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Officer photo *</span>
                          <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-stone-50 px-3 py-3 hover:bg-amber-50">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border bg-white flex items-center justify-center">
                              {officerPreview? <img src={officerPreview} className="h-full w-full object-cover"/> : <span className="text-stone-400"><IconMulti size={16}><><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></></IconMulti></span>}
                            </div>
                            <span className="text-sm font-semibold text-stone-700">{officerPhoto? officerPhoto.name : 'Capture / upload officer photo'}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={e=>setOfficerPhoto(e.target.files?.[0]||null)}/>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input value={officerName} onChange={e=>setOfficerName(e.target.value)} placeholder="Officer name" className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"/>
                            <input value={designation} onChange={e=>setDesignation(e.target.value)} placeholder="Designation" className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"/>
                          </div>
                        </label>
                      </div>
                      <div className="mt-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Officer signature *</p>
                        <div className="mt-1.5 rounded-xl border bg-white p-2">
                          <canvas ref={canvasRef} width={720} height={130} className="h-[130px] w-full touch-none rounded-lg bg-[#FFFBEB]"/>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs font-medium text-stone-500">{hasSignature?'Signature captured':'Draw signature with mouse / touch'} · {officerName || 'Officer'}</span>
                            <button onClick={clearSig} type="button" className="rounded-full border bg-white px-3 py-1 text-xs font-bold text-stone-700 hover:bg-stone-50">Clear</button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-col gap-2 md:flex-row">
                        <button onClick={handleSubmit} disabled={!canSubmit} className={`flex-1 rounded-full py-3 text-sm font-black text-white shadow transition ${!canSubmit?'bg-stone-300 cursor-not-allowed shadow-none':'hover:brightness-95'}`} style={canSubmit?{background:'#0F8A5A'}: {}}>
                          {verdict.isFail? 'Submit Locked — FAIL' : canSubmit? `Submit PASS — Generate Cert → POST /quality` : 'Complete all * fields + signature to submit'}
                        </button>
                        <button onClick={handleReject} className={`rounded-full border px-6 py-3 text-sm font-bold ${verdict.isFail?'bg-red-50 text-red-700 border-red-200 hover:bg-red-100':'bg-white text-stone-400 cursor-not-allowed'}`}>Move to Rejected</button>
                      </div>
                      <p className="mt-2 text-center text-[11px] text-stone-400">On submit: certHash + testerPhoto + six params + PASS verdict are written to ledger. Failed batches are blocked from downstream packaging.</p>
                    </section>
                  </div>
                )}
              </div>
            )}

            {tab==='completed' && (
              <div className="space-y-4 animate-fade-up">
                <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
                  <p className="text-sm font-medium text-stone-600">{filteredCompleted.length} archived certificates · searchable</p>
                  <div className="relative w-full md:w-80">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"><IconMulti size={16}><><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></></IconMulti></span>
                    <input value={searchCompleted} onChange={e=>setSearchCompleted(e.target.value)} placeholder="Search batch, farmer, flora, certHash…" className="w-full rounded-full border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"/>
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-amber-50 text-xs uppercase tracking-widest text-stone-500"><tr><th className="px-4 py-3">Batch</th><th className="px-4 py-3">Flora / Farmer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Lab</th><th className="px-4 py-3">Certificate</th><th className="px-4 py-3">Status</th></tr></thead>
                      <tbody className="divide-y">
                        {filteredCompleted.map(b=>(
                          <tr key={b.id} className="hover:bg-amber-50/40">
                            <td className="px-4 py-3 font-black" style={{color:DARK}}>{b.id}</td>
                            <td className="px-4 py-3"><span className="font-semibold">{b.flora}</span><span className="text-stone-500"> · {b.farmer}</span><div className="text-xs text-stone-400">{b.weight} kg</div></td>
                            <td className="px-4 py-3 text-stone-600">{b.date}</td>
                            <td className="px-4 py-3 text-stone-600 max-w-[200px] truncate">{b.lab}</td>
                            <td className="px-4 py-3 font-mono text-xs text-amber-700">{b.cert}</td>
                            <td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">PASS</span></td>
                          </tr>
                        ))}
                        {filteredCompleted.length===0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-stone-500">No matches.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab==='rejected' && (
              <div className="space-y-4 animate-fade-up">
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><span className="font-black">Blocked from packaging.</span> Rejected batches are filtered here and cannot proceed to PackagingPortal. Query-level enforcement at packaging intake.</div>
                <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-red-50 text-xs uppercase tracking-widest text-stone-500"><tr><th className="px-4 py-3">Batch</th><th className="px-4 py-3">Flora / Farmer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Reason (IS 4941)</th><th className="px-4 py-3">Action</th></tr></thead>
                      <tbody className="divide-y">
                        {rejected.map(b=>(
                          <tr key={b.id} className="hover:bg-red-50/40">
                            <td className="px-4 py-3 font-black text-red-700">{b.id}</td>
                            <td className="px-4 py-3"><span className="font-semibold">{b.flora}</span><span className="text-stone-500"> · {b.farmer}</span></td>
                            <td className="px-4 py-3 text-stone-600">{b.date}</td>
                            <td className="px-4 py-3 text-xs font-medium text-stone-700 max-w-[360px]">{b.reason}</td>
                            <td className="px-4 py-3"><span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">REJECTED</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
