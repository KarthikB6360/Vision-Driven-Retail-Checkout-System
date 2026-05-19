# backend/api/product_utils.py

import json

def load_catalog(path: str):
    with open(path, "r") as f:
        return json.load(f)


def find_product_by_id(catalog, product_id: int):
    for prod in catalog:
        if prod.get("id") == product_id:
            return prod
    return None


def find_product_by_key(catalog, key: str):
    """
    Match using exact 'key' like 'beverages/Cocacola'
    """
    for prod in catalog:
        if prod.get("key") == key:
            return prod
    return None


def find_products_by_category(catalog, category: str):
    return [p for p in catalog if p.get("category") == category]
