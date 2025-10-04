from flask import Blueprint
from controllers.game_controller import start_game_route, guess_word_route

game_bp = Blueprint("game_bp", __name__)

game_bp.route("/start", methods=["POST"])(start_game_route)
game_bp.route("/guess", methods=["POST"])(guess_word_route)