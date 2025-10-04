from datetime import date
from flask import request, jsonify
from models.word_model import get_random_word
from models.game_model import create_game, add_guess, find_latest_game_for_user_date, count_games_for_user_date
from utils.validators import valid_guess
from utils.token_utils import token_required

# ----------------- START GAME -----------------
@token_required
def start_game_route(current_user, role):
    username = current_user
    print(f"Starting game for user: {username}")

    today = date.today().isoformat()
    
    # Count games for THIS SPECIFIC USER on today's date
    played = count_games_for_user_date(username, today)
    print(f"Games played today by {username}: {played}")
    
    # User-specific daily limit: 3 games per user
    if played >= 3:
        return jsonify({"message": f"Daily limit reached! You've already played {played} games today."}), 403

    target = get_random_word()
    if not target:
        return jsonify({"message": "No words available in DB"}), 500

    game = create_game(username, target, today)
    print(f"Created game: {game}")
    
    return jsonify({
        "message": "Game started! Guess a 5-letter word.", 
        "word_length": 5, 
        "games_played_today": played + 1,
        "game_id": str(game['_id'])
    }), 201


# ----------------- GUESS WORD -----------------
@token_required
def guess_word_route(current_user, role):
    username = current_user

    data = request.get_json()
    if not data:
        return jsonify({"message": "No JSON data provided"}), 400
        
    guess = data.get("guess", "").upper()

    if not valid_guess(guess):
        return jsonify({"message": "Guess must be 5 uppercase A-Z letters"}), 400

    today = date.today().isoformat()
    game = find_latest_game_for_user_date(username, today)
    if not game:
        return jsonify({"message": "No active game for today. Start a game first."}), 400

    if len(game.get("guesses", [])) >= 6:
        return jsonify({"message": "Max 6 guesses reached for this word"}), 403

    target = game["target_word"].upper()
    colors = ["grey"] * 5
    remaining = {}

    # First pass: mark greens
    for i, ch in enumerate(target):
        if guess[i] == ch:
            colors[i] = "green"
        else:
            remaining[ch] = remaining.get(ch, 0) + 1

    # Second pass: mark oranges
    for i, ch in enumerate(guess):
        if colors[i] == "green":
            continue
        if remaining.get(ch, 0) > 0:
            colors[i] = "orange"
            remaining[ch] -= 1

    # Add guess to database
    add_guess(game["_id"], guess, colors)
    
    # Get updated game state
    updated_game = find_latest_game_for_user_date(username, today)
    current_guesses = len(updated_game.get("guesses", []))

    response_data = {
        "message": "Try again",
        "colors": colors,
        "win": False,
        "guess": guess,
        "attempts": current_guesses,
        "remaining_attempts": 6 - current_guesses
    }

    if guess == target:
        response_data.update({
            "message": "🎉 Congratulations! You guessed the word!",
            "win": True
        })
    elif current_guesses >= 6:
        response_data.update({
            "message": f"Game over! The word was {target}",
            "target": target
        })

    return jsonify(response_data), 200