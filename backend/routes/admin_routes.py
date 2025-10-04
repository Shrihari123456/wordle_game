# backend/routes/admin_routes.py
from flask import Blueprint, jsonify
from utils.token_utils import admin_required
from controllers.admin_controller import day_report, user_report

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/report/day/<date_str>", methods=["GET"])
@admin_required
def day_report_route(current_user, date_str):
    """
    GET /api/admin/report/day/<date_str>
    Returns daily report for the specified date.
    Requires admin authentication.
    """
    res, code = day_report(date_str)
    return jsonify(res), code

@admin_bp.route("/report/user/<username>", methods=["GET"])
@admin_required
def user_report_route(current_user, username):
    """
    GET /api/admin/report/user/<username>
    Returns user report for the specified username.
    Requires admin authentication.
    """
    res, code = user_report(username)
    return jsonify(res), code