"""
MedVision AI — RAG Pipeline
File: models/rag_pipeline.py

Stages:
  1. Ingest  — PDFs → chunks → embeddings → FAISS
  2. Load    — load FAISS index
  3. Query   — retrieve → LLM → answer
"""

import os
import pickle
from typing import Dict

# LangChain
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq

# Config
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.rag_config import (
    KNOWLEDGE_DIR,
    FAISS_INDEX_PATH,
    GROQ_API_KEY,
    GROQ_MODEL,
    GROQ_TEMPERATURE,
    MAX_OUTPUT_TOKENS,
    EMBEDDING_MODEL,
    EMBEDDING_DEVICE,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    TOP_K_RESULTS,
    SYSTEM_PROMPT,
    DEBUG,
)

# ─────────────────────────────────────────
# EMBEDDINGS
# ─────────────────────────────────────────
def get_embeddings():
    """Load embedding model (GPU if available)."""
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": EMBEDDING_DEVICE},
        encode_kwargs={"normalize_embeddings": True},
    )


# ─────────────────────────────────────────
# INGEST DOCUMENTS
# ─────────────────────────────────────────
def ingest_documents(knowledge_dir: str = KNOWLEDGE_DIR) -> int:
    print(f"Loading PDFs from: {knowledge_dir}")

    loader = DirectoryLoader(
        knowledge_dir,
        glob="**/*.pdf",
        loader_cls=PyPDFLoader,
        show_progress=True,
    )
    documents = loader.load()

    if not documents:
        raise ValueError(f"No PDFs found in {knowledge_dir}")

    print(f"Loaded {len(documents)} pages")

    # Add metadata
    for doc in documents:
        doc.metadata["source_type"] = "medical_pdf"

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )

    chunks = splitter.split_documents(documents)

    # Add chunk metadata
    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_id"] = i

    print(f"Created {len(chunks)} chunks")

    embeddings = get_embeddings()

    print("Embedding & building FAISS index...")
    vectorstore = FAISS.from_documents(chunks, embeddings)

    vectorstore.save_local(FAISS_INDEX_PATH)
    print(f"Saved FAISS index → {FAISS_INDEX_PATH}")

    # Save metadata
    with open(os.path.join(FAISS_INDEX_PATH, "meta.pkl"), "wb") as f:
        pickle.dump({
            "num_chunks": len(chunks),
            "num_docs": len(documents),
            "embedding_model": EMBEDDING_MODEL,
        }, f)

    return len(chunks)


def load_vectorstore() -> FAISS:
    if not os.path.exists(os.path.join(FAISS_INDEX_PATH, "index.faiss")):
        raise FileNotFoundError("FAISS index not found. Run ingestion first.")

    embeddings = get_embeddings()

    vectorstore = FAISS.load_local(
        FAISS_INDEX_PATH,
        embeddings,
        allow_dangerous_deserialization=True,
    )

    print("FAISS index loaded")
    return vectorstore



def build_rag_chain() -> RetrievalQA:
    vectorstore = load_vectorstore()

    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": TOP_K_RESULTS},
    )

    llm = ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model_name=GROQ_MODEL,
        max_tokens=MAX_OUTPUT_TOKENS,
        temperature=GROQ_TEMPERATURE,
    )

    prompt_template = f"""{SYSTEM_PROMPT}

STRICT RULE:
If context does NOT contain the answer, DO NOT guess.

Context:
{{context}}

Question: {{question}}

Answer:"""

    prompt = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "question"],
    )

    chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        chain_type="stuff",
        return_source_documents=True,
        chain_type_kwargs={"prompt": prompt},
    )

    print("RAG chain ready")
    return chain



def query_rag(chain: RetrievalQA, question: str) -> Dict:
    if not question.strip():
        return {"answer": "Empty question.", "sources": []}

    result = chain({"query": question})
    answer = result.get("result", "")

    sources = []
    docs = result.get("source_documents", [])

    if DEBUG:
        print("\n--- Retrieved Context ---")
        for d in docs:
            print(d.page_content[:200], "\n")

    for doc in docs:
        src = doc.metadata.get("source", "Unknown")
        page = doc.metadata.get("page", "")
        name = os.path.basename(src)

        entry = f"{name} (p.{page})" if page != "" else name
        if entry not in sources:
            sources.append(entry)

    return {
        "answer": answer,
        "sources": sources,
    }



_rag_chain = None

def get_rag_chain():
    global _rag_chain
    if _rag_chain is None:
        _rag_chain = build_rag_chain()
    return _rag_chain



if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--ingest", action="store_true")
    parser.add_argument("--question", type=str,
                        default="What are symptoms of pneumonia?")
    args = parser.parse_args()

    if args.ingest:
        print("\n--- INGESTING ---")
        ingest_documents()

    print("\n--- BUILDING ---")
    chain = build_rag_chain()

    print("\n--- QUERY ---")
    result = query_rag(chain, args.question)

    print("\nAnswer:\n", result["answer"])
    print("\nSources:")
    for s in result["sources"]:
        print("-", s)