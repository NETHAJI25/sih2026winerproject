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

export function getHives() {
  return request('/api/hives', {}, () => [
    { hive_code: 'HIVE-KVIC-001', status: 'active', flora_source: 'Mustard', bee_species: 'Apis mellifera', last_reading: { temp_c: 34.2, humidity_pct: 62, weight_kg: 28.5 } },
    { hive_code: 'HIVE-KVIC-002', status: 'active', flora_source: 'Eucalyptus', bee_species: 'Apis cerana', last_reading: { temp_c: 36.1, humidity_pct: 78, weight_kg: 22.1 } },
  ])
}
export function getTelemetry(hiveCode, limit = 50) {
  return request(`/api/telemetry/${hiveCode}?limit=${limit}`, {}, () => ({ telemetry: [], stats: null }))
}
export function ingestTelemetry(point) {
  return request('/api/telemetry/ingest', { method: 'POST', body: JSON.stringify(point) }, () => ({ inserted: [point] }))
}
export async function getColonyHealth(point) {
  const AI = import.meta.env.VITE_AI_URL || 'http://localhost:8001'
  try {
    const r = await fetch(`${AI}/colony-health`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(point) })
    if (!r.ok) throw new Error()
    return await r.json()
  } catch {
    return { status: 'healthy', confidence: 85, advice: 'Demo: AI offline' }
  }
}
