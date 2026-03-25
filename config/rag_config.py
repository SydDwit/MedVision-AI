"""
MedVision AI — RAG Pipeline Configuration
File: config/rag_config.py

LLM        : Groq (LLaMA 3 — free tier)
Embeddings : sentence-transformers (local, GPU enabled)
Vector DB  : FAISS (local)
Framework  : LangChain
"""

import os
import torch
from dotenv import load_dotenv


load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

KNOWLEDGE_DIR = os.path.join(BASE_DIR, "data", "knowledge_base")
FAISS_DIR     = os.path.join(BASE_DIR, "data", "faiss_index")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

os.makedirs(KNOWLEDGE_DIR, exist_ok=True)
os.makedirs(FAISS_DIR,     exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError(" GROQ_API_KEY is not set in environment variables")

GROQ_MODEL        = "llama-3.1-8b-instant"
GROQ_TEMPERATURE  = 0.2
MAX_OUTPUT_TOKENS = 1024

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Auto-detect device
EMBEDDING_DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


CHUNK_SIZE    = 500
CHUNK_OVERLAP = 50


TOP_K_RESULTS = int(os.getenv("TOP_K_RESULTS", 4))

ENABLE_METADATA_FILTERING = True
ENABLE_HYBRID_SEARCH      = False   
ENABLE_RERANKING          = False   


FAISS_INDEX_NAME = "pneumonia_index"
FAISS_INDEX_PATH = os.path.join(FAISS_DIR, FAISS_INDEX_NAME)


MAX_CONTEXT_TOKENS = 3000


DEBUG = True


SYSTEM_PROMPT = """You are MedBot, a clinical assistant specialized in pneumonia.

You MUST follow these rules:
- Answer ONLY using the provided medical documents
- If the answer is not found, say:
  'I could not find information about this in the available medical guidelines.'
- Keep answers clear, concise, and factual
- Include references to the source document when possible
- Do NOT make assumptions or hallucinate information
- Always recommend consulting a doctor for personal medical decisions
"""