import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import StatCard from '../../components/StatCard'
import { getAlerts, getBatches, getChainStatus } from '../../lib/api'

const SEVERITY_DOT = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
}

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    Promise.all([getBatches(), getAlerts(), getChainStatus()]).then(
      ([batches, alerts, chain]) => setData({ batches, alerts, chain }),
    )
  }, [])

  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    )
  }

  const { batches, alerts, chain } = data
  const flagged = batches.filter((b) => b.status === 'flagged').length
  const openAlerts = alerts.filter((a) => !a.acknowledged).length

  const floraMap = batches.reduce((acc, b) => {
    acc[b.floraType] = (acc[b.floraType] || 0) + 1
    return acc
  }, {})
  const floraData = Object.entries(floraMap).map(([flora, count]) => ({ flora, count }))

  const recentAlerts = [...alerts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-honey-dark">Dashboard</h1>
        <p className="mt-0.5 text-sm text-stone-500">Live view of your honey lots on the ledger.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard value={batches.length} label="Total batches" sub="all custody stages" />
        <StatCard
          value={flagged}
          label="Flagged batches"
          sub="need investigation"
          accent={flagged > 0 ? 'text-red-600' : 'text-honey-dark'}
        />
        <StatCard
          value={openAlerts}
          label="Open alerts"
          sub={`${alerts.length} total`}
          accent={openAlerts > 0 ? 'text-amber-600' : 'text-honey-dark'}
        />
        <StatCard
          value={chain.recentTransfers}
          label="Ledger transfers"
          sub={`block ${chain.blockNumber}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm lg:col-span-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
            Batches by flora
          </h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={floraData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f0e6" />
                <XAxis dataKey="flora" tick={{ fontSize: 11 }} interval={0} angle={-18} dy={8} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#fff7e6' }} />
                <Bar dataKey="count" name="Batches" fill="#B45309" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
              Recent alerts
            </h2>
            <Link to="/console/alerts" className="text-xs font-semibold text-honey hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recentAlerts.map((a) => (
              <li key={a.id} className="rounded-xl border border-amber-50 bg-amber-50/40 p-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-500">
                  <span className={`h-2 w-2 rounded-full ${SEVERITY_DOT[a.severity] || 'bg-stone-400'}`} />
                  {a.type} · {a.severity}
                  {!a.acknowledged ? (
                    <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                      OPEN
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-stone-700">{a.message}</p>
                <p className="mt-1 text-[11px] font-mono text-stone-400">{a.batchId}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
