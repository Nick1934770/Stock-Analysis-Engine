from statistics import mean
from typing import List, Dict, Any, Optional

# Top-level sector → plain-English context clause (paired with real industry from yfinance)
SECTOR_CONTEXT = {
    "Technology":            "grows when AI and cloud computing spending rises",
    "Financial Services":    "affected by interest rate changes and the health of lending markets",
    "Healthcare":            "tends to be steady — people always need healthcare regardless of the economy",
    "Consumer Cyclical":     "does well when people have money to spend on non-essentials",
    "Consumer Defensive":    "sells everyday essentials — demand stays steady even in downturns",
    "Energy":                "tied to oil prices, which move with global events and production decisions",
    "Industrials":           "does well when factories are busy and governments spend on infrastructure",
    "Communication Services":"competes for viewers and ad dollars in a crowded media landscape",
    "Real Estate":           "affected by mortgage rates and how easy it is to borrow money",
    "Utilities":             "stable income from regulated services, but rising rates can make the stock less attractive",
    "Basic Materials":       "tied to raw material prices, which rise and fall with global demand",
}


def _fmt_cap(market_cap: Optional[float]) -> Optional[str]:
    if market_cap is None:
        return None
    if market_cap >= 200e9:
        return f"one of the world's largest companies (${market_cap / 1e12:.1f}T total value)"
    if market_cap >= 10e9:
        return f"a large, established company (${market_cap / 1e9:.0f}B total value)"
    if market_cap >= 2e9:
        return f"a mid-sized company (${market_cap / 1e9:.1f}B total value)"
    return f"a smaller company (${market_cap / 1e6:.0f}M total value)"


def _macro_layer(closes: List[float], beta: Optional[float]) -> str:
    trend = ""
    if len(closes) >= 4:
        mid = len(closes) // 2
        first_avg = mean(closes[:mid])
        second_avg = mean(closes[mid:])
        if first_avg != 0:
            pct = (second_avg - first_avg) / first_avg * 100
            if pct > 2:
                trend = "The stock has been climbing recently."
            elif pct < -2:
                trend = "The stock has been drifting lower recently."
            else:
                trend = "The stock has moved sideways recently with no clear direction."

    if beta is None:
        return trend or "Not enough data to assess how this stock reacts to market moves."

    b = round(beta, 2)
    if beta > 1.5:
        base = f"High-beta stock (β={b}) — moves more sharply than the overall market, with bigger swings up and down."
    elif beta >= 0.7:
        base = f"Beta of {b} — moves roughly in line with the overall market."
    else:
        base = f"Low-beta stock (β={b}) — relatively stable and tends to hold its value better when markets fall."

    return f"{base} {trend}".strip()


def _sector_layer(sector: Optional[str], industry: Optional[str]) -> str:
    if not sector:
        return "Sector data unavailable."

    context = SECTOR_CONTEXT.get(sector, "performance is driven by sector-specific conditions")
    industry_str = f" / {industry}" if industry and industry != sector else ""
    return f"{sector}{industry_str} — {context}."


def _company_layer(closes: List[float], info: Dict[str, Any]) -> str:
    parts = []

    cap_str = _fmt_cap(info.get("market_cap"))
    if cap_str:
        parts.append(cap_str[0].upper() + cap_str[1:])

    trailing_pe = info.get("trailing_pe")
    forward_pe = info.get("forward_pe")
    if trailing_pe is not None:
        parts.append(f"P/E ratio of {trailing_pe:.0f}x — investors pay ${trailing_pe:.0f} for every $1 of earnings")
    elif forward_pe is not None:
        parts.append(f"Forward P/E of {forward_pe:.0f}x — based on projected earnings")

    eg = info.get("earnings_growth")
    rg = info.get("revenue_growth")
    growth_parts = []
    if eg is not None:
        direction = "grew" if eg >= 0 else "fell"
        growth_parts.append(f"earnings {direction} {abs(eg * 100):.0f}% YoY")
    if rg is not None:
        direction = "grew" if rg >= 0 else "fell"
        growth_parts.append(f"revenue {direction} {abs(rg * 100):.0f}% YoY")
    if growth_parts:
        parts.append(", ".join(growth_parts))

    if parts:
        return ". ".join(parts) + "."

    # Fallback to price return
    if len(closes) < 2:
        return "Not enough price data to assess company performance."
    total_return = (closes[-1] - closes[0]) / closes[0] * 100 if closes[0] != 0 else 0
    direction = "up" if total_return >= 0 else "down"
    return f"Price is {direction} {abs(total_return):.1f}% over the past 30 days."


def _sentiment_layer(
    news: List[Dict[str, Any]],
    sentiment_score: float,
    analyst_rec: str,
    analyst_count: int,
) -> str:
    if sentiment_score > 0.3:
        direction = "Positive"
    elif sentiment_score < -0.3:
        direction = "Negative"
    elif sentiment_score > 0.1:
        direction = "Slightly positive"
    elif sentiment_score < -0.1:
        direction = "Slightly negative"
    else:
        direction = "Neutral"

    parts = [direction + " news coverage."]

    # Most representative headline
    if news:
        sorted_news = sorted(
            news,
            key=lambda a: abs({"positive": 1, "negative": -1, "neutral": 0}.get(a.get("sentiment", "neutral"), 0)),
            reverse=True,
        )
        title = sorted_news[0].get("title", "")
        if title:
            truncated = title[:80] + ("…" if len(title) > 80 else "")
            parts.append(f'Top story: "{truncated}"')

    # Analyst consensus in plain English
    if analyst_count and analyst_count > 0 and analyst_rec:
        rec = analyst_rec.lower().replace("-", " ")
        if "strong buy" in rec:
            action = "strongly recommend buying"
        elif "buy" in rec:
            action = "recommend buying"
        elif "sell" in rec or "underperform" in rec:
            action = "recommend selling"
        else:
            action = "suggest holding"
        parts.append(f"{analyst_count} Wall Street analysts {action}.")

    return " ".join(parts)


