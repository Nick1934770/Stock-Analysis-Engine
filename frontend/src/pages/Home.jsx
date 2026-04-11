import StockInput from '../components/StockInput'

function Home({ onAnalyze }) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Top header bar */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                 className="w-5 h-5 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.75 3A6.75 6.75 0 0 0 3 9.75c0 2.01.882 3.818 2.288 5.063C4.475 15.668 4 16.8 4 18a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-.25h4V18a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1c0-1.2-.475-2.332-1.288-3.187A6.75 6.75 0 0 0 14.25 3H9.75Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-none">Stock Analysis Engine</h1>
            <p className="text-gray-500 text-xs mt-1">
              AI-powered stock analysis with trend prediction and sentiment analysis
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-4 pt-14">
        {/* Search bar */}
        <div className="w-full max-w-3xl">
          <StockInput onAnalyze={onAnalyze} />
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center text-center mt-24">
          <div className="w-28 h-28 rounded-3xl bg-gray-900 flex items-center justify-center mb-7">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
                 className="w-14 h-14 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.75 3A6.75 6.75 0 0 0 3 9.75c0 2.01.882 3.818 2.288 5.063C4.475 15.668 4 16.8 4 18a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-.25h4V18a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1c0-1.2-.475-2.332-1.288-3.187A6.75 6.75 0 0 0 14.25 3H9.75Z" />
            </svg>
          </div>
          <h2 className="text-white font-bold text-xl mb-3">Select a stock to analyze</h2>
          <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
            Search for a stock symbol above to get AI-powered analysis
            including price trends, news sentiment, and buy/sell/hold recommendations.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Home
