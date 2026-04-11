import requests
from xml.etree import ElementTree
from typing import List, Dict, Any

from core.config import NEWS_API_KEY

YAHOO_RSS_TEMPLATE = "https://feeds.finance.yahoo.com/rss/2.0/headline?s={ticker}&region=US&lang=en-US"


def _fetch_newsapi(ticker: str) -> List[Dict[str, Any]]:
    if not NEWS_API_KEY:
        return []
    try:
        resp = requests.get(
            "https://newsapi.org/v2/everything",
            params={
                "q": ticker,
                "apiKey": NEWS_API_KEY,
                "language": "en",
                "sortBy": "publishedAt",
                "pageSize": 5,
            },
            timeout=6,
        )
        if resp.status_code == 200:
            articles = resp.json().get("articles", [])
            return [{"title": a["title"], "url": a.get("url", "")} for a in articles[:5] if a.get("title")]
    except Exception:
        pass
    return []


def _fetch_yahoo_rss(ticker: str) -> List[Dict[str, Any]]:
    try:
        url = YAHOO_RSS_TEMPLATE.format(ticker=ticker)
        resp = requests.get(url, timeout=6, headers={"User-Agent": "Mozilla/5.0"})
        if resp.status_code == 200:
            root = ElementTree.fromstring(resp.content)
            articles = []
            for item in root.findall(".//item")[:5]:
                title_el = item.find("title")
                link_el = item.find("link")
                if title_el is not None and title_el.text:
                    articles.append({
                        "title": title_el.text.strip(),
                        "url": link_el.text.strip() if link_el is not None else "",
                    })
            return articles
    except Exception:
        pass
    return []


def _fallback_headlines(ticker: str) -> List[Dict[str, Any]]:
    return [
        {"title": f"{ticker} shows steady market performance amid trading activity", "url": ""},
        {"title": f"Investors monitor {ticker} as broader market trends develop", "url": ""},
        {"title": f"{ticker} maintains consistent trading volume this week", "url": ""},
    ]


def get_news(ticker: str) -> List[Dict[str, Any]]:
    news = _fetch_newsapi(ticker)
    if not news:
        news = _fetch_yahoo_rss(ticker)
    if not news:
        news = _fallback_headlines(ticker)
    return news[:5]
