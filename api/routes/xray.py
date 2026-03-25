"""
MedVision AI — X-Ray Analysis Route
File: api/routes/xray.py

Loads: models/weights/resnet50_pneumonia.pkl
       models/weights/model_meta.pkl
"""

import io
import os
import pickle
import torch
from PIL import Image
from fastapi import APIRouter, File, UploadFile, HTTPException
from torchvision import transforms

router = APIRouter()


BASE_DIR    = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WEIGHTS_DIR = os.path.join(BASE_DIR, "models", "weights")
MODEL_PKL   = os.path.join(WEIGHTS_DIR, "resnet50_pneumonia.pkl")
META_PKL    = os.path.join(WEIGHTS_DIR, "model_meta.pkl")

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


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
    print(f"CV model loaded — classes: {CLASS_NAMES}")
except Exception as e:
    cv_model, cv_meta = None, {}
    CLASS_NAMES = ["NORMAL", "PNEUMONIA"]
    print(f"CV model not loaded: {e}")

preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])


@router.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """
    Upload a chest X-ray image.
    Returns: label (NORMAL/PNEUMONIA), confidence %, all class probabilities.
    """
    if cv_model is None:
        raise HTTPException(status_code=503,
                            detail="CV model not loaded. Run training first.")


    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400,
                            detail="File must be an image (jpg/png).")

    try:
        contents = await file.read()
        image    = Image.open(io.BytesIO(contents)).convert("RGB")
        tensor   = preprocess(image).unsqueeze(0).to(DEVICE)

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
