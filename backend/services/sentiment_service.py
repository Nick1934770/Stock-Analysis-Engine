from typing import List, Dict, Any

# Attempt to load FinBERT once; fall back gracefully if unavailable
_pipeline = None
_pipeline_loaded = False

POSITIVE_WORDS = [
    "surge", "gain", "profit", "growth", "beat", "record", "bullish", "rally",
    "rise", "strong", "positive", "improve", "exceed", "outperform", "upgrade",
    "buy", "boost", "soar", "jump", "expand", "win", "high", "up",
]
NEGATIVE_WORDS = [
    "drop", "fall", "loss", "decline", "miss", "bearish", "sell", "down",
    "weak", "negative", "cut", "downgrade", "risk", "concern", "plunge",
    "crash", "slump", "disappoint", "warn", "below", "low", "shrink",
]


def _load_pipeline():
    global _pipeline, _pipeline_loaded
    if _pipeline_loaded:
        return _pipeline
    try:
        from transformers import pipeline as hf_pipeline
        _pipeline = hf_pipeline(
            "text-classification",
            model="ProsusAI/finbert",
            tokenizer="ProsusAI/finbert",
            device=-1,
        )
        print("[sentiment] FinBERT loaded.")
    except Exception as e:
        print(f"[sentiment] FinBERT unavailable, using keyword fallback: {e}")
        _pipeline = None
    _pipeline_loaded = True
    return _pipeline


def _keyword_sentiment(text: str) -> Dict[str, Any]:
    lower = text.lower()
    pos = sum(1 for w in POSITIVE_WORDS if w in lower)
    neg = sum(1 for w in NEGATIVE_WORDS if w in lower)
    if pos > neg:
        score = min(0.5 + 0.1 * (pos - neg), 1.0)
        return {"label": "positive", "score": score}
    elif neg > pos:
        score = max(-0.5 - 0.1 * (neg - pos), -1.0)
        return {"label": "negative", "score": score}
    return {"label": "neutral", "score": 0.0}


def analyze_sentiment(news_articles: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not news_articles:
        return {"score": 0.0, "articles": []}

    model = _load_pipeline()
    analyzed = []
    total_score = 0.0

    for article in news_articles:
        title = (article.get("title") or "").strip()
        if not title:
            continue

        label = "neutral"
        num_score = 0.0

        if model:
            try:
                result = model(title[:512])[0]
                label = result["label"].lower()
                conf = result["score"]
                num_score = conf if label == "positive" else (-conf if label == "negative" else 0.0)
            except Exception:
                kw = _keyword_sentiment(title)
                label = kw["label"]
                num_score = kw["score"]
        else:
            kw = _keyword_sentiment(title)
            label = kw["label"]
            num_score = kw["score"]

        total_score += num_score
        analyzed.append({
            "title": title,
            "url": article.get("url", ""),
            "sentiment": label,
            "score": round(num_score, 4),
        })

    avg_score = total_score / len(analyzed) if analyzed else 0.0
    return {"score": round(avg_score, 4), "articles": analyzed}
