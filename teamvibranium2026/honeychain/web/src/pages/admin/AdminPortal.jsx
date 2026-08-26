import { useState, useMemo, useRef } from 'react'

function Ico({d,cls='w-4 h-4'}){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}><path d={d} strokeLinecap="round" strokeLinejoin="round"/></svg>}
const ico = {
  dash:'M3 12h18 M3 6h18 M3 18h18',
  alert:'M12 9v5 M12 17h.01 M10.3 3.2l7 12a2 2 0 0 1-1.7 3H8.4a2 2 0 0 1-1.7-3l7-12a2 2 0 0 1 3.4 0z',
  map:'M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8',
  cluster:'M8 11V7a4 4 0 0 1 8 0v4 M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z M12 15a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
  search:'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M17 17l-3-3',
  dl:'M12 3v12 M8 11l4 4 4-4 M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2',
}

const FRAUD_INIT = [
  {id:'AL-201', batch:'B-2001', sev:'high', inKg:42, outKg:55, pct:31, msg:'Impossible increase — syrup dilution likely before dispatch', loc:'Thanjavur → Koyambedu', reviewed:false},
  {id:'AL-202', batch:'B-1015', sev:'medium', inKg:25, outKg:25, pct:0, msg:'Varroa mite symptoms — batch held pending inspection', loc:'Panruti · NH-32', reviewed:false},
  {id:'AL-204', batch:'B-1031', sev:'low', inKg:38, outKg:39.2, pct:3.2, msg:'Slight weight gain within handling loss — re-weigh suggested', loc:'Coimbatore FPO', reviewed:false},
  {id:'AL-203', batch:'B-1038', sev:'medium', inKg:33, outKg:32.8, pct:-0.6, msg:'Foulbrood scare 2km away — cleared after inspection', loc:'Muzaffarpur', reviewed:true},
]

const USERS_INIT = [
  {name:'Ravi Kumar', role:'farmer', phone:'98XXXXXX10', village:'Tiruvallur', state:'TN'},
  {name:'K. Suresh', role:'transport', phone:'98XXXXXX11', village:'Chennai', state:'TN'},
  {name:'Dr. Anjali', role:'lab', phone:'98XXXXXX12', village:'Pune', state:'MH'},
  {name:'AmberPack Ops', role:'packaging', phone:'98XXXXXX13', village:'Chennai', state:'TN'},
  {name:'KVIC Admin', role:'admin', phone:'98XXXXXX14', village:'Delhi', state:'DL'},
  {name:'Meena Selvam', role:'farmer', phone:'98XXXXXX15', village:'Nagapattinam', state:'TN'},
]

const CLUSTERS_INIT = [
  {name:'Tiruvallur Honey FPO', region:'Tiruvallur · TN', contact:'Ravi · 98XXXXXX10', members:42, code:'HC-FPO-TVL-2026-001'},
  {name:'Delta Beekeepers Co-op', region:'Thiruvarur · TN', contact:'Meena · 98XXXXXX15', members:28, code:'HC-FPO-DLT-2026-002'},
]

