import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { getAlerts, onModeChange } from '../lib/api'

const NAV = [
  { to: '/console', end: true, label: 'Dashboard', icon: 'dashboard' },
  { to: '/console/batches', end: false, label: 'Batches', icon: 'batches' },
  { to: '/console/receive', end: false, label: 'Receive', icon: 'receive' },
  { to: '/console/alerts', end: false, label: 'Alerts', icon: 'alerts', badge: true },
  { to: '/console/explorer', end: false, label: 'Ledger Explorer', icon: 'explorer' },
]

const ICON_PATHS = {
  dashboard: (
    <path d="M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-5H4v5Zm10-16v5h6V4h-6Z" />
  ),
  batches: (
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
  ),
  receive: (
    <>
      <path d="M12 3v10" />
      <path d="m8 9 4 4 4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </>
  ),
  alerts: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
  explorer: (
    <>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </>
  ),
}

function NavIcon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
    >
      {ICON_PATHS[name]}
    </svg>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 24 24" className="h-7 w-7">
        <path
          d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
          fill="#B45309"
          stroke="#452A07"
          strokeWidth="1.5"
        />
        <path
          d="M12 7.5c1.8 2.2 2.7 3.7 2.7 5a2.7 2.7 0 1 1-5.4 0c0-1.3.9-2.8 2.7-5Z"
          fill="#FFFBEB"
        />
      </svg>
      <span className="text-lg font-extrabold tracking-tight text-honey-dark">
        Honey<span className="text-honey">Chain</span>
      </span>
    </div>
  )
}

function ModeDot({ mode }) {
  const live = mode === 'live'
  return (
    <span className="flex items-center gap-2 rounded-full border border-amber-100 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 shadow-sm">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          live ? 'bg-emerald-500' : 'animate-pulse bg-amber-400'
        }`}
      />
      {live ? 'API live' : 'Demo data'}
    </span>
  )
}

export default function Layout() {
  const [mode, setMode] = useState('demo')
  const [openAlerts, setOpenAlerts] = useState(0)

  useEffect(() => onModeChange(setMode), [])

  useEffect(() => {
    let alive = true
    const load = async () => {
      const alerts = await getAlerts()
      if (alive) setOpenAlerts(alerts.filter((a) => !a.acknowledged).length)
    }
    load()
    window.addEventListener('honeychain:alerts-updated', load)
    return () => {
      alive = false
      window.removeEventListener('honeychain:alerts-updated', load)
    }
  }, [])

  const linkClass = ({ isActive }) =>
    `flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-honey/10 text-honey-dark shadow-sm'
        : 'text-stone-600 hover:bg-amber-50 hover:text-honey-dark'
    }`

  const chipClass = ({ isActive }) =>
    `whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
      isActive
        ? 'bg-honey text-white shadow'
        : 'border border-amber-200 bg-white text-stone-600 hover:border-honey hover:text-honey-dark'
    }`

  return (
    <div className="flex min-h-screen bg-honey-cream">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-amber-100 bg-white p-4 md:flex">
        <Logo />
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              <span className="flex items-center gap-3">
                <NavIcon name={item.icon} />
                {item.label}
              </span>
              {item.badge && openAlerts > 0 ? (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                  {openAlerts}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
        <p className="mt-4 px-3 text-[11px] leading-relaxed text-stone-400">
          FPO Console v0.1
          <br />
          SIH 2026 · Team Vibranium
        </p>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-amber-100 bg-white/85 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div className="md:hidden">
              <Logo />
            </div>
            <p className="hidden text-sm font-semibold text-stone-500 md:block">
              Farmer Producer Organization Console
            </p>
            <ModeDot mode={mode} />
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={chipClass}
              >
                {item.label}
                {item.badge && openAlerts > 0 ? ` (${openAlerts})` : ''}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
