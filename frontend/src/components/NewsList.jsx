const SENTIMENT_STYLES = {
  positive: {
    badge: 'bg-green-900/40 text-green-400 border border-green-700/50',
    dot: 'bg-green-400',
  },
  negative: {
    badge: 'bg-red-900/40 text-red-400 border border-red-700/50',
    dot: 'bg-red-400',
  },
  neutral: {
    badge: 'bg-gray-700/60 text-gray-400 border border-gray-600/50',
    dot: 'bg-gray-400',
  },
}

function SentimentBadge({ sentiment }) {
  const styles = SENTIMENT_STYLES[sentiment] || SENTIMENT_STYLES.neutral
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${styles.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {sentiment}
    </span>
  )
}

function NewsList({ news }) {
  if (!news || news.length === 0) {
    return (
      <div className="card">
        <p className="label mb-4">News Sentiment</p>
        <p className="text-gray-500 text-sm">No news articles found.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <p className="label mb-4">News Sentiment</p>
      <div className="space-y-3">
        {news.map((article, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-xl bg-gray-750 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <span className="text-gray-500 text-xs font-mono mt-0.5 min-w-[1.2rem]">{i + 1}</span>
            <div className="flex-1 min-w-0">
              {article.url ? (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-200 hover:text-white line-clamp-2 leading-snug block mb-2"
                >
                  {article.title}
                </a>
              ) : (
                <p className="text-sm text-gray-200 line-clamp-2 leading-snug mb-2">{article.title}</p>
              )}
              <SentimentBadge sentiment={article.sentiment} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NewsList
