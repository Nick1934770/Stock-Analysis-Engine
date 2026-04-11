const API_BASE = import.meta.env.VITE_API_URL || ''

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/health`)
  return res.json()
}

export async function clearCache(ticker) {
  const res = await fetch(`${API_BASE}/api/cache/${ticker.toUpperCase()}`, { method: 'DELETE' })
  return res.json()
}
