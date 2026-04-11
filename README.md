# Stock Intelligence AI

A hackathon-ready stock analysis web app that provides BUY/SELL/HOLD recommendations powered by sentiment analysis and technical indicators — with live WebSocket updates.

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Optional: copy env file and set NEWS_API_KEY
cp .env.example .env

uvicorn main:app --reload
# → http://localhost:8000
# → Swagger docs: http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Features

| Feature | Implementation |
|---|---|
| Stock data | `yfinance` — 30-day OHLC |
| News | NewsAPI → Yahoo Finance RSS → fallback |
| Sentiment | FinBERT (optional) → keyword scoring |
| Technicals | MA10, MA30, 10-day momentum |
| Scoring | `0.6 × sentiment + 0.4 × technical` |
| Real-time | WebSocket (`/ws/analyze/{ticker}`) |
| Cache | In-memory, 5-minute TTL |

## Scoring

```
final_score = 0.6 × sentiment_score + 0.4 × technical_score

BUY   →  score > +0.5
HOLD  →  -0.5 ≤ score ≤ +0.5
SELL  →  score < -0.5

confidence = abs(score) × 100
```

## Optional: Enable FinBERT

Uncomment in `backend/requirements.txt` and reinstall:

```
transformers==4.40.1
torch==2.3.0
```

First run will download the `ProsusAI/finbert` model (~1.3 GB). Falls back to keyword sentiment automatically if unavailable.

## Deployment

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Set env variable: `VITE_WS_URL=wss://your-backend.onrender.com`

### Backend → Render

1. Push `backend/` to GitHub
2. New Web Service on [Render](https://render.com)
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port 8000`
5. Set `ALLOWED_ORIGINS` to include your Vercel domain

## API

| Endpoint | Description |
|---|---|
| `GET /` | Health info |
| `GET /api/health` | Health check |
| `WS /ws/analyze/{ticker}` | Live analysis stream |
| `DELETE /api/cache/{ticker}` | Clear ticker cache |

## Project Structure

```
stock-intelligence-ai/
├── backend/
│   ├── main.py                  # FastAPI app + CORS + WebSocket
│   ├── requirements.txt
│   ├── api/
│   │   ├── routes.py            # REST endpoints
│   │   └── websocket.py        # WebSocket handler
│   ├── services/
│   │   ├── stock_service.py     # yfinance data
│   │   ├── news_service.py      # NewsAPI / RSS
│   │   ├── sentiment_service.py # FinBERT / keyword
│   │   ├── indicator_service.py # MA, momentum
│   │   └── scoring_service.py   # Final score + recommendation
│   ├── utils/
│   │   ├── cache.py             # In-memory TTL cache
│   │   └── helpers.py
│   ├── models/schemas.py
│   └── core/config.py
└── frontend/
    └── src/
        ├── pages/
        │   ├── Home.jsx         # Ticker input
        │   └── Results.jsx      # Live results
        └── components/
            ├── ScoreCard.jsx    # BUY/SELL/HOLD card
            ├── NewsList.jsx     # News + sentiment badges
            ├── PriceChart.jsx   # Recharts 30-day line chart
            ├── StatusFeed.jsx   # Live WebSocket log
            └── StockInput.jsx   # Ticker input + validation
```
