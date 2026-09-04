import { Link } from 'react-router-dom'
const STEPS=[
  {n:'01',t:'Harvest',d:'Beekeeper harvests and logs the batch',icon:'M12 22a7 7 0 0 0 7-7c0-5-7-10-7-10S5 10 5 15a7 7 0 0 0 7 7Z'},
  {n:'02',t:'Transport',d:'Sealed pickup with weight and GPS proof',icon:'M14 18V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18h2a1 1 0 0 0 1-1v-3.83a1 1 0 0 0-.28-.71L14 8M15 18a2 2 0 1 1 4 0 2 2 0 0 1-4 0ZM7 18a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z'},
  {n:'03',t:'Lab Testing',d:'NABL tests and officer signs the report',icon:'M10 2v7l-3 3m3-3h4l3-3V2M8 16a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z'},
  {n:'04',t:'Packaging',d:'Verified weight becomes labeled jars with QR',icon:'M20 12V8H6a2 2 0 0 1-2-2V6M20 12v4H6a2 2 0 0 0-2 2v0M20 12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6M12 22v-6'},
  {n:'05',t:'You Scan & Verify',d:'Customer sees farm to shelf in seconds',icon:'M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M8 12a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H8Z'},
]
const ROLES=[
  {t:'Beekeepers',d:'Digital hive log and premium proof for pure honey',to:'/farmer',img:'https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?q=80&w=600&auto=format&fit=crop'},
  {t:'Testing Labs & Processors',d:'Authority to test, certify and process with audit trail',to:'/lab',img:'https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=600&auto=format&fit=crop'},
  {t:'Consumers',d:'Scan any jar and see the full journey with trust score',to:'/verify/B-1042',img:'https://images.unsplash.com/photo-1587049352851-8d4e89133924?q=80&w=600&auto=format&fit=crop'},
  {t:'Transport Partners',d:'Geo-assigned pickups with weight and seal proof',to:'/transport',img:'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600&auto=format&fit=crop'},
  {t:'Packaging Units',d:'QR per bottle locked to verified batch data',to:'/packaging',img:'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?q=80&w=600&auto=format&fit=crop'},
  {t:'Government / KVIC',d:'Extend Madhukranti to retail with fraud and heatmap insights',to:'/admin',img:'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=600&auto=format&fit=crop'},
]
async function tryDisease(){ const AI=import.meta.env.VITE_AI_URL||'http://localhost:8001'; try{ const r=await fetch(AI+'/disease?month=7&temp_c=30&humidity_pct=80'); const j=r.ok?await r.json():null; alert(j?'Disease '+j.risk+' '+j.score+' — '+(j.drivers||''): 'Demo: high 80 — varroa peak + humidity')}catch{ alert('Demo: high 80 — Try /console/hives live')} }
async function tryProd(){ const AI=import.meta.env.VITE_AI_URL||'http://localhost:8001'; try{ const r=await fetch(AI+'/productivity?flora=Mustard&boxes=10&season=flow&health_score=85'); const j=r.ok?await r.json():null; alert(j?'Productivity '+j.estimateKg+'kg for 10 boxes Mustard':'Demo: 56.9kg for 10 boxes')}catch{ alert('Demo: 56.9kg — Flora x season x health')} }
export default function Home(){
  return (<div className="min-h-screen bg-[#FAF7F0] text-[#1A1A1A] selection:bg-[#F5A623]/30">
    <nav className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3">
        <span className="flex items-center gap-2 text-lg font-black tracking-tight"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5A623]">⬡</span>HoneyChain</span>
        <div className="hidden gap-6 text-sm font-medium text-stone-600 md:flex"><a href="#how" className="hover:text-[#1A1A1A]">How it works</a><a href="#roles" className="hover:text-[#1A1A1A]">Who uses</a><Link to="/console/hives" className="hover:text-[#1A1A1A]">Hive Monitor</Link><Link to="/console" className="hover:text-[#1A1A1A]">Console</Link></div>
        <Link to="/verify/B-1042" className="rounded-full bg-[#F5A623] px-5 py-2 text-sm font-bold text-white hover:bg-[#C77D1F]">Verify a Jar</Link>
      </div>
    </nav>

    <section className="relative flex h-[92vh] items-center justify-center overflow-hidden">
      <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover"><source src="/hero.mp4" type="video/mp4"/></video>
      <div className="absolute inset-0" style={{background:'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)'}}/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(245,166,35,0.18),transparent_60%)]"/>
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold backdrop-blur">SIH26021 • Ministry of MSME • Live on Polygon</p>
        <h1 className="mt-6 font-serif text-5xl font-black leading-none tracking-tight md:text-6xl" style={{fontFamily:'Fraunces, Playfair Display, serif'}}>Every Jar of Honey<br/>Has a Story</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">HoneyChain traces your honey from the hive to your home — verified at every step.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/verify/B-1042" className="rounded-full bg-[#F5A623] px-8 py-3.5 text-sm font-black text-white hover:bg-[#C77D1F] shadow-[0_0_24px_rgba(245,166,35,0.4)]">Verify a Jar</Link>
          <a href="#how" className="rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold backdrop-blur hover:bg-white/20">How It Works</a>
        </div>
        <p className="mt-6 text-xs tracking-[0.2em] text-white/50">MADHUKRANTI REGISTERS BEES • HONEYCHAIN MAKES EVERY JAR HONEST</p>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-white/60">↓</div>
    </section>

    <section id="how" className="mx-auto max-w-[1280px] px-6 py-16">
      <h2 className="font-serif text-3xl font-black">How It Works</h2>
      <div className="relative mt-8">
        <div className="hidden h-0.5 bg-stone-200 md:block absolute top-14 left-8 right-8"/>
        <div className="grid gap-6 md:grid-cols-5">
          {STEPS.map(s=>(
            <div key={s.n} className="relative rounded-2xl border bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="absolute -top-3 left-6 hidden h-2 w-2 rounded-full bg-[#F5A623] md:block"/>
              <p className="text-xs font-bold tracking-widest text-[#F5A623]">{s.n}</p>
              <svg viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.6" className="mt-3 h-10 w-10"><path d={s.icon} strokeLinecap="round" strokeLinejoin="round"/></svg>
              <h3 className="mt-3 font-bold">{s.t}</h3><p className="mt-1 text-sm text-stone-600">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section id="roles" className="mx-auto max-w-[1280px] px-6 pb-8">
      <h2 className="font-serif text-3xl font-black">Who Uses HoneyChain</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {ROLES.map(r=>(
          <Link key={r.t} to={r.to} className="rounded-2xl border bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition">
            <img src={r.img} alt={r.t} className="h-28 w-full rounded-xl object-cover" loading="lazy" referrerPolicy="no-referrer"/>
            <h3 className="mt-4 font-bold">{r.t}</h3><p className="mt-1 text-sm text-stone-600">{r.d}</p><span className="mt-3 inline-block text-sm font-bold text-[#F5A623]">Learn more →</span>
          </Link>
        ))}
      </div>
    </section>

    <section className="border-y bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[['1,247 kg','Honey Traced'],['312','Batches Verified'],['89','Beekeepers Onboarded'],['6','States Covered']].map(([v,l])=>(
          <div key={l} className="text-center"><p className="font-serif text-3xl font-black">{v}</p><p className="mt-1 text-xs font-bold uppercase tracking-widest text-stone-500">{l}</p><p className="text-xs italic text-stone-400">Pilot Data</p></div>
        ))}
      </div>
    </section>

    <section className="mx-auto max-w-[1280px] px-6 py-12">
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-amber-700">New · IoT + AI Smart Beekeeping — Dedicated AI Pages</p>
            <h2 className="mt-1 font-serif text-2xl font-black">Hive Monitoring · Disease Detection · Yield Forecast</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">IoT sensors stream temp/humidity/weight/sound every 12s to Firebase RTDB. AI RandomForest (12k real Kaggle rows, 95.56% acc) predicts colony health, varroa/foulbrood risk and harvest forecast — now with dedicated live demo pages.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-white border px-3 py-1 font-bold">HIVE-KVIC-001 34.5°C healthy</span><span className="rounded-full bg-white border px-3 py-1 font-bold">Varroa 2 mites low</span><span className="rounded-full bg-white border px-3 py-1 font-bold">Yield 56.9kg /10 boxes</span></div>
          </div>
          <Link to="/hive-health" className="rounded-full bg-[#1A1A1A] px-6 py-3 text-sm font-black text-white hover:bg-black">Open AI Pages →</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-xl bg-white border p-4"><p className="font-black">🌡️ Hive Health</p><p className="mt-1 text-stone-600">32-37°C brood zone, 50-75% hum, weight & sound → healthy/attention/critical + advice</p><Link to="/hive-health" className="mt-2 inline-block text-xs font-bold text-amber-600">Live demo + ML →</Link><Link to="/console/hives" className="ml-3 mt-2 inline-block text-xs text-stone-400">Console monitor</Link></div>
          <div className="rounded-xl bg-white border p-4"><p className="font-black">🦠 Disease Forecast — IMAGE ML</p><p className="mt-1 text-stone-600">Upload bee/hive photo → Gemini Vision + seasonal GET /disease → risk & solution</p><Link to="/disease-detect" className="mt-2 inline-block text-xs font-bold text-amber-600">Try image ML →</Link><button onClick={tryDisease} className="ml-3 mt-2 inline-block text-xs text-stone-400">Quick API</button></div>
          <div className="rounded-xl bg-white border p-4"><p className="font-black">📈 Productivity</p><p className="mt-1 text-stone-600">Flora × season × health → ML+rule blended kg, per-box yield · R² 0.984</p><Link to="/productivity" className="mt-2 inline-block text-xs font-bold text-amber-600">Forecast demo →</Link><button onClick={tryProd} className="ml-3 mt-2 inline-block text-xs text-stone-400">Quick API</button></div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-[1280px] grid gap-8 px-6 py-16 md:grid-cols-2">
      <div className="rounded-2xl border bg-white p-6 flex items-center justify-center"><div className="flex items-center gap-2 text-sm font-bold"><span className="rounded-lg border px-3 py-2">Harvest ✓</span>→<span className="rounded-lg border px-3 py-2">Transport ✓</span>→<span className="rounded-lg border px-3 py-2">Lab ✓</span>→<span className="rounded-lg border px-3 py-2">Packaging ✓</span>→<span className="rounded-lg border px-3 py-2">Consumer ✓</span></div></div>
      <div><h3 className="font-serif text-2xl font-black">Why Blockchain</h3><p className="mt-3 leading-relaxed text-stone-600">Every time honey changes hands — from the beekeeper&apos;s hive to your kitchen shelf — HoneyChain creates a permanent, tamper-proof record. No single person can alter or delete this history. That means when you scan a jar, what you see is exactly what happened.</p><Link to="/console/explorer" className="mt-4 inline-block rounded-full border px-5 py-2 text-sm font-bold">Open Explorer</Link></div>
    </section>

    <section className="mx-auto max-w-[1280px] px-6 pb-12">
      <div className="rounded-2xl border bg-white p-6 text-center"><p className="text-sm text-stone-600">Built to extend the National Beekeeping &amp; Honey Mission&apos;s <b>Madhukranti</b> platform to the last mile — from registry to retail shelf.</p><p className="mt-2 text-xs text-stone-400">Ministry of MSME • NBHM • National Bee Board</p></div>
    </section>

    <section className="bg-[#F5A623] py-10">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-6">
        <h3 className="font-serif text-2xl font-black text-[#1A1A1A]">Join the Movement Toward Honest Honey</h3>
        <div className="flex gap-3"><Link to="/farmer" className="rounded-full bg-[#1A1A1A] px-5 py-2.5 text-sm font-bold text-white">Register as Beekeeper</Link><Link to="/lab" className="rounded-full border border-[#1A1A1A] px-5 py-2.5 text-sm font-bold text-[#1A1A1A]">Partner as Lab</Link><Link to="/verify/B-1042" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#1A1A1A]">Scan a Jar</Link></div>
      </div>
    </section>

    <footer className="bg-[#1A1A1A] py-10 text-stone-300">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-6 md:grid-cols-4">
        <div><b className="text-white">About HoneyChain</b><p className="mt-2 text-sm text-stone-400">Blockchain honey traceability + smart beekeeping for rural livelihoods.</p></div>
        <div><b className="text-white">Problem Statement</b><p className="mt-2 text-sm text-stone-400">SIH26021 • Ministry of MSME • Smart Automation • Software</p></div>
        <div><b className="text-white">Team Vibranium</b><p className="mt-2 text-sm text-stone-400">Nethaji (TL) • Devraj • Girls R&D/PPT/Pitch • SRM IST</p></div>
        <div><b className="text-white">Contact</b><p className="mt-2 text-sm text-stone-400">nethajiramesh25@gmail.com • SIH26021 • Pilot prototype</p></div>
      </div>
      <div className="mx-auto max-w-[1280px] px-6 pt-6 text-xs text-stone-500">© 2026 Team Vibranium • Prototype • Photos to be replaced with licensed real beekeeper images.</div>
    </footer>
  </div>)}
