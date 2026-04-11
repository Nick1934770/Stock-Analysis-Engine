import yfinance as yf
from datetime import datetime, timedelta
from typing import Dict, Any

from utils.helpers import safe_float


def get_stock_data(ticker: str) -> Dict[str, Any]:
    try:
        stock = yf.Ticker(ticker)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=45)  # fetch extra to ensure 30 days after market days

        hist = stock.history(start=start_date, end=end_date)

        if hist.empty:
            return {"error": f"No price data found for ticker '{ticker}'", "prices": [], "ticker": ticker.upper()}

        prices = []
        for date, row in hist.iterrows():
            prices.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(safe_float(row.get("Open")), 4),
                "high": round(safe_float(row.get("High")), 4),
                "low": round(safe_float(row.get("Low")), 4),
                "close": round(safe_float(row.get("Close")), 4),
                "volume": int(row.get("Volume", 0)),
            })

        prices = prices[-30:]  # last 30 trading days

        info = {}
        try:
            info = stock.info or {}
        except Exception:
            pass

        current_price = safe_float(
            info.get("currentPrice") or info.get("regularMarketPrice") or (prices[-1]["close"] if prices else 0)
        )

        return {
            "ticker": ticker.upper(),
            "prices": prices,
            "current_price": current_price,
            "company_name": info.get("longName", ticker.upper()),
            "sector": info.get("sector", "Unknown"),
        }

    except Exception as e:
        return {"error": str(e), "prices": [], "ticker": ticker.upper()}
