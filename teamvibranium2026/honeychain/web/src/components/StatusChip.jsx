const STYLES = {
  created: 'bg-slate-100 text-slate-700 ring-slate-300',
  in_transit: 'bg-blue-50 text-blue-700 ring-blue-300',
  received: 'bg-indigo-50 text-indigo-700 ring-indigo-300',
  processed: 'bg-violet-50 text-violet-700 ring-violet-300',
  packaged: 'bg-emerald-50 text-emerald-700 ring-emerald-300',
  flagged: 'bg-red-50 text-red-700 ring-red-300',
}

const LABELS = {
  created: 'Created',
  in_transit: 'In Transit',
  received: 'Received',
  processed: 'Processed',
  packaged: 'Packaged',
  flagged: 'Flagged',
}

export default function StatusChip({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${
        STYLES[status] || STYLES.created
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status] || status}
    </span>
  )
}
