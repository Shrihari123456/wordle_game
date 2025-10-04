from config import db

def get_random_word():
    """Get a random 5-letter word from the database"""
    try:
        # This uses MongoDB's aggregation to get a random document
        pipeline = [{"$sample": {"size": 1}}]
        word_doc = db.words.aggregate(pipeline).next()
        word = word_doc.get("word")
        print(f"Selected random word: {word}")  # Debug log
        return word
    except Exception as e:
        print(f"Error getting random word: {e}")
        return None

def add_word(word):
    """Add a word to the database"""
    db.words.insert_one({"word": word.upper()})