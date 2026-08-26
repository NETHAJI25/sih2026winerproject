import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const SCENES = [
  { p: '0-20%', t: '', d: 'Bee on flower — cinematic, no label' },
  { p: '20-40%', t: 'From Nature...', d: 'Hive honeycomb close-up' },
  { p: '40-60%', t: '...Verified at Source...', d: 'Farmer harvest → GPS + photo capture' },
  { p: '60-80%', t: '...Tracked Every Step...', d: 'Lab / Processing / Packaging icons light up' },
  { p: '80-100%', t: '...Trusted by You.', d: 'Customer QR → 100% Verified badge glow' },
]

export default function HomeConcept2() {
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [label, setLabel] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const ctx = canvas.getContext('2d')
    let raf = 0
    const draw = () => {
      if (video.readyState >= 2) {
        canvas.width = 1280; canvas.height = 720
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      }
    }
    const onMeta = () => { video.pause(); draw(); setReady(true) }
    video.addEventListener('loadedmetadata', onMeta)
    video.load()

    const st = ScrollTrigger.create({
      trigger: '#scrub-wrap',
      start: 'top top',
      end: '+=400%',
      pin: '#scrub-pin',
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress
        setProgress(p)
        if (video.duration) {
          video.currentTime = p * video.duration * 0.98
          cancelAnimationFrame(raf)
          raf = requestAnimationFrame(draw)
        }
        if (p < 0.2) setLabel('')
        else if (p < 0.4) setLabel('From Nature...')
        else if (p < 0.6) setLabel('...Verified at Source...')
        else if (p < 0.8) setLabel('...Tracked Every Step...')
        else setLabel('...Trusted by You. ✓ 100% Verified')
      }
    })
    const onTime = () => draw()
    video.addEventListener('seeked', onTime)
    return () => { st.kill(); video.removeEventListener('loadedmetadata', onMeta); video.removeEventListener('seeked', onTime); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <span className="flex items-center gap-2 text-lg font-black tracking-tighter"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-black">⬡</span> HoneyChain <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs text-black">Concept 2 • Scroll-Scrub</span></span>
          <div className="flex gap-2"><Link to="/" className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-bold">Concept 1</Link><Link to="/console" className="rounded-full bg-white px-4 py-1.5 text-xs font-black text-black">Console →</Link></div>
        </div>
      </nav>

      <div className="pt-14 text-center text-xs tracking-widest text-white/30">CONCEPT 2 — APPLE-STYLE PINNED CANVAS • GSAP ScrollTrigger • 400vh scrub • fallback to Concept 1 on mobile/slow-2g</div>

      <div id="scrub-wrap" className="relative">
        <div id="scrub-pin" className="relative flex h-screen items-center justify-center overflow-hidden">
          <video ref={videoRef} src="/hero.mp4" muted playsInline preload="auto" className="hidden" crossOrigin="anonymous" />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
          {!ready && <div className="absolute inset-0 flex items-center justify-center bg-black"><span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-amber-500" /></div>}
          <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-400">Scroll to reveal</p>
            <h1 className="mt-3 text-5xl font-black tracking-tighter md:text-6xl">{label || 'Every Jar Tells a True Story'}</h1>
            <p className="mt-3 text-white/60">Blockchain-verified honey, traced from hive to home — scrub {Math.round(progress*100)}%</p>
            <div className="mt-6 flex justify-center gap-2"><Link to="/b/B-1042" className="rounded-full bg-amber-500 px-6 py-2.5 text-sm font-black text-black">Verify Your Honey</Link><Link to="/console" className="rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-bold backdrop-blur">Explore Platform</Link></div>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1">{SCENES.map((_,i)=><span key={i} className={`h-1.5 w-8 rounded-full transition ${progress*5 > i ? 'bg-amber-500' : 'bg-white/20'}`} />)}</div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center text-sm font-black uppercase tracking-[0.3em] text-amber-500">What is HoneyChain</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4"><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><span className="text-2xl">🌸→🐝→🍯</span><p className="mt-2 text-sm font-black">Flower • Bee • Hive</p><p className="text-xs text-white/50">Source verified via geotagged photo</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><span className="text-2xl">👨‍🌾→🚚</span><p className="mt-2 text-sm font-black">Harvest → Transport</p><p className="text-xs text-white/50">Weight mismatch auto-flagged</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><span className="text-2xl">🧪→🏭</span><p className="mt-2 text-sm font-black">Lab → Packaging</p><p className="text-xs text-white/50">Cert + QR per bottle</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><span className="text-2xl">🛒✓</span><p className="mt-2 text-sm font-black">Customer</p><p className="text-xs text-white/50">Scan → timeline + trust score</p></div></div>
        <div className="mt-10 flex flex-wrap justify-center gap-3"><Link to="/" className="rounded-full bg-white px-6 py-2.5 text-sm font-black text-black">View Concept 1 (video bg)</Link><Link to="/verify/B-1042" className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-bold">Open Verifier</Link></div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-10"><div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center"><p className="text-xs font-black uppercase tracking-widest text-white/40">How Blockchain Works — 5 nodes</p><div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-bold">{['Harvest ✔','Transport ✔','Lab ✔','Packing ✔','Customer ✔'].map(s=><span key={s} className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">{s}</span>)}</div></div></section>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-white/30">SIH26021 • Both concepts share /hero.mp4 + /verify/:batchId + /console wiring • 5173=Concept1 5174=Concept2</footer>
    </div>
  )
}
