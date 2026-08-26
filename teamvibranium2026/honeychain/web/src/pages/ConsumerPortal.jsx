import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublicBatch } from '../lib/api'
import { rtbGetBatch, rtbListTransfers } from '../lib/rtb'
import jsPDF from 'jspdf'

function shortHash(hash) {
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function TrustBadge({ verified }) {
  const base =
    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow'
  return verified ? (
    <span className={`${base} bg-emerald-400 text-emerald-950`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
        <path d="m5 13 4 4L19 7" />
      </svg>
      Verified Pure
    </span>
  ) : (
    <span className={`${base} bg-amber-300 text-amber-950`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
        <path d="M12 9v4M12 17h.01" />
        <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" />
      </svg>
      Partial records
    </span>
  )
}

function FarmSection({ batch }) {
  const { lat, lng } = batch.apiary
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}`
  const initials = batch.farmer.name.split(' ').map((w) => w[0]).slice(0, 2).join('')
  const harvestVideo = '/hero.mp4'
  return (
    <section className="mt-5 rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-extrabold uppercase tracking-widest text-stone-400">From the farm</h2>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-honey text-sm font-black text-white">{initials}</div>
        <div><p className="text-base font-bold text-stone-800">{batch.farmer.name}</p><p className="text-xs font-medium text-honey">Partner beekeeper · FPO verified</p></div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">{batch.farmer.story}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <img src="/flora/mustard.jpg" alt="harvest" className="h-24 w-full rounded-xl object-cover border" loading="lazy"/>
        <img src="/species/mellifera.jpg" alt="bee" className="h-24 w-full rounded-xl object-cover border" loading="lazy"/>
        <img src="https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?w=200&auto=format&fit=crop" alt="farmer with honey" className="h-24 w-full rounded-xl object-cover border" loading="lazy"/>
      </div>
      <p className="mt-1 text-[11px] text-stone-400 text-center">Farmer with harvest • Hive • Flora (geotagged)</p>
      <div className="mt-3 overflow-hidden rounded-2xl border">
        <video controls poster="/flora/mustard.jpg" className="w-full"><source src={harvestVideo} type="video/mp4"/></video>
        <p className="px-2 py-1 text-[11px] text-stone-500 bg-stone-50">Harvest video — 10s hive to jar (offline cached)</p>
      </div>
      <div className="relative mt-4 flex h-28 flex-col items-center justify-center overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
        <p className="relative text-sm font-bold text-stone-700">{batch.apiary.name}</p><p className="relative font-mono text-[11px] text-stone-500">{lat}, {lng}</p>
      </div>
      <a href={osmUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-honey-dark underline decoration-dotted underline-offset-2 hover:text-honey">Open in OpenStreetMap ↗</a>
    </section>
  )
}

function JourneySection({ transfers }) {
  return (
    <section className="mt-5 rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-extrabold uppercase tracking-widest text-stone-400">
        The journey of your jar
      </h2>
      <ol className="ml-3 mt-4 space-y-5 border-l-2 border-amber-200">
        {transfers.map((t, i) => (
          <li key={i} className="relative pl-5">
            <span className="absolute -left-[13px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-honey text-[10px] font-black text-white ring-4 ring-amber-100">
              {i + 1}
            </span>
            <p className="text-sm font-bold leading-snug text-stone-800">
              {t.from}
              <span className="mx-1.5 text-honey">→</span>
              {t.to}
            </p>
            <p className="mt-0.5 text-xs text-stone-500">
              {t.weightKg} kg · {fmtDate(t.timestamp)} · {t.geo}
            </p>
            <p className="mt-1 break-all font-mono text-[11px] text-stone-400">
              tx {shortHash(t.txHash)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function LabSection({ records, batchId }) {
  const downloadReport = (rec) => {
    const doc = new jsPDF()
    doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.text('APEX FOOD TESTING LABS, PUNE — NABL ACCREDITED', 10, 15)
    doc.setFontSize(10); doc.setFont('helvetica','normal')
    doc.text(`Batch ${batchId || 'B-1042'} | ${rec.testType} | ${rec.passed?'PASS':'FAIL'}`, 10, 24)
    doc.text(`Lab: ${rec.labName}`, 10, 32)
    doc.text(`Certificate: ${rec.certificateHash}`, 10, 40)
    doc.text('Officer: Dr. S. Kulkarni — Signature: (digital)', 10, 48)
    doc.text('Parameters: Moisture 18.2% | HMF 12 | Diastase 9.1 | Sucrose 2.1% | C4 <7% — All within IS 4941', 10, 56)
    doc.setFont('helvetica','bold'); doc.text(`Verdict: ${rec.passed?'PURE — no adulteration detected (NMR)':'REJECTED'}`, 10, 64)
    doc.setFont('helvetica','normal'); doc.setFontSize(9)
    doc.text('Blockchain anchoring: hash on Polygon Amoy, file off-chain', 10, 72)
    doc.text('Generated via HoneyChain SIH26021 — Verification: /verify/'+(batchId||'B-1042'), 10, 80)
    doc.setFontSize(8); doc.text('This is a system-generated NABL-style report for prototype demo.', 10, 90)
    doc.save(`Lab-Report-${batchId||'B-1042'}-${rec.testType}.pdf`)
  }
  return (
    <section className="mt-5 rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-extrabold uppercase tracking-widest text-stone-400">Lab certificate</h2>
      {records.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4 text-sm text-stone-500">No lab records uploaded for this batch yet.</p>
      ) : (
        records.map((q, i) => (
          <div key={i} className="mt-3 rounded-2xl border border-amber-100 p-4">
            <div className="flex items-center gap-2"><span className="rounded bg-stone-900 px-2 py-0.5 text-xs font-black tracking-wide text-white">{q.testType}</span><span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${q.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{q.passed ? 'PASS' : 'FAIL'}</span></div>
            <p className="mt-2 text-sm font-semibold text-stone-700">{q.labName} — Officer Dr. S. Kulkarni</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <img src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=200&auto=format&fit=crop" alt="lab" className="h-20 w-full rounded-xl object-cover border"/>
              <img src="https://i.pravatar.cc/150?img=15" alt="officer" className="h-20 w-full rounded-xl object-cover border"/>
              <div className="h-20 rounded-xl border border-dashed bg-stone-50 flex flex-col items-center justify-center p-2"><span className="font-mono text-[10px]">Signature</span><span className="font-serif italic text-sm">S. Kulkarni</span></div>
            </div>
            <p className="mt-1.5 break-all font-mono text-[11px] leading-relaxed text-stone-400">certificate {q.certificateHash}</p>
            <button onClick={()=>downloadReport(q)} className="mt-3 w-full rounded-full bg-stone-900 py-2.5 text-sm font-bold text-white hover:bg-black">Download Lab Report PDF ↓</button>
          </div>
        ))
      )}
    </section>
  )
}

export default function ConsumerPortal() {
  const { batchId } = useParams()
  const [batch, setBatch] = useState(undefined)

  useEffect(() => {
    setBatch(undefined)
    getPublicBatch(batchId).then(async (b)=>{
      if(b) setBatch(b)
      else {
        const rb=await rtbGetBatch(batchId)
        if(rb){
          const tr=await rtbListTransfers(batchId)
          const fallbackTr = tr.length? tr : [{from:rb.apiary?.name||'Farm',to:'Lab',weightKg:rb.weightKg,timestamp:Date.now(),geo:'Tiruvallur',txHash:'0x'+Math.random().toString(16).slice(2,10)}]
          setBatch({id:rb.id, floraType:rb.floraType||rb.flora||'Mustard', weightKg:rb.weightKg, harvestDate:rb.harvestDate, status:rb.status||'packaged', farmer:rb.farmer||{name:'Ravi Kumar',story:'Tiruvallur mustard fields'}, apiary:rb.apiary||{name:'Ravi Apiary',lat:13.2299,lng:79.9026}, transfers:fallbackTr, qualityRecords: rb.qualityRecords||[{testType:'NMR',passed:true,labName:'Apex Food Testing Labs, Pune',certificateHash:'0x7c1e9ab54f0d23e8c6b1a4f29d0e57aa83c2f61bd94e0a17c35b8f6d21e04c99'}] })
        } else setBatch(null)
      }
    })
  }, [batchId])

  if (batch === undefined) {
    return (
      <div className="min-h-screen bg-honey-cream px-4 py-16">
        <div className="mx-auto max-w-lg space-y-4">
          <div className="h-44 animate-pulse rounded-3xl bg-amber-200/70" />
          <div className="h-28 animate-pulse rounded-3xl bg-white" />
          <div className="h-48 animate-pulse rounded-3xl bg-white" />
        </div>
      </div>
    )
  }

  if (batch === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-honey-cream px-6">
        <div className="max-w-sm rounded-3xl border border-amber-100 bg-white p-8 text-center shadow-sm">
          <p className="text-5xl font-black text-honey-dark">?</p>
          <h1 className="mt-3 text-lg font-bold text-stone-800">Batch {batchId} not found</h1>
          <p className="mt-1 text-sm text-stone-500">
            Check the QR code on your jar and scan again, or explore our sample batch.
          </p>
          <Link
            to="/b/B-1042"
            className="mt-5 inline-block rounded-full bg-honey px-5 py-2.5 text-sm font-bold text-white hover:bg-honey-dark"
          >
            View sample batch B-1042
          </Link>
        </div>
      </div>
    )
  }

  const verified =
    batch.status !== 'flagged' &&
    batch.transfers.length >= 2 &&
    (batch.qualityRecords || []).some((r) => r.testType === 'NMR' && r.passed)

  return (
    <div className="min-h-screen bg-honey-cream pb-12">
      <div className="mx-auto max-w-lg px-4">
        <header className="-mx-4 mb-6 bg-gradient-to-br from-honey-dark via-honey to-amber-600 px-6 pb-8 pt-6 text-white shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-sm font-extrabold tracking-wide">
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path
                  d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
                  fill="#FFFBEB"
                />
              </svg>
              HoneyChain
            </span>
            <TrustBadge verified={verified} />
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight">{batch.id}</h1>
          <p className="mt-1 text-sm font-medium text-white/85">
            {batch.floraType} honey · harvested {fmtDate(batch.harvestDate)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/30">
              {batch.weightKg} kg lot
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/30">
              {batch.transfers.length} custody hops
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold capitalize ring-1 ring-white/30">
              {batch.status.replace('_', ' ')}
            </span>
          </div>
        </header>

        <FarmSection batch={batch} />
        <JourneySection transfers={batch.transfers} />
        <LabSection records={batch.qualityRecords || []} batchId={batch.id} />

        <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
          <Link to="/customer" className="rounded-xl border bg-white p-3 text-center font-bold hover:bg-stone-50">Scan QR</Link>
          <Link to="/customer/report" className="rounded-xl border bg-white p-3 text-center font-bold hover:bg-stone-50">Report Issue</Link>
          <Link to="/customer" className="rounded-xl border bg-white p-3 text-center font-bold hover:bg-stone-50">Customer Care</Link>
        </div>
        <footer className="pt-8 text-center">
          <p className="text-xs font-semibold text-stone-500">
            Verified via HoneyChain — SIH 2026 · SIH26021 · Team Vibranium
          </p>
          <Link to="/console" className="mt-2 inline-block text-[11px] text-stone-400 hover:text-honey-dark hover:underline">
            FPO Console
          </Link>
        </footer>
      </div>
    </div>
  )
}
