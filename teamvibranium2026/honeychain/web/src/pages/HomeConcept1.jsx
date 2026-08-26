import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

const JOURNEY = [
  { e: '🌸', l: 'Flower', d: 'Moringa/Jamun/Forest bloom' },
  { e: '🐝', l: 'Bee', d: 'Apis cerana / mellifera' },
  { e: '🍯', l: 'Hive', d: 'IoT: temp / humidity / weight' },
  { e: '👨‍🌾', l: 'Harvest', d: 'Geotagged photo + 42kg' },
  { e: '🚚', l: 'Transport', d: 'Vehicle scale 41.8kg' },
  { e: '🧪', l: 'Lab', d: 'Wastage 3.6 pure 38kg + cert' },
  { e: '📦', l: 'Pack', d: '500 jars QR hc.in/b/*' },
  { e: '🛒', l: 'Customer', d: 'Scan → full history' },
]

const ROLES = [
  { t: 'Farmer', i: '👨‍🌾', d: 'Create batch, yield, hive health', to: '/console/batches', c: 'from-amber-500 to-orange-600' },
  { t: 'Transport', i: '🚚', d: 'Pickup, weigh, GPS, deliver', to: '/console/receive', c: 'from-sky-500 to-indigo-600' },
  { t: 'Laboratory', i: '🧪', d: 'NMR/Moisture/HMF, cert+photo', to: '/console/batches', c: 'from-emerald-500 to-teal-600' },
  { t: 'Packaging', i: '🏭', d: 'Label, QR, dispatch', to: '/console/batches', c: 'from-violet-500 to-purple-600' },
  { t: 'Customer', i: '🛒', d: 'Scan QR, verify, report', to: '/b/B-1042', c: 'from-rose-500 to-pink-600' },
  { t: 'Admin/KVIC', i: '🏛️', d: 'Fraud, analytics, FPO rollout', to: '/console/explorer', c: 'from-stone-700 to-stone-900' },
]

function CountUp({ to, suffix='' }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let a = 0, id = setInterval(() => { a += Math.ceil(to/40); if (a >= to) { a = to; clearInterval(id) } setN(a) }, 30)
    return () => clearInterval(id)
  }, [to])
  return <span>{n.toLocaleString('en-IN')}{suffix}</span>
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-amber-500/30">
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-lg font-black tracking-tighter"> <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-black">⬡</span> HoneyChain</span>
          <div className="hidden gap-6 text-sm font-medium text-white/70 md:flex"><a href="#journey" className="hover:text-white">Journey</a><a href="#roles" className="hover:text-white">Portals</a><a href="#live" className="hover:text-white">Live</a></div>
          <Link to="/console" className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black hover:bg-amber-400 transition">Open Console →</Link>
        </div>
      </nav>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <video autoPlay muted loop playsInline poster="/hero.mp4" className="absolute inset-0 h-full w-full object-cover opacity-60"><source src="/hero.mp4" type="video/mp4" /></video>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(245,158,11,0.25),transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-20 text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold backdrop-blur"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"/> SIH26021 • MSME • Live on Polygon</p>
          <h1 className="mt-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-5xl font-black tracking-tighter text-transparent md:text-7xl">One Scan<span className="text-amber-400">.</span> <br/>Every Jar Honest.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/70">Bee → Farmer (geo photo 42kg) → Driver (vehicle scale) → Lab (wastage/pure + cert+photo) → Packer (QR) → You. Physics-checked. Blockchain-anchored.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/b/B-1042" className="rounded-full bg-amber-500 px-8 py-3.5 font-black text-black hover:bg-amber-400 transition shadow-[0_0_40px_rgba(245,158,11,0.4)]">Verify Honey — Scan B-1042</Link>
            <a href="#journey" className="rounded-full border border-white/20 bg-white/10 px-8 py-3.5 font-bold backdrop-blur hover:bg-white/20 transition">Explore Platform</a>
          </div>
          <p className="mt-6 text-xs tracking-widest text-white/40">MADHUKRANTI REGISTERS BEES • HONEYCHAIN MAKES EVERY JAR HONEST</p>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-white/30">↓</div>
      </section>

      <section id="journey" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-sm font-black uppercase tracking-[0.3em] text-amber-500">What is HoneyChain?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-3xl font-black tracking-tighter">Flower to Shelf, fully visible</p>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-8">
          {JOURNEY.map((j,i) => (
            <div key={j.l} className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur hover:bg-white/[0.08] transition">
              <div className="text-3xl">{j.e}</div><p className="mt-2 text-sm font-black">{j.l}</p><p className="text-xs leading-relaxed text-white/50">{j.d}</p>
              {i < JOURNEY.length-1 && <span className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-white/20 md:block">→</span>}
            </div>
          ))}
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-7xl px-6 pb-10">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500">Stakeholders</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {ROLES.map(r => (
            <Link key={r.t} to={r.to} className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${r.c} p-[1px]`}>
              <div className="rounded-[23px] bg-[#111] p-6 transition group-hover:bg-[#181818]">
                <div className="text-4xl">{r.i}</div><h3 className="mt-3 text-xl font-black">{r.t}</h3><p className="mt-1 text-sm text-white/60">{r.d}</p><span className="mt-4 inline-block text-xs font-bold text-amber-400">Open portal →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="live" className="mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">Live dashboard</h2>
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-6">
            {[[ 'Honey Produced', 1247,' kg'],['Batches Verified', 312,''],['Farmers', 89,''],['Labs', 12,''],['QR Scans', 4820,''],['Customers', 3219,'']].map(([l,v,s])=>(
              <div key={l}><p className="text-3xl font-black text-amber-400"><CountUp to={v} suffix={s}/></p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/50">{l}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <h3 className="text-2xl font-black">How Blockchain Works</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-white/60">Not blocks. Journey. Each step verified ✔ — hash on-chain, photos/PDFs off-chain (IPFS/S3) with hash proof.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-bold">
            {['Harvest ✔','Transport ✔','Lab ✔','Packing ✔','Customer ✔'].map(s=> <span key={s} className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-300">{s}</span>)}
          </div>
          <Link to="/console/explorer" className="mt-6 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-black text-black">Open Ledger Explorer</Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/30">SIH26021 • Team Vibranium • SRM IST • nethajiramesh25@gmail.com • Polygon Amoy • Demo → Live via CHAIN_CONTRACT_ADDRESS</footer>
    </div>
  )
}
