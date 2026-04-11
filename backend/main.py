from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from api.websocket import handle_analysis
from core.config import ALLOWED_ORIGINS

app = FastAPI(title="Stock Intelligence API", version="1.0.0")

# CORS — allow dev origins + any configured production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST routes
app.include_router(router, prefix="/api")


# WebSocket endpoint
@app.websocket("/ws/analyze/{ticker}")
async def websocket_analyze(websocket: WebSocket, ticker: str):
    await handle_analysis(websocket, ticker)


@app.get("/")
async def root():
    return {"message": "Stock Intelligence API is running", "docs": "/docs"}
