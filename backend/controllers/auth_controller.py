import bcrypt
import jwt
import datetime
import os
from flask import request, jsonify
from models.user_model import create_user, find_by_username
from utils.validators import valid_username, valid_password
from utils.token_utils import SECRET_KEY  # Use the same SECRET_KEY

def register_user_route():
    data = request.get_json()
    username = data.get("username", "")
    password = data.get("password", "")
    role = data.get("role", "player")

    print(f"Registration attempt - Username: {username}, Role: {role}")  # Debug log

    # Validate role
    if role not in ["player", "admin"]:
        return jsonify({"message": "Invalid role"}), 400

    # Validate username and password
    if not valid_username(username):
        return jsonify({"message": "Username must be 3-20 characters (letters, numbers, _ only)"}), 400

    if not valid_password(password):
        return jsonify({"message": "Password must be at least 6 characters with at least one letter and one number"}), 400

    # Check if user already exists
    existing_user = find_by_username(username)
    if existing_user:
        return jsonify({"message": "Username already exists"}), 400

    # Hash password and create user
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    create_user(username, hashed, role)

    return jsonify({"message": f"{role.capitalize()} registered successfully"}), 201

def login_user_route():
    data = request.get_json()
    username = data.get("username", "")
    password = data.get("password", "")

    print(f"Login attempt for username: {username}")  # Debug log

    user = find_by_username(username)
    if not user:
        print("User not found")  # Debug log
        return jsonify({"message": "Invalid credentials"}), 401

    stored_hash = user["password"]
    print(f"Stored hash: {stored_hash}")  # Debug log
    
    # Verify password
    password_valid = bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8"))
    print(f"Password valid: {password_valid}")  # Debug log
    
    if not password_valid:
        return jsonify({"message": "Invalid credentials"}), 401

    # Generate JWT token using the same SECRET_KEY from token_utils
    token_payload = {
        "username": username,
        "role": user.get("role", "player"),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    
    print(f"Token payload: {token_payload}")  # Debug log
    
    try:
        token = jwt.encode(token_payload, SECRET_KEY, algorithm="HS256")
        print(f"Generated token: {token}")  # Debug log
        
        # Ensure token is string
        if isinstance(token, bytes):
            token = token.decode('utf-8')
            
        print(f"Final token string: {token}")  # Debug log
        
        return jsonify({
            "token": token,
            "username": username,
            "role": user.get("role", "player"),
            "message": "Login successful"
        }), 200
        
    except Exception as e:
        print(f"Token generation error: {e}")  # Debug log
        return jsonify({"message": "Login failed - token error"}), 500