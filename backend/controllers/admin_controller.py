# backend/controllers/admin_controller.py
from models.game_model import find_games_by_date, find_games_by_username

def day_report(date_str):
    """
    Generate a daily report for a specific date.
    Returns total unique users and correct guesses for that date.
    """
    games_list = find_games_by_date(date_str)
    users = set(g["username"] for g in games_list)
    correct_guesses = sum(1 for g in games_list if g.get("won", False))
    
    # Add individual game details
    game_details = [
        {
            "username": g["username"],
            "won": g.get("won", False),
            "attempts": len(g.get("guesses", [])),
            "target_word": g.get("target_word", "N/A")
        }
        for g in games_list
    ]
    
    return {
        "date": date_str,
        "total_users": len(users),
        "correct_guesses": correct_guesses,
        "total_games": len(games_list),
        "games": game_details
    }, 200

def user_report(username):
    """
    Generate a user report showing game statistics per date.
    Returns a list of dates with total games and correct guesses.
    """
    g_list = find_games_by_username(username)
    
    if not g_list:
        return {
            "username": username,
            "report": [],
            "message": "No games found for this user"
        }, 200
    
    date_map = {}
    game_details_by_date = {}
    
    for g in g_list:
        d = g.get("date")
        date_map.setdefault(d, {"total": 0, "correct": 0})
        date_map[d]["total"] += 1
        
        won = g.get("won", False)
        if won:
            date_map[d]["correct"] += 1
        
        # Store individual game details
        if d not in game_details_by_date:
            game_details_by_date[d] = []
        
        game_details_by_date[d].append({
            "won": won,
            "attempts": len(g.get("guesses", [])),
            "target_word": g.get("target_word", "N/A"),
            "result": "Won" if won else "Lost"
        })
    
    report = [
        {
            "date": d,
            "total": v["total"],
            "correct": v["correct"],
            "accuracy": round((v["correct"] / v["total"]) * 100, 2) if v["total"] > 0 else 0,
            "games": game_details_by_date[d]
        }
        for d, v in sorted(date_map.items())
    ]
    
    total_games = sum(v["total"] for v in date_map.values())
    total_correct = sum(v["correct"] for v in date_map.values())
    
    return {
        "username": username,
        "report": report,
        "summary": {
            "total_games": total_games,
            "total_correct": total_correct,
            "overall_accuracy": round((total_correct / total_games) * 100, 2) if total_games > 0 else 0
        }
    }, 200