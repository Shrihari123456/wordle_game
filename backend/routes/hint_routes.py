from flask import Blueprint, jsonify, request
from utils.token_utils import token_required
from controllers.hint_controller import get_hint_for_word, get_contextual_hint
from models.game_model import find_latest_game_for_user_date
from datetime import datetime
import traceback

hint_bp = Blueprint("hint", __name__)

@hint_bp.route("/get-hint", methods=["POST"])
@token_required
def get_hint_route(current_user, role):
    """
    POST /api/hint/get-hint
    Get a hint for the current game
    """
    try:
        print(f"🔍 DEBUG: Hint request from user: {current_user['username']}")
        
        data = request.get_json()
        hint_level = data.get("hint_level", 1)
        
        # Validate hint level
        if hint_level not in [1, 2, 3]:
            return jsonify({"message": "Invalid hint level. Must be 1, 2, or 3"}), 400
        
        # Get current game
        username = current_user["username"]
        today = datetime.utcnow().strftime("%Y-%m-%d")
        print(f"🔍 DEBUG: Looking for game - user: {username}, date: {today}")
        
        game = find_latest_game_for_user_date(username, today)
        
        if not game:
            print("❌ DEBUG: No game found for user today")
            return jsonify({"message": "No active game found. Start a new game first!"}), 404
        
        print(f"✅ DEBUG: Game found - ID: {game.get('_id')}, Active: {game.get('active')}")
        print(f"🔍 DEBUG: Game keys: {list(game.keys())}")
        
        if not game.get("active", False):
            print("❌ DEBUG: Game is not active")
            return jsonify({"message": "This game is already finished!"}), 400
        
        # Check if target_word exists and is valid
        target_word = game.get("target_word")
        print(f"🔍 DEBUG: Target word from game: '{target_word}'")
        print(f"🔍 DEBUG: Target word type: {type(target_word)}")
        print(f"🔍 DEBUG: Target word length: {len(target_word) if target_word else 'None'}")
        
        if not target_word:
            print("❌ DEBUG: target_word is None or empty")
            return jsonify({"message": "Game data is invalid - no target word"}), 400
        
        if not isinstance(target_word, str):
            print(f"❌ DEBUG: target_word is not a string: {type(target_word)}")
            return jsonify({"message": "Game data is invalid - target word is not string"}), 400
        
        if len(target_word) != 5:
            print(f"❌ DEBUG: target_word length is not 5: {len(target_word)}")
            return jsonify({"message": "Game data is invalid - target word not 5 letters"}), 400
        
        # Generate hint
        print(f"🚀 DEBUG: Calling get_hint_for_word with: '{target_word}', level: {hint_level}")
        hint_data = get_hint_for_word(target_word, hint_level)
        
        return jsonify({
            "hint": hint_data["hint"],
            "hint_level": hint_data["hint_level"],
            "success": hint_data.get("success", True),
            "target_word": target_word,  # Include for debugging
            "message": "Here's your hint!"
        }), 200
    
    except Exception as e:
        print(f"❌ Error in get_hint_route: {str(e)}")
        print(f"🔍 Traceback: {traceback.format_exc()}")
        return jsonify({"message": f"Failed to generate hint: {str(e)}"}), 500

@hint_bp.route("/contextual-hint", methods=["GET"])
@token_required
def contextual_hint_route(current_user, role):
    """
    GET /api/hint/contextual-hint
    Get a contextual hint based on previous guesses
    """
    try:
        print(f"🔍 DEBUG: Contextual hint request from user: {current_user['username']}")
        
        # Get current game
        username = current_user["username"]
        today = datetime.utcnow().strftime("%Y-%m-%d")
        game = find_latest_game_for_user_date(username, today)
        
        if not game:
            return jsonify({"message": "No active game found. Start a new game first!"}), 404
        
        if not game.get("active", False):
            return jsonify({"message": "This game is already finished!"}), 400
        
        target_word = game.get("target_word")
        guesses = [g["word"] for g in game.get("guesses", [])]
        
        print(f"🔍 DEBUG: Contextual hint - Target: '{target_word}', Guesses: {guesses}")
        
        if not target_word or not isinstance(target_word, str) or len(target_word) != 5:
            return jsonify({"message": "Game data is invalid"}), 400
        
        # Generate contextual hint
        hint_data = get_contextual_hint(target_word, guesses)
        
        return jsonify({
            "hint": hint_data["hint"],
            "type": hint_data["type"],
            "success": hint_data.get("success", True),
            "target_word": target_word,  # Include for debugging
            "message": "Here's a hint based on your guesses!"
        }), 200
    
    except Exception as e:
        print(f"❌ Error in contextual_hint_route: {str(e)}")
        print(f"🔍 Traceback: {traceback.format_exc()}")
        return jsonify({"message": f"Failed to generate contextual hint: {str(e)}"}), 500

# Add a direct test route to verify the target word is being passed correctly
@hint_bp.route("/test-target-word", methods=["GET"])
@token_required
def test_target_word_route(current_user, role):
    """
    Test route to see what target word we're getting from the current game
    """
    username = current_user["username"]
    today = datetime.utcnow().strftime("%Y-%m-%d")
    game = find_latest_game_for_user_date(username, today)
    
    if not game:
        return jsonify({"message": "No game found"}), 404
    
    return jsonify({
        "game_exists": True,
        "game_active": game.get("active", False),
        "target_word": game.get("target_word"),
        "target_word_type": type(game.get("target_word")).__name__,
        "target_word_length": len(game.get("target_word", "")),
        "all_game_keys": list(game.keys())
    }), 200