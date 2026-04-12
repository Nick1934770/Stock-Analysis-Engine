const LAYERS = [
  { key: 'macro',      label: 'MACRO' },
  { key: 'sector',     label: 'SECTOR' },
  { key: 'company',    label: 'COMPANY' },
  { key: 'sentiment',  label: 'SENTIMENT' },
  { key: 'technicals', label: 'TECHNICALS' },
  { key: 'summary',    label: 'OUTLOOK' },
]

function ExplanationPanel({ explanation }) {
  if (!explanation) return null

  return (
    <div className="card h-full flex flex-col">
      <p className="text-gray-600 text-xs font-mono uppercase tracking-wider mb-4">Analysis Breakdown</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-gray-800 flex-1">
        {LAYERS.map(({ key, label }) => {
          const isOutlook = key === 'summary'
          return (
            <div
              key={key}
              className={`px-4 py-4 ${isOutlook ? 'bg-gray-800/80' : 'bg-gray-900'}`}
            >
              <p className="text-gray-600 text-xs font-mono uppercase tracking-wider mb-2">{label}</p>
              <p className={`text-sm leading-relaxed ${isOutlook ? 'text-gray-200' : 'text-gray-300'}`}>
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
