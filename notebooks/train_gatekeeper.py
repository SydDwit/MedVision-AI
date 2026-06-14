"""
MedVision AI — Gatekeeper Classifier Training Script
File: notebooks/train_gatekeeper.py

Trains a lightweight MobileNetV2-based binary classifier to distinguish
valid chest X-ray images from non-X-ray images (out-of-distribution input).

Positive class (label=1): Chest X-rays from the existing dataset
    Source: data/chest-xray-pneumonia/chest_xray/chest_xray/train/{NORMAL,PNEUMONIA}
Negative class (label=0): Natural images from CIFAR-10
    Source: torchvision.datasets.CIFAR10 (auto-downloaded)

Output:
    models/weights/gatekeeper_mobilenet.pkl  — trained model state dict
    models/weights/gatekeeper_meta.pkl       — metadata (class names, threshold, accuracy)

Usage:
    python notebooks/train_gatekeeper.py
"""

import os
import sys
import pickle
import random
import numpy as np
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, ConcatDataset, Subset
from torchvision import transforms, models, datasets
from PIL import Image

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR    = Path(__file__).resolve().parent.parent
DATA_DIR    = BASE_DIR / "data"
XRAY_DIR    = DATA_DIR / "chest-xray-pneumonia" / "chest_xray" / "chest_xray"
CIFAR_DIR   = DATA_DIR / "cifar10"              # auto-download location
WEIGHTS_DIR = BASE_DIR / "models" / "weights"

WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)

MODEL_OUT = WEIGHTS_DIR / "gatekeeper_mobilenet.pkl"
META_OUT  = WEIGHTS_DIR / "gatekeeper_meta.pkl"

# ── Hyperparameters ────────────────────────────────────────────────────────────
EPOCHS          = 5
BATCH_SIZE      = 32
LEARNING_RATE   = 1e-3
IMG_SIZE        = 224
CONFIDENCE_THRESHOLD = 0.90    # Reject if P(chest_xray) < this
SEED            = 42

random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"[INFO] Device: {DEVICE}")


# ── Transforms ─────────────────────────────────────────────────────────────────
# Match the existing ResNet-50 pipeline normalization for consistency
train_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])

val_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])


# ── Custom Dataset: Chest X-Ray (positive class) ──────────────────────────────
class ChestXRayBinaryDataset(Dataset):
    """
    Loads all chest X-ray images from NORMAL/ and PNEUMONIA/ subdirectories
    and assigns them a single label: 1 (valid chest X-ray).
    """
    EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp"}

    def __init__(self, root_dir, transform=None):
        self.transform = transform
        self.image_paths = []

        root = Path(root_dir)
        for subdir in ["NORMAL", "PNEUMONIA"]:
            folder = root / subdir
            if folder.exists():
                for f in folder.iterdir():
                    if f.suffix.lower() in self.EXTENSIONS:
                        self.image_paths.append(str(f))

        print(f"  [ChestXRay] Loaded {len(self.image_paths)} images from {root_dir}")

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img = Image.open(self.image_paths[idx]).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, 1    # label = 1 → valid chest X-ray


# ── CIFAR-10 Wrapper (negative class) ─────────────────────────────────────────
class CIFAR10NegativeDataset(Dataset):
    """
    Wraps a subset of CIFAR-10 images as the negative class (label=0).
    """
    def __init__(self, cifar_dataset, indices):
        self.cifar = cifar_dataset
        self.indices = indices

    def __len__(self):
        return len(self.indices)

    def __getitem__(self, idx):
        img, _ = self.cifar[self.indices[idx]]   # ignore CIFAR label
        return img, 0    # label = 0 → not a chest X-ray


# ── Build datasets ─────────────────────────────────────────────────────────────
def build_datasets():
    """Assemble balanced train/val datasets."""
    print("\n[1/4] Building datasets...")

    # Positive: chest X-rays
    xray_train = ChestXRayBinaryDataset(XRAY_DIR / "train", transform=train_transform)
    xray_val   = ChestXRayBinaryDataset(XRAY_DIR / "test",  transform=val_transform)

    n_train_pos = len(xray_train)
    n_val_pos   = len(xray_val)

    # Negative: CIFAR-10
    print("  [CIFAR-10] Downloading/loading CIFAR-10 (this may take a moment on first run)...")
    cifar_train_full = datasets.CIFAR10(root=str(CIFAR_DIR), train=True,
                                        download=True, transform=train_transform)
    cifar_val_full   = datasets.CIFAR10(root=str(CIFAR_DIR), train=False,
                                        download=True, transform=val_transform)

    # Sample to match positive class size for balance
    train_neg_indices = random.sample(range(len(cifar_train_full)), min(n_train_pos, len(cifar_train_full)))
    val_neg_indices   = random.sample(range(len(cifar_val_full)),   min(n_val_pos,   len(cifar_val_full)))

    cifar_train = CIFAR10NegativeDataset(cifar_train_full, train_neg_indices)
    cifar_val   = CIFAR10NegativeDataset(cifar_val_full,   val_neg_indices)

    print(f"  [Balance] Train: {n_train_pos} X-rays + {len(cifar_train)} CIFAR = {n_train_pos + len(cifar_train)} total")
    print(f"  [Balance] Val:   {n_val_pos} X-rays + {len(cifar_val)} CIFAR = {n_val_pos + len(cifar_val)} total")

    # Combine
    train_dataset = ConcatDataset([xray_train, cifar_train])
    val_dataset   = ConcatDataset([xray_val,   cifar_val])

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True,  num_workers=0, pin_memory=True)
    val_loader   = DataLoader(val_dataset,   batch_size=BATCH_SIZE, shuffle=False, num_workers=0, pin_memory=True)

    return train_loader, val_loader


