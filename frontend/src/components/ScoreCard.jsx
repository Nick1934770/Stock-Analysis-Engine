function buildSummary({ recommendation, sentiment_score, ma_signal, rsi }) {
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
  return `${joined[0].toUpperCase() + joined.slice(1)}, ${action}.`
}

function Label({ children }) {
  return (
    <span className="text-gray-600 text-xs font-mono uppercase tracking-wider">{children}</span>
  )
}

function SignalRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  )
}

function Tag({ text, variant = 'gray' }) {
  const variants = {
    green:  'text-green-400 border border-green-800 bg-green-950/40',
    red:    'text-red-400 border border-red-800 bg-red-950/40',
    yellow: 'text-yellow-400 border border-yellow-800 bg-yellow-950/40',
    gray:   'text-gray-400 border border-gray-700 bg-gray-800/40',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono ${variants[variant] || variants.gray}`}>
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
  } = data

  const recVariant =
    recommendation === 'BUY'  ? 'green' :
    recommendation === 'SELL' ? 'red'   : 'yellow'

  const recColors = {
    green:  { text: 'text-green-400', bar: 'bg-green-400', dim: 'text-green-600' },
    red:    { text: 'text-red-400',   bar: 'bg-red-400',   dim: 'text-red-700' },
    yellow: { text: 'text-yellow-400',bar: 'bg-yellow-400',dim: 'text-yellow-700' },
  }
  const rc = recColors[recVariant]

  // Score contributions
  const sentContrib = sentiment_score * 0.6
  const techContrib = technical_score * 0.4
  const sentBarPct  = Math.min(Math.abs(sentContrib) / 0.6 * 100, 100)
  const techBarPct  = Math.min(Math.abs(techContrib) / 0.4 * 100, 100)

  // Price data
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

  // RSI label + variant
  const rsiLabel   = rsi == null ? 'N/A' : rsi >= 70 ? 'Overbought' : rsi <= 30 ? 'Oversold' : 'Neutral'
  const rsiVariant = rsi == null ? 'gray' : rsi >= 70 ? 'red' : rsi <= 30 ? 'green' : 'gray'

  // MA signal variant
  const maVariant =
    ma_signal === 'Bullish Crossover' ? 'green' :
    ma_signal === 'Bearish Crossover' ? 'red' : 'gray'

  // Momentum
  const momVariant = momentum > 0 ? 'green' : momentum < 0 ? 'red' : 'gray'
  const momText    = momentum != null
    ? `${momentum > 0 ? '+' : ''}${momentum}%`
    : '—'

  const summary = buildSummary({ recommendation, sentiment_score, ma_signal, rsi })

  return (
    <div className="card flex flex-col gap-0">

      {/* Price snapshot */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <Label>Current Price</Label>
          <p className="text-white font-mono text-2xl font-bold mt-0.5 leading-none">
            {currentPrice != null ? `$${currentPrice.toFixed(2)}` : '—'}
          </p>
          <p className={`text-xs font-mono mt-0.5 ${dayChange == null ? 'text-gray-600' : dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {dayChange != null
              ? `${dayChange >= 0 ? '+' : ''}${dayChange.toFixed(2)}  (${dayChangePct >= 0 ? '+' : ''}${dayChangePct.toFixed(2)}%)`
              : '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-600 text-xs font-mono">30D HIGH / LOW</p>
          <p className="text-gray-300 text-xs font-mono mt-0.5">
            {high30 != null ? `$${high30.toFixed(2)}` : '—'}
            <span className="text-gray-600 mx-1">/</span>
            {low30 != null ? `$${low30.toFixed(2)}` : '—'}
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-800">
        <div>
          <Label>Recommendation</Label>
          <p className={`font-mono font-black text-3xl tracking-wide mt-0.5 ${rc.text}`}>
            {recommendation}
          </p>
        </div>
        <div className="text-right">
          <Label>Score</Label>
          <p className={`font-mono text-xl font-bold mt-0.5 ${rc.text}`}>
            {score > 0 ? '+' : ''}{(score * 100).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Confidence */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <Label>Confidence</Label>
          <span className={`text-xs font-mono ${rc.text}`}>{confidence.toFixed(0)}%</span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-1 ${rc.bar} rounded-full`} style={{ width: `${confidence}%` }} />
        </div>
      </div>

      {/* Factor weights */}
      <div className="mb-3 pt-3 border-t border-gray-800">
        <Label>Factor Weights</Label>
        <div className="mt-1.5 space-y-1.5">
          {[
            { label: 'Sentiment  60%', contrib: sentContrib, pct: sentBarPct },
            { label: 'Technical  40%', contrib: techContrib, pct: techBarPct },
          ].map(({ label, contrib, pct }) => (
            <div key={label}>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-gray-600 text-xs font-mono">{label}</span>
                <span className={`text-xs font-mono ${contrib > 0 ? 'text-green-400' : contrib < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                  {contrib > 0 ? '+' : ''}{(contrib * 100).toFixed(0)}
                </span>
              </div>
              <div className="flex h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="w-1/2 flex justify-end">
                  {contrib < 0 && <div className="bg-red-500 rounded-l-full" style={{ width: `${pct}%` }} />}
                </div>
                <div className="w-px bg-gray-700" />
                <div className="w-1/2">
                  {contrib > 0 && <div className="bg-green-500 rounded-r-full" style={{ width: `${pct}%` }} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signals */}
      <div className="mb-3 pt-3 border-t border-gray-800">
        <Label>Signals</Label>
        <div className="mt-0.5 divide-y divide-gray-800/70">
          <SignalRow label="MA Trend">
            <Tag text={ma_signal || '—'} variant={maVariant} />
          </SignalRow>
          <SignalRow label="Momentum 10d">
            <Tag text={momText} variant={momVariant} />
          </SignalRow>
          <SignalRow label="RSI 14">
            <Tag text={rsi != null ? `${rsi}  ·  ${rsiLabel}` : `—  ·  N/A`} variant={rsiVariant} />
          </SignalRow>
          <SignalRow label="News">
            <span className="text-green-500 text-xs font-mono">{newsDist.positive}+</span>
            <span className="text-gray-600 text-xs font-mono px-1">/</span>
            <span className="text-gray-500 text-xs font-mono">{newsDist.neutral}~</span>
            <span className="text-gray-600 text-xs font-mono px-1">/</span>
            <span className="text-red-500 text-xs font-mono">{newsDist.negative}−</span>
          </SignalRow>
        </div>
      </div>

      {/* Summary */}
      <div className="pt-3 border-t border-gray-800">
        <Label>Summary</Label>
        <p className="text-gray-400 text-xs italic leading-relaxed mt-1">{summary}</p>
      </div>
    </div>
  )
}

export default ScoreCard
