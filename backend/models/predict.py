# backend/models/predict.py

import json
import torch
from pathlib import Path
from torchvision import transforms
from PIL import Image

# ---------------------------------------------------------
# FIX: ADD backend/ TO PYTHON PATH
# ---------------------------------------------------------
import sys
BASE_DIR = Path(__file__).resolve().parents[1]  # backend/
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from models.model_utils import load_model

# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------
ARTIFACTS_DIR = BASE_DIR / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "best_model.pth"
CLASSES_PATH = ARTIFACTS_DIR / "classes.json"

# ---------------------------------------------------------
# CONFIG
# ---------------------------------------------------------
CONFIDENCE_THRESHOLD = 0.20

# ---------------------------------------------------------
# LOAD CLASSES
# ---------------------------------------------------------
with open(CLASSES_PATH, "r") as f:
    classes = json.load(f)

num_classes = len(classes)

# ---------------------------------------------------------
# LOAD MODEL
# ---------------------------------------------------------
model = load_model(str(MODEL_PATH), num_classes)
model.eval()

# ---------------------------------------------------------
# IMAGE TRANSFORM (MUST MATCH TRAINING)
# ---------------------------------------------------------
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
])

# ---------------------------------------------------------
# PREDICT FUNCTION
# ---------------------------------------------------------
def predict_image(img_path: str, threshold: float = CONFIDENCE_THRESHOLD):
    image = Image.open(img_path).convert("RGB")
    img_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        logits = model(img_tensor)
        probs = torch.softmax(logits, dim=1)[0]
        confidence, pred_idx = torch.max(probs, dim=0)

    return {
        "predicted_class": classes[pred_idx.item()],
        "confidence": float(confidence),
        "is_out_of_dataset": confidence < threshold
    }

# ---------------------------------------------------------
# CLI
# ---------------------------------------------------------
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--img", required=True)
    args = parser.parse_args()

    result = predict_image(args.img)

    print("\n📌 Image:", args.img)
    print("🎯 Predicted Class:", result["predicted_class"])
    print("📊 Confidence:", f"{result['confidence']:.3f}")

    if result["is_out_of_dataset"]:
        print("🚫 RESULT: OUT OF DATASET")
    else:
        print("✅ RESULT: VALID PRODUCT")
