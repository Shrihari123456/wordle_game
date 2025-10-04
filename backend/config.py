# backend/config.py
import os
from pymongo import MongoClient

MONGODB_URI = 'mongodb://localhost:27017/wordle'
client = MongoClient(MONGODB_URI)
db = client["wordle_game_db"]
