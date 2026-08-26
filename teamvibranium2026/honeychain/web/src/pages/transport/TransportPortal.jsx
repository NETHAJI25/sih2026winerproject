import { useState, useMemo, useRef } from 'react'

const PICKUPS = [
  { id:'B-1042', farmer:'Ravi Kumar', village:'Tiruvallur', flora:'Mustard', expected:42, distance:2.4, lat:13.2299,lng:79.9026, apiary:'Ravi Apiary', village2:'Tiruvallur · TN', harvest:'2026-02-14', thumb:'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=200&q=80' },
  { id:'B-1031', farmer:'Lakshmi Priya', village:'Siruvani Foothills', flora:'Wild Jamun', expected:38, distance:4.1, lat:10.9587,lng:76.7217, apiary:'Siruvani Foothills Apiary', village2:'Coimbatore · TN', harvest:'2026-02-18', thumb:'https://images.unsplash.com/photo-1558642084-fd43571d5300?w=200&q=80' },
  { id:'B-1043', farmer:'Devi Shanmugam', village:'Panruti', flora:'Mustard', expected:28, distance:6.8, lat:11.4239,lng:79.5531, apiary:'Devi Apiary', village2:'Cuddalore · TN', harvest:'2026-02-12', thumb:'https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?w=200&q=80' },
  { id:'B-1050', farmer:'Ganga Prasad', village:'Haridwar Fringe', flora:'Acacia', expected:47.5, distance:9.3, lat:30.0487,lng:78.2605, apiary:'Rajaji Fringe Apiary', village2:'Haridwar · UK', harvest:'2026-01-20', thumb:'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=200&q=80' },
]

const HIST_INIT = [
  { batch:'B-1027', farmer:'Jose Thomas', village:'Marayoor', weightIn:60, weightOut:59.6, date:'2026-02-01', status:'Delivered' },
  { batch:'B-1038', farmer:'Anil Sahni', village:'Muzaffarpur', weightIn:33, weightOut:32.8, date:'2026-02-09', status:'Delivered' },
  { batch:'B-1050', farmer:'Ganga Prasad', village:'Haridwar', weightIn:48, weightOut:47.5, date:'2026-01-30', status:'Delivered' },
]

function Ico({d,cls='w-4 h-4'}){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}><path d={d} strokeLinecap="round" strokeLinejoin="round"/></svg>}
const ico = {
  dash:'M3 7h18M3 12h18M3 17h18',
  truck:'M1 7h13v8H1z M14 9h4l3 3v3h-7z M5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4z M16 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  map:'M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  hist:'M12 8v5l4 2 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  scan:'M3 7V5a2 2 0 0 1 2-2h2 M17 3h2a2 2 0 0 1 2 2v2 M3 17v2a2 2 0 0 0 2 2h2 M17 21h2a2 2 0 0 0 2-2v-2 M7 12h10',
  cam:'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  gps:'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z',
  search:'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M17 17l-3-3',
  warn:'M12 9v5 M12 17h.01 M10.3 3.2l7 12a2 2 0 0 1-1.7 3H8.4a2 2 0 0 1-1.7-3l7-12a2 2 0 0 1 3.4 0z',
}

