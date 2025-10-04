from config import db
from datetime import datetime
from bson import ObjectId

def create_game(username, target_word, date):
    game = {
        "username": username,
        "target_word": target_word,
        "created_at": datetime.utcnow(),
        "guesses": [],
        "won": False,
        "active": True,
        "date": date
    }
    result = db.games.insert_one(game)
    game['_id'] = result.inserted_id
    print(f"Created game in DB: {game}")  # Debug log
    return game

def add_guess(game_id, guess, colors):
    guess_data = {
        "word": guess,
        "colors": colors,
        "timestamp": datetime.utcnow()
    }
    print(f"Adding guess to game {game_id}: {guess_data}")  # Debug log
    result = db.games.update_one(
        {"_id": ObjectId(game_id)},
        {"$push": {"guesses": guess_data}}
    )
    print(f"Update result: {result.modified_count} documents modified")  # Debug log

def mark_game_won(game_id):
    """
    Mark a game as won when user guesses correctly.
    
    Args:
        game_id: The game's ObjectId
    """
    result = db.games.update_one(
        {"_id": ObjectId(game_id)},
        {"$set": {"won": True, "active": False}}
    )
    print(f"Marked game {game_id} as won. Modified: {result.modified_count}")
    return result.modified_count > 0

def mark_game_lost(game_id):
    """
    Mark a game as lost when user runs out of attempts.
    
    Args:
        game_id: The game's ObjectId
    """
    result = db.games.update_one(
        {"_id": ObjectId(game_id)},
        {"$set": {"won": False, "active": False}}
    )
    print(f"Marked game {game_id} as lost. Modified: {result.modified_count}")
    return result.modified_count > 0

def find_latest_game_for_user_date(username, date):
    game = db.games.find_one({
        "username": username,
        "date": date,
        "active": True
    }, sort=[("created_at", -1)])
    print(f"Found latest game for {username} on {date}: {game}")  # Debug log
    return game

def count_games_for_user_date(username, date):
    count = db.games.count_documents({
        "username": username,
        "date": date
    })
    print(f"Counted {count} games for {username} on {date}")  # Debug log
    return count

def find_games_by_date(date_str):
    """
    Find all games played on a specific date.
    
    Args:
        date_str: Date string in format YYYY-MM-DD
        
    Returns:
        List of game documents
    """
    games = list(db.games.find({"date": date_str}))
    
    # Convert ObjectId to string for JSON serialization
    for game in games:
        game["_id"] = str(game["_id"])
    
    return games

def find_games_by_username(username):
    """
    Find all games played by a specific user.
    
    Args:
        username: Username string
        
    Returns:
        List of game documents sorted by date
    """
    games = list(db.games.find({"username": username}).sort("date", 1))
    
    # Convert ObjectId to string for JSON serialization
    for game in games:
        game["_id"] = str(game["_id"])
    
    return games