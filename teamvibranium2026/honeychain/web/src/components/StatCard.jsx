export default function StatCard({ value, label, sub, accent = 'text-honey-dark' }) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <p className={`text-3xl font-extrabold tracking-tight ${accent}`}>{value}</p>
      <p className="mt-1 text-sm font-semibold text-stone-600">{label}</p>
      {sub ? <p className="mt-0.5 text-xs text-stone-400">{sub}</p> : null}
    </div>
  )
}
