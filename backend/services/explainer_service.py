from statistics import mean, stdev
from typing import List, Dict, Any

SECTOR_MAP = {
    "AAPL": "tech", "MSFT": "tech", "GOOGL": "tech", "GOOG": "tech",
    "META": "tech", "NVDA": "tech", "AMD": "tech", "INTC": "tech",
    "CRM": "tech", "ORCL": "tech", "NFLX": "tech", "ADBE": "tech",
    "TSLA": "ev", "RIVN": "ev",
    "F": "auto", "GM": "auto",
    "JPM": "finance", "GS": "finance", "BAC": "finance", "WFC": "finance", "MS": "finance",
    "JNJ": "healthcare", "PFE": "healthcare", "UNH": "healthcare",
    "MRNA": "healthcare", "ABBV": "healthcare",
    "XOM": "energy", "CVX": "energy", "COP": "energy",
    "AMZN": "retail_cloud", "WMT": "retail", "TGT": "retail", "COST": "retail",
    "DIS": "media", "CMCSA": "media",
    "BA": "industrial", "CAT": "industrial", "GE": "industrial",
}

SECTOR_NARRATIVES = {
    "tech":         "The technology sector is driven by AI adoption and cloud demand, though sensitive to interest rate movements.",
    "ev":           "The EV sector faces intense competition and production scaling challenges amid shifting subsidy policies.",
    "auto":         "Traditional automakers navigate EV transition costs alongside cyclical consumer demand.",
    "finance":      "Financial stocks are tightly coupled to interest rate policy and credit market conditions.",
    "healthcare":   "Healthcare remains defensive, supported by demographic trends and drug pipeline catalysts.",
    "energy":       "Energy prices are volatile, shaped by geopolitical risk and OPEC supply decisions.",
    "retail_cloud": "Retail and cloud segments face consumer spending headwinds but benefit from digital adoption.",
    "retail":       "Retail margins are pressured by shifting consumer spending and ongoing supply chain costs.",
    "media":        "Media companies face streaming competition and advertising cycle sensitivity.",
    "industrial":   "Industrial stocks track global manufacturing activity and infrastructure spending cycles.",
}
DEFAULT_SECTOR_NARRATIVE = "Broader market conditions are mixed, with sector-specific drivers influencing performance."


def _macro_layer(closes: List[float]) -> str:
    if len(closes) < 4:
        return "Insufficient price history to assess macro momentum."
    mid = len(closes) // 2
    first_avg = mean(closes[:mid])
    second_avg = mean(closes[mid:])
    if first_avg == 0:
        return "Macro conditions appear neutral with no strong directional trend in recent data."
    pct = (second_avg - first_avg) / first_avg * 100
    if pct > 2:
        return "Broader market momentum is positive, with recent price action trending upward."
    elif pct < -2:
        return "Macroeconomic signals show mixed or weak momentum, with recent price pressure."
    return "Macro conditions appear neutral with no strong directional trend in recent data."


def _sector_layer(ticker: str) -> str:
    sector = SECTOR_MAP.get(ticker.upper())
    return SECTOR_NARRATIVES.get(sector, DEFAULT_SECTOR_NARRATIVE)


def _company_layer(closes: List[float]) -> str:
    if len(closes) < 2:
        return "Insufficient price data to assess company performance."

    total_return = (closes[-1] - closes[0]) / closes[0] * 100 if closes[0] != 0 else 0
    daily_changes = [
        (closes[i] - closes[i - 1]) / closes[i - 1] * 100
        for i in range(1, len(closes))
        if closes[i - 1] != 0
    ]
    volatility = stdev(daily_changes) if len(daily_changes) > 1 else 0

    if total_return > 10:
        base = f"Strong 30-day return of +{total_return:.1f}% indicates positive company momentum."
    elif total_return > 3:
        base = f"Moderate 30-day gain of +{total_return:.1f}% suggests steady company performance."
    elif total_return < -10:
        base = f"A 30-day decline of {total_return:.1f}% reflects significant selling pressure."
    elif total_return < -3:
        base = f"Modest 30-day decline of {total_return:.1f}% points to near-term company headwinds."
    else:
        base = f"Price is largely flat over 30 days ({total_return:+.1f}%), suggesting consolidation."

    if volatility > 3:
        base += f" High daily volatility ({volatility:.1f}%) signals elevated uncertainty."

    return base


def _sentiment_layer(ticker: str, sentiment_score: float) -> str:
    if sentiment_score > 0.3:
        return "Recent news sentiment is positive, reflecting favorable investor perception."
    elif sentiment_score < -0.3:
        return f"Recent news coverage is negative, suggesting market concern around {ticker}."
    elif sentiment_score > 0.1:
        return "News sentiment leans slightly positive with no single dominant narrative."
    elif sentiment_score < -0.1:
        return "News sentiment leans slightly negative with cautious market coverage."
    return "News sentiment is neutral — no strong directional signal from recent coverage."


def _technicals_layer(technical_score: float, momentum: float) -> str:
    if technical_score > 0.4:
        base = "Technical indicators are strongly bullish — price is above moving averages with positive momentum."
    elif technical_score > 0.1:
        base = "Technicals lean bullish, with price action supported by recent moving averages."
    elif technical_score < -0.4:
        base = "Technical indicators are bearish — price is declining through key moving averages."
    elif technical_score < -0.1:
        base = "Technicals lean bearish, with recent price weakness below short-term averages."
    else:
        base = "Technical signals are mixed with no clear directional bias."

    if momentum > 5:
        base += f" 10-day momentum of +{momentum:.1f}% reinforces the bullish case."
    elif momentum < -5:
        base += f" 10-day momentum of {momentum:.1f}% adds to the bearish outlook."

    return base


def _summary_layer(sentiment_score: float, technical_score: float, macro_pct: float) -> str:
    positives = sum([
        1 if sentiment_score > 0.1 else 0,
        1 if technical_score > 0.1 else 0,
        1 if macro_pct > 2 else 0,
    ])
    negatives = sum([
        1 if sentiment_score < -0.1 else 0,
        1 if technical_score < -0.1 else 0,
        1 if macro_pct < -2 else 0,
    ])

    if positives > negatives + 1:
        return "Overall, bullish technical and sentiment signals align, supporting an optimistic near-term outlook."
    elif negatives > positives + 1:
        return "Overall, weakness across sentiment and technical indicators drives a cautious near-term outlook."
    return "Mixed signals across macro, sentiment, and technical layers result in a balanced, uncertain outlook."


def generate_explanation(
    ticker: str,
    sentiment_score: float,
    technical_score: float,
    momentum: float,
    news: List[Dict[str, Any]],
    prices: List[Dict[str, Any]],
) -> Dict[str, str]:
    closes = [p["close"] for p in prices if "close" in p]

    # Compute macro pct change for reuse in summary
    macro_pct = 0.0
    if len(closes) >= 4:
        mid = len(closes) // 2
        first_avg = mean(closes[:mid])
        second_avg = mean(closes[mid:])
        if first_avg != 0:
            macro_pct = (second_avg - first_avg) / first_avg * 100

    return {
        "macro":      _macro_layer(closes),
        "sector":     _sector_layer(ticker),
        "company":    _company_layer(closes),
        "sentiment":  _sentiment_layer(ticker, sentiment_score),
        "technicals": _technicals_layer(technical_score, momentum),
        "summary":    _summary_layer(sentiment_score, technical_score, macro_pct),
    }
