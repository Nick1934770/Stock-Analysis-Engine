import { useState, useEffect, useRef } from 'react'
import ScoreCard from '../components/ScoreCard'
import NewsList from '../components/NewsList'
import PriceChart from '../components/PriceChart'
import ExplanationPanel from '../components/ExplanationPanel'
import { createAnalysisWebSocket } from '../services/websocket'

function Results({ ticker, onBack }) {
  const [analysisData, setAnalysisData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const wsRef = useRef(null)

  useEffect(() => {
    if (!ticker) return

    setAnalysisData(null)
    setError(null)
    setIsLoading(true)

    wsRef.current = createAnalysisWebSocket(
      ticker,
      () => {},
      (data) => {
        setAnalysisData(data)
        setError(null)
        setIsLoading(false)
      },
      (errMsg) => {
        setError(errMsg)
        setIsLoading(false)
      }
    )

    return () => {
      wsRef.current?.close()
    }
  }, [ticker])

  const handleReanalyze = () => {
    wsRef.current?.close()
    setAnalysisData(null)
    setError(null)
    setIsLoading(true)

    wsRef.current = createAnalysisWebSocket(
      ticker,
      () => {},
      (data) => { setAnalysisData(data); setError(null); setIsLoading(false) },
      (errMsg) => { setError(errMsg); setIsLoading(false) }
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-3">
          <span className="text-gray-300 font-mono font-bold text-lg">{ticker}</span>
          {!isLoading && (
            <button
              onClick={handleReanalyze}
              className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-500
                         text-gray-300 hover:text-white text-xs transition-colors"
            >
              ↺ Refresh
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-700/50 text-red-400 text-sm">
          <p className="font-semibold mb-1">Analysis failed</p>
          <p className="text-red-300/80">{error}</p>
          <button
            onClick={onBack}
            className="mt-3 text-xs underline hover:text-red-200 transition-colors"
          >
            ← Try a different ticker
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Analyzing {ticker}…</p>
        </div>
      )}

      {/* Results layout */}
      {analysisData && !isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreCard data={analysisData} />
            <NewsList news={analysisData.news} />
          </div>
          <ExplanationPanel explanation={analysisData.explanation} />
          <PriceChart prices={analysisData.prices} />
        </div>
      )}
    </div>
  )
}

export default Results
