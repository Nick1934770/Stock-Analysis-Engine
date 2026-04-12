import { useState, useEffect, useRef } from 'react'
import ScoreCard from '../components/ScoreCard'
import NewsList from '../components/NewsList'
import PriceChart from '../components/PriceChart'
import ExplanationPanel from '../components/ExplanationPanel'
import { createAnalysisWebSocket } from '../services/websocket'

function Results({ ticker, onBack }) {
  const [analysisData, setAnalysisData] = useState(null)
  const [error, setError] = useState(null)
  const [visibleError, setVisibleError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const wsRef = useRef(null)
  const errorTimerRef = useRef(null)

  // Delay showing errors by 2s — absorbs transient WebSocket drops on mount
  useEffect(() => {
    clearTimeout(errorTimerRef.current)
    if (error) {
      errorTimerRef.current = setTimeout(() => setVisibleError(error), 2000)
    } else {
      setVisibleError(null)
    }
    return () => clearTimeout(errorTimerRef.current)
  }, [error])

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
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Terminal header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-sm font-mono"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          BACK
        </button>

        <div className="flex flex-col items-center gap-0.5">
          <span className="text-white font-mono font-bold text-xl tracking-widest">{ticker}</span>
          {analysisData?.company_name && (
            <span className="text-gray-500 text-xs tracking-wide">{analysisData.company_name}</span>
          )}
        </div>

        <button
          onClick={handleReanalyze}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-700 hover:border-gray-500
                     text-gray-400 hover:text-gray-200 text-xs font-mono transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ↺ REFRESH
        </button>
      </div>

      {/* Error state */}
      {visibleError && (
        <div className="mb-6 p-4 rounded border border-red-800/60 bg-red-950/20 text-red-400 text-sm">
          <p className="font-mono text-xs text-red-500 mb-1 uppercase tracking-wider">Analysis Failed</p>
          <p className="text-red-300/80 text-sm">{error}</p>
          <button
            onClick={onBack}
            className="mt-3 text-xs font-mono text-red-500 hover:text-red-300 transition-colors underline"
          >
            ← Try a different ticker
          </button>
        </div>
      )}

      {/* Loading state */}
      {(isLoading || (error && !visibleError)) && !visibleError && !analysisData && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-6 h-6 border border-gray-600 border-t-gray-300 rounded-full animate-spin" />
          <p className="text-gray-600 text-xs font-mono tracking-widest uppercase">Analyzing {ticker}</p>
        </div>
      )}

      {/* Results layout */}
      {analysisData && !isLoading && (
        <div className="space-y-4">
          {/* Top row: ScoreCard (2/5) + Analysis Breakdown (3/5) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <ScoreCard data={analysisData} />
            </div>
            <div className="lg:col-span-3 flex flex-col">
              <ExplanationPanel explanation={analysisData.explanation} />
            </div>
          </div>

          {/* Price chart — full width */}
          <PriceChart prices={analysisData.prices} />

          {/* News feed — full width */}
          <NewsList news={analysisData.news} />
        </div>
      )}
    </div>
  )
}

export default Results
