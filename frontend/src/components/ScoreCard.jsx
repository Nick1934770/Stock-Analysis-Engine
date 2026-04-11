function buildWhyText({ recommendation, sentiment_score, ma_signal, rsi }) {
  const parts = []

  if (Math.abs(sentiment_score) > 0.3)
    parts.push(`news sentiment is ${sentiment_score > 0 ? 'positive' : 'negative'}`)

  if (ma_signal === 'Bullish Crossover') parts.push('price is in a bullish MA crossover')
  else if (ma_signal === 'Bearish Crossover') parts.push('price is in a bearish MA crossover')
  else if (ma_signal === 'Price Above MA10') parts.push('price is holding above the 10-day average')
  else if (ma_signal === 'Price Below MA10') parts.push('price is trading below the 10-day average')

  if (rsi != null) {
    if (rsi >= 70) parts.push(`RSI at ${rsi} signals overbought conditions`)
    else if (rsi <= 30) parts.push(`RSI at ${rsi} signals oversold conditions`)
  }

  if (parts.length === 0) return 'Mixed signals across sentiment and technical indicators.'

  const joined = parts.slice(0, 2).join(' and ')
  const action =
    recommendation === 'BUY'  ? 'supporting a BUY' :
    recommendation === 'SELL' ? 'supporting a SELL' : 'resulting in a HOLD'
  return `${joined[0].toUpperCase() + joined.slice(1)}, ${action} recommendation.`
}

function SignalRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-gray-400 text-sm">{label}</span>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  )
}

