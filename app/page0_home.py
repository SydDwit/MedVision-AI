"""
MedVision AI — Home Page
File: app/page0_home.py
"""

import streamlit as st

def show():
    st.title("MedVision AI")
    st.subheader("Pneumonia Clinical Decision Support System")
    st.markdown("---")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("### X-Ray Analysis")
        st.write("Upload a chest X-ray to detect pneumonia using a ResNet-50 model.")

    with col2:
        st.markdown("### Risk Prediction")
        st.write("Enter patient vitals and clinical data to predict severity (Mild vs Severe).")

    with col3:
        st.markdown("### MedBot")
        st.write("Ask pneumonia-related questions based on trusted medical guidelines.")

    st.markdown("---")
    st.markdown("### How it works")

    c1, c2, c3 = st.columns(3)

    with c1:
        st.markdown(
            "**Step 1 — Upload X-Ray**\n"
            "A ResNet-50 model classifies images as Normal or Pneumonia with a confidence score."
        )

    with c2:
        st.markdown(
            "**Step 2 — Enter Patient Data**\n"
            "Machine learning models predict severity using clinical features."
        )

    with c3:
        st.markdown(
            "**Step 3 — Ask MedBot**\n"
            "A retrieval-augmented system answers queries using medical documents."
        )

    st.markdown("---")
    st.caption("Reference: CURB-65 Pneumonia Severity Score — Lim et al. (2003), Thorax Journal")