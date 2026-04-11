from pydantic import BaseModel
from typing import List, Optional


class NewsItem(BaseModel):
    title: str
    sentiment: str
    url: Optional[str] = None


class PricePoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class AnalysisResult(BaseModel):
    ticker: str
    company_name: Optional[str] = None
    recommendation: str
    score: float
    confidence: float
    sentiment_score: float
    technical_score: float
    ma10: Optional[float] = None
    ma30: Optional[float] = None
    momentum: Optional[float] = None
    news: List[NewsItem]
    prices: List[PricePoint]
