# backend/utils/barcode_utils.py

import os
from pathlib import Path
from barcode import Code128
from barcode.writer import ImageWriter


def sanitize_name(name: str) -> str:
    """
    Convert product name to a safe, consistent filename.
    - Lowercase
    - Replace spaces with underscores
    - Remove special characters
    """
    return (
        name.lower()
        .replace(" ", "_")
        .replace("/", "_")
        .replace("-", "_")
    )


def ensure_barcode_png_for_product(product: dict, barcode_dir: str) -> str:
    """
    Ensure a barcode PNG exists for the product.
    Barcode filename is generated from product['barcode_value'] ONLY.
    This avoids case mismatch issues.
    """
    value = product.get("barcode_value")
    name = product.get("name")

    if not value or not name:
        raise ValueError("Product must contain 'name' and 'barcode_value'")

    os.makedirs(barcode_dir, exist_ok=True)

    # SAFE + CONSISTENT FILENAME
    safe_name = sanitize_name(name)
    filename = f"{safe_name}.png"

    path = Path(barcode_dir) / filename

    # Generate barcode if not exists
    if not path.exists():
        code = Code128(value, writer=ImageWriter())
        code.save(str(path.with_suffix("")))

    return str(path)
