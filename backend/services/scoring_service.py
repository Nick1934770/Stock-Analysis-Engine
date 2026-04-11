from typing import Dict, Any


def compute_final_score(sentiment_score: float, technical_score: float) -> Dict[str, Any]:
    """
    final_score = 0.6 * sentiment_score + 0.4 * technical_score
    BUY  > 0.5
    SELL < -0.5
    HOLD otherwise
    """
    final_score = round(max(-1.0, min(1.0, 0.6 * sentiment_score + 0.4 * technical_score)), 4)
    confidence = round(abs(final_score) * 100, 1)

    if final_score > 0.5:
        recommendation = "BUY"
    elif final_score < -0.5:
        recommendation = "SELL"
    else:
        recommendation = "HOLD"

    return {
        "score": final_score,
        "confidence": confidence,
        "recommendation": recommendation,
    }
