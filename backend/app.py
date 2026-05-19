# backend/app.py  (FINAL + PRODUCTS + IMAGE SERVE)

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db, create_tables
import os

# ==========================================================
# SERVER STARTUP
# ==========================================================
print("\n==============================================")
print(" Starting Auth/User API Server...")
print("==============================================\n")

app = Flask(__name__)
CORS(app)

# DB Initialize
create_tables()
print("🗂️ Database Ready (Tables Checked)\n")


# ==========================================================
# SIGNUP
# ==========================================================
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return jsonify({"status": "error", "message": "All fields required"}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email=?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"status": "error", "message": "Email already exists"}), 409

    try:
        hashed_password = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            (name, email, hashed_password, "user"),
        )
        conn.commit()
        return jsonify({"status": "success", "message": "Signup successful!"})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    finally:
        conn.close()


# ==========================================================
# LOGIN
# ==========================================================
@app.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email=?", (email,))
    user = cursor.fetchone()
    conn.close()

    if user and check_password_hash(user["password"], password):
        return jsonify({
            "status": "success",
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        })

    return jsonify({"status": "error", "message": "Invalid email or password"}), 401


# ==========================================================
# RESET PASSWORD
# ==========================================================
@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json or {}
    email = data.get("email")
    new_password = data.get("newPassword")

    if not email or not new_password:
        return jsonify({"status": "error", "message": "Email & new password required"}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email=?", (email,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({"status": "error", "message": "Email not found"}), 404

    hashed = generate_password_hash(new_password)
    cursor.execute("UPDATE users SET password=? WHERE email=?", (hashed, email))
    conn.commit()
    conn.close()

    return jsonify({"status": "success", "message": "Password reset successful"})


# ==========================================================
# UPDATE PROFILE
# ==========================================================
@app.route("/update-profile", methods=["POST"])
def update_profile():
    data = request.json or {}
    old_email = data.get("email")
    new_name = data.get("new_name")
    new_email = data.get("new_email")

    if not old_email:
        return jsonify({"status": "error", "message": "Email is required"}), 400

    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM users WHERE email=?", (old_email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        if new_name:
            cursor.execute("UPDATE users SET name=? WHERE email=?", (new_name, old_email))

        if new_email:
            cursor.execute("UPDATE users SET email=? WHERE email=?", (new_email, old_email))

        conn.commit()
        return jsonify({"status": "success", "message": "Profile updated successfully"})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    finally:
        conn.close()


# ==========================================================
# GET ALL USERS (Admin)
# ==========================================================
@app.route("/users", methods=["GET"])
def get_users():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, email, role FROM users ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    users = [
        {"id": row["id"], "name": row["name"], "email": row["email"], "role": row["role"]}
        for row in rows
    ]
    return jsonify(users)


# ==========================================================
# GET USERS COUNT
# ==========================================================
@app.route("/users-count", methods=["GET"])
def users_count():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) AS total FROM users")
    row = cursor.fetchone()
    conn.close()

    return jsonify({"total_users": row["total"]})


# ==========================================================
# SERVE products.json
# ==========================================================
@app.route("/products")
def serve_products():
    json_path = os.path.join(os.path.dirname(__file__), "products.json")
    return send_from_directory(os.path.dirname(json_path), "products.json")


# ==========================================================
# SERVE PRODUCT IMAGES
# ==========================================================
@app.route("/datasets/product_images/<category>/<item>/<filename>")
def serve_product_image(category, item, filename):
    base_path = os.path.join(os.path.dirname(__file__), "datasets", "product_images")
    folder_path = os.path.join(base_path, category, item)

    if not os.path.exists(folder_path):
        return jsonify({"error": "Image folder not found"}), 404

    return send_from_directory(folder_path, filename)


# ==========================================================
# RUN SERVER
# ==========================================================
if __name__ == "__main__":
    print(" Auth/User API running at http://0.0.0.0:5000")
    print("==============================================\n")
    app.run(host="0.0.0.0", port=5000, debug=True)
