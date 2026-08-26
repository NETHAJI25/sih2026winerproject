import { Link } from 'react-router-dom'
const pal={honey:'#F5A623',dark:'#1A1A1A'}
export default function CustomerHome(){
  const startScan=()=>{
    if('mediaDevices' in navigator){
      const el=document.getElementById('scan-input')
      if(el) el.click()
    } else alert('Camera not supported — upload QR image')
  }
  return (<div className="min-h-screen bg-[#FFFBEB]"><div className="mx-auto max-w-[640px] px-4 py-8">
    <h1 className="text-2xl font-black" style={{color:pal.dark}}>HoneyChain — Customer</h1>
    <p className="text-sm text-stone-600">Scan any jar, verify purity, report issues.</p>
    <div className="mt-6 grid gap-4">
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-bold">Scan QR Code</h2>
        <p className="text-xs text-stone-500">Point camera at jar QR or upload image — opens /verify/B-xxx</p>
        <div className="mt-3 flex gap-2">
          <button onClick={startScan} className="rounded-full px-5 py-2.5 text-sm font-bold text-white" style={{background:pal.honey}}>Open Camera</button>
          <input id="scan-input" type="file" accept="image/*" capture="environment" className="hidden" onChange={e=>{
            const f=e.target.files?.[0]; if(!f) return; alert('QR image selected: '+f.name+' — demo would decode to /verify/B-1042')
          }}/>
          <Link to="/verify/B-1042" className="rounded-full border bg-white px-5 py-2.5 text-sm font-bold">View demo B-1042</Link>
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-bold">Report an Issue — with proofs</h2>
        <p className="text-xs text-stone-500">Upload photo/video + bill, describe issue — creates alert for FPO/Admin</p>
        <form onSubmit={e=>{e.preventDefault(); const fd=new FormData(e.target); const batch=fd.get('batch'); alert('Report submitted for '+batch+' — stored to RTDB /reports'); e.target.reset()}} className="mt-3 space-y-2">
          <input name="batch" placeholder="Batch ID e.g. B-1042" className="w-full rounded-xl border px-3 py-2 text-sm" required/>
          <select name="type" className="w-full rounded-xl border px-3 py-2 text-sm"><option>Adulteration suspected</option><option>Damaged seal</option><option>Wrong weight</option><option>Other</option></select>
          <textarea name="desc" placeholder="Describe issue" rows="3" className="w-full rounded-xl border px-3 py-2 text-sm" required/>
          <input name="proof" type="file" accept="image/*,video/*" multiple className="w-full rounded-xl border px-3 py-2 text-sm"/>
          <button type="submit" className="w-full rounded-full py-2.5 text-sm font-bold text-white" style={{background:pal.dark}}>Submit Report with proofs</button>
        </form>
      </div>
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-bold">Customer Care</h2>
        <p className="text-sm">nethajiramesh25@gmail.com · +91-877864603 · Team Vibranium, SRM IST</p>
        <p className="text-xs text-stone-500 mt-2">FPO Helpline: Tiruvallur FPO Collection Center · 9am-6pm IST</p>
        <a href="mailto:nethajiramesh25@gmail.com" className="mt-3 inline-block rounded-full border px-4 py-2 text-sm font-bold">Email support</a>
      </div>
    </div>
    <div className="mt-8 flex gap-3 text-xs">
      <Link to="/verify/B-1042" className="underline">Sample verified jar</Link>
      <Link to="/" className="underline">Home</Link>
    </div>
  </div></div>)
}