export default function TransportPortal(){
  const [tab,setTab]=useState('dashboard')
  const [assigned,setAssigned]=useState(PICKUPS)
  const [trip,setTrip]=useState(null)
  const [history,setHistory]=useState(HIST_INIT)
  const [q,setQ]=useState('')
  const [scanId,setScanId]=useState('')
  const [scanFound,setScanFound]=useState(null)
  const [pickupWt,setPickupWt]=useState('')
  const [pickupPhoto,setPickupPhoto]=useState(null)
  const [gps,setGps]=useState('')
  const [gpsDone,setGpsDone]=useState(false)
  const [deliveryWt,setDeliveryWt]=useState('')
  const [sealPhoto,setSealPhoto]=useState(null)
  const filePickupRef=useRef(null)
  const fileSealRef=useRef(null)

  const sorted = useMemo(()=>[...assigned].sort((a,b)=>a.distance-b.distance),[assigned])

  const pickupsToday = assigned.length
  const completedWeek = history.length
  const distanceKm = useMemo(()=> assigned.reduce((s,a)=>s+a.distance,0).toFixed(1),[assigned])

  function startTrip(p){
    setTrip({ batch:p, step:1, pickupWt:'', deliveryWt:''})
    setTab('active')
    setScanId(p.id)
    const f = PICKUPS.find(x=>x.id===p.id) || p
    setScanFound(f)
    setGps('')
    setGpsDone(false)
    setPickupWt('')
    setPickupPhoto(null)
    setDeliveryWt('')
    setSealPhoto(null)
  }
  function doScan(){
    const v = scanId.trim().toUpperCase()
    const f = PICKUPS.find(x=>x.id===v) || assigned.find(x=>x.id===v)
    if(f) setScanFound(f)
    else setScanFound(null)
  }
  function captureGps(){
    setGps('13.0827, 80.2707 · Chennai · accuracy 8m')
    setGpsDone(true)
  }
  const pct = useMemo(()=>{
    if(!scanFound || !pickupWt) return 0
    const e = scanFound.expected
    const v = parseFloat(pickupWt)
    if(!e||isNaN(v)) return 0
    return ((v - e)/e*100)
  },[scanFound,pickupWt])
  const warnOver = Math.abs(pct) > 3

  function confirmPickup(){
    if(!scanFound) return
    const rec = { batch:scanFound.id, farmer:scanFound.farmer, village:scanFound.village, weightIn:scanFound.expected, weightOut: parseFloat(pickupWt)||scanFound.expected, date: new Date().toISOString().slice(0,10), status: 'In Transit' }
    if(warnOver){
      // still allow but flagged
      rec.status='In Transit · Flag >3%'
    }
    setTrip(t=>({...t, step:3, pickupRec:rec}))
  }
  function confirmDelivery(){
    if(!trip?.pickupRec) return
    const finalRec = { ...trip.pickupRec, weightOut: parseFloat(deliveryWt)||trip.pickupRec.weightOut, status:'Delivered' }
    setHistory(h=>[finalRec,...h])
    setAssigned(a=>a.filter(x=>x.id!==trip.batch.id))
    setTrip(null)
    setScanFound(null); setScanId(''); setPickupWt(''); setDeliveryWt(''); setGps(''); setGpsDone(false); setPickupPhoto(null); setSealPhoto(null)
    setTab('history')
  }

  const filteredHist = history.filter(r=> !q || r.batch.toLowerCase().includes(q.toLowerCase()) || r.farmer.toLowerCase().includes(q.toLowerCase()))

  const nav = [
    {k:'dashboard',l:'Dashboard',d:ico.dash},
    {k:'assigned',l:'Assigned Pickups',d:ico.truck},
    {k:'active',l:'Active Trip',d:ico.map},
    {k:'history',l:'History',d:ico.hist},
  ]

  return (
    <div className="min-h-screen bg-[#FFFBEB] flex">
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r bg-white sticky top-0 h-screen">
        <div className="px-5 py-5 border-b flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F5A623] flex items-center justify-center text-white font-black">H</div>
          <div><p className="text-sm font-black leading-none text-[#452A07]">HoneyChain</p><p className="text-[11px] tracking-widest font-semibold text-stone-400">TRANSPORT</p></div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {nav.map(n=>(
            <button key={n.k} onClick={()=>setTab(n.k)} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${tab===n.k?'bg-[#F5A623] text-white shadow':'text-stone-600 hover:bg-amber-50'}`}>
              <Ico d={n.d}/> {n.l} {n.k==='assigned'&&<span className={`ml-auto text-xs rounded-full px-2 py-0.5 font-bold ${tab===n.k?'bg-white/20':'bg-amber-100 text-[#B45309]'}`}>{assigned.length}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="rounded-2xl bg-[#FFFBEB] border p-3 flex items-center gap-3">
            <img src="https://i.pravatar.cc/100?img=15" alt="driver" className="w-9 h-9 rounded-full object-cover"/>
            <div><p className="text-sm font-bold leading-none">K. Suresh</p><p className="text-xs text-stone-500">TN-09 • Driver</p></div>
            <span className="ml-auto w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"/>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden sticky top-0 z-20 bg-white border-b flex items-center gap-2 px-3 py-2">
          {nav.map(n=>(
            <button key={n.k} onClick={()=>setTab(n.k)} className={`flex-1 rounded-full px-2 py-2 text-xs font-bold ${tab===n.k?'bg-[#F5A623] text-white':'bg-stone-100 text-stone-600'}`}>{n.l}</button>
          ))}
        </div>

        <header className="px-6 md:px-8 py-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#452A07]">{tab==='dashboard'?'Dashboard':tab==='assigned'?'Assigned Pickups':tab==='active'?'Active Trip':'History'}</h1>
            <p className="text-sm text-stone-500">{tab==='dashboard'?'Today’s route and pickups at a glance':tab==='assigned'?'Nearest first · tap Start Trip to begin':tab==='active'?'3-step verified handoff · QR → weigh → deliver':'Search by batch or farmer · immutable log'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-semibold text-stone-600"><span className="w-2 h-2 bg-emerald-500 rounded-full"/> Live GPS</span>
            <span className="rounded-full bg-[#F5A623] px-3 py-1.5 text-xs font-bold text-white">{new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</span>
          </div>
        </header>

        <main className="px-6 md:px-8 pb-10">
          {tab==='dashboard' && (
            <div className="space-y-6 animate-fade-up">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {l:'Pickups Today',v:pickupsToday,s:'assigned pickups',col:'bg-[#F5A623]',icon:ico.truck},
                  {l:'Completed This Week',v:completedWeek,s:'delivered to lab',col:'bg-emerald-600',icon:ico.hist},
                  {l:'Distance Today',v:`${distanceKm} km`,s:'estimated route',col:'bg-sky-600',icon:ico.map},
                ].map(c=>(
                  <div key={c.l} className="rounded-2xl border bg-white p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${c.col} text-white flex items-center justify-center`}><Ico d={c.icon} cls="w-5 h-5"/></div>
                    <div><p className="text-xs font-bold tracking-widest text-stone-400 uppercase">{c.l}</p><p className="text-2xl font-black text-[#452A07]">{c.v}</p><p className="text-xs text-stone-500">{c.s}</p></div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl border bg-white overflow-hidden">
                  <div className="p-4 flex items-center justify-between border-b">
                    <h3 className="font-bold text-[#452A07] flex items-center gap-2"><Ico d={ico.map}/> Route Map · Leaflet</h3>
                    <span className="text-xs font-semibold text-stone-500">{sorted.length} pins + you</span>
                  </div>
                  <div className="relative h-[340px] bg-[#E7F0FF] overflow-hidden">
                    <div className="absolute inset-0 opacity-30" style={{backgroundImage:'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',backgroundSize:'32px 32px'}}/>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-[86%] h-[76%] rounded-2xl bg-[#F8FAFF] border-2 border-white shadow-inner overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage:'url(https://tile.openstreetmap.org/6/32/21.png)',backgroundSize:'cover'}}/>
                        {sorted.map((p,i)=>(
                          <div key={p.id} className="absolute" style={{left:`${14+i*18}%`, top:`${22+(i%2)*36}%`}}>
                            <div className="w-8 h-8 rounded-full bg-[#F5A623] border-2 border-white shadow flex items-center justify-center text-[10px] font-black text-white">{i+1}</div>
                            <div className="mt-1 whitespace-nowrap rounded-full bg-white border px-2 py-0.5 text-[10px] font-bold shadow">{p.id} · {p.distance}km</div>
                          </div>
                        ))}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 rounded-full bg-sky-600 border-2 border-white shadow animate-pulse"/>
                          <div className="absolute -inset-3 rounded-full bg-sky-500/20 animate-ping"/>
                          <div className="mt-2 whitespace-nowrap rounded-full bg-sky-600 text-white px-2 py-0.5 text-[10px] font-bold">You · Current location</div>
                        </div>
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 240"><path d="M70 70 L130 130 L200 90 L290 150" fill="none" stroke="#F5A623" strokeWidth="3" strokeDasharray="6 6" opacity="0.9"/></svg>
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                      <span className="rounded-full bg-white border px-3 py-1 text-xs font-semibold shadow">Leaflet · OSM tiles</span>
                      <span className="rounded-full bg-[#452A07] text-white px-3 py-1 text-xs font-bold">Nearest first optimized</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border bg-white p-5">
                  <h3 className="font-bold text-[#452A07]">Today’s Queue</h3>
                  <div className="mt-3 space-y-3">
                    {sorted.slice(0,4).map((p,i)=>(
                      <div key={p.id} className="flex items-center gap-3 rounded-xl border bg-[#FFFBEB] p-3">
                        <span className="w-7 h-7 rounded-full bg-[#F5A623] text-white grid place-items-center text-xs font-black">{i+1}</span>
                        <img src={p.thumb} alt="" className="w-10 h-10 rounded-lg object-cover border"/>
                        <div className="min-w-0"><p className="text-sm font-bold leading-none">{p.id} · {p.farmer}</p><p className="text-xs text-stone-500 truncate">{p.village} · {p.flora} · {p.expected}kg</p></div>
                        <span className="ml-auto text-xs font-black text-[#B45309]">{p.distance}km</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>setTab('assigned')} className="mt-4 w-full rounded-full bg-[#452A07] py-2.5 text-sm font-bold text-white">View All Assigned →</button>
                </div>
              </div>
            </div>
          )}

          {tab==='assigned' && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-500">Sorted nearest-first by GPS distance · {sorted.length} pickups</p>
                <span className="rounded-full bg-white border px-3 py-1 text-xs font-semibold">Total {distanceKm} km</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {sorted.map(p=>(
                  <div key={p.id} className="rounded-2xl border bg-white overflow-hidden flex">
                    <img src={p.thumb} alt="apiary" className="w-28 h-auto object-cover hidden sm:block"/>
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="text-sm font-black text-[#452A07]">{p.id} · {p.flora}</p><p className="text-sm font-semibold">{p.farmer} · <span className="text-stone-500 font-normal">{p.village}</span></p><p className="text-xs text-stone-500">{p.apiary} · {p.village2}</p></div>
                        <span className="shrink-0 rounded-full bg-amber-100 text-[#B45309] px-2.5 py-1 text-xs font-black">{p.distance} km</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border bg-[#FFFBEB] px-2.5 py-1 font-semibold">Expected {p.expected} kg</span>
                        <span className="rounded-full border px-2.5 py-1 text-stone-600">Harvest {p.harvest}</span>
                        <span className="rounded-full border px-2.5 py-1 text-stone-600 flex items-center gap-1"><Ico d={ico.gps} cls="w-3 h-3"/> {p.lat.toFixed(2)}, {p.lng.toFixed(2)}</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button onClick={()=>startTrip(p)} className="flex-1 rounded-full bg-[#F5A623] py-2 text-sm font-bold text-white hover:bg-[#E09015]">Start Trip → Map</button>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`} target="_blank" rel="noreferrer" className="rounded-full border bg-white px-4 py-2 text-sm font-bold hover:bg-stone-50">Open in Maps</a>
                      </div>
                      <p className="mt-2 text-[11px] text-stone-400">No full turn-by-turn navigation · external Maps only for pin.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='active' && (
            <div className="space-y-6 animate-fade-up max-w-4xl">
              {!trip && (
                <div className="rounded-2xl border bg-white p-8 text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 grid place-items-center text-[#B45309]"><Ico d={ico.truck} cls="w-6 h-6"/></div>
                  <p className="mt-3 font-bold text-[#452A07]">No active trip</p><p className="text-sm text-stone-500">Go to Assigned Pickups and press Start Trip.</p>
                  <button onClick={()=>setTab('assigned')} className="mt-4 rounded-full bg-[#F5A623] px-6 py-2 font-bold text-white">Go to Assigned</button>
                </div>
              )}
              {trip && (
                <>
                  <div className="flex items-center gap-3">
                    {[
                      {n:1,l:'Scan QR'},
                      {n:2,l:'Confirm Pickup'},
                      {n:3,l:'Deliver'},
                    ].map(s=>(
                      <div key={s.n} className={`flex-1 rounded-2xl border p-3 flex items-center gap-3 ${trip.step>=s.n?'bg-[#452A07] text-white border-[#452A07]':'bg-white text-stone-400'}`}>
                        <span className={`w-8 h-8 rounded-full grid place-items-center text-sm font-black ${trip.step>=s.n?'bg-[#F5A623] text-white':'bg-stone-100'}`}>{s.n}</span>
                        <span className="text-sm font-bold">{s.l}</span>
                      </div>
                    ))}
                  </div>

                  {trip.step===1 && (
                    <div className="rounded-2xl border bg-white p-6">
                      <h3 className="font-black text-[#452A07] flex items-center gap-2"><Ico d={ico.scan}/> Step 1 · Scan Batch QR</h3>
                      <p className="text-sm text-stone-500">Scan at farm gate · verifies harvest weight on ledger</p>
                      <div className="mt-4 flex gap-2">
                        <input value={scanId} onChange={e=>setScanId(e.target.value)} placeholder="Scan / type batch ID e.g. B-1042" className="flex-1 rounded-xl border px-4 py-3 text-sm font-mono"/>
                        <button onClick={doScan} className="rounded-xl bg-[#F5A623] px-6 font-bold text-white">Scan</button>
                      </div>
                      <div className="mt-4 grid sm:grid-cols-2 gap-3">
                        <div className="rounded-xl border-2 border-dashed bg-stone-50 p-6 flex flex-col items-center justify-center text-stone-400">
                          <Ico d={ico.scan} cls="w-10 h-10"/>
                          <p className="text-xs mt-2">QR frame placeholder</p>
                        </div>
                        <div className="rounded-xl border bg-[#FFFBEB] p-4">
                          {!scanFound ? <p className="text-sm text-stone-500">No batch scanned yet.</p> : (
                            <div>
                              <p className="font-black text-[#452A07]">{scanFound.id} · {scanFound.flora}</p>
                              <p className="text-sm">{scanFound.farmer} · {scanFound.village}</p>
                              <p className="text-sm">Harvest weight <b>{scanFound.expected} kg</b> · {scanFound.harvest}</p>
                              <p className="text-xs text-stone-500 mt-1">{scanFound.apiary}</p>
                              <button onClick={()=>setTrip(t=>({...t,step:2}))} className="mt-3 w-full rounded-full bg-[#452A07] py-2 font-bold text-white">Continue to Weighing →</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {trip.step===2 && (
                    <div className="rounded-2xl border bg-white p-6">
                      <h3 className="font-black text-[#452A07]">Step 2 · Confirm Pickup</h3>
                      <div className="mt-1 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-sm">Harvest weight <b>{scanFound?.expected} kg</b> · Batch {scanFound?.id}</div>
                      <div className="mt-4 grid sm:grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1"><span className="text-xs font-bold uppercase text-stone-500">Pickup weight kg *</span><input type="number" value={pickupWt} onChange={e=>setPickupWt(e.target.value)} placeholder="e.g. 42.0" className="rounded-xl border px-3 py-3 font-mono"/></label>
                        <div className="rounded-xl border bg-stone-50 p-3">
                          <p className="text-xs font-bold uppercase text-stone-500">Variance check</p>
                          {!pickupWt ? <p className="text-sm text-stone-400 mt-1">Enter weight to check 3% rule</p> : (
                            <div className={`mt-2 rounded-xl px-3 py-2 text-sm font-semibold ${warnOver?'bg-amber-100 border border-amber-300 text-[#7C3F0A]':'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
                              {pct>=0?'+':''}{pct.toFixed(1)}% vs harvest {scanFound?.expected}kg → {warnOver?'⚠ Over 3%': 'Within 3% OK'}
                            </div>
                          )}
                          {warnOver && <button onClick={()=>setPickupWt(String(scanFound.expected))} className="mt-2 text-xs font-bold underline">Re-weigh → reset to {scanFound.expected}kg</button>}
                        </div>
                      </div>
                      {warnOver && pickupWt && (
                        <div className="mt-4 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-3 flex gap-3">
                          <Ico d={ico.warn} cls="w-5 h-5 text-amber-600 shrink-0"/>
                          <p className="text-sm text-[#7C3F0A]"><b>Warning &gt;3% variance.</b> Confirm only after re-weigh. This pickup will be flagged on-chain for lab review. <button onClick={()=>setPickupWt('')} className="underline font-bold">Re-weigh now</button></p>
                        </div>
                      )}
                      <div className="mt-4 grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase text-stone-500">Photo capture *</p>
                          <div onClick={()=>filePickupRef.current?.click()} className="mt-1 h-36 rounded-xl border-2 border-dashed bg-stone-50 grid place-items-center cursor-pointer overflow-hidden">
                            {pickupPhoto ? <img src={pickupPhoto} alt="pickup" className="h-full w-full object-cover"/> : <span className="flex flex-col items-center text-stone-400"><Ico d={ico.cam} cls="w-8 h-8"/><span className="text-xs mt-1">Tap to capture · image placeholder</span></span>}
                          </div>
                          <input ref={filePickupRef} type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) setPickupPhoto(URL.createObjectURL(f))}}/>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-stone-500">GPS pin *</p>
                          <div className="mt-1 rounded-xl border bg-white p-3">
                            <div className="h-24 rounded-lg bg-sky-50 border grid place-items-center text-sky-700 relative overflow-hidden">
                              <div className="absolute inset-0 opacity-20" style={{backgroundImage:'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg,#38bdf8 1px, transparent 1px)',backgroundSize:'18px 18px'}}/>
                              <span className="flex items-center gap-2 text-xs font-bold"><Ico d={ico.gps} cls="w-4 h-4"/> {gpsDone ? 'Pinned' : 'Not pinned'}</span>
                            </div>
                            <p className="mt-2 text-xs font-mono bg-stone-900 text-emerald-300 rounded-lg px-2 py-1 min-h-[28px]">{gps||'— GPS auto —'}</p>
                            <button onClick={captureGps} className="mt-2 w-full rounded-full border bg-white py-2 text-sm font-bold hover:bg-stone-50">{gpsDone?'Re-pin GPS':'Pin GPS'}</button>
                          </div>
                        </div>
                      </div>
                      <button disabled={!pickupWt || !pickupPhoto || !gpsDone} onClick={confirmPickup} className="mt-6 w-full rounded-full bg-[#F5A623] py-3 font-black text-white disabled:opacity-40 disabled:cursor-not-allowed">Confirm Pickup → {warnOver?'Flag & Confirm':'Create /transfers'}</button>
                      <p className="text-center text-[11px] text-stone-400 mt-2">Hash of photo stored on-chain · GPS + timestamp immutable</p>
                    </div>
                  )}

                  {trip.step===3 && (
                    <div className="rounded-2xl border bg-white p-6">
                      <h3 className="font-black text-[#452A07]">Step 3 · Delivery to Lab</h3>
                      <p className="text-sm text-stone-500">Handoff at lab gate · seal intact check</p>
                      <div className="mt-4 grid sm:grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1"><span className="text-xs font-bold uppercase text-stone-500">Delivery weight kg *</span><input type="number" value={deliveryWt} onChange={e=>setDeliveryWt(e.target.value)} placeholder="e.g. 41.9" className="rounded-xl border px-3 py-3 font-mono"/></label>
                        <div>
                          <p className="text-xs font-bold uppercase text-stone-500">Seal photo *</p>
                          <div onClick={()=>fileSealRef.current?.click()} className="mt-1 h-28 rounded-xl border-2 border-dashed bg-stone-50 grid place-items-center cursor-pointer overflow-hidden">
                            {sealPhoto ? <img src={sealPhoto} alt="seal" className="h-full w-full object-cover"/> : <span className="flex flex-col items-center text-stone-400"><Ico d={ico.cam} cls="w-6 h-6"/><span className="text-xs">Seal intact photo placeholder</span></span>}
                          </div>
                          <input ref={fileSealRef} type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) setSealPhoto(URL.createObjectURL(f))}}/>
                        </div>
                      </div>
                      <div className="mt-4 rounded-xl bg-[#FFFBEB] border p-3 text-sm">Pickup {trip.pickupRec?.weightOut} kg → Delivery {deliveryWt||'—'} kg {deliveryWt && trip.pickupRec ? `· Δ ${(parseFloat(deliveryWt)-trip.pickupRec.weightOut).toFixed(1)}kg` : ''}</div>
                      <button disabled={!deliveryWt || !sealPhoto} onClick={confirmDelivery} className="mt-6 w-full rounded-full bg-emerald-600 py-3 font-black text-white disabled:opacity-40">Confirm Delivery → History</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tab==='history' && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[220px] relative">
                  <Ico d={ico.search} cls="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
                  <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by batch or farmer" className="w-full rounded-full border bg-white pl-9 pr-4 py-2.5 text-sm"/>
                </div>
                <span className="rounded-full bg-white border px-4 py-2 text-sm font-semibold">{filteredHist.length} records</span>
              </div>
              <div className="rounded-2xl border bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#FFFBEB] text-xs uppercase tracking-widest text-stone-500">
                      <tr><th className="text-left px-4 py-3">Batch</th><th className="text-left px-4 py-3">Farmer</th><th className="text-left px-4 py-3">Village</th><th className="text-right px-4 py-3">In kg</th><th className="text-right px-4 py-3">Out kg</th><th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">Status</th></tr>
                    </thead>
                    <tbody>
                      {filteredHist.map(r=>(
                        <tr key={r.batch+r.date} className="border-t hover:bg-amber-50/60">
                          <td className="px-4 py-3 font-mono font-bold text-[#B45309]">{r.batch}</td>
                          <td className="px-4 py-3 font-semibold">{r.farmer}</td>
                          <td className="px-4 py-3 text-stone-600">{r.village}</td>
                          <td className="px-4 py-3 text-right font-mono">{r.weightIn}</td>
                          <td className="px-4 py-3 text-right font-mono">{r.weightOut}</td>
                          <td className="px-4 py-3 text-stone-600">{r.date}</td>
                          <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${r.status.includes('Flag')?'bg-amber-100 text-amber-700 border border-amber-300': r.status==='Delivered'?'bg-emerald-100 text-emerald-700':'bg-sky-100 text-sky-700'}`}>{r.status}</span></td>
                        </tr>
                      ))}
                      {filteredHist.length===0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-stone-400">No records match “{q}”.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
