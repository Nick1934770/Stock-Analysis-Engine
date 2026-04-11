from fastapi import APIRouter
from utils.cache import cache

router = APIRouter()


@router.get("/health")
async def health_check():
    return {"status": "ok"}


@router.delete("/cache/{ticker}")
async def clear_cache(ticker: str):
    cache.delete(ticker.upper())
    return {"message": f"Cache cleared for {ticker.upper()}"}


@router.delete("/cache")
async def clear_all_cache():
    cache.clear()
    return {"message": "All cache cleared"}
