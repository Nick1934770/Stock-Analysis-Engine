import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <div className="space-y-0.5">
        <p className="text-blue-400">Close: <span className="text-white font-semibold">${d.close?.toFixed(2)}</span></p>
        <p className="text-gray-400">High: ${d.high?.toFixed(2)}</p>
        <p className="text-gray-400">Low: ${d.low?.toFixed(2)}</p>
        <p className="text-gray-500">Vol: {(d.volume / 1_000_000).toFixed(1)}M</p>
      </div>
    </div>
  )
}

function PriceChart({ prices }) {
  if (!prices || prices.length === 0) {
    return (
      <div className="card flex items-center justify-center h-64">
        <p className="text-gray-500 text-sm">No price data available.</p>
      </div>
    )
  }

  const data = prices.map((p) => ({
    ...p,
    date: p.date.slice(5), // MM-DD
  }))

  const closes = data.map((d) => d.close)
  const minClose = Math.min(...closes)
  const maxClose = Math.max(...closes)
  const padding = (maxClose - minClose) * 0.08 || 1
  const domain = [minClose - padding, maxClose + padding]

  const firstClose = closes[0]
  const lastClose = closes[closes.length - 1]
  const change = lastClose - firstClose
  const changePct = ((change / firstClose) * 100).toFixed(2)
  const isPositive = change >= 0

  // Show every 5th label to avoid crowding
  const tickFormatter = (_, index) => {
    if (index % 5 === 0) return data[index]?.date || ''
    return ''
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <p className="label">30-Day Price Chart</p>
        <div className="text-right">
          <p className="text-white font-semibold">${lastClose.toFixed(2)}</p>
          <p className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)} ({isPositive ? '+' : ''}{changePct}%)
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#374151"
            tick={{ fill: '#6B7280', fontSize: 10 }}
            tickLine={false}
            tickFormatter={tickFormatter}
          />
          <YAxis
            domain={domain}
            stroke="#374151"
            tick={{ fill: '#6B7280', fontSize: 10 }}
            tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={firstClose} stroke="#4B5563" strokeDasharray="4 4" strokeWidth={1} />
          <Line
            type="monotone"
            dataKey="close"
            stroke={isPositive ? '#34D399' : '#F87171'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: isPositive ? '#34D399' : '#F87171' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PriceChart
