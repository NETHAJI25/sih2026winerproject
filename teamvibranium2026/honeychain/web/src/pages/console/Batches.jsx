import { useEffect, useMemo, useState } from 'react'
import StatusChip from '../../components/StatusChip'
import { getBatches } from '../../lib/api'

const STATUS_ORDER = ['created', 'in_transit', 'received', 'processed', 'packaged', 'flagged']

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

function BatchDetailDrawer({ batch, onClose }) {
  if (!batch) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40"
      />
      <section className="animate-drawer-in relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-honey-dark">{batch.id}</h2>
            <p className="mt-1 text-sm text-stone-500">
              {batch.floraType} honey · {batch.weightKg} kg net
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-amber-200 px-3 py-1.5 text-xs font-bold text-stone-500 hover:border-honey hover:text-honey-dark"
          >
            Close
          </button>
        </div>

        <div className="mt-4">
          <StatusChip status={batch.status} />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-amber-100 bg-honey-cream/60 p-4 text-sm">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-stone-400">Harvest</dt>
            <dd className="mt-0.5 font-semibold text-stone-700">{fmtDate(batch.harvestDate)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-stone-400">Apiary</dt>
            <dd className="mt-0.5 font-semibold text-stone-700">{batch.apiary.name}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-stone-400">Coordinates</dt>
            <dd className="mt-0.5 font-mono text-xs text-stone-600">
              {batch.apiary.lat}, {batch.apiary.lng}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-stone-400">Farmer</dt>
            <dd className="mt-0.5 font-semibold text-stone-700">{batch.farmer.name}</dd>
          </div>
        </dl>

        <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-stone-500">
          Custody lineage
        </h3>
        <ol className="ml-3 mt-3 space-y-4 border-l-2 border-amber-200">
          {batch.transfers.map((t, i) => (
            <li key={i} className="relative pl-5">
              <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-honey" />
              <p className="text-sm font-semibold leading-snug text-stone-800">
                {t.from} <span className="mx-1 text-honey">→</span> {t.to}
              </p>
              <p className="mt-0.5 text-xs text-stone-500">
                {t.weightKg} kg · {fmtDate(t.timestamp)} · {t.geo}
              </p>
              <a
                href={`https://sepolia.etherscan.io/tx/${t.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block font-mono text-[11px] text-honey-dark underline decoration-dotted underline-offset-2 hover:text-honey"
              >
                {shortHash(t.txHash)}
              </a>
            </li>
          ))}
        </ol>

        <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-stone-500">
          Quality records
        </h3>
        {batch.qualityRecords.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-3 text-sm text-stone-500">
            No lab records uploaded yet for this batch.
          </p>
        ) : (
          batch.qualityRecords.map((q, i) => (
            <div key={i} className="mt-3 rounded-xl border border-amber-100 p-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-stone-900 px-2 py-0.5 text-[11px] font-bold text-white">
                  {q.testType}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    q.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {q.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-stone-700">{q.labName}</p>
              <p className="mt-1 break-all font-mono text-[11px] text-stone-400">{q.certificateHash}</p>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

export default function Batches() {
  const [batches, setBatches] = useState([])
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    getBatches().then(setBatches)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return batches
    return batches.filter((b) =>
      [b.id, b.floraType, b.farmer.name, b.status].some((f) => f.toLowerCase().includes(q)),
    )
  }, [batches, query])

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    items: filtered.filter((b) => b.status === status),
  })).filter((g) => g.items.length > 0)

  const selected = batches.find((b) => b.id === selectedId) || null

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-honey-dark">Batches</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            {filtered.length} of {batches.length} batches shown.
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search id, flora, farmer…"
          className="w-full max-w-xs rounded-full border border-amber-200 bg-white px-4 py-2 text-sm shadow-sm outline-none placeholder:text-stone-400 focus:border-honey md:w-72"
        />
      </div>

      {grouped.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-amber-300 bg-white p-8 text-center text-sm text-stone-500">
          No batches match your search.
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {grouped.map(({ status, items }) => (
            <section key={status} className="rounded-2xl border border-amber-100 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between px-1 pb-2">
                <StatusChip status={status} />
                <span className="text-xs font-bold text-stone-400">{items.length}</span>
              </div>
              <ul className="space-y-2">
                {items.map((b) => (
                  <li key={b.id}>
                    <button
                      onClick={() => setSelectedId(b.id)}
                      className={`w-full rounded-xl border p-3 text-left transition hover:border-honey hover:bg-amber-50/70 ${
                        b.status === 'flagged' ? 'border-red-200 bg-red-50/40' : 'border-amber-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm font-bold text-honey-dark">{b.id}</span>
                        <span className="text-sm font-semibold text-stone-700">{b.weightKg} kg</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-stone-500">
                        {b.floraType} · {b.farmer.name}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <BatchDetailDrawer batch={selected} onClose={() => setSelectedId(null)} />
    </div>
  )
}
