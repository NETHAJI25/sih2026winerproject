import { demoBatches, demoAlerts, demoChain } from './demoData'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const TIMEOUT_MS = 3500

let mode = 'demo'
const listeners = new Set()

export function getMode() {
  return mode
}

export function onModeChange(fn) {
  listeners.add(fn)
  fn(mode)
  return () => listeners.delete(fn)
}

function setMode(next) {
  if (next === mode) return
  mode = next
  listeners.forEach((fn) => fn(mode))
}

async function fetchJson(path, options = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

async function request(path, options, fallback) {
  try {
    const data = await fetchJson(path, options)
    setMode('live')
    return data
  } catch {
    setMode('demo')
    return typeof fallback === 'function' ? fallback() : fallback
  }
}

const clone = (value) => JSON.parse(JSON.stringify(value))

export function getBatches() {
  return request('/api/batches', {}, () => clone(demoBatches))
}

export function getBatch(id) {
  return request(`/api/batches/${id}`, {}, () => clone(demoBatches.find((b) => b.id === id) || null))
}

export function getAlerts() {
  return request('/api/alerts', {}, () => clone(demoAlerts))
}

export function ackAlert(id) {
  return request(`/api/alerts/${id}/ack`, { method: 'POST' }, () => {
    const found = demoAlerts.find((a) => a.id === id)
    if (found) found.acknowledged = true
    return { ok: true, id }
  })
}

export function getChainStatus() {
  return request('/api/chain/status', {}, () => clone(demoChain))
}

export function getPublicBatch(id) {
  return request(`/api/public/batches/${id}`, {}, () => {
    const batch = demoBatches.find((b) => b.id === id)
    if (!batch) return null
    return clone(batch)
  })
}
