from flask import Flask, request, jsonify
from flask_cors import CORS
import re

def clean_text(text):
    return re.sub(r'[^\w\s]', '', text.lower())

def get_ngrams(words, n):
    """Return list of n-word phrases"""
    return [' '.join(words[i:i+n]) for i in range(len(words)-n+1)]

app = Flask(__name__)
CORS(app)

with open("planets.txt", encoding="utf-8") as f:
    data = [line.strip() for line in f if line.strip()]

@app.route("/chat", methods=["POST"])
def get_answer():
    user_input = request.json.get("message", "").lower()
    user_input_clean = clean_text(user_input)
    user_words = user_input_clean.split()
    best_match = None
    max_score = 0
    
    for line in data:
        if ':' in line:
            question_part, answer_part = line.split(":", 1)  # split at first colon
        else:
            question_part, answer_part = line, line
        
        # Combine question + answer part for matching keywords
        combined_text = question_part + " " + answer_part
        combined_text_clean = clean_text(combined_text)
        line_words = combined_text_clean.split()

        # Phrase scoring: check consecutive words
        n = len(user_words)
        ngrams = get_ngrams(line_words, n)
        phrase_matches = sum(1 for ng in ngrams if ng == user_input_clean)


        # Check exact phrase match first
        if user_input_clean in combined_text_clean:
            return jsonify({"reply":  answer_part.strip()})

        # Otherwise, fallback to word overlap
        user_words = set(user_input_clean.split())
        line_words = set(combined_text_clean.split())
        overlap = len(user_words & line_words)

        if overlap > max_score:
            max_score = overlap
            best_match = answer_part.strip()
    
    if best_match:
        return jsonify({"reply": best_match})
    else:
        return jsonify({"reply": "I don’t have information about that. Try asking about planets like Earth, Mars, or Jupiter."})

if __name__ == "__main__":
    app.run(debug=True)