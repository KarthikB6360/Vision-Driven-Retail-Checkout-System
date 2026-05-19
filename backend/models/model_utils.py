# backend/models/model_utils.py
import torch
import torch.nn as nn
from torchvision import models
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
ARTIFACTS_DIR = BASE_DIR / "artifacts"
ARTIFACTS_DIR.mkdir(exist_ok=True, parents=True)


def build_model(num_classes: int) -> nn.Module:
    """
    Build a MobileNetV3-Large classifier for `num_classes`.
    """
    model = models.mobilenet_v3_large(
        weights=models.MobileNet_V3_Large_Weights.DEFAULT
    )

    # Replace final classifier layer
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, num_classes)

    return model


def load_model(model_path: str, num_classes: int) -> nn.Module:
    """
    Load model weights from best_model.pth for inference.
    """
    model = build_model(num_classes)
    state = torch.load(model_path, map_location="cpu")
    model.load_state_dict(state)
    model.eval()
    return model
