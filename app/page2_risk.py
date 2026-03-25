"""
MedVision AI — Risk Prediction Page
File: app/page2_risk.py
"""

import streamlit as st
import requests

API_URL = "http://localhost:8000/api/predict-risk"

def show():
    st.title("Pneumonia Severity Risk Prediction")
    st.markdown("Enter patient clinical data to predict severity: Mild vs Severe.")
    st.markdown("---")

    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("Patient Clinical Data")

        # ── Vitals ──────────────────────────────────────
        st.markdown("**Vitals**")
        age = st.number_input("Age (years)", 0, 120, 45)

        gender = st.selectbox("Gender", ["Female (0)", "Male (1)"])
        gender_val = 0 if "Female" in gender else 1

        temp = st.slider("Temperature (°C)", 35.0, 42.0, 38.0, 0.1)
        spo2 = st.slider("SpO2 (%)", 50, 100, 95)
        rr   = st.slider("Respiratory Rate (breaths/min)", 5, 60, 18)
        wbc  = st.slider("WBC Count (×10³/µL)", 1.0, 30.0, 8.0, 0.5)
        cough = st.number_input("Cough Duration (days)", 0, 60, 3)
        bp    = st.number_input("Systolic BP (mmHg)", 50, 200, 120)

    with col2:
        st.subheader("Symptoms and Comorbidities")

        # ── Symptoms ─────────────────────────────────────
        st.markdown("**Symptoms**")
        chest_pain = st.checkbox("Chest Pain")
        confusion  = st.checkbox("Mental Confusion")

        # ── Comorbidities ────────────────────────────────
        st.markdown("**Comorbidities**")
        diabetes     = st.checkbox("Diabetes")
        hypertension = st.checkbox("Hypertension")
        copd         = st.checkbox("COPD")
        smoker       = st.checkbox("Smoker")
        prior_pneu   = st.checkbox("Prior Pneumonia History")

        st.markdown("---")

        # ── CURB-65 preview ──────────────────────────────
        curb65 = (
            int(confusion) +
            int(wbc > 15) +
            int(rr > 30) +
            int(bp < 90) +
            int(age >= 65)
        )

        st.markdown(f"**CURB-65 Score (preview):** `{curb65}/5`")

        if curb65 <= 1:
            st.success("Low severity — outpatient management likely")
        elif curb65 == 2:
            st.warning("Moderate severity — consider hospitalisation")
        else:
            st.error("High severity — hospitalisation recommended")

        st.markdown("---")

        predict_btn = st.button(
            "Predict Severity",
            type="primary",
            use_container_width=True
        )

    # ── Prediction ──────────────────────────────────────
    if predict_btn:
        payload = {
            "age": float(age),
            "gender": gender_val,
            "temperature_celsius": float(temp),
            "spo2_percent": float(spo2),
            "respiratory_rate": float(rr),
            "wbc_count_x10": float(wbc),
            "cough_duration_days": int(cough),
            "chest_pain": int(chest_pain),
            "smoker": int(smoker),
            "diabetes": int(diabetes),
            "hypertension": int(hypertension),
            "prior_pneumonia": int(prior_pneu),
            "copd": int(copd),
            "confusion": int(confusion),
            "blood_pressure_systolic": float(bp),
        }

        with st.spinner("Predicting severity..."):
            try:
                response = requests.post(API_URL, json=payload, timeout=30)

                if response.status_code == 200:
                    r = response.json()

                    st.markdown("---")
                    st.subheader("Prediction Result")

                    res_col1, res_col2, res_col3 = st.columns(3)

                    with res_col1:
                        if r["severity"] == "Severe":
                            st.error(r["severity"])
                        else:
                            st.success(r["severity"])

                    with res_col2:
                        st.metric("Severe Probability", f"{r['severe_probability']}%")

                    with res_col3:
                        st.metric("CURB-65 Score", f"{r['curb65_score']}/5")

                    st.markdown(f"**Model:** {r['model_used']}")
                    st.markdown(f"**Comorbidity Count:** {r['comorbidity_count']}")

                    st.markdown("**Severity Probability**")
                    st.progress(
                        int(r["severe_probability"]),
                        text=f"Severe: {r['severe_probability']}%"
                    )

                else:
                    st.error(f"API Error: {response.json().get('detail', 'Unknown error')}")

            except requests.exceptions.ConnectionError:
                st.error(
                    "Cannot connect to backend. Ensure FastAPI is running:\n\n"
                    "uvicorn api.main:app --reload"
                )
            except Exception as e:
                st.error(f"Error: {str(e)}")

    st.markdown("---")
    st.caption(
        "Model: XGBoost / Random Forest trained on CURB-65 based dataset"
    )