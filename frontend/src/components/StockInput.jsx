import { useState, useRef, useEffect } from 'react'

const STOCKS = [
  { ticker: 'AAPL',  name: 'Apple Inc.' },
  { ticker: 'MSFT',  name: 'Microsoft Corporation' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'GOOG',  name: 'Alphabet Inc. (Class C)' },
  { ticker: 'AMZN',  name: 'Amazon.com Inc.' },
  { ticker: 'NVDA',  name: 'NVIDIA Corporation' },
  { ticker: 'META',  name: 'Meta Platforms Inc.' },
  { ticker: 'TSLA',  name: 'Tesla Inc.' },
  { ticker: 'BRK',   name: 'Berkshire Hathaway' },
  { ticker: 'AVGO',  name: 'Broadcom Inc.' },
  { ticker: 'JPM',   name: 'JPMorgan Chase & Co.' },
  { ticker: 'LLY',   name: 'Eli Lilly and Company' },
  { ticker: 'V',     name: 'Visa Inc.' },
  { ticker: 'UNH',   name: 'UnitedHealth Group' },
  { ticker: 'XOM',   name: 'Exxon Mobil Corporation' },
  { ticker: 'MA',    name: 'Mastercard Inc.' },
  { ticker: 'COST',  name: 'Costco Wholesale Corporation' },
  { ticker: 'HD',    name: 'The Home Depot Inc.' },
  { ticker: 'PG',    name: 'Procter & Gamble Co.' },
  { ticker: 'JNJ',   name: 'Johnson & Johnson' },
  { ticker: 'ABBV',  name: 'AbbVie Inc.' },
  { ticker: 'BAC',   name: 'Bank of America Corporation' },
  { ticker: 'KO',    name: 'The Coca-Cola Company' },
  { ticker: 'MRK',   name: 'Merck & Co. Inc.' },
  { ticker: 'CVX',   name: 'Chevron Corporation' },
  { ticker: 'CRM',   name: 'Salesforce Inc.' },
  { ticker: 'ORCL',  name: 'Oracle Corporation' },
  { ticker: 'AMD',   name: 'Advanced Micro Devices Inc.' },
  { ticker: 'NFLX',  name: 'Netflix Inc.' },
  { ticker: 'ADBE',  name: 'Adobe Inc.' },
  { ticker: 'INTC',  name: 'Intel Corporation' },
  { ticker: 'CSCO',  name: 'Cisco Systems Inc.' },
  { ticker: 'WMT',   name: 'Walmart Inc.' },
  { ticker: 'TGT',   name: 'Target Corporation' },
  { ticker: 'DIS',   name: 'The Walt Disney Company' },
  { ticker: 'PFE',   name: 'Pfizer Inc.' },
  { ticker: 'MRNA',  name: 'Moderna Inc.' },
  { ticker: 'GS',    name: 'Goldman Sachs Group Inc.' },
  { ticker: 'MS',    name: 'Morgan Stanley' },
  { ticker: 'WFC',   name: 'Wells Fargo & Company' },
  { ticker: 'GE',    name: 'GE Aerospace' },
  { ticker: 'BA',    name: 'The Boeing Company' },
  { ticker: 'CAT',   name: 'Caterpillar Inc.' },
  { ticker: 'F',     name: 'Ford Motor Company' },
  { ticker: 'GM',    name: 'General Motors Company' },
  { ticker: 'RIVN',  name: 'Rivian Automotive Inc.' },
  { ticker: 'UBER',  name: 'Uber Technologies Inc.' },
  { ticker: 'LYFT',  name: 'Lyft Inc.' },
  { ticker: 'ABNB',  name: 'Airbnb Inc.' },
  { ticker: 'SPOT',  name: 'Spotify Technology S.A.' },
  { ticker: 'SNAP',  name: 'Snap Inc.' },
  { ticker: 'X',     name: 'X Corp (formerly Twitter)' },
  { ticker: 'PYPL',  name: 'PayPal Holdings Inc.' },
  { ticker: 'SQ',    name: 'Block Inc.' },
  { ticker: 'COIN',  name: 'Coinbase Global Inc.' },
  { ticker: 'HOOD',  name: 'Robinhood Markets Inc.' },
  { ticker: 'PLTR',  name: 'Palantir Technologies Inc.' },
  { ticker: 'AI',    name: 'C3.ai Inc.' },
  { ticker: 'SNOW',  name: 'Snowflake Inc.' },
  { ticker: 'NET',   name: 'Cloudflare Inc.' },
  { ticker: 'ZM',    name: 'Zoom Video Communications' },
  { ticker: 'SHOP',  name: 'Shopify Inc.' },
  { ticker: 'SPY',   name: 'S&P 500 ETF (SPDR)' },
  { ticker: 'QQQ',   name: 'Nasdaq 100 ETF (Invesco)' },
  { ticker: 'VOO',   name: 'Vanguard S&P 500 ETF' },
]

