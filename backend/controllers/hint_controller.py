import google.generativeai as genai
import os
import traceback

# Configure Gemini AI
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY", "AIzaSyDUBuH3noHWfxRULKaT4A9_C-q-OLMEf4o"))
    model = genai.GenerativeModel('gemini-2.0-flash')
    print("Gemini AI configured successfully")
except Exception as e:
    print(f"Error configuring Gemini AI: {e}")
    model = None

def get_hint_for_word(target_word, hint_level=1):
    """
    Generate a hint for the target word using Gemini AI
    """
    try:
        print(f"Generating hint for word: '{target_word}', level: {hint_level}")
        
        if not target_word or not isinstance(target_word, str):
            return {
                "hint": "Invalid target word",
                "hint_level": hint_level,
                "success": False
            }
        
        # If Gemini is not configured, use fallback immediately
        if model is None:
            return get_fallback_hint(target_word, hint_level)
        
        # More specific prompts that force word-specific hints
        if hint_level == 1:
            prompt = f"""Generate a VERY VAGUE hint specifically for the 5-letter word '{target_word.upper()}'. 
            
IMPORTANT: 
- The hint MUST be specific to '{target_word.upper()}' but very cryptic
- Do NOT use the word '{target_word.upper()}' or any of its letters in the hint
- Do NOT give generic advice like "think of common words"
- Make it about the actual meaning or usage of '{target_word.upper()}'
- Keep it under 12 words
- Be subtle and mysterious

Example for 'APPLE': 'A fruit that keeps the doctor away'
Example for 'RIVER': 'Flowing water that reaches the sea'
Example for 'MUSIC': 'Organized sounds that can be melodic'

Hint for '{target_word.upper()}':"""
        
        elif hint_level == 2:
            prompt = f"""Generate a MEDIUM hint specifically for the 5-letter word '{target_word.upper()}'. 
            
IMPORTANT:
- The hint should give some context about '{target_word.upper()}' but not be too obvious
- Mention the category or common associations of '{target_word.upper()}'
- Do NOT use the word '{target_word.upper()}' itself
- Do NOT give generic advice
- Keep it under 15 words
- Be helpful but still require thinking

Example for 'APPLE': 'A crunchy fruit often used in pies and snacks'
Example for 'RIVER': 'A natural flowing watercourse towards an ocean'
Example for 'MUSIC': 'Art form using rhythm and melody to express emotion'

Hint for '{target_word.upper()}':"""
        
        else:
            prompt = f"""Generate a SPECIFIC hint for the 5-letter word '{target_word.upper()}'. 
            
IMPORTANT:
- The hint should be quite helpful but still not reveal '{target_word.upper()}' directly
- Include specific characteristics or common uses of '{target_word.upper()}'
- Do NOT use the word '{target_word.upper()}' itself
- Do NOT give generic advice
- Keep it under 18 words
- Be detailed but still make the user think

Example for 'APPLE': 'A round fruit with red or green skin, grows on trees'
Example for 'RIVER': 'A large natural stream of water flowing in a channel to the sea'
Example for 'MUSIC': 'Vocal or instrumental sounds combined for beauty and emotional expression'

Hint for '{target_word.upper()}':"""
        
        print(f"Sending prompt to Gemini: {prompt}")
        response = model.generate_content(prompt)
        hint_text = response.text.strip()
        
        # Clean up the response - remove any quotes or extra text
        hint_text = hint_text.replace('"', '').replace("'", "").strip()
        
        print(f"Received hint: {hint_text}")
        
        # Validate that the hint is not generic
        if is_generic_hint(hint_text, target_word):
            print("Warning: Hint appears generic, using fallback")
            return get_fallback_hint(target_word, hint_level)
        
        return {
            "hint": hint_text,
            "hint_level": hint_level,
            "success": True
        }
    
    except Exception as e:
        print(f"Error generating hint: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return get_fallback_hint(target_word, hint_level)

def is_generic_hint(hint_text, target_word):
    """Check if the hint is too generic"""
    generic_phrases = [
        "think of", "common word", "five letter", "try to", "consider",
        "everyday", "ordinary", "basic", "simple word", "regular",
        "typical", "standard", "familiar", "popular", "well-known"
    ]
    
    hint_lower = hint_text.lower()
    
    # Check for generic phrases
    for phrase in generic_phrases:
        if phrase in hint_lower:
            return True
    
    # Check if hint is too short or doesn't contain meaningful content
    if len(hint_text.split()) < 3:
        return True
    
    return False

def get_fallback_hint(target_word, hint_level):
    """Provide fallback hints if AI fails"""
    # More specific fallback hints based on word characteristics
    if hint_level == 1:
        hint = f"Related to {get_word_category(target_word)}"
    elif hint_level == 2:
        hint = f"Starts with '{target_word[0]}', associated with {get_word_category(target_word)}"
    else:
        hint = f"'{target_word[0]}...{target_word[-1]}', {get_word_category(target_word)}"
    
    return {
        "hint": hint,
        "hint_level": hint_level,
        "success": False,
        "fallback": True
    }

def get_word_category(target_word):
    """Try to categorize the word for better hints"""
    # Common word categories - you can expand this
    categories = {
        'a': 'animals, actions, or arts',
        'b': 'body, building, or business',
        'c': 'color, country, or creature',
        'd': 'direction, device, or daily activity',
        'e': 'element, emotion, or equipment',
        'f': 'food, feeling, or function',
        'g': 'game, group, or growth',
        'h': 'home, health, or hobby',
        'i': 'idea, instrument, or item',
        'j': 'job, journey, or joy',
        'k': 'knowledge, kind, or kitchen',
        'l': 'location, language, or life',
        'm': 'music, money, or movement',
        'n': 'nature, number, or nation',
        'o': 'object, occupation, or ocean',
        'p': 'place, person, or purpose',
        'q': 'quality, question, or quiet',
        'r': 'room, reason, or resource',
        's': 'sport, science, or system',
        't': 'time, tool, or travel',
        'u': 'unit, utility, or universe',
        'v': 'vehicle, value, or variety',
        'w': 'weather, work, or world',
        'x': 'x-ray, extra, or expert',  # Rare starting letter
        'y': 'year, youth, or yellow',
        'z': 'zone, zero, or zoo'
    }
    return categories.get(target_word[0].lower(), 'common things')

def get_contextual_hint(target_word, user_guesses):
    """
    Generate a contextual hint based on user's previous guesses
    """
    try:
        print(f"Generating contextual hint for: '{target_word}', guesses: {user_guesses}")
        
        if model is None:
            return {
                "hint": f"Think about {get_word_category(target_word)}",
                "type": "contextual",
                "success": False,
                "fallback": True
            }
        
        guesses_text = ", ".join(user_guesses) if user_guesses else "no guesses yet"
        
        prompt = f"""The user is trying to guess the 5-letter word '{target_word.upper()}'.
Their previous guesses: {guesses_text}.

Give a SPECIFIC hint that helps them think about '{target_word.upper()}' based on their wrong guesses.

IMPORTANT:
- The hint MUST be specific to '{target_word.upper()}'
- Consider what was wrong with their previous guesses
- Guide them toward the correct word without revealing it
- Do NOT use the word '{target_word.upper()}' itself
- Do NOT give generic advice like "try different letters"
- Keep it under 20 words
- Be encouraging and specific

Example for 'APPLE' with wrong guess 'PEACH': 'Think of a different fruit that's often red or green'
Example for 'RIVER' with wrong guess 'OCEAN': 'This is smaller than an ocean but flows continuously'

Hint for '{target_word.upper()}':"""
        
        response = model.generate_content(prompt)
        hint_text = response.text.strip()
        
        # Clean up the response
        hint_text = hint_text.replace('"', '').replace("'", "").strip()
        
        return {
            "hint": hint_text,
            "type": "contextual",
            "success": True
        }
    
    except Exception as e:
        print(f"Error generating contextual hint: {str(e)}")
        return {
            "hint": f"Consider {get_word_category(target_word)}",
            "type": "contextual",
            "success": False,
            "fallback": True
        }