# ── Model ──────────────────────────────────────────────────────────────────────
def build_model():
    """MobileNetV2 with frozen backbone → binary classifier head."""
    print("\n[2/4] Building MobileNetV2 gatekeeper model...")

    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)

    # Freeze all backbone layers
    for param in model.features.parameters():
        param.requires_grad = False

    # Replace classifier head: 1280 → 1 (binary)
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.2),
        nn.Linear(1280, 1),
    )

    model = model.to(DEVICE)
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total     = sum(p.numel() for p in model.parameters())
    print(f"  Trainable params: {trainable:,} / {total:,} total ({100*trainable/total:.1f}%)")

    return model


# ── Training ───────────────────────────────────────────────────────────────────
def train_model(model, train_loader, val_loader):
    """Train with BCE loss, validate each epoch."""
    print(f"\n[3/4] Training for {EPOCHS} epochs...")

    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.Adam(model.classifier.parameters(), lr=LEARNING_RATE)

    best_val_acc = 0.0
    best_state   = None

    for epoch in range(EPOCHS):
        # ── Train ──
        model.train()
        running_loss  = 0.0
        correct_train = 0
        total_train   = 0

        for batch_idx, (images, labels) in enumerate(train_loader):
            images = images.to(DEVICE)
            labels = labels.float().unsqueeze(1).to(DEVICE)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss  += loss.item() * images.size(0)
            preds = (torch.sigmoid(outputs) >= 0.5).float()
            correct_train += (preds == labels).sum().item()
            total_train   += images.size(0)

            if (batch_idx + 1) % 50 == 0:
                print(f"    Epoch {epoch+1}/{EPOCHS} — Batch {batch_idx+1}/{len(train_loader)} — Loss: {loss.item():.4f}")

        train_loss = running_loss / total_train
        train_acc  = 100.0 * correct_train / total_train

        # ── Validate ──
        model.eval()
        val_loss    = 0.0
        correct_val = 0
        total_val   = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images = images.to(DEVICE)
                labels = labels.float().unsqueeze(1).to(DEVICE)

                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss    += loss.item() * images.size(0)
                preds = (torch.sigmoid(outputs) >= 0.5).float()
                correct_val += (preds == labels).sum().item()
                total_val   += images.size(0)

        val_loss = val_loss / total_val
        val_acc  = 100.0 * correct_val / total_val

        print(f"  Epoch {epoch+1}/{EPOCHS} — Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}% | Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.2f}%")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_state   = model.state_dict().copy()
            print(f"    -> New best model (val acc: {val_acc:.2f}%)")

    # Restore best checkpoint
    if best_state is not None:
        model.load_state_dict(best_state)

    return model, best_val_acc


# ── Save ───────────────────────────────────────────────────────────────────────
def save_model(model, val_acc):
    """Save model and metadata as pickle files."""
    print(f"\n[4/4] Saving model to {MODEL_OUT}...")

    with open(MODEL_OUT, "wb") as f:
        pickle.dump(model, f)

    meta = {
        "class_names": ["not_chest_xray", "chest_xray"],
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "architecture": "MobileNetV2 (frozen backbone + binary head)",
        "val_accuracy": round(val_acc, 2),
        "img_size": IMG_SIZE,
    }
    with open(META_OUT, "wb") as f:
        pickle.dump(meta, f)

    model_size = MODEL_OUT.stat().st_size / (1024 * 1024)
    print(f"  Model saved: {model_size:.1f} MB")
    print(f"  Metadata saved: {META_OUT}")
    print(f"  Validation accuracy: {val_acc:.2f}%")
    print(f"  Confidence threshold: {CONFIDENCE_THRESHOLD}")


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  MedVision AI — Gatekeeper Classifier Training")
    print("=" * 60)

    train_loader, val_loader = build_datasets()
    model = build_model()
    model, val_acc = train_model(model, train_loader, val_loader)
    save_model(model, val_acc)

    print("\n" + "=" * 60)
    print("  Training complete! Gatekeeper model is ready.")
    print("=" * 60)


if __name__ == "__main__":
    main()
