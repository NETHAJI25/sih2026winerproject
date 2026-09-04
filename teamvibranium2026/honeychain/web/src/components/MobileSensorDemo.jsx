import { useState } from 'react'
export default function MobileSensorDemo({ onData }){
  const [status,setStatus]=useState('idle')
  const [data,setData]=useState(null)
  async function connect(){
    setStatus('locating')
    if(!navigator.geolocation){ setStatus('no-geo'); return }
    navigator.geolocation.getCurrentPosition(async pos=>{
      const {latitude:lat,longitude:lng}=pos.coords
      setStatus('fetching weather')
      try{
        const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m&timezone=auto`)
        const j=await r.json()
        const cur=j.current||{}
        const d={temp_c:cur.temperature_2m??27, humidity_pct:cur.relative_humidity_2m??62, weight_kg:(26+Math.random()*4).toFixed(1), sound_db:(58+Math.random()*8).toFixed(1), lat,lng, ts:new Date().toISOString(), source:'mobile-demo'}
        setData(d); setStatus('connected'); onData&&onData(d)
        try{ await fetch((import.meta.env.VITE_API_URL||'http://localhost:4000')+'/api/telemetry/ingest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({hiveCode:'HIVE-KVIC-MOBILE',tempC:d.temp_c,humidityPct:d.humidity_pct,weightKg:d.weight_kg,soundDb:d.sound_db})})}catch(e){}
      }catch{ setStatus('weather fail') }
    },()=>setStatus('denied'))
  }
  async function ble(){
    setStatus('ble')
    try{
      if(!navigator.bluetooth) { setStatus('ble not supported'); return }
      const dev=await navigator.bluetooth.requestDevice({acceptAllDevices:true, optionalServices:['battery_service','environmental_sensing']})
      setStatus('ble '+dev.name); setData(d=>({...d, ble:dev.name}))
    }catch{ setStatus('ble cancelled') }
  }
  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-4">
      <div className="flex items-center gap-2"><span className="text-lg">📱</span><p className="text-sm font-black">Mobile Demo Sensor — Bluetooth + Climate</p><span className="ml-auto rounded-full bg-white border px-2 py-1 text-[11px] font-bold">{status}</span></div>
      <p className="text-xs text-stone-600 mt-1">Demo judges: tap mobile icon — no real hive needed. Phone GPS → weather (temp/hum) + BLE scan → pushed as <span className="font-mono">HIVE-KVIC-MOBILE</span> to Firebase.</p>
      <div className="mt-3 flex gap-2">
        <button onClick={connect} className="flex-1 rounded-full bg-[#1A1A1A] py-2 text-sm font-bold text-white">📱 Connect Mobile — Get Climate</button>
        <button onClick={ble} className="rounded-full border bg-white px-4 py-2 text-sm font-bold">BLE Scan</button>
      </div>
      {data && <div className="mt-3 rounded-xl bg-white border p-3 text-xs font-mono">📍 {data.lat?.toFixed(3)},{data.lng?.toFixed(3)} · 🌡️ {data.temp_c}°C · 💧 {data.humidity_pct}% · ⚖️ {data.weight_kg}kg {data.ble?`· BLE ${data.ble}`:''}</div>}
      <p className="mt-2 text-[11px] text-stone-400">Real hive: DHT22+HX711 → same /api/telemetry/ingest . Demo proves IoT pipeline without hardware.</p>
    </div>
  )
}
