# Gatekeeper Classifier — Out-of-Distribution Input Handling

## Rationale

The ResNet-50 diagnostic model is trained exclusively on chest X-ray images and classifies every input as either **NORMAL** or **PNEUMONIA**. When a non-chest-X-ray image (e.g., a selfie, a landscape photo, or a different type of medical scan) is uploaded, the model will still produce a NORMAL/PNEUMONIA classification with arbitrary confidence — potentially misleading clinicians or users into treating a random image as a valid diagnostic result.

The **gatekeeper classifier** solves this by acting as a pre-screening stage that validates the uploaded image is actually a chest X-ray before it reaches the diagnostic model. This is a standard approach for handling **out-of-distribution (OOD) inputs** in deployed ML systems.

## Architecture

| Component | Detail |
|---|---|
| **Base Model** | MobileNetV2 (pretrained on ImageNet) |
| **Modification** | Backbone frozen; classifier head replaced with `Dropout(0.2) → Linear(1280, 1)` |
| **Task** | Binary classification: `chest_xray` (1) vs `not_chest_xray` (0) |
| **Output** | Single logit → sigmoid → probability of being a chest X-ray |
| **Model Size** | ~14 MB (pickle) |
| **Inference Time** | ~5–15 ms on CPU |

### Why MobileNetV2?

- **Lightweight**: Designed for mobile/edge deployment; much smaller than ResNet-50
- **Pretrained features**: ImageNet features transfer well for distinguishing medical images from natural photos
- **Fast inference**: Binary classification on a frozen backbone requires minimal compute
- **Frozen backbone**: Only the classifier head is trained, reducing training time to minutes

## Training Data

### Positive Class (label = 1): Valid Chest X-Rays
- Source: `data/chest-xray-pneumonia/chest_xray/chest_xray/train/NORMAL/` + `.../train/PNEUMONIA/`
- Both NORMAL and PNEUMONIA images are relabeled as a single "chest_xray" class
- ~5,218 training images

### Negative Class (label = 0): Non-Chest-X-Ray Images
- Source: CIFAR-10 training set (auto-downloaded via `torchvision.datasets.CIFAR10`)
- 60,000 diverse natural images (animals, vehicles, objects, etc.) at 32×32 resolution
- Randomly sampled ~5,200 images to balance against the positive class
- Images are upscaled to 224×224 during preprocessing

### Validation Split
- Positive: `chest_xray/test/` images (~624)
- Negative: CIFAR-10 test set (sampled ~624)

## Pipeline Integration

```
Upload Image
  │
  ▼
┌─────────────────────────────────┐
│  Stage 1: Gatekeeper            │
│  (MobileNetV2 binary classifier)│
│  P(chest_xray) ≥ 90%?          │
└──────┬──────────────┬───────────┘
       │              │
   YES ▼          NO  ▼
┌──────────────┐  ┌──────────────────────┐
│ Stage 2:     │  │ 422 Rejection        │
│ ResNet-50    │  │ "Not a chest X-ray"  │
│ NORMAL /     │  │ No diagnostic output │
│ PNEUMONIA    │  │ Not logged to history│
└──────────────┘  └──────────────────────┘
```

### Confidence Threshold

The default threshold is **90%** — if the gatekeeper's confidence that the image is a chest X-ray is below 90%, the image is rejected. This can be adjusted in `models/weights/gatekeeper_meta.pkl` or by modifying the `GATE_THRESHOLD` variable in `api/routes/xray.py`.

- **Lower threshold (e.g., 80%)**: More permissive, fewer false rejections, but higher risk of OOD images passing through
- **Higher threshold (e.g., 95%)**: More strict, may reject some valid but unusual X-rays (e.g., lateral views, poor quality images)

## File Locations

| File | Purpose |
|---|---|
| `notebooks/train_gatekeeper.py` | Training script (run once to produce weights) |
| `models/weights/gatekeeper_mobilenet.pkl` | Trained model weights |
| `models/weights/gatekeeper_meta.pkl` | Metadata (class names, threshold, accuracy) |
| `api/routes/xray.py` | Backend pipeline with two-stage flow |
| `frontend/src/pages/XRay.jsx` | React UI with rejection card handling |
| `frontend/src/api/medvisionApi.js` | API client with 422 rejection handling |
| `app/page1_xray.py` | Streamlit UI with rejection warning |

## Graceful Degradation

If the gatekeeper model file is missing or fails to load, the pipeline **falls back to the original single-stage behavior** — images go directly to the ResNet-50 diagnostic model without validation. This is logged at startup:

```
[Stage 1] Gatekeeper model not loaded: [error details]
```

This ensures the system remains functional even if the gatekeeper model hasn't been trained yet.