def _technicals_layer(
    technical_score: float,
    momentum: float,
    current_price: Optional[float],
    info: Dict[str, Any],
    rsi: Optional[float],
    ma_signal: Optional[str],
) -> str:
    parts = []

    # Analyst price target — plain upside/downside
    target_mean = info.get("target_mean")
    if target_mean is not None and current_price and current_price > 0:
        upside = (target_mean - current_price) / current_price * 100
        direction = "above" if upside >= 0 else "below"
        parts.append(
            f"Analysts think it's worth ${target_mean:.2f} on average — "
            f"about {abs(upside):.1f}% {direction} today's price of ${current_price:.2f}."
        )

    # RSI
    if rsi is not None:
        if rsi >= 70:
            parts.append(f"RSI {rsi:.0f} (overbought) — the stock has risen fast and may be due for a pullback.")
        elif rsi <= 30:
            parts.append(f"RSI {rsi:.0f} (oversold) — the stock has sold off heavily and may bounce back.")
        else:
            parts.append(f"RSI {rsi:.0f} (neutral) — no extreme buying or selling pressure.")

    # MA signal
    MA_PLAIN = {
        "Bullish Crossover": "Bullish MA crossover — short-term average crossed above long-term average, often a buy signal",
        "Bearish Crossover": "Bearish MA crossover — short-term average crossed below long-term average, often a warning sign",
        "Price Above MA10":  "Price above the 10-day moving average (MA10) — a mild bullish sign",
        "Price Below MA10":  "Price below the 10-day moving average (MA10) — a mild bearish sign",
        "Insufficient Data": "Not enough data to calculate moving averages",
    }
    if ma_signal and ma_signal in MA_PLAIN:
        parts.append(MA_PLAIN[ma_signal] + ".")

    # Short ratio
    short_ratio = info.get("short_ratio")
    if short_ratio is not None and short_ratio > 5:
        parts.append(
            f"Short ratio of {short_ratio:.1f} days — elevated short interest, meaning many traders are betting against this stock."
        )

    if parts:
        return " ".join(parts)

    # Fallback
    if technical_score > 0.1:
        base = "Price trends look positive overall"
    elif technical_score < -0.1:
        base = "Price trends look negative overall"
    else:
        base = "Price trends are mixed with no clear direction"
    if momentum is not None and abs(momentum) > 3:
        direction = "up" if momentum > 0 else "down"
        base += f". The stock is {direction} {abs(momentum):.1f}% over the past 10 days"
    return base + "."


def _summary_layer(
    sentiment_score: float,
    technical_score: float,
    macro_pct: float,
    analyst_rec: str,
    analyst_count: int,
    earnings_growth: Optional[float],
) -> str:
    parts = []

    if analyst_count and analyst_count > 0 and analyst_rec:
        rec = analyst_rec.lower().replace("-", " ")
        if "strong buy" in rec:
            action = "strongly recommend buying"
        elif "buy" in rec:
            action = "recommend buying"
        elif "sell" in rec or "underperform" in rec:
            action = "recommend selling"
        else:
            action = "suggest holding"
        parts.append(f"{analyst_count} Wall Street analysts {action}")

    if earnings_growth is not None:
        direction = "up" if earnings_growth >= 0 else "down"
        parts.append(f"earnings are {direction} {abs(earnings_growth * 100):.0f}% YoY")

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
        outlook = "News coverage and price trends are both pointing up — a positive sign for the near term."
    elif negatives > positives + 1:
        outlook = "Both news and price trends are pointing down — a reason for caution right now."
    else:
        outlook = "The signals are mixed — no strong direction either way right now."

    if parts:
        return ". ".join(parts[i][0].upper() + parts[i][1:] for i in range(len(parts))) + ". " + outlook
    return outlook


def generate_explanation(
    ticker: str,
    sentiment_score: float,
    technical_score: float,
    momentum: float,
    news: List[Dict[str, Any]],
    prices: List[Dict[str, Any]],
    info: Dict[str, Any] = None,
    rsi: Optional[float] = None,
    ma_signal: Optional[str] = None,
) -> Dict[str, str]:
    if info is None:
        info = {}

    closes = [p["close"] for p in prices if "close" in p]
    current_price = closes[-1] if closes else None

    macro_pct = 0.0
    if len(closes) >= 4:
        mid = len(closes) // 2
        first_avg = mean(closes[:mid])
        second_avg = mean(closes[mid:])
        if first_avg != 0:
            macro_pct = (second_avg - first_avg) / first_avg * 100

    return {
        "macro": _macro_layer(closes, info.get("beta")),
        "sector": _sector_layer(info.get("sector"), info.get("industry")),
        "company": _company_layer(closes, info),
        "sentiment": _sentiment_layer(
            news,
            sentiment_score,
            info.get("analyst_rec", ""),
            info.get("analyst_count", 0) or 0,
        ),
        "technicals": _technicals_layer(
            technical_score,
            momentum,
            current_price,
            info,
            rsi=rsi,
            ma_signal=ma_signal,
        ),
        "summary": _summary_layer(
            sentiment_score,
            technical_score,
            macro_pct,
            info.get("analyst_rec", ""),
            info.get("analyst_count", 0) or 0,
            info.get("earnings_growth"),
        ),
    }
