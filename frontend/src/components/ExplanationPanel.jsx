const LAYERS = [
  { key: 'macro',      icon: '🌍', label: 'Macro' },
  { key: 'sector',     icon: '🏭', label: 'Sector' },
  { key: 'company',    icon: '🏢', label: 'Company' },
  { key: 'sentiment',  icon: '📰', label: 'Sentiment' },
  { key: 'technicals', icon: '📈', label: 'Technicals' },
  { key: 'summary',    icon: '🧠', label: 'Summary' },
]

function ExplanationPanel({ explanation }) {
  if (!explanation) return null

  return (
    <div className="card">
      <p className="label mb-4">Why This Recommendation</p>

      <div className="space-y-1">
        {LAYERS.map(({ key, icon, label }, i) => {
          const isSummary = key === 'summary'
          return (
            <div
              key={key}
              className={`flex gap-4 px-4 py-3 rounded-xl ${
                isSummary
                  ? 'bg-gray-750 border border-gray-700 mt-3'
                  : i % 2 === 0 ? 'bg-gray-800/40' : ''
              }`}
            >
              <div className="flex items-center gap-2 w-28 shrink-0">
                <span className="text-base">{icon}</span>
                <span className={`text-xs font-semibold uppercase tracking-wide ${isSummary ? 'text-white' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              <p className={`text-sm leading-relaxed ${isSummary ? 'text-gray-200' : 'text-gray-300'}`}>
                {explanation[key] || '—'}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ExplanationPanel
