"""
MedVision AI — FastAPI Backend
File: api/main.py

Endpoints:
  POST /analyze-image   → chest X-ray pneumonia detection
  POST /predict-risk    → pneumonia severity prediction
  POST /rag-chat        → RAG chatbot query
  GET  /health          → health check
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.xray import router as xray_router
from api.routes.risk import router as risk_router
from api.routes.chat import router as chat_router

app = FastAPI(
    title="MedVision AI",
    description="Pneumonia Detection, Severity Prediction & RAG Chatbot",
    version="1.0.0",
)

# Allow Streamlit to call FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(xray_router,  prefix="/api", tags=["X-Ray Analysis"])
app.include_router(risk_router,  prefix="/api", tags=["Risk Prediction"])
app.include_router(chat_router,  prefix="/api", tags=["RAG Chatbot"])


@app.get("/health")
def health():
    return {"status": "ok", "app": "MedVision AI"}


# Run with: uvicorn api.main:app --reload --port 8000
