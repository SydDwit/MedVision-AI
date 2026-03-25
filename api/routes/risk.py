"""
MedVision AI — Risk Prediction Route
File: api/routes/risk.py

Loads: models/weights/pneumonia_risk_model.pkl
       models/weights/pneumonia_scaler.pkl
       models/weights/pneumonia_meta.pkl
"""

import os
import pickle
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

BASE_DIR    = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WEIGHTS_DIR = os.path.join(BASE_DIR, "models", "weights")


def load_risk_models():
    with open(os.path.join(WEIGHTS_DIR, "pneumonia_risk_model.pkl"), "rb") as f:
        model = pickle.load(f)
    with open(os.path.join(WEIGHTS_DIR, "pneumonia_scaler.pkl"), "rb") as f:
        scaler = pickle.load(f)
    with open(os.path.join(WEIGHTS_DIR, "pneumonia_meta.pkl"), "rb") as f:
        meta = pickle.load(f)
    return model, scaler, meta

try:
    risk_model, risk_scaler, risk_meta = load_risk_models()
    FEATURE_COLS = risk_meta["feature_cols"]
    NUM_SCALE    = risk_meta["num_scale"]
    CLASS_NAMES  = risk_meta["class_names"]
    print(f"Risk model loaded — {risk_meta['model_name']} "
          f"(F1={risk_meta['best_f1']})")
except Exception as e:
    risk_model = risk_scaler = risk_meta = None
    FEATURE_COLS = NUM_SCALE = CLASS_NAMES = []
    print(f"Risk model not loaded: {e}")



class PatientData(BaseModel):
    age:                     float = Field(..., ge=0,   le=120)
    gender:                  int   = Field(..., ge=0,   le=1,   description="0=Female, 1=Male")
    temperature_celsius:     float = Field(..., ge=35,  le=42)
    spo2_percent:            float = Field(..., ge=50,  le=100)
    respiratory_rate:        float = Field(..., ge=5,   le=60)
    wbc_count_x10:           float = Field(..., ge=1,   le=30)
    cough_duration_days:     int   = Field(..., ge=0,   le=60)
    chest_pain:              int   = Field(..., ge=0,   le=1)
    smoker:                  int   = Field(..., ge=0,   le=1)
    diabetes:                int   = Field(..., ge=0,   le=1)
    hypertension:            int   = Field(..., ge=0,   le=1)
    prior_pneumonia:         int   = Field(..., ge=0,   le=1)
    copd:                    int   = Field(..., ge=0,   le=1)
    confusion:               int   = Field(..., ge=0,   le=1)
    blood_pressure_systolic: float = Field(..., ge=50,  le=200)


def engineer_features(data: PatientData) -> dict:
    d = data.dict()

    d["spo2_rr_ratio"]  = round(d["spo2_percent"] / d["respiratory_rate"], 3)
    d["fever_flag"]     = int(d["temperature_celsius"] >= 38.5)
    d["curb65_score"]   = (
        d["confusion"] +
        int(d["wbc_count_x10"] > 15) +
        int(d["respiratory_rate"] > 30) +
        int(d["blood_pressure_systolic"] < 90) +
        int(d["age"] >= 65)
    )
    d["age_group"] = (
        0 if d["age"] <= 30 else
        1 if d["age"] <= 50 else
        2 if d["age"] <= 65 else 3
    )
    comorbidity_cols = ["diabetes","hypertension","copd","smoker",
                        "prior_pneumonia","chest_pain","confusion"]
    d["comorbidity_count"] = sum(d[c] for c in comorbidity_cols)
    d["bp_low_flag"] = int(d["blood_pressure_systolic"] < 90)

    return d


@router.post("/predict-risk")
def predict_risk(patient: PatientData):
    """
    Submit patient clinical data.
    Returns: severity (Mild/Severe), probability %, CURB-65 score.
    """
    if risk_model is None:
        raise HTTPException(status_code=503,
                            detail="Risk model not loaded. Run training first.")
    try:
        features   = engineer_features(patient)
        input_vals = np.array([[features[col] for col in FEATURE_COLS]])

        # Apply scaler to numerical columns
        import pandas as pd
        input_df              = pd.DataFrame(input_vals, columns=FEATURE_COLS)
        input_df[NUM_SCALE]   = risk_scaler.transform(input_df[NUM_SCALE])

        pred  = risk_model.predict(input_df)[0]
        proba = risk_model.predict_proba(input_df)[0]

        return {
            "severity"          : CLASS_NAMES[pred],
            "severe_probability": round(float(proba[1]) * 100, 2),
            "mild_probability"  : round(float(proba[0]) * 100, 2),
            "curb65_score"      : features["curb65_score"],
            "comorbidity_count" : features["comorbidity_count"],
            "model_used"        : risk_meta["model_name"],
            "status"            : "success",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
