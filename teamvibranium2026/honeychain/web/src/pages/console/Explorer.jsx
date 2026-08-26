import { useEffect, useMemo, useState } from 'react'
import StatCard from '../../components/StatCard'
import StatusChip from '../../components/StatusChip'
import { getBatches, getChainStatus } from '../../lib/api'

function shortHash(hash) {
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`
}

export default function Explorer() {
  const [chain, setChain] = useState(null)
  const [txs, setTxs] = useState([])

  useEffect(() => {
    Promise.all([getChainStatus(), getBatches()]).then(([status, batches]) => {
      setChain(status)
      const feed = batches.flatMap((b) =>
        b.transfers.map((t) => ({ ...t, batchId: b.id, batchStatus: b.status })),
      )
      feed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      setTxs(feed.slice(0, 15))
    })
  }, [])

  const mockNote = useMemo(() => chain?.connected === 'mock-mode', [chain])

  if (!chain) {
    return <div className="h-64 animate-pulse rounded-2xl bg-white" />
  }

  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-honey-dark">Ledger Explorer</h1>
        <p className="mt-0.5 text-sm text-stone-500">Every custody transfer, hashed and ordered.</p>
      </div>

      {mockNote ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          mock-mode: local chain not connected — showing simulated ledger activity from the demo
          dataset.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value={chain.blockNumber} label="Block height" sub="latest sealed block" />
        <StatCard value={chain.recentTransfers} label="Recent transfers" sub="rolling window" />
        <StatCard
          value={chain.connected}
          label="Connection"
          sub={mockNote ? 'fallback active' : 'node reachable'}
          accent={mockNote ? 'text-amber-600' : 'text-emerald-600'}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-amber-100 bg-honey-cream/60 text-[11px] uppercase tracking-widest text-stone-500">
                <th className="px-4 py-3 font-bold">Tx hash</th>
                <th className="px-4 py-3 font-bold">Batch</th>
                <th className="px-4 py-3 font-bold">Action</th>
                <th className="px-4 py-3 font-bold">Weight</th>
                <th className="px-4 py-3 font-bold">Time</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.txHash} className="border-b border-amber-50 last:border-0 hover:bg-amber-50/40">
                  <td className="px-4 py-3">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${t.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-honey-dark underline decoration-dotted underline-offset-2 hover:text-honey"
                    >
                      {shortHash(t.txHash)}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold text-stone-700">{t.batchId}</span>
                  </td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-xs text-stone-600">
                    {t.from} <span className="text-honey">→</span> {t.to}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-700">{t.weightKg} kg</span>
                      <StatusChip status={t.batchStatus} />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-500">
                    {new Date(t.timestamp).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
