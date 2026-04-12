import StockInput from '../components/StockInput'

function BrainChartIcon({ className = '', strokeWidth = '1.4' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M15.5 7C13 5 8 7.5 7.5 12.5C6 13.2 5 14.5 5 16C5 17.8 6.2 19.3 7.8 19.8C7.9 21.5 9.2 23 11 23.3L11 25"
        stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M16.5 7C19 5 24 7.5 24.5 12.5C26 13.2 27 14.5 27 16C27 17.8 25.8 19.3 24.2 19.8C24.1 21.5 22.8 23 21 23.3L21 25"
        stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M11 25C13 25 14.5 23.5 16 25C17.5 23.5 19 25 21 25"
        stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M15.5 7C15.5 6 16.5 6 16.5 7"
        stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M8,10.5 C9,9 10.5,12 11.5,10.5" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M7.5,14.5 C9,13 10.5,16 12.5,14.5" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M8.5,18.5 C10,17 11.5,20 13,18.5" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M20.5,10.5 C21.5,9 23,12 24,10.5" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M19.5,14.5 C21,13 22.5,16 24.5,14.5" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M19.5,18.5 C21,17 22.5,20 24,18.5" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.6"/>
      <polyline points="7,21 10.5,17 13.5,19.5 16,15 19,18 22,13.5 23.1,14.4"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
      <polygon points="25,16 22.3,15.3 23.85,13.5" fill="currentColor" opacity="0.95"/>
    </svg>
  )
}

// Background chart data — mix of bullish, bearish, volatile shapes
const BG_CHARTS = [
  { points: "0,55 25,45 50,50 80,30 110,18 140,10 170,5",  color: "#4ade80", top: "8%",  left: "4%",   dur: "9s",  delay: "0s"   },
  { points: "0,10 30,18 60,32 90,48 120,55 150,60 170,62", color: "#f87171", top: "10%", left: "28%",  dur: "11s", delay: "2.5s" },
  { points: "0,40 20,22 40,48 60,28 85,50 110,18 140,32 170,12", color: "#4ade80", top: "7%",  right: "5%",  dur: "10s", delay: "5s"   },
  { points: "0,58 30,54 65,50 95,35 120,20 150,10 170,6",  color: "#4ade80", top: "38%", left: "2%",   dur: "13s", delay: "1s"   },
  { points: "0,20 25,32 55,52 85,60 115,52 145,40 170,35", color: "#f87171", top: "42%", right: "4%",  dur: "8s",  delay: "6s"   },
  { points: "0,45 20,38 45,42 70,28 100,22 130,15 170,8",  color: "#4ade80", top: "38%", left: "30%",  dur: "12s", delay: "3.5s" },
  { points: "0,15 30,12 60,20 90,38 120,52 150,57 170,60", color: "#f87171", bottom:"18%",left: "18%",  dur: "9s",  delay: "7s"   },
  { points: "0,60 30,55 60,50 90,38 120,24 150,14 170,8",  color: "#4ade80", bottom:"16%",right: "15%", dur: "11s", delay: "2s"   },
  { points: "0,35 25,50 50,58 80,50 110,32 140,18 170,12", color: "#4ade80", bottom:"6%", left: "5%",   dur: "10s", delay: "4s"   },
  { points: "0,25 30,30 60,22 90,35 120,28 150,40 170,32", color: "#60a5fa", bottom:"8%", right: "6%",  dur: "14s", delay: "8s"   },
  { points: "0,50 20,42 45,55 70,35 95,48 125,20 170,15",  color: "#4ade80", top: "22%", right: "28%", dur: "11s", delay: "9s"   },
  { points: "0,12 30,20 60,40 85,55 110,48 140,35 170,30", color: "#f87171", bottom:"30%",right: "30%", dur: "9s",  delay: "1.5s" },
]

// Parse "x,y x,y ..." into array of {x,y}
function parsePts(str) {
  return str.trim().split(/\s+/).map(p => {
    const [x, y] = p.split(',').map(Number)
    return { x, y }
  })
}

// Returns polygon points string for an arrowhead at the end of the polyline
function arrowheadPoints(pointsStr, len = 10, width = 5) {
  const pts = parsePts(pointsStr)
  const tip  = pts[pts.length - 1]
  const prev = pts[pts.length - 2]
  const dx = tip.x - prev.x, dy = tip.y - prev.y
  const mag = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / mag, uy = dy / mag   // unit direction
  const px = -uy,     py = ux          // perpendicular
  const base = { x: tip.x - ux * len, y: tip.y - uy * len }
  const b1   = { x: base.x + px * width, y: base.y + py * width }
  const b2   = { x: base.x - px * width, y: base.y - py * width }
  return `${tip.x},${tip.y} ${b1.x.toFixed(1)},${b1.y.toFixed(1)} ${b2.x.toFixed(1)},${b2.y.toFixed(1)}`
}

// Shorten the last point so the line stops at the arrowhead base
function shortenedPoints(pointsStr, len = 10) {
  const pts = parsePts(pointsStr)
  const tip  = pts[pts.length - 1]
  const prev = pts[pts.length - 2]
  const dx = tip.x - prev.x, dy = tip.y - prev.y
  const mag = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / mag, uy = dy / mag
  const newEnd = { x: tip.x - ux * len, y: tip.y - uy * len }
  return [...pts.slice(0, -1), newEnd].map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

function BackgroundChart({ chart }) {
  const { points, color, dur, delay, ...pos } = chart
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        ...pos,
        animation: `chartFade ${dur} ${delay} ease-in-out infinite`,
        width: 170,
      }}
    >
      <svg viewBox="0 0 170 70" fill="none" width="170" height="70">
        <polyline
          points={shortenedPoints(points)}
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <polygon
          points={arrowheadPoints(points)}
          fill={color}
        />
      </svg>
    </div>
  )
}

function Home({ onAnalyze }) {
  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">

      {/* Keyframe styles */}
      <style>{`
        @keyframes chartFade {
          0%   { opacity: 0; }
          12%  { opacity: 0.35; }
          70%  { opacity: 0.35; }
          88%  { opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Animated background charts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {BG_CHARTS.map((chart, i) => (
          <BackgroundChart key={i} chart={chart} />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800 px-6 py-4 bg-black/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
            <BrainChartIcon className="w-6 h-6 text-gray-300" strokeWidth="1.5" />
          </div>
          <h1 className="text-white font-bold text-base leading-none">Stock Analysis Engine</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 pt-14">
        <div className="w-full max-w-3xl">
          <StockInput onAnalyze={onAnalyze} />
        </div>

        <div className="flex flex-col items-center text-center mt-24">
          <div className="w-28 h-28 rounded-3xl bg-gray-900/80 backdrop-blur-sm flex items-center justify-center mb-7">
            <BrainChartIcon className="w-16 h-16 text-gray-500" strokeWidth="1.2" />
          </div>
          <h2 className="text-white font-bold text-xl">Select a stock to analyze</h2>
        </div>
      </main>
    </div>
  )
}

export default Home
