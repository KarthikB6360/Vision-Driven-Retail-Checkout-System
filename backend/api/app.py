# backend/api/app.py

import os
import sys
import uuid
from pathlib import Path

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename

print("\n==============================================")
print("📌 Starting ML API Server (MobileNetV3 Product Scan)")
print("==============================================\n")

# ---------------------------------------------------------
# PROJECT PATH SETUP
# ---------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# ---------------------------------------------------------
# IMPORTS
# ---------------------------------------------------------
from models.predict import predict_image
from product_utils import (
    load_catalog,
    find_product_by_key,
    find_product_by_id,
    find_products_by_category,
)
from utils.barcode_utils import ensure_barcode_png_for_product

# ---------------------------------------------------------
# FLASK APP
# ---------------------------------------------------------
app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"
CATALOG_PATH = ARTIFACTS_DIR / "catalog.json"
TMP_DIR = PROJECT_ROOT / "tmp"

os.makedirs(TMP_DIR, exist_ok=True)

# ---------------------------------------------------------
# LOAD PRODUCT CATALOG
# ---------------------------------------------------------
catalog = load_catalog(str(CATALOG_PATH))
print(f"📦 Catalog loaded with {len(catalog)} products\n")

# ---------------------------------------------------------
# ROUTES
# ---------------------------------------------------------
@app.route("/catalog", methods=["GET"])
def get_catalog():
    return jsonify(catalog)


@app.route("/product/<int:product_id>", methods=["GET"])
def get_product(product_id):
    prod = find_product_by_id(catalog, product_id)
    if not prod:
        return jsonify({"status": "error", "message": "Product not found"}), 404
    return jsonify({"status": "success", "product": prod})


# ---------------------------------------------------------
# PREDICTION ENDPOINT
# ---------------------------------------------------------
@app.route("/predict", methods=["POST"])
def predict_endpoint():

    if "image" not in request.files:
        return jsonify({"status": "error", "message": "No image sent"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"status": "error", "message": "Empty filename"}), 400

    filename = secure_filename(file.filename)
    tmp_filename = f"{uuid.uuid4().hex}_{filename}"
    tmp_path = TMP_DIR / tmp_filename
    file.save(str(tmp_path))

    try:
        # NEW: structured prediction result
        result = predict_image(str(tmp_path))

        predicted_key = result["predicted_class"]
        confidence = result["confidence"]
        is_out = result["is_out_of_dataset"]

        print(f"🎯 Predicted: {predicted_key} | Confidence: {confidence:.3f}")

        # -------------------------------------------------
        # OUT OF DATASET CASE
        # -------------------------------------------------
        if is_out:
            return jsonify({
                "status": "success",
                "predicted_class": predicted_key,
                "confidence": confidence,
                "product": None,
                "message": "OUT OF DATASET"
            })

        # -------------------------------------------------
        # VALID PRODUCT CASE
        # -------------------------------------------------
        prod = find_product_by_key(catalog, predicted_key)

        # fallback: category-based match
        if not prod:
            try:
                category = predicted_key.split("/", 1)[0]
            except Exception:
                category = None

            if category:
                matches = find_products_by_category(catalog, category)
                prod = matches[0] if matches else None

        if not prod:
            return jsonify({
                "status": "success",
                "predicted_class": predicted_key,
                "confidence": confidence,
                "product": None,
                "message": "Product not found in catalog"
            })

        return jsonify({
            "status": "success",
            "predicted_class": predicted_key,
            "confidence": confidence,
            "product": prod
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass


# ---------------------------------------------------------
# BARCODE ENDPOINT
# ---------------------------------------------------------
@app.route("/barcode/<int:product_id>", methods=["GET"])
def get_barcode_image(product_id):

    prod = find_product_by_id(catalog, product_id)
    if not prod:
        return jsonify({"status": "error", "message": "Product not found"}), 404

    barcode_rel = prod.get("barcode")
    if not barcode_rel:
        return jsonify({"status": "error", "message": "No barcode path in product"}), 500

    barcode_path = PROJECT_ROOT / barcode_rel

    if not barcode_path.exists():
        try:
            png = ensure_barcode_png_for_product(
                prod, str(ARTIFACTS_DIR / "barcodes")
            )
            barcode_path = Path(png)
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": f"Barcode missing: {e}"
            }), 500

    return send_file(str(barcode_path), mimetype="image/png")


# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------
if __name__ == "__main__":
    print("🚀 ML API running at http://0.0.0.0:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
