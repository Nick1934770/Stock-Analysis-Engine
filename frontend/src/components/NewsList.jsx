const BORDER = {
  positive: 'border-l-green-500',
  negative: 'border-l-red-500',
  neutral:  'border-l-gray-700',
}

const SENTIMENT_TEXT = {
  positive: 'text-green-500',
  negative: 'text-red-500',
  neutral:  'text-gray-600',
}

function NewsList({ news }) {
  if (!news || news.length === 0) {
    return (
      <div className="card">
        <p className="text-gray-600 text-xs font-mono uppercase tracking-wider mb-4">News Feed</p>
        <p className="text-gray-600 text-sm">No news articles found.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <p className="text-gray-600 text-xs font-mono uppercase tracking-wider mb-4">News Feed</p>
      <div className="space-y-px">
        {news.map((article, i) => (
          <div
            key={i}
            className={`flex items-start justify-between gap-4 px-3 py-2.5 border-l-2 ${BORDER[article.sentiment] || BORDER.neutral}
                        bg-gray-900 hover:bg-gray-800/60 transition-colors`}
          >
            <div className="flex-1 min-w-0">
              {article.url ? (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-white line-clamp-1 leading-snug block"
                >
                  {article.title}
                </a>
              ) : (
                <p className="text-sm text-gray-300 line-clamp-1 leading-snug">{article.title}</p>
              )}
            </div>
            <span className={`text-xs font-mono shrink-0 mt-0.5 ${SENTIMENT_TEXT[article.sentiment] || SENTIMENT_TEXT.neutral}`}>
              {article.sentiment}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NewsList
