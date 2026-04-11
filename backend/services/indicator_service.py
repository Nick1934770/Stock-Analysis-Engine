from typing import List, Dict, Any


def compute_indicators(prices: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not prices or len(prices) < 2:
        return {"ma10": None, "ma30": None, "momentum": 0.0, "technical_score": 0.0, "rsi": None, "ma_signal": "Insufficient Data"}

    closes = [p["close"] for p in prices]
    n = len(closes)

    ma10 = round(sum(closes[-10:]) / min(10, n), 4) if n >= 1 else None
    ma30 = round(sum(closes[-30:]) / min(30, n), 4) if n >= 1 else None

    # Momentum: % price change over last 10 days (or available history)
    look_back = min(10, n - 1)
    if look_back > 0 and closes[-1 - look_back] != 0:
        momentum = (closes[-1] - closes[-1 - look_back]) / closes[-1 - look_back]
    else:
        momentum = 0.0

    current = closes[-1]
    technical_score = 0.0

    # MA trend signal
    if ma10 and ma30:
        if current > ma10 and ma10 > ma30:
            technical_score += 0.5   # strong bullish
        elif current < ma10 and ma10 < ma30:
            technical_score -= 0.5   # strong bearish
        elif current > ma10:
            technical_score += 0.25
        else:
            technical_score -= 0.25

    # Momentum signal
    if momentum > 0.05:
        technical_score += 0.5
    elif momentum > 0.02:
        technical_score += 0.25
    elif momentum < -0.05:
        technical_score -= 0.5
    elif momentum < -0.02:
        technical_score -= 0.25

    technical_score = max(-1.0, min(1.0, technical_score))

    # RSI — Wilder's 14-period smoothed method
    RSI_PERIOD = 14
    rsi = None
    if n >= RSI_PERIOD + 1:
        deltas = [closes[i] - closes[i - 1] for i in range(1, n)]
        gains  = [max(d, 0.0) for d in deltas]
        losses = [abs(min(d, 0.0)) for d in deltas]
        avg_gain = sum(gains[:RSI_PERIOD]) / RSI_PERIOD
        avg_loss = sum(losses[:RSI_PERIOD]) / RSI_PERIOD
        for i in range(RSI_PERIOD, len(deltas)):
            avg_gain = (avg_gain * (RSI_PERIOD - 1) + gains[i]) / RSI_PERIOD
            avg_loss = (avg_loss * (RSI_PERIOD - 1) + losses[i]) / RSI_PERIOD
        if avg_loss == 0:
            rsi = 100.0
        else:
            rsi = round(100 - (100 / (1 + avg_gain / avg_loss)), 2)

    # MA signal — human-readable label derived from the same conditions as technical_score
    if ma10 and ma30:
        if current > ma10 and ma10 > ma30:
            ma_signal = "Bullish Crossover"
        elif current < ma10 and ma10 < ma30:
            ma_signal = "Bearish Crossover"
        elif current > ma10:
            ma_signal = "Price Above MA10"
        else:
            ma_signal = "Price Below MA10"
    else:
        ma_signal = "Insufficient Data"

    return {
        "ma10": ma10,
        "ma30": ma30,
        "momentum": round(momentum * 100, 2),  # as percentage
        "technical_score": round(technical_score, 4),
        "rsi": rsi,
        "ma_signal": ma_signal,
    }
