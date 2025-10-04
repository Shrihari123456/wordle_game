def valid_username(username):
    """Validate username format"""
    print(f"Validating username: {username}")  # Debug log
    
    if not username or len(username) < 3 or len(username) > 20:
        print(f"Username length invalid: {len(username) if username else 0}")  # Debug log
        return False
    
    if not all(c.isalnum() or c == '_' for c in username):
        print(f"Username contains invalid characters: {username}")  # Debug log
        return False
    
    print("Username is valid")  # Debug log
    return True

def valid_password(password):
    """Validate password format"""
    print(f"Validating password: {password}")  # Debug log
    
    if not password or len(password) < 6:
        print(f"Password length invalid: {len(password) if password else 0}")  # Debug log
        return False
    
    if not any(c.isalpha() for c in password) or not any(c.isdigit() for c in password):
        print(f"Password must contain at least one letter and one number: {password}")  # Debug log
        return False
    
    print("Password is valid")  # Debug log
    return True

def valid_guess(guess):
    """Validate guess format"""
    print(f"Validating guess: {guess}")  # Debug log
    
    if not guess or len(guess) != 5:
        print(f"Guess length invalid: {len(guess) if guess else 0}")  # Debug log
        return False
    
    if not guess.isalpha():
        print(f"Guess contains non-alpha characters: {guess}")  # Debug log
        return False
    
    print("Guess is valid")  # Debug log
    return True