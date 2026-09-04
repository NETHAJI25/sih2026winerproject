import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import MobileSensorDemo from '../../components/MobileSensorDemo';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const AI = import.meta.env.VITE_AI_URL || 'http://localhost:8001';

async function jget(url) {
  try { const r = await fetch(url); if (!r.ok) throw new Error(); return await r.json(); } catch { return null; }
}

export default function HiveMonitor() {
  const [hives, setHives] = useState([]);
  const [selected, setSelected] = useState('');
  const [data, setData] = useState(null);
  const [health, setHealth] = useState(null);
  const [liveHint, setLiveHint] = useState('polling');

  useEffect(() => {
    jget(`${BASE}/api/hives`).then((d) => {
      const list = d?.hives || [{ hive_code: 'HIVE-KVIC-001', status: 'active', flora_source: 'Mustard', last_reading: { temp_c: 34.2, humidity_pct: 62, weight_kg: 28.5 } }, { hive_code: 'HIVE-KVIC-002', status: 'active', flora_source: 'Eucalyptus', last_reading: { temp_c: 36.1, humidity_pct: 78, weight_kg: 22.1 } }];
      setHives(list);
      if (list[0]) setSelected(list[0].hive_code);
    });
    const fbKey = import.meta.env.VITE_FIREBASE_API_KEY;
    setLiveHint(fbKey ? 'Firebase realtime ready' : 'REST polling (add Firebase keys for realtime)');
  }, []);

  useEffect(() => {
    if (!selected) return;
    let alive = true;
    async function load() {
      const tel = await jget(`${BASE}/api/telemetry/${selected}?limit=50`);
      const rows = tel?.telemetry || genDemo(selected);
      if (!alive) return;
      setData({ telemetry: rows, stats: tel?.stats || null });
      if (rows.length) {
        const last = rows[rows.length - 1];
        try {
          const r = await fetch(`${AI}/colony-health`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ temp_c: Number(last.temp_c), humidity_pct: Number(last.humidity_pct), weight_kg: Number(last.weight_kg), sound_db: Number(last.sound_db || 60), varroa_count: 2, brood_score: 4 }) });
          if (r.ok) setHealth(await r.json());
        } catch { setHealth({ status: last.temp_c > 36 ? 'attention' : 'healthy', confidence: 87, advice: 'Demo mode: AI offline' }); }
      }
    }
    load();
    const id = setInterval(load, 5000);
    return () => { alive = false; clearInterval(id); };
  }, [selected]);

  const chartData = (data?.telemetry || []).map((r) => ({ ts: new Date(r.ts).toLocaleTimeString(), temp: Number(r.temp_c), hum: Number(r.humidity_pct), weight: Number(r.weight_kg) }));
  const statusColor = health?.status === 'healthy' ? 'bg-emerald-500' : health?.status === 'attention' ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-honey-dark">Hive Monitor</h1>
          <p className="text-sm text-stone-500">IoT telemetry · AI colony health · Firebase realtime · {liveHint}</p>
        </div>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-semibold">
          {hives.map((h) => <option key={h.hive_code} value={h.hive_code}>{h.hive_code} — {h.flora_source || h.bee_species}</option>)}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-stone-400">Colony Health</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${statusColor}`} />
            <span className="text-lg font-extrabold capitalize text-honey-dark">{health?.status || 'loading...'}</span>
            <span className="ml-auto text-xs font-semibold text-stone-500">{health?.confidence || '--'}% confidence</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-stone-600">{health?.advice || 'Awaiting AI analysis...'}</p>
          {health?.drivers ? <p className="mt-1 text-[11px] text-stone-400">{health.drivers}</p> : null}
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-stone-400">Live Telemetry</p>
          {data?.telemetry?.length ? (() => { const last = data.telemetry[data.telemetry.length - 1]; return <div className="mt-2 grid grid-cols-3 gap-2 text-center"><div><p className="text-lg font-black text-honey-dark">{Number(last.temp_c).toFixed(1)}°C</p><p className="text-[11px] text-stone-400">Temp</p></div><div><p className="text-lg font-black text-honey-dark">{Number(last.humidity_pct).toFixed(0)}%</p><p className="text-[11px] text-stone-400">Humidity</p></div><div><p className="text-lg font-black text-honey-dark">{Number(last.weight_kg).toFixed(1)}kg</p><p className="text-[11px] text-stone-400">Weight</p></div></div>; })() : <p className="mt-2 text-sm text-stone-400">No data</p>}
          <p className="mt-2 text-[11px] text-stone-400">Sound: {data?.telemetry?.length ? `${Number(data.telemetry[data.telemetry.length - 1].sound_db || 62)} dB` : '--'} · Updated every 5s</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-stone-400">Productivity Estimate</p>
          <YieldWidget flora={hives.find((h) => h.hive_code === selected)?.flora_source || 'Mustard'} healthScore={health?.healthScore || health?.confidence || 75} />
        </div>
      </div>

      <section className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">Telemetry history (last 50 readings)</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f0e6" />
              <XAxis dataKey="ts" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temp" stroke="#B45309" dot={false} strokeWidth={2} name="Temp °C" />
              <Line type="monotone" dataKey="hum" stroke="#0E7490" dot={false} strokeWidth={2} name="Humidity %" />
              <Line type="monotone" dataKey="weight" stroke="#15803D" dot={false} strokeWidth={2} name="Weight kg" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <MobileSensorDemo onData={(d)=>{ setHives(h=> h.some(x=>x.hive_code==='HIVE-KVIC-MOBILE')?h:[...h,{hive_code:'HIVE-KVIC-MOBILE', status:'mobile-demo', flora_source:'Mobile Climate', bee_species:'Apis demo', last_reading:{temp_c:d.temp_c,humidity_pct:d.humidity_pct,weight_kg:d.weight_kg}}]); setSelected('HIVE-KVIC-MOBILE'); }} />

      <section className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">All hives</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hives.map((h) => (
            <button key={h.hive_code} onClick={() => setSelected(h.hive_code)} className={`rounded-xl border p-3 text-left transition ${selected === h.hive_code ? 'border-honey bg-amber-50' : 'border-amber-100 bg-white hover:border-honey/40'}`}>
              <p className="text-sm font-bold text-honey-dark">{h.hive_code}</p>
              <p className="text-xs text-stone-500">{h.bee_species || 'Apis mellifera'} · {h.flora_source || 'Mixed'} · {h.status}</p>
              {h.last_reading ? <p className="mt-1 font-mono text-xs text-stone-600">{Number(h.last_reading.temp_c).toFixed(1)}°C · {Number(h.last_reading.humidity_pct).toFixed(0)}% · {Number(h.last_reading.weight_kg).toFixed(1)}kg</p> : null}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function YieldWidget({ flora, healthScore }) {
  const [est, setEst] = useState(null);
  useEffect(() => { fetch(`${AI}/productivity?flora=${encodeURIComponent(flora)}&boxes=10&season=flow&health_score=${healthScore}`).then((r) => r.json()).then(setEst).catch(() => setEst({ estimateKg: (6.5 * 10 * (0.45 + healthScore / 100 * 0.55)).toFixed(1) })); }, [flora, healthScore]);
  if (!est) return <p className="mt-2 text-sm text-stone-400">Calculating...</p>;
  return <div className="mt-2"><p className="text-2xl font-black text-honey-dark">{est.estimateKg} kg</p><p className="text-xs text-stone-500">10 boxes · {flora} · health {healthScore}%</p><p className="mt-1 text-[11px] text-stone-400">ML + rule blended · per box ~{(est.estimateKg / 10).toFixed(1)}kg</p></div>;
}

function genDemo(code) {
  const now = Date.now();
  return Array.from({ length: 20 }, (_, i) => ({ ts: new Date(now - (20 - i) * 3600000).toISOString(), temp_c: 33 + Math.sin(i / 3) * 1.5 + Math.random(), humidity_pct: 62 + Math.cos(i / 2) * 8, weight_kg: 26 + i * 0.15, sound_db: 58 + Math.random() * 8 }));
}
