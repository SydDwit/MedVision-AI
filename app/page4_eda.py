"""
MedVision AI — Model Performance Page
File: app/page4_eda.py
"""

import os
import pickle
import streamlit as st
from PIL import Image

BASE_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEIGHTS_DIR = os.path.join(BASE_DIR, "models", "weights")


def load_image(filename):
    path = os.path.join(WEIGHTS_DIR, filename)
    if os.path.exists(path):
        return Image.open(path)
    return None


def load_meta(filename):
    path = os.path.join(WEIGHTS_DIR, filename)
    if os.path.exists(path):
        with open(path, "rb") as f:
            return pickle.load(f)
    return None


def show():
    st.title("Model Performance Dashboard")
    st.markdown("Training results, evaluation metrics, and model comparisons.")
    st.markdown("---")

    tab1, tab2, tab3 = st.tabs([
        "CNN — X-Ray Model",
        "ML — Risk Model",
        "Model Summary",
    ])

    # ─────────────────────────────────────
    # TAB 1 — CNN
    # ─────────────────────────────────────
    with tab1:
        st.subheader("ResNet-50 — Pneumonia Detection")

        meta = load_meta("model_meta.pkl")
        if meta:
            c1, c2, c3 = st.columns(3)
            c1.metric("Model", meta.get("model_name", "ResNet-50"))
            c2.metric("Best Validation Accuracy", f"{meta.get('best_val_acc', 'N/A')}")
            c3.metric("Classes", str(meta.get("class_names", ["NORMAL", "PNEUMONIA"])))
        else:
            st.info("Run cnn_core.ipynb to generate model metadata.")

        st.markdown("---")

        st.markdown("### Training and Validation Curves")
        img = load_image("training_curves.png")
        if img:
            st.image(img, use_container_width=True, caption="Loss and Accuracy over epochs")
        else:
            st.warning("training_curves.png not found.")

        st.markdown("### Confusion Matrix")
        img = load_image("confusion_matrix.png")
        if img:
            st.image(img, use_container_width=True, caption="Confusion Matrix on Test Set")
        else:
            st.warning("confusion_matrix.png not found.")

    # ─────────────────────────────────────
    # TAB 2 — ML
    # ─────────────────────────────────────
    with tab2:
        st.subheader("XGBoost and Random Forest — Severity Prediction")

        meta = load_meta("pneumonia_meta.pkl")
        if meta:
            c1, c2, c3, c4 = st.columns(4)
            c1.metric("Selected Model", meta.get("model_name", "N/A"))
            c2.metric("F1 Score", str(meta.get("best_f1", "N/A")))
            c3.metric("ROC-AUC", str(meta.get("best_auc", "N/A")))
            c4.metric("Number of Features", str(len(meta.get("feature_cols", []))))
        else:
            st.info("Run ml_pneumonia_full.ipynb to generate metadata.")

        st.markdown("---")

        st.markdown("### ROC Curves")
        col1, col2 = st.columns(2)

        with col1:
            img = load_image("roc_curves.png")
            if img:
                st.image(img, use_container_width=True, caption="Individual ROC Curves")
            else:
                st.warning("roc_curves.png not found.")

        with col2:
            img = load_image("roc_combined.png")
            if img:
                st.image(img, use_container_width=True, caption="Model Comparison ROC")
            else:
                st.warning("roc_combined.png not found.")

        st.markdown("### Confusion Matrices")
        img = load_image("confusion_matrices.png")
        if img:
            st.image(img, use_container_width=True, caption="Model Confusion Matrices")
        else:
            st.warning("confusion_matrices.png not found.")

        st.markdown("### Feature Importance")
        img = load_image("feature_importance.png")
        if img:
            st.image(img, use_container_width=True, caption="Top Features")
        else:
            st.warning("feature_importance.png not found.")

    # ─────────────────────────────────────
    # TAB 3 — SUMMARY
    # ─────────────────────────────────────
    with tab3:
        st.subheader("System Overview")

        st.markdown("### Architecture")
        st.markdown("""
| Module | Model | Task | Input |
|---|---|---|---|
| X-Ray Analysis | ResNet-50 | Classification | Chest X-Ray Image |
| Risk Prediction | XGBoost / Random Forest | Classification | Clinical Features |
| Chatbot | LLaMA 3 + FAISS | Question Answering | Text Query |
""")

        st.markdown("### Training Details")
        st.markdown("""
| Detail | CNN | ML Model |
|---|---|---|
| Dataset | Chest X-Ray Dataset | Synthetic Clinical Dataset |
| Train/Test Split | 80/20 | 80/20 |
| Imbalance Handling | Weighted Loss | SMOTE |
| Tuning | Manual | Grid Search |
| Saved Format | .pth / .pkl | .pkl |
""")

        st.markdown("### RAG Configuration")
        st.markdown("""
| Setting | Value |
|---|---|
| Model | LLaMA 3 |
| Embeddings | MiniLM |
| Vector Store | FAISS |
| Retrieval | Top-K |
| Knowledge Base | WHO, NIH, CDC |
""")

        st.markdown("---")
        st.caption(
            "MedVision AI | Final Year Project | PyTorch · XGBoost · LangChain · FastAPI · Streamlit"
        )