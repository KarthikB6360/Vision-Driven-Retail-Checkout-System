# backend/utils/generate_catalog.py

import os
import json
from pathlib import Path
from barcode import Code128
from barcode.writer import ImageWriter

# ------------------------------------------------------
# PATHS
# ------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parents[1]
DATASET_DIR = BASE_DIR / "datasets" / "product_images"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
BARCODES_DIR = ARTIFACTS_DIR / "barcodes"
CATALOG_PATH = ARTIFACTS_DIR / "catalog.json"

os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(BARCODES_DIR, exist_ok=True)

EXTS = (".jpg", ".jpeg", ".png", ".bmp", ".webp")


# ------------------------------------------------------
# AI HELPERS
# ------------------------------------------------------
def humanize(name: str) -> str:
  return name.replace("_", " ").replace("-", " ").title()


def ai_description(name, category):
  category = category.replace("_", " ").title()
  return f"{name} is a popular {category} product known for good taste and quality."


def ai_nutrition_score(category):
  c = category.lower()
  if "health" in c:
    return 90
  if "beverage" in c:
    return 70
  if "chips" in c or "snacks" in c:
    return 45
  if "chocolate" in c:
    return 55
  if "grocery" in c:
    return 80
  return 60


def ai_eco_rating(category):
  c = category.lower()
  if "tetra" in c:
    return 4.2
  if "bottle" in c:
    return 3.5
  if "chips" in c:
    return 3.0
  if "grocery" in c:
    return 4.5
  return 4.0


# ------------------------------------------------------
# BARCODE GENERATOR
# ------------------------------------------------------
def generate_barcode(product_name: str, product_id: int):
  """
  Generates barcode PNG and returns (relative_path, value).
  """
  value = f"PRD-{product_id:04d}"
  safe_name = product_name.replace(" ", "_")
  out_path = BARCODES_DIR / safe_name

  code = Code128(value, writer=ImageWriter())
  code.save(str(out_path))  # creates .png

  rel = os.path.relpath(f"{out_path}.png", BASE_DIR).replace("\\", "/")
  return rel, value


# ------------------------------------------------------
# MAIN CATALOG GENERATOR
# ------------------------------------------------------
def generate_catalog():
  products = []
  pid = 1

  for category in sorted(os.listdir(DATASET_DIR)):
    cat_dir = DATASET_DIR / category
    if not cat_dir.is_dir():
      continue

    for prod_folder in sorted(os.listdir(cat_dir)):
      prod_dir = cat_dir / prod_folder
      if not prod_dir.is_dir():
        continue

      # Gather images
      images = [
        os.path.relpath(prod_dir / f, BASE_DIR).replace("\\", "/")
        for f in os.listdir(prod_dir)
        if f.lower().endswith(EXTS)
      ]

      if not images:
        continue

      # IMPORTANT: key must match classes.json entries like "beverages/Cocacola"
      class_key = f"{category}/{prod_folder}"
      name = humanize(prod_folder)

      # barcode
      barcode_path, barcode_value = generate_barcode(name, pid)

      product = {
        "id": pid,
        "key": class_key,               # 👈 used for matching ML prediction
        "name": name,
        "category": category,
        "price": 50,                    # you can edit manually later
        "images": images,
        "nutrition_score": ai_nutrition_score(category),
        "description": ai_description(name, category),
        "eco_rating": ai_eco_rating(category),
        "barcode": barcode_path,
        "barcode_value": barcode_value,
      }

      products.append(product)
      pid += 1

  with open(CATALOG_PATH, "w") as f:
    json.dump(products, f, indent=4)

  print(f"✅ Catalog generated with {len(products)} products → {CATALOG_PATH}")
  print(f"📌 Barcodes at: {BARCODES_DIR}")


if __name__ == "__main__":
  generate_catalog()
