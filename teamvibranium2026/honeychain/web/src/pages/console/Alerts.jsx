import { useEffect, useState } from 'react'
import { ackAlert, getAlerts } from '../../lib/api'

const SEVERITY_STYLES = {
  high: 'border-l-red-500 bg-red-50/50',
  medium: 'border-l-amber-500 bg-amber-50/40',
  low: 'border-l-emerald-500 bg-emerald-50/40',
}

const SEVERITY_DOT = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
}

function DilutionPayload({ payload }) {
  const delta = (payload.outKg - payload.inKg).toFixed(1)
  return (
    <div className="mt-4 rounded-2xl border border-red-200 bg-white p-4">
      <div className="flex items-center justify-center gap-5 sm:gap-10">
        <div className="text-center">
          <p className="text-4xl font-black tracking-tight text-stone-800 sm:text-5xl">
            {payload.inKg}
          </p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-stone-500">kg in</p>
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#B45309"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7 shrink-0"
        >
          <path d="M4 12h16" />
          <path d="m14 6 6 6-6 6" />
        </svg>
        <div className="text-center">
          <p className="text-4xl font-black tracking-tight text-red-600 sm:text-5xl">{payload.outKg}</p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-red-400">kg out</p>
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-bold text-red-700">
        +{delta} kg unaccounted — possible syrup dilution
      </p>
    </div>
  )
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    getAlerts().then((list) =>
      setAlerts(
        [...list].sort((a, b) => Number(a.acknowledged) - Number(b.acknowledged)),
      ),
    )
  }, [])

  const acknowledge = async (id) => {
    setBusyId(id)
    await ackAlert(id)
    setAlerts((list) =>
      list
        .map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
        .sort((a, b) => Number(a.acknowledged) - Number(b.acknowledged)),
    )
    setBusyId(null)
    window.dispatchEvent(new Event('honeychain:alerts-updated'))
  }

  const openCount = alerts.filter((a) => !a.acknowledged).length

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-honey-dark">Alerts</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            Anomalies raised by ledger rules and field inspections.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            openCount > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {openCount} open
        </span>
      </div>

      <div className="space-y-4">
        {alerts.map((a) => (
          <article
            key={a.id}
            className={`rounded-2xl border border-l-4 border-amber-100 p-5 shadow-sm ${
              SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.low
            }`}
          >
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-stone-500">
              <span className={`h-2 w-2 rounded-full ${SEVERITY_DOT[a.severity] || 'bg-stone-400'}`} />
              {a.type} · {a.severity}
              <span className="rounded bg-white px-2 py-0.5 font-mono text-[10px] normal-case text-honey-dark ring-1 ring-amber-200">
                {a.batchId}
              </span>
              <span className="ml-auto font-medium normal-case text-stone-400">
                {new Date(a.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-stone-700">{a.message}</p>

            {a.type === 'dilution' && a.payload ? <DilutionPayload payload={a.payload} /> : null}

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => acknowledge(a.id)}
                disabled={a.acknowledged || busyId === a.id}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  a.acknowledged
                    ? 'cursor-default bg-stone-100 text-stone-400'
                    : 'bg-honey-dark text-white hover:bg-honey'
                }`}
              >
                {a.acknowledged ? 'Acknowledged' : busyId === a.id ? 'Signing…' : 'Acknowledge'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
