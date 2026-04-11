import { useState } from 'react'
import Home from './pages/Home'
import Results from './pages/Results'

function App() {
  const [page, setPage] = useState('home')
  const [ticker, setTicker] = useState('')

  const handleAnalyze = (t) => {
    setTicker(t.toUpperCase().trim())
    setPage('results')
  }

  const handleBack = () => {
    setTicker('')
    setPage('home')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {page === 'home' ? (
        <Home onAnalyze={handleAnalyze} />
      ) : (
        <Results ticker={ticker} onBack={handleBack} />
      )}
    </div>
  )
}

export default App
