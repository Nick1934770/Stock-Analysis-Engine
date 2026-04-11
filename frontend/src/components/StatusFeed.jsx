const STATUS_LABELS = {
  fetching_stock_data: 'Fetching price data',
  fetching_news: 'Fetching latest news',
  running_sentiment: 'Analyzing sentiment',
  computing_indicators: 'Computing indicators',
  generating_score: 'Generating recommendation',
  complete: 'Analysis complete',
}

const STATUS_ICONS = {
  fetching_stock_data: '📈',
  fetching_news: '📰',
  running_sentiment: '🧠',
  computing_indicators: '📊',
  generating_score: '⚡',
  complete: '✅',
}

function StatusFeed({ statuses, isLoading }) {
  const currentStatus = statuses[statuses.length - 1]?.status

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        {isLoading && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        )}
        <h2 className="label">{isLoading ? 'Analyzing…' : 'Analysis Log'}</h2>
      </div>

      <div className="space-y-2">
        {Object.keys(STATUS_LABELS).map((key) => {
          const isReached = statuses.some((s) => s.status === key)
          const isCurrent = currentStatus === key && isLoading
          const isComplete = key === 'complete' ? !isLoading && isReached : isReached && !isCurrent

          return (
            <div
              key={key}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                isCurrent
                  ? 'bg-blue-500/10 border border-blue-500/30'
                  : isReached
                  ? 'opacity-60'
                  : 'opacity-20'
              }`}
            >
              <span className="text-base">{STATUS_ICONS[key]}</span>
              <span className={`text-sm ${isReached ? 'text-white' : 'text-gray-500'}`}>
                {STATUS_LABELS[key]}
              </span>
              {isCurrent && (
                <span className="ml-auto">
                  <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                </span>
              )}
              {isComplete && (
                <span className="ml-auto text-green-400 text-xs">✓</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StatusFeed