export default function AdminPortal(){
  const [tab,setTab]=useState('dashboard')
  const [frauds,setFrauds]=useState(FRAUD_INIT)
  const [clusters,setClusters]=useState(CLUSTERS_INIT)
  const [qUser,setQUser]=useState('')
  const [roleFilter,setRoleFilter]=useState('all')
  const [alertQ,setAlertQ]=useState('')
  const [heatMode,setHeatMode]=useState('production')
  const [fState,setFState]=useState('All states')
  const [fFlora,setFFlora]=useState('All flora')
  const [fDate,setFDate]=useState('')
  const [form,setForm]=useState({name:'', region:'', contact:''})
  const csvRef=useRef(null)
  const [codes,setCodes]=useState([])

  const stats = { farmers:1284, batches:342, alerts: frauds.filter(f=>!f.reviewed).length, states:4 }
  const activity = [
    {t:'2026-02-19 18:05', msg:'AL-201 High — B-2001 42→55kg flagged', dot:'bg-red-500'},
    {t:'2026-02-17 08:40', msg:'B-1015 held in transit — disease inspection', dot:'bg-amber-500'},
    {t:'2026-02-14 06:30', msg:'B-1042 created · Ravi Kumar 42kg Mustard', dot:'bg-emerald-500'},
    {t:'2026-02-12 07:45', msg:'B-1015 received at Cuddalore FPO', dot:'bg-sky-500'},
    {t:'2026-02-06 11:20', msg:'AL-203 cleared after foulbrood inspection', dot:'bg-stone-400'},
  ]
  const donut = [
    {l:'Packaged', v:3, c:'#10B981'},
    {l:'In Transit', v:1, c:'#F5A623'},
    {l:'Flagged', v:1, c:'#EF4444'},
    {l:'Created', v:2, c:'#6366F1'},
    {l:'Processed', v:1, c:'#06B6D4'},
  ]
  const totalDonut = donut.reduce((s,x)=>s+x.v,0)
  let acc=0
  const conic = donut.map(d=>{const start=acc/totalDonut*360; acc+=d.v; const end=acc/totalDonut*360; return `${d.c} ${start}deg ${end}deg`}).join(', ')

  const filteredFrauds = frauds.filter(f=> !alertQ || f.batch.toLowerCase().includes(alertQ.toLowerCase()) || f.msg.toLowerCase().includes(alertQ.toLowerCase()))
  const filteredUsers = USERS_INIT.filter(u=> (roleFilter==='all'||u.role===roleFilter) && (!qUser || `${u.name} ${u.role} ${u.village}`.toLowerCase().includes(qUser.toLowerCase())))

  function markReviewed(id){ setFrauds(fs=>fs.map(f=>f.id===id?{...f, reviewed:true}:f)) }
  function addCluster(e){
    e.preventDefault()
    if(!form.name.trim()) return
    const code = `HC-FPO-${form.region.slice(0,3).toUpperCase()||'GEN'}-${2026}-${String(clusters.length+1).padStart(3,'0')}`
    setClusters(c=>[...c,{name:form.name, region:form.region||'—', contact:form.contact||'—', members:0, code}])
    setForm({name:'',region:'',contact:''})
  }
  function handleCsv(e){
    const file=e.target.files?.[0]
    if(!file) return
    const reader=new FileReader()
    reader.onload=()=>{
      const text=String(reader.result||'')
      const rows=text.split(/\r?\n/).filter(Boolean).slice(1)
      const gen = rows.map((r,i)=>`HC-INV-${String(1000+i).padStart(4,'0')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`)
      setCodes(gen.slice(0,12))
    }
    reader.readAsText(file)
  }

  const nav=[
    {k:'dashboard',l:'Dashboard',d:ico.dash},
    {k:'alerts',l:'Fraud Alerts',d:ico.alert},
    {k:'heatmap',l:'Heatmap',d:ico.map},
    {k:'clusters',l:'Cluster Onboarding',d:ico.cluster},
    {k:'users',l:'Users',d:ico.users},
  ]

  return (
    <div className="min-h-screen bg-[#FFFBEB] flex">
      <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r bg-white sticky top-0 h-screen">
        <div className="px-5 py-5 border-b flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#452A07] flex items-center justify-center text-[#F5A623] font-black">K</div>
          <div><p className="text-sm font-black leading-none text-[#452A07]">HoneyChain</p><p className="text-[11px] tracking-widest font-semibold text-stone-400">KVIC · ADMIN</p></div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {nav.map(n=>(
            <button key={n.k} onClick={()=>setTab(n.k)} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${tab===n.k?'bg-[#F5A623] text-white shadow':'text-stone-600 hover:bg-amber-50'}`}>
              <Ico d={n.d}/> {n.l} {n.k==='alerts'&&<span className={`ml-auto text-xs rounded-full px-2 py-0.5 font-black ${tab===n.k?'bg-white/20':'bg-red-100 text-red-700'}`}>{frauds.filter(f=>!f.reviewed).length}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="rounded-2xl bg-[#FFFBEB] border p-3 flex items-center gap-3">
            <img src="https://i.pravatar.cc/100?img=68" alt="admin" className="w-9 h-9 rounded-full object-cover"/>
            <div><p className="text-sm font-bold leading-none">KVIC Officer</p><p className="text-xs text-stone-500">Delhi · Admin</p></div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden sticky top-0 z-20 bg-white border-b flex gap-1.5 px-2 py-2 overflow-x-auto">
          {nav.map(n=>(
            <button key={n.k} onClick={()=>setTab(n.k)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold ${tab===n.k?'bg-[#F5A623] text-white':'bg-stone-100 text-stone-600'}`}>{n.l}</button>
          ))}
        </div>
        <header className="px-6 md:px-8 py-6">
          <h1 className="text-2xl font-black text-[#452A07]">{nav.find(n=>n.k===tab)?.l}</h1>
          <p className="text-sm text-stone-500">{tab==='dashboard'?'Farmers · batches · fraud · live activity':tab==='alerts'?'Plain-language fraud with numbers':tab==='heatmap'?'Choropleth production + alert toggle':tab==='clusters'?'Onboard FPO clusters at scale': 'Role filter + search'}</p>
        </header>

        <main className="px-6 md:px-8 pb-10">
          {tab==='dashboard' && (
            <div className="space-y-6 animate-fade-up">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {l:'Total Farmers',v:stats.farmers.toLocaleString(),sub:'across 4 states',icon:ico.users, col:'bg-[#F5A623]'},
                  {l:'Total Batches',v:stats.batches,sub:'8 in demo ledger',icon:ico.cluster, col:'bg-[#452A07]'},
                  {l:'Open Alerts',v:stats.alerts,sub:'needs review',icon:ico.alert, col:'bg-red-600'},
                  {l:'States Covered',v:stats.states,sub:'TN · MH · KL · BI',icon:ico.map, col:'bg-emerald-600'},
                ].map(c=>(
                  <div key={c.l} className="rounded-2xl border bg-white p-5 flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl ${c.col} text-white grid place-items-center`}><Ico d={c.icon} cls="w-5 h-5"/></div>
                    <div><p className="text-xs font-bold tracking-widest uppercase text-stone-400">{c.l}</p><p className="text-2xl font-black text-[#452A07]">{c.v}</p><p className="text-xs text-stone-500">{c.sub}</p></div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl border bg-white p-5">
                  <h3 className="font-bold text-[#452A07]">Combined Activity Log</h3>
                  <p className="text-xs text-stone-500">Transfers + fraud + lab events · newest first</p>
                  <div className="mt-4 relative">
                    <div className="absolute left-2 top-2 bottom-2 w-px bg-stone-200 hidden sm:block"/>
                    <div className="space-y-3">
                      {activity.map((a,i)=>(
                        <div key={i} className="flex gap-3 rounded-xl border bg-[#FFFBEB] px-3 py-2.5">
                          <span className={`hidden sm:block mt-1.5 w-2.5 h-2.5 rounded-full ${a.dot} shrink-0`}/>
                          <div className="min-w-0"><p className="text-xs font-mono text-stone-500">{a.t}</p><p className="text-sm font-semibold text-[#452A07]">{a.msg}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-5">
                  <h3 className="font-bold text-[#452A07]">Batches by Status</h3>
                  <div className="mt-4 flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full border-4 border-white shadow-inner" style={{background:`conic-gradient(${conic})`}}>
                      <div className="w-full h-full grid place-items-center"><div className="w-24 h-24 rounded-full bg-white grid place-items-center"><span className="text-xl font-black text-[#452A07]">{totalDonut}</span></div></div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                      {donut.map(d=>(
                        <div key={d.l} className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full" style={{background:d.c}}/><span className="font-semibold">{d.l}</span><span className="ml-auto font-mono">{d.v}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab==='alerts' && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex gap-3">
                <div className="flex-1 relative"><Ico d={ico.search} cls="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/><input value={alertQ} onChange={e=>setAlertQ(e.target.value)} placeholder="Search alerts by batch or reason" className="w-full rounded-full border bg-white pl-9 pr-4 py-2.5 text-sm"/></div>
                <span className="hidden sm:inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-bold gap-2"><span className="w-2 h-2 bg-red-500 rounded-full"/> {frauds.filter(f=>!f.reviewed).length} open</span>
              </div>
              <div className="space-y-3">
                {filteredFrauds.map(a=>{
                  const border = a.sev==='high'?'border-l-red-600':a.sev==='medium'?'border-l-amber-500':'border-l-yellow-400'
                  const badge = a.sev==='high'?'bg-red-600 text-white':a.sev==='medium'?'bg-amber-500 text-white':'bg-yellow-400 text-[#452A07]'
                  return (
                    <div key={a.id} className={`rounded-2xl border bg-white overflow-hidden border-l-4 ${border} ${a.reviewed?'opacity-60':''}`}>
                      <div className="p-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-widest ${badge}`}>{a.sev}</span>
                            <span className="font-mono text-sm font-bold text-[#452A07]">{a.id} · {a.batch}</span>
                            <span className="text-xs text-stone-500">{a.loc}</span>
                          </div>
                          <p className="mt-2 text-sm text-stone-700">{a.msg}</p>
                          <p className="mt-1 font-mono text-sm bg-stone-900 text-white inline-block rounded-full px-3 py-1">Input {a.inKg}kg → Output {a.outKg}kg · {a.pct>0?'+':''}{a.pct}% {a.pct>5?'impossible':'check'}</p>
                        </div>
                        <div className="flex gap-2">
                          <a href={`#/b/${a.batch}`} className="rounded-full border bg-white px-4 py-2 text-sm font-bold hover:bg-stone-50">View Batch</a>
                          {!a.reviewed ? <button onClick={()=>markReviewed(a.id)} className="rounded-full bg-[#452A07] px-4 py-2 text-sm font-bold text-white">Mark Reviewed</button> : <span className="rounded-full bg-emerald-100 text-emerald-700 px-4 py-2 text-sm font-bold">Reviewed</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredFrauds.length===0 && <div className="rounded-2xl border bg-white p-10 text-center text-stone-400">No alerts match.</div>}
              </div>
            </div>
          )}

          {tab==='heatmap' && (
            <div className="space-y-4 animate-fade-up">
              <div className="rounded-2xl border bg-white p-4 flex flex-wrap gap-3 items-center">
                <div className="flex rounded-full border p-1 bg-stone-50">
                  <button onClick={()=>setHeatMode('production')} className={`rounded-full px-4 py-1.5 text-sm font-bold ${heatMode==='production'?'bg-[#F5A623] text-white':'text-stone-600'}`}>Production</button>
                  <button onClick={()=>setHeatMode('alerts')} className={`rounded-full px-4 py-1.5 text-sm font-bold ${heatMode==='alerts'?'bg-red-600 text-white':'text-stone-600'}`}>Alerts</button>
                </div>
                <select value={fState} onChange={e=>setFState(e.target.value)} className="rounded-full border bg-white px-3 py-2 text-sm"><option>All states</option><option>Tamil Nadu</option><option>Maharashtra</option><option>Kerala</option><option>Bihar</option></select>
                <select value={fFlora} onChange={e=>setFFlora(e.target.value)} className="rounded-full border bg-white px-3 py-2 text-sm"><option>All flora</option><option>Mustard</option><option>Acacia</option><option>Litchi</option><option>Wild Jamun</option></select>
                <input type="date" value={fDate} onChange={e=>setFDate(e.target.value)} className="rounded-full border px-3 py-2 text-sm"/>
                <span className="ml-auto text-xs text-stone-500">{fState} · {fFlora} · {fDate||'all dates'}</span>
              </div>

              <div className="rounded-2xl border bg-white overflow-hidden">
                <div className="p-3 flex items-center justify-between border-b">
                  <h3 className="font-bold text-[#452A07] flex items-center gap-2"><Ico d={ico.map}/> Leaflet Choropleth · {heatMode==='production'?'Production intensity':'Alert density'}</h3>
                  <span className="text-xs font-semibold text-stone-500">District level · demo</span>
                </div>
                <div className="relative h-[380px] bg-[#EAF2FF]">
                  <div className="absolute inset-0 p-4 grid grid-cols-3 gap-3">
                    {[
                      {n:'Tiruvallur',v:42,c: heatMode==='production'?'bg-[#F5A623]':'bg-emerald-300'},
                      {n:'Thanjavur',v:55,c: heatMode==='alerts'?'bg-red-500 text-white':'bg-[#F5A623]/80'},
                      {n:'Cuddalore',v:25,c:'bg-amber-200'},
                      {n:'Haridwar',v:48,c:'bg-[#F5A623]/60'},
                      {n:'Munnar',v:60,c:'bg-emerald-600 text-white'},
                      {n:'Muzaffarpur',v:33,c:'bg-amber-300'},
                    ].map(d=>(
                      <div key={d.n} className={`rounded-2xl border-2 border-white shadow p-3 flex flex-col justify-between ${d.c}`}>
                        <p className="text-sm font-black">{d.n}</p>
                        <p className="text-2xl font-black">{d.v}<span className="text-xs font-semibold"> kg</span></p>
                        <p className="text-[11px] opacity-70">{heatMode==='production'?'production':'alerts'} · demo tile</p>
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className="rounded-full bg-white border px-3 py-1 text-xs font-bold shadow">Leaflet · choropleth</span>
                    <span className="rounded-full bg-[#452A07] text-white px-3 py-1 text-xs font-bold">Filters active</span>
                  </div>
                </div>
                <div className="p-3 flex gap-2 text-xs flex-wrap">
                  <span className="rounded-full border px-2.5 py-1 bg-white">Low</span>
                  <span className="rounded-full px-2.5 py-1 bg-[#F5A623] text-white">Med</span>
                  <span className="rounded-full px-2.5 py-1 bg-[#452A07] text-white">High</span>
                  {heatMode==='alerts'&&<span className="rounded-full px-2.5 py-1 bg-red-600 text-white">Alert hot-spot</span>}
                </div>
              </div>
            </div>
          )}

          {tab==='clusters' && (
            <div className="grid lg:grid-cols-3 gap-6 animate-fade-up">
              <div className="lg:col-span-1 rounded-2xl border bg-white p-5">
                <h3 className="font-bold text-[#452A07]">Onboard Cluster / FPO</h3>
                <p className="text-xs text-stone-500">Create FPO + bulk invite via CSV</p>
                <form onSubmit={addCluster} className="mt-4 space-y-3">
                  <label className="flex flex-col gap-1"><span className="text-xs font-bold uppercase text-stone-500">FPO name *</span><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Tiruvallur Honey FPO" className="rounded-xl border px-3 py-2.5 text-sm"/></label>
                  <label className="flex flex-col gap-1"><span className="text-xs font-bold uppercase text-stone-500">Region</span><input value={form.region} onChange={e=>setForm({...form,region:e.target.value})} placeholder="Tiruvallur · TN" className="rounded-xl border px-3 py-2.5 text-sm"/></label>
                  <label className="flex flex-col gap-1"><span className="text-xs font-bold uppercase text-stone-500">Contact</span><input value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="Name · phone" className="rounded-xl border px-3 py-2.5 text-sm"/></label>
                  <button type="submit" className="w-full rounded-full bg-[#F5A623] py-2.5 font-bold text-white">Add Cluster</button>
                </form>
                <div className="mt-6 rounded-xl border-2 border-dashed bg-stone-50 p-4">
                  <p className="text-xs font-bold uppercase text-stone-500">CSV bulk invite</p>
                  <p className="text-xs text-stone-500">CSV columns: name, phone, village · generates codes</p>
                  <input ref={csvRef} type="file" accept=".csv" onChange={handleCsv} className="mt-2 block w-full text-sm"/>
                  <button onClick={()=>csvRef.current?.click()} className="mt-2 w-full rounded-full border bg-white py-2 text-sm font-bold">Choose CSV</button>
                  {codes.length>0 && (
                    <div className="mt-3">
                      <p className="text-xs font-bold">Generated {codes.length} invite codes</p>
                      <div className="mt-1 max-h-32 overflow-auto rounded-lg bg-stone-900 text-emerald-300 p-2 font-mono text-xs space-y-1">
                        {codes.map(c=><div key={c}>{c}</div>)}
                      </div>
                      <button onClick={()=>{navigator.clipboard?.writeText(codes.join('\n'))}} className="mt-2 text-xs font-bold underline">Copy codes</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2 rounded-2xl border bg-white overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-bold text-[#452A07]">Clusters ({clusters.length})</h3>
                  <span className="rounded-full bg-[#FFFBEB] border px-3 py-1 text-xs font-bold">{clusters.reduce((s,c)=>s+c.members,0)} members total</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#FFFBEB] text-xs uppercase tracking-widest text-stone-500"><tr><th className="text-left px-4 py-3">FPO</th><th className="text-left px-4 py-3">Region</th><th className="text-left px-4 py-3">Contact</th><th className="text-right px-4 py-3">Members</th><th className="text-left px-4 py-3">Code</th></tr></thead>
                    <tbody>
                      {clusters.map(c=>(
                        <tr key={c.code} className="border-t hover:bg-amber-50/60">
                          <td className="px-4 py-3 font-bold text-[#452A07]">{c.name}</td>
                          <td className="px-4 py-3 text-stone-600">{c.region}</td>
                          <td className="px-4 py-3">{c.contact}</td>
                          <td className="px-4 py-3 text-right font-mono">{c.members}</td>
                          <td className="px-4 py-3 font-mono text-xs bg-stone-900 text-amber-300 rounded-full inline-block m-2 px-2 py-1">{c.code}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab==='users' && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px] relative"><Ico d={ico.search} cls="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/><input value={qUser} onChange={e=>setQUser(e.target.value)} placeholder="Search name, village, role" className="w-full rounded-full border bg-white pl-9 pr-4 py-2.5 text-sm"/></div>
                <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="rounded-full border bg-white px-4 py-2.5 text-sm font-semibold">
                  <option value="all">All roles</option><option value="farmer">Farmer</option><option value="transport">Transport</option><option value="lab">Lab</option><option value="packaging">Packaging</option><option value="admin">Admin</option>
                </select>
                <span className="rounded-full bg-white border px-4 py-2 text-sm font-bold">{filteredUsers.length} users</span>
              </div>
              <div className="rounded-2xl border bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#FFFBEB] text-xs uppercase tracking-widest text-stone-500"><tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Role</th><th className="text-left px-4 py-3">Village</th><th className="text-left px-4 py-3">State</th><th className="text-left px-4 py-3">Phone</th></tr></thead>
                    <tbody>
                      {filteredUsers.map(u=>(
                        <tr key={u.name} className="border-t hover:bg-amber-50/60">
                          <td className="px-4 py-3 font-bold">{u.name}</td>
                          <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${u.role==='admin'?'bg-[#452A07] text-white':u.role==='farmer'?'bg-emerald-100 text-emerald-700':u.role==='lab'?'bg-sky-100 text-sky-700':u.role==='transport'?'bg-amber-100 text-amber-800':'bg-stone-100'}`}>{u.role}</span></td>
                          <td className="px-4 py-3 text-stone-600">{u.village}</td>
                          <td className="px-4 py-3 font-mono">{u.state}</td>
                          <td className="px-4 py-3 font-mono text-stone-600">{u.phone}</td>
                        </tr>
                      ))}
                      {filteredUsers.length===0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-stone-400">No users match.</td></tr>}
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
