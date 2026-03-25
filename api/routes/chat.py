"""
MedVision AI — RAG Chat Route
File: api/routes/chat.py
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys, os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from models.rag_pipeline import get_rag_chain, query_rag

router = APIRouter()

class ChatRequest(BaseModel):
    question: str

@router.post("/rag-chat")
def rag_chat(request: ChatRequest):
    """Ask a pneumonia-related question. Returns answer + source documents."""
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    try:
        chain  = get_rag_chain()
        result = query_rag(chain, request.question)
        return {
            "answer"  : result["answer"],
            "sources" : result["sources"],
            "question": request.question,
            "status"  : "success",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
