# backend/models/train.py
import os
import json
from pathlib import Path
import argparse

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset, random_split
from torchvision import transforms
from PIL import Image

from model_utils import create_mobilenet_v3

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "datasets" / "product_images"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "best_model.pth"
CLASSES_PATH = ARTIFACTS_DIR / "classes.json"

os.makedirs(ARTIFACTS_DIR, exist_ok=True)


class ProductDataset(Dataset):
    """
    Dataset for structure:
      product_images/<category>/<product>/*.jpg
    Each (category/product) pair is one class.
    """
    def __init__(self, root: Path, transform=None):
        self.root = Path(root)
        self.transform = transform
        self.samples = []       # [(path, label), ...]
        self.classes = []       # ["biscuits/oreo", ...]
        self.class_to_idx = {}

        exts = (".jpg", ".jpeg", ".png", ".bmp", ".webp")

        for category in sorted(os.listdir(self.root)):
            cat_dir = self.root / category
            if not cat_dir.is_dir():
                continue

            for product_name in sorted(os.listdir(cat_dir)):
                prod_dir = cat_dir / product_name
                if not prod_dir.is_dir():
                    continue

                key = f"{category}/{product_name}"

                if key not in self.class_to_idx:
                    idx = len(self.classes)
                    self.class_to_idx[key] = idx
                    self.classes.append(key)
                else:
                    idx = self.class_to_idx[key]

                for fname in os.listdir(prod_dir):
                    if fname.lower().endswith(exts):
                        self.samples.append((str(prod_dir / fname), idx))

        if not self.samples:
            raise RuntimeError(f"No images found under {self.root}")

        print(f"📂 Dataset built: {len(self.samples)} images, {len(self.classes)} classes")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        img = Image.open(path).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, label


def train(epochs: int = 8, batch_size: int = 32, lr: float = 1e-3):
    device = "cuda" if torch.cuda.is_available() else "cpu"

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
    ])

    dataset = ProductDataset(DATA_DIR, transform=transform)
    classes = dataset.classes

    with open(CLASSES_PATH, "w") as f:
        json.dump(classes, f, indent=2)

    val_size = int(0.2 * len(dataset))
    train_size = len(dataset) - val_size
    train_ds, val_ds = random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=2)

    model = create_mobilenet_v3(len(classes), pretrained=True).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=lr)

    best_val_acc = 0.0

    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = outputs.max(1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

        train_loss = running_loss / total
        train_acc = correct / total

        # validation
        model.eval()
        v_correct = 0
        v_total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, preds = outputs.max(1)
                v_correct += (preds == labels).sum().item()
                v_total += labels.size(0)

        val_acc = v_correct / v_total if v_total > 0 else 0.0

        print(f"Epoch [{epoch}/{epochs}] "
              f"TrainLoss={train_loss:.4f} TrainAcc={train_acc:.3f} ValAcc={val_acc:.3f}")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODEL_PATH)
            print(f"💾 Saved new best model (ValAcc={best_val_acc:.3f})")

    print(f"\n🏁 Training finished. Best ValAcc={best_val_acc:.3f}")
    print(f"Model saved at: {MODEL_PATH}")
    print(f"Classes saved at: {CLASSES_PATH}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=8)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-3)
    args = parser.parse_args()

    train(epochs=args.epochs, batch_size=args.batch_size, lr=args.lr)
