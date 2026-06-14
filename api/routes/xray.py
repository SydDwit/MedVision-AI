"""
MedVision AI — X-Ray Analysis Route
File: api/routes/xray.py

Two-stage pipeline:
  Stage 1: Gatekeeper (MobileNetV2) — rejects non-chest-X-ray images
  Stage 2: Diagnostic  (ResNet-50)  — classifies NORMAL vs PNEUMONIA

Loads:
  models/weights/gatekeeper_mobilenet.pkl  +  gatekeeper_meta.pkl
  models/weights/resnet50_pneumonia.pkl    +  model_meta.pkl
"""

# Gatekeeper model weights loaded dynamically.
import io
import os
import pickle
import torch
from PIL import Image
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from torchvision import transforms

router = APIRouter()


BASE_DIR    = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WEIGHTS_DIR = os.path.join(BASE_DIR, "models", "weights")

# Diagnostic model paths
MODEL_PKL   = os.path.join(WEIGHTS_DIR, "resnet50_pneumonia.pkl")
META_PKL    = os.path.join(WEIGHTS_DIR, "model_meta.pkl")

# Gatekeeper model paths
GATE_PKL    = os.path.join(WEIGHTS_DIR, "gatekeeper_mobilenet.pkl")
GATE_META   = os.path.join(WEIGHTS_DIR, "gatekeeper_meta.pkl")

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ── Load Diagnostic Model (ResNet-50) ─────────────────────────────────────────
def load_cv_model():
    with open(MODEL_PKL, "rb") as f:
        model = pickle.load(f)
    with open(META_PKL, "rb") as f:
        meta = pickle.load(f)
    model.eval()
    model.to(DEVICE)
    return model, meta

try:
    cv_model, cv_meta = load_cv_model()
    CLASS_NAMES = cv_meta.get("class_names", ["NORMAL", "PNEUMONIA"])
    print(f"[Stage 2] Diagnostic model loaded — classes: {CLASS_NAMES}")
except Exception as e:
    cv_model, cv_meta = None, {}
    CLASS_NAMES = ["NORMAL", "PNEUMONIA"]
    print(f"[Stage 2] Diagnostic model not loaded: {e}")


# ── Load Gatekeeper Model (MobileNetV2) ───────────────────────────────────────
def load_gatekeeper():
    with open(GATE_PKL, "rb") as f:
        model = pickle.load(f)
    with open(GATE_META, "rb") as f:
        meta = pickle.load(f)
    model.eval()
    model.to(DEVICE)
    return model, meta

try:
    gate_model, gate_meta = load_gatekeeper()
    GATE_THRESHOLD = gate_meta.get("confidence_threshold", 0.90)
    print(f"[Stage 1] Gatekeeper model loaded — threshold: {GATE_THRESHOLD}")
except Exception as e:
    gate_model, gate_meta = None, {}
    GATE_THRESHOLD = 0.90
    print(f"[Stage 1] Gatekeeper model not loaded: {e}")


# ── Shared preprocessing (same normalization for both models) ──────────────────
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])


def run_gatekeeper(tensor):
    """
    Run the gatekeeper binary classifier.
    Returns (is_valid_xray: bool, confidence: float).
    The model outputs a single logit → sigmoid gives P(chest_xray).
    """
    with torch.no_grad():
        logit = gate_model(tensor)              # shape: (1, 1)
        prob  = torch.sigmoid(logit).item()     # P(chest_xray)
    is_valid = prob >= GATE_THRESHOLD
    return is_valid, round(prob * 100, 2)


@router.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """
    Upload a chest X-ray image.
    Stage 1: Gatekeeper validates the image is a chest X-ray.
    Stage 2: ResNet-50 classifies NORMAL vs PNEUMONIA.
    Returns: label, confidence %, all class probabilities.
    """
    # ── Pre-checks ─────────────────────────────────────────────────────────
    if cv_model is None:
        raise HTTPException(status_code=503,
                            detail="CV model not loaded. Run training first.")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400,
                            detail="File must be an image (jpg/png).")

    try:
        print(f"[API] Received file: {file.filename}, content_type: {file.content_type}")
        contents = await file.read()
        image    = Image.open(io.BytesIO(contents)).convert("RGB")
        tensor   = preprocess(image).unsqueeze(0).to(DEVICE)

        # ── Stage 1: Gatekeeper ────────────────────────────────────────────
        if gate_model is not None:
            is_valid, gate_confidence = run_gatekeeper(tensor)
            print(f"[API] [Stage 1] Gatekeeper validation result: is_valid={is_valid}, confidence={gate_confidence}%")

            if not is_valid:
                print(f"[API] [Stage 1] Rejecting image as non-chest-X-ray.")
                return JSONResponse(
                    status_code=422,
                    content={
                        "status": "rejected",
                        "rejection_reason": "not_chest_xray",
                        "message": (
                            "This image does not appear to be a chest X-ray. "
                            "Please upload a valid anterior-posterior or "
                            "posterior-anterior chest radiograph."
                        ),
                        "gatekeeper_confidence": gate_confidence,
                    },
                )
        else:
            print("[API] [Stage 1] Warning: Gatekeeper model is None, skipping stage 1.")

        # ── Stage 2: Diagnostic Model ──────────────────────────────────────
        with torch.no_grad():
            outputs = cv_model(tensor)
            probs   = torch.softmax(outputs, dim=1)
            conf, pred = torch.max(probs, 1)

        label      = CLASS_NAMES[pred.item()]
        confidence = round(conf.item() * 100, 2)
        all_probs  = {cls: round(probs[0][i].item() * 100, 2)
                      for i, cls in enumerate(CLASS_NAMES)}

        return {
            "label"      : label,
            "confidence" : confidence,
            "all_probs"  : all_probs,
            "status"     : "success",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

