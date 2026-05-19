# backend/models/train_improved.py

import os
import json
from pathlib import Path
from collections import Counter

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader, random_split, WeightedRandomSampler
from torchvision import transforms
from PIL import Image

# ------------------------------------------------------
# FIX: Allow importing models.model_utils from ANYWHERE
# ------------------------------------------------------
import sys
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from models.model_utils import build_model


# ------------------------------------------------------
# Paths
# ------------------------------------------------------
BASE_DIR = PROJECT_ROOT
DATASET_DIR = BASE_DIR / "datasets" / "product_images"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
ARTIFACTS_DIR.mkdir(exist_ok=True, parents=True)

MODEL_PATH = ARTIFACTS_DIR / "best_model.pth"
CLASSES_PATH = ARTIFACTS_DIR / "classes.json"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("🖥 Device:", DEVICE)


# ------------------------------------------------------
# DATASET
# ------------------------------------------------------
class ProductDataset(Dataset):
    def __init__(self, root, transform=None):
        self.root = Path(root)
        self.transform = transform
        self.samples = []
        self.targets = []
        self.class_keys = []

        class_key_to_idx = {}
        exts = (".jpg", ".jpeg", ".png", ".bmp", ".webp")

        for category in sorted(os.listdir(self.root)):
            cat_dir = self.root / category
            if not cat_dir.is_dir():
                continue

            for product_name in sorted(os.listdir(cat_dir)):
                prod_dir = cat_dir / product_name
                if not prod_dir.is_dir():
                    continue

                class_key = f"{category}/{product_name}"
                if class_key not in class_key_to_idx:
                    class_key_to_idx[class_key] = len(class_key_to_idx)

                class_idx = class_key_to_idx[class_key]

                for f in os.listdir(prod_dir):
                    if f.lower().endswith(exts):
                        img_path = prod_dir / f
                        self.samples.append((img_path, class_idx))
                        self.targets.append(class_idx)

        idx_to_key = {idx: key for key, idx in class_key_to_idx.items()}
        self.class_keys = [idx_to_key[i] for i in range(len(idx_to_key))]

        print(f"📦 Found {len(self.samples)} images across {len(self.class_keys)} products.")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        path, label = self.samples[index]
        image = Image.open(path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, label


# ------------------------------------------------------
# DATA LOADERS + CLASS BALANCING
# ------------------------------------------------------
def get_dataloaders(batch_size=16, val_ratio=0.2):
    train_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(8),
        transforms.ColorJitter(brightness=0.25, contrast=0.25, saturation=0.2),
        transforms.RandomPerspective(distortion_scale=0.15, p=0.3),
        transforms.RandomAffine(degrees=6, translate=(0.10, 0.10)),
        transforms.ToTensor(),
    ])

    val_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
    ])

    full_dataset = ProductDataset(DATASET_DIR, transform=train_transform)

    with open(CLASSES_PATH, "w") as f:
        json.dump(full_dataset.class_keys, f, indent=4)
    print(f"✅ Saved {len(full_dataset.class_keys)} classes → {CLASSES_PATH}")

    n_total = len(full_dataset)
    n_val = int(n_total * val_ratio)
    n_train = n_total - n_val
    train_dataset, val_dataset = random_split(full_dataset, [n_train, n_val])

    val_dataset.dataset.transform = val_transform

    train_labels = [full_dataset.targets[i] for i in train_dataset.indices]
    class_counts = Counter(train_labels)
    print("📊 Train class counts:", class_counts)

    class_weights = {cls: 1.0 / count for cls, count in class_counts.items()}
    sample_weights = [class_weights[label] for label in train_labels]

    sampler = WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(sample_weights),
        replacement=True
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        sampler=sampler,
        num_workers=0,
        pin_memory=False,
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=0,
        pin_memory=False,
    )

    num_classes = len(full_dataset.class_keys)
    return train_loader, val_loader, num_classes


# ------------------------------------------------------
# TRAINING FUNCTION
# ------------------------------------------------------
def train(epochs=25, lr=1e-3, batch_size=16, val_ratio=0.2):

    train_loader, val_loader, num_classes = get_dataloaders(batch_size, val_ratio)

    model = build_model(num_classes).to(DEVICE)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode="max", factor=0.6, patience=3, verbose=True
    )

    best_val_acc = 0.0

    for epoch in range(1, epochs + 1):
        model.train()
        total = 0
        correct = 0
        running_loss = 0.0

        for images, labels in train_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = outputs.max(1)
            total += labels.size(0)
            correct += preds.eq(labels).sum().item()

        train_loss = running_loss / total
        train_acc = correct / total

        # ---- VALIDATION ----
        model.eval()
        val_total = 0
        val_correct = 0
        val_loss_sum = 0.0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE)

                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss_sum += loss.item() * images.size(0)
                _, preds = outputs.max(1)
                val_total += labels.size(0)
                val_correct += preds.eq(labels).sum().item()

        val_loss = val_loss_sum / val_total
        val_acc = val_correct / val_total

        scheduler.step(val_acc)

        print(
            f"Epoch [{epoch}/{epochs}]  "
            f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.3f}  "
            f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.3f}"
        )

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODEL_PATH)
            print(f"💾 Model improved (ValAcc={best_val_acc:.3f}) → {MODEL_PATH}")

    print("\n🏁 Training Completed.")
    print(f"🥇 Best Validation Accuracy: {best_val_acc:.3f}")
    print(f"📌 Model Saved At → {MODEL_PATH}")
    print(f"📌 Classes Saved At → {CLASSES_PATH}")


if __name__ == "__main__":
    train()
