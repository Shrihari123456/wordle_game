# backend/utils/token_utils.py
import os
import jwt
import datetime
from functools import wraps
from flask import request, jsonify

SECRET_KEY = os.getenv("SECRET_KEY", "secret123")

def token_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth:
            return jsonify({"message": "Token missing"}), 401
        parts = auth.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"message": "Invalid auth header"}), 401
        token = parts[1]
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            # FIX: Pass current_user as a dictionary, not just username string
            current_user = {
                "username": data["username"],
                "role": data.get("role", "player"),
                "id": data.get("id", "")  # Add id if available
            }
            role = data.get("role", "player")
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except Exception as e:
            print(f"Token decode error: {str(e)}")
            return jsonify({"message": "Invalid token"}), 401
        # pass current_user (dict) and role (string) to the route
        return func(current_user, role, *args, **kwargs)
    return wrapper

def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth:
            return jsonify({"message": "Token missing"}), 401
        parts = auth.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"message": "Invalid auth header"}), 401
        token = parts[1]
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            if data.get("role") != "admin":
                return jsonify({"message": "Admin access only"}), 403
            # FIX: Pass current_user as dictionary for admin routes too
            current_user = {
                "username": data["username"],
                "role": data.get("role", "admin"),
                "id": data.get("id", "")
            }
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except Exception as e:
            print(f"Token decode error: {str(e)}")
            return jsonify({"message": "Invalid token"}), 401
        return func(current_user, *args, **kwargs)
    return wrapper