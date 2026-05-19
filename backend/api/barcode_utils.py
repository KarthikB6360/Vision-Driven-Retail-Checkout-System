# api/barcode_utils.py
import os
from pathlib import Path
from typing import Dict

# OPTIONAL: uses python-barcode + pillow
try:
    import barcode
    from barcode.writer import ImageWriter
except Exception:
    barcode = None
    ImageWriter = None


def ensure_barcode_png_for_product(product: Dict, out_dir: str) -> str:
    """
    Ensure PNG barcode exists for product.
    product should contain 'barcode' or 'id'. We'll fallback to generated id-based barcode.
    Returns the path to PNG file.
    """
    os.makedirs(out_dir, exist_ok=True)

    code = str(product.get("barcode") or product.get("id") or product.get("sku") or "")
    if not code:
        # create a fallback numeric code using id or uuid
        code = str(product.get("id") or "")
        if not code:
            code = "000000000000"

    # sanitize filename
    filename = f"{code}.png"
    out_path = os.path.join(out_dir, filename)

    if os.path.exists(out_path):
        return out_path

    # If python-barcode not available, just return path (caller should handle missing file)
    if not barcode or not ImageWriter:
        return out_path

    # Try to create EAN13 if code length == 12, otherwise use Code128
    try:
        if len(code) == 12 and code.isdigit():
            writer = ImageWriter()
            ean = barcode.get("ean13", code, writer=writer)
            ean.save(os.path.splitext(out_path)[0])
            # python-barcode saves as .png (it will append .png)
            if os.path.exists(out_path):
                return out_path
            # fallback: check ean.png
            alt = os.path.splitext(out_path)[0] + ".png"
            if os.path.exists(alt):
                return alt
        else:
            # Code128 accepts arbitrary text
            writer = ImageWriter()
            code128 = barcode.get("code128", code, writer=writer)
            code128.save(os.path.splitext(out_path)[0])
            if os.path.exists(out_path):
                return out_path
            alt = os.path.splitext(out_path)[0] + ".png"
            if os.path.exists(alt):
                return alt

    except Exception:
        # On error, just return out_path (may not exist)
        return out_path

    return out_path