function SignalBadge({ text, color }) {
  const colors = {
    green:  'text-green-400 bg-green-900/30 border border-green-700/50',
    red:    'text-red-400 bg-red-900/30 border border-red-700/50',
    yellow: 'text-yellow-400 bg-yellow-900/30 border border-yellow-400',
    gray:   'text-gray-400 bg-gray-700/60 border border-gray-600/50',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color] || colors.gray}`}>
      {text}
    </span>
  )
}

function ScoreCard({ data }) {
  const {
    recommendation, score, confidence,
    sentiment_score, technical_score,
    momentum,
    rsi, ma_signal,
    news = [], prices = [],
    company_name, ticker,
  } = data

  const recColor =
    recommendation === 'BUY'
      ? { text: 'text-green-400', bar: 'bg-green-400', bg: 'bg-green-900/30', border: 'border-green-400' }
      : recommendation === 'SELL'
      ? { text: 'text-red-400', bar: 'bg-red-400', bg: 'bg-red-900/30', border: 'border-red-400' }
      : { text: 'text-yellow-400', bar: 'bg-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-400' }

  // Score contributions
  const sentContrib = sentiment_score * 0.6   // max ±0.6
  const techContrib = technical_score * 0.4   // max ±0.4
  const sentBarPct  = Math.min(Math.abs(sentContrib) / 0.6 * 100, 100)
  const techBarPct  = Math.min(Math.abs(techContrib) / 0.4 * 100, 100)

  // Price snapshot
  const currentPrice = prices.length > 0 ? prices[prices.length - 1].close : null
  const prevPrice    = prices.length > 1 ? prices[prices.length - 2].close : null
  const dayChange    = currentPrice != null && prevPrice != null ? currentPrice - prevPrice : null
  const dayChangePct = dayChange != null && prevPrice ? (dayChange / prevPrice) * 100 : null
  const closes       = prices.map(p => p.close)
  const high30       = closes.length > 0 ? Math.max(...closes) : null
  const low30        = closes.length > 0 ? Math.min(...closes) : null

  // News distribution
  const newsDist = news.reduce(
    (acc, a) => { acc[a.sentiment] = (acc[a.sentiment] || 0) + 1; return acc },
    { positive: 0, neutral: 0, negative: 0 }
  )

  // RSI label + color
  const rsiLabel = rsi == null ? 'N/A' : rsi >= 70 ? 'Overbought' : rsi <= 30 ? 'Oversold' : 'Neutral'
  const rsiColor = rsi == null ? 'gray' : rsi >= 70 ? 'red' : rsi <= 30 ? 'green' : 'gray'

  // MA signal color
  const maColor =
    ma_signal === 'Bullish Crossover' ? 'green' :
    ma_signal === 'Bearish Crossover' ? 'red' : 'gray'

  // Momentum color
  const momColor = momentum > 0 ? 'green' : momentum < 0 ? 'red' : 'gray'
  const momText  = momentum != null
    ? `${momentum > 0 ? '▲ +' : momentum < 0 ? '▼ ' : ''}${momentum}%`
    : '—'

  const whyText = buildWhyText({ recommendation, sentiment_score, ma_signal, rsi })

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="label mb-1">Recommendation</p>
          <p className="text-gray-400 text-sm">{company_name || ticker}</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full border text-sm font-bold ${recColor.text} ${recColor.bg} ${recColor.border}`}>
          {ticker}
        </div>
      </div>

      {/* Big recommendation badge */}
      <div className={`flex items-center justify-between p-4 rounded-xl ${recColor.bg} border ${recColor.border} mb-5`}>
        <span className={`text-4xl font-black tracking-wide ${recColor.text}`}>{recommendation}</span>
        <div className="text-right">
          <p className="label mb-0.5">Score</p>
          <p className={`text-2xl font-bold ${recColor.text}`}>
            {score > 0 ? '+' : ''}{(score * 100).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="label">Confidence</span>
          <span className={`text-sm font-semibold ${recColor.text}`}>{confidence.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-2 ${recColor.bar} rounded-full transition-all duration-700`} style={{ width: `${confidence}%` }} />
        </div>
      </div>

      {/* Score contribution bars */}
      <div className="mb-5 pt-4 border-t border-gray-700">
        <p className="label mb-3">Score Contribution</p>
        {[
          { label: 'Sentiment (60%)', contrib: sentContrib, pct: sentBarPct },
          { label: 'Technical  (40%)', contrib: techContrib, pct: techBarPct },
        ].map(({ label, contrib, pct }) => (
          <div key={label} className="mb-2.5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-xs">{label}</span>
              <span className={`text-xs font-semibold ${contrib > 0 ? 'text-green-400' : contrib < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {contrib > 0 ? '+' : ''}{(contrib * 100).toFixed(0)}
              </span>
            </div>
            <div className="flex h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="w-1/2 flex justify-end">
                {contrib < 0 && (
                  <div className="bg-red-400 rounded-l-full" style={{ width: `${pct}%` }} />
                )}
              </div>
              <div className="w-px bg-gray-500" />
              <div className="w-1/2">
                {contrib > 0 && (
                  <div className="bg-green-400 rounded-r-full" style={{ width: `${pct}%` }} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Signal breakdown */}
      <div className="mb-5 pt-4 border-t border-gray-700">
        <p className="label mb-1">Signal Breakdown</p>
        <div className="divide-y divide-gray-700/50">
          <SignalRow label="MA Trend">
            <SignalBadge text={ma_signal || '—'} color={maColor} />
          </SignalRow>
          <SignalRow label="Momentum (10d)">
            <SignalBadge text={momText} color={momColor} />
          </SignalRow>
          <SignalRow label="RSI (14)">
            <SignalBadge text={rsi != null ? `${rsi} · ${rsiLabel}` : `— · N/A`} color={rsiColor} />
          </SignalRow>
          <SignalRow label="News">
            <span className="text-green-400 bg-green-900/30 border border-green-700/50 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold">
              {newsDist.positive}▲
            </span>
            <span className="text-gray-400 bg-gray-700/60 border border-gray-600/50 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold">
              {newsDist.neutral}–
            </span>
            <span className="text-red-400 bg-red-900/30 border border-red-700/50 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold">
              {newsDist.negative}▼
            </span>
          </SignalRow>
        </div>
      </div>

      {/* Price snapshot */}
      <div className="mb-5 pt-4 border-t border-gray-700">
        <p className="label mb-3">Price Snapshot</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Current Price</p>
            <p className="text-white text-lg font-bold">
              {currentPrice != null ? `$${currentPrice.toFixed(2)}` : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">1-Day Change</p>
            <p className={`text-sm font-semibold ${dayChange == null ? 'text-gray-400' : dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dayChange != null
                ? `${dayChange >= 0 ? '▲ +' : '▼ '}${dayChange.toFixed(2)} (${dayChangePct.toFixed(1)}%)`
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">30-Day High</p>
            <p className="text-gray-300 text-sm font-semibold">{high30 != null ? `$${high30.toFixed(2)}` : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">30-Day Low</p>
            <p className="text-gray-300 text-sm font-semibold">{low30 != null ? `$${low30.toFixed(2)}` : '—'}</p>
          </div>
        </div>
      </div>

      {/* Why text */}
      <div className="pt-4 border-t border-gray-700">
        <p className="label mb-2">Why This Recommendation</p>
        <p className="text-gray-300 text-sm leading-relaxed">{whyText}</p>
      </div>
    </div>
  )
}

export default ScoreCard
