from werkzeug.security import generate_password_hash
from database import get_db

name = "boss"
email = "boss@gmail.com"
password = "123"
role = "admin"

conn = get_db()
cursor = conn.cursor()

hashed = generate_password_hash(password)
cursor.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
               (name, email, hashed, role))
conn.commit()
conn.close()

print("✅ Admin added: admin@gmail.com / 123456")