const EXAMPLE_TICKERS = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META']

function getMatches(query) {
  if (!query.trim()) return []
  const q = query.toUpperCase()
  return STOCKS.filter(s => s.ticker.startsWith(q)).slice(0, 8)
}

function StockInput({ onAnalyze }) {
  const [value, setValue]         = useState('')
  const [error, setError]         = useState('')
  const [open, setOpen]           = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const containerRef              = useRef(null)

  const matches = getMatches(value)

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const select = (ticker) => {
    setValue(ticker)
    setOpen(false)
    setActiveIdx(-1)
    setError('')
    onAnalyze(ticker)
  }

  const handleChange = (e) => {
    setValue(e.target.value.toUpperCase())
    setOpen(true)
    setActiveIdx(-1)
    if (error) setError('')
  }

  const handleKeyDown = (e) => {
    if (!open || matches.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, matches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      select(matches[activeIdx].ticker)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIdx(-1)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (activeIdx >= 0 && matches.length > 0) {
      select(matches[activeIdx].ticker)
      return
    }
    const v = value.trim().toUpperCase()
    if (!v) { setError('Please enter a stock ticker.'); return }
    if (!/^[A-Za-z]{1,5}$/.test(v)) { setError('Enter a valid ticker (1–5 letters, e.g. AAPL).'); return }
    setError('')
    setOpen(false)
    onAnalyze(v)
  }

  const handleChipClick = (t) => {
    setValue(t)
    setError('')
    setOpen(false)
    onAnalyze(t)
  }

  const showDropdown = open && matches.length > 0

  return (
    <div className="w-full" ref={containerRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {/* Search icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
            </svg>
          </div>

          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (matches.length > 0) setOpen(true) }}
            placeholder="Search stocks by symbol or name..."
            maxLength={30}
            className={`w-full bg-gray-900 border ${
              error ? 'border-red-500' : showDropdown ? 'border-gray-500 rounded-t-xl rounded-b-none' : 'border-gray-700 focus:border-gray-500 rounded-xl'
            } pl-12 pr-10 py-4 text-white text-base font-mono placeholder-gray-600 outline-none transition-colors duration-150`}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />

          {value && (
            <button
              type="button"
              onClick={() => { setValue(''); setError(''); setOpen(false) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 bg-gray-900 border border-t-0 border-gray-500 rounded-b-xl overflow-hidden z-50">
              {matches.map((stock, i) => (
                <button
                  key={stock.ticker}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); select(stock.ticker) }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                    i === activeIdx ? 'bg-gray-800' : 'hover:bg-gray-800/60'
                  } ${i < matches.length - 1 ? 'border-b border-gray-800' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white font-mono font-semibold text-sm w-14">{stock.ticker}</span>
                    <span className="text-gray-400 text-sm">{stock.name}</span>
                  </div>
                  {i === activeIdx && (
                    <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-sm mt-2 px-1">{error}</p>}
      </form>

      {/* Example tickers */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <span className="text-gray-600 text-sm">Try:</span>
        {EXAMPLE_TICKERS.map((t) => (
          <button
            key={t}
            onClick={() => handleChipClick(t)}
            className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 hover:border-gray-500
                       text-gray-400 hover:text-white text-xs font-mono transition-colors"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}

export default StockInput
