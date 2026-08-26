import { useEffect, useRef, useState } from 'react'
import { getBatches } from '../../lib/api'

export default function Receive() {
  const [batches, setBatches] = useState([])
  const [batchId, setBatchId] = useState('')
  const [actual, setActual] = useState('')
  const [toast, setToast] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    getBatches().then((list) => {
      setBatches(list)
      const first = list.find((b) => b.status !== 'flagged')
      if (first) setBatchId(first.id)
    })
    return () => clearTimeout(timerRef.current)
  }, [])

  const selected = batches.find((b) => b.id === batchId) || null
  const expected = selected ? selected.weightKg : null
  const parsed = parseFloat(actual)
  const diff = selected && actual !== '' && !Number.isNaN(parsed) ? parsed - expected : null
  const mismatch = diff !== null && Math.abs(diff) > 0.5

  const confirm = () => {
    setToast(`Receipt of ${parsed} kg for ${selected.id} signed and queued to the ledger (demo mode).`)
    setActual('')
    timerRef.current = setTimeout(() => setToast(''), 3200)
  }

  return (
    <div className="animate-fade-up mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-honey-dark">Receive batch</h1>
        <p className="mt-0.5 text-sm text-stone-500">
          Weigh the consignment at your center and sign the custody handover.
        </p>
      </div>

      <section className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
        <label className="text-xs font-bold uppercase tracking-wide text-stone-500">
          Incoming batch
        </label>
        <select
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 outline-none focus:border-honey"
        >
          {batches.map((b) => (
            <option key={b.id} value={b.id} disabled={b.status === 'flagged'}>
              {b.id} — {b.floraType} ({b.status})
            </option>
          ))}
        </select>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-amber-100 bg-honey-cream/70 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Expected weight</p>
            <p className="mt-1 text-3xl font-black tracking-tight text-honey-dark">
              {expected !== null ? `${expected} kg` : '—'}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">
              {selected ? `dispatched from ${selected.transfers[0]?.from || 'origin'}` : ''}
            </p>
          </div>

          <div className={`rounded-2xl border p-4 ${mismatch ? 'border-red-300 bg-red-50/60' : 'border-amber-100'}`}>
            <label className="text-xs font-bold uppercase tracking-wide text-stone-500">
              Actual weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="e.g. 41.8"
              className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-lg font-bold text-stone-800 outline-none placeholder:text-sm placeholder:font-normal placeholder:text-stone-400 focus:border-honey"
            />
            <p className="mt-1.5 text-[11px] font-medium text-stone-500">
              {diff === null
                ? 'Tolerance ±0.5 kg'
                : mismatch
                  ? `Δ ${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg off expected`
                  : 'Within tolerance (±0.5 kg)'}
            </p>
          </div>
        </div>

        {mismatch ? (
          <div className="animate-fade-up mt-4 rounded-2xl border-l-4 border-red-500 bg-red-50 p-4">
            <p className="text-sm font-extrabold uppercase tracking-wide text-red-700">
              Weight mismatch — verify before signing
            </p>
            <p className="mt-1 text-xs text-red-600">
              Expected {expected} kg but the scale shows {actual} kg. Recheck seals, tare and moisture
              before confirming.
            </p>
          </div>
        ) : null}

        <button
          onClick={confirm}
          disabled={!selected || actual === '' || Number.isNaN(parsed)}
          className="mt-5 w-full rounded-full bg-honey py-3 text-sm font-bold text-white transition enabled:hover:bg-honey-dark disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          Confirm Receive
        </button>
        <p className="mt-2 text-center text-[11px] text-stone-400">
          Signing records a transfer transaction against this batch on the ledger.
        </p>
      </section>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 max-w-xs animate-fade-up rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
