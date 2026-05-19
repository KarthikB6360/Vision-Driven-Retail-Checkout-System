from database import get_db
from werkzeug.security import generate_password_hash

# Create a new user
def create_user(name, email, password, role="user"):
    conn = get_db()
    cursor = conn.cursor()

    hashed_password = generate_password_hash(password)

    try:
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            (name, email, hashed_password, role),
        )
        conn.commit()
        return True, "User created successfully"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()


# Get user by email
def get_user_by_email(email):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    return user


# Get all users (for Admin Panel)
def fetch_all_users():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role FROM users")
    users = cursor.fetchall()
    conn.close()
    return users
