/**
 * Creates a WebSocket connection to the analysis endpoint.
 * In dev, uses the Vite proxy (/ws/... → ws://localhost:8000/ws/...).
 * In prod, uses VITE_WS_URL env variable.
 */
export function createAnalysisWebSocket(ticker, onStatus, onResult, onError) {
  const wsBase = import.meta.env.VITE_WS_URL

  let url
  if (wsBase) {
    url = `${wsBase}/ws/analyze/${ticker}`
  } else {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    url = `${protocol}//${window.location.host}/ws/analyze/${ticker}`
  }

  const ws = new WebSocket(url)
  let resultReceived = false

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type === 'status') {
        onStatus(data.status, data.message)
      } else if (data.type === 'result') {
        resultReceived = true
        onResult(data.data)
      } else if (data.type === 'error') {
        onError(data.message)
      }
    } catch {
      onError('Failed to parse server response')
    }
  }

  ws.onerror = () => {
    if (!resultReceived) {
      onError('WebSocket connection failed. Make sure the backend is running on port 8000.')
    }
  }

  ws.onclose = (event) => {
    if (!event.wasClean && !event.code === 1000) {
      // Unexpected close — surface only if no result was already delivered
    }
  }

  return ws
}
