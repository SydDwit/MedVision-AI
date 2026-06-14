"""
MedVision AI — X-Ray Analysis Page
File: app/page1_xray.py
"""

import streamlit as st
import requests
from PIL import Image

API_URL = "http://localhost:8000/api/analyze-image"

def show():
    st.title("Chest X-Ray Analysis")
    st.markdown("Upload a chest X-ray image to detect pneumonia using a ResNet-50 model.")
    st.markdown("---")

    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("Upload X-Ray")
        uploaded = st.file_uploader(
            "Select a chest X-ray image",
            type=["jpg", "jpeg", "png"],
            help="Upload a frontal chest X-ray in JPG or PNG format."
        )

        if uploaded:
            image = Image.open(uploaded)
            st.image(image, caption="Uploaded Image", use_column_width=True)

    with col2:
        st.subheader("Analysis Result")

        if uploaded:
            if st.button("Analyze X-Ray", type="primary", use_container_width=True):
                with st.spinner("Analyzing image..."):
                    try:
                        files = {
                            "file": (
                                uploaded.name,
                                uploaded.getvalue(),
                                uploaded.type
                            )
                        }

                        response = requests.post(API_URL, files=files, timeout=30)

                        if response.status_code == 200:
                            result = response.json()
                            label  = result["label"]
                            conf   = result["confidence"]
                            probs  = result["all_probs"]

                            if label == "PNEUMONIA":
                                st.error(f"{label}")
                                st.markdown(f"**Confidence:** {conf}%")
                                st.markdown(
                                    "The model detected patterns consistent with pneumonia. "
                                    "Consult a medical professional for confirmation."
                                )
                            else:
                                st.success(f"{label}")
                                st.markdown(f"**Confidence:** {conf}%")
                                st.markdown(
                                    "No pneumonia detected by the model. "
                                    "Clinical validation is still recommended."
                                )

                            st.markdown("---")
                            st.subheader("Class Probabilities")

                            for cls, prob in probs.items():
                                st.metric(label=cls, value=f"{prob}%")
                                st.progress(int(prob))

                        elif response.status_code == 422:
                            # Gatekeeper rejection — image is not a chest X-ray
                            rejection = response.json()
                            st.warning("⚠️ Image Not Recognized")
                            st.markdown(
                                f"**{rejection.get('message', 'This image does not appear to be a chest X-ray.')}**"
                            )
                            st.markdown(
                                "The gatekeeper model could not confirm this image as a chest radiograph. "
                                "Only anterior-posterior (AP) or posterior-anterior (PA) chest X-rays "
                                "are accepted for pneumonia analysis."
                            )
                        else:
                            st.error(
                                f"API Error: {response.json().get('detail', 'Unknown error')}"
                            )

                    except requests.exceptions.ConnectionError:
                        st.error(
                            "Cannot connect to backend. Ensure FastAPI is running:\n\n"
                            "uvicorn api.main:app --reload"
                        )
                    except Exception as e:
                        st.error(f"Error: {str(e)}")

        else:
            st.info("Upload an X-ray image to begin analysis.")
            st.markdown("**This module provides:**")
            st.markdown("- Pneumonia detection")
            st.markdown("- Model confidence score")
            st.markdown("- Class probability distribution")

    st.markdown("---")
    st.caption(
        "Model: ResNet-50 fine-tuned on Chest X-Ray dataset | Classes: NORMAL, PNEUMONIA"
    )