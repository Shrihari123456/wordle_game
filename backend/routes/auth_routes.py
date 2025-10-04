from flask import Blueprint
from controllers.auth_controller import register_user_route, login_user_route

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register_route():
    return register_user_route()

@auth_bp.route('/login', methods=['POST'])
def login_route():
    return login_user_route()