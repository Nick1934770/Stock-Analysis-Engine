import asyncio
import json
from fastapi import WebSocket, WebSocketDisconnect

from services.stock_service import get_stock_data
from services.news_service import get_news
from services.sentiment_service import analyze_sentiment
from services.indicator_service import compute_indicators
from services.scoring_service import compute_final_score
from services.explainer_service import generate_explanation
from utils.cache import cache


async def handle_analysis(websocket: WebSocket, ticker: str):
    await websocket.accept()
    ticker = ticker.upper().strip()

    async def send(msg: dict):
        await websocket.send_text(json.dumps(msg))

    async def status(s: str, message: str = ""):
        await send({"type": "status", "status": s, "message": message})

    try:
        # Check cache
        cached = cache.get(ticker)
        if cached:
            await status("complete", "Loaded from cache")
            await send({"type": "result", "data": cached})
            return

        # Phase 1: Stock data
        await status("fetching_stock_data", f"Fetching 30-day price data for {ticker}…")
        await asyncio.sleep(0.2)
        stock_data = get_stock_data(ticker)

        if "error" in stock_data and not stock_data.get("prices"):
            await send({"type": "error", "message": stock_data["error"]})
            return

        # Phase 2: News
        await status("fetching_news", f"Fetching latest news for {ticker}…")
        await asyncio.sleep(0.2)
        news_articles = get_news(ticker)

        # Phase 3: Sentiment
        await status("running_sentiment", "Analyzing news sentiment…")
        await asyncio.sleep(0.2)
        sentiment_result = analyze_sentiment(news_articles)

        # Phase 4: Technical indicators
        await status("computing_indicators", "Computing moving averages & momentum…")
        await asyncio.sleep(0.2)
        indicators = compute_indicators(stock_data.get("prices", []))

        # Phase 5: Score
        await status("generating_score", "Generating final recommendation…")
        await asyncio.sleep(0.2)
        scoring = compute_final_score(
            sentiment_score=sentiment_result["score"],
            technical_score=indicators["technical_score"],
        )

        # Phase 6: Explanation
        explanation = generate_explanation(
            ticker=ticker,
            sentiment_score=sentiment_result["score"],
            technical_score=indicators["technical_score"],
            momentum=indicators.get("momentum", 0) or 0,
            news=sentiment_result["articles"],
            prices=stock_data.get("prices", []),
            info=stock_data.get("info_snapshot", {}),
            rsi=indicators.get("rsi"),
            ma_signal=indicators.get("ma_signal"),
        )

        result = {
            "ticker": ticker,
            "company_name": stock_data.get("company_name", ticker),
            "recommendation": scoring["recommendation"],
            "score": scoring["score"],
            "confidence": scoring["confidence"],
            "sentiment_score": sentiment_result["score"],
            "technical_score": indicators["technical_score"],
            "ma10": indicators.get("ma10"),
            "ma30": indicators.get("ma30"),
            "momentum": indicators.get("momentum"),
            "rsi": indicators.get("rsi"),
            "ma_signal": indicators.get("ma_signal"),
            "news": [
                {
                    "title": a["title"],
                    "sentiment": a["sentiment"],
                    "url": a.get("url", ""),
                }
                for a in sentiment_result["articles"]
            ],
            "prices": stock_data.get("prices", []),
            "explanation": explanation,
            "info_snapshot": stock_data.get("info_snapshot", {}),
        }

        cache.set(ticker, result)

        await status("complete", "Analysis complete!")
        await send({"type": "result", "data": result})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await send({"type": "error", "message": f"Analysis failed: {str(e)}"})
        except Exception:
            pass
