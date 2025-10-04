# backend/seed_words.py
from config import db
import bcrypt
import os

words = [
    "APPLE","BRAVE","CLOUD","DANCE","EAGER",
    "FAITH","GIANT","HOUSE","INPUT","JUMBO",
    "KNIFE","LIGHT","MOUSE","NURSE","OPERA",
    "PRIDE","QUICK","RIVER","SMART","TRUST"
]

def seed_words():
    col = db["words"]
    col.delete_many({})  # optional: clear existing
    docs = [{"word": w} for w in words]
    col.insert_many(docs)
    print("Seeded words.")

def create_admin():
    users = db["users"]
    admin_username = os.getenv("ADMIN_USER", "AdminUser")
    admin_password = os.getenv("ADMIN_PASS", "Admin@1")
    if users.find_one({"username": admin_username}):
        print("Admin already exists.")
        return
    hashed = bcrypt.hashpw(admin_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    users.insert_one({"username": admin_username, "password": hashed, "role": "admin"})
    print(f"Created admin: {admin_username} / {admin_password}")

if __name__ == "__main__":
    seed_words()
    create_admin()
    print("Seeding done.")
