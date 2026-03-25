"""
MedVision AI — MedBot RAG Chatbot Page
File: app/page3_chatbot.py
"""

import streamlit as st
import requests

API_URL = "http://localhost:8000/api/rag-chat"

def show():
    st.title("MedBot — Pneumonia Clinical Assistant")
    st.markdown(
        "Ask pneumonia-related questions. Responses are grounded in WHO, NIH, and CDC guidelines."
    )
    st.markdown("---")

    # ── Initialize chat history ───────────────────────────────
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # ── Chat history ──────────────────────────────────────────
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
            if msg.get("sources"):
                with st.expander("Sources"):
                    for s in msg["sources"]:
                        st.caption(f"- {s}")

    # ── Input ─────────────────────────────────────────────────
    question = st.chat_input("Ask a pneumonia-related question...")

    if question:
        # User message
        st.session_state.messages.append({
            "role": "user",
            "content": question
        })

        with st.chat_message("user"):
            st.markdown(question)

        # Assistant response
        with st.chat_message("assistant"):
            with st.spinner("Retrieving information..."):
                try:
                    response = requests.post(
                        API_URL,
                        json={"question": question},
                        timeout=60,
                    )

                    if response.status_code == 200:
                        result  = response.json()
                        answer  = result["answer"]
                        sources = result.get("sources", [])

                        st.markdown(answer)

                        if sources:
                            with st.expander("Sources"):
                                for s in sources:
                                    st.caption(f"- {s}")

                        st.session_state.messages.append({
                            "role": "assistant",
                            "content": answer,
                            "sources": sources,
                        })

                    else:
                        err = response.json().get("detail", "Unknown error")
                        st.error(f"API Error: {err}")

                except requests.exceptions.ConnectionError:
                    st.error("Cannot connect to backend. Ensure FastAPI is running.")
                except Exception as e:
                    st.error(f"Error: {str(e)}")

    # ── Clear chat ────────────────────────────────────────────
    if st.session_state.messages:
        if st.button("Clear Conversation"):
            st.session_state.messages = []
            st.rerun()

    st.markdown("---")
    st.caption(
        "RAG Pipeline: FAISS + sentence-transformers + LLaMA 3 | Sources: WHO, NIH, CDC"
    )