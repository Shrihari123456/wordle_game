# backend/models/user_model.py
from config import db
from bson.objectid import ObjectId

users = db["users"]

def create_user(username: str, password_hash: str, role: str = "player"):
    doc = {
        "username": username,
        "password": password_hash,  # store as string
        "role": role,
        "created_at": __import__("datetime").datetime.utcnow().isoformat()
    }
    return users.insert_one(doc)

def find_by_username(username: str):
    return users.find_one({"username": username})

def update_user(username: str, changes: dict):
    return users.update_one({"username": username}, {"$set": changes})
